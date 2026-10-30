# TMDB visual enrichment — GATE 2G

## Responsibility and evidence

Qloo remains the only source for candidate generation, ranking, affinity and cultural attribution. TMDB supplies optional posters, backdrops and a labeled synopsis. No Qloo route, scoring rule, signature, budget or tool was changed in this gate.

`POST /api/visuals` accepts up to eight movie identities (id, title, year, movie type), validates origin/JSON/body bounds and arguments, and returns only safe matched visual metadata. It neither resolves nor confirms Qloo identity. A visual match is not cultural evidence. Discover renders Qloo immediately, then makes one optional visual request; Strict Mode mounts are deduplicated. Synthetic review makes no API request.

Server-only variables: prefer `TMDB_READ_ACCESS_TOKEN` as Bearer; fall back to `TMDB_API_KEY` in TMDB's documented server query parameter. Both are present in the operator's local environment; values are never printed. `.env.local` remains ignored. A clean server restart is needed after changing configuration. Missing credentials return BLOCKED_CREDENTIAL with no provider calls.

## Matching and resilience

- Fixed `/3/configuration` and `/3/search/movie` on `https://api.themoviedb.org`, GET only, native fetch, 3.5-second request timeout, bounded JSON, no redirects/retries.
- English title normalization permits punctuation/case/spacing differences, then requires exact normalized title and exact release year. Only movie search is used; series, adult content and missing years abstain. Multiple matches or additional result pages abstain. No popularity-based choice.
- URLs use actual configuration base/sizes and returned poster/backdrop paths; only approved HTTPS TMDB CDN forms pass frontend validation. No guessed paths or third-party URLs.
- Configuration cached per process; 128-entry, six-hour metadata cache. At most two batches concurrently, 12 batches/minute, 100 provider attempts/process, and a nine-second batch scheduling window. Failures count; auth/403/429 halt new provider requests until process recovery. No arbitrary endpoints.
- Failed/empty/ambiguous metadata keeps illustrative covers. Browser image onError restores the original cover independently of Qloo results. No automatic retries. API data is not logged; exceptions are categorical and credentials echoed by upstream are rejected.
- Passport retains the original Qloo result and adds separately labeled TMDB visual metadata, retrieval time and matching basis. Export does not certify browser image load success.

## Real TMDB checks, no Qloo

Seven TMDB API requests total: configuration + Arrival search (2), one diagnostic Arrival search (1), configuration + Passengers search (2), and a temporary local HTTP visual route test (2). All returned HTTP 200. Arrival (2016) has two exact title/year matches (TMDB IDs 329865 and 472349); fallback is intentional without an additional trusted identifier. Passengers (2016) resolved uniquely with real poster/backdrop URLs: IMAGE_PROVIDER_READY. Files: `evidence/gate2g-tmdb-live.json`, `gate2g-tmdb-matching.json`, `gate2g-tmdb-passengers.json`. No image binary is copied into the repository.

No new Qloo calls. This validates TMDB metadata, not a fresh end-to-end Qloo browser session. Future external-ID matching may improve ambiguous coverage, but is not guessed or added to Qloo contracts in this gate.

## Terms and attribution

Official references reviewed 2026-10-30:

- https://developer.themoviedb.org/reference/search-movie
- https://developer.themoviedb.org/docs/authentication-application
- https://developer.themoviedb.org/docs/image-basics
- https://developer.themoviedb.org/docs/faq

The FAQ documents non-commercial use with attribution; commercial use requires appropriate licensing. Credits include the required notice: “This product uses the TMDB API but is not endorsed or certified by TMDB.” The official logo is displayed less prominently than TasteProbe, unmodified. Its original asset is `https://www.themoviedb.org/assets/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg`, saved as `public/tmdb-logo.svg`. This logo is TMDB's mark, not TasteProbe-owned or generally relicensed source code. TMDB does not claim ownership of all third-party images; preserve applicable rights and attribution on later publication.

## Visual operator review, no provider API calls

```powershell
$env:TASTEPROBE_VISUAL_REVIEW = 'synthetic'
npm run dev -- --port 3001
```

Open http://127.0.0.1:3001/review. Search/confirm the fixture and run Recommendations. The first synthetic movie uses Passengers' actual captured TMDB metadata, dated and explicitly marked as an artwork sample; its affinity remains SYNTHETIC, not live cultural evidence. The browser may fetch the poster from TMDB CDN, but no Qloo/TMDB API is invoked. Other cards demonstrate fallback. Empty/error/timeout remain isolated, and `/review` remains 404 in production.

At 1440×900 and 390×844, check featured poster, compact KPI grid, position/title/year/affinity, Why controls, no overflow, keyboard focus, image failure via DevTools request blocking, and Passport download with SYNTHETIC / NOT LIVE markers. On mobile remaining cards use compact poster/text rows to reduce scroll. Capture screenshots and check console/network. Integrated browser access is not available to Codex, so no VISUAL_PASS is claimed.
