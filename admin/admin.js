(() => {
  'use strict';

  const cms = window.PortfolioCMS;
  if (!cms) throw new Error('PortfolioCMS is required before admin.js');

  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];
  const clone = value => JSON.parse(JSON.stringify(value));
  const slugify = value => String(value || '').toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  let projects = cms.get();
  let currentId = null;
  let editingBlockId = null;

  const projectList = $('#projectList');
  const editor = $('#editor');
  const emptyState = $('#emptyState');
  const settingsForm = $('#settingsForm');
  const blockList = $('#blockList');
  const blockDialog = $('#blockDialog');
  const blockForm = $('#blockForm');
  const previewCanvas = $('#previewCanvas');

  const currentProject = () => projects.find(project => project.id === currentId);

  const persist = (message = 'Saved locally in this browser') => {
    projects = projects.map(cms.migrateProject);
    cms.save(projects);
    const state = $('#saveState');
    if (state) state.textContent = message;
  };

  const markChanged = () => {
    const state = $('#saveState');
    if (state) state.textContent = 'Unsaved local changes';
  };

  const parseLines = (value, kind) => String(value || '')
    .split('\n').map(line => line.trim()).filter(Boolean).map(line => {
      const parts = line.split('|').map(part => part.trim());
      if (kind === 'media') {
        const url = parts[0] || '';
        return {
          id: cms.makeId('media'),
          url,
          type: /youtube|youtu\.be|vimeo|drive\.google|docs\.google|\.mp4(?:$|\?)|\.webm(?:$|\?)/i.test(url) ? 'video' : 'image',
          title: parts[1] || '',
          caption: parts[2] || ''
        };
      }
      if (kind === 'links') {
        return {
          id: cms.makeId('link'),
          label: parts[0] || 'Open link',
          url: parts[1] || '',
          style: (parts[2] || 'secondary').toLowerCase()
        };
      }
      return {
        id: cms.makeId('item'),
        title: parts[0] || '',
        text: parts.slice(1).join(' | ') || ''
      };
    });

  const serializeLines = (items, kind) => (items || []).map(item => {
    if (kind === 'media') return [item.url, item.title, item.caption].filter(Boolean).join(' | ');
    if (kind === 'links') return [item.label, item.url, item.style !== 'secondary' ? item.style : ''].filter(Boolean).join(' | ');
    return [item.title, item.text].filter(Boolean).join(' | ');
  }).join('\n');

  const renderProjects = () => {
    if (!projectList) return;
    $('#projectCount').textContent = projects.length;
    projectList.innerHTML = projects.map(project => `
      <button class="project-item ${project.id === currentId ? 'active' : ''}" data-id="${cms.escape(project.id)}">
        <span class="project-thumb" style="background-image:url('${cms.escape(project.cover || '')}')"></span>
        <span>
          <strong>${cms.escape(project.title || 'Untitled')}</strong>
          <small>${cms.escape(project.status || 'draft')} · ${(project.blocks || []).length} blocks</small>
        </span>
      </button>`).join('');
    $$('.project-item').forEach(button => {
      button.addEventListener('click', () => openProject(button.dataset.id));
    });
  };

  const syncCategoryCheckboxes = () => {
    if (!settingsForm) return;
    const primary = settingsForm.elements.category?.value || '';
    const hidden = settingsForm.elements.categories;
    const selected = new Set([
      primary,
      ...String(hidden?.value || '').split(',').map(value => value.trim()).filter(Boolean)
    ]);
    settingsForm.querySelectorAll('[data-category-checkbox]').forEach(box => {
      box.checked = selected.has(box.value);
      box.disabled = box.value === primary;
    });
  };

  const populateSettings = project => {
    ['id','title','year','summary','category','categoryLabel','status','accent','cover','video','tools','client']
      .forEach(name => {
        if (settingsForm.elements[name]) settingsForm.elements[name].value = project[name] || '';
      });
    settingsForm.elements.categories.value = (project.categories || [])
      .filter(value => value !== project.category).join(', ');
    settingsForm.elements.roles.value = (project.roles || []).join(', ');
    settingsForm.elements.featured.checked = !!project.featured;
    syncCategoryCheckboxes();
  };

  const collectSettings = () => {
    const project = currentProject();
    if (!project) return;
    const oldId = project.id;
    const id = settingsForm.elements.id.value.trim();
    if (!/^[a-z0-9-]+$/.test(id)) throw new Error('The slug can only contain lowercase letters, numbers and hyphens.');
    if (projects.some(item => item.id === id && item.id !== oldId)) throw new Error('That slug is already being used.');

    project.id = id;
    project.title = settingsForm.elements.title.value.trim();
    project.year = settingsForm.elements.year.value.trim();
    project.summary = settingsForm.elements.summary.value.trim();
    project.category = settingsForm.elements.category.value;

    const extraCategories = [...settingsForm.querySelectorAll('[data-category-checkbox]:checked')]
      .map(input => input.value);
    project.categories = [...new Set([project.category, ...extraCategories])];

    project.categoryLabel = settingsForm.elements.categoryLabel.value.trim();
    project.roles = settingsForm.elements.roles.value.split(',').map(value => value.trim()).filter(Boolean);
    project.role = project.roles.join(', ');
    project.status = settingsForm.elements.status.value;
    project.accent = settingsForm.elements.accent.value;
    project.cover = settingsForm.elements.cover.value.trim();
    project.video = settingsForm.elements.video.value.trim();
    project.tools = settingsForm.elements.tools.value.trim();
    project.client = settingsForm.elements.client.value.trim();
    project.featured = settingsForm.elements.featured.checked;
    currentId = id;
  };

  const blockLabel = block => block.navTitle || block.title || cms.blockTypes[block.type] || 'Untitled block';

  const renderBlocks = () => {
    const project = currentProject();
    const blocks = project?.blocks || [];
    if (!blocks.length) {
      blockList.innerHTML = '<div class="empty-blocks"><h3>No story blocks yet</h3><p>Add the first step in this project’s creative journey.</p></div>';
      return;
    }
    const byId = new Map(blocks.map(block => [block.id, block]));
    blockList.innerHTML = blocks.map((block, index) => {
      const secondary = block.level === 'secondary';
      const parent = secondary ? byId.get(block.parentId) : null;
      return `
        <article class="block-card ${block.visible === false ? 'is-hidden' : ''} ${secondary ? 'is-secondary' : ''}"
          draggable="true" data-id="${cms.escape(block.id)}">
          <span class="drag-handle">⋮⋮</span>
          <span class="block-index">${secondary ? '↳' : String(index + 1).padStart(2,'0')}</span>
          <div class="block-info">
            <strong>${cms.escape(block.title || cms.blockTypes[block.type])}</strong>
            <small>
              ${cms.escape(cms.blockTypes[block.type] || block.type)}
              ${secondary ? ` · Inside: ${cms.escape(blockLabel(parent || {}))}` : ''}
              ${block.navTitle ? ` · Menu: ${cms.escape(block.navTitle)}` : ''}
              ${(block.disciplines || []).length ? ` · ${(block.disciplines || []).length} disciplines` : ''}
              ${block.visible === false ? ' · Hidden' : ''}
            </small>
          </div>
          <div class="block-actions">
            <button type="button" data-action="up">↑</button>
            <button type="button" data-action="down">↓</button>
            <button type="button" data-action="toggle">${block.visible === false ? 'Show' : 'Hide'}</button>
            <button type="button" data-action="duplicate">Duplicate</button>
            <button type="button" data-action="edit">Edit</button>
            <button type="button" data-action="delete">Delete</button>
          </div>
        </article>`;
    }).join('');

    $$('.block-card').forEach(card => {
      card.querySelectorAll('[data-action]').forEach(button => {
        button.addEventListener('click', () => blockAction(card.dataset.id, button.dataset.action));
      });
      card.addEventListener('dragstart', () => card.classList.add('dragging'));
      card.addEventListener('dragend', () => card.classList.remove('dragging'));
      card.addEventListener('dragover', event => {
        event.preventDefault();
        const dragging = $('.block-card.dragging');
        if (!dragging || dragging === card) return;
        const rect = card.getBoundingClientRect();
        card.parentNode.insertBefore(dragging, event.clientY < rect.top + rect.height / 2 ? card : card.nextSibling);
      });
      card.addEventListener('drop', () => {
        const order = $$('.block-card').map(item => item.dataset.id);
        project.blocks.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id));
        persist();
        renderBlocks();
        renderPreview();
      });
    });
  };

  const populateParentOptions = (selected = '') => {
    const project = currentProject();
    const field = blockForm.elements.parentId;
    if (!field) return;
    const options = (project?.blocks || [])
      .filter(block => block.level !== 'secondary' && block.id !== editingBlockId);
    field.innerHTML = `<option value="">Choose a main block</option>${options.map(block =>
      `<option value="${cms.escape(block.id)}">${cms.escape(blockLabel(block))}</option>`
    ).join('')}`;
    field.value = options.some(block => block.id === selected) ? selected : '';
  };

  const syncHierarchyVisibility = () => {
    const level = blockForm.elements.level?.value || 'primary';
    const parentField = blockForm.elements.parentId?.closest('[data-parent-field]');
    if (parentField) parentField.hidden = level !== 'secondary';
    if (level !== 'secondary' && blockForm.elements.parentId) blockForm.elements.parentId.value = '';
  };

  const openBlockDialog = block => {
    editingBlockId = block?.id || null;
    $('#blockDialogTitle').textContent = block ? 'Edit block' : 'Add block';
    const data = block || cms.normalizeBlock({ type:'story' });

    ['type','layout','kicker','role','title','navTitle','body','takeaway','quote','author','accent']
      .forEach(name => {
        if (blockForm.elements[name]) {
          blockForm.elements[name].value = data[name] || (name === 'accent' ? '#8e95a3' : '');
        }
      });

    blockForm.elements.links.value = serializeLines(data.links, 'links');
    blockForm.elements.media.value = serializeLines(data.media, 'media');
    blockForm.elements.items.value = serializeLines(data.items, 'items');
    blockForm.elements.visible.checked = data.visible !== false;
    blockForm.elements.showInToc.checked = data.showInToc !== false;
    blockForm.elements.alwaysVisible.checked = data.alwaysVisible === true;

    blockForm.querySelectorAll('input[name="disciplines"]').forEach(input => {
      input.checked = (data.disciplines || []).includes(input.value);
    });

    if (blockForm.elements.level) blockForm.elements.level.value = data.level === 'secondary' ? 'secondary' : 'primary';
    populateParentOptions(data.parentId || '');
    syncHierarchyVisibility();
    blockDialog.showModal();
  };

  const selectedDisciplines = () =>
    [...blockForm.querySelectorAll('input[name="disciplines"]:checked')].map(input => input.value);

  const saveBlock = event => {
    event.preventDefault();
    const project = currentProject();
    if (!project) return;

    const level = blockForm.elements.level?.value === 'secondary' ? 'secondary' : 'primary';
    const parentId = level === 'secondary' ? (blockForm.elements.parentId?.value || '') : '';

    const block = cms.normalizeBlock({
      id: editingBlockId || cms.makeId('block'),
      type: blockForm.elements.type.value,
      layout: blockForm.elements.layout.value,
      level: parentId ? 'secondary' : 'primary',
      parentId,
      kicker: blockForm.elements.kicker.value.trim(),
      role: blockForm.elements.role.value.trim(),
      title: blockForm.elements.title.value.trim(),
      navTitle: blockForm.elements.navTitle.value.trim(),
      showInToc: blockForm.elements.showInToc.checked,
      alwaysVisible: blockForm.elements.alwaysVisible.checked,
      disciplines: selectedDisciplines(),
      body: blockForm.elements.body.value.trim(),
      takeaway: blockForm.elements.takeaway.value.trim(),
      links: parseLines(blockForm.elements.links.value, 'links').filter(link => link.url),
      media: parseLines(blockForm.elements.media.value, 'media'),
      items: parseLines(blockForm.elements.items.value, 'items'),
      quote: blockForm.elements.quote.value.trim(),
      author: blockForm.elements.author.value.trim(),
      accent: blockForm.elements.accent.value,
      visible: blockForm.elements.visible.checked
    });

    const index = project.blocks.findIndex(item => item.id === editingBlockId);
    if (index >= 0) project.blocks[index] = block;
    else project.blocks.push(block);

    persist();
    blockDialog.close();
    renderProjects();
    renderBlocks();
    renderPreview();
  };

  const blockAction = (id, action) => {
    const project = currentProject();
    const index = project.blocks.findIndex(block => block.id === id);
    if (index < 0) return;
    const block = project.blocks[index];

    if (action === 'edit') return openBlockDialog(block);
    if (action === 'delete') {
      if (!confirm('Delete this block?')) return;
      project.blocks.splice(index, 1);
      project.blocks.forEach(child => {
        if (child.parentId === id) {
          child.level = 'primary';
          child.parentId = '';
        }
      });
    }
    if (action === 'duplicate') {
      const copy = clone(block);
      copy.id = cms.makeId('block');
      copy.title = `${block.title || cms.blockTypes[block.type]} copy`;
      if (copy.level === 'primary') copy.parentId = '';
      project.blocks.splice(index + 1, 0, copy);
    }
    if (action === 'toggle') block.visible = block.visible === false;
    if (action === 'up' && index > 0) [project.blocks[index - 1], project.blocks[index]] = [project.blocks[index], project.blocks[index - 1]];
    if (action === 'down' && index < project.blocks.length - 1) [project.blocks[index + 1], project.blocks[index]] = [project.blocks[index], project.blocks[index + 1]];

    persist();
    renderBlocks();
    renderPreview();
  };

  const renderPreviewBlock = (block, children = []) => {
    const links = (block.links || []).filter(link => link.url).map((link, index) =>
      `<a href="${cms.escape(link.url)}" target="_blank" rel="noopener" class="${link.style === 'primary' || (block.type === 'gameLinks' && index === 0) ? 'primary' : 'ghost'}">${cms.escape(link.label || 'Open link')} ↗</a>`
    ).join('');

    const media = (block.media || []).map(item =>
      item.type === 'video'
        ? `<figure><div style="aspect-ratio:16/9;background:#1a1d22;border-radius:12px;display:grid;place-items:center">Video: ${cms.escape(item.title || item.url)}</div><figcaption>${cms.escape(item.caption || '')}</figcaption></figure>`
        : `<figure><img src="${cms.escape(item.url)}" alt=""><figcaption><strong>${cms.escape(item.title || '')}</strong>${item.caption ? `<br>${cms.escape(item.caption)}` : ''}</figcaption></figure>`
    ).join('');

    const items = (block.items || []).map(item =>
      `<div class="timeline-item"><strong>${cms.escape(item.title)}</strong><p>${cms.escape(item.text)}</p></div>`
    ).join('');

    const meta = [
      block.navTitle ? `Menu: ${cms.escape(block.navTitle)}` : '',
      (block.disciplines || []).map(value => cms.disciplines?.[value] || value).join(' · ')
    ].filter(Boolean).join(' | ');

    return `<section class="preview-section ${block.level === 'secondary' ? 'is-sub-block' : ''}" style="--block-accent:${cms.escape(block.accent || currentProject().accent || '#8e95a3')}">
      ${meta ? `<small class="eyebrow">${meta}</small>` : ''}
      <span class="eyebrow">${cms.escape(block.kicker || cms.blockTypes[block.type])}</span>
      <h2>${cms.escape(block.title || cms.blockTypes[block.type])}</h2>
      ${block.body ? `<p>${cms.escape(block.body)}</p>` : ''}
      ${links ? `<div class="preview-links">${links}</div>` : ''}
      ${block.quote ? `<blockquote>“${cms.escape(block.quote)}”${block.author ? `<footer>${cms.escape(block.author)}</footer>` : ''}</blockquote>` : ''}
      ${media ? `<div class="preview-media">${media}</div>` : ''}
      ${items ? `<div class="timeline-items">${items}</div>` : ''}
      ${block.takeaway ? `<div class="takeaway"><span class="eyebrow">KEY TAKEAWAY</span><p>${cms.escape(block.takeaway)}</p></div>` : ''}
      ${children.length ? `<div class="preview-sub-blocks">${children.map(child => renderPreviewBlock(child)).join('')}</div>` : ''}
    </section>`;
  };

  const renderPreview = () => {
    const project = currentProject();
    if (!project || !previewCanvas) return;
    const visible = (project.blocks || []).filter(block => block.visible !== false);
    const primaryIds = new Set(visible.filter(block => block.level !== 'secondary').map(block => block.id));
    const mains = visible.filter(block => block.level !== 'secondary' || !block.parentId || !primaryIds.has(block.parentId));

    previewCanvas.innerHTML = `
      <header class="preview-hero" style="background-image:url('${cms.escape(project.cover || '')}')">
        <span class="eyebrow">${cms.escape(project.categoryLabel || cms.categories[project.category] || '')}</span>
        <h1>${cms.escape(project.title)}</h1>
        <p>${cms.escape(project.summary || '')}</p>
      </header>
      ${mains.map(main => {
        const children = visible.filter(block => block.level === 'secondary' && block.parentId === main.id);
        const normalizedMain = main.level === 'secondary' ? {...main, level:'primary', parentId:''} : main;
        return renderPreviewBlock(normalizedMain, children);
      }).join('')}`;
  };

  const openProject = id => {
    currentId = id;
    const project = currentProject();
    if (!project) return;
    emptyState.hidden = true;
    editor.hidden = false;
    $('#editorTitle').textContent = project.title;
    populateSettings(project);
    renderProjects();
    renderBlocks();
    renderPreview();
    $('#saveState').textContent = 'Saved locally in this browser';
  };

  const saveProject = () => {
    try {
      collectSettings();
      persist();
      $('#editorTitle').textContent = currentProject().title;
      renderProjects();
      renderBlocks();
      renderPreview();
    } catch (error) {
      alert(error.message);
    }
  };

  const exportFile = (filename, content, type = 'text/javascript') => {
    const blob = new Blob([content], {type});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 0);
  };

  Object.entries(cms.blockTypes).forEach(([value, label]) => $('#blockType').add(new Option(label, value)));
  Object.entries(cms.layouts).forEach(([value, label]) => $('#blockLayout').add(new Option(label, value)));

  $$('.tabs button').forEach(button => {
    button.addEventListener('click', () => {
      $$('.tabs button').forEach(item => item.classList.toggle('active', item === button));
      $$('.tab-panel').forEach(panel => panel.classList.toggle('active', panel.dataset.panel === button.dataset.tab));
      if (button.dataset.tab === 'preview') renderPreview();
    });
  });

  settingsForm.addEventListener('input', markChanged);
  settingsForm.elements.category.addEventListener('change', syncCategoryCheckboxes);
  settingsForm.querySelectorAll('[data-category-checkbox]').forEach(box => {
    box.addEventListener('change', markChanged);
  });
  blockForm.elements.level?.addEventListener('change', syncHierarchyVisibility);

  $('#saveProject').addEventListener('click', saveProject);
  $('#addBlock').addEventListener('click', () => openBlockDialog());
  $('#saveBlock').addEventListener('click', saveBlock);

  $('#newProject').addEventListener('click', () => {
    const title = 'Untitled Project';
    const id = `${slugify(title)}-${Date.now().toString().slice(-5)}`;
    projects.unshift(cms.migrateProject({
      id, title,
      year: new Date().getFullYear().toString(),
      category:'directing',
      categories:['directing'],
      categoryLabel:'Directing',
      roles:[],
      status:'draft',
      accent:'#8e95a3',
      cover:'',
      video:'',
      summary:'',
      tools:'',
      client:'',
      featured:false,
      blocks:[]
    }));
    persist();
    openProject(id);
  });

  $('#duplicateProject').addEventListener('click', () => {
    const source = currentProject();
    if (!source) return;
    const copy = clone(source);
    copy.id = `${source.id}-copy-${Date.now().toString().slice(-4)}`;
    copy.title = `${source.title} Copy`;
    copy.status = 'draft';
    const idMap = new Map();
    copy.blocks = copy.blocks.map(block => {
      const newId = cms.makeId('block');
      idMap.set(block.id, newId);
      return {...block, id:newId};
    }).map(block => ({
      ...block,
      parentId: block.parentId ? (idMap.get(block.parentId) || '') : ''
    }));
    projects.unshift(copy);
    persist();
    openProject(copy.id);
  });

  $('#deleteProject').addEventListener('click', () => {
    const project = currentProject();
    if (!project || !confirm(`Delete ${project.title}?`)) return;
    projects = projects.filter(item => item.id !== project.id);
    persist();
    currentId = null;
    editor.hidden = true;
    emptyState.hidden = false;
    renderProjects();
  });

  $('#resetData').addEventListener('click', () => {
    if (!confirm('Reset all local changes and reload projects from GitHub data?')) return;
    cms.reset();
    projects = cms.defaults();
    persist();
    currentId = null;
    editor.hidden = true;
    emptyState.hidden = false;
    renderProjects();
  });

  $('#exportSiteData').addEventListener('click', () => {
    saveProject();
    exportFile('projects.js', cms.toProjectsJs(projects));
  });

  $('#exportBackup').addEventListener('click', () => {
    saveProject();
    exportFile('portfolio-projects-backup.json', JSON.stringify(projects, null, 2), 'application/json');
  });

  $('#importButton').addEventListener('click', () => $('#importInput').click());
  $('#importInput').addEventListener('change', async event => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const jsonText = text.replace(/^\s*window\.PORTFOLIO_PROJECTS\s*=\s*/, '').replace(/;\s*$/, '');
      const imported = JSON.parse(jsonText);
      if (!Array.isArray(imported)) throw new Error('The imported file must contain an array of projects.');
      projects = imported.map(cms.migrateProject);
      persist();
      currentId = null;
      editor.hidden = true;
      emptyState.hidden = false;
      renderProjects();
    } catch (error) {
      alert(`Import failed: ${error.message}`);
    } finally {
      event.target.value = '';
    }
  });

  renderProjects();
})();