import { qloo } from '../../../lib/qloo/server';
import { body, failure, json } from '../../../lib/http';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try { return json(await qloo.audit(await body(request))); } catch (e) { return failure(e); }
}
