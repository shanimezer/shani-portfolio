(() => {
  'use strict';
  const projects = Array.isArray(window.PORTFOLIO_PROJECTS) ? window.PORTFOLIO_PROJECTS : [];
  if (!projects.length) return;
  const normalize = value => String(value || '').trim().toLowerCase().replace(/^narrative design$/,'narrative').replace(/^social content$/,'social').replace(/^ai creation$/,'ai');
  const belongs = (project, category) => [project.category, ...(Array.isArray(project.categories) ? project.categories : [])].map(normalize).includes(category);
  const fallbackImage = project => {
    if (project.cover) return project.cover;
    for (const block of project.blocks || []) {
      if (block.visible === false) continue;
      for (const item of block.media || []) {
        if (!item?.url || item.type === 'video') continue;
        if (/^slideshow:|youtube|youtu\.be|vimeo|instagram|tiktok|drive\.google|docs\.google/i.test(item.url)) continue;
        return item.url;
      }
    }
    return '';
  };
  const published = projects
    .filter(project => project.status !== 'draft' && project.publicVisible !== false)
    .map(project => ({project,image:fallbackImage(project)}))
    .filter(entry => entry.image);
  const usedLeadCovers=new Set();
  const rotate=(items,amount)=>{if(!items.length)return[];const shift=amount%items.length;return[...items.slice(shift),...items.slice(0,shift)]};
  const coversFor=(category,categoryIndex)=>{const candidates=published.filter(entry=>belongs(entry.project,category));if(!candidates.length)return[];const primary=candidates.filter(entry=>normalize(entry.project.category)===category),secondary=candidates.filter(entry=>normalize(entry.project.category)!==category);let lead=primary.find(entry=>!usedLeadCovers.has(entry.image));if(!lead)lead=secondary.find(entry=>!usedLeadCovers.has(entry.image));if(!lead)lead=primary[0]||secondary[0]||candidates[0];if(lead?.image)usedLeadCovers.add(lead.image);const remaining=candidates.filter(entry=>entry!==lead),selected=[lead,...rotate(remaining,categoryIndex)].filter(Boolean);return selected.map(entry=>entry.image).filter((url,index,all)=>url&&all.indexOf(url)===index).slice(0,3)};
  const makeStack=covers=>{const stack=document.createElement('div');stack.className='category-hero-stack';stack.setAttribute('aria-hidden','true');covers.forEach(url=>{const frame=document.createElement('div');frame.className='category-hero-frame';frame.style.backgroundImage=`url("${String(url).replace(/"/g,'%22')}")`;stack.appendChild(frame)});return stack};
  const map=[['directing','.world-directing','.directing-chapter'],['games','.world-games','.games-chapter'],['narrative','.world-narrative','.narrative-chapter'],['production','.world-production','.production-chapter'],['social','.world-social','.social-chapter'],['editing','.world-editing','.editing-chapter'],['ai','.world-ai','.ai-chapter']];
  map.forEach(([category,desktopSelector,mobileSelector],categoryIndex)=>{const covers=coversFor(category,categoryIndex);if(!covers.length)return;const desktop=document.querySelector(desktopSelector);if(desktop){desktop.prepend(makeStack(covers));desktop.classList.add('has-hero-stack')}const mobile=document.querySelector(mobileSelector),media=mobile?.querySelector('.chapter-media');if(media){media.prepend(makeStack(covers));mobile.classList.add('has-hero-stack')}});
})();