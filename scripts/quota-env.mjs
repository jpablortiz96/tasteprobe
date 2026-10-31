import {readFileSync} from 'node:fs';
import {parseEnv} from 'node:util';
export const quotaVariables=['UPSTASH_REDIS_REST_URL','UPSTASH_REDIS_REST_TOKEN','TASTEPROBE_SIGNING_SECRET','TASTEPROBE_QUOTA_NAMESPACE','TASTEPROBE_QLOO_TOTAL_LIMIT','TASTEPROBE_TMDB_TOTAL_LIMIT'];
export function loadQuotaEnvironment({file='.env.local',env=process.env,fromFile=true}={}){
  if(!fromFile)return {source:'INHERITED_PREFLIGHT_WORKER',conflicts:[]};
  let parsed;try{parsed=parseEnv(readFileSync(file,'utf8'));}catch(e){if(e.code==='ENOENT')return {source:'PROCESS_ENV',conflicts:[]};throw Error('ENV_FILE_UNREADABLE');}
  const conflicts=quotaVariables.filter(name=>Object.hasOwn(parsed,name)&&Object.hasOwn(env,name)&&parsed[name]!==env[name]);
  if(conflicts.length){const e=Error('ENV_CONFLICT');e.envConflicts=conflicts;throw e;}
  for(const name of quotaVariables)if(Object.hasOwn(parsed,name)&&!Object.hasOwn(env,name))env[name]=parsed[name];
  return {source:'ENV_LOCAL_WITH_PROCESS_CONFLICT_CHECK',conflicts:[]};
}
