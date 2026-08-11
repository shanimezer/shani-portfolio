(() => {
  'use strict';
  const projects = Array.isArray(window.PORTFOLIO_PROJECTS) ? window.PORTFOLIO_PROJECTS : [];
  if (!projects.length) return;
  const normalize = value => String(value || '').trim().toLowerCase().replace(/^narrative design$/,'narrative').replace(/^social content$/,'social').replace(/^ai creation$/,'ai');
  const belongs = (project, category) => {
    const cats = [project.category, ...(Array.isArray(project.categories) ? project.categories : [])].map(normalize);
    if (cats.includes(category)) return true;
    if (category !== 'narrative') return false;
    return (project.blocks || []).some(block => Array.isArray(block.disciplines) && block.disciplines.includes('narrativeDesign'));
  };
  const coversFor = category => projects.filter(p => p.status !== 'draft' && belongs(p,category) && p.cover).map(p => p.cover).filter((url,i,a) => a.indexOf(url) === i).slice(0,3);
  const makeStack = covers => {
    const stack = document.createElement('div'); stack.className = 'category-hero-stack'; stack.setAttribute('aria-hidden','true');
    covers.forEach(url => { const frame=document.createElement('div'); frame.className='category-hero-frame'; frame.style.backgroundImage=`url("${String(url).replace(/"/g,'%22')}")`; stack.appendChild(frame); });
    return stack;
  };
  const map = [
    ['directing','.world-directing','.directing-chapter'],['games','.world-games','.games-chapter'],['narrative','.world-narrative','.narrative-chapter'],['production','.world-production','.production-chapter'],['social','.world-social','.social-chapter'],['editing','.world-editing','.editing-chapter'],['ai','.world-ai','.ai-chapter']
  ];
  map.forEach(([category,desktopSelector,mobileSelector]) => {
    const covers=coversFor(category); if(!covers.length) return;
    const desktop=document.querySelector(desktopSelector); if(desktop){desktop.prepend(makeStack(covers));desktop.classList.add('has-hero-stack');}
    const mobile=document.querySelector(mobileSelector); const media=mobile?.querySelector('.chapter-media'); if(media){media.prepend(makeStack(covers));mobile.classList.add('has-hero-stack');}
  });
})();
