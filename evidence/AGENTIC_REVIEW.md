# Agentic modality review — GATE 2B

Current status, **2026-10-30: AT_RISK**. The [official rules](https://qloo.devpost.com/rules) were rechecked for modality only; the prior Qloo transport research was not repeated. They permit a working application functioning as an agentic tool, built with an agent framework, or integrating Qloo into an existing agent.

TasteProbe now targets **tool modality (a)** with an executable interface, not definitions alone: `/api/tools` dispatches resolve_entities, evaluate_candidates, compare_cultural_signals and propose_evidence_based_revision. GET publishes argument schemas; POST invokes server operations with budgets, signed confirmations, timeouts and abstention. The local stdin bridge works against the production server. Isolated HTTP tests actually invoke all four tools, compare signals, export evidence, and verify error/partial abstention. Their caller is a scripted test client, not a model.

Provider presence checks found no configured OpenAI/Anthropic/Google/Gemini/Azure OpenAI credential. There is no hosted LLM, autonomous planner, agent framework or demonstrated autonomous model selection. Human UI chooses its tools; an external agent may choose calls using the documented interface. Decision events record tool executions and summarized inputs/results only, never private model reasoning. These facts support agent-tool positioning; they do not certify organizer acceptance or autonomous behavior.

Qloo supplies identities and cultural evidence; without verified Qloo evaluation the revision tool abstains. The existing authentic LIVE A/B capture remains dated historical evidence; new Gate 2B tool/HTTP tests are MOCK only, zero new LIVE requests. See [usage](../docs/AGENT_TOOLS.md) and [current evidence](../EVIDENCE.md). Browser visual review and final modality/submission wording review remain pending.

---

# Historical GATE 1B review (superseded where noted above)

GATE 2A update (2026-10-30): one real Qloo Search/Insights HTTP case now exists; see current EVIDENCE.md. The earlier missing-live-credential statements below are historical. No autonomous agent/framework/integration was added, so agentic modality acceptance remains unestablished. Direct backend REST authorization is now reported by the user as confirmed by Qloo Support; acceptance of mode (a) is a separate question.

Reviewed 2026-10-29 against [official rules, section 4](https://qloo.devpost.com/rules). The rules accept an application that functions as an agentic tool, uses an agent framework, or integrates Qloo into an existing agent. They also require a working Qloo integration. This review does not certify organizer acceptance or eligibility.

## What actually exists

TasteProbe is a **deterministic, human-operated movie recommendation audit tool**. It does not currently contain an autonomous agent, model-driven planner, agent framework, model-provider call, or demonstrated connection to an existing agent. Pasting a list from an AI agent does not constitute integration with that agent.

The user supplies the cultural interests and original recommendations, chooses when to search, confirms each film identity and starts the evaluation. The system then applies explicit rules:

| Decision | Implementation | Human / system responsibility |
|---|---|---|
| Accept input or refuse it | Strict cardinality, type, length and uniqueness checks | System validates; user chooses titles |
| Which lookup to execute | One bounded Qloo Search for the selected title | User initiates; system fixes endpoint/parameters |
| Accept an identity | Filter explicit movie identities; verify signed proof and confirmation | User selects identity; system validates evidence |
| Whether Insights may run | All proofs valid, confirmations present, quota available | User requests evaluation; system permits/refuses |
| Which candidates to inspect | Exactly the confirmed original shortlist | System constrains Insights to those IDs |
| Whether a revised order is supportable | Full coverage versus partial/empty response | System compares or abstains by deterministic rule |
| Explanation | Observed rank shift, missing evidence and limitations | Fixed interpretation; no invented causal explanation |
| Reporting | Structured export with request provenance | User downloads; system excludes authorization proofs |

Tools are the internal `/api/entities/search` and `/api/audit` route handlers, backed by native server-side HTTP GET to Qloo `/search` and `/v2/insights`. `/api/health` checks configuration only and never queries Qloo. Qloo is the external source of identity and aggregate cultural ordering; TasteProbe validates and compares that evidence. A user confirmation is never treated as proof that a cultural affinity is correct.

## Modality assessment

- **Agentic tool (a): candidate positioning, not established compliance.** There is a bounded tool workflow with validation, provenance and abstention. However, it is fully determined by user actions and fixed rules, and no autonomous tool selection or agent invocation is demonstrated. The rules retrieved do not define a more precise technical test for this label. Do not claim that the deterministic pipeline alone proves qualification.
- **Agent framework (b): not present.** No framework should be added just to claim the category.
- **Existing agent integration (c): not present.** Copy/paste input is not an agent integration.
- **Live API requirement: blocked.** HTTP integration tests use a fictional, isolated MOCK provider. No authorized Qloo request has established a working live integration.

Status: **AT_RISK / agentic modality not yet demonstrated**. Accurate product wording is “a movie shortlist audit tool with explicit human confirmation and deterministic evidence checks.” Avoid “autonomous agent”, “agent independently decides”, or “officially eligible”.

Next action: obtain organizer interpretation of modality (a) together with direct REST acceptance. If a real agent invocation is required, scope a small, explicitly documented tool integration in a later reviewed milestone; do not add an agent framework or mislabel the current tool. Public submission language must be reviewed against this record after live validation.
