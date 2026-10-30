// Offline export checks only; does not render a browser or contact Qloo.
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { createSyntheticRequest } from '../lib/synthetic-review.ts';
import { discoveryPassport } from '../lib/discovery-report.ts';
const checks=[];
for(const scenario of ['success','empty','error','timeout']){
  const request=createSyntheticRequest(scenario);
  const favorites=(await request('/api/entities/search')).entities;
  let result=null, outcome;
  try{result=await request('/api/discover');outcome=result.status;}catch(e){outcome=e.message;}
  const passport=JSON.parse(JSON.stringify(discoveryPassport(favorites,result,[{operation:'discover_movies',timestamp:new Date().toISOString(),outcome,summary:'SYNTHETIC offline export check'}],true)));
  assert.equal(passport.evidenceMode,'SYNTHETIC');assert.equal(passport.liveValidation,'SYNTHETIC_NOT_LIVE');
  assert.ok(!JSON.stringify(passport).includes('SYNTHETIC_REVIEW_NOT_A_SIGNATURE'));
  if(scenario==='error'||scenario==='timeout'){assert.equal(passport.discovery,null);assert.ok(passport.limitations.length);}
  checks.push({scenario,result:'PASS',recommendations:passport.discovery?.returned??null,limitationsPresent:passport.limitations.length>0,syntheticNotLive:true});
}
await writeFile('evidence/gate2d-passport.json',JSON.stringify({timestamp:new Date().toISOString(),mode:'OFFLINE_SYNTHETIC_EXPORT_CHECK',liveQlooRequests:0,browserDownloadClicked:false,checks},null,2)+'\n');
console.log('PASS: four synthetic report scenarios; no invented results or exported proofs. Browser download still requires operator review.');
