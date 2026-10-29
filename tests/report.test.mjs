import test from 'node:test';
import assert from 'node:assert/strict';
import { createReport } from '../lib/report.ts';

test('blocked export keeps original input order and abstains without fabricated evidence', () => {
  const report = createReport({ interests: ['MOCK Seed'], recommendations: ['MOCK C', 'MOCK A', 'MOCK B'], films: [], result: null, status: 'BLOCKED_LIVE', lastError: null });
  assert.equal(report.status, 'BLOCKED_LIVE');
  assert.equal(report.liveResponseReceived, false);
  assert.equal(report.evaluation, null);
  assert.deepEqual(report.originalInput.recommendations, ['MOCK C', 'MOCK A', 'MOCK B']);
  assert.ok(report.limitations[0].includes('No live evaluation'));
});
test('export strips identity authorization proofs and marks a failed evaluation as abstained', () => {
  const report = createReport({ interests: [], recommendations: [], films: [{ role: 'interest', selected: { id: 'MOCK id', name: 'MOCK film', year: null, type: 'urn:entity:movie', proof: 'MOCK_PROOF_MUST_NOT_BE_EXPORTED' } }], result: null, status: 'CONFIGURED_NOT_VERIFIED', lastError: 'TIMEOUT' });
  assert.equal(report.status, 'ABSTAINED');
  assert.ok(!JSON.stringify(report).includes('MOCK_PROOF'));
  assert.equal(report.lastError, 'TIMEOUT');
});
