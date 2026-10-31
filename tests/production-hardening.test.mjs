// Offline fixtures only. No configured secret, Qloo, TMDB or real Redis is used.
import test from 'node:test';
import assert from 'node:assert/strict';
import {randomBytes} from 'node:crypto';
import {createService} from '../lib/qloo/service.ts';
import {createAuditTools} from '../lib/audit-tools.ts';
import {signingSecret,publicPolicy} from '../lib/production-policy.ts';
import {createSharedQuota,RESERVE_LUA} from '../lib/shared-quota.ts';
import {providerFetch,publicRequest,clientIdentity} from '../lib/public-request.ts';
import {validateOrigin,failure} from '../lib/http.ts';
import {spawnSync} from 'node:child_process';
import {createQlooClient,QlooError} from '../lib/qloo/client.mjs';

const env=()=>({TASTEPROBE_DEPLOYMENT:'public',TASTEPROBE_PUBLIC_ORIGIN:'https://tasteprobe.example',TASTEPROBE_SIGNING_SECRET:randomBytes(32).toString('hex'),UPSTASH_REDIS_REST_URL:'https://offline-test.upstash.io',UPSTASH_REDIS_REST_TOKEN:'MOCK_TEST_ONLY',TASTEPROBE_QUOTA_NAMESPACE:'TEST',TASTEPROBE_QLOO_TOTAL_LIMIT:'10',TASTEPROBE_TMDB_TOTAL_LIMIT:'20'});
async function configured(values,task){const old={};for(const key of Object.keys(values)){old[key]=process.env[key];process.env[key]=values[key];}try{return await task();}finally{for(const key of Object.keys(values)){if(old[key]===undefined)delete process.env[key];else process.env[key]=old[key];}}}

test('stable configured secret lets two independent service instances verify identities; tamper, other key and expiry fail',async()=>{
  const config=env(),secret=signingSecret(config),id='00000000-0000-4000-8000-000000000001';let calls=0,time=0;
  const fetchImpl=async url=>{calls++;return url.pathname==='/search'?Response.json({results:[{entity_id:id,name:'TEST favorite',subtype:'urn:entity:movie',properties:{release_year:2001}}]}):Response.json({results:{entities:[]}});};
  const make=other=>createService({secret:other??signingSecret(config),apiKey:'MOCK_ONLY',fetchImpl,now:()=>time});
  const a=make(),b=make();const e=(await a.search({query:'TEST'})).entities[0];const selected={id:e.id,proof:e.proof,confirmed:true};
  await b.discover({interests:[selected]});assert.equal(calls,2);
  for(const input of [{...selected,proof:selected.proof+'x'},{...selected,confirmed:false},{...selected,id:'00000000-0000-4000-8000-000000000002'}])await assert.rejects(b.discover({interests:[input]}));
  await assert.rejects(make(randomBytes(32)).discover({interests:[selected]}),{category:'IDENTITY_REQUIRED'});
  time=30*60_000;await assert.rejects(b.discover({interests:[selected]}),{category:'IDENTITY_EXPIRED'});assert.equal(calls,2);assert.equal(secret.length,32);
});

test('public configuration fails closed for missing secret/store/limits, weak keys, wildcard or non-HTTPS origin',()=>{
  assert.equal(publicPolicy({}),null);assert.equal(signingSecret({TASTEPROBE_SIGNING_SECRET:''}),undefined);
  for(const key of Object.keys(env())){const config=env();delete config[key];if(key==='TASTEPROBE_DEPLOYMENT')continue;assert.throws(()=>publicPolicy(config),{category:'BLOCKED_LIVE'});}
  for(const patch of [{TASTEPROBE_SIGNING_SECRET:'bad'},{TASTEPROBE_PUBLIC_ORIGIN:'https://*.example'},{TASTEPROBE_PUBLIC_ORIGIN:'http://tasteprobe.example'},{UPSTASH_REDIS_REST_URL:'https://evil.example'},{TASTEPROBE_QLOO_TOTAL_LIMIT:'0'}])assert.throws(()=>publicPolicy({...env(),...patch}),{category:'BLOCKED_LIVE'});
});

