import { describe, expect, chai } from '../build/k6-chaijs.min.js';
import { Httpx, Get } from 'https://jslib.k6.io/httpx/0.0.4/index.js';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.0.0/index.js';

export let options = {
  thresholds: {
    checks: [{ threshold: 'rate == 1.00', abortOnFail: true }],
    http_req_failed: [{ threshold: 'rate == 0.00', abortOnFail: true }],
  },
};

let session = new Httpx();
session.setBaseUrl('https://test-api.k6.io');

export default function testSuite() {

  describe('[Crocs service] Fetch list of crocs', () => {
    let response = session.get('/public/crocodiles');

    expect(response.status, "response status").to.equal(200)
    expect(response).to.have.validJsonBody()
    expect(response.json().length, "Number of crocs").to.be.above(4)
  })
}
