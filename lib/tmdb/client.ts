if (typeof window !== 'undefined') throw new Error('SERVER_ONLY');
export class TmdbError extends Error {
  category:string;
  status:number|null;
  constructor(category: string, status: number | null = null) { super(category); this.category=category; this.status=status; }
}
export function createTmdbClient({ token, apiKey, fetchImpl = fetch }: { token?: string; apiKey?: string; fetchImpl?: typeof fetch } = {}) {
  let calls = 0, halted = false;
  return {
    configured: Boolean(token?.trim() || apiKey?.trim()),
    async get(path: '/configuration' | '/search/movie', params: Record<string, string> = {}): Promise<Record<string, unknown>> {
      if (!token?.trim() && !apiKey?.trim()) throw new TmdbError('BLOCKED_CREDENTIAL');
      if (halted || calls >= 100) throw new TmdbError('RATE_LIMIT');
      if (!['/configuration', '/search/movie'].includes(path)) throw new TmdbError('INVALID_PATH');
      calls++;
      const url = new URL('/3'+path, 'https://api.themoviedb.org');
      for (const [k,v] of Object.entries(params)) url.searchParams.set(k,v);
      if (!token?.trim()) url.searchParams.set('api_key', apiKey!.trim());
      try {
        const response = await fetchImpl(url, { method: 'GET', headers: { Accept: 'application/json', ...(token?.trim() ? { Authorization: `Bearer ${token.trim()}` } : {}) }, redirect: 'error', cache: 'no-store', signal: AbortSignal.timeout(3500) });
        if (!response.ok) { if ([401,403,429].includes(response.status)) halted = true; throw new TmdbError(response.status===429?'RATE_LIMIT':'UPSTREAM_ERROR',response.status); }
        if (!response.body) throw new TmdbError('INVALID_RESPONSE');
        const reader=response.body.getReader(), chunks:Uint8Array[]=[];let size=0;
        try { while(true){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>256_000)throw new TmdbError('INVALID_RESPONSE');chunks.push(value);} } finally { await reader.cancel(); }
        const text=Buffer.concat(chunks).toString('utf8');
        if([token?.trim(),apiKey?.trim()].some(secret=>secret&&text.includes(secret)))throw new TmdbError('INVALID_RESPONSE');
        const data:unknown=JSON.parse(text);
        if(!data||typeof data!=='object'||Array.isArray(data))throw new TmdbError('INVALID_RESPONSE');
        return data as Record<string,unknown>;
      } catch(e) { if(e instanceof TmdbError)throw e; throw new TmdbError('NETWORK_OR_TIMEOUT'); }
    }
  };
}
