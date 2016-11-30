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
    if (action.type === 'GO') {
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
    car = middleware.connect(mystore, 'MyChannel', { room: 5 });
  });

  it('sends and receives the proper messages', () => {
    expect(mystore.getState().value).to.eq(0);

    mystore.dispatch({ type: 'way too early' });
    ActionCableCalls.initialized();
    mystore.dispatch({ type: 'too early' });
    ActionCableCalls.connected();
    mystore.dispatch({ type: 'ok' });
    ActionCableCalls.disconnected();
    mystore.dispatch({ type: 'hello?' });
    ActionCableCalls.connected();
    mystore.dispatch({ type: 'we are back' });
    ActionCableCalls.received({ type: 'HELLO_FROM_SERVER' });
    ActionCableCalls.received({ type: 'GO', value: 100 });
    expect(mystore.getState().value).to.eq(100);
    ActionCableCalls.received({
      type: 'CABLECAR_CHANGE_CHANNEL',
      channel: 'NewChannel',
      options: { room: 6 },
    });
    expect(car.channel).to.eq('NewChannel');
    expect(car.options.room).to.eq(6);
    expect(loggedServerActions[0]).to.eq('ok');
    expect(loggedServerActions[1]).to.eq('we are back');
    expect(loggedClientActions[0]).to.eq('CABLECAR_INITIALIZED');
    expect(loggedClientActions[1]).to.eq('CABLECAR_CONNECTED');
    expect(loggedClientActions[2]).to.eq('CABLECAR_DISCONNECTED');
    expect(loggedClientActions[3]).to.eq('CABLECAR_CONNECTED');
    expect(loggedClientActions[4]).to.eq('HELLO_FROM_SERVER');
    expect(loggedClientActions[5]).to.eq('GO');
    expect(loggedClientActions[6]).to.eq('CABLECAR_DISCONNECTED');
    expect(loggedClientActions[7]).to.eq('CABLECAR_CHANGE_CHANNEL');
  });
});
