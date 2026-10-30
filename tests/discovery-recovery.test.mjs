import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createService } from '../lib/qloo/service.ts';
import { requestJson, requestDiagnostic } from '../lib/browser-request.ts';
import { productError } from '../lib/product-errors.ts';
import { createSyntheticRequest,syntheticDiscovery } from '../lib/synthetic-review.ts';
import { discoveryPassport } from '../lib/discovery-report.ts';
test('historical response contract replays offline through validator and browser JSON without weakening IDs',async()=>{
  const historical=JSON.parse(await readFile('evidence/gate2c1-http-live.json','utf8')).discovery;
  // Public history uses hashes, not usable provider identities. Explicit synthetic UUID mapping for TEST ONLY.
  const uuid=n=>`00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
  const signal={entity_id:uuid(1),name:'SYNTHETIC historical signal',subtype:'urn:entity:movie',properties:{release_year:2016}};
  const service=createService({apiKey:'SYNTHETIC_TEST_ONLY',fetchImpl:async url=>Response.json(url.pathname==='/search'?{results:[signal]}:{results:{entities:historical.movies.map((m,i)=>({entity_id:uuid(i+2),name:m.name,subtype:m.type,properties:{release_year:m.year},query:{...(m.affinity===null?{}:{affinity:m.affinity})}}))}})});
  const e=(await service.search({query:'SYNTHETIC'})).entities[0];
  const result=await service.discover({interests:[{id:e.id,proof:e.proof,confirmed:true}]});
  const client=await requestJson('/api/discover',{},async()=>Response.json(result));
  assert.equal(client.returned,8);assert.deepEqual(client.movies.map(m=>m.affinity),historical.movies.map(m=>m.affinity));assert.ok(client.movies.every(m=>m.explainability===null&&m.id!==e.id));assert.equal(client.provenance.endpoint,'/v2/insights');assert.ok(!JSON.stringify(client).includes('"proof":'));
});
test('local application errors remain distinct from provider HTTP, malformed JSON and identity errors',async()=>{
  for(const [raw,code,layer]of [['INTERNAL_ERROR','INTERNAL_ERROR','application'],['AUTH','AUTH_ERROR','qloo-http'],['UPSTREAM','UPSTREAM_ERROR','qloo-http'],['IDENTITY_REQUIRED','IDENTITY_ERROR','identity-validation'],['RATE_LIMIT','RATE_LIMIT','qloo-http']]){
    try{await requestJson('/api/discover',{},async()=>Response.json({error:raw},{status:502}));assert.fail();}catch(e){assert.deepEqual(requestDiagnostic(e),{code,reason:raw,layer,httpStatus:502});assert.notEqual(productError(raw),productError('unknown'));}
  }
  await assert.rejects(requestJson('/api/discover',{},async()=>new Response('<html/>',{status:502})),e=>requestDiagnostic(e).layer==='local-http-json');
});
test('synthetic visual transport makes zero fetches and exports an unmistakably non-LIVE passport',async()=>{
  const previous=globalThis.fetch;let network=0;globalThis.fetch=async()=>{network++;throw Error('Forbidden in visual fixture');};
  try{const request=createSyntheticRequest('success');const search=await request('/api/entities/search');const result=await request('/api/discover');const passport=discoveryPassport(search.entities,result,[],true);assert.equal(result.returned,8);assert.equal(result.provenance.source,'SYNTHETIC fixture');assert.equal(passport.liveValidation,'SYNTHETIC_NOT_LIVE');assert.equal(passport.evidenceMode,'SYNTHETIC');assert.ok(!JSON.stringify(passport).includes('SYNTHETIC_REVIEW_NOT_A_SIGNATURE'));assert.equal(network,0);}finally{globalThis.fetch=previous;}
});
test('synthetic empty and error scenarios do not create recommendations or automatic retries',async()=>{
  assert.equal((await createSyntheticRequest('empty')('/api/discover')).status,'INSUFFICIENT_EVIDENCE');await assert.rejects(createSyntheticRequest('error')('/api/discover'),{message:'UPSTREAM'});assert.ok(syntheticDiscovery().movies.some(m=>m.affinity===null));
});
