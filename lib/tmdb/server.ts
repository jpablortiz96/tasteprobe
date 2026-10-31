import 'server-only';
import { createVisualService } from './service';
import { cachedServerValue } from '../server-cache';
import {providerFetch} from '../public-request';
const state=globalThis as unknown as Record<string,unknown>;
export const visuals=cachedServerValue(state,'tasteProbeVisuals',process.env.NODE_ENV==='development'?createVisualService:'tmdb-public-v2',()=>createVisualService({token:process.env.TMDB_READ_ACCESS_TOKEN,apiKey:process.env.TMDB_API_KEY,fetchImpl:providerFetch('tmdb')}));
