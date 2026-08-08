(() => {
  'use strict';

  const isStoryboard = block => block?.dataset?.layout === 'storyboard';

  const buildViewer = block => {
    if (!isStoryboard(block) || block.dataset.storyboardReady === 'true') return;
    const media = block.querySelector('.block-media');
    if (!media) return;
    const figures = [...media.children].filter(node => node.tagName === 'FIGURE');
    if (figures.length < 2) return;

    block.dataset.storyboardReady = 'true';
    media.classList.add('storyboard-viewer');
    media.setAttribute('tabindex', '0');

    const stage = document.createElement('div');
    stage.className = 'storyboard-stage';

    figures.forEach((figure, index) => {
      figure.classList.add('storyboard-slide');
      figure.dataset.storyboardSlide = String(index);
      figure.setAttribute('aria-hidden', index === 0 ? 'false' : 'true');
      if (index === 0) figure.classList.add('is-active');
      stage.appendChild(figure);
    });

    const prev = document.createElement('button');
    prev.type = 'button';
    prev.className = 'storyboard-nav prev';
    prev.setAttribute('aria-label', 'Previous slide');
    prev.textContent = '‹';

    const next = document.createElement('button');
    next.type = 'button';
    next.className = 'storyboard-nav next';
    next.setAttribute('aria-label', 'Next slide');
    next.textContent = '›';

    const counter = document.createElement('div');
    counter.className = 'storyboard-counter';
    counter.innerHTML = `<span data-storyboard-current>1</span> / ${figures.length}`;

    stage.append(prev, next, counter);

    const thumbs = document.createElement('div');
    thumbs.className = 'storyboard-thumbs';
    figures.forEach((figure, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = `storyboard-thumb${index === 0 ? ' is-active' : ''}`;
      button.dataset.storyboardGo = String(index);
      button.setAttribute('aria-label', `Go to slide ${index + 1}`);
      const image = figure.querySelector('img');
      if (image) {
        const thumb = image.cloneNode(false);
        thumb.removeAttribute('loading');
        thumb.alt = '';
        button.appendChild(thumb);
      } else {
        const play = document.createElement('span');
        play.className = 'storyboard-thumb-video';
        play.textContent = '▶';
        button.appendChild(play);
      }
      thumbs.appendChild(button);
    });

    media.replaceChildren(stage, thumbs);

    const slides = [...media.querySelectorAll('.storyboard-slide')];
    const thumbButtons = [...media.querySelectorAll('[data-storyboard-go]')];
    const current = media.querySelector('[data-storyboard-current]');
    let index = 0;
    let touchStartX = null;

    const show = nextIndex => {
      index = (nextIndex + slides.length) % slides.length;
      slides.forEach((slide, i) => {
        const active = i === index;
        slide.classList.toggle('is-active', active);
        slide.setAttribute('aria-hidden', String(!active));
      });
      thumbButtons.forEach((thumb, i) => thumb.classList.toggle('is-active', i === index));
      if (current) current.textContent = String(index + 1);
      thumbButtons[index]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    };

    prev.addEventListener('click', () => show(index - 1));
    next.addEventListener('click', () => show(index + 1));
    thumbButtons.forEach((thumb, i) => thumb.addEventListener('click', () => show(i)));

    media.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); show(index - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); show(index + 1); }
    });

    media.addEventListener('touchstart', event => {
      touchStartX = event.touches[0]?.clientX ?? null;
    }, { passive: true });

    media.addEventListener('touchend', event => {
      if (touchStartX == null) return;
      const endX = event.changedTouches[0]?.clientX ?? touchStartX;
      const delta = endX - touchStartX;
      touchStartX = null;
      if (Math.abs(delta) < 45) return;
      show(index + (delta < 0 ? 1 : -1));
    }, { passive: true });
  };

  const init = root => {
    const scope = root?.querySelectorAll ? root : document;
    scope.querySelectorAll('.project-block[data-layout="storyboard"]').forEach(buildViewer);
  };

  const style = document.createElement('style');
  style.textContent = `
    .project-block[data-layout="storyboard"] .storyboard-viewer{margin-top:28px;outline:none}
    .project-block[data-layout="storyboard"] .storyboard-stage{position:relative;overflow:hidden;border:1px solid rgba(255,255,255,.09);border-radius:16px;background:#0c0e12;min-height:320px}
    .project-block[data-layout="storyboard"] .storyboard-slide{display:none;margin:0;opacity:0;transform:translateX(24px);transition:opacity .28s ease,transform .28s ease}
    .project-block[data-layout="storyboard"] .storyboard-slide.is-active{display:block;opacity:1;transform:none}
    .project-block[data-layout="storyboard"] .storyboard-slide img{display:block;width:100%;max-height:72vh;object-fit:contain;background:#0c0e12}
    .project-block[data-layout="storyboard"] .storyboard-slide .block-video{margin:0}
    .project-block[data-layout="storyboard"] .storyboard-slide figcaption{padding:12px 16px}
    .project-block[data-layout="storyboard"] .storyboard-nav{position:absolute;top:50%;translate:0 -50%;z-index:5;width:44px;height:44px;border:1px solid rgba(255,255,255,.16);border-radius:999px;background:rgba(10,12,16,.72);color:#fff;font-size:28px;line-height:1;backdrop-filter:blur(8px);cursor:pointer}
    .project-block[data-layout="storyboard"] .storyboard-nav.prev{left:14px}
    .project-block[data-layout="storyboard"] .storyboard-nav.next{right:14px}
    .project-block[data-layout="storyboard"] .storyboard-counter{position:absolute;right:14px;bottom:14px;z-index:5;padding:6px 10px;border-radius:999px;background:rgba(10,12,16,.72);color:#e8e5df;font-size:12px;backdrop-filter:blur(8px)}
    .project-block[data-layout="storyboard"] .storyboard-thumbs{display:flex;gap:8px;overflow-x:auto;padding:10px 2px 2px;scrollbar-width:thin}
    .project-block[data-layout="storyboard"] .storyboard-thumb{flex:0 0 84px;height:58px;padding:0;overflow:hidden;border:1px solid rgba(255,255,255,.1);border-radius:8px;background:#111318;opacity:.58;cursor:pointer}
    .project-block[data-layout="storyboard"] .storyboard-thumb.is-active{opacity:1;border-color:var(--block-accent,#b9bec8)}
    .project-block[data-layout="storyboard"] .storyboard-thumb img{display:block;width:100%;height:100%;object-fit:cover}
    .project-block[data-layout="storyboard"] .storyboard-thumb-video{display:grid;place-items:center;width:100%;height:100%;color:#fff}
    @media(max-width:700px){
      .project-block[data-layout="storyboard"] .storyboard-stage{min-height:220px}
      .project-block[data-layout="storyboard"] .storyboard-nav{width:38px;height:38px}
      .project-block[data-layout="storyboard"] .storyboard-thumb{flex-basis:70px;height:48px}
    }
  `;
  document.head.appendChild(style);

  const start = () => {
    init(document);
    new MutationObserver(mutations => {
      mutations.forEach(mutation => mutation.addedNodes.forEach(node => {
        if (node.nodeType === 1) init(node);
      }));
    }).observe(document.body, { childList: true, subtree: true });
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else start();
})();
