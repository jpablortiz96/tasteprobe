import test from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, readFileSync, unlinkSync, rmdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('../scripts/qloo-smoke.mjs', import.meta.url));
for (const key of ['', 'MOCK_TEST_ONLY_NOT_A_CREDENTIAL']) {
  test(key ? 'MOCK credential cannot bypass documentation review' : 'CLI persists honest BLOCKED_LIVE evidence without a key', () => {
    const directory = mkdtempSync(join(tmpdir(), 'tasteprobe-g0-'));
    try {
      const result = spawnSync(process.execPath, [script, '--execute'], {
        cwd: directory, encoding: 'utf8', env: { ...process.env, QLOO_API_KEY: key, QLOO_BASE_URL: 'https://hackathon.api.qloo.com' },
      });
      assert.equal(result.status, 2);
      const evidence = JSON.parse(readFileSync(join(directory, 'evidence/qloo-smoke-redacted.json'), 'utf8'));
      assert.equal(evidence.errorCategory, key ? 'BLOCKED_DOCUMENTATION' : 'BLOCKED_LIVE');
      assert.equal(evidence.liveRequests, 0);
      assert.equal(evidence.response, null);
      assert.equal(evidence.falsifier.result, 'NOT_EVALUATED');
      if (key) assert.ok(!JSON.stringify(evidence).includes(key) && !result.stdout.includes(key));
    } finally {
      // Delete only the two known files and now-empty directories; no recursive deletion.
      for (const file of ['qloo-smoke-redacted.json', 'qloo-smoke-history.jsonl']) unlinkSync(join(directory, 'evidence', file));
      rmdirSync(join(directory, 'evidence'));
      rmdirSync(directory);
    }
  });
}
