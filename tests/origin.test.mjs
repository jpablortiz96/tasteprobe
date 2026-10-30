import test from 'node:test';
import assert from 'node:assert/strict';
import { validateOrigin } from '../lib/http.ts';
import { requestJson } from '../lib/browser-request.ts';
const request = (url,origin,host,extra={}) => new Request(url+'/api/tools',{method:'POST',headers:{Origin:origin,...(host?{Host:host}:{}),...extra}});
test('same-origin localhost and 127.0.0.1 requests pass, including Next loopback URL reconstruction',()=>{
  for(const host of ['localhost','127.0.0.1']){
    assert.doesNotThrow(()=>validateOrigin(request(`http://${host}:3005`,`http://${host}:3005`,`${host}:3005`)));
    assert.doesNotThrow(()=>validateOrigin(request('http://localhost:3005',`http://${host}:3005`,`${host}:3005`)));
    assert.doesNotThrow(()=>validateOrigin(request('http://127.0.0.1:3005',`http://${host}:3005`,`${host}:3005`)));
  }
});
test('foreign origins, loopback port mismatch, Host mismatch and cross-site requests are refused',()=>{
  for(const r of [request('http://localhost:3005','https://evil.example','localhost:3005'),request('http://localhost:3005','http://127.0.0.1:3006','127.0.0.1:3006'),request('http://localhost:3005','http://127.0.0.1:3005','localhost:3005'),request('http://localhost:3005','null','localhost:3005'),request('http://localhost:3005','http://localhost:3005','localhost:3005',{'sec-fetch-site':'cross-site'}),request('http://localhost:3005','http://evil.example:3005','evil.example:3005'),request('https://localhost:3005','http://127.0.0.1:3005','127.0.0.1:3005')])assert.throws(()=>validateOrigin(r),{category:'FORBIDDEN_ORIGIN'});
});
test('frontend cannot select an absolute or protocol-relative API origin',async()=>{
  let calls=0;for(const path of ['http://localhost:3000/api/tools','https://evil.example/api/tools','//evil.example/api/tools','/api/tools?redirect=evil'])await assert.rejects(requestJson(path,{},async()=>{calls++;}),{message:'INVALID_INPUT'});
  assert.equal(calls,0);
});
