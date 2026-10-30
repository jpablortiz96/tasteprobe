import { body, failure, json } from '../../../lib/http';
import { visuals } from '../../../lib/tmdb/server';
import type { VisualMovie } from '../../../lib/tmdb/contracts';
import { QlooError } from '../../../lib/qloo/client.mjs';
export const runtime='nodejs';
export async function POST(request:Request){
  try{
    const input=await body(request);
    if(!input||typeof input!=='object'||Array.isArray(input)||Object.keys(input).some(k=>k!=='movies'))throw new QlooError('INVALID_INPUT');
    const movies=(input as {movies?:unknown}).movies;
    if(!Array.isArray(movies)||movies.length<1||movies.length>8)throw new QlooError('INVALID_INPUT');
    const ids=new Set<string>();
    for(const m of movies){
      if(!m||typeof m!=='object'||Array.isArray(m)||Object.keys(m).some(k=>!['id','name','year','type'].includes(k))||typeof m.id!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(m.id)||ids.has(m.id)||m.type!=='urn:entity:movie'||typeof m.name!=='string'||m.name.trim().length<1||m.name.length>200||/[<>\u0000-\u001f\u007f]/.test(m.name)||(m.year!==null&&(!Number.isInteger(m.year)||m.year<1880||m.year>2100)))throw new QlooError('INVALID_INPUT');
      ids.add(m.id);
    }
    return json(await visuals.resolve(movies as VisualMovie[]));
  }catch(e){return failure(e);}
}
