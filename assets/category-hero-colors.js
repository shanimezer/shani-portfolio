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

  const stops = colors.map((color, index) => `${color} ${Math.round(index * 100 / Math.max(1, colors.length - 1))}%`).join(',');
  title.style.backgroundImage = `linear-gradient(105deg, #f5f2e9 0%, ${stops})`;
  title.style.webkitBackgroundClip = 'text';
  title.style.backgroundClip = 'text';
  title.style.color = 'transparent';
  title.style.display = 'block';

  hero.style.setProperty('--category-accent-a', colors[0]);
  hero.style.setProperty('--category-accent-b', colors[colors.length - 1]);
})();
