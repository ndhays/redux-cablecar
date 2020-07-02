import chai from 'chai';
import sinonChai from 'sinon-chai';
import sinon from 'sinon';

chai.use(sinonChai);
const expect = chai.expect;
const spy = sinon.spy;
const stub = sinon.stub;

export { expect, spy, stub };

console.error = () => {};

global.window = {}; // for 'actioncable'