test('configured HTTPS accepts exact Host/Origin through internal HTTP and rejects foreign origins, ports, Hosts and forwarded spoofing',async()=>{
  await configured(env(),async()=>{
    const req=(origin='https://tasteprobe.example',host='tasteprobe.example',extra={})=>new Request('http://internal:8080/api/discover',{headers:{...(origin?{Origin:origin}:{}),Host:host,...extra}});
    assert.doesNotThrow(()=>validateOrigin(req()));assert.doesNotThrow(()=>validateOrigin(req(null)));
    for(const r of [req('https://evil.example'),req('https://tasteprobe.example:444'),req('https://tasteprobe.example','evil.example'),req('https://tasteprobe.example','internal:8080',{'x-forwarded-host':'tasteprobe.example','x-forwarded-proto':'https'}),req('https://tasteprobe.example','tasteprobe.example',{'sec-fetch-site':'cross-site'})])assert.throws(()=>validateOrigin(r),{category:'FORBIDDEN_ORIGIN'});
  });
  assert.throws(()=>validateOrigin(new Request('https://unconfigured.example/api/tools',{headers:{Host:'unconfigured.example'}})),{category:'FORBIDDEN_ORIGIN'});
});

// Atomic REST-contract emulator, NOT proof of an actual Redis deployment/Lua execution.
function redisMock(){
  const values=new Map(),commands=[];
  return {values,commands,fetch:async(_url,init)=>{
    const args=JSON.parse(init.body);commands.push(args);
    assert.equal(init.redirect,'error');assert.equal(init.method,'POST');
    if(args[0]==='SET'){values.set(args[1],args[2]);return Response.json({result:'OK'});}
    if(args[0]==='MGET')return Response.json({result:args.slice(1).map(k=>values.has(k)?String(values.get(k)):null)});
    assert.equal(args[0],'EVAL');assert.equal(args[1],RESERVE_LUA);
    const n=args[2],keys=args.slice(3,3+n),limits=args.slice(3+n);
    if(values.has(keys[0]))return Response.json({result:[0,1,0]});
    for(let i=1;i<n;i++)if((Number(values.get(keys[i]))||0)>=limits[(i-1)*2])return Response.json({result:[0,i+1,0]});
    for(const k of keys.slice(1))values.set(k,(Number(values.get(k))||0)+1);
    return Response.json({result:[1,0,limits[0]-values.get(keys[1])]});
  }};
}

