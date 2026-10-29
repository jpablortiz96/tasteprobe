import { QlooError } from './qloo/client.mjs';

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}
export async function body(request: Request) {
  const origin = request.headers.get('origin');
  if (origin && origin !== new URL(request.url).origin) throw new QlooError('FORBIDDEN_ORIGIN');
  if (!request.headers.get('content-type')?.startsWith('application/json')) throw new QlooError('INVALID_INPUT');
  if (!request.body) throw new QlooError('INVALID_INPUT');
  const reader = request.body.getReader();
  let size = 0;
  const chunks: Uint8Array[] = [];
  const deadline = AbortSignal.timeout(3000);
  const timedOut = new Promise<never>((_, reject) => deadline.addEventListener('abort', () => { void reader.cancel(); reject(new QlooError('INVALID_INPUT')); }, { once: true }));
  try {
    while (true) {
      const { done, value } = await Promise.race([reader.read(), timedOut]);
      if (done) break;
      size += value.byteLength;
      if (size > 8192) throw new QlooError('INVALID_INPUT');
      chunks.push(value);
    }
    return JSON.parse(Buffer.concat(chunks).toString('utf8')) as unknown;
  } catch (e) { if (e instanceof QlooError) throw e; throw new QlooError('INVALID_INPUT'); }
  finally { void reader.cancel(); }
}
export function failure(error: unknown) {
  const category = error instanceof QlooError ? error.category : 'INTERNAL_ERROR';
  const status = category === 'BLOCKED_LIVE' ? 503 : category === 'FORBIDDEN_ORIGIN' ? 403
    : category === 'REQUEST_BUDGET' || category === 'RATE_LIMIT' ? 429
    : ['INVALID_INPUT', 'IDENTITY_REQUIRED', 'IDENTITY_EXPIRED', 'DUPLICATE_ENTITY'].includes(category) ? 400
    : category === 'TIMEOUT' ? 504 : 502;
  return json({ error: category, abstained: true }, status);
}
