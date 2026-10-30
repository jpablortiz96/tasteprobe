// One-shot authorized smoke: max FOUR attempts including failures; planned use is TWO.
import { writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { createService } from '../lib/qloo/service.ts';
import { QlooError } from '../lib/qloo/client.mjs';
if (!process.argv.includes('--execute')) throw Error('EXECUTION_OPT_IN_REQUIRED');
const key = process.env.QLOO_API_KEY?.trim();
assert.ok(key, 'BLOCKED_LIVE');
const file = 'evidence/gate2c1-live.json';
const report = { gate: '2C.1', timestamp: new Date().toISOString(), mode: 'LIVE_DISCOVERY', maximumAttempts: 4, status: 'RUNNING', noRetries: true, attempts: [], discovery: null, imageMetadata: [] };
await writeFile(file, JSON.stringify(report, null, 2) + '\n', { flag: 'wx' });
const hash = id => createHash('sha256').update(id.toLowerCase()).digest('hex').slice(0,16);
const redact = data => JSON.parse(JSON.stringify(data).replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, id => `sha256:${hash(id)}`));
async function save() { const text = JSON.stringify(report,null,2)+'\n'; assert.ok(!text.includes(key)); await writeFile(file,text); }
const service = createService({ apiKey: key, baseUrl: process.env.QLOO_BASE_URL, fetchImpl: async (url, init) => {
  assert.ok(report.attempts.length < 4, 'REQUEST_BUDGET');
  const entry = { index: report.attempts.length+1, timestamp: new Date().toISOString(), endpoint: url.pathname, parameters: redact(Object.fromEntries(url.searchParams)), httpStatus: null };
  report.attempts.push(entry); await save();
  const response = await fetch(url,init); entry.httpStatus = response.status; await save();
  if (response.ok && url.pathname === '/v2/insights') {
    const raw = await response.clone().json();
    report.imageMetadata = (raw.results?.entities ?? []).map(e => ({ idHash: typeof e.entity_id === 'string' ? hash(e.entity_id) : null, imagePresent: Boolean(e.properties?.image), imageType: typeof e.properties?.image }));
    report.rawValidation = { returned: raw.results?.entities?.length ?? null, favoritePresent: (raw.results?.entities ?? []).some(e => e.entity_id?.toLowerCase() === String(url.searchParams.get('signal.interests.entities')).toLowerCase()), duplicateIDs: new Set((raw.results?.entities ?? []).map(e=>e.entity_id)).size !== (raw.results?.entities ?? []).length };
    await save();
  }
  return response;
} });
try {
  const search = await service.search({ query: 'Arrival' });
  const exact = search.entities.filter(e => e.name === 'Arrival' && e.year === 2016);
  assert.equal(exact.length,1,'IDENTITY_AMBIGUOUS');
  // The user already explicitly confirmed Arrival (2016); no other title/year is accepted.
  const e = exact[0];
  const discovery = await service.discover({ interests: [{ id: e.id, proof: e.proof, confirmed: true }] });
  report.discovery = redact(discovery);
  assert.equal(discovery.status,'SUCCESS'); assert.ok(discovery.returned > 0);
  assert.ok(discovery.movies.every(m => m.id !== e.id));
  assert.equal(report.rawValidation.favoritePresent,false);assert.equal(report.rawValidation.duplicateIDs,false);
  report.status='PASS'; await save();
  console.log(JSON.stringify({status:report.status,attempts:report.attempts.length,httpStatuses:report.attempts.map(a=>a.httpStatus),movies:discovery.movies.map(({name,year,affinity})=>({name,year,affinity})),favoriteExcluded:true}));
} catch (error) {
  report.status='AT_RISK';report.error=error instanceof QlooError ? error.category : 'VALIDATION_FAILED';await save();console.log(JSON.stringify({status:report.status,error:report.error,attempts:report.attempts.length}));process.exitCode=2;
}
