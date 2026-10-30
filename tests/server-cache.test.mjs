import test from 'node:test';
import assert from 'node:assert/strict';
import { cachedServerValue } from '../lib/server-cache.ts';
test('regression: development cache replaces a pre-Discover service after factory reload',()=>{
  const legacy={health(){},search(){},audit(){}};
  const state={tasteProbeService:legacy};
  const factory=()=>({health(){},search(){},audit(){},discover(){return 'MOCK_NEW_METHOD';}});
  const service=cachedServerValue(state,'tasteProbeService',factory,factory);
  assert.equal(typeof service.discover,'function');
  assert.equal(service.discover(),'MOCK_NEW_METHOD');
});
test('same factory preserves service identity, signing state and request budgets across requests',()=>{
  let creations=0;const state={};const factory=()=>({signingState:{},attempts:++creations});
  const a=cachedServerValue(state,'service',factory,factory);const b=cachedServerValue(state,'service',factory,factory);
  assert.equal(a,b);assert.equal(creations,1);
});
test('factory replacement refreshes dependent tool sessions instead of retaining obsolete service closure',()=>{
  const state={};const oldFactory=()=>({serviceVersion:'old'});const newFactory=()=>({serviceVersion:'current'});
  cachedServerValue(state,'tools',oldFactory,oldFactory);
  assert.equal(cachedServerValue(state,'tools',newFactory,newFactory).serviceVersion,'current');
});
test('changing the service dependency refreshes the tools even when their factory is unchanged',()=>{
  const state={};const factory=()=>({});const a={},b={};
  const old=cachedServerValue(state,'tools',factory,factory,a);
  assert.notEqual(cachedServerValue(state,'tools',factory,factory,b),old);
});
