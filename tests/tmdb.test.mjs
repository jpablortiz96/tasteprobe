import test from 'node:test';
import assert from 'node:assert/strict';
import { createTmdbClient } from '../lib/tmdb/client.ts';
import { createVisualService } from '../lib/tmdb/service.ts';
import { resolveMovieVisual } from '../lib/tmdb/resolve-movie-poster.ts';
import { safeTmdbImage, visualMatches } from '../lib/tmdb/policy.ts';
import { syntheticDiscovery } from '../lib/synthetic-review.ts';
import { discoveryPassport } from '../lib/discovery-report.ts';
import { readFile } from 'node:fs/promises';
const movie={id:'00000000-0000-4000-8000-000000000001',name:'MOCK Film: A',year:2016,type:'urn:entity:movie'};
const row={id:1,title:'MOCK Film A',release_date:'2016-01-01',poster_path:'/mock.jpg',backdrop_path:'/mock-bg.jpg',overview:'MOCK synopsis',adult:false};
const config={images:{secure_base_url:'https://image.tmdb.org/t/p/',poster_sizes:['w500'],backdrop_sizes:['w1280']}};
const data={results:[row],total_pages:1};
test('TMDB unique punctuation-normalized title/exact year gives actual configuration URLs; ambiguity and wrong identity abstain',()=>{
  const visual=resolveMovieVisual(movie,data,config,'MOCK_TIME');assert.equal(visual.posterUrl,'https://image.tmdb.org/t/p/w500/mock.jpg');assert.equal(visual.backdropUrl,'https://image.tmdb.org/t/p/w1280/mock-bg.jpg');assert.ok(visualMatches(movie,visual));
  for(const bad of [{...row,release_date:'2017-01-01'},{...row,title:'Different'},{...row,media_type:'tv'},{...row,adult:true},{...row,poster_path:null,backdrop_path:null}])assert.equal(resolveMovieVisual(movie,{results:[bad]},config,'MOCK'),null);
  assert.equal(resolveMovieVisual(movie,{results:[row,{...row,id:2}]},config,'MOCK'),null);
  assert.equal(resolveMovieVisual(movie,{...data,total_pages:2},config,'MOCK'),null);
  assert.equal(resolveMovieVisual({...movie,year:null},data,config,'MOCK'),null);
  assert.equal(resolveMovieVisual(movie,data,{images:{...config.images,secure_base_url:'https://evil.example/'}},'MOCK'),null);
  assert.equal(safeTmdbImage('https://image.tmdb.org.evil.example/a.jpg'),false);
});
test('Bearer preferred; API key fallback stays server-side; fixed hosts, GET, no redirects or retries',async()=>{
  for(const bearer of [true,false]){
    let calls=0;const c=createTmdbClient({token:bearer?'MOCK_TOKEN':undefined,apiKey:'MOCK_KEY',fetchImpl:async(url,o)=>{
      calls++;assert.equal(url.origin,'https://api.themoviedb.org');assert.equal(o.method,'GET');assert.equal(o.redirect,'error');assert.ok(o.signal);
      assert.equal(o.headers.Authorization,bearer?'Bearer MOCK_TOKEN':undefined);assert.equal(url.searchParams.get('api_key'),bearer?null:'MOCK_KEY');return Response.json(config);
    }});
    await c.get('/configuration');assert.equal(calls,1);
  }
});
test('missing credential makes zero calls; 401/403/429 halt subsequent upstream calls and redact errors',async()=>{
  let calls=0;assert.equal((await createVisualService({fetchImpl:async()=>{calls++;throw Error();}}).resolve([movie])).status,'BLOCKED_CREDENTIAL');assert.equal(calls,0);
  for(const status of [401,403,429]){
    let n=0;const service=createVisualService({token:'MOCK_TOKEN',fetchImpl:async()=>{n++;return new Response('private MOCK_TOKEN',{status});}});
    const result=await service.resolve([movie]);await service.resolve([movie]);assert.equal(n,1);assert.deepEqual(result.images,{});assert.ok(!JSON.stringify(result).includes('MOCK_TOKEN'));
  }
});
test('TMDB missing matches, malformed data, timeout and network failure degrade without Qloo calls or altered ranking',async()=>{
  const original=syntheticDiscovery(),before=structuredClone(original);
  for(const mode of ['empty','badjson','timeout','network','match']){
    let calls=0;const service=createVisualService({token:'MOCK_TOKEN',fetchImpl:async url=>{
      calls++;assert.equal(url.hostname,'api.themoviedb.org');
      if(mode==='timeout')throw new DOMException('private','TimeoutError');if(mode==='network')throw new TypeError('private');if(mode==='badjson')return new Response('not json');
      return Response.json(url.pathname.endsWith('configuration')?config:mode==='empty'?{results:[]}:data);
    }});
    const result=await service.resolve([movie]);assert.equal(Object.keys(result.images).length,mode==='match'?1:0);
    if(mode==='match'){await service.resolve([movie]);assert.equal(calls,2,'configuration and matched image cached');}
  }
  assert.deepEqual(original,before);
});
test('Passport keeps optional TMDB metadata separate from Qloo evidence and never exports unbound image identities',()=>{
  const result=syntheticDiscovery();result.provenance.source='Qloo REST';result.movies[0]={...result.movies[0],name:movie.name,year:movie.year};
  const first=result.movies[0],visual=resolveMovieVisual(movie,data,config,'MOCK');
  const passport=discoveryPassport([],result,[],false,{status:'IMAGE_PROVIDER_READY',images:{[first.id]:visual,unrelated:visual}});
  assert.deepEqual(passport.discovery,result);assert.equal(Object.keys(passport.visualMetadata.images).length,1);assert.equal(passport.visualMetadata.provider,'TMDB');
});

test('captured TMDB Arrival same-title/year ambiguity abstains offline rather than selecting by popularity',async()=>{
  const capture=JSON.parse(await readFile('evidence/gate2g-tmdb-matching.json','utf8'));
  const replay={total_pages:capture.totalPages,results:capture.rows.map(m=>({id:m.id,title:m.title,release_date:m.releaseDate,poster_path:m.posterPath,backdrop_path:m.backdropPath,adult:m.adult}))};
  assert.equal(replay.results.filter(m=>m.title==='Arrival').length,2);
  assert.equal(resolveMovieVisual({...movie,name:'Arrival'},replay,config,'OFFLINE_CAPTURE_REPLAY'),null);
});
