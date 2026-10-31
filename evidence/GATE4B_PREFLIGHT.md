# GATE 4B — Release preflight, publication ON HOLD

2026-10-30 (Colombia). Base 312ad00. No repository, cloud project, service or domain created. No push/deployment, plan change, billing-limit change, Qloo/TMDB request or real Redis request executed by Codex.

## Verified observations

- Git started clean, no remote; MIT LICENSE present.
- GitHub and Railway authentication both succeed outside the restricted sandbox. Initial sandbox authentication failures were not treated as invalid actual credentials. No login/token export was performed.
- GitHub owner was obtained from authenticated `gh api user`; owner is jpablortiz96. `repos/<authenticated-owner>/tasteprobe` returned 404. No existing repository was overwritten and no publication URL exists yet.
- Railway CLI is 5.71.0. Read-only billing preflight could not establish zero incremental cost. Private account/billing details are not published. This gate has no separate authorization for additional monetary charges or changing workspace-wide limits. Existing services/plan were not modified. A remaining-credit field is not treated as a guarantee of free operation.
- At initial preflight Qloo and both TMDB credential names were present. Stable signing secret, Redis URL/token, namespace, public deployment/origin and total quota limits were missing. Values were never printed. The operator is preparing Redis privately; persistence, eviction-off and cost status still need confirmation.
- Operator delegated choice of internal limits: 40 Qloo / 200 TMDB; reserve 30 Qloo for judges and 10 for acceptance/contingency. These are internal authorizations, not verified provider balance. Public LIVE tests still need a separate stage-6 authorization.

## Reproduced blocking defect and minimal correction

Both Redis CLI scripts previously called publicPolicy(), requiring a real HTTPS origin before Railway could assign one. A new regression invoked the actual status CLI with an injected MOCK Redis response and no public domain: it failed with exit 1 before the correction. It now passes with exit 0 and correct remaining totals.

Quota validation is now shared by quotaPolicy(); publicPolicy() still requires the exact canonical HTTPS origin before enabling any public request/launcher. No origin, signing, quota or CSRF protection was removed. No product feature/ranking/UI was changed.

The real Redis verifier was extended to cover independent provider budgets, exhausted totals, client/operation limits, shared halt while unused allowance remains, two-process concurrency and TTL metadata in random TEST namespaces. It checks storage/auth before concurrency and uses 27 Redis requests, no provider requests. The outage negative test injects transport failure; it does not shut down a real database. **No real-store success is claimed.**

railway.json prepares one replica, start:public, /api/health liveness, no sleep and no deployment overlap, using the official config schema. Build explicitly includes dev dependencies for TypeScript. This file is not proof that a service was deployed or that billing is approved.

## Local quality

- 117 unit/server tests PASS (116 preserved plus the domain-free Redis CLI regression).
- Seven MOCK HTTP E2E PASS, including public HTTPS/quota denial and production /review 404.
- Typecheck/build PASS. Isolated build left the operator's active BUILD_ID unchanged and copied no environment files.
- npm audit: zero vulnerabilities.
- History scan: five reachable commits / 366 blobs, no pattern/exact configured-secret findings. Current new files receive the source scan separately. Private environment files stay ignored/untracked.

See gate4b-tests.txt, gate4b-typecheck.txt, gate4b-build.txt, gate4b-integration.txt, gate4b-audit.json and gate4b-history-review.json. All HTTP integration outcomes are synthetic; none establishes public LIVE acceptance.

## Required before release can proceed

1. Operator confirms Redis persistence, eviction disabled and a cost-compatible plan, then supplies credentials privately. Apply the delegated internal totals without disclosing secrets.
2. Run the real verifier and production quota status. Confirm provider account allowance supports the reserved judge budget; do not infer it from our counter configuration.
3. Resolve Railway cost authorization without changing existing services or workspace limits implicitly.
4. Only after those conditions pass create/push the authenticated owner's tasteprobe repository, then create a new Railway project/service/domain and configure private variables. Verify real public URLs, replicas, HTTPS/CSRF, health and /review before requesting a new LIVE budget.

Discover public, Audit public, TMDB public, Rescue/Passport public, actual screenshots and Devpost final URLs remain PENDING. Existing local/LIVE historical evidence is preserved, not reused as public acceptance. Devpost has not been submitted.
