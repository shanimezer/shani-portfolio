(() => {
  const form = document.querySelector('#settingsForm');
  if (!form) return;

  const style = document.createElement('style');
  style.textContent = `
    .category-picker{margin:0;border:1px solid var(--line);border-radius:14px;padding:16px;background:#101216}
    .category-picker legend{padding:0 7px;color:#cfd2d9;font-size:13px}
    .category-picker>small{display:block;margin-top:12px;color:var(--muted);line-height:1.45}
    .category-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}
    .category-options label{display:flex;flex-direction:row;align-items:center;gap:9px;padding:11px 12px;border:1px solid var(--line);border-radius:10px;background:var(--panel);cursor:pointer}
    .category-options label:has(input:checked){border-color:#626b7a;background:var(--panel2);color:var(--text)}
    .category-options input{width:auto;margin:0;accent-color:#f1efe9}
    .category-options input:disabled{opacity:.7}
    @media(max-width:820px){.category-options{grid-template-columns:1fr 1fr}}
    @media(max-width:480px){.category-options{grid-template-columns:1fr}}
  `;
  document.head.appendChild(style);

  const hidden = form.elements.categories;
  const primary = form.elements.category;
  const checkboxes = [...form.querySelectorAll('[data-category-checkbox]')];

  const aliases = {
    directing: 'directing',
    director: 'directing',
    games: 'games',
    game: 'games',
    'game dev': 'games',
    'game development': 'games',
    production: 'production',
    producer: 'production',
    social: 'social',
    'social content': 'social',
    'social media': 'social',
    editing: 'editing',
    editor: 'editing',
    ai: 'ai',
    'ai creation': 'ai',
    'ai design': 'ai',
    'ai creator': 'ai',
    'artificial intelligence': 'ai'
  };

  const normalize = value => aliases[String(value || '').trim().toLowerCase()] || '';

  const valuesFromHidden = () => String(hidden.value || '')
    .split(',')
    .map(normalize)
    .filter(Boolean);

  const syncCheckboxesFromHidden = () => {
    const selected = new Set([normalize(primary.value), ...valuesFromHidden()].filter(Boolean));
    checkboxes.forEach(box => {
      box.checked = selected.has(box.value);
      box.disabled = box.value === primary.value;
    });
    syncHiddenFromCheckboxes(false);
  };

  const syncHiddenFromCheckboxes = (markChanged = true) => {
    const selected = new Set([primary.value]);
    checkboxes.forEach(box => { if (box.checked) selected.add(box.value); });
    hidden.value = [...selected].join(', ');
    if (markChanged) hidden.dispatchEvent(new Event('input', { bubbles: true }));
  };

  checkboxes.forEach(box => box.addEventListener('change', () => syncHiddenFromCheckboxes(true)));

  primary.addEventListener('change', () => {
    syncCheckboxesFromHidden();
    hidden.dispatchEvent(new Event('input', { bubbles: true }));
  });

  document.querySelector('#projectList')?.addEventListener('click', event => {
    if (event.target.closest('.project-item')) setTimeout(syncCheckboxesFromHidden, 0);
  });

  document.querySelector('#newProject')?.addEventListener('click', () => setTimeout(syncCheckboxesFromHidden, 0));
  document.querySelector('#duplicateProject')?.addEventListener('click', () => setTimeout(syncCheckboxesFromHidden, 0));
  document.querySelector('#resetData')?.addEventListener('click', () => setTimeout(syncCheckboxesFromHidden, 0));
  document.querySelector('#importInput')?.addEventListener('change', () => setTimeout(syncCheckboxesFromHidden, 50));

  setTimeout(syncCheckboxesFromHidden, 0);
})();