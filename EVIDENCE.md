# TasteProbe - GATE 4A Production hardening

2026-10-30. **AT_RISK / NOT PRODUCTION_READY.** No Qloo LIVE, TMDB or real Redis request; no remote, push or deployment. Started clean at 8edf1e8.

Implemented server-configured stable HMAC signing (scoped movie identities, 30-minute expiry), exact public HTTPS Origin/Host validation, a fail-closed public launcher on 0.0.0.0/$PORT, and a native-fetch shared Redis quota adapter. Atomic EVAL reserves global/provider/client/operation allowance before each provider attempt; failures count, no refunds/retries; auth/quota responses persist a shared halt. Unconfigured/unavailable storage cannot authorize public consumption. Defaults do not invent provider allowance.

Sessions remain process-local: Railway **one replica** is the primary supported topology; Vercel/multiple replicas are not ready for the full Audit/Rescue workflow. Expired sessions now release the 20-concurrent-session cap instead of permanently consuming a process lifetime allowance. Qloo rankings and existing product contracts are unchanged.

Quality: **116 tests PASS** (previous 106 retained), **7 MOCK HTTP E2E PASS** (six previous plus public HTTPS/quota contract), typecheck/build PASS, npm audit **0 vulnerabilities**. /review returns 404 in production. New regression fixes quota denial incorrectly reported as an upstream attempt. Isolated build preserves operator runtime. History: four commits/319 blobs without findings; 58 client assets without configured secret matches.

**Pending real blockers:** signing/Redis credentials are absent; Redis/Lua durability/atomicity/TTL are not verified on a real deployment; provider allowance/judge reserve is unknown; actual hosting domain/ingress and fair client limits remain unverified. Shared quota tests use an explicit REST emulator and are not REAL_REDIS_PASS. No new browser/LIVE result is claimed.

[Release hardening report](evidence/GATE4A_RELEASE_REVIEW.md) | [Variables, manual setup and checked CLI templates](docs/DEPLOYMENT.md) | [Public MOCK HTTP observations](evidence/gate4a-public-http.json)

---

# TasteProbe - GATE 3 Release candidate preparation

2026-10-30. **AT_RISK for public LIVE publication. Offline release preparation complete.** Features frozen; no runtime/backend/UI or dependency changes, no provider requests, remote, push or deploy.

Reject **OFFLINE_PASS**: one controlled SYNTHETIC analysis uses the real proposal tool and Passport serializer; Approve then Reject retains identical identities, ranks, affinities and source reference. A second session abstains without cross-analysis data. No network, signatures or LIVE provenance are fabricated. The lost original LIVE Reject export remains unverified; no new visual PASS is claimed.

Quality: **106 tests PASS**, **6 MOCK HTTP E2E PASS**, typecheck/build PASS, npm audit **0 vulnerabilities**. /review returns 404 in production. History: three prior commits / 298 blobs, no configured-secret or pattern findings; 58 client assets checked without configured credentials. .env.local remains ignored/untracked. Isolated build preserved the running app.

Added MIT license and separate third-party notices, English README/Mermaid, deployment assessment and Devpost draft. Actual MCP demonstration is documented as grounded ABSTAINED, not a complete autonomous LIVE audit. Authentic screenshot files are still absent; prior desktop/mobile usability is operator-confirmed.

**Real release blockers:** shared durable aggregate abuse/spend controls are absent; provider allowance/judge reserve is unknown; signing/session state is process-local; public HTTPS Origin/Host behavior is unverified. Prefer a single Railway process for the existing state model, with separately verified external controls. Vercel/multiple instances are not ready unchanged. No provider budget is assumed.

[Full release review](evidence/GATE3_RELEASE_REVIEW.md) | [Deployment blockers](docs/DEPLOYMENT.md) | [Devpost draft](docs/DEVPOST_FINAL.md) | [Secret/history scope](evidence/gate3-history-review.json)

Historical evidence below is preserved with its original dates/status; the release review above supersedes its open offline Reject item without rewriting historical LIVE evidence.

---

# TasteProbe - GATE 2H.2 Audit + real Codex MCP acceptance

2026-10-30. **AT_RISK: correct Audit/MCP verified; matching Reject export and budget-control closure pending.** No new Qloo call was made by Codex. No Qloo/TMDB backend, signing, CSRF or result-validation change was made.

Correct Chrome Audit is verified by its actual APPROVED download: Arrival (2016), Interstellar (2014), Blade Runner 2049 (2017), Her (2013), coverage 3/3, Qloo HTTP 200, request e824d996-c7ce-4968-bd2b-337f83edad4b at 21:06:24Z. Returned order/affinity: Blade Runner 2049 0.9132748362394222; Interstellar 0.8368126484416831; Her 0.8013815822511426. Rescue proposed exactly that order; APPROVED/appliedAutomatically=false is validated. Source/proposal/identity filter consistency and absence of credentials/proofs were checked. Operator confirmed desktop 1440x900 and mobile 390x844 usability.

The provided supposed Reject file belongs to another later partial Her (2024) request, 22475f10-c29b-4072-a65d-f47847faaa74: 2/3, ABSTAINED and PENDING. It is NOT relabeled as REJECTED. Operator now confirms the correct tab is no longer available. Reject remains pending; no new provider query or edited decision is substituted. Matching-file comparison is pending.

**Budget incident:** three distinct operator sessions now show at least 15 costed Qloo operations against discussed authorization maxima totaling 10; earlier Arrival attribution is also unknown. No remaining allowance is assumed. All provider queries are stopped. Zero-Qloo local decisions and exports remain possible; passing tests does not erase the discrepancy.

**Real agent integration:** added minimal MCP stdio around existing tools, default Qloo allowance zero. Protocol tests pass. An actual authenticated Codex CLI 0.165.0 session discovered the tools, selected/invoked propose_evidence_based_revision({}) once, received structured ABSTAINED and interpreted the missing evidence. Client and server events are retained without private reasoning or session tokens. No global MCP configuration, SDK/framework or extra app LLM was added. [Connect an AI agent](docs/CONNECT_AN_AI_AGENT.md), [real client evidence](evidence/gate2h2-codex-mcp.json).

Arrival artwork remains intentionally ambiguous: TMDB confirms two movies with title/original title Arrival (2016), IMDb tt2543164 and tt5433758. No reliable Qloo external-ID binding exists in the normalized contract; no hardcoded poster is chosen. Two bounded TMDB diagnostic requests, zero Qloo requests, were used for this check.

Quality: **105/105 tests** (all original 101 retained), **6/6 MOCK HTTP E2E**, typecheck/build PASS, audit zero vulnerabilities. Build ran in a source-only ignored snapshot; active BUILD_ID unchanged, no server restart or credential copy. Both client builds were scanned (56 files) without credential exposure. /review remains disabled in production.

Git remains ca5481f on master; accumulated changes await the final local checkpoint condition. No push, remote or deployment. [Current review](evidence/GATE2H2_REVIEW.md), [verification](evidence/gate2h2-verification.json), [budget record](evidence/gate2h2-live.json), [delivery preparation](docs/DELIVERY_READINESS.md). Source license and public usage controls still require review before any release.

---

# TasteProbe - GATE 2H.1 Audit LIVE acceptance

2026-10-30. **AT_RISK / AWAITING_OPERATOR_SEARCH_1.** Fresh authorization: up to five Qloo attempts (four Search, one Insights), failures included, no retries and stop on the first network/auth/quota/contract failure. No previous remaining budget is reused.

