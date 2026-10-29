import 'server-only';
import { createService } from './service';

const shared = globalThis as typeof globalThis & { tasteProbeService?: ReturnType<typeof createService> };
export const qloo = shared.tasteProbeService ??= createService({ apiKey: process.env.QLOO_API_KEY, baseUrl: process.env.QLOO_BASE_URL });
