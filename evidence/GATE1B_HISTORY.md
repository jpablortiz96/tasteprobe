# TasteProbe — GATE 1B evidence

Observed 2026-10-29. Only **GATE 1B** is active. Prior evidence is preserved in [GATE1A_HISTORY.md](evidence/GATE1A_HISTORY.md) and [GATE0_HISTORY.md](evidence/GATE0_HISTORY.md). Those records describe their original observation times; the current Git status below supersedes their earlier missing-commit blocker.

## GATE / STATUS

**GATE 1B: AT_RISK.** Automated local checks pass, including the compiled HTTP workflow with an isolated MOCK Qloo provider. **VISUAL_REVIEW_BLOCKED** and **G0_LIVE_PASS: BLOCKED_LIVE** remain unresolved. No full browser E2E, authorized live Qloo response, accepted agentic modality, deployment or eligibility is claimed.

## Actual visual-review availability

The browser inventory reported `browsers: []` and `Browsers: Error: The browser access host is unavailable`. Native Chrome windows exist, but no authorized browser surface was available; the previous milestone's native app authorization had timed out. This milestone did not repeatedly request native app authorization or invent a different screenshot mechanism.

| Required check | Actual outcome |
|---|---|
| Desktop 1440×900 render | VISUAL_REVIEW_BLOCKED; not captured or inspected |
| Mobile 390×844 render | VISUAL_REVIEW_BLOCKED; not captured or inspected |
| Three-step browser navigation | Not executed in a browser |
| Browser report download | Not clicked; report generation/serialization tested separately |
| Visual hierarchy, spacing, responsive behavior | Layout preserved; no visual PASS claimed |
| Accessibility | Existing labels, focus rules and reduced-motion CSS inspected in code; one static contrast defect measured and fixed. No screen-reader/keyboard/browser audit claimed |

The compiled local app was started successfully on **http://127.0.0.1:3002**, bound to loopback. An already-running local server was initially found on port 3000; the verification uses the explicit production server on 3002.

## Observed problems and targeted changes

These findings were established through source inspection, official documentation and isolated tests, **not through screenshots**. No dashboard redesign or secondary feature was added.

1. **Placeholder contrast:** authored `#677b7d` on textarea background `#0d171c` measured **4.07:1**, below the 4.5:1 normal-text threshold. Changed only the placeholder color to `#839797`, now **5.91:1**. A test reads the actual CSS and checks the contrast ratio. This does not certify all contrast, font sizes, compositing or browser rendering.
2. **Readiness recovery:** the initial health request had no deadline and the failure state offered no retry. It now uses a 5-second deadline, resets readiness while checking, and exposes a **Retry connection** control on failure. Retrying calls only `/api/health`, not Qloo.
3. **Unsafe/confusing browser diagnostics:** the previous request helper could pass arbitrary remote error values or browser exception text to the UI. The shared helper now maps network, timeout, malformed JSON and unknown error values to safe categories already supported by product messages.
4. **Documented empty Search:** official Search documentation lists HTTP 404 as no results. It previously became a generic request error. Only `/search` 404 is now normalized to empty choices, preserving actual HTTP 404 in provenance. Insights 404 remains an error, verified by a dedicated regression test.
5. **Unsubstantiated agent wording:** the Devpost template called the pipeline agentic and described an internal agent without an implementation. Updated it to describe the deterministic, human-operated tool and clearly mark modality/live validation pending. Removed the internal gate number from the user-facing preview footer.

## Flow and state evidence

Expected sequence remains: interests → original recommendations → Search → human confirmation → Insights → comparison → explanation → report.

