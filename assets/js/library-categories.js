/* Flower and fruit categories; fruit dataset/filtering stays in site.js. */
(() => {
 'use strict';
 const tabs=[...document.querySelectorAll('[data-library-tab]')];
 const fruit=document.getElementById('tsFruitCategoryPanel');
 const flower=document.getElementById('tsFlowerCategoryPanel');
 if(tabs.length!==2||!fruit||!flower)return;
 const activate=(kind,focus=false)=>{
   if(kind!=='fruit'&&kind!=='flower')return;
   const selected=tabs.find(t=>t.dataset.libraryTab===kind);
   tabs.forEach(t=>{
     const active=t===selected;
     t.classList.toggle('is-active',active);
     t.setAttribute('aria-selected',String(active));
     t.tabIndex=active?0:-1;
   });
   fruit.hidden=kind!=='fruit';
   flower.hidden=kind!=='flower';
   if(focus)selected?.focus({preventScroll:true});
 };
 tabs.forEach((tab,index)=>{
   tab.addEventListener('click',()=>activate(tab.dataset.libraryTab));
   tab.addEventListener('keydown',event=>{
     let next;
     if(event.key==='ArrowRight')next=(index+1)%tabs.length;
     else if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
     else if(event.key==='Home')next=0;
     else if(event.key==='End')next=tabs.length-1;
     else return;
     event.preventDefault();
     activate(tabs[next].dataset.libraryTab,true);
   });
 });
 const applyHash=()=>{
   if(window.location.hash==='#flowers'||window.location.hash==='#flower')activate('flower');
   else if(window.location.hash==='#fruits')activate('fruit');
 };
 window.addEventListener('hashchange',applyHash);
 applyHash();
})();
