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
  const comparison = value => {
    if (!value?.rows?.length) return "";
    const headings = value.headers.map(item=>`<th scope="col">${esc(normal(item))}</th>`).join("");
    const rows = value.rows.map(row=>`<tr><th scope="row">${esc(normal(row[0]))}</th><td>${esc(normal(row[1]))}</td><td>${esc(normal(row[2]))}</td></tr>`).join("");
    return `<div class="ts-fruit-comparison"><h3>${esc(normal(value.title))}</h3><div class="ts-fruit-comparison-scroll" role="region" aria-label="${esc(normal(value.title))}" tabindex="0"><table class="ts-fruit-comparison-table"><thead><tr>${headings}</tr></thead><tbody>${rows}</tbody></table></div></div>`;
  };
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
    sections.push(section('terrasave-solution',authored.solution.kicker,authored.solution.title,authored.solution.paragraphs,(authored.solution.cards.length?cards(authored.solution.cards):'')+comparison(authored.solution.comparison)+action('product.html','구매하러가기')));
  }else{
    sections.push(section('characteristics','01 / FRUIT CHARACTERISTICS',esc(normal(fruit.easyHeadline)),['같은 과일이라도 숙도와 유통 기간에 따라 상태가 달라집니다. 포장재를 고르기 전에 이 과일이 이동 중 어떻게 변하는지부터 이해하는 것이 중요합니다.'],rows((fruit.traits||[]).map(([heading,body])=>({title:esc(heading),paragraphs:[esc(normal(body))]})))));
    sections.push(section('quality-risk','02 / QUALITY RISK','이 과일에서 먼저 볼 문제,<br>포장 방향은 여기서 정해집니다.',['보관 온도 숫자만 보고 포장 사양을 정하지 않습니다. 현재 숙도, 유통 거리와 기간, 기존 포장 방식까지 함께 보고 어떤 보호가 실제로 필요한지 정합니다.'],rows([{title:esc(normal(fruit.focusKo)),paragraphs:[esc(normal(fruit.riskExplain))]},{title:storage(fruit.storage),paragraphs:[esc(normal(fruit.storageExplain))]},{title:esc(fruit.priorityPlain),paragraphs:[esc(normal(fruit.priorityExplain))]},{title:'시험 적용 방향',paragraphs:[esc(normal(fruit.packagingGuide))]}]),true));
    sections.push(section('terrasave-solution','03 / TerraSave APPROACH','필요한 기능은 설명합니다,<br>핵심 기술은 보호합니다.',['고객이 포장을 검토하는 데 필요한 역할과 방향은 쉽게 설명합니다. 다만 소재의 정확한 조성, 배합비, 제조 공정처럼 그대로 복제할 수 있는 기술 정보는 공개하지 않습니다.'],cards((fruit.approach||[]).map((value,i)=>({kicker:number(i),title:esc(normal(value)),paragraphs:['현재 포장 방식, 유통 거리와 기간을 함께 보고 실제로 필요한 기능인지 확인합니다.']})))));
  }

  // Match the homepage's five-day test cards, image order and zoom behavior.
  // Only the Shine Muscat detail page renders this additional section.
  if(fruit.slug==='shine-muscat'){
    const testDays=[0,7,14,20,30];
    const mof=["https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-191314-1-582616d0.webp","https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-191315-2-39743dc1.webp","https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-191315-3-0b17ae89.webp","https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-191315-4-51815101.webp","https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-191314-5-88b985e6.webp"];
    const pet=["https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-191316-1-9bda0b4b.webp","https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-191317-2-1e843020.webp","https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-191317-3-790d2ad1.webp","https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-191318-4-b2a20a0b.webp","https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-191316-5-9324caa8.webp"];
    const testFigure=(day,src,isMof)=>`<figure class="ts-home-test-photo">
      <button class="ts-home-test-enlarge" type="button" aria-haspopup="dialog" aria-label="Day ${day} ${isMof?'TerraSAVE 적용 용기':'일반 PET 용기'} 사진 확대해서 보기" title="사진 확대 보기">
        <img src="${src}" alt="샤인머스캣 ${isMof?'TerraSAVE 적용 용기':'일반 PET 용기'} Day ${day} 보관 비교 이미지" loading="lazy" decoding="async" />
      </button>
      <figcaption>${isMof?'TerraSAVE 적용 용기 <span>MOF</span>':'일반 PET 용기'}</figcaption>
    </figure>`;
    const daysHtml=testDays.map((day,i)=>`<article class="ts-home-test-day" aria-label="Day ${day} 보관 비교">
      <h3>Day ${day}</h3>
      ${testFigure(day,mof[i],true)}
      ${testFigure(day,pet[i],false)}
    </article>`).join('');
    sections.push(`<div class="ts-home-page ts-fruit-shine-test">
      <section class="ts-home-section is-soft ts-home-compact-test" id="test" aria-labelledby="fruitShineTestTitle">
        <div class="ts-shell">
          <div class="ts-home-compact-heading">
            <span class="ts-kicker">보관 테스트 비교 사례</span>
            <h2 class="ts-h2" id="fruitShineTestTitle">샤인머스캣 보관 테스트</h2>
            <p>TerraSAVE 적용 용기(MOF)와 일반 PET 용기의 시간 경과별 외관 변화를 비교했습니다.</p>
          </div>
          <div class="ts-home-test-gallery">${daysHtml}</div>
          
        </div>
        <dialog class="ts-home-lightbox" id="tsHomeLightbox" aria-label="샤인머스캣 이미지 확대 보기">
          <div class="ts-home-lightbox-inner">
            <button type="button" class="ts-home-lightbox-close" aria-label="확대 이미지 닫기">×</button>
            <img class="ts-home-lightbox-image" alt="" />
            <p class="ts-home-lightbox-caption" aria-live="polite"></p>
          </div>
        </dialog>
      </section>
    </div>`);
  }



  // Strawberry: day-by-day illustrative comparison; source file numbers 1-5 (control), 6-10 (MOF).
  if(fruit.slug==='strawberry'){
    const days=[1,2,3,4,5];
    const control=[
    "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261013-233454-1-efd20a0c.webp",
    "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261013-233450-2-8c007fc1.webp",
    "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261013-233450-3-5eb91515.webp",
    "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261013-233451-4-84f31020.webp",
    "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261013-233451-5-b02ce268.webp"
];
    const mof=[
    "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261013-233449-6-bbc635a5.webp",
    "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261013-233452-7-953ef5ae.webp",
    "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261013-233452-8-ac4a9be4.webp",
    "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261013-233453-9-f972d2fb.webp",
    "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261013-233453-10-83a9af9c.webp"
];
    const photo=(day,url,isMof)=>`<figure class="ts-home-test-photo">
      <button class="ts-home-test-enlarge" type="button" aria-haspopup="dialog" aria-label="딸기 ${day}일차 ${isMof?'MOF 적용 용기':'일반 용기'} 비교 이미지 확대 보기" title="이미지 확대 보기">
        <img src="${esc(url)}" alt="딸기 ${day}일차 ${isMof?'MOF 적용 용기':'일반 용기'} 보관 경과 시각화" width="1000" height="1000" loading="lazy" decoding="async"/>
      </button>
      <figcaption>${isMof?'MOF 적용 용기':'일반 용기'}</figcaption>
    </figure>`;
    const cards=days.map((day,i)=>`<article class="ts-home-test-day" aria-label="딸기 ${day}일차 일반 용기 및 MOF 적용 용기 비교">
      <h3>DAY ${day}</h3>
      ${photo(day,control[i],false)}
      ${photo(day,mof[i],true)}
    </article>`).join('');
    sections.push(`<div class="ts-home-page ts-fruit-strawberry-test">
      <section class="ts-home-section is-soft ts-home-compact-test" id="strawberry-test" aria-labelledby="strawberryTestTitle">
        <div class="ts-shell">
          <div class="ts-home-compact-heading">
            <span class="ts-kicker">외관 변화 시각화</span>
            <h2 class="ts-h2" id="strawberryTestTitle">딸기 5일간 외관 변화 비교</h2>
            <p>일반 용기와 MOF 적용 용기의 시간 경과에 따른 딸기 상태를 DAY 1부터 DAY 5까지 비교합니다. 각 날짜의 위쪽은 일반 용기, 아래쪽은 MOF 적용 용기입니다.</p>
          </div>
          <div class="ts-home-test-gallery">${cards}</div>
          
        </div>
        <dialog class="ts-home-lightbox" id="tsHomeLightbox" aria-label="딸기 비교 이미지 확대 보기">
          <div class="ts-home-lightbox-inner">
            <button type="button" class="ts-home-lightbox-close" aria-label="확대 이미지 닫기">×</button>
            <img class="ts-home-lightbox-image" alt="" />
            <p class="ts-home-lightbox-caption" aria-live="polite"></p>
          </div>
        </dialog>
      </section>
    </div>`);
  }

  // Avocado: twelve chronological photographs, with both containers visible in each frame.
  // Capture timestamps follow the source sheet exactly; no treatment is assigned to either side.
  if(fruit.slug==='avocado'){
    const captures=[
    {
        "url": "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-230455-1-624eca5f.webp",
        "date": "8월 31일",
        "clock": "오전 11시 20분"
    },
    {
        "url": "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-230456-2-f58d903b.webp",
        "date": "9월 2일",
        "clock": "오후 1시 20분"
    },
    {
        "url": "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-230456-3-b1d8f2f8.webp",
        "date": "9월 4일",
        "clock": "오후 3시 20분"
    },
    {
        "url": "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-230457-4-b98bee71.webp",
        "date": "9월 6일",
        "clock": "오후 5시 20분"
    },
    {
        "url": "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-230458-5-9d7714b2.webp",
        "date": "9월 8일",
        "clock": "오후 7시 20분"
    },
    {
        "url": "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-230459-6-e33f97be.webp",
        "date": "9월 10일",
        "clock": "오후 9시 20분"
    },
    {
        "url": "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-230500-7-5d95e34f.webp",
        "date": "9월 12일",
        "clock": "오후 11시 20분"
    },
    {
        "url": "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-230501-8-3646d5ee.webp",
        "date": "9월 15일",
        "clock": "오전 1시 20분"
    },
    {
        "url": "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-230501-9-3eaed8ef.webp",
        "date": "9월 17일",
        "clock": "오전 3시 20분"
    },
    {
        "url": "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-230502-10-8e275c74.webp",
        "date": "9월 19일",
        "clock": "오전 5시 20분"
    },
    {
        "url": "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-230503-11-7b32b21e.webp",
        "date": "9월 21일",
        "clock": "오전 7시 20분"
    },
    {
        "url": "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-230503-12-fb0f3aba.webp",
        "date": "9월 21일",
        "clock": "오전 11시 20분"
    }
];
    const photos=captures.map(({url,date,clock},i)=>{
      const label=`${date} ${clock}`;
      return `<article class="ts-avocado-capture">
        <div class="ts-avocado-capture-time"><strong>${esc(date)}</strong><span>${esc(clock)}</span></div>
        <button class="ts-home-test-enlarge ts-avocado-capture-zoom" type="button" aria-haspopup="dialog" title="사진 확대 보기" aria-label="${esc(label)} 아보카도 보관 관찰 사진 확대해서 보기">
          <img src="${esc(url)}" alt="${esc(label)} 아보카도 좌우 용기 보관 상태 비교 촬영" loading="lazy" decoding="async"/>
        </button>
      </article>`;
    }).join('');
    sections.push(`<section class="ts-section is-soft ts-fruit-avocado-test" id="avocado-test" aria-labelledby="avocadoTestTitle">
      <div class="ts-shell">
        <div class="ts-avocado-test-head">
          <span class="ts-kicker">실제 보관 테스트 사례</span>
          <h2 class="ts-h2" id="avocadoTestTitle">아보카도 보관 경과 비교</h2>
          <p>두 포장 용기의 아보카도 상태를 촬영 시점에 따라 비교한 기록입니다.</p>
        </div>
        <div class="ts-avocado-test-grid">${photos}</div>
      </div>
      <dialog class="ts-home-lightbox" id="tsHomeLightbox" aria-label="아보카도 경과 이미지 확대 보기">
        <div class="ts-home-lightbox-inner">
          <button type="button" class="ts-home-lightbox-close" aria-label="확대 이미지 닫기">×</button>
          <img class="ts-home-lightbox-image" alt="" />
          <p class="ts-home-lightbox-caption" aria-live="polite"></p>
        </div>
      </dialog>
    </section>`);
  }


  if(fruit.slug==='mango'){
  sections.push(`<div class="ts-home-page ts-fruit-mango-test"><section class="ts-home-section is-soft ts-home-compact-test" id="mango-test" aria-labelledby="mangoTestTitle"><div class="ts-shell"><div class="ts-home-compact-heading"><span class="ts-kicker">보관 상태 비교</span><h2 class="ts-h2" id="mangoTestTitle">망고 보관 테스트</h2><p>일반 PET 용기(위)와 MOF 적용 용기(아래)의 외관 변화를 Day 0·3·14·17 기준으로 비교합니다.</p></div><div class="ts-home-test-gallery ts-mango-test-gallery"><article class="ts-home-test-day" aria-label="망고 Day 0"><h3>Day 0</h3><figure class="ts-home-test-photo"><button class="ts-home-test-enlarge" type="button" aria-haspopup="dialog" aria-label="망고 Day 0 일반 PET 용기 사진 확대 보기" title="사진 확대 보기"><img src="https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261014-122010-1-839311c8.webp" alt="망고 Day 0 PET 보관 상태 비교 시각화" width="1000" height="1000" loading="lazy" decoding="async"/></button><figcaption>일반 PET 용기</figcaption></figure><figure class="ts-home-test-photo"><button class="ts-home-test-enlarge" type="button" aria-haspopup="dialog" aria-label="망고 Day 0 MOF 적용 용기 사진 확대 보기" title="사진 확대 보기"><img src="https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261014-122012-5-2fe51cbe.webp" alt="망고 Day 0 MOF 보관 상태 비교 시각화" width="1000" height="1000" loading="lazy" decoding="async"/></button><figcaption>MOF 적용 용기</figcaption></figure></article><article class="ts-home-test-day" aria-label="망고 Day 3"><h3>Day 3</h3><figure class="ts-home-test-photo"><button class="ts-home-test-enlarge" type="button" aria-haspopup="dialog" aria-label="망고 Day 3 일반 PET 용기 사진 확대 보기" title="사진 확대 보기"><img src="https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261014-122011-2-b5d201c7.webp" alt="망고 Day 3 PET 보관 상태 비교 시각화" width="1000" height="1000" loading="lazy" decoding="async"/></button><figcaption>일반 PET 용기</figcaption></figure><figure class="ts-home-test-photo"><button class="ts-home-test-enlarge" type="button" aria-haspopup="dialog" aria-label="망고 Day 3 MOF 적용 용기 사진 확대 보기" title="사진 확대 보기"><img src="https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261014-122013-6-28edc9f5.webp" alt="망고 Day 3 MOF 보관 상태 비교 시각화" width="1000" height="1000" loading="lazy" decoding="async"/></button><figcaption>MOF 적용 용기</figcaption></figure></article><article class="ts-home-test-day" aria-label="망고 Day 14"><h3>Day 14</h3><figure class="ts-home-test-photo"><button class="ts-home-test-enlarge" type="button" aria-haspopup="dialog" aria-label="망고 Day 14 일반 PET 용기 사진 확대 보기" title="사진 확대 보기"><img src="https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261014-122011-3-7db8aca7.webp" alt="망고 Day 14 PET 보관 상태 비교 시각화" width="1000" height="1000" loading="lazy" decoding="async"/></button><figcaption>일반 PET 용기</figcaption></figure><figure class="ts-home-test-photo"><button class="ts-home-test-enlarge" type="button" aria-haspopup="dialog" aria-label="망고 Day 14 MOF 적용 용기 사진 확대 보기" title="사진 확대 보기"><img src="https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261014-122013-7-af4307bd.webp" alt="망고 Day 14 MOF 보관 상태 비교 시각화" width="1000" height="1000" loading="lazy" decoding="async"/></button><figcaption>MOF 적용 용기</figcaption></figure></article><article class="ts-home-test-day" aria-label="망고 Day 17"><h3>Day 17</h3><figure class="ts-home-test-photo"><button class="ts-home-test-enlarge" type="button" aria-haspopup="dialog" aria-label="망고 Day 17 일반 PET 용기 사진 확대 보기" title="사진 확대 보기"><img src="https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261014-122012-4-3bf2c3a9.webp" alt="망고 Day 17 PET 보관 상태 비교 시각화" width="1000" height="1000" loading="lazy" decoding="async"/></button><figcaption>일반 PET 용기</figcaption></figure><figure class="ts-home-test-photo"><button class="ts-home-test-enlarge" type="button" aria-haspopup="dialog" aria-label="망고 Day 17 MOF 적용 용기 사진 확대 보기" title="사진 확대 보기"><img src="https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261014-122014-8-9636b381.webp" alt="망고 Day 17 MOF 보관 상태 비교 시각화" width="1000" height="1000" loading="lazy" decoding="async"/></button><figcaption>MOF 적용 용기</figcaption></figure></article></div></div><dialog class="ts-home-lightbox" id="tsHomeLightbox" aria-label="망고 비교 이미지 확대 보기"><div class="ts-home-lightbox-inner"><button type="button" class="ts-home-lightbox-close" aria-label="닫기">×</button><img class="ts-home-lightbox-image" alt=""/><p class="ts-home-lightbox-caption" aria-live="polite"></p></div></dialog></section></div>`);
 }

  // Source-fidelity layout for the detailed Seolhyang notes. Other fruit profiles keep the standard renderer.
  const sourceResearch = research => {
    const detail=research.sourceDetail;
    const entries=detail.items.map(item=>{
      const label=item.title?`<strong>${esc(normal(item.title))}:</strong> `:'';
      const description=item.body?esc(normal(item.body)):'';
      const nested=item.children?.length?`<ul class="ts-source-sublist">${item.children.map(child=>`<li>${esc(normal(child))}</li>`).join('')}</ul>`:'';
      return `<li>${label}${description}${nested}</li>`;
    }).join('');
    const refs=research.references?.length?`<div class="ts-source-references"><h3>${esc(research.referenceTitle||'출처')}</h3><ul>${research.references.map(ref=>`<li>${normal(ref)}</li>`).join('')}</ul></div>`:'';
    return `<div class="ts-detail-research ts-source-detail"><article class="ts-source-copy"><h3>${esc(normal(detail.title))}</h3><p>${esc(normal(detail.intro))}</p><ul class="ts-source-list">${entries}</ul></article>${refs}</div>`;
  };
  const research=authored?.research||{blocks:[{title:'저장·유통 중 주요 품질 저하 요인',paragraphs:[esc(normal(fruit.riskExplain))]},{title:'보관 및 유통 관리 포인트',paragraphs:[esc(normal(fruit.storageExplain)),esc(normal(fruit.packagingGuide))]}],referenceTitle:'자료 이용 안내',references:[]};
  const researchBody=research.sourceDetail?sourceResearch(research):`<div class="ts-detail-research">${research.blocks.map((block,i)=>`<article class="ts-detail-research-block"><h3><span class="ts-research-number">${number(i)}</span><span>${esc(block.title)}</span></h3>${prose(block.paragraphs)}</article>`).join('')}<div class="ts-detail-references"><h3>${esc(research.referenceTitle)}</h3>${research.references.length?`<ul class="ts-reference-list">${research.references.map(ref=>`<li>${normal(ref)}</li>`).join('')}</ul>`:''}<p class="ts-research-note">보관 조건과 과일 특성은 공개 문헌과 연구자료를 바탕으로 정리했습니다. 실제 적용 결과는 품종, 숙도, 포장 규격, 유통 온도와 기간에 따라 달라질 수 있으며 적용 전 검증이 필요합니다.</p></div></div>`;
  sections.push(section('research','04 / RESEARCH & REFERENCES',research.sourceDetail?'과일별 연구자료':esc(name)+'에 대해<br>더 읽어볼 만한 자료',[],researchBody,true));
  sections.push(`<section class="ts-section"><div class="ts-shell"><div class="ts-cta"><div class="ts-cta-copy"><span class="ts-kicker">다른 과일 보기</span><h2 class="ts-h2">다른 과일도,<br class="desktop-break"> 같은 기준으로 비교해보세요.</h2><nav class="ts-cta-links" aria-label="이전 및 다음 과일"><a class="ts-link" href="fruit.html?fruit=${esc(previous.slug)}">← ${esc(normal(previous.ko))}</a><a class="ts-link" href="fruit.html?fruit=${esc(next.slug)}">${esc(normal(next.ko))} →</a></nav></div><div class="ts-cta-action"><a class="ts-button is-dark is-large" href="contact.html">포장 솔루션 문의하기</a></div></div></div></section>`);
  root.innerHTML=sections.join('\n');
  document.title=`${name} 보관·포장 가이드 — TerraSave`;
  const meta=document.querySelector('meta[name="description"]');if(meta)meta.content=`${name}의 보관 조건, 유통 중 주의점과 포장 방향을 확인합니다.`;
  document.body.classList.add('fruit-'+fruit.slug);
  if(authored)document.body.classList.add('has-authored-fruit-profile');
})();
