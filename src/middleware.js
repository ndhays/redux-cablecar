import CableCar from './cableCar'

const middleware = store => {
  
  var car;
  
  return next => action => {

    if (action.type === 'CABLE_CAR') {
      
      switch (action.msg) {
        case 'INITIALIZED':
          car = action.car;
          break;
        case 'CONNECTED':
          break;
        case 'DISCONNECTED':
          car = null;
          break;
        case 'DISCONNECT':
          car.unsubscribe();
          break;
        case 'CHANGE_CHANNEL':
          car.changeChannel(action.channel, action.options || {});
          break;
      }
      
    } else if (car && !action.__ActionCable) {
      car.send(action);
    }
  
    return (action.optimistic || action.__ActionCable ? next(action) : store.getState())

  }
};

middleware.connect = (store, channel, options) => new CableCar(store, channel, options)


export default middleware