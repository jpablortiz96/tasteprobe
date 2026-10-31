// Operator-only REAL Redis verification. Never imports/calls a provider transport.
// Real reservations use new TEST namespaces only. No production counter is changed.
import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {quotaPolicy} from '../lib/production-policy.ts';
import {createSharedQuota} from '../lib/shared-quota.ts';
import {loadQuotaEnvironment} from './quota-env.mjs';
import {quotaDiagnostic} from '../lib/quota-diagnostic.ts';
let phase='configuration';
try{
  loadQuotaEnvironment({fromFile:!process.argv.includes('--worker')});
  const policy=quotaPolicy();
  if(process.argv.includes('--worker')){
    phase='concurrent-worker';
    if(!/^[a-zA-Z0-9_-]{1,24}-preflight-[0-9a-f]{8}$/.test(policy.namespace)||policy.limits.qloo!==3)throw 0;
    const results=await Promise.all(Array.from({length:4},async(_,i)=>{
      try{await createSharedQuota(policy).reserve('qloo','search',`TEST-${process.pid}-${i}`);return 'ALLOWED';}
      catch(e){if(e?.category==='REQUEST_BUDGET')return 'DENIED';throw 0;}
    }));
    console.log(JSON.stringify(results));
  }else{
    const namespace=`${policy.namespace.slice(0,24)}-preflight-${randomBytes(4).toString('hex')}`;
    const config={...policy,namespace,limits:{qloo:3,tmdb:2}};
    // Validate storage/auth before starting the concurrency test. Never reset a collision.
    phase='storage-auth';const fresh=await createSharedQuota(config).status();
    if(fresh.qloo.used||fresh.tmdb.used||fresh.qloo.halted||fresh.tmdb.halted)throw 0;
    async function worker(){return new Promise((resolve,reject)=>{
      const child=spawn(process.execPath,[import.meta.filename,'--worker'],{env:{...process.env,TASTEPROBE_QUOTA_NAMESPACE:namespace,TASTEPROBE_QLOO_TOTAL_LIMIT:'3'},stdio:['ignore','pipe','pipe'],windowsHide:true,timeout:10000});
      let output='',diagnostic='';child.stdout.on('data',d=>{output=(output+d).slice(-2048);});child.stderr.on('data',d=>{diagnostic=(diagnostic+d).slice(-4096);});child.on('error',reject);child.on('close',code=>{try{if(code!==0){try{const safe=JSON.parse(diagnostic);if(safe.diagnostic?.category?.startsWith('REDIS_')){const error=Error('Worker storage failure');error.redisDiagnostic=safe.diagnostic;reject(error);return;}}catch{}throw 0;}const data=JSON.parse(output);if(!Array.isArray(data)||data.length!==4||data.some(x=>!['ALLOWED','DENIED'].includes(x)))throw 0;resolve(data);}catch{reject(Error('Worker verification failed'));}});
    });}
    phase='atomic-concurrency';const results=(await Promise.all([worker(),worker()])).flat();
    const status=await createSharedQuota(config).status();
    async function ttl(key){const r=await fetch(policy.url,{method:'POST',headers:{Authorization:`Bearer ${policy.token}`,'Content-Type':'application/json'},body:JSON.stringify(['TTL',key]),redirect:'error',signal:AbortSignal.timeout(2000)});if(!r.ok)throw 0;const data=await r.json();if(!Number.isInteger(data.result))throw 0;return data.result;}
    phase='ttl';const totalTTL=await ttl(`tasteprobe:{${namespace}}:qloo:total`),minuteTTL=await ttl(`tasteprobe:{${namespace}}:qloo:minute`);
    if(results.filter(x=>x==='ALLOWED').length!==3||status.qloo.used!==3||status.qloo.remaining!==0||totalTTL!==-1||minuteTTL<1||minuteTTL>60)throw 0;
    async function denied(task){try{await task;throw Error('Unexpected admission');}catch(e){if(e?.category!=='REQUEST_BUDGET')throw e;}}
    phase='independent-providers';const a=createSharedQuota(config),b=createSharedQuota(config);
    await a.reserve('tmdb','search','TEST_VISUAL_A');await b.reserve('tmdb','search','TEST_VISUAL_B');
    await denied(a.reserve('tmdb','search','TEST_VISUAL_C'));
    const independent=await b.status();if(independent.qloo.used!==3||independent.tmdb.used!==2||independent.tmdb.remaining!==0)throw 0;
    phase='client-operation-limits';const perClient={...policy,namespace:namespace+'-ip',limits:{qloo:30,tmdb:2}},c=createSharedQuota(perClient),d=createSharedQuota(perClient);
    for(let i=0;i<4;i++)await (i%2?c:d).reserve('qloo','search','TEST_SAME_CLIENT');
    await denied(d.reserve('qloo','search','TEST_SAME_CLIENT'));
    await c.reserve('qloo','insights','TEST_SAME_CLIENT');await d.reserve('qloo','insights','TEST_SAME_CLIENT');
    await denied(c.reserve('qloo','probe','TEST_SAME_CLIENT'));
    if((await d.status()).qloo.used!==6)throw 0;
    // This namespace has unused TMDB allowance, so denial must come from the halt flag.
    phase='shared-halt';await c.halt('tmdb');await denied(d.reserve('tmdb','search','TEST_UNUSED_ALLOWANCE'));
    phase='injected-outage';
    try{await createSharedQuota(config,async()=>{throw Error('TEST_STORAGE_OUTAGE');}).reserve('qloo','search','TEST');throw 0;}catch(e){if(e?.category!=='BLOCKED_LIVE')throw e;}
    console.log(JSON.stringify({result:'REAL_REDIS_ATOMIC_RESERVATION_PASS',testNamespace:namespace,processes:2,concurrentAttempts:8,allowed:3,denied:5,totalTTL,minuteTTL,independentProviderBudgets:true,clientAndOperationLimits:true,sharedHaltFlag:true,storageOutage:'INJECTED_TRANSPORT_FAILURE_DENIED',redisRequests:27,providerRequests:0,note:'TEST counters retained. Controlled halt uses the actual Redis flag, not a real upstream failure. Verify durable storage/no eviction separately; do not delete production counters.'},null,2));
  }
}catch(error){console.error(JSON.stringify({result:'BLOCKED',diagnostic:quotaDiagnostic(error,phase),providerRequests:0}));process.exitCode=1;}
