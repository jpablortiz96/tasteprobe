// Local visual review only. No fetch, credentials, signed real identities or provider calls.
import type { DiscoveryResult, Entity } from './contracts.ts';
import { BrowserRequestError, type requestJson } from './browser-request.ts';
import type { MovieVisual } from './tmdb/contracts.ts';
export type ReviewScenario = 'success' | 'empty' | 'error' | 'timeout';
const id = (n: number) => `00000000-0000-4000-8000-${String(n).padStart(12,'0')}`;
export function syntheticDiscovery(): DiscoveryResult {
  const timestamp = new Date().toISOString();
  return { mode: 'DISCOVER', status: 'SUCCESS', requested: 8, returned: 8, discarded: 0,
    favorites: [{ id: id(1), name: 'Arrival — SYNTHETIC identity', year: 2016, searchedAt: timestamp }],
    movies: ['The Quiet Horizon','A Different Orbit','Letters from Tomorrow','The Long Way Home','Under a Green Moon','The Last Projection','A Thread of Light','After the Rain'].map((name,i) => ({ id: id(i+2), name: `${name} · Example`, year: 2000+i, type: 'urn:entity:movie', rank: i+1, affinity: i===1 ? null : (8-i)/10, explainability: i===2 ? null : { 'signal.interests.entities': [{ entity_id: id(1), score: 1 }] } })),
    provenance: { source: 'SYNTHETIC fixture', host: 'offline.invalid', endpoint: 'local-fixture-only', timestamp, parameters: { 'filter.type': 'urn:entity:movie', 'signal.interests.entities': id(1), 'filter.exclude.entities': id(1), take: '8', 'feature.explainability': 'true' }, requestId: 'SYNTHETIC-REVIEW-ONLY', httpStatus: 200 },
    warnings: null, explainability: null, limitations: ['SYNTHETIC visual fixture. Films, identities and affinities are illustrative, not Qloo evidence.', 'No network request was made. This report must not be used as LIVE validation.'] };
}
export function createSyntheticRequest(scenario: ReviewScenario, artworkExample?: MovieVisual | null): typeof requestJson {
  return async <T>(path: string): Promise<T> => {
    await new Promise(resolve => setTimeout(resolve,250)); // Visible local operation, explicitly simulated.
    if (path === '/api/health') return { status: 'CONFIGURED_NOT_VERIFIED', liveVerified: false } as T;
    if (path === '/api/entities/search') return { entities: [{ id: id(1), name: 'Arrival — SYNTHETIC identity', year: 2016, type: 'urn:entity:movie', proof: 'SYNTHETIC_REVIEW_NOT_A_SIGNATURE' } satisfies Entity] } as T;
    if (path !== '/api/discover') throw new BrowserRequestError('INVALID_INPUT','synthetic',400);
    if (scenario === 'error') throw new BrowserRequestError('UPSTREAM','synthetic',502);
    if (scenario === 'timeout') throw new BrowserRequestError('TIMEOUT','synthetic',null);
    const result = syntheticDiscovery();
    if(artworkExample){result.movies[0].name=artworkExample.name;result.movies[0].year=artworkExample.year;}
    if (scenario === 'empty') { result.movies=[]; result.returned=0; result.status='INSUFFICIENT_EVIDENCE'; }
    return result as T;
  };
}
