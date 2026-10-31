import test from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {createServer} from 'node:net';
import {request as httpRequest} from 'node:http';
import {once} from 'node:events';
import {writeFile} from 'node:fs/promises';

test('MOCK PUBLIC HTTP: exact HTTPS proxy origin, stable signatures, shared reservations and exhausted quota fail closed',{timeout:30000},async t=>{
  const socket=createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');const port=socket.address().port;await new Promise(r=>socket.close(r));
  const child=spawn(process.execPath,['--import',new URL('./mock-public-quota-preload.mjs',import.meta.url).href,'node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{windowsHide:true,stdio:['ignore','pipe','pipe'],env:{...process.env,NODE_ENV:'production',QLOO_API_KEY:'MOCK_TEST_ONLY_NOT_A_CREDENTIAL',QLOO_BASE_URL:'https://hackathon.api.qloo.com',TMDB_API_KEY:'',TMDB_READ_ACCESS_TOKEN:'',TASTEPROBE_DEPLOYMENT:'public',TASTEPROBE_PUBLIC_ORIGIN:'https://tasteprobe.example',TASTEPROBE_SIGNING_SECRET:randomBytes(32).toString('hex'),UPSTASH_REDIS_REST_URL:'https://offline-test.upstash.io',UPSTASH_REDIS_REST_TOKEN:'MOCK_TEST_ONLY',TASTEPROBE_QUOTA_NAMESPACE:'TEST_HTTP',TASTEPROBE_QLOO_TOTAL_LIMIT:'2',TASTEPROBE_TMDB_TOTAL_LIMIT:'1',TASTEPROBE_TRUSTED_IP_HEADER:'',TASTEPROBE_VISUAL_REVIEW:'synthetic'}});
  let log='';child.stdout.on('data',d=>{log=(log+d).slice(-2000);});child.stderr.on('data',d=>{log=(log+d).slice(-2000);});
  t.after(async()=>{if(child.exitCode===null){const exited=once(child,'exit');child.kill();await exited;}});
  const base=`http://127.0.0.1:${port}`;let ready=false;
  for(let i=0;i<80;i++){if(child.exitCode!==null)throw Error(log);try{if((await fetch(base+'/api/health',{signal:AbortSignal.timeout(500)})).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}assert.ok(ready);
  const observations=[];
  async function post(path,input,expected,origin='https://tasteprobe.example',host='tasteprobe.example'){
    // Node 24 fetch ignores explicit Host overrides. Native HTTP reproduces the proxy authority.
    const r=await new Promise((resolve,reject)=>{const req=httpRequest(base+path,{method:'POST',headers:{Host:host,Origin:origin,'Content-Type':'application/json'}},res=>{const chunks=[];res.on('data',c=>chunks.push(c));res.on('end',()=>resolve(new Response(Buffer.concat(chunks),{status:res.statusCode,headers:res.headers})));});req.on('error',reject);req.setTimeout(5000,()=>req.destroy(Error('TEST HTTP TIMEOUT')));req.end(JSON.stringify(input));});
    const data=await r.json();assert.equal(r.status,expected,JSON.stringify(data));observations.push({path,status:r.status,category:data.error??null});return {r,data};
  }
  await post('/api/entities/search',{query:'MOCK 1'},403,'https://evil.example');
  await post('/api/entities/search',{query:'MOCK 1'},403,'https://tasteprobe.example','evil.example');
  const e=(await post('/api/entities/search',{query:'MOCK 1'},200)).data.entities[0];
  const discovered=(await post('/api/discover',{interests:[{id:e.id,proof:e.proof,confirmed:true}]},200)).data;assert.equal(discovered.mode,'DISCOVER');assert.ok(discovered.movies.length>0);assert.ok(discovered.movies.every(m=>m.id!==e.id));
  const blocked=await post('/api/entities/search',{query:'MOCK 2'},429);assert.equal(blocked.data.error,'REQUEST_BUDGET');assert.equal(blocked.data.diagnostic.upstreamAttempted,false);assert.equal(blocked.r.headers.get('Retry-After'),'60');
  assert.equal((await fetch(base+'/review')).status,404);
  await writeFile('evidence/gate4a-public-http.json',JSON.stringify({mode:'SYNTHETIC_MOCK_NOT_LIVE',liveQlooRequests:0,realRedisRequests:0,observations,productionReviewStatus:404,publicProxy:'exact configured HTTPS Origin and Host; internal HTTP URL',note:'Emulated REST command contract, not a real Redis/Lua deployment verification.'},null,2)+'\n');
});
