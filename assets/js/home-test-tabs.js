/* Shared homepage test tabs: no navigation, keyboard support, swipeable avocado timeline. */
(() => {
  'use strict';
  const showcase=document.querySelector('[data-home-comparison]');
  if(!showcase)return;
  const tabs=[...showcase.querySelectorAll('[role="tab"]')];
  const panels=new Map(tabs.map(tab=>[tab.id,document.getElementById(tab.getAttribute('aria-controls'))]));
  if(!tabs.length || [...panels.values()].some(panel=>!panel))return;
  const motion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active=null;

  function activate(tab,focus=false){
    if(!tab)return;
    for(const item of tabs){
      const chosen=item===tab;
      item.setAttribute('aria-selected',String(chosen));
      item.tabIndex=chosen?0:-1;
      const panel=panels.get(item.id);
      panel.hidden=!chosen;
      panel.classList.remove('is-appearing');
    }
    const panel=panels.get(tab.id);
    if(active!==tab.id && !motion){
      void panel.offsetWidth;
      panel.classList.add('is-appearing');
    }
    active=tab.id;
    if(focus){
      tab.scrollIntoView({behavior:motion?'auto':'smooth',inline:'nearest',block:'nearest'});
      tab.focus({preventScroll:true});
    }
    updateArrows();
  }

  tabs.forEach((tab,index)=>{
    tab.addEventListener('click',()=>activate(tab));
    tab.addEventListener('keydown',event=>{
      let next=-1;
      if(event.key==='ArrowRight')next=(index+1)%tabs.length;
      else if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
      else if(event.key==='Home')next=0;
      else if(event.key==='End')next=tabs.length-1;
      if(next<0)return;
      event.preventDefault();
      activate(tabs[next],true);
    });
  });

  const track=showcase.querySelector('[data-avocado-track]');
  const arrows=[...showcase.querySelectorAll('[data-avocado-dir]')];
  function updateArrows(){
    if(!track)return;
    const max=Math.max(0,track.scrollWidth-track.clientWidth);
    arrows.forEach(button=>{
      button.disabled=button.dataset.avocadoDir==='prev'
        ?track.scrollLeft<=3:track.scrollLeft>=max-3;
    });
  }
  arrows.forEach(button=>button.addEventListener('click',()=>{
    if(!track)return;
    const direction=button.dataset.avocadoDir==='prev'?-1:1;
    const first=track.querySelector('.ts-home-avocado-card');
    const step=(first?.getBoundingClientRect().width||280)+14;
    track.scrollBy({left:direction*step*2,behavior:motion?'auto':'smooth'});
  }));
  track?.addEventListener('scroll',updateArrows,{passive:true});
  window.addEventListener('resize',updateArrows,{passive:true});

  const activateFromHash=()=>{
    const id=decodeURIComponent(window.location.hash.slice(1));
    const matched=tabs.find(tab=>tab.getAttribute('aria-controls')===id);
    if(matched)activate(matched);
  };
  const initialId=decodeURIComponent(window.location.hash.slice(1));
  activate(tabs.find(tab=>tab.getAttribute('aria-controls')===initialId)||tabs[0]);
  window.addEventListener('hashchange',activateFromHash);
  window.requestAnimationFrame(updateArrows);
})();
