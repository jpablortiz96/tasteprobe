import { createHmac, randomBytes, randomUUID, timingSafeEqual } from 'node:crypto';
import { createQlooClient, QlooError, QLOO_BASE_URL } from './client.mjs';
import type { AuditResult, Entity, Provenance, DiscoveryResult, DiscoveredMovie } from '../contracts.ts';

const MOVIE = 'urn:entity:movie';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const TTL = 30 * 60_000;
type Identity = Omit<Entity, 'proof'> & { searchedAt: string; expires: number };
export function object(value: unknown, category = 'INVALID_INPUT'): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new QlooError(category);
  return value as Record<string, unknown>;
}
function exact(value: Record<string, unknown>, keys: string[]) {
  if (Object.keys(value).some(k => !keys.includes(k))) throw new QlooError('INVALID_INPUT');
}
function upstreamEntity(value: unknown): Omit<Entity, 'proof'> {
  const e = object(value, 'INVALID_RESPONSE'), p = e.properties && typeof e.properties === 'object' ? object(e.properties, 'INVALID_RESPONSE') : {};
  if (typeof e.entity_id !== 'string' || !UUID.test(e.entity_id) || typeof e.name !== 'string' || !e.name.trim() || e.name.length > 200 || /[\u0000-\u001f\u007f]/.test(e.name)) throw new QlooError('INVALID_RESPONSE');
  if (e.subtype !== MOVIE && e.type !== MOVIE && !(Array.isArray(e.types) && e.types.includes(MOVIE))) throw new QlooError('INVALID_RESPONSE');
  const year = Number.isInteger(p.release_year) && Number(p.release_year) >= 1880 && Number(p.release_year) <= 2100 ? Number(p.release_year) : null;
  return { id: e.entity_id.toLowerCase(), name: e.name.trim(), year, type: MOVIE };
}

