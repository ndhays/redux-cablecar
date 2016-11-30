import CableCar from './cableCar';

let car;

const middleware = store => next => (action) => {
  switch (action.type) {
    case 'CABLE_CAR_INITIALIZED':
      car = action.car;
      break;
    // case 'CABLE_CAR_CONNECTED':
    //   break;
    case 'CABLE_CAR_DISCONNECTED':
      car = null;
      break;
    case 'CABLE_CAR_DISCONNECT':
      car.unsubscribe();
      car.disconnected();
      break;
    case 'CABLE_CAR_CHANGE_CHANNEL':
      car.changeChannel(action.channel, action.options || {});
      break;
    default:
      break;
  }

  if (car && !action.ActionCable__flag) {
    car.send(action);
  }

  return (action.optimistic || action.ActionCable__flag ? next(action) : store.getState());
};

middleware.connect = (store, channel, options) => new CableCar(store, channel, options);


export default middleware;
