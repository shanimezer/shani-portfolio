(() => {
  'use strict';
  const body = document.body;
  const hero = document.querySelector('.mobile-hero');
  const content = hero?.querySelector('.chapter-content');
  const swipe = content?.querySelector('.swipe-hint');
  if (!body || !hero || !content) return;

  const normalizeSimonPanel = panel => {
    if (!panel) return false;
    if (panel.parentElement !== content) {
      if (swipe) content.insertBefore(panel, swipe);
      else content.appendChild(panel);
    }
    panel.classList.add('is-in-flow');
    panel.style.setProperty('position', 'relative', 'important');
    panel.style.setProperty('left', 'auto', 'important');
    panel.style.setProperty('right', 'auto', 'important');
    panel.style.setProperty('bottom', 'auto', 'important');
    panel.style.setProperty('top', 'auto', 'important');
    panel.style.setProperty('width', 'min(100%, 520px)', 'important');
    panel.style.setProperty('max-width', '520px', 'important');
    panel.style.setProperty('margin-left', 'auto', 'important');
    panel.style.setProperty('margin-right', 'auto', 'important');
    panel.style.setProperty('margin-top', '0', 'important');
    panel.style.setProperty('margin-bottom', '16px', 'important');
    panel.style.setProperty('transform', 'none', 'important');
    panel.style.setProperty('translate', 'none', 'important');
    panel.style.setProperty('align-self', 'center', 'important');
    return true;
  };

  const placeSimonPanel = () => normalizeSimonPanel(hero.querySelector('.simon-mobile-panel'));

  if (!placeSimonPanel()) {
    const panelObserver = new MutationObserver(() => {
      if (placeSimonPanel()) panelObserver.disconnect();
    });
    panelObserver.observe(hero, { childList:true, subtree:true });
  }

  // Re-apply once all injected Simon styles are definitely in the document.
  requestAnimationFrame(() => requestAnimationFrame(placeSimonPanel));
  window.addEventListener('resize', placeSimonPanel, { passive:true });

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
    placeSimonPanel();
    if (wasSimonMode && !isSimonMode && celebrating) triggerRestore();
    wasSimonMode = isSimonMode;
  }).observe(body, { attributes:true, attributeFilter:['class'] });
})();