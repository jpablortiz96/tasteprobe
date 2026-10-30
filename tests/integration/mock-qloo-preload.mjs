// Test-process preload ONLY. Never imported by the app or installed as a fallback.
import assert from 'node:assert/strict';
const MOCK_KEY = 'MOCK_TEST_ONLY_NOT_A_CREDENTIAL';
assert.equal(process.env.QLOO_API_KEY, MOCK_KEY, 'This preload requires the isolated test-process credential.');
const nativeFetch = globalThis.fetch;
const id = i => `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`;
const movie = i => ({ entity_id: id(i), name: `MOCK Film ${i}`, subtype: 'urn:entity:movie', properties: { release_year: 2000 + i } });
let insights = 0;
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  if (url.hostname === '127.0.0.1' || url.hostname === 'localhost') return nativeFetch(input, init);
  // Fail closed for every other external destination: no live provider is reachable through fetch.
  assert.equal(url.origin, 'https://hackathon.api.qloo.com');
  assert.equal(init.headers['X-Api-Key'], MOCK_KEY);
  assert.equal(init.method, 'GET');
  if (url.pathname === '/search') {
    const query = url.searchParams.get('query');
    if (query === 'MOCK missing') return new Response('MOCK no results', { status: 404 });
    if (query === 'MOCK auth error') return new Response('MOCK private detail', { status: 401 });
    const number = Number(query?.match(/^MOCK ([1-4])$/)?.[1]);
    assert.ok(number >= 1 && number <= 4);
    return Response.json({ results: number === 1 ? [movie(1), movie(5)] : [movie(number)] });
  }
  assert.equal(url.pathname, '/v2/insights');
  assert.deepEqual(Object.fromEntries(url.searchParams), { 'filter.type': 'urn:entity:movie', 'signal.interests.entities': id(1), 'filter.results.entities': [id(2),id(3),id(4)].join(','), take: '3' });
  insights++;
  return Response.json({ success: true, results: { entities: insights === 1 ? [movie(4), movie(2), movie(3)] : [movie(4)] } });
};
