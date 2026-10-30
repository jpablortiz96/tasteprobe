// One operation per invocation. External agents choose the tool; this is not an autonomous planner.
const base = new URL(process.env.TASTEPROBE_LOCAL_URL ?? 'http://127.0.0.1:3000');
if (base.protocol !== 'http:' || !['127.0.0.1','localhost'].includes(base.hostname) || base.username || base.password || base.pathname !== '/') throw Error('Only the local TasteProbe origin is allowed.');
let input = '';
for await (const chunk of process.stdin) { input += chunk; if (Buffer.byteLength(input) > 8192) throw Error('Input too large'); }
const operation = JSON.parse(input);
const response = await fetch(new URL('/api/tools',base), { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(operation), signal: AbortSignal.timeout(22000), redirect: 'error' });
console.log(JSON.stringify(await response.json()));
if (!response.ok) process.exitCode = 1;
