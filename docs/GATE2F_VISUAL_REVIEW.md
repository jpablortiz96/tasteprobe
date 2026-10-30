# GATE 2F — operator visual acceptance

Status: **VISUAL_OPERATOR_REQUIRED**. Integrated browser host was unavailable. Server rendering tests are not visual approval. No new screenshots were fabricated or captured by Codex.

Discover LIVE working with eight real movies is an operator-confirmed baseline from the GATE 2F prompt, not a new LIVE test by Codex. No Qloo calls are authorized in this gate.

## Review without Qloo

Run locally from PowerShell:

```powershell
$env:TASTEPROBE_VISUAL_REVIEW = 'synthetic'
npm run dev -- --port 3001
```

Open `http://127.0.0.1:3001/review`. This dev-only, loopback-only route uses synthetic fixtures and never calls Qloo. It remains 404 in production even with the flag. Select Recommendations; enter any valid title, search/confirm the synthetic match and request the synthetic analysis. All data and exports must remain SYNTHETIC / NOT LIVE.

At **1440×900** and **390×844**, inspect:

- Dashboard count, confirmed favorites, optional top affinity, evidence/limitations link.
- Featured movie, large illustrative cover, title/year and Explore why. Remaining cards show original result positions without duplicating the featured identity.
- Three columns desktop, two tablet, one mobile; no horizontal overflow or clipped labels.
- Keyboard Tab/Enter/Space, visible focus, usable disclosure controls and touch targets. Enable reduced motion if desired.
- Empty, Service Error and Timeout scenarios retain safe states and manual Retry. No invented tool activity.
- Passport download: filename and contents marked SYNTHETIC / NOT LIVE; culturalInsights.dashboard and featured match the visible fixture, and all original evidence/limitations remain.
- Fallback covers are clearly illustrative. No real-poster success is claimed. Poster source is blocked pending credential/rights; no image requests should appear in Network.

Capture desktop/mobile screenshots and note console errors. Do not use fixtures as LIVE evidence. Do not repeat Qloo searches to inspect layout; use the review route or an already-loaded LIVE result after a later explicit authorization.

Audit logic and Rescue are unchanged; existing isolated MOCK E2E exercises their tools, comparison, proposal and report. Their real browser acceptance remains a separate operator check.
