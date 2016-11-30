/* eslint import/no-extraneous-dependencies: ["error", {"devDependencies": true}] */
/* global describe, it */

import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';

import CableCar from '../src/cableCar';

chai.use(sinonChai);


describe('CableCar', () => {
  const mockCreateFunc = sinon.stub();
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
      chai.expect(cc.params.channel).to.eq('channel');
      chai.expect(cc.params.opt1).to.eq(5);
    });

    it('sets the store', () => {
      const cc = new CableCar(mockStore, 'channel', { opt1: 5 });
      chai.expect(cc.store).to.eq(mockStore);
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
});
