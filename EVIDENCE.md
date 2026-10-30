# TasteProbe — GATE 2A.1 controlled Qloo A/B

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
