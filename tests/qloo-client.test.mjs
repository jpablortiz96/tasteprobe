import test from 'node:test';
import assert from 'node:assert/strict';
import { createQlooClient } from '../lib/qloo/client.mjs';

// MOCK transport only: isolated local tests, never imported by the app/experiment.
const MOCK_KEY = 'MOCK_TEST_ONLY_NOT_A_CREDENTIAL';
test('missing key abstains without making a network request', async () => {
  let called = false;
  const client = createQlooClient({ fetchImpl: async () => { called = true; } });
  await assert.rejects(client.get('/search', { query: 'Arrival' }), { category: 'BLOCKED_LIVE' });
  assert.equal(called, false);
});
test('rejects alternate hosts before exposing credentials', () => {
  assert.throws(() => createQlooClient({ apiKey: MOCK_KEY, baseUrl: 'https://example.com' }), { category: 'UNAPPROVED_HOST' });
});
test('MOCK transport verifies GET, exact host, header, and encoded search', async () => {
  const client = createQlooClient({ apiKey: MOCK_KEY, fetchImpl: async (url, options) => {
    assert.equal(url.origin, 'https://hackathon.api.qloo.com');
    assert.equal(url.pathname, '/search');
    assert.equal(url.searchParams.get('query'), 'Arrival & Her');
    assert.equal(options.method, 'GET');
    assert.equal(options.headers['X-Api-Key'], MOCK_KEY);
    assert.equal(options.redirect, 'error');
    return Response.json({ results: [] });
  }});
  assert.deepEqual(await client.get('/search', { query: 'Arrival & Her' }), { status: 200, data: { results: [] } });
});
for (const [status, category] of [[401, 'AUTH'], [403, 'AUTH'], [429, 'RATE_LIMIT'], [500, 'UPSTREAM'], [400, 'REQUEST_REJECTED']]) {
  test(`MOCK HTTP ${status} abstains, redacts upstream text, and never retries`, async () => {
    let calls = 0;
    const client = createQlooClient({ apiKey: MOCK_KEY, fetchImpl: async () => { calls++; return new Response(MOCK_KEY, { status }); } });
    await assert.rejects(client.get('/search', {}), error => error.category === category && error.status === status && !error.message.includes(MOCK_KEY));
    assert.equal(calls, 1);
  });
}
for (const [name, category] of [['TimeoutError', 'TIMEOUT'], ['TypeError', 'NETWORK']]) {
  test(`MOCK ${name} becomes safe ${category}`, async () => {
    const client = createQlooClient({ apiKey: MOCK_KEY, fetchImpl: async () => { throw new DOMException(MOCK_KEY, name); } });
    await assert.rejects(client.get('/search', {}), { category });
  });
}
test('MOCK malformed JSON is rejected', async () => {
  const client = createQlooClient({ apiKey: MOCK_KEY, fetchImpl: async () => new Response('not-json') });
  await assert.rejects(client.get('/search', {}), { category: 'INVALID_RESPONSE' });
});
test('MOCK response size is bounded', async () => {
  const client = createQlooClient({ apiKey: MOCK_KEY, fetchImpl: async () => new Response('x'.repeat(512001)) });
  await assert.rejects(client.get('/search', {}), { category: 'RESPONSE_TOO_LARGE' });
});
test('MOCK request budget stops at six and obsolete paths are rejected', async () => {
  let calls = 0;
  const client = createQlooClient({ apiKey: MOCK_KEY, fetchImpl: async () => { calls++; return Response.json({}); } });
  await assert.rejects(client.get('/recommendations', {}), { category: 'INVALID_PATH' });
  for (let i = 0; i < 6; i++) await client.get('/search', {});
  await assert.rejects(client.get('/search', {}), { category: 'REQUEST_BUDGET' });
  assert.equal(calls, 6);
});
