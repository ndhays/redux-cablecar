import { createStore, applyMiddleware } from 'redux';
import { middleware, expect, spy } from './setup';

describe('cablecar middleware', () => {
  // ACTION CABLE MOCK
  before(() => {
    global.ActionCable = {
      createConsumer: () => ({
        subscriptions: {
          create: spy(),
        },
      }),
    };
  });
  after(() => {
    global.ActionCable = null;
  });

  const mockReducer = (state = { value: 0 }, action) => {
    if (action.type === 'GO') {
      return { value: action.value };
    }

    return Object.assign({}, state);
  };

  // functioning store
  let store;

  describe('#middleware', () => {
    // recreate store before each test
    beforeEach(() => {
      store = createStore(mockReducer, { value: 0 }, applyMiddleware(middleware));
    });

    describe('when action is optimistic (and not flagged)', () => {
      it('gets passed on to redux', () => {
        expect(store.getState().value).to.eq(0);
        store.dispatch({ type: 'GO', value: 10, optimistic: true });
        expect(store.getState().value).to.eq(10);
      });
    });
    describe('when action is flagged (but not optimistic)', () => {
      it('gets passed on to redux', () => {
        expect(store.getState().value).to.eq(0);
        store.dispatch({ type: 'GO', value: 10, ActionCable__flag: true });
        expect(store.getState().value).to.eq(10);
      });
    });
    describe('when action is neither optimistic nor flagged)', () => {
      it('does not get passed on to redux', () => {
        expect(store.getState().value).to.eq(0);
        store.dispatch({ type: 'GO', value: 10 });
        expect(store.getState().value).to.eq(0);
      });
    });
  });

  describe('#connect', () => {
    it('creates a new CableCar object with proper arguments', () => {
      let cc = middleware.connect('mockStore', 'channel', { opt1: 6 });
      expect(cc.store).to.eq('mockStore');
      expect(cc.channel).to.eq('channel');
      expect(cc.options.opt1).to.eq(6);
      cc = null;
    });
  });
});
