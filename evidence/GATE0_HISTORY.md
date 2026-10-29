# TasteProbe — GATE 0 evidence

Observed: 2026-10-29, latest smoke timestamp `2026-10-29T19:55:11.623Z` (14:55 Colombia). Scope: **G0 only**. Both `CODEX_MASTER_TASTEPROBE.md` and `PLAN_24H_GATES.md` were read in full. Their source content and the pre-existing Devpost draft were preserved. No files were deleted, no external resources were created, no credential was requested from another service, no submission was made.

## GATE / STATUS

**GATE: 0. STATUS: AT_RISK — BLOCKED_LIVE.** Local safety preparation PASS; end-to-end technical viability is **not demonstrated**. Live falsifier NOT_EVALUATED, not PASS and not a measured coverage failure. G1 remains closed.

| Check | Result | Observed evidence |
|---|---|---|
| Runtime | PASS | `node -v`: v24.13.0; `npm.cmd -v`: 11.8.0 |
| Existing workspace | PASS | Initially only three planning Markdown files; no app, `.env.local`, `.git`, or AGENTS.md in workspace/checked parent paths |
| Git readiness | AT_RISK | `git status --short`, `git rev-parse --show-toplevel`, `git rev-parse HEAD`: fatal, not a git repository; no clean-tree assertion possible |
| GitHub authentication | FAIL | `gh auth status`: configured account token invalid; no login changes attempted |
| App Qloo credential | BLOCKED_LIVE | Environment `QLOO_API_KEY` absent; `.env.local` absent. No credential value printed; no other provider substituted |
| Optional Qloo CLI | NOT_RUN | `Get-Command qloo` found no command; no global installation, doctor, or setup attempted |
| Official technical references | AT_RISK | All four `docs.qloo.com/reference/...` pages failed through web retrieval and direct Node fetch; markdown and llms.txt alternatives failed too |
| Official kit/rules | PASS for retrieval | Official GitHub kit, API access, safe use, CLI/MCP starters, and Devpost rules read; no inference of participant registration or eligibility |
| Dependency installation | FAIL | Offline install ENOTCACHED; bounded online install EACCES reaching registry; no installed Next.js/TypeScript or lockfile |
| Local tests | PASS | 15 passed, 0 failed, 0 skipped; MOCK transport is isolated in tests |
| Experiment without credentials | PASS for abstention | Exit 2, BLOCKED_LIVE, zero live calls, no response, no inferred scores |
| Type checking/build | FAIL: prerequisites absent | `tsc` and `next` not recognized; application compilation not validated |
| UI/browser/E2E | NOT_RUN | Static Next.js shell authored; no running app, screenshot, accessibility audit, public URL, or rendered layout is claimed |

## Official documentation findings

Sources retrieved on 2026-10-29:

