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
    `<div class="smart-media-frame"><iframe src="${escapeAttribute(url)}" title="${escapeAttribute(title)}" loading="lazy" allow="autoplay; fullscreen" allowfullscreen tabindex="-1"></iframe></div>`;

  // Preserve the user's visual position only while a media node is being replaced.
  // This avoids layout-shift jumps without intercepting normal scroll or TOC navigation.
  const preserveVisualAnchor = (anchor, mutate) => {
    if (!anchor || typeof mutate !== 'function') return mutate?.();
    const beforeTop = anchor.getBoundingClientRect().top;
    const beforeY = window.scrollY || 0;
    const result = mutate();

    const settle = () => {
      const liveAnchor = result?.isConnected ? result : (anchor.isConnected ? anchor : null);
      if (!liveAnchor) return;
      const afterTop = liveAnchor.getBoundingClientRect().top;
      const delta = afterTop - beforeTop;
      if (Math.abs(delta) > 1 && Math.abs((window.scrollY || 0) - beforeY) < 8) {
        window.scrollBy({ top: delta, left: 0, behavior: 'auto' });
      }
    };

    requestAnimationFrame(() => requestAnimationFrame(settle));
    return result;
  };

  const stabilizeFrameLoad = frame => {
    if (!frame || frame.dataset.smartMediaLoadStable === 'true') return;
    frame.dataset.smartMediaLoadStable = 'true';
    const iframe = frame.querySelector('iframe');
    if (!iframe) return;

    iframe.addEventListener('load', () => {
      // Keep the embed's outer dimensions fixed. Never move the page here.
      frame.style.minHeight = frame.style.minHeight || '';
    }, { passive:true });
  };

  const addInteractionShield = frame => {
    if (!frame || frame.querySelector(':scope > .smart-media-shield')) return;
    const shield = document.createElement('div');
    shield.className = 'smart-media-shield';
    shield.setAttribute('aria-hidden', 'true');
    frame.appendChild(shield);
  };

  const addFullscreenControl = frame => {
    if (!frame || frame.querySelector(':scope > .smart-media-fullscreen')) return;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'smart-media-fullscreen';
    button.setAttribute('aria-label', 'Open document full screen');
    button.innerHTML = '<span>Open full screen</span><b>⛶</b>';
    button.addEventListener('click', async event => {
      event.preventDefault();
      event.stopPropagation();
      try {
        if (document.fullscreenElement === frame) {
          await document.exitFullscreen?.();
          return;
        }
        if (frame.requestFullscreen) await frame.requestFullscreen();
        else if (frame.webkitRequestFullscreen) frame.webkitRequestFullscreen();
      } catch (_) {}
    });
    frame.appendChild(button);
  };

  const prepareFrame = frame => {
    if (!frame) return;
    frame.classList.add('smart-media-frame');
    const iframe = frame.querySelector('iframe');
    if (iframe) {
      iframe.tabIndex = -1;
      iframe.setAttribute('aria-hidden', 'true');
    }
    addInteractionShield(frame);
    addFullscreenControl(frame);
    stabilizeFrameLoad(frame);
  };

  const upgradeIframe = iframe => {
    if (iframe.dataset.smartMediaReady === 'true') {
      prepareFrame(iframe.closest('.smart-media-frame, .block-video, .video-frame'));
      return;
    }
    const embed = googleEmbedUrl(iframe.getAttribute('src'));
    if (!embed) return;
    const frame = iframe.closest('.block-video, .video-frame') || iframe.parentElement;
    preserveVisualAnchor(frame || iframe, () => {
      iframe.src = embed;
      iframe.loading = 'lazy';
      iframe.allow = 'autoplay; fullscreen';
      iframe.setAttribute('allowfullscreen', '');
      iframe.tabIndex = -1;
      iframe.dataset.smartMediaReady = 'true';
      prepareFrame(frame);
      return frame || iframe;
    });
  };

  const upgradeImage = image => {
    if (image.dataset.smartMediaReady === 'true') return;
    const source = image.getAttribute('src');
    const embed = googleEmbedUrl(source);
    if (!embed) return;
    const figure = image.closest('figure');
    const anchor = figure || image;
    preserveVisualAnchor(anchor, () => {
      const holder = document.createElement('div');
      holder.innerHTML = iframeMarkup(embed, image.alt || 'Embedded Google Drive file');
      const frame = holder.firstElementChild;
      prepareFrame(frame);
      if (figure) figure.replaceChild(frame, image);
      else image.replaceWith(frame);
      return figure || frame;
    });
  };

  const upgradeLink = link => {
    if (link.dataset.smartMediaReady === 'true') return;
    const embed = googleEmbedUrl(link.href);
    if (!embed || !link.matches('[data-embed-media], .smart-media-link')) return;
    preserveVisualAnchor(link, () => {
      const holder = document.createElement('div');
      holder.innerHTML = iframeMarkup(embed, link.textContent.trim() || 'Embedded Google file');
      const frame = holder.firstElementChild;
      prepareFrame(frame);
      link.replaceWith(frame);
      return frame;
    });
  };

  const upgrade = root => {
    const scope = root?.querySelectorAll ? root : document;
    scope.querySelectorAll('iframe[src*="drive.google.com"], iframe[src*="docs.google.com"]').forEach(upgradeIframe);
    scope.querySelectorAll('img[src*="drive.google.com"], img[src*="docs.google.com"]').forEach(upgradeImage);
    scope.querySelectorAll('a[href*="drive.google.com"], a[href*="docs.google.com"]').forEach(upgradeLink);
  };

  const syncFullscreenState = () => {
    document.querySelectorAll('.smart-media-frame').forEach(frame => {
      const active = document.fullscreenElement === frame || document.webkitFullscreenElement === frame;
      frame.classList.toggle('is-fullscreen', active);
      const iframe = frame.querySelector('iframe');
      if (iframe) {
        iframe.style.pointerEvents = active ? 'auto' : 'none';
        iframe.tabIndex = active ? 0 : -1;
        if (active) iframe.removeAttribute('aria-hidden');
        else iframe.setAttribute('aria-hidden', 'true');
      }
    });
  };

  const style = document.createElement('style');
  style.textContent = `
    .smart-media-frame{position:relative;width:100%;height:clamp(360px,48vw,620px);min-height:360px;overflow:hidden;border-radius:14px;background:#111318;border:1px solid rgba(255,255,255,.1);overflow-anchor:none;contain:layout paint}
    .smart-media-frame iframe{display:block;width:100%;height:100%;min-height:0;border:0;background:#fff;pointer-events:none}
    .smart-media-shield{position:absolute;inset:0;z-index:6;background:transparent;touch-action:pan-y;overscroll-behavior:contain;cursor:default}
    .smart-media-fullscreen{position:absolute;right:12px;bottom:12px;z-index:8;display:inline-flex;align-items:center;gap:8px;padding:8px 11px;border:1px solid rgba(255,255,255,.2);border-radius:999px;background:rgba(8,10,14,.82);color:#fff;font:600 12px/1.1 DM Sans,sans-serif;backdrop-filter:blur(10px);cursor:pointer;box-shadow:0 8px 24px rgba(0,0,0,.28)}
    .smart-media-fullscreen b{font-size:16px;line-height:1}
    .smart-media-frame:fullscreen,.smart-media-frame:-webkit-full-screen{width:100vw!important;height:100vh!important;max-width:none!important;min-height:100vh!important;aspect-ratio:auto!important;border:0!important;border-radius:0!important;background:#fff;contain:none}
    .smart-media-frame:fullscreen iframe,.smart-media-frame:-webkit-full-screen iframe{width:100%!important;height:100%!important;min-height:100vh!important;pointer-events:auto!important}
    .smart-media-frame:fullscreen .smart-media-shield,.smart-media-frame:-webkit-full-screen .smart-media-shield{display:none}
    .smart-media-frame:fullscreen .smart-media-fullscreen,.smart-media-frame:-webkit-full-screen .smart-media-fullscreen{right:18px;bottom:18px}
    figure>.smart-media-frame{margin:0}
    @media(max-width:700px){.smart-media-frame{height:300px;min-height:300px}.smart-media-fullscreen span{display:none}.smart-media-fullscreen{width:40px;height:40px;justify-content:center;padding:0}}
  `;
  document.head.appendChild(style);

  window.SmartMedia = { googleEmbedUrl, isGoogleMedia, upgrade };

  const start = () => {
    upgrade(document);
    syncFullscreenState();
    document.addEventListener('fullscreenchange', syncFullscreenState);
    document.addEventListener('webkitfullscreenchange', syncFullscreenState);
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