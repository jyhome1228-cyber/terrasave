const navLinks = [...document.querySelectorAll('.doc-nav a')];
const sections = navLinks.map((link) => document.querySelector(link.getAttribute('href'))).filter(Boolean);

const activateSection = () => {
  const marker = window.scrollY + 150;
  let current = sections[0];
  sections.forEach((section) => {
    if (section.offsetTop <= marker) current = section;
  });
  navLinks.forEach((link) => link.classList.toggle('is-active', link.getAttribute('href') === `#${current.id}`));
};

window.addEventListener('scroll', activateSection, { passive: true });
window.addEventListener('resize', activateSection);
activateSection();

document.getElementById('printDocument')?.addEventListener('click', () => window.print());
