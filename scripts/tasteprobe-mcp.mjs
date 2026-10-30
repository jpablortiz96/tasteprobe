// MCP stdio adapter. stdout contains JSON-RPC only. No provider credentials are read.
import {createMcpAdapter} from '../lib/mcp/adapter.mjs';
const raw=process.env.TASTEPROBE_MCP_QLOO_BUDGET??'0';
if(!/^\d{1,2}$/.test(raw))throw Error('INVALID_BUDGET');
const adapter=createMcpAdapter({baseUrl:process.env.TASTEPROBE_LOCAL_URL,maximumRequests:Number(raw)});
process.stdin.setEncoding('utf8');
let buffer='',messages=0,queue=Promise.resolve();
const send=message=>{if(message)process.stdout.write(JSON.stringify(message)+'\n');};
process.stdin.on('data',chunk=>{
  buffer+=chunk;
  if(Buffer.byteLength(buffer)>65536){send({jsonrpc:'2.0',id:null,error:{code:-32600,message:'Frame too large'}});process.stdin.destroy();return;}
  let index;while((index=buffer.indexOf('\n'))>=0){
    const line=buffer.slice(0,index).replace(/\r$/,'');buffer=buffer.slice(index+1);if(!line.trim())continue;
    if(++messages>64||Buffer.byteLength(line)>16384){send({jsonrpc:'2.0',id:null,error:{code:-32600,message:'Request limit'}});process.stdin.destroy();return;}
    queue=queue.then(async()=>{let m;try{m=JSON.parse(line);}catch{send({jsonrpc:'2.0',id:null,error:{code:-32700,message:'Parse error'}});return;}send(await adapter.handle(m));}).catch(()=>send({jsonrpc:'2.0',id:null,error:{code:-32603,message:'Internal error'}}));
  }
});
process.stdin.on('end',()=>{void queue;});
