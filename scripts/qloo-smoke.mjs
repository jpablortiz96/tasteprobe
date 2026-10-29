import { writeFile, mkdir, readFile, appendFile } from 'node:fs/promises';
import { createQlooClient, QlooError } from '../lib/qloo/client.mjs';

// No response fixtures, no inferred score field, no automatic ID resolution.
const args = process.argv.slice(2);
const evidence = {
  gate: 0, timestamp: new Date().toISOString(), status: 'BLOCKED_LIVE',
  liveRequests: 0, request: null, response: null,
  falsifier: { resolvedTitles: null, comparableAffinities: null, divergence: null, result: 'NOT_EVALUATED' },
  explainability: 'NOT_VALIDATED',
};
try {
  const client = createQlooClient({ apiKey: process.env.QLOO_API_KEY, baseUrl: process.env.QLOO_BASE_URL });
  if (!process.env.QLOO_API_KEY?.trim()) throw new QlooError('BLOCKED_LIVE');
  // Human review of current endpoint documentation is required before a paid/quota-consuming call.
  if (!args.includes('--reference-reviewed')) throw new QlooError('BLOCKED_DOCUMENTATION');
  if (!args.includes('--execute')) throw new QlooError('BLOCKED_EXECUTION_OPT_IN');
  const fileIndex = args.indexOf('--request-file');
  if (fileIndex < 0 || !args[fileIndex + 1]) throw new QlooError('REQUEST_FILE_REQUIRED');
  const request = JSON.parse(await readFile(args[fileIndex + 1], 'utf8'));
  if (!['/search', '/v2/insights'].includes(request.path) || !request.params || typeof request.params !== 'object') throw new QlooError('INVALID_REQUEST');
  const allowed = request.path === '/search' ? ['query']
    : ['filter.type', 'signal.interests.entities', 'filter.results.entities', 'take'];
  if (Object.keys(request.params).some(key => !allowed.includes(key))) throw new QlooError('INVALID_PARAMETER');
  if (Object.values(request.params).some(v => typeof v !== 'string' || v.length > 250 || /[\r\n]/.test(v) || v.includes(process.env.QLOO_API_KEY))) throw new QlooError('INVALID_PARAMETER');
  if (request.path === '/search' && (!request.params.query || request.params.query.length < 2 || request.params.query.length > 80)) throw new QlooError('INVALID_QUERY');
  if (request.path === '/v2/insights') {
    const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const signals = request.params['signal.interests.entities']?.split(',') ?? [];
    const candidates = request.params['filter.results.entities']?.split(',') ?? [];
    if (request.params['filter.type'] !== 'urn:entity:movie' || signals.length < 1 || signals.length > 2 || candidates.length < 3 || candidates.length > 5 || [...signals, ...candidates].some(id => !uuid.test(id)) || new Set([...signals, ...candidates]).size !== signals.length + candidates.length || request.params.take !== '5') throw new QlooError('INVALID_SHORTLIST');
  }
  evidence.request = { path: request.path, parameterNames: Object.keys(request.params) };
  evidence.liveRequests = 1;
  const { status, data } = await client.get(request.path, request.params);
  // Save structure only. No raw values, titles, headers, arbitrary API text, or normalized percentages.
  const known = new Set(['results', 'entities', 'entity_id', 'name', 'type', 'types', 'properties', 'release_year', 'release_date', 'query', 'success', 'affinity', 'score', 'scores', 'explainability', 'count']);
  function shape(value, depth = 0) {
    if (depth > 5) return 'depth_limit';
    if (Array.isArray(value)) return { type: 'array', count: value.length, sample: value.slice(0, 5).map(item => shape(item, depth + 1)) };
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).filter(([key]) => known.has(key)).map(([key, item]) => [key, shape(item, depth + 1)]));
    return value === null ? 'null' : typeof value;
  }
  evidence.response = { status, structure: shape(data) };
  evidence.status = 'AT_RISK';
  evidence.errorCategory = 'LIVE_RESPONSE_REQUIRES_MANUAL_REVIEW';
} catch (error) {
  evidence.errorCategory = error instanceof QlooError ? error.category : 'LOCAL_EXPERIMENT_ERROR';
  evidence.status = evidence.errorCategory === 'BLOCKED_LIVE' ? 'BLOCKED_LIVE' : 'AT_RISK';
  if (error instanceof QlooError && error.status) evidence.response = { status: error.status };
}
await mkdir('evidence', { recursive: true });
await writeFile('evidence/qloo-smoke-redacted.json', JSON.stringify(evidence, null, 2) + '\n');
await appendFile('evidence/qloo-smoke-history.jsonl', JSON.stringify(evidence) + '\n');
console.log(JSON.stringify({ status: evidence.status, category: evidence.errorCategory, liveRequests: evidence.liveRequests }));
// A single HTTP success never passes the falsifier.
process.exitCode = 2;
