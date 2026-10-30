import { randomUUID } from 'node:crypto';
import { object, createService } from './qloo/service.ts';
import { QlooError } from './qloo/client.mjs';
import type { AuditResult } from './contracts.ts';

export const toolNames = ['resolve_entities', 'evaluate_candidates', 'compare_cultural_signals', 'propose_evidence_based_revision'] as const;
type Tool = typeof toolNames[number];
export type ToolEvent = { tool: Tool; timestamp: string; outcome: string; summary: string; inputSummary: { queryCharacters?: number; interestCount?: number; candidateCount?: number; scenarioCount?: number }; caller: 'external-agent' | 'human-ui' };
export type Revision = { status: 'PROPOSED' | 'ABSTAINED'; before: string[]; after: string[]; why: string; sourceRequestId: string | null };
export type EvidencePassport = ReturnType<ReturnType<typeof createAuditTools>['passport']>;
type Session = { intent: string; expires: number; steps: number; requests: number; busy: boolean; stopped: boolean; events: ToolEvent[]; evaluation?: AuditResult; alternate?: AuditResult; proposal?: Revision; caller: ToolEvent['caller'] };
function exact(v: Record<string, unknown>, keys: string[]) { if (Object.keys(v).some(k => !keys.includes(k))) throw new QlooError('INVALID_INPUT'); }
export function revisionFrom(result?: AuditResult): Revision {
  if (!result || result.status !== 'SUCCESS') return { status: 'ABSTAINED', before: result?.rows.map(r => r.name) ?? [], after: [], why: 'Complete verified Qloo coverage is required. No revised order is proposed.', sourceRequestId: result?.provenance.requestId ?? null };
  return { status: 'PROPOSED', before: result.rows.map(r => r.name), after: [...result.rows].sort((a,b) => a.qlooRank! - b.qlooRank!).map(r => r.name), why: 'These same confirmed candidates are ordered exactly as returned by Qloo for the confirmed cultural signal. This is a proposal for human review, not proof of satisfaction.', sourceRequestId: result.provenance.requestId };
}
export function createAuditTools(service: ReturnType<typeof createService>, now = Date.now) {
  const sessions = new Map<string, Session>();
  let created = 0;
  function session(id: unknown) {
    if (typeof id !== 'string') throw new QlooError('INVALID_INPUT');
    const s = sessions.get(id);
    if (!s || s.expires <= now()) throw new QlooError('SESSION_EXPIRED');
    return s;
  }
  function passport(s: Session) {
    return { product: 'TasteProbe Evidence Passport', generatedAt: new Date(now()).toISOString(), mode: 'AGENT_INVOKABLE_TOOLS', autonomousLLM: false, caller: s.caller, intent: s.intent, liveValidation: s.evaluation ? 'QLOO_RESPONSE_RECEIVED' : 'NOT_EVALUATED', evaluation: s.evaluation ?? null, challenge: s.alternate ?? null, proposal: s.proposal ?? null, events: [...s.events], budget: { used: s.requests, maximum: 12, steps: s.steps, maximumSteps: 16 }, limitations: ['Tool choice belongs to the caller. No hosted LLM is configured.', 'No private model reasoning is collected.', 'Affinity is not a probability of satisfaction.', 'Human approval is required; no list is replaced automatically.'] };
  }
  return {
    create(input: unknown) {
      const v = object(input); exact(v, ['intent', 'caller']);
      if (typeof v.intent !== 'string' || !v.intent.trim() || v.intent.length > 500 || /[<>\u0000-\u001f\u007f]/.test(v.intent) || !['human-ui', 'external-agent'].includes(String(v.caller))) throw new QlooError('INVALID_INPUT');
      for (const [id, s] of sessions) if (s.expires <= now()) sessions.delete(id);
      // Process-wide cap prevents creating fresh sessions to bypass the demo budget.
      if (created >= 20) throw new QlooError('REQUEST_BUDGET');
      created++;
      const id = randomUUID();
      sessions.set(id, { intent: v.intent.trim(), caller: v.caller as Session['caller'], expires: now() + 20 * 60_000, steps: 0, requests: 0, busy: false, stopped: false, events: [] });
      return { session: id, mode: 'AGENT_INVOKABLE_TOOLS', autonomousLLM: false, maximumRequests: 12, maximumSteps: 16, expiresInSeconds: 1200 };
    },
    passport(id: unknown) { return passport(session(id)); },
    async invoke(id: unknown, name: unknown, input: unknown) {
      const s = session(id);
      if (!toolNames.includes(name as Tool)) throw new QlooError('INVALID_INPUT');
      if (s.busy || s.stopped || s.steps >= 16) throw new QlooError('REQUEST_BUDGET');
      const v = object(input), tool = name as Tool;
      const cost = tool === 'resolve_entities' || tool === 'evaluate_candidates' ? 1 : tool === 'compare_cultural_signals' ? 2 : 0;
      if (s.requests + cost > 12) throw new QlooError('REQUEST_BUDGET');
      s.busy = true; s.steps++;
      const inputSummary: ToolEvent['inputSummary'] = { ...(typeof v.query === 'string' ? { queryCharacters: v.query.length } : {}), ...(Array.isArray(v.interests) ? { interestCount: v.interests.length } : {}), ...(Array.isArray(v.recommendations) ? { candidateCount: v.recommendations.length } : {}), ...(tool === 'compare_cultural_signals' ? { scenarioCount: 2 } : {}) };
      async function audit(value: unknown) { s.requests++; return service.audit(value, true); }
      let summary = '', output: unknown;
      try {
        if (tool === 'resolve_entities') {
          exact(v, ['query']); s.requests++;
          const result = await service.search(v);
          output = { ...result, confirmationRequired: true, ambiguity: result.entities.length > 1 ? 'AMBIGUOUS' : result.entities.length ? 'HUMAN_CONFIRMATION_REQUIRED' : 'EMPTY' };
          summary = `${result.entities.length} movie matches; no identity auto-selected`;
        } else if (tool === 'evaluate_candidates') {
          exact(v, ['interests', 'recommendations']);
          s.evaluation = undefined; s.alternate = undefined; s.proposal = undefined;
          const result = await audit(v); s.evaluation = result;
          output = result; summary = `${result.status}; coverage ${result.coverage.returned}/${result.coverage.total}`;
        } else if (tool === 'compare_cultural_signals') {
          exact(v, ['interestsA', 'interestsB', 'recommendations']);
          if (!Array.isArray(v.interestsA) || !Array.isArray(v.interestsB) || v.interestsA.length !== 1 || v.interestsB.length !== 1 || object(v.interestsA[0]).id === object(v.interestsB[0]).id) throw new QlooError('INVALID_INPUT');
          s.evaluation = undefined; s.alternate = undefined; s.proposal = undefined;
          const a = await audit({ interests: v.interestsA, recommendations: v.recommendations });
          s.evaluation = a;
          if (a.status !== 'SUCCESS') { output = { status: 'INCONCLUSIVE', a, b: null }; summary = 'A has incomplete coverage; B was not called'; }
          else {
            const b = await audit({ interests: v.interestsB, recommendations: v.recommendations }); s.alternate = b;
            const changed = b.status === 'SUCCESS' && a.rows.some(r => { const other = b.rows.find(x => x.id === r.id); return other?.qlooRank !== r.qlooRank || (typeof other?.affinity === 'number' && typeof r.affinity === 'number' && other.affinity !== r.affinity); });
            output = { status: b.status !== 'SUCCESS' || !changed ? 'INCONCLUSIVE' : 'OBSERVED_EVIDENCE_DIFFERENCE', a, b };
            summary = `${b.status}; ${changed ? 'order or observed affinity differs' : 'no evidence difference established'}; only signal changed`;
          }
        } else {
          exact(v, []); s.proposal = revisionFrom(s.evaluation); output = s.proposal; summary = s.proposal.status;
        }
        s.events.push({ tool, timestamp: new Date(now()).toISOString(), outcome: 'COMPLETED', summary, inputSummary, caller: s.caller });
        return { output, passport: passport(s) };
      } catch (e) {
        const category = e instanceof QlooError ? e.category : 'INTERNAL_ERROR';
        // End session after any upstream/validation error; no hidden retries or stale proposal.
        s.stopped = true; s.evaluation = undefined; s.alternate = undefined; s.proposal = undefined;
        s.events.push({ tool, timestamp: new Date(now()).toISOString(), outcome: category, summary: 'Abstained; session stopped; no automatic retry', inputSummary, caller: s.caller });
        throw e;
      } finally { s.busy = false; }
    },
  };
}
