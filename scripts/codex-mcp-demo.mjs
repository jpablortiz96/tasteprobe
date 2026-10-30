// Real Codex client verification. Keep only public MCP events/final answer; discard reasoning.
import {spawn,spawnSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import {join,resolve} from 'node:path';
const launcher=join(process.env.APPDATA,'npm/node_modules/@openai/codex/bin/codex.js');
const script=resolve('scripts/tasteprobe-mcp.mjs').replaceAll('\\','/');
const command=process.execPath.replaceAll('\\','/');
const config=`mcp_servers.tasteprobe={command=${JSON.stringify(command)},args=[${JSON.stringify(script)}],env={TASTEPROBE_LOCAL_URL="http://127.0.0.1:3000",TASTEPROBE_MCP_QLOO_BUDGET="0"},required=true,startup_timeout_sec=10,tool_timeout_sec=30}`;
const auth=spawnSync(process.execPath,[launcher,'login','status'],{encoding:'utf8',windowsHide:true,timeout:10000});
const loggedIn=auth.status===0;
const report={timestamp:new Date().toISOString(),client:'Codex CLI',loggedIn,authMode:loggedIn?(/chatgpt/i.test(auth.stdout+auth.stderr)?'EXISTING_CHATGPT_LOGIN':'EXISTING_CODEX_AUTH'):'UNAVAILABLE',configuration:'EPHEMERAL_CLI_OVERRIDE_NO_GLOBAL_WRITE',qlooBudget:0,liveQlooRequests:0,events:[],finalAnswer:null,exitCode:null,status:'PENDING'};
if(!loggedIn){report.status='BLOCKED_CODEX_AUTH';await writeFile('evidence/gate2h2-codex-mcp.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report));process.exit(1);}
const inspected=spawnSync(process.execPath,[launcher,'-c',config,'mcp','get','tasteprobe','--json'],{encoding:'utf8',windowsHide:true,timeout:10000});
if(inspected.status!==0)throw Error('CODEX_MCP_CONFIG_REJECTED');
const workspace=resolve('evidence/private/codex-mcp-demo');await mkdir(workspace,{recursive:true});
const prompt='Demonstrate the connected TasteProbe MCP tool. No verified Qloo evaluation exists in this new connection. Discover the TasteProbe tools, choose the appropriate tool to determine whether an evidence-based revision is possible, and invoke it once. Qloo allowance is ZERO: do not search, evaluate or compare signals. Use only the TasteProbe MCP tool, no shell, files, web or other tools. Report the actual structured status and what can be concluded. Never invent a recommendation, affinity or model reasoning transcript.';
const args=[launcher,'exec','--ignore-user-config','--ephemeral','--skip-git-repo-check','--sandbox','read-only','--cd',workspace,'--json','--color','never','-c',config,'-c','features.shell_tool=false','-c','features.unified_exec=false','-c','features.apps=false','-c','features.browser_use=false','-c','features.computer_use=false','-c','features.multi_agent=false',prompt];
const child=spawn(process.execPath,args,{windowsHide:true,stdio:['ignore','pipe','pipe']});
let buffer='',stderrBytes=0;
child.stderr.on('data',d=>{stderrBytes+=d.length;});
child.stdout.setEncoding('utf8');
child.stdout.on('data',chunk=>{
  buffer+=chunk;let i;while((i=buffer.indexOf('\n'))>=0){const line=buffer.slice(0,i);buffer=buffer.slice(i+1);let e;try{e=JSON.parse(line);}catch{continue;}
    const item=e.item;
    if(item?.type==='mcp_tool_call'){
      const safe={event:e.type,server:item.server,tool:item.tool,arguments:item.arguments,status:item.status};
      let value=item.result?.structuredContent;
      if(!value&&item.result?.content){for(const c of item.result.content){if(c.type==='text'){try{const data=JSON.parse(c.text);if(data.output)value=data;}catch{ /* Ignore non-structured text. */ }}}}
      if(value)safe.result={output:value.output,liveValidation:value.passport?.liveValidation,toolEvents:value.passport?.events,connectionBudget:value.connectionBudget};
      if(item.error)safe.error='MCP_TOOL_ERROR';report.events.push(safe);
    }
    if(item?.type==='agent_message'&&e.type==='item.completed')report.finalAnswer=item.text;
    if(e.type==='error')report.events.push({event:'CODEX_ERROR',details:'REDACTED'});
  }
});
const timer=setTimeout(()=>child.kill(),120000);
await new Promise((done,reject)=>{child.on('error',reject);child.on('exit',code=>{report.exitCode=code;done();});});clearTimeout(timer);
report.stderrBytesDiscarded=stderrBytes;
report.status=report.exitCode===0&&report.events.some(e=>e.tool==='propose_evidence_based_revision'&&e.result?.output?.status==='ABSTAINED'&&e.result?.connectionBudget?.used===0&&(e.event==='item.completed'||e.status==='completed'))?'REAL_CODEX_MCP_INVOCATION':'AGENT_EXECUTION_PENDING';
await writeFile('evidence/gate2h2-codex-mcp.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
if(report.status!=='REAL_CODEX_MCP_INVOCATION')process.exitCode=1;
