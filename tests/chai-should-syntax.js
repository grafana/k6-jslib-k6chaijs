import chai, { describe } from '../dist/index.js';

chai.config.aggregateChecks = false;
chai.config.logFailures = true;

export default function testSuite() {
  let response = {
    status: (__ITER % 5) + 199
  };
  chai.should();

  var foo = 'bar';
  var beverages = { tea: ['chai', 'matcha', 'oolong'] };

  describe('Testing different values for expect', () => {
    response.status.should.be.a('number');
    foo.should.be.a('string');
    foo.should.equal('bar');
    foo.should.have.lengthOf(3);
    beverages.should.have.property('tea').with.lengthOf(3);
  });
}
