// Codex's bounded bridge invocation. No Search/Insights; the revision tool has zero Qloo cost.
import {spawnSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
function bridge(operation){
  const r=spawnSync(process.execPath,['scripts/agent-tool.mjs'],{encoding:'utf8',windowsHide:true,input:JSON.stringify(operation),timeout:6000,env:{...process.env,QLOO_API_KEY:'',TASTEPROBE_LOCAL_URL:'http://127.0.0.1:3000'}});
  assert.equal(r.status,0,'Local bridge failed; no retry');return JSON.parse(r.stdout);
}
const created=bridge({action:'create',caller:'external-agent',intent:'Gate 2H: request an evidence-based revision only; abstain without verified evidence. No Qloo requests authorized.'});
const invoked=bridge({action:'invoke',session:created.session,tool:'propose_evidence_based_revision',arguments:{}});
assert.equal(invoked.output.status,'ABSTAINED');assert.equal(invoked.passport.budget.used,0);assert.equal(invoked.passport.events.length,1);
const report={timestamp:new Date().toISOString(),caller:'Codex via scripts/agent-tool.mjs',mode:'REAL_LOCAL_TOOL_INVOCATION_NO_PROVIDER_CALL',tool:'propose_evidence_based_revision',arguments:{},session:'REDACTED',output:invoked.output,events:invoked.passport.events,budget:invoked.passport.budget,agentUse:'Retain abstention; no revised ranking is proposed and no Search or Insights is invoked while LIVE budget is unknown.',autonomousLLM:false,hostedModelCalls:0,liveQlooRequests:0,toolInterface:'TOOL_INTERFACE_PASS',limitation:'Actual Codex-directed bridge invocation demonstrates missing-evidence handling, not autonomous LLM planning or a complete LIVE agent audit.'};
await writeFile('evidence/gate2h-agent-invocation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
