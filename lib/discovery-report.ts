import type { DiscoveryResult, Entity } from './contracts.ts';
import { culturalInsights } from './cultural-insights.ts';
import type { VisualResult } from './tmdb/contracts.ts';
import { visualMatches } from './tmdb/policy.ts';
export function attributedSignals(explainability: unknown, favorites: { id: string; name: string }[]) {
  if (!explainability || typeof explainability !== 'object' || Array.isArray(explainability)) return [];
  const signals = (explainability as Record<string, unknown>)['signal.interests.entities'];
  if (!Array.isArray(signals)) return [];
  return favorites.filter(f => signals.some(value => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return false;
    const s = value as Record<string, unknown>;
    return s.entity_id === f.id && typeof s.score === 'number' && Number.isFinite(s.score) && s.score > 0 && s.score <= 1;
  })).map(f => f.name);
}
export type DiscoveryActivity = { operation: 'resolve_entities' | 'discover_movies'; timestamp: string; outcome: string; summary: string };
export function discoveryPassport(favorites: Entity[], result: DiscoveryResult | null, events: DiscoveryActivity[], synthetic = false, visuals: VisualResult | null = null) {
  synthetic = synthetic || result?.provenance.source === 'SYNTHETIC fixture';
  return { product: 'TasteProbe Evidence Passport', mode: 'DISCOVER', evidenceMode: synthetic ? 'SYNTHETIC' : 'LIVE', generatedAt: new Date().toISOString(), liveValidation: synthetic ? 'SYNTHETIC_NOT_LIVE' : result ? 'QLOO_RESPONSE_RECEIVED' : 'NOT_EVALUATED', autonomousLLM: false,
    confirmedIdentities: favorites.map(({ id, name, year }) => ({ id, name, year })), discovery: result,
    culturalInsights: result ? (() => { const { dashboard, featured } = culturalInsights(result); return { dashboard, featured, imageProvider: { qloo: 'BLOCKED_RIGHTS', tmdb: visuals?.status ?? 'NOT_REQUESTED', displayed: synthetic ? 'SYNTHETIC_REVIEW_WITH_OPTIONAL_CAPTURED_ARTWORK' : visuals && Object.keys(visuals.images).length ? 'TMDB_WITH_ILLUSTRATIVE_FALLBACK' : 'ORIGINAL_ILLUSTRATIONS' } }; })() : null,
    visualMetadata: !synthetic && result && visuals ? { provider: 'TMDB', status: visuals.status, images: Object.fromEntries(result.movies.filter(m=>visualMatches(m,visuals.images[m.id])).map(m=>[m.id,visuals.images[m.id]])), limitation: 'Visual metadata and synopsis are separate from Qloo cultural evidence. Image load success is not certified by this export.' } : null,
    events: events.map(e => ({ ...e, caller: 'human-ui', ...(synthetic ? { evidenceMode: 'SYNTHETIC' } : {}) })),
    limitations: result?.limitations ?? ['No discovery evidence is available. No recommendations inferred.'] };
}
