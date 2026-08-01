(() => {
  const KEY = 'shani-portfolio-projects-v2';
  const OLD_KEY = 'shani-portfolio-projects-v1';
  const clone = value => JSON.parse(JSON.stringify(value));
  const makeId = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

  const normalizeBlock = block => ({
    id: block.id || makeId('block'),
    type: block.type || 'story',
    visible: block.visible !== false,
    kicker: block.kicker || '', title: block.title || '', body: block.body || '', layout: block.layout || 'wide', accent: block.accent || '', role: block.role || '',
    navTitle: block.navTitle || '',
    showInToc: block.showInToc !== false,
    alwaysVisible: block.alwaysVisible === true,
    disciplines: Array.isArray(block.disciplines) ? block.disciplines : [],
    links: Array.isArray(block.links) ? block.links.map(link => ({ id: link.id || makeId('link'), label: link.label || link.title || '', url: link.url || link.href || '', style: link.style || 'secondary' })) : [],
    media: Array.isArray(block.media) ? block.media.map(item => ({ id: item.id || makeId('media'), url: item.url || '', type: item.type || 'image', title: item.title || '', caption: item.caption || '' })) : [],
    items: Array.isArray(block.items) ? block.items.map(item => ({ id: item.id || makeId('item'), title: item.title || '', text: item.text || '' })) : [],
    quote: block.quote || '', author: block.author || '', takeaway: block.takeaway || ''
  });

  const migrateProject = project => {
    const p = clone(project || {});
    if (!Array.isArray(p.roles)) p.roles = (p.role || '').split(',').map(x => x.trim()).filter(Boolean);
    if (!Array.isArray(p.categories)) p.categories = p.category ? [p.category] : [];
    if (!p.status) p.status = 'draft';
    if (!Array.isArray(p.blocks) || !p.blocks.length) {
      const gallery = Array.isArray(p.gallery) ? p.gallery : [];
      p.blocks = [
        normalizeBlock({ type:'overview', kicker:'The project', title:'Overview', body:p.summary || '', alwaysVisible:true }),
        ...(p.challenge || p.approach ? [normalizeBlock({ type:'story', kicker:'Process', title:'Challenge & approach', body:[p.challenge,p.approach].filter(Boolean).join('\n\n') })] : []),
        ...(gallery.length ? [normalizeBlock({ type:'gallery', kicker:'Selected work', title:'Project gallery', media:gallery.map(url => ({url,type:'image'})) })] : []),
        normalizeBlock({ type:'credits', kicker:'Project details', title:'Credits', alwaysVisible:true, items:[{title:'Role',text:p.role||''},{title:'Tools',text:p.tools||''},{title:'Client / Context',text:p.client||''}].filter(item=>item.text) })
      ];
    } else p.blocks = p.blocks.map(normalizeBlock);
    return p;
  };

  window.PortfolioCMS = {
    version:3,
    blockTypes:{overview:'Overview',roles:'Roles',story:'Story Step',image:'Large Image',split:'Two Images',video:'Video',comparison:'Before / After',gallery:'Gallery',timeline:'Timeline',quote:'Quote',results:'Results',credits:'Credits',gameLinks:'Game Links / Play Buttons'},
    layouts:{wide:'Wide',contained:'Contained','text-left':'Text left','text-right':'Text right',grid:'Grid',carousel:'Carousel',masonry:'Masonry'},
    categories:{directing:'Directing',games:'Games',production:'Production',social:'Social Content',editing:'Editing',ai:'AI Creation'},
    disciplines:{directing:'Directing',gameDesign:'Game Design',cinematics:'Cinematics',production:'Production',motionCapture:'Motion Capture',editing:'Editing',ai:'AI',social:'Social Content'},
    makeId,normalizeBlock,migrateProject,
    defaults(){return clone(window.PORTFOLIO_PROJECTS||[]).map(migrateProject);},
    get(){try{const saved=localStorage.getItem(KEY);if(saved)return JSON.parse(saved).map(migrateProject);const old=localStorage.getItem(OLD_KEY);if(old){const migrated=JSON.parse(old).map(migrateProject);this.save(migrated);return migrated;}return this.defaults();}catch{return this.defaults();}},
    save(projects){localStorage.setItem(KEY,JSON.stringify(projects));window.dispatchEvent(new CustomEvent('portfolio-projects-updated'));},
    reset(){localStorage.removeItem(KEY);localStorage.removeItem(OLD_KEY);},
    escape(value=''){const d=document.createElement('div');d.textContent=String(value);return d.innerHTML;},
    toProjectsJs(projects){return `window.PORTFOLIO_PROJECTS = ${JSON.stringify(projects,null,2)};\n`;}
  };
})();