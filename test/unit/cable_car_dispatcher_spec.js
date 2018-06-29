import { expect, spy, stub } from '../setup';
import CableCarDispatcher from '../../src/cableCarDispatcher';

describe('CableCarDispatcher', () => {

  let obj;

  beforeEach(() => {
    obj = new CableCarDispatcher();
  })

  describe('#addCar', () => {
    it('adds the car to the lines', () => {
      spy(obj, 'addLine');
      obj.addCar('line1', 'car');
      expect(obj.addLine).to.have.been.calledWith('line1', 'car');
    });
    it('throws an error when the line is already busy', () => {
      obj.addCar('line1', 'car1');
      expect(obj.addCar.bind(obj, 'line1', 'car2')).to.throw('CableCar Dispatcher: cannot connect two cars to same line/channel: line1');
    })
  });

  describe('#changeCar', () => {
    it('removes/adds the car to the lines', () => {
      let mockCar = { changeChannel: () => {} };
      spy(mockCar, 'changeChannel');
      obj.addCar('line1', mockCar)
      expect(obj.getLines().line1).to.eq(mockCar);
      expect(obj.changeCar('line1', 'line2')).to.eq(mockCar);
      expect(mockCar.changeChannel).to.have.been.calledWith('line2');
      expect(obj.getLines().line1).to.eq(undefined);
      expect(obj.getLines().line2).to.eq(mockCar);
    });
    it('returns false when no car is found on the line', () => {
      expect(obj.changeCar('line1', 'line2')).to.eq(false);
    });
    it('returns false when car does not have a changeChannel function', () => {
      obj.addCar('line1', 'car')
      expect(obj.changeCar('line1', 'line2')).to.eq(false);
    });
  });

  describe('#destroyCar', () => {
    it('removes the car from the lines', () => {
      let mockCar = { unsubscribe: () => {} };
      spy(mockCar, 'unsubscribe');
      obj.addCar('line1', mockCar);
      expect(obj.getLines().line1).to.eq(mockCar);
      expect(obj.destroyCar('line1')).to.eq(mockCar);
      expect(mockCar.unsubscribe).to.have.been.calledWith();
      expect(obj.getLines().line1).to.eq(undefined);
    });
    it('removes the default car from the lines if there is only one', () => {
      let mockCar = { unsubscribe: () => {} };
      spy(mockCar, 'unsubscribe');
      obj.addCar('line1', mockCar);
      expect(obj.getLines().line1).to.eq(mockCar);
      expect(obj.destroyCar()).to.eq(mockCar);
      expect(mockCar.unsubscribe).to.have.been.calledWith();
      expect(obj.getLines().line1).to.eq(undefined);
    });
    it('returns false when no car is found on the line', () => {
      expect(obj.destroyCar('line1')).to.eq(false);
    });
    it('returns false when car does not have an unsubscribe function', () => {
      obj.addCar('line1', {})
      expect(obj.destroyCar('line1', 'line2')).to.eq(false);
    });
  });

  describe('#getCar', () => {
    it('returns the car if it exists', () => {
      obj.addCar('line1', 'car');
      expect(obj.getCar('line1')).to.eq('car');
    });
    it('return undefined if the car does not exist', () => {
      expect(obj.getCar('line1')).to.eq(undefined);
    });
  });

  describe('#getDefaultCar', () => {
    it('returns the car if it exists', () => {
      obj.addCar('line1', 'car');
      expect(obj.getDefaultCar()).to.eq('car');
    });
    it('returns undefined if the car does not exist', () => {
      expect(obj.getDefaultCar()).to.eq(undefined);
    });
    it('returns undefined if more than one car exists', () => {
      obj.addCar('line1', 'car1');
      obj.addCar('line2', 'car2');
      expect(obj.getDefaultCar()).to.eq(undefined);
    });
  });

  describe('#reset', () => {
    it('clears all lines', () => {
      obj.addCar('line1', 'car1');
      obj.addCar('line2', 'car2');
      expect(obj.getLines().line1).to.eq('car1');
      expect(obj.getLines().line2).to.eq('car2');
      obj.reset();
      expect(obj.getLines().line1).to.eq(undefined);
      expect(obj.getLines().line2).to.eq(undefined);
    });
  });

});
