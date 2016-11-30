/* global ActionCable */

class CableCar {

  constructor(store, channel, options = {}) {
    if (typeof ActionCable === 'undefined') {
      throw new Error('CableCar tried to connect to ActionCable but ActionCable is not defined');
    }

    this.store = store;
    this.initialize(channel, options);
  }

  initialize = (channel, options) => {
    this.channel = channel;
    this.options = options;

    const params = Object.assign({ channel }, options);

    this.subscription = ActionCable.createConsumer().subscriptions.create(params, {
      initialized: this.initialized,
      connected: this.connected,
      disconnected: this.disconnected,
      received: this.received,
      rejected: this.rejected,
    });
  }

  changeChannel = (channel, options = {}) => {
    this.unsubscribe();
    this.initialize(channel, options);
  }

  // Redux dispatch function
  dispatch = (msg) => {
    let action = typeof msg === 'object' ? msg : this.formatAction(msg);
    action = Object.assign(action, { ActionCable__flag: true });
    this.store.dispatch(action);
  }

  formatAction = msg => ({
    type: msg,
    car: this,
    channel: this.channel,
    options: this.options,
  })

  // ActionCable callback functions
  initialized = () => this.dispatch('CABLECAR_INITIALIZED')

  connected = () => this.dispatch('CABLECAR_CONNECTED')

  disconnected = () => this.dispatch('CABLECAR_DISCONNECTED')

  received = msg => this.dispatch(msg)

  rejected = () => {
    throw new Error(
      `CableCar: Attempt to connect was rejected.
      (Channel: ${this.channel})`,
    );
  }

  // ActionCable subscription functions (exposed globally)
  perform = (action, data) => this.subscription.perform(action, data)

  send = action => this.subscription.send(action)

  unsubscribe = () => {
    this.subscription.unsubscribe();
    this.disconnected();
  }
}


export default CableCar;
