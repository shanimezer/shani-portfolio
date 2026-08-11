(() => {
  'use strict';

  const startPattern = /^slideshow:\/\/start(?:\?transition=([a-z-]+))?/i;
  const endPattern = /^slideshow:\/\/end/i;
  const interactiveSelector = 'iframe,video,.smart-media-frame,.social-embed,a,button,input,select,textarea';

  const getSource = figure => figure.querySelector('img')?.getAttribute('src') || figure.querySelector('iframe')?.getAttribute('src') || figure.querySelector('video')?.getAttribute('src') || '';

  const buildViewer = (container, figures, transition = 'slide') => {
    if (!figures.length) return null;
    const viewer = document.createElement('div');
    viewer.className = `media-slideshow transition-${transition}`;
    viewer.tabIndex = 0;

    const stage = document.createElement('div');
    stage.className = 'media-slideshow-stage';

    figures.forEach((figure, index) => {
      figure.classList.add('media-slideshow-slide');
      figure.classList.toggle('is-active', index === 0);
      figure.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
      stage.appendChild(figure);
    });

    const prev = document.createElement('button'); prev.type='button'; prev.className='media-slideshow-nav prev'; prev.setAttribute('aria-label','Previous image'); prev.textContent='‹';
    const next = document.createElement('button'); next.type='button'; next.className='media-slideshow-nav next'; next.setAttribute('aria-label','Next image'); next.textContent='›';
    const counter = document.createElement('div'); counter.className='media-slideshow-counter'; counter.innerHTML=`<span>1</span> / ${figures.length}`;
    stage.append(prev,next,counter);

    const thumbs=document.createElement('div'); thumbs.className='media-slideshow-thumbs';
    figures.forEach((figure,index)=>{const button=document.createElement('button');button.type='button';button.className=`media-slideshow-thumb${index===0?' is-active':''}`;button.setAttribute('aria-label',`Go to image ${index+1}`);const img=figure.querySelector('img');if(img){const clone=img.cloneNode(false);clone.alt='';clone.removeAttribute('loading');button.appendChild(clone);}else button.textContent='▶';thumbs.appendChild(button);});
    viewer.append(stage,thumbs);

    const slides=[...stage.querySelectorAll('.media-slideshow-slide')]; const thumbButtons=[...thumbs.children]; const current=counter.querySelector('span'); let index=0; let startX=null; let touchStartedOnInteractive=false;
    const show=value=>{index=(value+slides.length)%slides.length;slides.forEach((slide,i)=>{const active=i===index;slide.classList.toggle('is-active',active);slide.setAttribute('aria-hidden',String(!active));});thumbButtons.forEach((button,i)=>button.classList.toggle('is-active',i===index));current.textContent=String(index+1);thumbButtons[index]?.scrollIntoView({behavior:'smooth',inline:'center',block:'nearest'});};

    prev.addEventListener('click',()=>show(index-1)); next.addEventListener('click',()=>show(index+1)); thumbButtons.forEach((button,i)=>button.addEventListener('click',()=>show(i)));
    viewer.addEventListener('keydown',event=>{if(event.target.closest?.(interactiveSelector)&&event.target!==viewer)return;if(event.key==='ArrowLeft'){event.preventDefault();show(index-1);}if(event.key==='ArrowRight'){event.preventDefault();show(index+1);}});
    viewer.addEventListener('touchstart',event=>{touchStartedOnInteractive=Boolean(event.target.closest?.(interactiveSelector));startX=touchStartedOnInteractive?null:(event.touches[0]?.clientX??null);},{passive:true});
    viewer.addEventListener('touchend',event=>{if(touchStartedOnInteractive){touchStartedOnInteractive=false;startX=null;return;}if(startX==null)return;const endX=event.changedTouches[0]?.clientX??startX;const delta=endX-startX;startX=null;if(Math.abs(delta)>45)show(index+(delta<0?1:-1));},{passive:true});
    return viewer;
  };

  const upgradeContainer=container=>{if(container.dataset.mediaSlidesReady==='true')return;const figures=[...container.children].filter(node=>node.tagName==='FIGURE');if(!figures.length)return;let found=false,index=0;while(index<figures.length){const source=getSource(figures[index]);const start=source.match(startPattern);if(!start){index+=1;continue;}found=true;const startFigure=figures[index];const slides=[];let endIndex=index+1;while(endIndex<figures.length){const nextSource=getSource(figures[endIndex]);if(endPattern.test(nextSource))break;slides.push(figures[endIndex]);endIndex+=1;}const endFigure=figures[endIndex];const viewer=buildViewer(container,slides,start[1]||'slide');if(viewer)startFigure.replaceWith(viewer);else startFigure.remove();endFigure?.remove();index=endIndex+1;}if(found)container.dataset.mediaSlidesReady='true';};
  const init=root=>{const scope=root?.querySelectorAll?root:document;scope.querySelectorAll('.block-media').forEach(upgradeContainer);};

  const style=document.createElement('style'); style.textContent=`
    .media-slideshow{width:100%;margin:28px 0;outline:none}
    .media-slideshow-stage{position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.1);border-radius:18px;background:#0c0e12;min-height:300px}
    .media-slideshow-slide{display:none!important;margin:0!important;border:0!important;border-radius:0!important;background:transparent!important}
    .media-slideshow-slide.is-active{display:block!important}
    .media-slideshow-slide img{display:block;width:100%;max-height:76vh;object-fit:contain;background:#0c0e12}
    .media-slideshow-slide figcaption{padding:14px 18px}
    .media-slideshow-slide iframe,.media-slideshow-slide video,.media-slideshow-slide .smart-media-frame,.media-slideshow-slide .social-embed{pointer-events:auto!important;position:relative;z-index:2}
    .transition-fade .media-slideshow-slide.is-active{animation:mediaFade .3s ease both}.transition-slide .media-slideshow-slide.is-active{animation:mediaSlide .34s ease both}.transition-page .media-slideshow-slide.is-active{transform-origin:left center;animation:mediaPage .42s ease both}
    @keyframes mediaFade{from{opacity:0}to{opacity:1}}@keyframes mediaSlide{from{opacity:.25;transform:translateX(28px)}to{opacity:1;transform:none}}@keyframes mediaPage{from{opacity:.15;transform:perspective(1200px) rotateY(-8deg) translateX(18px)}to{opacity:1;transform:none}}
    .media-slideshow-nav{position:absolute;top:50%;translate:0 -50%;z-index:4;width:44px;height:44px;border:1px solid rgba(255,255,255,.16);border-radius:999px;background:rgba(9,11,14,.74);color:#fff;font-size:28px;line-height:1;backdrop-filter:blur(8px)}.media-slideshow-nav.prev{left:14px}.media-slideshow-nav.next{right:14px}
    .media-slideshow-counter{position:absolute;right:14px;bottom:14px;z-index:4;padding:6px 10px;border-radius:999px;background:rgba(9,11,14,.74);color:#eee;font-size:12px;backdrop-filter:blur(8px)}
    .media-slideshow-thumbs{display:flex;gap:8px;overflow-x:auto;padding:10px 2px 2px}.media-slideshow-thumb{flex:0 0 82px;height:56px;padding:0;overflow:hidden;border:1px solid rgba(255,255,255,.1);border-radius:8px;background:#111318;color:#fff;opacity:.55}.media-slideshow-thumb.is-active{opacity:1;border-color:var(--block-accent,var(--project-accent,#b9bec8))}.media-slideshow-thumb img{display:block;width:100%;height:100%;object-fit:cover}
    @media(max-width:700px){.media-slideshow-stage{min-height:220px}.media-slideshow-nav{width:38px;height:38px}.media-slideshow-thumb{flex-basis:68px;height:46px}}
  `; document.head.appendChild(style);
  const start=()=>{init(document);new MutationObserver(mutations=>mutations.forEach(mutation=>mutation.addedNodes.forEach(node=>{if(node.nodeType===1)init(node);}))).observe(document.body,{childList:true,subtree:true});};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
