const header = document.getElementById('siteHeader');
const toggle = document.getElementById('menuToggle');
const nav = document.getElementById('siteNav');

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

// Shared Terracle-inspired footer for every TerraSave page.
const footerStyle = document.createElement('link');
footerStyle.rel = 'stylesheet';
footerStyle.href = 'assets/css/footer.css';
document.head.appendChild(footerStyle);

const footer = document.querySelector('footer.footer');
if (footer) {
  footer.innerHTML = `
    <div class="footer-shell">
      <div class="footer-intro">
        <div>
          <span class="footer-kicker">TERRASAVE · A BRAND OF TERRACLE</span>
          <h2>Keep Fresh, Save Loss.<br>신선함을 더 오래 지킵니다.</h2>
        </div>
        <p class="footer-intro-copy">TerraSave는 Terracle의 기술을 기반으로 신선 제품의 유통 과정에서 발생하는 손실을 줄이는 솔루션을 제공합니다.</p>
      </div>

      <div class="footer-actions">
        <a class="footer-action" href="https://kr.terracle.im/OnlineMeeting" target="_blank" rel="noopener noreferrer">
          <span class="footer-action-label">CAREER MEETING</span>
          <div>
            <div class="footer-action-title"><span>커리어 미팅 예약하기</span><span>↗</span></div>
            <p class="footer-action-desc">테라클 취업을 목표로 하는 분들을 위한 온라인 커리어 미팅입니다.</p>
          </div>
        </a>
        <a class="footer-action" href="contact.html">
          <span class="footer-action-label">CONTACT</span>
          <div>
            <div class="footer-action-title"><span>문의하기</span><span>↗</span></div>
            <p class="footer-action-desc">무료 샘플, B2B 도입, 공동 연구 및 TerraSave X 관련 문의를 남겨주세요.</p>
          </div>
        </a>
        <a class="footer-action" href="https://kr.terracle.im/" target="_blank" rel="noopener noreferrer">
          <span class="footer-action-label">TERRACLE</span>
          <div>
            <div class="footer-action-title"><span>Terracle 바로가기</span><span>↗</span></div>
            <p class="footer-action-desc">모브랜드 Terracle의 화학적 재활용 기술과 기업 정보를 확인하세요.</p>
          </div>
        </a>
      </div>

      <div class="footer-info">
        <div>
          <h3 class="footer-col-title">Company</h3>
          <dl class="footer-dl">
            <div><dt>사업자등록번호</dt><dd>368-81-02387</dd></div>
            <div><dt>전화번호</dt><dd>032-710-2891~2</dd></div>
            <div><dt>이메일</dt><dd><a href="mailto:info@terracle.im">info@terracle.im</a></dd></div>
          </dl>
        </div>

        <div>
          <h3 class="footer-col-title">Locations</h3>
          <div class="footer-locations">
            <div class="footer-location"><strong>본사</strong><span>부산광역시 해운대구 센텀중앙로 78(우동) 센텀그린타워 303호</span></div>
            <div class="footer-location"><strong>인천 R&amp;D 센터 및 Pilot Plant</strong><span>인천광역시 서구 정서진로 410, 녹색융합클러스터 D 216호 / PT-F동 01호</span></div>
            <div class="footer-location"><strong>제1공장</strong><span>충청남도 당진시 합덕읍 소소리 644</span></div>
          </div>
        </div>

        <div>
          <h3 class="footer-col-title">Sitemap</h3>
          <nav class="footer-sitemap" aria-label="Footer sitemap">
            <a href="about.html">About us</a>
            <a href="what-we-do.html">What we do</a>
            <a href="problem.html">Problem</a>
            <a href="solutions.html">Solutions</a>
            <a href="technology.html">Technology</a>
            <a href="product.html">Product</a>
            <a href="contact.html">Contact</a>
          </nav>
        </div>
      </div>

      <div class="footer-legal">
        <a class="footer-parent-link" href="https://kr.terracle.im/" target="_blank" rel="noopener noreferrer">TerraSave by Terracle ↗</a>
        <span>Copyright © 2026 Terracle. All Rights Reserved.</span>
      </div>
    </div>`;
}
