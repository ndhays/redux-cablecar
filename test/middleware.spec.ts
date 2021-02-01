import createMiddleware from '../src/middleware'
import configureMockStore from 'redux-mock-store'
import CableCar, { CableCarActionFilter } from '../src/cableCar'

import {
    mockCreateConsumer,
    mockSend,
    mockChannels,
} from './__mocks__/actioncable'
import CableCarRoute from '../src/cableCarRoute'

// actioncable mock
const consumer = mockCreateConsumer()
const route = new CableCarRoute()

// redux mocks
const middlewares = [createMiddleware(route)]
const mockStore = configureMockStore(middlewares)
const store = mockStore({})

const consoleError = console.error

describe('Middleware (integration)', () => {
    beforeEach(() => {
        console.error = jest.fn()
    })
    afterEach(() => {
        console.error = consoleError
        store.clearActions()
    })

    describe('when one car is connected', () => {
        let car1: CableCar
        beforeEach(() => {
            car1 = new CableCar(consumer, store, 'channel')
            route.addCar(car1)
            mockChannels['channel'].initialized()
            mockChannels['channel'].connected()
        })
        afterEach(() => {
            route.removeCar(car1)
        })
        it('sends server actions once connected', () => {
            let action1 = { type: 'RAILS_act1' }
            store.dispatch(action1)
            expect(mockSend).toHaveBeenCalledTimes(1)
            expect(mockSend).toHaveBeenCalledWith(action1)
        })

        it('passes optimistic actions thru to redux', () => {
            let action1 = { type: 'RAILS_act1', meta: { isOptimistic: true } }
            store.dispatch(action1)
            let action2 = {
                type: 'RAILS_act2',
                meta: { isOptimisticOnFail: true },
            }
            store.dispatch(action2)
            expect(store.getActions()).toContain(action1)
            expect(store.getActions()).not.toContain(action2)
        })

        describe('when car becomes disconnected', () => {
            beforeEach(() => {
                mockChannels['channel'].disconnected()
            })
            it('handles dropped actions', () => {
                let action1 = { type: 'RAILS_act1' }
                const consoleSpy = jest.spyOn(console, 'error')
                store.dispatch(action1)
                expect(mockSend).toHaveBeenCalledTimes(0)
                expect(consoleSpy).toHaveBeenCalledWith(
                    'CableCar channel: channel Dropped action.',
                    action1
                )
            })
            it('handles dropped (optimistic) actions', () => {
                let action1 = {
                    type: 'RAILS_act1',
                    meta: { isOptimistic: true },
                }
                const consoleSpy = jest.spyOn(console, 'error')
                store.dispatch(action1)
                expect(mockSend).toHaveBeenCalledTimes(0)
                expect(consoleSpy).toHaveBeenCalledWith(
                    'CableCar channel: channel Dropped action. Action passed thru middleware to Redux (optimistic).',
                    action1
                )
            })

            it('passes dropped (optimistic) actions to redux', () => {
                let action1 = {
                    type: 'RAILS_act1',
                    meta: { isOptimistic: true },
                }
                store.dispatch(action1)
                let action2 = {
                    type: 'RAILS_act2',
                    meta: { isOptimisticOnFail: true },
                }
                store.dispatch(action2)
                expect(store.getActions()).toContain(action1)
                expect(store.getActions()).toContain(action2)
            })
        })
    })

    describe('when multiple cars are connected', () => {
        let car1: CableCar
        let car2: CableCar

        beforeEach(() => {
            car1 = new CableCar(consumer, store, 'channel')
            car2 = new CableCar(consumer, store, 'channel2', {
                permittedActions: 'NOT',
            })
            route.addCar(car1)
            mockChannels['channel'].initialized()
            mockChannels['channel'].connected()
            route.addCar(car2)
            mockChannels['channel2'].initialized()
            mockChannels['channel2'].connected()
        })
        afterEach(() => {
            car1.destroy
            car2.destroy
        })
        it('propagates thru redux if a permitted (and optimistic) action fails', () => {
            let action1 = {
                type: 'RAILS/action5',
                meta: { isOptimisticOnFail: true },
            }
            store.dispatch(action1)
            expect(store.getActions()).not.toContain(action1)
            mockChannels['channel'].disconnected()
            store.dispatch(action1)
            expect(store.getActions()).toContain(action1)
        })
    })

    describe('permitted actions', () => {
        let car: CableCar
        afterEach(() => {
            car.destroy()
        })

        it('passes thru unpermitted actions to redux', () => {
            let action1 = { type: 'someaction' }
            car = new CableCar(consumer, store, 'channel', {
                permittedActions: () => false,
            })
            route.addCar(car)
            mockChannels['channel'].initialized()
            mockChannels['channel'].connected()
            store.dispatch(action1)
            expect(store.getActions()).toContain(action1)
        })

        it('sends permits actions properly', () => {
            car = new CableCar(consumer, store, 'channel2', {
                permittedActions: 'PRE',
            })
            route.addCar(car)
            mockChannels['channel2'].initialized()
            mockChannels['channel2'].connected()
            let action1 = { type: 'PRE_act1' }
            let action2 = { type: 'PRE_act2' }
            let action3 = { type: 'NON_PRE_act3' }
            store.dispatch(action1)
            store.dispatch(action2)
            store.dispatch(action3)
            expect(mockSend).toHaveBeenCalledWith(action1)
            expect(mockSend).toHaveBeenCalledWith(action2)
            expect(mockSend).not.toHaveBeenCalledWith(action3)
        })
    })
})
