import {env} from 'cloudflare:workers';
import {livePage} from '@/server/core.mjs';
import seed from '@/server/seed.json';
import template from '@/server/template.html?raw';
export const dynamic='force-dynamic';
export const GET=(request:Request)=>livePage(request,env,seed,template);
