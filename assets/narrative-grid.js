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
  const projects = window.PortfolioCMS.sortNewestFirst(
    window.PORTFOLIO_PROJECTS.filter(project => project.status !== 'draft' && window.PortfolioCMS.isPublicProject(project) && explicitNarrative(project))
  );
  grid.innerHTML = projects.length ? projects.map(project => `
    <a class="card cms-card narrative-card" href="${window.PortfolioCMS.projectUrl(project, prefix, 'narrative')}">
      ${window.PortfolioCMS.projectThumbnailMarkup(project)}
      <div class="card-body"><div class="meta"><span>Narrative Design</span><span>${escape(project.year || '')}</span></div><h3>${escape(project.title || '')}</h3><p class="muted">${escape(project.summary || '')}</p><div class="case-study-cta"><span>Explore Project</span><b>↗</b></div></div>
    </a>`).join('') : '<div class="empty-state"><h3>No narrative projects yet.</h3><p>Tag a project with Narrative Design in the Admin panel.</p></div>';
})();