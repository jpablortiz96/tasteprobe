import test from 'node:test';
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { writeFile } from 'node:fs/promises';
import { createReport } from '../../lib/report.ts';

test('MOCK HTTP integration: ambiguous Search → human confirmation → Insights → comparison → serialized report', { timeout: 30000 }, async t => {
  const socket = createServer(); socket.listen(0, '127.0.0.1'); await once(socket, 'listening');
  const port = socket.address().port; await new Promise(resolve => socket.close(resolve));
  const child = spawn(process.execPath, ['--import', new URL('./mock-qloo-preload.mjs', import.meta.url).href, 'node_modules/next/dist/bin/next', 'start', '--hostname', '127.0.0.1', '--port', String(port)], {
    cwd: process.cwd(), windowsHide: true,
    env: { ...process.env, QLOO_API_KEY: 'MOCK_TEST_ONLY_NOT_A_CREDENTIAL', QLOO_BASE_URL: 'https://hackathon.api.qloo.com', NEXT_TELEMETRY_DISABLED: '1' },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  let log = '';
  child.stdout.on('data', data => { log = (log + data).slice(-6000); });
  child.stderr.on('data', data => { log = (log + data).slice(-6000); });
  let spawnError;
  child.on('error', error => { spawnError = error; });
  t.after(async () => { if (child.exitCode === null && !spawnError) { const exit = once(child, 'exit'); child.kill(); await exit; } });
  const base = `http://127.0.0.1:${port}`;
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    if (spawnError) throw spawnError;
    if (child.exitCode !== null) throw Error(`MOCK server exited: ${log}`);
    try { const response = await fetch(base + '/api/health', { signal: AbortSignal.timeout(500) }); if (response.ok) { ready = true; break; } } catch {}
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  assert.ok(ready, `MOCK server did not start: ${log}`);
  const observations = [];
  async function post(path, input, status = 200) {
    const response = await fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input), signal: AbortSignal.timeout(5000) });
    const data = await response.json();
    assert.equal(response.status, status, JSON.stringify(data));
    observations.push({ path, httpStatus: response.status });
    return data;
  }
  const selected = [];
  const films = [];
  for (let i = 1; i <= 4; i++) {
    const response = await post('/api/entities/search', { query: `MOCK ${i}` });
    assert.equal(response.entities.length, i === 1 ? 2 : 1);
    assert.equal(response.selected, undefined);
    const entity = response.entities[0];
    selected.push({ id: entity.id, proof: entity.proof, confirmed: true });
    films.push({ role: i === 1 ? 'interest' : 'recommendation', selected: entity });
  }
  const input = { interests: selected.slice(0,1), recommendations: selected.slice(1) };
  const unconfirmed = structuredClone(input); unconfirmed.interests[0].confirmed = false;
  assert.equal((await post('/api/audit', unconfirmed, 400)).error, 'IDENTITY_REQUIRED');
  const complete = await post('/api/audit', input);
  assert.equal(complete.status, 'SUCCESS');
  assert.deepEqual(complete.rows.map(r => r.qlooRank), [2,3,1]);
  assert.deepEqual(complete.rows.map(r => r.shift), [-1,-1,2]);
  assert.ok(complete.rows.every(r => r.affinity === null));
  const report = JSON.parse(JSON.stringify(createReport({ interests: ['MOCK 1'], recommendations: ['MOCK 2','MOCK 3','MOCK 4'], films, result: complete, status: 'CONFIGURED_NOT_VERIFIED', lastError: null })));
  assert.equal(report.evaluation.provenance.endpoint, '/v2/insights');
  assert.equal(report.confirmedIdentities.length, 4);
  assert.ok(!JSON.stringify(report).includes('proof'));
  assert.ok(!JSON.stringify(report).includes('MOCK_TEST_ONLY_NOT_A_CREDENTIAL'));
  const partial = await post('/api/audit', input);
  assert.equal(partial.status, 'INSUFFICIENT_EVIDENCE');
  assert.deepEqual(partial.coverage, { returned: 1, total: 3 });
  assert.ok(partial.rows.every(r => r.shift === null));
  const empty = await post('/api/entities/search', { query: 'MOCK missing' });
  assert.deepEqual(empty.entities, []);
  assert.equal(empty.provenance.httpStatus, 404);
  assert.deepEqual(await post('/api/entities/search', { query: 'MOCK auth error' }, 502), { error: 'AUTH', abstained: true });
  assert.ok(!log.includes('MOCK_TEST_ONLY_NOT_A_CREDENTIAL'));
  // Persist only test assertions, never a response/report that could be mistaken for live evidence.
  await writeFile('evidence/gate1b-mock-integration.json', JSON.stringify({ mode: 'MOCK_INTEGRATION_TEST_ONLY', timestamp: new Date().toISOString(), liveQlooRequests: 0, browserUsed: false, checks: ['ambiguous choices', 'confirmation required', 'complete comparison', 'report serialization without proofs or credential', 'partial abstention', 'documented Search 404', 'redacted auth failure'], observations }, null, 2) + '\n');
});
