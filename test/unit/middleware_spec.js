import { createStore, applyMiddleware } from 'redux';
import { expect, spy } from '../setup';
import middleware from '../../src/middleware';

let ActionCableCalls;

describe('cablecar middleware', () => {
  let ActionCableMockProvider;

  before(() => {
    ActionCableMockProvider = {
      createConsumer: () => ({
        subscriptions: {
          create: (params, callbacks) => {
            ActionCableCalls = callbacks;
            return { send: () => {}, unsubscribe: () => {} };
          },
        },
      }),
    };
  });

  after(() => {
    ActionCableMockProvider = null;
  });

  const mockReducer = (state = { value: 0 }, action) => {
    if (action.type === 'CHANGE') {
      return { value: action.value };
    }

    return Object.assign({}, state);
  };

  // functioning store
  let car, store;

  describe('#middleware', () => {
    // recreate store before each test
    beforeEach(() => {
      store = createStore(mockReducer, { value: 0 }, applyMiddleware(middleware));
      middleware.setProvider(ActionCableMockProvider);
      car = middleware.connect(store, 'channel', { opt1: 6 });
      ActionCableCalls.connected();
    });

    afterEach(() => {
      store.dispatch({ type: "CABLECAR_DESTROY_ALL" });
    })

    describe('when action is optimistic (and not flagged)', () => {
      it('gets passed on to redux', () => {
        expect(store.getState().value).to.eq(0);
        store.dispatch({ type: 'CHANGE', value: 10, optimistic: true });
        expect(store.getState().value).to.eq(10);
      });
    });
    describe('when action is flagged (but not optimistic)', () => {
      it('gets passed on to redux', () => {
        expect(store.getState().value).to.eq(0);
        store.dispatch({ type: 'CHANGE', value: 10, CableCar__Action: true });
        expect(store.getState().value).to.eq(10);
      });
    });
    describe('when action is an unexisting channel', () => {
      it('does get passed on to redux', () => {
        expect(store.getState().value).to.eq(0);
        store.dispatch({ channel: 'notachannel', type: 'CHANGE', value: 10 });
        expect(store.getState().value).to.eq(10);
      });
    });
    describe('when car is disconnected', () => {
      it('does not get passed on to redux', () => {
        let car = middleware.connect(store, 'channel1', { prefix: '' });
        car.unsubscribe();
        expect(store.getState().value).to.eq(0);
        store.dispatch({ channel: 'channel1', type: 'CHANGE', value: 10 });
        expect(store.getState().value).to.eq(0);
      });
    });
    describe('when car is disconnected but optimisticOnFail is set', () => {
      it('does get passed on to redux', () => {
        let car = middleware.connect(store, 'channel2', { prefix: '', optimisticOnFail: true });
        car.unsubscribe();
        expect(store.getState().value).to.eq(0);
        store.dispatch({ channel: 'channel2', type: 'CHANGE', value: 10 });
        expect(store.getState().value).to.eq(10);
      });
    });
  });

  describe('#connect', () => {
    it('creates a new CableCar object with proper arguments', () => {
      let cc = middleware.connect({ dispatch: 'mockstoredispatch' }, 'channel', { prefix: '', params: { opt1: 6 }});
      expect(cc.getChannel()).to.eq('channel');
      expect(cc.getParams().opt1).to.eq(6);
      cc = null;
    });
  });
});
