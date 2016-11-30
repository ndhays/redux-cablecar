import CableCar from './CableCar';

let car;
let connected = false;

const middleware = store => next => (action) => {
  switch (action.type) {
    case 'CABLECAR_INITIALIZED':
      car = action.car;
      break;
    case 'CABLECAR_CONNECTED':
      connected = true;
      break;
    case 'CABLECAR_DISCONNECTED':
      connected = false;
      break;
    case 'CABLECAR_DISCONNECT':
      car.unsubscribe();
      car = null;
      break;
    case 'CABLECAR_CHANGE_CHANNEL':
      car.changeChannel(action.channel, action.options || {});
      break;
    default:
      break;
  }

  if (connected && !action.ActionCable__flag) {
    car.send(action);
  }

  return (action.optimistic || action.ActionCable__flag ? next(action) : store.getState());
};

middleware.connect = (store, channel, options) => new CableCar(store, channel, options);


export default middleware;
