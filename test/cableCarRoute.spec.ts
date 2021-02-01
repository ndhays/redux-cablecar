import CableCarRoute from '../src/cableCarRoute'
import CableCar from '../src/cableCar'
import mockActionCableProvider from 'actioncable'
jest.mock('../src/cableCar')
jest.mock('actioncable')
import configureMockStore from 'redux-mock-store'

const mockStore = configureMockStore()
const store = mockStore({})

describe('CableCarRoute', () => {
    it('sets default ws url', () => {
        const route = new CableCarRoute()
        expect(route.webSocketURL).toEqual(null)
    })

    it('sets default provider', () => {
        const route = new CableCarRoute()
        expect(route.provider).toEqual(mockActionCableProvider)
    })

    it('sets custom ws url', () => {
        const route = new CableCarRoute({ webSocketURL: 'url' })
        expect(route.webSocketURL).toEqual('url')
    })

    it('sets custom provider', () => {
        const route = new CableCarRoute({ provider: 'provider' })
        expect(route.provider).toEqual('provider')
    })

    it('adds cars', () => {
        const route = new CableCarRoute()
        const car = new CableCar('consumer', store, 'channel')
        route.addCar(car)
        const car2 = new CableCar('consumer', store, 'channel2')
        route.addCar(car2)
        expect(route.cars.length).toEqual(2)
        expect(route.cars).toContain(car)
        expect(route.cars).toContain(car2)
    })

    it('removes cars', () => {
        const route = new CableCarRoute()
        const car = new CableCar('consumer', store, 'channel')
        route.addCar(car)
        const car2 = new CableCar('consumer', store, 'channel2')
        route.addCar(car2)
        expect(route.cars.length).toEqual(2)
        route.removeCar(car2)
        expect(route.cars).toEqual([car])
    })
})
