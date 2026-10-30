import type {EvidencePassport} from './audit-tools.ts';
export type ReviewDecision='PENDING'|'APPROVED'|'REJECTED';
/** A human review decision is exported, never applied to the source ranking. */
export function rescuePassport(passport:EvidencePassport|null,value:ReviewDecision,timestamp:string|null){
  return {...passport,decision:{value,actor:'human-ui',timestamp,appliedAutomatically:false}};
}
