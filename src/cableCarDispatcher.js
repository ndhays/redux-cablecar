export default class CableCarDispatcher {

  constructor(provider) {
    let lines = {};

    this.addLine = (line, car) => { lines[line] = car; }
    this.clearAllLines = () => { lines = {}; }
    this.clearLine = (line) => { lines[line] = undefined; }
    this.getLines = () => lines;
  }

  addCar(line, car) {
    if (this.getCar(line)) {
      throw(new ReferenceError(
        'CableCar Dispatcher: cannot connect two cars to same line/channel: ' + line
      ));
    }
    this.addLine(line, car);
    return car;
  }

  changeCar(oldLine, newLine, options) {
    let car = this.getCar(oldLine);

    if (!car) {
      console.error(new ReferenceError(
        'CableCar Dispatcher (change failed): no car found on line/channel: ' + oldLine
      ));
      return false;
    }

    if (car.changeChannel) {
      car.changeChannel(newLine, options);
      this.clearLine(oldLine);
      this.addLine(newLine, car);
      return car;
    } else {
      console.error(new ReferenceError(
        'CableCar Dispatcher (change failed): car has no changeChannel function'
      ), car);
      return false;
    }
  }

  destroyCar(line) {
    let activeLine = line || this.getSingleActiveLine();

    if (!activeLine) {
      console.error(new ReferenceError(
        'CableCar Dispatcher (destroy failed): No car found on line/channel: ' + line
      ))
      return false;
    }

    let car = this.getCar(activeLine);
    if (car && car.unsubscribe) {
      car.unsubscribe();
      this.clearLine(activeLine);
      return car;
    } else {
      console.error(new ReferenceError(
        'CableCar Dispatcher (destroy failed): car has no unsubscribe function'
      ), car);
      return false;
    }
  }

  getCar(line) {
    return this.getLines()[line];
  }

  getDefaultCar() {
    let activeLine = this.getSingleActiveLine();
    return activeLine ? this.getLines()[activeLine] : undefined;
  }

  getSingleActiveLine() {
    const allLines = this.getLines();
    let activeLines = [];
    for (let line in allLines) {
      if (allLines[line]) { activeLines.push(line); }
    }
    return activeLines.length === 1 ? activeLines[0] : undefined;
  }

  reset() {
    this.clearAllLines();
  }

}
