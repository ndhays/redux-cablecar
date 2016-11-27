import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';
chai.use(sinonChai);



import CableCar from '../src/cableCar';


describe('CableCar', () => {
  
  const mockCreateFunc = sinon.stub();
  global.ActionCable = {
    createConsumer: () => { return { subscriptions: { create: mockCreateFunc } }}
  };

  const mockStore = { dispatch: sinon.spy() };
  
  
  describe('when ActionCable is undefined', () => {
    it('throws a descriptive error', () => {
      let ac = global.ActionCable;
      global.ActionCable = undefined;
      var fn = () => { return new CableCar('channel', mockStore) };
      chai.expect(fn).to.throw('CableCar tried to connect to ActionCable but ActionCable is not defined');
      global.ActionCable = ac;
    });
  });
  
  describe('constructor', () => {
    it('sets the channel', () => {
      let cc = new CableCar('channel', mockStore);
      chai.expect(cc.channel).to.eq('channel');
    });
    
    it('sets the store', () => {
      let cc = new CableCar('channel', mockStore);
      chai.expect(cc.store).to.eq(mockStore);
    });
  });
  
  describe('#initialize', () => {
    it('creates an ActionCable subscription with proper args', () => {
      let cc = new CableCar('channel', mockStore);
      chai.expect(mockCreateFunc).to.have.been.calledWith({ channel: 'channel' }, {
        initialized: cc.initialized,
        connected: cc.connected,
        disconnected: cc.disconnected,
        received: cc.received,
        rejected: cc.rejected,
      });
    });
  });

});