import { requestJson } from './browser-request.ts';
import type { VisualMovie, VisualResult, MovieVisual } from './tmdb/contracts.ts';
import {visualMatches,normalizedMovieTitle} from './tmdb/policy.ts';
// Reuse metadata across batches/roles and development mounts; no retries or identity decisions.
type Entry={visual:MovieVisual|null;status:VisualResult['status']};
const pending=new Map<string,Promise<Entry>>();
const key=(m:VisualMovie)=>JSON.stringify([normalizedMovieTitle(m.name),m.year,m.type]);
export function loadMovieVisuals(movies:VisualMovie[]):Promise<VisualResult>{
  const unseen=[...new Map(movies.filter(m=>!pending.has(key(m))).map(m=>[key(m),m])).values()];
  if(unseen.length){
    const batch:Promise<VisualResult>=requestJson<VisualResult>('/api/visuals',{movies:unseen},fetch,18000).catch(()=>({status:'UNAVAILABLE' as const,images:{}}));
    for(const m of unseen){
      if(pending.size>=64)pending.delete(pending.keys().next().value!);
      pending.set(key(m),batch.then(r=>({visual:visualMatches(m,r.images?.[m.id])?r.images[m.id]:null,status:r.status})));
    }
  }
  const entries=movies.map(m=>pending.get(key(m))??Promise.resolve({visual:null,status:'UNAVAILABLE' as const}));
  return Promise.all(entries).then(values=>{
    const images:Record<string,MovieVisual>={};values.forEach((v,i)=>{if(v.visual)images[movies[i].id]=v.visual;});
    const status:VisualResult['status']=Object.keys(images).length?'IMAGE_PROVIDER_READY':values.find(v=>v.status!=='IMAGE_PROVIDER_READY'&&v.status!=='NO_MATCH')?.status??'NO_MATCH';
    return {status,images};
  });
}
