# TasteProbe — Execution checklist for Qloo Agentic Hackathon
**Deadline:** Fri Oct 30 2026, 10:45 p.m. Colombia.
**Important:** These are suggested time budgets relative to start, not future promises.

## Action 0 — Now
- [ ] Join event https://qloo.devpost.com/register
- [ ] Request API key: https://forms.gle/zz12orkLHTAneLGz6
- [ ] Check email/spam regularly and event Discord https://discord.gg/rF9PKsD5Q7 (#api-help) for official guidance
- [ ] Save Devpost draft when possible
- [ ] Start Codex with `CODEX_MASTER_TASTEPROBE.md`; create private working folder

## Build cadence (20–24 focused hours, stop early if risk)
| Gate | Work budget | Proof required | Stop rule |
|---|---:|---|---|
| G0 access + falsifier | 1–3 h | Real `/search` and `/v2/insights` with valid data | No live key => mark BLOCKED; no counterfeit demo |
| G1 backend agent | 3–4 h | Real request pipeline, schema validation + tests | If no comparable results, change scope |
| G2 UI | 3–4 h | From fresh tab, input-to-results coherent | Reduce features, not quality of core |
| G3 evidence | 2 h | A/B against original rank; caveats shown | No evidence => no claimed benefit |
| G4 deployment | 2–3 h | Public URL works on unauthenticated browser | Release only when smoke test works |
| G5 submission | 1–2 h | Devpost submitted with repo, license, screenshots, English summary | Must finish before Oct 30, 22:45 COL |
| Buffer | 3–5 h | Resolve failed auth/429/UI issues | Protect submission deadline |

## Single task rule
Only one gate is ACTIVE at a time. Every Codex report: `GATE`, `STATUS`, `EVIDENCE`, `CHANGED_FILES`, `TEST_OUTPUT`, `RISKS`, `COMMIT`, `NEXT_ACTION`.

## G0 checklist
- [ ] Node 22.19+ or compatible runtime
- [ ] Git clean and repo safe
- [ ] Local `.env.local` not committed
- [ ] Correct `https://hackathon.api.qloo.com` base
- [ ] Correct `X-Api-Key` header
- [ ] Search movie IDs with `/search` and validate year/type
- [ ] GET `/v2/insights` with `filter.type=urn:entity:movie`, `signal.interests.entities`, `filter.results.entities`
- [ ] Returned Qloo structure understood, no invented confidence
- [ ] Falsifier PASS/FAIL with negative controls

## Critical rules
- **No substitution:** an OpenAI/Groq/Anthropic key is not a Qloo API key. A paid non-hackathon Qloo credential, if available, needs correct host and organizer authorization.
- **No fake production:** mock responses are only for local tests and must be labeled.
- **No generic chat app:** Qloo does the hard comparison; LLM, when present, only explains evidence.
- **No screenshots with secrets.**
- **No untested URLs:** Devpost requires a fully published live application, public repo, source/setup/assets and open source license.
- **No need for demo video** according to current event overview, but screenshots and optional walkthrough help because judges need not execute project.
- **English:** Devpost description/testing instructions must be in English or translated.
- **Keep public demo free/accessible through judging period (Nov 5).**

## Official references
https://qloo.devpost.com/rules
https://docs.qloo.com/reference/qloo-llm-hackathon-developer-guide
https://docs.qloo.com/reference/available-parameters-by-entity-type
https://github.com/qloo/qloo-hackathon-kit
