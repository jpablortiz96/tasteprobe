# TasteProbe

**Your agent recommends. TasteProbe verifies.**

Submission draft: ready for operator review, not submitted.

- Source: https://github.com/jpablortiz96/tasteprobe
- Public HTTPS demo: https://tasteprobe-production.up.railway.app

Both URLs were verified. Railway build/healthcheck, one running replica, static assets, exact-origin CSRF, production Redis admission and a retained tool session passed without provider calls. Fresh public Discover/Audit LIVE user acceptance remains pending separate authorization. See [deployment details](DEPLOYMENT.md).

## Inspiration

A movie shortlist can sound convincing without showing how it relates to the viewer's cultural interests. We wanted both discovery and a way to question an existing list: confirm the films, inspect cultural evidence, and keep the limits visible.

## What it does

Discover for me starts with one to three confirmed favorite movies and uses Qloo to find new films, excluding those favorites. Audit another AI compares an original shortlist against Qloo's actual returned order. Rescue My Recommendations proposes a reordering of those same candidates only when coverage is complete. A person approves or rejects it. The downloadable Evidence Passport preserves identities, provenance, observed affinities, coverage, limitations and actual tool events.

Qloo is the cultural evidence engine. TMDB supplies optional artwork, never ranking or recommendations. Ambiguous artwork falls back safely. Affinity is an observed aggregate relationship, not a percentage chance of liking a film.

## How we built it

Next.js App Router, React, TypeScript and server-side native fetch. Separate Qloo and TMDB adapters enforce fixed destinations, timeouts, bounded responses and request budgets. Human-confirmed Qloo identities are signed; the browser uses same-origin APIs. A small local MCP stdio adapter exposes four bounded tools to compatible agents. There is no hosted internal LLM or multi-agent framework.

An authenticated Codex CLI session actually discovered TasteProbe's tools, selected propose_evidence_based_revision with empty arguments and received structured ABSTAINED because no verified evaluation existed. It interpreted that limitation instead of inventing a ranking. This is a real agent/tool integration demonstration, **not a claim that an agent autonomously performed a complete LIVE audit**. [Reproduce the connection](CONNECT_AN_AI_AGENT.md).

## Challenges

Identity ambiguity mattered more than a successful HTTP status: choosing a different movie called Her produced incomplete coverage. Confirming Her (2013) restored 3/3 coverage. Transport diagnostics distinguished DNS failures from provider HTTP failures. Optional metadata and explainability required careful validation without inventing missing values. TMDB has multiple Arrival (2016) identities, so title/year alone does not justify selecting a poster.

## Accomplishments

The operator verified Discover with authentic Qloo recommendations and TMDB artwork in Chrome. Audit with Arrival (2016), Interstellar (2014), Blade Runner 2049 (2017) and Her (2013) achieved 3/3 coverage. Its actual response ordered Blade Runner 2049, Interstellar, then Her. The APPROVED Passport preserves this request and observed values; later queries may differ. Rescue, approval and download were verified by the operator on desktop and mobile. Same-analysis Reject serialization is additionally covered offline with clearly synthetic test data; the corresponding original LIVE Reject export was lost and is not claimed as verified.

A dated controlled A/B experiment compared Arrival and Paddington 2 signals with the same three candidates. Both returned 3/3, with differences in order and query.affinity. The historical artifact has an offline verifier. One comparison does not establish general causality or personal satisfaction.

## What we learned

Verifiable identity, provenance and abstention make cultural tools more useful than plausible explanations alone. Missing evidence is not a negative verdict on a movie. A signed and typed workflow still needs real-browser acceptance. Public quotas and process state need separate deployment controls; passing local tests is insufficient.

## What's next

Features are frozen. GitHub and Railway are published with shared quota admission and verified HTTPS origin behavior. Complete separately authorized public LIVE acceptance and record operator feedback. A separately authorized full agent-driven LIVE audit is future validation, not an existing accomplishment.

## Technologies

Qloo REST Search and Insights; TMDB API; Next.js; React; TypeScript; Node.js native fetch and test runner; MCP stdio; Codex CLI; CSS; JSON Evidence Passports.

## Instructions for judges

Open the public HTTPS demo above. No account or browser API key is required. Operators should agree a bounded request budget before LIVE acceptance; the shared demo has conservative global/client limits. Self-hosting instructions and private server configuration are in README. For Discover, search Arrival and confirm the 2016 movie, then discover and inspect Why this movie and the Passport. For Audit, use the exact four titles/years above, confirm every identity, evaluate once, inspect Before/After and generate Rescue. Approve or Keep original list records a local decision; export the Passport to inspect it. Do not repeat evaluations to try to recreate a historical order.

For the agent demonstration, use the documented Codex/MCP script with the default zero Qloo allowance. It demonstrates authentic missing-evidence abstention without consuming a provider request. Synthetic /review is development-only, explicitly NOT LIVE and unavailable in production.

## Evidence and limitations

- [LIVE and offline evidence ledger](../EVIDENCE.md).
- [Historical A/B artifact](../evidence/gate2a1-ab.json) and `node scripts/verify-gate2a1.mjs` (offline).
- [Actual Codex MCP events](../evidence/gate2h2-codex-mcp.json).
- Operator-confirmed desktop/mobile usability exists; authentic screenshot files have not been supplied to the repository. No screenshots are fabricated.
- Partial coverage means no revised ranking. Explainability may be absent. Rankings are query-specific; affinity is not calibrated satisfaction.
- Public deployment and real Redis reservation/admission are verified. Internal caps of 40 Qloo / 200 TMDB do not establish provider balances; 30 Qloo requests are planned for judges. Fresh public LIVE user acceptance remains pending.
- Ordinary Railway resource usage is metered under the existing plan; no upgrade was made.
- Video is being prepared separately; no video URL or submitted Devpost status is invented.

This product uses the TMDB API but is not endorsed or certified by TMDB. Source code is MIT; provider data, artwork and trademarks are governed separately by their owners. See [third-party notices](../THIRD_PARTY_NOTICES.md).
