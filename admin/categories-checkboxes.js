(() => {
  'use strict';

  if (!document.querySelector('link[data-block-editor-v2]')) {
    const editorStyles = document.createElement('link');
    editorStyles.rel = 'stylesheet';
    editorStyles.href = 'block-editor-v2.css?v=20260806-1';
    editorStyles.dataset.blockEditorV2 = 'true';
    document.head.appendChild(editorStyles);
  }

  if (!document.querySelector('script[data-smart-media]')) {
    const smartMedia = document.createElement('script');
    smartMedia.src = '../assets/smart-media.js?v=20260806-2';
    smartMedia.dataset.smartMedia = 'true';
    document.body.appendChild(smartMedia);
  }

  const blockForm = document.querySelector('#blockForm');
  if (!blockForm) return;

  const disciplinePicker = [...blockForm.querySelectorAll('fieldset')]
    .find(fieldset => fieldset.querySelector('legend')?.textContent.trim() === 'Block disciplines');
  const disciplineOptions = disciplinePicker?.querySelector('.category-options');

  if (disciplineOptions && !disciplineOptions.querySelector('input[value="narrativeDesign"]')) {
    disciplineOptions.insertAdjacentHTML(
      'beforeend',
      '<label><input type="checkbox" name="disciplines" value="narrativeDesign"> Narrative Design</label>'
    );
  }

  disciplinePicker?.classList.add('block-disciplines-compact');

  let hierarchy = blockForm.querySelector('.block-hierarchy-fields');
  const oldLevelSelect = hierarchy?.querySelector('select[name="level"]');
  const oldParentSelect = hierarchy?.querySelector('select[name="parentId"]');
  const initialLevel = oldLevelSelect?.value || 'primary';
  const initialParent = oldParentSelect?.value || '';

  if (hierarchy) hierarchy.remove();

  hierarchy = document.createElement('fieldset');
  hierarchy.className = 'block-hierarchy-fields';
  hierarchy.innerHTML = `
    <legend>Hierarchy</legend>
    <div class="hierarchy-choice-row">
      <label class="hierarchy-choice">
        <input type="radio" name="levelChoice" value="primary" ${initialLevel !== 'secondary' ? 'checked' : ''}>
        <span><strong>Main block</strong><small>Starts a new section.</small></span>
      </label>
      <label class="hierarchy-choice">
        <input type="radio" name="levelChoice" value="secondary" ${initialLevel === 'secondary' ? 'checked' : ''}>
        <span><strong>Sub-block</strong><small>Lives inside a main block.</small></span>
      </label>
    </div>
    <input type="hidden" name="level" value="${initialLevel === 'secondary' ? 'secondary' : 'primary'}">
    <label class="parent-block-field" data-parent-field ${initialLevel === 'secondary' ? '' : 'hidden'}>
      Parent block
      <select name="parentId"><option value="">Choose a main block</option></select>
    </label>`;

  if (disciplinePicker) disciplinePicker.insertAdjacentElement('afterend', hierarchy);
  else blockForm.querySelector('.dialog-grid')?.prepend(hierarchy);

  const levelField = blockForm.elements.level;
  const parentField = blockForm.elements.parentId;
  const parentWrap = hierarchy.querySelector('[data-parent-field]');
  const choices = [...hierarchy.querySelectorAll('input[name="levelChoice"]')];

  if (parentField && initialParent) parentField.dataset.pendingValue = initialParent;

  const syncFromHiddenLevel = () => {
    const level = levelField?.value === 'secondary' ? 'secondary' : 'primary';
    choices.forEach(choice => { choice.checked = choice.value === level; });
    if (parentWrap) parentWrap.hidden = level !== 'secondary';
    if (level !== 'secondary' && parentField) parentField.value = '';
  };

  choices.forEach(choice => {
    choice.addEventListener('change', () => {
      if (!choice.checked || !levelField) return;
      levelField.value = choice.value;
      levelField.dispatchEvent(new Event('change', { bubbles:true }));
      syncFromHiddenLevel();
    });
  });

  levelField?.addEventListener('change', syncFromHiddenLevel);

  const dialog = blockForm.closest('dialog');
  const refresh = () => requestAnimationFrame(() => {
    syncFromHiddenLevel();
    if (parentField?.dataset.pendingValue && [...parentField.options].some(option => option.value === parentField.dataset.pendingValue)) {
      parentField.value = parentField.dataset.pendingValue;
      delete parentField.dataset.pendingValue;
    }
  });

  dialog?.addEventListener('toggle', () => { if (dialog.open) refresh(); });
  syncFromHiddenLevel();
})();