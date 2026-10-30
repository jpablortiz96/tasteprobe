// Collect completed command evidence and scan the active build. No builds or provider calls.
import {readFile,readdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import assert from 'node:assert/strict';
async function read(path){const b=await readFile(path);return b.toString(b[0]===255?'utf16le':'utf8').replace(/^\uFEFF/,'');}
const tests=await read('evidence/gate2h-tests.txt'),integration=await read('evidence/gate2h-integration.txt');
assert.match(tests,/pass 101/);assert.match(tests,/fail 0/);assert.match(integration,/pass 6/);assert.match(integration,/fail 0/);
const typecheck=await read('evidence/gate2h-typecheck.txt');assert.ok(typecheck.includes('tsc --noEmit')&&!/error TS\d/.test(typecheck));
const build=await read('evidence/gate2h-build.txt');assert.ok(build.includes('/api/visuals')&&build.includes('/api/tools')&&!build.includes('Failed to compile'));
const audit=JSON.parse(await read('evidence/gate2h-audit-pass.json'));assert.equal(audit.metadata.vulnerabilities.total,0);await writeFile('evidence/gate2h-audit-pass.json',JSON.stringify(audit,null,2)+'\n');
let files=0;
async function scan(dir){for(const e of await readdir(dir,{withFileTypes:true})){const p=join(dir,e.name);if(e.isDirectory())await scan(p);else if(/\.(js|html)$/.test(e.name)){const s=await read(p);files++;assert.ok(!/QLOO_API_KEY|X-Api-Key|MOCK_TEST_ONLY|TMDB_READ_ACCESS_TOKEN|TMDB_API_KEY/.test(s));for(const name of ['QLOO_API_KEY','TMDB_READ_ACCESS_TOKEN','TMDB_API_KEY']){const secret=process.env[name]?.trim();assert.ok(!secret||!s.includes(secret));}}}}
await scan('.next/static');
const liveProbe=[];for(const path of ['/api/health','/api/tools','/review']){const r=await fetch('http://127.0.0.1:3000'+path,{signal:AbortSignal.timeout(3000)});liveProbe.push({path,httpStatus:r.status});}
assert.deepEqual(liveProbe.map(p=>p.httpStatus),[200,200,404]);
await writeFile('evidence/gate2h-verification.json',JSON.stringify({timestamp:new Date().toISOString(),status:'AT_RISK',tests:{unit:101,passed:101,retainedPrevious:96},httpE2E:{passed:6,mode:'MOCK_ONLY'},typecheck:'PASS',build:'PASS',auditVulnerabilities:0,clientFilesScanned:files,credentialFindings:0,localServer:liveProbe,liveQlooRequests:0,liveTmdbRequests:0,budget:'UNRECONCILED_OPERATOR_ADDITIONAL_COUNT_UNKNOWN',auditBrowser:'LIVE_ACCEPTANCE_PENDING',visualQA:'VISUAL_OPERATOR_REQUIRED',agent:'Real Codex-directed zero-Qloo bridge invocation: ABSTAINED; no hosted autonomy claimed',screenshots:'NONE_SUPPLIED_OR_CAPTURED'},null,2)+'\n');
console.log(`PASS collected technical checks; ${files} client files scanned. Gate AT_RISK: real Audit/browser/download acceptance pending.`);
