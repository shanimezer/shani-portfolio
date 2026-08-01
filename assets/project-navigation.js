(() => {
  const detail = document.querySelector('[data-project-detail]');
  if (!detail || !window.PORTFOLIO_PROJECTS) return;

  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  const project = window.PORTFOLIO_PROJECTS.find(item => item.id === slug);
  if (!project) return;

  const labels = {
    directing: 'Directing',
    games: 'Games',
    gameDesign: 'Game Design',
    cinematics: 'Cinematics',
    production: 'Production',
    motionCapture: 'Motion Capture',
    editing: 'Editing',
    ai: 'AI',
    social: 'Social Content'
  };
  const categoryToDiscipline = {
    games: 'gameDesign',
    directing: 'directing',
    production: 'production',
    editing: 'editing',
    ai: 'ai',
    social: 'social'
  };
  const slugify = value => String(value || 'section').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const inferDisciplines = block => {
    const explicit = Array.isArray(block.disciplines) ? block.disciplines.filter(Boolean) : [];
    if (explicit.length) return explicit;
    const source = `${block.role || ''} ${block.kicker || ''} ${block.title || ''}`.toLowerCase();
    const found = [];
    if (/game design|gameplay|level design|combat design/.test(source)) found.push('gameDesign');
    if (/cinematic|cinematography|visual direction|staging|camera/.test(source)) found.push('cinematics');
    if (/motion capture|mocap|performance capture/.test(source)) found.push('motionCapture');
    if (/produc|pipeline|schedule|management/.test(source)) found.push('production');
    if (/direct|narrative direction/.test(source)) found.push('directing');
    if (/edit|post-production|post production/.test(source)) found.push('editing');
    if (/\bai\b|artificial intelligence|prompt/.test(source)) found.push('ai');
    if (/social|campaign|content creation/.test(source)) found.push('social');
    return [...new Set(found)];
  };

  const blocks = (project.blocks || []).filter(block => block.visible !== false);
  const sections = [...detail.querySelectorAll('.project-block')];
  if (!sections.length) return;

  sections.forEach((section, index) => {
    const block = blocks[index] || {};
    section.id = `section-${slugify(block.navTitle || block.menuTitle || block.navigationTitle || block.title || block.type)}-${index + 1}`;
    section.dataset.disciplines = inferDisciplines(block).join(' ');
    section.dataset.alwaysVisible = block.alwaysVisible === true ? 'true' : 'false';
  });

  const tocItems = blocks.map((block, index) => ({ block, section: sections[index] })).filter(item => item.section && item.block.showInToc !== false);
  const disciplines = [...new Set(blocks.flatMap(inferDisciplines))].filter(Boolean);
  if (!tocItems.length && !disciplines.length) return;

  const hero = detail.querySelector('.project-hero-dynamic');
  const heroVideo = detail.querySelector('.project-hero-video');
  const nextProject = detail.querySelector('.next-project');
  const contentShell = document.createElement('section');
  contentShell.className = 'project-content-shell';
  const contentInner = document.createElement('div');
  contentInner.className = 'wrap project-content-layout';
  const sidebar = document.createElement('aside');
  sidebar.className = 'project-sidebar';
  const content = document.createElement('div');
  content.className = 'project-content-main';

  const tocLinks = tocItems.map(({ block, section }) => {
    const label = block.navTitle || block.menuTitle || block.navigationTitle || block.title || labels[block.type] || 'Section';
    return `<a href="#${section.id}" data-toc-link="${section.id}">${label}</a>`;
  }).join('');

  sidebar.innerHTML = `<div class="project-sidebar-sticky"><span class="project-nav-label">Explore this project</span><nav>${tocLinks}</nav></div>`;

  const filterButtons = disciplines.length
    ? `<div class="project-filter-bar"><span class="project-nav-label">View by discipline</span><div class="project-filter-options"><button data-filter="all">All</button>${disciplines.map(value => `<button data-filter="${value}">${labels[value] || value}</button>`).join('')}</div></div>`
    : '';

  const mobileControls = `<div class="project-mobile-controls"><details class="project-mobile-menu"><summary>Sections</summary><nav>${tocLinks}</nav></details>${disciplines.length ? `<details class="project-mobile-menu"><summary>Filter</summary><div class="project-mobile-filter-options"><button data-filter="all">All</button>${disciplines.map(value => `<button data-filter="${value}">${labels[value] || value}</button>`).join('')}</div></details>` : ''}</div>`;

  content.innerHTML = `${mobileControls}${filterButtons}`;
  sections.forEach(section => content.appendChild(section));
  if (nextProject) content.appendChild(nextProject);
  contentInner.append(sidebar, content);
  contentShell.appendChild(contentInner);
  (heroVideo || hero)?.insertAdjacentElement('afterend', contentShell);

  const allFilterButtons = [...contentShell.querySelectorAll('[data-filter]')];
  const applyFilter = filter => {
    allFilterButtons.forEach(button => button.classList.toggle('active', button.dataset.filter === filter));
    sections.forEach(section => {
      const matches = filter === 'all' || section.dataset.alwaysVisible === 'true' || section.dataset.disciplines.split(' ').includes(filter);
      section.hidden = !matches;
    });
    contentShell.querySelectorAll('[data-toc-link]').forEach(link => {
      const target = document.getElementById(link.dataset.tocLink);
      link.hidden = !!target?.hidden;
    });
    contentShell.querySelectorAll('details').forEach(item => item.removeAttribute('open'));
  };

  const requestedView = params.get('view');
  const contextualFilter = categoryToDiscipline[requestedView] || categoryToDiscipline[project.category] || 'all';
  const initialFilter = disciplines.includes(contextualFilter) ? contextualFilter : 'all';
  applyFilter(initialFilter);

  allFilterButtons.forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.filter)));
  contentShell.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', event => {
    event.preventDefault();
    document.getElementById(link.getAttribute('href').slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    contentShell.querySelectorAll('details').forEach(item => item.removeAttribute('open'));
  }));

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries.filter(entry => entry.isIntersecting && !entry.target.hidden).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      contentShell.querySelectorAll('[data-toc-link]').forEach(link => link.classList.toggle('active', link.dataset.tocLink === visible.target.id));
    }, { rootMargin: '-22% 0px -62% 0px', threshold: [0, .1, .35] });
    sections.forEach(section => observer.observe(section));
  }
})();