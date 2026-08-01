(() => {
  const detail = document.querySelector('[data-project-detail]');
  if (!detail || !window.PORTFOLIO_PROJECTS) return;

  const slug = new URLSearchParams(location.search).get('slug');
  const project = window.PORTFOLIO_PROJECTS.find(item => item.id === slug);
  if (!project) return;

  const blocks = (project.blocks || []).filter(block => block.visible !== false);
  const sections = [...detail.querySelectorAll('.project-block')];
  if (!sections.length) return;

  const labels = {
    directing: 'Directing',
    gameDesign: 'Game Design',
    cinematics: 'Cinematics',
    production: 'Production',
    motionCapture: 'Motion Capture',
    editing: 'Editing',
    ai: 'AI',
    social: 'Social Content'
  };

  const aliases = {
    director: 'directing', directing: 'directing', direction: 'directing',
    game: 'gameDesign', gameplay: 'gameDesign', 'game design': 'gameDesign', developer: 'gameDesign', programming: 'gameDesign',
    cinematic: 'cinematics', cinematics: 'cinematics', staging: 'cinematics', storyboard: 'cinematics',
    producer: 'production', production: 'production', pipeline: 'production',
    mocap: 'motionCapture', 'motion capture': 'motionCapture', 'performance capture': 'motionCapture',
    editor: 'editing', editing: 'editing', post: 'editing',
    ai: 'ai', artificial: 'ai', generative: 'ai',
    social: 'social', content: 'social', campaign: 'social'
  };

  const slugify = value => String(value || 'section')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const menuTitle = block => String(
    block.navTitle || block.navigationTitle || block.menuTitle || block.tocTitle || block.title || labels[block.type] || 'Section'
  ).trim();

  const inferDisciplines = block => {
    const explicit = Array.isArray(block.disciplines) ? block.disciplines.filter(Boolean) : [];
    if (explicit.length) return [...new Set(explicit)];

    const source = `${block.role || ''} ${block.title || ''} ${block.kicker || ''}`.toLowerCase();
    const inferred = [];
    Object.entries(aliases).forEach(([term, value]) => {
      if (source.includes(term)) inferred.push(value);
    });
    return [...new Set(inferred)];
  };

  const models = sections.map((section, index) => {
    const block = blocks[index] || {};
    const disciplines = inferDisciplines(block);
    section.id = `section-${slugify(menuTitle(block))}-${index + 1}`;
    section.dataset.disciplines = disciplines.join(' ');
    section.dataset.alwaysVisible = block.alwaysVisible ? 'true' : 'false';
    return { block, section, disciplines, title: menuTitle(block) };
  });

  const tocItems = models.filter(item => item.block.showInToc !== false);
  const disciplines = [...new Set(models.flatMap(item => item.disciplines))].filter(Boolean);
  if (tocItems.length < 2 && disciplines.length < 1) return;

  const escapeHtml = value => {
    const node = document.createElement('div');
    node.textContent = String(value || '');
    return node.innerHTML;
  };

  const tocLinks = tocItems.map(({ title, section }) =>
    `<a href="#${section.id}" data-toc-link="${section.id}">${escapeHtml(title)}</a>`
  ).join('');

  const filters = disciplines.length
    ? `<div class="project-filters"><span>View by discipline</span><div class="project-filter-row"><button class="active" data-filter="all">All</button>${disciplines.map(value => `<button data-filter="${value}">${escapeHtml(labels[value] || value)}</button>`).join('')}</div></div>`
    : '';

  const shell = document.createElement('section');
  shell.className = `project-navigation${disciplines.length ? ' has-filters' : ' toc-only'}`;
  shell.innerHTML = `
    <div class="wrap project-navigation-inner">
      <aside class="project-toc">
        <strong>Explore this project</strong>
        <nav>${tocLinks}</nav>
      </aside>
      <details class="project-toc-mobile">
        <summary>Explore this project <span>⌄</span></summary>
        <nav>${tocLinks}</nav>
      </details>
      ${filters}
    </div>`;

  detail.querySelector('.project-hero-dynamic')?.insertAdjacentElement('afterend', shell);

  const refreshTocVisibility = () => {
    shell.querySelectorAll('[data-toc-link]').forEach(link => {
      const target = document.getElementById(link.dataset.tocLink);
      link.hidden = !target || target.hidden;
    });
  };

  shell.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      document.getElementById(link.getAttribute('href').slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      shell.querySelector('details')?.removeAttribute('open');
    });
  });

  shell.querySelectorAll('[data-filter]').forEach(button => {
    button.addEventListener('click', () => {
      shell.querySelectorAll('[data-filter]').forEach(item => item.classList.toggle('active', item === button));
      const filter = button.dataset.filter;
      models.forEach(({ section, disciplines: itemDisciplines }) => {
        const match = filter === 'all' || section.dataset.alwaysVisible === 'true' || itemDisciplines.includes(filter);
        section.hidden = !match;
      });
      refreshTocVisibility();
    });
  });

  refreshTocVisibility();

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      const visible = entries
        .filter(entry => entry.isIntersecting && !entry.target.hidden)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;
      shell.querySelectorAll('[data-toc-link]').forEach(link => {
        link.classList.toggle('active', link.dataset.tocLink === visible.target.id);
      });
    }, { rootMargin: '-25% 0px -60% 0px', threshold: [0, .1, .35] });
    sections.forEach(section => observer.observe(section));
  }
})();