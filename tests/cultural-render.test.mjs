// JSX rendering verification only, NOT a browser or responsive visual approval.
import test from 'node:test';
import assert from 'node:assert/strict';
import { registerHooks } from 'node:module';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { syntheticDiscovery } from '../lib/synthetic-review.ts';

registerHooks({
  resolve(specifier,context,next){
    if(specifier.startsWith('.') && context.parentURL?.startsWith('file:')){
      const base=new URL(specifier,context.parentURL);
      if(!existsSync(base))for(const suffix of ['.tsx','.ts']){const candidate=new URL(base.href+suffix);if(existsSync(candidate))return next(candidate.href,context);}
    }
    return next(specifier,context);
  },
  load(url,context,next){
    if(url.endsWith('.json'))return {format:'module',shortCircuit:true,source:`export default ${JSON.stringify(JSON.parse(readFileSync(fileURLToPath(url),'utf8')))};`};
    if(url.endsWith('.tsx'))return {format:'module',shortCircuit:true,source:ts.transpileModule(readFileSync(fileURLToPath(url),'utf8'),{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.ESNext,target:ts.ScriptTarget.ES2022}}).outputText};
    return next(url,context);
  }
});
const {default:CulturalResults}=await import('../app/cultural-results.tsx');
const {default:MovieArtwork}=await import('../app/movie-artwork.tsx');
const {default:KpiIcon}=await import('../app/kpi-icon.tsx');
const {default:AuditWorkspace}=await import('../app/audit-workspace.tsx');

test('real result components render dashboard, dynamic feature, every movie once and illustrative fallback without image requests',()=>{
  const result=syntheticDiscovery();result.movies[4].affinity=.98;
  const before=structuredClone(result), html=renderToStaticMarkup(React.createElement(CulturalResults,{result,synthetic:true}));
  assert.ok(html.includes('Cultural insights dashboard'));assert.ok(html.includes('0.9800'));
  assert.ok(html.includes(`id="featured-movie-title">${result.movies[4].name}`));
  assert.equal((html.match(/<article /g)||[]).length,8);
  assert.equal((html.match(/ILLUSTRATIVE COVER/g)||[]).length,8);
  assert.ok(!html.includes('<img'));assert.ok(!html.includes('image.tmdb.org'));
  assert.ok(html.includes('SYNTHETIC'));assert.ok(html.includes('Explore why'));assert.ok(html.includes('Why this movie?'));
  assert.deepEqual(result,before);
});
test('rendered missing affinities and empty results never claim a numeric top affinity',()=>{
  const result=syntheticDiscovery();result.movies.forEach(m=>m.affinity=null);
  const html=renderToStaticMarkup(React.createElement(CulturalResults,{result}));
  assert.ok(html.includes('SYNTHETIC FEATURE'));assert.ok(html.includes('Not available'));assert.ok(!html.includes('NaN'));
  result.movies=[];result.returned=0;result.status='INSUFFICIENT_EVIDENCE';
  const empty=renderToStaticMarkup(React.createElement(CulturalResults,{result}));assert.ok(!empty.includes('featured-movie-title'));assert.ok(empty.includes('0 of 8 requested'));
});

test('artwork renders only matched TMDB posters, with dimensions, alt text and a failed-image handler; mismatches fall back',()=>{
  const visual={provider:'TMDB',tmdbId:1,name:'MOCK FILM',year:2016,posterUrl:'https://image.tmdb.org/t/p/w500/mock.jpg',backdropUrl:null,overview:null,retrievedAt:'MOCK',matchedBy:'EXACT_TITLE_YEAR'};
  const html=renderToStaticMarkup(React.createElement(MovieArtwork,{name:'MOCK FILM',year:2016,visual}));
  assert.ok(html.includes('src="https://image.tmdb.org/t/p/w500/mock.jpg"'));assert.ok(html.includes('alt="MOCK FILM (2016)'));assert.ok(html.includes('width="500"'));assert.ok(html.includes('TMDB artwork'));
  const fallback=renderToStaticMarkup(React.createElement(MovieArtwork,{name:'OTHER FILM',year:2016,visual}));assert.ok(!fallback.includes('<img'));assert.ok(fallback.includes('ILLUSTRATIVE COVER'));
  const source=readFileSync(new URL('../app/movie-artwork.tsx',import.meta.url),'utf8');assert.ok(source.includes('onError={()=>setFailed(poster)}'));assert.ok(source.includes('failed!==poster'));
});

test('four KPI icons are small decorative SVGs; metric text and numeric evidence remain accessible',()=>{
  const html=renderToStaticMarkup(React.createElement(CulturalResults,{result:syntheticDiscovery(),synthetic:true}));
  for(const name of ['clapperboard','heart','sparkles','shield-check']){
    assert.equal((html.match(new RegExp(`data-icon="${name}"`,'g'))||[]).length,1);
    const icon=renderToStaticMarkup(React.createElement(KpiIcon,{name}));assert.ok(icon.includes('aria-hidden="true"'));assert.ok(icon.includes('focusable="false"'));assert.ok(icon.includes('viewBox="0 0 24 24"'));
  }
  assert.ok(html.includes('Total movies discovered'));assert.ok(html.includes('Qloo evidence'));assert.ok(html.includes('<dd>8</dd>'));
});
test('Audit entry still renders its comparison workflow with explicit confirmation rather than a Discover flow',()=>{
  const html=renderToStaticMarkup(React.createElement(AuditWorkspace));
  assert.ok(html.includes('Your original recommendations'));assert.ok(html.includes('Confirm movies'));assert.ok(!html.includes('Discover my movies'));
});
