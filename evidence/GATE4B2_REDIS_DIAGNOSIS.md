# GATE 4B.2 — Redis real diagnosis

2026-10-30 Colombia. **REDIS_REAL_PASS (operational preflight). Public deployment remains on hold.** Base 011c454. No Qloo or TMDB request, public service creation, deployment, billing/plan change or production Redis namespace mutation.

## Exact causes, separated by layer

1. **Environment/configuration, before network:** Upstash URL/token existed in .env.local but the standalone Node scripts did not load that file. Even with --env-file, four additional required values were absent: TASTEPROBE_SIGNING_SECRET, TASTEPROBE_QUOTA_NAMESPACE, TASTEPROBE_QLOO_TOTAL_LIMIT and TASTEPROBE_TMDB_TOTAL_LIMIT. quotaPolicy() therefore threw BLOCKED_LIVE before fetching Redis. Both scripts reproduced exit 1 with and without explicit env-file loading. No inherited process override existed. URL format was valid. Artifact: gate4b2-initial-diagnosis.json.
2. **Diagnostic suppression:** quotaPolicy aggregated failure into BLOCKED_LIVE, shared-quota caught every transport/HTTP/command error into the same category, and both CLI catch blocks printed only a generic sentence. This prevented distinguishing configuration from credentials, connectivity or EVAL.
3. **Restricted sandbox transport:** after valid configuration, the sandbox MGET still failed without HTTP. An allowlisted diagnostic identified EACCES. The approved external Node process succeeded against the same configuration, without changing TLS validation or credentials. This was a sandbox network-access issue, not an Upstash authentication failure. Artifact: gate4b2-sandbox-transport.json.

No real authentication, permission, EVAL, namespace syntax or quota-contract failure occurred in the successful external run.

## Minimal corrections and private setup

- Added a quota-only .env.local loader for the two operator CLI scripts. It never silently overrides process variables: mismatches stop with ENV_CONFLICT and variable names only. The preflight worker inherits its explicitly scoped namespace instead of reloading the production namespace.
- Added redacted QUOTA_CONFIGURATION field issues and Redis HTTP/transport/command categories. No message/body/header/URL/token is serialized. Public HTTP failures remain generic BLOCKED_LIVE and do not misattribute Redis HTTP to Qloo; regression tests verify this boundary.
- Filled only the four absent local fields. Generated a cryptographic 32-byte signing secret directly into the ignored existing .env.local, without printing it or changing existing credentials. Namespace is local server configuration; internal limits are the already delegated 40 Qloo / 200 TMDB. They are not official quota claims. No new LIVE request authorization is inferred.
- Strengthened the verifier's worker scope to preflight namespaces, retaining the same atomic Lua reservation, caps, expiry checks, no-refund/no-retry behavior and fail-closed handling.

The signing secret and credentials remain untracked. No environment backup or secret-bearing output was created. gate4b2-private-config.json contains variable names and setup metadata only, no secret material.

## Actual real Redis results

| Check | Observed result |
| --- | --- |
| Real REST MGET / credentials | PASS, external process; automatic env load, zero conflicts. gate4b2-real-status.json |
| Real EVAL and concurrency | Two independent Node processes; 8 concurrent reservations, exactly 3 allowed and 5 denied |
| Global total exhausted | used=3, remaining=0; excess reservations denied |
| Independent TMDB allowance | Two allowed, third denied, independently of exhausted Qloo total |
| Client/operation budgets | Search operation limit and then aggregate client limit denied with other global allowance remaining |
| Shared halt | A separate adapter denied after an actual Redis halt flag, with unused TMDB allowance |
| Expiration metadata | Total TTL=-1; minute TTL=60 |
| Storage outage | Explicitly injected transport failure denied; actual sandbox EACCES also denied. No database was shut down |
| Production namespace | Not read or written by these preflight-only runs |

Successful real Redis commands: **28** (one status MGET plus 27 in the verifier). Two separate sandbox MGET transport attempts received no HTTP and failed closed; the latter exposed EACCES. No automatic retry exists. The diagnostic reruns were explicit and scoped. Qloo/TMDB calls: **0**.

All real writes used the random namespace recorded in gate4b2-real-redis.json and its -ip suffix. Counters/halt flags were retained for review, not deleted/reset. The production demo counters were untouched. TTL metadata does not independently prove the database's persistence/eviction settings or provider-account balance: those require console/operator confirmation. The halt test is controlled Redis state, not a new provider-auth failure.

## Railway format correction

The earlier root railway.json preparation was obsolete for a **new** service. Official current docs state new services cannot opt into Config as Code; existing legacy services stop reading it on 2026-12-01. Current generally available authoring is .railway/railway.ts (railway/iac); Python/Go are beta. CLI 5.71.0 config init/migrate/plan help was checked.

Archived the root JSON as docs/railway-legacy-reference.json and corrected docs/DEPLOYMENT.md. It is a reference only, not an applied new-service configuration. No SDK/dependency, project/service, migration/cutover, plan/apply or deployment was performed. Future current-format configuration must be reviewed against the intended new project after cost approval; existing services must remain unchanged.

References: https://docs.railway.com/config-as-code and https://docs.railway.com/infrastructure-as-code .

## Quality, Git and next step

121 tests PASS (117 retained plus four diagnostic tests), seven MOCK HTTP E2E PASS, typecheck/build PASS, audit zero vulnerabilities. Isolated build preserved the active BUILD_ID and copied no environment files. New tests cover automatic loading, process conflicts, missing fields, redacted auth/permission/command/network/timeout categories and safe public error projection. Synthetic test transport is not the basis of REDIS_REAL_PASS; the separately captured actual Redis run is.

History review: six reachable commits / 386 blobs without pattern/exact configured-secret findings. Source and client assets are checked again against all currently configured secrets, including the new signing and Redis keys. Scope remains limited to known patterns/current exact values, not every possible unknown credential.

Next: confirm database persistence/eviction policy and hosting billing conditions, then prepare the new Railway service using current configuration tooling. No public service/deploy is authorized while billing remains unresolved. Public LIVE browser tests need their separate authorization. No new public URL, GitHub repository or Devpost submission is claimed here. Final checkpoint hash is reported after local commit.
