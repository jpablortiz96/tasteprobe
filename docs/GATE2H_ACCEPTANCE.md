# GATE 2H: dual-mode operator acceptance

**AT_RISK / LIVE_ACCEPTANCE_PENDING.** Discover/TMDB desktop and mobile improvement is operator-confirmed in the GATE 2H prompt. New changes and Audit's complete browser workflow are not yet accepted. No new Qloo or TMDB requests were made by Codex in this gate.

## Budget reconciliation and stop

Last recorded GATE 2E.1 budget: 7 attempts authorized, 2 recorded consumed, followed by a transport stop. Later operator Discover usage was explicitly reported as **unknown** during GATE 2H. Therefore the old nominal five remaining attempts are NOT assumed available. Do not run Search or Insights until a fresh budget is expressly approved. No automatic retry or A/B is part of this acceptance.

The proposed fresh minimum for a complete Audit is **5 attempts**: four Search calls, one Insights call. Failed attempts count. Stop on 401, 403, 429, transport error, unexpected contract or unresolved identity; do not repeatedly click Retry. If an identity lacks a verifiable year or remains ambiguous, leave acceptance pending rather than fabricating confirmation. TMDB cannot confirm a Qloo identity.

## Chrome Audit case, only after explicit approval

1. Open http://127.0.0.1:3000 and select Audit another AI. Use sample input (now exactly the case below) or enter manually.
2. Cultural signal: Arrival. Original list, one title per line and in this order: Interstellar / Blade Runner 2049 / Her.
3. Confirm movies. Search each title exactly once. Select Arrival (2016), Interstellar (2014), Blade Runner 2049 (2017), Her (2013), verifying actual Qloo title/year. Capture the confirmed states. TMDB artwork is optional; ambiguous/no-match images remain illustrative. Arrival (2016) is known to be ambiguous in TMDB and must retain fallback absent a trusted additional identifier.
4. Check 4/4 identities confirmed. Evaluate once: the fifth Qloo attempt. Record local HTTP, actual provenance timestamp/request reference and returned coverage. Compare the three sent and returned IDs; do not expect historical ranking values.
5. Review original order, current Qloo order, shifts, observed affinities (or missing), confirmed cultural signal and limitations. TMDB image loading never changes these values.
6. Rescue: Propose evidence-based revision. This uses server-held evidence, **zero new Qloo calls**. With full coverage it proposes the same candidates in Qloo order; otherwise it must abstain. Do not open/run the LIVE signal challenge.
7. Approve proposal, export Evidence Passport, then Keep original list (Reject), export again. Check distinct APPROVED/REJECTED decisions and appliedAutomatically=false, original evaluation and proposal unchanged, actual tool events, source/date/coverage and limitations. No proofs, credentials, cookies or private model reasoning should be included.
8. At 1440x900 and 390x844, reuse the SAME loaded result rather than repeating queries. Check overflow, focus, readable labels, touch targets, image/fallback correctness and downloads. Approval records a human decision; it does not write to another product or overwrite Qloo evidence.

## Discover/UI inspection without consuming Qloo

Use an already-loaded approved result or the isolated dev review route:

```powershell
$env:TASTEPROBE_VISUAL_REVIEW = 'synthetic'
npm run dev -- --port 3001
```

Open http://127.0.0.1:3001/review. KPI icons and results share the real components; sample values remain SYNTHETIC / NOT LIVE. The optional captured TMDB artwork is dated, not fresh Qloo evidence. Do not label these screenshots LIVE. Production /review remains 404. No Qloo/TMDB API requests occur in synthetic review; a captured image may load from TMDB CDN.

## Acceptance matrix

| Case | Current status |
|---|---|
| Discover LIVE + TMDB, desktop/mobile before 2H edits | Operator confirmed |
| KPI icons and identity artwork after edits | Offline checks; visual operator review pending |
| Audit original ranking vs current Qloo | MOCK HTTP checked; LIVE_ACCEPTANCE_PENDING |
| Rescue proposal and Approve/Reject export integrity | Offline checked; browser acceptance pending |
| Passport actual browser downloads | Pending operator |
| Agent bridge missing-evidence invocation | Real Codex-directed local invocation; ABSTAINED, zero Qloo |
| Hosted autonomous agent/full LIVE agent audit | AGENT_EXECUTION_PENDING; not claimed |

## Screenshots

Integrated browser host is unavailable. Please attach the operator's real screenshots; redact browser profiles, cookies, tokens and unrelated private content. Save reviewed files under `docs/screenshots` using its capture checklist. No screenshot or VISUAL_PASS is fabricated. Do not capture raw authorization headers or signed identity proofs.

After BOTH browser flows and downloads are explicitly approved, freeze features and recommend **GATE 3 - Repository & Delivery**. This gate neither publishes nor starts Gate 3 automatically.
