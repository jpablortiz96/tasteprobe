import test from 'node:test';
import assert from 'node:assert/strict';
import { createService } from '../lib/qloo/service.ts';
import { body, failure } from '../lib/http.ts';

// MOCK data exists only in tests. These identities are deliberately fictional.
const MOCK_KEY = 'MOCK_TEST_ONLY_NOT_A_CREDENTIAL';
const ids = Array.from({ length: 6 }, (_, i) => `00000000-0000-4000-8000-${String(i + 1).padStart(12, '0')}`);
const entity = i => ({ entity_id: ids[i], name: `MOCK Film ${i + 1}`, subtype: 'urn:entity:movie', properties: { release_year: 2000 + i } });
function setup(options = {}) {
  const calls = [];
  const service = createService({ apiKey: MOCK_KEY, fetchImpl: async (url, init) => {
    calls.push({ url, init });
    if (url.pathname === '/search') return Response.json({ results: [entity(Number(url.searchParams.get('query').slice(-1)))] });
    return Response.json({ success: true, results: { entities: [entity(3), entity(1), entity(2)] } });
  }, ...options });
  return { service, calls };
}
async function resolve(service) {
  const selections = [];
  for (let i = 0; i < 4; i++) {
    const { entities } = await service.search({ query: `MOCK${i}` });
    selections.push({ id: entities[0].id, proof: entities[0].proof, confirmed: true });
  }
  return { interests: selections.slice(0, 1), recommendations: selections.slice(1) };
}
test('service without credential abstains and makes zero calls', async () => {
  let calls = 0;
  const service = createService({ fetchImpl: async () => { calls++; throw Error(); } });
  assert.deepEqual(service.health(), { status: 'BLOCKED_LIVE', liveVerified: false });
  await assert.rejects(service.search({ query: 'MOCK' }), { category: 'BLOCKED_LIVE' });
  assert.equal(calls, 0);
});
test('MOCK full flow preserves original order, compares returned order, and never invents affinity', async () => {
  const { service, calls } = setup();
  const input = await resolve(service);
  const result = await service.audit(input);
  assert.equal(result.status, 'SUCCESS');
  assert.deepEqual(result.rows.map(r => r.qlooRank), [2, 3, 1]);
  assert.deepEqual(result.rows.map(r => r.shift), [-1, -1, 2]);
  assert.ok(result.rows.every(r => r.affinity === null));
  assert.deepEqual(result.coverage, { returned: 3, total: 3 });
  assert.equal(calls.length, 5);
  assert.equal(calls[4].url.pathname, '/v2/insights');
  assert.deepEqual(Object.fromEntries(calls[4].url.searchParams), { 'filter.type': 'urn:entity:movie', 'signal.interests.entities': ids[0], 'filter.results.entities': ids.slice(1,4).join(','), take: '3' });
  assert.equal(result.provenance.source, 'Qloo REST');
  assert.equal(result.identities.length, 4);
  assert.ok(!JSON.stringify(result).includes(MOCK_KEY));
  assert.ok(!JSON.stringify(result).includes('proof'));
});
test('strict search validation rejects unsupported fields, control characters, size, and wrong types before network', async () => {
  const { service, calls } = setup();
  for (const input of [null, [], {}, { query: '' }, { query: 'x' }, { query: 'x'.repeat(81) }, { query: 'a\nb' }, { query: '<script>' }, { query: 123 }, { query: 'MOCK', endpoint: 'https://example.org' }]) await assert.rejects(service.search(input), { category: 'INVALID_INPUT' });
  assert.equal(calls.length, 0);
});
test('MOCK Search returns ambiguous choices without selecting them and filters non-movies', async () => {
  const { service } = setup({ fetchImpl: async () => Response.json({ results: [entity(0), entity(1), { entity_id: ids[5], name: 'MOCK Band', subtype: 'urn:entity:artist' }] }) });
  const result = await service.search({ query: 'MOCK ambiguous' });
  assert.equal(result.entities.length, 2);
  assert.equal(result.entities[0].year, 2000);
  assert.equal(result.selected, undefined);
});
test('MOCK empty Search is empty evidence', async () => {
  const { service } = setup({ fetchImpl: async () => Response.json({ results: [] }) });
  assert.deepEqual((await service.search({ query: 'MOCK' })).entities, []);
});
test('unconfirmed, fabricated, edited, expired, or duplicate identities cannot reach Insights', async () => {
  let clock = 1_800_000;
  const { service, calls } = setup({ now: () => clock });
  const input = await resolve(service);
  for (const change of [x => { x.interests[0].confirmed = false; }, x => { x.interests[0].proof += 'x'; }, x => { x.interests[0].id = ids[5]; }, x => { x.interests[0].proof = 'fake'; }]) {
    const clone = structuredClone(input); change(clone);
    await assert.rejects(service.audit(clone), error => ['IDENTITY_REQUIRED', 'IDENTITY_EXPIRED'].includes(error.category));
  }
  await assert.rejects(service.audit({ ...input, recommendations: [input.interests[0], ...input.recommendations.slice(1)] }), { category: 'DUPLICATE_ENTITY' });
  clock += 30 * 60_000;
  await assert.rejects(service.audit(input), { category: 'IDENTITY_EXPIRED' });
  assert.equal(calls.length, 4);
});
test('identity proofs from a different server session are rejected', async () => {
  const a = setup(), b = setup();
  await assert.rejects(b.service.audit(await resolve(a.service)), { category: 'IDENTITY_REQUIRED' });
  assert.equal(b.calls.length, 0);
});
test('audit list boundaries and unexpected input fields are rejected', async () => {
  const { service, calls } = setup();
  for (const input of [null, {}, { interests: [], recommendations: [] }, { interests: [1,2,3,4], recommendations: [1,2,3] }, { interests: [1], recommendations: [1,2] }, { interests: [1], recommendations: [1,2,3], key: 'bad' }]) await assert.rejects(service.audit(input), { category: 'INVALID_INPUT' });
  assert.equal(calls.length, 0);
});
for (const count of [0, 1, 2]) test(`MOCK partial coverage ${count}/3 abstains from revised ranking and uses null for missing evidence`, async () => {
  let insights = false;
  const base = setup({ fetchImpl: async url => url.pathname === '/search' ? Response.json({ results: [entity(Number(url.searchParams.get('query').slice(-1)))] }) : (insights = true, Response.json({ results: { entities: [entity(3), entity(1)].slice(0,count) } })) });
  const result = await base.service.audit(await resolve(base.service));
  assert.equal(insights, true);
  assert.equal(result.status, 'INSUFFICIENT_EVIDENCE');
  assert.equal(result.coverage.returned, count);
  assert.ok(result.rows.every(r => r.shift === null && r.affinity === null));
  assert.equal(result.rows.filter(r => r.qlooRank === null).length, 3 - count);
});
for (const response of [{}, { success: false, results: { entities: [] } }, { results: { entities: [entity(5)] } }, { results: { entities: [entity(1), entity(1)] } }, { results: { entities: [{ ...entity(1), subtype: 'urn:entity:artist' }] } }]) test('MOCK malformed, unrelated, duplicate, or wrong-domain Insights is rejected', async () => {
  const { service } = setup({ fetchImpl: async url => Response.json(url.pathname === '/search' ? { results: [entity(Number(url.searchParams.get('query').slice(-1)))] } : response) });
  await assert.rejects(service.audit(await resolve(service)), { category: 'INVALID_RESPONSE' });
});
test('shared request budgets survive client recreation and cap the process at 60 calls', async () => {
  let clock = 0, calls = 0;
  const { service } = setup({ now: () => clock, fetchImpl: async () => { calls++; return Response.json({ results: [] }); } });
  for (let round = 0; round < 5; round++) {
    for (let i = 0; i < 12; i++) await service.search({ query: 'MOCK' });
    await assert.rejects(service.search({ query: 'MOCK' }), { category: 'REQUEST_BUDGET' });
    clock += 60_001;
  }
  await assert.rejects(service.search({ query: 'MOCK' }), { category: 'REQUEST_BUDGET' });
  assert.equal(calls, 60);
});
test('HTTP input bounds, content type, origin and malformed JSON are enforced', async () => {
  const request = (text, headers = {}) => new Request('http://127.0.0.1/api/audit', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: text });
  assert.deepEqual(await body(request('{"query":"MOCK"}')), { query: 'MOCK' });
  for (const r of [request('{'), request('x'.repeat(8193)), request('{}', { 'Content-Type': 'text/plain' }), request('{}', { Origin: 'https://evil.example' })]) await assert.rejects(body(r));
  const safe = failure(new Error(MOCK_KEY));
  assert.equal(safe.status, 502);
  assert.equal(safe.headers.get('cache-control'), 'no-store');
  assert.ok(!(await safe.text()).includes(MOCK_KEY));
});
