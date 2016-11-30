/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* global describe, it */

import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';

import CableCar from '../src/cableCar';

chai.use(sinonChai);


describe('CableCar', () => {
  const mockCreateFunc = sinon.stub().returns('mockSubscription');
  global.ActionCable = {
    createConsumer: () => ({ subscriptions: { create: mockCreateFunc } }),
  };

  const mockStore = { dispatch: sinon.spy() };


  describe('when ActionCable is undefined', () => {
    it('throws a descriptive error', () => {
      const ac = global.ActionCable;
      global.ActionCable = undefined;
      const fn = () => new CableCar('channel', mockStore);
      chai.expect(fn).to.throw('CableCar tried to connect to ActionCable but ActionCable is not defined');
      global.ActionCable = ac;
    });
  });

  describe('constructor', () => {
    it('sets the channel and options', () => {
      const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
      chai.expect(cc.channel).to.eq('channel');
      chai.expect(cc.options.opt1).to.eq(5);
    });

    it('sets the store', () => {
      const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
      chai.expect(cc.store).to.eq(mockStore);
    });

    it('sets the subscription', () => {
      const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
      chai.expect(cc.subscription).to.eq('mockSubscription');
    });
  });

  describe('#initialize', () => {
    it('creates an ActionCable subscription with proper args', () => {
      const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
      chai.expect(mockCreateFunc).to.have.been.calledWith({ channel: 'channel', opt1: 5 }, {
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
      sinon.stub(cc, 'unsubscribe');
      sinon.stub(cc, 'initialize');
      cc.changeChannel('newChannel');
      chai.expect(cc.unsubscribe).to.have.been.called;
    });
    it('initializes a new subscription', () => {
      const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
      sinon.stub(cc, 'unsubscribe');
      sinon.stub(cc, 'initialize');
      cc.changeChannel('newChannel', 'opts');
      chai.expect(cc.initialize).to.have.been.calledWith('newChannel', 'opts');
    });
  });

  describe('#dispatch', () => {
    it('adds an ActionCable flag', () => {
      const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
      cc.dispatch({});
      chai.expect(mockStore.dispatch).to.have.been.calledWith({
        ActionCable__flag: true,
      });
    });
    describe('when msg passed is an object', () => {
      it('uses the msg as the action', () => {
        const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
        cc.dispatch({ type: 'testmsg' });
        chai.expect(mockStore.dispatch).to.have.been.calledWith({
          type: 'testmsg',
          ActionCable__flag: true,
        });
      });
    });
    describe('when msg passed is a string', () => {
      it('formats the msg into an action', () => {
        const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
        sinon.stub(cc, 'formatAction', () => ({ a: 'action34' }));
        cc.dispatch('testmsg');
        chai.expect(mockStore.dispatch).to.have.been.calledWith({
          a: 'action34',
          ActionCable__flag: true,
        });
      });
    });
  });
});
