# GATE 2H — final UI / dual-mode acceptance

2026-10-30. **AT_RISK / LIVE_ACCEPTANCE_PENDING.** Operator confirmed Discover with real Qloo/TMDB and desktop/mobile improvement in the prompt. Audit's complete real-browser flow remains unaccepted. No new Qloo or TMDB requests were made by Codex in this gate.

## Preserved baseline and changes

Git status/diff and a configured-secret scan were inspected before edits. Existing uncommitted gates were retained. No Qloo routes, signatures, CSRF, score generation, ranking or response validation changes were made. No package/dependency change.

- Four authored local SVG icons: clapperboard, heart, sparkles, shield-check. Consistent size/currentColor, aria-hidden/focusable=false; text/numbers remain primary.
- Discover Search matches and confirmed favorites use the existing TMDB provider through a shared optional visual hook. Audit reuses the same path for matches, confirmed signal/candidates and comparison rows. Images never confirm Qloo identity or enter ranking calculations.
- Client caching now deduplicates in-flight title/year/type lookups across batches/roles; bounded metadata cache and lazy loading remain. Existing strict movie/title/year ambiguity fallback remains; no external-ID field is present in the current normalized Qloo contract, so none is fabricated. Known two-match Arrival (2016) TMDB ambiguity continues to abstain.
- Audit preserves original-vs-returned order, shifts, provenance, observed affinities, Rescue and Passport. The sample input is now exactly Arrival plus Interstellar, Blade Runner 2049 and Her. The array used for returned order is still a copy; original rows are not mutated.
- Human decision export was factored into a pure helper without changing semantics: Approve/Reject records a local decision, appliedAutomatically=false, and preserves original evaluation/proposal. Tests cover both serialized decisions. Actual browser clicks/downloads remain pending.

## Actual bridge invocation

On the existing local server, Codex invoked `scripts/agent-tool.mjs` through a bounded adapter: create an external-agent session, then `propose_evidence_based_revision` with `{}`. Result ABSTAINED, empty before/after, sourceRequestId null, actual execution event, one step, zero Qloo reservations. Agent action: retain abstention; no Search/Insights without budget. No hosted model or autonomous planner is claimed. **TOOL_INTERFACE_PASS**; broader **AGENT_EXECUTION_PENDING**. See `gate2h-agent-invocation.json` and `docs/AGENT_TOOLS.md`.

## Budget

GATE 2E.1 last records 2/7 consumed, then a transport stop. Operator explicitly reported later Discover request count as unknown in GATE 2H. Old nominal remaining attempts cannot be reconciled or assumed available. This gate spends zero; a fresh explicit budget is required before LIVE Audit. Proposed acceptance: at most five fresh attempts, four Search plus one Insights; no A/B or retries. Rescue proposal, Approve/Reject and exports add no Qloo calls. Details: `docs/GATE2H_ACCEPTANCE.md`.

## Verification and limits

Original 96 unit/server-render tests and six MOCK HTTP E2E retained. New tests cover icon rendering, Audit entry, in-flight image deduplication across IDs/roles without confirmation, cached fallback, and Approve/Reject serialization without ranking mutation. Existing TMDB identity/ambiguity/secret tests remain.

Production build and HTTP tests verify /review 404. The active old Next server on port 3000 was identified by PID 30544 and stopped solely for the build; the validated compilation was restarted outside the sandbox on the same loopback port with .env.local. Health/tools returned 200, /review returned 404, without provider queries. Restart invalidates old signed identities/sessions; fresh confirmation must wait for authorized LIVE acceptance.

Integrated browser reports unavailable. New icons/selection artwork, Audit, Rescue clicks and Passport downloads do not receive VISUAL_PASS from server rendering or mocks. No screenshots were fabricated. Operator capture checklist: `docs/screenshots/README.md`; no image files supplied yet. Operator desktop/mobile Discover baseline is distinguished from pending post-edit review.

Git HEAD ca5481f, accumulated worktree changes pending. No commit, remote repository, push, deploy or automatic Gate 3. Freeze features and recommend Gate 3 only after both real browser flows and downloads are explicitly accepted.
