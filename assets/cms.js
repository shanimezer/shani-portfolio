(() => {
  const clone = value => JSON.parse(JSON.stringify(value));
  const escape = (value = '') => { const node = document.createElement('div'); node.textContent = String(value); return node.innerHTML; };
  const categories = { directing:'Directing', games:'Games', narrative:'Narrative Design', production:'Production', social:'Social Content', editing:'Editing', ai:'AI Creation' };
  const blockTypes = { overview:'Overview', roles:'Roles', story:'Story Step', image:'Large Image', split:'Two Images', video:'Video', comparison:'Before / After', gallery:'Gallery', timeline:'Timeline', quote:'Quote', results:'Results', credits:'Credits', gameLinks:'Play the Game' };

  const normalizeCategory = (value = '') => {
    const key = String(value).trim().toLowerCase();
    const aliases = { game:'games', 'game dev':'games', 'game development':'games', 'narrative design':'narrative', narrativeDesign:'narrative', 'ai creation':'ai', 'ai design':'ai', 'ai creator':'ai', 'social content':'social', 'social media':'social' };
    return aliases[key] || key;
  };
  const projectCategories = project => {
    const raw = [];
    if (project.category) raw.push(project.category);
    if (Array.isArray(project.categories)) raw.push(...project.categories);
    return [...new Set(raw.map(normalizeCategory).filter(Boolean))];
  };
  const toEmbedUrl = value => {
    if (!value) return '';
    try {
      const url = new URL(value, location.href);
      const host = url.hostname.replace(/^www\./, '');
      if (host === 'youtu.be') return `https://www.youtube.com/embed/${url.pathname.split('/').filter(Boolean)[0] || ''}`;
      if (host.includes('youtube.com')) {
        if (url.pathname.startsWith('/embed/')) return value;
        if (url.pathname.startsWith('/shorts/')) return `https://www.youtube.com/embed/${url.pathname.split('/')[2] || ''}`;
        const id = url.searchParams.get('v');
        if (id) return `https://www.youtube.com/embed/${id}`;
      }
      if (host.includes('vimeo.com')) {
        if (host === 'player.vimeo.com') return value;
        const id = url.pathname.split('/').filter(Boolean).pop();
        if (id) return `https://player.vimeo.com/video/${id}`;
      }
      if (host === 'instagram.com' || host.endsWith('.instagram.com')) {
        const parts = url.pathname.split('/').filter(Boolean);
        const kind = parts[0];
        const shortcode = parts[1] || '';
        if ((kind === 'p' || kind === 'reel' || kind === 'tv') && shortcode) return `https://www.instagram.com/${kind}/${shortcode}/embed/`;
      }
      if (host === 'tiktok.com' || host.endsWith('.tiktok.com')) {
        const match = url.pathname.match(/\/video\/(\d+)/);
        if (match?.[1]) return `https://www.tiktok.com/player/v1/${match[1]}?autoplay=0&loop=0`;
      }
      return value;
    } catch { return value; }
  };

  const socialPlatform = value => {
    try {
      const host = new URL(value, location.href).hostname.replace(/^www\./, '');
      if (host === 'instagram.com' || host.endsWith('.instagram.com')) return 'instagram';
      if (host === 'tiktok.com' || host.endsWith('.tiktok.com')) return 'tiktok';
    } catch {}
    return '';
  };

  const socialFallback = (item, platform) => {
    const label = platform === 'instagram' ? 'View on Instagram' : 'View on TikTok';
    const title = item.title || item.caption || (platform === 'instagram' ? 'Instagram post' : 'TikTok video');
    return `<div class="social-embed-fallback" data-social-fallback hidden><strong>${escape(title)}</strong><a href="${escape(item.url)}" target="_blank" rel="noopener noreferrer">${label} ↗</a></div>`;
  };

  const mediaFigure = item => {
    if (!item?.url) return '';
    const title = item.title ? `<strong>${escape(item.title)}</strong>` : '';
    const caption = item.caption ? `<span>${escape(item.caption)}</span>` : '';
    const figcaption = title || caption ? `<figcaption>${title}${caption}</figcaption>` : '';
    const social = socialPlatform(item.url);
    const isVideo = item.type === 'video' || /youtube|youtu\.be|vimeo|instagram|tiktok|\.mp4(?:$|\?)|\.webm(?:$|\?)/i.test(item.url);
    if (isVideo) {
      if (/\.mp4(?:$|\?)|\.webm(?:$|\?)/i.test(item.url)) return `<figure><div class="block-video"><video controls playsinline preload="metadata" src="${escape(item.url)}"></video></div>${figcaption}</figure>`;
      if (social) {
        const frameClass = social === 'tiktok' || /instagram\.com\/(?:reel|tv)\//i.test(item.url) ? ' social-embed-vertical' : ' social-embed-square';
        return `<figure class="social-media-figure ${social}"><div class="block-video social-embed${frameClass}"><iframe src="${escape(toEmbedUrl(item.url))}" title="${escape(item.title || (social === 'instagram' ? 'Instagram post' : 'TikTok video'))}" allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowfullscreen loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>${socialFallback(item, social)}</div>${figcaption}</figure>`;
      }
      return `<figure><div class="block-video"><iframe src="${escape(toEmbedUrl(item.url))}" title="${escape(item.title || 'Project video')}" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe></div>${figcaption}</figure>`;
    }
    return `<figure><img src="${escape(item.url)}" alt="${escape(item.title || item.caption || '')}" loading="lazy">${figcaption}</figure>`;
  };

  const renderItems = (block, timeline = false) => {
    const items = Array.isArray(block.items) ? block.items.filter(item => item.title || item.text) : [];
    if (!items.length) return '';
    return `<div class="${timeline ? 'block-timeline' : 'block-items'}">${items.map(item => `<article class="block-item">${item.title ? `<strong>${escape(item.title)}</strong>` : ''}${item.text ? `<p>${escape(item.text)}</p>` : ''}</article>`).join('')}</div>`;
  };

  const blockLinks = block => {
    const dedicated = Array.isArray(block.links) ? block.links.filter(link => link.url) : [];
    if (dedicated.length) return dedicated;
    if (block.type === 'gameLinks' && Array.isArray(block.items)) return block.items.filter(item => item.title && item.text).map((item, index) => ({ label:item.title, url:item.text, style:index === 0 ? 'primary' : 'secondary' }));
    return [];
  };

  const renderLinks = block => {
    const links = blockLinks(block);
    if (!links.length) return '';
    return `<div class="block-actions-links ${block.type === 'gameLinks' ? 'game-actions' : ''}">${links.map((link, index) => {
      const primary = link.style === 'primary' || (block.type === 'gameLinks' && index === 0);
      return `<a class="block-action-link${primary ? ' primary' : ''}" href="${escape(link.url)}" target="_blank" rel="noopener noreferrer"><span>${escape(link.label || 'Open link')}</span><b>↗</b></a>`;
    }).join('')}</div>`;
  };

  const renderMedia = block => {
    const media = Array.isArray(block.media) ? block.media.filter(item => item.url) : [];
    if (!media.length) return '';
    if (block.type === 'comparison') return `<div class="comparison-grid">${media.slice(0, 2).map((item, index) => `<div style="position:relative"><span class="comparison-label">${index === 0 ? 'Before' : 'After'}</span>${mediaFigure(item)}</div>`).join('')}</div>`;
    const layoutClass = block.layout === 'masonry' ? 'masonry' : block.layout === 'carousel' ? 'carousel' : (block.type === 'split' || block.layout === 'grid' || media.length === 2) ? 'grid' : '';
    return `<div class="block-media ${layoutClass}">${media.map(mediaFigure).join('')}</div>`;
  };

  const renderBlock = (block, project, children = []) => {
    if (!block || block.visible === false) return '';
    const type = block.type || 'story';
    const secondary = block.level === 'secondary';
    const title = block.title || blockTypes[type] || '';
    const kicker = block.kicker || blockTypes[type] || '';
    const accent = block.accent || project.accent || '#b9bec8';
    const roleTags = type === 'roles' ? (Array.isArray(block.items) && block.items.length ? block.items.map(item => `<span>${escape(item.title || item.text)}</span>`).join('') : (project.roles || []).map(role => `<span>${escape(role)}</span>`).join('')) : '';
    const quote = block.quote ? `<blockquote class="block-quote">“${escape(block.quote)}”${block.author ? `<footer>${escape(block.author)}</footer>` : ''}</blockquote>` : '';
    const ordinaryItems = type === 'gameLinks' ? '' : renderItems(block, type === 'timeline');
    const content = `${block.body ? `<div class="project-block-copy">${escape(block.body)}</div>` : ''}${type === 'roles' && roleTags ? `<div class="roles-cloud">${roleTags}</div>` : ''}${renderLinks(block)}${quote}${renderMedia(block)}${ordinaryItems}${block.takeaway ? `<aside class="block-takeaway"><span class="eyebrow">Key takeaway</span><p>${escape(block.takeaway)}</p></aside>` : ''}`;
    const childMarkup = children.length ? `<div class="project-sub-blocks">${children.map(child => renderBlock(child, project)).join('')}</div>` : '';
    return `<section class="project-block${secondary ? ' project-sub-block' : ''}" data-block-id="${escape(block.id || '')}" data-parent-id="${escape(block.parentId || '')}" data-level="${secondary ? 'secondary' : 'primary'}" data-type="${escape(type)}" data-layout="${escape(block.layout || 'wide')}" style="--block-accent:${escape(accent)}"><div class="project-block-inner"><header class="project-block-header">${kicker ? `<div class="eyebrow">${escape(kicker)}</div>` : ''}${title ? `<h2>${escape(title)}</h2>` : ''}</header><div class="project-block-content">${content}</div>${childMarkup}</div></section>`;
  };

  const renderBlockTree = (blocks, project) => {
    const visible = blocks.filter(block => block.visible !== false);
    const primaryIds = new Set(visible.filter(block => block.level !== 'secondary').map(block => block.id));
    const mains = visible.filter(block => block.level !== 'secondary' || !block.parentId || !primaryIds.has(block.parentId));
    return mains.map(main => {
      const children = visible.filter(block => block.level === 'secondary' && block.parentId === main.id);
      const normalizedMain = main.level === 'secondary' ? {...main, level:'primary', parentId:''} : main;
      return renderBlock(normalizedMain, project, children);
    }).join('');
  };

  window.PortfolioCMS = {
    categories, blockTypes, escape, normalizeCategory, projectCategories, toEmbedUrl,
    defaults() { return clone(window.PORTFOLIO_PROJECTS || []); },
    get() { return this.defaults(); },
    bySlug(slug) { return this.get().find(project => project.id === slug); },
    projectUrl(project, prefix = '../', view = '') {
      const params = new URLSearchParams({ slug: project.id });
      if (view) params.set('view', normalizeCategory(view));
      return `${prefix}project/index.html?${params.toString()}`;
    },
    renderGrid(container, options = {}) {
      if (!container) return;
      let list = this.get();
      if (options.category) { const wanted = normalizeCategory(options.category); list = list.filter(project => projectCategories(project).includes(wanted)); }
      if (options.featured) list = list.filter(project => project.featured);
      container.innerHTML = list.length ? list.map(project => `<a class="card cms-card" data-cat="${escape(normalizeCategory(project.category))}" href="${this.projectUrl(project, options.prefix || '../', options.category || '')}"><div class="cms-cover" style="--project-accent:${escape(project.accent || '#b9bec8')};background-image:url('${escape(project.cover || '')}')"></div><div class="card-body"><div class="meta"><span>${escape(project.categoryLabel || categories[normalizeCategory(project.category)] || project.category)}</span><span>${escape(project.year || '')}</span></div><h3>${escape(project.title)}</h3><p class="muted">${escape(project.summary || '')}</p></div></a>`).join('') : `<div class="empty-state"><h3>No projects here yet.</h3><p>Add one from the Admin panel.</p></div>`;
    }
  };

  const socialStyle = document.createElement('style');
  socialStyle.textContent = `
    .social-media-figure{width:100%}
    .social-embed{position:relative;width:100%;overflow:hidden;border:1px solid rgba(255,255,255,.1);border-radius:14px;background:#111318}
    .social-embed iframe{display:block;width:100%;height:100%;border:0;background:#111318}
    .social-embed-vertical{aspect-ratio:9/16;max-width:430px;margin-inline:auto}
    .social-embed-square{aspect-ratio:1/1;max-width:540px;margin-inline:auto}
    .social-embed-fallback{position:absolute;inset:0;display:grid;place-content:center;gap:12px;padding:24px;text-align:center;background:#111318;color:#f1efe9}
    .social-embed-fallback[hidden]{display:none!important}
    .social-embed-fallback a{display:inline-flex;justify-self:center;padding:10px 14px;border:1px solid rgba(255,255,255,.16);border-radius:10px;color:inherit;text-decoration:none}
    @media(max-width:700px){.social-embed-vertical{max-width:100%}.social-embed-square{max-width:100%}}
  `;
  document.head.appendChild(socialStyle);

  document.querySelectorAll('[data-project-grid]').forEach(grid => PortfolioCMS.renderGrid(grid, { category:grid.dataset.category || '', prefix:grid.dataset.prefix || '../' }));
  const detail = document.querySelector('[data-project-detail]');
  if (!detail) return;
  const params = new URLSearchParams(location.search);
  const project = PortfolioCMS.bySlug(detail.dataset.slug || params.get('slug'));
  if (!project) { detail.innerHTML = '<section class="page-hero"><div class="wrap"><div class="eyebrow">Project not found</div><h1>This project does not exist.</h1><a class="button" href="../work/index.html">Back to work</a></div></section>'; return; }
  document.title = `${project.title} | Shani Mezer`;
  detail.style.setProperty('--project-accent', project.accent || '#b9bec8');
  const blocks = Array.isArray(project.blocks) ? project.blocks : [];
  const heroVideo = project.video ? `<section class="section project-hero-video"><div class="wrap"><div class="video-frame"><iframe src="${escape(toEmbedUrl(project.video))}" title="${escape(project.title)} video" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe></div></div></section>` : '';
  detail.innerHTML = `<section class="project-hero-dynamic"><div class="project-hero-image" style="background-image:url('${escape(project.cover || '')}')"></div><div class="project-hero-shade"></div><div class="wrap project-hero-copy"><div class="eyebrow">${escape(project.categoryLabel || categories[normalizeCategory(project.category)] || project.category)}</div><h1>${escape(project.title)}</h1><p>${escape(project.summary || '')}</p><div class="project-tags"><span>${escape(project.year || '')}</span><span>${escape(project.role || (project.roles || []).join(' · '))}</span></div></div></section>${heroVideo}${renderBlockTree(blocks, project)}<section class="section next-project"><div class="wrap"><a href="../work/index.html">← View all projects</a></div></section>`;
})();