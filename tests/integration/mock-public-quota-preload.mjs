// SYNTHETIC Redis contract emulator around existing Qloo MOCK transport. No external requests.
await import('./mock-qloo-preload.mjs');
const downstream=globalThis.fetch,values=new Map();
globalThis.fetch=async(input,init)=>{
  const url=new URL(input instanceof Request?input.url:String(input));
  if(url.origin!=='https://offline-test.upstash.io')return downstream(input,init);
  const args=JSON.parse(init.body);
  if(args[0]==='SET'){values.set(args[1],args[2]);return Response.json({result:'OK'});}
  if(args[0]!=='EVAL')throw Error('MOCK command not supported');
  const n=Number(args[2]),keys=args.slice(3,3+n),limits=args.slice(3+n);
  if(values.has(keys[0]))return Response.json({result:[0,1,0]});
  for(let i=1;i<n;i++)if((Number(values.get(keys[i]))||0)>=Number(limits[(i-1)*2]))return Response.json({result:[0,i+1,0]});
  for(const key of keys.slice(1))values.set(key,(Number(values.get(key))||0)+1);
  return Response.json({result:[1,0,Number(limits[0])-values.get(keys[1])]});
};
