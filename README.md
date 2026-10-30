# TasteProbe

A movie shortlist auditor: prepare cultural interests, confirm film identities through Qloo, compare your original order with the returned order, and export a report with provenance and limitations.

**GATE 2A.1: PASS for the bounded LIVE A/B control on 2026-10-30.** Three authorized attempts (one Search, two Insights) all returned HTTP 200. Keeping the three candidates and all other parameters identical, changing Arrival to Paddington 2 changed all three observed affinity values and swapped Her/Interstellar in the returned order. Explainability identifies each scenario's active signal. No public deployment or event eligibility is claimed; browser visual review remains pending.

The product is a deterministic tool operated by a human. It has no autonomous agent, agent framework or existing-agent integration. Mode (a), an agentic tool, is a candidate interpretation requiring confirmation; it is not established eligibility. See [the modality review](evidence/AGENTIC_REVIEW.md).

## Run locally

Use Node **24.13+** (the tests import erasable TypeScript directly), npm and the checked-in lockfile. On Windows PowerShell, use `npm.cmd` if execution policy blocks `npm.ps1`.

```powershell
npm.cmd ci
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd start
```

Open [the local workspace](http://127.0.0.1:3000). `npm.cmd run dev` is also available. Both bind to loopback only. No deployment was performed.

With no key, the app clearly shows **BLOCKED_LIVE**. You can edit interests and your original ordered list, load sample **inputs**, prepare the identity-confirmation step and export your work. No sample output or automatic mock mode exists. The original list is user supplied; TasteProbe does not claim to have generated it with an AI model.

For live use, copy `.env.example` to `.env.local` and set your own authorized event `QLOO_API_KEY` locally. Never paste a credential into the browser, chat, source, screenshot, or a command argument. Restart the server after changing environment variables. A configured key is shown as **CONFIGURED_NOT_VERIFIED** until actual calls establish evidence; health never contacts Qloo or certifies a credential.

The user reports that Qloo Support confirmed direct backend REST and the hackathon host. The live requests accepted the configured event credential at `https://hackathon.api.qloo.com`. See [the contract review](evidence/QLOO_CONTRACT.md) for the distinction between user-supplied support confirmation, official reference retrieval and actual live findings.

## Product workflow

1. Enter 1–3 interest movies and 3–5 recommendations, one title per line in original order. Edit line order to change the baseline.
2. Select each title and choose **Find matches in Qloo**. Check the actual title and year, then explicitly confirm the identity. No choice is accepted automatically, including a single result.
3. Evaluate after all identities are confirmed. The server verifies signed identities, their expiration, uniqueness and movie domain before one Insights request for the same candidates.
4. Compare original order with returned order. Full coverage allows rank-shift explanations; partial coverage displays **INSUFFICIENT_EVIDENCE** and abstains from proposing a revised ranking. Missing movies are never scored as zero.
5. Export JSON from any step. Reports preserve inputs, actual evidence when available, request provenance and limitations. Identity authorization proofs and server credentials are excluded.

The live response exposed numeric `query.affinity` per Insights entity; the captured returned order is descending by those actual values. The current product deliberately remains rank-only and exports `affinity: null`; score normalization, broader semantics and Qloo explainability are not enabled. Aggregate cultural relationships do not prove an individual's preferences, satisfaction, or future behavior.

## Backend and safeguards

| Route | Behavior |
|---|---|
| `GET /api/health` | Readiness only; no outbound request or credential values |
| `POST /api/entities/search` | JSON `{ "query": "movie title" }`; 2–80 characters; up to 5 movie identities and signed confirmation proofs |
| `POST /api/audit` | Arrays `interests` and `recommendations`, each item `{ id, proof, confirmed: true }`; only server-issued identities accepted |

The server-only wrapper reads the credential. Transport pins `https://hackathon.api.qloo.com`, `/search` and `/v2/insights`, disables redirects and caching, uses an 8-second timeout and 512,000-byte response cap, and never retries automatically. Errors expose categories only. JSON input is limited to 8,192 bytes and 3 seconds; cross-origin browser submissions are refused.

Quota is shared in a local process: **12 upstream attempts/minute, 60/process lifetime**. Failures count. Signed identities expire after 30 minutes and on restart. These conservative local controls are not a substitute for a shared quota and stable proof key before any multi-instance deployment.

## Verification and evidence

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd audit
npm.cmd run test:integration        # compiled Next HTTP routes, isolated MOCK provider, zero live Qloo calls
# With the compiled local server running WITHOUT a key:
npm.cmd run verify:local
node scripts/verify-secrets.mjs
```

Tests use fictional **MOCK** transports only in `tests/`. The local route verifier exercises the real Next.js build, confirms abstention without a key, rejects forged identities and cross-origin/oversized requests, and scans client bundles for server transport and credential markers. This does not replace browser QA or live Qloo verification.

The integration suite starts a separate loopback Next.js process with a test-only preload. It intercepts provider `fetch` calls and supplies fictional identities; no production mock switch is added. It verifies ambiguous choices, explicit confirmation, complete/partial comparisons, report serialization and safe errors. Its artifact is labeled `MOCK_INTEGRATION_TEST_ONLY`; no mock response/report is saved as live evidence. The browser download click and the rendered success/loading/partial views remain untested until browser access returns.

Search's documented HTTP 404 is normalized to empty choices while preserving HTTP 404 provenance. Insights 404 remains an error. Browser connectivity errors now use bounded requests, safe messages and a retry for readiness. The textarea placeholder color meets 4.5:1 against its authored background; this is a static check, not a full accessibility audit.

[EVIDENCE.md](EVIDENCE.md) records current results and blockers; [GATE0_HISTORY.md](evidence/GATE0_HISTORY.md) preserves the earlier evidence. The bounded manual G0 probe remains available as `npm.cmd run smoke:qloo`, with explicit documentation-review and execution flags. A single HTTP success does not pass its falsifier.

## GATE 2A recovery and reproduction

`BLOCKED_DOCUMENTATION` is produced by the smoke script when `--reference-reviewed` is missing. After reviewing the references, its explicit invocation is:

```powershell
npm.cmd run smoke:qloo -- --reference-reviewed --execute --request-file experiments/search.request.json
```

That command consumes a real request and still exits 2 after HTTP success, because the probe requires manual review. **Do not rerun it as part of the completed initial experiment**: six remote HTTP responses were captured, alongside four no-response network attempts. No API key value is printed or stored in the artifacts.

The live session used `node --env-file=.env.local scripts/gate2a-session.mjs`. It runs the existing compiled Next server and the HTTP client in one execution; no mock provider or alternate backend is introduced. It selects only the exact user-confirmed title/year matches and uses normal server-signed identity proofs. `gate2a-observe.mjs` forwards actual native fetch requests and records a bounded, redacted response structure. Separate persistent test processes encountered DNS failures; the one-shot authorized session succeeded. The completed-session guard now refuses replay, preserving the budget and evidence.

You can reproduce the evidence checks **offline, without another Qloo request**, with:

```powershell
node scripts/verify-gate2a.mjs
node --env-file=.env.local scripts/verify-secrets.mjs gate2a
```

The original Gate 2A captured one Insights response. Its missing control is now addressed by [the Gate 2A.1 A/B capture](evidence/gate2a1-ab.json): one new signal lookup and two comparable Insights requests, including explainability in both. It is a bounded consistency test, not statistical replication or proof of personal satisfaction. No further gate is started automatically.

Verify the A/B report offline with `node scripts/verify-gate2a1.mjs`. The LIVE runner refuses replay once its artifact exists, counts each attempt before fetch, and stops on errors; the three-attempt budget is exhausted. Do not rerun `scripts/gate2a1-ab.mjs` or clear its ledger without a new explicit budget.