Phase A completed with **zero Qloo and zero TMDB requests**: local app fingerprint correct at 127.0.0.1:3000; health/tools 200; foreign-origin request 403; invalid empty Search 400 before provider; production /review 404. Key presence only is recorded; .env.local ignored/untracked. Configured-secret scan passed. Git remains ca5481f with earlier pending changes. No code/backend modifications or new build/restart this gate. Prior code checks remain 101/101 tests and 6/6 MOCK E2E plus typecheck/build/audit PASS; they do not close browser acceptance.

Integrated browser remains unavailable. The operator was instructed to Search Arrival once and confirm only Arrival (2016), then report the local/upstream HTTP and safe request reference before continuing. Attempt 1 is RESERVED_PENDING_OPERATOR, not claimed executed. All ten acceptance items remain PENDING. No duplicate HTTP Search is run by Codex. Rescue/Approve/Reject/export will use existing evidence without further Qloo requests after the bounded evaluation.

[Run instructions](docs/GATE2H1_RUN.md), [ledger](evidence/gate2h1-live.json), [preflight](evidence/gate2h1-preflight.json). Real screenshots and redacted downloaded Passports are still required. No BROWSER_PASS, global PASS, commit, push, remote repository or deploy. A safe local checkpoint and Delivery recommendation follow only after explicit successful operator acceptance.

---

# TasteProbe - GATE 2H final UI and dual-mode acceptance

2026-10-30. **AT_RISK / LIVE_ACCEPTANCE_PENDING.** Discover with real Qloo/TMDB and desktop/mobile improvement is operator-confirmed in the prompt. Audit has not yet completed real-browser acceptance. Integrated browser unavailable; no new screenshots or global PASS. **Zero new Qloo and zero new TMDB calls this gate.**

Four local decorative SVG icons were added to existing KPI labels. Discover Search/confirmed favorites and Audit matches, confirmed signal/candidates and comparison reuse optional TMDB artwork with strict title/year/movie ambiguity handling. In-flight client metadata is deduplicated across batches and roles; images never confirm Qloo identity or alter rankings. Known Arrival (2016) TMDB ambiguity retains fallback. External IDs are not invented where absent from the normalized contract. Audit shows observed affinities alongside original/current ranks and shifts, preserving Rescue/provenance.

Approve/Reject export preserves original Qloo evaluation/proposal, records a human decision and appliedAutomatically=false. The Audit sample is Arrival with Interstellar, Blade Runner 2049 and Her. No Qloo backend, signature, CSRF, ranking or provider validation changes were made.

**Real tool execution:** Codex invoked the existing local bridge with propose_evidence_based_revision and {}. The fresh session returned ABSTAINED with one actual event, one step and zero Qloo reservations. The agent retained abstention. TOOL_INTERFACE_PASS plus a real missing-evidence bridge invocation; no hosted autonomous LLM planner or full LIVE agent audit is claimed (AGENT_EXECUTION_PENDING for that broader scope). [Redacted invocation](evidence/gate2h-agent-invocation.json).

**Budget:** last GATE 2E.1 record is 2/7 consumed; later operator consumption is explicitly UNKNOWN. Old nominal remaining requests are not reused. A fresh explicit maximum of five attempts is proposed for Audit (four Search, one Insights); proposal/Approve/Reject/export cost zero. No calls will run without approval. [Budget record](evidence/gate2h-budget.json).

Technical results: **101/101 tests** (all previous 96 retained), **6/6 MOCK HTTP E2E**, typecheck/build PASS, audit zero vulnerabilities. Project/client configured-secret scans found no credential exposure; 28 client files scanned. /review remains production 404. The verified active server was restarted after build at 127.0.0.1:3000; health/tools 200. Old identities/sessions must not be reused after restart.

Operator steps and acceptance matrix: [GATE 2H acceptance](docs/GATE2H_ACCEPTANCE.md). Please supply real redacted screenshots using [capture checklist](docs/screenshots/README.md); no screenshots are present yet. [Gate review](evidence/GATE2H_REVIEW.md), [technical verification](evidence/gate2h-verification.json). Git HEAD ca5481f; accumulated changes remain uncommitted. No push/deploy/remote. Freeze features and recommend Gate 3 only after both real-browser flows and downloads are explicitly approved.

---

# TasteProbe - GATE 2G: TMDB posters and compact results UX

2026-10-30. **AT_RISK - visual operator acceptance pending.** TMDB **IMAGE_PROVIDER_READY**: real configuration/search resolve Passengers (2016) and a CDN HEAD verifies its returned JPEG (HTTP 200). Arrival (2016) has two exact identities in TMDB and deliberately falls back. No popularity guessing. Seven TMDB API requests, one poster HEAD, one official-logo download; **zero new Qloo LIVE calls**.

Implemented independent server-only TMDB client/service, strict title/year/movie matching, same-origin POST /api/visuals, bounded requests/cache, timeout, auth/quota halt, safe image URLs and graceful fallback. Bearer preferred over API key; neither credential is exposed. No Qloo backend or ranking changes. Discover renders Qloo first and enriches visuals asynchronously; Audit/Rescue/tools remain intact.

Featured hero and cards use optional real posters, source/favorite badges and separately labeled TMDB synopsis. Mobile uses compact poster/text rows to reduce scroll. Passport retains cultural evidence and exports optional separate visual provenance. Credits include the official logo and required TMDB notice. Missing imagery never blocks recommendations or export.

Validation: **96/96 unit/server-render tests**, **6/6 MOCK HTTP E2E**, typecheck/build PASS, npm audit zero vulnerabilities. Original suites retained; new cases cover matching, ambiguity, missing credential, auth preference, errors, fallback and export integrity. Client and project credential scans recorded separately.

The browser host remains unavailable: **VISUAL_OPERATOR_REQUIRED**, no screenshots or VISUAL_PASS. /review stays dev/loopback-only and 404 in production. It can show the dated captured TMDB artwork sample beside SYNTHETIC cultural evidence without API calls; the browser may load the optional CDN image. Operator steps and terms: [TMDB integration](docs/TMDB_INTEGRATION.md). Details: [gate review](evidence/GATE2G_REVIEW.md), [verification](evidence/gate2g-verification.json), [real TMDB metadata](evidence/gate2g-tmdb-passengers.json).

Git HEAD ca5481f; prior/current changes remain uncommitted. No push, deploy or remote repository. Next action: operator review at 1440x900 and 390x844, image fallback and Passport download, using /review without Qloo.

---

# TasteProbe ? GATE 2F cinematic insights dashboard

Observed 2026-10-30. **AT_RISK ? real posters and visual operator acceptance pending.**

Operator baseline: Discover works in Chrome with eight authentic Qloo recommendations, per the GATE 2F prompt. No new Qloo LIVE requests were performed by Codex in this gate; historical movie/affinity values are not hardcoded into production.

Implemented a compact four-metric dashboard, dynamic featured movie (highest finite observed affinity; stable ties; first Qloo result without a numeric claim when affinities are absent), and remaining cards preserving provider rank/order. Passport exports the same derived dashboard and featured identity, retaining the original evidence and limitations. Original illustrative covers remain labeled; no satisfaction percentages or new cultural explanations are invented. Audit, Rescue, tools and Qloo backend were not modified by this gate.

