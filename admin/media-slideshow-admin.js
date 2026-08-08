(() => {
  'use strict';

  const dialog = document.getElementById('blockDialog');
  const form = document.getElementById('blockForm');
  if (!dialog || !form) return;

  const mediaField = form.elements.media;
  const mediaLabel = mediaField?.closest('label');
  if (!mediaField || !mediaLabel) return;

  const shell = document.createElement('fieldset');
  shell.className = 'span-2 media-mini-block slideshow-mini-block';
  shell.innerHTML = `
    <legend>Extra media mini-block</legend>
    <label class="check slideshow-enable"><input type="checkbox" data-slideshow-enabled> Add slideshow / storyboard</label>
    <div data-slideshow-fields hidden>
      <label>Transition
        <select data-slideshow-transition>
          <option value="slide">Slide</option>
          <option value="fade">Fade</option>
          <option value="page">Page turn</option>
        </select>
      </label>
      <label class="span-2">Slideshow images
        <textarea rows="7" data-slideshow-items placeholder="One image per line:\nimage path or URL | Optional title | Optional caption"></textarea>
        <small>This creates a separate slideshow inside the current block. Your regular Media items stay unchanged.</small>
      </label>
    </div>`;
  mediaLabel.insertAdjacentElement('afterend', shell);

  const enabled = shell.querySelector('[data-slideshow-enabled]');
  const fields = shell.querySelector('[data-slideshow-fields]');
  const transition = shell.querySelector('[data-slideshow-transition]');
  const slides = shell.querySelector('[data-slideshow-items]');
  const saveButton = document.getElementById('saveBlock');

  const startPattern = /^slideshow:\/\/start(?:\?transition=([a-z-]+))?/i;
  const endPattern = /^slideshow:\/\/end/i;
  let loading = false;

  const setOpen = value => {
    enabled.checked = value;
    fields.hidden = !value;
  };

  const splitMedia = value => {
    const normal = [];
    const groups = [];
    let current = null;
    String(value || '').split('\n').forEach(raw => {
      const line = raw.trim();
      if (!line) return;
      const first = line.split('|')[0].trim();
      const start = first.match(startPattern);
      if (start) {
        current = { transition: start[1] || 'slide', lines: [] };
        groups.push(current);
        return;
      }
      if (endPattern.test(first)) {
        current = null;
        return;
      }
      if (current) current.lines.push(line);
      else normal.push(line);
    });
    return { normal, groups };
  };

  const mergeIntoMedia = () => {
    if (loading) return;
    const parsed = splitMedia(mediaField.value);
    const output = [...parsed.normal];
    if (enabled.checked) {
      const slideLines = String(slides.value || '').split('\n').map(line => line.trim()).filter(Boolean);
      if (slideLines.length) {
        output.push(`slideshow://start?transition=${transition.value || 'slide'} | Slideshow`);
        output.push(...slideLines);
        output.push('slideshow://end | End slideshow');
      }
    }
    mediaField.value = output.join('\n');
    mediaField.dispatchEvent(new Event('input', { bubbles:true }));
  };

  const loadFromMedia = () => {
    loading = true;
    const parsed = splitMedia(mediaField.value);
    const group = parsed.groups[0];
    mediaField.value = parsed.normal.join('\n');
    if (group) {
      setOpen(true);
      transition.value = ['slide','fade','page'].includes(group.transition) ? group.transition : 'slide';
      slides.value = group.lines.join('\n');
    } else {
      setOpen(false);
      transition.value = 'slide';
      slides.value = '';
    }
    loading = false;
    mergeIntoMedia();
  };

  enabled.addEventListener('change', () => {
    setOpen(enabled.checked);
    mergeIntoMedia();
  });
  transition.addEventListener('change', mergeIntoMedia);
  slides.addEventListener('input', mergeIntoMedia);
  slides.addEventListener('change', mergeIntoMedia);

  new MutationObserver(() => {
    if (dialog.open) requestAnimationFrame(() => requestAnimationFrame(loadFromMedia));
  }).observe(dialog, { attributes:true, attributeFilter:['open'] });

  // Keep a final safety sync immediately before the main admin save handler reads Media items.
  saveButton?.addEventListener('pointerdown', mergeIntoMedia, true);
  saveButton?.addEventListener('click', mergeIntoMedia, true);
  form.addEventListener('submit', mergeIntoMedia, true);

  const style = document.createElement('style');
  style.textContent = `
    .media-mini-block{grid-column:span 2;border:1px solid var(--line);border-radius:14px;padding:16px;margin:0;display:grid;gap:14px;background:rgba(255,255,255,.018)}
    .media-mini-block legend{padding:0 8px;color:var(--text);font-weight:700}
    .media-mini-block [data-slideshow-fields]{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
    .media-mini-block [data-slideshow-fields][hidden]{display:none}
    .media-mini-block textarea{min-height:150px}
    @media(max-width:820px){.media-mini-block{grid-column:auto}.media-mini-block [data-slideshow-fields]{grid-template-columns:1fr}.media-mini-block .span-2{grid-column:auto}}
  `;
  document.head.appendChild(style);
})();