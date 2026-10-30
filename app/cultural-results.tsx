'use client';
import KpiIcon from './kpi-icon';
import { useEffect, useState } from 'react';
import type { VisualResult, MovieVisual } from '../lib/tmdb/contracts';
import { visualMatches } from '../lib/tmdb/policy';
import { loadMovieVisuals } from '../lib/browser-visuals';
import TmdbCredits from './tmdb-credits';
import type { DiscoveryResult, DiscoveredMovie } from '../lib/contracts';
import { culturalInsights } from '../lib/cultural-insights';
import { attributedSignals } from '../lib/discovery-report';
import MovieArtwork from './movie-artwork';

export default function CulturalResults({ result, synthetic = false, onVisuals, reviewVisual }: { result: DiscoveryResult; synthetic?: boolean; onVisuals?: (value: VisualResult | null) => void; reviewVisual?: MovieVisual | null }) {
  synthetic = synthetic || result.provenance.source === 'SYNTHETIC fixture';
  const [visuals,setVisuals]=useState<VisualResult|null>(null);
  useEffect(()=>{
    let current=true;setVisuals(null);onVisuals?.(null);
    if(synthetic){
      const movie=result.movies.find(m=>visualMatches(m,reviewVisual));
      if(movie&&reviewVisual)setVisuals({status:'IMAGE_PROVIDER_READY',images:{[movie.id]:reviewVisual}});
      return;
    }
    if(!result.movies.length)return;
    void loadMovieVisuals(result.movies.map(({id,name,year,type})=>({id,name,year,type}))).then(value=>{if(current){setVisuals(value);onVisuals?.(value);}});
    return ()=>{current=false;};
  },[result,synthetic,onVisuals,reviewVisual]);
  function visual(movie:DiscoveredMovie){const v=visuals?.images?.[movie.id];return visualMatches(movie,v)?v:null;}
  const insight = culturalInsights(result);
  const featured = result.movies.find(m => m.id === insight.featured?.id);
  function copy(movie: DiscoveredMovie) {
    const signals = attributedSignals(movie.explainability, result.favorites);
    return synthetic ? 'Illustrative local fixture. Not Qloo evidence.' : signals.length ? `Qloo attributed this result to ${signals.join(', ')}.` : 'Returned for your confirmed interests. Individual attribution is unavailable.';
  }
  function details(movie: DiscoveredMovie, featured = false) {
    return <details className="cultural-why"><summary>{featured ? 'Explore why' : 'Why this movie?'}</summary><p>{copy(movie)}</p><p>Source: {synthetic ? 'SYNTHETIC fixture · NOT LIVE' : result.provenance.source}. {result.provenance.timestamp}</p><p>Position {movie.rank} in the returned results. Artwork: {visual(movie)?.posterUrl ? 'TMDB, matched by title and release year' : 'original TasteProbe illustration; not an official poster'}.</p><p>Affinity is an observed cultural relationship, not a probability of satisfaction. Missing attribution does not support a specific explanation.</p></details>;
  }
  const value = (v: number | null) => v === null || !Number.isFinite(v) ? 'Not available' : v.toFixed(4);
  return <>
    <section className="cultural-dashboard" aria-label="Cultural insights dashboard"><dl>
      <div><dt><KpiIcon name="clapperboard"/>Total movies discovered</dt><dd>{insight.dashboard.totalMovies}</dd><p>{synthetic ? 'Illustrative films' : 'Validated movies returned'}</p></div>
      <div><dt><KpiIcon name="heart"/>Your cultural starting points</dt><dd>{insight.dashboard.startingPoints}</dd><p>Confirmed favorites</p></div>
      <div><dt><KpiIcon name="sparkles"/>{synthetic ? 'Illustrative affinity' : 'Top cultural affinity'}</dt><dd>{value(insight.dashboard.topAffinity)}</dd><p>{insight.dashboard.topAffinity === null ? 'No numeric affinity was provided' : `Observed for ${insight.dashboard.affinitiesAvailable} of ${insight.dashboard.totalMovies} films`}</p></div>
      <div><dt><KpiIcon name="shield-check"/>Qloo evidence</dt><dd className="evidence-value">{synthetic ? 'SYNTHETIC · NOT LIVE' : 'Response verified'}</dd><p>{insight.dashboard.totalMovies} of {insight.dashboard.requested} requested · <a href="#discovery-limitations">View limitations</a></p></div>
    </dl><p className="dashboard-note">{synthetic ? 'Local visual review only. No Qloo request.' : 'Evidence from Qloo, based on your confirmed interests.'} Affinity is not a satisfaction percentage.</p></section>
    {!synthetic && result.movies.length>0 && <p className="visual-status" role="status">{!visuals ? 'Loading optional artwork... Your Qloo results are ready.' : Object.keys(visuals.images??{}).length ? 'Artwork matched by TMDB title and release year. Cultural evidence stays with Qloo.' : 'Artwork unavailable. Original illustrative covers are shown; Qloo results are unchanged.'}</p>}
    {featured && <article className="featured-movie" aria-labelledby="featured-movie-title"><div className="featured-cover"><MovieArtwork name={featured.name} year={featured.year} variant={featured.rank - 1} visual={visual(featured)}/><span className="recommendation-rank" aria-label={`Qloo result position ${featured.rank}`}>{String(featured.rank).padStart(2,'0')}</span></div><div className="featured-copy"><p className="eyebrow">{synthetic ? 'SYNTHETIC FEATURE · NOT LIVE' : insight.featured?.basis === 'HIGHEST_OBSERVED_AFFINITY' ? 'TOP CULTURAL AFFINITY' : 'FIRST QLOO RESULT'}</p><h2 id="featured-movie-title">{featured.name}</h2><p className="featured-year">{featured.year ?? 'Release year unavailable'}</p><div className="cultural-badges"><span>{synthetic?'SYNTHETIC':'Qloo verified'}</span><span>{visual(featured)?.posterUrl?'TMDB artwork':'Illustrative cover'}</span><span>Based on {result.favorites.map(f=>f.name).join(', ')}</span></div><p className="featured-explanation">{copy(featured)}</p><div className="affinity-label"><span>{synthetic ? 'Illustrative affinity' : 'Observed affinity'}</span><strong>{value(featured.affinity)}</strong></div>{insight.featured?.tied && <p className="featured-footnote">Shared highest observed affinity. Qloo order breaks the tie.</p>}{visual(featured)?.overview && <p className="tmdb-synopsis"><span>Synopsis | TMDB</span>{visual(featured)!.overview!.slice(0,220)}{visual(featured)!.overview!.length>220?'...':''}</p>}{details(featured,true)}<p className="featured-footnote">{synthetic ? 'Local fixture' : 'Cultural evidence: Qloo'} · Visual: {visual(featured)?.posterUrl ? 'TMDB' : 'TasteProbe illustration'}</p></div></article>}
    {!!insight.remaining.length && <><div className="more-movies-heading"><p className="eyebrow">KEEP EXPLORING</p><h2>More cultural connections.</h2><p>Remaining movies retain their Qloo result positions.</p></div><div className="movie-grid">{insight.remaining.map(movie => <article className="movie-card" key={movie.id} aria-labelledby={`movie-${movie.id}`}><div className="movie-cover"><MovieArtwork name={movie.name} year={movie.year} variant={movie.rank - 1} visual={visual(movie)}/><span className="recommendation-rank" aria-label={`Recommendation ${movie.rank}`}>{String(movie.rank).padStart(2,'0')}</span></div><div className="movie-copy"><span className="tiny-label">{synthetic ? 'SYNTHETIC · NOT LIVE' : 'EVIDENCE FROM QLOO'}</span><h2 id={`movie-${movie.id}`}>{movie.name}</h2><p className="movie-year">{movie.year ?? 'Release year unavailable'}</p><p className="movie-explanation">{copy(movie)}</p><div className="affinity-label"><span>{synthetic ? 'Illustrative affinity' : 'Observed affinity'}</span><strong>{value(movie.affinity)}</strong></div>{details(movie)}</div></article>)}</div></>}
    {(!synthetic || reviewVisual) && <TmdbCredits/>}
  </>;
}
