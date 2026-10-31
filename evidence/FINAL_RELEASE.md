# TasteProbe — published release

2026-10-30 Colombia. Source and infrastructure published. **Fresh public LIVE user acceptance remains PENDING separate authorization.** No new Qloo/TMDB call was executed by the release agent.

| Criterion | Actual result |
| --- | --- |
| GitHub | PASS — https://github.com/jpablortiz96/tasteprobe, public master, MIT recognized, README/installation/Mermaid present; anonymous HTTP 200 |
| Railway | PASS — https://tasteprobe-production.up.railway.app |
| Deployment | 0a5456be-095c-4cb2-bd9a-f89c741cd89a, SUCCESS; deployed app commit 0592062 |
| Build | PASS — Next.js 16.4.3, webpack, Node 24.22.0, TypeScript and production pages generated; npm reported zero vulnerabilities |
| Runtime | PASS — start:public, 0.0.0.0:8080 from platform PORT, /api/health healthcheck succeeded |
| Replicas | PASS — one configured/running in us-west2; zero crashed/exited; no volumes |
| Public static checks | PASS — home and eight bootstrap assets HTTP 200; known configured secrets absent |
| HTTPS/CSRF | PASS — default TLS validation enabled; exact own-origin requests succeed; foreign-origin Search POST denied 403 before upstream |
| Isolation | PASS — /review, /.env.local and /scripts/tasteprobe-mcp.mjs return 404 |
| Production Redis | PASS — legitimate public tool requests execute real atomic HTTP admission on Railway, then preserve server session state across requests |
| Tool execution | Real HTTP caller invoked propose_evidence_based_revision and received ABSTAINED/NOT_EVALUATED with zero provider budget used. This is not a new LLM/autonomous audit demonstration |
| Public Discover/Audit | PENDING — no new Search or Insights authorized/executed |
| Public artwork/Rescue/Passport LIVE | PENDING as complete recommendation workflows; historical local LIVE acceptance remains separately documented |
| Devpost | Draft READY with real source/demo URLs; NOT submitted. Video is handled separately; no link invented |

## Applied operations and security

Created the authenticated owner's previously nonexistent repository without overwriting another repository. Created a separate tasteprobe Railway project and exactly one service. Reviewed the official IaC plan before applying: only the intended service creation and later its no-sleep setting were applied. No unrelated service, plan, subscription or billing limit was changed. Ordinary resource consumption on the existing plan is metered, not free.

The official railway 3.16.0 SDK is a pinned development dependency (three added packages, zero audit findings); it is not imported by the product client. Windows SDK evaluation needed the actual CLI executable in process.env._ for its minimum-version check. The installed CLI was already 5.71.0; no check was bypassed. Application TypeScript checking excludes infrastructure authoring, which was evaluated by real CLI plan/apply.

Private variables were transferred via stdin with intermediate deploys disabled and compared in memory afterward. Only names/booleans were printed. The same signing key and the actual production Redis namespace were retained. .env.local was neither versioned nor uploaded. IaC stores preserve() declarations only. The optional empty trusted-IP variable was rejected by the setter and intentionally left absent; anonymous callers share the conservative bucket. No unverified forwarded IP is trusted.

Internal limits are 40 Qloo and 200 TMDB, with 30 Qloo planned for judges. They are not official provider balances. The last successful operator read showed internal used=0/remaining=40 and used=0/remaining=200. Public session checks consumed only HTTP admissions and zero Qloo/TMDB calls. Anonymous access and finite limits can constrain concurrent use; no unconditional judge availability is promised.

An optional Railway SSH metadata read timed out. Direct Windows-to-Upstash counter reads were intermittent, including ENOTFOUND, while actual public Railway Redis admissions succeeded before and after. The production proof is the hosted API's enforced EVAL path, not a claim that SSH succeeded. No protection was removed to work around local DNS. Provider-specific public egress/authentication remains for the separately authorized LIVE test.

## Evidence

- final-github-verification.json: initial published application source/README/license checks.
- final-production-variables.json: private transfer names and matching booleans, no values.
- final-deploy-upload.txt and final-build-log.txt: actual upload/build/healthcheck, redacted known values.
- final-runtime-log.txt: actual start and bind.
- final-railway-verification.json: one running replica and no volumes.
- final-public-verification.json: real zero-provider public HTTP/assets/security/session checks.
- final-production-redis.json: hosting admission proof and operator DNS/SSH limitations.

GitHub documentation updates after deployed commit 0592062 do not trigger a restart: this release uses manual CLI uploads, not GitHub autodeploys. The later changes only add verified URLs, release evidence and an operator verification script; product runtime logic is unchanged. Existing Audit sessions are not deliberately invalidated by a documentation-only redeploy.

See docs/PUBLIC_ACCEPTANCE.md for the proposed maximum seven-attempt operator acceptance (Discover two, Audit five; wait at least 61 seconds between modes). Approval, rejection and Passport export add no Qloo calls. Do not run Challenge or retries under that proposed budget. No LIVE result, poster, affinity or autonomous-agent decision was fabricated for release acceptance.
