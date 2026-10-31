// Operator-only allowlisted diagnostics. Never serializes an exception/message/body.
export function quotaDiagnostic(error:unknown,phase='unknown'){
  const e=error as {configurationIssues?:{name:string;reason:string}[];redisDiagnostic?:{category:string;command:string;httpStatus:number|null;transportCode:string|null};envConflicts?:string[]};
  if(e?.envConflicts)return {category:'ENV_CONFLICT',phase,variables:e.envConflicts};
  if(e?.configurationIssues)return {category:'QUOTA_CONFIGURATION',phase,issues:e.configurationIssues};
  if(e?.redisDiagnostic)return {phase,...e.redisDiagnostic};
  return {category:'PREFLIGHT_VERIFICATION_FAILED',phase};
}
