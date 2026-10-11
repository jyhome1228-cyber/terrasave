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
      'TerraSAVE 咨询',
      '',
      '咨询类型：' + type,
      '联系人：' + name,
      '公司名称：' + (company || '-'),
      '电子邮箱：' + email,
      '联系电话：' + (phone || '-'),
      '',
      '咨询内容',
      message
    ].join('\n');

    if (status) {
      status.textContent = '邮件程序打开后，请检查内容并发送。如无法打开，请直接发送邮件至 info@terracle.im。';
    }

    window.location.href = 'mailto:info@terracle.im?subject=' +
      encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
})();
