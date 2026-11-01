(() => {
  'use strict';

  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.getElementById(menuButton?.getAttribute('aria-controls') || 'main-nav');
  const groups = [...document.querySelectorAll('.nav-group')];

  function closeGroups() {
    for (const group of groups) {
      group.classList.remove('is-open');
      group.querySelector('.nav-toggle')?.setAttribute('aria-expanded', 'false');
    }
  }

  function closeNavigation() {
    navigation?.classList.remove('is-open');
    menuButton?.setAttribute('aria-expanded', 'false');
    menuButton?.setAttribute('aria-label', 'Open navigation');
    closeGroups();
  }

  menuButton?.addEventListener('click', () => {
    const open = !navigation?.classList.contains('is-open');
    navigation?.classList.toggle('is-open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    if (!open) closeGroups();
  });

  for (const group of groups) {
    const toggle = group.querySelector('.nav-toggle');
    toggle?.addEventListener('click', () => {
      const open = !group.classList.contains('is-open');
      closeGroups();
      group.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  navigation?.addEventListener('click', event => {
    if (event.target.closest('a[href]')) closeNavigation();
  });

  document.addEventListener('click', event => {
    if (!event.target.closest('.site-header')) closeNavigation();
  });

  const desktop = window.matchMedia('(min-width: 1001px)');
  desktop.addEventListener('change', closeNavigation);

  // Image viewers remain grouped to their own gallery.
  const lightbox = document.querySelector('.lightbox');
  const lightboxImage = lightbox?.querySelector('.lightbox-image');
  const lightboxCaption = lightbox?.querySelector('.lightbox-caption');
  const lightboxCount = lightbox?.querySelector('.lightbox-count');
  const closeButton = lightbox?.querySelector('.lightbox-close');
  const previousButton = lightbox?.querySelector('.lightbox-prev');
  const nextButton = lightbox?.querySelector('.lightbox-next');
  let galleryItems = [];
  let currentImage = 0;
  let priorFocus = null;
  let priorOverflow = '';
  let backgroundState = [];

  function renderImage() {
    const item = galleryItems[currentImage];
    if (!item || !lightboxImage) return;
    const caption = item.dataset.caption || item.querySelector('img')?.alt || '';
    lightboxImage.src = item.dataset.lightboxSrc;
    lightboxImage.alt = caption || 'Dental care gallery image';
    if (lightboxCaption) lightboxCaption.textContent = caption;
    if (lightboxCount) lightboxCount.textContent = `${currentImage + 1} / ${galleryItems.length}`;
    const singleImage = galleryItems.length < 2;
    if (previousButton) previousButton.hidden = singleImage;
    if (nextButton) nextButton.hidden = singleImage;
  }

  function openViewer(item) {
    if (!lightbox || !lightboxImage) return;
    const gallery = item.closest('[data-gallery]');
    galleryItems = [...(gallery || document).querySelectorAll('[data-lightbox-src]')]
      .filter(button => button.dataset.lightboxSrc && !button.hidden);
    if (!galleryItems.length) return;
    currentImage = Math.max(0, galleryItems.indexOf(item));
    priorFocus = document.activeElement;
    priorOverflow = document.body.style.overflow;
    closeNavigation();
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    backgroundState = [...document.body.children]
      .filter(element => element !== lightbox)
      .map(element => [element, element.inert]);
    for (const [element] of backgroundState) element.inert = true;
    renderImage();
    closeButton?.focus({ preventScroll: true });
  }

  function closeViewer() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.style.overflow = priorOverflow;
    for (const [element, wasInert] of backgroundState) element.inert = wasInert;
    backgroundState = [];
    lightboxImage?.removeAttribute('src');
    if (priorFocus instanceof HTMLElement && document.contains(priorFocus)) {
      priorFocus.focus({ preventScroll: true });
    }
  }

  function moveImage(direction) {
    if (!galleryItems.length) return;
    currentImage = (currentImage + direction + galleryItems.length) % galleryItems.length;
    renderImage();
  }

  for (const item of document.querySelectorAll('[data-lightbox-src]')) {
    item.addEventListener('click', () => openViewer(item));
  }
  closeButton?.addEventListener('click', closeViewer);
  previousButton?.addEventListener('click', () => moveImage(-1));
  nextButton?.addEventListener('click', () => moveImage(1));
  lightbox?.addEventListener('click', event => {
    if (event.target === lightbox) closeViewer();
  });

  document.addEventListener('keydown', event => {
    if (lightbox && !lightbox.hidden) {
      if (event.key === 'Escape') { event.preventDefault(); closeViewer(); }
      else if (event.key === 'ArrowLeft') { event.preventDefault(); moveImage(-1); }
      else if (event.key === 'ArrowRight') { event.preventDefault(); moveImage(1); }
      else if (event.key === 'Tab') {
        const focusable = [...lightbox.querySelectorAll('button, a[href], [tabindex="0"]')]
          .filter(element => !element.hidden && !element.disabled && element.getClientRects().length);
        if (!focusable.length) { event.preventDefault(); return; }
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && (document.activeElement === first || !lightbox.contains(document.activeElement))) {
          event.preventDefault(); last.focus();
        } else if (!event.shiftKey && (document.activeElement === last || !lightbox.contains(document.activeElement))) {
          event.preventDefault(); first.focus();
        }
      }
      return;
    }
    if (event.key === 'Escape') {
      const wasOpen = navigation?.classList.contains('is-open');
      const expandedGroup = groups.find(group => group.classList.contains('is-open'));
      closeNavigation();
      if (wasOpen) menuButton?.focus();
      else expandedGroup?.querySelector('.nav-toggle')?.focus();
    }
  });

  // Preferences are stored locally; no analytics requests are made here.
  const cookieKey = '4s-dentistree-cookie-preference';
  const cookieBanner = document.querySelector('.cookie-banner');
  let cookiePreference = null;
  try { cookiePreference = localStorage.getItem(cookieKey); } catch (_) { /* Storage can be unavailable in private contexts. */ }
  if (cookieBanner) cookieBanner.hidden = ['essential', 'accept'].includes(cookiePreference);
  for (const button of document.querySelectorAll('[data-cookie]')) {
    button.addEventListener('click', () => {
      const preference = button.dataset.cookie;
      if (!['essential', 'accept'].includes(preference)) return;
      try { localStorage.setItem(cookieKey, preference); } catch (_) { /* The current visit still respects the selection. */ }
      if (cookieBanner) cookieBanner.hidden = true;
    });
  }
  document.querySelector('.cookie-settings')?.addEventListener('click', () => {
    if (!cookieBanner) return;
    cookieBanner.hidden = false;
    cookieBanner.querySelector('button')?.focus({ preventScroll: true });
  });

  const filterButtons = [...document.querySelectorAll('[data-blog-filter]')];
  const stories = [...document.querySelectorAll('.blog-card[data-blog-topic]')];
  function filterStories(filter) {
    if (!['all', 'orthodontics', 'dentistry'].includes(filter)) filter = 'all';
    for (const story of stories) story.hidden = filter !== 'all' && story.dataset.blogTopic !== filter;
    for (const button of filterButtons) {
      const active = button.dataset.blogFilter === filter;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    }
  }
  for (const button of filterButtons) {
    button.addEventListener('click', () => filterStories(button.dataset.blogFilter));
  }
  if (filterButtons.length) {
    const category = new URLSearchParams(window.location.search).get('blogcategory');
    filterStories(category && /mds|orthodont/i.test(category) ? 'orthodontics' : 'all');
  }
})();
