// Hosting-only launcher. No credentials are generated or logged.
import {spawn} from 'node:child_process';
import {publicPolicy} from '../lib/production-policy.ts';
process.env.NODE_ENV='production';process.env.TASTEPROBE_DEPLOYMENT='public';
try{
  publicPolicy();
  const port=process.env.PORT;
  if(!port||!/^\d{1,5}$/.test(port)||Number(port)<1||Number(port)>65535)throw 0;
  const child=spawn(process.execPath,['node_modules/next/dist/bin/next','start','--hostname','0.0.0.0','--port',port],{stdio:'inherit',env:process.env,windowsHide:true});
  child.on('error',()=>{console.error('Public server failed to start.');process.exitCode=1;});
  child.on('exit',code=>{process.exitCode=code??1;});
  for(const signal of ['SIGTERM','SIGINT'])process.on(signal,()=>child.kill(signal));
}catch{console.error('Public startup blocked: configure exact HTTPS origin, signing secret, shared quota credentials/namespace/limits and PORT. No provider request made.');process.exitCode=1;}
