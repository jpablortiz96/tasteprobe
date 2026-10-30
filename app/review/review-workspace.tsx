'use client';
import { useMemo, useState } from 'react';
import Discover from '../discover';
import { createSyntheticRequest, type ReviewScenario } from '../../lib/synthetic-review';
import type { MovieVisual } from '../../lib/tmdb/contracts';
export default function ReviewWorkspace({artworkExample}:{artworkExample?:MovieVisual|null}) {
  const [scenario,setScenario]=useState<ReviewScenario>('success');
  const request=useMemo(()=>createSyntheticRequest(scenario,artworkExample),[scenario,artworkExample]);
  return <><div className="synthetic-banner" role="status"><strong>SYNTHETIC · LOCAL VISUAL REVIEW · NOT LIVE</strong><p>No Qloo requests. All recommendations and affinities below are illustrative fixtures.</p>{artworkExample && <p>Optional artwork sample: {artworkExample.name} ({artworkExample.year}), TMDB capture {artworkExample.retrievedAt}. Cultural values remain SYNTHETIC; no Qloo or TMDB API calls. The browser may load the image from TMDB CDN.</p>}<label htmlFor="review-scenario">Review scenario </label><select id="review-scenario" value={scenario} onChange={e=>setScenario(e.target.value as ReviewScenario)}><option value="success">Recommendations</option><option value="empty">Insufficient evidence</option><option value="error">Service error</option><option value="timeout">Timeout</option></select></div><Discover key={scenario} request={request} reviewVisual={artworkExample} synthetic onAudit={()=>alert('This isolated review cannot invoke LIVE Audit. Use the offline HTTP test suite for Audit.')}/></>;
}
