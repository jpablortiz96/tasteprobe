import assert from 'node:assert/strict';

export function compareAB(report) {
  const a=report.scenarios?.A, b=report.scenarios?.B;
  if(!a||!b)return {status:'INCONCLUSIVE',reason:'Both successful scenarios are required'};
  const keys=[...new Set([...Object.keys(a.parameters),...Object.keys(b.parameters)])].sort();
  const changedParameters=keys.filter(k=>a.parameters[k]!==b.parameters[k]);
  assert.deepEqual(changedParameters,['signal.interests.entities'],'Only the cultural signal may change');
  const ids=report.candidates.map(c=>c.idHash);
  assert.equal(new Set(ids).size,3,'Three distinct verified candidates required');
  for(const scenario of [a,b]) {
    if(scenario.httpStatus!==200||scenario.rows.length!==3||new Set(scenario.rows.map(r=>r.idHash)).size!==3||scenario.rows.some(r=>!ids.includes(r.idHash)||!Number.isFinite(r.affinity)))return {status:'INCONCLUSIVE',reason:'HTTP, exact coverage, identity or numeric affinity validation failed',changedParameters};
  }
  const differences=ids.map(id=>{const x=a.rows.find(r=>r.idHash===id),y=b.rows.find(r=>r.idHash===id);return {idHash:id,name:report.candidates.find(c=>c.idHash===id).name,rankA:x.rank,rankB:y.rank,affinityA:x.affinity,affinityB:y.affinity,affinityDeltaBMinusA:y.affinity-x.affinity,explainabilityChanged:JSON.stringify(x.explainability)!==JSON.stringify(y.explainability)};});
  const affinityChanged=differences.some(d=>d.affinityA!==d.affinityB);
  const orderChanged=differences.some(d=>d.rankA!==d.rankB);
  return {status:affinityChanged||orderChanged?'PASS':'INCONCLUSIVE',reason:affinityChanged||orderChanged?'Observed affinity or order differs under the changed cultural signal':'No observed affinity or order difference; explanation-only changes do not establish ranking sensitivity',changedParameters,affinityChanged,orderChanged,differences};
}
