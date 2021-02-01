import CableCarDispatcher from './cableCarDispatcher'
import CableCarRoute, { CableCarRouteOptions } from './cableCarRoute'
import CableCar, { CableCarOptions } from './cableCar'
import createMiddleware from './middleware'
import { Middleware, Store } from '@reduxjs/toolkit'

export type CableCarRouteApi = {
    createMiddleware: () => Middleware
    connect: (
        store: Store,
        channel: string,
        options: CableCarOptions
    ) => CableCarApi
    allCars: () => CableCarApi[]
    reset: () => void
}

export type CableCarApi = {
    destroy: () => void
    pause: () => void
    resume: () => void
    perform: (method: string, action: any) => void
    send: (action: any) => void
}

const dispatcher = new CableCarDispatcher()
if (typeof window !== 'undefined') {
    window.addEventListener('beforeunload', () => {
        dispatcher.unsubscribeAll()
    })
}
export function createCableCarRoute(
    routeOptions: CableCarRouteOptions = {}
): CableCarRouteApi {
    const route = new CableCarRoute(routeOptions)
    const consumer = dispatcher.consumerFor(route)

    return {
        createMiddleware: () => createMiddleware(route),
        connect: (
            store: Store,
            channel: string,
            options?: CableCarOptions
        ): CableCarApi => {
            const car = new CableCar(
                consumer,
                store,
                channel,
                options || {},
                () => {
                    route.removeCar(car)
                }
            )
            route.addCar(car)
            // public CableCar exposed functions
            return publicCableCar(car)
        },
        allCars: () => route.cars.map(publicCableCar),
        reset: () => {
            route.cars = []
        },
    }
}

function publicCableCar(car: CableCar): CableCarApi {
    return {
        destroy: () => car.destroy(),
        pause: () => car.pause(),
        resume: () => car.resume(),
        perform: (method: string, action: any) => car.perform(method, action),
        send: (action: any) => car.send(action),
    }
}
