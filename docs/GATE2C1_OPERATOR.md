# Gate 2C.1 operator review

## Current outcome

Functional checks pass, including real Qloo discovery through local HTTP. Visual review is **BLOCKED**, not passed: the browser access host was unavailable, and native Chrome control stopped because Computer Use could not confidently determine its current URL. No screenshots were captured and no further UI action was attempted.

**The authorized LIVE smoke budget is exhausted: 4/4 attempts, all HTTP 200, no retries. Do not rerun the LIVE scripts, delete their ledgers, or spend additional Qloo quota without a new budget.** Two attempts exercised the service directly; two exercised actual Next HTTP routes with a matching browser Origin. The local test servers were stopped afterward.

## Run the current product

```powershell
Set-Location D:\Hackathons\TasteProbe
npm.cmd run build
npm.cmd start
```

Open the address printed by the server. Relative frontend API routes work through both `http://127.0.0.1:3000` and `http://localhost:3000`. Keep page and API at the same port. Restart an old production server after building; it may still hold an earlier app in memory. No global Git or browser security configuration change is needed.

To inspect layout without consuming Qloo quota, start a separate process with `QLOO_API_KEY` set to an empty string. Existing shell environment values override `.env.local`; restore the operator's shell setting afterward. Never paste or expose the key in a screenshot. The no-key HTTP integration test verifies this behavior automatically.

## Desktop and mobile review

In Chrome DevTools device toolbar, set **1440×900**, then **390×844** at 100% page zoom. This is pending operator work, not completed automated visual verification.

- The default mode is Discover for me. The initial screen should show favorites search and a disabled Discover CTA, with no empty results, Rescue, tool trace or Passport panel.
- Check title/subtitle hierarchy, input focus, button contrast, wrapping, touch targets and no horizontal page overflow. Cards deliberately show labeled graphic placeholders, not film posters.
- With a separately authorized new LIVE budget, search Arrival, explicitly confirm **Arrival (2016)**, then Discover. Verify fresh source timestamp, no Arrival or duplicates, real observed affinity, Why this movie and Passport download. Do not describe missing attribution as an invented genre/plot or causal explanation.
- Switch to Audit another AI. Use Arrival as signal and Interstellar, Blade Runner 2049, Her as the original order. Search and confirm each identity; evaluate, inspect before/after, Rescue approval/rejection and Passport. This full fresh audit needs at least five upstream calls, so do not run it inside the exhausted four-attempt discovery budget.
- The automated HTTP tests already exercise original Audit, all four agent tools, empty/partial responses, credential absence, Qloo auth error, same-origin and hostile-origin behavior using **isolated MOCK transport**. Do not present their synthetic movie names or results as LIVE.
- Check EMPTY, SEARCHING, SELECT_IDENTITY, CONFIRMED, ANALYZING, SUCCESS, INSUFFICIENT_EVIDENCE, ERROR and BLOCKED_LIVE. Health configuration alone must not read as LIVE verified. A success badge applies to that actual response only.

## Independent checks without Qloo traffic

```powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run test:integration
npm.cmd audit
node scripts/verify-gate2c1-live.mjs
node --env-file=.env.local scripts/verify-secrets.mjs gate2c1
```

The LIVE verifier is offline and checks captured request parameters, counts, unique identities, exclusion, ranks, affinity types, and repeat agreement. `scripts/check-origins.mjs` only creates tool sessions and consumes zero Qloo requests, but requires a running local server.

## Images and public release

The real Qloo response included `properties.image` for all eight recommendations. The source was checked, but display rights for those third-party film images were not established. URLs are not exposed or loaded by the UI. No Google images, invented URLs, TMDB integration or extra dependencies were introduced. A verified image license/provider can be added later without blocking discovery.

Before a public release: finish visual review, choose an open-source license, configure shared public request/spend limits, review submission wording and secrets, commit locally and obtain deployment/push approval. In-memory per-process Qloo limits are preserved but are not a distributed public quota system. No deployment or remote repository was created.
