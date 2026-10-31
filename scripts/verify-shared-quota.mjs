// Operator-only REAL Redis verification. Never imports/calls a provider transport.
// Eight reservations + one status + two TTL reads, in a new TEST namespace only.
import {spawn} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {publicPolicy} from '../lib/production-policy.ts';
import {createSharedQuota} from '../lib/shared-quota.ts';
try{
  const policy=publicPolicy();if(!policy)throw 0;
  if(process.argv.includes('--worker')){
    const results=await Promise.all(Array.from({length:4},async(_,i)=>{
      try{await createSharedQuota(policy).reserve('qloo','search',`TEST-${process.pid}-${i}`);return 'ALLOWED';}
      catch(e){if(e?.category==='REQUEST_BUDGET')return 'DENIED';throw 0;}
    }));
    console.log(JSON.stringify(results));
  }else{
    const namespace=`${policy.namespace.slice(0,30)}-test-${randomBytes(4).toString('hex')}`;
    const config={...policy,namespace,limits:{...policy.limits,qloo:3}};
    async function worker(){return new Promise((resolve,reject)=>{
      const child=spawn(process.execPath,[import.meta.filename,'--worker'],{env:{...process.env,TASTEPROBE_QUOTA_NAMESPACE:namespace,TASTEPROBE_QLOO_TOTAL_LIMIT:'3'},stdio:['ignore','pipe','ignore'],windowsHide:true,timeout:10000});
      let output='';child.stdout.on('data',d=>{output=(output+d).slice(-2048);});child.on('error',reject);child.on('close',code=>{try{if(code!==0)throw 0;const data=JSON.parse(output);if(!Array.isArray(data)||data.length!==4||data.some(x=>!['ALLOWED','DENIED'].includes(x)))throw 0;resolve(data);}catch{reject(Error('Worker verification failed'));}});
    });}
    const results=(await Promise.all([worker(),worker()])).flat();
    const status=await createSharedQuota(config).status();
    async function ttl(key){const r=await fetch(policy.url,{method:'POST',headers:{Authorization:`Bearer ${policy.token}`,'Content-Type':'application/json'},body:JSON.stringify(['TTL',key]),redirect:'error',signal:AbortSignal.timeout(2000)});if(!r.ok)throw 0;const data=await r.json();if(!Number.isInteger(data.result))throw 0;return data.result;}
    const totalTTL=await ttl(`tasteprobe:{${namespace}}:qloo:total`),minuteTTL=await ttl(`tasteprobe:{${namespace}}:qloo:minute`);
    if(results.filter(x=>x==='ALLOWED').length!==3||status.qloo.used!==3||status.qloo.remaining!==0||totalTTL!==-1||minuteTTL<1||minuteTTL>60)throw 0;
    console.log(JSON.stringify({result:'REAL_REDIS_ATOMIC_RESERVATION_PASS',testNamespace:namespace,processes:2,attempts:8,allowed:3,denied:5,totalTTL,minuteTTL,providerRequests:0,note:'TEST counters retained. Verify durable storage/no eviction separately; do not delete production counters.'},null,2));
  }
}catch{console.error('Shared Redis verification blocked or failed; no provider request made. No secret details logged.');process.exitCode=1;}
