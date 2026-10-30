# TasteProbe

Discover new movies from films you love, or audit another AI's shortlist with verifiable cultural evidence.

**Qloo provides discovery, ranking and observed affinity. TMDB provides optional artwork.** TasteProbe keeps identity confirmation, cultural evidence, visual metadata and human review separate. Affinity is never presented as a probability of satisfaction.

## Two product modes

- **Discover for me:** enter one to three favorite films, search and confirm their identities, discover new movies, inspect explanations and download an Evidence Passport.
- **Audit another AI:** supply favorites and an original shortlist, confirm every identity, compare the actual Qloo order and observed affinities, then use Rescue My Recommendations to propose a verified reordering. Approve/Reject records a local human decision; it never overwrites the source evidence automatically.

Missing, ambiguous or incomplete evidence produces abstention. Movies or scores are not invented. Historical/synthetic demonstrations are labeled and never substituted for a current LIVE response.

## Run locally

Use Node **24.13+** and npm. On Windows PowerShell use npm.cmd/codex.cmd if script execution policy blocks their .ps1 wrappers.

~~~powershell
npm.cmd ci
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd start
~~~

Open http://127.0.0.1:3000. Both dev/start bind to loopback. Do not rebuild or restart during an active acceptance session: in-memory sessions and signed confirmations expire on restart.

Configure ignored .env.local manually, never through chat or browser:

- QLOO_API_KEY: authorized Qloo event credential; official host https://hackathon.api.qloo.com.
- TMDB_READ_ACCESS_TOKEN preferred; TMDB_API_KEY is a server-only fallback.

Do not prefix credentials with NEXT_PUBLIC. Without Qloo access the UI shows BLOCKED_LIVE; missing TMDB credentials or ambiguous artwork retains the illustrative fallback. Restart after configuring credentials, before starting the acceptance flow. A configured server is not proof of LIVE access.

## Connect an AI agent

TasteProbe has an actual local **MCP stdio** adapter and four tools: resolve_entities, evaluate_candidates, compare_cultural_signals, propose_evidence_based_revision. The default MCP Qloo allowance is **zero**. No additional LLM or agent framework is embedded in the app.

~~~powershell
node scripts/verify-mcp-stdio.mjs
node scripts/codex-mcp-demo.mjs
~~~

The first command checks MCP protocol/tool execution, not model behavior. The second connects an actual authenticated Codex CLI session using ephemeral configuration and demonstrates model-selected, structured abstention without Qloo calls. An actual Codex session was verified; raw private reasoning is not recorded. See [Connect an AI agent](docs/CONNECT_AN_AI_AGENT.md) for exact prerequisites, evidence and limitations. The older stdin/HTTP bridge remains available; it is not misrepresented as MCP.

## Verification

~~~powershell
npm.cmd test
npm.cmd run typecheck
npm.cmd run build
npm.cmd run test:integration
npm.cmd audit
node --env-file=.env.local scripts/verify-secrets.mjs gate2h2
~~~

Current checks preserve the original suites: **105 tests, six isolated MOCK HTTP E2E**, typecheck/build and audit pass. Gate 2H.2 built a source-only snapshot without touching the operator's active Next build. Tests do not substitute for real-browser acceptance; [EVIDENCE.md](EVIDENCE.md) and [GATE 2H.2 review](evidence/GATE2H2_REVIEW.md) distinguish operator observations, downloaded LIVE exports, protocol tests and actual Codex client events.

[TMDB integration](docs/TMDB_INTEGRATION.md) documents identity matching, actual provider checks and required attribution. Arrival (2016) currently retains fallback because TMDB has two same-title/year/original-title movies and no trusted Qloo external-ID binding is available. No poster is chosen by popularity or a guessed URL.

For no-API UI review, set TASTEPROBE_VISUAL_REVIEW=synthetic and run dev on a separate loopback port, then open /review. It remains disabled in production. Cultural values stay SYNTHETIC / NOT LIVE; an optional dated artwork sample may load from TMDB CDN. The operator's real-browser and download checks remain the acceptance criterion.

## Security and evidence boundaries

- Qloo transport is server-only, fixed host/endpoints, eight-second timeout, bounded response, no redirects or automatic retries. Signed movie identities require human confirmation. Browser requests use relative same-origin paths with strict origin/port validation.
- Local Qloo cap: 12 attempts/minute and 60/process, including failures. Tool sessions: 12 conservative reservations, 16 steps, 20 minutes. Identity proofs expire after 30 minutes or restart. MCP additionally enforces its own explicit allowance before dispatch.
- TMDB is independently bounded/cache-backed and cannot change Qloo ranking or affinity. Credentials and raw provider headers are not returned to the browser or Passport.
- Reports preserve source, request reference, retrieval date, candidate coverage, observed scores, limitations and actual tool events. They exclude authorization proofs and private model reasoning.
- Operator LIVE budgets are explicit and independent of technical caps. Do not replay historical smoke scripts or A/B experiments without fresh authorization.

No public deployment, remote repository or push is performed by these gates. Before publication, complete final browser acceptance, choose an appropriate source-code license, review provider attribution/rights, and address shared public quotas and stable proof/session state for multiple instances. Historical gates, failed probes and offline evidence verifiers remain in [EVIDENCE.md](EVIDENCE.md) and the evidence directory.
