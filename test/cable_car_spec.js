import { CableCar, expect, spy, stub } from './setup';

describe('CableCar', () => {
  // ACTION CABLE MOCK
  const mockStore = { dispatch: spy() };
  const mockSubscription = { perform: spy(), send: spy(), unsubscribe: spy() };
  const mockCreateFunc = stub().returns(mockSubscription);

  before(() => {
    global.ActionCable = {
      createConsumer: () => ({ subscriptions: { create: mockCreateFunc } }),
    };
  });
  after(() => {
    global.ActionCable = null;
  });

  describe('when ActionCable is undefined', () => {
    it('throws a descriptive error', () => {
      const original = global.ActionCable;
      global.ActionCable = undefined;
      const fn = () => new CableCar('channel', mockStore);
      expect(fn).to.throw('CableCar tried to connect to ActionCable but ActionCable is not defined');
      global.ActionCable = original;
    });
  });

  describe('constructor', () => {
    it('sets the store', () => {
      const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
      expect(cc.store).to.eq(mockStore);
    });
  });

  describe('#initialize', () => {
    it('sets the channel', () => {
      const cc = new CableCar(mockStore, 'channel');
      expect(cc.channel).to.eq('channel');
    });
    it('sets the options', () => {
      const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
      expect(cc.options.opt1).to.eq(5);
    });
    it('sets the prefix', () => {
      const cc = new CableCar(mockStore, 'channel', { prefix: 'MY_PREFIX' });
      expect(cc.options.prefix).to.eq('MY_PREFIX');
    });
    it('sets the default prefix "CABLECAR" if no options are provided', () => {
      const cc = new CableCar(mockStore, 'channel');
      expect(cc.options.prefix).to.eq('CABLECAR');
    });
    it('sets the default prefix "CABLECAR" if options are provided (but no prefix)', () => {
      const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
      expect(cc.options.prefix).to.eq('CABLECAR');
    });
    it('sets the subscription', () => {
      const cc = new CableCar(mockStore, 'channel');
      expect(cc.subscription).to.eq(mockSubscription);
    });
    it('creates an ActionCable subscription with proper channel and params args', () => {
      const cc = new CableCar(mockStore, 'channel', { params: { door: 5 } });
      expect(mockCreateFunc).to.have.been.calledWith({ channel: 'channel', door: 5 }, {
        initialized: cc.initialized,
        connected: cc.connected,
        disconnected: cc.disconnected,
        received: cc.received,
        rejected: cc.rejected,
      });
    });
  });

  describe('#changeChannel', () => {
    it('unsubscribes from the old subscription', () => {
      const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
      stub(cc, 'unsubscribe');
      stub(cc, 'initialize');
      cc.changeChannel('newChannel');
      expect(cc.unsubscribe).to.have.been.calledWith();
    });
    it('initializes a new subscription w/ same prefix if none is given', () => {
      const cc = new CableCar(mockStore, 'channel');
      stub(cc, 'unsubscribe');
      stub(cc, 'initialize');
      cc.changeChannel('newChannel');
      const expectedResult = { prefix: cc.options.prefix };
      expect(cc.initialize).to.have.been.calledWith('newChannel', expectedResult);
    });
    it('initializes a new subscription w/ new options', () => {
      const cc = new CableCar(mockStore, 'channel');
      stub(cc, 'unsubscribe');
      stub(cc, 'initialize');
      cc.changeChannel('newChannel', { newOpt: 4, prefix: 'GO' });
      const expectedResult = { newOpt: 4, prefix: 'GO' };
      expect(cc.initialize).to.have.been.calledWith('newChannel', expectedResult);
    });
  });

  describe('#dispatch', () => {
    it('adds a flag.. CableCar__Action is true', () => {
      const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
      cc.dispatch({});
      expect(mockStore.dispatch).to.have.been.calledWith({
        CableCar__Action: true,
      });
    });
    describe('when msg passed is an object', () => {
      it('uses the msg as the action', () => {
        const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
        cc.dispatch({ type: 'testmsg' });
        expect(mockStore.dispatch).to.have.been.calledWith({
          type: 'testmsg',
          CableCar__Action: true,
        });
      });
    });
    describe('when msg passed is a string', () => {
      it('formats the msg into an action', () => {
        const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
        stub(cc, 'formatAction', () => ({ a: 'action34' }));
        cc.dispatch('testmsg');
        expect(mockStore.dispatch).to.have.been.calledWith({
          a: 'action34',
          CableCar__Action: true,
        });
      });
    });
  });
  describe('#formatAction', () => {
    it('formats the action properly', () => {
      const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
      const result = cc.formatAction('mssg');
      expect(result.type).to.eq('mssg');
      expect(result.car).to.eq(cc);
      expect(result.channel).to.eq(cc.channel);
      expect(result.options).to.eq(cc.options);
    });
  });
  describe('#prefixMatches', () => {
    it('checks for the prefix', () => {
      const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
      const result = cc.formatAction('mssg');
      expect(result.type).to.eq('mssg');
      expect(result.car).to.eq(cc);
      expect(result.channel).to.eq(cc.channel);
      expect(result.options).to.eq(cc.options);
    });
  });
  describe('#initialized', () => {
    it('dispatches the action type: "CABLECAR_INITIALIZED"', () => {
      const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
      stub(cc, 'dispatch');
      cc.initialized();
      expect(cc.dispatch).to.have.been.calledWith('CABLECAR_INITIALIZED');
    });
  });
  describe('#connected', () => {
    it('dispatches the action type: "CABLECAR_CONNECTED"', () => {
      const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
      stub(cc, 'dispatch');
      cc.connected();
      expect(cc.dispatch).to.have.been.calledWith('CABLECAR_CONNECTED');
    });
    it('calls the callback if one exists', () => {
      const callback = spy();
      const cc = new CableCar(mockStore, 'channel', { connected: callback });
      cc.connected();
      expect(callback).to.have.been.calledWith();
    });
  });
  describe('#disconnected', () => {
    it('dispatches the action type: "CABLECAR_DISCONNECTED"', () => {
      const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
      stub(cc, 'dispatch');
      cc.disconnected();
      expect(cc.dispatch).to.have.been.calledWith('CABLECAR_DISCONNECTED');
    });
    it('calls the callback if one exists', () => {
      const callback = spy();
      const cc = new CableCar(mockStore, 'channel', { disconnected: callback });
      cc.disconnected();
      expect(callback).to.have.been.calledWith();
    });
  });
  describe('#received', () => {
    it('dispatches the received msg', () => {
      const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
      stub(cc, 'dispatch');
      cc.received('message1');
      expect(cc.dispatch).to.have.been.calledWith('message1');
    });
  });
  describe('#rejected', () => {
    it('throws an error message', () => {
      const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
      expect(cc.rejected).to.throw('CableCar: Attempt to connect was rejected.');
    });
  });
  describe('#perform', () => {
    it('calls the #perform method of the ActionCable subscription', () => {
      const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
      cc.perform('action', 'data');
      expect(mockSubscription.perform).to.have.been.calledWith('action', 'data');
    });
  });
  describe('#send', () => {
    it('calls the #send method of the ActionCable subscription', () => {
      const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
      cc.send('action');
      expect(mockSubscription.send).to.have.been.calledWith('action');
    });
  });
  describe('#unsubscribe', () => {
    it('throws an error message', () => {
      const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
      stub(cc, 'disconnected');
      cc.unsubscribe();
      expect(mockSubscription.unsubscribe).to.have.been.calledWith();
      expect(cc.disconnected).to.have.been.calledWith();
    });
  });
});
