import test from 'node:test';
import assert from 'node:assert/strict';
import { requestJson } from '../lib/browser-request.ts';
import { createService } from '../lib/qloo/service.ts';

test('MOCK documented Search 404 becomes empty choices with actual HTTP provenance', async () => {
  const service = createService({ apiKey: 'MOCK_TEST_ONLY_NOT_A_CREDENTIAL', fetchImpl: async () => new Response('MOCK no results', { status: 404 }) });
  const result = await service.search({ query: 'MOCK unknown title' });
  assert.deepEqual(result.entities, []);
  assert.equal(result.provenance.httpStatus, 404);
  assert.equal(result.provenance.endpoint, '/search');
});
test('MOCK browser network failure is actionable and does not expose exception details', async () => {
  await assert.rejects(requestJson('/api/health', undefined, async () => { throw new TypeError('private network diagnostics'); }), { message: 'NETWORK' });
});
test('MOCK browser timeout is distinguished from connectivity failure', async () => {
  await assert.rejects(requestJson('/api/health', undefined, async () => { throw new DOMException('MOCK timeout', 'TimeoutError'); }), { message: 'TIMEOUT' });
});
test('MOCK malformed response and unrecognized remote messages never become raw UI text', async () => {
  await assert.rejects(requestJson('/api/health', undefined, async () => new Response('<html>proxy error</html>', { status: 502 })), { message: 'INVALID_RESPONSE' });
  await assert.rejects(requestJson('/api/health', undefined, async () => Response.json({ error: 'arbitrary upstream text' }, { status: 502 })), { message: 'UNAVAILABLE' });
});
test('readiness can be retried after failure without a live Qloo probe', async () => {
  let attempts = 0;
  const MOCK = async (path, init) => {
    attempts++;
    assert.equal(path, '/api/health'); assert.equal(init.method, 'GET'); assert.equal(init.cache, 'no-store');
    assert.ok(init.signal instanceof AbortSignal);
    if (attempts === 1) throw Error('MOCK offline');
    return Response.json({ status: 'BLOCKED_LIVE', liveVerified: false });
  };
  await assert.rejects(requestJson('/api/health', undefined, MOCK));
  assert.deepEqual(await requestJson('/api/health', undefined, MOCK), { status: 'BLOCKED_LIVE', liveVerified: false });
  assert.equal(attempts, 2);
});
test('MOCK Insights 404 remains an error rather than being interpreted as empty Search evidence', async () => {
  const service = createService({ apiKey: 'MOCK_TEST_ONLY_NOT_A_CREDENTIAL', fetchImpl: async url => {
    if (url.pathname === '/v2/insights') return new Response('MOCK unknown Insights endpoint', { status: 404 });
    const i = Number(url.searchParams.get('query').slice(-1));
    return Response.json({ results: [{ entity_id: `00000000-0000-4000-8000-${String(i).padStart(12,'0')}`, name: `MOCK ${i}`, subtype: 'urn:entity:movie' }] });
  } });
  const selections = [];
  for (let i = 1; i <= 4; i++) {
    const entity = (await service.search({ query: `MOCK ${i}` })).entities[0];
    selections.push({ id: entity.id, proof: entity.proof, confirmed: true });
  }
  await assert.rejects(service.audit({ interests: selections.slice(0,1), recommendations: selections.slice(1) }), { category: 'REQUEST_REJECTED', status: 404 });
});
