import assert from 'node:assert/strict';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Exercises the real compiled Next server. Never enables a key or mocks an API route.
const base = 'http://127.0.0.1:3000';
const checks = [];
async function check(name, path, init, status, expected) {
  const response = await fetch(base + path, { ...init, signal: AbortSignal.timeout(5000) });
  const text = await response.text();
  assert.equal(response.status, status, name);
  assert.equal(response.headers.get('cache-control'), 'no-store', name);
  assert.deepEqual(JSON.parse(text), expected, name);
  checks.push({ name, path, httpStatus: response.status, result: 'PASS' });
}
const health = await fetch(base + '/api/health').then(r => r.json());
assert.equal(health.status, 'BLOCKED_LIVE', 'This zero-live-call verification requires an unconfigured local server.');
await check('health abstains', '/api/health', {}, 200, { status: 'BLOCKED_LIVE', liveVerified: false });
const post = value => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) });
await check('missing credential', '/api/entities/search', post({ query: 'Arrival' }), 503, { error: 'BLOCKED_LIVE', abstained: true });
await check('invalid search', '/api/entities/search', post({ query: 'x' }), 400, { error: 'INVALID_INPUT', abstained: true });
await check('invalid audit', '/api/audit', post({ interests: [], recommendations: [] }), 400, { error: 'INVALID_INPUT', abstained: true });
await check('fabricated identity', '/api/audit', post({ interests: [{ id: '00000000-0000-4000-8000-000000000001', proof: 'fake', confirmed: true }], recommendations: [{}, {}, {}] }), 400, { error: 'IDENTITY_REQUIRED', abstained: true });
await check('cross-origin refusal', '/api/entities/search', { ...post({ query: 'Arrival' }), headers: { 'Content-Type': 'application/json', Origin: 'https://untrusted.example' } }, 403, { error: 'FORBIDDEN_ORIGIN', abstained: true });
await check('oversized body', '/api/entities/search', { ...post({}), body: 'x'.repeat(8193) }, 400, { error: 'INVALID_INPUT', abstained: true });
const page = await fetch(base).then(r => { assert.equal(r.status, 200); return r.text(); });
assert.ok(page.includes('A good list.') && page.includes('Movies you love') && page.includes('Confirm movies'));
assert.ok(!page.includes('QLOO_API_KEY'));
checks.push({ name: 'rendered HTML contains product workflow', path: '/', httpStatus: 200, result: 'PASS' });
let chunks = 0;
async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await scan(path);
    else if (/\.(js|html)$/.test(entry.name)) {
      const content = await readFile(path, 'utf8');
      assert.ok(!/QLOO_API_KEY|X-Api-Key|hackathon\.api\.qloo\.com|MOCK_TEST_ONLY_NOT_A_CREDENTIAL/.test(content), `Server transport or test fixture leaked into ${path}`);
      chunks++;
    }
  }
}
await scan('.next/static');
checks.push({ name: 'client build excludes server credentials, transport and MOCK fixtures', chunks, result: 'PASS' });
await writeFile('evidence/gate1a-routes.json', JSON.stringify({ timestamp: new Date().toISOString(), liveQlooRequests: 0, checks, browserVisualQA: 'BLOCKED: integrated browser unavailable; native app authorization timed out' }, null, 2) + '\n');
console.log(`${checks.length} checks PASS; ${chunks} client files scanned; 0 live Qloo calls. Evidence: evidence/gate1a-routes.json`);
