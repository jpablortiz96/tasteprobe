# GATE 2G — TMDB + results UX / 2026-10-30

Status **AT_RISK: browser visual acceptance pending**. TMDB provider is implemented and verified against its real API; Qloo integration is preserved and no new Qloo requests were made. No push, deploy, remote repository or commit.

## Real provider evidence

- Both credential variables are present (values never printed). Bearer has priority; documented server API-key fallback is tested offline. `.env.local` remains ignored and untracked.
- Seven TMDB API calls, all HTTP 200: two initial checks, one ambiguity diagnosis, two checks for Passengers, and two in the real local visual-route check. Configuration and image paths are from actual responses, not invented.
- Arrival (2016) returns two exact TMDB identities. Resolution abstains, without popularity guessing. Captured metadata is replayed in a regression test.
- Passengers (2016) is uniquely matched and returns poster/backdrop: **IMAGE_PROVIDER_READY**. A single CDN HEAD confirms the actual returned poster is HTTP 200, image/jpeg, 50,166 bytes. This is image availability evidence, not browser rendering approval. No commercial movie poster binary is stored or committed.
- Official unmodified TMDB logo and required notice are included in Credits. Source, conditions and implementation details: `docs/TMDB_INTEGRATION.md`.

## Functional boundary

`POST /api/visuals` is independent of Qloo and guarded by existing origin/body validation, strict bounded movie input and separate provider budgets. Credentials exist only in the server wrapper/client. Fixed TMDB hosts/endpoints, timeout, bounded responses, no redirects/retries, bounded cache and auth/quota halting are implemented. Missing credentials, mismatch, ambiguity, absent paths, provider errors or browser image errors preserve original covers. Ranking, affinities and cultural explanations are never read from TMDB.

Discover renders verified Qloo results before asking for optional visuals. The same title/year/host policy is checked before displaying images. Passengers in the smoke is provider validation, not a new recommendation result. No historical Qloo data was inserted into production.

## UX

Existing results dashboard and featured-by-affinity selection remain dynamic; ties preserve Qloo order. Featured adds title/year, large optional poster, cultural-source/artwork/favorite badges, observed affinity and a short TMDB-labeled synopsis, separate from Qloo attribution. Cards preserve Qloo positions, details and fallback. Mobile cards become compact poster/text rows; featured uses a smaller poster beside text; compact Passport summary includes featured name. Existing three/two/one grid, keyboard focus and reduced-motion behavior remain. No visual correctness is inferred from CSS alone.

Passport keeps the original Qloo response intact and adds optional separate visual metadata, TMDB ID, title/year, returned image URLs, retrieval date and matching basis. It never includes credentials/proofs or claims image-load success. Download is available with or without images.

Audit/Rescue/tool logic are unchanged. Shared MovieArtwork supports posters when explicitly supplied; existing Audit covers continue to work without them. Audit is not converted into Discover.

## Checks and remaining limits

All original tests are retained. New unit/server-render checks exercise TMDB matching, credential preference, missing auth, errors, no retries, cache, ambiguity, safe URLs, mismatched artwork and Passport separation. Additional MOCK HTTP E2E verifies Discover → visual enrichment → export plus origin rejection, duplicate input, absent credential and production /review blocking. Existing Audit/Rescue tool E2E remains.

Full command results and secret/client scans are in gate2g artifacts. The integrated browser reports `The browser access host is unavailable`: **VISUAL_OPERATOR_REQUIRED**, no new screenshots or VISUAL_PASS. See operator instructions in `docs/TMDB_INTEGRATION.md`; the development-only review can display the captured TMDB artwork sample with explicit dates and SYNTHETIC cultural scores, making no Qloo/TMDB API calls. Only the optional CDN image is fetched by the browser.

Remaining: operator desktop 1440×900/mobile 390×844 review, real browser image error/fallback and Passport download acceptance. Title/year ambiguity intentionally reduces image coverage; a future reliable external-ID contract could improve it without guessing. Non-commercial attribution conditions apply; later commercial/public use needs the applicable review. Git remains on ca5481f with prior and current uncommitted changes.

Real HTTP acceptance: temporary production Next process, Qloo credential empty and all Qloo fetches blocked by a test-only preload; POST /api/visuals with Passengers returned IMAGE_PROVIDER_READY and no credentials in the response. The process was closed after verification. See gate2g-http-visual.json and gate2g-http-tmdb-attempts.json. This is not browser acceptance.
