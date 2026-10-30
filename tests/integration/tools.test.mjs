import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn, spawnSync } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { writeFile } from 'node:fs/promises';

test('MOCK HTTP external caller executes all four tools, error abstention and passport export', {timeout:30000}, async t => {
  const socket=createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');const port=socket.address().port;await new Promise(r=>socket.close(r));
  const child=spawn(process.execPath,['--import',new URL('./mock-qloo-preload.mjs',import.meta.url).href,'node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{windowsHide:true,env:{...process.env,QLOO_API_KEY:'MOCK_TEST_ONLY_NOT_A_CREDENTIAL',QLOO_BASE_URL:'https://hackathon.api.qloo.com'},stdio:['ignore','pipe','pipe']});
  let log='';child.stdout.on('data',d=>{log=(log+d).slice(-4000);});child.stderr.on('data',d=>{log=(log+d).slice(-4000);});let spawnError;child.on('error',e=>{spawnError=e;});
  t.after(async()=>{if(child.exitCode===null&&!spawnError){const exit=once(child,'exit');child.kill();await exit;}});
  const base=`http://127.0.0.1:${port}`;
  let ready=false;for(let i=0;i<80;i++){if(spawnError)throw spawnError;if(child.exitCode!==null)throw Error(log);try{if((await fetch(base+'/api/health',{signal:AbortSignal.timeout(500)})).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}assert.ok(ready);
  const observations=[];
  async function post(input,status=200){const response=await fetch(base+'/api/tools',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input)});const data=await response.json();assert.equal(response.status,status,JSON.stringify(data));observations.push({action:input.action,tool:input.tool??null,httpStatus:response.status});return data;}
  const discovery=await (await fetch(base+'/api/tools')).json();assert.equal(discovery.tools.length,4);assert.equal(discovery.autonomousLLM,false);
  const bridge=spawnSync(process.execPath,['scripts/agent-tool.mjs'],{encoding:'utf8',windowsHide:true,input:JSON.stringify({action:'create',intent:'MOCK bridge invocation',caller:'external-agent'}),env:{...process.env,QLOO_API_KEY:'',TASTEPROBE_LOCAL_URL:base},timeout:5000});
  assert.equal(bridge.status,0,bridge.stderr);assert.ok(JSON.parse(bridge.stdout).session);
  const {session}=await post({action:'create',intent:'MOCK external caller audit',caller:'external-agent'});
  const invoke=(tool,args,status=200)=>post({action:'invoke',session,tool,arguments:args},status);
  const selections=[];
  for(let i=1;i<=5;i++){const {output}=await invoke('resolve_entities',{query:`MOCK ${i}`});if(i===1)assert.equal(output.ambiguity,'AMBIGUOUS');const e=output.entities[0];selections.push({id:e.id,proof:e.proof,confirmed:true});}
  const args={interests:selections.slice(0,1),recommendations:selections.slice(1,4)};
  const {output:result}=await invoke('evaluate_candidates',args);assert.equal(result.status,'SUCCESS');assert.equal(result.rows[0].affinity,0.2);
  const {output:challenge}=await invoke('compare_cultural_signals',{interestsA:args.interests,interestsB:selections.slice(4),recommendations:args.recommendations});assert.equal(challenge.status,'OBSERVED_EVIDENCE_DIFFERENCE');
  const {output:proposal}=await invoke('propose_evidence_based_revision',{});assert.deepEqual(proposal.after,['MOCK Film 4','MOCK Film 2','MOCK Film 3']);
  const passport=await post({action:'passport',session});assert.equal(passport.events.length,8);assert.equal(passport.budget.used,8);assert.ok(!JSON.stringify(passport).includes('"proof":'));assert.equal(passport.autonomousLLM,false);
  const blocked=await post({action:'create',intent:'MOCK failure',caller:'external-agent'});
  const failure=await post({action:'invoke',session:blocked.session,tool:'resolve_entities',arguments:{query:'MOCK auth error'}},502);assert.equal(failure.error,'AUTH');
  const stopped=await post({action:'invoke',session:blocked.session,tool:'propose_evidence_based_revision',arguments:{}},429);assert.equal(stopped.abstained,true);
  const failedPassport=await post({action:'passport',session:blocked.session});assert.equal(failedPassport.evaluation,null);assert.equal(failedPassport.events[0].outcome,'AUTH');
  const partialSession=await post({action:'create',intent:'MOCK incomplete evidence',caller:'external-agent'});
  const partialCall=(tool,args)=>post({action:'invoke',session:partialSession.session,tool,arguments:args});
  const {output:partialSearch}=await partialCall('resolve_entities',{query:'MOCK 6'});const e=partialSearch.entities[0];
  const {output:partial}=await partialCall('compare_cultural_signals',{interestsA:[{id:e.id,proof:e.proof,confirmed:true}],interestsB:selections.slice(4),recommendations:args.recommendations});
  assert.equal(partial.status,'INCONCLUSIVE');assert.equal(partial.b,null);
  assert.equal((await partialCall('propose_evidence_based_revision',{})).output.status,'ABSTAINED');
  assert.ok(!log.includes('MOCK_TEST_ONLY_NOT_A_CREDENTIAL'));
  await writeFile('evidence/gate2b-mock-integration.json',JSON.stringify({mode:'MOCK_HTTP_TEST_ONLY',timestamp:new Date().toISOString(),liveQlooRequests:0,hostedLLMCalls:0,autonomousAgent:false,toolsExecuted:passport.events.map(e=>e.tool),checks:['tool discovery','local stdin bridge','ambiguous choices require caller confirmation','signed identity evaluation','two controlled Insights','server-held evidence revision','passport without proofs','auth stops session','partial A stops B and proposal abstains','no model autonomy claimed'],observations},null,2)+'\n');
});
