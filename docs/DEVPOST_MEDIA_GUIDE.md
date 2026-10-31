# TasteProbe - Devpost media guide

Demo: https://tasteprobe-production.up.railway.app

GitHub: https://github.com/jpablortiz96/tasteprobe

Suggested cover: **05-cultural-dashboard.webp**. It communicates the product context, real movie count, cultural affinity and verification status without implying a satisfaction probability. Use 06 as the alternate cinematic cover.

## Recommended eight-image narrative

| Order | File | Suggested English title | Caption and purpose |
|---|---|---|---|
| 1 | [05-cultural-dashboard.webp](screenshots/05-cultural-dashboard.webp) | Cultural intelligence you can inspect | Lead with eight authentic Qloo results, source state and observed affinity. |
| 2 | [06-featured-recommendation.webp](screenshots/06-featured-recommendation.webp) | A cinematic recommendation, grounded in evidence | Show dynamic featuring and the separation between Qloo evidence and TMDB artwork. |
| 3 | [03-arrival-identity-search.webp](screenshots/03-arrival-identity-search.webp) | The right movie matters | Arrival (2016) and The Arrival (1996) demonstrate explicit identity confirmation. |
| 4 | [12-audit-before-after.webp](screenshots/12-audit-before-after.webp) | Question the original shortlist | Show the original order against the actual Qloo order, with complete coverage. |
| 5 | [13-rescue-proposal.webp](screenshots/13-rescue-proposal.webp) | Rescue, with a person in control | The revision tool proposes only the same verified candidates. Approval and rejection are human decisions. |
| 6 | [09-discover-passport.webp](screenshots/09-discover-passport.webp) | Take the evidence with you | The Passport documents source, coverage, limits and featured recommendation. |
| 7 | [14-discover-mobile.webp](screenshots/14-discover-mobile.webp) | Discover on mobile | The same live evidence remains usable at 390 x 844. |
| 8 | [15-audit-mobile.webp](screenshots/15-audit-mobile.webp) | Audit on mobile | Comparison continues down the mobile page without horizontal overflow. |

## What to say about agents

TasteProbe exposes four bounded tools over local MCP stdio. An authenticated Codex client really discovered them, selected propose_evidence_based_revision and received structured ABSTAINED because verified evaluation evidence was missing. The agent interpreted the limitation instead of fabricating a ranking. This is an actual agent-invocable integration; it is not an autonomous complete LIVE audit. See [connection instructions](CONNECT_AN_AI_AGENT.md) and [actual client evidence](../evidence/gate2h2-codex-mcp.json). The website screenshots show a human-directed workflow, not model decisions.

## What to say about Qloo

Qloo Search supplies confirmed cultural identities. Qloo Insights supplies the actual discovery and candidate order and observed affinities. TMDB supplies optional images and synopsis only. The dated A/B control changed Arrival to Paddington 2 with identical candidates and observed different responses; it is historical evidence, not a new query made for these screenshots.

## Verified limits and credits

All 15 files are authentic production Chrome captures, not /review fixtures. Their dates, viewport dimensions and LIVE/STATIC distinctions are in the [manifest](screenshots/MANIFEST.md). Fresh public acceptance used seven Qloo attempts with no retries; 33 of the internal 40 remained at verification. This does not establish provider balance. Arrival/Her retain safe artwork fallbacks; missing individual attribution is disclosed. Affinity is not satisfaction probability.

This product uses the TMDB API but is not endorsed or certified by TMDB. Movie artwork belongs to its respective owners. Do not extract or upload individual posters as original project assets. Screenshots include the real application with provider credits documented in the manifest. Source code is MIT.

The separately produced video may be added by the operator. No video URL or submitted Devpost status is assumed. Upload these screenshots, paste the verified demo/repository URLs, review the [final draft](DEVPOST_FINAL.md), and submit through the operator's Devpost account before the deadline.
