import { writeFile } from 'node:fs/promises';
const port = process.argv[2] ?? '3005';
if (!/^\d{4,5}$/.test(port)) throw Error('Invalid local port');
const observations = [];
for (const host of ['127.0.0.1', 'localhost']) {
  const origin = `http://${host}:${port}`;
  const response = await fetch(origin + '/api/tools', { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify({ action: 'create', intent: 'Origin verification without Qloo traffic', caller: 'human-ui' }) });
  const data = await response.json();
  observations.push({ origin, host: `${host}:${port}`, httpStatus: response.status, error: data.error ?? null, sessionCreated: Boolean(data.session) });
}
const artifact = process.argv[3] ?? 'evidence/gate2c1-origin-before.json';
if (!/^evidence\/gate2c1-origin-(before|after)\.json$/.test(artifact)) throw Error('Invalid evidence path');
await writeFile(artifact, JSON.stringify({ timestamp: new Date().toISOString(), liveQlooRequests: 0, observations }, null, 2) + '\n');
console.log(JSON.stringify(observations));
