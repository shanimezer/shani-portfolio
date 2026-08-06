(() => {
  const canvas = document.querySelector('#previewCanvas');
  if (!canvas || !window.PortfolioCMS) return;

  const style = document.createElement('style');
  style.textContent = `
    #previewCanvas .preview-sub-blocks{display:grid;gap:18px;margin-top:30px;padding:4px 0 0 24px;border-left:1px solid var(--line)}
    #previewCanvas .preview-section.is-sub-block{margin:0;padding:24px 0 10px;border:0;background:transparent}
    #previewCanvas .preview-section.is-sub-block+.preview-section.is-sub-block{border-top:1px solid var(--line)}
    #previewCanvas .preview-section.is-sub-block h2{font-size:clamp(1.45rem,3vw,2.3rem);margin:8px 0 14px}
    #previewCanvas .preview-section.is-sub-block>p{font-size:.98rem;line-height:1.7;color:var(--muted)}
    #previewCanvas .preview-section.is-sub-block:before{content:'SUB-BLOCK';display:inline-flex;margin-bottom:8px;font-size:.62rem;letter-spacing:.15em;color:var(--block-accent,#8e95a3)}
    @media(max-width:700px){#previewCanvas .preview-sub-blocks{padding-left:15px}}
  `;
  document.head.appendChild(style);

  let arranging = false;

  const activeProject = () => {
    const id = document.querySelector('.project-item.active')?.dataset.id;
    return window.PortfolioCMS.get().find(project => project.id === id);
  };

  const arrange = () => {
    if (arranging) return;
    const project = activeProject();
    if (!project) return;

    const visibleBlocks = (project.blocks || []).filter(block => block.visible !== false);
    const sections = [...canvas.querySelectorAll(':scope > .preview-section')];
    if (!sections.length || sections.length !== visibleBlocks.length) return;

    arranging = true;
    try {
      sections.forEach((section, index) => {
        const block = visibleBlocks[index];
        section.dataset.blockId = block.id;
        section.classList.toggle('is-sub-block', block.level === 'secondary');
      });

      const sectionById = new Map(sections.map(section => [section.dataset.blockId, section]));
      visibleBlocks.filter(block => block.level === 'secondary' && block.parentId).forEach(block => {
        const child = sectionById.get(block.id);
        const parent = sectionById.get(block.parentId);
        if (!child || !parent || child === parent) return;
        let wrapper = parent.querySelector(':scope > .preview-sub-blocks');
        if (!wrapper) {
          wrapper = document.createElement('div');
          wrapper.className = 'preview-sub-blocks';
          parent.appendChild(wrapper);
        }
        wrapper.appendChild(child);
      });
    } finally {
      arranging = false;
    }
  };

  const refresh = () => {
    requestAnimationFrame(arrange);
    setTimeout(arrange, 200);
  };

  new MutationObserver(refresh).observe(canvas, { childList:true, subtree:true });
  document.querySelector('#blockList')?.addEventListener('click', refresh);
  document.querySelector('#saveBlock')?.addEventListener('click', refresh);
  document.querySelector('#saveProject')?.addEventListener('click', refresh);
  document.querySelectorAll('[data-tab="preview"]').forEach(button => button.addEventListener('click', refresh));
  refresh();
})();