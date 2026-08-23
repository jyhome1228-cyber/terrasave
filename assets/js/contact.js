const contactForm = document.getElementById('contactForm');
const inquiryType = document.getElementById('inquiryType');
const formStatus = document.getElementById('formStatus');

// Clicking a contact option preselects the matching inquiry type and moves to the form.
document.querySelectorAll('[data-inquiry-type]').forEach((card) => {
  card.addEventListener('click', () => {
    if (inquiryType) inquiryType.value = card.dataset.inquiryType || '';
  });
});

if (contactForm) {
  contactForm.addEventListener('submit', (event) => {
    event.preventDefault();

    if (!contactForm.reportValidity()) return;

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
