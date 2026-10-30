# GATE 2H.2 — Audit acceptance and real Codex MCP integration

2026-10-30. **AT_RISK: matching Reject export and budget-control closure pending. Correct-case Audit and real Codex MCP are verified.** No public deployment or remote repository. Discover, Qloo REST, TMDB, signing and API security were not rebuilt or modified.

## Real Audit observation and correction

Operator Chrome showed four confirmed identities and a real Insights response: HTTP 200, request `4f2f8e91-6032-4124-ad3a-c15e2c48d5f9`, retrieved 20:47:08Z, coverage 2/3. The identity selected for Her was **2024**, different from the requested Her (2013). Interstellar (2014) and Blade Runner 2049 (2017) were returned. No shifts were inferred with partial coverage; Rescue actually returned ABSTAINED. This is not an application failure caused by a disabled Evaluate button, nor evidence that Her (2013) lacks coverage.

The downloaded `tasteprobe-report.json` was inspected locally without printing secrets/proofs. It matches the reported request ID, actual candidate IDs/request filter, Arrival (2016) signal and partial result. Full observed affinities are 0.8368126484416831 for Interstellar and 0.9132748362394222 for Blade Runner 2049; Her (2024) is unavailable/null. No probability is claimed. The file is valid partial evidence, not acceptance of the intended case. See `gate2h2-export-report.json`.

The correct-case export was subsequently inspected: request e824d996-c7ce-4968-bd2b-337f83edad4b, HTTP 200, coverage 3/3, Her (2013), correct candidate IDs and Arrival (2016). Returned order: Blade Runner 2049, Interstellar, Her. Exact affinities: 0.9132748362394222, 0.8368126484416831, 0.8013815822511426. Rescue proposed that order and the operator exported APPROVED, appliedAutomatically=false. User confirmed desktop/mobile usability. No Codex Qloo request was made.

The supplied rejection candidate tasteprobe-evidence-passport (1).json is from a different later request: 22475f10-c29b-4072-a65d-f47847faaa74 at 22:19:28Z. It contains Her (2024), coverage 2/3, ABSTAINED and PENDING, not a rejection of the accepted correct case. No valid REJECTED file has yet been inspected; the operator subsequently confirmed the correct tab is no longer available, so Reject remains pending without more provider calls.

## Budget attribution

Authorizations discussed were 5, then 4, then 1 attempts (aggregate 10). The three distinct operator sessions now evidenced each contain four Search plus one Insights: at least 15 costed operations, with earlier attribution also unknown. Therefore manual budget compliance is NOT established and no remaining allowance is inferred. This discrepancy is retained in gate2h2-live.json, not hidden by passing tests. Stop all Qloo queries. Codex made zero Qloo calls; only local decision/export on already-loaded evidence remains.


## Arrival image

The existing TMDB capture has two Arrival (2016) rows. Two bounded TMDB detail requests confirmed both are movies, both title and original title are Arrival, and both have posters. They have different IMDb IDs: tt2543164 and tt5433758. The current normalized Qloo identity has no trusted external-ID binding, so choosing by title/year/popularity would remain ambiguous. **Fallback retained**, no hardcoded poster or guessed crosswalk. See `gate2h2-arrival-image.json`. No Qloo call was used for image investigation.

## MCP and actual agent evidence

Legacy `agent-tool.mjs` is a custom stdin JSON/local HTTP bridge, not MCP. New `lib/mcp/adapter.mjs` plus `scripts/tasteprobe-mcp.mjs` implement bounded newline JSON-RPC MCP stdio, initialize/initialized, tools/list, tools/call and ping. They reuse the four existing tools and server-held session evidence. No provider credentials, arbitrary destinations, shell or new framework/dependency are introduced. Default allowance is zero; high-cost operations are blocked before dispatch. Failed attempts never refund allowance and backend errors stop the connection.

Protocol verifier passed discovery, blocked Search at zero allowance and structured real-tool abstention. Separately, a **real authenticated Codex CLI 0.165.0 session** connected using a validated ephemeral config, discovered four tools, selected `propose_evidence_based_revision({})`, invoked it once and interpreted ABSTAINED with NOT_EVALUATED/null evaluation. Client item.started/item.completed events correspond to an actual backend tool event at 20:49:37Z. Connection budget: 0/0, one step. No private reasoning, raw stderr, session token or API key is recorded. `gate2h2-codex-mcp.json` is actual client evidence, not a direct HTTP script presented as agent behavior.

Codex's existing account login was used in the approved external process; the restricted Windows process could not see the login. No OpenAI API key was assumed from subscription status. No global MCP config was modified. Full autonomous LIVE Qloo evaluation is not claimed; the demonstrated agent operation is missing-evidence abstention. Reproduce and judge explanation: `docs/CONNECT_AN_AI_AGENT.md`.

## Quality and session preservation

The operator's active Next server and signing state were left running. `npm run build` passed in a source-only snapshot under ignored `out/gate2h2-validation`, with no environment files or provider credentials copied. The active `.next/BUILD_ID` remained unchanged; no restart invalidated confirmations. Existing six MOCK HTTP E2E passed. All prior 101 tests remain; 105/105 pass with four additional MCP protocol/budget tests. Typecheck/audit and configured-secret scans are recorded in gate2h2 artifacts. No Next API/backend change was required.

Real Chrome control remains unavailable to Codex. Operator-provided text and downloaded files are labeled as such; no screenshot or desktop/mobile PASS is fabricated. Git remains on ca5481f with accumulated uncommitted changes. Do not create a remote, push or deploy until actual acceptance closes; then prepare the reviewed local checkpoint and delivery materials.

Final operator state: correct 3/3 tab is no longer available; no matching REJECTED export was recovered. No further Qloo queries, edited JSON, commit, remote or deployment is performed. Local checkpoint review manifest is prepared but not staged/committed.
