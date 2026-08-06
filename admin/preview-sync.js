(() => {
  const canvas = document.querySelector('#previewCanvas');
  if (!canvas) return;

  const refreshPreviewHierarchy = () => {
    setTimeout(() => {
      const marker = document.createElement('span');
      marker.hidden = true;
      marker.dataset.previewSync = Date.now().toString();
      canvas.appendChild(marker);
      marker.remove();
    }, 160);
  };

  document.querySelector('#saveBlock')?.addEventListener('click', refreshPreviewHierarchy);
  document.querySelector('#saveProject')?.addEventListener('click', refreshPreviewHierarchy);
  document.querySelector('#projectList')?.addEventListener('click', refreshPreviewHierarchy);
  document.querySelectorAll('[data-tab="preview"]').forEach(button => button.addEventListener('click', refreshPreviewHierarchy));
})();