/* TerraSave shared behaviour: navigation, fruit library and restrained motion. */
(() => {
  'use strict';

  const header = document.getElementById('siteHeader');
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('siteNav');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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
    toggle?.setAttribute('aria-label', '메뉴 열기');
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
    toggle.setAttribute('aria-label', '메뉴 닫기');
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

  const desktopMedia = window.matchMedia('(min-width:1120px)');
  const handleDesktopChange = event => { if (event.matches) closeMenu(); };
  if (desktopMedia.addEventListener) desktopMedia.addEventListener('change', handleDesktopChange);
  else desktopMedia.addListener?.(handleDesktopChange);

  const setHeaderState = () => header?.classList.toggle('is-scrolled', window.scrollY > 18);
  setHeaderState();
  window.addEventListener('scroll', setHeaderState, { passive: true });

  const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));

  const fruits = window.TERRASAVE_FRUITS || [];
  const available = new Set(['avocado', 'strawberry', 'shine-muscat', 'mango']);
  const displayName = fruit => fruit.ko.replaceAll('샤인머스캣', '샤인머스켓');
  const units = value => escape(value).replace(/(-?\d+(?:\.\d+)?(?:[–~±-]\d+(?:\.\d+)?)?\s*(?:°C|℃|%))/g, '<span class="ts-unit">$1</span>');
  const storage = value => String(value)
    .replaceAll('미숙과', '덜 익은 상태')
    .replaceAll('완숙과', '먹기 좋은 상태')
    .replaceAll('녹숙과', '초록색 상태')
    .split(/\s*\/\s*/)
    .map(value => `<span class="ts-storage-line">${units(value)}</span>`)
    .join('');

  const card = (fruit, index = 0) => {
    const name = displayName(fruit);
    const pair = window.TERRASAVE_FRUIT_IMAGES?.[fruit.slug] || [];
    return `<a class="ts-fruit-card" href="fruit.html?fruit=${encodeURIComponent(fruit.slug)}" aria-label="${escape(name)} 신선도 자료 보기">
      <div class="ts-fruit-visual"><img class="ts-fruit-whole" src="${escape(pair[0] || fruit.imageWhole || '')}" alt="${escape(name)} 전체 모습" width="1000" height="1000" loading="${index < 4 ? 'eager' : 'lazy'}" decoding="async"><img class="ts-fruit-cut" src="${escape(pair[1] || fruit.imageCut || '')}" alt="" aria-hidden="true" width="1000" height="1000" loading="lazy" decoding="async"></div>
      <div class="ts-fruit-meta"><div class="ts-fruit-meta-top"><div class="ts-fruit-name"><strong>${escape(name)}</strong><span>${escape(fruit.en)}</span></div><span class="ts-fruit-status${available.has(fruit.slug) ? ' is-available' : ''}">${available.has(fruit.slug) ? '솔루션 제공' : '연구중'}</span></div><div class="ts-fruit-tag">${escape(fruit.focusKo || fruit.focus)}</div><div class="ts-fruit-data"><span>보관 온도<strong>${storage(fruit.storage)}</strong></span><span>에틸렌 영향<strong>${escape(fruit.ethylenePlain || fruit.ethylene)}</strong></span></div></div>
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
      );
      grid.innerHTML = list.map(card).join('');
      const count = document.getElementById('fruitCount');
      if (count) count.textContent = `${list.length}개 과일`;
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

  let revealObserver;
  function initReveal() {
    if (reducedMotion) return;
    const targets = document.querySelectorAll(
      'main > section:not(:first-child), .ts-product-card, .ts-partner-model, .ts-value-card, .ts-use-card, .ts-step, .ts-fruit-card, .ts-factor-card, .ts-home-product-card, .ts-business-item'
    );
    if (!('IntersectionObserver' in window)) {
      [...targets].forEach(element => element.classList.add('is-visible'));
      return;
    }
    if (!revealObserver) {
      revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    }
    [...targets].forEach((element, index) => {
      if (element.classList.contains('ts-reveal') || element.classList.contains('is-visible')) return;
      element.classList.add('ts-reveal');
      element.style.setProperty('--reveal-delay', `${Math.min((index % 4) * 45, 135)}ms`);
      revealObserver.observe(element);
    });
  }

  document.body.classList.add('ts-motion-ready');
  requestAnimationFrame(initReveal);

  window.addEventListener('pageshow', () => {
    document.body.classList.remove('ts-page-leaving');
  });

  document.addEventListener('click', event => {
    if (reducedMotion || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    const link = event.target.closest('a[href]');
    if (!link || link.target === '_blank' || link.hasAttribute('download')) return;
    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) return;
    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin) return;
    if (destination.pathname === window.location.pathname && destination.search === window.location.search && destination.hash) return;

    event.preventDefault();
    closeMenu();
    document.body.classList.add('ts-page-leaving');
    window.setTimeout(() => {
      window.location.href = destination.href;
    }, 190);
  });
})();
