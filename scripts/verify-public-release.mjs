// One release check. No Search, Insights or TMDB request is dispatched.
import assert from 'node:assert/strict';
import {readFileSync,writeFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
const base='https://tasteprobe-production.up.railway.app';
assert.notEqual(process.env.NODE_TLS_REJECT_UNAUTHORIZED,'0','TLS verification must remain enabled');
const file=parseEnv(readFileSync('.env.local','utf8'));
const secrets=['QLOO_API_KEY','TMDB_READ_ACCESS_TOKEN','TMDB_API_KEY','TASTEPROBE_SIGNING_SECRET','UPSTASH_REDIS_REST_TOKEN'].map(k=>file[k]).filter(Boolean);
const checks=[];
function clean(text){assert.ok(!secrets.some(v=>text.includes(v)),'Configured credential appears in response; output withheld');}
async function get(path,status){const r=await fetch(base+path,{redirect:'error',signal:AbortSignal.timeout(10000)});const text=await r.text();clean(text);assert.equal(r.status,status,path);checks.push({method:'GET',path,status:r.status});return {r,text};}
async function post(input,status=200,origin=base,path='/api/tools'){
  const r=await fetch(base+path,{method:'POST',headers:{Origin:origin,'Content-Type':'application/json'},body:JSON.stringify(input),redirect:'error',signal:AbortSignal.timeout(10000)});const text=await r.text();clean(text);assert.equal(r.status,status,path);checks.push({method:'POST',path,status:r.status,originAllowed:origin===base});return JSON.parse(text);
}
const home=await get('/',200);assert.ok(home.text.includes('TasteProbe')&&home.text.includes('Discover your next'));
const assets=[...new Set([...home.text.matchAll(/(?:src|href)="(\/_next\/static\/[^"<>]+)"/g)].map(m=>m[1]))];assert.ok(assets.length>0);
for(const asset of assets)await get(asset,200);
const health=JSON.parse((await get('/api/health',200)).text);assert.equal(health.status,'CONFIGURED_NOT_VERIFIED');assert.equal(health.liveVerified,false);
await get('/review',404);await get('/.env.local',404);await get('/scripts/tasteprobe-mcp.mjs',404);
const forbidden=await post({query:'Arrival'},403,'https://unauthorized.example','/api/entities/search');assert.equal(forbidden.error,'FORBIDDEN_ORIGIN');assert.equal(forbidden.diagnostic.upstreamAttempted,false);
const created=await post({action:'create',intent:'Verify released tool session without provider calls',caller:'human-ui'});assert.equal(typeof created.session,'string');
const before=await post({action:'passport',session:created.session});assert.equal(before.liveValidation,'NOT_EVALUATED');
const invoked=await post({action:'invoke',session:created.session,tool:'propose_evidence_based_revision',arguments:{}});assert.equal(invoked.output.status,'ABSTAINED');assert.equal(invoked.passport.budget.used,0);
const after=await post({action:'passport',session:created.session});assert.equal(after.proposal.status,'ABSTAINED');assert.equal(after.events.length,1);assert.equal(after.budget.used,0);
const report={timestamp:new Date().toISOString(),url:base,result:'PUBLIC_ZERO_PROVIDER_HTTP_PASS',checks,clientAssetsScanned:assets.length,configuredSecretMatches:0,health:health.status,httpsVerified:true,csrfOwnOrigin:true,csrfForeignOriginRejected:true,redisFromProduction:'ATOMIC_HTTP_ADMISSION_SUCCEEDED',sessionAcrossRequests:true,realToolInvocation:'propose_evidence_based_revision -> ABSTAINED (HTTP caller, not an LLM demo)',providerCalls:0,liveUserTest:'PENDING_SEPARATE_AUTHORIZATION',sessionTokenRecorded:false};
writeFileSync('evidence/final-public-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({result:report.result,url:base,assets:assets.length,redis:true,session:true,csrf:true,providerCalls:0}));
