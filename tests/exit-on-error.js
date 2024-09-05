import chai, { describe, expect } from '../build/k6chaijs.min.js';
import { sleep } from 'k6';

// Set exitOnError=true to exit k6 on the first failed check.
chai.config.exitOnError = true;

export let options = {
  iterations: 3
};

export default function testSuite() {
  let fakeResponse = {
    status: 401
  };

  describe('Testing check aggregation', () => {
    expect(fakeResponse.status, 'response status').to.equal(200);
  });

  sleep(1);
}
