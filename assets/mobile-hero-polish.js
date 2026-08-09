(() => {
  'use strict';
  const body = document.body;
  const hero = document.querySelector('.mobile-hero');
  if (!body || !hero) return;

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
