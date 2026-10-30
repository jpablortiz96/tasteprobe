import test from 'node:test';
import assert from 'node:assert/strict';
import { createQlooClient } from '../lib/qloo/client.mjs';
import { failure } from '../lib/http.ts';
import { requestJson, requestDiagnostic } from '../lib/browser-request.ts';

test('transport diagnostics preserve only allowlisted nested DNS/TLS codes, never exception text', async () => {
  for (const code of ['ENOTFOUND', 'ECONNRESET', 'UNABLE_TO_VERIFY_LEAF_SIGNATURE']) {
    const client = createQlooClient({ apiKey: 'TEST_ONLY', fetchImpl: async () => {
      throw new TypeError('sensitive exception', { cause: Object.assign(new Error('sensitive URL'), { code }) });
    }});
    try { await client.get('/search', { query: 'Arrival' }); assert.fail(); }
    catch (e) {
      const response = failure(e), data = await response.json();
      assert.equal(response.status, 502);
      assert.equal(data.diagnostic.transportCode, code);
      assert.equal(data.diagnostic.upstreamStatus, null);
      assert.equal(data.diagnostic.upstreamAttempted, true);
      assert.match(data.diagnostic.requestId, /^[0-9a-f-]{36}$/);
      assert.ok(!JSON.stringify(data).includes('sensitive'));
    }
  }
});

test('unknown exception codes are redacted; upstream HTTP status remains distinguishable', async () => {
  const unknown = createQlooClient({apiKey:'TEST_ONLY',fetchImpl:async()=>{throw Object.assign(new Error('private'),{code:'private'});}});
  await assert.rejects(unknown.get('/search',{}),e=>e.category==='NETWORK'&&e.transportCode===null);
  for (const status of [401, 429, 503]) {
    const client = createQlooClient({ apiKey: 'TEST_ONLY', fetchImpl: async () => new Response('private', { status }) });
    try { await client.get('/search', {}); assert.fail(); }
    catch(e) { const data = await failure(e).json(); assert.equal(data.diagnostic.upstreamStatus, status); assert.ok(!JSON.stringify(data).includes('private')); }
  }
});

test('browser keeps safe request diagnostics and distinguishes local transport from backend transport',async()=>{
  await assert.rejects(requestJson('/api/entities/search',{},async()=>{throw new TypeError('private');}), e=>requestDiagnostic(e).layer==='browser-transport'&&requestDiagnostic(e).httpStatus===null);
  const requestId='00000000-0000-4000-8000-000000000001';
  await assert.rejects(requestJson('/api/entities/search',{},async()=>Response.json({error:'NETWORK',diagnostic:{requestId,upstreamAttempted:true,upstreamStatus:null,transportCode:'ENOTFOUND',headers:'private'}},{status:502})),e=>{
    assert.deepEqual(requestDiagnostic(e),{code:'NETWORK_ERROR',reason:'NETWORK',layer:'qloo-transport',httpStatus:502,requestId,upstreamAttempted:true,upstreamStatus:null,transportCode:'ENOTFOUND'});return true;
  });
});
