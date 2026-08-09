(() => {
  'use strict';
  if (!document.querySelector('[data-project-detail]')) return;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  const atExplicitAnchor = () => Boolean(location.hash && document.getElementById(location.hash.slice(1)));
  const resetTop = () => {
    if (atExplicitAnchor()) return;
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  };

  // Reset both before and after the dynamic project content is assembled.
  resetTop();
  requestAnimationFrame(() => requestAnimationFrame(resetTop));
  window.addEventListener('pageshow', event => {
    if (!event.persisted) resetTop();
  }, { once: true });

  // Dynamic embeds can change their intrinsic size after load. Disable browser
  // scroll anchoring so those layout shifts do not pull the viewport down.
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
