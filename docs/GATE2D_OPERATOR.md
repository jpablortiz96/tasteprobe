# Final cinematic UX review

Gate 2D changes presentation only. No Qloo LIVE requests were authorized or made. The existing adapter, identities, CSRF, request limits, agent tools and Audit remain unchanged.

## Start the existing isolated review

After restarting the existing development process normally:

```powershell
Set-Location D:\Hackathons\TasteProbe
$env:TASTEPROBE_VISUAL_REVIEW='synthetic'
npm.cmd run dev
```

Open `http://127.0.0.1:3000/review` (use the printed port if different). The permanent SYNTHETIC / NOT LIVE banner must be visible. Do not navigate to the LIVE homepage or make Qloo requests for this review. The review route still requires development and loopback; production returns 404 even when its flag is enabled.

## Compare with the four authentic pre-polish captures

This is the implemented presentation change, not an automated screenshot comparison:

| Before | After |
|---|---|
| Hero and full setup form above completed results | Compact confirmed-favorite summary, Edit favorites action, results first |
| Four desktop / two mobile columns | Three desktop / two tablet / one mobile column |
| Small cards with initials and repeated title | Larger 2:3 original geometric cover compositions; film title appears once below |
| Secondary copy around 10–13px | Sources 11px, year/explanation 15px, larger title/affinity, 44px controls |
| Small report control after success | Your Cultural Evidence Passport card with source, verified-film count and limitations, also after an error |

The four pre-polish images were inspected by the operator, as reported in the request. No new post-polish images were captured by Codex: the browser access host is unavailable. **VISUAL_OPERATOR_REQUIRED** until the checks below pass.

## 1440×900, 390×844 and keyboard

Use Chrome device toolbar at 100% zoom. Inspect both required resolutions, and optionally a tablet width such as 820px to verify the middle two-column layout.

1. **Recommendations:** choose the scenario, search any title, explicitly confirm the synthetic Arrival identity, and press Discover. Confirm that the hero/form disappear, favorites remain in a compact summary, and the heading receives keyboard focus. The results must now lead the page.
2. Verify three wide desktop columns, two tablet columns and a single mobile column. Confirm 2:3 art, no title repeated within the cover, clear year/rank/source, visible brief explanation and optional affinity. Null affinity must say Unavailable; illustrative values are not satisfaction percentages.
3. Open Why this movie by keyboard. Check visible focus, a comfortable touch target and legible explanation. The source banner/cards must never call synthetic evidence LIVE. The abstract covers are original graphic illustrations, not official film posters.
4. Choose Edit favorites. Focus should move to the form (or heading if three favorites disable search). No request occurs merely by editing. Return to these results must restore the current result without another request. Removing/confirming favorites invalidates the prior result.
5. Download **Your Cultural Evidence Passport**. The synthetic filename starts `SYNTHETIC-NOT-LIVE`; JSON must contain `evidenceMode: SYNTHETIC` and `liveValidation: SYNTHETIC_NOT_LIVE`. It must not include a proof.
6. **Insufficient Evidence:** reset via the scenario selector, confirm one favorite, Discover. Check the explanation that no supported recommendations are available and the Edit or add a favorite action. Passport should preserve zero verified results and the limitation.
7. **Service Error / Timeout:** repeat both scenarios. Check distinct understandable text, compact summary, explicit manual Retry, and a Passport documenting absent evidence. Retry must perform only a user-requested local simulated operation. Technical diagnostics stay collapsed.
8. Use Tab / Shift+Tab / Enter / Space throughout, test long text wrapping and no horizontal page overflow. Check controls at least 44px tall, readable labels, visible focus and accessible status/error announcements.
9. Enable prefers-reduced-motion via Chrome rendering tools. There are no new animations; existing motion-reduction rules remain. Covers reserve their space with aspect ratio and contain no network-loaded images or webfonts. Confirm that loading causes no unexpected jumps beyond the intended transition to the outcome.

## Release boundary

These fixtures cost zero Qloo calls. Do not present them as LIVE evidence or reuse their identifiers. A new LIVE check requires separate explicit authorization. After operator screenshots and approval, review the accumulated diff/secrets, choose a license and public quota settings, then prepare a local commit and a separately reviewed publication. No push or deployment is included here.
