# TasteProbe — Devpost draft (ENGLISH)
**WARNING: TEMPLATE ONLY. Replace placeholders solely with verified, implemented facts. Remove unbuilt features. DO NOT submit as-is.**

**GATE 2A status:** deterministic, human-operated audit tool; no autonomous agent, agent framework, or existing-agent integration is implemented. One authentic live HTTP case resolved four confirmed movie identities and returned 3/3 candidates with an observed order change. Strict repeat/alternate-signal verification, agentic modality acceptance, browser QA, public demo and license remain pending. No public submission is ready.

## Project title
TasteProbe

## Tagline
Stop guessing. Start testing taste.

## Problem
AI recommendation systems frequently produce convincing lists without showing whether the choices align with observable cultural affinity signals. Product builders need a clear way to inspect those recommendations before presenting them to users.

## Solution
TasteProbe is a movie shortlist audit tool with explicit human identity confirmation and deterministic evidence checks. Its REST integration resolves film identities through Qloo and compares an original recommendation order with Qloo's returned order. One real HTTP case was captured on 2026-10-30; negative controls use an isolated MOCK provider. The product remains rank-only, without numeric score normalization or enabled explainability.

The app separates real Qloo data from TasteProbe's own interpretation. Missing or ambiguous evidence is surfaced rather than silently replaced with guesses.

## How it works
1. Select movies representing a set of explicit cultural interests.
2. Enter or load a shortlist of movie recommendations to audit.
3. TasteProbe resolves entities and checks their Qloo IDs.
4. After the user starts evaluation, the server validates confirmed identities and queries Qloo Insights for the same candidates. Fixed rules compare the returned order with the original ranking or abstain if coverage is incomplete.
5. It presents a revised ordering where justified, explanation/provenance, and the limits of the evidence.

**Verified live example to add before submission:** [original list] -> [actual Qloo results] -> [observed rank differences], captured on [date].

## What makes it Qloo-powered
TasteProbe uses the Qloo `/search` and `/v2/insights` endpoints with supported entity and signal parameters. A generic LLM can explain why a movie seems relevant based on text; TasteProbe uses Qloo's aggregate cultural affinity information to audit a defined candidate set. It does not claim Qloo reveals any individual's actual preferences or guarantees recommendation success.

## Tech stack
- [ONLY list verified stack from repo]
- Qloo API (authorized hackathon endpoint)
- [Optional LLM provider, only if actually integrated]
- [Actual deployment provider]

## Technical implementation
[Describe verified deterministic tool steps and the eventual confirmed agentic modality. Include disambiguation, safeguards, testing, failure recovery and request-to-result provenance without secrets. Do not claim autonomy or real Qloo results before they exist.]

## Design
[Describe actual deployed core task, screenshot evidence, accessible UI/error states.]

## Impact
Target user: teams developing AI cultural discovery experiences. Immediate demonstrable value: inspect a recommendation list and see how Qloo-backed affinity evidence changes or supports its ranking. No claims of improved conversion, satisfaction, retention, or market outcomes unless separately validated.

## Limitations
Qloo signals describe aggregate cultural affinity, not individual predictions, causality, or recommendation quality. Coverage varies; data gaps are shown explicitly. Evaluation outcomes depend on available entity matches, supported parameters, and API availability.

## How to test (required)
Live URL: [ADD VERIFIED PUBLIC URL]
GitHub repo: [ADD VERIFIED PUBLIC REPO]
1. Open app in an unauthenticated browser.
2. Choose sample input (titles only, not precomputed answers).
3. Click Run audit.
4. Inspect side-by-side results and their Qloo provenance.
5. Change an item and rerun to see how the live result changes.

## Evidence
Screenshot 1: [live successful comparison]
Screenshot 2: [evidence/provenance]
Screenshot 3: [ambiguous or error state]
Optional video: [public URL only if recorded]

## License
[LICENSE as visible in public repo]
