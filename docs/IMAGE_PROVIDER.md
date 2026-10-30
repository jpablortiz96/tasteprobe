# Update: GATE 2G

TMDB is now implemented and validated. See [current integration](TMDB_INTEGRATION.md). The following GATE 2F record is historical, not the current credential state.

---

# Movie images — 2026-10-30

Current state: **Qloo BLOCKED_RIGHTS / TMDB BLOCKED_CREDENTIAL**. No real posters are displayed, fetched, stored or committed. The active visual source is original TasteProbe CSS illustration, visibly labeled ILLUSTRATIVE COVER. Ranking and exports work without a visual provider.

## Verified sources

- Historical authorized Qloo capture (`evidence/gate2c1-live.json`, imageMetadata) records `properties.image` objects on all eight returned movies. Normalized Discover deliberately excludes those URLs. No new Qloo request was made in GATE 2F.
- [Qloo Terms](https://www.qloo.com/legal/terms), reviewed 2026-10-30, refer to additional contractual terms and third-party rights. The public page alone does not establish permission for these specific third-party movie posters. Obtain applicable written display authorization before using them; no blanket permission is inferred.
- [TMDB getting started](https://developer.themoviedb.org/docs/getting-started) requires an API key and agreement to terms.
- [TMDB FAQ](https://developer.themoviedb.org/docs/faq) allows non-commercial API use with attribution, requires separate commercial licensing where applicable, and says TMDB does not own all images. Attribution requires an approved TMDB logo in About/Credits plus the notice: “This product uses the TMDB API but is not endorsed or certified by TMDB.” Do not treat a key as universal copyright clearance.
- [Image basics](https://developer.themoviedb.org/docs/image-basics): image URL components come from actual configuration and movie metadata. Never guess poster paths.

## Operator steps, before enabling real posters

1. Prefer obtaining Qloo's applicable display rights and provenance for properties.image. If not available, review TMDB terms for the intended hackathon/public/commercial use and obtain the appropriate account authorization.
2. Register a TMDB API credential manually through the official account settings. Store a read-access token only in ignored `.env.local` as `TMDB_READ_ACCESS_TOKEN`; never use NEXT_PUBLIC, paste the token into chat, or commit it. No TMDB credential is currently configured. This gate does not access a newly configured credential automatically.
3. A follow-up backend-only adapter remains necessary before IMAGE_PROVIDER_READY: fixed official host, bounded metadata calls, timeouts, no automatic retries, approved attribution asset and Credits section. No TMDB transport/API route is implemented or claimed in this gate. Adding a credential alone will not enable images.
4. Match reliable external movie IDs when Qloo provides them. Require matching title, release year and movie type. Abstain on ambiguous candidates, missing year, wrong external IDs, series or remakes. `lib/poster-policy.ts` contains a tested pure matching policy for this future adapter; it neither retrieves images nor proves their rights.
5. Build URLs only from returned authorized configuration/path metadata, restrict image hosts, and handle image failures independently. Keep visual metadata separate from Qloo scores/order. Reconfirm the terms/rights at activation time.

No Google images, commercial poster copies or fabricated URLs are used. Tests use explicit synthetic URL strings without fetching them; those strings are never movie metadata in the product.
