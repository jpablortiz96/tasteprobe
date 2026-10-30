import { writeFile, readFile } from 'node:fs/promises';
const observations=[];
for(const port of [3000,3001]){
  const base=`http://127.0.0.1:${port}`;
  try{
    const healthResponse=await fetch(base+'/api/health',{signal:AbortSignal.timeout(1500)});
    const health=await healthResponse.json();
    if(!['CONFIGURED_NOT_VERIFIED','BLOCKED_LIVE'].includes(health.status))continue;
    // Empty favorites always fail BEFORE the upstream boundary in the current service.
    const response=await fetch(base+'/api/discover',{method:'POST',headers:{'Content-Type':'application/json',Origin:base},body:JSON.stringify({interests:[]}),signal:AbortSignal.timeout(5000)});
    let data;try{data=await response.json();}catch{data={error:'NON_JSON_LOCAL_RESPONSE'};}
    observations.push({port,health:health.status,httpStatus:response.status,error:typeof data.error==='string'?data.error:'NO_ERROR_FIELD',...(data.diagnostic?.reason==='STALE_SERVICE_MISSING_DISCOVER'?{diagnostic:{layer:'APPLICATION_DISPATCH',reason:'STALE_SERVICE_MISSING_DISCOVER'}}:{}),probe:'EMPTY_INTERESTS_NO_QLOO'});
  }catch{observations.push({port,probe:'UNAVAILABLE_LOCAL_PROCESS'});}
}
const report={timestamp:new Date().toISOString(),liveQlooRequests:0,observations};
await writeFile('evidence/gate2c2-diagnosis-after.json',JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));
