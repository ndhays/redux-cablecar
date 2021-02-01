import CableCar, { CableCarActionFilter } from '../src/cableCar'
import configureMockStore from 'redux-mock-store'

import {
    mockChannels,
    mockCreateConsumer,
    mockCreate,
    mockPerform,
    mockSend,
    mockUnsubscribe,
} from './__mocks__/actioncable'

// actioncable mock
const consumer = mockCreateConsumer()

// redux mocks
const middlewares = []
const mockStore = configureMockStore(middlewares)
const store = mockStore({})

describe('CableCar', () => {
    afterEach(() => {
        store.clearActions()
    })

    it('sets the consumer', () => {
        const cc = new CableCar(consumer, store, 'channel', {})
        expect(cc.consumer).toEqual(consumer)
    })
    it('sets the channel', () => {
        const cc = new CableCar(consumer, store, 'channel', {})
        expect(cc.channel).toEqual('channel')
    })
    it('sets option defaults', () => {
        const cc = new CableCar(consumer, store, 'channel', {})
        expect(cc.options).toEqual({
            params: {},
            silent: false,
            matchChannel: false,
        })
    })
    it('sets options', () => {
        let callback = jest.fn()
        let options = {
            params: { roomId: 1 },
            silent: true,
            matchChannel: false,
            initialized: callback,
            connected: callback,
            disconnected: callback,
            received: callback,
            rejected: callback,
        }
        const cc = new CableCar(consumer, store, 'channel', options)
        expect(cc.options).toEqual(options)
    })

    it('creates a subscription', () => {
        const cc = new CableCar(consumer, store, 'channel', {})
        expect(mockCreate).toHaveBeenCalled()
        expect(cc.subscription).toEqual({
            perform: mockPerform,
            send: mockSend,
            unsubscribe: mockUnsubscribe,
        })
    })

    it('destroys', () => {
        let callback = jest.fn()
        const cc = new CableCar(consumer, store, 'channel', {}, callback)
        cc.active = true
        cc.connected = true
        cc.destroy()
        expect(cc.active).toEqual(false)
        expect(cc.connected).toEqual(false)
        cc.destroy()
        expect(callback).toHaveBeenCalledTimes(1)
        expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
    })

    it('registers #initialized', () => {
        let mockInit = jest.fn()
        const cc = new CableCar(consumer, store, 'channel', {
            initialized: mockInit,
        })
        expect(cc.active).toEqual(false)
        mockChannels['channel'].initialized()
        expect(cc.active).toEqual(true)
        expect(mockInit).toHaveBeenCalled()
        let expectedAction = {
            meta: { __cablecar__: true, channel: 'channel' },
            payload: {},
            type: 'redux-cablecar/INIT',
        }
        expect(store.getActions()).toEqual([expectedAction])
    })

    it('registers #rejected', () => {
        let mockRejected = jest.fn()
        const cc = new CableCar(consumer, store, 'channel', {
            rejected: mockRejected,
        })
        mockChannels['channel'].rejected()
        expect(mockRejected).toHaveBeenCalled()
        let expectedAction = {
            meta: { __cablecar__: true, channel: 'channel' },
            payload: {},
            type: 'redux-cablecar/REJECTED',
        }
        expect(store.getActions()).toEqual([expectedAction])
    })

    it('registers #connected/#disconnected', () => {
        let mockConnected = jest.fn()
        let mockDisconnected = jest.fn()
        const cc = new CableCar(consumer, store, 'channel', {
            connected: mockConnected,
            disconnected: mockDisconnected,
        })
        expect(cc.active).toEqual(false)
        mockChannels['channel'].connected()
        expect(mockConnected).toHaveBeenCalled()
        mockChannels['channel'].disconnected()
        expect(mockDisconnected).toHaveBeenCalled()
        expect(cc.active).toEqual(false)
        let expectedAction1 = {
            meta: { __cablecar__: true, channel: 'channel' },
            payload: {},
            type: 'redux-cablecar/CONNECTED',
        }
        let expectedAction2 = {
            meta: { __cablecar__: true, channel: 'channel' },
            payload: {},
            type: 'redux-cablecar/DISCONNECTED',
        }
        expect(store.getActions()).toEqual([expectedAction1, expectedAction2])
    })

    it('registers #received', () => {
        new CableCar(consumer, store, 'channel', {})
        mockChannels['channel'].received({
            type: 'server',
            meta: { a: 1 },
            payload: { test: 'ing' },
        })
        let expectedAction = {
            meta: { a: 1, __cablecar__: true, channel: 'channel' },
            payload: { test: 'ing' },
            type: 'server',
        }
        expect(store.getActions()).toEqual([expectedAction])
    })

    it('#send actions', () => {
        let cc = new CableCar(consumer, store, 'channel', {})
        cc.active = true
        cc.connected = true
        cc.send('action')
        expect(mockSend).toHaveBeenCalledWith('action')
    })

    it('#send actions (error on disconnected)', () => {
        let cc = new CableCar(consumer, store, 'channel', {})
        cc.connected = false
        expect(() => {
            cc.send('action')
        }).toThrowError()
    })

    it('#send actions (error on inactive)', () => {
        let cc = new CableCar(consumer, store, 'channel', {})
        cc.active = false
        expect(() => {
            cc.send('action')
        }).toThrowError()
    })

    it('#perform actions', () => {
        let cc = new CableCar(consumer, store, 'channel', {})
        cc.active = true
        cc.connected = true
        cc.perform('m1', 'p1')
        expect(mockPerform).toHaveBeenCalledWith('m1', 'p1')
    })

    it('#perform actions (error on disconnected)', () => {
        let cc = new CableCar(consumer, store, 'channel', {})
        cc.connected = false
        expect(() => {
            cc.perform('m1', 'p1')
        }).toThrowError()
    })

    it('#perform actions (error on inactive', () => {
        let cc = new CableCar(consumer, store, 'channel', {})
        cc.active = false
        expect(() => {
            cc.perform('m1', 'p1')
        }).toThrowError()
    })

    it('ignores internal actions', () => {
        let cc = new CableCar(consumer, store, 'channel', {})
        let ccAction = {
            type: 'testing',
            meta: { __cablecar__: true },
        }
        expect(cc.permitsAction(ccAction)).toEqual(false)
    })

    it('utilizes permitted action function (default)', () => {
        let cc = new CableCar(consumer, store, 'channel', {})
        let action1 = {
            type: 'RAILS_testing',
            meta: {},
        }
        expect(cc.permitsAction(action1)).toEqual(true)
    })

    it('utilizes permitted action function (custom)', () => {
        let mockPermit = jest.fn()
        let cc = new CableCar(consumer, store, 'channel', {
            permittedActions: mockPermit,
        })
        let action1 = { type: 'test', meta: {} }
        cc.permitsAction(action1)
        expect(mockPermit).toHaveBeenCalledWith(action1)
    })

    it('silences dispatches w/ silent option', () => {
        let cc = new CableCar(consumer, store, 'channel', {
            silent: true,
        })
        mockChannels['channel'].initialized()
        mockChannels['channel'].connected()
        let action1 = { type: 'RAILS-test', meta: {} }
        expect(store.getActions()).toEqual([])
    })

    describe('#permitsAction', () => {
        it('permits actions properly (empty string)', () => {
            const car = new CableCar(consumer, store, 'channel2', {
                permittedActions: '',
            })
            let action1 = { type: 'anything' }
            expect(car.permitsAction(action1)).toEqual(true)
        })

        it('permits actions properly (prefix string)', () => {
            const car = new CableCar(consumer, store, 'channel2', {
                permittedActions: 'PRE',
            })
            let action1 = { type: 'PRE_act1' }
            let action2 = { type: 'PRE_act2' }
            let action3 = { type: 'NON_PRE_act3' }
            expect(car.permitsAction(action1)).toEqual(true)
            expect(car.permitsAction(action2)).toEqual(true)
            expect(car.permitsAction(action3)).toEqual(false)
        })

        it('permits actions properly (list of strings/regexp)', () => {
            const car = new CableCar(consumer, store, 'channel2', {
                permittedActions: ['EITHER', 'OR', /^YES/],
            })
            let action1 = { type: 'EITHER_act1' }
            let action2 = { type: 'OR_act2' }
            let action3 = { type: 'NOT_act3' }
            let action4 = { type: 'YES_act3' }
            expect(car.permitsAction(action1)).toEqual(true)
            expect(car.permitsAction(action2)).toEqual(true)
            expect(car.permitsAction(action3)).toEqual(false)
            expect(car.permitsAction(action4)).toEqual(true)
        })

        it('permits actions properly (RegExp)', () => {
            const car = new CableCar(consumer, store, 'channel2', {
                permittedActions: /^START.+FINISH$/,
            })
            let action1 = { type: 'START_act1_FINISH' }
            let action2 = { type: 'START_act2' }
            let action3 = { type: 'NOT_act3_FINISH' }
            expect(car.permitsAction(action1)).toEqual(true)
            expect(car.permitsAction(action2)).toEqual(false)
            expect(car.permitsAction(action3)).toEqual(false)
        })

        it('permits actions properly (function)', () => {
            const car = new CableCar(consumer, store, 'channel2', {
                permittedActions: (a: CableCarActionFilter) =>
                    a['payload'] % 7 === 5,
            })
            let action1 = { type: 'EXACT', payload: 12 }
            let action2 = { type: 'EXACTly', payload: 10 }
            let action3 = { type: '-EXACT' }
            expect(car.permitsAction(action1)).toEqual(true)
            expect(car.permitsAction(action2)).toEqual(false)
            expect(car.permitsAction(action3)).toEqual(false)
        })

        it('permits actions properly (matchChannel)', () => {
            const car = new CableCar(consumer, store, 'channelOne', {
                matchChannel: true,
            })
            const car2 = new CableCar(consumer, store, 'channelTwo', {
                matchChannel: true,
            })
            let action1 = {
                type: 'RAILS/first',
                meta: { channel: 'channelOne' },
            }
            let action2 = {
                type: 'RAILS/third',
                meta: { channel: 'channelTwo' },
            }
            expect(car.permitsAction(action1)).toEqual(true)
            expect(car.permitsAction(action2)).toEqual(false)
            expect(car2.permitsAction(action1)).toEqual(false)
            expect(car2.permitsAction(action2)).toEqual(true)
        })
    })
})
