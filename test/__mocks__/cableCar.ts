import { Store } from '@reduxjs/toolkit'
import { CableCarOptions } from '../../src/cableCar'

export default class CableCar {
    constructor(
        consumer: any,
        store: Store,
        channel: string,
        options: CableCarOptions,
        destroyCallback?: () => void
    ) {}
}
