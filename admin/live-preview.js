(() => {
  const cms = window.PortfolioCMS;
  const canvas = document.querySelector('#previewCanvas');
  if (!cms || !canvas) return;

  const style = document.createElement('style');
  style.textContent = `
    #previewCanvas .preview-sub-blocks{display:grid;gap:18px;margin-top:30px;padding-left:24px;border-left:1px solid var(--line)}
    #previewCanvas .preview-section.is-sub-block{margin:0;padding:24px 0 8px;border:0;background:transparent}
    #previewCanvas .preview-section.is-sub-block+.preview-section.is-sub-block{border-top:1px solid var(--line)}
    #previewCanvas .preview-section.is-sub-block h2{font-size:clamp(1.45rem,3vw,2.25rem);margin:8px 0 14px}
    #previewCanvas .preview-section.is-sub-block>p{font-size:.98rem;line-height:1.7;color:var(--muted)}
    @media(max-width:700px){#previewCanvas .preview-sub-blocks{padding-left:15px}}
  `;
  document.head.appendChild(style);

  const activeId = () => document.querySelector('.project-item.active')?.dataset.id || '';
  const getProject = () => cms.get().find(project => project.id === activeId());

  const renderLinks = block => {
    const links = (block.links || []).filter(link => link.url);
    if (!links.length) return '';
    return `<div class="preview-links">${links.map((link, index) => `<a href="${cms.escape(link.url)}" target="_blank" rel="noopener" class="${link.style === 'primary' || (block.type === 'gameLinks' && index === 0) ? 'primary' : 'ghost'}">${cms.escape(link.label || 'Open link')} ↗</a>`).join('')}</div>`;
  };

  const renderMedia = block => {
    const media = (block.media || []).filter(item => item.url);
    if (!media.length) return '';
    return `<div class="preview-media">${media.map(item => item.type === 'video'
      ? `<figure><div style="aspect-ratio:16/9;background:#1a1d22;border-radius:12px;display:grid;place-items:center">Video: ${cms.escape(item.title || item.url)}</div><figcaption>${cms.escape(item.caption || '')}</figcaption></figure>`
      : `<figure><img src="${cms.escape(item.url)}" alt=""><figcaption><strong>${cms.escape(item.title || '')}</strong>${item.caption ? `<br>${cms.escape(item.caption)}` : ''}</figcaption></figure>`).join('')}</div>`;
  };

  const renderItems = block => {
    const items = (block.items || []).filter(item => item.title || item.text);
    if (!items.length) return '';
    return `<div class="timeline-items">${items.map(item => `<div class="timeline-item"><strong>${cms.escape(item.title || '')}</strong><p>${cms.escape(item.text || '')}</p></div>`).join('')}</div>`;
  };

  const renderBlock = (block, project, children = []) => {
    const meta = [block.navTitle ? `Menu: ${cms.escape(block.navTitle)}` : '', (block.disciplines || []).map(value => cms.disciplines?.[value] || value).join(' · ')].filter(Boolean).join(' | ');
    return `<section class="preview-section${block.level === 'secondary' ? ' is-sub-block' : ''}" data-preview-block-id="${cms.escape(block.id)}" style="--block-accent:${cms.escape(block.accent || project.accent || '#8e95a3')}">
      ${meta ? `<small class="eyebrow">${meta}</small>` : ''}
      <span class="eyebrow">${cms.escape(block.kicker || cms.blockTypes[block.type] || '')}</span>
      <h2>${cms.escape(block.title || cms.blockTypes[block.type] || '')}</h2>
      ${block.body ? `<p>${cms.escape(block.body)}</p>` : ''}
      ${renderLinks(block)}
      ${block.quote ? `<blockquote>“${cms.escape(block.quote)}”${block.author ? `<footer>${cms.escape(block.author)}</footer>` : ''}</blockquote>` : ''}
      ${renderMedia(block)}
      ${renderItems(block)}
      ${block.takeaway ? `<div class="takeaway"><span class="eyebrow">KEY TAKEAWAY</span><p>${cms.escape(block.takeaway)}</p></div>` : ''}
      ${children.length ? `<div class="preview-sub-blocks">${children.map(child => renderBlock(child, project)).join('')}</div>` : ''}
    </section>`;
  };

  const render = () => {
    const project = getProject();
    if (!project) return;
    const visible = (project.blocks || []).filter(block => block.visible !== false);
    const mainIds = new Set(visible.filter(block => block.level !== 'secondary').map(block => block.id));
    const mains = visible.filter(block => block.level !== 'secondary' || !block.parentId || !mainIds.has(block.parentId));
    const blocksHtml = mains.map(main => {
      const normalized = main.level === 'secondary' ? {...main, level:'primary', parentId:''} : main;
      const children = visible.filter(block => block.level === 'secondary' && block.parentId === normalized.id);
      return renderBlock(normalized, project, children);
    }).join('');

    canvas.innerHTML = `<header class="preview-hero" style="background-image:url('${cms.escape(project.cover || '')}')"><span class="eyebrow">${cms.escape(project.categoryLabel || cms.categories[project.category] || '')}</span><h1>${cms.escape(project.title || '')}</h1><p>${cms.escape(project.summary || '')}</p></header>${blocksHtml}`;
  };

  const saveThenRender = () => {
    document.querySelector('#saveProject')?.click();
    window.setTimeout(render, 80);
  };

  document.querySelector('#saveBlock')?.addEventListener('click', () => window.setTimeout(saveThenRender, 30));
  document.querySelector('#saveProject')?.addEventListener('click', () => window.setTimeout(render, 30));
  document.querySelector('#projectList')?.addEventListener('click', () => window.setTimeout(render, 50));
  document.querySelectorAll('[data-tab="preview"]').forEach(button => button.addEventListener('click', saveThenRender));
  window.addEventListener('portfolio-projects-updated', () => window.setTimeout(render, 0));
  window.setTimeout(render, 100);
})();