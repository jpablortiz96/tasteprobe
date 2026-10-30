import 'server-only';
import { createAuditTools } from './audit-tools';
import { qloo } from './qloo/server';
import { cachedServerValue } from './server-cache';
const shared = globalThis as typeof globalThis & { tasteProbeTools?: ReturnType<typeof createAuditTools> };
const revision = process.env.NODE_ENV === 'development' ? createAuditTools : 'audit-tools-v1';
export const auditTools = cachedServerValue(shared as unknown as Record<string, unknown>, 'tasteProbeTools', revision, () => createAuditTools(qloo), qloo);
