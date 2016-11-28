import CableCar from './cableCar'

const middleware = (channel, s) => {
  window.console.log(s)
  var car = new CableCar(channel);
  
  return store => next => action => {

    if(!car.store) {
      car.store = store;
    }
    
    if (action.type === 'CABLE_CAR_INITIALIZED') {
      car.store = store;
    } else if (action.type === 'DISCONNECT_CABLE_CAR') {
      car.unsubscribe();
    } else if (!action.__ActionCable) {
      car.send(action);
    }
    
    return (action.optimistic || action.__ActionCable ? next(action) : store.getState())

  }
};


export default middleware