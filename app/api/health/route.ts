import { qloo } from '../../../lib/qloo/server';
import { json } from '../../../lib/http';
export const dynamic = 'force-dynamic';
export function GET() { return json(qloo.health()); }
