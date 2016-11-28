class CableCar {

  constructor(channel) {

    if (typeof ActionCable == 'undefined') {
      throw(`CableCar tried to connect to ActionCable but ActionCable is not defined`);
    }

    this.channel = channel;
    this.store = null;
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
  
  dispatch = (msg) => (this.store ? this.store.dispatch(Object.assign(msg, {__ActionCable: true})) : false) 

  // ActionCable callback functions
  initialized = () => this.dispatch({ type: 'CABLE_CAR_INITIALIZED' })
  
  connected = () => this.dispatch({ type: 'CABLE_CAR_CONNECTED' })
  
  disconnected = () => this.dispatch({ type: 'CABLE_CAR_DISCONNECTED' })
  
  received = (msg) => this.dispatch(msg)
  
  rejected = (data) => {
    throw(`Attempt to connect Redux store and ActionCable channel via CableCar failed. ${data}`)
  }
  
  // ActionCable subscription functions
  perform = (action, data) => {
    this.subscription.perform(action, data);
  }
  
  send = (action) => this.subscription.send(action)
  
  unsubscribe = () => {
    this.subscription.unsubscribe();
  }
}


export default CableCar