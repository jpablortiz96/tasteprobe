import {quotaPolicy} from '../lib/production-policy.ts';
import {createSharedQuota} from '../lib/shared-quota.ts';
import {loadQuotaEnvironment} from './quota-env.mjs';
import {quotaDiagnostic} from '../lib/quota-diagnostic.ts';
import {randomBytes} from 'node:crypto';
try{
  const environment=loadQuotaEnvironment();
  const policy=quotaPolicy();
  const preflight=process.argv.includes('--preflight');
  if(preflight)policy.namespace=`${policy.namespace.slice(0,24)}-preflight-${randomBytes(4).toString('hex')}`;
  console.log(JSON.stringify({...await createSharedQuota(policy).status(),scope:preflight?'PREFLIGHT_ONLY':'CONFIGURED_NAMESPACE_READ_ONLY',environment},null,2));
}catch(error){console.error(JSON.stringify({result:'BLOCKED',diagnostic:quotaDiagnostic(error,'quota-status'),providerRequests:0}));process.exitCode=1;}
