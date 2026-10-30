# TasteProbe — GATE 2A LIVE recovery

Observed **2026-10-30**, LIVE capture completed at approximately **14:09:55 UTC / 09:09:55 Colombia**. Only GATE 2A is active. Earlier records are preserved in [GATE1B_HISTORY.md](evidence/GATE1B_HISTORY.md), [GATE1A_HISTORY.md](evidence/GATE1A_HISTORY.md), and [GATE0_HISTORY.md](evidence/GATE0_HISTORY.md).

## Executive status

**GATE 2A: AT_RISK. Real Search, real Insights, and the HTTP tool-to-report flow PASS for one case.** The previous missing-documentation/credential blocker is resolved for the reviewed execution. Strict repeatability and independent verification of signal application remain pending: only one Insights request was captured, and the provider response does not echo the signal parameters. No repeated/alternate-signal control was made after the initial budget was consumed.

No fabricated Qloo response, score, identity or percentage was used. No deployment, push, autonomous-agent claim or next gate was started.

## Exact cause of BLOCKED_DOCUMENTATION

In `scripts/qloo-smoke.mjs`, after checking the key, this condition stops execution before any API call:

```js
if (!args.includes('--reference-reviewed')) throw new QlooError('BLOCKED_DOCUMENTATION');
```

The script separately requires `--execute` and a validated `--request-file`. These safeguards were **retained unchanged**. `npm run smoke:qloo` without the review flag intentionally remains blocked; that is not an upstream Qloo rejection.

The official Search and Insights references were retrieved again. The event-guide URL still failed retrieval. The user explicitly supplied the event host and reported Qloo Support authorization of direct backend REST; that report was accepted as authorization without claiming an independently retrieved support message. [qloo-reference-review.json](evidence/qloo-reference-review.json) records the review scope.

The reviewed execution was:

```powershell
npm.cmd run smoke:qloo -- --reference-reviewed --execute --request-file experiments/search.request.json
```

It returned **HTTP 200** from Qloo Search. The smoke process still exits **2** and reports `LIVE_RESPONSE_REQUIRES_MANUAL_REVIEW` by design: a single response cannot automatically pass the older G0 falsifier. Manual contract review and the following end-to-end evidence are separate from that exit code. [Smoke artifact](evidence/gate2a-smoke-redacted.json).

## Secrets and authorized configuration

- `node --env-file-if-exists=.env.local` confirmed **keyPresent=true** and approved-host configuration. No complete or partial key value was printed, logged, exported, copied into an artifact, or passed as a command argument.
- `git ls-files -- .env.local` returned no entries; `git check-ignore .env.local` confirmed it is ignored. The private identity-proof capture is also ignored under `evidence/private/`.
- The production credential boundary remains `lib/qloo/server.ts` with `import 'server-only'`. The browser receives normalized evidence and signed identity proofs, never the API credential.
- Exact-key review is run with the credential loaded only into the scanner's process. The source scanner and separate client-bundle scan record counts/findings without printing values.
- Support authorization/host information is **user supplied**; successful requests at that exact host are **directly observed**. These are distinct forms of evidence.

## LIVE request ledger

| Confirmed HTTP transaction | Request | Actual outcome |
|---|---|---|
| 1 | Smoke GET `/search`, `query=Arrival` | HTTP 200; `results` array, 20 matches at default take |
| 2 | Next Search for Arrival, `take=5` | HTTP 200; 2 normalized movie choices; exactly one title/year match for 2016 |
| 3 | Next Search for Interstellar, `take=5` | HTTP 200; exactly one confirmed title/year match for 2014 |
| 4 | Next Search for Blade Runner 2049, `take=5` | HTTP 200; exactly one confirmed title/year match for 2017 |
| 5 | Next Search for Her, `take=5` | HTTP 200; 2 normalized movie choices; exactly one title/year match for 2013 |
| 6 | Next Audit → GET `/v2/insights` | HTTP 200; exact confirmed candidate set; coverage 3/3 |

