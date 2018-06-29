import { expect, spy, stub } from '../setup';
import CableCar from '../../src/cableCar';

describe('CableCar', () => {
  // ACTION CABLE MOCK
  const mockStore = { dispatch: spy() };
  const mockSubscription = { perform: spy(), send: spy(), unsubscribe: spy() };
  const mockCreateFunc = stub().returns(mockSubscription);

  let mockCableProvider;

  before(() => {
    mockCableProvider = {
      createConsumer: () => ({ subscriptions: { create: mockCreateFunc } }),
    };
  });
  after(() => {
    mockCableProvider = null;
  });

  describe('constructor', () => {
    describe('when no cable provider is given', () => {
      it('throws an error', () => {
        expect(() => { new CableCar(undefined, mockStore, 'channel', { opt1: 5 }) })
          .to.throw('CableCar: unknown ActionCable provider: undefined');
      });
    });
    it('sets the cable provider', () => {
      const cc = new CableCar(mockCableProvider, mockStore, 'channel', { opt1: 5 });
      expect(cc.actionCableProvider).to.eq(mockCableProvider);
    });
    it('sets the store', () => {
      const cc = new CableCar(mockCableProvider, mockStore, 'channel', { opt1: 5 });
      expect(cc.store).to.eq(mockStore);
    });
  });

  describe('#initialize', () => {
    it('sets the channel', () => {
      const cc = new CableCar(mockCableProvider, mockStore, 'channel');
      expect(cc.channel).to.eq('channel');
    });
    it('sets the options', () => {
      const cc = new CableCar(mockCableProvider, mockStore, 'channel', { opt1: 5 });
      expect(cc.options.opt1).to.eq(5);
    });
    it('sets the prefix', () => {
      const cc = new CableCar(mockCableProvider, mockStore, 'channel', { prefix: 'MY_PREFIX' });
      expect(cc.options.prefix).to.eq('MY_PREFIX');
    });
    it('sets the default prefix "RAILS" if no options are provided', () => {
      const cc = new CableCar(mockCableProvider, mockStore, 'channel');
      expect(cc.options.prefix).to.eq('RAILS');
    });
    it('sets the default prefix "RAILS" if options are provided (but no prefix)', () => {
      const cc = new CableCar(mockCableProvider, mockStore, 'channel', { opt1: 5 });
      expect(cc.options.prefix).to.eq('RAILS');
    });
    it('sets the subscription', () => {
      const cc = new CableCar(mockCableProvider, mockStore, 'channel');
      expect(cc.subscription).to.eq(mockSubscription);
    });
    it('creates an ActionCable subscription with proper channel and params args', () => {
      const cc = new CableCar(mockCableProvider, mockStore, 'channel', { params: { door: 5 } });
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
      const cc = new CableCar(mockCableProvider, mockStore, 'channel', { opt1: 5 });
      stub(cc, 'unsubscribe');
      stub(cc, 'initialize');
      cc.changeChannel('newChannel');
      expect(cc.unsubscribe).to.have.been.calledWith();
    });
    it('initializes a new subscription w/ same prefix if none is given', () => {
      const cc = new CableCar(mockCableProvider, mockStore, 'channel');
      stub(cc, 'unsubscribe');
      stub(cc, 'initialize');
      cc.changeChannel('newChannel');
      const expectedResult = { prefix: cc.options.prefix, optimisticOnFail: false };
      expect(cc.initialize).to.have.been.calledWith('newChannel', expectedResult);
    });
    it('initializes a new subscription w/ new options', () => {
      const cc = new CableCar(mockCableProvider, mockStore, 'channel');
      stub(cc, 'unsubscribe');
      stub(cc, 'initialize');
      cc.changeChannel('newChannel', { newOpt: 4, prefix: 'GO' });
      const expectedResult = { newOpt: 4, prefix: 'GO', optimisticOnFail: false };
      expect(cc.initialize).to.have.been.calledWith('newChannel', expectedResult);
    });
  });

  describe('#dispatch', () => {
    it('adds flag CableCar__Action and channel flags', () => {
      const cc = new CableCar(mockCableProvider, mockStore, 'channel', { opt1: 5 });
      cc.dispatch({});
      expect(mockStore.dispatch).to.have.been.calledWith({
        CableCar__Action: true,
        channel: 'channel'
      });
    });
  });
  describe('#initialized', () => {
    it('dispatches the action type: "CABLECAR_INITIALIZED"', () => {
      const cc = new CableCar(mockCableProvider, mockStore, 'channel', { opt1: 5 });
      stub(cc, 'dispatch');
      cc.initialized();
      expect(cc.dispatch).to.have.been.calledWith({ type: 'CABLECAR_INITIALIZED' });
    });
  });
  describe('#connected', () => {
    it('dispatches the action type: "CABLECAR_CONNECTED"', () => {
      const cc = new CableCar(mockCableProvider, mockStore, 'channel', { opt1: 5 });
      stub(cc, 'dispatch');
      cc.connected();
      expect(cc.dispatch).to.have.been.calledWith({ type: 'CABLECAR_CONNECTED' });
    });
    it('calls the callback if one exists', () => {
      const callback = spy();
      const cc = new CableCar(mockCableProvider, mockStore, 'channel', { connected: callback });
      cc.connected();
      expect(callback).to.have.been.calledWith();
    });
  });
  describe('#disconnected', () => {
    it('dispatches the action type: "CABLECAR_DISCONNECTED"', () => {
      const cc = new CableCar(mockCableProvider, mockStore, 'channel', { opt1: 5 });
      stub(cc, 'dispatch');
      cc.disconnected();
      expect(cc.dispatch).to.have.been.calledWith({ type: 'CABLECAR_DISCONNECTED' });
    });
    it('calls the callback if one exists', () => {
      const callback = spy();
      const cc = new CableCar(mockCableProvider, mockStore, 'channel', { disconnected: callback });
      cc.disconnected();
      expect(callback).to.have.been.calledWith();
    });
  });
  describe('#received', () => {
    it('dispatches the received msg', () => {
      const cc = new CableCar(mockCableProvider, mockStore, 'channel', { opt1: 5 });
      stub(cc, 'dispatch');
      cc.received('message1');
      expect(cc.dispatch).to.have.been.calledWith('message1');
    });
  });
  describe('#rejected', () => {
    it('throws an error message', () => {
      const cc = new CableCar(mockCableProvider, mockStore, 'channel', { opt1: 5 });
      expect(cc.rejected).to.throw('CableCar: Attempt to connect was rejected');
    });
  });
  describe('#getChannel', () => {
    it('gets the channel (public fn)', () => {
      const cc = new CableCar(mockCableProvider, mockStore, 'channel', { opt1: 5 });
      expect(cc.getChannel()).to.eq('channel')
    });
  });
  describe('#getParams', () => {
    it('gets the params (public fn)', () => {
      const cc = new CableCar(mockCableProvider, mockStore, 'channel', { params: { opt1: 5 } });
      expect(cc.getParams().opt1).to.eq(5)
    });
  });
  describe('#perform', () => {
    it('calls the #perform method of the ActionCable subscription', () => {
      const cc = new CableCar(mockCableProvider, mockStore, 'channel', { opt1: 5 });
      cc.perform('action', 'data');
      expect(mockSubscription.perform).to.have.been.calledWith('action', 'data');
    });
  });
  describe('#send', () => {
    it('calls the #send method of the ActionCable subscription', () => {
      const cc = new CableCar(mockCableProvider, mockStore, 'channel', { opt1: 5 });
      cc.send('action');
      expect(mockSubscription.send).to.have.been.calledWith('action');
    });
  });
  describe('#unsubscribe', () => {
    it('unsubscribes', () => {
      const cc = new CableCar(mockCableProvider, mockStore, 'channel', { opt1: 5 });
      stub(cc, 'disconnected');
      cc.unsubscribe();
      expect(mockSubscription.unsubscribe).to.have.been.calledWith();
      expect(cc.disconnected).to.have.been.calledWith();
    });
  });
});