| State / behavior | What was actually exercised |
|---|---|
| Initial empty workspace | Real compiled HTTP 200 HTML contains intake and workflow controls; browser appearance not reviewed |
| BLOCKED_LIVE | Real compiled health 200 with missing-key status; Search 503 with abstention; zero Qloo calls |
| Loading | Bounded request handling and timeout classification tested with MOCK transport; loading animation/announcements not observed in a browser |
| Error | Real compiled routes reject invalid/forged/cross-origin/oversized requests; isolated MOCK HTTP integration verifies redacted Qloo auth errors |
| Ambiguous Search | MOCK HTTP provider returns two identities; no automatic selection; unconfirmed audit returns 400 |
| Empty Search | MOCK HTTP provider returns documented 404; API returns empty choices and HTTP 404 provenance |
| Success | Isolated MOCK HTTP integration resolves and confirms identities, calls real compiled audit handler and verifies complete order comparison; no live success claimed |
| Insufficient evidence | Same isolated integration returns 1 of 3 candidates; shifts remain null and status is INSUFFICIENT_EVIDENCE |
| Explanation/report | Tested rank shifts, limitations, source endpoint and JSON serialization; exported data excludes proof tokens and credential. Browser download action is unverified |

[gate1b-mock-integration.json](evidence/gate1b-mock-integration.json) is explicitly labeled **MOCK_INTEGRATION_TEST_ONLY**. It records assertions and HTTP statuses, not synthetic Qloo responses or a pretend live report. [Integration output](evidence/gate1b-integration.txt) records one passing compiled-HTTP test.

The integration suite starts a separate loopback Next.js process with a test-only Node preload under `tests/integration/`. Its fictional credential and `fetch` interception live only in that process, are not installed in production code, and make **zero live Qloo calls**. The process is stopped after the test. The normal application on port 3002 has no key and shows BLOCKED_LIVE. No mock mode, preview success toggle, fixture response or fake result was added to the product.

## Agentic modality

