import { createTmdbClient, TmdbError } from './client.ts';
import { resolveMovieVisual } from './resolve-movie-poster.ts';
import type { MovieVisual, VisualMovie, VisualResult } from './contracts.ts';
export function createVisualService(options: Parameters<typeof createTmdbClient>[0] = {}, now=Date.now) {
  const client=createTmdbClient(options), cache=new Map<string,{expires:number;visual:MovieVisual|null}>();
  let configuration:Promise<Record<string,unknown>>|null=null, active=0, started=now(), batches=0;
  return {async resolve(movies:VisualMovie[]):Promise<VisualResult>{
    if(!client.configured)return {status:'BLOCKED_CREDENTIAL',images:{}};
    if(now()-started>60_000){started=now();batches=0;}
    if(active>=2||++batches>12)return {status:'RATE_LIMIT',images:{}};
    active++;const batchStarted=now();
    const images:Record<string,MovieVisual>={};
    try{
      configuration??=client.get('/configuration').catch(e=>{configuration=null;throw e;});
      const config=await configuration;
      // Sequential, bounded 8-call batches keep the visual provider independent and predictable.
      for(const movie of movies){
        if(now()-batchStarted>9000)break;
        if(movie.year===null)continue;
        const key=JSON.stringify([movie.name,movie.year]);
        const old=cache.get(key);
        if(old&&old.expires>now()){if(old.visual)images[movie.id]=old.visual;continue;}
        const data=await client.get('/search/movie',{query:movie.name,primary_release_year:String(movie.year),include_adult:'false',language:'en-US',page:'1'});
        const visual=resolveMovieVisual(movie,data,config,new Date(now()).toISOString());
        if(cache.size>=128)cache.delete(cache.keys().next().value!);
        cache.set(key,{visual,expires:now()+6*60*60_000});
        if(visual)images[movie.id]=visual;
      }
      return {status:Object.keys(images).length?'IMAGE_PROVIDER_READY':'NO_MATCH',images};
    }catch(e){return {status:e instanceof TmdbError&&e.category==='RATE_LIMIT'?'RATE_LIMIT':'UNAVAILABLE',images};}
    finally{active--;}
  }};
}
