/* TerraSAVE customer-type selector.
   Keyboard-accessible desktop tabs, native mobile disclosures and existing hash links. */
(() => {
  'use strict';
  const ids = ['export', 'distribution', 'retail', 'global'];
  const tabs = ids.map(id => document.querySelector('[data-why-tab="' + id + '"]'));
  const panels = ids.map(id => document.querySelector('[data-why-panel="' + id + '"]'));
  const disclosures = ids.map(id => document.querySelector('[data-why-accordion="' + id + '"]'));
  if ([...tabs, ...panels, ...disclosures].some(element => !element)) return;

  const media = window.matchMedia('(max-width:899px)');
  let currentId = ids[0];

  const activate = (id, options = {}) => {
    const index = ids.indexOf(id);
    if (index < 0) return;
    currentId = id;
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', String(active));
      tab.setAttribute('tabindex', active ? '0' : '-1');
      tab.classList.toggle('is-active', active);
      panels[i].hidden = !active;
      disclosures[i].open = active;
    });

    if (options.history && window.history && window.history.replaceState) {
      const url = window.location.pathname + window.location.search + '#' + id;
      window.history.replaceState(null, '', url);
    }
    if (options.focus) tabs[index].focus({ preventScroll: true });
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activate(ids[index], { history: true }));
    tab.addEventListener('keydown', event => {
      const key = event.key;
      let next = -1;
      if (key === 'ArrowRight') next = (index + 1) % ids.length;
      else if (key === 'ArrowLeft') next = (index - 1 + ids.length) % ids.length;
      else if (key === 'Home') next = 0;
      else if (key === 'End') next = ids.length - 1;
      if (next < 0) return;
      event.preventDefault();
      activate(ids[next], { focus: true, history: true });
    });
  });

  disclosures.forEach((detail, index) => {
    detail.addEventListener('toggle', () => {
      // When a visitor opens one mobile section, close the others.
      if (!media.matches || !detail.open || currentId === ids[index]) return;
      activate(ids[index], { history: true });
    });
  });

  const handleHash = () => {
    const requested = decodeURIComponent(window.location.hash.slice(1));
    if (!ids.includes(requested)) return;
    activate(requested);
  };

  window.addEventListener('hashchange', handleHash);
  if (media.addEventListener) media.addEventListener('change', () => activate(currentId));
  else media.addListener?.(() => activate(currentId));

  handleHash();
})();
