import type { MovieVisual, VisualMovie } from './contracts.ts';
import { normalizedMovieTitle as title } from './policy.ts';
const object=(v:unknown):Record<string,unknown>|null=>v&&typeof v==='object'&&!Array.isArray(v)?v as Record<string,unknown>:null;
export function resolveMovieVisual(movie: VisualMovie, data: Record<string,unknown>, configuration: Record<string,unknown>, timestamp: string): MovieVisual | null {
  if(movie.type!=='urn:entity:movie'||movie.year===null||!Array.isArray(data.results))return null;
  // A later page may contain another exact identity: abstain instead of guessing.
  if(typeof data.total_pages==='number'&&data.total_pages>1)return null;
  const matches=data.results.map(object).filter((m):m is Record<string,unknown>=>Boolean(m&&Number.isInteger(m.id)&&Number(m.id)>0&&m.adult!==true&&(!m.media_type||m.media_type==='movie')&&typeof m.title==='string'&&title(m.title)===title(movie.name)&&typeof m.release_date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(m.release_date)&&Number(m.release_date.slice(0,4))===movie.year));
  if(matches.length!==1)return null;
  const m=matches[0], images=object(configuration.images);
  if(images?.secure_base_url!=='https://image.tmdb.org/t/p/')return null;
  function image(path:unknown,sizes:unknown,preferred:string[]){
    if(typeof path!=='string'||!/^\/[a-zA-Z0-9_-]+\.(jpg|png|webp)$/.test(path)||!Array.isArray(sizes))return null;
    const size=preferred.find(s=>sizes.includes(s));return size?`${images!.secure_base_url}${size}${path}`:null;
  }
  const posterUrl=image(m.poster_path,images.poster_sizes,['w500','w342','original']);
  const backdropUrl=image(m.backdrop_path,images.backdrop_sizes,['w1280','w780','original']);
  if(!posterUrl&&!backdropUrl)return null;
  return {provider:'TMDB',tmdbId:Number(m.id),name:String(m.title),year:movie.year,posterUrl,backdropUrl,overview:typeof m.overview==='string'&&m.overview.length<=3000&&!/[\u0000-\u001f]/.test(m.overview)?m.overview:null,retrievedAt:timestamp,matchedBy:'EXACT_TITLE_YEAR'};
}
