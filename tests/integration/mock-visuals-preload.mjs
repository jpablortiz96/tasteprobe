import './mock-qloo-preload.mjs';
import assert from 'node:assert/strict';
const previous=globalThis.fetch;
globalThis.fetch=async(input,init)=>{
  const u=new URL(input instanceof Request?input.url:String(input));
  if(u.origin!=='https://api.themoviedb.org')return previous(input,init);
  assert.equal(init.headers.Authorization,'Bearer MOCK_VISUAL_ONLY');
  assert.equal(init.method,'GET');assert.equal(init.redirect,'error');
  if(u.pathname==='/3/configuration')return Response.json({images:{secure_base_url:'https://image.tmdb.org/t/p/',poster_sizes:['w500'],backdrop_sizes:['w1280']}});
  assert.equal(u.pathname,'/3/search/movie');
  const q=u.searchParams.get('query');
  if(q==='MOCK missing')return Response.json({results:[]});
  return Response.json({total_pages:1,results:[{id:2,title:q,release_date:`${u.searchParams.get('primary_release_year')}-01-01`,poster_path:'/mock-only.jpg',backdrop_path:null,overview:'MOCK visual synopsis'}]});
};
