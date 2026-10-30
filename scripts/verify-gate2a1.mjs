// Offline only; no fetch import, credential or provider calls.
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { compareAB } from './qloo-ab-compare.mjs';
const report=JSON.parse(await readFile('evidence/gate2a1-ab.json','utf8'));
assert.equal(report.maximumAttempts,3);assert.ok(report.attempts.length<=3);
assert.equal(report.noRetries,true);
assert.ok(report.attempts.filter(a=>a.endpoint==='/v2/insights').length<=2);
for(let i=0;i<report.attempts.length;i++)assert.equal(report.attempts[i].index,i+1);
const error=report.attempts.findIndex(a=>a.errorCategory||(a.httpStatus&&a.httpStatus!==200));
if(error>=0)assert.equal(report.attempts.length,error+1,'No further request may follow an error');
let result={status:'AT_RISK',reason:report.stopReason??'Incomplete experiment'};
if(report.scenarios.A&&report.scenarios.B){
  assert.equal(report.attempts.length,3);assert.ok(report.attempts.every(a=>a.httpStatus===200));
  assert.deepEqual(report.attempts[1].parameters,report.scenarios.A.parameters);
  assert.deepEqual(report.attempts[2].parameters,report.scenarios.B.parameters);
  assert.equal(report.secondarySignalSearch.exactMatches,1);
  assert.ok(!report.candidates.some(c=>c.idHash===report.signals.B.idHash));
  assert.equal(report.scenarios.A.parameters['signal.interests.entities'],report.signals.A.idHash);
  assert.equal(report.scenarios.B.parameters['signal.interests.entities'],report.signals.B.idHash);
  for(const scenario of Object.values(report.scenarios)){assert.equal(scenario.parameters['filter.type'],'urn:entity:movie');assert.equal(scenario.parameters['feature.explainability'],'true');assert.equal(scenario.parameters.take,'3');assert.equal(scenario.parameters['filter.results.entities'],report.candidates.map(c=>c.idHash).join(','));}
  result=compareAB(report);assert.deepEqual(result,report.comparison);assert.equal(result.status,report.status);
}
const explanationChecks=Object.fromEntries(Object.entries(report.scenarios).map(([label,s])=>{const aggregate=Object.values(s.aggregateExplainability?.['signal.interests.entities']??{});return [label,{perCandidateMatchesActiveSignal:s.rows.every(r=>{const values=r.explainability?.['signal.interests.entities'];return Array.isArray(values)&&values.length===1&&values[0].entity_id==='sha256:'+report.signals[label].idHash&&Number.isFinite(values[0].score);}),aggregateMatchesActiveSignal:aggregate.length>0&&aggregate.every(values=>Array.isArray(values)&&values.length>0&&values.every(v=>v.entity_id==='sha256:'+report.signals[label].idHash)),warningsReturned:s.warnings!==null||s.rows.some(r=>r.warnings!==null||Boolean(r.explainability?.warning))||Boolean(s.aggregateExplainability?.warning)}];}));
if(report.status==='PASS') {
  assert.equal(Object.keys(explanationChecks).length,2);
  assert.ok(Object.values(explanationChecks).every(c=>c.perCandidateMatchesActiveSignal&&c.aggregateMatchesActiveSignal));
  for(const s of Object.values(report.scenarios))s.rows.forEach((row,i)=>assert.equal(row.rank,i+1));
}
const prior=JSON.parse(await readFile('evidence/gate2a-upstream.json','utf8')).records.find(r=>r.endpoint==='/v2/insights'&&r.httpStatus===200);
const a=report.scenarios.A;
const priorARepeatObserved=Boolean(a&&prior&&a.rows.length===prior.entities.length&&a.rows.every((row,i)=>row.idHash===prior.entities[i].idHash&&row.affinity===prior.entities[i].returnedAffinity));
const verification={timestamp:new Date().toISOString(),mode:'OFFLINE_AB_VERIFICATION',verification:'PASS',experimentStatus:result.status,attemptCount:report.attempts.length,failedAttempts:report.attempts.filter(a=>a.errorCategory||(a.httpStatus&&a.httpStatus!==200)).length,insightsRequests:report.attempts.filter(a=>a.endpoint==='/v2/insights').length,comparison:result,explanationChecks,priorArrivalAffinityAndOrderRepeated:priorARepeatObserved,priorComparisonCaveat:'The prior request omitted feature.explainability; this is an observed repeat of affinity/order, not a further controlled request pair.',additionalHTTPRequests:0};
await writeFile('evidence/gate2a1-verification.json',JSON.stringify(verification,null,2)+'\n');
console.log(JSON.stringify(verification));
