// Five bounded HTTP tool calls against the real loopback app; no provider injection.
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { createReport } from '../lib/report.ts';

const base = 'http://127.0.0.1:3003';
const privateFile = 'evidence/private/gate2a-identities.json';
const hash = id => createHash('sha256').update(id).digest('hex').slice(0,16);
const plan = [{ query:'Arrival', year:2016, role:'interest' },{ query:'Interstellar', year:2014, role:'recommendation' },{ query:'Blade Runner 2049', year:2017, role:'recommendation' },{ query:'Her', year:2013, role:'recommendation' }];
const args = process.argv.slice(2);
const evidenceFile = 'evidence/gate2a-live.json';
const previous = await readFile(evidenceFile,'utf8').then(JSON.parse).catch(error => { if(error.code==='ENOENT')return null; throw Error('INVALID_EXPERIMENT_LEDGER'); });
if(previous?.status==='SUCCESS')throw Error('EXPERIMENT_COMPLETE_NO_REPLAY');
async function post(path,input) {
  const ledger=JSON.parse(await readFile('evidence/gate2a-upstream.json','utf8'));
  if(ledger.records.filter(r=>r.httpStatus).length>=5)throw Error('LIVE_EXPERIMENT_BUDGET');
  const response = await fetch(base+path,{ method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(input),signal:AbortSignal.timeout(12000) });
  const data = await response.json();
  if (!response.ok) throw new Error(typeof data.error==='string'?data.error:'LOCAL_HTTP_ERROR');
  return data;
}
if (args.includes('--resolve')) {
  const evidence = { mode:'LIVE_HTTP_TOOL_FLOW', timestamp:new Date().toISOString(), status:'RESOLVING', expectedHumanConfirmation:'User confirmed exact titles, years and original order in conversation', identities:[], maximumToolCalls:5 };
  const films = [];
  try {
    for (const p of plan) {
      const data = await post('/api/entities/search',{ query:p.query });
      const matches = data.entities.filter(e => e.name.toLocaleLowerCase()===p.query.toLocaleLowerCase() && e.year===p.year);
      evidence.identities.push({ title:p.query, year:p.year, role:p.role, upstreamHttpStatus:data.provenance.httpStatus, returnedChoices:data.entities.length, exactMatches:matches.length, ...(matches.length===1?{ idHash:hash(matches[0].id) }:{}) });
      if(matches.length!==1) throw new Error('IDENTITY_CONFIRMATION_REQUIRED');
      films.push({ ...p, selected:matches[0] });
    }
    evidence.status='IDENTITIES_RESOLVED_REQUIRES_EXECUTION_OPT_IN';
    await mkdir('evidence/private',{recursive:true});
    await writeFile(privateFile,JSON.stringify({ timestamp:new Date().toISOString(),films }));
  } catch(error) { evidence.status='AT_RISK'; evidence.errorCategory=error.message; }
  await writeFile(evidenceFile,JSON.stringify(evidence,null,2)+'\n');
  console.log(JSON.stringify({ status:evidence.status, errorCategory:evidence.errorCategory, identities:evidence.identities }));
  if(evidence.status==='AT_RISK')process.exitCode=2;
} else if (args.includes('--audit-confirmed-identities')) {
  const session=JSON.parse(await readFile(privateFile,'utf8'));
  if(Date.now()-Date.parse(session.timestamp)>20*60000)throw Error('IDENTITY_EXPIRED');
  const selection=f=>({id:f.selected.id,proof:f.selected.proof,confirmed:true});
  const result=await post('/api/audit',{interests:session.films.filter(f=>f.role==='interest').map(selection),recommendations:session.films.filter(f=>f.role==='recommendation').map(selection)});
  const report=createReport({interests:['Arrival'],recommendations:plan.slice(1).map(p=>p.query),films:session.films,result,status:'CONFIGURED_NOT_VERIFIED',lastError:null});
  // Public evidence uses hashes consistently in all ID-bearing fields. No proof or credential is exported.
  const redacted=structuredClone(report);
  redacted.confirmedIdentities.forEach(e=>{e.id=hash(e.id);});
  redacted.evaluation.rows.forEach(e=>{e.id=hash(e.id);});
  redacted.evaluation.identities.forEach(e=>{e.id=hash(e.id);});
  for(const key of ['signal.interests.entities','filter.results.entities'])redacted.evaluation.provenance.parameters[key]=redacted.evaluation.provenance.parameters[key].split(',').map(hash).join(',');
  await writeFile('evidence/gate2a-report-redacted.json',JSON.stringify({mode:'LIVE_REDACTED_REPORT',identifiers:'SHA256 prefix, not Qloo IDs',...redacted},null,2)+'\n');
  const evidence=JSON.parse(await readFile(evidenceFile,'utf8'));
  evidence.status=result.status;
  evidence.audit={upstreamHttpStatus:result.provenance.httpStatus,coverage:result.coverage,rows:result.rows.map(r=>({idHash:hash(r.id),name:r.name,originalRank:r.originalRank,qlooRank:r.qlooRank,shift:r.shift,affinity:r.affinity})), report:'evidence/gate2a-report-redacted.json'};
  await writeFile(evidenceFile,JSON.stringify(evidence,null,2)+'\n');
  console.log(JSON.stringify({status:result.status,coverage:result.coverage,rows:evidence.audit.rows}));
} else throw Error('Explicit --resolve or --audit-confirmed-identities required');
