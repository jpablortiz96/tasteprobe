# Qloo REST contract review

## Latest result — GATE 2A.1, 2026-10-30: PASS

The independent bounded A/B control is now captured in [gate2a1-ab.json](gate2a1-ab.json), with [offline verification](gate2a1-verification.json). This supersedes the previous gate's pending signal-control finding for this specific movie case; it does not certify unrelated release gates.

- **Budget:** exactly **3 fetch attempts**, all HTTP 200: one Search for the new signal and one Insights request per scenario. No failures, retries, repeated Insights or further API calls.
- **Existing identities:** four previously resolved films mean one interest (Arrival, 2016) plus three candidates (Interstellar, 2014; Blade Runner 2049, 2017; Her, 2013). The three-candidate comparison therefore correctly reports 3/3 coverage.
- **Second signal:** a single `GET /search?query=Paddington%202&take=5` returned one exact movie/title/year identity for Paddington 2 (2017). Its UUID is distinct from the original signal and all candidates. The family-comedy versus science-fiction contrast is an experiment-design rationale, not a Qloo-inferred cultural label.
- **Parameters:** A uses Arrival; B uses Paddington 2. The only differing parameter is `signal.interests.entities`. Both requests use identical `filter.type=urn:entity:movie`, the same ordered `filter.results.entities` list, `take=3`, and `feature.explainability=true`. Hashed IDs in the public report preserve equality/difference checks without exposing full provider IDs.
- **Explainability admission:** the [official Insights deep dive](https://github.com/qloo/docs-public/blob/main/reference/insights-api-deep-dive.md) defines this global recommendation feature and includes Movie among allowed entity types. The entity-specific table does not repeat the global feature. Operational movie support is now directly confirmed: both requests returned 200, per-candidate `query.explainability`, and aggregate `query.explainability`.
- **Response identity and coverage:** both A and B returned exactly the same three verified movie IDs, with full 3/3 coverage. No foreign or missing candidate was accepted.
- **Order:** A = Blade Runner 2049, Interstellar, Her. B = Blade Runner 2049, Her, Interstellar.
- **Observed numeric values:** all three `query.affinity` values changed; complete raw precision is preserved in the report. No conversion to a probability or percentage was performed.
- **Attribution:** each candidate's `query.explainability['signal.interests.entities']` contains the active scenario signal ID and score 1. Aggregate `effect_on_top3_recs`, `effect_on_top5_recs`, `effect_on_top10_recs` and `effect_on_all_recs` likewise identify the active signal with `avg_score=1`. These are metadata sections, not evidence that five or ten results were returned. With one input signal, score 1 is an attribution value, not satisfaction probability.
- **Warnings:** none in the captured top-level, candidate or aggregate explainability warning fields. Neither scenario returned an HTTP error.
- **Prior observation:** A reproduces the previous Arrival affinity values and order exactly. The prior request omitted explainability, so this is an observed numeric/order repeat, not a third controlled request or a claim that every parameter matched the prior experiment.

Conclusion: changing only the cultural signal produced different observed affinity values and ordering, with explainability identifying the corresponding signal. This closes the initial control requirement for this bounded pair. One request per scenario is not statistical replication, proof of provider internals, causal inference about people, or validation of recommendation quality. The product UI remains rank-only; this diagnostic does not automatically enable numeric-score or explainability presentation in production.

---

## Current status — GATE 2A, 2026-10-30

The earlier pending findings below are historical. The user now reports that Qloo Support confirmed direct backend REST access and supplied `https://hackathon.api.qloo.com` as the event host. This is accepted as the user's authorization; no support email/message was independently retrieved. The configured credential successfully produced real HTTP 200 Search and Insights responses at that host.

**BLOCKED_DOCUMENTATION was a local execution guard, not a Qloo API error.** `scripts/qloo-smoke.mjs` refuses a configured key unless `--reference-reviewed` is supplied; it additionally requires `--execute` and a validated `--request-file`. No guard was removed or automatically bypassed. The [review record](qloo-reference-review.json) links the official Search/Insights references retrieved again for this gate. The event-guide URL remained unavailable. The explicitly reviewed smoke command returned HTTP 200 and exit 2 by design, because a single response does not automatically pass the G0 falsifier.

### Observed LIVE contract

- Search: GET `/search`, first with `query=Arrival`, then via the actual Next route with `query` plus `take=5`. The envelope is `results: []`; identities contain `entity_id`, `name`, `types` and optional `properties.release_year`/`release_date`. Movie identities use `types: ["urn:entity:movie"]`; no guessed Search `types` parameter was needed. Canonical UUID syntax, case normalization and signed confirmation worked without modifying the product adapter.
- Human confirmation: the user explicitly confirmed Arrival (2016), then Interstellar (2014), Blade Runner 2049 (2017), Her (2013), in that original order. Arrival and Her each had two normalized movie choices; exactly one matched the user-confirmed title and year. No ambiguous identity was silently accepted.
- Insights: GET `/v2/insights` with `filter.type=urn:entity:movie`, Arrival's resolved ID in `signal.interests.entities`, exactly the three confirmed candidate IDs in `filter.results.entities`, and `take=3` returned HTTP 200.
- The actual envelope is `success: boolean`, `results.entities: []`. All three returned IDs exactly match the submitted candidate set; all three carry movie subtype metadata. Coverage is 3/3. Actual order: **Blade Runner 2049, Interstellar, Her**.
- `results.entities[*].query.affinity` was present and numeric in this one response. Its actual values are retained in [the redacted observation](gate2a-upstream.json), associated with hashed entity IDs. The returned order is descending by those observed values. No values were invented, normalized to percentages, or inferred from rank.
- The current product remains **rank-only**: normalized/exported `affinity` stays `null`. The field path is now observed, while broader score semantics, cross-query comparability and explainability remain unvalidated. Historical report wording saying the numeric path was pending reflects the state at capture time, before this manual review; it does not negate the observed raw field.
- The response did **not** echo the signal/filter parameters at top level. Request observation verifies the exact sent IDs, and response IDs verify candidate filtering. This establishes a successful accepted signal-bearing request and exact candidate coverage, **not independent proof of Qloo's internal application of the signal**. No alternate-signal control or repeated Insights request was made within the initial budget.

### Bounded LIVE evidence and network limitation

[The smoke artifact](gate2a-smoke-redacted.json) records one HTTP 200 Search. [The Next-route observation](gate2a-upstream.json) records four HTTP 200 Search calls and one HTTP 200 Insights call. Thus **six successful remote HTTP transactions are confirmed**. Four additional transport attempts produced no HTTP response: one direct smoke attempt and three attempts from persistent test servers; two explicitly reported `ENOTFOUND`. No authentication or quota error was retried automatically. No more live requests were made after the six responses.

Do not describe these as only six fetch attempts: there were ten transport invocations including failures. For the two generic NETWORK failures, reaching the provider cannot be independently established from the redacted error. Persistent-server DNS failed while a one-shot approved DNS check and a single approved execution containing the actual compiled Next server and HTTP client succeeded. This isolates a difference between execution contexts; it does not prove a permanent operating-system/network root cause.

[Offline verification](gate2a-verification.json) recomputes identity hashes, exact candidate-set coverage, rank mapping and ordering against observed affinity values without additional API calls. [The exported report](gate2a-report-redacted.json) uses real Qloo evidence and strips identity authorization proofs. The live scripts now refuse replay after completion; a fresh live experiment requires a separately reviewed budget and artifact lifecycle. This gate captured one Insights result, not repeated live reproducibility.

Full gate status remains **AT_RISK** under a strict reading of repeatability and signal-application verification: Search/Insights/HTTP tool flow succeeded, but a repeated or alternate-signal control is pending. No further request is authorized implicitly, and no next gate or deployment is started.

---

Reviewed 2026-10-29. No Qloo API request was made. This is a documentation review, not live validation.

The official public documentation was retrieved from `qloo/docs-public`, pinned at commit `d4a0eb978518f7fb404993d1509d11b21239ada6`. The temporary checkout is under ignored `.npm-cache/qloo-docs`. Direct `docs.qloo.com/reference/...` retrieval failed. The repository's `openapi-schema.json` is the generic OpenAPI document meta-schema, **not** an executable Qloo API specification.

| Contract | Finding / implementation |
|---|---|
| Authentication | [`api-onboarding.md`](https://github.com/qloo/docs-public/blob/d4a0eb978518f7fb404993d1509d11b21239ada6/reference/api-onboarding.md) documents `X-Api-Key` and server environment credentials. |
| Hackathon host | Pinned to `https://hackathon.api.qloo.com`, as required by the supplied project brief. **Pending independent official host verification:** the event-specific developer guide could not be retrieved; the public repository uses the general API host. No alternative host or redirects are permitted. |
| Search | [`get-search.md`](https://github.com/qloo/docs-public/blob/d4a0eb978518f7fb404993d1509d11b21239ada6/reference/get-search.md) documents `query`, `take` (1–100), and optional `types`. We use only `query` and `take=5`: the retrieved reference does not specify the `types` enum spelling. Movie identities are filtered after retrieval and explicitly selected by the user. |
| Search response | **Pending live verification.** The runtime only accepts a `results` array with UUID `entity_id`, bounded `name`, explicit movie subtype/type and optional integer `properties.release_year`. Unknown envelopes abstain with `INVALID_RESPONSE`; no fuzzy identity is auto-accepted. The reference does not provide a response example. |
| Insights parameters | [`insights-api-deep-dive.md`](https://github.com/qloo/docs-public/blob/d4a0eb978518f7fb404993d1509d11b21239ada6/reference/insights-api-deep-dive.md) documents `filter.type`, `filter.results.entities`, `signal.interests.entities` (comma-separated IDs for GET), and `take`. [`available-parameters-by-entity-type.md`](https://github.com/qloo/docs-public/blob/d4a0eb978518f7fb404993d1509d11b21239ada6/reference/available-parameters-by-entity-type.md#movie) supports these for movies. Exactly these four parameters are sent. |
| Insights envelope | `results.entities`, UUID, `name`, `subtype=urn:entity:movie` and `properties.release_year` appear in official onboarding examples. Runtime rejects duplicate, unrelated or wrong-domain IDs. Live behavior remains unverified. |
| Ranking | [`docs/insights-api.md`](https://github.com/qloo/docs-public/blob/d4a0eb978518f7fb404993d1509d11b21239ada6/docs/insights-api.md) states that recommendations are returned ranked by affinity. TasteProbe compares this returned order within a single request. Partial coverage produces no proposed ranking or rank-shift claim. |
| Numeric affinity | **PENDING.** API overview describes a 0–1 scale, while general/business affinity guides describe 0–100. No verified numeric JSON path was found in the retrieved API examples. All normalized `affinity` values remain `null`; no percentage, score or threshold is inferred. |
| Explainability | The deep dive documents `feature.explainability` and `query.explainability`, but this feature is **PENDING** live validation and is not requested. Product explanations are limited to observed order changes and coverage. |
| Event access | [Official kit API access policy](https://github.com/qloo/qloo-hackathon-kit/blob/main/docs/API_ACCESS.md) lists harness surfaces as supported event access. **PENDING:** confirm direct native REST access is accepted for this participant's event credential. User requested REST implementation; this does not establish organizer approval. |

## Local safety and lifecycle

- Server-only wrapper imports the credential from `process.env.QLOO_API_KEY`. No client key entry, public environment variable, model provider, or mock fallback.
- Native `fetch`, exact host and two allowed paths, redirects disabled, no cache, 8-second network deadline, 512,000-byte response cap, zero retries.
- Shared per-process quota: 12 upstream attempts per minute and 60 per process lifetime, including failures. Each Search uses one attempt; each audit uses one Insights attempt. Hard quota is intentionally conservative. These are local controls, not the organizer's actual quota.
- Identity proof: HMAC-SHA256 using a random per-process secret, 30-minute expiration, movie ID/type/title/year bound to the Search result; explicit `confirmed:true` required for every item. Proofs are omitted from exported reports. Restarting invalidates them.
- Audit limits: 1–3 interest movies, 3–5 original recommendations, no duplicate identities across lists. Response only covers the submitted candidates.
- Incoming JSON is bounded at 8,192 bytes and 3 seconds; cross-origin browser requests are rejected. Errors expose categories, never upstream text or headers.
- **Not deployment-ready:** quotas and proof keys are process-local. Multiple workers/instances require a shared quota and stable server-side proof secret. No public deployment is authorized in GATE 1A.

## GATE 1B live experiment

Confirm event REST access and host, configure an authorized key locally, then perform one Search at a time and explicitly confirm identities before a single Insights evaluation. Inspect actual envelopes and optional numeric fields before enabling them. Save redacted structure/status/timestamp and evaluate the G0 falsifier. Do not call a configured credential valid until Qloo accepts it.

## GATE 1B recheck (2026-10-29)

The requested [event developer guide](https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide) again failed retrieval. The [official public repository](https://github.com/qloo/docs-public) and its raw Search/Insights references were reachable. The earlier pinned checkout was also inspected. No credential or live API response was obtained.

- **GET Search**: `query` is text; `take` is 1–100; `types` is an array of categories but its allowed enum values are not supplied by the retrieved reference. The app continues to omit `types` and filters explicit movie response metadata; no guessed enum has been added. `sort_by=match|distance|popularity` concerns Search matching, not movie affinity ranking; it is not used as a substitute for Insights.
- **Empty Search**: [the official Search reference](https://github.com/qloo/docs-public/blob/main/reference/get-search.md) explicitly lists HTTP **404 No results**. GATE 1B now treats only Search 404 as empty choices, with `provenance.httpStatus=404`. Insights 404 and other errors continue to abstain as errors. This is tested with MOCK, not observed live.
- **Identifiers**: [entity documentation](https://github.com/qloo/docs-public/blob/main/docs/entities.md) describes stable GUIDs and [the entities reference](https://github.com/qloo/docs-public/blob/main/reference/get-entities.md) describes UUIDs. The app accepts canonical hyphenated hexadecimal UUID syntax and normalizes case. A valid-looking UUID is insufficient: a current server-signed Search identity is required. Version/variant restrictions not established by these references are not invented.
- **GET Insights**: the [deep dive](https://github.com/qloo/docs-public/blob/main/reference/insights-api-deep-dive.md) and [movie parameter guide](https://github.com/qloo/docs-public/blob/main/reference/available-parameters-by-entity-type.md#movie) support `filter.type=urn:entity:movie`, comma-separated `signal.interests.entities`, comma-separated `filter.results.entities`, and bounded `take`. The exact parameters are asserted through compiled HTTP routes in the isolated integration test.
- **Responses and ranking**: the runtime keeps strict envelopes from the earlier review. Search response structure remains pending live verification; unknown envelopes fail closed. Insights `results.entities` and movie identity fields appear in official examples, but event responses remain unverified. Only returned ordering is compared within one request; no score-based ordering or score normalization is invented.
- **Ambiguity**: the user must explicitly choose a returned identity, even when only one choice exists. MOCK HTTP integration verifies that multiple choices remain unselected and an unconfirmed audit is refused.
- **Errors**: 401/403, 429, 4xx/5xx, network/timeout, malformed data, duplicate/foreign IDs and partial coverage keep safe categories and abstention. New browser request handling prevents arbitrary remote or browser diagnostic text from being displayed.
- **Still pending**: event host verification through an accessible official event guide, direct REST acceptance by organizers, actual Search envelope/type values, live coverage/order behavior, numerical affinity field/scale and explainability. No integration test proves these live contracts.
