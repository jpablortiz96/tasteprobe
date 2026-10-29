import type { AuditResult, Entity } from './contracts.ts';

export function createReport(input: {
  interests: string[]; recommendations: string[];
  films: { role: string; selected?: Entity }[];
  result: AuditResult | null; status: string; lastError: string | null;
}) {
  return {
    product: 'TasteProbe', generatedAt: new Date().toISOString(),
    status: input.lastError ? 'ABSTAINED' : input.result?.status ?? input.status,
    liveResponseReceived: Boolean(input.result),
    originalInput: { interests: input.interests, recommendations: input.recommendations },
    // Explicit projection: never export identity authorization proofs.
    confirmedIdentities: input.films.flatMap(f => f.selected ? [{ role: f.role, id: f.selected.id, name: f.selected.name, year: f.selected.year }] : []),
    evaluation: input.result,
    limitations: input.result?.limitations ?? ['No live evaluation has been performed. No scores, coverage, or revised ranking are available.'],
    lastError: input.lastError,
  };
}
