# GATE 0 — first integration experiment

Status: **BLOCKED_LIVE**. No key, no live requests, no observed Qloo response schema.

## Before spending quota

1. Restore npm registry access, install dependencies, generate a lockfile, and verify type checking/build. The UI can be reviewed locally afterwards.
2. Obtain an individually attributable event-issued key. Confirm the host, quota, expiry, and supported access path with Qloo. Do not use a paid key on the hackathon host without authorization.
3. Read the current [Search reference](https://docs.qloo.com/reference/get-search), [Insights reference](https://docs.qloo.com/reference/insights-api-deep-dive), [entity parameters](https://docs.qloo.com/reference/available-parameters-by-entity-type), and [hackathon guide](https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide). They were inaccessible in this session. The [official kit access policy](https://github.com/qloo/qloo-hackathon-kit/blob/main/docs/API_ACCESS.md) lists the harness as the event surface; resolve whether direct HTTP is allowed. The prepared direct adapter is provisional.
4. If required, install the official harness locally as a development dependency (do not silently change global tools), verify version >=0.1.26 and setup status. Review status output locally for secrets before sharing. Do not use the docs MCP `execute-request` tool.

## Minimal requests and manual review

Budget: at most five small Search calls plus **one** Insights call in the first experiment. No retries, no explainability request, no automatic quota-consuming run. Each invocation records one attempt; do not confuse the per-client safety budget with an account-wide limit. Allow at least one second between manual calls and respect any stricter event limit. Stop immediately on authentication, quota, network, or schema failure.

If current documentation and authorization confirm direct HTTP, the first prepared request is:

```powershell
npm.cmd run smoke:qloo -- --reference-reviewed --execute --request-file experiments/search.request.json
```

It requests `GET /search?query=Arrival`, with `X-Api-Key` read only by Node. No Insights type syntax is assumed for Search; filter and verify actual movie types locally. The sample Search request omits optional parameters until their contract is checked. Check the original response locally through an approved Qloo tool: the saved artifact deliberately includes only allowlisted field names/types, array counts, HTTP status, and request parameter names. Never print raw response headers or a credential. Extend the allowlist only after manual inspection if relevant fields differ.

Resolve these **five input titles**, each with explicit year and movie type confirmation: Arrival (2016), Ex Machina (2014), Interstellar (2014), Blade Runner 2049 (2017), Her (2013). Arrival and Ex Machina are interest signals; the other three form the baseline order. This is an illustrative input, not an AI-generated shortlist or a claim that a divergence will exist. Select among ambiguous matches manually; never auto-accept the first search result. Stop if coverage is insufficient.

After confirming real IDs, create a local JSON request under ignored `evidence/private/`:

- `path`: `/v2/insights`
- `params.filter.type`: `urn:entity:movie`
- `params.signal.interests.entities`: the two confirmed interest UUIDs, comma-separated
- `params.filter.results.entities`: the three confirmed candidate UUIDs, comma-separated
- `params.take`: string `5`

Run the same command using that local file only after the parameter contract is verified. Do not add `feature.explainability` until its support and actual returned content have been demonstrated. Inspect actual score fields and comparability; do not infer or invent a score path, a zero for absent entities, or normalized percentages. Record a redacted, allowlisted summary of actual numeric fields manually once their meaning is understood. The current structural probe deliberately does not calculate ranking or claim viability.

## Falsifier and stop rule

- At least 4/5 titles resolve unambiguously; all signals and at least three comparable candidates must actually be usable.
- At least three comparable affinities for the same candidate set are observed and their field/scale is documented.
- At least one understandable divergence from the illustrative baseline is observed. No prespecified outcome; absence means this case fails that criterion.
- Missing-key abstention and safe error behavior pass locally; real availability/authentication behavior remains unverified.

Only the combined evidence can pass G0. Current result: **NOT_EVALUATED**. A 200 response alone is insufficient. Once authorized access exists, cap investigation of failed coverage/parameters at one hour, then explicitly choose PIVOT or NO_SUBMIT if feasibility cannot be shown. No G1 work is authorized by this protocol.
