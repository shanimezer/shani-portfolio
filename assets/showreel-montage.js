(() => {
  'use strict';
  const overlay = document.getElementById('projectOverlay');
  const shell = overlay?.querySelector('.video-shell');
  if (!overlay || !shell || !Array.isArray(window.PORTFOLIO_PROJECTS)) return;

  const projects = window.PORTFOLIO_PROJECTS.filter(project => project && project.status !== 'draft' && project.cover);
  if (!projects.length) return;

  const montage = document.createElement('div');
  montage.className = 'showreel-montage';
  montage.innerHTML = `
    <div class="showreel-montage-stage"></div>
    <div class="showreel-montage-controls"><button type="button" data-prev aria-label="Previous project">←</button><button type="button" data-next aria-label="Next project">→</button></div>
    <div class="showreel-montage-copy"><div><p data-category></p><h3 data-title></h3></div><span class="showreel-montage-count" data-count></span></div>
    <div class="showreel-montage-progress"><i></i></div>`;

  shell.innerHTML = '';
  shell.appendChild(montage);

  const stage = montage.querySelector('.showreel-montage-stage');
  const title = montage.querySelector('[data-title]');
  const category = montage.querySelector('[data-category]');
  const count = montage.querySelector('[data-count]');
  const slides = projects.map((project, index) => {
    const slide = document.createElement('div');
    slide.className = 'showreel-slide';
    slide.style.backgroundImage = `url("${String(project.cover).replace(/"/g, '%22')}")`;
    slide.dataset.index = String(index);
    stage.appendChild(slide);
    return slide;
  });

  let index = 0;
  let timer = null;
  const duration = 4200;

  const labelFor = project => project.categoryLabel || (Array.isArray(project.roles) ? project.roles.join(' · ') : project.category || 'Selected work');

  const restartProgress = () => {
    montage.classList.remove('is-playing');
    void montage.offsetWidth;
    montage.classList.add('is-playing');
  };

  const show = nextIndex => {
    index = (nextIndex + slides.length) % slides.length;
    slides.forEach((slide, i) => slide.classList.toggle('is-active', i === index));
    const project = projects[index];
    title.textContent = project.title || 'Selected work';
    category.textContent = labelFor(project);
    count.textContent = `${String(index + 1).padStart(2, '0')} / ${String(slides.length).padStart(2, '0')}`;
    restartProgress();
  };

  const stop = () => { window.clearInterval(timer); timer = null; montage.classList.remove('is-playing'); };
  const play = () => { stop(); restartProgress(); timer = window.setInterval(() => show(index + 1), duration); };

  montage.querySelector('[data-prev]')?.addEventListener('click', () => { show(index - 1); play(); });
  montage.querySelector('[data-next]')?.addEventListener('click', () => { show(index + 1); play(); });

  const observer = new MutationObserver(() => {
    if (overlay.classList.contains('open')) play();
    else stop();
  });
  observer.observe(overlay, { attributes:true, attributeFilter:['class'] });

  show(0);
})();