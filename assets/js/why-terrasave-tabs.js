/* Why TerraSAVE: clearly marked four-button tabs across all viewport sizes. */
(() => {
  'use strict';
  const ids = ['export','distribution','retail','global'];
  const tabs = ids.map(id => document.querySelector('[data-why-tab="' + id + '"]'));
  const panels = ids.map(id => document.querySelector('[data-why-panel="' + id + '"]'));
  if ([...tabs,...panels].some(node => !node)) return;

  const activate = (id, options = {}) => {
    const index = ids.indexOf(id);
    if (index < 0) return;
    tabs.forEach((tab, i) => {
      const active = i === index;
      tab.setAttribute('aria-selected', String(active));
      tab.setAttribute('tabindex', active ? '0' : '-1');
      tab.classList.toggle('is-active', active);
      panels[i].hidden = !active;
    });
    if (options.history && window.history?.replaceState) {
      window.history.replaceState(null, '', window.location.pathname + window.location.search + '#' + id);
    }
    if (options.focus) tabs[index].focus({preventScroll:true});
  };

  tabs.forEach((tab, i) => {
    tab.addEventListener('click', () => activate(ids[i], {history:true}));
    tab.addEventListener('keydown', e => {
      let next = null;
      if (e.key === 'ArrowRight') next = (i + 1) % ids.length;
      if (e.key === 'ArrowLeft') next = (i + ids.length - 1) % ids.length;
      if (e.key === 'Home') next = 0;
      if (e.key === 'End') next = ids.length - 1;
      if (next === null) return;
      e.preventDefault();
      activate(ids[next], {history:true,focus:true});
    });
  });
  window.addEventListener('hashchange', () => {
    const id = decodeURIComponent(window.location.hash.slice(1));
    if (ids.includes(id)) activate(id);
  });
  const initial = decodeURIComponent(window.location.hash.slice(1));
  if (ids.includes(initial)) activate(initial);
})();
