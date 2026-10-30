// Temporary verification process only: Qloo is disabled; TMDB limited to two attempts.
import { writeFileSync } from 'node:fs';
process.env.QLOO_API_KEY='';
const nativeFetch=globalThis.fetch, attempts=[];
function save(){writeFileSync('evidence/gate2g-http-tmdb-attempts.json',JSON.stringify({attempts,liveQlooRequests:0},null,2));}
save();
globalThis.fetch=async(input,init)=>{
  const url=new URL(input instanceof Request?input.url:String(input));
  if(url.origin!=='https://api.themoviedb.org'||!['/3/configuration','/3/search/movie'].includes(url.pathname)||attempts.length>=2)throw Error('VISUAL_TEST_UPSTREAM_BLOCKED');
  const entry={index:attempts.length+1,endpoint:url.pathname,httpStatus:null,error:null};attempts.push(entry);save();
  try{const r=await nativeFetch(input,init);entry.httpStatus=r.status;save();return r;}
  catch{entry.error='NETWORK_OR_TIMEOUT';save();throw Error('NETWORK_OR_TIMEOUT');}
};