test('two quota instances share atomic attempt cap; failures do not refund; remaining and halt persist across instances',async()=>{
  const config=publicPolicy({...env(),TASTEPROBE_QLOO_TOTAL_LIMIT:'3'}),store=redisMock();
  const a=createSharedQuota(config,store.fetch),b=createSharedQuota(config,store.fetch);
  const attempts=await Promise.allSettled(Array.from({length:8},(_,i)=>(i%2?a:b).reserve('qloo','search',`TEST-${i}`)));
  assert.equal(attempts.filter(r=>r.status==='fulfilled').length,3);assert.equal((await b.status()).qloo.remaining,0);
  await assert.rejects(createSharedQuota(config,store.fetch).reserve('qloo','insights','new-instance'),{category:'REQUEST_BUDGET'});
  await a.halt('tmdb');await assert.rejects(b.reserve('tmdb','search','client'),{category:'REQUEST_BUDGET'});assert.equal((await a.status()).tmdb.halted,true);
  assert.match(RESERVE_LUA,/redis.call\('EXPIRE'/);assert.ok(store.commands.filter(c=>c[0]==='EVAL').every(c=>c[2]===5));
});

test('per-client and per-operation limits do not change global provider caps or expose raw IP',async()=>{
  const store=redisMock(),quota=createSharedQuota(publicPolicy(env()),store.fetch);
  for(let i=0;i<4;i++)await quota.reserve('qloo','search','192.0.2.1');
  await assert.rejects(quota.reserve('qloo','search','192.0.2.1'),{category:'REQUEST_BUDGET'});
  await quota.reserve('qloo','insights','192.0.2.1');await quota.reserve('qloo','insights','192.0.2.1');
  await assert.rejects(quota.reserve('qloo','insights','192.0.2.1'),{category:'REQUEST_BUDGET'});
  await quota.reserve('qloo','search','192.0.2.2');
  assert.equal(JSON.stringify(store.commands).includes('192.0.2.1'),false);
  assert.equal(clientIdentity(new Request('http://localhost',{headers:{'x-forwarded-for':'spoof'}}),''),'anonymous');
  assert.equal(clientIdentity(new Request('http://localhost',{headers:{'x-real-ip':'192.0.2.1'}}),'x-real-ip'),'192.0.2.1');
  assert.throws(()=>clientIdentity(new Request('http://localhost'),'x-forwarded-for'),{category:'BLOCKED_LIVE'});
});

test('Redis errors, 429, malformed/oversized responses fail closed with no retries; local 429 has Retry-After',async()=>{
  for(const f of [async()=>{throw Error('PRIVATE NETWORK DETAILS');},async()=>new Response('',{status:429}),async()=>Response.json({result:[1]}),async()=>Response.json({error:'PRIVATE'}),async()=>new Response('x'.repeat(5000))]){
    let attempts=0;const quota=createSharedQuota(publicPolicy(env()),async(...args)=>{attempts++;return f(...args);});
    await assert.rejects(quota.reserve('qloo','search','TEST'),{category:'BLOCKED_LIVE'});assert.equal(attempts,1);
  }
  const quota=createSharedQuota(publicPolicy(env()),redisMock().fetch);for(let i=0;i<4;i++)await quota.reserve('qloo','search','TEST');
  try{await quota.reserve('qloo','search','TEST');}catch(e){const r=failure(e);assert.equal(r.status,429);assert.equal(r.headers.get('Retry-After'),'60');}
});

test('public provider wrapper requires request context, counts network failures, blocks SSRF and halts on upstream auth/quota',async()=>{
  await configured(env(),async()=>{
    const original=globalThis.fetch,store=redisMock();let calls=0;
    globalThis.fetch=store.fetch;
    try{
      const get=providerFetch('qloo',async()=>{calls++;return new Response('',{status:429});});
      await assert.rejects(get('https://hackathon.api.qloo.com/search'),{category:'BLOCKED_LIVE'});assert.equal(calls,0);
      const request=new Request('http://internal/api/tools',{headers:{Host:'tasteprobe.example'}});
      await publicRequest(request,'tools',async()=>{
        await assert.rejects(get('https://evil.example/search'),{category:'INVALID_PATH'});
        assert.equal((await get('https://hackathon.api.qloo.com/search')).status,429);
        await assert.rejects(get('https://hackathon.api.qloo.com/search'),{category:'REQUEST_BUDGET'});
      });
      assert.equal(calls,1);
      let failureCalls=0;
      await publicRequest(request,'visuals',async()=>{
        const fail=providerFetch('tmdb',async()=>{failureCalls++;throw Error('TEST');});
        await assert.rejects(fail('https://api.themoviedb.org/3/search/movie'));
      });assert.equal(failureCalls,1);
      assert.equal((await createSharedQuota(publicPolicy(),store.fetch).status()).tmdb.used,1);
    }finally{globalThis.fetch=original;}
  });
});

test('public launcher refuses to listen when security configuration is absent',()=>{
  const config={...process.env};for(const key of Object.keys(env()))delete config[key];
  const r=spawnSync(process.execPath,['scripts/start-public.mjs'],{env:config,encoding:'utf8',windowsHide:true,timeout:5000});
  assert.equal(r.status,1);assert.match(r.stderr,/Public startup blocked/);assert.doesNotMatch(r.stderr,/MOCK_TEST_ONLY/);
});

test('twenty concurrent tool sessions are bounded; expired sessions do not permanently exhaust judge access',()=>{
  let time=0;const tools=createAuditTools({},()=>time);
  for(let i=0;i<20;i++)tools.create({intent:'TEST',caller:'human-ui'});
  assert.throws(()=>tools.create({intent:'TEST',caller:'human-ui'}),{category:'REQUEST_BUDGET'});
  time=20*60_000;assert.doesNotThrow(()=>tools.create({intent:'TEST',caller:'human-ui'}));
});

test('pre-transport quota denial is not reported as an attempted Qloo HTTP request',async()=>{
  const client=createQlooClient({apiKey:'MOCK_ONLY',fetchImpl:async()=>{throw new QlooError('REQUEST_BUDGET');}});
  await assert.rejects(client.get('/search',{}),e=>e.category==='REQUEST_BUDGET'&&e.upstreamAttempted===false);
});
