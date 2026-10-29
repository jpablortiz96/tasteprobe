# TasteProbe

A movie shortlist auditor: prepare cultural interests, confirm film identities through Qloo, compare your original order with the returned order, and export a report with provenance and limitations.

**GATE 1A local foundation implemented. G0_LIVE_PASS remains BLOCKED_LIVE.** No authorized Qloo credential was available during development. No live recommendations, numeric affinity, public deployment, or event eligibility is claimed. Browser visual QA is pending because the browser integration was unavailable and native app authorization timed out.

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

**Before GATE 1B live use:** confirm the event's direct REST access policy and hackathon host with the organizers. The official kit names the harness as its supported event surface. The app implements the user's requested native REST path; organizer acceptance of that path is pending. See [the contract review](evidence/QLOO_CONTRACT.md).

## Product workflow

1. Enter 1–3 interest movies and 3–5 recommendations, one title per line in original order. Edit line order to change the baseline.
2. Select each title and choose **Find matches in Qloo**. Check the actual title and year, then explicitly confirm the identity. No choice is accepted automatically, including a single result.
3. Evaluate after all identities are confirmed. The server verifies signed identities, their expiration, uniqueness and movie domain before one Insights request for the same candidates.
4. Compare original order with returned order. Full coverage allows rank-shift explanations; partial coverage displays **INSUFFICIENT_EVIDENCE** and abstains from proposing a revised ranking. Missing movies are never scored as zero.
5. Export JSON from any step. Reports preserve inputs, actual evidence when available, request provenance and limitations. Identity authorization proofs and server credentials are excluded.

Numeric affinity parsing and Qloo explainability are **pending live contract verification**. Affinity is always `null` in the current normalized result. Rank comparison uses the documented returned order, not an invented score. Aggregate cultural relationships do not prove an individual's preferences, satisfaction, or future behavior.

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
# With the compiled local server running WITHOUT a key:
npm.cmd run verify:local
node scripts/verify-secrets.mjs
```

Tests use fictional **MOCK** transports only in `tests/`. The local route verifier exercises the real Next.js build, confirms abstention without a key, rejects forged identities and cross-origin/oversized requests, and scans client bundles for server transport and credential markers. This does not replace browser QA or live Qloo verification.

[EVIDENCE.md](EVIDENCE.md) records current results and blockers; [GATE0_HISTORY.md](evidence/GATE0_HISTORY.md) preserves the earlier evidence. The bounded manual G0 probe remains available as `npm.cmd run smoke:qloo`, with explicit documentation-review and execution flags. A single HTTP success does not pass its falsifier.