**Images: Qloo BLOCKED_RIGHTS / TMDB BLOCKED_CREDENTIAL.** Historical image presence does not establish poster display rights. TMDB documentation and required attribution were reviewed; no TMDB token is configured and no visual provider is falsely declared ready. Matching policy is tested but a backend image adapter remains a follow-up after credential/rights activation. Current UI fetches no real posters.

Technical validation: **89/89 tests**, typecheck/build PASS, **5/5 MOCK HTTP E2E**, npm audit **0 vulnerabilities**. The original tests remain. New checks cover score maxima/ties/null/zero/incomplete data, poster identity/rights matching, fallback and actual JSX rendering without external images; these are not browser visual approval.

Browser host unavailable: **VISUAL_OPERATOR_REQUIRED**, no new screenshots or VISUAL_PASS. /review shares the new components, stays synthetic/dev-only, and is verified 404 in production. See [visual instructions](docs/GATE2F_VISUAL_REVIEW.md), [image requirements](docs/IMAGE_PROVIDER.md), [gate review](evidence/GATE2F_REVIEW.md), [verification](evidence/gate2f-verification.json).

Git HEAD ca5481f; accumulated earlier gate changes remain uncommitted. No push, deploy or remote repository. Next: operator review at 1440?900 and 390?844 using /review without Qloo, then authorized image activation if desired.

---

# TasteProbe — GATE 2E.1 diagnostic recovery

Observed 2026-10-30. **AT_RISK — LIVE STOPPED after transport error; browser acceptance pending.**

Chrome Search reached Next.js and returned HTTP 502 / NETWORK / qloo-transport. The operator captured ENOTFOUND, upstream attempted=true, no Qloo HTTP, request ID f29f868c-4e4c-4ce8-8de1-dcb3dfae7dde. This identifies backend DNS resolution failure; a sandbox restriction is supported by DNS comparison but its precise relationship to the old process remains unproven.

Added safe transport diagnostics and regression coverage; no origin/signature/contract/budget relaxation, new dependency or retry. Replaced the verified dev process with local production Next on 127.0.0.1:3000 outside the sandbox. Health 200, foreign origin 403, production /review 404. No Qloo call after restart.

**LIVE attempts: 2/7 consumed.** First local HTTP Search returned local/Qloo 200 and Arrival (2016). Second, operator Chrome Search failed ENOTFOUND; stopped. Discover, Audit, Rescue and browser downloads remain unaccepted. Integrated browser access host unavailable; no BROWSER_PASS or new screenshots.

Offline: 82/82 unit tests, typecheck/build PASS, 5/5 MOCK HTTP E2E, audit zero vulnerabilities, 27 client files scanned against exact credential and server/test markers without findings. Original 79 tests retained. Diagnostic regression failed before the change and passed after it.

Details: [diagnosis](evidence/GATE2E_DIAGNOSIS.md), [LIVE ledger](evidence/gate2e-live.json), [checks](evidence/gate2e-verification.json), [operator acceptance](docs/GATE2E_OPERATOR_ACCEPTANCE.md). Git HEAD ca5481f; prior changes remain uncommitted. No push/deploy/remote. Stop until controlled Search continuation is authorized; prioritize Discover and coordinate remaining budget before Audit.

---

# TasteProbe — GATE 2D final cinematic UX polish

Observed **2026-10-30**. **GATE 2D: AT_RISK — VISUAL_OPERATOR_REQUIRED.** Presentation changes and technical checks are complete; desktop/mobile rendering and interaction approval still require the operator. No new Qloo LIVE requests, dependencies, backend contract changes, remote repository, push or deployment.

## Product preserved and implemented polish

- Discover remains the default one-to-three favorite workflow, with explicit identity confirmation and no shortlist requirement. API paths, request arguments, response validation, source data, HMAC proofs, CSRF and budgets are unchanged.
- On analysis/loading, success, insufficient evidence or a discovery error, the hero/form collapses and the outcome leads the page. A compact confirmed-favorite summary and Edit favorites action retain context. Editing opens/focuses the form; returning to an unchanged result makes no request. Confirming/removing favorites invalidates the earlier result as before.
- Results use **3 desktop / 2 tablet / 1 mobile columns**, larger 2:3 covers, prominent title/year/rank and coherent card sections. Film titles appear only below covers rather than also within the graphic. Source and secondary explanation text are larger; brief verified attribution or an explicit unavailable explanation is visible without expanding details.
- Covers are original deterministic CSS compositions: subdued gradients, halo/arch/horizon geometry, TasteProbe typography and four variations. No initials, commercial poster copying, provider URLs, image requests or new credentials. Every cover is visibly labeled illustrative and exposes an accessible movie/title/year description. They are not official movie posters or invented licensed images.
- Why this movie retains actual verified input attribution when available and the limitations of cultural affinity. No value is converted to satisfaction probability or percentage. Audit, Rescue, Passport, historical stress test and the four agent tools remain intact.
- **Your Cultural Evidence Passport** is now a final card with a clear download action, source, verified-film count and limitations. Advanced provenance/activity remains collapsed. Empty/error/timeout outcomes can export confirmed inputs and absent-evidence limitations without inventing recommendations.
- Synthetic filenames start `SYNTHETIC-NOT-LIVE`; existing JSON evidenceMode/liveValidation flags remain. All four review scenarios retain an unmistakable synthetic badge even while loading or showing an error. `/review` transport and its development/loopback/production guards are unchanged.

## Before / after presentation

The operator reported inspecting four authentic pre-polish captures. No new screenshots are available from Codex; the comparison below describes the implemented changes and does not assert a visual PASS.

| Previous presentation | Gate 2D implementation |
|---|---|
| Hero and full setup dominate completed results | Compact favorite summary; outcome/results first; explicit edit/return controls |
| Four desktop and two mobile cards per row | Three desktop, two tablet, one mobile |
| Initials and title repeated inside and below artwork | Original geometric cover composition; film title only below |
| Small labels and explanations | Source 11px, year/explanation 15px, title 24–25px, affinity 25px, controls at least 44px |
| Passport mainly available after success | Clear final source/limitations card and export after success, empty evidence or discovery failure |

## Accessibility implementation and remaining verification

Hidden setup sections use native hidden semantics and an explicit CSS hidden rule. Outcome headings receive focus after the requested transition; Edit favorites restores focus to the form. Buttons/summary controls have visible focus and minimum 44px height. Grid columns use minmax(0,1fr), long titles wrap, compact summaries wrap, and the cover aspect ratio reserves space without remote images or webfonts. Existing prefers-reduced-motion overrides remain; no new animation was introduced. Loading is tied only to the actual pending request/local synthetic operation. Error alerts, specific timeout messaging and explicit manual Retry remain.

These are code properties, **not proof of no overflow, measured whole-screen contrast, keyboard usability or stable rendering on a real device**. The browser inventory returned `The browser access host is unavailable`. Desktop **1440×900** and mobile **390×844** are **VISUAL_OPERATOR_REQUIRED**. No screenshot was fabricated or replaced by a CSS-only PASS. The operator must compare all four scenarios and verify focus/editing, text, touch targets, reduced motion and report download: [review instructions](docs/GATE2D_OPERATOR.md).

## Verification results

