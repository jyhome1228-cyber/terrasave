/* Additional regressions: line wrapping, overlays, keyboard navigation and contact anchors. */
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium, webkit } from 'playwright';
const root=process.cwd();
const output=path.join(root,process.env.QA_RECHECK_OUTPUT||'recheck-results');
fs.mkdirSync(output,{recursive:true});
const types={'.html':'text/html; charset=utf-8','.css':'text/css','.js':'application/javascript','.svg':'image/svg+xml'};
const server=http.createServer((req,res)=>{
 const file=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
 if(!file.startsWith(root+path.sep)||!fs.existsSync(file)||fs.statSync(file).isDirectory()){res.writeHead(404);res.end();return;}
 res.writeHead(200,{'Content-Type':types[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
});
await new Promise(r=>server.listen(4175,'127.0.0.1',r));
const base=process.env.QA_BASE_URL||'http://127.0.0.1:4175/';
const widths=[320,390,768,1119,1440];
const routes=['index.html','fruits.html','product.html','partnership.html','why-terrasave.html','contact.html','fruit.html?fruit=blueberry','fruit.html?fruit=strawberry','fruit.html?fruit=shine-muscat','fruit.html?fruit=avocado'];
const results=[];
const geometry=()=>{
 const visible=e=>{const b=e.getBoundingClientRect(),s=getComputedStyle(e);return b.width&&b.height&&s.display!=='none'&&s.visibility!=='hidden'&&s.opacity!=='0'};
 const name=e=>e.tagName.toLowerCase()+'.'+String(e.className).replace(/\s+/g,'.');
 const trailingBreaks=[...document.querySelectorAll('main h1,main h2,main h3')].filter(e=>e.lastElementChild?.tagName==='BR'&&!e.lastElementChild.nextSibling?.textContent.trim()).map(name);
 const clippedText=[...document.querySelectorAll('main h1,main h2,main h3,main p,main li,main dd,.ts-button,.ts-fruit-data strong')].filter(visible).filter(e=>e.clientWidth>0&&e.scrollWidth>e.clientWidth+2).map(name);
 const splitUnits=[];
 for(const el of document.querySelectorAll('.ts-fruit-data strong,.ts-data-value')){
  if(!visible(el))continue;
  const walker=document.createTreeWalker(el,NodeFilter.SHOW_TEXT);let t;
  while(t=walker.nextNode())for(const m of t.textContent.matchAll(/-?\d+(?:\.\d+)?(?:[–~±-]\d+(?:\.\d+)?)?\s*(?:°C|℃|%)/g)){
   const r=new Range();r.setStart(t,m.index);r.setEnd(t,m.index+m[0].length);
   const lines=new Set([...r.getClientRects()].filter(x=>x.width>0).map(x=>Math.round(x.y)));
   if(lines.size>1)splitUnits.push({unit:m[0],element:name(el)});
  }
 }
 const fontLoaded=[...document.fonts].some(f=>f.family.replaceAll('"','').replaceAll("'",'')==='Pretendard'&&f.status==='loaded');
 return{trailingBreaks,clippedText,splitUnits,fontLoaded};
};
const ready=async page=>{
 await page.evaluate(()=>Promise.race([document.fonts.ready,new Promise(r=>setTimeout(r,10000))]));
 await page.evaluate(async()=>{document.querySelectorAll('img[loading=lazy]').forEach(i=>i.loading='eager');await Promise.race([Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))),new Promise(r=>setTimeout(r,10000))]);});
};
try{
 for(const [engineName,engine] of Object.entries({chromium,webkit})){
  const browser=await engine.launch({headless:true});
  for(const width of widths){
   const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'});
   await context.addInitScript(()=>sessionStorage.setItem('ts-update-popup','closed'));
   for(const route of routes){
    const page=await context.newPage(),errors=[],networkErrors=[];
    page.on('pageerror',e=>errors.push(e.message));
    page.on('response',r=>{if(r.status()>=400&&['document','script','stylesheet','image','font'].includes(r.request().resourceType()))networkErrors.push({url:r.url(),status:r.status()});});
    try{
     const response=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:30000});await ready(page);
     const metrics=await page.evaluate(geometry);
     const issues=[...metrics.trailingBreaks.map(x=>'trailing-break:'+x),...metrics.clippedText.map(x=>'clipped-text:'+x),...metrics.splitUnits.map(x=>'split-unit:'+x.unit),...(!metrics.fontLoaded?['font-not-loaded']:[]),...errors,...networkErrors.map(x=>'asset:'+x.status+':'+x.url)];
     if(response.status()!==200)issues.push('document-status:'+response.status());
     if(engineName==='chromium'&&[390,768,1440].includes(width)&&['fruits.html','product.html','fruit.html?fruit=blueberry'].includes(route)){
      const name=route.replace('.html','').replace('?fruit=','-')+'-'+width;
      if(route.startsWith('fruit.html'))await page.locator('#research').screenshot({path:path.join(output,name+'-research.png')});
      else if(route==='fruits.html')await page.locator('.ts-fruit-card').first().screenshot({path:path.join(output,name+'-card.png')});
      else await page.locator('.ts-compact-final-cta').screenshot({path:path.join(output,name+'-closing.png')});
     }
     results.push({engine:engineName,route,width,...metrics,issues});
    }catch(error){results.push({engine:engineName,route,width,issues:[String(error)]});}
    await page.close();
   }
   await context.close();
  }
  // Use fresh sessions to test the notice, then mobile menu focus and restoring page access.
  for(const width of [390,1440]){
   const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'});
   const page=await context.newPage(),issues=[],details={};
   try{
    await page.goto(base+'product.html',{waitUntil:'load',timeout:30000});await ready(page);
    details.popupVisible=await page.locator('.ts-update-popup').isVisible();
    if(!details.popupVisible)issues.push('expected maintenance notice missing');
    const before=await page.evaluate(()=>scrollY);await page.mouse.move(5,810);await page.mouse.wheel(0,650);await page.waitForTimeout(300);
    details.backgroundScroll=await page.evaluate(()=>scrollY)-before;
    if(Math.abs(details.backgroundScroll)>2)issues.push('background scrolls behind notice');
    for(let i=0;i<3;i++)await page.keyboard.press('Tab');
    if(!await page.evaluate(()=>!!document.activeElement.closest('.ts-update-popup')))issues.push('focus escaped notice');
    await page.locator('.ts-update-popup button').click();
    if(await page.evaluate(()=>document.querySelector('main').inert))issues.push('main remains inert after notice');
    if(width<1120){
     await page.locator('#menuToggle').click();
     for(let i=0;i<18;i++){
      await page.keyboard.press(i<12?'Tab':'Shift+Tab');
      if(!await page.evaluate(()=>!!document.activeElement.closest('#siteHeader'))){issues.push('keyboard focus escaped mobile menu');break;}
     }
     await page.keyboard.press('Escape');
     if(await page.locator('#menuToggle').getAttribute('aria-expanded')!=='false')issues.push('Escape did not close menu');
     if(!await page.evaluate(()=>document.activeElement.id==='menuToggle'))issues.push('menu focus not restored');
     if(await page.evaluate(()=>document.querySelector('main').inert))issues.push('main remains inert after menu');
     await page.locator('#menuToggle').click();await page.setViewportSize({width:1440,height:844});await page.waitForTimeout(80);
     if(await page.evaluate(()=>document.body.classList.contains('menu-locked')||document.querySelector('main').inert))issues.push('resize leaves page locked');
    }
    await page.goto(base+'contact.html',{waitUntil:'load',timeout:30000});
    if(await page.locator('.ts-update-popup').count())issues.push('dismissal not remembered in session');
    await page.setViewportSize({width:1440,height:844});
    await page.locator('.header-cta').click();await page.waitForTimeout(100);
    if(new URL(page.url()).hash!=='#inquiry')issues.push('contact button reloads instead of opening inquiry');
    details.anchorVisible=await page.locator('#inquiry').isVisible();
   }catch(error){issues.push(String(error));}
   results.push({engine:engineName,route:'overlay-menu-contact',width,...details,issues});
   await context.close();
  }
  await browser.close();
 }
}finally{server.close();}
const summary={base,commit:process.env.GITHUB_SHA||null,checkedAt:new Date().toISOString(),cases:results.length,failures:results.filter(r=>r.issues.length).length};
fs.writeFileSync(path.join(output,'results.json'),JSON.stringify(results,null,2));fs.writeFileSync(path.join(output,'summary.json'),JSON.stringify(summary,null,2));
console.log(JSON.stringify(summary));for(const r of results.filter(r=>r.issues.length))console.log(JSON.stringify({engine:r.engine,route:r.route,width:r.width,issues:r.issues}));
if(process.env.QA_STRICT==='1'&&summary.failures)process.exitCode=1;
