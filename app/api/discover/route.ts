import { qloo } from '../../../lib/qloo/server';
import { body, failure, json } from '../../../lib/http';
import {publicRequest} from '../../../lib/public-request';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const input = await body(request);
    // Safe dispatch diagnostic, after origin/body checks; no proofs or provider data disclosed.
    if (typeof qloo.discover !== 'function') return json({ error: 'INTERNAL_ERROR', abstained: true, diagnostic: { layer: 'APPLICATION_DISPATCH', reason: 'STALE_SERVICE_MISSING_DISCOVER' } }, 502);
    return await publicRequest(request,'discover',async()=>json(await qloo.discover(input)));
  } catch (e) { return failure(e); }
}
