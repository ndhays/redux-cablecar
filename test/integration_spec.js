import { createStore, applyMiddleware } from 'redux';
import { middleware, expect, spy } from './setup';

describe('Integrated functionality -->', () => {
  // ACTION CABLE MOCKS
  let loggedServerActions = [];
  const mockSubscription = {
    perform: spy(),
    send: spy(msg => loggedServerActions.push(msg.type)),
    unsubscribe: spy(),
  };
  let ActionCableCalls;

  before(() => {
    global.ActionCable = {
      createConsumer: () => ({
        subscriptions: {
          create: (params, callbacks) => {
            ActionCableCalls = callbacks;
            return mockSubscription;
          },
        },
      }),
    };
  });
  after(() => {
    global.ActionCable = null;
  });

  // REDUX MOCKS
  let mystore;
  const mockReducer = (state = { value: 0 }, action) => {
    if (action.type === 'CHANGE_VALUE') {
      return { value: action.value };
    }

    return Object.assign({}, state);
  };
  let loggedClientActions;
  const actionLogger = store => next => (action) => {
    if (store) loggedClientActions.push(action.type);
    return next(action);
  };

  let car;

  beforeEach(() => {
    mystore = createStore(
      mockReducer,
      { value: 0 },
      applyMiddleware(middleware, actionLogger),
    );
    loggedServerActions = [];
    loggedClientActions = [];
  });

  it('sends and receives the proper messages', () => {
    const options = { params: { room: 5 }, prefix: '' };
    car = middleware.connect(mystore, 'MyChannel', options);

    expect(mystore.getState().value).to.eq(0);
    mystore.dispatch({ type: 'beforehand' });
    ActionCableCalls.initialized();
    mystore.dispatch({ type: 'now cable car takes over' });
    ActionCableCalls.connected();
    mystore.dispatch({ type: 'ok' });
    ActionCableCalls.disconnected();
    mystore.dispatch({ type: 'cable car is disconnected, but still exists' });
    ActionCableCalls.connected();
    mystore.dispatch({ type: 'we are back' });
    ActionCableCalls.received({ type: 'HELLO_FROM_SERVER' });
    ActionCableCalls.received({ type: 'CHANGE_VALUE', value: 100 });
    expect(mystore.getState().value).to.eq(100);
    ActionCableCalls.received({
      type: 'CABLECAR_CHANGE_CHANNEL',
      channel: 'NewChannel',
      options: { params: { room: 6 } },
    });
    expect(car.channel).to.eq('NewChannel');
    expect(car.options.params.room).to.eq(6);
    mystore.dispatch({ type: 'CABLECAR_DESTROY' });
    mystore.dispatch({ type: 'works again as normal' });

    expect(loggedServerActions[0]).to.eq('ok');
    expect(loggedServerActions[1]).to.eq('we are back');

    expect(loggedClientActions[0]).to.eq('beforehand');
    expect(loggedClientActions[1]).to.eq('CABLECAR_INITIALIZED');
    expect(loggedClientActions[2]).to.eq('CABLECAR_CONNECTED');
    expect(loggedClientActions[3]).to.eq('CABLECAR_DISCONNECTED');
    expect(loggedClientActions[4]).to.eq('CABLECAR_CONNECTED');
    expect(loggedClientActions[5]).to.eq('HELLO_FROM_SERVER');
    expect(loggedClientActions[6]).to.eq('CHANGE_VALUE');
    expect(loggedClientActions[7]).to.eq('CABLECAR_DISCONNECTED');
    expect(loggedClientActions[8]).to.eq('CABLECAR_CHANGE_CHANNEL');
    expect(loggedClientActions[9]).to.eq('CABLECAR_DISCONNECTED');
    expect(loggedClientActions[10]).to.eq('CABLECAR_DESTROY');
    expect(loggedClientActions[11]).to.eq('works again as normal');
    expect(loggedClientActions.length).to.eq(12);
  });

  it('prefixes: sends and receives the proper messages', () => {
    const options = { params: { room: 5 } };
    car = middleware.connect(mystore, 'MyChannel', options);

    ActionCableCalls.initialized();
    ActionCableCalls.connected();
    mystore.dispatch({ type: 'CABLECAR_SENDING_TO_RAILS', payload: 'YES' });
    mystore.dispatch({ type: 'SKIP_SERVER', payload: 'NO' });
    ActionCableCalls.received({
      type: 'CABLECAR_CHANGE_CHANNEL',
      channel: 'NewChannel',
      options: { params: { room: 6 }, prefix: '' },
    });
    ActionCableCalls.connected();
    mystore.dispatch({ type: 'CABLECAR_SENDING_TO_RAILS_2', payload: 'YES' });
    mystore.dispatch({ type: 'NEW_PREFIX', payload: 'YES' });

    expect(loggedServerActions[0]).to.eq('CABLECAR_SENDING_TO_RAILS');
    expect(loggedServerActions[1]).to.eq('CABLECAR_SENDING_TO_RAILS_2');
    expect(loggedServerActions[2]).to.eq('NEW_PREFIX');

    expect(loggedClientActions[0]).to.eq('CABLECAR_INITIALIZED');
    expect(loggedClientActions[1]).to.eq('CABLECAR_CONNECTED');
    expect(loggedClientActions[2]).to.eq('SKIP_SERVER');
    expect(loggedClientActions[3]).to.eq('CABLECAR_DISCONNECTED');
    expect(loggedClientActions[4]).to.eq('CABLECAR_CHANGE_CHANNEL');
    expect(loggedClientActions[5]).to.eq('CABLECAR_CONNECTED');
  });
});
