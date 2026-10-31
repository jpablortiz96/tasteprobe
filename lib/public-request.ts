import {AsyncLocalStorage} from 'node:async_hooks';
import {isIP} from 'node:net';
import {publicPolicy} from './production-policy.ts';
import {createSharedQuota} from './shared-quota.ts';
import {QlooError} from './qloo/client.mjs';

type Context={client:string;quota:ReturnType<typeof createSharedQuota>};
// Bundled API routes must share a single async context in one Node process.
const state=globalThis as typeof globalThis & {tasteProbeRequestContext?:AsyncLocalStorage<Context>};
const context=state.tasteProbeRequestContext??=new AsyncLocalStorage<Context>();
export function clientIdentity(request:Request,header=process.env.TASTEPROBE_TRUSTED_IP_HEADER){
  // Only enable after the ingress is verified to overwrite this header. Otherwise
  // all callers deliberately share a conservative anonymous bucket (no spoof bypass).
  if(!header)return 'anonymous';
  if(!['x-real-ip','cf-connecting-ip'].includes(header))throw new QlooError('BLOCKED_LIVE');
  const value=request.headers.get(header)?.trim();
  if(!value||!isIP(value))throw new QlooError('FORBIDDEN_ORIGIN');
  return value;
}
export async function publicRequest<T>(request:Request,operation:string,task:()=>Promise<T>):Promise<T>{
  const policy=publicPolicy();
  if(!policy)return task();
  const quota=createSharedQuota(policy),client=clientIdentity(request);
  await quota.reserve('http',operation,client);
  return context.run({client,quota},task);
}
export function providerFetch(provider:'qloo'|'tmdb',fetchImpl:typeof fetch=fetch):typeof fetch{
  return async(input,init)=>{
    const policy=publicPolicy();if(!policy)return fetchImpl(input,init);
    const current=context.getStore();if(!current)throw new QlooError('BLOCKED_LIVE');
    const url=new URL(input instanceof Request?input.url:String(input));
    const allowed=provider==='qloo'?url.origin==='https://hackathon.api.qloo.com'&&['/search','/v2/insights'].includes(url.pathname):url.origin==='https://api.themoviedb.org'&&['/3/configuration','/3/search/movie'].includes(url.pathname);
    if(!allowed)throw new QlooError('INVALID_PATH');
    const operation=provider==='qloo'?(url.pathname==='/search'?'search':'insights'):(url.pathname==='/3/configuration'?'configuration':'search');
    await current.quota.reserve(provider,operation,current.client);
    // Admission counts attempts, including failures. No refunds or retries.
    const response=await fetchImpl(input,init);
    if([401,403,429].includes(response.status)){
      try{await current.quota.halt(provider);}catch(error){if(error instanceof QlooError)error.upstreamAttempted=true;throw error;}
    }
    return response;
  };
}
