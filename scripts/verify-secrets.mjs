import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const skip = new Set(['node_modules', '.next', '.git', '.npm-cache', '.codex', '.agents', '.aws', 'private']);
const findings = [];
const gate = process.argv[2] ?? 'gate1a';
assert.ok(['gate1a', 'gate1b', 'gate2a', 'gate2a1', 'gate2b', 'gate2c1', 'gate2c2', 'gate2d', 'gate2e', 'gate2f', 'gate2g', 'gate2h', 'gate2h2', 'gate3', 'gate4a', 'gate4b'].includes(gate));
let files = 0;
async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) { if (!skip.has(entry.name)) await scan(path); }
    else if (/\.(tsx?|mjs|json|md|txt|jsonl|css)$/.test(entry.name) || entry.name === '.env.example') {
      const text = await readFile(path, 'utf8'); files++;
      if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text) || /(?:sk-proj-|ghp_|github_pat_)[A-Za-z0-9_]{24,}/.test(text)) findings.push({ path, reason: 'credential-like material' });
      if (entry.name === '.env.example' && /^(?:QLOO_API_KEY|TMDB_READ_ACCESS_TOKEN|TMDB_API_KEY|TASTEPROBE_SIGNING_SECRET|UPSTASH_REDIS_REST_TOKEN)=.+/m.test(text)) findings.push({ path, reason: 'nonempty example credential' });
      for (const name of ['QLOO_API_KEY','TMDB_READ_ACCESS_TOKEN','TMDB_API_KEY','TASTEPROBE_SIGNING_SECRET','UPSTASH_REDIS_REST_TOKEN']) {
        const key = process.env[name]?.trim();
        if (key && text.includes(key)) findings.push({ path, reason: 'configured provider credential appears in file' });
      }
    }
  }
}
await scan('.');
await writeFile(`evidence/${gate}-secret-review.json`, JSON.stringify({ timestamp: new Date().toISOString(), filesScanned: files, findings, configuredKeyPresent: Boolean(process.env.QLOO_API_KEY?.trim()), limitation: 'Pattern review plus optional exact configured-key match, not a guarantee against every secret format. Private environment files are intentionally not read.' }, null, 2) + '\n');
assert.equal(findings.length, 0, 'Possible secrets detected; inspect file names in evidence, never print secret values.');
console.log(`PASS: ${files} project text files reviewed; no findings.`);
