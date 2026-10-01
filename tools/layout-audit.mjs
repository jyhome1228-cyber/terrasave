import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import vm from 'node:vm';
import { chromium } from 'playwright';

const root = process.cwd();
const output = path.join(root, 'qa-results');
fs.mkdirSync(output, { recursive: true });
const types = { '.html':'text/html; charset=utf-8', '.js':'application/javascript', '.css':'text/css', '.svg':'image/svg+xml', '.json':'application/json', '.png':'image/png', '.jpg':'image/jpeg', '.webp':'image/webp', '.woff2':'font/woff2' };
const server = http.createServer((req,res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
  if (!file.startsWith(root + path.sep) || !fs.existsSync(file) || fs.statSync(file).isDirectory()) { res.writeHead(404); res.end('Not found'); return; }
  res.writeHead(200, {'Content-Type':types[path.extname(file)] || 'application/octet-stream'});
  fs.createReadStream(file).pipe(res);
});
await new Promise(resolve => server.listen(4173,'127.0.0.1',resolve));
const dataContext = { window:{} };
vm.runInNewContext(fs.readFileSync('assets/js/fruits.js','utf8'), dataContext);
const fruits = dataContext.window.TERRASAVE_FRUITS;
const htmlFiles = fs.readdirSync(root).filter(file => file.endsWith('.html') && file !== 'fruit.html');
const routes = [...htmlFiles, ...fruits.map(f => 'fruit.html?fruit=' + f.slug)];
const widths = process.env.QA_WIDTHS ? process.env.QA_WIDTHS.split(',').map(Number) : [1440,1024,768,390,360];
const browser = await chromium.launch({headless:true});
const results = [];
try {
  for (const width of widths) {
    const context = await browser.newContext({viewport:{width,height:960}, deviceScaleFactor:1});
    await context.addInitScript(() => { try { sessionStorage.setItem('ts-update-popup','closed'); } catch {} });
    for (const route of routes) {
      const page = await context.newPage();
      const errors=[];
      page.on('pageerror', e => errors.push(e.message));
      try {
        await page.goto('http://127.0.0.1:4173/' + route, {waitUntil:'domcontentloaded',timeout:20000});
        await page.evaluate(() => Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,2500))]));
        await page.waitForTimeout(250);
        const metrics = await page.evaluate(() => {
          const visible = e => { const b=e.getBoundingClientRect(),s=getComputedStyle(e);return b.width>0 && b.height>0 && s.display!=='none' && s.visibility!=='hidden'; };
          const rect = e => { const b=e.getBoundingClientRect(); return {x:Math.round(b.x*10)/10,y:Math.round((b.y+scrollY)*10)/10,width:Math.round(b.width*10)/10,height:Math.round(b.height*10)/10}; };
          const desc = e => e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+'.'+String(e.className).trim().replace(/\s+/g,'.');
          const header=document.querySelector('.header-inner');
          const h=header?rect(header):null;
          const shells=[...document.querySelectorAll('main .ts-shell,.footer-shell')].filter(visible).map(e=>({node:desc(e),...rect(e)}));
          const axisErrors=h?shells.filter(b=>Math.abs(b.x-h.x)>2 || Math.abs(b.width-h.width)>2):shells;
          const overflow=[...document.querySelectorAll('main *,header *,footer *')].filter(visible).filter(e=>{const b=e.getBoundingClientRect();return b.x < -1 || b.right > innerWidth+1;}).slice(0,12).map(e=>({node:desc(e),...rect(e)}));
          const orphans=[...document.querySelectorAll('.ts-detail-research-block,.ts-detail-references')].filter(visible).filter(e=>!e.closest('.ts-shell')).map(e=>desc(e));
          const badHeads=[...document.querySelectorAll('.ts-section-head,.ts-home-head,.ts-product-hero-head,.ts-home-intro-copy')].filter(visible).map(e=>{const members=[...e.querySelectorAll('.ts-kicker,h1,h2,.ts-section-copy,.ts-home-lead')].filter(visible);return {node:desc(e),align:[...new Set(members.map(x=>getComputedStyle(x).textAlign))],grid:getComputedStyle(e).gridTemplateColumns};}).filter(x=>x.align.length>1);
          const hero=document.querySelector('.ts-detail-hero');
          const heroData=hero?{rect:rect(hero),tracks:getComputedStyle(hero).gridTemplateColumns,children:[...hero.children].filter(visible).map(e=>({node:desc(e),...rect(e),column:getComputedStyle(e).gridColumn}))}:null;
          const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
          const duplicateIds=ids.filter((id,i)=>ids.indexOf(id)!==i);
          const brokenImages=[...document.images].filter(i=>i.complete && i.naturalWidth===0).map(i=>i.src);
          return {title:document.title,header:h,shellCount:shells.length,axisErrors,overflow,orphans,badHeads,hero:heroData,duplicateIds,brokenImages,scrollWidth:document.documentElement.scrollWidth,bodyText:document.querySelector('main')?.innerText||'',height:document.documentElement.scrollHeight};
        });
        const slug=route.replace('fruit.html?fruit=','fruit-').replace('.html','');
        if ([1440,390].includes(width)) {
          await page.screenshot({path:path.join(output,slug+'-'+width+'.png'),fullPage:true,timeout:20000});
          if (['product','fruit-strawberry','fruit-shine-muscat','fruit-avocado','partnership','why-terrasave'].includes(slug)) {
            const blocks=page.locator('main > section, main > .ts-section');
            const n=await blocks.count();
            for (let i=0;i<n;i++) {
              const block=blocks.nth(i);
              if(await block.isVisible()) await block.screenshot({path:path.join(output,slug+'-'+width+'-section-'+i+'.png'),timeout:15000});
            }
          }
        }
        results.push({route,width,errors,...metrics});
        console.log(JSON.stringify({route,width,errors:errors.length,axis:metrics.axisErrors.length,overflow:metrics.overflow.length,orphans:metrics.orphans.length,heads:metrics.badHeads.length,images:metrics.brokenImages.length}));
      } catch(error) { results.push({route,width,fatal:String(error),errors}); console.log('AUDIT_ERROR',route,width,String(error)); }
      await page.close();
    }
    await context.close();
  }
} finally { await browser.close(); server.close(); }
fs.writeFileSync(path.join(output,'layout-audit.json'),JSON.stringify(results,null,2));
const totals={pages:routes.length,widths,cases:results.length,fatal:results.filter(x=>x.fatal).length,axis:results.filter(x=>x.axisErrors?.length).length,overflow:results.filter(x=>x.overflow?.length).length,orphans:results.filter(x=>x.orphans?.length).length,mixedHeads:results.filter(x=>x.badHeads?.length).length};
fs.writeFileSync(path.join(output,'summary.json'),JSON.stringify(totals,null,2));
console.log('TOTALS',JSON.stringify(totals));
if(process.env.QA_STRICT==='1' && results.some(x=>x.fatal || x.errors?.length || x.axisErrors?.length || x.overflow?.length || x.orphans?.length || x.badHeads?.length)) process.exitCode=1;
