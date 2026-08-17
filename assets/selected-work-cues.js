(() => {
  'use strict';
  const projects = Array.isArray(window.PORTFOLIO_PROJECTS) ? window.PORTFOLIO_PROJECTS : [];
  const esc = value => String(value || '').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;').replace(/>/g,'&gt;');

  const socialCandidates = project => {
    const urls = [];
    (project?.blocks || []).forEach(block => {
      if (block.visible === false) return;
      (block.media || []).forEach(item => {
        const url = String(item?.url || '');
        if (!url || /^slideshow:/i.test(url) || urls.includes(url)) return;
        if (/instagram\.com\/(?:p|reel|tv)\//i.test(url) || /tiktok\.com\/.+\/video\//i.test(url)) urls.push(url);
      });
    });
    return urls.slice(0, 4);
  };

  const instagramImage = value => {
    try {
      const url = new URL(value);
      const parts = url.pathname.split('/').filter(Boolean);
      if (!['p','reel','tv'].includes(parts[0]) || !parts[1]) return '';
      return `https://www.instagram.com/${parts[0]}/${parts[1]}/media/?size=l`;
    } catch { return ''; }
  };

  const tiktokThumb = async value => {
    try {
      const response = await fetch(`https://www.tiktok.com/oembed?url=${encodeURIComponent(value)}`, { mode:'cors' });
      if (!response.ok) return '';
      const data = await response.json();
      return data.thumbnail_url || '';
    } catch { return ''; }
  };

  const resolveThumb = async value => {
    if (/instagram\.com/i.test(value)) return instagramImage(value);
    if (/tiktok\.com/i.test(value)) return tiktokThumb(value);
    return '';
  };

  const ensureStyle = () => {
    if (document.getElementById('safe-social-thumb-style')) return;
    const style = document.createElement('style');
    style.id = 'safe-social-thumb-style';
    style.textContent = `
      .cms-cover.safe-social-mosaic{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:2px;background:#121318!important;background-image:none!important;overflow:hidden}
      .safe-social-mosaic>span{display:block;min-width:0;min-height:0;background:#17191e center/cover no-repeat;transition:transform .5s ease}
      .safe-social-mosaic.count-1>span{grid-column:1/-1;grid-row:1/-1}.safe-social-mosaic.count-2>span{grid-row:1/-1}.safe-social-mosaic.count-3>span:first-child{grid-row:1/-1}.safe-social-mosaic.count-3>span:nth-child(2){grid-column:2;grid-row:1}.safe-social-mosaic.count-3>span:nth-child(3){grid-column:2;grid-row:2}
      .cms-card:hover .safe-social-mosaic>span{transform:scale(1.025)}
    `;
    document.head.appendChild(style);
  };

  const enhanceEmptyCover = async card => {
    const cover = card.querySelector('.cms-cover-empty');
    if (!cover) return;
    let slug = '';
    try { slug = new URL(card.href, location.href).searchParams.get('slug') || ''; } catch {}
    const project = projects.find(item => item.id === slug);
    if (!project || project.cover) return;
    const candidates = socialCandidates(project);
    if (!candidates.length) return;
    const settled = await Promise.all(candidates.map(resolveThumb));
    const thumbs = settled.filter(Boolean).slice(0, 4);
    if (!thumbs.length || !cover.isConnected || !cover.classList.contains('cms-cover-empty')) return;
    cover.className = `cms-cover safe-social-mosaic count-${thumbs.length}`;
    cover.innerHTML = thumbs.map(url => `<span style="background-image:url('${esc(url)}')"></span>`).join('');
  };

  const add = () => {
    ensureStyle();
    document.querySelectorAll('.cms-card').forEach(card => {
      const body = card.querySelector('.card-body');
      if (body && !body.querySelector('.case-study-cta')) {
        const cue = document.createElement('div');
        cue.className = 'case-study-cta';
        cue.innerHTML = '<span>Explore Project</span><b>↗</b>';
        body.appendChild(cue);
        card.setAttribute('aria-label', `${card.querySelector('h3')?.textContent || 'Project'} · Explore project`);
      }
      enhanceEmptyCover(card);
    });
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', add, { once:true });
  else requestAnimationFrame(add);
})();