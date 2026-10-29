import { readdir, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import assert from 'node:assert/strict';

const paths = ['README.md', 'EVIDENCE.md', '.env.example', 'evidence/QLOO_CONTRACT.md'];
async function collect(directory) {
  for (const e of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, e.name);
    if (e.isDirectory()) await collect(path); else paths.push(path);
  }
}
for (const directory of ['app', 'lib', 'scripts', 'tests']) await collect(directory);
const reviews = paths.map(path => {
  const result = spawnSync('git', ['-c', 'core.autocrlf=false', 'diff', '--no-index', '--check', '--', '/dev/null', path], { encoding: 'utf8', windowsHide: true });
  const output = (result.stdout + result.stderr).trim();
  // --no-index implies --exit-code: 1 with no diagnostics means a clean new-file diff.
  return { path, exitCode: result.status, output, result: (result.status === 0 || result.status === 1) && !output ? 'PASS' : 'FAIL' };
});
const status = spawnSync('git', ['-c', 'core.excludesfile=.gitignore', 'status', '--short'], { encoding: 'utf8', windowsHide: true });
await writeFile('evidence/gate1a-worktree-review.json', JSON.stringify({ timestamp: new Date().toISOString(), basis: 'No HEAD/tracked files; inspect each authored file as a new-file diff without changing Git config.', whitespaceReviews: reviews, status: status.stdout.trim(), gitWrite: 'BLOCKED: index.lock permission denied', commit: null }, null, 2) + '\n');
assert.ok(reviews.every(r => r.result === 'PASS'), 'Review whitespace findings in evidence/gate1a-worktree-review.json');
assert.equal(status.status, 0);
console.log(`PASS: ${reviews.length} authored files reviewed as new-file diffs. Git is readable; staging remains blocked.`);
