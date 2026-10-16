import { writeFile } from 'node:fs/promises';
const paths=['/','/programare','/robots.txt','/sitemap.xml','/confidentialitate','/informatii-legale','/opengraph-image'];
const results=await Promise.all(paths.map(async path=>{
  try {
    const r=await fetch('https://santiersync.ro'+path,{signal:AbortSignal.timeout(15000)});
    const html=path==='/opengraph-image'?'':await r.text();
    return {path,status:r.status,robotsHeader:r.headers.get('x-robots-tag'),type:r.headers.get('content-type'),title:html.match(/<title>(.*?)<\/title>/)?.[1],robots:html.match(/<meta name="robots" content="([^"]+)/)?.[1],canonical:html.match(/<link rel="canonical" href="([^"]+)/)?.[1],ogUrl:html.match(/<meta property="og:url" content="([^"]+)/)?.[1],ogImage:html.match(/<meta property="og:image" content="([^"]+)/)?.[1],document:['/robots.txt','/sitemap.xml'].includes(path)?html:undefined};
  } catch(e) {return {path,error:e.cause?.code||e.message};}
}));
const contact=await fetch('https://santiersync.ro/api/contact',{method:'POST',headers:{Origin:'https://santiersync.ro','Content-Type':'application/json'},body:'{}',signal:AbortSignal.timeout(15000)});
results.push({path:'/api/contact',status:contact.status,robotsHeader:contact.headers.get('x-robots-tag'),body:await contact.json()});
console.log(JSON.stringify(results,null,2));
await writeFile('../Livrare-2026-10-17/audit-http.json',JSON.stringify({checkedAt:new Date().toISOString(),results},null,2));