The user explicitly confirmed **Arrival (2016)** as the interest and **Interstellar (2014), Blade Runner 2049 (2017), Her (2013)** as the original order. Exact title/year matching selected only those user-confirmed identities; other choices were not silently accepted.

**Budget transparency:** six successful remote HTTP transactions are confirmed. There were also **four transport attempts without HTTP response**, so there were **ten fetch invocations**, not six. One failed inside the sandbox smoke and three from persistent local test servers; two of the latter explicitly exposed the safe error code `ENOTFOUND`. For the generic NETWORK failures, server receipt cannot be independently established from the redacted error. No authentication/quota response was automatically retried. No more live requests were made after the six HTTP 200 responses; uncertainty about no-response attempts is retained rather than hidden.

[gate2a-upstream.json](evidence/gate2a-upstream.json) preserves the observed attempts, statuses, field structure, hashed IDs and actual returned affinity values. It does not contain the credential, arbitrary upstream text or full Qloo IDs. The smoke history preserves the earlier blocked/network attempts as well.

## End-to-end result and contract

The existing **compiled Next application**, real `/api/entities/search` and `/api/audit` handlers, original Qloo adapter, signed identities, comparator and report builder were exercised. No product architecture or route was replaced. The observation wrapper forwards real native `fetch` to Qloo; it is not a mock provider.

| Candidate | Original rank | Actual Qloo rank | Shift |
|---|---:|---:|---:|
| Interstellar | 1 | 2 | -1 |
| Blade Runner 2049 | 2 | 1 | +1 |
| Her | 3 | 3 | 0 |

Actual returned order: **Blade Runner 2049 → Interstellar → Her**. All three returned IDs equal the submitted candidate set, all are movie entities, and coverage is **3/3**. No missing item was scored as zero. This is a divergence in ordering, not proof of personal satisfaction or a better recommendation list.

Observed Search structure: `results[]` with `entity_id`, `name`, `types`, optional `properties.release_year`/`release_date`. Observed Insights structure: `success`, `results.entities[]`, movie subtype, and **`query.affinity` numeric per entity**. Actual raw values are present in the redacted observation; the returned order is descending by those values. The product remains rank-only and exports `affinity: null`; no percentage conversion or new score interpretation was enabled.

The sent Insights parameters were exactly `filter.type=urn:entity:movie`, the confirmed Arrival UUID in `signal.interests.entities`, the three confirmed candidate UUIDs in `filter.results.entities`, and `take=3`. Response-set equality verifies candidate filtering. The signal hash matches the confirmed interest. **The response does not echo the signal/filter request parameters**, so this proves a successful accepted signal-bearing request, not Qloo's internal signal application independently. A repeated or alternate-signal control needs a new explicit budget.

Evidence:

- [LIVE identity/comparison summary](evidence/gate2a-live.json)
- [LIVE redacted exported report](evidence/gate2a-report-redacted.json)
- [Upstream response observation](evidence/gate2a-upstream.json)
- [Offline reproducibility checks](evidence/gate2a-verification.json)
- [Updated contract review](evidence/QLOO_CONTRACT.md)

The report was generated from the actual HTTP response, then redacted consistently: entity IDs and ID-bearing parameters use the same SHA256 prefixes; authorization proofs are omitted. Source endpoint, timestamp, HTTP status and the local request reference remain. The report's numeric-field limitation was emitted before manual review identified the raw field; later findings above supersede that historical uncertainty about the path, without altering the captured report.

## Network recovery and reproduction limits

An approved one-shot DNS check for the exact Qloo host passed, while separate persistent test servers returned `ENOTFOUND`. Running the actual compiled Next server and HTTP client **within the same approved execution** succeeded. This demonstrates an execution-context difference, but does not establish a permanent OS/firewall root cause.

`scripts/gate2a-session.mjs` provided that one-shot local session, using `scripts/gate2a-live.mjs` and `scripts/gate2a-observe.mjs`. The server closed after completion. The completed-session guard refuses replay; its persisted observation budget cannot silently reset on malformed JSON. This prevents another accidental API round. No network retry loop exists for auth or quota errors.

