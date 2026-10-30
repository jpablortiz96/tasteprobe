import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import ReviewWorkspace from './review-workspace';
import { readFile } from 'node:fs/promises';
import type { MovieVisual } from '../../lib/tmdb/contracts';
import { visualMatches } from '../../lib/tmdb/policy';
export const dynamic = 'force-dynamic';
export default async function Review() {
  if (process.env.NODE_ENV !== 'development' || process.env.TASTEPROBE_VISUAL_REVIEW !== 'synthetic') notFound();
  const host=(await headers()).get('host') ?? '';
  if (!/^(localhost|127\.0\.0\.1)(:\d{1,5})?$/.test(host)) notFound();
  let artworkExample:MovieVisual|null=null;
  try{
    const capture=JSON.parse(await readFile('evidence/gate2g-tmdb-passengers.json','utf8'));
    if(visualMatches({name:'Passengers',year:2016},capture.visual))artworkExample=capture.visual;
  }catch{ /* Review remains functional without optional captured artwork. */ }
  return <ReviewWorkspace artworkExample={artworkExample}/>;
}
