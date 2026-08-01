(() => {
  const detail=document.querySelector('[data-project-detail]');
  if(!detail||!window.PORTFOLIO_PROJECTS)return;
  const slug=new URLSearchParams(location.search).get('slug');
  const project=window.PORTFOLIO_PROJECTS.find(item=>item.id===slug);
  if(!project)return;
  const blocks=(project.blocks||[]).filter(block=>block.visible!==false);
  const sections=[...detail.querySelectorAll('.project-block')];
  if(!sections.length)return;
  const labels={directing:'Directing',gameDesign:'Game Design',cinematics:'Cinematics',production:'Production',motionCapture:'Motion Capture',editing:'Editing',ai:'AI',social:'Social Content'};
  const slugify=value=>String(value||'section').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/(^-|-$)/g,'');
  sections.forEach((section,index)=>{
    const block=blocks[index]||{};
    section.id=`section-${slugify(block.navTitle||block.title||block.type)}-${index+1}`;
    section.dataset.disciplines=(block.disciplines||[]).join(' ');
    section.dataset.alwaysVisible=block.alwaysVisible?'true':'false';
  });
  const tocItems=blocks.map((block,index)=>({block,section:sections[index]})).filter(item=>item.section&&item.block.showInToc!==false);
  const disciplines=[...new Set(blocks.flatMap(block=>block.disciplines||[]))].filter(Boolean);
  if(tocItems.length<2&&disciplines.length<1)return;
  const shell=document.createElement('section');
  shell.className='project-navigation';
  const tocLinks=tocItems.map(({block,section})=>`<a href="#${section.id}" data-toc-link="${section.id}">${block.navTitle||block.title||labels[block.type]||'Section'}</a>`).join('');
  const filters=disciplines.length?`<div class="project-filters"><span>View by discipline</span><div><button class="active" data-filter="all">All</button>${disciplines.map(value=>`<button data-filter="${value}">${labels[value]||value}</button>`).join('')}</div></div>`:'';
  shell.innerHTML=`<div class="wrap project-navigation-inner"><aside class="project-toc"><strong>Explore this project</strong><nav>${tocLinks}</nav></aside><details class="project-toc-mobile"><summary>Explore this project</summary><nav>${tocLinks}</nav></details>${filters}</div>`;
  const hero=detail.querySelector('.project-hero-dynamic');
  hero?.insertAdjacentElement('afterend',shell);
  shell.querySelectorAll('a[href^="#"]').forEach(link=>link.addEventListener('click',event=>{event.preventDefault();document.getElementById(link.getAttribute('href').slice(1))?.scrollIntoView({behavior:'smooth',block:'start'});shell.querySelector('details')?.removeAttribute('open');}));
  shell.querySelectorAll('[data-filter]').forEach(button=>button.addEventListener('click',()=>{
    shell.querySelectorAll('[data-filter]').forEach(item=>item.classList.toggle('active',item===button));
    const filter=button.dataset.filter;
    sections.forEach(section=>{const match=filter==='all'||section.dataset.alwaysVisible==='true'||section.dataset.disciplines.split(' ').includes(filter);section.hidden=!match;});
  }));
  if('IntersectionObserver'in window){
    const observer=new IntersectionObserver(entries=>{const visible=entries.filter(entry=>entry.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(!visible)return;shell.querySelectorAll('[data-toc-link]').forEach(link=>link.classList.toggle('active',link.dataset.tocLink===visible.target.id));},{rootMargin:'-28% 0px -58% 0px',threshold:[0,.1,.4]});
    sections.forEach(section=>observer.observe(section));
  }
})();