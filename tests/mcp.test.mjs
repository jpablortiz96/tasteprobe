import test from 'node:test';
import assert from 'node:assert/strict';
import {createMcpAdapter,localOrigin} from '../lib/mcp/adapter.mjs';
const rpc=(id,method,params)=>({jsonrpc:'2.0',id,method,params});
async function ready(a){const r=await a.handle(rpc(1,'initialize',{protocolVersion:'2025-06-18',capabilities:{},clientInfo:{name:'MOCK_CLIENT',version:'1'}}));assert.equal(r.result.serverInfo.name,'tasteprobe');await a.handle({jsonrpc:'2.0',method:'notifications/initialized'});}
test('MCP initialize, discovery and strict loopback transport; high-cost tools blocked at default zero allowance',async()=>{
  for(const url of ['https://127.0.0.1:3000','http://evil.example','http://localhost:3000/api/tools','http://user@localhost:3000','http://localhost:3000/?x=1'])assert.throws(()=>localOrigin(url));
  let calls=0;const a=createMcpAdapter({fetchImpl:async()=>{calls++;throw Error();}});
  assert.equal((await a.handle(rpc(1,'tools/list'))).error.code,-32002);await ready(a);
  const list=(await a.handle(rpc(2,'tools/list'))).result.tools;assert.equal(list.length,4);assert.ok(list.every(t=>t.inputSchema.type==='object'));
  for(const name of ['resolve_entities','evaluate_candidates','compare_cultural_signals'])assert.equal((await a.handle(rpc(3,'tools/call',{name,arguments:{}}))).result.structuredContent.status,'BLOCKED_BUDGET');
  assert.equal(calls,0);
});
test('MCP invokes real existing operation schema and returns structured abstention; no session value exposed',async()=>{
  const operations=[];
  const a=createMcpAdapter({fetchImpl:async(url,options)=>{assert.equal(url,'http://127.0.0.1:3000/api/tools');assert.equal(options.redirect,'error');assert.ok(options.signal);const op=JSON.parse(options.body);operations.push(op);return Response.json(op.action==='create'?{session:'MOCK_PRIVATE_SESSION'}:{output:{status:'ABSTAINED',before:[],after:[]},passport:{events:[{tool:'propose_evidence_based_revision',outcome:'COMPLETED'}],budget:{used:0}}});}});
  await ready(a);const r=await a.handle(rpc(2,'tools/call',{name:'propose_evidence_based_revision',arguments:{}}));assert.equal(r.result.structuredContent.output.status,'ABSTAINED');assert.equal(operations.length,2);assert.equal(r.result.structuredContent.connectionBudget.used,0);assert.ok(!JSON.stringify(r).includes('MOCK_PRIVATE_SESSION'));
});
test('MCP notifications cannot invoke tools; bad arguments and upstream errors fail closed without retries',async()=>{
  let calls=0;const a=createMcpAdapter({fetchImpl:async()=>{calls++;throw new Error('secret exception');}});await ready(a);
  assert.equal(await a.handle({jsonrpc:'2.0',method:'tools/call',params:{name:'propose_evidence_based_revision'}}),null);assert.equal(calls,0);
  assert.equal((await a.handle(rpc(2,'tools/call',{name:'arbitrary_url'}))).error.code,-32602);
  const r=await a.handle(rpc(3,'tools/call',{name:'propose_evidence_based_revision',arguments:{}}));assert.equal(r.result.isError,true);assert.ok(!JSON.stringify(r).includes('secret'));await a.handle(rpc(4,'tools/call',{name:'propose_evidence_based_revision'}));assert.equal(calls,1);
});

test('MCP explicit allowance reserves provider cost before dispatch and never permits an extra operation',async()=>{
  let calls=0;const a=createMcpAdapter({maximumRequests:1,fetchImpl:async(url,options)=>{calls++;const v=JSON.parse(options.body);return Response.json(v.action==='create'?{session:'MOCK_SESSION'}:{output:{entities:[],confirmationRequired:true},passport:{events:[]}});}});await ready(a);
  assert.equal((await a.handle(rpc(2,'tools/call',{name:'compare_cultural_signals',arguments:{}}))).result.structuredContent.status,'BLOCKED_BUDGET');assert.equal(calls,0);
  const searched=await a.handle(rpc(3,'tools/call',{name:'resolve_entities',arguments:{query:'MOCK'}}));assert.equal(searched.result.structuredContent.connectionBudget.used,1);assert.equal(calls,2);
  assert.equal((await a.handle(rpc(4,'tools/call',{name:'resolve_entities',arguments:{query:'MOCK'}}))).result.structuredContent.status,'BLOCKED_BUDGET');assert.equal(calls,2);
});
