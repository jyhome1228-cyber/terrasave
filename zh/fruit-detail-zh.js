/* Simplified Chinese fruit-detail renderer. Keep original KO fruit data for numeric/storage facts. */
(() => {
 'use strict';
 const root=document.querySelector('[data-fruit-detail]');
 const fruits=window.TERRASAVE_FRUITS||[];
 if(!root||!fruits.length)return;
 const slug=new URLSearchParams(location.search).get('fruit')||'apple';
 const index=Math.max(0,fruits.findIndex(f=>f.slug===slug));
 const fruit=fruits[index];
 const names={"avocado":"牛油果","blueberry":"蓝莓","cherry":"樱桃","mango":"芒果","banana":"香蕉","strawberry":"草莓","shine-muscat":"阳光玫瑰葡萄","table-grape":"鲜食葡萄","apple":"苹果","asian-pear":"韩国梨","kiwi":"猕猴桃","peach":"桃子","nectarine":"油桃","persimmon":"甜柿","mandarin":"柑橘","pomegranate":"石榴","pineapple":"菠萝","plum":"李子"};
 const info={"avocado":["牛油果采后仍会继续成熟，呼吸和乙烯活动、温度波动及水分管理都会影响品质。","成熟过程过快、果肉软化、内部褐变、冷害以及果蒂部位腐败是主要风险。","应根据成熟度区分储存温度，避免过冷，并控制包装内的水分与凝露。","按成熟度、运输距离及包装规格评估乙烯管理和缓冲保护功能。"],"blueberry":["蓝莓果粒娇嫩，长时间运输时容易失水、软化，并受到微生物污染影响。","主要问题包括失水、果粉损伤、霉菌生长及运输时的挤压。","保持稳定冷链与适当湿度，减少包装内凝露和反复温度变化。","结合冷链与包装透气条件设计保护，重点考虑保湿和微生物风险。"],"cherry":["樱桃采后品质受低温、果梗失水与外部冲击影响较大。","失水使果梗变褐、果粒软化，温度波动也可能增加腐败风险。","尽快预冷并维持冷链，同时避免自由水积聚。","选择能够减轻接触挤压并帮助维持适宜湿度的包装形式。"],"mango":["芒果属于采后持续后熟的水果，温度与乙烯共同影响成熟速度。","成熟不均、压伤、冷害以及贮运过程中软化过快都可能影响商品性。","按照成熟度设置储运温度，注意过低温度引起的冷害。","评估缓冲保护与适宜的包装气体、水分管理方式。"],"banana":["香蕉在采后持续后熟，对乙烯非常敏感。","成熟速度不一致、果皮擦伤和低温伤害会影响外观品质。","以稳定适当温度和控制乙烯暴露为重点，避免低温伤害。","结合运输周期与成熟度，评估包装对碰撞和后熟环境的管理需求。"],"strawberry":["草莓水分含量高、表皮易受损，储运期间的凝露及霉菌需要特别关注。","机械性损伤、果粒软化、凝露及灰霉病可能加快损耗。","保持低温冷链，同时尽量避免水珠在包装内积聚。","根据实际包装容积和通风条件，评估缓冲、凝露与微生物管理。"],"shine-muscat":["阳光玫瑰葡萄果粒饱满、含水量高，果梗状态、落粒和霉菌是主要储存管理问题。","果梗失水、落粒、果粒损伤和灰霉病会影响长途流通品质。","尽量维持稳定低温和适宜湿度，重点关注凝露、果梗水分和落粒。","针对果串形状及配送周期，评估容器保鲜性能和运输保护方案。"],"table-grape":["鲜食葡萄通常在采收后不再明显提高成熟度，需要维持采收时的品质。","果梗失水、掉粒、果粒破损以及霉菌生长会造成损耗。","加强低温管理和果梗保湿，尽量减少包装内凝露。","评估适合果串形态的缓冲和保鲜包装结构。"],"apple":["苹果采后持续呼吸并释放乙烯，长期储存需要重视成熟控制。","失水、软化、挤压损伤与乙烯驱动的成熟变化可能影响货架期。","稳定冷链，关注乙烯暴露与品种差异，并避免果实间挤压。","结合储运周期评估防碰撞和成熟环境管理。"],"asian-pear":["韩国梨果肉脆嫩，长期储存时须控制水分流失与运输碰伤。","失水、表皮损伤、内部褐变和温度管理不当会降低商品品质。","根据品种保持适当的低温和湿度，避免堆压与振动。","选择有助于降低运输冲击、维持外观品质的包装形式。"],"kiwi":["猕猴桃属于后熟型水果，对乙烯非常敏感。","乙烯可能促进快速软化，运输温度和机械损伤也会影响品质。","应管理外部乙烯暴露并稳定冷链，结合目标成熟度安排运输。","按目标成熟度评估包装内环境及接触挤压保护。"],"peach":["桃子采后继续成熟，果肉容易软化，对冲击和低温环境较敏感。","快速软化、擦碰伤和某些低温条件引起的品质异常是主要风险。","依据品种、成熟度及运输周期管理温度，尽量减少碰撞。","优先评估缓冲保护、果面接触和湿度管理。"],"nectarine":["油桃表面较光滑，运输时容易出现擦伤和软化问题。","表皮擦伤、果肉软化、压伤及不适当低温造成的品质损失值得关注。","结合实际成熟度维持稳定储运温度，减少振动与挤压。","评估适配果径与包装结构的物理保护及保鲜方案。"],"persimmon":["甜柿对外部乙烯较敏感，可能在运输中发生快速软化。","乙烯影响、果肉软化、挤压损伤以及储存温湿度变化可能造成品质下降。","避免过度乙烯暴露并维持适宜的冷链和湿度。","结合货架期需求评估成熟控制、缓冲和储存环境管理。"],"mandarin":["柑橘在采后不会显著继续变甜，果皮状态与腐败管理很重要。","果皮失水、皱缩、擦碰伤及青霉等微生物腐败可能造成损失。","在适宜温度下保持果皮水分，同时减少包装内水珠聚集。","评估果皮保护、湿度与通风之间的平衡。"],"pomegranate":["石榴果皮较厚，但长期储存时仍会发生失水和冷害。","果皮皱缩、重量损失、冷害以及内部品质变化是重点风险。","根据储存时间选择适宜温度，控制水分流失并避免过冷。","结合果实重量与包装形式评估保湿和缓冲保护。"],"pineapple":["菠萝采后糖度通常不会明显增加，温度与水分管理决定外观保持状态。","低温伤害、表皮失水、压伤及冠叶状态变化会影响商品品质。","根据成熟程度控制温度，避免冷害并管理环境湿度。","评估适合果形、重量和运输周期的包装保护功能。"],"plum":["李子采后持续成熟，软化速度及运输冲击会影响销售品质。","快速软化、果面压痕、失水和冷害风险可能导致商品性下降。","按照成熟度维持适当冷链，避免反复温度变化与过度堆压。","结合品种与运输方式评估缓冲及保鲜包装结构。"]};
 const authored=window.TERRASAVE_FRUIT_CONTENT_ZH?.[fruit.slug];
 const source=info[fruit.slug]||['请咨询该产品的储运特点。','不同储运环境可能引起品质下降。','建议结合品种和成熟度评估。','结合现有包装和运输环境选择方案。'];
 const name=names[fruit.slug]||fruit.en;
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const images=window.TERRASAVE_FRUIT_IMAGES?.[fruit.slug]||[fruit.imageWhole,fruit.imageCut];
 const storage=value=>esc(String(value).replaceAll('미숙과','未熟果').replaceAll('완숙과','成熟果').replaceAll('녹숙과','青熟果').replaceAll('부분후숙','部分后熟').replaceAll('약 ','约 ').replaceAll('단기','短期').replaceAll('장기','长期'));
 const ripening={'수확 후에도 계속 익는 과일':'采后继续后熟','수확 후 크게 더 익지 않는 과일':'采后不明显后熟','품종에 따라 익는 방식이 다름':'依品种而异','외부 에틸렌에 쉽게 반응하는 과일':'对外部乙烯敏感','수확 후 단맛이 크게 늘지 않는 과일':'采后甜度不明显增加'};
 const ethylene={'매우 민감':'非常敏感','민감함':'敏感','보통':'中等','영향이 낮음':'影响较小','품종에 따라 보통':'视品种而定','극도로 민감':'极其敏感'};
 const focus={"avocado":"后熟 · 乙烯","blueberry":"保湿 · 霉菌","cherry":"冷链 · 保湿","mango":"后熟 · 冷害","banana":"后熟 · 乙烯","strawberry":"凝露 · 霉菌","shine-muscat":"果梗保湿 · 落粒 · 霉菌","table-grape":"保湿 · 落粒 · 霉菌","apple":"乙烯 · 硬度","asian-pear":"储存 · 保湿 · 冲击","kiwi":"乙烯 · 软化","peach":"软化 · 冷害","nectarine":"软化 · 冷害","persimmon":"乙烯 · 软化","mandarin":"果皮 · 腐败","pomegranate":"果皮保湿 · 冷害","pineapple":"温度 · 水分","plum":"后熟 · 软化"};
 const title=(k,h,p='')=>`<div class="ts-section-head"><span class="ts-kicker">${k}</span><h2 class="ts-h2">${h}</h2>${p?`<p class="ts-section-copy">${p}</p>`:''}</div>`;
 const sec=(id,k,h,p,body,soft=false)=>`<section class="ts-section${soft?' is-soft':''}" id="${id}"><div class="ts-shell">${title(k,h,p)}${body}</div></section>`;
 const data=[['成熟特点',ripening[fruit.ripeningPlain]||fruit.en],['建议储存温度',storage(fruit.storage)],['建议相对湿度',esc(fruit.humidity)],['乙烯敏感度',ethylene[fruit.ethylenePlain]||'因品种而异'],['管理优先级',esc(fruit.priority)],['重点管理因素',focus[fruit.slug]]];
 const rows=[['01','主要品质风险',source[1]],['02','储运管理建议',source[2]],['03','包装评估方向',source[3]]];
 const previous=fruits[(index-1+fruits.length)%fruits.length],next=fruits[(index+1)%fruits.length];
 const sections=[];
 sections.push(`<section class="ts-page-hero"><div class="ts-shell"><div class="ts-detail-hero"><div class="ts-detail-image-pair" aria-label="${name}图片"><figure class="ts-detail-fruit-photo"><img src="${esc(images[0])}" alt="${name}完整外观" width="1000" height="1000" fetchpriority="high"></figure><figure class="ts-detail-fruit-photo"><img src="${esc(images[1])}" alt="${name}剖面" width="1000" height="1000"></figure></div><div class="ts-detail-copy"><div class="ts-detail-meta"><span class="ts-kicker">水果保鲜资料 / ${name}</span><span class="ts-detail-status">${['avocado','strawberry','shine-muscat','mango'].includes(slug)?'可提供解决方案':'持续研究中'}</span></div><h1 class="ts-h1">${name}</h1><div class="ts-detail-lead"><p>${source[0]}</p></div><div class="ts-action-group"><a class="ts-button is-dark" href="contact.html">咨询${name}包装方案</a></div></div></div></div></section>`);
 sections.push(`<section class="ts-section is-compact"><div class="ts-shell"><dl class="ts-data-grid">${data.map(d=>`<div class="ts-data-cell"><dt class="ts-data-label">${d[0]}</dt><dd class="ts-data-value">${d[1]}</dd></div>`).join('')}</dl></div></section>`);
 const authoredRows=items=>`<div class="ts-application-list">${items.map((row,i)=>`<article class="ts-application-row"><span class="ts-kicker">${String(i+1).padStart(2,'0')}</span><h3>${row.title}</h3><div class="ts-row-body">${row.paragraphs.map(p=>`<p>${p}</p>`).join('')}</div></article>`).join('')}</div>`;
 const authoredCards=items=>`<div class="ts-approach-grid" data-columns="${items.length}">${items.map(item=>`<article class="ts-approach"><span class="ts-kicker">${item.kicker}</span><div><h3 class="ts-h3">${item.title}</h3>${item.paragraphs.map(p=>`<p>${p}</p>`).join('')}</div></article>`).join('')}</div>`;
 const authoredComparison=value=>!value?.rows?.length?'':`<div class="ts-fruit-comparison"><h3>${value.title}</h3><div class="ts-fruit-comparison-scroll" role="region" aria-label="${value.title}" tabindex="0"><table class="ts-fruit-comparison-table"><thead><tr>${value.headers.map(h=>`<th scope="col">${h}</th>`).join('')}</tr></thead><tbody>${value.rows.map(row=>`<tr><th scope="row">${row[0]}</th><td>${row[1]}</td><td>${row[2]}</td></tr>`).join('')}</tbody></table></div></div>`;
 if(authored){
   sections.push(sec('characteristics',authored.problem.kicker,authored.problem.title,authored.problem.paragraphs.join(' '),authoredRows(authored.problem.rows)));
   sections.push(sec('existing-solutions','EXISTING SOLUTIONS',authored.existing.title,authored.existing.paragraphs.join(' '),authoredCards(authored.existing.cards),true));
   sections.push(sec('terrasave-solution',authored.solution.kicker,authored.solution.title,authored.solution.paragraphs.join(' '),(authored.solution.cards.length?authoredCards(authored.solution.cards):'')+authoredComparison(authored.solution.comparison)+`<div class="ts-action-group is-centered"><a class="ts-button is-dark is-large" href="product.html">了解产品</a></div>`));
 }else{
 sections.push(sec('characteristics','水果特点与品质风险',`${name}在储运中需要注意什么？`,'根据水果特点、成熟度及配送环境进行综合评估。',`<div class="ts-application-list">${rows.map(r=>`<article class="ts-application-row"><span class="ts-kicker">${r[0]}</span><h3>${r[1]}</h3><div class="ts-row-body"><p>${r[2]}</p></div></article>`).join('')}</div>`));
 sections.push(sec('existing-solutions','储存与包装管理','没有适用于所有水果的单一方案。','应同时考虑储存温湿度、产品状态及运输周期。',`<div class="ts-approach-grid" data-columns="3">
  <article class="ts-approach"><span class="ts-kicker">01</span><div><h3>温湿度管理</h3><p>${source[2]}</p></div></article>
  <article class="ts-approach"><span class="ts-kicker">02</span><div><h3>物理保护</h3><p>根据水果大小、形状和包装方式评估摩擦、震动与挤压风险。</p></div></article>
  <article class="ts-approach"><span class="ts-kicker">03</span><div><h3>验证后应用</h3><p>结合实际流通环境试验包装效果，不根据单次图片推断定量性能。</p></div></article></div>`,true));
 sections.push(sec('terrasave-solution','TerraSAVE 解决方案',`针对${name}的包装应用方向`,'先确定需要保护什么，再选择合适的包装产品与功能。',`<div class="ts-approach-grid" data-columns="2">
  <article class="ts-approach"><span class="ts-kicker">TerraSAVE / 01</span><div><h3>按品类评估</h3><p>${source[3]}</p></div></article>
  <article class="ts-approach"><span class="ts-kicker">TerraSAVE / 02</span><div><h3>结合实际需求验证</h3><p>根据现有包装、规格、储运距离与目标保存期，与客户共同确定试验和适用范围。</p></div></article></div><div class="ts-action-group is-centered"><a class="ts-button is-dark is-large" href="product.html">了解产品</a></div>`));

 }
 if(slug==='shine-muscat'){
  const days=[0,7,14,20,30];
  const urls={mof:["20261011-191314-1-582616d0","20261011-191315-2-39743dc1","20261011-191315-3-0b17ae89","20261011-191315-4-51815101","20261011-191314-5-88b985e6"],pet:["20261011-191316-1-9bda0b4b","20261011-191317-2-1e843020","20261011-191317-3-790d2ad1","20261011-191318-4-b2a20a0b","20261011-191316-5-9324caa8"]};
  const cdn='https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/';
  const figure=(day,id,group)=>`<figure class="ts-home-test-photo"><button class="ts-home-test-enlarge" type="button" title="点击放大" aria-label="放大查看第${day}天${group==='mof'?'技术应用容器':'普通PET容器'}图片"><img src="${cdn+id}.webp" alt="第${day}天 ${group==='mof'?'TerraSAVE应用容器':'普通PET容器'}的葡萄示意图" loading="lazy" decoding="async"></button><figcaption>${group==='mof'?'TerraSAVE应用容器 <span>MOF</span>':'普通PET容器'}</figcaption></figure>`;
  sections.push(`<div class="ts-home-page ts-fruit-shine-test"><section class="ts-home-section is-soft ts-home-compact-test" id="test"><div class="ts-shell"><div class="ts-home-compact-heading"><span class="ts-kicker">储存测试对比案例</span><h2 class="ts-h2">阳光玫瑰葡萄储存测试</h2><p>对比 TerraSAVE 技术应用容器（MOF）与普通 PET 容器在不同时间的外观变化。</p></div><div class="ts-home-test-gallery">${days.map((d,i)=>`<article class="ts-home-test-day"><h3>Day ${d}</h3>${figure(d,urls.mof[i],'mof')}${figure(d,urls.pet[i],'pet')}</article>`).join('')}</div><p class="ts-home-test-note">该图片为基于试验照片重新制作的可视化示意，不是未经修改的原始试验照片。初始条件、储存环境及样品状态均可能影响结果，不能仅依据图片判断定量性能。</p></div><dialog class="ts-home-lightbox" id="tsHomeLightbox" aria-label="放大查看葡萄图片"><div class="ts-home-lightbox-inner"><button type="button" class="ts-home-lightbox-close" aria-label="关闭">×</button><img class="ts-home-lightbox-image" alt=""/><p class="ts-home-lightbox-caption" aria-live="polite"></p></div></dialog></section></div>`);
 }

 if(slug==='avocado'){
  const captures=[{"url":"https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-230455-1-624eca5f.webp","date":"8月31日","clock":"上午11:20"},{"url":"https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-230456-2-f58d903b.webp","date":"9月2日","clock":"下午1:20"},{"url":"https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-230456-3-b1d8f2f8.webp","date":"9月4日","clock":"下午3:20"},{"url":"https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-230457-4-b98bee71.webp","date":"9月6日","clock":"下午5:20"},{"url":"https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-230458-5-9d7714b2.webp","date":"9月8日","clock":"下午7:20"},{"url":"https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-230459-6-e33f97be.webp","date":"9月10日","clock":"下午9:20"},{"url":"https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-230500-7-5d95e34f.webp","date":"9月12日","clock":"下午11:20"},{"url":"https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-230501-8-3646d5ee.webp","date":"9月15日","clock":"上午1:20"},{"url":"https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-230501-9-3eaed8ef.webp","date":"9月17日","clock":"上午3:20"},{"url":"https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-230502-10-8e275c74.webp","date":"9月19日","clock":"上午5:20"},{"url":"https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-230503-11-7b32b21e.webp","date":"9月21日","clock":"上午7:20"},{"url":"https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-230503-12-fb0f3aba.webp","date":"9月21日","clock":"上午11:20"}];
  const photos=captures.map(({url,date,clock})=>{
    const label=`${date} ${clock}`;
    return `<article class="ts-avocado-capture">
      <div class="ts-avocado-capture-time"><strong>${esc(date)}</strong><span>${esc(clock)}</span></div>
      <button class="ts-home-test-enlarge ts-avocado-capture-zoom" type="button" aria-haspopup="dialog" title="点击放大" aria-label="${esc(label)} 牛油果储存对比图片，点击放大">
        <img src="${esc(url)}" alt="${esc(label)} 牛油果两种容器储存对比示意图" loading="lazy" decoding="async"/>
      </button>
    </article>`;
  }).join('');
  sections.push(`<section class="ts-section is-soft ts-fruit-avocado-test" id="avocado-test" aria-labelledby="avocadoTestTitle">
    <div class="ts-shell"><div class="ts-avocado-test-head">
      <span class="ts-kicker">储存对比案例</span>
      <h2 class="ts-h2" id="avocadoTestTitle">牛油果储存过程对比</h2>
      <p>按照不同时间顺序，对比两个包装容器内牛油果的外观变化。下列图片根据提供资料重新制作，仅作为直观展示，不等同于未经处理的原始试验照片。</p>
    </div><div class="ts-avocado-test-grid">${photos}</div></div>
    <dialog class="ts-home-lightbox" id="tsHomeLightbox" aria-label="放大查看牛油果图片"><div class="ts-home-lightbox-inner">
      <button type="button" class="ts-home-lightbox-close" aria-label="关闭">×</button>
      <img class="ts-home-lightbox-image" alt=""/>
      <p class="ts-home-lightbox-caption" aria-live="polite"></p>
    </div></dialog>
  </section>`);
 }
 if(authored?.research){
   const rd=authored.research;
   const body=`<div class="ts-detail-research">${rd.blocks.map((block,i)=>`<article class="ts-detail-research-block"><h3><span class="ts-research-number">${String(i+1).padStart(2,'0')}</span><span>${block.title}</span></h3>${block.paragraphs.map(v=>`<p>${v}</p>`).join('')}</article>`).join('')}<div class="ts-detail-references"><h3>研究与参考资料</h3><ul class="ts-reference-list">${rd.references.map(v=>`<li>${v}</li>`).join('')}</ul><p class="ts-research-note">以上为公开研究及应用场景的整理摘要。具体试验数据、品种差异、产品性能及法规适用性需要另行验证。</p></div></div>`;
   sections.push(sec('research','04 / RESEARCH & REFERENCES',rd.title,'',body,true));
 }else{
 sections.push(sec('research','研究与参考信息','结合公开资料与实际条件开展评估。',`${name}的储存管理应同时考虑产品成熟度、品种、温湿度、包装结构及物流时间。`,`<div class="ts-detail-research"><article class="ts-detail-research-block"><h3><span class="ts-research-number">01</span>品质变化因素</h3><p>${source[1]}</p></article><article class="ts-detail-research-block"><h3><span class="ts-research-number">02</span>应用与验证条件</h3><p>${source[2]} ${source[3]}</p></article><div class="ts-research-note">本页面提供面向应用的概要资料，建议的储存条件并非对所有品种及包装的保证。实际效果应在具体条件下验证，核心材料配方及制造参数不公开。</div></div>`,true));

 }
 sections.push(`<section class="ts-section"><div class="ts-shell"><div class="ts-cta"><div class="ts-cta-copy"><span class="ts-kicker">查看其他水果</span><h2 class="ts-h2">比较不同水果，<br class="desktop-break">找到适合的保护方式。</h2><nav class="ts-cta-links"><a class="ts-link" href="fruit.html?fruit=${previous.slug}">← ${names[previous.slug]}</a><a class="ts-link" href="fruit.html?fruit=${next.slug}">${names[next.slug]} →</a></nav></div><div class="ts-cta-action"><a class="ts-button is-dark is-large" href="contact.html">咨询包装解决方案</a></div></div></div></section>`);
 root.innerHTML=sections.join('\n');
 document.body.classList.add('fruit-'+fruit.slug);
 document.title=`${name}储存与包装指南 — TerraSAVE`;
 const meta=document.querySelector('meta[name="description"]');
 if(meta)meta.content=`了解${name}的储存条件、流通风险与包装应用方向。`;
})();
