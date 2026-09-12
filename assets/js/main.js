const header = document.getElementById('siteHeader');
const toggle = document.getElementById('menuToggle');
const nav = document.getElementById('siteNav');

if (!document.querySelector('link[href="assets/css/redesign.css"]')) {
  const redesignStyle = document.createElement('link');
  redesignStyle.rel = 'stylesheet';
  redesignStyle.href = 'assets/css/redesign.css';
  document.head.appendChild(redesignStyle);
}

if (!document.querySelector('link[href="assets/css/layout-overrides.css"]')) {
  const layoutStyle = document.createElement('link');
  layoutStyle.rel = 'stylesheet';
  layoutStyle.href = 'assets/css/layout-overrides.css';
  document.head.appendChild(layoutStyle);
}

let favicon = document.querySelector('link[rel="icon"]');
if (!favicon) {
  favicon = document.createElement('link');
  favicon.rel = 'icon';
  document.head.appendChild(favicon);
}
favicon.type = 'image/svg+xml';
favicon.href = 'assets/img/terrasave-favicon.svg';

document.querySelectorAll('.brand').forEach((brand) => {
  brand.innerHTML = '<img class="brand-logo" src="assets/img/terrasave-logo.svg" alt="TerraSave" />';
});

const navItems = [
  ['fruits.html', 'Fruits'],
  ['product.html', 'Net System'],
  ['technology.html', 'Technology'],
  ['what-we-do.html', 'Research'],
  ['about.html', 'About']
];

if (nav) {
  const currentPath = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  nav.innerHTML = navItems.map(([href, label]) => {
    const isFruitDetail = currentPath === 'fruit.html' && href === 'fruits.html';
    const isCurrent = currentPath === href || isFruitDetail;
    return `<a href="${href}"${isCurrent ? ' aria-current="page"' : ''}>${label}</a>`;
  }).join('');
}

if (toggle && !toggle.querySelector('.menu-icon')) {
  toggle.innerHTML = '<span class="menu-icon" aria-hidden="true"><span></span><span></span><span></span></span>';
}

function closeMobileMenu() {
  if (!header || !toggle) return;
  header.classList.remove('menu-open');
  document.body.classList.remove('menu-locked');
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', '메뉴 열기');
}

if (header && toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = header.classList.toggle('menu-open');
    document.body.classList.toggle('menu-locked', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMobileMenu));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMobileMenu();
  });
  window.addEventListener('resize', () => {
    if (window.innerWidth >= 768) closeMobileMenu();
  });
}

const footer = document.querySelector('footer.footer');
if (footer) {
  footer.innerHTML = `
    <div class="footer-shell">
      <div class="footer-primary">
        <div class="footer-brand-block">
          <img class="footer-logo" src="assets/img/terrasave-logo.svg" alt="TerraSave" />
          <p class="footer-tagline">Fruit Protection Intelligence.</p>
          <p class="footer-description">과일별 데이터를 바탕으로 보호 패키징의 적용 방향을 연구합니다.</p>
        </div>
        <nav class="footer-nav-main" aria-label="Footer navigation">
          <a href="fruits.html">Fruits</a>
          <a href="product.html">Net System</a>
          <a href="technology.html">Technology</a>
          <a href="what-we-do.html">Research</a>
          <a href="about.html">About</a>
          <a href="contact.html">Contact</a>
        </nav>
      </div>
      <div class="footer-secondary">
        <div class="footer-contact-line">
          <a href="mailto:info@terracle.im">info@terracle.im</a>
          <span>032-710-2891~2</span>
          <span>368-81-02387</span>
        </div>
        <a class="footer-parent-link" href="https://kr.terracle.im/" target="_blank" rel="noopener noreferrer">A brand of Terracle ↗</a>
      </div>
      <div class="footer-legal">
        <span>TerraSave</span>
        <span>Copyright © 2026 Terracle. All Rights Reserved.</span>
      </div>
    </div>`;
}
