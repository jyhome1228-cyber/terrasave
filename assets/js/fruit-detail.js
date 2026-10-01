/* One renderer for all 18 fruits. Authored copy is data, never a nested page template. */
(() => {
  'use strict';
  const root=document.querySelector('[data-fruit-detail]');
  const fruits=window.TERRASAVE_FRUITS||[];
  if(!root||!fruits.length)return;
  const slug=new URLSearchParams(location.search).get('fruit')||'apple';
  const index=Math.max(0,fruits.findIndex(f=>f.slug===slug));
  const fruit=fruits[index];
  const name=fruit.ko.replaceAll('샤인머스캣','샤인머스켓');
  const authored=window.TERRASAVE_FRUIT_CONTENT?.[fruit.slug];
  const available=['avocado','strawberry','shine-muscat','mango'].includes(fruit.slug);
  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normal=value=>String(value??'').replaceAll('샤인머스캣','샤인머스켓').replaceAll('TERRASAVE','TerraSave');
  const prose=values=>(values||[]).map(value=>`<p>${normal(value).replace(/<br\s*\/?>/gi,' ')}</p>`).join('');
  const title=value=>normal(value).replace(/<br\s*\/?>/gi,'<br class="desktop-break"> ');
  const number=index=>String(index+1).padStart(2,'0');
  const units=value=>esc(value).replace(/(-?\d+(?:\.\d+)?(?:[–~±-]\d+(?:\.\d+)?)?\s*(?:°C|℃|%))/g,'<span class="ts-unit">$1</span>');
  const storage=value=>String(value).replaceAll('미숙과','덜 익은 상태').replaceAll('완숙과','먹기 좋은 상태').replaceAll('녹숙과','초록색 상태').replaceAll('부분후숙','덜 익은 상태').split(/\s*\/\s*/).map(v=>`<span class="ts-storage-line">${units(v)}</span>`).join('');
  const head=(kicker,heading,ps=[])=>`<div class="ts-section-head"><span class="ts-kicker">${esc(normal(kicker))}</span><h2 class="ts-h2">${title(heading)}</h2>${ps.map(p=>`<p class="ts-section-copy">${normal(p).replace(/<br\s*\/?>/gi,' ')}</p>`).join('')}</div>`;
  const section=(id,kicker,heading,ps,body,soft=false)=>`<section class="ts-section${soft?' is-soft':''}" id="${id}"><div class="ts-shell">${head(kicker,heading,ps)}${body}</div></section>`;
  const rows=items=>`<div class="ts-application-list">${items.map((item,i)=>`<article class="ts-application-row"><span class="ts-kicker">${number(i)}</span><h3>${normal(item.title)}</h3><div class="ts-row-body">${prose(item.paragraphs)}</div></article>`).join('')}</div>`;
  const cards=items=>`<div class="ts-approach-grid" data-columns="${items.length}">${items.map((item,i)=>`<article class="ts-approach"><span class="ts-kicker">${esc(normal(item.kicker||number(i)))}</span><div><h3 class="ts-h3">${normal(item.title)}</h3>${prose(item.paragraphs)}</div></article>`).join('')}</div>`;
  const action=(href,label)=>`<div class="ts-action-group is-centered"><a class="ts-button is-dark is-large" href="${href}">${label}</a></div>`;
  const pair=window.TERRASAVE_FRUIT_IMAGES?.[fruit.slug]||[fruit.imageWhole,fruit.imageCut];
  const intro=normal(fruit.intro||fruit.summary).split(/(?<=\.)\s+/).filter(Boolean).map(esc);
  const previous=fruits[(index-1+fruits.length)%fruits.length],next=fruits[(index+1)%fruits.length];
  const sections=[];
  sections.push(`<section class="ts-page-hero"><div class="ts-shell"><div class="ts-detail-hero"><div class="ts-detail-image-pair" aria-label="${esc(name)} 이미지"><figure class="ts-detail-fruit-photo"><img src="${esc(pair[0])}" alt="${esc(name)} 전체 모습" width="1000" height="1000" fetchpriority="high"></figure><figure class="ts-detail-fruit-photo"><img src="${esc(pair[1])}" alt="${esc(name)} 단면" width="1000" height="1000"></figure></div><div class="ts-detail-copy"><div class="ts-detail-meta"><span class="ts-kicker">과일별 신선도 자료 / ${esc(name)}</span><span class="ts-detail-status${available?' is-available':''}">${available?'솔루션 제공':'연구중'}</span></div><h1 class="ts-h1">${esc(name)}</h1><div class="ts-detail-lead">${prose(intro)}</div><div class="ts-action-group"><a class="ts-button is-dark" href="contact.html">${esc(name)} 포장 상담하기</a></div></div></div></div></section>`);
  const data=[['익는 방식',esc(fruit.ripeningPlain)],['권장 보관 온도',storage(fruit.storage)],['권장 습도',units(fruit.humidity)],['에틸렌 영향',esc(fruit.ethylenePlain)],['관리 중요도',esc(fruit.priorityPlain)],['주요 관리 포인트',esc(normal(fruit.focusKo))]];
  sections.push(`<section class="ts-section is-compact" aria-label="${esc(name)} 기본 보관 정보"><div class="ts-shell"><dl class="ts-data-grid">${data.map(([key,value])=>`<div class="ts-data-cell"><dt class="ts-data-label">${key}</dt><dd class="ts-data-value">${value}</dd></div>`).join('')}</dl></div></section>`);
  if(authored){
    sections.push(section('characteristics',authored.problem.kicker,authored.problem.title,authored.problem.paragraphs,rows(authored.problem.rows)));
    sections.push(section('existing-solutions','EXISTING SOLUTIONS',authored.existing.title,authored.existing.paragraphs,cards(authored.existing.cards),true));
    sections.push(section('terrasave-solution',authored.solution.kicker,authored.solution.title,authored.solution.paragraphs,(authored.solution.cards.length?cards(authored.solution.cards):'')+action('product.html','구매하러가기')));
  }else{
    sections.push(section('characteristics','01 / FRUIT CHARACTERISTICS',esc(normal(fruit.easyHeadline)),['같은 과일이라도 숙도와 유통 기간에 따라 상태가 달라집니다. 포장재를 고르기 전에 이 과일이 이동 중 어떻게 변하는지부터 이해하는 것이 중요합니다.'],rows((fruit.traits||[]).map(([heading,body])=>({title:esc(heading),paragraphs:[esc(normal(body))]})))));
    sections.push(section('quality-risk','02 / QUALITY RISK','이 과일에서 먼저 볼 문제,<br>포장 방향은 여기서 정해집니다.',['보관 온도 숫자만 보고 포장 사양을 정하지 않습니다. 현재 숙도, 유통 거리와 기간, 기존 포장 방식까지 함께 보고 어떤 보호가 실제로 필요한지 정합니다.'],rows([{title:esc(normal(fruit.focusKo)),paragraphs:[esc(normal(fruit.riskExplain))]},{title:storage(fruit.storage),paragraphs:[esc(normal(fruit.storageExplain))]},{title:esc(fruit.priorityPlain),paragraphs:[esc(normal(fruit.priorityExplain))]},{title:'시험 적용 방향',paragraphs:[esc(normal(fruit.packagingGuide))]}]),true));
    sections.push(section('terrasave-solution','03 / TerraSave APPROACH','필요한 기능은 설명합니다,<br>핵심 기술은 보호합니다.',['고객이 포장을 검토하는 데 필요한 역할과 방향은 쉽게 설명합니다. 다만 소재의 정확한 조성, 배합비, 제조 공정처럼 그대로 복제할 수 있는 기술 정보는 공개하지 않습니다.'],cards((fruit.approach||[]).map((value,i)=>({kicker:number(i),title:esc(normal(value)),paragraphs:['현재 포장 방식, 유통 거리와 기간을 함께 보고 실제로 필요한 기능인지 확인합니다.']})))));
  }
  const research=authored?.research||{blocks:[{title:'저장·유통 중 주요 품질 저하 요인',paragraphs:[esc(normal(fruit.riskExplain))]},{title:'보관 및 유통 관리 포인트',paragraphs:[esc(normal(fruit.storageExplain)),esc(normal(fruit.packagingGuide))]}],referenceTitle:'자료 이용 안내',references:[]};
  const researchBody=`<div class="ts-detail-research">${research.blocks.map((block,i)=>`<article class="ts-detail-research-block"><h3><span class="ts-research-number">${number(i)}</span><span>${esc(block.title)}</span></h3>${prose(block.paragraphs)}</article>`).join('')}<div class="ts-detail-references"><h3>${esc(research.referenceTitle)}</h3>${research.references.length?`<ul class="ts-reference-list">${research.references.map(ref=>`<li>${normal(ref)}</li>`).join('')}</ul>`:''}<p class="ts-research-note">보관 조건과 과일 특성은 공개 문헌과 연구자료를 바탕으로 정리했습니다. 실제 적용 결과는 품종, 숙도, 포장 규격, 유통 온도와 기간에 따라 달라질 수 있으며 적용 전 검증이 필요합니다.</p></div></div>`;
  sections.push(section('research','04 / RESEARCH & REFERENCES',esc(name)+'에 대해<br>더 읽어볼 만한 자료',[],researchBody,true));
  sections.push(`<section class="ts-section"><div class="ts-shell"><div class="ts-cta"><div class="ts-cta-copy"><span class="ts-kicker">다른 과일 보기</span><h2 class="ts-h2">다른 과일도,<br class="desktop-break"> 같은 기준으로 비교해보세요.</h2><nav class="ts-cta-links" aria-label="이전 및 다음 과일"><a class="ts-link" href="fruit.html?fruit=${esc(previous.slug)}">← ${esc(normal(previous.ko))}</a><a class="ts-link" href="fruit.html?fruit=${esc(next.slug)}">${esc(normal(next.ko))} →</a></nav></div><div class="ts-cta-action"><a class="ts-button is-dark is-large" href="contact.html">포장 솔루션 문의하기</a></div></div></div></section>`);
  root.innerHTML=sections.join('\n');
  document.title=`${name} 보관·포장 가이드 — TerraSave`;
  const meta=document.querySelector('meta[name="description"]');if(meta)meta.content=`${name}의 보관 조건, 유통 중 주의점과 포장 방향을 확인합니다.`;
  document.body.classList.add('fruit-'+fruit.slug);
  if(authored)document.body.classList.add('has-authored-fruit-profile');
})();
