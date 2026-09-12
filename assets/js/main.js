const header = document.getElementById('siteHeader');
const toggle = document.getElementById('menuToggle');
const nav = document.getElementById('siteNav');

function ensureStylesheet(href) {
  if (!document.querySelector(`link[href="${href}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = href;
    document.head.appendChild(link);
  }
}

ensureStylesheet('assets/css/redesign.css');
ensureStylesheet('assets/css/layout-overrides.css');

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
  ['fruits.html', '과일별 보기'],
  ['product.html', '과일망'],
  ['technology.html', '기술'],
  ['what-we-do.html', '연구자료'],
  ['about.html', '소개']
];

const currentPath = (location.pathname.split('/').pop() || 'index.html').toLowerCase();

if (nav) {
  nav.innerHTML = navItems.map(([href, label]) => {
    const isFruitDetail = currentPath === 'fruit.html' && href === 'fruits.html';
    const isCurrent = currentPath === href || isFruitDetail;
    return `<a href="${href}"${isCurrent ? ' aria-current="page"' : ''}>${label}</a>`;
  }).join('');
}

document.querySelectorAll('.header-cta').forEach((button) => {
  button.textContent = '포장 상담하기';
});

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
          <p class="footer-tagline">과일을 더 안전하게, 더 좋은 상태로 보내기 위한 포장 연구.</p>
          <p class="footer-description">과일별 보관 조건과 유통 중 문제를 바탕으로 필요한 보호 방향을 찾습니다.</p>
        </div>
        <nav class="footer-nav-main" aria-label="Footer navigation">
          <a href="fruits.html">과일별 보기</a>
          <a href="product.html">과일망</a>
          <a href="technology.html">기술</a>
          <a href="what-we-do.html">연구자료</a>
          <a href="about.html">소개</a>
          <a href="contact.html">문의</a>
        </nav>
      </div>
      <div class="footer-secondary">
        <div class="footer-contact-line">
          <a href="mailto:info@terracle.im">info@terracle.im</a>
          <span>032-710-2891~2</span>
          <span>368-81-02387</span>
        </div>
        <a class="footer-parent-link" href="https://kr.terracle.im/" target="_blank" rel="noopener noreferrer">Terracle에서 만든 과일 보호 솔루션 ↗</a>
      </div>
      <div class="footer-legal">
        <span>TerraSave</span>
        <span>Copyright © 2026 Terracle. All Rights Reserved.</span>
      </div>
    </div>`;
}

function clean(value = '') {
  return value.replace(/\s+/g, ' ').trim();
}

function setHTML(selector, html) {
  const el = document.querySelector(selector);
  if (el) el.innerHTML = html;
}

function setText(selector, text) {
  const el = document.querySelector(selector);
  if (el) el.textContent = text;
}

function setAllText(selector, values = []) {
  document.querySelectorAll(selector).forEach((el, index) => {
    if (values[index] !== undefined) el.textContent = values[index];
  });
}

function replaceExact(selector, from, to) {
  document.querySelectorAll(selector).forEach((el) => {
    if (clean(el.textContent) === clean(from)) el.innerHTML = to;
  });
}

function setHead(section, kicker, heading, description) {
  if (!section) return;
  const kickerEl = section.querySelector('.ts-section-head > .ts-kicker, .ts-section-head .ts-kicker');
  const headingEl = section.querySelector('.ts-section-head .ts-h1, .ts-section-head .ts-h2');
  const descEl = section.querySelector('.ts-section-head .ts-section-copy');
  if (kickerEl && kicker) kickerEl.textContent = kicker;
  if (headingEl && heading) headingEl.innerHTML = heading;
  if (descEl && description) descEl.textContent = description;
}

function setMeta(title, description) {
  if (title) document.title = title;
  const meta = document.querySelector('meta[name="description"]');
  if (meta && description) meta.setAttribute('content', description);
}

function localizeBreadcrumb() {
  document.querySelectorAll('.ts-breadcrumb').forEach((el) => {
    el.innerHTML = el.innerHTML
      .replaceAll('Home', '홈')
      .replaceAll('Fruit Database', '과일별 보기')
      .replaceAll('Net System', '과일망')
      .replaceAll('Technology', '기술')
      .replaceAll('Research', '연구자료')
      .replaceAll('About', '소개')
      .replaceAll('Contact', '문의');
  });
}

function rewriteHome() {
  setMeta('TerraSave — 과일별 신선도 보호 솔루션', '과일마다 다른 보관 조건과 유통 문제를 이해하고, 과일망과 기능성 소재를 활용해 필요한 보호 방향을 제안합니다.');
  setText('.ts-hero-top .ts-kicker', '과일 신선도 보호 솔루션');
  setText('.ts-hero-top .ts-hero-note', '농장에서 출하해 소비자에게 도착할 때까지, 과일이 좋은 상태를 오래 유지하도록 포장 방향을 연구합니다.');
  setText('.ts-hero-copy .ts-kicker', '과일마다 다른 상태를 보고 포장을 정합니다');
  setHTML('.ts-hero-copy .ts-display', '과일을 좋은 상태로 보내려면,<br />과일부터 제대로 알아야 합니다.');
  setText('.ts-hero-copy .ts-body-lg', '사과, 배, 딸기, 복숭아는 모양도 다르고 익는 속도도 다릅니다. 눌림에 약한 과일이 있는 반면, 수분이나 에틸렌 때문에 더 빨리 품질이 떨어지는 과일도 있습니다. TerraSave는 과일별 특성과 실제 유통 조건을 보고 필요한 보호 방법을 찾습니다.');
  const heroButtons = document.querySelectorAll('.ts-hero-actions .ts-button');
  if (heroButtons[0]) heroButtons[0].textContent = '내 과일 보관법 보기';
  if (heroButtons[1]) heroButtons[1].textContent = '과일망 솔루션 보기';
  setText('.ts-hero-panel .ts-kicker', '과일을 감싸는 보호 구조');
  setText('.ts-hero-panel-label', '과일망과 기능성 소재를 실제 유통 조건에 맞춰 검토합니다.');
  setText('.ts-hero-panel .ts-caption', '01 / 보호 구조');
  setAllText('.ts-mini-stat strong', ['과일 모양', '상하기 쉬운 원인', '유통 환경']);
  setAllText('.ts-stat span', ['과일 18종', '포장 연구 24건', '참고자료 43+']);

  const sections = document.querySelectorAll('main > .ts-section');
  if (sections[0]) setHead(sections[0], '왜 과일마다 포장이 달라야 할까요?', '같은 포장이라도,<br />과일마다 먼저 막아야 할 문제가 다릅니다.', '과일이 빨리 무르는 이유, 수분이 빠지는 이유, 곰팡이가 생기는 이유가 서로 다르기 때문에 포장도 과일 특성에 맞춰 봐야 합니다.');
  if (sections[1]) setHead(sections[1], '과일별 보관·포장 정보', '내 과일은 어떻게 보관하고,<br />무엇을 먼저 보호해야 할까요?', '18개 과일의 보관 온도, 습도, 익는 방식과 유통 중 주의할 점을 쉽게 비교할 수 있습니다.');
  if (sections[2]) setHead(sections[2], '과일이 상하는 이유부터 봅니다', '문제를 먼저 알아야,<br />맞는 포장 방향을 찾을 수 있습니다.', '과일 이름만 보고 포장을 정하지 않습니다. 실제 유통 중 어떤 변화가 상품성을 떨어뜨리는지부터 확인합니다.');
  if (sections[3]) setHead(sections[3], '포장 방향을 정하는 방법', '과일을 보고,<br />유통 환경을 보고,<br />필요한 보호를 정합니다.', '지금 쓰는 포장, 이동 거리, 보관 기간과 과일 상태를 함께 보고 필요한 보호 기능만 단계적으로 검토합니다.');
  if (sections[4]) setHead(sections[4], '테라세이브가 하는 일', '먼저 눌림과 충격을 줄이고,<br />필요하면 신선도 관리 기능까지 더합니다.', '기본은 과일을 감싸는 보호망입니다. 이후 과일에 따라 수분, 후숙 속도, 저장환경 문제를 줄일 수 있는 기능성 소재의 필요성을 시험합니다.');

  setAllText('.ts-challenge-copy .ts-h3', ['너무 빨리 익고 물러지는 문제', '수분이 빠지거나 물방울이 맺히는 문제', '눌리고 부딪혀 생기는 손상', '곰팡이·부패와 보관 온도 문제']);
  setAllText('.ts-challenge-fruits', ['아보카도 · 사과 · 키위 · 바나나 · 망고', '딸기 · 포도 · 블루베리 · 체리', '배 · 복숭아 · 천도복숭아 · 단감', '감귤 · 석류 · 파인애플 · 자두']);
  setAllText('.ts-step-no', ['01 / 과일 확인', '02 / 보관 조건', '03 / 상하기 쉬운 원인', '04 / 포장 방향']);
  setAllText('.ts-solution-item strong', ['눌림·충격 보호', '보관환경 확인', '기능성 소재 검토', '실제 시험으로 확인']);
  replaceExact('.ts-link', 'Explore net system ↗', '과일망 자세히 보기 ↗');
  replaceExact('.ts-kicker', '01 / Fruit Foam Net', '01 / 과일 보호망');
  replaceExact('.ts-pill', 'All fruits', '전체 과일');
  replaceExact('.ts-pill', 'Climacteric', '수확 후에도 익는 과일');
  replaceExact('.ts-pill', 'High sensitivity', '에틸렌 영향이 큰 과일');
  replaceExact('.ts-link', 'View all 18 fruits ↗', '과일 18종 전체 보기 ↗');

  document.querySelectorAll('.ts-intelligence-row').forEach((row) => {
    const strong = row.querySelector('strong');
    if (strong) {
      strong.textContent = strong.textContent.replace('Apple / ', '').replace('Strawberry / ', '').replace('Kiwifruit / ', '').replace('Shine Muscat / ', '');
    }
    row.querySelectorAll('span').forEach((span) => {
      const map = {
        'Ethylene · Softening': '후숙 속도 · 물러짐',
        'Condensation · Mold': '물방울 · 곰팡이',
        'Moisture · Botrytis': '수분 손실 · 곰팡이',
        'Priority 5 / 5': '관리 중요도 높음',
        'Priority 3 / 5': '관리 중요도 보통',
        'Priority 2 / 5': '관리 중요도 낮음'
      };
      if (map[clean(span.textContent)]) span.textContent = map[clean(span.textContent)];
    });
  });
}

function rewriteFruits() {
  setMeta('과일별 보관·포장 정보 — TerraSave', '18개 과일의 보관 온도, 습도, 익는 방식, 에틸렌 영향과 포장 시 주의점을 쉽게 확인할 수 있습니다.');
  const hero = document.querySelector('.ts-page-hero');
  if (hero) setHead(hero, '과일별 보관·포장 정보 / 18종', '내 과일은 어떻게 보관하고,<br />무엇을 먼저 보호해야 할까요?', '과일을 선택하면 보관 온도와 습도, 익는 방식, 유통 중 주의할 점과 포장 방향을 쉽게 확인할 수 있습니다.');
  setAllText('.ts-evidence-block .ts-kicker', ['정리된 과일', '확인할 항목', '활용 방법']);
  setAllText('.ts-evidence-block strong', ['18종', '6가지', '비교·검토']);
  setAllText('.ts-evidence-block p', ['주요 유통 과일을 한곳에서 비교합니다.', '보관·습도·후숙·에틸렌·주의점·포장 방향을 봅니다.', '우리 과일의 포장 개선점을 찾는 출발점으로 사용합니다.']);
  replaceExact('.ts-pill', 'All', '전체 과일');
  replaceExact('.ts-pill', 'Climacteric', '수확 후에도 익는 과일');
  replaceExact('.ts-pill', 'Non-climacteric', '수확 후 크게 익지 않는 과일');
  replaceExact('.ts-pill', 'High sensitivity', '에틸렌 영향이 큰 과일');
  const sections = document.querySelectorAll('main > .ts-section');
  if (sections[2]) setHead(sections[2], '정보를 이렇게 보세요', '온도 숫자 하나보다,<br />과일의 상태와 유통 조건을 함께 봅니다.', '같은 과일도 품종과 숙도, 보관 기간, 이동 거리와 포장 방식에 따라 필요한 조건이 달라질 수 있습니다.');
  if (sections[3]) setHead(sections[3], '포장 개선이 필요하다면', '지금 쓰는 포장과,<br />유통 중 가장 큰 문제를 알려주세요.', '눌림, 물러짐, 수분 손실, 결로, 곰팡이 등 실제 현장에서 겪는 문제를 기준으로 검토 방향을 정리합니다.');
  replaceExact('.ts-button', 'Request a solution', '포장 상담하기');
}

function rewriteProduct() {
  setMeta('과일망 — TerraSave', '과일의 크기와 표면, 눌림 위험, 유통 조건을 보고 맞는 과일 보호망 적용 방향을 검토합니다.');
  setText('.ts-breadcrumb', '홈 / 과일망');
  setHTML('.ts-net-hero .ts-display', '과일망은 같아 보여도,<br />과일마다 필요한 보호는 다릅니다.');
  setText('.ts-net-intro .ts-kicker', '과일을 하나씩 감싸는 보호망');
  setText('.ts-net-intro-copy .ts-body-lg', '배처럼 단단한 과일과 복숭아처럼 쉽게 눌리는 과일은 같은 망을 써도 결과가 다를 수 있습니다. 과일 크기, 표면, 숙도와 이동 거리를 보고 완충 정도와 적용 방향을 함께 검토합니다.');
  replaceExact('.ts-button', 'Request a solution', '내 과일망 상담하기');
  setText('.ts-object-label', '과일 보호망 적용 예시');
  const sections = document.querySelectorAll('main > .ts-section');
  if (sections[0]) setHead(sections[0], '어떤 과일망이 맞을까요?', '망 규격보다 먼저,<br />과일과 유통 상황을 봅니다.', '품목과 크기, 눌림 정도, 포장 방법, 적재와 운송 환경을 확인한 뒤 필요한 완충 방향을 정합니다.');
  if (sections[1]) setHead(sections[1], '먼저 검토하기 좋은 과일', '개별 포장이 많거나,<br />눌림에 민감한 과일부터 시작합니다.', '배, 사과, 복숭아, 망고, 아보카도, 단감처럼 개별 보호의 필요성이 큰 품목부터 실제 적용 조건을 살펴봅니다.');
  if (sections[2]) setHead(sections[2], '과일망에서 신선도 관리까지', '먼저 눌림을 줄이고,<br />필요하면 신선도 관리 기능까지 더합니다.', '기본은 물리적 보호입니다. 이후 과일 특성에 따라 수분, 후숙 속도, 저장환경을 관리하는 기능성 소재의 필요성을 별도로 시험합니다.');
  setAllText('.ts-step-copy .ts-h3', ['과일 확인', '유통 조건 확인', '필요한 보호 정리', '적용 방향 제안']);
  setAllText('.ts-step-copy p', ['품목, 품종, 크기와 표면 상태를 확인합니다.', '보관 온도, 이동 거리, 적재 방식과 판매 시점을 봅니다.', '눌림, 마찰, 후숙, 수분 등 우선 문제를 정합니다.', '현재 포장에 적용 가능한 과일망 방향을 제안합니다.']);
  document.querySelectorAll('.ts-application-row .ts-kicker').forEach((el, index) => el.textContent = String(index + 1).padStart(2, '0'));
}

function rewriteTechnology() {
  setMeta('기술 — TerraSave', '과일을 보호하기 위해 어떤 데이터를 보고, 어떤 기능을 검토하며, 실제 적용 전 무엇을 시험하는지 쉽게 설명합니다.');
  const hero = document.querySelector('.ts-page-hero');
  if (hero) setHead(hero, '과일을 오래 지키는 기술', '과일마다 다른 문제를 보고,<br />필요한 기능만 골라 적용합니다.', '테라세이브는 복잡한 기술 이름보다 실제 과일에 어떤 도움이 필요한지를 먼저 봅니다. 눌림을 줄일지, 익는 속도를 관리할지, 수분과 보관환경을 조절할지 단계적으로 확인합니다.');
  const sections = document.querySelectorAll('main > .ts-section');
  if (sections[0]) setHead(sections[0], '과일을 보호하는 네 단계', '과일부터 확인하고,<br />마지막은 실제 시험으로 확인합니다.', '과일 상태와 유통 조건을 확인한 뒤 물리적 보호와 신선도 관리 기능의 필요성을 나누어 검토합니다.');
  if (sections[1]) setHead(sections[1], '기술은 필요한 만큼만 공개합니다', '고객에게 필요한 내용은 설명하고,<br />복제 가능한 핵심은 보호합니다.', '포장을 선택하는 데 필요한 원리와 적용 방향은 충분히 설명하되, 소재 배합이나 제조 공정 같은 핵심 기술은 공개하지 않습니다.');
  setAllText('.ts-step-copy .ts-h3', ['과일 상태 확인', '눌림·충격 보호', '신선도 관리 기능', '실제 시험으로 확인']);
  setAllText('.ts-step-copy p', ['보관 온도, 습도, 익는 방식과 주요 손상 원인을 확인합니다.', '과일망으로 접촉, 마찰, 압박을 줄일 수 있는지 봅니다.', '필요할 때만 에틸렌, 수분 등 특정 문제에 대응하는 기능을 검토합니다.', '실제 과일과 유통 조건에서 효과가 있는지 시험한 뒤 적용합니다.']);
  setAllText('.ts-approach .ts-kicker', ['홈페이지에서', '상담·시험 단계에서', '내부 기술로 보호']);
  setAllText('.ts-approach .ts-h3', ['과일 문제와 방향 설명', '적용 조건 함께 검토', '핵심 제조 기술 보호']);
  setAllText('.ts-approach p', ['어떤 과일에 어떤 관리가 필요한지 쉽게 설명합니다.', '고객의 포장 규격과 유통 조건에 맞춰 시험 범위를 정합니다.', '조성, 배합, 제조 공정과 세부 설계값은 공개하지 않습니다.']);
  const story = document.querySelector('.ts-story-grid');
  if (story) {
    setText('.ts-story-grid .ts-kicker', '기능성 소재는 왜 쓰나요?');
    const p = story.querySelector('p');
    if (p) p.textContent = '기능성 소재는 기술을 보여주기 위한 장식이 아닙니다. 예를 들어 어떤 과일은 익는 과정에서 나오는 에틸렌의 영향을 크게 받고, 어떤 과일은 수분이나 저장환경이 더 중요합니다. 실제로 도움이 필요한 문제가 확인됐을 때만 기능성 소재 적용을 검토합니다.';
  }
}

function rewriteResearch() {
  setMeta('연구자료 — TerraSave', '과일별 보관 조건과 포장 연구자료를 바탕으로 실제 포장 적용 시 무엇을 확인해야 하는지 정리합니다.');
  const hero = document.querySelector('.ts-page-hero');
  if (hero) setHead(hero, '과일 보관·포장 연구자료', '포장재를 고르기 전에,<br />과일과 유통 조건부터 확인합니다.', '“이 포장을 쓰면 며칠 더 간다”처럼 단순하게 말하지 않습니다. 어떤 과일을, 몇 도에서, 어떤 방식으로 보관했는지 조건을 함께 보고 실제 현장에 적용할 수 있는지 판단합니다.');
  setAllText('.ts-stat span', ['과일 정보 18종', '포장 연구 24건', '참고자료 43건']);
  const sections = document.querySelectorAll('main > .ts-section');
  if (sections[1]) setHead(sections[1], '어떤 자료를 보고 판단하나요?', '과일 특성부터 포장 연구까지,<br />다섯 가지 자료를 함께 봅니다.', '한 가지 수치만 믿지 않고 보관 조건, 포장 구조, 적용 우선순위와 원문 근거를 함께 확인합니다.');
  if (sections[2]) setHead(sections[2], '숫자 하나만 보고 판단하지 않습니다', '같은 포장재라도,<br />얼마나 오래 가는지는 조건에 따라 달라집니다.', '필름 두께, 구멍 유무, 밀봉 방식, 과일 품종과 숙도, 예냉 여부와 시험 온도가 달라지면 결과도 달라질 수 있습니다.');
  const approach = document.querySelectorAll('.ts-approach');
  if (approach[0]) {
    setText('.ts-approach:nth-child(1) .ts-kicker', '이렇게 말하지 않습니다');
    setText('.ts-approach:nth-child(1) .ts-h3', '“이 포장이면 60일 갑니다”');
    setText('.ts-approach:nth-child(1) p', '재질 이름만으로 보관 기간을 단정하지 않습니다.');
  }
  if (approach[1]) {
    setText('.ts-approach:nth-child(2) .ts-kicker', '이렇게 설명합니다');
    setText('.ts-approach:nth-child(2) .ts-h3', '시험 조건을 함께 봅니다');
    setText('.ts-approach:nth-child(2) p', '온도, 포장 구조, 필름 두께와 과일 상태를 함께 확인합니다.');
  }
  if (approach[2]) {
    setText('.ts-approach:nth-child(3) .ts-kicker', '실제 적용 전');
    setText('.ts-approach:nth-child(3) .ts-h3', '우리 과일로 다시 시험합니다');
    setText('.ts-approach:nth-child(3) p', '문헌 결과와 실제 제품 성능을 구분하고 현장 조건에서 확인합니다.');
  }
  const story = document.querySelector('.ts-story-grid');
  if (story) {
    setText('.ts-story-grid .ts-kicker', '과일이 익는 속도도 따로 봅니다');
    const p = story.querySelector('p');
    if (p) p.textContent = '과일이 스스로 에틸렌을 많이 만드는지와, 외부 에틸렌에 얼마나 민감한지는 서로 다른 문제입니다. 예를 들어 스스로 많이 만들지 않아도 주변 과일의 에틸렌 때문에 빨리 물러질 수 있습니다. 그래서 과일별로 익는 방식과 민감도를 따로 확인합니다.';
  }
}

function rewriteAbout() {
  setMeta('소개 — TerraSave', 'TerraSave는 과일별 보관·유통 특성을 먼저 이해하고 필요한 보호 포장 방향을 연구하는 Terracle의 과일 보호 솔루션입니다.');
  const hero = document.querySelector('.ts-page-hero');
  if (hero) setHead(hero, '테라세이브는 어떤 일을 하나요?', '포장재보다 먼저,<br />과일부터 봅니다.', '같은 과일망을 모든 과일에 똑같이 적용하기보다, 과일의 크기와 표면, 익는 속도와 유통 중 문제를 먼저 확인하고 필요한 보호 방향을 찾습니다.');
  const story = document.querySelector('.ts-story-grid');
  if (story) {
    setText('.ts-story-grid .ts-kicker', '왜 과일부터 볼까요?');
    const p = story.querySelector('p');
    if (p) p.textContent = '사과와 배는 비교적 단단하지만 복숭아는 쉽게 눌리고, 아보카도와 바나나는 유통 중에도 계속 익습니다. 딸기와 포도는 수분과 곰팡이 관리가 중요합니다. 이렇게 과일마다 상하는 이유가 다르기 때문에 포장도 같은 기준으로 고를 수 없습니다.';
  }
  const sections = document.querySelectorAll('main > .ts-section');
  if (sections[1]) setHead(sections[1], '우리가 만드는 것', '과일 데이터를 바탕으로,<br />과일망부터 하나씩 적용합니다.', '첫 번째 적용은 과일을 하나씩 감싸 눌림과 충격을 줄이는 보호망입니다. 이후 실제 필요가 확인되면 신선도 관리 기능을 단계적으로 더합니다.');
  if (sections[2]) setHead(sections[2], '테라클과 테라세이브', '테라세이브는 테라클의<br />과일 보호 솔루션입니다.', '테라클의 소재·기술 연구를 바탕으로 과일 유통 현장에서 실제로 사용할 수 있는 포장 방향을 연구합니다.');
  setAllText('.ts-step-copy .ts-h3', ['과일 정보 정리', '상하기 쉬운 원인 확인', '과일망 적용', '기능성 보호 확장']);
  setAllText('.ts-step-copy p', ['보관 온도와 습도, 익는 방식과 품목 특성을 정리합니다.', '눌림, 물러짐, 수분 손실, 곰팡이 등 우선 문제를 찾습니다.', '과일 크기와 유통 환경에 맞는 보호망 방향을 검토합니다.', '필요성이 확인된 경우에만 기능성 소재 적용을 시험합니다.']);
  replaceExact('.ts-link', 'Visit Terracle ↗', '테라클 홈페이지 보기 ↗');
}

function rewriteContact() {
  setMeta('포장 상담 — TerraSave', '과일 품목, 현재 포장 방식, 이동 거리와 유통 중 문제를 알려주시면 적용 가능한 보호 방향을 함께 검토합니다.');
  const hero = document.querySelector('.ts-page-hero');
  if (hero) setHead(hero, '과일 포장 상담', '어떤 과일을,<br />어떻게 보내고 계신가요?', '과일 품목과 품종, 현재 포장 방식, 이동 거리와 가장 불편한 문제를 알려주시면 어떤 보호가 필요한지부터 함께 정리합니다.');
  const sections = document.querySelectorAll('main > .ts-section');
  if (sections[0]) setHead(sections[0], '이런 상황이라면 문의해 주세요', '규격보다 먼저,<br />과일과 유통 상황을 알려주세요.', '망 크기를 바로 고르기보다 어떤 과일을 어디까지 보내고, 배송 중 어떤 문제가 생기는지부터 확인합니다.');
  if (sections[1]) setHead(sections[1], '포장 상담 요청', '현재 포장과 유통 상황을<br />간단히 알려주세요.', '과일 품목, 품종, 현재 포장 형태, 이동 거리와 기간, 가장 큰 문제, 예상 수량을 알려주시면 검토가 훨씬 빠릅니다.');
  setAllText('.ts-step-copy .ts-h3', ['과일망 적용', '샘플·시험', '대량 공급', '공동 연구']);
  setAllText('.ts-step-copy p', ['현재 사용 중인 망을 개선하거나 새로운 적용 방향을 검토합니다.', '실제 과일과 유통 조건으로 시험 가능 여부를 확인합니다.', '출하량과 규격에 맞춰 공급 방식과 맞춤 적용을 논의합니다.', '신선도 관리 기능이나 새로운 포장 구조를 함께 검토합니다.']);
  replaceExact('.ts-button', 'Email TerraSave', '이메일로 상담하기');
  replaceExact('.ts-button', 'Browse fruit database', '과일별 정보 먼저 보기');
}

function rewriteFruitDetail() {
  if (!window.TERRASAVE_FRUITS) return;
  const slug = new URLSearchParams(location.search).get('fruit') || 'apple';
  const fruit = window.TERRASAVE_FRUITS.find((item) => item.slug === slug) || window.TERRASAVE_FRUITS[0];
  if (!fruit) return;
  setMeta(`${fruit.ko} 보관·포장 가이드 — TerraSave`, `${fruit.ko}의 보관 조건, 유통 중 주의점과 포장 방향을 쉽게 설명합니다.`);
  const title = document.querySelector('#fruitDetail .ts-detail-copy .ts-h1');
  const label = document.querySelector('#fruitDetail .ts-detail-copy .ts-kicker');
  if (title) title.textContent = fruit.ko;
  if (label) label.textContent = `과일 포장 가이드 / ${fruit.ko}`;
  replaceExact('.ts-kicker', 'Fruit characteristics / 쉽게 보기', '이 과일은 어떤 특징이 있나요?');
  replaceExact('.ts-kicker', 'Packaging guide', '포장할 때 무엇을 먼저 볼까요?');
  replaceExact('.ts-kicker', 'TerraSave Approach', '테라세이브는 이렇게 검토합니다');
  replaceExact('.ts-kicker', 'Next profile', '다른 과일 보기');
}

function localizeFruitCards() {
  if (!window.TERRASAVE_FRUITS) return;
  document.querySelectorAll('.ts-fruit-card').forEach((card) => {
    const href = card.getAttribute('href') || '';
    const slug = new URL(href, location.href).searchParams.get('fruit');
    const fruit = window.TERRASAVE_FRUITS.find((item) => item.slug === slug);
    if (!fruit) return;
    const name = card.querySelector('.ts-fruit-name strong');
    const sub = card.querySelector('.ts-fruit-name span');
    const tag = card.querySelector('.ts-fruit-tag');
    if (name) name.textContent = fruit.ko;
    if (sub) sub.textContent = fruit.en;
    if (tag) tag.textContent = fruit.focusKo || fruit.focus;
    const data = card.querySelectorAll('.ts-fruit-data span');
    if (data[0]) data[0].innerHTML = `보관 온도<strong>${fruit.storage}</strong>`;
    if (data[1]) data[1].innerHTML = `에틸렌 영향<strong>${fruit.ethylenePlain || fruit.ethylene}</strong>`;
  });
  const count = document.getElementById('fruitCount');
  if (count) count.textContent = count.textContent.replace('items', '개 과일');
}

function applySiteCopy() {
  localizeBreadcrumb();
  if (currentPath === 'index.html' || currentPath === '') rewriteHome();
  if (currentPath === 'fruits.html') rewriteFruits();
  if (currentPath === 'product.html') rewriteProduct();
  if (currentPath === 'technology.html') rewriteTechnology();
  if (currentPath === 'what-we-do.html') rewriteResearch();
  if (currentPath === 'about.html') rewriteAbout();
  if (currentPath === 'contact.html') rewriteContact();
  if (currentPath === 'fruit.html') rewriteFruitDetail();
  localizeFruitCards();
}

document.addEventListener('DOMContentLoaded', applySiteCopy);
window.addEventListener('load', applySiteCopy);
