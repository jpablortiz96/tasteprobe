import assert from 'node:assert/strict';
import { readFile, writeFile } from 'node:fs/promises';
const ledger=JSON.parse(await readFile('evidence/gate2c1-live.json','utf8'));
const http=JSON.parse(await readFile('evidence/gate2c1-http-live.json','utf8'));
assert.equal(ledger.status,'PASS');assert.equal(http.status,'PASS');assert.equal(ledger.attempts.length,4);
assert.ok(ledger.attempts.every(a=>a.httpStatus===200));assert.equal(ledger.noRetries,true);
for(const response of [ledger.discovery,http.discovery]){
  const p=response.provenance.parameters;
  assert.equal(p['filter.type'],'urn:entity:movie');assert.equal(p['signal.interests.entities'],p['filter.exclude.entities']);assert.equal(p.take,'8');assert.equal(p['feature.explainability'],'true');assert.equal(p['filter.results.entities'],undefined);
  assert.equal(response.returned,response.movies.length);assert.ok(response.returned>0&&response.returned<=8);
  assert.equal(new Set(response.movies.map(m=>m.id)).size,response.returned);
  assert.ok(response.movies.every((m,i)=>m.id!==p['filter.exclude.entities']&&m.type==='urn:entity:movie'&&m.rank===i+1&&(m.affinity===null||typeof m.affinity==='number')));
  assert.ok(!JSON.stringify(response).includes('"proof":'));
}
const repeatSame=ledger.discovery.movies.every((m,i)=>m.id===http.discovery.movies[i]?.id&&m.affinity===http.discovery.movies[i]?.affinity);
const report={timestamp:new Date().toISOString(),verification:'PASS',mode:'OFFLINE_ONLY',liveAttemptsObserved:4,httpStatuses:ledger.attempts.map(a=>a.httpStatus),sameOrderAndAffinitiesRepeated:repeatSame,discoveryCount:http.discovery.returned,favoriteExcluded:true,duplicateIDs:false,allParametersVerified:true,explainabilityCount:http.discovery.movies.filter(m=>m.explainability!=null).length,additionalHTTPRequests:0};
await writeFile('evidence/gate2c1-live-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report));
