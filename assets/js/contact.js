const contactForm = document.getElementById('contactForm');
const inquiryType = document.getElementById('inquiryType');
const inquiryTypeError = document.getElementById('inquiryTypeError');
const inquiryOptions = document.querySelectorAll('.inquiry-option');
const formStatus = document.getElementById('formStatus');

function setInquiryType(value) {
  if (!inquiryType) return;

  inquiryType.value = value || '';

  inquiryOptions.forEach((button) => {
    const active = button.dataset.value === value;
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  });

  if (inquiryTypeError) inquiryTypeError.textContent = '';
}

inquiryOptions.forEach((button) => {
  button.addEventListener('click', () => {
    setInquiryType(button.dataset.value || '');
  });
});

// Clicking an option card above preselects the matching type before moving to the form.
document.querySelectorAll('[data-inquiry-type]').forEach((card) => {
  card.addEventListener('click', () => {
    setInquiryType(card.dataset.inquiryType || '');
  });
});

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!inquiryType || !inquiryType.value) {
      if (inquiryTypeError) inquiryTypeError.textContent = '문의 유형을 선택해 주세요.';
      if (formStatus) formStatus.textContent = '';
      const firstOption = inquiryOptions[0];
      if (firstOption) firstOption.focus();
      return;
    }

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    const data = new FormData(contactForm);
    const type = data.get('inquiryType') || '일반 문의';
    const name = data.get('name') || '';
    const company = data.get('company') || '-';
    const email = data.get('email') || '';
    const phone = data.get('phone') || '-';
    const message = data.get('message') || '';

    const subject = `[TerraSave] ${type} - ${name}${company !== '-' ? ` / ${company}` : ''}`;
    const body = [
      'TerraSave 웹사이트 문의',
      '',
      `문의 유형: ${type}`,
      `이름: ${name}`,
      `회사명: ${company}`,
      `이메일: ${email}`,
      `연락처: ${phone}`,
      '',
      '문의 내용',
      message
    ].join('\n');

    if (formStatus) formStatus.textContent = '메일 작성 화면을 여는 중입니다.';

    window.location.href = `mailto:info@terracle.im?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.setTimeout(() => {
      if (formStatus) formStatus.textContent = '메일 앱에서 내용을 확인한 뒤 전송해 주세요.';
    }, 800);
  });
}
