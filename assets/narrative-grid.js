(() => {
  'use strict';
  const grid = document.querySelector('[data-narrative-project-grid]');
  if (!grid || !window.PORTFOLIO_PROJECTS || !window.PortfolioCMS) return;
  const prefix = grid.dataset.prefix || '../';
  const escape = window.PortfolioCMS.escape;
  const explicitNarrative = project => {
    const categories = [project.category, ...(Array.isArray(project.categories) ? project.categories : [])]
      .map(value => String(value || '').trim().toLowerCase());
    return categories.includes('narrative') || categories.includes('narrative design');
  };
  const narrativeFromBlocks = project => (project.blocks || []).some(block => {
    if (block.visible === false) return false;
    if ((block.disciplines || []).includes('narrativeDesign')) return true;
    const source = `${block.role || ''} ${block.kicker || ''} ${block.title || ''}`.toLowerCase();
    return /narrative design|story design|screenplay|script|writing|worldbuilding|character development|dialogue/.test(source);
  });
  const projects = window.PORTFOLIO_PROJECTS.filter(project => project.status !== 'draft' && (explicitNarrative(project) || narrativeFromBlocks(project)));
  grid.innerHTML = projects.length ? projects.map(project => `
    <a class="card cms-card narrative-card" href="${window.PortfolioCMS.projectUrl(project, prefix, 'narrative')}">
      <div class="cms-cover" style="--project-accent:${escape(project.accent || '#ff70bc')};background-image:url('${escape(project.cover || '')}')"></div>
      <div class="card-body"><div class="meta"><span>Narrative Design</span><span>${escape(project.year || '')}</span></div><h3>${escape(project.title || '')}</h3><p class="muted">${escape(project.summary || '')}</p></div>
    </a>`).join('') : '<div class="empty-state"><h3>No narrative projects yet.</h3><p>Tag a project with Narrative Design in the Admin panel.</p></div>';
})();