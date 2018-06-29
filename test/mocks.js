
export class CableCarMock {
  constructor() {}
  changeChannel(channel, options = {}) {}
  dispatch(action) {}
  allows(action) {}
  matchPrefix(type) {}
  initialized() {}
  connected() {}
  disconnected() {}
  received(msg) {}
  rejected() {}
  perform(method, payload) {}
  send(action) {}
  unsubscribe() {}
}

export class CableCarDispatcherMock {
  constructor() {}
  addCar(line, car) {}
  destroyCar(line) {}
  getCar(line) {}
}