export function createService({ apiKey, fetchImpl = fetch, now = Date.now, secret = randomBytes(32), baseUrl = QLOO_BASE_URL }: { apiKey?: string; fetchImpl?: typeof fetch; now?: () => number; secret?: Buffer; baseUrl?: string } = {}) {
  let total = 0, windowStart = now(), minuteCalls = 0;
  const sign = (payload: string) => createHmac('sha256', secret).update(payload).digest('base64url');
  function proof(identity: Identity) { const payload = Buffer.from(JSON.stringify(identity)).toString('base64url'); return `${payload}.${sign(payload)}`; }
  function verify(value: unknown): Identity {
    const v = object(value); exact(v, ['id', 'proof', 'confirmed']);
    if (v.confirmed !== true || typeof v.id !== 'string' || !UUID.test(v.id) || typeof v.proof !== 'string' || v.proof.length > 2000) throw new QlooError('IDENTITY_REQUIRED');
    const [payload, signature, extra] = v.proof.split('.');
    const expected = Buffer.from(sign(payload || ''));
    const supplied = Buffer.from(signature || '');
    if (extra || supplied.length !== expected.length || !timingSafeEqual(supplied, expected)) throw new QlooError('IDENTITY_REQUIRED');
    let identity: Identity;
    try { identity = JSON.parse(Buffer.from(payload, 'base64url').toString()) as Identity; } catch { throw new QlooError('IDENTITY_REQUIRED'); }
    if (identity.id !== v.id || identity.type !== MOVIE || identity.expires <= now()) throw new QlooError('IDENTITY_EXPIRED');
    return identity;
  }
  async function request(path: string, parameters: Record<string, string>) {
    if (!apiKey?.trim()) throw new QlooError('BLOCKED_LIVE');
    if (now() - windowStart >= 60_000) { windowStart = now(); minuteCalls = 0; }
    // Shared across requests in this local process; failed upstream calls also consume budget.
    if (total >= 60 || minuteCalls >= 12) throw new QlooError('REQUEST_BUDGET');
    total++; minuteCalls++;
    const client = createQlooClient({ apiKey, fetchImpl, baseUrl });
    let response;
    try { response = await client.get(path, parameters); }
    catch (error) {
      // Search explicitly documents 404 as no results. Do not apply this to Insights.
      if (path !== '/search' || !(error instanceof QlooError) || error.status !== 404) throw error;
      response = { data: { results: [] }, status: 404 };
    }
    const { data, status } = response;
    if (data.success === false || JSON.stringify(data).includes(apiKey)) throw new QlooError('INVALID_RESPONSE');
    const provenance: Provenance = { source: 'Qloo REST', host: QLOO_BASE_URL, endpoint: path, parameters, timestamp: new Date(now()).toISOString(), requestId: randomUUID(), httpStatus: status };
    return { data, provenance };
  }
  return {
    health() { return { status: apiKey?.trim() ? 'CONFIGURED_NOT_VERIFIED' : 'BLOCKED_LIVE', liveVerified: false } as const; },
    async search(input: unknown) {
      const v = object(input); exact(v, ['query']);
      if (typeof v.query !== 'string' || v.query.trim().length < 2 || v.query.trim().length > 80 || /[\u0000-\u001f\u007f<>]/.test(v.query)) throw new QlooError('INVALID_INPUT');
      // types enum spelling is not specified by the retrieved Search reference. Query broadly,
      // then require an explicit movie type on each result instead of guessing a parameter.
      const { data, provenance } = await request('/search', { query: v.query.trim(), take: '5' });
      if (!Array.isArray(data.results)) throw new QlooError('INVALID_RESPONSE');
      const entities: Entity[] = [];
      for (const raw of data.results.slice(0, 5)) {
        const e = object(raw, 'INVALID_RESPONSE');
        if (e.subtype !== MOVIE && e.type !== MOVIE && !(Array.isArray(e.types) && e.types.includes(MOVIE))) continue;
        const entity = upstreamEntity(e);
        if (entities.some(x => x.id === entity.id)) throw new QlooError('INVALID_RESPONSE');
        entities.push({ ...entity, proof: proof({ ...entity, searchedAt: provenance.timestamp, expires: now() + TTL }) });
      }
      return { entities, provenance };
    },
    async discover(input: unknown): Promise<DiscoveryResult> {
      const v = object(input); exact(v, ['interests']);
      if (!Array.isArray(v.interests) || v.interests.length < 1 || v.interests.length > 3) throw new QlooError('INVALID_INPUT');
      const favorites = v.interests.map(verify);
      if (new Set(favorites.map(e => e.id)).size !== favorites.length) throw new QlooError('DUPLICATE_ENTITY');
      const ids = favorites.map(e => e.id).join(',');
      const { data, provenance } = await request('/v2/insights', { 'filter.type': MOVIE, 'signal.interests.entities': ids, 'filter.exclude.entities': ids, take: '8', 'feature.explainability': 'true' });
      const results = object(data.results, 'INVALID_RESPONSE');
      if (!Array.isArray(results.entities) || results.entities.length > 8) throw new QlooError('INVALID_RESPONSE');
      const movies: DiscoveredMovie[] = [];
      for (const raw of results.entities) {
        try {
          const e = upstreamEntity(raw), q = object(raw).query == null ? {} : object(object(raw).query, 'INVALID_RESPONSE');
          if (q.affinity != null && (typeof q.affinity !== 'number' || !Number.isFinite(q.affinity))) continue;
          const sameMovie = (a: { id: string; name: string; year: number | null }) => a.id === e.id || (a.name.toLocaleLowerCase() === e.name.toLocaleLowerCase() && (a.year === e.year || a.year === null || e.year === null));
          if (favorites.some(sameMovie) || movies.some(sameMovie)) continue;
          movies.push({ ...e, rank: movies.length + 1, affinity: typeof q.affinity === 'number' ? q.affinity : null, explainability: q.explainability ?? null });
        } catch (error) { if (!(error instanceof QlooError) || error.category !== 'INVALID_RESPONSE') throw error; }
      }
      return { mode: 'DISCOVER', status: movies.length ? 'SUCCESS' : 'INSUFFICIENT_EVIDENCE', movies, favorites: favorites.map(({ id, name, year, searchedAt }) => ({ id, name, year, searchedAt })), provenance, requested: 8, returned: movies.length, discarded: results.entities.length - movies.length, warnings: data.warnings ?? null, explainability: data.query && typeof data.query === 'object' ? object(data.query).explainability ?? null : null, limitations: ['Qloo cultural affinity is an observed relationship, not a probability of satisfaction.', 'Only validated movie identities returned by Qloo are shown; favorites and duplicates are excluded.', 'Missing affinity or explainability remains unavailable; no plot, genre or causal explanation is invented.', 'Poster display rights are not verified; graphic placeholders are used.', ...(movies.length < 8 ? ['Fewer than eight valid movies were returned. No additional movies were invented.'] : [])] };
    },
    async audit(input: unknown, includeEvidence = false): Promise<AuditResult> {
      const v = object(input); exact(v, ['interests', 'recommendations']);
      if (!Array.isArray(v.interests) || v.interests.length < 1 || v.interests.length > 3 || !Array.isArray(v.recommendations) || v.recommendations.length < 3 || v.recommendations.length > 5) throw new QlooError('INVALID_INPUT');
      const interests = v.interests.map(verify), candidates = v.recommendations.map(verify);
      const all = [...interests, ...candidates];
      if (new Set(all.map(e => e.id)).size !== all.length) throw new QlooError('DUPLICATE_ENTITY');
      const { data, provenance } = await request('/v2/insights', { 'filter.type': MOVIE, 'signal.interests.entities': interests.map(e => e.id).join(','), 'filter.results.entities': candidates.map(e => e.id).join(','), take: String(candidates.length), ...(includeEvidence ? { 'feature.explainability': 'true' } : {}) });
      const results = object(data.results, 'INVALID_RESPONSE');
      if (!Array.isArray(results.entities) || results.entities.length > candidates.length) throw new QlooError('INVALID_RESPONSE');
      const returned = results.entities.map(upstreamEntity);
      if (new Set(returned.map(e => e.id)).size !== returned.length || returned.some(e => !candidates.some(c => c.id === e.id))) throw new QlooError('INVALID_RESPONSE');
      const complete = returned.length === candidates.length;
      const queries = results.entities.map(raw => { const e = object(raw, 'INVALID_RESPONSE'); return e.query == null ? {} : object(e.query, 'INVALID_RESPONSE'); });
      if (includeEvidence && queries.some(q => q.affinity != null && (typeof q.affinity !== 'number' || !Number.isFinite(q.affinity)))) throw new QlooError('INVALID_RESPONSE');
      return {
        status: complete ? 'SUCCESS' : 'INSUFFICIENT_EVIDENCE',
        coverage: { returned: returned.length, total: candidates.length },
        rows: candidates.map((e, i) => { const index = returned.findIndex(r => r.id === e.id); return { id: e.id, name: e.name, year: e.year, originalRank: i + 1, qlooRank: index < 0 ? null : index + 1, shift: complete ? i - index : null, affinity: includeEvidence && index >= 0 && typeof queries[index].affinity === 'number' ? queries[index].affinity as number : null }; }),
        provenance,
        identities: all.map(({ id, name, year, searchedAt }) => ({ id, name, year, searchedAt })),
        limitations: [
          'Qloo order reflects aggregate cultural relationships within this one request, not personal satisfaction or recommendation quality.',
          includeEvidence ? 'Numeric query.affinity is preserved only when returned by Qloo. It is not a probability of satisfaction; missing values remain null.' : 'Numeric affinity field and scale remain pending verification against an authorized live response. No numeric affinity is inferred.',
          includeEvidence ? 'Explainability is upstream attribution metadata, not a causal explanation or personal preference guarantee.' : 'Explanations describe observed rank changes only; causal reasons and Qloo explainability are not verified.',
          ...(complete ? [] : ['Incomplete coverage: no revised ranking is proposed. A missing movie is not a negative result.']),
        ],
        ...(includeEvidence ? { queryEvidence: { explainability: data.query && typeof data.query === 'object' ? object(data.query).explainability ?? null : null, warnings: data.warnings ?? null, entities: returned.map((e,i) => ({ id: e.id, explainability: queries[i].explainability ?? null, warnings: queries[i].warnings ?? null })) } } : {}),
      };
    },
  };
}
