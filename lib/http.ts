import { QlooError } from './qloo/client.mjs';
import { randomUUID } from 'node:crypto';

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } });
}
const LOOPBACK = new Set(['127.0.0.1', 'localhost', '[::1]']);
export function validateOrigin(request: Request) {
  if (request.headers.get('sec-fetch-site') === 'cross-site') throw new QlooError('FORBIDDEN_ORIGIN');
  const raw = request.headers.get('origin');
  if (!raw) return; // Non-browser agent callers still require JSON and bounded bodies.
  let origin: URL;
  try { origin = new URL(raw); } catch { throw new QlooError('FORBIDDEN_ORIGIN'); }
  if (!['http:', 'https:'].includes(origin.protocol) || origin.origin !== raw) throw new QlooError('FORBIDDEN_ORIGIN');
  const effective = new URL(request.url), host = request.headers.get('host');
  if (origin.origin === effective.origin && (!host || host.toLowerCase() === origin.host)) return;
  // Next may reconstruct a loopback route URL with localhost instead of the browser Host.
  // Recover ONLY the exact browser authority, same HTTP protocol and port, on explicit loopback.
  if (effective.protocol === 'http:' && origin.protocol === 'http:' && LOOPBACK.has(effective.hostname) && LOOPBACK.has(origin.hostname)
    && host?.toLowerCase() === origin.host && origin.port === effective.port) return;
  throw new QlooError('FORBIDDEN_ORIGIN');
}
export async function body(request: Request) {
  validateOrigin(request);
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
    : ['INVALID_INPUT', 'IDENTITY_REQUIRED', 'IDENTITY_EXPIRED', 'DUPLICATE_ENTITY', 'SESSION_EXPIRED'].includes(category) ? 400
    : category === 'TIMEOUT' ? 504 : 502;
  const diagnostic = { requestId: randomUUID(), upstreamAttempted: error instanceof QlooError && error.upstreamAttempted,
    upstreamStatus: error instanceof QlooError ? error.status : null, transportCode: error instanceof QlooError ? error.transportCode : null };
  return json({ error: category, abstained: true, diagnostic }, status);
}
