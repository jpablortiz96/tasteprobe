# Qloo REST contract review — GATE 1A

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
