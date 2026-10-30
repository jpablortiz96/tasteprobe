# TasteProbe — GATE 1A evidence

Observed 2026-10-29. Only **GATE 1A** is active. The prior record is preserved in [GATE0_HISTORY.md](evidence/GATE0_HISTORY.md); its dependency/build/Git observations describe an earlier environment and are superseded by the results below. Original planning documents and the submission draft were not modified.

## GATE / STATUS

**GATE 1A: AT_RISK — automated local foundation PASS; full product acceptance remains pending visual browser QA and the unresolved event REST contract items.**

**G0_LIVE_PASS: BLOCKED_LIVE.** No `QLOO_API_KEY` was present in the process environment; `.env.local` was absent. No authorized Qloo request, real identity resolution, affinity, successful live case, or falsifier pass is claimed. No public deployment, authentication, payments, or secondary product scope was added.

| Check | Actual result | Evidence |
|---|---|---|
| Sandbox read/write/execute | PASS | Created `.sandbox-probe.tmp`, read back its known text, executed Node, removed only that file in `finally` |
| Workspace inspection | PASS | Read package manifest, lockfile, all initial app/lib/scripts/tests files, ignore rules and prior evidence; no applicable workspace/parent AGENTS.md found |
| Harness dependency | NOT REQUIRED | `rg` found no `@qloo/qloo-harness` references in package.json, package-lock.json, app/, lib/, scripts/ or tests/. It was already absent; no uninstall was necessary |
| Dependency audit | PASS | Final approved registry audit: 0 info/low/moderate/high/critical vulnerabilities; 60 dependency entries. [Raw JSON](evidence/gate1a-audit.json) |
| Tests | PASS | 37 tests, 37 passed, 0 failed/skipped. [Output](evidence/gate1a-tests.txt) |
| Typecheck | PASS | `npm.cmd run typecheck`, exit 0. [Output](evidence/gate1a-typecheck.txt) |
| Production build | PASS | `npm.cmd run build`, exit 0; page plus health/search/audit routes compiled. [Output](evidence/gate1a-build.txt) |
| Compiled HTTP routes | PASS | 9 checks against actual loopback Next.js server, including client bundle scan; zero Qloo calls. [Artifact](evidence/gate1a-routes.json) |
| Credential isolation | PASS within checked scope | Server wrapper uses `server-only`; client imports typed contracts and report builder only. 23 client JS/HTML files contain no credential variable, X-Api-Key, Qloo host/transport, or MOCK credential marker. Server rejects responses that echo its key |
| Source secret review | PASS within pattern scope | [Secret review](evidence/gate1a-secret-review.json); no findings. Environment files and unrelated private directories were not read. No secret scanner can establish absence of every possible credential format |
| Browser/visual QA | BLOCKED | In-app browser reported unavailable access host. Native Chrome selection then timed out waiting for app authorization. No screenshot, actual click-through, mobile render, visual contrast audit or successful browser E2E is claimed |
| Git write / commit | BLOCKED | Git repository exists on unborn `master`; no tracked files/commits. `git add` failed creating `.git/index.lock`: Permission denied. No commit created or escalation attempted |

## Working product behavior

- User-editable intake for 1–3 interest films and 3–5 original recommendations; original order is the entered line order. Sample button supplies **input titles only**, never generated recommendations or Qloo outcomes.
- Three-step responsive dashboard: prepare, explicitly confirm identities, compare evidence. Includes disabled controls with a clear missing-key explanation, loading, empty results, safe error, partial evidence and complete-response views. CSS includes mobile breakpoints, focus states and reduced-motion support. These layouts are implemented but visually unverified.
- Live Search adapter accepts bounded title queries, requests five choices, filters for explicit movie identities, and never automatically accepts a choice. Names, optional release years and signed identity proofs come only from the actual response.
- Audit verifies all proofs and explicit confirmations before one Insights request. It compares the original order with the returned order for the same IDs. Full coverage permits rank shifts; incomplete coverage sets shifts to `null` and proposes no revised ranking. Unreturned candidates are not assigned zero or labeled poor recommendations.
- Export works from any step through a browser download action. The tested report builder preserves input order, records missing evidence/errors, strips identity proofs, and includes actual provenance/limitations when a result exists. The download click itself was not verified in a browser.
- Current real local behavior is **BLOCKED_LIVE**. Complete/partial remote response paths are verified only through isolated MOCK transport tests. No runtime mock or fallback is installed.

## Backend contract and security

See [QLOO_CONTRACT.md](evidence/QLOO_CONTRACT.md) for immutable official documentation references and pending items. The official `qloo/docs-public` repository was read at commit `d4a0eb978518f7fb404993d1509d11b21239ada6` after direct documentation pages failed. Its `openapi-schema.json` is an OpenAPI meta-schema, not a Qloo endpoint specification.

Verified from official documentation: `X-Api-Key`, Search `query`/`take`, movie Insights `filter.type`, `signal.interests.entities`, `filter.results.entities`, `take`, the Insights entity envelope, and returned affinity ordering. Search `types` enum spelling is not established by the retrieved reference, so no guessed type parameter is sent.

**Pending:** independent official verification of the event host (currently pinned to the user-specified `https://hackathon.api.qloo.com`), event acceptance of direct REST access (the official kit lists harness surfaces), actual Search response envelope, live identity/coverage behavior, numeric affinity path/scale, and explainability. Numeric affinity remains `null`, and explainability is not requested. No undocumented numeric field is interpreted.

Controls implemented:

