(() => {
  'use strict';
  if (!document.body.classList.contains('home-page')) return;

  const clean = () => {
    // The homepage never contains info-page/contact/about hero structures.
    // Remove only those known foreign structures if browser history/cache restores them unexpectedly.
    document.querySelectorAll('body.home-page > .info-hero, body.home-page > .info-section, body.home-page > .info-footer, body.home-page > .contact-title, body.home-page > .contact-hero, body.home-page > .about-hero').forEach(node => node.remove());

    // Defensive cleanup for an accidentally restored standalone heading.
    [...document.body.children].forEach(node => {
      if (node.tagName !== 'H1') return;
      const text = (node.textContent || '').trim().toLowerCase();
      if (text === 'contact' || text === 'about') node.remove();
    });

    const bar = document.querySelector('.home-page .topbar');
    const brand = bar?.querySelector(':scope > .brand');
    const nav = bar?.querySelector(':scope > .desktop-nav');
    const actions = bar?.querySelector(':scope > .top-actions');
    if (bar && brand && nav && actions) {
      bar.classList.add('home-topbar-stable');
    }
  };

  clean();
  window.addEventListener('pageshow', clean);
})();