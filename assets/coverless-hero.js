(() => {
  'use strict';
  const projects = Array.isArray(window.PORTFOLIO_PROJECTS) ? window.PORTFOLIO_PROJECTS : [];
  if (!projects.length) return;

  const esc = value => String(value || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const isMarker = value => /^slideshow:/i.test(String(value || ''));
  const platformFor = value => {
    const url = String(value || '');
    if (/instagram\.com/i.test(url)) return 'Instagram';
    if (/tiktok\.com/i.test(url)) return 'TikTok';
    if (/drive\.google\.com/i.test(url)) return 'Video';
    if (/youtube|youtu\.be/i.test(url)) return 'YouTube';
    if (/vimeo/i.test(url)) return 'Vimeo';
    if (/\.(?:mp4|webm)(?:$|\?)/i.test(url)) return 'Video';
    return 'Image';
  };
  const isPlainImage = item => {
    if (!item?.url || isMarker(item.url) || item.type === 'video') return false;
    return !/instagram|tiktok|youtube|youtu\.be|vimeo|drive\.google|docs\.google/i.test(item.url);
  };
  const itemsFor = project => {
    const items = [];
    (project?.blocks || []).forEach(block => {
      if (block.visible === false) return;
      (block.media || []).forEach(item => {
        if (!item?.url || isMarker(item.url) || /docs\.google\.com/i.test(item.url)) return;
        if (items.some(existing => existing.url === item.url)) return;
        items.push(item);
      });
    });
    (project?.gallery || []).forEach(url => {
      if (url && !items.some(item => item.url === url)) items.push({url,type:'image',title:''});
    });
    return items.slice(0,4);
  };
  const tileMarkup = (item, index, accent) => {
    if (isPlainImage(item)) return `<span class="coverless-tile coverless-image" style="background-image:url('${esc(item.url)}')"></span>`;
    const platform = platformFor(item.url);
    const title = item.title || item.caption || platform;
    return `<span class="coverless-tile coverless-meta" style="--tile-accent:${esc(accent)}"><small>${esc(platform)}</small><strong>${esc(title)}</strong><i>${String(index + 1).padStart(2,'0')}</i></span>`;
  };
  const style = document.createElement('style');
  style.textContent = `
    .cms-cover.coverless-hero{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:2px;background:#111318!important;background-image:none!important;overflow:hidden;position:relative}
    .coverless-hero.count-1 .coverless-tile{grid-column:1/-1;grid-row:1/-1}.coverless-hero.count-2 .coverless-tile{grid-row:1/-1}.coverless-hero.count-3 .coverless-tile:first-child{grid-row:1/-1}.coverless-hero.count-3 .coverless-tile:nth-child(2){grid-column:2;grid-row:1}.coverless-hero.count-3 .coverless-tile:nth-child(3){grid-column:2;grid-row:2}
    .coverless-tile{position:relative;display:block;min-width:0;min-height:0;overflow:hidden}.coverless-image{background-position:center;background-size:cover;filter:saturate(.9) brightness(.82);transition:transform .55s ease,filter .55s ease}.cms-card:hover .coverless-image{transform:scale(1.035);filter:saturate(1) brightness(.9)}
    .coverless-meta{padding:16px;display:flex;flex-direction:column;justify-content:flex-end;background:radial-gradient(circle at 82% 16%,color-mix(in srgb,var(--tile-accent,#8e95a3) 34%,transparent),transparent 38%),linear-gradient(145deg,#202229,#111318 68%);color:#f5f2e9}.coverless-meta:before{content:"";position:absolute;inset:0;border:1px solid rgba(255,255,255,.055);pointer-events:none}.coverless-meta small{font-size:.57rem;letter-spacing:.14em;text-transform:uppercase;color:color-mix(in srgb,var(--tile-accent,#8e95a3) 82%,white);margin-bottom:5px}.coverless-meta strong{font:600 clamp(.72rem,1.2vw,.96rem)/1.12 Manrope,sans-serif;letter-spacing:-.03em;max-width:95%}.coverless-meta i{position:absolute;top:12px;right:12px;font-style:normal;font-size:.55rem;color:rgba(255,255,255,.28)}
  `;
  document.head.appendChild(style);

  const apply = () => document.querySelectorAll('.cms-card').forEach(card => {
    const empty = card.querySelector('.cms-cover-empty');
    if (!empty) return;
    let slug = '';
    try { slug = new URL(card.href, location.href).searchParams.get('slug') || ''; } catch {}
    const project = projects.find(item => item.id === slug);
    if (!project || project.cover) return;
    const items = itemsFor(project);
    if (!items.length) return;
    empty.className = `cms-cover coverless-hero count-${items.length}`;
    empty.innerHTML = items.map((item,index) => tileMarkup(item,index,project.accent || '#8e95a3')).join('');
  });

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => requestAnimationFrame(apply), {once:true});
  else requestAnimationFrame(apply);
})();