| Check | Actual result | Evidence |
|---|---|---|
| `npm test` | **79/79 PASS**; all tests retained | [unit log](evidence/gate2d-tests.txt) |
| `npm run typecheck` | PASS | [typecheck](evidence/gate2d-typecheck.txt) |
| `npm run build` | PASS | [build](evidence/gate2d-build.txt) |
| Existing HTTP E2E | **5/5 PASS**: one-favorite Discover, original Audit, all tools, stale-cache recovery, missing credential | [integration](evidence/gate2d-integration.txt) |
| `/review` production exclusion | PASS, HTTP 404 even with synthetic opt-in flag set | Existing stale-service HTTP regression assertion |
| `npm audit` | **0 vulnerabilities**, no dependency changes | [npm result](evidence/gate2d-audit-pass.json) |
| Client key/transport scan | PASS, **27 client files** | [verification](evidence/gate2d-verification.json) |
| Passport serialization | PASS for all four synthetic scenarios; failed/timeout response remains null, no proof exported, SYNTHETIC flags retained | [offline export checks](evidence/gate2d-passport.json) |
| Source/evidence secrets | Pattern plus exact configured-key scan; see artifact | [secret review](evidence/gate2d-secret-review.json) |

The Passport check verifies serialization, not a browser download click. UI layout and interaction acceptance remain manual. No tests were deleted, no new dependencies were introduced and no additional LIVE experiment was executed. Existing MOCK preload stays confined to isolated test processes; the normal product does not fall back to it.

## Files, Git and next action

Gate 2D product source changes are limited to **`app/discover.tsx`, `app/movie-artwork.tsx`, `app/globals.css`**. Verification/documentation: `scripts/verify-gate2d.mjs`, `scripts/verify-gate2d-passport.mjs`, secret-scanner gate label, this file, README, `docs/GATE2D_OPERATOR.md` and Gate 2D evidence artifacts. Builds may refresh generated Next type references and previous fixture assertion timestamps. No Qloo backend, agent tool, request validator, synthetic fixture/provider or production review guard was changed in this gate.

Git base remains **ca5481f3d882f24eb74aa952b5ccfcb8aef7ad44**. Accumulated Gate 2B/2C/2D changes remain uncommitted; no push or deploy. `.env.local` stays ignored/untracked. Per-command diff review is used without changing global Git configuration.

**Next action:** operator reviews `/review` at both resolutions for Recommendations, Insufficient Evidence, Service Error and Timeout, captures new images and approves the polish. This requires no Qloo quota. Then review the accumulated diff/secrets, license and public quota controls before a local commit and separately authorized publication. Further LIVE testing requires explicit authorization; no next gate was started automatically.

---

# Historical GATE 2C.2 Discover response recovery

Observed **2026-10-30**. **P0 recovery: PASS. GATE 2C.2: AT_RISK pending operator visual verification.** No new Qloo requests, no new dependencies, no push or deployment. The observed failure is conclusively local application dispatch, not evidence of a rejected Qloo response.

## Exact failure chain

1. The running server on port 3000 was a Next development process retaining a global Qloo singleton created before `discover` existed. Its Search method still worked.
2. `lib/qloo/server.ts` used `globalThis.tasteProbeService ??= createService(...)`; a hot reload could not replace that older object.
3. `/api/discover` called a missing `qloo.discover` method. Its catch converted the application error to HTTP **502 / INTERNAL_ERROR**. No Qloo call or movie response validation occurred for that failed dispatch.
4. `lib/browser-request.ts` successfully parsed the local error JSON and threw `INTERNAL_ERROR`; this was not malformed JSON or a frontend/backend success-schema mismatch.
5. `lib/product-errors.ts` had no `INTERNAL_ERROR` entry, so Discover displayed the generic “We could not verify the response…” fallback reported by the operator.

This was reproduced on the actual running server with **empty interests**, which cannot reach Qloo. A safe dispatch check verified `typeof qloo.discover !== 'function'`, returning `STALE_SERVICE_MISSING_DISCOVER`; it does not disclose bodies, proofs, credentials or provider data and now runs only after Origin/body checks. [Before diagnosis](evidence/gate2c2-diagnosis-before.json) records 502 and that exact reason. After the cache fix, the same empty input returns the expected **400 / INVALID_INPUT**, proving the current service validator is reached: [after diagnosis](evidence/gate2c2-diagnosis-after.json). Only loopback health and invalid-input probes were used. Available development logs did not identify the swallowed exception; no raw process command lines or private logs were published.

## Minimum recovery and regression

`lib/server-cache.ts` now stores a factory/revision marker and optional dependency. In development a changed service factory replaces the obsolete singleton. Audit tools also refresh when their service changes, preventing stale closures. Unchanged factories/dependencies reuse exactly the same instance, preserving signing state and request budgets between requests. Production uses stable contract revisions rather than bundle-specific function identities so Search and Discover retain a shared signer across route bundles.

No discovery response validator, UUID rule, proof/signature check, source/exclusion rule, CSRF/Origin guard, upstream timeout, host allowlist or request limit was relaxed. Code reloads that replace a service can invalidate old confirmations and sessions; the operator must reload and reconfirm, not bypass signing.

- The extracted original `??=` cache behavior **failed** the regression: retained legacy service lacked Discover and dependent tools retained their old factory. [Failing-before log](evidence/gate2c2-regression-before.txt).
- The corrected cache **passes** the same assertions and retains instances under unchanged factories. [Passing-after log](evidence/gate2c2-regression-after.txt); the final suite also tests dependency replacement.
- An HTTP test injects a real pre-Discover-shaped global service into an isolated Next process, then performs Search → human-confirmed signed selection → Discover with **one favorite**. It passes with the fix, preserves exclusion and optional fields: [HTTP regression](evidence/gate2c2-stale-http.json). All provider fetches are intercepted MOCK fixtures, never LIVE.
- A historical offline contract replay reads the redacted Gate 2C.1 result, maps public hashes to explicitly synthetic test UUIDs, passes the normal server validator and browser JSON helper, and verifies all eight observed affinities. Missing explainability is accepted as unavailable. Historical data is not presented as current LIVE evidence and hashed IDs are never accepted as real Qloo identities.

## Contextual errors and explicit retry

Discover now distinguishes an application failure from malformed JSON, server response validation, Qloo HTTP, identity validation and network transport. Ordinary messages are contextual; diagnostic codes, safe layer/reason and local HTTP status are available in a collapsed operator panel. Known categories include UPSTREAM_ERROR, INVALID_RESPONSE, IDENTITY_ERROR, AUTH_ERROR, RATE_LIMIT and NETWORK_ERROR; empty successful results retain INSUFFICIENT_EVIDENCE. The verified application failure remains INTERNAL_ERROR / application instead of being falsely called an upstream failure. Unknown remote text is still suppressed. Retry only runs after an explicit click; existing budgets and busy controls remain. No automatic retry loop was added.

## Visual work and isolated review mode

Only requested refinements were made after root-cause confirmation: desktop hero padding reduced from 62px to 30px at the top; mobile 38px to 24px; maximum heading size reduced; secondary labels/body text enlarged; confirmed-film artwork made more compact. Palette, branding, primary flow and cinematic result cards remain. Optional imagery still uses labeled graphic placeholders; no posters or URLs were added without authorization.

`/review` reuses Discover with an injected **local zero-fetch SYNTHETIC transport**. A permanent banner, identity/result/source labels, illustrative affinity labels and machine-readable Passport flags distinguish it from LIVE. Scenarios cover recommendations, insufficient evidence, service errors and timeout; changing scenario resets the form. The synthetic Passport reports `SYNTHETIC_NOT_LIVE` and removes dummy proofs. This is not an agent action log or current Qloo evidence.

