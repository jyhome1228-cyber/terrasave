/* TerraSAVE homepage avocado sequence: no white flash, smooth crossfades. */
(() => {
  'use strict';

  const hero = document.getElementById('tsAvocadoHero');
  if (!hero) return;
  const frames = Array.from(hero.querySelectorAll('.ts-avocado-hero-frame'));
  if (frames.length !== 2) return;

  const sources = [
  "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-235144-1-057e21c9.webp",
  "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-235144-2-63d3c724.webp",
  "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-235145-3-992d8388.webp",
  "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-235145-4-f3469e8c.webp",
  "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-235146-5-dada5ef4.webp",
  "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-235146-6-eaaf6a14.webp",
  "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-235147-7-bfe2e0c4.webp",
  "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-235147-8-5b88bb64.webp",
  "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-235148-9-c076ba57.webp",
  "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-235148-10-c236e10f.webp",
  "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-235149-11-e32e8d2c.webp",
  "https://nineworksdatabase.planus253.workers.dev/cdn/uncategorized/20261011-235149-12-49892539.webp"
];
  const FRAME_MS = 420;
  const FIRST_MS = 700;
  const LAST_MS = 1600;
  const FADE_MS = 120;
  const LOOP_FADE_MS = 950;
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

      // The 420ms normal cadence is retained; loop dissolve gets additional time.
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
