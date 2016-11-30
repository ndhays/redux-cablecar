import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';

import CableCar from '../src/cableCar';
import middleware from '../src/middleware';

chai.use(sinonChai);
const expect = chai.expect;
const spy = sinon.spy;
const stub = sinon.stub;

export { CableCar, middleware, expect, spy, stub };
