// Optional LIVE-only test-process observation. No fixture or replacement provider exists here.
// Run only via Node --import for the bounded Gate 2A loopback server.
import { createHash } from 'node:crypto';
import { mkdir, writeFile, readFile } from 'node:fs/promises';

if (!process.env.QLOO_API_KEY?.trim()) throw new Error('BLOCKED_LIVE');
if (process.env.QLOO_BASE_URL !== 'https://hackathon.api.qloo.com') throw new Error('UNAPPROVED_HOST');
const nativeFetch = globalThis.fetch;
const records = await readFile('evidence/gate2a-upstream.json','utf8').then(text => JSON.parse(text).records).catch(error => { if(error.code==='ENOENT')return []; throw Error('INVALID_EXPERIMENT_LEDGER'); });
if(!Array.isArray(records))throw Error('INVALID_EXPERIMENT_LEDGER');
const hash = value => createHash('sha256').update(value).digest('hex').slice(0, 16);
const known = new Set(['results','entities','entity_id','name','type','types','subtype','properties','release_year','release_date','query','affinity','score','scores','explainability','success','filter','signal','interests','take','filter.type','signal.interests.entities','filter.results.entities']);
function shape(value, depth = 0) {
  if (depth > 5) return 'depth_limit';
  if (Array.isArray(value)) return { type: 'array', count: value.length, sample: value.slice(0,5).map(v => shape(v,depth+1)) };
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([key]) => known.has(key)).map(([key,v]) => [key,shape(v,depth+1)]));
  return value === null ? 'null' : typeof value;
}
async function save() {
  await mkdir('evidence', { recursive: true });
  await writeFile('evidence/gate2a-upstream.json', JSON.stringify({ mode: 'LIVE_PROVIDER_OBSERVATION', timestamp: new Date().toISOString(), maximumHTTPResponses: 5, maximumTransportAttempts: 8, records },null,2)+'\n');
}
globalThis.fetch = async (input, init) => {
  const url = new URL(input instanceof Request ? input.url : String(input));
  if (url.origin !== 'https://hackathon.api.qloo.com') return nativeFetch(input,init);
  if (!['/search','/v2/insights'].includes(url.pathname) || init?.method !== 'GET') throw new Error('INVALID_LIVE_REQUEST');
  if (records.filter(r=>r.httpStatus).length >= 5 || records.length >= 8) throw new Error('LIVE_EXPERIMENT_BUDGET');
  const record = { index: records.length+1, endpoint: url.pathname, parameterNames: [...url.searchParams.keys()], timestamp: new Date().toISOString() };
  records.push(record);
  await save();
  try {
    const response = await nativeFetch(input,init);
    record.httpStatus = response.status;
    if (response.ok) {
      const reader = response.clone().body.getReader();
      const chunks = []; let size = 0;
      try { while (true) { const { value,done } = await reader.read(); if (done) break; size+=value.byteLength; if(size>512000) throw new Error('RESPONSE_TOO_LARGE'); chunks.push(value); } }
      finally { await reader.cancel(); }
      const text = Buffer.concat(chunks).toString('utf8');
      if (text.includes(process.env.QLOO_API_KEY)) throw new Error('SECRET_ECHO');
      const data = JSON.parse(text);
      record.structure = shape(data);
      const entities = url.pathname === '/search' ? data.results : data.results?.entities;
      if (Array.isArray(entities)) record.entities = entities.slice(0,5).map(e => ({ idHash: typeof e.entity_id === 'string' ? hash(e.entity_id.toLowerCase()) : null, types: Array.isArray(e.types) ? e.types.filter(v => v==='urn:entity:movie') : [], subtypeMovie: e.subtype==='urn:entity:movie', hasYear: Number.isInteger(e.properties?.release_year), affinityFieldPresent: typeof e.query?.affinity==='number', ...(typeof e.query?.affinity==='number' ? { returnedAffinity: e.query.affinity } : {}) }));
      if (url.pathname === '/v2/insights') {
        const candidateIds = (url.searchParams.get('filter.results.entities') ?? '').split(',');
        record.sentSignalHashes = (url.searchParams.get('signal.interests.entities') ?? '').split(',').map(hash);
        record.sentCandidateHashes = candidateIds.map(hash);
        record.allReturnedIdsBelongToRequestedCandidates = Array.isArray(entities) && entities.every(e => candidateIds.includes(e.entity_id?.toLowerCase()));
        record.returnedCount = Array.isArray(entities) ? entities.length : null;
        record.requestParametersEchoed = Object.fromEntries(['filter.type','signal.interests.entities','filter.results.entities','take'].map(key => [key, data.query?.[key] === url.searchParams.get(key)]));
      }
    }
    await save();
    return response;
  } catch (error) {
    record.errorCategory = record.httpStatus ? 'OBSERVATION_ERROR' : 'NETWORK_NO_HTTP_RESPONSE';
    record.errorName = ['Error','TypeError','TimeoutError','AbortError'].includes(error?.name) ? error.name : 'REDACTED_ERROR';
    const code = error?.cause?.code ?? error?.code;
    if (typeof code==='string' && /^[A-Z_]{3,40}$/.test(code)) record.errorCode=code;
    await save();
    throw new Error(record.errorCategory);
  }
};
