(() => {
  'use strict';

  const params = new URLSearchParams(window.location.search);
  if (params.get('slug') !== 'divine-chaos') return;

  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';

  let lastStableY = Math.max(0, window.scrollY || 0);
  let userIntentUntil = 0;
  let restoring = false;

  const markUserIntent = () => {
    userIntentUntil = performance.now() + 1800;
  };

  const hasUserIntent = () => performance.now() < userIntentUntil;

  ['wheel','touchmove'].forEach(type => {
    window.addEventListener(type, markUserIntent, { passive:true, capture:true });
  });

  window.addEventListener('keydown', event => {
    if (['ArrowDown','ArrowUp','PageDown','PageUp','Home','End',' '].includes(event.key)) markUserIntent();
  }, true);

  window.addEventListener('scroll', () => {
    if (restoring) return;

    if (hasUserIntent()) {
      lastStableY = Math.max(0, window.scrollY || 0);
      return;
    }

    const currentY = Math.max(0, window.scrollY || 0);
    if (Math.abs(currentY - lastStableY) < 3) return;

    restoring = true;
    window.scrollTo({ top:lastStableY, left:0, behavior:'auto' });
    requestAnimationFrame(() => { restoring = false; });
  }, { passive:true });

  const preservePosition = () => {
    if (hasUserIntent()) return;
    const expected = lastStableY;
    requestAnimationFrame(() => {
      if (hasUserIntent()) return;
      if (Math.abs((window.scrollY || 0) - expected) > 3) {
        restoring = true;
        window.scrollTo(0, expected);
        requestAnimationFrame(() => { restoring = false; });
      }
    });
  };

  const watchEmbeds = root => {
    root.querySelectorAll?.('iframe[src*="google.com"], iframe[src*="youtube.com"], iframe[src*="youtu.be"]').forEach(frame => {
      if (frame.dataset.scrollGuardReady === 'true') return;
      frame.dataset.scrollGuardReady = 'true';
      frame.addEventListener('load', preservePosition, { passive:true });
    });
  };

  const detail = document.querySelector('[data-project-detail]');
  if (detail) {
    watchEmbeds(detail);
    new MutationObserver(() => {
      watchEmbeds(detail);
      preservePosition();
    }).observe(detail, { childList:true, subtree:true });
  }

  window.addEventListener('pageshow', () => {
    if (!hasUserIntent()) {
      lastStableY = 0;
      window.scrollTo(0, 0);
    }
  }, { once:true });
})();
