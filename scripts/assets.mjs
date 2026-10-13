import {mkdir,writeFile} from 'node:fs/promises';
await mkdir('frontend/assets',{recursive:true});
const photos={cat:'photo-1514888286974-6c03e2ca1dba',dog:'photo-1552053831-71594a27632d',kitten:'photo-1573865526739-10659fec78a5',puppy:'photo-1583337130417-3346a1be7dee',catnap:'photo-1511044568932-338cba0ad803',dogwalk:'photo-1543466835-00a7907e9de1',catlook:'photo-1495360010541-f48722b34f7d',doglife:'photo-1517849845537-4d257902454a'};
for(const [name,id] of Object.entries(photos)){
 const url=`https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=85`;
 const r=await fetch(url); if(!r.ok) throw new Error(`${name}: ${r.status}`);
 await writeFile(`frontend/assets/${name}.jpg`,Buffer.from(await r.arrayBuffer()));console.log(`Saved ${name}`);
}
