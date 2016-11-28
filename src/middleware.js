import CableCar from './cableCar'

const middleware = store => {
  
  var car;
  
  return next => action => {

    if (action.type === 'CABLE_CAR_INITIALIZED') {
      car = action.car;
    } else if (action.type === 'DISCONNECT_CABLE_CAR') {
      car.unsubscribe();
    } else if (!action.__ActionCable) {
      car.send(action);
    }
  
    return (action.optimistic || action.__ActionCable ? next(action) : store.getState())

  }
};

middleware.connect = (store, channel, options) => new CableCar(store, channel, options)


export default middleware