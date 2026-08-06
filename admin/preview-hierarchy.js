(() => {
  const cms = window.PortfolioCMS;
  const canvas = document.querySelector('#previewCanvas');
  if (!cms || !canvas) return;

  const currentProject = () => {
    const id = document.querySelector('.project-item.active')?.dataset.id;
    return cms.get().find(project => project.id === id) || null;
  };

  const renderBlock = (block, project, children = []) => {
    const links = (block.links || []).filter(link => link.url).map((link, index) => `<a href="${cms.escape(link.url)}" target="_blank" rel="noopener" class="${link.style === 'primary' || (block.type === 'gameLinks' && index === 0) ? 'primary' : 'ghost'}">${cms.escape(link.label || 'Open link')} ↗</a>`).join('');
    const media = (block.media || []).map(item => item.type === 'video' ? `<figure><div style="aspect-ratio:16/9;background:#1a1d22;border-radius:12px;display:grid;place-items:center">Video: ${cms.escape(item.title || item.url)}</div><figcaption>${cms.escape(item.caption || '')}</figcaption></figure>` : `<figure><img src="${cms.escape(item.url)}" alt=""><figcaption><strong>${cms.escape(item.title || '')}</strong>${item.caption ? `<br>${cms.escape(item.caption)}` : ''}</figcaption></figure>`).join('');
    const items = (block.items || []).map(item => `<div class="timeline-item"><strong>${cms.escape(item.title || '')}</strong><p>${cms.escape(item.text || '')}</p></div>`).join('');
    const meta = [block.navTitle ? `Menu: ${cms.escape(block.navTitle)}` : '', (block.disciplines || []).map(value => cms.disciplines?.[value] || value).join(' · ')].filter(Boolean).join(' | ');
    const childMarkup = children.length ? `<div class="preview-sub-blocks">${children.map(child => renderBlock(child, project)).join('')}</div>` : '';
    return `<section class="preview-section${block.level === 'secondary' ? ' is-sub-block' : ''}" style="--block-accent:${cms.escape(block.accent || project.accent || '#8e95a3')}">${meta ? `<small class="eyebrow">${meta}</small>` : ''}<span class="eyebrow">${cms.escape(block.kicker || cms.blockTypes[block.type] || '')}</span><h2>${cms.escape(block.title || cms.blockTypes[block.type] || '')}</h2>${block.body ? `<p>${cms.escape(block.body)}</p>` : ''}${links ? `<div class="preview-links">${links}</div>` : ''}${media ? `<div class="preview-media">${media}</div>` : ''}${items ? `<div class="timeline-items">${items}</div>` : ''}${block.takeaway ? `<div class="takeaway"><span class="eyebrow">KEY TAKEAWAY</span><p>${cms.escape(block.takeaway)}</p></div>` : ''}${childMarkup}</section>`;
  };

  const render = () => {
    const project = currentProject();
    if (!project) return;
    const visible = (project.blocks || []).filter(block => block.visible !== false);
    const primaryIds = new Set(visible.filter(block => block.level !== 'secondary').map(block => block.id));
    const roots = visible.filter(block => block.level !== 'secondary' || !block.parentId || !primaryIds.has(block.parentId));
    const html = roots.map(root => {
      const main = root.level === 'secondary' ? {...root, level:'primary', parentId:''} : root;
      const children = visible.filter(block => block.level === 'secondary' && block.parentId === root.id);
      return renderBlock(main, project, children);
    }).join('');
    canvas.innerHTML = `<header class="preview-hero" style="background-image:url('${cms.escape(project.cover || '')}')"><span class="eyebrow">${cms.escape(project.categoryLabel || cms.categories[project.category] || '')}</span><h1>${cms.escape(project.title || '')}</h1><p>${cms.escape(project.summary || '')}</p></header>${html}`;
  };

  const style = document.createElement('style');
  style.textContent = `#previewCanvas .preview-sub-blocks{display:grid;gap:18px;margin-top:30px;padding:4px 0 0 24px;border-left:1px solid var(--line)}#previewCanvas .preview-section.is-sub-block{margin:0;padding:24px 0 10px;border:0;background:transparent}#previewCanvas .preview-section.is-sub-block h2{font-size:clamp(1.45rem,3vw,2.3rem)}`;
  document.head.appendChild(style);

  const refresh = () => setTimeout(render, 100);
  document.querySelector('#saveBlock')?.addEventListener('click', refresh);
  document.querySelector('#saveProject')?.addEventListener('click', refresh);
  document.querySelector('#projectList')?.addEventListener('click', refresh);
  document.querySelectorAll('[data-tab="preview"]').forEach(button => button.addEventListener('click', () => { document.querySelector('#saveProject')?.click(); refresh(); }));
  window.addEventListener('portfolio-projects-updated', render);
  refresh();
})();