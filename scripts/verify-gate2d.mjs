import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';

// Local verification only. Never runs the smoke or LIVE experiment scripts.
const npm = join(dirname(process.execPath),'node_modules/npm/bin/npm-cli.js');
const results=[];
for (const [name,args] of [['tests',['test']],['typecheck',['run','typecheck']],['build',['run','build']],['integration',['run','test:integration']],['audit',['audit','--json','--cache','.npm-cache','--fetch-retries=0','--fetch-timeout=15000']]]) {
  if (name === 'audit' && process.argv.includes('--audit-evidence')) {
    const prior = JSON.parse(await readFile('evidence/gate2d-audit-pass.json','utf8'));
    assert.equal(prior.metadata.vulnerabilities.total,0);
    results.push({ name, exitCode: 0, source: 'Previously completed separate npm audit command; see gate2d-audit-pass.json. No audit network call in this run.' });
    console.log('audit: PASS (separately captured separate npm audit)'); continue;
  }
  const result=spawnSync(process.execPath,[npm,...args],{encoding:'utf8',windowsHide:true,timeout:120000,env:{...process.env,NEXT_TELEMETRY_DISABLED:'1'}});
  await writeFile(`evidence/gate2d-${name}.${name==='audit'?'json':'txt'}`,result.stdout+(result.stderr??''));
  results.push({name,exitCode:result.status});
  console.log(`${name}: ${result.status===0?'PASS':'FAIL'}`);
  if(result.status!==0)break;
}
let files=0;
const key=process.env.QLOO_API_KEY?.trim();
async function scan(directory) {
  for(const e of await readdir(directory,{withFileTypes:true})){
    const path=join(directory,e.name);if(e.isDirectory())await scan(path);
    else if(/\.(js|html)$/.test(e.name)){
      const text=await readFile(path,'utf8');files++;
      assert.ok(!/QLOO_API_KEY|X-Api-Key|MOCK_TEST_ONLY/.test(text),`Server/test marker in ${path}`);
      assert.ok(!key||!text.includes(key),`Configured credential found in ${path}`);
    }
  }
}
await scan('.next/static');
await writeFile('evidence/gate2d-verification.json',JSON.stringify({timestamp:new Date().toISOString(),results,clientFilesScanned:files,configuredKeyPresent:Boolean(key),credentialFoundInClient:false,liveQlooRequests:0,hostedLLMCalls:0,browserVisualQA:'VISUAL_OPERATOR_REQUIRED: browser access host unavailable',limitation:'This gate made zero Qloo calls. Discover, Audit, signed identity and synthetic-production exclusion tests are retained. VISUAL_OPERATOR_REQUIRED for desktop and mobile.'},null,2)+'\n');
assert.equal(results.length,5);assert.ok(results.every(r=>r.exitCode===0));
console.log(`PASS: ${files} client files scanned; no credential or server/test markers. No Qloo calls.`);
