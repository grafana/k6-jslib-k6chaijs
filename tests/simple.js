import http from 'k6/http';
import { describe, expect } from 'https://jslib.k6.io/k6chaijs/4.3.4.0/index.js';

export let options = {
  thresholds: {
    checks: [{ threshold: 'rate == 1.00', abortOnFail: true }],
    http_req_failed: [{ threshold: 'rate == 0.00', abortOnFail: true }],
  },
};

export default function testSuite() {

  describe('[Crocs service] Fetch list of crocs', () => {
    let response = http.get('https://test-api.k6.io/public/crocodiles');

    expect(response.status, "response status").to.equal(200)
    expect(response).to.have.validJsonBody()
    expect(response.json().length, "Number of crocs").to.be.above(4)
  })

  describe('Dummy example', () => {
    expect(10).to.be.within(8,12); // OK
    expect(42).to.equal(44); // fails
    expect(true).to.be.ok; // doesn't run because the previous assertion failed.
  });

}
