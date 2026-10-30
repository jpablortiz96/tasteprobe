import type { MovieVisual } from './contracts.ts';
export const normalizedMovieTitle=(s:string)=>s.normalize('NFKC').toLocaleLowerCase('en').replace(/[^\p{L}\p{N}]/gu,'');
export function safeTmdbImage(url:unknown):url is string {
  if(typeof url!=='string')return false;
  try {const u=new URL(url);return u.origin==='https://image.tmdb.org'&&!u.username&&!u.password&&!u.search&&!u.hash&&/^\/t\/p\/(w\d+|original)\/[a-zA-Z0-9_-]+\.(jpg|png|webp)$/.test(u.pathname);}catch{return false;}
}
export function visualMatches(movie:{name:string;year:number|null},visual:MovieVisual|undefined|null):visual is MovieVisual{
  return Boolean(visual&&visual.provider==='TMDB'&&Number.isInteger(visual.tmdbId)&&visual.tmdbId>0&&typeof visual.name==='string'&&movie.year!==null&&visual.year===movie.year&&normalizedMovieTitle(visual.name)===normalizedMovieTitle(movie.name)&&(visual.posterUrl===null||safeTmdbImage(visual.posterUrl))&&(visual.backdropUrl===null||safeTmdbImage(visual.backdropUrl)));
}
