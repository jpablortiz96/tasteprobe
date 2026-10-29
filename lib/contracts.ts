export type Entity = { id: string; name: string; year: number | null; type: 'urn:entity:movie'; proof: string };
export type Selection = { id: string; proof: string; confirmed: true };
export type Provenance = { source: 'Qloo REST'; host: string; endpoint: string; timestamp: string; parameters: Record<string, string>; requestId: string; httpStatus: number };
export type SearchResult = { entities: Entity[]; provenance: Provenance };
export type Comparison = { id: string; name: string; year: number | null; originalRank: number; qlooRank: number | null; shift: number | null; affinity: null };
export type AuditResult = { status: 'SUCCESS' | 'INSUFFICIENT_EVIDENCE'; rows: Comparison[]; coverage: { returned: number; total: number }; provenance: Provenance; identities: { id: string; name: string; year: number | null; searchedAt: string }[]; limitations: string[] };
export type Health = { status: 'BLOCKED_LIVE' | 'CONFIGURED_NOT_VERIFIED'; liveVerified: false };
