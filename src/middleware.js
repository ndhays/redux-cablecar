import CableCar from './cableCar';
import CableCarDispatcher from './cableCarDispatcher';

let cableProvider;

const dispatcher = new CableCarDispatcher();

const middleware = store => next => (incomingAction) => {
  const action = incomingAction;
  let car;

  switch (action.type) {

    case 'CABLECAR_INITIALIZED':
    case 'CABLECAR_CONNECTED':
    case 'CABLECAR_DISCONNECTED':
      return next(action);

    case 'CABLECAR_DESTROY':
      dispatcher.destroyCar(action.CableCarChannel);
      return store.getState();

    case 'CABLECAR_DESTROY_ALL':
      dispatcher.reset();
      return store.getState();

    case 'CABLECAR_CHANGE_CHANNEL':
      dispatcher.changeCar(action.previousChannel, action.newChannel, action.options);
      return store.getState();

    default:
      car = action.channel ? dispatcher.getCar(action.channel) : dispatcher.getDefaultCar();
      if (car && car.allows(action) && !action.CableCar__Action) {
        if (car.running) {
          car.send(action);
        } else {
          console.error('CableCar: Dropped action!',
            'Attempting to dispatch an action but cable car is not running.',
            action,
            'optimisticOnFail: ' + car.options.optimisticOnFail
          );
          return car.options.optimisticOnFail ? next(action) : store.getState();
        }
        return action.optimistic ? next(action) : store.getState();
      } else {
        return next(action);
      }
  }
};

middleware.connect = (store, channel, options) => {
  if (!cableProvider) {
    try {
      cableProvider = require('actioncable');
    } catch(e) {
      throw new Error(`CableCar: No actionCableProvider set and 'actioncable' Node package failed to load: ${e}`);
    }
  }

  let car = new CableCar(cableProvider, store, channel, options);
  dispatcher.addCar(channel, car);

  // public car object returned
  return {
    changeChannel: car.changeChannel.bind(car),
    getChannel: car.getChannel.bind(car),
    getParams: car.getParams.bind(car),
    perform: car.perform.bind(car),
    send: car.send.bind(car),
    unsubscribe: car.unsubscribe.bind(car)
  };
}

middleware.setProvider = (newProvider) => {
  cableProvider = newProvider;
}

export default middleware;