- Credential read only by server wrapper; no client key form, NEXT_PUBLIC credential or model-provider dependency.
- Exact host, two GET paths, redirects disabled, no-store, 8-second deadline, 512,000-byte response cap, no automatic retries, no alternative credentials/host.
- Per-process shared budget of 12 upstream attempts/minute and 60/process lifetime, counting failures; a fresh HTTP request does not reset the budget.
- HMAC identity proof over ID, movie type, title, year and Search timestamp; 30-minute expiry and random process secret; uniqueness across interests and candidates; user confirmation required.
- Incoming JSON limited to 8,192 bytes and 3 seconds, strict keys/types/cardinalities, cross-origin browser rejection. Upstream bodies, credential values and arbitrary errors are not echoed.
- Typed normalized entities, search responses, reports, comparisons and provenance. Reports expose actual endpoint, bounded parameters, timestamp, HTTP status and a locally generated request reference (not claimed as a Qloo-provided trace ID).

The local quota/proof implementation is deliberately **not ready for multiple deployment instances**. Restarting resets quota and invalidates confirmations; distributed hosting needs shared quota state and a stable server-side signing secret. Public deployment remains out of scope.

## Commands and observed results

Initial baseline: 15 tests passed, typecheck passed, build passed. Initial npm audit failed to reach the registry inside the sandbox; an approved external-network audit then returned zero vulnerabilities. A later artifact-saving audit also hit the network restriction and was rerun with approved access; its successful JSON is preserved. No `npm audit --force` was used and no dependency versions were changed.

Final checks:

```powershell
npm.cmd test                       # exit 0, 37/37
npm.cmd run typecheck              # exit 0
npm.cmd run build                  # exit 0
npm.cmd audit --json --cache .npm-cache --fetch-retries=0 --fetch-timeout=15000
                                  # exit 0, vulnerabilities.total = 0
npm.cmd start                     # production server bound to 127.0.0.1:3000
npm.cmd run verify:local           # exit 0, 9 checks, 23 client files, zero Qloo calls
node scripts/verify-secrets.mjs    # no findings; artifact records exact file count
```

HTTP verifier checks: health 200/BLOCKED_LIVE; valid Search 503/BLOCKED_LIVE; short query 400; invalid audit 400; fabricated proof 400; cross-origin request 403; oversized JSON 400; actual page HTML 200 with product workflow; client bundle isolation. It refuses to run its missing-key test against a configured server and never injects a key.

The tests additionally exercise ambiguity, empty results, confirmed identity binding/expiry/session separation, duplicate IDs, full and 0/1/2-of-3 partial coverage, unexpected response IDs/domains/shapes, exact Insights parameters, HTTP 400/401/403/429/500, timeout/network errors, bounded response size, real stalled-body deadline, shared quotas, credential-echo refusal, blocked export and proof stripping. MOCK fixtures are fictional and confined to tests.

## Git / diff / original files

`core.excludesfile` is unset. Git attempts its default user ignore path `C:/Users/jpabl/.config/git/ignore`, which the sandbox cannot read. No global Git configuration was changed. Per-command `-c core.excludesfile=.gitignore` lets read operations use the accessible project rules. `NUL` was tried for one command but Git rejected it as an exclude file; no setting was persisted.

All project files are untracked and the branch has no commits, so ordinary `git diff` is empty and cannot demonstrate the new source. Source was reviewed directly, and new-file whitespace checks use `git diff --no-index --check`. The add attempt failed at `.git/index.lock`; no staging or commit was completed. The [final review artifact](evidence/gate1a-worktree-review.json) records whitespace review outcomes (`--no-index` returns 1 for a new file; empty diagnostics mean no whitespace findings).

Original planning source SHA256 values remain unchanged:

```text
CODEX_MASTER_TASTEPROBE.md 075D3605B3BEFBBC1CEF1EE1C6D82DE647B27E859A2CA216652BAA3BBA924C1A
PLAN_24H_GATES.md          6321FC74D72AB62816A15C946109EEAEE4ECA5597E450452C5DB92CC4B498366
```

After inspecting the files in an external PowerShell with write access to `.git`, the local commit can be made with:

```powershell
Set-Location D:\Hackathons\TasteProbe
git -c core.excludesfile=.gitignore add -- .env.example .gitignore app lib scripts tests package.json package-lock.json tsconfig.json next-env.d.ts README.md EVIDENCE.md evidence experiments CODEX_MASTER_TASTEPROBE.md PLAN_24H_GATES.md DEVPOST_SUBMISSION_DRAFT_EN.md
git diff --cached --check
git diff --cached --stat
git commit -m "Build secure TasteProbe product foundation"
git status --short
```

## CHANGED_FILES

Updated: `app/page.tsx`, `app/globals.css`, `app/layout.tsx`, `lib/qloo/client.mjs`, `package.json`, `tsconfig.json`, `.env.example`, `README.md`, `EVIDENCE.md`.

Created: `app/api/health/route.ts`, `app/api/entities/search/route.ts`, `app/api/audit/route.ts`, `lib/contracts.ts`, `lib/http.ts`, `lib/report.ts`, `lib/qloo/service.ts`, `lib/qloo/server.ts`, `tests/service.test.mjs`, `tests/security.test.mjs`, `tests/report.test.mjs`, `scripts/verify-local.mjs`, `scripts/verify-secrets.mjs`, `scripts/review-worktree.mjs`, and the GATE 1A evidence artifacts linked above, plus `evidence/GATE0_HISTORY.md` and the final review artifact. Lockfile and ignore rules were inspected and preserved.

## RISKS / NEXT_ACTION

GATE 1A remains AT_RISK until the actual rendered desktop/mobile workflow is reviewed; no UI screenshot evidence exists. GATE 1B should resolve event REST authorization/host, configure an authorized local credential, confirm exact Search/Insights envelopes with bounded real calls, and evaluate the original G0 falsifier. Numeric affinity and explainability must remain pending until their actual fields and semantics are verified. Do not deploy, publish, or claim G0_LIVE_PASS before that evidence exists.
