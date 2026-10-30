// Authorized TMDB-only verification: two requests maximum, no Qloo, no retries.
import { writeFile } from 'node:fs/promises';
import { createTmdbClient } from '../lib/tmdb/client.ts';
import { resolveMovieVisual } from '../lib/tmdb/resolve-movie-poster.ts';
const attempts=[];
const movieName=process.argv[2]==='Passengers'?'Passengers':'Arrival';
const client=createTmdbClient({token:process.env.TMDB_READ_ACCESS_TOKEN,apiKey:process.env.TMDB_API_KEY,fetchImpl:async(url,options)=>{
  if(url.origin!=='https://api.themoviedb.org'||attempts.length>=2)throw Error('SMOKE_BUDGET');
  const entry={index:attempts.length+1,endpoint:url.pathname,httpStatus:null,error:null};attempts.push(entry);
  try{const response=await fetch(url,options);entry.httpStatus=response.status;return response;}
  catch{entry.error='NETWORK_OR_TIMEOUT';throw Error('NETWORK_OR_TIMEOUT');}
}});
let status='UNAVAILABLE',visual=null,error=null;
try{
  if(!client.configured)status='BLOCKED_CREDENTIAL';
  else{
    const configuration=await client.get('/configuration');
    const data=await client.get('/search/movie',{query:movieName,primary_release_year:'2016',include_adult:'false',language:'en-US',page:'1'});
    visual=resolveMovieVisual({id:'SMOKE_LOCAL_ONLY',name:movieName,year:2016,type:'urn:entity:movie'},data,configuration,new Date().toISOString());
    status=visual?'IMAGE_PROVIDER_READY':'NO_MATCH';
  }
}catch(e){error=typeof e.category==='string'?e.category:'UNAVAILABLE';}
await writeFile(movieName==='Passengers'?'evidence/gate2g-tmdb-passengers.json':'evidence/gate2g-tmdb-live.json',JSON.stringify({timestamp:new Date().toISOString(),status,provider:'TMDB',authMode:process.env.TMDB_READ_ACCESS_TOKEN?.trim()?'BEARER':process.env.TMDB_API_KEY?.trim()?'SERVER_API_KEY':'NONE',attempts,visual,error,liveQlooRequests:0,limitation:'Validates TMDB metadata and strict matching; does not certify browser image loading or Qloo integration.'},null,2)+'\n');
console.log(JSON.stringify({status,attempts,matchedTitle:visual?.name??null,matchedYear:visual?.year??null,posterAvailable:Boolean(visual?.posterUrl),liveQlooRequests:0,error}));
