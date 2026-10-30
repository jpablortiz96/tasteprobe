// Runs the actual compiled Next app and LIVE HTTP client within one approved execution.
// No production routes, identities, credentials or upstream responses are substituted.
import next from 'next';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { once } from 'node:events';
await import('./gate2a-observe.mjs');
const app = next({ dev:false,hostname:'127.0.0.1',port:3003 });
await app.prepare();
const server=createServer(app.getRequestHandler());
server.listen(3003,'127.0.0.1'); await once(server,'listening');
try {
  process.argv=['node','gate2a-live.mjs','--resolve'];
  await import('./gate2a-live.mjs?resolve');
  const evidence=JSON.parse(await readFile('evidence/gate2a-live.json','utf8'));
  if(evidence.status!=='IDENTITIES_RESOLVED_REQUIRES_EXECUTION_OPT_IN')throw Error('LIVE_RESOLUTION_BLOCKED');
  process.argv=['node','gate2a-live.mjs','--audit-confirmed-identities'];
  await import('./gate2a-live.mjs?audit');
} finally {
  server.closeAllConnections();
  await new Promise(resolve=>server.close(resolve));
  await app.close();
}
