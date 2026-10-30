import { auditTools } from '../../../lib/audit-tools-server';
import { toolSchemas } from '../../../lib/tool-schemas';
import { body, failure, json } from '../../../lib/http';
import { object } from '../../../lib/qloo/service';
import { QlooError } from '../../../lib/qloo/client.mjs';
export const runtime = 'nodejs';
export function GET() {
  return json({ name: 'Agentic Cultural Audit', mode: 'AGENT_INVOKABLE_TOOLS', autonomousLLM: false, tools: toolSchemas, documentation: 'docs/AGENT_TOOLS.md in source repository', policy: 'Explicit human-confirmed signed identities, no arbitrary URLs, 12 Qloo attempts / 16 tool steps per 20-minute session; 60 attempts / process. No retries.' });
}
export async function POST(request: Request) {
  try {
    const v = object(await body(request));
    if (Object.keys(v).some(k => !['action', 'session', 'tool', 'arguments', 'intent', 'caller'].includes(k))) throw new QlooError('INVALID_INPUT');
    if (v.action === 'create' && Object.keys(v).every(k => ['action', 'intent', 'caller'].includes(k))) return json(auditTools.create({ intent: v.intent, caller: v.caller }));
    if (v.action === 'passport' && Object.keys(v).every(k => ['action', 'session'].includes(k))) return json(auditTools.passport(v.session));
    if (v.action === 'invoke' && Object.keys(v).every(k => ['action', 'session', 'tool', 'arguments'].includes(k))) return json(await auditTools.invoke(v.session, v.tool, v.arguments));
    throw new QlooError('INVALID_INPUT');
  } catch (e) { return failure(e); }
}
