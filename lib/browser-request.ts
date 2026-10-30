const categories = new Set(['BLOCKED_LIVE', 'AUTH', 'RATE_LIMIT', 'REQUEST_BUDGET', 'TIMEOUT', 'IDENTITY_EXPIRED', 'IDENTITY_REQUIRED', 'INVALID_RESPONSE', 'NETWORK', 'DUPLICATE_ENTITY', 'INVALID_INPUT', 'FORBIDDEN_ORIGIN', 'UPSTREAM', 'REQUEST_REJECTED', 'INTERNAL_ERROR']);

/** Same-origin product requests. Never surface arbitrary response text or browser exceptions. */
export async function requestJson<T>(path: string, input?: unknown, fetchImpl: typeof fetch = fetch, timeoutMs = 15000): Promise<T> {
  let response: Response;
  try {
    response = await fetchImpl(path, {
      method: input === undefined ? 'GET' : 'POST', cache: 'no-store',
      ...(input === undefined ? {} : { headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(input) }),
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (error) {
    throw new Error(error instanceof Error && ['TimeoutError', 'AbortError'].includes(error.name) ? 'TIMEOUT' : 'NETWORK');
  }
  let data;
  try { data = await response.json(); } catch { throw new Error('INVALID_RESPONSE'); }
  if (!response.ok) throw new Error(typeof data?.error === 'string' && categories.has(data.error) ? data.error : 'UNAVAILABLE');
  return data as T;
}
