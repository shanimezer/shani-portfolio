(() => {
  'use strict';
  const projects = Array.isArray(window.PORTFOLIO_PROJECTS) ? window.PORTFOLIO_PROJECTS : [];
  const escapeAttr = value => String(value || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const projectBySlug = slug => projects.find(project => project.id === slug);
  const isMarker = url => /^slideshow:/i.test(String(url || ''));
  const drivePreview = value => {
    try {
      const url = new URL(value, location.href);
      if (!/drive\.google\.com$/i.test(url.hostname)) return '';
      const pathMatch = url.pathname.match(/\/file\/d\/([^/]+)/i);
      const id = pathMatch?.[1] || url.searchParams.get('id');
      return id ? `https://drive.google.com/file/d/${id}/preview` : '';
    } catch { return ''; }
  };
  const embedUrl = value => {
    try {
      const url = new URL(value, location.href);
      const host = url.hostname.replace(/^www\./,'');
      const drive = drivePreview(value); if (drive) return drive;
      if (host === 'youtu.be') return `https://www.youtube.com/embed/${url.pathname.split('/').filter(Boolean)[0] || ''}?controls=0&mute=1`;
      if (host.includes('youtube.com')) {
        const id = url.pathname.startsWith('/shorts/') ? url.pathname.split('/')[2] : url.searchParams.get('v');
        if (id) return `https://www.youtube.com/embed/${id}?controls=0&mute=1`;
      }
      if (host.includes('vimeo.com')) {
        const id = url.pathname.split('/').filter(Boolean).pop();
        if (id) return `https://player.vimeo.com/video/${id}?background=1&muted=1`;
      }
      if (host === 'instagram.com' || host.endsWith('.instagram.com')) {
        const parts = url.pathname.split('/').filter(Boolean), kind = parts[0], code = parts[1];
        if (['p','reel','tv'].includes(kind) && code) return `https://www.instagram.com/${kind}/${code}/embed/`;
      }
      if (host === 'tiktok.com' || host.endsWith('.tiktok.com')) {
        const match = url.pathname.match(/\/video\/(\d+)/);
        if (match?.[1]) return `https://www.tiktok.com/player/v1/${match[1]}?autoplay=0&loop=1&controls=0`;
      }
    } catch {}
    return '';
  };
  const isDirectVideo = url => /\.(?:mp4|webm)(?:$|\?)/i.test(String(url || ''));
  const isPlainImage = item => {
    if (!item?.url || isMarker(item.url) || item.type === 'video') return false;
    if (/instagram|tiktok|youtube|youtu\.be|vimeo|drive\.google|docs\.google/i.test(item.url)) return false;
    return true;
  };
  const itemsFor = project => {
    const all = [];
    (project?.blocks || []).forEach(block => {
      if (block.visible === false) return;
      (block.media || []).forEach(item => {
        if (!item?.url || isMarker(item.url) || /docs\.google\.com/i.test(item.url)) return;
        if (all.some(existing => existing.url === item.url)) return;
        all.push(item);
      });
    });
    (project?.gallery || []).forEach(url => {
      if (url && !all.some(item => item.url === url)) all.push({url,type:'image'});
    });
    const images = all.filter(isPlainImage);
    const previews = all.filter(item => !isPlainImage(item) && (embedUrl(item.url) || isDirectVideo(item.url)));
    return [...images, ...previews].slice(0,4);
  };
  const tileMarkup = item => {
    if (isPlainImage(item)) return `<span class="thumb-fallback-tile image" style="background-image:url('${escapeAttr(item.url)}')"></span>`;
    if (isDirectVideo(item.url)) return `<span class="thumb-fallback-tile media"><video src="${escapeAttr(item.url)}" muted autoplay loop playsinline preload="metadata"></video></span>`;
    const src = embedUrl(item.url);
    return src ? `<span class="thumb-fallback-tile media"><iframe src="${escapeAttr(src)}" tabindex="-1" aria-hidden="true" loading="lazy"></iframe></span>` : '';
  };
  const ensureStyle = () => {
    if (document.getElementById('thumb-fallback-style')) return;
    const style = document.createElement('style'); style.id='thumb-fallback-style'; style.textContent=`
      .cms-cover.cms-cover-fallback-mosaic{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:2px;background:#121318!important;background-image:none!important;overflow:hidden;position:relative}
      .cms-cover-fallback-mosaic.count-1 .thumb-fallback-tile{grid-column:1/-1;grid-row:1/-1}.cms-cover-fallback-mosaic.count-2 .thumb-fallback-tile{grid-row:1/-1}.cms-cover-fallback-mosaic.count-3 .thumb-fallback-tile:first-child{grid-row:1/-1}.cms-cover-fallback-mosaic.count-3 .thumb-fallback-tile:nth-child(2){grid-column:2;grid-row:1}.cms-cover-fallback-mosaic.count-3 .thumb-fallback-tile:nth-child(3){grid-column:2;grid-row:2}
      .thumb-fallback-tile{position:relative;display:block;overflow:hidden;min-width:0;min-height:0;background:#17191e center/cover no-repeat}.thumb-fallback-tile:after{content:"";position:absolute;inset:0;pointer-events:none;background:linear-gradient(180deg,rgba(6,7,9,.03),rgba(6,7,9,.18));z-index:2}.thumb-fallback-tile iframe,.thumb-fallback-tile video{position:absolute;inset:0;width:100%;height:100%;border:0;object-fit:cover;pointer-events:none;filter:saturate(.88) brightness(.78);background:#17191e}.thumb-fallback-tile iframe{transform:scale(1.03)}
      .cms-card:hover .thumb-fallback-tile.image{transform:scale(1.035)}.thumb-fallback-tile.image{transition:transform .55s ease}
    `; document.head.appendChild(style);
  };
  const add = () => {
    ensureStyle();
    document.querySelectorAll('.cms-card').forEach(card => {
      const body = card.querySelector('.card-body');
      if (body && !body.querySelector('.case-study-cta')) {
        const cue=document.createElement('div'); cue.className='case-study-cta'; cue.innerHTML='<span>Explore Project</span><b>↗</b>'; body.appendChild(cue);
        card.setAttribute('aria-label',`${card.querySelector('h3')?.textContent||'Project'} · Explore project`);
      }
      const cover = card.querySelector('.cms-cover-empty');
      if (!cover) return;
      let slug=''; try { slug = new URL(card.href, location.href).searchParams.get('slug') || ''; } catch {}
      const project = projectBySlug(slug), items = itemsFor(project);
      if (!items.length) return;
      cover.className = `cms-cover cms-cover-fallback-mosaic count-${items.length}`;
      cover.innerHTML = items.map(tileMarkup).join('');
    });
  };
  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded',()=>requestAnimationFrame(add),{once:true}); else requestAnimationFrame(add);
})();