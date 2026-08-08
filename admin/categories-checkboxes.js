(() => {
  'use strict';

  if (!document.querySelector('script[data-smart-media]')) {
    const smartMedia = document.createElement('script');
    smartMedia.src = '../assets/smart-media.js?v=20260808-4';
    smartMedia.dataset.smartMedia = 'true';
    document.body.appendChild(smartMedia);
  }

  if (!document.querySelector('script[data-media-slideshow-admin]')) {
    const slideshowAdmin = document.createElement('script');
    slideshowAdmin.src = 'media-slideshow-admin.js?v=20260808-2';
    slideshowAdmin.dataset.mediaSlideshowAdmin = 'true';
    document.body.appendChild(slideshowAdmin);
  }

  const blockForm = document.querySelector('#blockForm');
  if (!blockForm) return;

  const style = document.createElement('style');
  style.dataset.blockEditorV2 = 'true';
  style.textContent = `
    #blockDialog{width:min(900px,calc(100% - 28px));overflow:hidden}
    #blockDialog .dialog-card{display:flex;flex-direction:column;max-height:92vh;padding:0;overflow:hidden}
    #blockDialog .dialog-head{padding:22px 22px 0}
    #blockDialog .dialog-grid{overflow-y:auto;padding:0 22px 24px;scrollbar-gutter:stable}
    #blockDialog .dialog-actions{position:sticky;bottom:0;z-index:5;margin:0;padding:16px 22px;border-top:1px solid var(--line);background:rgba(20,22,26,.96);backdrop-filter:blur(12px)}
    #blockDialog .block-disciplines-compact{grid-column:1/-1;margin:0;padding:16px;border:1px solid var(--line);border-radius:14px;background:#101216}
    #blockDialog .block-disciplines-compact legend{padding:0 7px;color:#d8dbe1;font-weight:700}
    #blockDialog .block-disciplines-compact .category-options{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px 10px;margin-top:4px}
    #blockDialog .block-disciplines-compact .category-options label{min-height:38px;display:flex;flex-direction:row;align-items:center;gap:8px;padding:8px 10px;border:1px solid rgba(255,255,255,.07);border-radius:9px;background:rgba(255,255,255,.018);font-size:12px}
    #blockDialog .block-disciplines-compact .category-options input{width:auto;margin:0}
    #blockDialog .block-disciplines-compact>small{display:block;margin-top:10px}
    #blockDialog .block-hierarchy-fields{grid-column:1/-1;margin:0;padding:16px;border:1px solid var(--line);border-radius:14px;background:#101216}
    #blockDialog .block-hierarchy-fields legend{padding:0 7px;color:#d8dbe1;font-weight:700}
    #blockDialog .hierarchy-choice-row{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    #blockDialog .hierarchy-choice{display:grid;grid-template-columns:auto 1fr;align-items:start;gap:10px;padding:12px;border:1px solid rgba(255,255,255,.08);border-radius:11px;background:rgba(255,255,255,.02);cursor:pointer}
    #blockDialog .hierarchy-choice:has(input:checked){border-color:#727b8b;background:rgba(157,166,183,.09)}
    #blockDialog .hierarchy-choice input{width:auto;margin:3px 0 0}
    #blockDialog .hierarchy-choice strong,#blockDialog .hierarchy-choice small{display:block}
    #blockDialog .hierarchy-choice small{margin-top:3px;color:var(--muted)}
    #blockDialog .parent-block-field{margin-top:12px}
    #blockDialog .parent-block-field[hidden]{display:none!important}
    @media(max-width:700px){
      #blockDialog{width:100%;max-width:none;max-height:100svh;height:100svh;border-radius:0}
      #blockDialog .dialog-card{max-height:100svh;height:100svh}
      #blockDialog .block-disciplines-compact .category-options{grid-template-columns:repeat(2,minmax(0,1fr))}
      #blockDialog .hierarchy-choice-row{grid-template-columns:1fr}
    }
  `;
  document.head.appendChild(style);

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