The route requires **development mode**, `TASTEPROBE_VISUAL_REVIEW=synthetic`, and an explicit loopback Host. HTTP tests prove it returns **404 in production even with the flag set**. The normal homepage retains the real adapter and never falls back to fixtures. The synthetic transport has no fetch implementation; tests replace global fetch with a failing spy and observe zero network calls.

Browser inventory again reported `The browser access host is unavailable`. This request contained textual observations but no attached screenshot files for direct inspection. **VISUAL_REVIEW_BLOCKED**, no screenshots or VISUAL_PASS claimed. The mode is prepared for operator inspection at 1440×900 and 390×844; interactive layout quality remains pending. [Exact operator steps](docs/GATE2C2_OPERATOR.md).

## Actual checks

| Check | Result | Artifact |
|---|---|---|
| `npm test` | **79/79 PASS**, all prior 71 retained | [unit log](evidence/gate2c2-tests.txt) |
| `npm run typecheck` | PASS | [typecheck](evidence/gate2c2-typecheck.txt) |
| `npm run build` | PASS | [production build](evidence/gate2c2-build.txt) |
| HTTP E2E | **5/5 PASS**, including original Audit, all tools, Discover, no-key and stale-global recovery | [integration log](evidence/gate2c2-integration.txt) |
| `npm audit` | **0 known vulnerabilities**; no dependency changes | [audit output](evidence/gate2c2-audit-pass.json) |
| Client secret/transport scan | **27 client files**, no credential/server transport/test marker leakage | [verification](evidence/gate2c2-verification.json) |
| Source/evidence secret review | Pattern and exact configured-key check; see scan artifact | [secret review](evidence/gate2c2-secret-review.json) |

**New Qloo requests: 0.** This gate did not rerun any LIVE smoke, reissue a captured request or extend the exhausted Gate 2C.1 quota. Registry access for npm audit is not Qloo traffic. No LLM/provider call was made. No real API key or fragment was printed, recorded in screenshots or copied into fixtures.

## Files, Git and next action

Core fix: `lib/server-cache.ts`, `lib/qloo/server.ts`, `lib/audit-tools-server.ts`, guarded dispatch in `app/api/discover/route.ts`. Error/UX changes: `lib/browser-request.ts`, `lib/product-errors.ts`, `app/discover.tsx`, `app/globals.css`. Review-only support: `lib/synthetic-review.ts`, `app/review/page.tsx`, `app/review/review-workspace.tsx`, explicit synthetic Passport/source types in `lib/contracts.ts` and `lib/discovery-report.ts`. Tests: `tests/server-cache.test.mjs`, `tests/discovery-recovery.test.mjs`, `tests/integration/stale-service-preload.mjs` and retained/extended Discover HTTP tests. Diagnostics/verifiers: `scripts/diagnose-discover-local.mjs`, `scripts/verify-gate2c2.mjs`, secret-verifier gate label, documentation and evidence artifacts. Original Audit functionality and previous evidence remain intact; fixture re-executions refresh their assertion timestamps only.

Git base remains **ca5481f**; Gate 2B/2C.1/2C.2 changes remain uncommitted. No remote repository, push, deployment or new gate was started. `.env.local` stays ignored and untracked. Review the accumulated diff before a separate local commit.

**Next action:** restart the local development server with the review flag, open `/review`, confirm one synthetic identity, render cards, inspect mobile and download the clearly marked synthetic Passport. This spends no Qloo quota. Only after specific operator authorization should a fresh LIVE Search/Discover be performed; it is not claimed by this gate.

---

# Historical GATE 2C.1 Fix, Discover & premium UX

Observed **2026-10-30**. **GATE 2C.1: AT_RISK — visual review remains blocked.** Functional acceptance passes: Origin regression fixed without removing CSRF checks, two product modes, authentic new Qloo recommendations, preserved Audit/tools/Rescue/Passport, passing tests and builds. No screenshots or VISUAL_PASS claim are made.

## P0 root cause and verified fix

`FORBIDDEN_ORIGIN` originates in our `lib/http.ts`, before any Qloo request. The prior body parser compared the browser `Origin` only against `new URL(request.url).origin`. On the local production Next 16.4.3 server, the same request with `Origin=http://127.0.0.1:3005` and Host `127.0.0.1:3005` returned **403**, while the localhost equivalent returned **200**. Because this was the sole guard, the accepted origin establishes that Next reconstructed the effective route origin as localhost. That inference is also consistent with Next's local URL construction code inspected in `node_modules/next/dist/server`. We did not log a raw private request or any credential.

The frontend already used relative `/api/...` routes; there was no middleware or custom Next config overriding these requests. Qloo upstream 401/403 maps to `AUTH`, never to this application-only Origin error. [Before](evidence/gate2c1-origin-before.json) and [after](evidence/gate2c1-origin-after.json) capture only explicit loopback Origin/Host/port, HTTP status and whether a session was created; **zero Qloo requests** were used for this diagnosis.

The fix accepts strict same-origin requests, with a narrow recovery for a reconstructed **HTTP loopback URL**, an explicit loopback browser origin, the **identical port**, and a Host **exactly matching that browser origin**. It ignores forwarded-host headers. Foreign origins, mismatched ports/Host, null origins, protocol mismatch and `Sec-Fetch-Site: cross-site` are refused. Non-browser JSON agent callers remain supported. The frontend helper now also rejects absolute/protocol-relative URLs. **Both 127.0.0.1 and localhost return 200 after the fix.** User-facing error text explains the address mismatch instead of presenting the internal code as the error title. No wildcard, disabled check or global config change was introduced.

## Product and genuine discovery

- **Discover for me is the default.** Search one to three favorite movies, inspect title/year and visual identity cards, explicitly confirm, then Discover. No recommendation list is requested. Initial empty result, Rescue and Passport panels are absent.
- Discover uses separate `/api/discover` and `qloo.discover` contracts, sharing the existing server-only native fetch transport, proof verification and request limits. Audit retains its candidate filter and all four agent tools.
- Exact discovery parameters: `filter.type=urn:entity:movie`, verified `signal.interests.entities`, identical `filter.exclude.entities`, `take=8`, `feature.explainability=true`. **No `filter.results.entities`.** New exclusion/take parameters were checked against the official parameter reference/Movie table; live acceptance was then verified. [Contract and sources](evidence/QLOO_CONTRACT.md).
- The adapter validates UUIDs and movie types, removes favorites/duplicates (including conservative title/year matches), keeps only finite observed affinity or null, and shows fewer valid rows without fabricating replacements. Empty valid evidence abstains.
- Result cards use actual Qloo title/year/order/affinity, brief evidence-based text and Why this movie. Specific attribution names only confirmed input IDs with valid observed positive scores. Missing attribution does not become a genre/plot or causal claim. Evidence Passport projects identities and real activity, excluding proofs and credentials.
- **Audit another AI** preserves Search/confirmation/evaluation, before/after, Rescue approval/rejection, historical Cultural Stress Test and Passport. The prior audit workspace was moved into a component rather than rebuilt. Rescue and technical details appear after analysis, not on Discover's initial screen. Raw Rescue errors are mapped to helpful product messages.
- Existing palette, typography and card design are retained with a cinematic landing/search layout, responsive movie cards, labeled graphic artwork and explicit focus/loading/error states. These are implemented features, not claims of completed visual QA.

