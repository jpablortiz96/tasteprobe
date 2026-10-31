import {createHmac} from 'node:crypto';
import type {quotaPolicy} from './production-policy.ts';
import {QlooError} from './qloo/client.mjs';

// One atomic reservation. Total has no expiry; short windows start on first admission.
// All keys share a hash tag so the transaction is also valid on clustered Redis.
export const RESERVE_LUA=`
if redis.call('EXISTS', KEYS[1]) == 1 then return {0,1,0} end
for i=2,#KEYS do
  local used=tonumber(redis.call('GET',KEYS[i]) or '0')
  if used >= tonumber(ARGV[(i-2)*2+1]) then return {0,i,0} end
end
local remaining=0
for i=2,#KEYS do
  local used=redis.call('INCR',KEYS[i])
  local ttl=tonumber(ARGV[(i-2)*2+2])
  if used == 1 and ttl > 0 then redis.call('EXPIRE',KEYS[i],ttl) end
  if i == 2 then remaining=tonumber(ARGV[1])-used end
end
return {1,0,remaining}`;

export function createSharedQuota(policy:ReturnType<typeof quotaPolicy>,fetchImpl:typeof fetch=fetch){
  const prefix=`tasteprobe:{${policy.namespace}}`;
  async function command(args:(string|number)[]){
    try{
      const r=await fetchImpl(policy.url,{method:'POST',headers:{Authorization:`Bearer ${policy.token}`,'Content-Type':'application/json'},body:JSON.stringify(args),redirect:'error',cache:'no-store',signal:AbortSignal.timeout(2000)});
      if(!r.ok||!r.body)throw 0;
      const reader=r.body.getReader();const chunks:Uint8Array[]=[];let bytes=0;
      try{while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>4096)throw 0;chunks.push(value);}}finally{await reader.cancel();}
      const data=JSON.parse(Buffer.concat(chunks).toString('utf8'));
      if(data.error||!Object.hasOwn(data,'result'))throw 0;
      return data.result as unknown;
    }catch{throw new QlooError('BLOCKED_LIVE');}
  }
  return {
    async reserve(provider:'qloo'|'tmdb'|'http',operation:string,client:string){
      if(!/^[a-z_]{1,32}$/.test(operation))throw new QlooError('INVALID_INPUT');
      const hash=createHmac('sha256',policy.secret).update(client).digest('hex');
      const globalLimit=provider==='http'?1000000:policy.limits[provider];
      const minute=provider==='qloo'?12:provider==='tmdb'?60:120;
      const perClient=provider==='qloo'?6:provider==='tmdb'?20:20;
      const perOperation=provider==='qloo'?(operation==='search'?4:2):provider==='tmdb'?20:10;
      const keys=[`${prefix}:${provider}:halt`,`${prefix}:${provider}:total`,`${prefix}:${provider}:minute`,`${prefix}:${provider}:client:${hash}`,`${prefix}:${provider}:operation:${operation}:${hash}`];
      const result=await command(['EVAL',RESERVE_LUA,keys.length,...keys,globalLimit,0,minute,60,perClient,60,perOperation,60]);
      if(!Array.isArray(result)||result.length!==3||!result.every(Number.isSafeInteger)||![0,1].includes(result[0])||(result[0]===1?result[1]!==0:result[1]<1||result[1]>5)||result[2]<0||result[2]>globalLimit)throw new QlooError('BLOCKED_LIVE');
      if(result[0]!==1)throw new QlooError('REQUEST_BUDGET');
      return {remaining:result[2] as number};
    },
    async halt(provider:'qloo'|'tmdb'){
      if(await command(['SET',`${prefix}:${provider}:halt`,'1'])!=='OK')throw new QlooError('BLOCKED_LIVE');
    },
    async status(){
      const result=await command(['MGET',`${prefix}:qloo:total`,`${prefix}:tmdb:total`,`${prefix}:qloo:halt`,`${prefix}:tmdb:halt`]);
      if(!Array.isArray(result)||result.length!==4||result.some(x=>x!==null&&(typeof x!=='string'||!/^\d+$/.test(x))))throw new QlooError('BLOCKED_LIVE');
      const item=(provider:'qloo'|'tmdb',index:number)=>{const used=Number(result[index]??0);if(!Number.isSafeInteger(used))throw new QlooError('BLOCKED_LIVE');return {used,limit:policy.limits[provider],remaining:Math.max(0,policy.limits[provider]-used),halted:result[index+2]!==null};};
      return {source:'SHARED_OPERATOR_LIMITS_NOT_PROVIDER_QUOTA',qloo:item('qloo',0),tmdb:item('tmdb',1)};
    }
  };
}
