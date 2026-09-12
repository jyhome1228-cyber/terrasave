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
  ['fruits.html', '과일별 보기'],
  ['product.html', '과일망'],
  ['technology.html', '기술'],
  ['what-we-do.html', '연구자료'],
  ['about.html', '소개']
];

if (nav) {
  const currentPath = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
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

function normalizeCopy(value = '') {
  return value.replace(/\s+/g, ' ').trim();
}

function replaceExact(selector, from, to) {
  document.querySelectorAll(selector).forEach((element) => {
    if (normalizeCopy(element.textContent) === normalizeCopy(from)) {
      element.innerHTML = to;
    }
  });
}

function applyAudienceCopy() {
  const replacements = [
    ['.ts-kicker', 'Fruit Protection Intelligence / Terracle', '과일 신선도 보호 솔루션'],
    ['.ts-kicker', 'TerraSave Fruit Protection System', '과일마다 다른 상태를 보고 포장을 정합니다'],
    ['.ts-display', 'Freshness begins with understanding the fruit.', '과일을 좋은 상태로 보내려면,<br />과일부터 제대로 알아야 합니다.'],
    ['.ts-button', 'Explore fruit database', '내 과일 보관법 보기'],
    ['.ts-button', 'View net system', '과일망 솔루션 보기'],
    ['.ts-kicker', 'Protection layer', '과일을 감싸는 보호 구조'],
    ['.ts-hero-panel-label', 'Fruit Foam Net × Functional Material Study', '과일망과 기능성 소재를 함께 검토합니다.'],
    ['.ts-caption', '01 / SYSTEM', '01 / 보호 구조'],
    ['.ts-mini-stat strong', 'Shape', '과일 모양'],
    ['.ts-mini-stat strong', 'Risk', '상하기 쉬운 원인'],
    ['.ts-mini-stat strong', 'Route', '유통 환경'],
    ['.ts-stat span', 'Fruit profiles', '과일 18종'],
    ['.ts-stat span', 'Packaging studies', '포장 연구 24건'],
    ['.ts-stat span', 'Research references', '참고자료 43+'],

    ['.ts-kicker', 'Why fruit-specific', '왜 과일마다 포장이 달라야 할까요?'],
    ['.ts-kicker', 'Fruit Database', '과일별 보관·포장 정보'],
    ['.ts-h2', '18 fruits, organized by storage and risk.', '내 과일은 어떻게 보관하고,<br />무엇을 먼저 보호해야 할까요?'],
    ['.ts-pill', 'All fruits', '전체 과일'],
    ['.ts-pill', 'All', '전체 과일'],
    ['.ts-pill', 'Climacteric', '수확 후에도 익는 과일'],
    ['.ts-pill', 'Non-climacteric', '수확 후 크게 익지 않는 과일'],
    ['.ts-pill', 'High sensitivity', '에틸렌 영향이 큰 과일'],
    ['.ts-link', 'View all 18 fruits ↗', '과일 18종 전체 보기 ↗'],

    ['.ts-kicker', 'Freshness challenges', '과일이 상하는 이유부터 봅니다'],
    ['.ts-h3', 'Ethylene & Ripening', '너무 빨리 익고 물러지는 문제'],
    ['.ts-h3', 'Moisture & Condensation', '수분이 빠지거나 물방울이 맺히는 문제'],
    ['.ts-h3', 'Impact & Surface Damage', '눌리고 부딪혀 생기는 손상'],
    ['.ts-h3', 'Decay & Storage Stress', '곰팡이·부패와 보관 온도 문제'],
    ['.ts-challenge-fruits', 'Avocado · Apple · Kiwi · Banana · Mango', '아보카도 · 사과 · 키위 · 바나나 · 망고'],
    ['.ts-challenge-fruits', 'Strawberry · Grape · Blueberry · Cherry', '딸기 · 포도 · 블루베리 · 체리'],
    ['.ts-challenge-fruits', 'Pear · Peach · Nectarine · Persimmon', '배 · 복숭아 · 천도복숭아 · 단감'],
    ['.ts-challenge-fruits', 'Mandarin · Pomegranate · Pineapple · Plum', '감귤 · 석류 · 파인애플 · 자두'],

    ['.ts-kicker', 'How it works', '포장 방향을 정하는 방법'],
    ['.ts-h2', 'Fruit → Data → Risk → Protection Direction', '과일을 보고,<br />유통 환경을 보고,<br />필요한 보호를 정합니다.'],
    ['.ts-step-no', '01 / FRUIT', '01 / 과일 확인'],
    ['.ts-step-no', '02 / DATA', '02 / 보관 조건'],
    ['.ts-step-no', '03 / RISK', '03 / 상하기 쉬운 원인'],
    ['.ts-step-no', '04 / DIRECTION', '04 / 포장 방향'],

    ['.ts-kicker', 'TerraSave System', '테라세이브가 하는 일'],
    ['.ts-h2', 'Physical protection first. Functional protection next.', '먼저 눌림과 충격을 줄이고,<br />필요하면 신선도 관리 기능까지 더합니다.'],
    ['.ts-kicker', '01 / Fruit Foam Net', '01 / 과일 보호망'],
    ['.ts-link', 'Explore net system ↗', '과일망 자세히 보기 ↗'],
    ['.ts-solution-item strong', 'Physical', '눌림·충격 보호'],
    ['.ts-solution-item strong', 'Environmental', '보관환경 확인'],
    ['.ts-solution-item strong', 'Functional', '기능성 소재 검토'],
    ['.ts-solution-item strong', 'Validation', '실제 시험으로 확인'],

    ['.ts-kicker', 'Fruit Database / 18 items', '과일별 보관·포장 정보 / 18종'],
    ['.ts-h1', 'Fruit intelligence, organized by fruit.', '과일마다 다른 보관법과,<br />포장할 때 먼저 볼 문제를 정리했습니다.'],

    ['.ts-display', 'A net is simple. The fruit is not.', '과일망은 같아 보여도,<br />과일마다 필요한 보호는 다릅니다.'],
    ['.ts-kicker', 'TerraSave Fruit Foam Net', '과일을 하나씩 감싸는 보호망'],
    ['.ts-kicker', 'Protection logic', '어떤 과일망이 맞을까요?'],
    ['.ts-kicker', 'Application study', '어떤 과일부터 적용하면 좋을까요?'],
    ['.ts-h2', 'Priority fruit groups', '먼저 검토하기 좋은 과일들'],
    ['.ts-kicker', 'Functional extension', '과일망에서 신선도 관리까지'],
    ['.ts-h2', 'Physical protection, then functional protection.', '먼저 눌림을 줄이고,<br />필요하면 신선도 관리 기능까지 더합니다.'],

    ['.ts-kicker', 'Technology', '과일을 오래 지키는 기술'],
    ['.ts-h1', 'Explain the value. Protect the recipe.', '필요한 기능은 쉽게 설명하고,<br />핵심 기술은 안전하게 지킵니다.'],
    ['.ts-kicker', 'Technology layers', '과일을 보호하는 네 가지 단계'],
    ['.ts-kicker', 'Disclosure policy', '기술은 필요한 만큼만 공개합니다'],
    ['.ts-h2', 'Public / Partner / Private', '어디까지 공개하고,<br />어디부터 함께 검토할까요?'],
    ['.ts-kicker', 'MOF relation', '기능성 소재는 어디에 쓰이나요?'],

    ['.ts-kicker', 'Research Library', '과일 보관·포장 연구자료'],
    ['.ts-h1', 'Evidence before recommendation.', '포장재를 고르기 전에,<br />과일과 유통 조건부터 확인합니다.'],
    ['.ts-kicker', 'Library structure', '어떤 자료를 보고 판단하나요?'],
    ['.ts-h2', 'Five research layers', '다섯 가지 자료를 함께 봅니다.'],
    ['.ts-kicker', 'Interpretation rule', '숫자 하나만 보고 판단하지 않습니다'],
    ['.ts-h2', 'Material alone does not equal shelf life.', '같은 포장재라도,<br />얼마나 오래 가는지는 조건에 따라 달라집니다.'],
    ['.ts-kicker', 'Ethylene data', '익는 속도와 에틸렌 영향'],

    ['.ts-kicker', 'About TerraSave', '테라세이브는 어떤 일을 하나요?'],
    ['.ts-h1', 'We start with the fruit.', '포장재보다 먼저,<br />과일부터 봅니다.'],
    ['.ts-kicker', 'Our point of view', '왜 과일부터 볼까요?'],
    ['.ts-kicker', 'What we build', '우리가 만드는 것'],
    ['.ts-h2', 'Data as the foundation. Net as the first application.', '과일 데이터를 바탕으로,<br />과일망부터 하나씩 적용합니다.'],
    ['.ts-kicker', 'Terracle', '테라클과 테라세이브'],
    ['.ts-h2', 'A brand of Terracle.', '테라세이브는 테라클의<br />과일 보호 솔루션입니다.'],
    ['.ts-link', 'Visit Terracle ↗', '테라클 홈페이지 보기 ↗'],

    ['.ts-kicker', 'Contact', '포장 상담'],
    ['.ts-h1', 'Tell us the fruit you need to protect.', '어떤 과일을,<br />어떻게 보내고 계신가요?'],
    ['.ts-kicker', 'Inquiry types', '이런 상황이라면 문의해 주세요'],
    ['.ts-h2', 'Start with the fruit, not the specification.', '규격보다 먼저,<br />과일과 유통 상황을 알려주세요.'],
    ['.ts-kicker', 'Request', '포장 상담 요청'],
    ['.ts-h2', 'Share the current condition.', '현재 포장과 유통 상황을 알려주세요.'],
    ['.ts-button', 'Email TerraSave', '이메일로 상담하기'],
    ['.ts-button', 'Browse fruit database', '과일별 정보 먼저 보기'],

    ['.ts-kicker', 'Fruit characteristics / 쉽게 보기', '이 과일은 어떤 특징이 있나요?'],
    ['.ts-kicker', 'Packaging guide', '포장할 때 무엇을 먼저 볼까요?'],
    ['.ts-kicker', 'TerraSave Approach', '테라세이브는 이렇게 검토합니다'],
    ['.ts-kicker', 'Next profile', '다른 과일 보기']
  ];

  replacements.forEach(([selector, from, to]) => replaceExact(selector, from, to));

  const path = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  if (path === 'fruit.html' && window.TERRASAVE_FRUITS) {
    const slug = new URLSearchParams(location.search).get('fruit') || 'apple';
    const fruit = window.TERRASAVE_FRUITS.find((item) => item.slug === slug) || window.TERRASAVE_FRUITS[0];
    const title = document.querySelector('#fruitDetail .ts-detail-copy .ts-h1');
    const profileLabel = document.querySelector('#fruitDetail .ts-detail-copy .ts-kicker');
    if (title && fruit) title.textContent = fruit.ko;
    if (profileLabel && fruit) profileLabel.textContent = `과일 포장 가이드 / ${fruit.ko}`;

    document.querySelectorAll('.ts-breadcrumb').forEach((breadcrumb) => {
      breadcrumb.innerHTML = breadcrumb.innerHTML
        .replace('Home', '홈')
        .replace('Fruit Database', '과일별 보기');
    });
  }

  document.querySelectorAll('.ts-intelligence-row').forEach((row) => {
    const text = normalizeCopy(row.textContent);
    const names = [
      ['Apple / 사과', '사과'],
      ['Strawberry / 딸기', '딸기'],
      ['Kiwifruit / 키위', '키위'],
      ['Shine Muscat / 샤인머스캣', '샤인머스캣']
    ];
    names.forEach(([from, to]) => {
      const strong = row.querySelector('strong');
      if (strong && normalizeCopy(strong.textContent) === from) strong.textContent = to;
    });
    row.querySelectorAll('span').forEach((span) => {
      const value = normalizeCopy(span.textContent);
      const map = {
        'Ethylene · Softening': '후숙 속도 · 물러짐',
        'Condensation · Mold': '물방울 · 곰팡이',
        'Moisture · Botrytis': '수분 손실 · 곰팡이',
        'Priority 5 / 5': '관리 중요도 높음',
        'Priority 3 / 5': '관리 중요도 보통',
        'Priority 2 / 5': '관리 중요도 낮음'
      };
      if (map[value]) span.textContent = map[value];
    });
  });
}

document.addEventListener('DOMContentLoaded', applyAudienceCopy);
window.addEventListener('load', applyAudienceCopy);
