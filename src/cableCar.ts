import actionCableProvider from 'actioncable'
import {
    createAction,
    Action,
    MiddlewareAPI,
    Dispatch,
    AnyAction,
} from '@reduxjs/toolkit'
import { getPermittedActionsFn } from './helpers'

const ACTION_META_FLAG = '__cablecar__'
const ACTION_META_CHANNEL_FLAG = '__cablecarChannel__'
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
    permittedActions?:
        | string
        | RegExp
        | CableCarActionFilter
        | (string | RegExp)[]
    provider?: any
    silent?: boolean
    webSocketURL?: string
    // callbacks
    initialized?: () => void
    connected?: () => void
    disconnected?: () => void
    received?: (msg: any) => void
    rejected?: () => void
}

/* CableCar Class */
export default class CableCar {
    active: boolean = false
    channel: string
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
        }

        // set optional options
        if (opts.webSocketURL) options.webSocketURL = opts.webSocketURL

        // set optional callbacks
        if (opts.initialized) options.initialized = opts.initialized
        if (opts.connected) options.connected = opts.connected
        if (opts.disconnected) options.disconnected = opts.disconnected
        if (opts.received) options.received = opts.received
        if (opts.rejected) options.rejected = opts.rejected
        this._options = Object.freeze(options)
    }

    constructor(
        store: CableCarStore,
        channel: string,
        options: CableCarOptions,
        destroyCallback?: () => void
    ) {
        this.channel = String(channel)
        this.options = options
        this.subscription = this._initialize(
            store,
            options.provider || actionCableProvider
        )
        this._destroyCallback = destroyCallback
    }

    destroy() {
        if (this.active) this.subscription.unsubscribe()
        if (this._destroyCallback) {
            this._destroyCallback()
            this._destroyCallback = undefined
        }
        this.active = false
    }

    perform(method: string, payload: any) {
        this.subscription.perform(method, payload)
    }

    permitsAction(action: AnyAction) {
        // avoid recursively dispatching backend <=> frontend actions
        let permitted = !(action.meta && action.meta[ACTION_META_FLAG])

        // use permitted function to filter valid backend actions
        if (permitted) permitted = this._permittedActionFn(action)
        return permitted
    }

    // if action is valid, send to Rails via ActionCable Subscription
    send(action: any) {
        this.subscription.send(action)
    }

    _initialize(store: CableCarStore, provider: any) {
        const consumer = provider.createConsumer(
            this.options.webSocketURL || null
        )
        const dispatch = (action: Action) => {
            if (store && !this.options.silent) store.dispatch(action)
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

        return consumer.subscriptions.create(
            {
                channel: this.channel,
                ...this.options.params,
            },
            {
                initialized: () => {
                    dispatch(createGenericAction(`${ACTION_PREFIX}/INIT`))
                    if (this.options.initialized) {
                        this.options.initialized()
                    }
                },
                connected: () => {
                    this.active = true
                    dispatch(createGenericAction(`${ACTION_PREFIX}/CONNECTED`))
                    if (this.options.connected) {
                        this.options.connected()
                    }
                },
                disconnected: () => {
                    this.active = false
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
                rejected: () => {
                    this.active = false
                    dispatch(createGenericAction(`${ACTION_PREFIX}/REJECTED`))
                    if (this.options.rejected) {
                        this.options.rejected()
                    } else {
                        console.error(
                            `CableCar: connection rejected. (Channel: ${this.channel})`
                        )
                    }
                },
            }
        )
    }
}
