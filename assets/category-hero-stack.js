(() => {
  'use strict';
  const projects = Array.isArray(window.PORTFOLIO_PROJECTS) ? window.PORTFOLIO_PROJECTS : [];
  if (!projects.length) return;

  const normalize = value => String(value || '').trim().toLowerCase()
    .replace(/^narrative design$/,'narrative')
    .replace(/^social content$/,'social')
    .replace(/^ai creation$/,'ai');

  const belongs = (project, category) => {
    const cats = [project.category, ...(Array.isArray(project.categories) ? project.categories : [])].map(normalize);
    if (cats.includes(category)) return true;
    if (category !== 'narrative') return false;
    return (project.blocks || []).some(block => Array.isArray(block.disciplines) && block.disciplines.includes('narrativeDesign'));
  };

  const published = projects.filter(project => project.status !== 'draft' && project.cover);
  const usedLeadCovers = new Set();

  const rotate = (items, amount) => {
    if (!items.length) return [];
    const shift = amount % items.length;
    return [...items.slice(shift), ...items.slice(0, shift)];
  };

  const coversFor = (category, categoryIndex) => {
    const candidates = published.filter(project => belongs(project, category));
    if (!candidates.length) return [];

    const primary = candidates.filter(project => normalize(project.category) === category);
    const secondary = candidates.filter(project => normalize(project.category) !== category);

    // Prefer a primary-category project that has not already become another world's lead image.
    let lead = primary.find(project => !usedLeadCovers.has(project.cover));
    if (!lead) lead = secondary.find(project => !usedLeadCovers.has(project.cover));
    if (!lead) lead = primary[0] || secondary[0] || candidates[0];
    if (lead?.cover) usedLeadCovers.add(lead.cover);

    // Rotate the remaining projects differently for each world so overlapping categories
    // do not produce the same visual stack in the same order.
    const remaining = candidates.filter(project => project !== lead);
    const orderedRemaining = rotate(remaining, categoryIndex);
    const selected = [lead, ...orderedRemaining].filter(Boolean);

    return selected
      .map(project => project.cover)
      .filter((url, index, all) => url && all.indexOf(url) === index)
      .slice(0, 3);
  };

  const makeStack = covers => {
    const stack = document.createElement('div');
    stack.className = 'category-hero-stack';
    stack.setAttribute('aria-hidden','true');
    covers.forEach(url => {
      const frame = document.createElement('div');
      frame.className = 'category-hero-frame';
      frame.style.backgroundImage = `url("${String(url).replace(/"/g,'%22')}")`;
      stack.appendChild(frame);
    });
    return stack;
  };

  const map = [
    ['directing','.world-directing','.directing-chapter'],
    ['games','.world-games','.games-chapter'],
    ['narrative','.world-narrative','.narrative-chapter'],
    ['production','.world-production','.production-chapter'],
    ['social','.world-social','.social-chapter'],
    ['editing','.world-editing','.editing-chapter'],
    ['ai','.world-ai','.ai-chapter']
  ];

  map.forEach(([category, desktopSelector, mobileSelector], categoryIndex) => {
    const covers = coversFor(category, categoryIndex);
    if (!covers.length) return;

    const desktop = document.querySelector(desktopSelector);
    if (desktop) {
      desktop.prepend(makeStack(covers));
      desktop.classList.add('has-hero-stack');
    }

    const mobile = document.querySelector(mobileSelector);
    const media = mobile?.querySelector('.chapter-media');
    if (media) {
      media.prepend(makeStack(covers));
      mobile.classList.add('has-hero-stack');
    }
  });
})();
