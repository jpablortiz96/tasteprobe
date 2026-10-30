# Deployment preparation — release candidate, NOT publicly released

## Decision

Prefer a **single long-running Railway replica** for the current architecture. This is a proposed topology, not a tested cloud deployment. Vercel supports Next.js, but independent serverless instances cannot safely share the current in-memory confirmations, tool sessions and counters. Do not deploy this version unchanged across functions/replicas.

The current product remains functional on local Chrome. Public LIVE release is **BLOCKED** until the controls below are verified. A successful build or /api/health response does not prove provider access or judge availability.

## Runtime and build

Use Node 24.13+ and the committed package-lock.json. Build with `npm ci` then `npm run build`. No secret is needed at build time. Set credentials only in the hosting runtime secret store; never upload .env.local.

The existing `npm start` deliberately binds 127.0.0.1 for local use. For an approved external single-process deployment, the equivalent start command is:

```sh
node node_modules/next/dist/bin/next start --hostname 0.0.0.0 --port "$PORT"
```

This command is a deployment recipe; it has not been run against a public service. Keep one replica and disable scaling until session/signing state is externalized. A process restart invalidates proofs/sessions and resets memory counters. Do not change start behavior for local acceptance merely to prepare hosting.

## Environment actually consumed by the application

| Variable | Runtime behavior |
| --- | --- |
| QLOO_API_KEY | Server-only authorized event key. Missing means BLOCKED_LIVE. |
| QLOO_BASE_URL | Must be https://hackathon.api.qloo.com; arbitrary hosts rejected. |
| TMDB_READ_ACCESS_TOKEN | Preferred optional server-only Bearer authentication. |
| TMDB_API_KEY | Optional server-only fallback when Bearer token is absent. |
| NODE_ENV | production for the release; /review returns 404. |
| PORT | Assigned by hosting; pass explicitly to the start command. |
| TASTEPROBE_VISUAL_REVIEW | Leave unset. Even synthetic cannot enable /review in production. |

There is currently **no configurable persistent signing secret or shared session store**. Do not invent an environment variable and assume it solves this: HMAC secrets are generated per process. One process preserves them only for its lifetime. Proof expiry is 30 minutes; tool sessions expire after 20 minutes. A future multi-instance deployment requires a deliberate tested shared-secret/session design.

## Blocking release checks

1. **External shared abuse controls:** configure a trusted edge/gateway policy covering every cost-bearing route (/api/entities/search, /api/discover, /api/audit, /api/tools and /api/visuals). Require a shared atomic total-spend/request cap as well as burst limits, enforced across restarts and instances. Cross-origin checks are CSRF defense, not authentication: non-browser callers can omit Origin. IP rate limiting alone does not bound aggregate cost. Do not rely on memory-only caps.
2. **Judge allowance:** the operator must inspect the actual provider account/event allowance without using an unapproved API request, reserve a judge budget, and validate the gateway's remaining counters. The earlier local budget reconciliation was inconclusive; no remaining balance is assumed. Existing 60/process Qloo cap and 20 created tool sessions can also exhaust on one replica. Do not silently reset them to claim quota readiness.
3. **Public Origin/Host:** current lib/http.ts accepts an exact effective URL Origin/Host, with only strict same-port loopback recovery. A TLS reverse proxy may reconstruct an internal HTTP URL and reject the public HTTPS Origin. Inspect the real deployment request shape with redacted diagnostics before LIVE. Configure trusted proxy/domain behavior or implement a separately reviewed exact-origin policy if necessary; never wildcard origins or trust arbitrary forwarded headers.
4. **Outbound network:** verify DNS and TLS for hackathon.api.qloo.com and api.themoviedb.org in the hosting process. ENOTFOUND previously occurred locally. Preserve timeouts, no redirects, no retries, and stop on transport/auth/quota errors. Do not spend provider requests just to test DNS.
5. **Production isolation:** confirm GET /review is 404 even when the review flag is synthetic; check client bundles for exact configured secrets. No .env file or private evidence in deployment uploads.
6. **Fresh browser acceptance:** after a separate explicit provider budget approval, complete Discover and Audit, including downloads, on the actual public HTTPS origin. Verify no stale process/session is involved. Then approve publication.

Until these are satisfied, use the verified local demonstration and dated evidence, clearly identified. Public source-code publication and public LIVE API exposure are separate decisions; neither is performed by this gate.

## Artwork, cache and Passport

TMDB cache is process-local (six-hour entries, bounded size). Cold starts may repeat metadata calls; it is not a shared quota solution. Images load from authorized TMDB URLs or use illustrative fallback; they cannot change rankings. Preserve TMDB Credits/logo/notice. Check provider terms before commercial use.

Passport download is generated in the browser, with no persistent server storage. It must retain current request provenance and human decision; missing artwork cannot block it. Do not publish private exports containing signed selections or authorization material.

## Operator release sequence

Review LICENSE/THIRD_PARTY_NOTICES and the secret/history reports. Approve the local checkpoint. Choose hosting, configure the controls above, and verify domain behavior offline first. Only after explicit authorization create a remote repository/push, provision hosting, set runtime secrets, and run the separately budgeted judge acceptance. Record actual URLs in README/Devpost after they exist.

References: [Railway Next.js guide](https://railway.com/guides/nextjs), [Railway public networking](https://docs.railway.com/guides/public-networking), [Vercel WAF rate limiting](https://vercel.com/docs/vercel-firewall/vercel-waf/rate-limiting). These platform features do not imply they have been configured for TasteProbe.
