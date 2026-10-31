// Read-only Git history scan. Never prints blob contents, credentials, or matching lines.
import {spawnSync} from 'node:child_process';
import {writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
function git(args){const r=spawnSync('git',['-c','core.excludesfile=',...args],{encoding:'utf8',windowsHide:true,maxBuffer:32*1024*1024});assert.equal(r.status,0,'Git read failed');return r.stdout;}
const lines=git(['rev-list','--objects','--all']).trim().split('\n').filter(Boolean);
const gate=process.argv[2]??'gate3';assert.ok(['gate3','gate4a','gate4b','gate4b2'].includes(gate));
const secrets=['QLOO_API_KEY','TMDB_READ_ACCESS_TOKEN','TMDB_API_KEY','TASTEPROBE_SIGNING_SECRET','UPSTASH_REDIS_REST_TOKEN'].map(k=>process.env[k]?.trim()).filter(Boolean);
const findings=[];let blobs=0;
for(const line of lines){
  const [oid,...path]=line.split(' ');
  if(git(['cat-file','-t',oid]).trim()!=='blob')continue;
  blobs++;
  const content=git(['cat-file','blob',oid]);
  if(secrets.some(value=>content.includes(value)) || /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(content) || /(?:sk-proj-|ghp_|github_pat_)[A-Za-z0-9_]{24,}/.test(content))findings.push({object:oid,path:path.join(' '),reason:'credential-like material; content withheld'});
  if(/(?:^|\/)\.env(?:\..*)?$/.test(path.join(' '))&&!path.join(' ').endsWith('.env.example'))findings.push({object:oid,path:path.join(' '),reason:'environment file tracked in reachable history'});
}
const report={timestamp:new Date().toISOString(),head:git(['rev-parse','HEAD']).trim(),commits:Number(git(['rev-list','--count','--all']).trim()),objects:lines.length,blobs,configuredCredentialsChecked:secrets.length,findings,scope:'All locally reachable refs; pattern and exact configured-secret matches. Not a guarantee against unknown formats, dangling objects, external clones or previously rotated unknown credentials.'};
await writeFile(`evidence/${gate}-history-review.json`,JSON.stringify(report,null,2)+'\n');
assert.equal(findings.length,0,'History findings exist; read report paths only, never print matching contents');
console.log(`PASS: ${report.commits} commits, ${blobs} blobs; no secret findings.`);
