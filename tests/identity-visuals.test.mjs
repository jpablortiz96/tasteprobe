import test from 'node:test';
import assert from 'node:assert/strict';
import {loadMovieVisuals} from '../lib/browser-visuals.ts';
import {rescuePassport} from '../lib/rescue-report.ts';
import {revisionFrom} from '../lib/audit-tools.ts';
test('selection and Audit reuse an in-flight visual identity across batches without confirming Qloo identities',async()=>{
  const previous=globalThis.fetch;let calls=0,finish;
  const pending=new Promise(r=>{finish=r;});
  globalThis.fetch=async(url,options)=>{
    calls++;assert.equal(url,'/api/visuals');const m=JSON.parse(options.body).movies[0];await pending;
    return Response.json({status:'IMAGE_PROVIDER_READY',images:{[m.id]:{provider:'TMDB',tmdbId:1,name:m.name,year:m.year,posterUrl:'https://image.tmdb.org/t/p/w500/mock-selection.jpg',backdropUrl:null,overview:null,retrievedAt:'MOCK',matchedBy:'EXACT_TITLE_YEAR'}}});
  };
  try{
    const movie={id:'00000000-0000-4000-8000-000000000091',name:'MOCK selection cache',year:2016,type:'urn:entity:movie'};
    const before=structuredClone(movie),a=loadMovieVisuals([movie]),b=loadMovieVisuals([{...movie,id:'00000000-0000-4000-8000-000000000092'}]);finish();
    const [x,y]=await Promise.all([a,b]);assert.equal(calls,1);assert.equal(Object.keys(x.images).length,1);assert.equal(Object.keys(y.images).length,1);assert.deepEqual(movie,before);assert.equal(movie.confirmed,undefined);assert.equal(movie.proof,undefined);
  }finally{globalThis.fetch=previous;}
});
test('ambiguous/unavailable imagery remains fallback across roles, never a reason to select an identity',async()=>{
  const previous=globalThis.fetch;let calls=0;
  globalThis.fetch=async()=>{calls++;return Response.json({status:'NO_MATCH',images:{}});};
  try{const movie={id:'00000000-0000-4000-8000-000000000093',name:'MOCK ambiguous selection',year:2016,type:'urn:entity:movie'};assert.deepEqual((await loadMovieVisuals([movie])).images,{});assert.deepEqual((await loadMovieVisuals([movie])).images,{});assert.equal(calls,1);assert.equal(movie.confirmed,undefined);}finally{globalThis.fetch=previous;}
});
test('Approve and Reject export distinct decisions while retaining original Qloo ranks, proposal and abstention limits',()=>{
  const evaluation={status:'SUCCESS',rows:[{id:'MOCK_A',name:'MOCK original first',originalRank:1,qlooRank:2,affinity:.2},{id:'MOCK_B',name:'MOCK original second',originalRank:2,qlooRank:1,affinity:.8}],provenance:{requestId:'MOCK_REQUEST'}};
  const proposal=revisionFrom(evaluation),passport={evaluation,proposal,events:[],autonomousLLM:false};const original=structuredClone(passport);
  for(const decision of ['APPROVED','REJECTED']){const report=JSON.parse(JSON.stringify(rescuePassport(passport,decision,'MOCK_TIME')));assert.equal(report.decision.value,decision);assert.equal(report.decision.appliedAutomatically,false);assert.deepEqual(report.evaluation,original.evaluation);assert.deepEqual(report.proposal,original.proposal);}
  assert.deepEqual(passport,original);assert.equal(rescuePassport(null,'PENDING',null).decision.timestamp,null);assert.equal(revisionFrom().status,'ABSTAINED');
});
