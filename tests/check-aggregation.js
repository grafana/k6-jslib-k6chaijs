import chai, { describe, expect } from '../build/k6chaijs.min.js';
import { sleep } from 'k6';

// set aggregateChecks=false to see how checks are behaving with multiple values interpolated into
// the check name (deaggregation is not recommended unless you are running 1 iteration)
chai.config.aggregateChecks = true;

// Even when checks are aggregated, you can print the full message by setting logFailures=true
chai.config.logFailures = true;

export let options = {
  iterations: 3
};

export default function testSuite() {
  let fakeResponse = {
    status: (__ITER % 5) + 199
  };

  describe('Testing check aggregation', () => {
    expect(fakeResponse.status, 'response status').to.equal(200);
  });

  sleep(1);
}
