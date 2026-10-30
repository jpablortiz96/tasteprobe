# Connect an AI agent to TasteProbe

## What is actually connected

TasteProbe exposes a **local MCP stdio server**, `scripts/tasteprobe-mcp.mjs`. The old `scripts/agent-tool.mjs` remains a one-operation JSON/HTTP bridge; it is not itself MCP. The new adapter reuses the existing `/api/tools` operations and does not rebuild Qloo or add an LLM/framework/dependency.

MCP JSON-RPC initialization, initialized notification, tool discovery, tool calls, ping, bounded framing and structured results are implemented. Only the fixed loopback `/api/tools` endpoint is reachable. No API key is read by the adapter. Sessions are isolated per MCP process; no arbitrary URL/header/command is accepted from model arguments.

The four discovered tools are:

- `resolve_entities`: Qloo Search, human confirmation required.
- `evaluate_candidates`: verified candidates evaluated by Qloo Insights.
- `compare_cultural_signals`: bounded two-signal comparison.
- `propose_evidence_based_revision`: server-held evidence only; abstains when missing.

**Default Qloo allowance is zero.** Search/evaluate/compare fail closed with BLOCKED_BUDGET; no local/provider dispatch occurs. The revision tool can safely demonstrate missing-evidence abstention. Raising allowance requires separate explicit operator authorization; it cannot borrow the Chrome acceptance budget or be changed by a model prompt. Global server caps and signed identity requirements remain.

## Commands checked on the actual host

Prerequisites: Node 24+, installed Codex CLI (verified version 0.165.0, npm launcher on this Windows host), and the existing TasteProbe app on http://127.0.0.1:3000. Run from an external PowerShell in the project directory:

```powershell
Set-Location D:\Hackathons\TasteProbe
codex.cmd --version
node scripts/verify-mcp-stdio.mjs
node scripts/codex-mcp-demo.mjs
```

The protocol verifier makes no Qloo call. It verifies discovery, blocks a Search attempt at the adapter, and invokes the real local revision operation to obtain ABSTAINED. This verifier alone is not an agent demonstration.

The second command runs an **actual Codex agent session**. It validates the stdio server configuration using `codex mcp get tasteprobe --json` with a per-invocation `-c` override, then executes `codex exec --ignore-user-config --ephemeral --sandbox read-only --json` with that connection. It disables shell/unified-exec, other app/browser/computer tools and multi-agent execution, uses an empty private working directory, and enforces a zero-Qloo MCP allowance. No global MCP configuration is changed and no provider key is placed in config.

If authentication is missing, complete `codex.cmd login` yourself in external PowerShell. Do not copy auth files, API tokens, login codes or cookies into the project/chat. A ChatGPT subscription is not treated as an API key: the observed run used Codex's actual existing account login. The isolated Windows sandbox did not expose that login; the approved external run succeeded.

The exact generated MCP config and CLI arguments are in `scripts/codex-mcp-demo.mjs`; the accepted configuration is recorded, without credentials, in `evidence/gate2h2-codex-config.json`. `codex.cmd mcp --help`, `mcp add --help` and `exec --help` were checked. Persistent global `mcp add` was not needed or performed; no untested registration is represented as completed.

## Demonstrated real Codex session

At 2026-10-30T20:49:28Z, Codex connected to TasteProbe, discovered the four tools, selected `propose_evidence_based_revision`, invoked it once with `{}`, and received:

```json
{
  "status": "ABSTAINED",
  "before": [],
  "after": [],
  "why": "Complete verified Qloo coverage is required. No revised order is proposed.",
  "sourceRequestId": null
}
```

The client reported NOT_EVALUATED, null evaluation, 0/0 connection allowance and one actual tool step. It concluded that no revision or affinity claim was supported. The server recorded the actual `external-agent` event at 20:49:37Z. These are real client/tool events, not synthetic Qloo evidence. File: `evidence/gate2h2-codex-mcp.json`. Raw reasoning and raw stderr were discarded; only MCP events and the public final answer are retained. No Qloo call was made by this demo.

This establishes **real Codex-to-MCP invocation and grounded abstention**. It does not establish a full autonomous LIVE cultural audit or claim that TasteProbe hosts an internal LLM. A complete agent Qloo evaluation needs a separately authorized request allowance and human-confirmed signed identities. Qloo supplies the evidence; the caller cannot supply fabricated evaluation rows to the revision tool.

## Official references reviewed

- [Codex MCP configuration](https://developers.openai.com/codex/mcp): stdio support, command/args/env, CLI and configuration.
- [Codex developer commands](https://learn.chatgpt.com/docs/developer-commands#codex-mcp): installed CLI management commands.
- [MCP stdio transport](https://modelcontextprotocol.io/specification/2025-06-18/basic/transports): newline-delimited JSON-RPC, stdout protocol only.
- [MCP lifecycle](https://modelcontextprotocol.io/specification/2025-06-18/basic/lifecycle) and [tools](https://modelcontextprotocol.io/specification/2025-06-18/server/tools): initialization, discovery, calls and structured results.

The adapter opens no network listener. Keep the app loopback-only, the allowance at zero for demonstrations, and don't publish high-consumption endpoints without release controls. No cloud server, extra framework or public deployment is required.
