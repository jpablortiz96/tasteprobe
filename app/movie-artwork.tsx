'use client';
import { useState } from 'react';
import type { MovieVisual } from '../lib/tmdb/contracts';
import { visualMatches } from '../lib/tmdb/policy';
export default function MovieArtwork({ name, year, variant, visual }: { name: string; year: number | null; variant?: number; visual?: MovieVisual | null }) {
  const [failed,setFailed]=useState<string|null>(null);
  const poster=visualMatches({name,year},visual)?visual.posterUrl:null;
  if(poster&&failed!==poster)return <div className="movie-artwork real-poster"><img src={poster} alt={`${name} (${year}) — poster from TMDB`} width={500} height={750} loading="lazy" referrerPolicy="no-referrer" onError={()=>setFailed(poster)}/><span className="poster-source">TMDB artwork</span></div>;
  const style = (variant ?? Array.from(name).reduce((sum, c) => sum + c.charCodeAt(0), 0)) % 4;
  return <div className={`movie-artwork cover-style-${style}`} role="img" aria-label={`Original illustrative TasteProbe cover for ${name}, ${year ?? 'year unavailable'}. Not an official movie poster.`}>
    <span className="art-studio" aria-hidden="true">TASTEPROBE<br/><small>CULTURAL CONNECTIONS</small></span>
    <span className="art-halo" aria-hidden="true"/><span className="art-horizon" aria-hidden="true"/><span className="art-filament" aria-hidden="true"/>
    <span className="art-caption" aria-hidden="true">ILLUSTRATIVE COVER</span>
  </div>;
}
