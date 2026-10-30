import 'server-only';
import { createService } from './service';
import { cachedServerValue } from '../server-cache';

const shared = globalThis as typeof globalThis & { tasteProbeService?: ReturnType<typeof createService> };
// Production route bundles may carry different function identities; use a stable contract revision.
const revision = process.env.NODE_ENV === 'development' ? createService : 'qloo-discover-v1';
export const qloo = cachedServerValue(shared as unknown as Record<string, unknown>, 'tasteProbeService', revision, () => createService({ apiKey: process.env.QLOO_API_KEY, baseUrl: process.env.QLOO_BASE_URL }));
