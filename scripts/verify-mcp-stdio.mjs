// Protocol acceptance only, not an LLM/agent claim. Existing local tool is invoked at zero Qloo cost.
import {spawn} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const child=spawn(process.execPath,['scripts/tasteprobe-mcp.mjs'],{windowsHide:true,stdio:['pipe','pipe','pipe'],env:{...process.env,TASTEPROBE_LOCAL_URL:'http://127.0.0.1:3000',TASTEPROBE_MCP_QLOO_BUDGET:'0'}});
let text='',stderrBytes=0;const waiting=new Map();
child.stderr.on('data',d=>{stderrBytes+=d.length;});
child.stdout.setEncoding('utf8');child.stdout.on('data',d=>{text+=d;let i;while((i=text.indexOf('\n'))>=0){const line=text.slice(0,i);text=text.slice(i+1);const r=JSON.parse(line);waiting.get(r.id)?.(r);waiting.delete(r.id);}});
const send=(id,method,params)=>new Promise((resolve,reject)=>{const timeout=setTimeout(()=>{waiting.delete(id);reject(Error('MCP_TIMEOUT'));},6000);waiting.set(id,r=>{clearTimeout(timeout);resolve(r);});child.stdin.write(JSON.stringify({jsonrpc:'2.0',id,method,params})+'\n');});
try{
  const init=await send(1,'initialize',{protocolVersion:'2025-06-18',clientInfo:{name:'TasteProbeProtocolVerifier',version:'1'},capabilities:{}});assert.equal(init.result.serverInfo.name,'tasteprobe');
  child.stdin.write(JSON.stringify({jsonrpc:'2.0',method:'notifications/initialized'})+'\n');
  const list=await send(2,'tools/list',{});assert.equal(list.result.tools.length,4);
  const blocked=await send(3,'tools/call',{name:'resolve_entities',arguments:{query:'Arrival'}});assert.equal(blocked.result.structuredContent.status,'BLOCKED_BUDGET');
  const abstention=await send(4,'tools/call',{name:'propose_evidence_based_revision',arguments:{}});assert.equal(abstention.result.isError,false);assert.equal(abstention.result.structuredContent.output.status,'ABSTAINED');
  const safe={timestamp:new Date().toISOString(),status:'MCP_PROTOCOL_PASS',transport:'MCP_STDIO_JSON_RPC',protocolVersion:init.result.protocolVersion,discoveredTools:list.result.tools.map(t=>t.name),blockedSearch:'BLOCKED_BUDGET',operation:'propose_evidence_based_revision',arguments:{},output:abstention.result.structuredContent.output,toolEvents:abstention.result.structuredContent.passport.events,connectionBudget:abstention.result.structuredContent.connectionBudget,stderrBytes,liveQlooRequests:0,limitation:'Protocol client test only; actual Codex model execution is separately recorded.'};
  await writeFile('evidence/gate2h2-mcp-stdio.json',JSON.stringify(safe,null,2)+'\n');console.log(JSON.stringify(safe,null,2));
}finally{child.kill();}