## Actual LIVE budget and observed movies

**Exactly 4/4 newly authorized Qloo fetch attempts, all HTTP 200, no retries or no-response failures. Budget closed.** Attempts 1–2 exercise the actual service; 3–4 exercise real Next HTTP `/api/entities/search` → signed identity confirmation → `/api/discover` with `Origin=http://127.0.0.1:3006`. A test-process guard recorded attempts before fetch and prevented exceeding four. The two local smoke servers were stopped. No additional Qloo request was made during offline verification or MOCK tests.

Arrival (2016), previously explicitly confirmed by the user, was resolved afresh by title/year in both runs. Each run returned **8 valid unique new movies**, Arrival absent, and per-movie numeric affinity/explainability. Order and full-precision affinity matched across the two runs. Affinity is **not** a satisfaction probability.

| Rank | Actual Qloo movie | Year | Observed query.affinity (rounded) |
|---|---|---|---|
| 1 | Passengers | 2016 | 0.942915 |
| 2 | Alien: Covenant | 2017 | 0.915661 |
| 3 | Blade Runner 2049 | 2017 | 0.913275 |
| 4 | Life | 2017 | 0.911143 |
| 5 | 10 Cloverfield Lane | 2016 | 0.904797 |
| 6 | The Discovery | 2017 | 0.903037 |
| 7 | Ghost in the Shell | 2017 | 0.901765 |
| 8 | Nocturnal Animals | 2016 | 0.901007 |

Sources: [service ledger and redacted result](evidence/gate2c1-live.json), [real HTTP result](evidence/gate2c1-http-live.json), [offline integrity verification](evidence/gate2c1-live-verification.json). Full UUIDs are consistently hashed; no authentication headers, signed proofs or key fragments were stored. Do not replay/delete one-shot ledgers to obtain a new quota.

No new LIVE Audit query was made: a fresh four-film audit plus discovery exceeds this gate's four-attempt smoke budget. Audit was reverified through complete HTTP MOCK tests, and its previous genuine LIVE/A-B evidence remains historical and intact. MOCK results are never substituted into the production product.

## Images

All eight real recommendations included `properties.image`; only presence/type was recorded publicly, never a guessed URL. The documented image property and Qloo terms were checked, but permission to display those specific third-party posters was not established. No external images are loaded. Clearly labeled CSS artwork uses each validated title/year; it is not represented as an official poster. TMDB was not added: a second visual provider and its access/attribution requirements are unnecessary for functional discovery. Licensed posters remain optional, not a recommendation blocker.

## Verification

| Check | Actual result | Evidence |
|---|---|---|
| Unit suite | **71/71 PASS**, including the existing 60; none deleted | [test log](evidence/gate2c1-tests.txt) |
| Typecheck | PASS | [typecheck](evidence/gate2c1-typecheck.txt) |
| Production build | PASS, includes original routes plus `/api/discover` and `/api/tools` | [build](evidence/gate2c1-build.txt) |
| HTTP E2E | **4/4 PASS**: Discover/origin/integrity, no-key, original Audit and all four tools | [log](evidence/gate2c1-integration.txt), [MOCK assertions](evidence/gate2c1-mock-http.json) |
| LIVE Discover HTTP | PASS, Search 200 → Discover 200 → 8 validated new films | [LIVE capture](evidence/gate2c1-http-live.json) |
| Audit | **0 known vulnerabilities**, no new dependencies | [npm output](evidence/gate2c1-audit-pass.json) |
| Client scan | PASS, **25 client files**, no configured key or server/test markers | [verification](evidence/gate2c1-verification.json) |
| Source/evidence secrets | See current configured-key/pattern scan; no secret values are output | [secret review](evidence/gate2c1-secret-review.json) |

New tests cover both loopback origins, hostile/null origins, Host/port/protocol mismatch, cross-site requests, relative API enforcement, separate discovery parameters, duplicate/input/wrong-type/invalid-ID filtering, finite/null/zero affinities, empty abstention, proof requirements, timeout/no retry, safe export and genuine confirmed-signal attribution. Existing original Audit and agent-tool HTTP tests pass without deletion. The no-key HTTP process explicitly overrides `.env.local` and verifies BLOCKED_LIVE without a MOCK fallback.

## Visual blocker, Git and next action

Browser inventory returned `The browser access host is unavailable`. A native Chrome fallback was attempted under the computer-use skill, then automatically stopped because it could not confidently determine the browser URL to enforce policy. No further UI action or screenshots were taken. **VISUAL_REVIEW_BLOCKED for 1440×900 and 390×844.** This is why this gate remains AT_RISK. [Operator instructions](docs/GATE2C1_OPERATOR.md) cover both viewports, all states, Discover and preserved Audit, while warning that the four-call LIVE budget is exhausted.

Git base remains **`ca5481f3d882f24eb74aa952b5ccfcb8aef7ad44`**. Gate 2B and 2C.1 changes remain uncommitted; `.env.local` remains ignored/untracked. No push, remote repository or deployment was created. Tracked diff whitespace review passed using per-command configuration; no global ignore configuration was changed.

New files for this gate: `app/discover.tsx`, `app/audit-workspace.tsx`, `app/movie-artwork.tsx`, `app/api/discover/route.ts`, `lib/discovery-report.ts`, `lib/product-errors.ts`, `tests/discovery.test.mjs`, `tests/origin.test.mjs`, `tests/integration/discovery.test.mjs`, `scripts/check-origins.mjs`, one-shot LIVE/HTTP quota guard runners and offline verifier, `scripts/verify-gate2c1.mjs`, `docs/GATE2C1_OPERATOR.md` and Gate 2C.1 evidence. Updated: `app/page.tsx`, `app/globals.css`, `app/rescue.tsx`, `lib/http.ts`, `lib/browser-request.ts`, `lib/contracts.ts`, `lib/qloo/service.ts`, integration preload, secret verifier, README, this evidence and Qloo contract. Gate 2B files are preserved.

**Next concrete action:** operator reviews the two resolutions and actual interactions, with a separately authorized new request budget for further LIVE work. Then review the accumulated diff/secrets and commit locally; choose a license and shared public quota controls before a separately reviewed deployment. No next milestone or public release was started automatically.

---

# Historical GATE 2B Agentic Cultural Audit

Reviewed **2026-10-30**. **GATE 2B: AT_RISK.** A working agent-invocable tool interface and product rescue workflow are implemented; no hosted autonomous LLM is configured or simulated. Browser visual review is blocked. The previous Qloo LIVE integration and controlled A/B evidence remain valid historical evidence, not new queries.

## Implemented and actually exercised

