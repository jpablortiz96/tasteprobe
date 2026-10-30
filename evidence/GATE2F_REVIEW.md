# GATE 2F — cinematic insights / 2026-10-30

Status: **AT_RISK**. Functional presentation implemented and offline validation performed. Real posters remain blocked and browser visual approval is pending. No new Qloo LIVE requests in this gate. No deployments, remote repository, push or commit.

## Confirmed baseline and scope

The operator confirmed Discover working in Chrome with eight authentic recommendations in the GATE 2F prompt. This is operator evidence, not a new Codex LIVE test or permission for more calls. That list/its affinities are not hardcoded into production. Backend Qloo routes, transport, service, signatures, CSRF, limits, budgets and response validation were not changed by GATE 2F. Existing pending changes from earlier gates remain intact.

## Product behavior

- Results begin with a compact dashboard: actual movie count, confirmed starting points from the verified response, maximum finite observed affinity or Not available, returned/requested coverage and evidence limitations. No score is converted to a probability or percentage.
- Featured recommendation selects the highest observed numeric affinity; ties retain provider order. If no finite scores exist, the first Qloo result is shown without a top-affinity claim. Original ranks are preserved, and the remaining grid excludes exactly the featured ID while retaining returned order.
- Featured title/year, large original 2:3 cover, observed affinity and verified signal attribution (when present) lead to Explore why. Missing attribution is explicitly unavailable. Other cards retain Why this movie and evidence source/date in details.
- Layout uses a four-metric desktop dashboard, two metric columns on narrow screens, featured poster/text on desktop and stacked on mobile. Existing card grid retains three/two/one columns. Focus/touch controls and reduced-motion rules remain; CSS and server rendering checks do not constitute visual approval.
- Passport adds dashboard/featured identity, selection basis and ties from the exact same pure helper; original identities/results/explainability/provenance/limitations remain. Fixtures are marked SYNTHETIC even if a caller omits the explicit flag. Missing imagery never blocks export.
- Audit, original-vs-Qloo ranking, Rescue proposal and approval/rejection logic are untouched. Existing Audit and four-tool MOCK HTTP tests are retained. No autonomous LLM or invented tool events are claimed.

## Images

**Qloo BLOCKED_RIGHTS / TMDB BLOCKED_CREDENTIAL**. Historical Qloo metadata records image objects for all eight captured films. Rights to display those specific posters could not be verified from public Qloo terms. TMDB documents non-commercial API use with attribution, key registration and image URL construction from returned metadata; no TMDB credential is configured. Full operator activation steps, sources and required attribution are in `docs/IMAGE_PROVIDER.md`.

No new image provider/API route is represented as functional. `lib/poster-policy.ts` is a tested pure matching policy for a later authorized adapter; it makes zero requests. It checks movie/title/year, optional external identity, uniqueness, rights flag and approved HTTPS image URL shape; it rejects mismatches/ambiguities and produces fallback on missing/failed images. Rights cannot be proven by this helper alone. Current product always renders original CSS covers, visibly illustrative. No commercial posters, unauthorized third-party images or synthetic poster URLs are added to product metadata.

## Validation and visual limit

See `gate2f-verification.json` and command logs. Tests include dynamic maximum/ties/zero/null/nonfinite/empty results; exact matching, wrong year/type/ID/rights/host/ambiguity; fallback; Passport consistency; no ranking mutation; actual JSX server rendering of eight unique cards with no image fetch, synthetic labels and missing affinities. React server rendering is explicitly not a browser or contrast/responsive certification.

All pre-existing 82 tests (including the original 79) are retained. New tests cover presentation and poster policy. Existing MOCK HTTP E2E still checks Discover, Audit, all four agent tools, partial abstention, signed identity, auth errors, origins and `/review` 404 in production.

Integrated browser selection returned `The browser access host is unavailable`. **VISUAL_OPERATOR_REQUIRED**, no VISUAL_PASS or new screenshots. `/review` automatically shares the new results component, remains dev/loopback/explicit-flag-only and uses local synthetic transport. Instructions: `docs/GATE2F_VISUAL_REVIEW.md`, 1440×900 and 390×844 with no provider calls.

Git HEAD at inspection: `ca5481f`. Worktree includes prior uncommitted gates and these changes; no staging/commit attempted. Images and local browser acceptance are the remaining blockers for a full GATE 2F PASS.
