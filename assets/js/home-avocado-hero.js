/* TerraSAVE homepage avocado 12-step visual sequence — page-scoped. */
(() => {
  'use strict';

  const hero = document.getElementById('tsAvocadoHero');
  if (!hero) return;

  const frames = [...hero.querySelectorAll('.ts-avocado-hero-frame')];
  const resetVeil = hero.querySelector('.ts-avocado-hero-reset');
  if (frames.length !== 2 || !resetVeil) return;

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
  const RESET_FADE_MS = 320;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let current = 0;
  let front = 0;
  let inView = true;
  let timer = null;
  let generation = 0;

  // Preload the small WebP frames once; never switch to an unloaded image.
  const preloaded = sources.map((src, i) => {
    if (i === 0) return frames[0];
    const image = new Image();
    image.decoding = 'async';
    image.src = src;
    return image;
  });

  function canPlay() {
    return !reducedMotion.matches && inView && !document.hidden;
  }

  function holdMs(index) {
    return index === 0 ? FIRST_MS : index === sources.length - 1 ? LAST_MS : FRAME_MS;
  }

  function pause() {
    window.clearTimeout(timer);
    timer = null;
    generation += 1;
    resetVeil.classList.remove('is-visible');
  }

  function schedule(delay, token) {
    window.clearTimeout(timer);
    timer = window.setTimeout(() => advance(token), delay);
  }

  function awaitFrame(index, token, callback) {
    const image = preloaded[index];
    if (image.complete) {
      callback(image.naturalWidth > 0);
      return;
    }
    const complete = () => {
      image.removeEventListener('load', onLoad);
      image.removeEventListener('error', onError);
      if (token !== generation || !canPlay()) return;
      callback(image.naturalWidth > 0);
    };
    const onLoad = () => complete();
    const onError = () => complete();
    image.addEventListener('load', onLoad, { once: true });
    image.addEventListener('error', onError, { once: true });
  }

  function restartCycle(token) {
    resetVeil.classList.add('is-visible');
    timer = window.setTimeout(() => {
      if (token !== generation || !canPlay()) return;
      frames[0].src = sources[0];
      frames[0].classList.add('is-active');
      frames[1].classList.remove('is-active');
      current = 0;
      front = 0;
      timer = window.setTimeout(() => {
        if (token !== generation || !canPlay()) return;
        resetVeil.classList.remove('is-visible');
        schedule(FIRST_MS, token);
      }, 90);
    }, RESET_FADE_MS);
  }

  function advance(token) {
    if (token !== generation || !canPlay()) return;
    if (current === sources.length - 1) {
      restartCycle(token);
      return;
    }

    const next = current + 1;
    awaitFrame(next, token, loaded => {
      if (token !== generation || !canPlay()) return;
      if (!loaded) {
        // Keep the current image instead of showing a broken frame.
        schedule(1200, token);
        return;
      }

      const upcoming = 1 - front;
      frames[upcoming].src = sources[next];
      frames[upcoming].classList.add('is-active');
      frames[front].classList.remove('is-active');
      front = upcoming;
      current = next;
      schedule(holdMs(current), token);
    });
  }

  function resume() {
    pause();
    if (!canPlay()) return;
    const token = generation;
    schedule(holdMs(current), token);
  }

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries[0]?.isIntersecting ?? false;
      if (inView === visible) return;
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
