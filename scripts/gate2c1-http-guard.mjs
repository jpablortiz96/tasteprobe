// LIVE test-process quota guard. Never imported by application code.
import { readFile, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
const file='evidence/gate2c1-live.json';
const report=JSON.parse(await readFile(file,'utf8'));
assert.equal(report.status,'PASS');assert.equal(report.attempts.length,2,'Only the two remaining authorized attempts may run.');
const hash=id=>createHash('sha256').update(id.toLowerCase()).digest('hex').slice(0,16);
const redact=text=>text.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi,id=>`sha256:${hash(id)}`);
const nativeFetch=globalThis.fetch;
globalThis.fetch=async(input,init)=>{
  const url=new URL(input instanceof Request?input.url:String(input));
  if(url.origin!=='https://hackathon.api.qloo.com')return nativeFetch(input,init);
  if(report.attempts.length>=4)throw Error('LIVE_SMOKE_BUDGET_EXHAUSTED');
  const entry={index:report.attempts.length+1,timestamp:new Date().toISOString(),endpoint:url.pathname,parameters:JSON.parse(redact(JSON.stringify(Object.fromEntries(url.searchParams)))),httpStatus:null,via:'LOCAL_HTTP_E2E'};
  report.attempts.push(entry);await writeFile(file,JSON.stringify(report,null,2)+'\n');
  try{const response=await nativeFetch(input,init);entry.httpStatus=response.status;await writeFile(file,JSON.stringify(report,null,2)+'\n');return response;}
  catch(error){entry.error='NETWORK_OR_TIMEOUT';await writeFile(file,JSON.stringify(report,null,2)+'\n');throw error;}
};
