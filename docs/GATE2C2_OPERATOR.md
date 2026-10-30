# Discover response recovery and visual review

## Verified cause and recovery

The running Next development server retained a pre-Discover global Qloo service during hot reload. Search existed; `discover` did not. `/api/discover` returned local HTTP 502 `INTERNAL_ERROR` before calling Qloo. The browser parsed that valid error JSON; its message dictionary then fell back to the generic “could not verify” text. This was not evidence of a Qloo failure or an invalid movie response.

The shared instance now refreshes when its development factory changes. Dependent audit tools refresh when their service changes. Normal requests retain signing state and request budgets. Production uses a stable contract revision across route bundles so a Search proof remains valid for Discover. Code reloads may invalidate old confirmations/sessions; reload the page and confirm favorites again.

The actual running server was probed only with empty favorites, which cannot reach Qloo. Before: 502 with safe `STALE_SERVICE_MISSING_DISCOVER` dispatch diagnosis. After: expected 400 `INVALID_INPUT`. Regression files preserve failing-before and passing-after results. **No new Qloo requests were made in Gate 2C.2.**

## Review every screen without Qloo

Use the existing development server after a normal restart with this opt-in flag. Stop it with Ctrl+C in its own terminal first; do not start a second Next development process against the same output directory.

```powershell
Set-Location D:\Hackathons\TasteProbe
$env:TASTEPROBE_VISUAL_REVIEW='synthetic'
npm.cmd run dev
```

Open **http://127.0.0.1:3000/review** (or the actual port printed by Next). This route requires development mode, that exact flag and an explicit localhost/127.0.0.1 Host. Production returns 404 even if the flag is present. It does not use `.env.local` credentials or any real provider; its injected local transport has no `fetch` calls.

1. Confirm the permanent **SYNTHETIC · LOCAL VISUAL REVIEW · NOT LIVE** banner. Stay on `/review`; the homepage `/` remains the separate LIVE-capable product.
2. Enter Arrival and press Find movie. This runs a simulated local operation, not Qloo Search.
3. Explicitly confirm the clearly labeled synthetic Arrival identity. Verify **1/3 CONFIRMED** and an enabled Discover button.
4. Press Discover. Inspect the real loading state for that local operation, then the eight illustrative cards, titles/years/ranks, source labels, optional missing affinity and optional missing explanation. No shortlist is requested.
5. Open Why this movie. Text and attribution must say synthetic/illustrative, never claim a current Qloo response.
6. Download Evidence Passport. Confirm `evidenceMode: SYNTHETIC`, `liveValidation: SYNTHETIC_NOT_LIVE`, source `SYNTHETIC fixture`, and no identity proof. These values are not cultural evidence.
7. Use the review selector for insufficient evidence, service error and timeout. Selection resets the local form; confirm one identity again. Retry performs exactly one explicit action; there are no automatic loops.
8. In Chrome device toolbar inspect **1440×900** and **390×844**, at 100% zoom. Check hero height, secondary text, CTA priority, compact favorite cards, keyboard focus, loading feedback, card wrapping and page overflow.

The browser access host is unavailable to Codex. No new screenshots were supplied with this request and no visual PASS is asserted. Operator screenshots of these explicitly synthetic screens may document layout only, never LIVE integration.

## Real product check (only after specific new LIVE authorization)

This gate authorizes **zero** new Qloo requests. Do not click LIVE Search or Discover while performing the zero-budget review. For a later operator-authorized check, one favorite requires at least two calls: Search and Insights. Start with a fresh page, search Arrival, explicitly confirm Arrival (2016), Discover, inspect real source timestamp and download the LIVE Passport. Check no Arrival or duplicate appears. Do not reuse synthetic proofs or previous signed selections after a server code reload.

Audit and its four agent tools are verified separately by HTTP fixtures. A fresh four-film LIVE Audit requires its own request budget. No push, deployment or repository creation is part of this gate.

## Diagnostics

On an error, ordinary users receive a contextual message and an explicit Retry action. A collapsed diagnostic panel gives the operator a code, layer, HTTP status and safe reason without raw bodies, proofs, keys or model reasoning. Known categories include `UPSTREAM_ERROR`, `INVALID_RESPONSE`, `IDENTITY_ERROR`, `AUTH_ERROR`, `RATE_LIMIT` and `NETWORK_ERROR`; successful empty evidence remains `INSUFFICIENT_EVIDENCE`. Application failures retain `INTERNAL_ERROR` with layer `application`, rather than falsely blaming Qloo. Timeout retains its specific reason under the transport category. No arbitrary upstream message is shown.

## Reproduce checks

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run test:integration
npm.cmd audit
node --env-file=.env.local scripts/verify-secrets.mjs gate2c2
```

The suite includes a stale-singleton HTTP regression, all previous Discover/Audit checks, historical offline contract replay with explicit synthetic UUIDs, optional-field handling, protected proofs, zero-fetch visual transport, and production `/review` rejection. Offline replay never treats public hashed IDs as usable Qloo identities or captured results as current LIVE evidence.
