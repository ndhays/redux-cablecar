class CableCar {

  constructor(store, channel, options = {}) {

    if (typeof ActionCable == 'undefined') {
      throw(`CableCar tried to connect to ActionCable but ActionCable is not defined`);
    }

    this.params = Object.assign({ channel: channel }, options);
    this.store = store;
    this.subscription = this.initialize(this.params);
  }

  initialize = (params) => 
    
    ActionCable.createConsumer().subscriptions.create(params, {
      initialized: this.initialized,
      connected: this.connected,
      disconnected: this.disconnected,
      received: this.received,
      rejected: this.rejected,
    })
  
  // Redux dispatch function
  dispatch = (msg) => this.store.dispatch(Object.assign(msg, {__ActionCable: true}))

  // ActionCable callback functions
  initialized = () => this.dispatch({ type: 'CABLE_CAR_INITIALIZED', car: this })
  
  connected = () => this.dispatch({ type: 'CABLE_CAR_CONNECTED' })
  
  disconnected = () => this.dispatch({ type: 'CABLE_CAR_DISCONNECTED' })
  
  received = (msg) => this.dispatch(msg)
  
  rejected = (data) => {
    this.dispatch({ type: 'CABLE_CAR_REJECTED' });
    throw(`Attempt to connect Redux store and ActionCable channel via CableCar failed. ${data}`)
  }
  
  // ActionCable subscription functions
  perform = (action, data) => this.subscription.perform(action, data)
  
  send = (action) => this.subscription.send(action)
  
  unsubscribe = () => this.subscription.unsubscribe()

}


export default CableCar