class CableCar {

  constructor(store, channel, options = {}) {

    if (typeof ActionCable == 'undefined') {
      throw(`CableCar tried to connect to ActionCable but ActionCable is not defined`);
    }

    this.params = Object.assign({ channel }, options);
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
  
  changeChannel = (channel, options = {}) => {
    this.subscription.unsubscribe();
    this.params = Object.assign({ channel }, options);
    this.subscription = this.initialize(this.params)
  }
  
  // Redux dispatch function
  dispatch = (msg) => this.store.dispatch(Object.assign(msg, {__ActionCable: true}))

  // ActionCable callback functions
  initialized = () => this.dispatch({ type: 'CABLE_CAR', msg: 'INITIALIZED', car: this })
  
  connected = () => this.dispatch({ type: 'CABLE_CAR', msg: 'CONNECTED' })
  
  disconnected = () => this.dispatch({ type: 'CABLE_CAR', msg: 'DISCONNECTED' })
  
  received = (msg) => this.dispatch(msg)
  
  rejected = (data) => {
    throw(`Attempt to connect Redux store and ActionCable channel via CableCar failed. ${data}`)
  }
  
  // ActionCable subscription functions
  perform = (action, data) => this.subscription.perform(action, data)
  
  send = (action) => this.subscription.send(action)
  
  unsubscribe = () => this.subscription.unsubscribe()

}


export default CableCar