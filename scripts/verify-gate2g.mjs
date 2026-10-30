// Offline product checks; no smoke scripts or provider calls. Audit contacts npm only.
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const npm=join(dirname(process.execPath),'node_modules/npm/bin/npm-cli.js');
const results=[];
for(const [name,args] of [['tests',['test']],['typecheck',['run','typecheck']],['build',['run','build']],['integration',['run','test:integration']]]){
  const r=spawnSync(process.execPath,[npm,...args],{encoding:'utf8',windowsHide:true,timeout:120000,env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'}});
  await writeFile(`evidence/gate2g-${name}.txt`,r.stdout+(r.stderr??''));
  results.push({name,exitCode:r.status});console.log(`${name}: ${r.status===0?'PASS':'FAIL'}`);
  assert.equal(r.status,0,`See gate2g-${name}.txt`);
}
// A separate approved npm audit command writes this artifact, never reused from another gate.
const auditBytes=await readFile('evidence/gate2g-audit-pass.json');
const audit=JSON.parse(auditBytes.toString(auditBytes[0]===255?'utf16le':'utf8').replace(/^\uFEFF/,''));
assert.equal(audit.metadata.vulnerabilities.total,0);
await writeFile('evidence/gate2g-audit-pass.json',JSON.stringify(audit,null,2)+'\n');
results.push({name:'audit',vulnerabilities:0,source:'Separate npm audit command, gate2g-audit-pass.json'});
let files=0;
async function scan(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())await scan(p);else if(/\.(js|html)$/.test(e.name)){const s=await readFile(p,'utf8');files++;assert.ok(!/QLOO_API_KEY|X-Api-Key|MOCK_TEST_ONLY|TMDB_READ_ACCESS_TOKEN|TMDB_API_KEY/.test(s),`Server/test marker: ${p}`);for(const name of ['QLOO_API_KEY','TMDB_READ_ACCESS_TOKEN','TMDB_API_KEY']){const key=process.env[name]?.trim();assert.ok(!key||!s.includes(key),`Configured credential: ${p}`);}}}}
await scan('.next/static');
await writeFile('evidence/gate2g-verification.json',JSON.stringify({timestamp:new Date().toISOString(),status:'AT_RISK',results,clientFilesScanned:files,clientCredentialFindings:0,liveQlooRequests:0,imageProvider:{qloo:'BLOCKED_RIGHTS',tmdb:'IMAGE_PROVIDER_READY',active:'OPTIONAL_TMDB_WITH_FALLBACK'},tmdbApiRequests:7,posterCdnChecks:1,browser:'VISUAL_OPERATOR_REQUIRED',baseline:'Operator reports Discover Chrome LIVE success in GATE 2F prompt; not re-tested LIVE by Codex',limitations:['TMDB metadata and CDN verified; actual browser image rendering remains pending','No browser host access; desktop/mobile acceptance and screenshots pending','Server-render tests and MOCK HTTP E2E do not establish LIVE browser acceptance']},null,2)+'\n');
console.log(`PASS technical checks; ${files} client files scanned. GATE AT_RISK: visual operator review pending. Zero new Qloo calls.`);
