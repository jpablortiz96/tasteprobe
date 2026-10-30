const selection = { type: 'object', additionalProperties: false, required: ['id', 'proof', 'confirmed'], properties: { id: { type: 'string', format: 'uuid' }, proof: { type: 'string', maxLength: 2000 }, confirmed: { const: true } } };
const interests = { type: 'array', minItems: 1, maxItems: 3, items: selection };
const recommendations = { type: 'array', minItems: 3, maxItems: 5, items: selection };
export const toolSchemas = [
  { name: 'resolve_entities', description: 'Search Qloo for movie identities. Returns ambiguity and signed choices. Never selects or confirms an identity.', parameters: { type: 'object', additionalProperties: false, required: ['query'], properties: { query: { type: 'string', minLength: 2, maxLength: 80 } } } },
  { name: 'evaluate_candidates', description: 'Evaluate human-confirmed signed identities using Qloo Insights. Partial coverage abstains.', parameters: { type: 'object', additionalProperties: false, required: ['interests','recommendations'], properties: { interests, recommendations } } },
  { name: 'compare_cultural_signals', description: 'Run up to two Insights with identical candidates and parameters; change only one confirmed signal. Stop after partial A or any error.', parameters: { type: 'object', additionalProperties: false, required: ['interestsA','interestsB','recommendations'], properties: { interestsA: { ...interests, maxItems: 1 }, interestsB: { ...interests, maxItems: 1 }, recommendations } } },
  { name: 'propose_evidence_based_revision', description: 'Use only server-held evaluation evidence from this session. No arguments, invented films, or supplied results accepted. Human approval remains required.', parameters: { type: 'object', additionalProperties: false, properties: {} } },
];
