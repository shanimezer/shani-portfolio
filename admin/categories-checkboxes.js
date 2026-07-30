(() => {
  const form = document.querySelector('#settingsForm');
  if (!form) return;

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