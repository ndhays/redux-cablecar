import CableCar from './cableCar'
import CableCarRoute from './cableCarRoute'
import { Middleware } from '@reduxjs/toolkit'

/* CableCarMiddleware Class */
export default function createMiddleware(route: CableCarRoute): Middleware {
    return (store) => (next) => (action) => {
        // only look at active cable cars w/ matching permitted actions
        const relevantCars = route.cars.filter(
            (car) => car.active && car.permitsAction(action)
        )
        let serverOnlyAction = false

        if (relevantCars.length) {
            serverOnlyAction = relevantCars.reduce(
                (oneWay: boolean, car: CableCar) => {
                    const { meta } = action

                    // if car is connected send action to server
                    if (car.connected) {
                        car.send(action)
                        // if sent action is optimistic send thru to redux as well
                        if (oneWay && meta?.isOptimistic) {
                            oneWay = false
                        }
                    } else {
                        // if a permitted action fails, optimism takes precedence
                        if (meta?.isOptimistic || meta?.isOptimisticOnFail) {
                            oneWay = false
                        }

                        console.error(
                            `CableCar channel: ${car.channel} Dropped action.` +
                                (oneWay
                                    ? ''
                                    : ' Action passed thru middleware to Redux (optimistic).'),
                            action
                        )
                    }
                    return oneWay
                },
                true
            )
        }

        return serverOnlyAction ? store.getState() : next(action)
    }
}
