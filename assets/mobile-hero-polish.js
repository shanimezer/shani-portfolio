(() => {
  'use strict';
  const body = document.body;
  const hero = document.querySelector('.mobile-hero');
  const content = hero?.querySelector('.chapter-content');
  const swipe = content?.querySelector('.swipe-hint');
  if (!body || !hero || !content) return;

  const placeSimonPanel = () => {
    const panel = hero.querySelector('.simon-mobile-panel');
    if (!panel || panel.parentElement === content) return false;
    if (swipe) content.insertBefore(panel, swipe);
    else content.appendChild(panel);
    panel.classList.add('is-in-flow');
    return true;
  };

  if (!placeSimonPanel()) {
    const panelObserver = new MutationObserver(() => {
      if (placeSimonPanel()) panelObserver.disconnect();
    });
    panelObserver.observe(hero, { childList:true, subtree:true });
  }

  let wasSimonMode = body.classList.contains('simon-mode');
  let restoreTimer = null;

  const triggerRestore = () => {
    window.clearTimeout(restoreTimer);
    body.classList.remove('simon-restoring');
    void hero.offsetWidth;
    body.classList.add('simon-restoring');
    restoreTimer = window.setTimeout(() => body.classList.remove('simon-restoring'), 1100);
  };

  new MutationObserver(() => {
    const isSimonMode = body.classList.contains('simon-mode');
    const celebrating = body.classList.contains('simon-celebrating');
    if (wasSimonMode && !isSimonMode && celebrating) triggerRestore();
    wasSimonMode = isSimonMode;
  }).observe(body, { attributes:true, attributeFilter:['class'] });
})();
