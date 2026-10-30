import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { writeFile } from 'node:fs/promises';
import { discoveryPassport } from '../../lib/discovery-report.ts';
async function server(t,mock=true,stale=false,visual=false){
  const socket=createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');const port=socket.address().port;await new Promise(r=>socket.close(r));
  const child=spawn(process.execPath,[...(mock?['--import',new URL(visual?'./mock-visuals-preload.mjs':stale?'./stale-service-preload.mjs':'./mock-qloo-preload.mjs',import.meta.url).href]:[]),'node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{windowsHide:true,env:{...process.env,QLOO_API_KEY:mock?'MOCK_TEST_ONLY_NOT_A_CREDENTIAL':'',TMDB_READ_ACCESS_TOKEN:visual?'MOCK_VISUAL_ONLY':'',TMDB_API_KEY:'',QLOO_BASE_URL:'https://hackathon.api.qloo.com',TASTEPROBE_VISUAL_REVIEW:'synthetic'},stdio:['ignore','pipe','pipe']});
  let log='';child.stdout.on('data',d=>{log=(log+d).slice(-3000);});child.stderr.on('data',d=>{log=(log+d).slice(-3000);});let spawnError;child.on('error',e=>{spawnError=e;});
  t.after(async()=>{if(child.exitCode===null&&!spawnError){const exited=once(child,'exit');child.kill();await exited;}});
  const base=`http://127.0.0.1:${port}`;
  let ready=false;for(let i=0;i<80;i++){if(spawnError)throw spawnError;if(child.exitCode!==null)throw Error(log);try{if((await fetch(base+'/api/health',{signal:AbortSignal.timeout(500)})).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}assert.ok(ready);
  return {base,port};
}
test('MOCK HTTP Discover: loopback origins, confirmation, new identities, integrity and Passport', {timeout:30000},async t=>{
  const {base,port}=await server(t);const observations=[];
  async function post(path,input,origin=base,status=200,host='127.0.0.1'){
    const r=await fetch(`http://${host}:${port}`+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(input)});const data=await r.json();assert.equal(r.status,status,JSON.stringify(data));observations.push({path,httpStatus:r.status,origin});return data;
  }
  for(const host of ['127.0.0.1','localhost'])await post('/api/tools',{action:'create',intent:'MOCK origin test',caller:'human-ui'},`http://${host}:${port}`,200,host);
  await post('/api/tools',{action:'create',intent:'MOCK',caller:'human-ui'},'https://evil.example',403);
  await post('/api/tools',{action:'create',intent:'MOCK',caller:'human-ui'},`http://127.0.0.1:${port+1}`,403);
  const search=await post('/api/entities/search',{query:'MOCK 1'});assert.equal(search.entities.length,2);assert.equal(search.selected,undefined);const e=search.entities[0];
  const input={interests:[{id:e.id,proof:e.proof,confirmed:true}]};
  const unconfirmed=structuredClone(input);unconfirmed.interests[0].confirmed=false;
  assert.equal((await post('/api/discover',unconfirmed,base,400)).error,'IDENTITY_REQUIRED');
  const r=await post('/api/discover',input);assert.equal(r.mode,'DISCOVER');assert.equal(r.returned,2);assert.equal(r.discarded,3);assert.ok(r.movies.every(m=>m.id!==e.id));assert.equal(new Set(r.movies.map(m=>m.id)).size,r.returned);assert.equal(r.movies[0].affinity,.8);
  const passport=discoveryPassport([e],r,[{operation:'discover_movies',timestamp:r.provenance.timestamp,outcome:r.status,summary:'MOCK response'}]);assert.ok(!JSON.stringify(passport).includes(e.proof));assert.equal(passport.discovery.provenance.parameters['filter.results.entities'],undefined);
  const emptySeed=(await post('/api/entities/search',{query:'MOCK 6'})).entities[0];const empty=await post('/api/discover',{interests:[{id:emptySeed.id,proof:emptySeed.proof,confirmed:true}]});assert.equal(empty.status,'INSUFFICIENT_EVIDENCE');assert.deepEqual(empty.movies,[]);
  assert.equal((await post('/api/entities/search',{query:'MOCK auth error'},base,502)).error,'AUTH');
  const html=await (await fetch(base)).text();assert.ok(html.includes('Discover your next'));assert.ok(html.includes('Discover for me'));assert.ok(!html.includes('Rescue My Recommendations'));
  await writeFile('evidence/gate2c1-mock-http.json',JSON.stringify({timestamp:new Date().toISOString(),mode:'MOCK_HTTP_TEST_ONLY',liveQlooRequests:0,observations,checks:['both loopback origins pass','foreign and wrong port blocked','human confirmation required','new valid unique movies only','input excluded','observed affinity retained','passport excludes proof','empty abstention','Qloo auth error redacted','Discover is default; Rescue absent before analysis']},null,2)+'\n');
});
test('HTTP missing credential stays BLOCKED_LIVE without mock fallback',{timeout:30000},async t=>{
  const {base}=await server(t,false);assert.equal((await (await fetch(base+'/api/health')).json()).status,'BLOCKED_LIVE');
  const r=await fetch(base+'/api/entities/search',{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({query:'Arrival'})});assert.equal(r.status,503);assert.equal((await r.json()).error,'BLOCKED_LIVE');
  const image=await fetch(base+'/api/visuals',{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({movies:[{id:'00000000-0000-4000-8000-000000000001',name:'MOCK Film',year:2001,type:'urn:entity:movie'}]})});assert.equal((await image.json()).status,'BLOCKED_CREDENTIAL');
});

test('MOCK HTTP optional TMDB enrichment is separate from Discover, origin protected, bounded and exportable',{timeout:30000},async t=>{
  const {base}=await server(t,true,false,true);
  async function post(path,input,status=200,origin=base){const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(input)});assert.equal(r.status,status);return r.json();}
  const e=(await post('/api/entities/search',{query:'MOCK 1'})).entities[0];
  const discovery=await post('/api/discover',{interests:[{id:e.id,proof:e.proof,confirmed:true}]});const before=structuredClone(discovery);
  const movies=discovery.movies.map(({id,name,year,type})=>({id,name,year,type}));
  await post('/api/visuals',{movies},403,'https://evil.example');await post('/api/visuals',{movies:[...movies,...movies]},400);
  const images=await post('/api/visuals',{movies});assert.equal(images.status,'IMAGE_PROVIDER_READY');assert.equal(Object.keys(images.images).length,movies.length);
  assert.ok(Object.values(images.images).every(v=>v.provider==='TMDB'&&v.posterUrl==='https://image.tmdb.org/t/p/w500/mock-only.jpg'));
  const passport=discoveryPassport([e],discovery,[],false,images);assert.deepEqual(passport.discovery,before);assert.ok(!JSON.stringify(passport).includes('MOCK_VISUAL_ONLY'));assert.ok(!JSON.stringify(passport).includes(e.proof));
  assert.equal((await fetch(base+'/review')).status,404);
});
test('regression HTTP: pre-Discover singleton is refreshed; one signed favorite reaches valid discovery',{timeout:30000},async t=>{
  const {base}=await server(t,true,true);
  async function post(path,input){const response=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify(input)});const data=await response.json();assert.equal(response.status,200,JSON.stringify(data));return data;}
  const e=(await post('/api/entities/search',{query:'MOCK 1'})).entities[0];
  const result=await post('/api/discover',{interests:[{id:e.id,proof:e.proof,confirmed:true}]});
  assert.equal(result.status,'SUCCESS');assert.equal(result.returned,2);assert.ok(result.movies.every(m=>m.id!==e.id));
  assert.equal((await fetch(base+'/review')).status,404,'Synthetic review must be disabled in production even with its flag set');
  await writeFile('evidence/gate2c2-stale-http.json',JSON.stringify({timestamp:new Date().toISOString(),mode:'MOCK_HTTP_REGRESSION_ONLY',staleGlobalInjected:true,liveQlooRequests:0,oneFavorite:true,result:'PASS',checks:['legacy singleton lacks discover','current factory replaces stale service','fresh signed proof survives Search to Discover','favorite excluded','optional affinity/explainability tolerated','review route is 404 in production even with flag']},null,2)+'\n');
});
