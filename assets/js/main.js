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

if (header && toggle && nav) {
  toggle.addEventListener('click', () => {
    const open = header.classList.toggle('menu-open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
  });

  nav.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      header.classList.remove('menu-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '메뉴 열기');
    });
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
