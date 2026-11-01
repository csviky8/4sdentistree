(() => {
  'use strict';
  document.querySelectorAll('.lightbox,.cookie-banner,.floating-whatsapp').forEach(node => document.body.appendChild(node));
  document.querySelectorAll('.nav .nav-link').forEach(link => {
    const target = new URL(link.href);
    const keys = ['page_id', 'p'];
    const current = target.pathname.replace(/\/index\.html$/,'/').replace(/\.html$/,'/') === location.pathname.replace(/\/index\.html$/,'/').replace(/\.html$/,'/') && keys.every(key => target.searchParams.get(key) === new URL(location.href).searchParams.get(key));
    if (current) link.setAttribute('aria-current', 'page'); else link.removeAttribute('aria-current');
  });
  // Capture phase runs before the original gallery viewer opens the image.
  document.addEventListener('click', event => {
    const item = event.target.closest('[data-lightbox-src]');
    if (!item) return;
    const image = item.querySelector('img');
    if (image) {
      // Preserve high resolution originals until an editor replaces the thumbnail.
      const old = item.dataset.lightboxSrc;
      const basename = value => new URL(value, location.href).pathname.split('/').pop().replace(/\.[^.]+$/, '');
      if (basename(old) !== basename(image.src)) item.dataset.lightboxSrc = image.src;
      const caption = item.querySelector('.gallery-caption')?.textContent.trim();
      if (caption) item.dataset.caption = caption;
    }
  }, true);
})();
