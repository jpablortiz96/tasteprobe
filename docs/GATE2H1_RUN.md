# GATE 2H.1 — bounded real Chrome Audit

Status: **PENDING_OPERATOR / AT_RISK**, not BROWSER_PASS. This gate has a fresh explicit authorization for at most five Qloo attempts, independent of unreconciled old budgets. At most four Search and one Insights, failed attempts included. No retries; stop on network, auth, quota or unexpected contract. TMDB imagery is independent, cached and optional.

## Preparation completed without Qloo

Local http://127.0.0.1:3000 health and tool definitions respond 200; production /review returns 404. A foreign-origin request is blocked 403. Empty Search input returns 400 before upstream. Key presence is checked without values; .env.local remains ignored and untracked. Secret preflight has no findings. Git remains ca5481f with previous pending changes. No code or backend change in this gate; no new tests/build are required solely for evidence files. Latest code verification remains GATE 2H: 101/101 tests, 6/6 MOCK HTTP E2E, typecheck/build/audit PASS. Those checks do not establish LIVE browser acceptance.

## Operator sequence

1. Open Chrome at http://127.0.0.1:3000. Select Audit another AI, Use sample input, Confirm movies. Input must be Arrival; original list Interstellar, Blade Runner 2049, Her.
2. Search Arrival exactly once (attempt 1). Confirm Arrival (2016), not The Arrival (1996). Report 1 of 4 confirmed plus poster/fallback. Do not continue until the attempt is recorded. Missing/ambiguous TMDB artwork must not prevent Qloo confirmation; an uncertain Qloo identity must not be guessed.
3. After review, Search/confirm Interstellar (2014), Blade Runner 2049 (2017), Her (2013), once each (attempts 2–4), recording each safe response separately.
4. With 4/4 confirmed, evaluate once (attempt 5). Verify the exact three candidate IDs in the server-projected evidence, coverage and actual returned order/affinities. Do not assume historical ranks. Stop on insufficient or unexpected evidence; no fabricated substitute.
5. Rescue proposal uses existing server evidence and zero Qloo calls. Approve → export Passport, then Keep original list/Reject → export again. The two decisions must differ while original evaluation/proposal and provenance stay unchanged; appliedAutomatically=false. Do not execute the LIVE signal challenge.
6. Use the same loaded result for 1440x900 and 390x844. Check titles, years, artwork/fallback, rank shifts, observed affinity, explanation, focus, overflow and downloads. Do not refresh/re-search to inspect another viewport.

## Recording each attempt

Use Chrome Network, POST /api/tools. Local HTTP status is visible on the request. On success, inspect only output.provenance.httpStatus and output.provenance.requestId (for Search/Insights); on failure, share only error and diagnostic fields. Record attempt index, operation, time, safe titles/years, remaining budget and whether confirmation occurred. Never share session identifiers, signed proofs, cookies, auth headers or the whole raw Search response. Missing fields remain unavailable; they are not invented.

Records: `evidence/gate2h1-live.json`, `gate2h1-preflight.json`, `gate2h1-secret-preflight.json`. Attempt 1 is reserved for the operator; no provider request has been confirmed yet. No Codex HTTP Search duplicates the manual flow.

## Screenshots / exports

Browser host is unavailable to Codex. Supply real redacted screenshots under `docs/screenshots` or attach them in the conversation. Both Passport JSON files can be inspected after checking they contain no credentials/proofs. A summary without the files can establish an operator observation, but file validation remains pending until the redacted exports are inspected. Synthetic/mock screenshots do not close this acceptance.

## Gate completion

Search, identity confirmation, Audit LIVE, Before/After, Rescue, Approve, Reject, downloaded/validated Passport, desktop and mobile each require individual PASS/FAIL/PENDING. Only explicit successful operator confirmation closes BROWSER_PASS and GATE PASS. Then prepare a secret-reviewed local Git checkpoint and recommend Repository & Delivery; no push, deployment or remote creation is performed automatically.
