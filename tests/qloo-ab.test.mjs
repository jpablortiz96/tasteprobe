import test from 'node:test';
import assert from 'node:assert/strict';
import { compareAB } from '../scripts/qloo-ab-compare.mjs';
const MOCK=()=>({candidates:[1,2,3].map(i=>({idHash:String(i),name:`MOCK ${i}`})),scenarios:Object.fromEntries(['A','B'].map(label=>[label,{httpStatus:200,parameters:{'filter.type':'urn:entity:movie','signal.interests.entities':label,'filter.results.entities':'1,2,3',take:'3','feature.explainability':'true'},rows:[1,2,3].map(i=>({idHash:String(i),rank:i,affinity:1-i/10,explainability:null}))}]))});
test('MOCK A/B with unchanged evidence is inconclusive',()=>assert.equal(compareAB(MOCK()).status,'INCONCLUSIVE'));
test('MOCK A/B detects raw affinity change even when order is unchanged',()=>{const r=MOCK();r.scenarios.B.rows[0].affinity=.5;const c=compareAB(r);assert.equal(c.status,'PASS');assert.equal(c.orderChanged,false);assert.equal(c.affinityChanged,true);});
test('A/B refuses extra changed parameters',()=>{const r=MOCK();r.scenarios.B.parameters.take='4';assert.throws(()=>compareAB(r));});
test('MOCK partial, duplicate or missing numeric evidence is inconclusive',()=>{for(const mutate of [r=>r.scenarios.B.rows.pop(),r=>r.scenarios.B.rows[0].idHash='2',r=>r.scenarios.B.rows[0].affinity=null]){const r=MOCK();mutate(r);assert.equal(compareAB(r).status,'INCONCLUSIVE');}});