The captured result can be recomputed **offline** using:

```powershell
node scripts/verify-gate2a.mjs
```

That check verifies successful HTTP counts, confirmed identity hashes, exact sent/returned candidate equality, movie domain, observed affinity ordering, rank mapping and report provenance without fetching. It does not demonstrate repeated live ranking stability. A future live reproduction/control needs an explicitly reviewed new quota and artifact lifecycle; the current completed experiment must not be reset or rerun automatically.

## Tests and audit

| Check | Actual result |
|---|---|
| `npm.cmd test` | **44 PASS**, 0 FAIL/skipped; existing tests preserved. [Output](evidence/gate2a-tests.txt) |
| `npm.cmd run typecheck` | Exit 0. [Output](evidence/gate2a-typecheck.txt) |
| `npm.cmd run build` | Exit 0, Next 16.4.3, real `.env.local` loaded server-side. [Output](evidence/gate2a-build.txt) |
| `npm.cmd audit --json ...` | Exit 0, **0 vulnerabilities** across all severities. [JSON](evidence/gate2a-audit.json). Sandbox registry failure was retried with approved external-network access; no --force |
| Reviewed `smoke:qloo` | Real HTTP 200; exit 2/manual-review status by intentional probe design; no guard removed |
| LIVE HTTP flow | Four Search resolutions → confirmed signed identities → real Insights → comparison → redacted report, coverage 3/3 |
| `npm.cmd run test:integration` | **1 MOCK integration PASS**, isolated provider; [output](evidence/gate2a-mock-integration.txt), [clearly labeled MOCK artifact](evidence/gate2a-mock-integration.json). Earlier Gate 1B artifact preserved |
| `node scripts/verify-gate2a.mjs` | PASS, offline verification only, zero additional calls |
| Secret/client review | [Source scan](evidence/gate2a-secret-review.json) and [client scan](evidence/gate2a-client-review.json); exact configured-key search plus credential/transport markers, with values never printed |
| Git/diff review | [Review artifact](evidence/gate2a-review.json); includes unchanged original tests, tracked/new-file whitespace review and final Git state |

MOCK tests remain test-only and are not presented as LIVE results. This gate's authentic response/report artifacts are separately marked LIVE. Browser visual review remains unperformed; no screenshots, successful browser clicks or download clicks are claimed.

## Git, changed files and pending action

Baseline commit remains **c80659b18dd56492d956364fe46b9c78284600da**. Existing Gate 1B changes were preserved and reviewed together with this gate's additions. No public push or deployment occurred. Staging/commit outcome is recorded in the final review artifact; the sandbox previously denied `.git/index.lock`.

GATE 2A creates the live session/observer/client scripts, offline verifier, review manifest and redacted evidence; updates current README, EVIDENCE and contract findings; extends the secret-review script's gate label. The production UI, adapter and architecture did not require changes for the observed live envelopes. `.env.local` and private identity proof files stay excluded from the commit.

If staging remains denied, complete the reviewed local commit from an external PowerShell:

```powershell
Set-Location D:\Hackathons\TasteProbe
git -c core.excludesfile=.gitignore add -- .env.example .gitignore app lib scripts tests package.json package-lock.json tsconfig.json next-env.d.ts README.md EVIDENCE.md evidence experiments CODEX_MASTER_TASTEPROBE.md PLAN_24H_GATES.md DEVPOST_SUBMISSION_DRAFT_EN.md
git diff --cached --check
git diff --cached --stat
git commit -m "Validate Qloo live recovery and preserve secure product foundation"
git status --short
```

Next action stays within **GATE 2A**: review this live capture, then explicitly authorize a fresh, minimal repeat/alternate-signal control if strict independent signal/repeatability verification is required. Do not infer that further calls are authorized by the exhausted initial experiment. Agentic modality, public license and visual QA remain separate earlier product limitations; no next gate is automatically opened.
