import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const skip = new Set(['node_modules', '.next', '.git', '.npm-cache', '.codex', '.agents', '.aws', 'private']);
const findings = [];
let files = 0;
async function scan(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) { if (!skip.has(entry.name)) await scan(path); }
    else if (/\.(tsx?|mjs|json|md|txt|jsonl|css)$/.test(entry.name) || entry.name === '.env.example') {
      const text = await readFile(path, 'utf8'); files++;
      if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/.test(text) || /(?:sk-proj-|ghp_|github_pat_)[A-Za-z0-9_]{24,}/.test(text)) findings.push({ path, reason: 'credential-like material' });
      if (entry.name === '.env.example' && /^QLOO_API_KEY=.+/m.test(text)) findings.push({ path, reason: 'nonempty example credential' });
      const key = process.env.QLOO_API_KEY?.trim();
      if (key && text.includes(key)) findings.push({ path, reason: 'configured Qloo key appears in file' });
    }
  }
}
await scan('.');
await writeFile('evidence/gate1a-secret-review.json', JSON.stringify({ timestamp: new Date().toISOString(), filesScanned: files, findings, configuredKeyPresent: Boolean(process.env.QLOO_API_KEY?.trim()), limitation: 'Pattern review plus optional exact configured-key match, not a guarantee against every secret format. Private environment files are intentionally not read.' }, null, 2) + '\n');
assert.equal(findings.length, 0, 'Possible secrets detected; inspect file names in evidence, never print secret values.');
console.log(`PASS: ${files} project text files reviewed; no findings.`);
