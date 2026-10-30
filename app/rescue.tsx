'use client';
import { useEffect, useState } from 'react';
import type { Entity, Selection } from '../lib/contracts';
import type { EvidencePassport } from '../lib/audit-tools';
import history from '../evidence/gate2a1-ab.json';
import { productError } from '../lib/product-errors';
import {rescuePassport,type ReviewDecision} from '../lib/rescue-report';

export default function Rescue({ passport, invoke, selection, disabled }: {
  passport: EvidencePassport | null;
  invoke: (tool: string, args: unknown) => Promise<unknown>;
  selection: { interests: Selection[]; recommendations: Selection[] };
  disabled: boolean;
}) {
  const proposal = passport?.proposal ?? null;
  const [decision, setDecision] = useState<ReviewDecision>('PENDING');
  const [decidedAt, setDecidedAt] = useState<string | null>(null);
  const [query, setQuery] = useState('Paddington 2');
  const [matches, setMatches] = useState<Entity[]>([]);
  const [alternate, setAlternate] = useState<Entity | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [lastComparison, setComparison] = useState<{ status: string } | null>(null);
  const comparison = passport?.challenge ? lastComparison : null;
  useEffect(() => { setDecision('PENDING'); setDecidedAt(null); }, [passport?.evaluation?.provenance.requestId]);
  async function run(task: () => Promise<void>) {
    setBusy(true); setError('');
    try { await task(); } catch (e) { setError(e instanceof Error ? e.message : 'UNAVAILABLE'); }
    finally { setBusy(false); }
  }
  function download() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(rescuePassport(passport,decision,decidedAt), null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'tasteprobe-evidence-passport.json'; a.click(); URL.revokeObjectURL(url);
  }
  return <section className="panel rescue" aria-labelledby="rescue-title">
    <p className="eyebrow">AGENTIC CULTURAL AUDIT · AGENT-INVOKABLE TOOLS</p>
    <h3 id="rescue-title">Rescue My Recommendations</h3>
    <p className="muted">Input → Investigate → Challenge → Improve → Evidence Passport</p>
    <p>Tools are executed on request by you or an external agent. No autonomous LLM is connected. Your intent guides the audit; it never changes safety rules.</p>
    <div className="comparison"><div><p className="eyebrow">BEFORE</p><ol>{passport?.evaluation?.rows.map(r => <li key={r.id}>{r.name} ({r.year ?? 'year unavailable'})</li>)}</ol></div><div><p className="eyebrow">AFTER · PROPOSED ORDER</p>{proposal?.status === 'PROPOSED' ? <ol>{proposal.after.map((name,i) => <li key={i}>{name}</li>)}</ol> : <p>No proposal yet. Complete evidence and human review are required.</p>}</div></div>
    <div className="interpretation"><strong>WHY</strong><p>{proposal?.why ?? 'Ask the revision tool to use the verified Qloo order. No new films or satisfaction percentages will be generated.'}</p></div>
    {passport?.evaluation && <details><summary>Inspect current Qloo evidence</summary><p>Retrieved {passport.evaluation.provenance.timestamp} · HTTP {passport.evaluation.provenance.httpStatus} · Coverage {passport.evaluation.coverage.returned}/{passport.evaluation.coverage.total}. Affinity values are observed cultural relationships, not satisfaction probabilities.</p><div className="evidence-table-wrap"><table className="evidence-table"><caption>Confirmed candidates under the selected cultural signals</caption><thead><tr><th scope="col">Movie</th><th scope="col">A rank</th><th scope="col">A affinity</th>{passport.challenge && <><th scope="col">B rank</th><th scope="col">B affinity</th></>}</tr></thead><tbody>{passport.evaluation.rows.map(row => { const b = passport.challenge?.rows.find(x => x.id === row.id); return <tr key={row.id}><th scope="row">{row.name}</th><td>{row.qlooRank ?? 'Unavailable'}</td><td>{row.affinity?.toFixed(6) ?? 'Unavailable'}</td>{passport.challenge && <><td>{b?.qlooRank ?? 'Unavailable'}</td><td>{b?.affinity?.toFixed(6) ?? 'Unavailable'}</td></>}</tr>; })}</tbody></table></div><p>{passport.evaluation.limitations.join(' ')}</p></details>}
    <div className="rescue-actions"><button className="button primary" disabled={disabled || busy || !passport?.evaluation} onClick={() => void run(async () => { await invoke('propose_evidence_based_revision', {}); setDecision('PENDING'); setDecidedAt(null); })}>{busy ? 'Executing tool…' : 'Propose evidence-based revision'}</button>{proposal?.status === 'PROPOSED' && <><button className="button secondary" disabled={busy} onClick={() => { setDecision('APPROVED'); setDecidedAt(new Date().toISOString()); }}>Approve proposal</button><button className="button secondary" disabled={busy} onClick={() => { setDecision('REJECTED'); setDecidedAt(new Date().toISOString()); }}>Keep original list</button></>}<span role="status">{decision}</span></div>
    <details><summary>Challenge the cultural signal · LIVE</summary><p>A new contrast uses up to three Qloo calls: one Search, then two Insights with identical candidates and parameters. Confirm the alternative identity first. Only one signal per scenario is supported.</p><label htmlFor="challenge">Alternative movie</label><input id="challenge" value={query} maxLength={80} onChange={e => { setQuery(e.target.value); setMatches([]); setAlternate(null); }}/><button className="button secondary" disabled={disabled || busy} onClick={() => void run(async () => { const data = await invoke('resolve_entities', { query }) as { entities: Entity[] }; setMatches(data.entities); setAlternate(null); })}>Find alternative identity</button>{matches.map(e => <div className="match" key={e.id}><span>{e.name} ({e.year ?? 'year unavailable'})</span><button className="button secondary small" disabled={busy} onClick={() => setAlternate(e)}>{alternate?.id === e.id ? 'Confirmed' : 'Confirm this film'}</button></div>)}<button className="button primary" disabled={disabled || busy || !alternate || selection.interests.length !== 1 || selection.recommendations.length < 3} onClick={() => void run(async () => { setDecision('PENDING'); setComparison(await invoke('compare_cultural_signals', { interestsA: selection.interests, interestsB: [{ id: alternate!.id, proof: alternate!.proof, confirmed: true }], recommendations: selection.recommendations }) as { status: string }); })}>Compare signals with Qloo · 2 calls</button>{comparison && <p role="status">{comparison.status.replaceAll('_', ' ')}. Inspect both requests and rankings in the Evidence Passport. The proposal continues to use scenario A.</p>}</details>
    <details><summary>Cultural Stress Test · historical LIVE evidence</summary><p>Captured {history.timestamp}. Historical Qloo responses, not a current query. Arrival (2016) versus Paddington 2 (2017); same three candidates, coverage 3/3. No API call is made by opening this example.</p><div className="comparison">{(['A','B'] as const).map(key => <div key={key}><strong>{history.signals[key].name}</strong><ol>{history.scenarios[key].rows.map(row => <li key={row.idHash}>{history.candidates.find(c => c.idHash === row.idHash)?.name ?? 'Identity unavailable'} — {row.affinity.toFixed(6)}</li>)}</ol></div>)}</div><p>Observed query.affinity, rounded. Not probabilities. One A/B pair does not establish general causality. This historical capture has an offline verifier in the project repository.</p></details>
    <details open><summary>INVESTIGATION · actual tool executions</summary>{passport?.events.length ? <ol className="tool-events">{passport.events.map((e,i) => <li key={i}><strong>{e.tool}</strong><span>{e.outcome} · {e.caller} · {e.timestamp}</span><p>{e.summary}</p></li>)}</ol> : <p>No tools executed in this session.</p>}<p>Conservative Qloo budget used: {passport?.budget.used ?? 0}/12 · Tool steps: {passport?.budget.steps ?? 0}/16. No model reasoning is recorded.</p></details>
    {error && <p className="error" role="alert">{productError(error)} No result inferred. Review the passport; failed sessions stop without retries.</p>}
    <button className="button secondary" disabled={!passport || busy} onClick={download}>Export Evidence Passport</button>
  </section>;
}
