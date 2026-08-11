(() => {
  'use strict';

  const hero = document.querySelector('.page-hero');
  const title = hero?.querySelector('h1');
  const projects = Array.isArray(window.PORTFOLIO_PROJECTS) ? window.PORTFOLIO_PROJECTS : [];
  if (!hero || !title || !projects.length) return;

  const file = location.pathname.split('/').pop()?.replace(/\.html$/i, '') || '';
  if (!file || file === 'index') return;

  const aliases = {
    directing:'directing', games:'games', narrative:'narrative', production:'production',
    social:'social', editing:'editing', ai:'ai'
  };
  const category = aliases[file];
  if (!category) return;

  const style = document.createElement('style');
  style.textContent = `
    .page-hero{position:relative;isolation:isolate;overflow:hidden}
    .page-hero>.wrap{position:relative;z-index:2;min-width:0}
    .page-hero h1{width:100%;max-width:100%!important;font-size:clamp(3.15rem,7.15vw,7rem)!important;line-height:1.02!important;letter-spacing:-.07em!important;overflow:visible!important;text-wrap:balance;padding:.06em 0 .12em;margin:.18em 0 .12em}
    .page-hero:after{content:"";position:absolute;width:min(48vw,660px);aspect-ratio:1;right:-15vw;top:-22vw;border-radius:50%;background:radial-gradient(circle,color-mix(in srgb,var(--category-accent-b,#a58cff) 17%,transparent),color-mix(in srgb,var(--category-accent-a,#ff70bc) 6%,transparent) 40%,transparent 70%);pointer-events:none;z-index:0}
    @media(max-width:900px){.page-hero h1{font-size:clamp(3rem,11vw,5.2rem)!important;line-height:1.04!important;padding:.07em 0 .13em}}
    @media(max-width:620px){.page-hero h1{font-size:clamp(2.7rem,13vw,4.15rem)!important;line-height:1.05!important;letter-spacing:-.055em!important;padding:.08em 0 .14em}}
  `;
  document.head.appendChild(style);

  const normalize = value => String(value || '').trim().toLowerCase()
    .replace(/^narrative design$/, 'narrative')
    .replace(/^social content$/, 'social')
    .replace(/^ai creation$/, 'ai');

  const belongsToCategory = project => {
    const cats = [project.category, ...(Array.isArray(project.categories) ? project.categories : [])]
      .map(normalize).filter(Boolean);
    if (cats.includes(category)) return true;
    if (category !== 'narrative') return false;
    return (project.blocks || []).some(block =>
      Array.isArray(block.disciplines) && block.disciplines.includes('narrativeDesign')
    );
  };

  const isHex = value => /^#[0-9a-f]{6}$/i.test(String(value || ''));
  const accents = projects.filter(belongsToCategory)
    .map(project => project.accent)
    .filter(isHex)
    .filter((value, index, all) => all.indexOf(value) === index)
    .slice(0, 4);

  const fallbacks = {
    directing:['#d8ff66','#73d8ff'], games:['#ff8f55','#a58cff'], narrative:['#ff70bc','#9c7cff'],
    production:['#ffd56a','#ff8f55'], social:['#71d7ff','#ff70bc'], editing:['#ff8fa7','#ffd56a'], ai:['#a58cff','#71d7ff']
  };
  const colors = accents.length >= 2 ? accents : fallbacks[category];
  if (!colors?.length) return;

  const gradientColors = colors.map((color, index) => `${color} ${18 + Math.round(index * 82 / Math.max(1, colors.length - 1))}%`).join(',');
  title.style.backgroundImage = `linear-gradient(105deg, #f5f2e9 0%, ${gradientColors})`;
  title.style.webkitBackgroundClip = 'text';
  title.style.backgroundClip = 'text';
  title.style.color = 'transparent';
  title.style.display = 'block';

  hero.style.setProperty('--category-accent-a', colors[0]);
  hero.style.setProperty('--category-accent-b', colors[colors.length - 1]);
})();
