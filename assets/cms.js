(() => {
  const KEY = 'shani-portfolio-projects-v1';
  const clone = value => JSON.parse(JSON.stringify(value));
  window.PortfolioCMS = {
    defaults(){ return clone(window.PORTFOLIO_PROJECTS || []); },
    get(){
      try { const saved=localStorage.getItem(KEY); return saved ? JSON.parse(saved) : this.defaults(); }
      catch { return this.defaults(); }
    },
    save(projects){ localStorage.setItem(KEY, JSON.stringify(projects)); window.dispatchEvent(new CustomEvent('portfolio-projects-updated')); },
    reset(){ localStorage.removeItem(KEY); window.dispatchEvent(new CustomEvent('portfolio-projects-updated')); },
    bySlug(slug){ return this.get().find(p=>p.id===slug); },
    categories:{directing:'Directing',games:'Games',production:'Production',social:'Social Content',editing:'Editing',ai:'AI Creation'},
    normalizeCategory(value=''){
      const key=String(value).trim().toLowerCase();
      const aliases={
        'game':'games',
        'game dev':'games',
        'game development':'games',
        'ai creation':'ai',
        'ai creator':'ai',
        'social content':'social',
        'social media':'social'
      };
      return aliases[key] || key;
    },
    projectCategories(project){
      const raw=[];
      if(project.category) raw.push(project.category);
      if(Array.isArray(project.categories)) raw.push(...project.categories);
      return [...new Set(raw.map(value=>this.normalizeCategory(value)).filter(Boolean))];
    },
    escape(value=''){ const d=document.createElement('div'); d.textContent=String(value); return d.innerHTML; },
    projectUrl(project, prefix='../'){ return `${prefix}project/index.html?slug=${encodeURIComponent(project.id)}`; },
    renderGrid(container, options={}){
      if(!container) return;
      let list=this.get();
      if(options.category){
        const wanted=this.normalizeCategory(options.category);
        list=list.filter(project=>this.projectCategories(project).includes(wanted));
      }
      if(options.featured) list=list.filter(p=>p.featured);
      container.innerHTML=list.length ? list.map(p=>`<a class="card cms-card" data-cat="${this.escape(this.normalizeCategory(p.category))}" href="${this.projectUrl(p, options.prefix||'../')}"><div class="cms-cover" style="--project-accent:${this.escape(p.accent||'#b9bec8')};background-image:url('${this.escape(p.cover||'')}')"></div><div class="card-body"><div class="meta"><span>${this.escape(p.categoryLabel||this.categories[this.normalizeCategory(p.category)]||p.category)}</span><span>${this.escape(p.year||'')}</span></div><h3>${this.escape(p.title)}</h3><p class="muted">${this.escape(p.summary||'')}</p></div></a>`).join('') : `<div class="empty-state"><h3>No projects here yet.</h3><p>Add one from the Admin panel.</p></div>`;
    }
  };

  const grids=document.querySelectorAll('[data-project-grid]');
  grids.forEach(grid=>PortfolioCMS.renderGrid(grid,{category:grid.dataset.category||'',prefix:grid.dataset.prefix||'../'}));

  const detail=document.querySelector('[data-project-detail]');
  if(detail){
    const params=new URLSearchParams(location.search);
    const slug=detail.dataset.slug||params.get('slug');
    const p=PortfolioCMS.bySlug(slug);
    if(!p){ detail.innerHTML='<section class="page-hero"><div class="wrap"><div class="eyebrow">Project not found</div><h1>This project does not exist.</h1><a class="button" href="../work/index.html">Back to work</a></div></section>'; return; }
    document.title=`${p.title} | Shani Mezer`;
    const gallery=(p.gallery||[]).filter(Boolean);
    detail.style.setProperty('--project-accent',p.accent||'#b9bec8');
    detail.innerHTML=`
      <section class="project-hero-dynamic"><div class="project-hero-image" style="background-image:url('${PortfolioCMS.escape(p.cover||'')}')"></div><div class="project-hero-shade"></div><div class="wrap project-hero-copy"><div class="eyebrow">${PortfolioCMS.escape(p.categoryLabel||PortfolioCMS.categories[PortfolioCMS.normalizeCategory(p.category)]||p.category)}</div><h1>${PortfolioCMS.escape(p.title)}</h1><p>${PortfolioCMS.escape(p.summary||'')}</p><div class="project-tags"><span>${PortfolioCMS.escape(p.year||'')}</span><span>${PortfolioCMS.escape(p.role||'')}</span></div></div></section>
      ${p.video?`<section class="section"><div class="wrap"><div class="video-frame"><iframe src="${PortfolioCMS.escape(p.video)}" title="${PortfolioCMS.escape(p.title)} video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div></div></section>`:''}
      <section class="section"><div class="wrap project-info-grid"><div><div class="eyebrow">The project</div><h2>Overview</h2><p>${PortfolioCMS.escape(p.summary||'')}</p></div><dl><div><dt>Role</dt><dd>${PortfolioCMS.escape(p.role||'')}</dd></div><div><dt>Tools</dt><dd>${PortfolioCMS.escape(p.tools||'')}</dd></div><div><dt>Client / Context</dt><dd>${PortfolioCMS.escape(p.client||'')}</dd></div><div><dt>Year</dt><dd>${PortfolioCMS.escape(p.year||'')}</dd></div></dl></div></section>
      <section class="section alt-section"><div class="wrap two-column-story"><div><div class="eyebrow">Challenge</div><h2>What needed solving</h2><p>${PortfolioCMS.escape(p.challenge||'Add the project challenge in Admin.')}</p></div><div><div class="eyebrow">Approach</div><h2>How I approached it</h2><p>${PortfolioCMS.escape(p.approach||'Add the creative approach in Admin.')}</p></div></div></section>
      ${gallery.length?`<section class="section"><div class="wrap"><div class="eyebrow">Gallery</div><div class="project-gallery">${gallery.map((img,i)=>`<img src="${PortfolioCMS.escape(img)}" alt="${PortfolioCMS.escape(p.title)} gallery image ${i+1}" loading="lazy">`).join('')}</div></div></section>`:''}
      <section class="section next-project"><div class="wrap"><a href="../work/index.html">← View all projects</a></div></section>`;
  }
})();