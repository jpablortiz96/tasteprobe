// Reproduce an old development global singleton. Test process only; external fetch is intercepted.
import './mock-qloo-preload.mjs';
import { createService } from '../../lib/qloo/service.ts';
const legacy=createService({apiKey:process.env.QLOO_API_KEY});
globalThis.tasteProbeService={health:legacy.health,search:legacy.search,audit:legacy.audit};
