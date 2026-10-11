/* Partnership timeline only: individual on-scroll 01 -> 02 -> 03 -> 04 reveals.
   Content remains available without script, IntersectionObserver or animation permission. */
(() => {
  'use strict';

  const list = document.querySelector('.ts-partnership-page .ts-partner-process');
  if (!list) return;

  const steps = Array.from(list.querySelectorAll(':scope > .ts-step'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (steps.length !== 4 || reducedMotion || !('IntersectionObserver' in window)) return;

  const queued = new Set();
  let nextRevealAt = 0;

  const queueReveal = index => {
    if (queued.has(index)) return;
    queued.add(index);
    const now = performance.now();
    const delay = Math.max(0, nextRevealAt - now);
    nextRevealAt = Math.max(now, nextRevealAt) + 160;

    window.setTimeout(() => {
      steps[index].classList.add('is-step-visible');
    }, delay);
  };

  const observer = new IntersectionObserver(entries => {
    entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => steps.indexOf(a.target) - steps.indexOf(b.target))
      .forEach(entry => {
        observer.unobserve(entry.target);
        queueReveal(steps.indexOf(entry.target));
      });
  }, { threshold: 0.12, rootMargin: '0px 0px -10% 0px' });

  list.classList.add('is-sequence-ready');
  steps.forEach(step => observer.observe(step));
})();
