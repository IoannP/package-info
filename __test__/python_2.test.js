// @ts-nocheck
const {
  before,
  after,
  describe,
  test,
} = require('mocha');
const assert = require('assert');
const nock = require('nock');

const fixtures = require('../__fixtures__');
const getPackageInfo = require('../src/index');

let source;

before(async () => {
  source = nock('https://pypi.org/pypi').persist();
});

describe('Test python 1', () => {
  const { data, expected: expectedData } = fixtures.python;

  test('Get package info', async () => {
    for (const { input, packageName } of data.matches) {
      source.get(`/${packageName}/json`).reply(200, data.packages[packageName]);
      const expected = expectedData[packageName];
      const result = await getPackageInfo(input, 'python');
      assert.strictEqual(result.value, expected);
    }
  });
});

after(async () => nock.cleanAll());