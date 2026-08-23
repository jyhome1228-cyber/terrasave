const revealItems = document.querySelectorAll('[data-reveal]');
const journey = document.querySelector('.journey');
const subnavLinks = document.querySelectorAll('.what-subnav a');
const sections = [...document.querySelectorAll('.what-section[id]')];

const technologyVisuals = [
  {
    src: 'https://cdn.imweb.me/upload/S20251008dcc1c9d70e3ac/395831bdce7e6.png',
    alt: '유통 과정에서 발생하는 에틸렌을 표현한 TerraSave 기술 비주얼'
  },
  {
    src: 'https://cdn.imweb.me/upload/S20251008dcc1c9d70e3ac/8d8c6876d1c35.png',
    alt: '에틸렌 포집 기능을 표현한 TerraSave 기술 비주얼'
  },
  {
    src: 'https://cdn.imweb.me/upload/S20251008dcc1c9d70e3ac/1595c12cc434e.png',
    alt: '기능성 포장재 제품화를 표현한 TerraSave 기술 비주얼'
  }
];

const technologyStyle = document.createElement('style');
technologyStyle.textContent = `
  .technology-step{min-height:455px;gap:24px}
  .technology-step-media{position:relative;width:100%;margin:0;aspect-ratio:16/8.6;overflow:hidden;background:#090909;border:1px solid rgba(255,255,255,.07)}
  .technology-step-media img{display:block;width:100%;height:100%;object-fit:cover;filter:saturate(.94) contrast(1.02)}
  .technology-step-copy{margin-top:auto}
  @media(max-width:1100px){.technology-step{min-height:420px}}
  @media(max-width:900px){.technology-step{min-height:auto}.technology-step-media{aspect-ratio:16/8}}
  @media(max-width:760px){.technology-step{min-height:auto;gap:20px}.technology-step-media{aspect-ratio:16/9}}
`;
document.head.appendChild(technologyStyle);

const technologySteps = document.querySelectorAll('.technology-step');
technologySteps.forEach((step, index) => {
  const visual = technologyVisuals[index];
  const copy = step.querySelector('.technology-step-copy');
  if (!visual || !copy || step.querySelector('.technology-step-media')) return;

  const media = document.createElement('figure');
  media.className = 'technology-step-media';

  const image = document.createElement('img');
  image.src = visual.src;
  image.alt = visual.alt;
  image.loading = 'lazy';

  media.appendChild(image);
  step.insertBefore(media, copy);
});

const revealObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });

revealItems.forEach((item) => revealObserver.observe(item));

if (journey) {
  const journeyObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      journey.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.32 });
  journeyObserver.observe(journey);
}

if (sections.length && subnavLinks.length) {
  const sectionObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;
    subnavLinks.forEach((link) => {
      link.classList.toggle('is-active', link.getAttribute('href') === `#${visible.target.id}`);
    });
  }, { threshold: [0.25, 0.5, 0.75], rootMargin: '-18% 0px -58% 0px' });

  sections.forEach((section) => sectionObserver.observe(section));
}
