import {env} from 'cloudflare:workers';
import {liveSitemap} from '@/server/core.mjs';
import seed from '@/server/seed.json';
export const dynamic='force-dynamic';
export const GET=(request:Request)=>liveSitemap(request,env,seed);
