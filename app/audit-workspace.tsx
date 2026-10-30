'use client';
import { useEffect, useState } from 'react';
import type { AuditResult, Entity, Health, SearchResult } from '../lib/contracts';
import { createReport } from '../lib/report';
import { requestJson } from '../lib/browser-request';
import Rescue from './rescue';
import MovieArtwork from './movie-artwork';
import TmdbCredits from './tmdb-credits';
import {useMovieVisuals} from '../lib/use-movie-visuals';
import type { EvidencePassport } from '../lib/audit-tools';

type Film = { query: string; role: 'interest' | 'recommendation'; selected?: Entity; matches?: Entity[] };
const messages: Record<string, string> = {
  FORBIDDEN_ORIGIN: 'This page and its server address do not match. Reopen TasteProbe at the local address shown by the server, then try again. Your list is still here.',
  SESSION_EXPIRED: 'This audit session expired. Return to Prepare your list and confirm the identities again.',
  BLOCKED_LIVE: 'Live evidence is unavailable. An authorized Qloo credential must be configured on the server. You can still prepare your shortlist and export your work.',
  AUTH: 'Qloo rejected the server credential. Ask the workspace owner to check authorized access.',
  RATE_LIMIT: 'Qloo has reached its request limit. Please wait before trying again.',
  REQUEST_BUDGET: 'The local request budget is exhausted. Wait a minute; the workspace owner may need to restart after the 60-call session limit.',
  TIMEOUT: 'Qloo took too long to respond. No result was inferred. You can retry manually.',
  IDENTITY_EXPIRED: 'An identity confirmation expired. Find and confirm the movies again.',
  IDENTITY_REQUIRED: 'Confirm each movie using a fresh Qloo search before evaluating.',
  INVALID_RESPONSE: 'Qloo returned a response we could not verify. We have withheld the result.',
  NETWORK: 'We could not reach Qloo. Your shortlist is still here.',
  DUPLICATE_ENTITY: 'Choose different movies for your interests and shortlist.',
};
const lines = (value: string) => value.split('\n').map(x => x.trim()).filter(Boolean);
export default function Home() {
  const [health, setHealth] = useState<Health | null>(null);
  const [healthError, setHealthError] = useState(false);
  const [step, setStep] = useState(0);
  const [interests, setInterests] = useState('');
  const [recommendations, setRecommendations] = useState('');
  const [films, setFilms] = useState<Film[]>([]);
  const [active, setActive] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<AuditResult | null>(null);
  const [searched, setSearched] = useState(false);
  const [intent, setIntent] = useState('Audit my shortlist against the films I love and propose a verifiable reordering.');
  const [toolSession, setToolSession] = useState('');
  const [passport, setPassport] = useState<EvidencePassport | null>(null);
  async function invoke(tool: string, args: unknown): Promise<unknown> {
    let session = toolSession;
    if (!session) {
      const created = await requestJson<{ session: string }>('/api/tools', { action: 'create', intent, caller: 'human-ui' });
      session = created.session; setToolSession(session);
    }
    try {
      const data = await requestJson<{ output: unknown; passport: EvidencePassport }>('/api/tools', { action: 'invoke', session, tool, arguments: args }, fetch, 22000);
      setPassport(data.passport); return data.output;
    } catch (e) {
      try { setPassport(await requestJson<EvidencePassport>('/api/tools', { action: 'passport', session })); } catch { /* No fabricated event on retrieval failure. */ }
      throw e;
    }
  }
  const selections = () => { const select = (f: Film) => ({ id: f.selected!.id, proof: f.selected!.proof, confirmed: true as const }); return { interests: films.filter(f => f.role === 'interest' && f.selected).map(select), recommendations: films.filter(f => f.role === 'recommendation' && f.selected).map(select) }; };
  const confirmed = films.filter(x => x.selected).length;
  const ready = health?.status === 'CONFIGURED_NOT_VERIFIED';
  const current = films[active];
  const identityImages=useMovieVisuals(current?.matches ?? []);
  async function checkHealth() {
    setHealth(null); setHealthError(false);
    try { setHealth(await requestJson<Health>('/api/health', undefined, fetch, 5000)); }
    catch { setHealthError(true); }
  }
  useEffect(() => { void checkHealth(); }, []);
  function prepare() {
    const seeds = lines(interests), list = lines(recommendations);
    if (seeds.length < 1 || seeds.length > 3 || list.length < 3 || list.length > 5 || [...seeds, ...list].some(x => x.length < 2 || x.length > 80 || /[<>\u0000-\u001f\u007f]/.test(x))) { setError('Add 1–3 interest movies and 3–5 recommendations, one title per line (2–80 characters each).'); return; }
    if (new Set([...seeds, ...list].map(x => x.toLocaleLowerCase())).size !== seeds.length + list.length) { setError('Each movie should appear only once across the two lists.'); return; }
    setFilms([...seeds.map(query => ({ query, role: 'interest' as const })), ...list.map(query => ({ query, role: 'recommendation' as const }))]);
    setActive(0); setResult(null); setError(''); setSearched(false); setStep(1); setToolSession(''); setPassport(null);
  }
  async function search() {
    if (!current) return;
    setBusy(true); setError(''); setSearched(false); setResult(null);
    try {
      const data = await invoke('resolve_entities', { query: current.query }) as SearchResult;
      setFilms(items => items.map((f, i) => i === active ? { ...f, matches: data.entities, selected: undefined } : f));
      setSearched(true);
    } catch (e) { setError(e instanceof Error ? e.message : 'UNAVAILABLE'); }
    finally { setBusy(false); }
  }
  function confirm(entity: Entity) {
    if (films.some((f, i) => i !== active && f.selected?.id === entity.id)) { setError('This movie is already selected. Choose a different identity.'); return; }
    setFilms(items => items.map((f, i) => i === active ? { ...f, selected: entity } : f)); setResult(null); setError('');
  }
  async function evaluate() {
    setBusy(true); setError(''); setResult(null);
    try {
      const selection = (f: Film) => ({ id: f.selected!.id, proof: f.selected!.proof, confirmed: true });
      const data = await invoke('evaluate_candidates', { interests: films.filter(f => f.role === 'interest').map(selection), recommendations: films.filter(f => f.role === 'recommendation').map(selection) }) as AuditResult;
      setResult(data); setStep(2);
    } catch (e) { setError(e instanceof Error ? e.message : 'UNAVAILABLE'); }
    finally { setBusy(false); }
  }
  function exportReport() {
    const report = createReport({ interests: lines(interests), recommendations: lines(recommendations), films, result, status: health?.status ?? 'UNAVAILABLE', lastError: error || null });
    const url = URL.createObjectURL(new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = 'tasteprobe-report.json'; a.click(); URL.revokeObjectURL(url);
  }
  return <div className="shell">
    <aside className="sidebar"><a className="brand" href="/" aria-label="TasteProbe home"><span className="brand-icon">◈</span> TasteProbe<span className="brand-dot">.</span></a><span className="workspace-label">YOUR WORKSPACE</span><nav aria-label="Workspace"><a className="nav-active" href="#workspace">▦ <span>Movie audit</span><span className="nav-count">01</span></a><a href="#method">◎ <span>How it works</span></a></nav><div className="sidebar-note"><span className="tiny-label">BUILT ON EVIDENCE</span><p>A little more context.<br/>A more considered shortlist.</p><div className="source-mark">Q <span>Powered by Qloo data<br/><small>When live access is available</small></span></div></div><span className="sidebar-foot">LOCAL PREVIEW</span></aside>
    <main id="workspace"><header><div className="breadcrumb">Workspace <span>/</span> <strong>Movie audit</strong></div><button className="button secondary small" onClick={exportReport}>↓ Export report</button></header>
      <section className="hero"><div><p className="eyebrow">CULTURAL INTELLIGENCE, WITH A PAPER TRAIL</p><h1>A good list.<br/><span>A better understanding.</span></h1><p className="intro">Your agent recommends. TasteProbe verifies.<br/>Explore how a movie shortlist relates to the culture you love.</p></div><div className="hero-seal" aria-hidden="true"><div className="seal-inner">◈</div><span>CONTEXT OVER GUESSWORK</span></div></section>
      <div className={`connection ${ready ? 'configured' : ''}`} role="status"><span className="status-dot"/><div><strong>{healthError ? 'Connection status unavailable' : health ? ready ? 'Server configured · live access unverified' : 'BLOCKED_LIVE · Qloo access required' : 'Checking workspace readiness…'}</strong><p>{ready ? 'Search and evaluation use real Qloo requests. A configured key does not prove authorized access.' : 'Prepare your list now. Live identity lookup and evaluation require an authorized server credential.'}</p></div>{healthError && <button className="button secondary small" onClick={() => void checkHealth()}>Retry connection</button>}<span className="pill">{ready ? 'NOT VERIFIED' : 'NO LIVE RESULTS'}</span></div>
      <section className="metrics" aria-label="Audit overview"><div><span>YOUR INTERESTS</span><strong>{String(lines(interests).length).padStart(2,'0')}<small> / 03 movies</small></strong></div><div><span>ORIGINAL SHORTLIST</span><strong>{String(lines(recommendations).length).padStart(2,'0')}<small> / 05 movies</small></strong></div><div><span>CONFIRMED IDENTITIES</span><strong>{String(confirmed).padStart(2,'0')}<small> / {films.length || '—'}</small></strong></div><div><span>EVIDENCE COVERAGE</span><strong>{result ? `${result.coverage.returned}/${result.coverage.total}` : '—'}<small>{result ? ' returned' : ' awaiting evaluation'}</small></strong></div></section>
      <div className="section-top"><div><p className="eyebrow">THE AUDIT WORKSPACE</p><h2>From intuition to inspection.</h2></div><span className="private-label">◇ Server-side credentials</span></div>
      <nav className="steps" aria-label="Audit steps">{['Prepare your list', 'Confirm identities', 'Compare evidence'].map((label, i) => <button key={label} className={step === i ? 'step active' : 'step'} aria-current={step === i ? 'step' : undefined} disabled={busy || (i === 1 && !films.length) || (i === 2 && !result)} onClick={() => { setStep(i); setError(''); }}><span>{i + 1}</span>{label}<small>{i === 0 ? 'THE INPUT' : i === 1 ? 'THE MATCH' : 'THE REVIEW'}</small></button>)}</nav>
      {error && <div className="error" role="alert"><strong>{'Please review this request'}</strong><p>{messages[error] ?? (['UNAVAILABLE','INTERNAL_ERROR','UPSTREAM','REQUEST_REJECTED','TimeoutError'].includes(error) ? 'The request could not be completed. No evidence was inferred. Please try again.' : error)}</p></div>}
      {step === 0 && <div className="workspace-grid audit-input-grid"><section className="panel input-panel"><div className="panel-title"><span className="icon-box">✳</span><div><h3>Start with your taste</h3><p>Movies in, cultural context out.</p></div><button className="text-button" onClick={() => { setInterests('Arrival'); setRecommendations('Interstellar\nBlade Runner 2049\nHer'); setFilms([]); setResult(null); setError(''); }}>Use sample input ↗</button></div><label htmlFor="interests">Movies you love <span>1–3 titles</span></label><p className="field-help" id="interest-help">Choose specific films as your cultural starting points.</p><textarea id="interests" aria-describedby="interest-help" rows={3} maxLength={242} placeholder={'Arrival\nEx Machina'} value={interests} onChange={e => { setInterests(e.target.value); setFilms([]); setResult(null); }}/><label htmlFor="recommendations">Your original recommendations <span>3–5 titles</span></label><p className="field-help" id="list-help">Paste a list from your AI agent or add your own. One film per line, in its original order.</p><textarea id="recommendations" aria-describedby="list-help" rows={5} maxLength={404} placeholder={'Interstellar\nBlade Runner 2049\nHer'} value={recommendations} onChange={e => { setRecommendations(e.target.value); setFilms([]); setResult(null); }}/><div className="input-footer"><span>Sample titles are inputs, never results.</span><button className="button primary" onClick={prepare}>Confirm movies <span>→</span></button></div></section></div>}
      {step === 1 && <div className="workspace-grid"><section className="panel"><div className="panel-title"><span className="icon-box">⌕</span><div><h3>Get the right movie</h3><p>Select a title, search, then explicitly confirm its identity.</p></div></div><div className="film-list">{films.map((film, i) => <button disabled={busy} key={`${film.role}-${i}`} onClick={() => { setActive(i); setSearched(false); setError(''); }} className={`film-row ${i === active ? 'selected' : ''}`}><>{film.selected && <MovieArtwork name={film.selected.name} year={film.selected.year} visual={identityImages[film.selected.id]}/>}</><span className="film-number">{film.selected ? '✓' : String(i + 1).padStart(2,'0')}</span><span><strong>{film.query}</strong><small>{film.role === 'interest' ? 'Cultural interest' : 'Original recommendation'}{film.selected ? ` · ${film.selected.name} · ${film.selected.year ?? 'year unavailable'}` : ' · Not confirmed'}</small></span></button>)}</div><div className="input-footer"><span>{confirmed} of {films.length} confirmed</span><button className="button primary" disabled={busy || !ready || confirmed !== films.length} onClick={evaluate}>{busy ? 'Working…' : 'Evaluate with Qloo →'}</button></div>{!ready && <p className="blocked-hint">BLOCKED_LIVE · No identity or ranking has been inferred.</p>}</section><section className="panel match-panel"><p className="eyebrow">IDENTITY RESOLUTION</p><h3 className="match-title">{current?.query}</h3><p className="muted">Remakes and namesakes happen. Check the title and release year before confirming. No result is selected automatically.</p><button className="button secondary" disabled={busy || !ready} onClick={search}>{busy ? 'Searching Qloo…' : 'Find matches in Qloo ↗'}</button><div aria-live="polite" aria-busy={busy}>{busy && <div className="loading"><span className="spinner"/>Waiting for a real response…</div>}{current?.matches?.map(entity => <div className="match" key={entity.id}><MovieArtwork name={entity.name} year={entity.year} visual={identityImages[entity.id]}/><div><strong>{entity.name}</strong><p>{entity.year ?? 'Release year unavailable'} · Movie</p><small>Qloo identity · {entity.id.slice(0,8)}…</small></div><button className="button secondary small" disabled={busy || current.selected?.id === entity.id} onClick={() => confirm(entity)}>{current.selected?.id === entity.id ? '✓ Confirmed' : 'Confirm this film'}</button></div>)}{searched && current?.matches?.length === 0 && <p className="empty-message">No verifiable movie matches returned. Edit the title or try another film. No identity has been inferred.</p>}{!current?.matches && !busy && <div className="empty compact"><span className="large-symbol">⌕</span><h3>{ready ? 'Ready to look closer' : 'Live search is blocked'}</h3><p>{ready ? 'Search only when you’re ready. Each lookup uses one Qloo request.' : 'An authorized Qloo key is required on the server. Your original list remains available.'}</p></div>}</div></section></div>}
      {step === 2 && result && <section className="panel results"><div className="panel-title"><span className="icon-box">▤</span><div><h3>{result.status === 'SUCCESS' ? 'Your list, with cultural context' : 'Some evidence. An incomplete picture.'}</h3><p>{result.status === 'SUCCESS' ? 'Rank shifts are TasteProbe’s comparison of Qloo’s returned order.' : 'INSUFFICIENT EVIDENCE · No revised ranking is proposed.'}</p></div><span className="pill neutral">{result.coverage.returned}/{result.coverage.total} RETURNED</span></div><div className="audit-signal-strip" aria-label="Confirmed cultural signals">{films.filter(f=>f.role==='interest'&&f.selected).map(f=><article key={f.selected!.id}><MovieArtwork name={f.selected!.name} year={f.selected!.year} visual={identityImages[f.selected!.id]}/><div><span className="eyebrow">CONFIRMED SIGNAL</span><strong>{f.selected!.name}</strong><p>{f.selected!.year ?? 'Year unavailable'} | Qloo movie identity</p></div></article>)}</div><div className="comparison"><div><p className="eyebrow">ORIGINAL ORDER</p>{result.rows.map(row => <div className="comparison-row" key={row.id}><MovieArtwork name={row.name} year={row.year} visual={identityImages[row.id]}/><span className="film-number">{row.originalRank}</span><strong>{row.name}<small>{row.year ?? 'Year unavailable'}</small></strong></div>)}</div><div><p className="eyebrow">QLOO RETURNED ORDER {result.status !== 'SUCCESS' && '· PARTIAL'}</p>{[...result.rows].sort((a,b) => (a.qlooRank ?? 999) - (b.qlooRank ?? 999)).map(row => <div className="comparison-row" key={row.id}><MovieArtwork name={row.name} year={row.year} visual={identityImages[row.id]}/><span className="film-number">{row.qlooRank ?? '—'}</span><strong>{row.name}<small>{row.qlooRank === null ? 'Not returned · no negative inference' : 'Source: Qloo Insights'}</small><small>Observed affinity: {row.affinity?.toFixed(4) ?? 'Not available'}</small></strong><span className={`shift ${row.shift && row.shift > 0 ? 'up' : ''}`}>{row.shift === null ? '—' : row.shift === 0 ? 'Unchanged' : `${row.shift > 0 ? '↑' : '↓'} ${Math.abs(row.shift)}`}</span></div>)}</div></div><div className="interpretation"><strong>TasteProbe interpretation</strong><p>{result.status !== 'SUCCESS' ? 'Coverage is incomplete, so position changes would not be comparable across the full shortlist.' : result.rows.some(r => r.shift !== 0) ? 'Qloo returned these same movies in a different order. This is an observable divergence, not proof that one list is better.' : 'Qloo returned the same order as your original list. No ranking divergence was observed.'}</p></div><details><summary>Inspect provenance & limitations</summary><p>Source: {result.provenance.source} · {result.provenance.endpoint}</p><p>Retrieved: {result.provenance.timestamp} · HTTP {result.provenance.httpStatus}</p><p>Request reference: {result.provenance.requestId}</p><ul>{result.limitations.map(l => <li key={l}>{l}</li>)}</ul></details><div className="input-footer"><button className="text-button" onClick={() => setStep(1)}>← Review confirmed movies</button><button className="button primary" onClick={exportReport}>↓ Export evidence report</button></div></section>}
      {result && <section className="panel intent-panel"><label htmlFor="audit-intent">Your audit intention</label><input id="audit-intent" maxLength={500} value={intent} disabled={!!toolSession} onChange={e => setIntent(e.target.value)}/><p>Used as passport context. Tool selection is controlled by you or an external agent; no hosted LLM is connected.</p></section>}
      {Object.keys(identityImages).length>0 && <TmdbCredits/>}
      {result && <Rescue key={toolSession || 'new'} passport={passport} invoke={invoke} selection={selections()} disabled={busy || !ready}/>}
      <section className="method" id="method"><div><span className="tiny-label">A MORE THOUGHTFUL WORKFLOW</span><h3>Evidence before interpretation.</h3></div><div><strong>01 / Resolve</strong><p>Find and confirm the exact films you mean.</p></div><div><strong>02 / Inspect</strong><p>Ask Qloo about the same shortlist, with bounded requests.</p></div><div><strong>03 / Compare</strong><p>See what changed. Keep the sources and the limitations.</p></div></section><footer><span>◈ TasteProbe <small> / Culture, considered.</small></span><p>Aggregate cultural relationships do not prove personal preferences or future satisfaction.</p></footer>
    </main>
  </div>;
}
