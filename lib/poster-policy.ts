// Matching policy for a future authorized visual adapter; makes no network requests.
export type PosterMovie = { name: string; year: number | null; type: string; externalId?: string };
export type PosterCandidate = PosterMovie & { url: string; rightsVerified: boolean; provider: string };
const title = (s: string) => s.normalize('NFKC').trim().toLocaleLowerCase('en').replace(/\s+/g, ' ');
export function matchAuthorizedPoster(movie: PosterMovie, candidates: PosterCandidate[]) {
  if (movie.type !== 'urn:entity:movie' || !Number.isInteger(movie.year)) return null;
  const matches = candidates.filter(p => {
    if (!p.rightsVerified || p.type !== movie.type || p.year !== movie.year || title(p.name) !== title(movie.name)) return false;
    if (movie.externalId && movie.externalId !== p.externalId) return false;
    try { const u = new URL(p.url); return u.protocol === 'https:' && !u.username && !u.password && u.hostname === 'image.tmdb.org' && /^\/t\/p\/(w\d+|original)\/[a-zA-Z0-9_-]+\.(jpg|png|webp)$/.test(u.pathname) && !u.search && !u.hash && p.provider === 'TMDB'; }
    catch { return false; }
  });
  return matches.length === 1 ? matches[0] : null;
}
export function posterPresentation(movie: PosterMovie, candidates: PosterCandidate[] = [], failed = false) {
  const image = failed ? null : matchAuthorizedPoster(movie, candidates);
  return image ? { kind: 'AUTHORIZED_IMAGE' as const, image } : { kind: 'ILLUSTRATIVE_FALLBACK' as const, image: null };
}
