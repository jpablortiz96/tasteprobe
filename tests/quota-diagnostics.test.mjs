import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtempSync,writeFileSync,unlinkSync,rmdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {randomBytes} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {quotaPolicy} from '../lib/production-policy.ts';
import {quotaDiagnostic} from '../lib/quota-diagnostic.ts';
import {createSharedQuota} from '../lib/shared-quota.ts';
import {quotaVariables} from '../scripts/quota-env.mjs';
import {failure} from '../lib/http.ts';
const fixture=()=>({UPSTASH_REDIS_REST_URL:'https://offline-test.upstash.io',UPSTASH_REDIS_REST_TOKEN:'MOCK_PRIVATE_TOKEN',TASTEPROBE_SIGNING_SECRET:randomBytes(32).toString('hex'),TASTEPROBE_QUOTA_NAMESPACE:'MOCK_PREFLIGHT',TASTEPROBE_QLOO_TOTAL_LIMIT:'40',TASTEPROBE_TMDB_TOTAL_LIMIT:'200'});
function cli(config,extra={}){
  const directory=mkdtempSync(join(tmpdir(),'tasteprobe-quota-env-')),file=join(directory,'.env.local');
  writeFileSync(file,Object.entries(config).map(([k,v])=>`${k}=${v}`).join('\n')+'\n');
  const env={...process.env};for(const key of quotaVariables)delete env[key];Object.assign(env,extra);
  try{return spawnSync(process.execPath,['--import','data:text/javascript,globalThis.fetch=async()=>Response.json({result:[null,null,null,null]});',resolve('scripts/check-public-quota.mjs'),'--preflight'],{cwd:directory,env,encoding:'utf8',windowsHide:true,timeout:5000});}
  finally{unlinkSync(file);rmdirSync(directory);}
}
test('CLI loads quota-only .env.local automatically before policy and uses a preflight namespace',()=>{
  const result=cli(fixture());assert.equal(result.status,0);const data=JSON.parse(result.stdout);assert.equal(data.scope,'PREFLIGHT_ONLY');assert.equal(data.environment.source,'ENV_LOCAL_WITH_PROCESS_CONFLICT_CHECK');assert.equal(data.qloo.remaining,40);assert.equal(data.tmdb.remaining,200);
});
test('conflicting process environment fails closed without echoing either value',()=>{
  const result=cli(fixture(),{UPSTASH_REDIS_REST_TOKEN:'MOCK_DIFFERENT_PRIVATE'});assert.equal(result.status,1);const data=JSON.parse(result.stderr);assert.equal(data.diagnostic.category,'ENV_CONFLICT');assert.deepEqual(data.diagnostic.variables,['UPSTASH_REDIS_REST_TOKEN']);assert.doesNotMatch(result.stderr,/MOCK_PRIVATE|MOCK_DIFFERENT/);
});
test('configuration diagnostic identifies missing fields rather than accusing Redis credentials',()=>{
  const result=cli({UPSTASH_REDIS_REST_URL:'https://offline-test.upstash.io',UPSTASH_REDIS_REST_TOKEN:'MOCK_PRIVATE_TOKEN'});assert.equal(result.status,1);const d=JSON.parse(result.stderr).diagnostic;assert.equal(d.category,'QUOTA_CONFIGURATION');assert.equal(d.issues.length,4);assert.ok(d.issues.every(x=>x.reason==='MISSING'));assert.doesNotMatch(result.stderr,/MOCK_PRIVATE/);
});
test('Redis HTTP, permission, EVAL and transport errors are distinct, redacted and retain fail-closed category',async()=>{
  const cases=[
    [async()=>new Response('',{status:401}),'REDIS_AUTH',401,null],
    [async()=>new Response('',{status:403}),'REDIS_PERMISSION',403,null],
    [async()=>new Response('',{status:429}),'REDIS_RATE_LIMIT',429,null],
    [async()=>Response.json({error:'NOPERM PRIVATE_DETAILS'},{status:400}),'REDIS_PERMISSION',400,null],
    [async()=>Response.json({error:'ERR unknown command PRIVATE_DETAILS'},{status:400}),'REDIS_COMMAND_UNSUPPORTED',400,null],
    [async()=>{throw new TypeError('PRIVATE_DETAILS',{cause:Object.assign(Error('PRIVATE_DETAILS'),{code:'ENOTFOUND'})});},'REDIS_NETWORK',null,'ENOTFOUND'],
    [async()=>{throw Object.assign(Error('PRIVATE_DETAILS'),{code:'EACCES'});},'REDIS_NETWORK',null,'EACCES'],
    [async()=>{throw new DOMException('PRIVATE_DETAILS','TimeoutError');},'REDIS_TIMEOUT',null,null],
  ];
  for(const [fetchImpl,category,httpStatus,transportCode] of cases){let calls=0;const quota=createSharedQuota(quotaPolicy(fixture()),async(...args)=>{calls++;return fetchImpl(...args);});
    let captured;await assert.rejects(quota.reserve('qloo','search','MOCK'),e=>{captured=e;assert.equal(e.category,'BLOCKED_LIVE');assert.deepEqual(quotaDiagnostic(e,'test'),{phase:'test',category,command:'EVAL',httpStatus,transportCode});assert.doesNotMatch(JSON.stringify(quotaDiagnostic(e)),/PRIVATE_DETAILS|MOCK_PRIVATE/);return true;});
    const response=failure(captured),body=await response.json();assert.equal(response.status,503);assert.equal(body.diagnostic.upstreamAttempted,false);assert.equal(body.diagnostic.upstreamStatus,null);assert.doesNotMatch(JSON.stringify(body),/REDIS_|PRIVATE_DETAILS|MOCK_PRIVATE/);assert.equal(calls,1);
  }
});
