import CableCar from './cableCar'

const middleware = (channel) => {
  
  var car;
  
  return store => next => action => {
    if(!car) {
      new CableCar(channel, store);
    }
    
    if (action.type === 'CABLE_CAR_INITIALIZED') {
      car = action.car;
    }
  
    if (car && !action.__ActionCable) {
      car.send(action);
    } else if (car && action.type === 'DISCONNECT_CABLE_CAR') {
      car.unsubscribe();
    } 

    return next(action)
  }
};


export default middleware