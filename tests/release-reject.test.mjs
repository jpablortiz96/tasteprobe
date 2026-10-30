import test from 'node:test';
import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {createAuditTools} from '../lib/audit-tools.ts';
import {rescuePassport} from '../lib/rescue-report.ts';

test('TEST ONLY: same-analysis Approve then Reject survives JSON export without provider calls or cross-analysis data',async()=>{
  const previous=globalThis.fetch;let requests=0;
  globalThis.fetch=async()=>{requests++;throw new Error('Network forbidden in offline acceptance');};
  try{
    const evaluation={status:'SUCCESS',coverage:{returned:3,total:3},
      rows:[['TEST alpha',2001,2,.25],['TEST beta',2002,1,.75],['TEST gamma',2003,3,null]].map(([name,year,qlooRank,affinity],i)=>({id:`TEST-${i}`,name,year,originalRank:i+1,qlooRank,shift:i+1-qlooRank,affinity})),
      identities:[{id:'TEST-SIGNAL',name:'TEST favorite',year:2000,searchedAt:'TEST ONLY'}],
      provenance:{source:'SYNTHETIC fixture',host:'offline.invalid',endpoint:'TEST ONLY',timestamp:'2026-10-30T00:00:00.000Z',parameters:{mode:'TEST'},requestId:'TEST-SAME-ANALYSIS',httpStatus:0},
      limitations:['TEST / SYNTHETIC / NOT LIVE. No Qloo identities or signatures.']};
    // Only this injected service supplies synthetic rows; the production transport is never used.
    const tools=createAuditTools({audit:async()=>structuredClone(evaluation)},()=>Date.parse('2026-10-30T00:00:00.000Z'));
    const session=tools.create({intent:'TEST ONLY controlled offline decision',caller:'human-ui'}).session;
    await tools.invoke(session,'evaluate_candidates',{interests:[],recommendations:[]});
    const executed=await tools.invoke(session,'propose_evidence_based_revision',{});
    // Label the injected test environment independently of production validation labels.
    const passport={...executed.passport,mode:'TEST_SYNTHETIC',liveValidation:'TEST_NOT_LIVE'};
    assert.equal(passport.proposal.status,'PROPOSED');
    assert.deepEqual(passport.proposal.after,['TEST beta','TEST alpha','TEST gamma']);
    const baseline=structuredClone(passport);
    const approved=JSON.parse(JSON.stringify(rescuePassport(passport,'APPROVED','2026-10-30T00:01:00.000Z')));
    const rejected=JSON.parse(JSON.stringify(rescuePassport(passport,'REJECTED','2026-10-30T00:02:00.000Z')));
    assert.equal(approved.decision.value,'APPROVED');assert.equal(rejected.decision.value,'REJECTED');
    for(const exported of [approved,rejected]){
      assert.deepEqual(exported.evaluation,baseline.evaluation);
      assert.deepEqual(exported.proposal,baseline.proposal);
      assert.equal(exported.proposal.sourceRequestId,'TEST-SAME-ANALYSIS');
      assert.equal(exported.evaluation.provenance.source,'SYNTHETIC fixture');
      assert.equal(exported.evaluation.provenance.httpStatus,0);
      assert.equal(exported.liveValidation,'TEST_NOT_LIVE');
      assert.equal(exported.decision.appliedAutomatically,false);
      assert.doesNotMatch(JSON.stringify(exported),/"proof"\s*:/);
    }
    assert.deepEqual(passport,baseline);assert.equal(requests,0);
    const other=tools.create({intent:'TEST OTHER ANALYSIS',caller:'human-ui'}).session;
    const empty=await tools.invoke(other,'propose_evidence_based_revision',{});
    const otherExport=rescuePassport(empty.passport,'REJECTED','2026-10-30T00:03:00.000Z');
    assert.equal(otherExport.evaluation,null);assert.equal(otherExport.proposal.status,'ABSTAINED');
    assert.equal(otherExport.proposal.sourceRequestId,null);assert.deepEqual(otherExport.proposal.after,[]);
    await writeFile('evidence/gate3-reject-offline.json',JSON.stringify({mode:'TEST_SYNTHETIC_NOT_LIVE',networkRequests:requests,approved,rejected,sourceUnchanged:true,independentSessionAbstained:true},null,2)+'\n');
  }finally{globalThis.fetch=previous;}
});