- `GET /api/tools` publishes four tool schemas; `POST /api/tools` creates bounded sessions, dispatches tools and exports passports. `scripts/agent-tool.mjs` is a functioning local stdin bridge, exercised against the production Next server in isolated HTTP tests.
- `resolve_entities`: actual Search operation through the secure existing adapter; returns explicit ambiguity/empty states and signed choices, with no automatic confirmation.
- `evaluate_candidates`: actual Insights operation over confirmed identities. The new tool interface preserves finite observed query.affinity and available explainability/warnings. Missing numbers stay null. The original `/api/audit` contract stays rank-only for compatibility.
- `compare_cultural_signals`: at most two Insights, fixed candidate IDs/order/type/take/explainability; only the signal changes. Partial A prevents B. Unchanged evidence is INCONCLUSIVE. A remains the signal used for revision.
- `propose_evidence_based_revision`: uses only server-held evaluation, never caller-supplied results. Full coverage proposes Qloo's exact ordering of the same confirmed films. Partial or absent evidence abstains. No alternative films are invented.
- Rescue My Recommendations shows BEFORE / investigation events / proposed AFTER / evidence-based WHY / human approve or keep-original decisions. Approval is a local review record included in export, not an automatic external write.
- Cultural Stress Test reads the checked-in authentic A/B capture, dated **2026-10-30 14:46 UTC**, and labels it historical. Opening it makes no API request. Current LIVE challenges use fresh responses and require fresh signed identities and human confirmation.
- Evidence Passport includes intent, confirmed identities, cultural signals in provenance parameters, original/returned ranks, observed affinities, limitations, source/date/HTTP status, proposal and actual tool events. Event input summaries record counts/lengths, not proofs, credentials or private model reasoning. Caller labels are descriptive, not authentication.

## Agentic modality and honest limits

