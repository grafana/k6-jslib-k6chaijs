# k6Chaijs - ChaiJS Assertion Library for k6.io

This is a [chaijs](https://www.chaijs.com/) library with a few modifications to make it runnable in k6.

Chai API docs: https://www.chaijs.com/api/bdd/

API docs: https://grafana.com/docs/k6/latest/javascript-api/jslib/k6chaijs

Download from: https://jslib.k6.io/

## Example

```js
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

```

![CLI screenshot](./CLI-screenshot.png)

## Installation

### Option 1: Import directly from jslib

Per the example above, you can import and use this plugin directly from jslib within your k6 code:

```js
import { describe, expect } from 'https://jslib.k6.io/k6chaijs/4.3.4.0/index.js';
```

TypeScript type definitions are not currently available when using this import method.

### Option 2: Install locally in your project

The `export` directory contains files you can copy directly into your k6 project and then import the Chai functions from there. This includes TypeScript type definitions. The Chai dependency is bundled into both the JavaScript bundle and the TypeScript types, so you do not need to install any additional dependencies.

To use, simply import from wherever you placed them in your project:

```ts
import {
  default as chai,
  describe,
  expect,
} from '/plugins/k6chaijs/index.js';
```

All exports are typed. The JavaScript bundle is not minified as this is unnecessary for local installation.

## Development


### Build
```
npm install
npm run-script build
```

### Export for local installation

```
npm install
npm run export
```

This will:
1. Use `tsup` to build the JavaScript bundle and types for the plugin
2. Rename exported types to `temp.d.ts` (this will be deleted later)
3. Use `dts-bundle-generator` to combine the plugin types with Chai's types into `index.d.ts`
   - This runs with `--no-check` as there are currently some type errors
4. Delete `temp.d.ts`

### Deploy new version
1. Build & export for local installation.
2. Use the `./build/k6chaijs.min.js` to make a PR to [jslib.k6.io](https://github.com/grafana/jslib.k6.io).
3. Release version should follow the chaijs version. Currently `4.3.4.0`.
