import CableCar from '../src/cableCar'
import configureMockStore from 'redux-mock-store'

import {
    mockChannels,
    mockCreateConsumer,
    mockCreate,
    mockPerform,
    mockSend,
    mockUnsubscribe,
} from './__mocks__/actioncable'

jest.mock('actioncable')

const middlewares = []
const mockStore = configureMockStore(middlewares)
const store = mockStore({})

describe('CableCar', () => {
    afterEach(() => {
        store.clearActions()
    })

    it('sets the channel', () => {
        const cc = new CableCar(store, 'channel', {})
        expect(cc.channel).toEqual('channel')
    })
    it('sets option defaults', () => {
        const cc = new CableCar(store, 'channel', {})
        expect(cc.options).toEqual({
            params: {},
            silent: false,
        })
    })
    it('sets options', () => {
        let callback = jest.fn()
        let options = {
            params: { roomId: 1 },
            silent: true,
            initialized: callback,
            connected: callback,
            disconnected: callback,
            received: callback,
            rejected: callback,
        }
        const cc = new CableCar(store, 'channel', options)
        expect(cc.options).toEqual(options)
    })

    it('creates a subscription', () => {
        const cc = new CableCar(store, 'channel', {})
        expect(mockCreate).toHaveBeenCalled()
        expect(cc.subscription).toEqual({
            perform: mockPerform,
            send: mockSend,
            unsubscribe: mockUnsubscribe,
        })
    })

    it('creates a subscription w/ custom websocket url', () => {
        new CableCar(store, 'channel', {
            webSocketURL: 'ws://custom',
        })
        expect(mockCreateConsumer).toHaveBeenCalledWith('ws://custom')
    })

    it('creates a subscription w/ custom provider', () => {
        let mockCreate2 = jest.fn()
        let customProvider = {
            createConsumer: jest.fn(() => ({
                subscriptions: { create: mockCreate2 },
            })),
        }
        new CableCar(store, 'channel', {
            provider: customProvider,
        })
        expect(customProvider.createConsumer).toHaveBeenCalledWith(null)
        expect(mockCreate2).toHaveBeenCalled()
    })

    it('destroys', () => {
        let callback = jest.fn()
        const cc = new CableCar(store, 'channel', {}, callback)
        cc.active = true
        cc.destroy()
        cc.destroy()
        expect(callback).toHaveBeenCalledTimes(1)
        expect(mockUnsubscribe).toHaveBeenCalledTimes(1)
    })

    it('registers #initialized', () => {
        let mockInit = jest.fn()
        const cc = new CableCar(store, 'channel', {
            initialized: mockInit,
        })
        mockChannels['channel'].initialized()
        expect(mockInit).toHaveBeenCalled()
        let expectedAction = {
            meta: { __cablecar__: true, __cablecarChannel__: 'channel' },
            payload: {},
            type: 'redux-cablecar/INIT',
        }
        expect(store.getActions()).toEqual([expectedAction])
    })

    it('registers #rejected', () => {
        let mockRejected = jest.fn()
        const cc = new CableCar(store, 'channel', {
            rejected: mockRejected,
        })
        mockChannels['channel'].rejected()
        expect(mockRejected).toHaveBeenCalled()
        let expectedAction = {
            meta: { __cablecar__: true, __cablecarChannel__: 'channel' },
            payload: {},
            type: 'redux-cablecar/REJECTED',
        }
        expect(store.getActions()).toEqual([expectedAction])
    })

    it('registers #connected/#disconnected', () => {
        let mockConnected = jest.fn()
        let mockDisconnected = jest.fn()
        const cc = new CableCar(store, 'channel', {
            connected: mockConnected,
            disconnected: mockDisconnected,
        })
        expect(cc.active).toEqual(false)
        mockChannels['channel'].connected()
        expect(mockConnected).toHaveBeenCalled()
        expect(cc.active).toEqual(true)
        mockChannels['channel'].disconnected()
        expect(mockDisconnected).toHaveBeenCalled()
        expect(cc.active).toEqual(false)
        let expectedAction1 = {
            meta: { __cablecar__: true, __cablecarChannel__: 'channel' },
            payload: {},
            type: 'redux-cablecar/CONNECTED',
        }
        let expectedAction2 = {
            meta: { __cablecar__: true, __cablecarChannel__: 'channel' },
            payload: {},
            type: 'redux-cablecar/DISCONNECTED',
        }
        expect(store.getActions()).toEqual([expectedAction1, expectedAction2])
    })

    it('registers #received', () => {
        new CableCar(store, 'channel', {})
        mockChannels['channel'].received({
            type: 'server',
            meta: { a: 1 },
            payload: { test: 'ing' },
        })
        let expectedAction = {
            meta: { a: 1, __cablecar__: true },
            payload: { test: 'ing' },
            type: 'server',
        }
        expect(store.getActions()).toEqual([expectedAction])
    })

    it('#send actions', () => {
        let cc = new CableCar(store, 'channel', {})
        cc.send('action')
        expect(mockSend).toHaveBeenCalledWith('action')
    })

    it('#perform actions', () => {
        let cc = new CableCar(store, 'channel', {})
        cc.perform('m1', 'p1')
        expect(mockPerform).toHaveBeenCalledWith('m1', 'p1')
    })

    it('ignores internal actions', () => {
        let cc = new CableCar(store, 'channel', {})
        let ccAction = {
            type: 'testing',
            meta: { __cablecar__: true },
        }
        expect(cc.permitsAction(ccAction)).toEqual(false)
    })

    it('utilizes permitted action function (default)', () => {
        let cc = new CableCar(store, 'channel', {})
        let action1 = {
            type: 'RAILS_testing',
            meta: {},
        }
        expect(cc.permitsAction(action1)).toEqual(true)
    })

    it('utilizes permitted action function (custom)', () => {
        let mockPermit = jest.fn()
        let cc = new CableCar(store, 'channel', {
            permittedActions: mockPermit,
        })
        let action1 = { type: 'test', meta: {} }
        cc.permitsAction(action1)
        expect(mockPermit).toHaveBeenCalledWith(action1)
    })

    it('silences dispatches w/ silent option', () => {
        let cc = new CableCar(store, 'channel', {
            silent: true,
        })
        mockChannels['channel'].initialized()
        mockChannels['channel'].connected()
        let action1 = { type: 'RAILS-test', meta: {} }
        expect(store.getActions()).toEqual([])
    })
})
