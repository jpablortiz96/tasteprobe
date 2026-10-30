export type VisualMovie = { id: string; name: string; year: number | null; type: 'urn:entity:movie' };
export type MovieVisual = { provider: 'TMDB'; tmdbId: number; name: string; year: number; posterUrl: string | null; backdropUrl: string | null; overview: string | null; retrievedAt: string; matchedBy: 'EXACT_TITLE_YEAR' };
export type VisualResult = { status: 'IMAGE_PROVIDER_READY' | 'BLOCKED_CREDENTIAL' | 'UNAVAILABLE' | 'NO_MATCH' | 'RATE_LIMIT'; images: Record<string, MovieVisual> };
