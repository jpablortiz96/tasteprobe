import test from 'node:test';
import assert from 'node:assert/strict';
import { createService } from '../lib/qloo/service.ts';
import { discoveryPassport, attributedSignals } from '../lib/discovery-report.ts';
import { productError } from '../lib/product-errors.ts';
const id = i => `00000000-0000-4000-8000-${String(i).padStart(12,'0')}`;
const movie = (i, affinity = .5) => ({entity_id:id(i),name:`MOCK Film ${i}`,subtype:'urn:entity:movie',properties:{release_year:2000+i,image:'https://unapproved.invalid/image.jpg'},query:{affinity,explainability:{observed:true}}});
async function fixture(rows=[movie(2),movie(3)],status=200) {
  const calls=[];const service=createService({apiKey:'MOCK_TEST_ONLY',fetchImpl:async url=>{calls.push(new URL(url));return url.pathname==='/search'?Response.json({results:[movie(1)]}):Response.json({results:{entities:rows}},{status});}});
  const entity=(await service.search({query:'MOCK seed'})).entities[0];
  return {service,calls,entity,input:{interests:[{id:entity.id,proof:entity.proof,confirmed:true}]}};
}
test('MOCK discovery excludes input IDs, requests 8 without candidate filter, preserves observed evidence',async()=>{
  const {service,calls,input}=await fixture();const r=await service.discover(input);
  assert.deepEqual(Object.fromEntries(calls.at(-1).searchParams),{'filter.type':'urn:entity:movie','signal.interests.entities':id(1),'filter.exclude.entities':id(1),take:'8','feature.explainability':'true'});
  assert.equal(r.mode,'DISCOVER');assert.equal(r.status,'SUCCESS');assert.equal(r.returned,2);assert.equal(r.movies[0].affinity,.5);assert.deepEqual(r.movies[0].explainability,{observed:true});
  assert.ok(!JSON.stringify(r).includes('proof'));assert.ok(!JSON.stringify(r).includes('unapproved.invalid'));assert.ok(!JSON.stringify(r).includes('MOCK_TEST_ONLY'));
});
test('MOCK discovery removes favorites, duplicates, invalid IDs/types and invalid affinities without inventing replacements',async()=>{
  const {service,input}=await fixture([movie(1),movie(2),movie(2),{...movie(3),subtype:'urn:entity:artist'},{...movie(4),entity_id:'fake'},movie(5,'bad'),{...movie(6),name:'MOCK Film 1',properties:{release_year:2001}}]);
  const r=await service.discover(input);assert.equal(r.returned,1);assert.equal(r.discarded,6);assert.deepEqual(r.movies.map(m=>m.id),[id(2)]);assert.equal(r.movies[0].rank,1);
});
test('MOCK empty discovery abstains; missing affinity stays null and zero remains zero',async()=>{
  const f=await fixture([]);assert.equal((await f.service.discover(f.input)).status,'INSUFFICIENT_EVIDENCE');
  const other=await fixture([movie(2,null),movie(3,0)]);const r=await other.service.discover(other.input);assert.equal(r.movies[0].affinity,null);assert.equal(r.movies[1].affinity,0);
});
test('discovery rejects candidate filters, unconfirmed identities and duplicate signals before Insights',async()=>{
  const {service,input,calls}=await fixture();for(const bad of [{...input,recommendations:[]},{interests:[]},{interests:[...input.interests,...input.interests]},{interests:[{...input.interests[0],confirmed:false}]}])await assert.rejects(service.discover(bad));assert.equal(calls.length,1);
});
test('MOCK discovery errors do not retry; missing key performs no upstream call',async()=>{
  const f=await fixture([],403);await assert.rejects(f.service.discover(f.input),{category:'AUTH'});assert.equal(f.calls.length,2);
  let calls=0;const service=createService({fetchImpl:async()=>{calls++;throw Error();}});await assert.rejects(service.discover(f.input),{category:'IDENTITY_REQUIRED'});assert.equal(calls,0);
});
test('discovery passport projects identities and only actual provided events; product errors hide internal codes',async()=>{
  const f=await fixture();const r=await f.service.discover(f.input);const events=[{operation:'discover_movies',timestamp:r.provenance.timestamp,outcome:r.status,summary:'MOCK completed'}];const passport=discoveryPassport([f.entity],r,events);
  assert.equal(passport.events.length,1);assert.equal(passport.autonomousLLM,false);assert.ok(!JSON.stringify(passport).includes(f.entity.proof));assert.ok(!productError('FORBIDDEN_ORIGIN').includes('FORBIDDEN_ORIGIN'));assert.ok(!productError('arbitrary secret exception').includes('arbitrary secret exception'));
});
test('MOCK discovery timeout abstains without retrying',async()=>{
  let calls=0;const service=createService({apiKey:'MOCK_TEST_ONLY',fetchImpl:async url=>{calls++;if(url.pathname==='/search')return Response.json({results:[movie(1)]});throw new DOMException('MOCK private detail','TimeoutError');}});
  const e=(await service.search({query:'MOCK seed'})).entities[0];await assert.rejects(service.discover({interests:[{id:e.id,proof:e.proof,confirmed:true}]}),{category:'TIMEOUT'});assert.equal(calls,2);
});
test('attribution explanation uses only confirmed IDs and valid observed positive scores',()=>{
  const favorites=[{id:id(1),name:'MOCK Confirmed'},{id:id(2),name:'MOCK Zero'}];
  assert.deepEqual(attributedSignals({'signal.interests.entities':[{entity_id:id(1),score:1},{entity_id:id(2),score:0},{entity_id:id(3),score:.8}]},favorites),['MOCK Confirmed']);
  assert.deepEqual(attributedSignals({'signal.interests.entities':[{entity_id:id(1),score:'1'}]},favorites),[]);assert.deepEqual(attributedSignals(null,favorites),[]);
});
