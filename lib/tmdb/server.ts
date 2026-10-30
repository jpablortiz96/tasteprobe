import 'server-only';
import { createVisualService } from './service';
import { cachedServerValue } from '../server-cache';
const state=globalThis as unknown as Record<string,unknown>;
export const visuals=cachedServerValue(state,'tasteProbeVisuals',process.env.NODE_ENV==='development'?createVisualService:'tmdb-visual-v1',()=>createVisualService({token:process.env.TMDB_READ_ACCESS_TOKEN,apiKey:process.env.TMDB_API_KEY}));