The [official current rules](https://qloo.devpost.com/rules), consulted October 30, permit a working application functioning as an agentic tool, using an agent framework, or integrating Qloo into an existing agent. This implementation targets the first modality with functioning callable tools, documented at [docs/AGENT_TOOLS.md](docs/AGENT_TOOLS.md). Organizer acceptance is not certified.

Environment presence checks found no configured OpenAI, Anthropic, Google/Gemini or Azure OpenAI API credential. No credential value was output. No model call was made. Tool choice belongs to the external caller or human UI. The HTTP caller in tests is a scripted MOCK test client; it does not demonstrate autonomous LLM decision-making. Do not describe the deterministic UI as an autonomous agent. See [the updated modality review](evidence/AGENTIC_REVIEW.md).

**Functional Qloo dependency:** without a key, Search abstains; without valid confirmed signed identities, Insights cannot run; without complete Qloo coverage, no revision is proposed. Removing Qloo removes verified identity/evaluation/revision capability. Historical display remains independently available and explicitly dated.

**New Gate 2B Qloo traffic: 0 attempts. Hosted LLM calls: 0.** All new dispatcher/HTTP tests use isolated MOCK transport. No prior one-shot LIVE experiment was rerun or budget extended. The existing real A/B capture is verified offline, not relabeled current LIVE.

## Checks and security

| Check | Actual result | Artifact |
|---|---|---|
| `npm test` | **60/60 PASS**; all original 48 retained, 12 new tool/security/normalization tests | [unit log](evidence/gate2b-tests.txt) |
| `npm run typecheck` | PASS, exit 0 | [typecheck log](evidence/gate2b-typecheck.txt) |
| `npm run build` | PASS, Next 16.4.3, includes `/api/tools` | [build log](evidence/gate2b-build.txt) |
| `npm run test:integration` | **2/2 PASS**; original workflow and four-tool workflow, actual HTTP/production Next server | [integration log](evidence/gate2b-integration.txt), [MOCK assertions](evidence/gate2b-mock-integration.json) |
| `npm audit` | PASS, **0 vulnerabilities**; default runner registry access failed, standalone external audit succeeded | [actual audit output](evidence/gate2b-audit-pass.json) |
| Client credential scan | PASS, **24 client files**, no configured key, server credential/header or MOCK marker | [verification](evidence/gate2b-verification.json) |
| Source/evidence secret scan | PASS, **112 project text files**, no pattern or configured-key findings | [secret review](evidence/gate2b-secret-review.json) |
| Historical A/B offline verifier | PASS; zero additional HTTP requests | [refreshed verifier output](evidence/gate2a1-verification.json) |
| Tracked diff whitespace review | `git -c core.excludesfile=.gitignore -c core.autocrlf=false diff --check` PASS | Local Git command, exit 0 |

The final unit/E2E rerun followed added boundary/numeric/partial-response tests; source and production build were unchanged after the successful build. E2E fixtures are imported only by isolated test-process preload, never application code. The original unit test files were not rewritten. No dependencies were introduced.

Controls: pinned Qloo host/endpoints, backend credential only, signed expiring identities, argument allowlists, bounded body/response, eight-second upstream timeouts, no retries, per-session concurrency lock. Each session reserves at most 12 requests and 16 steps over 20 minutes; 20 sessions per process; existing service caps 60 upstream attempts/process and 12/minute. Conservative session reservations may include rejected validation before network traffic. Any execution error stops that session and clears prior proposal evidence. Public multi-instance usage requires a shared edge quota/spend limit before deployment; memory caps alone do not protect a distributed demo.

## UX observations and release status

Actual browser inventory returned **`The browser access host is unavailable`**. **VISUAL_REVIEW_BLOCKED** for 1440×900 and 390×844. No screenshots or visual PASS invented. Existing design was retained. New controls use existing dark palette, responsive comparison/table containers, explicit labels, keyboard focus, loading/error states, observed evidence, and approve/reject controls; these are implementation facts, not visual validation. Operator instructions cover both viewports and every required state in the tool documentation.

Git baseline now **`ca5481f`** (`Validate real Qloo integration and cultural A-B experiment`), verified at start; initial worktree was clean. Gate 2B changes remain uncommitted. No push or deployment occurred. Global Git ignore warning remains a read-permission warning; no global configuration was changed. Use per-command `git -c core.excludesfile=.gitignore` for review.

Files added: `lib/audit-tools.ts`, `lib/audit-tools-server.ts`, `lib/tool-schemas.ts`, `app/api/tools/route.ts`, `app/rescue.tsx`, `scripts/agent-tool.mjs`, `scripts/verify-gate2b.mjs`, `tests/audit-tools.test.mjs`, `tests/integration/tools.test.mjs`, `docs/AGENT_TOOLS.md`, and Gate 2B evidence logs/artifacts. Updated: `app/page.tsx`, `app/globals.css`, `lib/contracts.ts`, `lib/qloo/service.ts`, `lib/http.ts`, `lib/browser-request.ts`, integration preload, secret verifier, README, contract and modality review. Original HTTP test re-execution refreshed `evidence/gate1b-mock-integration.json`.

**Minimal next action:** operator reviews both viewports, exercises approve/reject/download, confirms tool-mode submission wording, selects an open-source license (none exists), configures public quota controls, reviews secrets/diff and commits locally. If `.git` remains read-only here, use external PowerShell: `git -c core.excludesfile=.gitignore diff --check`, `git add -- app lib scripts tests docs evidence README.md EVIDENCE.md`, `git diff --cached --stat`, then `git commit -m "Add bounded cultural audit tools and recommendation rescue"`. Do not stage `.env.local`. Public deployment and push require separate review. No next gate was started.

---

# Historical GATE 2A.1 controlled Qloo A/B

Observed **2026-10-30, 14:46 UTC / 09:46 Colombia**. **GATE 2A.1: PASS** for the authorized bounded control. Prior evidence is preserved in [GATE2A_HISTORY.md](evidence/GATE2A_HISTORY.md). No next gate, publication or deployment was started.

## Experiment and budget

The prior four resolved identities are **Arrival (2016), the signal**, plus **three candidates: Interstellar (2014), Blade Runner 2049 (2017), Her (2013)**. Four identities resolved and three candidates compared are different counts; the 3/3 coverage was correct.

The original full UUIDs were read from the ignored private prior session and checked against the hashes, titles and years in the authentic Gate 2A report. No signed identity or proof was modified. A second signal was not already among these identities, so one Search was necessary. Paddington 2 (2017) was chosen as a family-comedy contrast to Arrival's science fiction; that contrast is the experiment rationale, not a Qloo-generated classification. Search returned exactly one matching movie/title/year identity, distinct from every existing film.

| Attempt | Actual request | Outcome |
|---|---|---|
| 1 | GET `/search`, `query=Paddington 2`, `take=5` | HTTP 200; one exact verified identity |
| 2 | GET `/v2/insights`, scenario A: Arrival | HTTP 200; exact candidates, 3/3 |
| 3 | GET `/v2/insights`, scenario B: Paddington 2 | HTTP 200; exact candidates, 3/3 |

**Exactly 3 attempts, 0 failed/no-response attempts, 0 retries, 2 Insights requests.** The new budget explicitly counts every attempt before fetch. The runner creates its ledger atomically and refuses any replay, even after a failure. No other Qloo API call was made in this gate. Official documentation retrieval and npm audit are not Qloo API requests.

## Controlled parameters and explainability

Both scenarios used exactly:

```text
GET https://hackathon.api.qloo.com/v2/insights
filter.type = urn:entity:movie
filter.results.entities = same three verified UUIDs, same order
take = 3
feature.explainability = true
```

**Only `signal.interests.entities` changed.** A used Arrival; B used Paddington 2. [The redacted A/B report](evidence/gate2a1-ab.json) contains the actual parameter names and consistently hashed IDs. The verifier checks that the sent request records match the scenario parameters and that the sole changed key is the signal.

Before execution, the [official Insights deep dive](https://github.com/qloo/docs-public/blob/main/reference/insights-api-deep-dive.md) was consulted: it defines `feature.explainability` as a global feature for recommendation results and includes movie in the endpoint's allowed entity types. The entity-specific movie table does not repeat the global feature. Movie acceptance was then directly established in this experiment: A and B both returned HTTP 200 and per-result/aggregate explainability.

## Actual differences

Values below are the raw numeric `query.affinity` values returned by Qloo, not percentages or probabilities.

| Candidate | Rank A: Arrival | Affinity A | Rank B: Paddington 2 | Affinity B |
|---|---:|---:|---:|---:|
| Interstellar | 2 | 0.8368126484416831 | 3 | 0.6520280790170352 |
| Blade Runner 2049 | 1 | 0.9132748362394222 | 1 | 0.7550398789035522 |
| Her | 3 | 0.8013815822511426 | 2 | 0.6823637842971437 |

A order: **Blade Runner 2049 → Interstellar → Her**.

B order: **Blade Runner 2049 → Her → Interstellar**.

Both scenarios returned exactly the same three verified movie identities with **3/3 coverage**. All three affinities changed; Her and Interstellar exchanged positions. Blade Runner 2049 stayed first. The report records exact B-minus-A numeric differences without interpreting them as changes in satisfaction or recommendation quality.

Each candidate returned `query.explainability['signal.interests.entities']` naming the active signal ID with score 1. Aggregate explainability sections also name the active signal with `avg_score=1`. With a single input, those attribution values are not probabilities of satisfaction. Sections named top5/top10 do not mean more than the three actual candidates were returned. The redactor replaces full UUIDs in both fields and nested metadata with consistent hash labels.

No warnings were present in the captured top-level, candidate or aggregate explainability warning fields. No error, ambiguous identity or partial result was accepted. Had the evidence been unchanged, the comparator would have returned **INCONCLUSIVE**; local tests cover that behavior.

The new A result also matches the earlier Gate 2A Arrival affinity values and order exactly. The old request omitted explainability, so this observation is not treated as a third controlled request with fully identical parameters.

## Interpretation and limits

This bounded pair demonstrates that changing the signal while keeping candidates and other parameters fixed changed the returned cultural-affinity evidence. Explainability attributes results to the corresponding signal. This closes the earlier missing-control finding for this specific case.

There is one request per scenario, no randomized statistical replication, and no person-level satisfaction measurement. The result does not establish causality about people, a generally superior list, confidence intervals, effect significance or universal ranking stability. Affinity scales were not converted or calibrated across populations. The production UI remains rank-only; numeric/explainability presentation was not enabled by this diagnostic.

## Reproducible offline evidence

- [A/B report, including request ledger and returned metadata](evidence/gate2a1-ab.json)
- [Offline verification artifact](evidence/gate2a1-verification.json)
- [Current contract findings](evidence/QLOO_CONTRACT.md)

```powershell
node scripts/verify-gate2a1.mjs
```

The verifier performs **zero additional HTTP requests**. It checks attempt/error-stop limits, exact scenario/request agreement, the sole changed parameter, identical candidate IDs, coverage, affinities, rank differences and attribution metadata. It recomputes the comparison rather than accepting the report's PASS label alone. The LIVE runner is intentionally not rerunnable against the exhausted budget.

## Tests, security and build

| Check | Actual result |
|---|---|
| `npm.cmd test` | **48 PASS, 0 FAIL/skipped**: original 44 preserved plus 4 focused A/B comparator tests. [Output](evidence/gate2a1-tests.txt) |
| `npm.cmd run typecheck` | Exit 0. [Output](evidence/gate2a1-typecheck.txt) |
| `npm.cmd run build` | Exit 0. [Output](evidence/gate2a1-build.txt) |
| `npm.cmd audit --json ...` | Exit 0, **0 vulnerabilities**. [JSON](evidence/gate2a1-audit.json). Sandbox registry access failed once; approved registry access succeeded. This consumed no Qloo request; no --force or dependencies added |
| `node scripts/verify-gate2a1.mjs` | Verification PASS, experiment PASS, 3 attempts / 0 failed, 2 Insights, no additional HTTP |
| Exact-key source review | [Secret scan](evidence/gate2a1-secret-review.json); credential loaded only into the scanner process, never printed |
| Client/diff/Git review | [Final review](evidence/gate2a1-review.json); client isolation, original tests, whitespace and Git status |

The LIVE experiment used the existing server/CLI transport with a real event credential; no test fixture or MOCK provider was injected. The four new local tests use labeled MOCK data and cannot call Qloo. No key or authentication header was saved. `.env.local` and private prior identity proofs remain ignored and unversioned.

## Files, Git and next action

Created: `scripts/gate2a1-ab.mjs`, `scripts/qloo-ab-compare.mjs`, `scripts/verify-gate2a1.mjs`, `tests/qloo-ab.test.mjs`, `evidence/GATE2A_HISTORY.md` and the GATE 2A.1 artifacts linked above. Updated: `EVIDENCE.md`, `evidence/QLOO_CONTRACT.md`, `README.md` and the secret scanner's allowed gate label. No dependency or product architecture change.

Baseline remains **c80659b**. Gate 1B, 2A and 2A.1 changes remain in the working tree; this task reports Git state and does not push or deploy. The existing sandbox restriction on `.git/index.lock` was recorded in Gate 2A; no new staging attempt was needed for this read-only Git review. The final review artifact records the current commit and pending files. No new commit is claimed.

The control is closed for this case, and the authorized three-attempt budget is exhausted. **Stop at GATE 2A.1.** Next action is operator review of the A/B evidence and pending release work, especially visual QA, agentic-modality positioning, license and a reviewed local commit. A later publication step needs its own review; this gate does not automatically authorize it.
