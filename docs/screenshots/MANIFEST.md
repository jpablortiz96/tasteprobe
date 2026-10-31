# Authentic production screenshots

Captured from [TasteProbe](https://tasteprobe-production.up.railway.app) in installed Google Chrome, controlled with isolated Playwright. Desktop: 1440 x 900. Mobile: 390 x 844. All times below are UTC; UTC October 31 02:xx is October 30 21:xx in Colombia.

No synthetic fixtures, image composition, DOM replacement or fabricated results were used. Images are actual viewport captures converted from temporary PNG to WebP at quality 92. STATIC means input UI only; LIVE identity screens prove Search, not Insights. Result screens reuse one authentic response per mode.

| File | Resolution | Captured (UTC) | Mode | State | Verification / description |
|---|---|---|---|---|---|
| [01-home-desktop.webp](01-home-desktop.webp) | 1440 x 900 | 2026-10-31T02:10:30.643Z | DISCOVER | STATIC | Visually inspected; Discover starts with a favorite, not a prebuilt shortlist. |
| [02-discover-input.webp](02-discover-input.webp) | 1440 x 900 | 2026-10-31T02:10:31.046Z | DISCOVER | STATIC | Visually inspected; Arrival entered before any provider search. |
| [03-arrival-identity-search.webp](03-arrival-identity-search.webp) | 1440 x 900 | 2026-10-31T02:12:16.750Z | DISCOVER | LIVE | Visually inspected; Live Qloo identities distinguish Arrival (2016) from The Arrival (1996). |
| [04-confirmed-favorite.webp](04-confirmed-favorite.webp) | 1440 x 900 | 2026-10-31T02:12:20.394Z | DISCOVER | LIVE | Visually inspected; Arrival (2016) explicitly confirmed; discovery is enabled. |
| [05-cultural-dashboard.webp](05-cultural-dashboard.webp) | 1440 x 900 | 2026-10-31T02:13:23.292Z | DISCOVER | LIVE | Visually inspected; Eight authentic recommendations with observed affinity and source coverage. |
| [06-featured-recommendation.webp](06-featured-recommendation.webp) | 1440 x 900 | 2026-10-31T02:20:05.996Z | DISCOVER | LIVE | Visually inspected; Passengers (2016), the highest observed affinity in this result set, with matched TMDB artwork. |
| [07-recommendation-grid.webp](07-recommendation-grid.webp) | 1440 x 900 | 2026-10-31T02:20:05.675Z | DISCOVER | LIVE | Visually inspected; Additional authentic Qloo results retain their returned positions. |
| [08-why-this-movie.webp](08-why-this-movie.webp) | 1440 x 900 | 2026-10-31T02:13:27.679Z | DISCOVER | LIVE | Visually inspected; Expanded evidence states that individual attribution is unavailable; no explanation is invented. |
| [09-discover-passport.webp](09-discover-passport.webp) | 1440 x 900 | 2026-10-31T02:14:05.531Z | DISCOVER | LIVE | Visually inspected; The downloaded Discover Passport preserves identities, results and limitations. |
| [10-audit-input.webp](10-audit-input.webp) | 1440 x 900 | 2026-10-31T02:10:33.297Z | AUDIT | STATIC | Visually inspected; The original Audit input: Arrival and three ordered candidates. |
| [11-audit-confirmed-identities.webp](11-audit-confirmed-identities.webp) | 1440 x 900 | 2026-10-31T02:17:46.298Z | AUDIT | LIVE | Visually inspected; Four Qloo identities confirmed, including Her (2013), with safe artwork fallbacks. |
| [12-audit-before-after.webp](12-audit-before-after.webp) | 1440 x 900 | 2026-10-31T02:18:47.852Z | AUDIT | LIVE | Visually inspected; Live 3/3 comparison: Blade Runner 2049, Interstellar, Her. |
| [13-rescue-proposal.webp](13-rescue-proposal.webp) | 1440 x 900 | 2026-10-31T02:18:49.186Z | AUDIT | LIVE | Visually inspected; Rescue proposes the verified Qloo order for human approval or rejection. |
| [14-discover-mobile.webp](14-discover-mobile.webp) | 390 x 844 | 2026-10-31T02:19:21.589Z | DISCOVER | LIVE | Visually inspected; The same loaded Discover evidence at a mobile viewport. |
| [15-audit-mobile.webp](15-audit-mobile.webp) | 390 x 844 | 2026-10-31T02:19:18.443Z | AUDIT | LIVE | Visually inspected; The same loaded Audit comparison at a mobile viewport; the page continues below the capture. |

## Provenance and verification

- Discover: request effa81ae-afa7-4eeb-baec-ecc394dfb594, 2026-10-31T02:12:46.847Z, upstream HTTP 200, 8/8 movies, Arrival excluded, no duplicates.
- Audit: request 18dafad2-481a-4bb0-8057-66df27cb71d7, 2026-10-31T02:17:58.473Z, upstream HTTP 200, coverage 3/3.
- Real downloads: Discover, Audit APPROVED and Audit REJECTED. The two Audit exports preserve the exact same evaluation and proposal. Private exports are ignored, not committed.
- Seven Qloo attempts, no retries or Challenge. Final observed counter: 7/40 used, 33 remaining. TMDB: 14/200 used. These are internal controls, not provider balances.
- File sizes and SHA-256 checksums: [machine-readable verification](../../evidence/gate5-visual-delivery.json). Total WebP size: 971244 bytes.

## Credits and rights

Qloo supplies cultural evidence. TMDB supplies optional matched artwork and synopsis. This product uses the TMDB API but is not endorsed or certified by TMDB. Movie artwork and provider trademarks remain the property of their respective owners, separately from the MIT source license. These are application screenshots, not a redistribution of individual poster assets. Safe illustrative fallbacks remain visible where matching was ambiguous. See [third-party notices](../../THIRD_PARTY_NOTICES.md).
