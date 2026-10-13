import {env} from 'cloudflare:workers';
import {handleApi} from '@/server/core.mjs';
import seed from '@/server/seed.json';
export const dynamic='force-dynamic';
const handler=(request:Request)=>handleApi(request,env,seed,{dev:import.meta.env.DEV});
export {handler as GET,handler as POST,handler as PUT,handler as PATCH,handler as DELETE};
