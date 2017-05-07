import CableCar from './cableCar';

let car;
let connected = false;

const middleware = store => next => (incomingAction) => {
  const action = incomingAction;

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
    case 'CABLECAR_DESTROY':
      car.unsubscribe();
      car = null;
      action.CableCar__Action = true;
      break;
    case 'CABLECAR_CHANGE_CHANNEL':
      car.changeChannel(action.channel, action.options || {});
      action.CableCar__Action = true;
      break;
    default:
      break;
  }

  if (car && car.prefixMatches(action) && connected &&
      (action.CableCar__Action === undefined)) {
    car.send(action);
  }

  const propagate = action.CableCarOptimistic || action.CableCar__Action ||
    !car || !car.prefixMatches(action);

  return (propagate ? next(action) : store.getState());
};

middleware.connect = (store, channel, options) => new CableCar(store, channel, options);

export default middleware;
