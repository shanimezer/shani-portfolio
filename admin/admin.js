(() => {
  const cms = window.PortfolioCMS;
  const $ = selector => document.querySelector(selector);
  const $$ = selector => [...document.querySelectorAll(selector)];

  const loadProjects = () => {
    const local = Array.isArray(cms.get()) ? cms.get() : [];
    const site = Array.isArray(cms.defaults()) ? cms.defaults() : [];
    if (!site.length) return local;
    const merged = [...local];
    const ids = new Set(merged.map(project => project.id));
    site.forEach(project => { if (!ids.has(project.id)) merged.push(project); });
    if (!local.length || merged.length !== local.length) cms.save(merged);
    return merged;
  };

  let projects = loadProjects();
  let currentId = null;
  let editingBlockId = null;
  const projectList = $('#projectList');
  const editor = $('#editor');
  const empty = $('#emptyState');
  const form = $('#settingsForm');
  const blockList = $('#blockList');
  const dialog = $('#blockDialog');
  const blockForm = $('#blockForm');

  const currentProject = () => projects.find(project => project.id === currentId);
  const markChanged = () => $('#saveState').textContent = 'Unsaved local changes';
  const slugify = value => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const parseLines = (value, kind) => String(value || '').split('\n').map(line => line.trim()).filter(Boolean).map(line => {
    const parts = line.split('|').map(part => part.trim());
    if (kind === 'media') return { id: cms.makeId('media'), url: parts[0] || '', type: /youtube|youtu\.be|vimeo|\.mp4|\.webm/i.test(parts[0] || '') ? 'video' : 'image', title: parts[1] || '', caption: parts[2] || '' };
    if (kind === 'links') return { id: cms.makeId('link'), label: parts[0] || 'Open link', url: parts[1] || '', style: (parts[2] || 'secondary').toLowerCase() };
    return { id: cms.makeId('item'), title: parts[0] || '', text: parts.slice(1).join(' | ') || '' };
  });

  const serializeLines = (items, kind) => (items || []).map(item => {
    if (kind === 'media') return [item.url, item.title, item.caption].filter(Boolean).join(' | ');
    if (kind === 'links') return [item.label, item.url, item.style && item.style !== 'secondary' ? item.style : ''].filter(Boolean).join(' | ');
    return [item.title, item.text].filter(Boolean).join(' | ');
  }).join('\n');

  const renderProjects = () => {
    $('#projectCount').textContent = projects.length;
    projectList.innerHTML = projects.map(project => `<button class="project-item ${project.id === currentId ? 'active' : ''}" data-id="${cms.escape(project.id)}"><span class="project-thumb" style="background-image:url('${cms.escape(project.cover || '')}')"></span><span><strong>${cms.escape(project.title || 'Untitled')}</strong><small>${cms.escape(project.status || 'draft')} · ${(project.blocks || []).length} blocks</small></span></button>`).join('');
    $$('.project-item').forEach(button => button.onclick = () => openProject(button.dataset.id));
  };

  const populateSettings = project => {
    ['id','title','year','summary','category','categoryLabel','status','accent','cover','video','tools','client'].forEach(name => form.elements[name].value = project[name] || '');
    form.elements.categories.value = (project.categories || []).filter(value => value !== project.category).join(', ');
    form.elements.roles.value = (project.roles || []).join(', ');
    form.elements.featured.checked = !!project.featured;
  };

  const collectSettings = () => {
    const project = currentProject();
    const oldId = project.id;
    const id = form.elements.id.value.trim();
    if (!/^[a-z0-9-]+$/.test(id)) throw new Error('The slug can only contain lowercase letters, numbers and hyphens.');
    if (projects.some(item => item.id === id && item.id !== oldId)) throw new Error('That slug is already being used.');
    project.id = id;
    project.title = form.elements.title.value.trim();
    project.year = form.elements.year.value.trim();
    project.summary = form.elements.summary.value.trim();
    project.category = form.elements.category.value;
    project.categories = [...new Set([project.category, ...form.elements.categories.value.split(',').map(value => value.trim()).filter(Boolean)])];
    project.categoryLabel = form.elements.categoryLabel.value.trim();
    project.roles = form.elements.roles.value.split(',').map(value => value.trim()).filter(Boolean);
    project.role = project.roles.join(', ');
    project.status = form.elements.status.value;
    project.accent = form.elements.accent.value;
    project.cover = form.elements.cover.value.trim();
    project.video = form.elements.video.value.trim();
    project.tools = form.elements.tools.value.trim();
    project.client = form.elements.client.value.trim();
    project.featured = form.elements.featured.checked;
    currentId = id;
  };

  const openProject = id => {
    currentId = id;
    const project = currentProject();
    if (!project) return;
    empty.hidden = true;
    editor.hidden = false;
    $('#editorTitle').textContent = project.title;
    populateSettings(project);
    renderProjects();
    renderBlocks();
    renderPreview();
    $('#saveState').textContent = 'Saved locally in this browser';
  };

  const renderBlocks = () => {
    const blocks = currentProject()?.blocks || [];
    if (!blocks.length) {
      blockList.innerHTML = '<div class="empty-blocks"><h3>No story blocks yet</h3><p>Add the first step in this project’s creative journey.</p></div>';
      return;
    }
    blockList.innerHTML = blocks.map((block, index) => `<article class="block-card ${block.visible === false ? 'is-hidden' : ''}" draggable="true" data-id="${block.id}"><span class="drag-handle">⋮⋮</span><span class="block-index">${String(index + 1).padStart(2,'0')}</span><div class="block-info"><strong>${cms.escape(block.title || cms.blockTypes[block.type])}</strong><small>${cms.escape(cms.blockTypes[block.type] || block.type)}${(block.links || []).length ? ` · ${(block.links || []).length} links` : ''}${block.visible === false ? ' · Hidden' : ''}</small></div><div class="block-actions"><button data-action="up">↑</button><button data-action="down">↓</button><button data-action="toggle">${block.visible === false ? 'Show' : 'Hide'}</button><button data-action="duplicate">Duplicate</button><button data-action="edit">Edit</button><button data-action="delete">Delete</button></div></article>`).join('');
    $$('.block-card').forEach(card => {
      card.querySelectorAll('[data-action]').forEach(button => button.onclick = () => blockAction(card.dataset.id, button.dataset.action));
      card.addEventListener('dragstart', () => card.classList.add('dragging'));
      card.addEventListener('dragend', () => card.classList.remove('dragging'));
      card.addEventListener('dragover', event => { event.preventDefault(); const dragging = $('.block-card.dragging'); if (!dragging || dragging === card) return; const rect = card.getBoundingClientRect(); card.parentNode.insertBefore(dragging, event.clientY < rect.top + rect.height / 2 ? card : card.nextSibling); });
      card.addEventListener('drop', () => { const order = $$('.block-card').map(item => item.dataset.id); currentProject().blocks.sort((a,b) => order.indexOf(a.id) - order.indexOf(b.id)); markChanged(); renderBlocks(); renderPreview(); });
    });
  };

  const blockAction = (id, action) => {
    const project = currentProject();
    const index = project.blocks.findIndex(block => block.id === id);
    const block = project.blocks[index];
    if (action === 'edit') return openBlockDialog(block);
    if (action === 'delete' && confirm('Delete this block?')) project.blocks.splice(index, 1);
    if (action === 'duplicate') project.blocks.splice(index + 1, 0, {...JSON.parse(JSON.stringify(block)), id: cms.makeId('block'), title: `${block.title || cms.blockTypes[block.type]} copy`});
    if (action === 'toggle') block.visible = block.visible === false;
    if (action === 'up' && index > 0) [project.blocks[index - 1], project.blocks[index]] = [project.blocks[index], project.blocks[index - 1]];
    if (action === 'down' && index < project.blocks.length - 1) [project.blocks[index + 1], project.blocks[index]] = [project.blocks[index], project.blocks[index + 1]];
    markChanged(); renderBlocks(); renderPreview();
  };

  const openBlockDialog = block => {
    editingBlockId = block?.id || null;
    $('#blockDialogTitle').textContent = block ? 'Edit block' : 'Add block';
    const data = block || cms.normalizeBlock({ type: 'story' });
    ['type','layout','kicker','role','title','body','takeaway','quote','author','accent'].forEach(name => blockForm.elements[name].value = data[name] || (name === 'accent' ? '#8e95a3' : ''));
    blockForm.elements.links.value = serializeLines(data.links, 'links');
    blockForm.elements.media.value = serializeLines(data.media, 'media');
    blockForm.elements.items.value = serializeLines(data.items, 'items');
    blockForm.elements.visible.checked = data.visible !== false;
    dialog.showModal();
  };

  const saveBlock = event => {
    event.preventDefault();
    const project = currentProject();
    const block = cms.normalizeBlock({
      id: editingBlockId || cms.makeId('block'), type: blockForm.elements.type.value, layout: blockForm.elements.layout.value,
      kicker: blockForm.elements.kicker.value.trim(), role: blockForm.elements.role.value.trim(), title: blockForm.elements.title.value.trim(), body: blockForm.elements.body.value.trim(), takeaway: blockForm.elements.takeaway.value.trim(),
      links: parseLines(blockForm.elements.links.value, 'links').filter(link => link.url),
      media: parseLines(blockForm.elements.media.value, 'media'), items: parseLines(blockForm.elements.items.value, 'items'),
      quote: blockForm.elements.quote.value.trim(), author: blockForm.elements.author.value.trim(), accent: blockForm.elements.accent.value, visible: blockForm.elements.visible.checked
    });
    const index = project.blocks.findIndex(item => item.id === editingBlockId);
    if (index >= 0) project.blocks[index] = block; else project.blocks.push(block);
    dialog.close(); markChanged(); renderBlocks(); renderPreview();
  };

  const renderPreview = () => {
    const project = currentProject();
    if (!project) return;
    const visible = (project.blocks || []).filter(block => block.visible !== false);
    $('#previewCanvas').innerHTML = `<header class="preview-hero" style="background-image:url('${cms.escape(project.cover || '')}')"><span class="eyebrow">${cms.escape(project.categoryLabel || cms.categories[project.category] || '')}</span><h1>${cms.escape(project.title)}</h1><p>${cms.escape(project.summary || '')}</p></header>${visible.map(renderPreviewBlock).join('')}`;
  };

  const renderPreviewBlock = block => {
    const links = (block.links || []).filter(link => link.url).map((link, index) => `<a href="${cms.escape(link.url)}" target="_blank" rel="noopener" class="${link.style === 'primary' || (block.type === 'gameLinks' && index === 0) ? 'primary' : 'ghost'}">${cms.escape(link.label || 'Open link')} ↗</a>`).join('');
    const media = (block.media || []).map(item => item.type === 'video' ? `<figure><div style="aspect-ratio:16/9;background:#1a1d22;border-radius:12px;display:grid;place-items:center">Video: ${cms.escape(item.title || item.url)}</div><figcaption>${cms.escape(item.caption || '')}</figcaption></figure>` : `<figure><img src="${cms.escape(item.url)}" alt=""><figcaption><strong>${cms.escape(item.title || '')}</strong>${item.caption ? `<br>${cms.escape(item.caption)}` : ''}</figcaption></figure>`).join('');
    const items = (block.items || []).map(item => `<div class="timeline-item"><strong>${cms.escape(item.title)}</strong><p>${cms.escape(item.text)}</p></div>`).join('');
    return `<section class="preview-section" style="--block-accent:${cms.escape(block.accent || currentProject().accent || '#8e95a3')}"><span class="eyebrow">${cms.escape(block.kicker || cms.blockTypes[block.type])}</span><h2>${cms.escape(block.title || cms.blockTypes[block.type])}</h2>${block.body ? `<p>${cms.escape(block.body)}</p>` : ''}${links ? `<div class="preview-links">${links}</div>` : ''}${block.quote ? `<blockquote>“${cms.escape(block.quote)}”${block.author ? `<footer>${cms.escape(block.author)}</footer>` : ''}</blockquote>` : ''}${media ? `<div class="preview-media">${media}</div>` : ''}${items ? `<div class="timeline-items">${items}</div>` : ''}${block.takeaway ? `<div class="takeaway"><span class="eyebrow">KEY TAKEAWAY</span><p>${cms.escape(block.takeaway)}</p></div>` : ''}</section>`;
  };

  const save = () => {
    try { collectSettings(); cms.save(projects); $('#editorTitle').textContent = currentProject().title; $('#saveState').textContent = 'Saved locally in this browser'; renderProjects(); renderPreview(); }
    catch (error) { alert(error.message); }
  };

  Object.entries(cms.blockTypes).forEach(([value,label]) => $('#blockType').add(new Option(label,value)));
  Object.entries(cms.layouts).forEach(([value,label]) => $('#blockLayout').add(new Option(label,value)));
  $$('.tabs button').forEach(button => button.onclick = () => { $$('.tabs button').forEach(item => item.classList.toggle('active', item === button)); $$('.tab-panel').forEach(panel => panel.classList.toggle('active', panel.dataset.panel === button.dataset.tab)); if (button.dataset.tab === 'preview') renderPreview(); });
  form.addEventListener('input', markChanged);
  $('#saveProject').onclick = save;
  $('#addBlock').onclick = () => openBlockDialog();
  $('#saveBlock').onclick = saveBlock;
  $('#newProject').onclick = () => { const title = 'Untitled Project'; const id = `${slugify(title)}-${Date.now().toString().slice(-5)}`; projects.unshift(cms.migrateProject({ id, title, year:new Date().getFullYear().toString(), category:'directing', categories:['directing'], categoryLabel:'Directing', roles:[], status:'draft', accent:'#8e95a3', cover:'', video:'', summary:'', tools:'', client:'', featured:false, blocks:[] })); cms.save(projects); openProject(id); };
  $('#duplicateProject').onclick = () => { const source = currentProject(); if (!source) return; const copy = JSON.parse(JSON.stringify(source)); copy.id = `${source.id}-copy-${Date.now().toString().slice(-4)}`; copy.title = `${source.title} Copy`; copy.status = 'draft'; copy.blocks = copy.blocks.map(block => ({...block, id:cms.makeId('block')})); projects.unshift(copy); cms.save(projects); openProject(copy.id); };
  $('#deleteProject').onclick = () => { if (!currentId || !confirm('Delete this project?')) return; projects = projects.filter(project => project.id !== currentId); cms.save(projects); currentId = null; editor.hidden = true; empty.hidden = false; renderProjects(); };
  $('#exportBackup').onclick = () => download('shani-portfolio-backup.json', JSON.stringify(projects, null, 2), 'application/json');
  $('#exportSiteData').onclick = () => { save(); download('projects.js', cms.toProjectsJs(projects), 'text/javascript'); alert('Replace data/projects.js in your repository with the downloaded file, then Commit and Push.'); };
  $('#importButton').onclick = () => $('#importInput').click();
  $('#importInput').onchange = async event => { const file = event.target.files[0]; if (!file) return; try { let text = await file.text(); if (file.name.endsWith('.js')) text = text.replace(/^\s*window\.PORTFOLIO_PROJECTS\s*=\s*/, '').replace(/;\s*$/, ''); projects = JSON.parse(text).map(cms.migrateProject); cms.save(projects); currentId = null; renderProjects(); if (projects[0]) openProject(projects[0].id); } catch { alert('Could not import this file. Use a CMS backup JSON or projects.js export.'); } event.target.value = ''; };
  $('#resetData').onclick = () => { if (!confirm('Remove local edits and reload data/projects.js?')) return; cms.reset(); projects = loadProjects(); currentId = null; renderProjects(); if (projects[0]) openProject(projects[0].id); };
  function download(name, content, type) { const blob = new Blob([content], {type}); const link = document.createElement('a'); link.href = URL.createObjectURL(blob); link.download = name; link.click(); setTimeout(() => URL.revokeObjectURL(link.href), 500); }
  renderProjects();
  if (projects[0]) openProject(projects[0].id);
})();