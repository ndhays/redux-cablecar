class CableCar {

  constructor(channel, store) {

    if (typeof ActionCable == 'undefined') {
      throw(`CableCar tried to connect to ActionCable but ActionCable is not defined`);
    }

    this.connected = false;
    this.channel = channel;
    this.store = store;
    this.initialize();
  }

  initialize() {
    this.subscription = ActionCable.createConsumer().subscriptions.create({ channel: this.channel }, {
      initialized: this.initialized,
      connected: this.connected,
      disconnected: this.disconnected,
      received: this.received,
      rejected: this.rejected,
    });
  }
  
  connectStore = (store) => {
    this.dispatch = store.dispatch;
  }

  initialized = () => {
    this.dispatch({ type: 'CABLE_CAR_INITIALIZED', car: this });
  }
  
  connected = () => {
    this.connected = true;
    this.dispatch({ type: 'CABLE_CAR_CONNECTED', car: this });
  }
  
  disconnected = () => {
    this.connected = false;
    this.dispatch({ type: 'CABLE_CAR_DISCONNECTED', car: this });
  }
  
  received = (msg) => {
    this.dispatch(Object.assign(msg, {__ActionCable: true}));
  }
  
  rejected = (data) => {
    throw(`Attempt to connect Redux store and ActionCable channel via CableCar failed. ${data}`)
  }
  
  
  perform = (action, data) => {
    this.subscription.perform(action, data);
  }
  
  send = (action) => {
    return (this.connected ? this.subscription.send(action) : false)
  }
  
  unsubscribe = () => {
    this.subscription.unsubscribe();
  }
}


export default CableCar