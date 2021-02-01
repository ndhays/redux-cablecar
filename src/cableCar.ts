import {
    createAction,
    Action,
    MiddlewareAPI,
    Dispatch,
    AnyAction,
    Store,
} from '@reduxjs/toolkit'
import { getPermittedActionsFn } from './helpers'

const ACTION_META_FLAG = '__cablecar__'
const ACTION_META_CHANNEL_FLAG = 'channel'
const ACTION_PREFIX = 'redux-cablecar'
const DEFAULT_PERMITTED_ACTIONS_PREFIX = 'RAILS'

/* ActionFilter Type Definition */
export type CableCarStore = MiddlewareAPI<Dispatch<AnyAction>, any>
export type CableCarActionFilter = (action: any) => boolean
// export type ActionWithMeta = Action & { meta: any }
export type CableCarAction = Action & {
    meta: { __cablecar__: boolean; __cablecarChannel__: string }
}

/* CableCarOptions Interface */
export interface CableCarOptions {
    params?: any
    matchChannel?: boolean
    permittedActions?:
        | string
        | RegExp
        | CableCarActionFilter
        | (string | RegExp)[]
    silent?: boolean
    // callbacks
    initialized?: () => void
    connected?: () => void
    disconnected?: () => void
    received?: (msg: any) => void
    rejected?: () => void
}

/* CableCar Class */
export default class CableCar {
    consumer: any
    store: Store
    channel: string

    active: boolean = false
    connected: boolean = false
    subscription: any

    private _options: CableCarOptions = {}
    private _permittedActionFn: CableCarActionFilter = () => true
    private _destroyCallback

    get options() {
        return this._options
    }

    set options(opts: CableCarOptions) {
        // get permitted actions function if option passed in
        if (opts.permittedActions !== undefined) {
            this._permittedActionFn = getPermittedActionsFn(
                opts.permittedActions
            )

            // otherwise use default
        } else {
            this._permittedActionFn = getPermittedActionsFn(
                DEFAULT_PERMITTED_ACTIONS_PREFIX
            )
        }

        // set default options
        const options: CableCarOptions = {
            params: opts.params || {},
            silent: opts.silent ? true : false,
            matchChannel: opts.matchChannel ? true : false,
        }

        // set optional callbacks
        if (opts.initialized) options.initialized = opts.initialized
        if (opts.connected) options.connected = opts.connected
        if (opts.disconnected) options.disconnected = opts.disconnected
        if (opts.received) options.received = opts.received
        if (opts.rejected) options.rejected = opts.rejected
        this._options = Object.freeze(options)
    }

    constructor(
        consumer: any,
        store: Store,
        channel: string,
        options?: CableCarOptions,
        destroyCallback?: () => void
    ) {
        this.consumer = consumer
        this.store = store
        this.channel = String(channel)
        this.options = options || {}
        this.subscription = this.init()
        this._destroyCallback = destroyCallback
    }

    // public api

    destroy() {
        if (this.connected) this.subscription.unsubscribe()
        if (this._destroyCallback) {
            this._destroyCallback()
            this._destroyCallback = undefined
        }
        this.active = false
        this.connected = false
    }

    // call server method directly
    perform(method: string, payload: any) {
        this.isReady()
        this.subscription.perform(method, payload)
    }

    // if action is valid, send to Rails via ActionCable Subscription
    send(action: any) {
        this.isReady()
        this.subscription.send(action)
    }

    pause() {
        this.active = false
    }

    resume() {
        this.active = true
    }

    // public

    permitsAction(action: AnyAction) {
        // avoid recursively dispatching backend <=> frontend actions
        let permitted = !(action.meta && action.meta[ACTION_META_FLAG])

        // match channel if given
        if (
            this.options.matchChannel &&
            permitted &&
            action.meta &&
            action.meta[ACTION_META_CHANNEL_FLAG] &&
            action.meta[ACTION_META_CHANNEL_FLAG] != this.channel
        )
            return false

        // use permitted function to filter valid backend actions
        if (permitted) permitted = this._permittedActionFn(action)
        return permitted
    }

    // private

    init() {
        const dispatch = (action: Action) => {
            if (this.store && !this.options.silent) this.store.dispatch(action)
        }
        const createGenericAction = (actionType: string) => {
            return createAction(actionType, () => ({
                payload: {},
                meta: {
                    [ACTION_META_FLAG]: true,
                    [ACTION_META_CHANNEL_FLAG]: this.channel,
                },
            }))()
        }

        return this.consumer.subscriptions.create(
            {
                channel: this.channel,
                ...this.options.params,
            },
            {
                initialized: () => {
                    this.active = true
                    dispatch(createGenericAction(`${ACTION_PREFIX}/INIT`))
                    if (this.options.initialized) {
                        this.options.initialized()
                    }
                },
                connected: () => {
                    this.connected = true
                    dispatch(createGenericAction(`${ACTION_PREFIX}/CONNECTED`))
                    if (this.options.connected) {
                        this.options.connected()
                    }
                },
                disconnected: () => {
                    this.connected = false
                    dispatch(
                        createGenericAction(`${ACTION_PREFIX}/DISCONNECTED`)
                    )
                    if (this.options.disconnected) {
                        this.options.disconnected()
                    }
                },
                received: (action: CableCarAction | any) => {
                    let { type, meta, payload, ...rest } = action
                    let formattedAction = {
                        payload: { ...payload, ...rest },
                        meta: {
                            ...meta,
                            [ACTION_META_FLAG]: true,
                            [ACTION_META_CHANNEL_FLAG]: this.channel,
                        },
                        type: type || `${ACTION_PREFIX}/RECEIVED`,
                    }
                    dispatch(formattedAction)
                },
                rejected: (err: any) => {
                    this.active = false
                    this.connected = false
                    dispatch(createGenericAction(`${ACTION_PREFIX}/REJECTED`))
                    if (this.options.rejected) {
                        this.options.rejected()
                    } else {
                        console.error(
                            `CableCar: connection rejected. (Channel: ${this.channel}) ${err}`
                        )
                    }
                },
            }
        )
    }

    isReady() {
        if (!this.connected)
            throw new TypeError(
                `CableCar channel: ${this.channel} is disconnected.`
            )
        if (!this.active)
            throw new TypeError(`CableCar channel: ${this.channel} is paused.`)
    }
}
