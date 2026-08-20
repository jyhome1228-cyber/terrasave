const revealItems = document.querySelectorAll('[data-reveal]');
const journey = document.querySelector('.journey');
const subnavLinks = document.querySelectorAll('.what-subnav a');
const sections = [...document.querySelectorAll('.what-section[id]')];

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
