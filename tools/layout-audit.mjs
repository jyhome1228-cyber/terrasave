import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import vm from 'node:vm';
import crypto from 'node:crypto';
import { chromium } from 'playwright';

const root=process.cwd(), output=path.join(root,'qa-results');
fs.mkdirSync(output,{recursive:true});
const types={'.html':'text/html; charset=utf-8','.js':'application/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.woff2':'font/woff2'};
const server=http.createServer((req,res)=>{
 const pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const file=path.resolve(root,'.'+(pathname==='/'?'/index.html':pathname));
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end('Not found');return;}
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
await new Promise(resolve=>server.listen(4173,'127.0.0.1',resolve));
const ctx={window:{}};vm.runInNewContext(fs.readFileSync('assets/js/fruits.js','utf8'),ctx);
const fruits=ctx.window.TERRASAVE_FRUITS;
const routes=[...fs.readdirSync(root).filter(f=>f.endsWith('.html')&&f!=='fruit.html'),...fruits.map(f=>'fruit.html?fruit='+f.slug)];
const widths=(process.env.QA_WIDTHS||'1920,1440,1280,1120,1119,1024,900,899,768,767,430,390,360').split(',').map(Number);
const authored=fs.existsSync('tools/content-manifest.json')?JSON.parse(fs.readFileSync('tools/content-manifest.json','utf8')):{};
const statics=fs.existsSync('tools/static-content-manifest.json')?JSON.parse(fs.readFileSync('tools/static-content-manifest.json','utf8')):{};
const norm=s=>s.replace(/\s+/g,'').replaceAll('샤인머스캣','샤인머스켓').replaceAll('TERRASAVE','TerraSave');
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4173/';
const browser=await chromium.launch({headless:true});
const results=[], assetIndex={},assetJobs=[];
const assetDir=path.join(output,'asset-cache');fs.mkdirSync(assetDir,{recursive:true});
try{
for(const width of widths){
 const context=await browser.newContext({viewport:{width,height:960},deviceScaleFactor:1,reducedMotion:'reduce'});
 await context.addInitScript(()=>{try{sessionStorage.setItem('ts-update-popup','closed');}catch{}});
 for(const route of routes){
  const page=await context.newPage(),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',response=>{
   const url=response.url(),type=response.request().resourceType();
   if(response.status()!==200||!['image','font'].includes(type)||assetIndex[url])return;
   const key=crypto.createHash('sha256').update(url).digest('hex')+path.extname(new URL(url).pathname);
   assetIndex[url]={path:key,type:response.headers()['content-type']||''};
   assetJobs.push(response.body().then(body=>fs.writeFileSync(path.join(assetDir,key),body)).catch(()=>{delete assetIndex[url];}));
  });
  try{
   const response=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:30000});
   await page.evaluate(()=>Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,8000))]));
   await page.evaluate(async()=>{const height=document.documentElement.scrollHeight;for(let y=0;y<height;y+=800){window.scrollTo({top:y,behavior:'instant'});await new Promise(r=>setTimeout(r,20));}window.scrollTo({top:0,behavior:'instant'});await Promise.race([Promise.all([...document.images].map(i=>i.complete?Promise.resolve():new Promise(r=>{i.onload=i.onerror=r}))),new Promise(r=>setTimeout(r,10000))]);});
   await page.waitForTimeout(100);
   const metrics=await page.evaluate(()=>{
    const visible=e=>{const b=e.getBoundingClientRect(),s=getComputedStyle(e);return b.width>0&&b.height>0&&s.display!=='none'&&s.visibility!=='hidden'};
    const rect=e=>{const b=e.getBoundingClientRect();return{x:Math.round(b.x*10)/10,y:Math.round((b.y+scrollY)*10)/10,width:Math.round(b.width*10)/10,height:Math.round(b.height*10)/10}};
    const desc=e=>e.tagName.toLowerCase()+(e.id?'#'+e.id:'')+'.'+String(e.className).trim().replace(/\s+/g,'.');
    const header=document.querySelector('.header-inner'),h=header?rect(header):null;
    const shells=[...document.querySelectorAll('main .ts-shell,.footer-shell')].filter(visible).map(e=>({node:desc(e),...rect(e)}));
    const axisErrors=h?shells.filter(b=>Math.abs(b.x-h.x)>2||Math.abs(b.width-h.width)>2):shells;
    const overflow=[...document.querySelectorAll('main *,header *,footer *')].filter(visible).filter(e=>{const b=e.getBoundingClientRect();return b.x< -1||b.right>innerWidth+1}).slice(0,12).map(e=>({node:desc(e),...rect(e)}));
    const orphans=[...document.querySelectorAll('.ts-detail-research-block,.ts-detail-references')].filter(visible).filter(e=>!e.closest('section > .ts-shell')).map(desc);
    const badHeads=[...document.querySelectorAll('.ts-section-head,.ts-home-head,.ts-product-hero-head,.ts-home-intro-copy')].filter(visible).map(e=>{const members=[...e.querySelectorAll('.ts-kicker,h1,h2,.ts-section-copy,.ts-home-lead')].filter(visible);return{node:desc(e),align:[...new Set(members.map(x=>getComputedStyle(x).textAlign))]}}).filter(x=>x.align.length>1);
    const hero=document.querySelector('.ts-detail-hero');
    const heroData=hero?{rect:rect(hero),tracks:getComputedStyle(hero).gridTemplateColumns,children:[...hero.children].filter(visible).map(e=>({node:desc(e),...rect(e)}))}:null;
    const heroErrors=heroData&&innerWidth>=900&&(heroData.children.length!==2||Math.abs((heroData.children[0].y+heroData.children[0].height/2)-(heroData.children[1].y+heroData.children[1].height/2))>2)?['Fruit hero not one aligned row']:[];
    const ids=[...document.querySelectorAll('[id]')].map(e=>e.id);
    const duplicateIds=ids.filter((id,i)=>ids.indexOf(id)!==i);
    const brokenImages=[...document.images].filter(i=>i.complete&&i.naturalWidth===0).map(i=>i.src);
    const loadingImages=[...document.images].filter(i=>!i.complete).map(i=>i.src);
    const localLinks=[...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')).filter(href=>href&&!/^(https?:|mailto:|tel:)/.test(href));
    const blocks=[...document.querySelectorAll('.ts-detail-research-block h3')].map(e=>({tag:e.tagName,size:getComputedStyle(e).fontSize,weight:getComputedStyle(e).fontWeight,lineHeight:getComputedStyle(e).lineHeight}));
    const structureErrors=[];
    if(document.querySelectorAll('main h1').length!==1)structureErrors.push('Expected one visible page h1');
    if(hero&&document.querySelectorAll('#research').length!==1)structureErrors.push('Expected one research section');
    if(new Set(blocks.map(e=>JSON.stringify(e))).size>1)structureErrors.push('Inconsistent research heading hierarchy');
    if([...document.querySelectorAll('main > *')].some(e=>visible(e)&&e.tagName!=='SECTION'))structureErrors.push('Main contains content outside a section');
    if(document.styleSheets.length!==2&&document.styleSheets.length!==1)structureErrors.push('Unexpected competing stylesheet count');
    if([...document.querySelectorAll('link[rel=stylesheet]')].some(e=>!/site\.css/.test(e.href)))structureErrors.push('Legacy stylesheet loaded');
    return{title:document.title,header:h,shellCount:shells.length,axisErrors,overflow,orphans,badHeads,hero:heroData,heroErrors,duplicateIds,brokenImages,loadingImages,localLinks,structureErrors,scrollWidth:document.documentElement.scrollWidth,bodyText:document.querySelector('main')?.innerText||'',height:document.documentElement.scrollHeight};
   });
   const slug=new URL(route,'http://localhost').searchParams.get('fruit');
   const expected=authored[slug]||statics[route]||[];
   const contentMissing=expected.filter(value=>!norm(metrics.bodyText).includes(norm(value)));
   const linkErrors=[];
   for(const href of [...new Set(metrics.localLinks)]){
    const url=new URL(href,base+route);const current=new URL(base+route);
    if(url.pathname===current.pathname&&url.hash){if(!await page.locator('[id='+JSON.stringify(decodeURIComponent(url.hash.slice(1)))+']').count())linkErrors.push(href);}
    else if(url.origin===current.origin){const local=path.join(root,url.pathname.replace(new URL(base).pathname,'').replace(/^\//,''));if(!fs.existsSync(local))linkErrors.push(href);}
   }
   const interactions=[];
   await page.evaluate(()=>window.scrollTo({top:700,behavior:'instant'}));
   const fixed=await page.locator('.site-header').evaluate(e=>({top:e.getBoundingClientRect().top,position:getComputedStyle(e).position}));
   if(Math.abs(fixed.top)>1||fixed.position!=='fixed')interactions.push('Header moves on scroll');
   await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
   if(width<1120){
    await page.locator('#menuToggle').click();
    if(await page.locator('#menuToggle').getAttribute('aria-expanded')!=='true'||!await page.locator('#siteNav .nav-contact').isVisible())interactions.push('Mobile menu failed to open');
    const menuLock=await page.evaluate(()=>({body:document.body.classList.contains('menu-locked'),html:document.documentElement.classList.contains('menu-locked'),focusInHeader:document.querySelector('.site-header')?.contains(document.activeElement)}));
    if(!menuLock.body||!menuLock.html)interactions.push('Mobile menu failed to lock background scroll');
    if(!menuLock.focusInHeader)interactions.push('Mobile menu focus escaped header');
    const menuOverflow=await page.locator('#siteNav').evaluate(e=>e.getBoundingClientRect().right>innerWidth+1);
    if(menuOverflow)interactions.push('Mobile menu overflow');
    await page.keyboard.press('Escape');
    if(await page.locator('#menuToggle').getAttribute('aria-expanded')!=='false')interactions.push('Mobile menu failed to close');
    const menuUnlock=await page.evaluate(()=>!document.body.classList.contains('menu-locked')&&!document.documentElement.classList.contains('menu-locked'));
    if(!menuUnlock)interactions.push('Mobile menu failed to release background scroll');
   }
   if(route==='fruits.html'){
    for(const filter of ['climacteric','non','high','all']){
     await page.locator('[data-filter="'+filter+'"]').click();
     const filterResult=await page.evaluate(()=>({count:document.querySelectorAll('#fruitGrid .ts-fruit-card').length,label:document.getElementById('fruitCount').textContent}));
     if(filterResult.count!==parseInt(filterResult.label,10)||filterResult.count===0)interactions.push('Invalid filter count: '+filter);
    }
   }
   const name=route.replace('fruit.html?fruit=','fruit-').replace('.html','');
   if([1440,390].includes(width)){
    await page.screenshot({path:path.join(output,name+'-'+width+'.png'),fullPage:true,timeout:20000});
    if(['index','product','fruits','fruit-strawberry','fruit-shine-muscat','fruit-avocado','partnership','why-terrasave','contact'].includes(name)){
     const blocks=page.locator('main > section');
     for(let i=0;i<await blocks.count();i++){const block=blocks.nth(i);if(await block.isVisible())await block.screenshot({path:path.join(output,name+'-'+width+'-section-'+i+'.png'),timeout:15000});}
    }
   }
   results.push({route,width,status:response.status(),errors,...metrics,contentChecks:expected.length,contentMissing,linkErrors,interactions});
   console.log(JSON.stringify({route,width,errors:errors.length,axis:metrics.axisErrors.length,overflow:metrics.overflow.length,orphans:metrics.orphans.length,heads:metrics.badHeads.length,images:metrics.brokenImages.length,structure:metrics.structureErrors,contentMissing:contentMissing.length,links:linkErrors,interactions}));
  }catch(error){results.push({route,width,fatal:String(error),errors});console.log('AUDIT_ERROR',route,width,String(error));}
  await page.close();
 }
 await context.close();
}
}finally{await Promise.allSettled(assetJobs);await browser.close();server.close();}
fs.writeFileSync(path.join(output,'asset-index.json'),JSON.stringify(assetIndex,null,2));
fs.writeFileSync(path.join(output,'layout-audit.json'),JSON.stringify(results,null,2));
const fields=['axisErrors','overflow','orphans','badHeads','heroErrors','duplicateIds','brokenImages','loadingImages','structureErrors','contentMissing','linkErrors','interactions','errors'];
const totals={pages:routes.length,widths,cases:results.length,fatal:results.filter(x=>x.fatal).length,contentChecks:results.reduce((s,x)=>s+(x.contentChecks||0),0),failures:Object.fromEntries(fields.map(field=>[field,results.filter(x=>x[field]?.length).length]))};
fs.writeFileSync(path.join(output,'summary.json'),JSON.stringify(totals,null,2));
console.log('TOTALS',JSON.stringify(totals));
if(process.env.QA_STRICT==='1'&&results.some(x=>x.fatal||x.status!==200||fields.some(field=>x[field]?.length)))process.exitCode=1;
