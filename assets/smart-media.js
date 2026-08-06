(() => {
  'use strict';

  const escapeAttribute = value => String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  const googleEmbedUrl = value => {
    if (!value) return '';
    try {
      const url = new URL(value, window.location.href);
      const host = url.hostname.replace(/^www\./, '');
      const parts = url.pathname.split('/').filter(Boolean);

      if (host === 'drive.google.com') {
        let id = '';
        const fileIndex = parts.indexOf('d');
        if (parts[0] === 'file' && fileIndex >= 0) id = parts[fileIndex + 1] || '';
        if (!id) id = url.searchParams.get('id') || '';
        if (id) return `https://drive.google.com/file/d/${id}/preview`;
      }

      if (host === 'docs.google.com') {
        const type = parts[0];
        const dIndex = parts.indexOf('d');
        const id = dIndex >= 0 ? parts[dIndex + 1] : '';
        if (type === 'document' && id) return `https://docs.google.com/document/d/${id}/preview`;
        if (type === 'presentation' && id) return `https://docs.google.com/presentation/d/${id}/preview`;
        if (type === 'spreadsheets' && id) return `https://docs.google.com/spreadsheets/d/${id}/preview?widget=true&headers=false`;
        if (type === 'forms') {
          const clean = value.split('?')[0].replace(/\/edit$/, '/viewform');
          return `${clean}${clean.includes('?') ? '&' : '?'}embedded=true`;
        }
      }
    } catch (_) {}
    return '';
  };

  const isGoogleMedia = value => /(?:drive|docs)\.google\.com/i.test(String(value || ''));

  const iframeMarkup = (url, title = 'Embedded Google Drive file') =>
    `<div class="smart-media-frame"><iframe src="${escapeAttribute(url)}" title="${escapeAttribute(title)}" loading="lazy" allow="autoplay; fullscreen" allowfullscreen></iframe></div>`;

  const upgradeIframe = iframe => {
    if (iframe.dataset.smartMediaReady === 'true') return;
    const embed = googleEmbedUrl(iframe.getAttribute('src'));
    if (!embed) return;
    iframe.src = embed;
    iframe.loading = 'lazy';
    iframe.allow = 'autoplay; fullscreen';
    iframe.setAttribute('allowfullscreen', '');
    iframe.dataset.smartMediaReady = 'true';
    iframe.closest('.block-video, .video-frame')?.classList.add('smart-media-frame');
  };

  const upgradeImage = image => {
    if (image.dataset.smartMediaReady === 'true') return;
    const source = image.getAttribute('src');
    const embed = googleEmbedUrl(source);
    if (!embed) return;
    const figure = image.closest('figure');
    const holder = document.createElement('div');
    holder.innerHTML = iframeMarkup(embed, image.alt || 'Embedded Google Drive file');
    const frame = holder.firstElementChild;
    if (figure) figure.replaceChild(frame, image);
    else image.replaceWith(frame);
  };

  const upgradeLink = link => {
    if (link.dataset.smartMediaReady === 'true') return;
    const embed = googleEmbedUrl(link.href);
    if (!embed || !link.matches('[data-embed-media], .smart-media-link')) return;
    const holder = document.createElement('div');
    holder.innerHTML = iframeMarkup(embed, link.textContent.trim() || 'Embedded Google file');
    link.replaceWith(holder.firstElementChild);
  };

  const upgrade = root => {
    const scope = root?.querySelectorAll ? root : document;
    scope.querySelectorAll('iframe[src*="drive.google.com"], iframe[src*="docs.google.com"]').forEach(upgradeIframe);
    scope.querySelectorAll('img[src*="drive.google.com"], img[src*="docs.google.com"]').forEach(upgradeImage);
    scope.querySelectorAll('a[href*="drive.google.com"], a[href*="docs.google.com"]').forEach(upgradeLink);
  };

  const style = document.createElement('style');
  style.textContent = `
    .smart-media-frame{position:relative;width:100%;aspect-ratio:16/9;min-height:360px;overflow:hidden;border-radius:14px;background:#111318;border:1px solid rgba(255,255,255,.1)}
    .smart-media-frame iframe{display:block;width:100%;height:100%;min-height:360px;border:0;background:#fff}
    figure>.smart-media-frame{margin:0}
    @media(max-width:700px){.smart-media-frame,.smart-media-frame iframe{min-height:260px}}
  `;
  document.head.appendChild(style);

  window.SmartMedia = { googleEmbedUrl, isGoogleMedia, upgrade };

  const start = () => {
    upgrade(document);
    new MutationObserver(mutations => {
      mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) {
          if (node.matches?.('iframe, img, a')) upgrade(node.parentElement || document);
          else upgrade(node);
        }
      }));
    }).observe(document.body, { childList:true, subtree:true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once:true });
  else start();
})();
