const header = document.getElementById('siteHeader');
const toggle = document.getElementById('menuToggle');
const nav = document.getElementById('siteNav');

// Use the TerraSave symbol from the official logo as the favicon on every page.
let favicon = document.querySelector('link[rel="icon"]');
if (!favicon) {
  favicon = document.createElement('link');
  favicon.rel = 'icon';
  document.head.appendChild(favicon);
}
favicon.type = 'image/svg+xml';
favicon.href = 'assets/img/terrasave-favicon.svg';

// Apply the official TerraSave logo to every page header.
document.querySelectorAll('.brand').forEach((brand) => {
  brand.innerHTML = '<img class="brand-logo" src="assets/img/terrasave-logo.svg" alt="TerraSave" />';
});

// Mobile menu uses a real hamburger icon instead of the MENU text label.
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

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', closeMobileMenu);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && header.classList.contains('menu-open')) {
      closeMobileMenu();
      toggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 1100 && header.classList.contains('menu-open')) {
      closeMobileMenu();
    }
  });
}

// Shared refinement layer for the whole TerraSave site.
const refinementStyle = document.createElement('link');
refinementStyle.rel = 'stylesheet';
refinementStyle.href = 'assets/css/refinement.css';
document.head.appendChild(refinementStyle);

// Shared image and gallery layouts.
const mediaStyle = document.createElement('link');
mediaStyle.rel = 'stylesheet';
mediaStyle.href = 'assets/css/media.css';
document.head.appendChild(mediaStyle);

// Compact TerraSave footer shared across all pages.
const footerStyle = document.createElement('link');
footerStyle.rel = 'stylesheet';
footerStyle.href = 'assets/css/footer.css';
document.head.appendChild(footerStyle);

// Shared interaction language: neutral boxes with orange bottom-edge hover only.
const interactionStyle = document.createElement('link');
interactionStyle.rel = 'stylesheet';
interactionStyle.href = 'assets/css/interaction.css';
document.head.appendChild(interactionStyle);

// Mobile navigation and media fixes must load last so they can override shared rules safely.
const mobileFixStyle = document.createElement('link');
mobileFixStyle.rel = 'stylesheet';
mobileFixStyle.href = 'assets/css/mobile-fixes.css';
document.head.appendChild(mobileFixStyle);

const footer = document.querySelector('footer.footer');
if (footer) {
  footer.innerHTML = `
    <div class="footer-shell">
      <div class="footer-primary">
        <div class="footer-brand-block">
          <img class="footer-logo" src="assets/img/terrasave-logo.svg" alt="TerraSave" />
          <p class="footer-tagline">Keep Fresh, Save Loss.</p>
          <p class="footer-description">신선함을 더 오래 유지하고, 유통 과정의 손실을 줄입니다.</p>
        </div>

        <nav class="footer-nav-main" aria-label="Footer navigation">
          <a href="about.html">About us</a>
          <a href="what-we-do.html">What we do</a>
          <a href="technology.html">Technology</a>
          <a href="product.html">Product</a>
          <a href="contact.html">Contact</a>
        </nav>
      </div>

      <div class="footer-secondary">
        <div class="footer-contact-line">
          <a href="mailto:info@terracle.im">info@terracle.im</a>
          <span>032-710-2891~2</span>
          <span>368-81-02387</span>
        </div>
        <a class="footer-parent-link" href="https://kr.terracle.im/" target="_blank" rel="noopener noreferrer">A BRAND OF TERRACLE ↗</a>
      </div>

      <div class="footer-legal">
        <span>TerraSave</span>
        <span>Copyright © 2026 Terracle. All Rights Reserved.</span>
      </div>
    </div>`;
}

// Some of the first product visual URLs can be unavailable on the CDN.
// Keep the intended source, but automatically recover with verified TerraSave visual assets
// instead of leaving an empty black gallery on mobile/desktop.
const visualFallbacks = [
  'https://cdn.imweb.me/upload/S20251008dcc1c9d70e3ac/13163c87b102a.png',
  'https://cdn.imweb.me/upload/S20251008dcc1c9d70e3ac/395831bdce7e6.png',
  'https://cdn.imweb.me/upload/S20251008dcc1c9d70e3ac/8d8c6876d1c35.png',
  'https://cdn.imweb.me/upload/S20251008dcc1c9d70e3ac/1595c12cc434e.png'
];

function installImageFallbacks() {
  const images = document.querySelectorAll('.product-roll-item img, .product-gallery img');

  images.forEach((img, index) => {
    if (img.dataset.fallbackBound === 'true') return;
    img.dataset.fallbackBound = 'true';

    const startIndex = index % visualFallbacks.length;
    let attempt = 0;

    const tryFallback = () => {
      while (attempt < visualFallbacks.length) {
        const candidate = visualFallbacks[(startIndex + attempt) % visualFallbacks.length];
        attempt += 1;

        if (img.src === candidate) continue;

        img.classList.remove('is-unavailable');
        img.src = candidate;
        return;
      }

      img.classList.add('is-unavailable');
    };

    img.addEventListener('error', tryFallback);

    // Catch images that failed before this script finished binding the error listener.
    if (img.complete && img.naturalWidth === 0) {
      tryFallback();
    }
  });
}

installImageFallbacks();

// In prose, start a new visual line immediately after each full stop.
function addSentenceBreaks(root = document) {
  const prose = new Set(root.querySelectorAll('p, .body-copy'));

  prose.forEach((element) => {
    if (element.dataset.sentenceBreaks === 'true') return;
    element.dataset.sentenceBreaks = 'true';

    const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);

    nodes.forEach((node) => {
      if (!/\.\s+\S/.test(node.nodeValue || '')) return;

      const parts = node.nodeValue.split(/(\.\s+)/);
      const fragment = document.createDocumentFragment();

      parts.forEach((part, index) => {
        if (!part) return;
        if (/^\.\s+$/.test(part) && index < parts.length - 1) {
          fragment.appendChild(document.createTextNode('.'));
          fragment.appendChild(document.createElement('br'));
        } else {
          fragment.appendChild(document.createTextNode(part));
        }
      });

      node.parentNode.replaceChild(fragment, node);
    });
  });
}

// Every visible TerraSave word carries the brand orange dot.
function decorateTerraSaveText(root = document.body) {
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (!node.nodeValue || !/(TerraSave|TERRASAVE)/.test(node.nodeValue)) return NodeFilter.FILTER_REJECT;
      const parent = node.parentElement;
      if (!parent) return NodeFilter.FILTER_REJECT;
      if (['SCRIPT', 'STYLE', 'TEXTAREA', 'OPTION'].includes(parent.tagName)) return NodeFilter.FILTER_REJECT;
      if (parent.closest('.terrasave-word')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach((node) => {
    const parts = node.nodeValue.split(/(TerraSave|TERRASAVE)/g);
    const fragment = document.createDocumentFragment();

    parts.forEach((part) => {
      if (part === 'TerraSave' || part === 'TERRASAVE') {
        const word = document.createElement('span');
        word.className = 'terrasave-word';
        word.appendChild(document.createTextNode(part));
        const dot = document.createElement('span');
        dot.className = 'terrasave-dot';
        dot.setAttribute('aria-hidden', 'true');
        dot.textContent = '.';
        word.appendChild(dot);
        fragment.appendChild(word);
      } else if (part) {
        fragment.appendChild(document.createTextNode(part));
      }
    });

    node.parentNode.replaceChild(fragment, node);
  });
}

addSentenceBreaks();
decorateTerraSaveText();
