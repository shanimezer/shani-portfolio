(() => {
  'use strict';

  if (!document.querySelector('script[data-smart-media]')) {
    const smartMedia = document.createElement('script');
    smartMedia.src = '../assets/smart-media.js?v=20260806-1';
    smartMedia.dataset.smartMedia = 'true';
    document.body.appendChild(smartMedia);
  }

  const blockForm = document.querySelector('#blockForm');
  if (!blockForm) return;

  const style = document.createElement('style');
  style.textContent = `
    .block-hierarchy-fields{grid-column:1/-1;display:grid;grid-template-columns:1fr 1fr;gap:12px;padding:15px;border:1px solid var(--line);border-radius:14px;background:#101216}
    .block-hierarchy-fields small{display:block;margin-top:7px;color:var(--muted);line-height:1.4}
    .block-card.is-secondary{margin-left:34px;width:calc(100% - 34px);border-left:3px solid var(--project-accent,#8e95a3);background:linear-gradient(90deg,rgba(255,255,255,.035),transparent)}
    .block-card.is-secondary .block-index{color:var(--muted)}
    #previewCanvas .preview-sub-blocks{display:grid;gap:18px;margin-top:30px;padding:4px 0 0 24px;border-left:1px solid var(--line)}
    #previewCanvas .preview-section.is-sub-block{margin:0;padding:24px 0 10px;border:0;background:transparent}
    #previewCanvas .preview-section.is-sub-block+.preview-section.is-sub-block{border-top:1px solid var(--line)}
    #previewCanvas .preview-section.is-sub-block h2{font-size:clamp(1.45rem,3vw,2.3rem);margin:8px 0 14px}
    @media(max-width:620px){.block-hierarchy-fields{grid-template-columns:1fr}.block-card.is-secondary{margin-left:16px;width:calc(100% - 16px)}#previewCanvas .preview-sub-blocks{padding-left:15px}}
  `;
  document.head.appendChild(style);

  const disciplinePicker = [...blockForm.querySelectorAll('fieldset')]
    .find(fieldset => fieldset.querySelector('legend')?.textContent.trim() === 'Block disciplines');
  const disciplineOptions = disciplinePicker?.querySelector('.category-options');
  if (disciplineOptions && !disciplineOptions.querySelector('input[value="narrativeDesign"]')) {
    disciplineOptions.insertAdjacentHTML('beforeend', '<label><input type="checkbox" name="disciplines" value="narrativeDesign"> Narrative Design</label>');
  }

  const titleLabel = blockForm.elements.title?.closest('label');
  if (titleLabel && !blockForm.querySelector('.block-hierarchy-fields')) {
    const hierarchy = document.createElement('div');
    hierarchy.className = 'block-hierarchy-fields';
    hierarchy.innerHTML = `
      <label>
        Block hierarchy
        <select name="level">
          <option value="primary">Main block</option>
          <option value="secondary">Sub-block</option>
        </select>
        <small>Sub-blocks are displayed inside a main block.</small>
      </label>
      <label data-parent-field hidden>
        Parent main block
        <select name="parentId"><option value="">Choose a main block</option></select>
        <small>Select the section that should contain this explanation.</small>
      </label>`;
    titleLabel.insertAdjacentElement('beforebegin', hierarchy);
  }

  const levelField = blockForm.elements.level;
  const parentField = blockForm.elements.parentId;
  const parentWrap = parentField?.closest('[data-parent-field]');

  const syncVisibility = () => {
    const isSecondary = levelField?.value === 'secondary';
    if (parentWrap) parentWrap.hidden = !isSecondary;
    if (!isSecondary && parentField) parentField.value = '';
  };

  levelField?.addEventListener('change', syncVisibility);
  syncVisibility();
})();