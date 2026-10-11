/* Homepage shine-muscat comparison: accessible in-page enlargement. */
(() => {
  'use strict';

  const dialog = document.getElementById('tsHomeLightbox');
  const image = dialog?.querySelector('.ts-home-lightbox-image');
  const caption = dialog?.querySelector('.ts-home-lightbox-caption');
  const closeButton = dialog?.querySelector('.ts-home-lightbox-close');
  if (!dialog || !image || !caption || !closeButton) return;

  document.querySelectorAll('.ts-home-test-enlarge').forEach(button => {
    button.addEventListener('click', () => {
      const thumbnail = button.querySelector('img');
      if (!thumbnail) return;
      image.src = thumbnail.currentSrc || thumbnail.src;
      image.alt = thumbnail.alt;
      caption.textContent = thumbnail.alt;
      dialog.showModal();
      document.body.classList.add('ts-home-lightbox-open');
    });
  });

  closeButton.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => {
    if (event.target === dialog) dialog.close();
  });
  dialog.addEventListener('close', () => {
    document.body.classList.remove('ts-home-lightbox-open');
  });
})();
