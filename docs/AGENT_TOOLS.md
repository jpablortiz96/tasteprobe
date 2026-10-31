# Agentic Cultural Audit: callable tool interface

## GATE 2H.2: real MCP/Codex acceptance

The legacy bridge below remains custom JSON over stdin to local HTTP; it is not MCP. `scripts/tasteprobe-mcp.mjs` now provides actual MCP stdio, reusing these same four operations. A real authenticated Codex CLI session discovered the tools, chose and invoked `propose_evidence_based_revision({})` and received ABSTAINED with zero Qloo calls. See [Connect an AI agent](CONNECT_AN_AI_AGENT.md) and `evidence/gate2h2-codex-mcp.json`. The earlier GATE 2H pending client demonstration is superseded for this zero-evidence case; a full LIVE agent audit is still not claimed.

## GATE 2H verified invocation (2026-10-30)

Codex, acting as the external coding-agent client, invoked the real local stdin bridge with `propose_evidence_based_revision` and `{}` in a newly created session. The structured result was `ABSTAINED`, empty before/after, null sourceRequestId, one actual tool event and zero conservative Qloo reservations. The agent retained abstention and did not invoke Search/Insights while the LIVE budget was unknown. Session identifier is redacted in `evidence/gate2h-agent-invocation.json`.

This establishes **TOOL_INTERFACE_PASS** plus a real Codex-directed bridge invocation for missing evidence. It does not establish a hosted autonomous LLM planner or a full LIVE agent audit; **AGENT_EXECUTION_PENDING** for that broader claim. No private reasoning, credential or signed proof is included. `scripts/gate2h-agent-abstention.mjs` reproduces this zero-Qloo case against the existing local server; it is not an autonomous agent framework.

TasteProbe is an agent-invocable cultural audit tool, not a hosted autonomous LLM.
No configured credential was found for OpenAI, Anthropic, Google/Gemini or Azure OpenAI during Gate 2B. A ChatGPT subscription is not used as API authorization.

