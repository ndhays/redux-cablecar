import middleware from '../src/middleware'
import configureMockStore from 'redux-mock-store'
import CableCar, { CableCarActionFilter } from '../src/cableCar'

import { mockSend, mockChannels } from './__mocks__/actioncable'

jest.mock('actioncable')

const middlewares = [middleware]
const mockStore = configureMockStore(middlewares)
const store = mockStore({})

const consoleError = console.error

describe('Middleware (integration)', () => {
    let car: CableCar
    beforeEach(() => {
        console.error = jest.fn()
        car = middleware.connect(store, 'channel', {})
    })
    afterEach(() => {
        console.error = consoleError
        car.destroy()
        store.clearActions()
    })

    describe('when connected', () => {
        it('sends server actions once connected', () => {
            mockChannels['channel'].initialized()
            mockChannels['channel'].connected()
            let action1 = { type: 'RAILS_act1' }
            store.dispatch(action1)
            expect(mockSend).toHaveBeenCalledTimes(1)
            expect(mockSend).toHaveBeenCalledWith(action1)
        })

        it('passes optimistic actions to redux', () => {
            mockChannels['channel'].initialized()
            mockChannels['channel'].connected()
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
    })

    describe('when disconnected', () => {
        it('handles dropped actions', () => {
            let action1 = { type: 'RAILS_act1' }
            const consoleSpy = jest.spyOn(console, 'error')
            store.dispatch(action1)
            expect(mockSend).toHaveBeenCalledTimes(0)
            expect(consoleSpy).toHaveBeenCalledWith('CableCar: Dropped action.')
        })
        it('handles dropped (optimistic) actions', () => {
            let action1 = { type: 'RAILS_act1', meta: { isOptimistic: true } }
            const consoleSpy = jest.spyOn(console, 'error')
            store.dispatch(action1)
            expect(mockSend).toHaveBeenCalledTimes(0)
            expect(consoleSpy).toHaveBeenCalledWith(
                'CableCar: Dropped action. Action passed thru middleware (optimistic).'
            )
        })

        it('passes dropped (optimistic) actions to redux', () => {
            let action1 = { type: 'RAILS_act1', meta: { isOptimistic: true } }
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

    describe('permitted actions', () => {
        let car2: CableCar
        beforeEach(() => {
            car.destroy()
        })
        afterEach(() => {
            car2.destroy()
        })

        it('passes thru unpermitted actions to redux', () => {
            car2 = middleware.connect(store, 'channel2', {})
            let action1 = { type: 'someaction' }
            store.dispatch(action1)
            expect(store.getActions()).toContain(action1)
        })

        it('permits actions properly (empty string)', () => {
            car2 = middleware.connect(store, 'channel2', {
                permittedActions: '',
            })
            mockChannels['channel2'].initialized()
            mockChannels['channel2'].connected()
            let action1 = { type: 'anything' }
            store.dispatch(action1)
            expect(mockSend).toHaveBeenCalledWith(action1)
        })

        it('permits actions properly (prefix string)', () => {
            car2 = middleware.connect(store, 'channel2', {
                permittedActions: 'PRE',
            })
            mockChannels['channel2'].initialized()
            mockChannels['channel2'].connected()
            let action1 = { type: 'PRE_act1' }
            store.dispatch(action1)
            let action2 = { type: 'PRE_act2' }
            store.dispatch(action2)
            let action3 = { type: 'NON_PRE_act3' }
            store.dispatch(action3)
            expect(mockSend).toHaveBeenCalledWith(action1)
            expect(mockSend).toHaveBeenCalledWith(action2)
            expect(mockSend).not.toHaveBeenCalledWith(action3)
        })

        it('permits actions properly (list of strings/regexp)', () => {
            car2 = middleware.connect(store, 'channel2', {
                permittedActions: ['EITHER', 'OR', /^YES/],
            })
            mockChannels['channel2'].initialized()
            mockChannels['channel2'].connected()
            let action1 = { type: 'EITHER_act1' }
            store.dispatch(action1)
            let action2 = { type: 'OR_act2' }
            store.dispatch(action2)
            let action3 = { type: 'NOT_act3' }
            store.dispatch(action3)
            let action4 = { type: 'YES_act3' }
            store.dispatch(action4)
            expect(mockSend).toHaveBeenCalledWith(action1)
            expect(mockSend).toHaveBeenCalledWith(action2)
            expect(mockSend).not.toHaveBeenCalledWith(action3)
            expect(mockSend).toHaveBeenCalledWith(action4)
        })

        it('permits actions properly (RegExp)', () => {
            car2 = middleware.connect(store, 'channel2', {
                permittedActions: /^START.+FINISH$/,
            })
            mockChannels['channel2'].initialized()
            mockChannels['channel2'].connected()
            let action1 = { type: 'START_act1_FINISH' }
            store.dispatch(action1)
            let action2 = { type: 'START_act2' }
            store.dispatch(action2)
            let action3 = { type: 'NOT_act3_FINISH' }
            store.dispatch(action3)
            expect(mockSend).toHaveBeenCalledWith(action1)
            expect(mockSend).not.toHaveBeenCalledWith(action2)
            expect(mockSend).not.toHaveBeenCalledWith(action3)
        })

        it('permits actions properly (function)', () => {
            car2 = middleware.connect(store, 'channel2', {
                permittedActions: (a: CableCarActionFilter) =>
                    a['payload'] % 7 === 5,
            })
            mockChannels['channel2'].initialized()
            mockChannels['channel2'].connected()
            let action1 = { type: 'EXACT', payload: 12 }
            store.dispatch(action1)
            let action2 = { type: 'EXACTly', payload: 10 }
            store.dispatch(action2)
            let action3 = { type: '-EXACT' }
            store.dispatch(action3)
            expect(mockSend).toHaveBeenCalledWith(action1)
            expect(mockSend).not.toHaveBeenCalledWith(action2)
            expect(mockSend).not.toHaveBeenCalledWith(action3)
        })
    })
})