- [Kit README](https://github.com/qloo/qloo-hackathon-kit): Node >=22.19 and harness >=0.1.26; local read-only exploration, API/workflow, and MCP access options. No harness was installed here.
- [API access policy](https://github.com/qloo/qloo-hackathon-kit/blob/main/docs/API_ACCESS.md): event-issued or approved authenticated access, quota discipline, explicit access errors; harness surfaces are supported. This introduces an unresolved access-path question for the direct HTTP contract in the project brief. No claim is made that direct HTTP is authorized for this participant.
- [Safe use](https://github.com/qloo/qloo-hackathon-kit/blob/main/docs/SAFE_USE.md): aggregate cultural evidence, no personal/sensitive inference, explicit uncertainty and provenance. No personal data was sent.
- [CLI starter](https://github.com/qloo/qloo-hackathon-kit/blob/main/starter/cli-workflow/README.md): Search CLI exposes query/type/take and a dry-run mode; CLI option names alone do not establish the raw HTTP parameter contract.
- [MCP starter](https://github.com/qloo/qloo-hackathon-kit/blob/main/starter/mcp-client/README.md): documentation lookup is separate from live access; the docs execute-request tool must not receive a key. If adopting its process-based MCP approach later, hosting must support that process; do not assume a serverless runtime will work.
- [Official rules](https://qloo.devpost.com/rules): working Qloo integration, functioning demo and public open-source repository required. The deadline shown is Oct 30, 2026, 23:45 EDT, consistent with 22:45 Colombia; the project currently has no verified integration or deployment.

Technical pages attempted, currently **unverified**:

- https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide
- https://docs.qloo.com/reference/available-parameters-by-entity-type
- https://docs.qloo.com/reference/insights-api-deep-dive
- https://docs.qloo.com/reference/get-search

Provisional contract copied from the user-owned brief, **not a live finding**: hackathon host, `X-Api-Key`, Search `/search`, Insights `/v2/insights`, movie URN, signal entities and result-entity filters. Search raw optional type parameters remain unset. Affinity path, score scale, sorting, coverage behavior and explainability are all **unknown**.

## TEST_OUTPUT / commands actually executed

| Command / operation | Actual outcome |
|---|---|
| `Get-Content -Raw CODEX_MASTER_TASTEPROBE.md` and `Get-Content -Raw PLAN_24H_GATES.md` | Complete documents read |
| `Get-ChildItem -Force`; `rg --files --hidden`; parent AGENTS.md existence checks | Initial documents-only workspace; no applicable AGENTS.md found |
| `node -v` | v24.13.0 |
| `npm -v` | PowerShell execution policy blocked npm.ps1; subsequent commands use npm.cmd |
| `npm.cmd -v` | 11.8.0 |
| `git status --short`; `git rev-parse --show-toplevel`; `git rev-parse HEAD` | Each failed: not a git repository |
| `gh auth status` | Exit 1, configured token invalid |
| Presence-only environment check; `Get-Command qloo` | Qloo app key absent; no Qloo command found |
| Official web retrieval; direct Node fetch of four technical pages | Kit/rules accessible through web tool; technical pages unavailable; direct fetch failed |
| Initial `npm.cmd view ... version` | Registry lookup stalled, interrupted; no verified latest version inferred |
| `npm.cmd cache ls next ...`; offline metadata lookups | Cached tarball names visible, metadata resolution unavailable; cached names do not prove working dependencies |
| `npm.cmd install --offline --ignore-scripts --no-audit --no-fund --fetch-retries=0 --fetch-timeout=10000` | Exit 1 ENOTCACHED |
| `npm.cmd install --cache .npm-cache --ignore-scripts --no-audit --no-fund --fetch-retries=0 --fetch-timeout=10000` | Exit 1 EACCES reaching registry; ignored local npm diagnostic log created |
| `npm.cmd test` (final run) | Exit 0: 15 tests, 15 PASS, 0 FAIL, 0 skipped |
| `npm.cmd run smoke:qloo` | Exit 2 by design: BLOCKED_LIVE, zero live requests; saved honest evidence |
| `node --check lib/qloo/client.mjs`; `node --check scripts/qloo-smoke.mjs` | Exit 0 for both; syntax only |
| `npm.cmd run typecheck` | Exit 1: tsc not installed |
| `npm.cmd run build` | Exit 1: next not installed |

Tests exercise local missing-key refusal, wrong-host refusal, exact GET/header/path encoding, redirects disabled, HTTP 400/401/403/429/500 classification, simulated timeout/network failure, malformed JSON, bounded response size, six-request client budget, obsolete path refusal, persisted missing-key evidence and explicit documentation-review guard. Injected HTTP responses and thrown timeouts are labeled MOCK. These tests do **not** test live Qloo, actual score semantics, real remote timeouts, or production behavior.

## Falsifier

| Requirement | Observed result |
|---|---|
| >=4/5 unambiguous title resolutions | NOT_EVALUATED; no real entity IDs obtained |
| >=3 comparable candidate affinities | NOT_EVALUATED; no real affinities obtained |
| >=1 understandable baseline divergence | NOT_EVALUATED; no ranking claimed |
| Proper abstention/error when unavailable | Local missing-key control PASS; real API unavailable/auth behavior not tested |

The [latest redacted artifact](evidence/qloo-smoke-redacted.json) records a blocker, not a response. The [history](evidence/qloo-smoke-history.jsonl) retains subsequent secret-free probe summaries. It currently contains only the missing-key experiment. Earlier missing-key invocation preceded addition of the append-only history; no live response was lost.

## CHANGED_FILES

All are new project files; original planning documents were not edited:

- Configuration: `.gitignore`, `.env.example`, `package.json`, `tsconfig.json`, `next-env.d.ts`.
- Initial no-data UI: `app/layout.tsx`, `app/page.tsx`, `app/globals.css`.
- G0 trusted local adapter/probe: `lib/qloo/client.mjs`, `scripts/qloo-smoke.mjs`.
- First request/protocol: `experiments/search.request.json`, `experiments/G0_PROTOCOL.md`.
- Isolated tests: `tests/qloo-client.test.mjs`, `tests/smoke.test.mjs`.
- Documentation/evidence: `README.md`, `EVIDENCE.md`, `evidence/qloo-smoke-redacted.json`, `evidence/qloo-smoke-history.jsonl`.

Generated local npm cache/logs are ignored. Environment-owned `.codex/` is ignored and was not used as application source. No `.env.local` was created, no key is embedded in client code, and no production mock adapter exists.

Source-document SHA256 snapshots:

```text
CODEX_MASTER_TASTEPROBE.md 075D3605B3BEFBBC1CEF1EE1C6D82DE647B27E859A2CA216652BAA3BBA924C1A
PLAN_24H_GATES.md          6321FC74D72AB62816A15C946109EEAEE4ECA5597E450452C5DB92CC4B498366
```

## RISKS / COMMIT / NEXT_ACTION

**RISKS:** Missing event credential; inaccessible technical reference; unresolved direct-HTTP versus supported-harness access path; registry/network restriction; provisional dependency versions without lockfile; uncompiled/unrendered UI; no Git repository and invalid GitHub login; real movie coverage, comparable scoring, and divergence unknown. A literal one-hour investigation clock for failed live coverage has not started because no authorized live experiment was possible.

**COMMIT:** N/A. Directory is not a Git repository; no commit hash exists. No publish or remote creation attempted.

**NEXT_ACTION:** Remain in G0. Restore npm access; install/lock dependencies and verify build/UI. Obtain the authorized event-issued Qloo key in `.env.local`; restore technical docs access and confirm supported integration path. Then execute the bounded manual Search → identity confirmation → single Insights experiment in [G0_PROTOCOL.md](experiments/G0_PROTOCOL.md), document actual returned fields and evaluate every falsifier criterion. Advance to G1 only if that combined evidence passes. If authorized live access or technical viability cannot be established, keep BLOCKED_LIVE and decide PIVOT/NO_SUBMIT explicitly.