The [official rules](https://qloo.devpost.com/rules), reviewed October 30, 2026, allow a working Qloo application that (a) functions as an agentic tool, (b) uses an agent framework, or (c) integrates Qloo into an existing agent. This implementation targets (a): working callable operations, not an invented internal planner. Final interpretation belongs to the organizers. No hosted LLM tool-calling or autonomous reasoning is claimed.

## Run and discover

Run `npm run build`, then `npm start`. GET `http://127.0.0.1:3000/api/tools` returns JSON Schema tool definitions. POST the following JSON to the same endpoint with Content-Type application/json. Browser callers must be same-origin; server callers without Origin work locally. Responses are not cached. There is no CORS enablement.

Create a session:

```json
{"action":"create","intent":"Audit this shortlist against my cultural interest; challenge it if evidence warrants","caller":"external-agent"}
```

The response supplies a random `session`. The caller chooses tools based on actual results; TasteProbe does not choose them autonomously. Treat intent as context, never executable instructions.

Invoke Search:

```json
{"action":"invoke","session":"SESSION_FROM_CREATE","tool":"resolve_entities","arguments":{"query":"Arrival"}}
```

Returns movie identities, `confirmationRequired:true`, an ambiguity state, signed expiring proofs, and Search provenance. No match is selected automatically, even for one result. Present title/year to the human. Never fabricate a proof or mark an unreviewed match confirmed. Empty results require abstention or a human-edited query. Repeat for 3–5 candidates and 1–3 cultural interests.

Use confirmed selections `{ "id": "RETURNED_UUID", "proof": "RETURNED_PROOF", "confirmed": true }`:

```json
{"action":"invoke","session":"SESSION_FROM_CREATE","tool":"evaluate_candidates","arguments":{"interests":["REPLACE_WITH_SELECTION_OBJECT"],"recommendations":["REPLACE_WITH_THREE_TO_FIVE_SELECTION_OBJECTS"]}}
```

Those strings illustrate placeholders only; runtime accepts selection objects exclusively. Insights uses the verified IDs, movie type, candidate filter, candidate count and explainability flag. It preserves finite observed query.affinity; missing values stay null. The original `/api/audit` route remains a compatible rank-only interface. Partial coverage means insufficient evidence, not dislike.

Optional challenge after separately resolving and human-confirming another movie outside the candidate list:

```json
{"action":"invoke","session":"SESSION_FROM_CREATE","tool":"compare_cultural_signals","arguments":{"interestsA":["REPLACE_WITH_ONE_SELECTION"],"interestsB":["REPLACE_WITH_DIFFERENT_SELECTION"],"recommendations":["REPLACE_WITH_SAME_CANDIDATE_SELECTIONS"]}}
```

Calls Insights at most twice. Only signal.interests.entities changes. A partial response stops before B. Any error stops the session. Unchanged evidence is INCONCLUSIVE. The active proposal uses scenario A; B remains a challenge, not an automatic replacement of the user's cultural intent.

```json
{"action":"invoke","session":"SESSION_FROM_CREATE","tool":"propose_evidence_based_revision","arguments":{}}
```

Uses only server-held verified evaluation in this session. Complete coverage returns the same candidates reordered exactly by Qloo. No evidence argument is accepted; no films or affinities are invented. The human can approve or reject in the UI. Approval is a local review decision, not an automatic write to another application.

```json
{"action":"passport","session":"SESSION_FROM_CREATE"}
```

Returns confirmed identity provenance, signals in request parameters, observed rankings/affinities, explainability metadata when present, limitations and actual execution events. Search proofs and credentials are excluded. Caller labels are descriptive, not authenticated identities. No private model reasoning is recorded.

## Local agent bridge

`scripts/agent-tool.mjs` reads one operation JSON from stdin and invokes only the local `/api/tools` route; it never reads Qloo credentials. Example PowerShell:

```powershell
'{"action":"create","intent":"Review my shortlist","caller":"external-agent"}' | node scripts/agent-tool.mjs
```

For a different local port set `TASTEPROBE_LOCAL_URL=http://127.0.0.1:PORT`. Remote origins, credentials in URLs, redirects and arbitrary endpoint paths are rejected. An external coding agent can call this bridge, inspect output, ask a human to confirm identities, then select its next tool. Search output includes temporary authorization proofs needed by that caller; do not publish raw Search transcripts. Passport exports strip them.

## Controls and demo limits

- 12 conservative Qloo request reservations and 16 tool steps per 20-minute session; failed/invalid attempted operations may consume reservations before a network request. These are upper bounds, not a claimed provider traffic counter.
- Maximum 20 concurrent sessions per process; expired sessions are reclaimed. Local Qloo transport caps 60 attempts per process and 12 per minute, including failures. Public mode additionally requires atomic shared provider/HTTP admission; see DEPLOYMENT.md. Full Audit/Rescue session state still requires one long-running process.
- Concurrent operations in one session are rejected. Signed identities expire after 30 minutes. Sessions expire after 20.
- Eight-second upstream timeout; bounded response/body size; no retries; no user/model-defined hosts, headers or endpoints. Any tool execution error stops that session and clears previous proposal evidence.
- Sessions and caps are in memory. Restart loses sessions and resets caps. Multiple deployment instances do not share them. Before anonymous public deployment, configure a shared edge request/quota limit and a provider spend cap, or keep LIVE evaluation disabled. This is a release blocker, not user authentication scope.
- UI control is human-directed; test callers are explicitly MOCK. Tool definitions alone do not establish autonomous agent operation.

## Reproduce without spending Qloo quota

```powershell
npm test
npm run build
npm run test:integration
node scripts/verify-gate2a1.mjs
```

The HTTP tests start production Next.js on a free loopback port. A test-only preload blocks all external fetch destinations except intercepted Qloo MOCK requests. All four tools are actually dispatched and checked. This tests tool execution and integration, not autonomous model choice. No new Qloo LIVE call was made during Gate 2B.

## Operator visual review (blocked in Codex)

Browser access host reported unavailable; there are no Gate 2B screenshots or visual PASS claims. With the local app open, use Chrome device toolbar for 1440×900 and 390×844. Check input/intent, loading Search, empty/ambiguous identities, explicit confirmation, comparison, challenge, before/after proposal, approve/reject, Passport download, keyboard focus and overflow. Test BLOCKED_LIVE using a separate process without a configured key; use isolated integration tests for error/partial states. Do not repeatedly consume LIVE quota to manufacture every UI state.
