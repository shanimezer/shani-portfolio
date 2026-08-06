(() => {
  const form = document.querySelector('#settingsForm');
  if (!form) return;

  const style = document.createElement('style');
  style.textContent = `.category-picker{margin:0;border:1px solid var(--line);border-radius:14px;padding:16px;background:#101216}.category-picker legend{padding:0 7px;color:#cfd2d9;font-size:13px}.category-picker>small{display:block;margin-top:12px;color:var(--muted);line-height:1.45}.category-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.category-options label{display:flex;flex-direction:row;align-items:center;gap:9px;padding:11px 12px;border:1px solid var(--line);border-radius:10px;background:var(--panel);cursor:pointer}.category-options label:has(input:checked){border-color:#626b7a;background:var(--panel2);color:var(--text)}.category-options input{width:auto;margin:0;accent-color:#f1efe9}.block-hierarchy-fields{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:15px;border:1px solid var(--line);border-radius:14px;background:#101216}.block-hierarchy-fields small{display:block;margin-top:7px;color:var(--muted);line-height:1.4}.block-card.is-secondary{margin-left:34px;width:calc(100% - 34px);border-left:3px solid var(--project-accent,#8e95a3);background:linear-gradient(90deg,rgba(255,255,255,.035),transparent)}.block-card.is-secondary .block-index:before{content:'↳ ';color:var(--muted)}.block-card .hierarchy-badge{display:inline-flex;margin-left:7px;padding:2px 7px;border:1px solid var(--line);border-radius:999px;font-size:.65rem;color:var(--muted)}@media(max-width:820px){.category-options{grid-template-columns:1fr 1fr}}@media(max-width:620px){.block-hierarchy-fields{grid-template-columns:1fr}.block-card.is-secondary{margin-left:16px;width:calc(100% - 16px)}}@media(max-width:480px){.category-options{grid-template-columns:1fr}}`;
  document.head.appendChild(style);

  const hidden = form.elements.categories;
  const primary = form.elements.category;
  const checkboxes = [...form.querySelectorAll('[data-category-checkbox]')];
  const aliases = {directing:'directing',director:'directing',games:'games',game:'games','game dev':'games','game development':'games',production:'production',producer:'production',social:'social','social content':'social','social media':'social',editing:'editing',editor:'editing',ai:'ai','ai creation':'ai','ai design':'ai','ai creator':'ai','artificial intelligence':'ai'};
  const normalize = value => aliases[String(value || '').trim().toLowerCase()] || '';

  const syncCategories = () => {
    const selected = new Set([normalize(primary.value), ...String(hidden.value || '').split(',').map(normalize).filter(Boolean)]);
    checkboxes.forEach(box => {
      box.checked = selected.has(box.value);
      box.disabled = box.value === primary.value;
    });
    hidden.value = [...new Set([primary.value, ...checkboxes.filter(box => box.checked).map(box => box.value)])].join(', ');
  };

  checkboxes.forEach(box => box.addEventListener('change', () => {
    hidden.value = [...new Set([primary.value, ...checkboxes.filter(item => item.checked).map(item => item.value)])].join(', ');
    hidden.dispatchEvent(new Event('input', { bubbles: true }));
  }));
  primary.addEventListener('change', () => { syncCategories(); hidden.dispatchEvent(new Event('input', { bubbles: true })); });
  ['#projectList','#newProject','#duplicateProject','#resetData','#importInput'].forEach(selector => document.querySelector(selector)?.addEventListener('click', () => setTimeout(syncCategories, 0)));

  const blockForm = document.querySelector('#blockForm');
  const blockDialog = document.querySelector('#blockDialog');
  if (blockForm) {
    const disciplinePickers = [...blockForm.querySelectorAll('fieldset')].filter(fieldset => fieldset.querySelector('legend')?.textContent.trim() === 'Block disciplines');
    disciplinePickers.slice(1).forEach(fieldset => fieldset.remove());
    const disciplinePicker = disciplinePickers[0];
    const disciplineOptions = disciplinePicker?.querySelector('.category-options');
    if (disciplineOptions && !disciplineOptions.querySelector('input[value="narrativeDesign"]')) {
      disciplineOptions.insertAdjacentHTML('beforeend', '<label><input type="checkbox" name="disciplines" value="narrativeDesign"> Narrative Design</label>');
    }
    [...blockForm.querySelectorAll('input[name="navTitle"]')].slice(1).forEach(input => input.closest('label')?.remove());
    [...blockForm.querySelectorAll('input[name="showInToc"]')].slice(1).forEach(input => input.closest('label')?.remove());
    [...blockForm.querySelectorAll('input[name="alwaysVisible"]')].slice(1).forEach(input => input.closest('label')?.remove());

    const titleLabel = blockForm.elements.title?.closest('label');
    if (titleLabel && !blockForm.querySelector('.block-hierarchy-fields')) {
      const hierarchy = document.createElement('div');
      hierarchy.className = 'block-hierarchy-fields';
      hierarchy.innerHTML = `<label>Block hierarchy<select name="level"><option value="primary">Main block</option><option value="secondary">Sub-block</option></select><small>Sub-blocks are displayed inside a main block.</small></label><label data-parent-field>Parent main block<select name="parentId"><option value="">Choose a main block</option></select><small>Select the section that should contain this explanation.</small></label>`;
      titleLabel.insertAdjacentElement('beforebegin', hierarchy);
    }
  }

  const activeProject = () => {
    const id = document.querySelector('.project-item.active')?.dataset.id;
    return window.PortfolioCMS.get().find(project => project.id === id);
  };
  const levelField = blockForm?.elements.level;
  const parentField = blockForm?.elements.parentId;
  const parentWrap = parentField?.closest('[data-parent-field]');
  let editingBlockId = null;

  const populateParents = (selected = '') => {
    if (!parentField) return;
    const project = activeProject();
    const primaryBlocks = (project?.blocks || []).filter(block => block.level !== 'secondary' && block.id !== editingBlockId);
    parentField.innerHTML = `<option value="">Choose a main block</option>${primaryBlocks.map(block => `<option value="${window.PortfolioCMS.escape(block.id)}">${window.PortfolioCMS.escape(block.navTitle || block.title || window.PortfolioCMS.blockTypes[block.type] || 'Untitled block')}</option>`).join('')}`;
    parentField.value = primaryBlocks.some(block => block.id === selected) ? selected : '';
  };
  const syncHierarchyVisibility = () => {
    if (!parentWrap || !levelField) return;
    const secondary = levelField.value === 'secondary';
    parentWrap.hidden = !secondary;
    if (!secondary && parentField) parentField.value = '';
  };
  levelField?.addEventListener('change', syncHierarchyVisibility);

  const fillHierarchy = () => {
    const block = activeProject()?.blocks?.find(item => item.id === editingBlockId);
    if (!levelField || !parentField) return;
    levelField.value = block?.level === 'secondary' ? 'secondary' : 'primary';
    populateParents(block?.parentId || '');
    syncHierarchyVisibility();
  };

  document.querySelector('#blockList')?.addEventListener('click', event => {
    const card = event.target.closest('.block-card');
    if (card && event.target.closest('[data-action="edit"]')) {
      editingBlockId = card.dataset.id;
      setTimeout(fillHierarchy, 0);
    }
  });
  document.querySelector('#addBlock')?.addEventListener('click', () => {
    editingBlockId = null;
    setTimeout(fillHierarchy, 0);
  });

  const originalNormalizeBlock = window.PortfolioCMS.normalizeBlock;
  window.PortfolioCMS.normalizeBlock = block => {
    const input = {...block};
    if (blockDialog?.open && levelField && parentField) {
      input.level = levelField.value === 'secondary' ? 'secondary' : 'primary';
      input.parentId = input.level === 'secondary' ? parentField.value : '';
      if (input.level === 'secondary' && !input.parentId) input.level = 'primary';
    }
    return originalNormalizeBlock(input);
  };

  const decorateBlockCards = () => {
    const project = activeProject();
    if (!project) return;
    const blocks = new Map((project.blocks || []).map(block => [block.id, block]));
    document.querySelectorAll('#blockList .block-card').forEach(card => {
      const block = blocks.get(card.dataset.id);
      const secondary = block?.level === 'secondary';
      card.classList.toggle('is-secondary', secondary);
      card.querySelector('.hierarchy-badge')?.remove();
      if (secondary) {
        const parent = blocks.get(block.parentId);
        const info = card.querySelector('.block-info small');
        info?.insertAdjacentHTML('beforeend', `<span class="hierarchy-badge">Inside: ${window.PortfolioCMS.escape(parent?.navTitle || parent?.title || 'Main block')}</span>`);
      }
    });
  };
  const blockList = document.querySelector('#blockList');
  if (blockList) new MutationObserver(() => requestAnimationFrame(decorateBlockCards)).observe(blockList, {childList:true, subtree:true});

  document.querySelector('#saveBlock')?.addEventListener('click', () => {
    setTimeout(() => {
      document.querySelector('#saveProject')?.click();
      decorateBlockCards();
    }, 0);
  });

  setTimeout(() => { syncCategories(); decorateBlockCards(); }, 0);
})();