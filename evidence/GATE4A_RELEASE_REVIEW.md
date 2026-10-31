# GATE 4A — Production hardening

2026-10-30. **AT_RISK / NOT PRODUCTION_READY.** Started clean at 8edf1e8. No feature/UI redesign, new dependency, Qloo LIVE request, TMDB request, real Redis request, remote creation, push or deployment. Existing functional Chrome evidence is preserved; no new browser/LIVE PASS is claimed.

## Actual blockers and changes

| Gate 3 finding | Implemented now | Still pending |
| --- | --- | --- |
| Ephemeral identity signing | Server-only TASTEPROBE_SIGNING_SECRET, strict 64 hex; same key verifies across independent service instances. HMAC scoped to movie identity, signed fields unchanged, 30-minute TTL retained. Public launcher refuses missing key. | Operator generates/configures private key. First rollout/rotation invalidates old confirmations. |
| Memory-only provider consumption | Shared Redis REST adapter: one atomic EVAL check/increment before each actual provider attempt. Independent Qloo/TMDB totals, minute/client/operation caps, no refunds/retries, durable halt after 401/403/429. | No endpoint/token configured. Real Redis/Lua atomicity/TTL/storage behavior unverified. Public release blocked until configured/tested. |
| Anonymous API abuse | Every cost-capable POST passes shared HTTP admission. Provider wrappers require request context and reserve before transport. Client identifiers are HMACs; no trusted header means one conservative anonymous bucket. No admin/reset operation exposed. | Verify trusted ingress/header overwrite, edge abuse policy and fair judge access. Shared caps protect provider spending, not guaranteed service availability under attack. |
| Public HTTPS/reverse proxy mismatch | Exact configured HTTPS Origin and Host; internal HTTP URL reconstruction accepted only for that configured authority. Cross-site, other Host/origin/port and forwarded spoofing rejected. Unconfigured external hosts rejected. | Actual Railway domain/proxy acceptance not performed. |
| Local start binding | start:public validates config, binds 0.0.0.0 and honors PORT. Local start remains 127.0.0.1. Node 24 range recorded in package/lockfile. | Actual cloud build/start/HTTPS acceptance pending. |
| Session availability | Expired tool sessions reclaimed; 20 concurrent sessions instead of a lifetime cap of 20. Existing per-session 12 requests/16 steps/20-minute expiry retained. | Tool evaluation/proposal state remains process-local. Single Railway replica required. Vercel/multi-replica full workflow unsupported unchanged. |

Native-fetch Redis REST contract and Lua EVAL were checked against official Upstash/Redis docs. No SDK/framework was added. Keys share a Redis hash tag; provider totals have no expiry; short-window TTL is 60 seconds. Configured totals are operator allowances, never an assertion of official provider quota. All replicas must use the same database/namespace/limits. Redis eviction/reset or changing namespace can erase the intended ledger: disable eviction and require explicit operator review before any reset/limit change.

## Regressions and diagnostic evidence

Cross-instance tests use fictional identities and a random TEST secret: instance A signs, B verifies; altered proof/id, unconfirmed identity, other key and expired proof all reject before fetch. No secret/proof is stored in evidence.

The new compiled public HTTP test initially exposed a real diagnostic defect: lib/qloo/client.mjs marked every QlooError inside fetchImpl as upstreamAttempted=true, including shared quota denial before transport. It failed expecting false. The catch now preserves pre-transport denial flags, and the regression passes; response/contract failures still report an attempted upstream operation. A failed halt-store write after an actual response retains attempted=true.

Test harness corrections were separate: matched the existing MOCK credential sentinel, copied the agent bridge into the isolated snapshot, and used native HTTP because Node 24 fetch ignores Host overrides (verified against a local echo server). No origin rule was relaxed to make the test pass.

The old session-cap test is retained with its count updated to assert 20 active sessions after expired state is reclaimed; a new regression verifies expired sessions no longer permanently exhaust access. No previous test was deleted.

## Actual verification

| Check | Result | Artifact |
| --- | --- | --- |
| Unit/server-render suite | 116 PASS, previous 106 retained; ten added hardening tests | gate4a-tests.txt |
| HTTP E2E | 7 PASS: previous six plus public proxy/quota flow; isolated MOCK only | gate4a-integration.txt, gate4a-public-http.json |
| Public HTTP observations | Foreign origin 403; wrong Host 403; Search 200; signed one-favorite Discover 200 with input excluded; next Search 429, upstreamAttempted=false, Retry-After 60 | gate4a-public-http.json |
| Typecheck | Exit 0 | gate4a-typecheck.txt |
| Build | Exit 0, isolated source snapshot; operator active BUILD_ID unchanged, no restart, no environment files copied | gate4a-build.txt, gate4a-isolated-build.json |
| npm audit | Exit 0; zero vulnerabilities; registry permission used, no --force | gate4a-audit.json |
| Production /review | 404 even with synthetic flag | Seven HTTP tests / public artifact |
| History | Four existing commits / 319 blobs, no pattern or configured-secret match findings | gate4a-history-review.json |
| Source and bundles | .env.local ignored/untracked; source pattern/exact-key scan and 58 client assets without configured secrets | gate4a-secret-review.json, gate4a-security-review.json |
| Shared quotas | Two independent adapter instances tested against one atomic REST-contract emulator; total/client/operation caps, remaining counters, halt, storage failure and malformed results tested | production-hardening.test.mjs |

**Shared quotas are OFFLINE_CONTRACT_PASS, not REAL_REDIS_PASS.** The emulator does not execute Lua or establish real TTL/availability/durability. Docker CLI exists but no running daemon/local Redis is available; no infrastructure or transient database was provisioned. Real storage validation is a release prerequisite.

An operator-only verifier, scripts/verify-shared-quota.mjs, is prepared for that prerequisite: two real Node processes, eight reservations in a random TEST namespace with a cap of three, remaining-count and total/minute TTL checks (eleven Redis requests, zero provider requests). Its missing-configuration path was executed and stopped before network. Its real-store success path has NOT been run and must not be cited as completed evidence.

Security scope: exact currently configured provider values plus known token/private-key patterns, not a guarantee against all unknown credentials. New signing/Redis secrets are absent, never invented. Node-only signing/quota imports are confined to server modules/routes; no new client secret variable exists. Git history scan refers to pre-checkpoint reachable refs; new staged files receive the same source review. No provider headers, proofs or private model reasoning are logged.

## Readiness and manual actions

1. Configure operator-owned durable Redis with eviction disabled and private write token; verify EVAL across two processes in a separate TEST namespace without any provider fetch. Configure stable signing secret, real HTTPS origin and explicitly approved totals.
2. Verify actual provider balance/reserved judge allowance and shared remaining counters with check-public-quota.mjs. Earlier unknown operator consumption is not silently reconciled and no new allowance is assumed.
3. Use one Railway replica, complete ingress/edge protection and verify actual Host/Origin behavior. Anonymous fallback is intentionally shared and can limit concurrent judges; do not promise fair access until ingress policy is validated.
4. After explicit remote/push/deploy authorization, follow docs/DEPLOYMENT.md. CLI help was checked locally, not authenticated or executed against cloud resources. Configure secrets privately, never list raw variables into evidence.
5. Obtain a separate LIVE budget before actual public browser acceptance. Preserve existing Qloo/TMDB separation, ranking, human identity confirmation, Rescue and Passport contracts.

README, .env.example and deployment guide describe the actual configuration. No public URL/repository is fabricated. Source release preparation is reviewable; no PRODUCTION_READY or judge-availability claim is made. A secure local checkpoint may be created after final checks, with its hash reported separately.
