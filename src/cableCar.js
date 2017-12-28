/* global ActionCable */

export default class CableCar {

  constructor(store, channel, options = {}) {
    if (typeof ActionCable === 'undefined') {
      throw new Error('CableCar tried to connect to ActionCable but ActionCable is not defined');
    }

    if (typeof channel !== 'string') {
      throw new Error(`CableCar: unknown channel: ${channel}`);
    }

    this.store = store;

    this.initialize(channel, options);
  }

  initialize = (channel, options) => {
    this.channel = channel;
    this.options = options;
    if (typeof this.options.prefix === 'undefined') {
      this.options.prefix = 'CABLECAR';
    }

    let params = options.params || {};
    params = Object.assign({ channel }, params);

    this.subscription = ActionCable.createConsumer(options.wsURL).subscriptions.create(
      params, {
        initialized: this.initialized,
        connected: this.connected,
        disconnected: this.disconnected,
        received: this.received,
        rejected: this.rejected,
      },
    );
  }

  changeChannel = (channel, options = {}) => {
    this.unsubscribe();
    const newOptions = options;
    if (typeof newOptions.prefix === 'undefined') {
      newOptions.prefix = this.options.prefix;
    }
    this.initialize(channel, newOptions);
  }

  // Redux dispatch function
  dispatch = (msg) => {
    let action = typeof msg === 'object' ? msg : this.formatAction(msg);
    action = Object.assign(action, { CableCar__Action: true });
    this.store.dispatch(action);
  }

  formatAction = msg => ({
    type: msg,
    car: this,
    channel: this.channel,
    options: this.options,
  })

  prefixMatches = (action = {}) => {
    if (typeof action === 'object' && typeof action.type === 'string') {
      const actionPrefix = action.type.slice(0, this.options.prefix.length);
      return actionPrefix === this.options.prefix;
    }
    throw new Error(`CableCar: ${action} is not a valid redux action`);
  }

  // ActionCable callback functions
  initialized = () => this.dispatch('CABLECAR_INITIALIZED')

  connected = () => {
    this.dispatch('CABLECAR_CONNECTED');
    if (this.options.connected) { this.options.connected.call(); }
  }

  disconnected = () => {
    this.dispatch('CABLECAR_DISCONNECTED');
    if (this.options.disconnected) { this.options.disconnected.call(); }
  }

  received = msg => this.dispatch(msg)

  rejected = () => {
    throw new Error(
      `CableCar: Attempt to connect was rejected.
      (Channel: ${this.channel})`,
    );
  }

  // ActionCable subscription functions (exposed globally)
  perform = (method, payload) => this.subscription.perform(method, payload)

  send = action => this.subscription.send(action)

  unsubscribe = () => {
    this.subscription.unsubscribe();
    this.disconnected();
  }
}
