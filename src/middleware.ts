import { Middleware, Store } from '@reduxjs/toolkit'
import CableCar, { CableCarOptions } from './cableCar'

type CableCarMiddleware = Middleware<{}, any> & {
    connect: (
        store: Store,
        channel: string,
        options: CableCarOptions
    ) => CableCar
}

const cars: CableCar[] = []

const middleware: CableCarMiddleware = (store) => (next) => (action) => {
    let passActionAlong = true
    Object.values(cars).forEach((car) => {
        if (car.permitsAction(action)) {
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
                            : '')
                )
            }
        }
    })

    return passActionAlong ? next(action) : store.getState()
}

middleware.connect = (
    store: Store,
    channel: string,
    options: CableCarOptions
) => {
    const car = new CableCar(store, channel, options, () => {
        cars.splice(cars.indexOf(car, 1))
    })
    cars.push(car)
    return car
}

export default middleware
