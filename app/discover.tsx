'use client';
import { useEffect, useRef, useState } from 'react';
import type { DiscoveryResult, Entity, Health, SearchResult } from '../lib/contracts';
import { requestJson, requestDiagnostic, type OperatorDiagnostic } from '../lib/browser-request';
import { productError } from '../lib/product-errors';
import { discoveryPassport, type DiscoveryActivity } from '../lib/discovery-report';
import MovieArtwork from './movie-artwork';
import CulturalResults from './cultural-results';
import {useMovieVisuals} from '../lib/use-movie-visuals';
import type { VisualResult, MovieVisual } from '../lib/tmdb/contracts';
import { culturalInsights } from '../lib/cultural-insights';

export default function Discover({ onAudit, request = requestJson, synthetic = false, reviewVisual }: { onAudit: () => void; request?: typeof requestJson; synthetic?: boolean; reviewVisual?: MovieVisual | null }) {
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState<Entity[]>([]);
  const [matches, setMatches] = useState<Entity[] | null>(null);
  const [health, setHealth] = useState<Health | null>(null);
  const [busy, setBusy] = useState<'search' | 'discover' | null>(null);
  const [error, setError] = useState('');
  const [diagnostic, setDiagnostic] = useState<OperatorDiagnostic | null>(null);
  const [lastAction, setLastAction] = useState<'search' | 'discover'>('search');
  const [result, setResult] = useState<DiscoveryResult | null>(null);
  const [visuals,setVisuals] = useState<VisualResult|null>(null);
  const [events, setEvents] = useState<DiscoveryActivity[]>([]);
  const [editing, setEditing] = useState(false);
  const outcomeHeading = useRef<HTMLHeadingElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const inputHeading = useRef<HTMLHeadingElement>(null);
  if (synthetic && request === requestJson) throw new Error('SYNTHETIC_TRANSPORT_REQUIRED');
  const identityImages=useMovieVisuals([...new Map([...(matches ?? []),...favorites].map(m=>[m.id,m])).values()],synthetic);
  const configured = health?.status === 'CONFIGURED_NOT_VERIFIED';
  const hasOutcome = Boolean(result || (error && lastAction === 'discover') || busy === 'discover');
  const compact = hasOutcome && !editing;
  const state = busy === 'search' ? 'SEARCHING' : busy === 'discover' ? 'ANALYZING' : error ? 'ERROR' : result?.status ?? (health?.status === 'BLOCKED_LIVE' ? 'BLOCKED_LIVE' : matches?.length ? 'SELECT_IDENTITY' : favorites.length ? 'CONFIRMED' : 'EMPTY');
  async function checkHealth() { try { setHealth(await request<Health>('/api/health')); } catch (e) { setError('NETWORK'); setDiagnostic(requestDiagnostic(e)); } }
  useEffect(() => { void checkHealth(); }, []);
  useEffect(() => { if (compact) outcomeHeading.current?.focus(); }, [compact, result, error]);
  useEffect(() => { if (editing) (input.current?.disabled ? inputHeading.current : input.current)?.focus(); }, [editing]);
  function editFavorites() { setEditing(true); setError(''); setDiagnostic(null); }
  async function search() {
    setBusy('search'); setError(''); setDiagnostic(null); setLastAction('search'); setMatches(null);
    const timestamp = new Date().toISOString();
    try {
      const data = await request<SearchResult>('/api/entities/search', { query });
      setMatches(data.entities);
      setEvents(e => [...e, { operation: 'resolve_entities', timestamp, outcome: 'RESPONSE_RECEIVED', summary: synthetic ? `${data.entities.length} synthetic fixture identities; no Qloo request` : `${data.entities.length} verified movie matches; no automatic selection` }]);
    } catch (e) { const code = e instanceof Error ? e.message : 'UNAVAILABLE'; setError(code); setDiagnostic(requestDiagnostic(e)); setEvents(a => [...a, { operation: 'resolve_entities', timestamp, outcome: code, summary: 'Request failed; no identity inferred' }]); }
    finally { setBusy(null); }
  }
  function confirm(e: Entity) {
    if (favorites.some(f => f.id === e.id)) { setError('DUPLICATE_ENTITY'); return; }
    if (favorites.length >= 3) return;
    setFavorites(f => [...f, e]); setMatches(null); setQuery(''); setError(''); setResult(null);
  }
  async function discover() {
    setEditing(false); setBusy('discover'); setError(''); setDiagnostic(null); setLastAction('discover'); setResult(null); setVisuals(null);
    const timestamp = new Date().toISOString();
    try {
      const data = await request<DiscoveryResult>('/api/discover', { interests: favorites.map(e => ({ id: e.id, proof: e.proof, confirmed: true })) });
      setResult(data); setEvents(e => [...e, { operation: 'discover_movies', timestamp, outcome: data.status, summary: synthetic ? `${data.returned} synthetic fixture recommendations; no Qloo request` : `${data.returned} validated recommendations returned by Qloo` }]);
    } catch (e) { const code = e instanceof Error ? e.message : 'UNAVAILABLE'; setError(code); setDiagnostic(requestDiagnostic(e)); setEvents(a => [...a, { operation: 'discover_movies', timestamp, outcome: code, summary: 'Request failed; no recommendations inferred' }]); }
    finally { setBusy(null); }
  }
  function exportPassport() {
    const url = URL.createObjectURL(new Blob([JSON.stringify(discoveryPassport(favorites, result, events, synthetic, visuals), null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = synthetic ? 'SYNTHETIC-NOT-LIVE-tasteprobe-passport.json' : 'tasteprobe-discovery-passport.json'; a.click(); URL.revokeObjectURL(url);
  }
  const errorPanel = <div className="error discovery-error" role="alert"><strong>{error === 'TIMEOUT' ? 'The connection took too long.' : 'We could not complete that request.'}</strong><p>{productError(error)}</p><button className="button secondary" disabled={!!busy || !configured || (lastAction === 'discover' && !favorites.length)} onClick={() => void (lastAction === 'discover' ? discover() : search())}>Retry {lastAction === 'discover' ? 'discovery' : 'search'}</button>{diagnostic && <details><summary>Diagnostic details for the workspace owner</summary><p>{diagnostic.code} · {diagnostic.layer} · HTTP {diagnostic.httpStatus ?? 'not received'} · Reason: {diagnostic.reason}</p>{diagnostic.requestId && <p>Request: {diagnostic.requestId} · Upstream attempted: {String(diagnostic.upstreamAttempted)} · Qloo HTTP: {diagnostic.upstreamStatus ?? 'not received'} · Transport: {diagnostic.transportCode ?? 'not identified'}</p>}</details>}</div>;
  return <div className={`discover-shell ${compact ? 'results-focused' : ''}`}>
    <header className="discover-header"><a className="brand" href="/">TasteProbe<span className="brand-dot">.</span></a><span className="discover-wordmark">CULTURE. CONNECTION. CINEMA.</span></header>
    <main className="discover-main">
      {!compact && <section className="discover-hero"><p className="eyebrow">A DIFFERENT WAY TO FIND YOUR NEXT FILM</p><h1>Discover your next<br/><span>favorite movie.</span></h1><p>Tell us what you love. TasteProbe explores cultural connections with Qloo.</p></section>}
      <section hidden={compact} className="discovery-input panel" aria-labelledby="favorites-title">
        <div className="discovery-heading"><div><p className="eyebrow">START WITH SOMETHING YOU LOVE</p><h2 id="favorites-title" ref={inputHeading} tabIndex={-1}>Your favorites set the scene.</h2></div><span className="pill neutral">{favorites.length} / 3 CONFIRMED</span></div>
        <form onSubmit={e => { e.preventDefault(); void search(); }}><label htmlFor="favorite-query">Find a favorite movie</label><div className="movie-search"><input ref={input} id="favorite-query" value={query} onChange={e => { setQuery(e.target.value); setMatches(null); }} placeholder="Try Arrival" minLength={2} maxLength={80} required disabled={!!busy || favorites.length >= 3}/><button className="button secondary" disabled={!!busy || !configured || favorites.length >= 3} type="submit">{busy === 'search' ? 'Searching…' : 'Find movie'}</button></div><p className="field-help">Choose one to three films. Check the title and year before confirming.</p></form>
        {busy === 'search' && <p className="loading" role="status"><span className="spinner"/>{synthetic ? 'Simulating local fixture search…' : 'Searching Qloo for matching identities…'}</p>}
        {matches && <div className="identity-results" aria-live="polite"><h3>{matches.length ? 'Which movie did you mean?' : 'No matching movie found.'}</h3>{!matches.length && <p>Try another spelling or a different title. We have not selected a film.</p>}{matches.map(e => <div className="identity-card" key={e.id}><MovieArtwork name={e.name} year={e.year} visual={identityImages[e.id]}/><div><strong>{e.name}</strong><p>{e.year ?? 'Release year unavailable'} · {synthetic ? 'SYNTHETIC identity' : 'Verified Qloo movie identity'}</p><button className="button secondary" disabled={!!busy || favorites.some(f => f.id === e.id)} onClick={() => confirm(e)}>Confirm this movie</button></div></div>)}</div>}
        {!!favorites.length && <div className="favorite-cards" aria-label="Confirmed favorites">{favorites.map(e => <article className="favorite-card" key={e.id}><MovieArtwork name={e.name} year={e.year}/><div><strong>{e.name}</strong><p>{e.year ?? 'Year unavailable'} · Confirmed</p><button className="text-button" disabled={!!busy} onClick={() => { setFavorites(a => a.filter(f => f.id !== e.id)); setResult(null); }}>Remove {e.name}</button></div></article>)}</div>}
        <div className="discover-cta"><button className="button primary" disabled={!!busy || !configured || !favorites.length} onClick={() => void discover()}>Discover my movies <span aria-hidden="true">↗</span></button><span>New recommendations. No prewritten shortlist.</span></div>
        {result && editing && <button className="text-button back-to-results" disabled={!!busy} onClick={() => { setError(''); setDiagnostic(null); setEditing(false); }}>Return to these results</button>}
        {health?.status === 'BLOCKED_LIVE' && <p className="blocked-hint">BLOCKED_LIVE · Live recommendations need authorized server access. No results have been invented.</p>}
        {!health && <p role="status">Checking connection… <button className="text-button" onClick={() => void checkHealth()}>Check again</button></p>}
        {error && lastAction === 'search' && errorPanel}
      </section>
      {!compact && <p className="audit-invitation">Already have AI recommendations? <button className="text-button" onClick={onAudit}>Audit them →</button></p>}
      {hasOutcome && <section className="discovery-results" hidden={editing} aria-labelledby="discovery-results-title" aria-busy={busy === 'discover'}>
        <div className="outcome-summary"><div><span className="eyebrow">YOUR CULTURAL STARTING POINTS</span><ul className="favorite-chips">{favorites.map(f => <li key={f.id}><strong>{f.name}</strong><span>{f.year ?? 'Year unavailable'} · Confirmed</span></li>)}</ul></div><button className="button secondary" disabled={!!busy} onClick={editFavorites}>Edit favorites</button></div>
        <div className="discovery-heading outcome-intro"><div><p className="eyebrow">CULTURAL CONNECTIONS, NOT GUESSWORK</p><h1 className="outcome-title" id="discovery-results-title" ref={outcomeHeading} tabIndex={-1}>{busy ? 'Exploring your next possibilities.' : error ? error === 'TIMEOUT' ? 'A little longer than expected.' : 'Your discovery is on pause.' : result?.movies.length ? 'Your next possibilities.' : 'Not enough evidence yet.'}</h1>{result && <p>{synthetic ? `${result.returned} illustrative movies from local fixtures. Not Qloo evidence.` : `${result.returned} verified new movies, connected to your confirmed favorites.`}</p>}</div>{(synthetic || result) && <span className="pill">{synthetic ? 'SYNTHETIC · NOT LIVE' : 'QLOO RESPONSE VERIFIED'}</span>}</div>
        {busy === 'discover' && <div className="discovery-waiting" role="status"><span className="spinner"/><p>{synthetic ? 'Running the local synthetic review. No Qloo request is made.' : 'Qloo is evaluating your confirmed favorites. Waiting for its response…'}</p></div>}
        {error && lastAction === 'discover' && errorPanel}
        {result && !result.movies.length && <div className="insufficient-card"><span className="eyebrow">NO RECOMMENDATIONS INFERRED</span><h2>Give the search another starting point.</h2><p>{synthetic ? 'This local fixture represents insufficient evidence. No Qloo request was made.' : 'No valid new movies were returned for this request. We cannot support a recommendation from this evidence.'} Add another favorite or try a different confirmed film.</p><button className="button primary" onClick={editFavorites}>Edit or add a favorite</button></div>}
        {result && <CulturalResults result={result} synthetic={synthetic} onVisuals={setVisuals} reviewVisual={reviewVisual}/>}
        {!busy && <section className="panel passport-panel" aria-labelledby="passport-title"><div className="passport-intro"><div><p className="eyebrow">KEEP THE CONTEXT</p><h2 id="passport-title">Your Cultural Evidence Passport</h2><p>Your favorites, the evidence received, and the limits of what it can tell you.</p></div><button className="button primary" onClick={exportPassport}>Download Passport <span aria-hidden="true">↓</span></button></div><dl className="passport-facts"><div><dt>Source</dt><dd>{synthetic ? 'SYNTHETIC · NOT LIVE' : result ? 'Qloo cultural evidence' : 'No verified response'}</dd></div><div><dt>Verified new films</dt><dd>{result ? `${result.returned} of ${result.requested} requested` : 'Unavailable'}</dd></div><div><dt>Featured recommendation</dt><dd>{result ? culturalInsights(result).featured?.name ?? 'Unavailable' : 'Unavailable'}</dd></div><div><dt>What this means</dt><dd>{synthetic ? 'Layout review only' : 'Cultural relationships, not a promise of enjoyment'}</dd></div></dl><p className="passport-limitation">{result?.movies.length ? 'Affinity is not a satisfaction percentage. Artwork is optional and separate from Qloo cultural evidence.' : 'No supported recommendations are available. You can still export your confirmed inputs and the limitation.'}</p><details id="discovery-limitations"><summary>Advanced evidence & activity</summary>{result && <p>{synthetic ? 'Fixture generated' : 'Retrieved'} {result.provenance.timestamp} · {synthetic ? 'Simulated status' : 'HTTP'} {result.provenance.httpStatus} · {result.discarded} excluded during validation.</p>}<ul>{(result?.limitations ?? ['No verified discovery response was received. No recommendations are inferred.']).map(l => <li key={l}>{l}</li>)}</ul><ol>{events.map((e,i) => <li key={i}>{e.operation} · {e.outcome} · {e.timestamp}<p>{e.summary}</p></li>)}</ol><p>Tools are human-directed. No autonomous LLM decision is claimed.</p></details></section>}
      </section>}
      <footer><span>TasteProbe · Cultural evidence, considered.</span><p>{synthetic ? 'SYNTHETIC review. No live response received.' : result ? `Live response received ${result.provenance.timestamp}` : configured ? 'Connection configured. Live access is verified only after a successful response.' : 'No live evidence received.'}</p></footer><span className="sr-only" role="status">{state}</span>
    </main>
  </div>;
}
