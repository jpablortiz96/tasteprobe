// One-shot LIVE diagnostic: at most three fetch attempts, including failures. No retry.
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { createQlooClient, QlooError } from '../lib/qloo/client.mjs';
import { compareAB } from './qloo-ab-compare.mjs';

if(!process.argv.includes('--execute'))throw Error('EXECUTION_OPT_IN_REQUIRED');
const file='evidence/gate2a1-ab.json';
const key=process.env.QLOO_API_KEY?.trim();
assert.ok(key,'BLOCKED_LIVE');
assert.equal(process.env.QLOO_BASE_URL,'https://hackathon.api.qloo.com');
const hash=value=>createHash('sha256').update(value.toLowerCase()).digest('hex').slice(0,16);
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const session=JSON.parse(await readFile('evidence/private/gate2a-identities.json','utf8'));
const prior=JSON.parse(await readFile('evidence/gate2a-live.json','utf8'));
assert.equal(prior.status,'SUCCESS');
for(const film of session.films) { assert.ok(uuid.test(film.selected.id)); assert.ok(prior.identities.some(p=>p.idHash===hash(film.selected.id)&&p.title===film.query&&p.year===film.year)); }
const original=session.films.find(f=>f.role==='interest');
const candidates=session.films.filter(f=>f.role==='recommendation');
assert.equal(original.selected.name,'Arrival');assert.equal(original.selected.year,2016);assert.equal(candidates.length,3);
const common={'filter.type':'urn:entity:movie','filter.results.entities':candidates.map(f=>f.selected.id).join(','),take:'3','feature.explainability':'true'};
const report={gate:'2A.1',mode:'LIVE_CONTROLLED_AB',timestamp:new Date().toISOString(),status:'RUNNING',maximumAttempts:3,noRetries:true,originalResolvedCount:4,comparedCandidateCount:3,candidates:candidates.map(f=>({idHash:hash(f.selected.id),name:f.selected.name,year:f.selected.year})),signals:{A:{idHash:hash(original.selected.id),name:original.selected.name,year:original.selected.year}},explainabilityReview:{requested:true,source:'https://github.com/qloo/docs-public/blob/main/reference/insights-api-deep-dive.md',basis:'Global Insights boolean for recommendation results; Movie is an allowed filter.type. The entity-specific table does not repeat this global feature. Acceptance and returned metadata are checked in this experiment.'},attempts:[],scenarios:{}};
// Atomic creation refuses every replay, including after a network failure or partial run.
await writeFile(file,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
const save=()=>writeFile(file,JSON.stringify(report,null,2)+'\n');
const nativeFetch=globalThis.fetch;
function redact(value,depth=0){
  if(depth>10)return 'DEPTH_LIMIT';
  if(typeof value==='string')return value.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,id=>'sha256:'+hash(id)).slice(0,1000);
  if(Array.isArray(value))return value.slice(0,30).map(v=>redact(v,depth+1));
  if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).slice(0,80).map(([k,v])=>[redact(k,depth+1),redact(v,depth+1)]));
  return value;
}
const redactParams=params=>Object.fromEntries(Object.entries(params).map(([k,v])=>[k,k.endsWith('entities')?v.split(',').map(hash).join(','):v]));
const client=createQlooClient({apiKey:key,baseUrl:process.env.QLOO_BASE_URL,fetchImpl:async(url,init)=>{
  if(report.attempts.length>=3)throw new QlooError('EXPERIMENT_BUDGET');
  const attempt={index:report.attempts.length+1,endpoint:url.pathname,parameters:redactParams(Object.fromEntries(url.searchParams)),timestamp:new Date().toISOString()};
  report.attempts.push(attempt);await save(); // Count before fetch, even DNS/timeout errors consume budget.
  try { const response=await nativeFetch(url,init);attempt.httpStatus=response.status;await save();return response; }
  catch(error){attempt.errorCategory=['TimeoutError','AbortError'].includes(error?.name)?'TIMEOUT':'NETWORK';await save();throw error;}
}});
async function get(path,params){
  try {const result=await client.get(path,params);if(JSON.stringify(result.data).includes(key))throw new QlooError('SECRET_ECHO');return result;}
  catch(error){report.attempts.at(-1).errorCategory=error instanceof QlooError?error.category:'LOCAL_ERROR';await save();throw error;}
}
function snapshot(data,status,params){
  if(data.success===false||!Array.isArray(data.results?.entities))throw new QlooError('INVALID_RESPONSE');
  const rows=data.results.entities.map((e,i)=>{
    if(typeof e.entity_id!=='string'||!uuid.test(e.entity_id)||!candidates.some(c=>c.selected.id===e.entity_id.toLowerCase())||!(e.subtype==='urn:entity:movie'||e.types?.includes('urn:entity:movie')))throw new QlooError('UNEXPECTED_ENTITY');
    return {idHash:hash(e.entity_id),rank:i+1,affinity:typeof e.query?.affinity==='number'?e.query.affinity:null,explainability:e.query?.explainability===undefined?null:redact(e.query.explainability),warnings:redact(e.warnings??e.warning??null)};
  });
  return {httpStatus:status,parameters:redactParams(params),coverage:{returned:rows.length,total:3},rows,aggregateExplainability:redact(data.query?.explainability??null),warnings:redact(data.warnings??data.warning??null)};
}
try {
  // A new cultural signal is necessary: earlier verified identities contain only Arrival and the candidates.
  const search=await get('/search',{query:'Paddington 2',take:'5'});
  if(!Array.isArray(search.data.results))throw new QlooError('INVALID_RESPONSE');
  const choices=search.data.results.filter(e=>(e.subtype==='urn:entity:movie'||e.types?.includes('urn:entity:movie'))&&typeof e.entity_id==='string'&&uuid.test(e.entity_id));
  const matches=choices.filter(e=>e.name?.trim().toLowerCase()==='paddington 2'&&e.properties?.release_year===2017);
  report.secondarySignalSearch={httpStatus:search.status,query:'Paddington 2',expectedYear:2017,movieChoices:choices.map(e=>({idHash:hash(e.entity_id),name:e.name,year:e.properties?.release_year??null})),exactMatches:matches.length};
  await save();
  if(matches.length!==1)throw new QlooError('AMBIGUOUS_SECOND_SIGNAL');
  const secondary=matches[0];
  assert.ok(!session.films.some(f=>f.selected.id===secondary.entity_id.toLowerCase()));
  report.signals.B={idHash:hash(secondary.entity_id),name:secondary.name,year:2017};
  const paramsA={...common,'signal.interests.entities':original.selected.id};
  const paramsB={...common,'signal.interests.entities':secondary.entity_id.toLowerCase()};
  assert.deepEqual(Object.keys(paramsA).filter(k=>paramsA[k]!==paramsB[k]),['signal.interests.entities']);
  for(const [label,params] of [['A',paramsA],['B',paramsB]]){
    const response=await get('/v2/insights',params);
    report.scenarios[label]=snapshot(response.data,response.status,params);
    await save();
    const s=report.scenarios[label];
    if(s.rows.length!==3||new Set(s.rows.map(r=>r.idHash)).size!==3||s.rows.some(r=>r.affinity===null))throw new QlooError('INSUFFICIENT_EVIDENCE');
  }
  report.comparison=compareAB(report);report.status=report.comparison.status;
  report.limitations=['One request per scenario; no statistical replication.','Differences are an observed response to a changed signal in this bounded request pair, not proof of causality or personal satisfaction.','Affinity is recorded as returned, not converted to a probability or percentage.'];
} catch(error){report.status='AT_RISK';report.stopReason=error instanceof QlooError?error.category:'LOCAL_VALIDATION_ERROR';}
await save();
console.log(JSON.stringify({status:report.status,attempts:report.attempts.map(a=>({index:a.index,endpoint:a.endpoint,httpStatus:a.httpStatus,errorCategory:a.errorCategory})),signals:report.signals,comparison:report.comparison,stopReason:report.stopReason}));
if(report.status!=='PASS')process.exitCode=2;
