(() => {
  'use strict';
  if (!document.querySelector('[data-project-detail]')) return;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  // Start a freshly opened project at the top, but do not perform any delayed
  // scroll correction after the CMS or embedded media begin rendering.
  if (!location.hash) {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }

  const style = document.createElement('style');
  style.textContent = `
    html.project-page-scroll-stable,html.project-page-scroll-stable body,
    html.project-page-scroll-stable [data-project-detail],
    html.project-page-scroll-stable .project-content-shell,
    html.project-page-scroll-stable .project-block,
    html.project-page-scroll-stable .smart-media-frame{overflow-anchor:none!important}
  `;
  document.head.appendChild(style);
  document.documentElement.classList.add('project-page-scroll-stable');
})();
