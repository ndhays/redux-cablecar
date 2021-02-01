import { createCableCarRoute } from '../src/api'

import actionCableProvider from 'actioncable'
import { mockChannels, mockPerform, mockSend } from './__mocks__/actioncable'

jest.mock('actioncable')

import configureMockStore from 'redux-mock-store'

describe('#createCableCarRoute (integration)', () => {
    const route = createCableCarRoute({
        provider: actionCableProvider,
        webSocketURL: 'url',
    })
    const middleware = route.createMiddleware()
    const middlewares = [middleware]
    const mockStore = configureMockStore(middlewares)
    const store = mockStore({})

    afterEach(() => {
        route.reset()
        store.clearActions()
    })

    it('connects cars with route', () => {
        route.connect(store, 'channel', {})
        mockChannels['channel'].initialized()
        mockChannels['channel'].connected()
        const action1 = { type: 'something' }
        store.dispatch(action1)
        const action2 = { type: 'RAILS/something' }
        store.dispatch(action2)
        expect(store.getActions()).toContain(action1)
        expect(store.getActions()).not.toContain(action2)
        expect(mockSend).toHaveBeenCalledWith(action2)
    })

    it('can list all cars', () => {
        route.connect(store, 'channel', {})
        route.connect(store, 'channel2', {})
        route.connect(store, 'channel3', {})
        expect(route.allCars().length).toEqual(3)
    })

    it('destroys cars', () => {
        const car = route.connect(store, 'channel', {})
        mockChannels['channel'].initialized()
        mockChannels['channel'].connected()
        const action1 = { type: 'RAILS/something1' }
        store.dispatch(action1)
        expect(route.allCars().length).toEqual(1)
        car.destroy()
        expect(route.allCars().length).toEqual(0)
        const action2 = { type: 'RAILS/something2' }
        store.dispatch(action2)
        expect(store.getActions()).not.toContain(action1)
        expect(store.getActions()).toContain(action2)
        expect(mockSend).toHaveBeenCalledWith(action1)
        expect(mockSend).not.toHaveBeenCalledWith(action2)
    })

    it('pauses / resumes with ease', () => {
        const car = route.connect(store, 'channel', {})
        mockChannels['channel'].initialized()
        mockChannels['channel'].connected()
        const action1 = { type: 'RAILS/something1' }
        store.dispatch(action1)
        car.pause()
        const action2 = { type: 'RAILS/something2' }
        store.dispatch(action2)
        car.resume()
        const action3 = { type: 'RAILS/something3' }
        store.dispatch(action3)
        expect(mockSend).toHaveBeenCalledWith(action1)
        expect(mockSend).not.toHaveBeenCalledWith(action2)
        expect(store.getActions()).toContain(action2)
        expect(mockSend).toHaveBeenCalledWith(action3)
    })

    it('performs server functions', () => {
        const car = route.connect(store, 'channel', {})
        mockChannels['channel'].initialized()
        mockChannels['channel'].connected()
        const action1 = { type: 'RAILS/something2' }
        car.perform('something', action1)
        expect(mockPerform).toHaveBeenCalledWith('something', action1)
        route.allCars()[0].perform('somethingelse', action1)
        expect(mockPerform).toHaveBeenCalledWith('somethingelse', action1)
    })

    it('sends server messages', () => {
        const car = route.connect(store, 'channel', {})
        mockChannels['channel'].initialized()
        mockChannels['channel'].connected()
        const action1 = { type: 'RAILS/something1' }
        car.send(action1)
        expect(mockSend).toHaveBeenCalledWith(action1)
        const action2 = { type: 'RAILS/something2' }
        route.allCars()[0].send(action2)
        expect(mockSend).toHaveBeenCalledWith(action2)
    })
})
