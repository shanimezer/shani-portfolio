(() => {
  const detail = document.querySelector('[data-project-detail]');
  if (!detail || !window.PORTFOLIO_PROJECTS) return;

  const params = new URLSearchParams(location.search);
  const slug = params.get('slug');
  const project = window.PORTFOLIO_PROJECTS.find(item => item.id === slug);
  if (!project) return;

  const labels = {
    directing: 'Directing', games: 'Games', gameDesign: 'Game Design', narrativeDesign: 'Narrative Design', cinematics: 'Cinematics',
    production: 'Production', motionCapture: 'Motion Capture', editing: 'Editing', ai: 'AI', social: 'Social Content'
  };
  const categoryToDiscipline = { games:'gameDesign', directing:'directing', production:'production', editing:'editing', ai:'ai', social:'social' };
  const slugify = value => String(value || 'section').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  const inferDisciplines = block => {
    const explicit = Array.isArray(block.disciplines) ? block.disciplines.filter(Boolean) : [];
    if (explicit.length) return explicit;
    const source = `${block.role || ''} ${block.kicker || ''} ${block.title || ''}`.toLowerCase();
    const found = [];
    if (/game design|gameplay|level design|combat design/.test(source)) found.push('gameDesign');
    if (/narrative design|story design|branching narrative|dialogue design|quest design|script|screenplay|writing/.test(source)) found.push('narrativeDesign');
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
  const blockById = new Map(blocks.map(block => [block.id, block]));
  const sections = [...detail.querySelectorAll('.project-block')];
  if (!sections.length) return;
  const sectionByBlockId = new Map(sections.map(section => [section.dataset.blockId, section]));

  sections.forEach((section, index) => {
    const block = blockById.get(section.dataset.blockId) || {};
    section.id = `section-${slugify(block.navTitle || block.menuTitle || block.navigationTitle || block.title || block.type)}-${index + 1}`;
    section.dataset.disciplines = inferDisciplines(block).join(' ');
    section.dataset.alwaysVisible = block.alwaysVisible === true ? 'true' : 'false';
  });

  const tocItems = blocks.map(block => ({ block, section:sectionByBlockId.get(block.id) })).filter(item => item.section && item.block.showInToc !== false);
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
    const secondaryClass = block.level === 'secondary' ? ' class="is-sub-link"' : '';
    return `<a${secondaryClass} href="#${section.id}" data-toc-link="${section.id}">${label}</a>`;
  }).join('');

  sidebar.innerHTML = `<div class="project-sidebar-sticky"><span class="project-nav-label">Explore this project</span><nav>${tocLinks}</nav></div>`;
  const filterButtons = disciplines.length
    ? `<div class="project-filter-bar"><span class="project-nav-label">View by discipline</span><div class="project-filter-options"><button data-filter="all">All</button>${disciplines.map(value => `<button data-filter="${value}">${labels[value] || value}</button>`).join('')}</div></div>`
    : '';
  const mobileControls = `<div class="project-mobile-controls"><details class="project-mobile-menu"><summary>Sections</summary><nav>${tocLinks}</nav></details>${disciplines.length ? `<details class="project-mobile-menu"><summary>Filter</summary><div class="project-mobile-filter-options"><button data-filter="all">All</button>${disciplines.map(value => `<button data-filter="${value}">${labels[value] || value}</button>`).join('')}</div></details>` : ''}</div>`;

  content.innerHTML = `${mobileControls}${filterButtons}`;
  sections.filter(section => section.dataset.level !== 'secondary').forEach(section => content.appendChild(section));
  if (nextProject) content.appendChild(nextProject);
  contentInner.append(sidebar, content);
  contentShell.appendChild(contentInner);
  (heroVideo || hero)?.insertAdjacentElement('afterend', contentShell);

  const allFilterButtons = [...contentShell.querySelectorAll('[data-filter]')];
  const tocLinkElements = [...contentShell.querySelectorAll('[data-toc-link]')];
  const sidebarScroller = contentShell.querySelector('.project-sidebar-sticky');

  const keepActiveLinkVisible = link => {
    if (!link || !sidebarScroller) return;
    const linkTop = link.offsetTop;
    const linkBottom = linkTop + link.offsetHeight;
    const viewTop = sidebarScroller.scrollTop;
    const viewBottom = viewTop + sidebarScroller.clientHeight;
    const padding = 18;
    if (linkTop < viewTop + padding) sidebarScroller.scrollTo({ top:Math.max(0, linkTop - padding), behavior:'smooth' });
    else if (linkBottom > viewBottom - padding) sidebarScroller.scrollTo({ top:linkBottom - sidebarScroller.clientHeight + padding, behavior:'smooth' });
  };

  const setActiveSection = section => {
    if (!section) return;
    tocLinkElements.forEach(link => link.classList.toggle('active', link.dataset.tocLink === section.id));
    keepActiveLinkVisible(contentShell.querySelector(`.project-sidebar [data-toc-link="${section.id}"]`));
  };

  const updateActiveFromScroll = () => {
    const visibleSections = sections.filter(section => !section.hidden && !section.closest('.project-block[hidden]'));
    if (!visibleSections.length) return;
    const atBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 6;
    if (atBottom) return setActiveSection(visibleSections[visibleSections.length - 1]);
    const marker = Math.min(Math.max(window.innerHeight * 0.3, 150), 280);
    let active = visibleSections[0];
    for (const section of visibleSections) {
      if (section.getBoundingClientRect().top <= marker) active = section;
      else break;
    }
    setActiveSection(active);
  };

  let ticking = false;
  const requestActiveUpdate = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { updateActiveFromScroll(); ticking = false; });
  };

  const applyFilter = filter => {
    allFilterButtons.forEach(button => button.classList.toggle('active', button.dataset.filter === filter));
    const directMatch = section => filter === 'all' || section.dataset.alwaysVisible === 'true' || section.dataset.disciplines.split(' ').includes(filter);

    sections.filter(section => section.dataset.level === 'secondary').forEach(section => { section.hidden = !directMatch(section); });
    sections.filter(section => section.dataset.level !== 'secondary').forEach(section => {
      const matchingChild = [...section.querySelectorAll(':scope > .project-block-inner > .project-sub-blocks > .project-sub-block')].some(child => !child.hidden);
      section.hidden = !(directMatch(section) || matchingChild);
    });

    tocLinkElements.forEach(link => {
      const target = document.getElementById(link.dataset.tocLink);
      const hiddenByParent = !!target?.closest('.project-block[hidden]');
      const shouldHide = !target || target.hidden || hiddenByParent;
      link.hidden = shouldHide;
      link.setAttribute('aria-hidden', shouldHide ? 'true' : 'false');
      link.tabIndex = shouldHide ? -1 : 0;
    });
    contentShell.querySelectorAll('details').forEach(item => item.removeAttribute('open'));
    requestAnimationFrame(updateActiveFromScroll);
  };

  const requestedView = params.get('view');
  const contextualFilter = categoryToDiscipline[requestedView] || categoryToDiscipline[project.category] || 'all';
  applyFilter(disciplines.includes(contextualFilter) ? contextualFilter : 'all');

  allFilterButtons.forEach(button => button.addEventListener('click', () => applyFilter(button.dataset.filter)));
  tocLinkElements.forEach(link => link.addEventListener('click', event => {
    const target = document.getElementById(link.dataset.tocLink);
    if (!target || target.hidden || target.closest('.project-block[hidden]')) return event.preventDefault();
    event.preventDefault();
    target.scrollIntoView({ behavior:'smooth', block:'start' });
    setActiveSection(target);
    contentShell.querySelectorAll('details').forEach(item => item.removeAttribute('open'));
  }));

  window.addEventListener('scroll', requestActiveUpdate, { passive:true });
  window.addEventListener('resize', requestActiveUpdate);
  window.addEventListener('load', requestActiveUpdate);
  requestActiveUpdate();
})();