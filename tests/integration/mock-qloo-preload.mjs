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
    const number = Number(query?.match(/^MOCK ([1-6])$/)?.[1]);
    assert.ok(number >= 1 && number <= 6);
    return Response.json({ results: number === 1 ? [movie(1), movie(5)] : [movie(number)] });
  }
  assert.equal(url.pathname, '/v2/insights');
  if (url.searchParams.has('filter.exclude.entities')) {
    const params=Object.fromEntries(url.searchParams);
    assert.equal(params['filter.type'],'urn:entity:movie');assert.equal(params.take,'8');assert.equal(params['feature.explainability'],'true');
    assert.equal(params['filter.exclude.entities'],params['signal.interests.entities']);assert.equal(params['filter.results.entities'],undefined);assert.equal(Object.keys(params).length,5);
    return Response.json({results:{entities:params['signal.interests.entities']===id(6)?[]:[movie(1),{...movie(2),query:{affinity:.8,explainability:{observed:true}}},movie(2),{...movie(5),subtype:'urn:entity:artist'},movie(3)]}});
  }
  if (url.searchParams.get('feature.explainability') === 'true') {
    const params = Object.fromEntries(url.searchParams);
    assert.ok([id(1),id(5),id(6)].includes(params['signal.interests.entities']));
    assert.equal(params['filter.type'],'urn:entity:movie');
    assert.equal(params['filter.results.entities'],[id(2),id(3),id(4)].join(','));
    assert.equal(params.take,'3');
    assert.equal(Object.keys(params).length,5);
    return Response.json({ success: true, results: { entities: (params['signal.interests.entities'] === id(6) ? [4] : params['signal.interests.entities'] === id(1) ? [4,2,3] : [4,3,2]).map(i => ({ ...movie(i), query: { affinity: i/10, explainability: { verifiedFixture: true } } })) } });
  }
  assert.deepEqual(Object.fromEntries(url.searchParams), { 'filter.type': 'urn:entity:movie', 'signal.interests.entities': id(1), 'filter.results.entities': [id(2),id(3),id(4)].join(','), take: '3' });
  insights++;
  return Response.json({ success: true, results: { entities: insights === 1 ? [movie(4), movie(2), movie(3)] : [movie(4)] } });
};
