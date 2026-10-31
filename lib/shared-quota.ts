import {createHmac} from 'node:crypto';
import type {quotaPolicy} from './production-policy.ts';
import {QlooError} from './qloo/client.mjs';
export class RedisQuotaError extends QlooError{
  redisDiagnostic:{category:string;command:string;httpStatus:number|null;transportCode:string|null};
  constructor(category:string,command:string,httpStatus:number|null=null,transportCode:string|null=null){super('BLOCKED_LIVE');this.redisDiagnostic={category,command,httpStatus,transportCode};}
}
function redisCategory(message:unknown){
  if(typeof message!=='string')return 'REDIS_COMMAND_ERROR';
  if(/^(?:NOPERM|READONLY)|read.?only|not allowed|permission/i.test(message))return 'REDIS_PERMISSION';
  if(/^(?:WRONGPASS|NOAUTH)/.test(message))return 'REDIS_AUTH';
  if(/^CROSSSLOT/.test(message))return 'REDIS_KEYSLOT';
  if(/unknown command|unsupported command/i.test(message))return 'REDIS_COMMAND_UNSUPPORTED';
  if(/compil|user_script|lua/i.test(message))return 'REDIS_SCRIPT_ERROR';
  return 'REDIS_COMMAND_ERROR';
}

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
    const operation=String(args[0]);let status:number|null=null;
    try{
      const r=await fetchImpl(policy.url,{method:'POST',headers:{Authorization:`Bearer ${policy.token}`,'Content-Type':'application/json'},body:JSON.stringify(args),redirect:'error',cache:'no-store',signal:AbortSignal.timeout(2000)});
      status=r.status;
      if([401,403,429].includes(status)){await r.body?.cancel();throw new RedisQuotaError(status===401?'REDIS_AUTH':status===403?'REDIS_PERMISSION':'REDIS_RATE_LIMIT',operation,status);}
      if(!r.body)throw new RedisQuotaError('REDIS_RESPONSE_INVALID',operation,status);
      const reader=r.body.getReader();const chunks:Uint8Array[]=[];let bytes=0;
      try{while(true){const {done,value}=await reader.read();if(done)break;bytes+=value.byteLength;if(bytes>4096)throw new RedisQuotaError('REDIS_RESPONSE_TOO_LARGE',operation,status);chunks.push(value);}}finally{await reader.cancel();}
      let data;try{data=JSON.parse(Buffer.concat(chunks).toString('utf8'));}catch{throw new RedisQuotaError('REDIS_JSON_INVALID',operation,status);}
      if(data?.error)throw new RedisQuotaError(redisCategory(data.error),operation,status);
      if(!r.ok)throw new RedisQuotaError('REDIS_HTTP_ERROR',operation,status);
      if(!data||typeof data!=='object'||!Object.hasOwn(data,'result'))throw new RedisQuotaError('REDIS_RESPONSE_INVALID',operation,status);
      return {value:data.result as unknown,httpStatus:status};
    }catch(e){
      if(e instanceof RedisQuotaError)throw e;
      const allowed=new Set(['ENOTFOUND','EAI_AGAIN','EACCES','EPERM','ECONNREFUSED','ECONNRESET','ETIMEDOUT','ENETUNREACH','EHOSTUNREACH','UND_ERR_CONNECT_TIMEOUT','UND_ERR_SOCKET','CERT_HAS_EXPIRED','UNABLE_TO_VERIFY_LEAF_SIGNATURE','UNABLE_TO_GET_ISSUER_CERT_LOCALLY','DEPTH_ZERO_SELF_SIGNED_CERT','SELF_SIGNED_CERT_IN_CHAIN']);
      let cause=e as {code?:string;cause?:unknown;name?:string},code:string|null=null;
      for(let i=0;cause&&i<5;i++,cause=cause.cause as typeof cause)if(cause.code&&allowed.has(cause.code)){code=cause.code;break;}
      throw new RedisQuotaError(e instanceof Error&&['TimeoutError','AbortError'].includes(e.name)?'REDIS_TIMEOUT':'REDIS_NETWORK',operation,status,code);
    }
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
      const {value:result,httpStatus}=await command(['EVAL',RESERVE_LUA,keys.length,...keys,globalLimit,0,minute,60,perClient,60,perOperation,60]);
      if(!Array.isArray(result)||result.length!==3||!result.every(Number.isSafeInteger)||![0,1].includes(result[0])||(result[0]===1?result[1]!==0:result[1]<1||result[1]>5)||result[2]<0||result[2]>globalLimit)throw new RedisQuotaError('REDIS_RESPONSE_INVALID','EVAL',httpStatus);
      if(result[0]!==1)throw new QlooError('REQUEST_BUDGET');
      return {remaining:result[2] as number};
    },
    async halt(provider:'qloo'|'tmdb'){
      const {value,httpStatus}=await command(['SET',`${prefix}:${provider}:halt`,'1']);
      if(value!=='OK')throw new RedisQuotaError('REDIS_RESPONSE_INVALID','SET',httpStatus);
    },
    async status(){
      const {value:result,httpStatus}=await command(['MGET',`${prefix}:qloo:total`,`${prefix}:tmdb:total`,`${prefix}:qloo:halt`,`${prefix}:tmdb:halt`]);
      if(!Array.isArray(result)||result.length!==4||result.some(x=>x!==null&&(typeof x!=='string'||!/^\d+$/.test(x))))throw new RedisQuotaError('REDIS_RESPONSE_INVALID','MGET',httpStatus);
      const item=(provider:'qloo'|'tmdb',index:number)=>{const used=Number(result[index]??0);if(!Number.isSafeInteger(used))throw new QlooError('BLOCKED_LIVE');return {used,limit:policy.limits[provider],remaining:Math.max(0,policy.limits[provider]-used),halted:result[index+2]!==null};};
      return {source:'SHARED_OPERATOR_LIMITS_NOT_PROVIDER_QUOTA',qloo:item('qloo',0),tmdb:item('tmdb',1)};
    }
  };
}
