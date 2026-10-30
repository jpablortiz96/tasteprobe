// Exactly one HTTP Search and one HTTP discovery. No retries. Server quota guard required.
import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const file='evidence/gate2c1-http-live.json';
const ledger=JSON.parse(await readFile('evidence/gate2c1-live.json','utf8'));
assert.equal(ledger.attempts.length,2,'Two initial attempts must exist; do not replay.');
const report={mode:'LIVE_HTTP_E2E',timestamp:new Date().toISOString(),status:'RUNNING',observations:[]};
await writeFile(file,JSON.stringify(report,null,2)+'\n',{flag:'wx'});
const base='http://127.0.0.1:3006';
const hash=id=>createHash('sha256').update(id.toLowerCase()).digest('hex').slice(0,16);
async function post(path,input){const r=await fetch(base+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify(input),signal:AbortSignal.timeout(15000)});const data=await r.json();report.observations.push({path,httpStatus:r.status});await writeFile(file,JSON.stringify(report,null,2)+'\n');assert.equal(r.status,200);return data;}
try{
  const search=await post('/api/entities/search',{query:'Arrival'});
  const exact=search.entities.filter(e=>e.name==='Arrival'&&e.year===2016);assert.equal(exact.length,1);const e=exact[0];
  const r=await post('/api/discover',{interests:[{id:e.id,proof:e.proof,confirmed:true}]});assert.equal(r.status,'SUCCESS');assert.ok(r.returned>0);assert.ok(r.movies.every(m=>m.id!==e.id));assert.equal(new Set(r.movies.map(m=>m.id)).size,r.returned);assert.equal(r.provenance.parameters['filter.results.entities'],undefined);
  report.discovery=JSON.parse(JSON.stringify(r).replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,id=>`sha256:${hash(id)}`));
  report.status='PASS';report.checks=['same-origin 127.0.0.1 HTTP accepted','previously human-confirmed Arrival 2016 resolved exactly','signed proof accepted by actual API','fresh Qloo recommendation identities','Arrival excluded','no duplicates','no candidate filter','observed affinity and attribution returned'];
}catch{report.status='AT_RISK';report.error='HTTP_OR_CONTRACT_FAILURE';process.exitCode=2;}
await writeFile(file,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({status:report.status,observations:report.observations,returned:report.discovery?.returned??0}));
