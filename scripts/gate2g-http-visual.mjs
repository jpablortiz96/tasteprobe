import { spawn } from 'node:child_process';
import { createServer } from 'node:net';
import { once } from 'node:events';
import { writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const socket=createServer();socket.listen(0,'127.0.0.1');await once(socket,'listening');const port=socket.address().port;await new Promise(r=>socket.close(r));
const child=spawn(process.execPath,['--import',new URL('./gate2g-visual-guard.mjs',import.meta.url).href,'node_modules/next/dist/bin/next','start','--hostname','127.0.0.1','--port',String(port)],{windowsHide:true,stdio:['ignore','pipe','pipe'],env:{...process.env,QLOO_API_KEY:''}});
child.stdout.resume();child.stderr.resume();
const base=`http://127.0.0.1:${port}`;
try{
  let ready=false;for(let i=0;i<60;i++){if(child.exitCode!==null)throw Error('LOCAL_SERVER_EXITED');try{if((await fetch(base+'/api/health',{signal:AbortSignal.timeout(500)})).ok){ready=true;break;}}catch{}await new Promise(r=>setTimeout(r,100));}assert.ok(ready);
  const r=await fetch(base+'/api/visuals',{method:'POST',headers:{Origin:base,'Content-Type':'application/json'},body:JSON.stringify({movies:[{id:'00000000-0000-4000-8000-000000000001',name:'Passengers',year:2016,type:'urn:entity:movie'}]}),signal:AbortSignal.timeout(15000)});
  const data=await r.json();assert.equal(r.status,200);assert.equal(data.status,'IMAGE_PROVIDER_READY');
  const visual=Object.values(data.images)[0];assert.equal(visual.name,'Passengers');assert.equal(visual.year,2016);assert.equal(visual.provider,'TMDB');assert.ok(visual.posterUrl);
  const text=JSON.stringify(data);for(const name of ['TMDB_READ_ACCESS_TOKEN','TMDB_API_KEY'])assert.ok(!process.env[name]||!text.includes(process.env[name]));
  await writeFile('evidence/gate2g-http-visual.json',JSON.stringify({timestamp:new Date().toISOString(),method:'POST',path:'/api/visuals',origin:base,httpStatus:r.status,status:data.status,visual,credentialFoundInResponse:false,liveQlooRequests:0,qlooDisabledInTestProcess:true,limitation:'Real local HTTP/TMDB integration; not a browser visual test or new Qloo recommendation'},null,2)+'\n');
  console.log('PASS: real local /api/visuals returned matched Passengers poster, no credential in response; Qloo disabled.');
}finally{if(child.exitCode===null){const exit=once(child,'exit');child.kill();await exit;}}
