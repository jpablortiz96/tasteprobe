const categories = new Set(['BLOCKED_LIVE', 'AUTH', 'RATE_LIMIT', 'REQUEST_BUDGET', 'TIMEOUT', 'IDENTITY_EXPIRED', 'IDENTITY_REQUIRED', 'INVALID_RESPONSE', 'NETWORK', 'DUPLICATE_ENTITY', 'INVALID_INPUT', 'FORBIDDEN_ORIGIN', 'UPSTREAM', 'REQUEST_REJECTED', 'INTERNAL_ERROR', 'SESSION_EXPIRED']);
export type OperatorDiagnostic = { code: string; reason: string; layer: string; httpStatus: number | null; requestId?: string; upstreamStatus?: number | null; upstreamAttempted?: boolean; transportCode?: string | null };
function diagnostic(category: string, layer: string, httpStatus: number | null): OperatorDiagnostic {
  const codes: Record<string, string> = { AUTH: 'AUTH_ERROR', NETWORK: 'NETWORK_ERROR', TIMEOUT: 'NETWORK_ERROR', UPSTREAM: 'UPSTREAM_ERROR', REQUEST_REJECTED: 'UPSTREAM_ERROR', IDENTITY_REQUIRED: 'IDENTITY_ERROR', IDENTITY_EXPIRED: 'IDENTITY_ERROR', DUPLICATE_ENTITY: 'IDENTITY_ERROR', REQUEST_BUDGET: 'RATE_LIMIT' };
  return { code: codes[category] ?? category, reason: category, layer, httpStatus };
}
export class BrowserRequestError extends Error {
  info: OperatorDiagnostic;
  constructor(category: string, layer: string, status: number | null = null) { super(category); this.name = 'BrowserRequestError'; this.info = diagnostic(category, layer, status); }
}
export function requestDiagnostic(error: unknown): OperatorDiagnostic {
  if (error instanceof BrowserRequestError) return error.info;
  const category = error instanceof Error && categories.has(error.message) ? error.message : 'INTERNAL_ERROR';
  return diagnostic(category, 'application', null);
}

/** Same-origin product requests. Never surface arbitrary response text or browser exceptions. */
export async function requestJson<T>(path: string, input?: unknown, fetchImpl: typeof fetch = fetch, timeoutMs = 15000): Promise<T> {
  if (!/^\/api\/[a-zA-Z0-9/_-]+$/.test(path)) throw new Error('INVALID_INPUT');
  let response: Response;
  try {
    response = await fetchImpl(path, {
      method: input === undefined ? 'GET' : 'POST', cache: 'no-store',
      ...(input === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    throw new BrowserRequestError(error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name) ? 'TIMEOUT' : 'NETWORK', 'browser-transport');
  }
  let data;
  try { data = await response.json(); } catch { throw new BrowserRequestError('INVALID_RESPONSE', 'local-http-json', response.status); }
  if (!response.ok) {
    const category = typeof data?.error === 'string' && categories.has(data.error) ? data.error : 'UNAVAILABLE';
    const layer = category === 'INTERNAL_ERROR' ? 'application' : ['IDENTITY_REQUIRED','IDENTITY_EXPIRED','DUPLICATE_ENTITY'].includes(category) ? 'identity-validation' : ['UPSTREAM','REQUEST_REJECTED','AUTH','RATE_LIMIT'].includes(category) ? 'qloo-http' : ['NETWORK','TIMEOUT'].includes(category) ? 'qloo-transport' : category === 'INVALID_RESPONSE' ? 'server-response-validation' : 'local-http';
    const error = new BrowserRequestError(category, layer, response.status);
    const d = data?.diagnostic;
    if (d && typeof d === 'object' && typeof d.requestId === 'string' && /^[0-9a-f-]{36}$/i.test(d.requestId)) {
      error.info.requestId = d.requestId;
      error.info.upstreamAttempted = d.upstreamAttempted === true;
      error.info.upstreamStatus = Number.isInteger(d.upstreamStatus) && d.upstreamStatus >= 100 && d.upstreamStatus <= 599 ? d.upstreamStatus : null;
      const safeCodes = new Set(['ENOTFOUND','EAI_AGAIN','ECONNREFUSED','ECONNRESET','ETIMEDOUT','ENETUNREACH','EHOSTUNREACH','UND_ERR_CONNECT_TIMEOUT','UND_ERR_SOCKET','CERT_HAS_EXPIRED','DEPTH_ZERO_SELF_SIGNED_CERT','SELF_SIGNED_CERT_IN_CHAIN','UNABLE_TO_VERIFY_LEAF_SIGNATURE','UNABLE_TO_GET_ISSUER_CERT_LOCALLY']);
      error.info.transportCode = safeCodes.has(d.transportCode) ? d.transportCode : null;
    }
    throw error;
  }
  return data as T;
}
