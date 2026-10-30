// Evidence collection only: no provider requests, server restart or model session.
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
async function read(path){const b=await readFile(path);return b.toString(b[0]===255?'utf16le':'utf8').replace(/^\uFEFF/,'');}
const json=async p=>JSON.parse(await read(p));
assert.match(await read('evidence/gate2h2-tests.txt'),/pass 105/);
assert.match(await read('evidence/gate2h2-tests.txt'),/fail 0/);
assert.match(await read('evidence/gate2h2-integration.txt'),/pass 6/);
assert.match(await read('evidence/gate2h2-integration.txt'),/fail 0/);
assert.ok(!(await read('evidence/gate2h2-typecheck.txt')).includes('error TS'));
const build=await json('evidence/gate2h2-isolated-build.json');assert.equal(build.exitCode,0);assert.equal(build.activeBuildUnchanged,true);
const audit=await json('evidence/gate2h2-audit-pass.json');assert.equal(audit.metadata.vulnerabilities.total,0);await writeFile('evidence/gate2h2-audit-pass.json',JSON.stringify(audit,null,2)+'\n');
const mcp=await json('evidence/gate2h2-codex-mcp.json');assert.equal(mcp.status,'REAL_CODEX_MCP_INVOCATION');assert.equal(mcp.actualCompletedToolInvocations,1);assert.equal(mcp.liveQlooRequests,0);
const approved=await json('evidence/gate2h2-export-approved.json');assert.equal(approved.status,'VALID_COMPLETE_EVIDENCE');assert.equal(approved.decision.value,'APPROVED');
const scan=await json('evidence/gate2h2-client-scan.json');assert.equal(scan.credentialFindings,0);
let rejection='PENDING_MATCHING_FILE';try{const comparison=await json('evidence/gate2h2-passport-comparison.json');if(comparison.status==='PASS')rejection='PASS';}catch{}
const report={timestamp:new Date().toISOString(),gate:'2H.2',status:'AT_RISK',functionalAudit:'PASS_OPERATOR_AND_APPROVED_EXPORT_3_OF_3',mcpAgent:'PASS_REAL_CODEX_INVOCATION_AND_ABSTENTION',reject:rejection,desktop:'PASS_OPERATOR_CONFIRMED',mobile:'PASS_OPERATOR_CONFIRMED',screenshots:'NONE_RECEIVED',tests:{passed:105,previous101Retained:true},httpE2E:{passed:6,mode:'MOCK_ONLY'},typecheck:'PASS',isolatedBuild:'PASS_ACTIVE_BUILD_UNCHANGED',auditVulnerabilities:0,clientFilesScanned:scan.filesScanned,credentialFindings:0,codexQlooRequests:0,tmdbDiagnosticRequests:2,budget:'AT_LEAST_15_OPERATOR_COSTED_OPERATIONS_OBSERVED_VS_10_DISCLOSED_AUTHORIZATION_MAXIMA_NO_REMAINING_ALLOWANCE',publicDeployment:'NOT_AUTHORIZED',limitations:['Current rejection candidate file belongs to another partial Her (2024) analysis; must not be relabeled as rejection of the correct case','No independent browser screenshots captured by Codex','No full autonomous Qloo agent evaluation claimed','A public release still needs source-license selection and shared usage controls']};
await writeFile('evidence/gate2h2-verification.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report,null,2));
