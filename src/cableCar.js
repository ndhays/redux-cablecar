
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

    const defaultOptions = {
      prefix: 'RAILS',
      optimisticOnFail: false
    };
    this.initialize(channel, { ...defaultOptions, ...options });
  }

  initialize(channel, options) {

    this.channel = channel;
    this.options = options;
    this.running = false;

    let cableParams = options.params || {};
    cableParams = { channel, ...cableParams };

    // ActionCable callback functions
    this.initialized = () => this.dispatch({ type: 'CABLECAR_INITIALIZED' });
    this.connected = () => {
      this.running = true;
      this.dispatch({ type: 'CABLECAR_CONNECTED' });
      if (this.options.connected) { this.options.connected.call(); }
    };
    this.disconnected = () => {
      this.running = false;
      this.dispatch({ type: 'CABLECAR_DISCONNECTED' });
      if (this.options.disconnected) { this.options.disconnected.call(); }
    };
    this.received = (msg) => { this.dispatch(msg); };
    this.rejected = () => {
      throw new Error(
        `CableCar: Attempt to connect was rejected.
        (Channel: ${this.channel})`,
      );
    };

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

  // Redux dispatch function
  dispatch(action) {
    const newAction = { ...action,
      channel: this.channel,
      CableCar__Action: true,
    };
    this.store.dispatch(newAction);
  }

  allows(action) {
    if (typeof action !== 'object' || typeof action.type !== 'string') {
      throw new Error(`CableCar: ${action} is not a valid redux action ({ type: ... })`);
    }

    return this.matchPrefix(action.type);
  }

  matchPrefix(type) {
    let matches = false, prefixes = [].concat(this.options.prefix);
    for (let prefix of prefixes) {
      if (type.slice(0, String(prefix).length) === String(prefix)) {
        matches = true;
        break;
      }
    }
    return matches;
  }

  // ActionCable subscription functions (exposed globally)
  changeChannel(channel, options = {}) {
    this.unsubscribe();
    this.initialize(channel, { ...this.options, ...options });
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
