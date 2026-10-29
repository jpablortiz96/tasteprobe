import test from 'node:test';
import assert from 'node:assert/strict';
import { createService } from '../lib/qloo/service.ts';
import { body } from '../lib/http.ts';

test('MOCK upstream cannot echo the API credential into a normalized response', async () => {
  const apiKey = 'MOCK_TEST_ONLY_NOT_A_CREDENTIAL';
  const service = createService({ apiKey, fetchImpl: async () => Response.json({ results: [{ entity_id: '00000000-0000-4000-8000-000000000001', name: apiKey, subtype: 'urn:entity:movie' }] }) });
  await assert.rejects(service.search({ query: 'MOCK' }), { category: 'INVALID_RESPONSE' });
});
test('stalled incoming request is bounded by the real body deadline', async () => {
  const request = new Request('http://localhost/api/audit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode('{')); } }), duplex: 'half' });
  // Keep Node alive: AbortSignal.timeout deliberately uses an unref timer.
  const keepAlive = setTimeout(() => {}, 4000);
  try { await assert.rejects(body(request)); } finally { clearTimeout(keepAlive); }
});
