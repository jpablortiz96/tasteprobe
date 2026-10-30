'use client';
import {useEffect,useState} from 'react';
import {loadMovieVisuals} from './browser-visuals';
import {visualMatches} from './tmdb/policy';
import type {VisualMovie,MovieVisual} from './tmdb/contracts';
/** Optional presentation only. Never selects an identity or changes cultural evidence. */
export function useMovieVisuals(movies:VisualMovie[],disabled=false){
  const [images,setImages]=useState<Record<string,MovieVisual>>({});
  const key=JSON.stringify(movies.slice(0,8).map(({id,name,year,type})=>({id,name,year,type})));
  useEffect(()=>{
    if(disabled||key==='[]')return;
    let current=true;
    const requested=JSON.parse(key) as VisualMovie[];
    void loadMovieVisuals(requested).then(result=>{
      if(!current)return;
      const valid:Record<string,MovieVisual>={};
      for(const m of requested){const v=result.images?.[m.id];if(visualMatches(m,v))valid[m.id]=v;}
      setImages(previous=>Object.fromEntries(Object.entries({...previous,...valid}).slice(-64)));
    });
    return ()=>{current=false;};
  },[key,disabled]);
  return images;
}
