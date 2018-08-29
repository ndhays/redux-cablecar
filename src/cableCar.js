
export default class CableCar {

  constructor(cableProvider, store, channel, options = {}) {
    if (typeof cableProvider === 'undefined') {
      throw new Error(`CableCar: unknown ActionCable provider: ${cableProvider}`);
    }

    if (typeof store === 'undefined' || typeof store.dispatch === 'undefined') {
      throw new Error(`CableCar: unknown store: ${store}`);
    }

    if (typeof channel !== 'string') {
      throw new Error(`CableCar: unknown channel: ${channel}`);
    }

    this.actionCableProvider = cableProvider;
    this.store = store;

    const defaultOptions = { prefix: 'RAILS', optimisticOnFail: false };
    this.initialize(channel, Object.assign(defaultOptions, options));
  }

  initialize(channel, options) {

    this.channel = channel;
    this.options = options;
    this.running = false;

    let cableParams = options.params || {};
    cableParams = Object.assign({ channel }, cableParams);

    this.subscription = this.actionCableProvider.createConsumer(options.wsURL).subscriptions.create(
      cableParams, {
        initialized: this.initialized,
        connected: this.connected,
        disconnected: this.disconnected,
        received: this.received,
        rejected: this.rejected,
      },
    );
  }

  // ActionCable callback functions
  initialized = () => this.dispatch({ type: 'CABLECAR_INITIALIZED' });

  connected = () => {
    this.dispatch({ type: 'CABLECAR_CONNECTED' });
    this.running = true;
    if (this.options.connected) { this.options.connected.call(); }
  }

  disconnected = () => {
    this.dispatch({ type: 'CABLECAR_DISCONNECTED' });
    this.running = false;
    if (this.options.disconnected) { this.options.disconnected.call(); }
  }

  received = (msg) => {
    this.dispatch(msg);
  }

  rejected = () => {
    throw new Error(
      `CableCar: Attempt to connect was rejected.
      (Channel: ${this.channel})`,
    );
  }

  // Redux dispatch function
  dispatch(action) {
    const newAction = Object.assign(action, {
      channel: this.channel,
      CableCar__Action: true,
    });
    this.store.dispatch(newAction);
  }

  allows(action) {
    if (typeof action !== 'object' || typeof action.type !== 'string') {
      throw new Error(`CableCar: ${action} is not a valid redux action ({ type: ... })`);
    }

    return this.matchPrefix(action.type);
  }

  matchPrefix(type) {
    const prefix = type.slice(0, this.options.prefix.length);
    return prefix === this.options.prefix;
  }

  // ActionCable subscription functions (exposed globally)
  changeChannel(channel, options = {}) {
    this.unsubscribe();
    this.initialize(channel, Object.assign(this.options, options));
  }

  getChannel() {
    return this.channel;
  }

  getParams() {
    return this.options.params;
  }

  perform(method, payload) {
    this.subscription.perform(method, payload);
  }

  send(action) {
    this.subscription.send(action);
  }

  unsubscribe() {
    this.subscription.unsubscribe();
    this.disconnected();
  }
}
