import { qloo } from '../../../../lib/qloo/server';
import { body, failure, json } from '../../../../lib/http';
import {publicRequest} from '../../../../lib/public-request';
export const runtime = 'nodejs';
export async function POST(request: Request) {
  try { const input=await body(request);return await publicRequest(request,'search',async()=>json(await qloo.search(input))); } catch (e) { return failure(e); }
}
