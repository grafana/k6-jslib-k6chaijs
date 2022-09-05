import { describe, expect } from '../build/k6chaijs.min.js';
import { Httpx, Get } from 'https://jslib.k6.io/httpx/0.0.4/index.js';
import { randomString } from 'https://jslib.k6.io/k6-utils/1.0.0/index.js';

export let options = {
  thresholds: {
    // fail the test if any checks fail or any requests fail
    checks: [{ threshold: 'rate == 1.00', abortOnFail: true }],
    http_req_failed: [{ threshold: 'rate == 0.00', abortOnFail: true }]
  },
  vus: 100,
  iterations: 100
};

let session = new Httpx();
session.setBaseUrl('https://test-api.k6.io');

function validateContractsPublicCrocodileService() {
  describe('[Crocs service] Fetch public crocs', () => {
    let responses = session.batch([
      new Get('/public/crocodiles/1/'),
      new Get('/public/crocodiles/2/')
    ]);

    responses.forEach((response) => {
      expect(response.status, 'response status').to.equal(200);
      expect(response, 'My response 1').to.have.validJsonBody();
      // expect(response.json(), "Croc API schema").to.matchSchema(crocodileAPIContract)
    });
  });

  describe('[Crocs service] Fetch list of crocs', () => {
    let response = session.get('/public/crocodiles');

    expect(response.status, 'response status').to.equal(200);
    expect(response).to.have.validJsonBody();
    // expect(response.json(), "Croc List schema").to.matchSchema(crocodileListAPIcontract)
  });
}

function validateAuthService() {
  const USERNAME = `${randomString(10)}@example.com`;
  const PASSWORD = 'superCroc2021';

  describe('[Registration service] user registration', () => {
    let sampleUser = {
      username: USERNAME,
      password: PASSWORD,
      email: USERNAME,
      first_name: 'John',
      last_name: 'Smith'
    };

    let response = session.post(`/user/register/`, sampleUser);

    expect(response.status, 'status').to.equal(201);
    expect(response).to.have.validJsonBody();
  });

  describe('[Auth service] user authentication', () => {
    let authData = {
      username: USERNAME,
      password: PASSWORD
    };

    let resp = session.post(`/auth/token/login/`, authData);

    expect(resp.status, 'Auth status').to.be.within(200, 204);
    expect(resp).to.have.validJsonBody();
    expect(resp.json('access'), 'auth token').anonymize().to.be.a('string');

    let authToken = resp.json('access');
    // set the authorization header on the session for the subsequent requests.
    session.addHeader('Authorization', `Bearer ${authToken}`);
  });
}

function validateContractCreateCrocodileService() {
  // authentication happened before this call.

  describe('[Croc service] Create a new crocodile', () => {
    let payload = {
      name: `Croc Name`,
      sex: 'M',
      date_of_birth: '2019-01-01'
    };

    let resp = session.post(`/my/crocodiles/`, payload);

    expect(resp.status, 'Croc creation status').to.equal(201);
    expect(resp).to.have.validJsonBody();

    session.newCrocId = resp.json('id'); // caching croc ID for the future.
  });

  describe('[Croc service] Fetch private crocs', () => {
    let response = session.get('/my/crocodiles/');

    expect(response.status, 'response status').to.equal(200);
    expect(response).to.have.validJsonBody();
    expect(response.json().length, 'number of crocs').to.equal(1);
  });
}

export default function testSuite() {
  validateContractsPublicCrocodileService();
  validateAuthService();
  validateContractCreateCrocodileService();
}
