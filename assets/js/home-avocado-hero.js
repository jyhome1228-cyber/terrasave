/* TerraSAVE homepage avocado sequence: 10 steps at a relaxed pace, without white flashes. */
(() => {
  'use strict';

  const hero = document.getElementById('tsAvocadoHero');
  if (!hero) return;
  const frames = Array.from(hero.querySelectorAll('.ts-avocado-hero-frame'));
  if (frames.length !== 2) return;

  const sources = [
  "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261012-002708-1-083ec8f4.webp",
  "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261012-002709-2-cca19111.webp",
  "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261012-002709-3-d4c30e60.webp",
  "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261012-002709-4-be037d2b.webp",
  "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261012-002710-5-e7dd403e.webp",
  "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261012-002710-6-4e692733.webp",
  "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261012-002710-7-73a94c2c.webp",
  "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261012-002711-8-be55b2cd.webp",
  "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261012-002711-9-f2515279.webp",
  "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261012-002711-10-ed415c70.webp"
];
  const FRAME_MS = 520;
  const FIRST_MS = 900;
  const LAST_MS = 2000;
  const FADE_MS = 140;
  const LOOP_FADE_MS = 1100;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let index = 0;
  let front = 0;
  let inView = true;
  let timer = null;
  let generation = 0;

  frames[0].style.zIndex = '1';
  frames[1].style.zIndex = '0';

  // Preload before transitions so a slow network never exposes an empty frame.
  const cached = sources.map((src, i) => {
    if (i === 0) return frames[0];
    const img = new Image();
    img.decoding = 'async';
    img.src = src;
    return img;
  });

  function canPlay() {
    return !reducedMotion.matches && inView && !document.hidden;
  }

  function intervalFor(frameIndex) {
    if (frameIndex === 0) return FIRST_MS;
    if (frameIndex === sources.length - 1) return LAST_MS;
    return FRAME_MS;
  }

  function pause() {
    window.clearTimeout(timer);
    timer = null;
    generation += 1;
  }

  function schedule(delay, token) {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => advance(token), delay);
  }

  function transitionTo(nextIndex, token) {
    if (token !== generation || !canPlay()) return;

    const preloaded = cached[nextIndex];
    const show = () => {
      if (token !== generation || !canPlay()) return;
      if (!preloaded.complete || preloaded.naturalWidth === 0) {
        schedule(1200, token);
        return;
      }

      const previous = frames[front];
      const incomingIndex = 1 - front;
      const incoming = frames[incomingIndex];
      const returningToStart = nextIndex === 0;
      const fadeDuration = returningToStart ? LOOP_FADE_MS : FADE_MS;

      // Incoming frame fades IN above a fully opaque outgoing frame.
      // No white overlay, and no simultaneous fade-out that could reveal the background.
      incoming.style.transition = 'none';
      incoming.classList.remove('is-active');
      incoming.style.zIndex = '2';
      incoming.src = sources[nextIndex];
      previous.style.zIndex = '1';
      void incoming.offsetWidth;
      incoming.style.transition = 'opacity ' + fadeDuration + 'ms ease-in-out';
      incoming.classList.add('is-active');

      index = nextIndex;
      front = incomingIndex;

      window.setTimeout(() => {
        previous.classList.remove('is-active');
        previous.style.zIndex = '0';
        incoming.style.zIndex = '1';
        incoming.style.transition = '';
      }, fadeDuration + 24);

      // The 520ms normal cadence is retained; loop dissolve gets additional time.
      schedule(returningToStart ? fadeDuration + FIRST_MS : intervalFor(index), token);
    };

    if (preloaded.complete) {
      show();
    } else {
      preloaded.addEventListener('load', show, { once: true });
      preloaded.addEventListener('error', () => {
        if (token === generation && canPlay()) schedule(1200, token);
      }, { once: true });
    }
  }

  function advance(token) {
    if (token !== generation || !canPlay()) return;
    transitionTo((index + 1) % sources.length, token);
  }

  function resume() {
    pause();
    if (!canPlay()) return;
    const token = generation;
    schedule(intervalFor(index), token);
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries[0] ? entries[0].isIntersecting : false;
      if (visible === inView) return;
      inView = visible;
      if (visible) resume();
      else pause();
    }, { threshold: 0.05 });
    observer.observe(hero);
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) pause();
    else resume();
  });
  window.addEventListener('pagehide', pause);
  window.addEventListener('pageshow', resume);

  if (reducedMotion.addEventListener) {
    reducedMotion.addEventListener('change', resume);
  } else if (reducedMotion.addListener) {
    reducedMotion.addListener(resume);
  }

  resume();
})();
