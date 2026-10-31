import {publicPolicy} from '../lib/production-policy.ts';
import {createSharedQuota} from '../lib/shared-quota.ts';
try{
  const policy=publicPolicy();if(!policy)throw 0;
  console.log(JSON.stringify(await createSharedQuota(policy).status(),null,2));
}catch{console.error('Shared quota verification blocked. Check server configuration/storage access; no provider request made.');process.exitCode=1;}
