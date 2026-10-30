import test from 'node:test';
import assert from 'node:assert/strict';
import { culturalInsights } from '../lib/cultural-insights.ts';
import { discoveryPassport } from '../lib/discovery-report.ts';
import { syntheticDiscovery } from '../lib/synthetic-review.ts';
import { matchAuthorizedPoster, posterPresentation } from '../lib/poster-policy.ts';

test('highest observed affinity is dynamic, stable on ties and never changes provider order',()=>{
  const r=syntheticDiscovery();r.movies[3].affinity=.99;r.movies[6].affinity=.99;
  const original=structuredClone(r), i=culturalInsights(r);
  assert.equal(i.featured.id,r.movies[3].id);assert.equal(i.featured.rank,4);assert.equal(i.featured.tied,true);
  assert.equal(i.dashboard.topAffinity,.99);assert.equal(i.dashboard.totalMovies,8);
  assert.deepEqual(i.remaining.map(m=>m.id),r.movies.filter((_,n)=>n!==3).map(m=>m.id));assert.deepEqual(r,original);
});
test('null, nonfinite, zero, empty and incomplete affinities abstain correctly',()=>{
  const r=syntheticDiscovery();r.movies.forEach(m=>m.affinity=null);r.movies[1].affinity=NaN;
  assert.equal(culturalInsights(r).dashboard.topAffinity,null);assert.equal(culturalInsights(r).featured.basis,'FIRST_QLOO_RESULT');
  r.movies[5].affinity=0;assert.equal(culturalInsights(r).featured.id,r.movies[5].id);assert.equal(culturalInsights(r).dashboard.topAffinity,0);
  r.movies=[];assert.equal(culturalInsights(r).featured,null);assert.equal(culturalInsights(r).dashboard.totalMovies,0);
});
test('Passport dashboard and featured identity derive from the same evidence; synthetic remains explicit',()=>{
  const r=syntheticDiscovery(), p=discoveryPassport([],r,[],true), i=culturalInsights(r);
  assert.deepEqual(p.culturalInsights.dashboard,i.dashboard);assert.deepEqual(p.culturalInsights.featured,i.featured);
  assert.equal(p.liveValidation,'SYNTHETIC_NOT_LIVE');assert.equal(p.culturalInsights.imageProvider.qloo,'BLOCKED_RIGHTS');
  assert.equal(discoveryPassport([],r,[]).liveValidation,'SYNTHETIC_NOT_LIVE','Fixture provenance cannot silently become LIVE when a caller omits the flag');
});
const movie={name:'SYNTHETIC Film',year:2001,type:'urn:entity:movie',externalId:'tt-test'};
const poster={...movie,url:'https://image.tmdb.org/t/p/w500/synthetic-test.jpg',rightsVerified:true,provider:'TMDB'};
test('image matching requires exact title/year/movie and consistent external identity, never ambiguous selection',()=>{
  assert.equal(matchAuthorizedPoster(movie,[poster]),poster);
  for(const p of [{...poster,name:'Other'}, {...poster,year:2002},{...poster,type:'urn:entity:tv_show'},{...poster,externalId:'wrong'},{...poster,rightsVerified:false},{...poster,url:'https://evil.example/a.jpg'}])assert.equal(matchAuthorizedPoster(movie,[p]),null);
  assert.equal(matchAuthorizedPoster(movie,[poster,{...poster}]),null);assert.equal(matchAuthorizedPoster({...movie,year:null},[poster]),null);
});
test('missing, incorrect, unauthorized or failed image uses fallback without touching ranking',()=>{
  const result=syntheticDiscovery(), before=structuredClone(result);
  assert.equal(posterPresentation(movie).kind,'ILLUSTRATIVE_FALLBACK');
  assert.equal(posterPresentation(movie,[{...poster,year:2002}]).kind,'ILLUSTRATIVE_FALLBACK');
  assert.equal(posterPresentation(movie,[poster],true).kind,'ILLUSTRATIVE_FALLBACK');
  assert.deepEqual(result,before);
});