The [official rules, section 4](https://qloo.devpost.com/rules) allow an agentic tool, an agent-framework application, or a Qloo integration into an existing agent. The code currently implements a **deterministic, human-operated audit tool**. It has no autonomous planner, model-provider call, agent framework, or demonstrated integration with an existing agent. Pasting a recommendation list from an agent does not establish integration.

Real system decisions are input/proof validation, movie filtering, quota refusal, constraining Insights to the confirmed candidates, checking returned identities, comparing orders and abstaining on incomplete evidence. Humans choose titles, identity matches and when to execute the tools. Qloo supplies identity/order evidence when live access exists; TasteProbe validates and compares it.

Mode (a), agentic tool, is a **candidate interpretation, not established compliance**; modes (b) and (c) are not implemented. See [AGENTIC_REVIEW.md](evidence/AGENTIC_REVIEW.md). No framework was added merely to claim a label. Organizer acceptance and live integration are outstanding.

## Qloo contract

The requested event developer-guide URL was consulted again but failed retrieval. The [official public documentation repository](https://github.com/qloo/docs-public) and raw Search/Insights references were reachable. The earlier pinned documentation checkout was inspected as well. [QLOO_CONTRACT.md](evidence/QLOO_CONTRACT.md) records source links, definitions and the new 1B recheck.

- Documented: GET Search `query`, bounded `take`, optional `types` category array and 404/429 outcomes. **Allowed `types` enum values remain unverified** in the retrieved reference; the app omits this parameter and filters explicit movie metadata after retrieval.
- Documented: GET Insights, `filter.type=urn:entity:movie`, comma-separated `signal.interests.entities`, comma-separated `filter.results.entities`, and `take`. The exact request is asserted in MOCK HTTP integration.
- Identifiers: official entity docs describe stable GUIDs/UUIDs; app accepts canonical hyphenated hex syntax, normalizes case and additionally requires a signed Search identity. It does not infer identity from UUID syntax alone.
- Response envelopes: Insights examples show `results.entities` and movie metadata. Search envelope and all event-specific live behavior remain pending actual responses; unknown structures fail closed.
- Ranking: compare the documented returned order within the same request. Numeric affinity remains **null**, with no invented path, percentage or normalization. Explainability is not requested.
- Still pending: independent verification of hackathon host from an accessible official event source, organizer acceptance of direct REST, actual Search types/envelope, live coverage/order behavior, numeric affinity path/scale and explainability.

No `QLOO_API_KEY` was found in the parent process environment; `.env.local` was absent. No authorized Qloo credential was read from another app or requested in chat. The event's direct REST acceptance remains pending as requested.

## Checks and security

| Command / check | Actual result |
|---|---|
| `npm.cmd test` | **44 PASS, 0 FAIL, 0 skipped**: all original 37 tests preserved, plus 7 tests for new behavior. [Output](evidence/gate1b-tests.txt) |
| `npm.cmd run test:integration` | **1 PASS**, real compiled Next HTTP routes with isolated MOCK provider. [Output](evidence/gate1b-integration.txt) |
| `npm.cmd run typecheck` | Exit 0. [Output](evidence/gate1b-typecheck.txt) |
| `npm.cmd run build` | Exit 0, page + health/search/audit routes compiled. [Output](evidence/gate1b-build.txt) |
| `npm.cmd audit --json --cache .npm-cache --fetch-retries=0 --fetch-timeout=15000` | Exit 0, **0 vulnerabilities** of all severities. [JSON](evidence/gate1b-audit.json). Artifact-saving request hit sandbox networking once and succeeded with approved external-network access; no --force or dependency changes |
| `npm.cmd run verify:local -- http://127.0.0.1:3002 gate1b` | **9 PASS**, real local missing-key/error routes plus **23 client files** scanned; zero Qloo calls. [Artifact](evidence/gate1b-routes.json) |
| `node scripts/verify-secrets.mjs gate1b` | No findings within pattern-review scope; [artifact](evidence/gate1b-secret-review.json) records exact file count and limitations |
| Git diff / original tests | [Review artifact](evidence/gate1b-review.json) records tracked/untracked whitespace checks and unchanged original tests |

The client bundle has no QLOO_API_KEY variable, X-Api-Key header, Qloo host/transport or MOCK credential marker. `server-only` remains the production credential boundary. No dependencies or lockfile were changed; test preloading exists only under tests. No authentication, payments, model framework, deployment or public URL was added.

## Git and publication

Existing commit verified: **`c80659b18dd56492d956364fe46b9c78284600da` — Build secure TasteProbe product foundation**. Thus the earlier missing-commit problem is resolved externally. GATE 1B edits remain uncommitted; this task did not request a new commit. No push or publication was performed.

Initial `next-env.d.ts` difference pointed to generated dev types; running the production build regenerated its tracked production references. No hand-written declarations were removed. The original 37 tests are unchanged from HEAD. No global Git configuration was changed.

An open-source **LICENSE file is still absent**, so publication/submission must not proceed until license/ownership review and secret review are complete. The app is local only.

## Files and next action

Modified: `app/page.tsx`, `app/globals.css`, `lib/qloo/service.ts`, `package.json`, `scripts/verify-local.mjs`, `scripts/verify-secrets.mjs`, `README.md`, `DEVPOST_SUBMISSION_DRAFT_EN.md`, `evidence/QLOO_CONTRACT.md`, `EVIDENCE.md`.

Created: `lib/browser-request.ts`, `tests/gate1b.test.mjs`, `tests/contrast.test.mjs`, `tests/integration/mock-qloo-preload.mjs`, `tests/integration/workflow.test.mjs`, `evidence/AGENTIC_REVIEW.md`, `evidence/GATE1A_HISTORY.md`, and the GATE 1B check artifacts linked above.

Next concrete action: restore an authorized browser surface and review the three steps/download at **1440×900 and 390×844**. Empty/blocked/error can be inspected without a key; loading/success/partial views require an explicitly isolated test session or actual authorized responses, with MOCK never labeled live. In parallel, confirm REST host/access and agentic-tool interpretation with organizers, configure an authorized local key, then execute the bounded Search → explicit identity confirmation → single Insights experiment. Record actual structure, coverage and ordering before enabling numeric affinity or declaring G0_LIVE_PASS. Do not deploy publicly from this gate.
