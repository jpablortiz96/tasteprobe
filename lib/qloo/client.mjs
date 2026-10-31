// Trusted server/CLI transport. Production import boundary lives in server.ts.
if (typeof window !== 'undefined') throw new Error('SERVER_ONLY');
export const QLOO_BASE_URL = 'https://hackathon.api.qloo.com';

export class QlooError extends Error {
  constructor(category, status = null, transportCode = null, upstreamAttempted = false) {
    super(category);
    this.name = 'QlooError';
    this.category = category;
    this.status = status;
    this.transportCode = transportCode;
    this.upstreamAttempted = upstreamAttempted;
  }
}

/** @param {{apiKey?: string, baseUrl?: string, fetchImpl?: typeof fetch, timeoutMs?: number}} options */
export function createQlooClient({ apiKey, baseUrl = QLOO_BASE_URL, fetchImpl = fetch, timeoutMs = 8000 } = {}) {
  if (baseUrl !== QLOO_BASE_URL) throw new QlooError('UNAPPROVED_HOST');
  let requests = 0;
  return {
    async get(path, params) {
      if (!apiKey?.trim()) throw new QlooError('BLOCKED_LIVE');
      if (!['/search', '/v2/insights'].includes(path)) throw new QlooError('INVALID_PATH');
      // One bounded local experiment. No automatic retries or remote fallback.
      if (++requests > 6) throw new QlooError('REQUEST_BUDGET');
      const url = new URL(path, baseUrl);
      url.search = new URLSearchParams(params).toString();
      try {
        const response = await fetchImpl(url, {
          method: 'GET', headers: { 'X-Api-Key': apiKey, Accept: 'application/json' },
          signal: AbortSignal.timeout(timeoutMs), redirect: 'error', cache: 'no-store',
        });
        if (!response.ok) {
          const category = response.status === 401 || response.status === 403 ? 'AUTH'
            : response.status === 429 ? 'RATE_LIMIT'
            : response.status >= 500 ? 'UPSTREAM' : 'REQUEST_REJECTED';
          throw new QlooError(category, response.status, null, true);
        }
        // Bound response size before JSON parsing; never include response bodies in errors.
        if (!response.body) throw new QlooError('INVALID_RESPONSE');
        const reader = response.body.getReader();
        const chunks = [];
        let size = 0;
        try {
          while (true) {
            const { value, done } = await reader.read();
            if (done) break;
            size += value.byteLength;
            if (size > 512_000) throw new QlooError('RESPONSE_TOO_LARGE');
            chunks.push(value);
          }
        } finally { await reader.cancel(); }
        let data;
        try { data = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
        catch { throw new QlooError('INVALID_RESPONSE'); }
        if (!data || typeof data !== 'object' || Array.isArray(data)) throw new QlooError('INVALID_RESPONSE');
        return { status: response.status, data };
      } catch (error) {
        if (error instanceof QlooError) {
          // A public admission guard may reject inside fetchImpl before transport.
          // Keep its truthful false flag; response/contract failures did reach Qloo.
          if (!['BLOCKED_LIVE', 'REQUEST_BUDGET', 'INVALID_PATH'].includes(error.category)) error.upstreamAttempted = true;
          throw error;
        }
        // Keep only known codes, never arbitrary messages, URLs, headers or stacks.
        const allowed = new Set(['ENOTFOUND', 'EAI_AGAIN', 'ECONNREFUSED', 'ECONNRESET', 'ETIMEDOUT', 'ENETUNREACH', 'EHOSTUNREACH', 'UND_ERR_CONNECT_TIMEOUT', 'UND_ERR_SOCKET', 'CERT_HAS_EXPIRED', 'DEPTH_ZERO_SELF_SIGNED_CERT', 'SELF_SIGNED_CERT_IN_CHAIN', 'UNABLE_TO_VERIFY_LEAF_SIGNATURE', 'UNABLE_TO_GET_ISSUER_CERT_LOCALLY']);
        let cause = error, code = null;
        for (let depth = 0; cause && depth < 5; depth++, cause = cause.cause) {
          if (allowed.has(cause.code)) { code = cause.code; break; }
        }
        throw new QlooError(error?.name === 'TimeoutError' || error?.name === 'AbortError' ? 'TIMEOUT' : 'NETWORK', null, code, true);
      }
    },
  };
}
