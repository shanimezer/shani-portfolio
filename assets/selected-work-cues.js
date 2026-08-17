(() => {
  'use strict';
  const add = () => document.querySelectorAll('.cms-card').forEach(card => {
    const body = card.querySelector('.card-body');
    if (!body || body.querySelector('.case-study-cta')) return;
    const cue = document.createElement('div');
    cue.className = 'case-study-cta';
    cue.innerHTML = '<span>Explore Project</span><b>↗</b>';
    body.appendChild(cue);
    card.setAttribute('aria-label', `${card.querySelector('h3')?.textContent || 'Project'} · Explore project`);
  });
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add, { once:true });
  else requestAnimationFrame(add);
})();