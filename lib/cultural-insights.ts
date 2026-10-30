import type { DiscoveryResult } from './contracts.ts';

/** Presentation only: never changes provider order or mutates cultural evidence. */
export function culturalInsights(result: DiscoveryResult) {
  const observed = result.movies.filter(m => typeof m.affinity === 'number' && Number.isFinite(m.affinity));
  const topAffinity = observed.length ? Math.max(...observed.map(m => m.affinity!)) : null;
  // Stable ties follow Qloo order. With no comparable values, retain its first result.
  const featured = (topAffinity === null ? result.movies[0] : observed.find(m => m.affinity === topAffinity)) ?? null;
  return {
    dashboard: { totalMovies: result.movies.length, startingPoints: result.favorites.length, topAffinity,
      affinitiesAvailable: observed.length, requested: result.requested, source: result.provenance.source,
      timestamp: result.provenance.timestamp, status: result.status },
    featured: featured ? { id: featured.id, name: featured.name, year: featured.year, rank: featured.rank,
      affinity: typeof featured.affinity === 'number' && Number.isFinite(featured.affinity) ? featured.affinity : null,
      basis: topAffinity === null ? 'FIRST_QLOO_RESULT' as const : 'HIGHEST_OBSERVED_AFFINITY' as const,
      tied: topAffinity !== null && observed.filter(m => m.affinity === topAffinity).length > 1 } : null,
    remaining: result.movies.filter(m => m.id !== featured?.id),
  };
}
