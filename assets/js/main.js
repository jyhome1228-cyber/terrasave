const header = document.getElementById('siteHeader');
const toggle = document.getElementById('menuToggle');
const nav = document.getElementById('siteNav');

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

// Compact TerraSave footer shared across all pages.
const footerStyle = document.createElement('link');
footerStyle.rel = 'stylesheet';
footerStyle.href = 'assets/css/footer.css';
document.head.appendChild(footerStyle);

const footer = document.querySelector('footer.footer');
if (footer) {
  footer.innerHTML = `
    <div class="footer-shell">
      <div class="footer-topline">
        <div class="footer-brand-block">
          <img class="footer-logo" src="assets/img/terrasave-logo.svg" alt="TerraSave" />
          <p class="footer-tagline">Keep Fresh, Save Loss.</p>
          <p class="footer-description">신선함을 더 오래 유지하고 유통 과정의 손실을 줄입니다.</p>
        </div>

        <nav class="footer-nav-main" aria-label="Footer navigation">
          <a href="about.html">About us</a>
          <a href="what-we-do.html">What we do</a>
          <a href="technology.html">Technology</a>
          <a href="product.html">Product</a>
          <a href="contact.html">Contact</a>
        </nav>
      </div>

      <div class="footer-details">
        <div class="footer-detail-group">
          <span class="footer-detail-label">Company</span>
          <div class="footer-detail-copy">
            <span>368-81-02387</span>
            <a href="tel:0327102891">032-710-2891~2</a>
            <a href="mailto:info@terracle.im">info@terracle.im</a>
          </div>
        </div>

        <div class="footer-detail-group footer-location-group">
          <span class="footer-detail-label">Locations</span>
          <div class="footer-detail-copy">
            <span>Busan HQ</span>
            <span>Incheon R&amp;D / Pilot Plant</span>
            <span>Dangjin Plant</span>
          </div>
        </div>

        <div class="footer-detail-group footer-parent-group">
          <span class="footer-detail-label">Parent company</span>
          <a class="footer-parent-link" href="https://kr.terracle.im/" target="_blank" rel="noopener noreferrer">Terracle ↗</a>
        </div>
      </div>

      <div class="footer-legal">
        <span class="footer-brand-note">A BRAND OF TERRACLE</span>
        <span>Copyright © 2026 Terracle. All Rights Reserved.</span>
      </div>
    </div>`;
}
