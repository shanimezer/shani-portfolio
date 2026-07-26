(() => {
  const body = document.body;
  const intro = document.getElementById('intro');
  const enter = document.getElementById('enterButton');
  const skip = document.getElementById('skipIntro');
  const menuButton = document.getElementById('menuButton');
  const mobileMenu = document.getElementById('mobileMenu');
  const overlay = document.getElementById('projectOverlay');
  const overlayClose = document.getElementById('overlayClose');
  const motionToggle = document.getElementById('motionToggle');
  const cursor = document.querySelector('.cursor');
  const cursorText = cursor?.querySelector('span');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  let motionOn = !reduceMotion;

  if (intro) body.classList.add('intro-open');
  const closeIntro = () => {
    intro?.classList.add('hidden');
    body.classList.remove('intro-open');
    sessionStorage.setItem('portfolio-intro-seen', '1');
  };
  enter?.addEventListener('click', closeIntro);
  skip?.addEventListener('click', closeIntro);
  if (sessionStorage.getItem('portfolio-intro-seen') === '1') closeIntro();

  menuButton?.addEventListener('click', () => {
    const open = !mobileMenu.classList.contains('open');
    mobileMenu.classList.toggle('open', open);
    menuButton.classList.toggle('open', open);
    menuButton.setAttribute('aria-expanded', String(open));
    body.style.overflow = open ? 'hidden' : '';
  });

  const mobileExperience = document.getElementById('mobileExperience');
  let showreelTimer = null;
  let pendingScrollNudge = false;
  let scrollNudgePlayed = sessionStorage.getItem('mobile-scroll-nudge-seen') === '1';
  let userExploredMobile = false;

  const markMobileExplored = () => {
    if (!mobileExperience || mobileExperience.scrollTop < 24) return;
    userExploredMobile = true;
  };

  mobileExperience?.addEventListener('scroll', markMobileExplored, { passive: true });
  mobileExperience?.addEventListener('touchstart', () => {
    if (mobileExperience.scrollTop > 8) userExploredMobile = true;
  }, { passive: true });

  const easeInOut = value => value < .5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;

  const animateMobileScroll = (from, to, duration, done) => {
    if (!mobileExperience) return;
    const start = performance.now();
    const frame = now => {
      const progress = Math.min((now - start) / duration, 1);
      mobileExperience.scrollTop = from + (to - from) * easeInOut(progress);
      if (progress < 1) requestAnimationFrame(frame);
      else done?.();
    };
    requestAnimationFrame(frame);
  };

  const playMobileScrollNudge = () => {
    if (!mobileExperience || !coarse || reduceMotion || scrollNudgePlayed || userExploredMobile) return;
    if (mobileExperience.scrollTop > 12 || overlay?.classList.contains('open')) {
      pendingScrollNudge = true;
      return;
    }

    scrollNudgePlayed = true;
    pendingScrollNudge = false;
    sessionStorage.setItem('mobile-scroll-nudge-seen', '1');

    const previousSnap = mobileExperience.style.scrollSnapType;
    mobileExperience.style.scrollSnapType = 'none';
    mobileExperience.style.pointerEvents = 'none';

    animateMobileScroll(0, 74, 650, () => {
      window.setTimeout(() => {
        animateMobileScroll(74, 10, 700, () => {
          mobileExperience.style.scrollSnapType = previousSnap;
          mobileExperience.style.pointerEvents = '';
        });
      }, 360);
    });
  };

  document.querySelectorAll('.project-trigger').forEach(button => {
    button.addEventListener('click', event => {
      event.preventDefault();
      overlay?.classList.add('open');
      overlay?.setAttribute('aria-hidden', 'false');
      body.style.overflow = 'hidden';

      if (coarse && !scrollNudgePlayed) {
        window.clearTimeout(showreelTimer);
        showreelTimer = window.setTimeout(() => {
          pendingScrollNudge = true;
          if (!overlay?.classList.contains('open')) playMobileScrollNudge();
        }, 90000);
      }
    });
  });

  const closeOverlay = () => {
    overlay?.classList.remove('open');
    overlay?.setAttribute('aria-hidden', 'true');
    body.style.overflow = '';

    if (coarse && !scrollNudgePlayed) {
      window.clearTimeout(showreelTimer);
      window.setTimeout(playMobileScrollNudge, 500);
    } else if (pendingScrollNudge) {
      window.setTimeout(playMobileScrollNudge, 500);
    }
  };
  overlayClose?.addEventListener('click', closeOverlay);
  overlay?.addEventListener('click', e => { if (e.target === overlay) closeOverlay(); });

  overlay?.querySelectorAll('video').forEach(video => {
    video.addEventListener('ended', () => {
      pendingScrollNudge = true;
      closeOverlay();
    });
  });

  window.addEventListener('keydown', e => { if (e.key === 'Escape') { closeOverlay(); mobileMenu?.classList.remove('open'); } });

  motionToggle?.addEventListener('click', () => {
    motionOn = !motionOn;
    motionToggle.querySelector('span').textContent = motionOn ? 'ON' : 'OFF';
    body.classList.toggle('motion-off', !motionOn);
  });

  if (!coarse && cursor) {
    let tx = innerWidth / 2, ty = innerHeight / 2, x = tx, y = ty;
    window.addEventListener('mousemove', e => { tx = e.clientX; ty = e.clientY; cursor.classList.add('visible'); });
    const animateCursor = () => {
      x += (tx - x) * .16; y += (ty - y) * .16;
      cursor.style.left = `${x}px`; cursor.style.top = `${y}px`;
      requestAnimationFrame(animateCursor);
    };
    animateCursor();
    document.querySelectorAll('a,button,.world').forEach(el => {
      el.addEventListener('mouseenter', () => { cursor.classList.add('active'); cursorText.textContent = el.dataset.label || 'OPEN'; });
      el.addEventListener('mouseleave', () => { cursor.classList.remove('active'); cursorText.textContent = 'EXPLORE'; });
    });
  }

  const worldThemes = {
    'world-directing': 'directing',
    'world-games': 'games',
    'world-production': 'production',
    'world-social': 'social',
    'world-editing': 'editing',
    'world-ai': 'ai'
  };
  body.dataset.world = 'neutral';
  const setWorldTheme = (theme = 'neutral', element = null) => {
    body.dataset.world = theme;
    document.querySelectorAll('.world.is-lit').forEach(item => item.classList.remove('is-lit'));
    element?.classList.add('is-lit');
  };
  document.querySelectorAll('.world').forEach(world => {
    const theme = Object.entries(worldThemes).find(([className]) => world.classList.contains(className))?.[1] || 'neutral';
    world.addEventListener('mouseenter', () => setWorldTheme(theme, world));
    world.addEventListener('focus', () => setWorldTheme(theme, world));
    world.addEventListener('mouseleave', () => setWorldTheme('neutral'));
    world.addEventListener('blur', () => setWorldTheme('neutral'));
  });
  window.addEventListener('mousemove', event => {
    document.documentElement.style.setProperty('--light-x', `${event.clientX / innerWidth * 100}%`);
    document.documentElement.style.setProperty('--light-y', `${event.clientY / innerHeight * 100}%`);
  }, {passive:true});

  const hub = document.getElementById('hub');
  if (hub && !coarse && !reduceMotion) {
    const layers = [...hub.querySelectorAll('[data-depth]')];
    window.addEventListener('mousemove', e => {
      if (!motionOn) return;
      const nx = e.clientX / innerWidth - .5;
      const ny = e.clientY / innerHeight - .5;
      layers.forEach(layer => {
        const depth = Number(layer.dataset.depth || 10);
        const base = layer.classList.contains('hub-center') ? 'translate(-50%,-50%) ' : '';
        layer.style.transform = `${base}translate3d(${nx * depth}px,${ny * depth}px,0)`;
      });
    });
  }

  document.querySelectorAll('.magnetic').forEach(el => {
    if (coarse || reduceMotion) return;
    el.addEventListener('mousemove', e => {
      if (!motionOn) return;
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.translate = `${x * .05}px ${y * .05}px`;
    });
    el.addEventListener('mouseleave', () => { el.style.translate = '0 0'; });
  });

  const chapters = document.querySelectorAll('.chapter');
  if (chapters.length) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => entry.target.classList.toggle('active', entry.isIntersecting)), {threshold:.58});
    chapters.forEach(chapter => observer.observe(chapter));
  }

  document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => {
    const filter = button.dataset.filter;
    document.querySelectorAll('[data-cat]').forEach(card => card.style.display = filter === 'all' || card.dataset.cat === filter ? '' : 'none');
  }));
})();