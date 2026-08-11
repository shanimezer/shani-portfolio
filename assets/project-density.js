(() => {
  'use strict';
  const slug = new URLSearchParams(location.search).get('slug') || '';
  if (!slug) return;
  document.body.classList.add(`project-${slug.replace(/[^a-z0-9-]/gi,'').toLowerCase()}`);
})();
