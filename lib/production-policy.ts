import {QlooError} from './qloo/client.mjs';
type Environment=Record<string,string|undefined>;
export function signingSecret(env:Environment=process.env):Buffer|undefined{
  const value=env.TASTEPROBE_SIGNING_SECRET;
  if(!value)return undefined;
  if(!/^[0-9a-f]{64}$/i.test(value))throw new QlooError('BLOCKED_LIVE');
  return Buffer.from(value,'hex');
}
export function publicOrigin(env:Environment=process.env):string|null{
  if(env.TASTEPROBE_DEPLOYMENT!=='public'&&!env.TASTEPROBE_PUBLIC_ORIGIN)return null;
  try{
    const raw=env.TASTEPROBE_PUBLIC_ORIGIN!,url=new URL(raw);
    if(url.protocol!=='https:'||url.origin!==raw||url.username||url.password||!/^(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/.test(url.hostname)||/^[\d.]+$/.test(url.hostname)||url.hostname.endsWith('.localhost'))throw 0;
    return url.origin;
  }catch{throw new QlooError('BLOCKED_LIVE');}
}
export function publicPolicy(env:Environment=process.env){
  const origin=publicOrigin(env);if(!origin)return null;
  return {origin,...quotaPolicy(env)};
}
// Redis can be verified before Railway assigns a domain. This does not authorize
// HTTP serving: publicPolicy still requires an explicit canonical HTTPS origin.
export function quotaPolicy(env:Environment=process.env){
  const secret=signingSecret(env),url=env.UPSTASH_REDIS_REST_URL,token=env.UPSTASH_REDIS_REST_TOKEN,namespace=env.TASTEPROBE_QUOTA_NAMESPACE;
  const integer=(value:string|undefined)=>value&&/^[1-9]\d{0,6}$/.test(value)?Number(value):0;
  const qloo=integer(env.TASTEPROBE_QLOO_TOTAL_LIMIT),tmdb=integer(env.TASTEPROBE_TMDB_TOTAL_LIMIT);
  if(!secret||!url||!/^https:\/\/[a-z0-9-]+\.upstash\.io$/.test(url)||!token?.trim()||!namespace||!/^[a-zA-Z0-9_-]{1,48}$/.test(namespace)||!qloo||!tmdb)throw new QlooError('BLOCKED_LIVE');
  return {secret,url,token,namespace,limits:{qloo,tmdb}};
}
