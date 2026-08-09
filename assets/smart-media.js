(() => {
  'use strict';

  const escapeAttribute = value => String(value || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;');

  const googleFileMeta = value => {
    if (!value) return { id:'', type:'file' };
    try {
      const url = new URL(value, window.location.href);
      const host = url.hostname.replace(/^www\./, '');
      const parts = url.pathname.split('/').filter(Boolean);
      let id = '';
      let type = 'file';

      if (host === 'drive.google.com') {
        const dIndex = parts.indexOf('d');
        if (parts[0] === 'file' && dIndex >= 0) id = parts[dIndex + 1] || '';
        if (!id) id = url.searchParams.get('id') || '';
      }

      if (host === 'docs.google.com') {
        type = parts[0] || 'file';
        const dIndex = parts.indexOf('d');
        id = dIndex >= 0 ? parts[dIndex + 1] || '' : '';
      }

      return { id, type };
    } catch (_) {
      return { id:'', type:'file' };
    }
  };

  const googleEmbedUrl = value => {
    if (!value) return '';
    try {
      const url = new URL(value, window.location.href);
      const host = url.hostname.replace(/^www\./, '');
      const parts = url.pathname.split('/').filter(Boolean);
      if (host === 'drive.google.com') {
        const { id } = googleFileMeta(value);
        if (id) return `https://drive.google.com/file/d/${id}/preview`;
      }
      if (host === 'docs.google.com') {
        const type = parts[0];
        const { id } = googleFileMeta(value);
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

  const googleThumbnailUrl = value => {
    const { id } = googleFileMeta(value);
    return id ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(id)}&sz=w1200` : '';
  };

  const isGoogleMedia = value => /(?:drive|docs)\.google\.com/i.test(String(value || ''));

  const labelFor = value => {
    try {
      const url = new URL(value, window.location.href);
      const path = url.pathname;
      if (/\/document\//.test(path)) return 'Google Doc';
      if (/\/spreadsheets\//.test(path)) return 'Google Sheet';
      if (/\/presentation\//.test(path)) return 'Google Slides';
      if (/\/forms\//.test(path)) return 'Google Form';
      if (/drive\.google\.com/.test(url.hostname)) return 'Google Drive File';
    } catch (_) {}
    return 'Google Drive File';
  };

  const makePreview = (embedUrl, sourceUrl, title = '') => {
    const frame = document.createElement('div');
    frame.className = 'smart-media-frame smart-media-preview';
    frame.dataset.embedUrl = embedUrl;
    frame.dataset.sourceUrl = sourceUrl || embedUrl;
    const thumb = googleThumbnailUrl(sourceUrl || embedUrl);
    frame.innerHTML = `
      ${thumb ? `<img class="smart-media-thumbnail" src="${escapeAttribute(thumb)}" alt="" loading="lazy" referrerpolicy="no-referrer">` : ''}
      <div class="smart-media-preview-shade"></div>
      <div class="smart-media-preview-inner">
        <span class="smart-media-preview-icon">▦</span>
        <div class="smart-media-preview-copy">
          <strong>${escapeAttribute(title || labelFor(sourceUrl || embedUrl))}</strong>
          <small>Open the full document without leaving the portfolio</small>
        </div>
      </div>
      <button type="button" class="smart-media-fullscreen" aria-label="Open document full screen"><span>Open full screen</span><b>⛶</b></button>
    `;

    const thumbnail = frame.querySelector('.smart-media-thumbnail');
    thumbnail?.addEventListener('load', () => frame.classList.add('has-thumbnail'));
    thumbnail?.addEventListener('error', () => {
      thumbnail.remove();
      frame.classList.remove('has-thumbnail');
    });

    frame.querySelector('.smart-media-fullscreen')?.addEventListener('click', event => {
      event.preventDefault();
      event.stopPropagation();
      openViewer(frame.dataset.embedUrl, title || labelFor(sourceUrl || embedUrl));
    });
    return frame;
  };

  const openViewer = async (embedUrl, title) => {
    if (!embedUrl) return;
    let overlay = document.querySelector('.smart-media-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'smart-media-overlay';
      overlay.innerHTML = `<div class="smart-media-overlay-shell"><button type="button" class="smart-media-overlay-close" aria-label="Close full screen">×</button><div class="smart-media-overlay-content"></div></div>`;
      document.body.appendChild(overlay);
      overlay.querySelector('.smart-media-overlay-close')?.addEventListener('click', closeViewer);
      overlay.addEventListener('click', event => { if (event.target === overlay) closeViewer(); });
    }
    const content = overlay.querySelector('.smart-media-overlay-content');
    content.innerHTML = `<iframe src="${escapeAttribute(embedUrl)}" title="${escapeAttribute(title || 'Google Drive document')}" allow="fullscreen" allowfullscreen></iframe>`;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('smart-media-open');
    try { await overlay.requestFullscreen?.(); } catch (_) {}
  };

  const closeViewer = async () => {
    const overlay = document.querySelector('.smart-media-overlay');
    if (!overlay) return;
    if (document.fullscreenElement === overlay) {
      try { await document.exitFullscreen?.(); } catch (_) {}
    }
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    const content = overlay.querySelector('.smart-media-overlay-content');
    if (content) content.innerHTML = '';
    document.body.classList.remove('smart-media-open');
  };

  const upgradeIframe = iframe => {
    if (iframe.dataset.smartMediaReady === 'true') return;
    const source = iframe.getAttribute('src') || '';
    const embed = googleEmbedUrl(source);
    if (!embed) return;
    const frame = iframe.closest('.block-video, .video-frame') || iframe.parentElement;
    const title = iframe.getAttribute('title') || labelFor(source);
    const preview = makePreview(embed, source, title);
    iframe.dataset.smartMediaReady = 'true';
    if (frame) frame.replaceWith(preview);
    else iframe.replaceWith(preview);
  };

  const upgradeImage = image => {
    if (image.dataset.smartMediaReady === 'true') return;
    const source = image.getAttribute('src') || '';
    const embed = googleEmbedUrl(source);
    if (!embed) return;
    const figure = image.closest('figure');
    const preview = makePreview(embed, source, image.alt || labelFor(source));
    image.dataset.smartMediaReady = 'true';
    if (figure) figure.replaceChild(preview, image);
    else image.replaceWith(preview);
  };

  const upgradeLink = link => {
    if (link.dataset.smartMediaReady === 'true') return;
    const source = link.href || '';
    const embed = googleEmbedUrl(source);
    if (!embed || !link.matches('[data-embed-media], .smart-media-link')) return;
    const preview = makePreview(embed, source, link.textContent.trim() || labelFor(source));
    link.dataset.smartMediaReady = 'true';
    link.replaceWith(preview);
  };

  const upgrade = root => {
    const scope = root?.querySelectorAll ? root : document;
    scope.querySelectorAll('iframe[src*="drive.google.com"], iframe[src*="docs.google.com"]').forEach(upgradeIframe);
    scope.querySelectorAll('img[src*="drive.google.com"], img[src*="docs.google.com"]').forEach(upgradeImage);
    scope.querySelectorAll('a[href*="drive.google.com"], a[href*="docs.google.com"]').forEach(upgradeLink);
  };

  const style = document.createElement('style');
  style.textContent = `
    .smart-media-frame{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;border-radius:14px;background:#111318;border:1px solid rgba(255,255,255,.1);overflow-anchor:none;contain:layout paint}
    .smart-media-preview{display:grid;place-items:center;isolation:isolate}
    .smart-media-thumbnail{position:absolute;inset:0;z-index:0;width:100%;height:100%;object-fit:cover;opacity:0;transform:scale(1.015);transition:opacity .3s ease}
    .smart-media-preview.has-thumbnail .smart-media-thumbnail{opacity:.88}
    .smart-media-preview-shade{position:absolute;inset:0;z-index:1;background:linear-gradient(180deg,rgba(8,10,14,.08),rgba(8,10,14,.25) 45%,rgba(8,10,14,.78));pointer-events:none}
    .smart-media-preview:not(.has-thumbnail) .smart-media-preview-shade{background:radial-gradient(circle at 50% 35%,rgba(255,255,255,.055),transparent 36%),#111318}
    .smart-media-preview-inner{position:relative;z-index:2;display:flex;align-items:center;gap:16px;padding:24px;text-align:left;color:#f4f2ec;align-self:end;justify-self:start;margin:0 0 12px 12px;max-width:calc(100% - 120px)}
    .smart-media-preview-icon{display:grid;place-items:center;width:54px;height:54px;flex:0 0 54px;border-radius:14px;background:rgba(8,10,14,.76);border:1px solid rgba(255,255,255,.12);backdrop-filter:blur(8px);font-size:24px;color:#d9d7d1}
    .smart-media-preview-copy{display:grid;gap:4px;text-shadow:0 1px 12px rgba(0,0,0,.5)}
    .smart-media-preview-copy strong{font:600 16px/1.2 DM Sans,sans-serif}.smart-media-preview-copy small{color:#d2d4d8;font:400 12px/1.4 DM Sans,sans-serif}
    .smart-media-fullscreen{position:absolute;right:12px;bottom:12px;z-index:8;display:inline-flex;align-items:center;gap:8px;padding:8px 11px;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(8,10,14,.82);color:#fff;font:600 12px/1.1 DM Sans,sans-serif;backdrop-filter:blur(10px);cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.28)}
    .smart-media-fullscreen b{font-size:16px;line-height:1}
    .smart-media-overlay{position:fixed;inset:0;z-index:99999;display:none;background:#050608}
    .smart-media-overlay.open{display:block}
    .smart-media-overlay-shell{position:absolute;inset:0;background:#050608}
    .smart-media-overlay-content{position:absolute;inset:0}.smart-media-overlay-content iframe{display:block;width:100%;height:100%;border:0;background:#fff}
    .smart-media-overlay-close{position:absolute;top:max(16px,env(safe-area-inset-top));right:16px;z-index:4;width:46px;height:46px;border:1px solid rgba(255,255,255,.28);border-radius:999px;background:rgba(8,10,14,.8);color:#fff;font-size:28px;line-height:1;cursor:pointer}
    body.smart-media-open{overflow:hidden!important}
    @media(max-width:700px){.smart-media-fullscreen span{display:none}.smart-media-fullscreen{width:40px;height:40px;justify-content:center;padding:0}.smart-media-preview-inner{padding:16px;margin:0 44px 0 0;max-width:none}.smart-media-preview-icon{width:44px;height:44px;flex-basis:44px}.smart-media-preview-copy small{display:none}}
  `;
  document.head.appendChild(style);

  window.SmartMedia = { googleEmbedUrl, googleThumbnailUrl, isGoogleMedia, upgrade };

  const start = () => {
    upgrade(document);
    document.addEventListener('fullscreenchange', () => {
      const overlay = document.querySelector('.smart-media-overlay');
      if (overlay?.classList.contains('open') && !document.fullscreenElement) closeViewer();
    });
    window.addEventListener('keydown', event => { if (event.key === 'Escape') closeViewer(); });
    new MutationObserver(mutations => mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
      if (node.nodeType === 1) {
        if (node.matches?.('iframe, img, a')) upgrade(node.parentElement || document);
        else upgrade(node);
      }
    }))).observe(document.body, { childList:true, subtree:true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once:true });
  else start();
})();