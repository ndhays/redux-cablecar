import actionCableProvider from 'actioncable'
import CableCar from './cableCar'

export interface CableCarRouteOptions {
    provider?: any
    webSocketURL?: string | null
}

/* CableCarRoute Class */
export default class CableCarRoute {
    cars: CableCar[] = []
    provider: any
    webSocketURL: string | null = null

    constructor(options: CableCarRouteOptions = {}) {
        this.webSocketURL = options.webSocketURL || null
        this.provider = options.provider || actionCableProvider
    }

    addCar(car: CableCar) {
        this.cars.push(car)
    }

    removeCar(car: CableCar) {
        const idx = this.cars.indexOf(car)
        if (idx > -1) this.cars.splice(idx, 1)
    }
}
