import { Middleware, Store } from '@reduxjs/toolkit'
import CableCar, { CableCarOptions } from './cableCar'

export type CableCarApi = {
    createMiddleware: () => Middleware
    init: (store: Store, channel: string, options: CableCarOptions) => void
    destroy: () => void
    perform: (method: string, action: any) => void
    send: (action: any) => void
}

export function createCableCar(): CableCarApi {
    let car: null | CableCar = null

    let middleware: Middleware = (store) => (next) => (action) => {
        let passActionAlong = true

        // runs through logic if action is permitted
        if (car?.permitsAction(action)) {
            let meta = action.meta || {}
            if (car.active) {
                passActionAlong = meta.isOptimistic
                car.send(action)
            } else {
                passActionAlong = meta.isOptimistic || meta.isOptimisticOnFail
                console.error(
                    'CableCar: Dropped action.' +
                        (passActionAlong
                            ? ' Action passed thru middleware (optimistic).'
                            : ''),
                    action
                )
            }
        }

        return passActionAlong ? next(action) : store.getState()
    }

    return {
        createMiddleware: () => middleware,
        // CableCar Object api
        init: (store, channel, options) => {
            car = new CableCar(store, channel, options)
        },
        destroy: () => {
            car?.destroy()
            car = null
        },
        perform: (method: string, payload: any) =>
            car?.perform(method, payload),
        send: (action: any) => car?.send(action),
    }
}
