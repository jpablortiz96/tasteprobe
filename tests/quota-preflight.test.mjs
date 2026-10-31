import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {randomBytes} from 'node:crypto';
import {mkdtempSync,rmdirSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';

test('offline Redis status preflight works before a public domain exists, without enabling public serving',()=>{
  // TEST transport only: never reads real Redis/provider credentials or makes network calls.
  const preload='data:text/javascript,globalThis.fetch=async()=>Response.json({result:[null,null,null,null]});';
  const directory=mkdtempSync(join(tmpdir(),'tasteprobe-quota-'));
  let result;try{result=spawnSync(process.execPath,['--import',preload,resolve('scripts/check-public-quota.mjs')],{cwd:directory,encoding:'utf8',windowsHide:true,timeout:5000,env:{...process.env,QLOO_API_KEY:'',TMDB_READ_ACCESS_TOKEN:'',TMDB_API_KEY:'',TASTEPROBE_DEPLOYMENT:'',TASTEPROBE_PUBLIC_ORIGIN:'',TASTEPROBE_SIGNING_SECRET:randomBytes(32).toString('hex'),UPSTASH_REDIS_REST_URL:'https://offline-test.upstash.io',UPSTASH_REDIS_REST_TOKEN:'MOCK_TEST_ONLY',TASTEPROBE_QUOTA_NAMESPACE:'TEST_PREFLIGHT',TASTEPROBE_QLOO_TOTAL_LIMIT:'10',TASTEPROBE_TMDB_TOTAL_LIMIT:'20'}});}finally{rmdirSync(directory);}
  assert.equal(result.status,0,'Redis preflight must not require a not-yet-assigned hosting domain');
  const status=JSON.parse(result.stdout);assert.equal(status.source,'SHARED_OPERATOR_LIMITS_NOT_PROVIDER_QUOTA');assert.equal(status.qloo.remaining,10);assert.equal(status.tmdb.remaining,20);
});
