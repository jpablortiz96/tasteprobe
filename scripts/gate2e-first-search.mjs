// One authorized local HTTP Search. No retries. Never prints identities, proofs or credentials.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
const file = 'evidence/gate2e-live.json';
let previous;
try { previous = JSON.parse(await readFile(file, 'utf8')); } catch(e) { if(e.code !== 'ENOENT') throw e; }
if(previous) throw Error('FIRST_SEARCH_ALREADY_RESERVED_DO_NOT_REPEAT');
const base = 'http://127.0.0.1:3000';
const report = { timestamp: new Date().toISOString(), authorizedMaximum: 7, reservedAttempts: 1, attempts: [{ index: 1, method: 'POST', url: base+'/api/entities/search', origin: base, host: '127.0.0.1:3000', query: 'Arrival', localStatus: null, upstreamStatus: null, category: null, diagnostic: null }], status: 'RESERVED' };
await writeFile(file, JSON.stringify(report, null, 2)+'\n');
const entry=report.attempts[0];
try {
  const response=await fetch(entry.url,{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({query:'Arrival'}),signal:AbortSignal.timeout(20000)});
  entry.localStatus=response.status;
  const data=await response.json();
  if(!response.ok){
    entry.category=typeof data.error==='string'?data.error:'INVALID_RESPONSE';
    const d=data.diagnostic;
    entry.diagnostic=d?{requestId:d.requestId,transportCode:d.transportCode,upstreamAttempted:d.upstreamAttempted,upstreamStatus:d.upstreamStatus}:null;
    entry.upstreamStatus=d?.upstreamStatus??null;
    report.status='STOPPED_ERROR_NO_RETRY';
  } else {
    entry.upstreamStatus=data.provenance?.httpStatus??null;
    entry.matches=data.entities?.map(({name,year,type})=>({name,year,type}));
    await mkdir('evidence/private',{recursive:true});
    await writeFile('evidence/private/gate2e-search.json',JSON.stringify(data));
    report.status='AWAITING_BROWSER_IDENTITY_CONFIRMATION';
  }
}catch(e){entry.category='LOCAL_REQUEST_FAILED';report.status='STOPPED_ERROR_NO_RETRY';}
await writeFile(file,JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report,null,2));
