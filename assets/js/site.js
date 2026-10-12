/* TerraSave shared behaviour: navigation, fruit library and restrained motion. */
(() => {
  'use strict';

  const header = document.getElementById('siteHeader');
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('siteNav');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Preserve the current page (and selected fruit) while switching site language.
  const chinese = /\/zh\//.test(window.location.pathname);
  const page = window.location.pathname.split('/').pop() || 'index.html';
  const translatedPages = new Set(['index.html','about.html','product.html','fruits.html','fruit.html','partnership.html','why-terrasave.html','contact.html','technology.html']);
  const counterpartPage = chinese || translatedPages.has(page) ? page : 'index.html';
  const counterpart = new URL((chinese ? '../' : 'zh/') + counterpartPage, window.location.href);
  counterpart.search = window.location.search;
  counterpart.hash = window.location.hash;
  const headerInner = header?.querySelector('.header-inner');
  if (headerInner && !headerInner.querySelector('.ts-language-switch')) {
    const languageSwitch = document.createElement('a');
    languageSwitch.className = 'ts-language-switch';
    languageSwitch.href = counterpart.href;
    languageSwitch.hreflang = chinese ? 'ko' : 'zh-CN';
    languageSwitch.lang = chinese ? 'ko' : 'zh-CN';
    languageSwitch.textContent = chinese ? '한국어' : '中文';
    languageSwitch.setAttribute('aria-label', chinese ? '切换到韩文网站' : '중국어 사이트로 전환');
    headerInner.appendChild(languageSwitch);
  }


  const menuOpenLabel = chinese ? '打开菜单' : '메뉴 열기';
  const menuCloseLabel = chinese ? '关闭菜单' : '메뉴 닫기';
  if (toggle) toggle.setAttribute('aria-label', menuOpenLabel);

  const isolated = new Map();
  const isolate = (owner, elements) => {
    for (const element of elements) {
      if (!isolated.has(element)) isolated.set(element, { original: element.inert, owners: new Set() });
      isolated.get(element).owners.add(owner);
      element.inert = true;
    }
  };
  const release = owner => {
    for (const [element, state] of isolated) {
      state.owners.delete(owner);
      if (!state.owners.size) {
        element.inert = state.original;
        isolated.delete(element);
      }
    }
  };

  const closeMenu = () => {
    header?.classList.remove('menu-open');
    document.body.classList.remove('menu-locked');
    document.documentElement.classList.remove('menu-locked');
    toggle?.setAttribute('aria-expanded', 'false');
    toggle?.setAttribute('aria-label', menuOpenLabel);
    release('menu');
  };

  toggle?.addEventListener('click', () => {
    if (!header || !nav) return;
    const open = !header.classList.contains('menu-open');
    if (!open) {
      closeMenu();
      return;
    }
    header.classList.add('menu-open');
    document.body.classList.add('menu-locked');
    document.documentElement.classList.add('menu-locked');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.setAttribute('aria-label', menuCloseLabel);
    isolate('menu', document.querySelectorAll('main, footer, .skip-link'));
    nav.querySelector('a')?.focus({ preventScroll: true });
  });

  nav?.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });

  document.addEventListener('keydown', event => {
    if (!header?.classList.contains('menu-open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      toggle?.focus({ preventScroll: true });
    }
    if (event.key === 'Tab') {
      const items = [...header.querySelectorAll('a[href],button:not([disabled])')]
        .filter(element => element.getClientRects().length && !element.closest('[inert]'));
      const first = items[0];
      const last = items[items.length - 1];
      if (!first) return;
      if (event.shiftKey && (document.activeElement === first || !header.contains(document.activeElement))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !header.contains(document.activeElement))) {
        event.preventDefault();
        first.focus();
      }
    }
  });

  document.addEventListener('click', event => {
    if (header?.classList.contains('menu-open') && !header.contains(event.target)) closeMenu();
  });

  const desktopMedia = window.matchMedia('(min-width:1280px)');
  const handleDesktopChange = event => { if (event.matches) closeMenu(); };
  if (desktopMedia.addEventListener) desktopMedia.addEventListener('change', handleDesktopChange);
  else desktopMedia.addListener?.(handleDesktopChange);

  const setHeaderState = () => header?.classList.toggle('is-scrolled', window.scrollY > 18);
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });


  // Packaging consultation modal: keep quick email guidance available from every CTA.
  const consultationCopy = chinese ? {
    kicker: 'PACKAGING CONSULTATION',
    title: '咨询包装方案',
    description: '请告诉我们产品品类、包装方式、所需规格和预计数量。我们将在收到咨询后24小时内回复。',
    emailLabel: '咨询邮箱',
    guideTitle: '邮件中建议包含',
    guide: ['产品品类', '当前包装方式 / 希望规格', '预计数量', '储存与运输条件'],
    note: '如需发送照片、规格书或其他附件，建议直接通过电子邮件咨询。',
    mailButton: '发送邮件',
    close: '关闭咨询窗口',
    subject: '[TerraSAVE] 包装方案咨询',
    body: '您好，TerraSAVE。%0D%0A%0D%0A产品品类：%0D%0A当前包装方式 / 希望规格：%0D%0A预计数量：%0D%0A储存与运输条件：%0D%0A其他咨询内容：'
  } : {
    kicker: 'PACKAGING CONSULTATION',
    title: '포장 상담하기',
    description: '문의해 주시면 24시간 이내에 답변드리겠습니다. 취급 품목과 포장 방식, 필요한 규격 및 예상 수량을 함께 알려주세요.',
    emailLabel: '문의 메일',
    guideTitle: '메일에 함께 적어주세요',
    guide: ['취급 품목', '현재 포장 방식 / 희망 규격', '예상 수량', '보관·운송 조건'],
    note: '사진, 규격서 등 첨부자료가 있는 경우 이메일로 직접 문의해 주시는 것이 가장 편리합니다.',
    mailButton: '메일 보내기',
    close: '상담창 닫기',
    subject: '[TerraSAVE] 포장 상담 문의',
    body: '안녕하세요, TerraSAVE 포장 상담 문의드립니다.%0D%0A%0D%0A취급 품목：%0D%0A현재 포장 방식 / 희망 규격：%0D%0A예상 수량：%0D%0A보관·운송 조건：%0D%0A기타 문의 내용：'
  };

  let consultationModal;
  let consultationLastFocus;

  const closeConsultation = () => {
    if (!consultationModal?.classList.contains('is-open')) return;
    consultationModal.classList.remove('is-open');
    consultationModal.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('ts-modal-locked');
    document.documentElement.classList.remove('ts-modal-locked');
    release('consultation');
    consultationLastFocus?.focus?.({ preventScroll: true });
  };

  const ensureConsultationModal = () => {
    if (consultationModal) return consultationModal;
    consultationModal = document.createElement('div');
    consultationModal.className = 'ts-consult-modal';
    consultationModal.id = 'consultationModal';
    consultationModal.setAttribute('aria-hidden', 'true');
    consultationModal.innerHTML = `
      <div class="ts-consult-backdrop" data-consult-close></div>
      <section class="ts-consult-dialog" role="dialog" aria-modal="true" aria-labelledby="consultationTitle">
        <button class="ts-consult-close" type="button" data-consult-close aria-label="${consultationCopy.close}">×</button>
        <span class="ts-kicker">${consultationCopy.kicker}</span>
        <h2 id="consultationTitle">${consultationCopy.title}</h2>
        <p class="ts-consult-description">${consultationCopy.description}</p>
        <div class="ts-consult-email">
          <span>${consultationCopy.emailLabel}</span>
          <a href="mailto:info@terracle.im">info@terracle.im</a>
        </div>
        <div class="ts-consult-guide">
          <strong>${consultationCopy.guideTitle}</strong>
          <ul>${consultationCopy.guide.map(item => `<li>${item}</li>`).join('')}</ul>
        </div>
        <p class="ts-consult-note">${consultationCopy.note}</p>
        <div class="ts-consult-actions">
          <a class="ts-button is-dark is-large" href="mailto:info@terracle.im?subject=${encodeURIComponent(consultationCopy.subject)}&body=${consultationCopy.body}">${consultationCopy.mailButton}</a>
        </div>
      </section>`;
    document.body.appendChild(consultationModal);

    consultationModal.addEventListener('click', event => {
      if (event.target.closest('[data-consult-close]')) closeConsultation();
    });

    return consultationModal;
  };

  const openConsultation = trigger => {
    closeMenu();
    const modal = ensureConsultationModal();
    consultationLastFocus = trigger || document.activeElement;
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.classList.add('ts-modal-locked');
    document.documentElement.classList.add('ts-modal-locked');
    isolate('consultation', document.querySelectorAll('header, main, footer, .skip-link'));
    requestAnimationFrame(() => modal.querySelector('.ts-consult-close')?.focus({ preventScroll: true }));
  };

  document.addEventListener('click', event => {
    const link = event.target.closest('a[href]');
    if (!link || link.hasAttribute('data-contact-form-link') || link.closest('.ts-consult-modal')) return;
    const href = link.getAttribute('href') || '';
    let isConsultation = href === '#inquiry' || href === '#consult' || link.matches('.header-cta, .nav-contact, [data-consult-trigger]') ||
      (!link.closest('.footer-contact-line, .ts-contact-direct') && /^mailto:info@terracle\.im/i.test(href));
    if (!isConsultation && !href.startsWith('mailto:') && !href.startsWith('tel:') && !href.startsWith('javascript:')) {
      try {
        const url = new URL(link.href, window.location.href);
        isConsultation = url.origin === window.location.origin && /\/contact\.html$/.test(url.pathname);
      } catch (_) {}
    }
    if (!isConsultation) return;
    event.preventDefault();
    event.stopPropagation();
    openConsultation(link);
  }, true);

  document.addEventListener('keydown', event => {
    if (!consultationModal?.classList.contains('is-open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeConsultation();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusable = [...consultationModal.querySelectorAll('a[href],button:not([disabled])')]
      .filter(element => element.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  if (window.location.hash === '#consult') {
    window.requestAnimationFrame(() => openConsultation(null));
  }

  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const fruits = window.TERRASAVE_FRUITS || [];
  const available = new Set(['avocado', 'strawberry', 'shine-muscat', 'mango']);

  const namesZh={
    avocado:'牛油果', blueberry:'蓝莓', cherry:'樱桃', mango:'芒果',
    banana:'香蕉', strawberry:'草莓', 'shine-muscat':'阳光玫瑰葡萄',
    'table-grape':'鲜食葡萄', apple:'苹果', 'asian-pear':'韩国梨',
    kiwi:'猕猴桃', peach:'桃子', nectarine:'油桃', persimmon:'甜柿',
    mandarin:'柑橘', pomegranate:'石榴', pineapple:'菠萝', plum:'李子'
  };
  const focusZh={
    avocado:'后熟速度 · 乙烯', blueberry:'水分保持 · 霉菌',
    cherry:'冷链管理 · 保湿', mango:'后熟速度 · 冷害',
    banana:'后熟速度 · 乙烯', strawberry:'凝露 · 霉菌',
    'shine-muscat':'果梗保湿 · 落粒 · 霉菌',
    'table-grape':'保湿 · 落粒 · 霉菌', apple:'乙烯 · 硬度保持',
    'asian-pear':'长期储存 · 水分 · 碰撞', kiwi:'乙烯 · 快速软化',
    peach:'快速软化 · 冷害', nectarine:'快速软化 · 冷害',
    persimmon:'乙烯 · 快速软化', mandarin:'果皮水分 · 腐败',
    pomegranate:'果皮保湿 · 冷害', pineapple:'温度 · 水分',
    plum:'后熟速度 · 软化'
  };
  const ethyleneZh={'매우 민감':'非常敏感','품종에 따라 보통':'因品种而异，通常中等','영향이 낮음':'影响较小','민감함':'敏感','보통':'中等','극도로 민감':'极其敏感'};
  const storageZh = raw => String(raw).replaceAll('미숙과','未熟果').replaceAll('완숙과','成熟果').replaceAll('완숙','成熟').replaceAll('녹숙과','青熟果').replaceAll('부분후숙','部分后熟').replaceAll('약 ','约 ').replaceAll(' 단기',' 短期').replaceAll(' 장기',' 长期');

  const displayName = fruit => chinese ? (namesZh[fruit.slug] || fruit.en) : fruit.ko.replaceAll('샤인머스캣', '샤인머스켓');
  const units = value => escape(value).replace(/(-?\d+(?:\.\d+)?(?:[–~±-]\d+(?:\.\d+)?)?\s*(?:°C|℃|%))/g, '<span class="ts-unit">$1</span>');
  const storage = value => (chinese ? storageZh(value) : String(value))
    .replaceAll('미숙과', '덜 익은 상태')
    .replaceAll('완숙과', '먹기 좋은 상태')
    .replaceAll('녹숙과', '초록색 상태')
    .split(/\s*\/\s*/)
    .map(value => `<span class="ts-storage-line">${units(value)}</span>`)
    .join('');

  const card = (fruit, index = 0) => {
    const name = displayName(fruit);
    const pair = window.TERRASAVE_FRUIT_IMAGES?.[fruit.slug] || [];
    return `<a class="ts-fruit-card" href="fruit.html?fruit=${encodeURIComponent(fruit.slug)}" aria-label="${escape(name)} ${chinese ? '保鲜资料' : '신선도 자료 보기'}">
      <div class="ts-fruit-visual"><img class="ts-fruit-whole" src="${escape(pair[0] || fruit.imageWhole || '')}" alt="${escape(name)} ${chinese ? '完整外观' : '전체 모습'}" width="1000" height="1000" loading="${index < 4 ? 'eager' : 'lazy'}" decoding="async"><img class="ts-fruit-cut" src="${escape(pair[1] || fruit.imageCut || '')}" alt="" aria-hidden="true" width="1000" height="1000" loading="lazy" decoding="async"></div>
      <div class="ts-fruit-meta"><div class="ts-fruit-meta-top"><div class="ts-fruit-name"><strong>${escape(name)}</strong><span>${escape(fruit.en)}</span></div><span class="ts-fruit-status${available.has(fruit.slug) ? ' is-available' : ''}">${available.has(fruit.slug) ? (chinese ? '可提供方案' : '솔루션 제공') : (chinese ? '研究中' : '연구중')}</span></div><div class="ts-fruit-tag">${escape(chinese ? focusZh[fruit.slug] || fruit.focus : (fruit.focusKo || fruit.focus))}</div><div class="ts-fruit-data"><span>${chinese ? '储存温度' : '보관 온도'}<strong>${storage(fruit.storage)}</strong></span><span>${chinese ? '乙烯敏感度' : '에틸렌 영향'}<strong>${escape(chinese ? (ethyleneZh[fruit.ethylenePlain] || fruit.ethylene) : (fruit.ethylenePlain || fruit.ethylene))}</strong></span></div></div>
    </a>`;
  };

  const grid = document.getElementById('fruitGrid');
  if (grid) {
    const filters = [...document.querySelectorAll('[data-filter]')];
    const render = filter => {
      const list = fruits.filter(f =>
        filter === 'all' ||
        (filter === 'climacteric' && f.ripening.includes('클라이맥테릭') && !f.ripening.startsWith('비')) ||
        (filter === 'non' && f.ripening.startsWith('비')) ||
        (filter === 'high' && /high/i.test(f.ethylene))
      ).sort((a, b) => Number(available.has(b.slug)) - Number(available.has(a.slug))); // 솔루션 제공 → 연구중
      grid.innerHTML = list.map(card).join('');
      const count = document.getElementById('fruitCount');
      if (count) count.textContent = chinese ? `${list.length}种水果` : `${list.length}개 과일`;
      filters.forEach(button => {
        const active = button.dataset.filter === filter;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      requestAnimationFrame(initReveal);
    };
    filters.forEach(button => button.addEventListener('click', () => render(button.dataset.filter)));
    render('all');
  }

  const home = document.getElementById('homeFruitGrid');
  if (home) {
    const preferred = ['avocado', 'kiwi', 'mango', 'strawberry', 'shine-muscat', 'persimmon'];
    home.innerHTML = preferred.map(slug => fruits.find(f => f.slug === slug)).filter(Boolean).map(card).join('');
  }

  // Let headings, copy and cards reveal independently. Never hide entire long sections:
  // doing so can leave content blank on short/mobile viewports.
  let revealObserver;
  const revealSelector = [
    'main .ts-section-head > :is(.ts-kicker, h1, h2, h3, p)',
    'main .ts-home-head > :is(.ts-kicker, h1, h2, h3, p)',
    'main .ts-product-hero-head > :is(.ts-kicker, h1, h2, h3, p)',
    'main .ts-home-compact-hero-copy > :is(.ts-kicker, h1, h2, h3, p, .ts-home-compact-heading)',
    'main .ts-page-hero .ts-shell > :is(.ts-kicker, .ts-h1, .ts-body-lg)',
    'main .ts-why-section-heading > :is(.ts-kicker, h1, h2, h3, p)',
    'main .ts-why-conclusion-head > :is(h2, p)',
    'main .ts-about-principle-media',
    'main .ts-about-principle-copy > :is(.ts-about-principle-label, .ts-about-principle-title, .ts-about-principle-body)',
    'main .ts-product-card',
    'main .ts-partner-model',
    'main .ts-value-card',
    'main .ts-use-card',
    'main .ts-step',
    'main .ts-fruit-card',
    'main .ts-factor-card',
    'main .ts-home-product-card',
    'main .ts-business-item'
  ].join(', ');
  function initReveal() {
    if (reducedMotion || !('IntersectionObserver' in window)) return;
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: 0.03, rootMargin: '0px 0px 32px 0px' });
    }
    document.querySelectorAll(revealSelector).forEach(element => {
      if (element.closest('.ts-partner-process') || element.classList.contains('ts-reveal')) return;
      const siblings = element.parentElement ? [...element.parentElement.children] : [element];
      const groupIndex = siblings.indexOf(element);
      element.style.setProperty('--reveal-delay', `${Math.min((groupIndex % 4) * 65, 195)}ms`);
      element.classList.add('ts-reveal');
      revealObserver.observe(element);
    });
  }

  document.body.classList.add('ts-motion-ready');
  requestAnimationFrame(initReveal);

  let transitionTimer;
  window.addEventListener('pageshow', () => {
    if (transitionTimer) window.clearTimeout(transitionTimer);
    transitionTimer = null;
    document.body.classList.remove('ts-page-leaving');
  });

  // Only ordinary same-origin page navigation gets a gentle exit. Leave anchors,
  // downloads, forms, mail links, new tabs and consultation popups untouched.
  document.addEventListener('click', event => {
    if (reducedMotion || event.defaultPrevented || event.button !== 0 ||
        event.metaKey || event.ctrlKey || event.shiftKey || event.altKey ||
        document.body.classList.contains('ts-page-leaving')) return;
    const link = event.target.closest?.('a[href]');
    if (!link || (link.target && link.target !== '_self') ||
        link.hasAttribute('download') || link.hasAttribute('data-no-transition') ||
        link.relList?.contains('external')) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || /^(mailto:|tel:|javascript:)/i.test(href)) return;
    let destination;
    try { destination = new URL(link.href, window.location.href); } catch (_) { return; }
    if (!['http:', 'https:'].includes(destination.protocol) || destination.origin !== window.location.origin) return;
    if (destination.pathname === window.location.pathname &&
        destination.search === window.location.search) return;

    event.preventDefault();
    closeMenu();
    document.body.classList.add('ts-page-leaving');
    transitionTimer = window.setTimeout(() => {
      window.location.assign(destination.href);
    }, 210);
  });
})();
