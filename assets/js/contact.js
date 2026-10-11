/* TerraSAVE inquiry composer — opens the visitor's email app; no server submission. */
(() => {
  'use strict';
  const form = document.getElementById('contactForm');
  const typeInput = document.getElementById('inquiryType');
  const error = document.getElementById('inquiryTypeError');
  const status = document.getElementById('formStatus');
  const options = Array.from(document.querySelectorAll('.inquiry-option'));
  if (!form || !typeInput) return;

  const setType = value => {
    typeInput.value = value || '';
    options.forEach(button => {
      const selected = button.dataset.value === typeInput.value;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
    });
    if (error) error.textContent = '';
  };

  options.forEach(button => button.addEventListener('click', () => setType(button.dataset.value)));

  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!typeInput.value) {
      if (error) error.textContent = '문의 유형을 선택해 주세요.';
      options[0]?.focus();
      return;
    }
    if (!form.reportValidity()) return;

    const formData = new FormData(form);
    const text = name => String(formData.get(name) || '').trim();
    const name = text('name');
    const company = text('company');
    const email = text('email');
    const phone = text('phone');
    const produce = text('produce');
    const quantity = text('quantity');
    const message = text('message');

    const subject = '[TerraSAVE] ' + typeInput.value + ' / ' + (company || name);
    const body = [
      'TerraSAVE 홈페이지 문의',
      '',
      '문의 유형: ' + typeInput.value,
      '담당자명: ' + name,
      '회사명: ' + (company || '-'),
      '이메일: ' + email,
      '연락처: ' + (phone || '-'),
      '취급 품목 및 품종: ' + (produce || '-'),
      '포장 형태·예상 수량: ' + (quantity || '-'),
      '',
      '문의 내용',
      message
    ].join('\n');

    const url = 'mailto:info@terracle.im?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(body);
    if (status) status.textContent = '메일 앱에서 내용을 확인하고 ‘보내기’를 눌러주세요. 메일 앱이 열리지 않으면 info@terracle.im로 직접 보내주세요.';
    window.location.href = url;
  });
})();
