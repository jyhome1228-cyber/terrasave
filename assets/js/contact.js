/* TerraSAVE Contact: client-side email composer, not a server form submission. */
(() => {
  'use strict';

  const form = document.getElementById('contactForm');
  const compose = document.getElementById('contactCompose');
  const status = document.getElementById('formStatus');
  if (!form || !compose) return;

  // Never submit visitor data to a URL or to the current static page.
  form.addEventListener('submit', event => event.preventDefault());

  compose.addEventListener('click', () => {
    if (!form.reportValidity()) return;

    const fields = new FormData(form);
    const field = name => String(fields.get(name) || '').trim();
    const type = field('inquiryType');
    const name = field('name');
    const company = field('company');
    const email = field('email');
    const phone = field('phone');
    const message = field('message');

    const subject = '[TerraSAVE] ' + type + ' / ' + (company || name);
    const body = [
      'TerraSAVE 문의',
      '',
      '문의 유형: ' + type,
      '담당자명: ' + name,
      '회사명: ' + (company || '-'),
      '이메일: ' + email,
      '연락처: ' + (phone || '-'),
      '',
      '문의 내용',
      message
    ].join('\n');

    if (status) {
      status.textContent = '메일 프로그램이 열리면 내용을 확인한 뒤 발송해 주세요. 메일 창이 열리지 않으면 info@terracle.im로 직접 문의해 주세요.';
    }

    window.location.href = 'mailto:info@terracle.im?subject=' +
      encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
})();
