(() => {
  'use strict';

  const desktopExperience = document.getElementById('desktopExperience');
  const mobileExperience = document.getElementById('mobileExperience');
  if (!desktopExperience && !mobileExperience) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;

  const disciplines = [
    { key:'directing', label:'Directing', selector:'.world-directing', tone:'lime' },
    { key:'games', label:'Games', selector:'.world-games', tone:'orange' },
    { key:'production', label:'Production', selector:'.world-production', tone:'gold' },
    { key:'social', label:'Social', selector:'.world-social', tone:'cyan' },
    { key:'editing', label:'Editing', selector:'.world-editing', tone:'rose' },
    { key:'ai', label:'AI Lab', selector:'.world-ai', tone:'violet' }
  ];

  const worldByKey = new Map(disciplines.map(item => [item.key, document.querySelector(item.selector)]));
  worldByKey.forEach((world, key) => {
    if (!world) return;
    world.dataset.simonKey = key;
    const dot = document.createElement('span');
    dot.className = 'simon-world-dot';
    dot.setAttribute('aria-hidden', 'true');
    world.appendChild(dot);
  });

  const state = {
    active:false,
    showing:false,
    round:0,
    inputIndex:0,
    sequence:[],
    completed:false,
    lastKey:'',
    timer:null
  };

  const style = document.createElement('style');
  style.textContent = `
    .simon-world-dot{position:absolute;left:16px;top:15px;width:8px;height:8px;border-radius:50%;background:#d8ff66;opacity:.34;box-shadow:0 0 0 rgba(216,255,102,0);transition:opacity .16s ease,transform .16s ease,box-shadow .16s ease}
    .world-games .simon-world-dot{background:#ff8f55}.world-production .simon-world-dot{background:#ffd56a}.world-social .simon-world-dot{background:#71d7ff}.world-editing .simon-world-dot{background:#ff8fa7}.world-ai .simon-world-dot{background:#a58cff}
    .world.simon-lit,.world.simon-correct{border-color:rgba(255,255,255,.88)!important;background:rgba(34,36,43,.96)!important;box-shadow:0 0 0 1px rgba(255,255,255,.1),0 18px 70px rgba(0,0,0,.5)!important}
    .world.simon-lit .simon-world-dot,.world.simon-correct .simon-world-dot{opacity:1;transform:scale(1.75);box-shadow:0 0 24px currentColor}
    .world.simon-wrong{animation:simonWrong .32s ease}.world.simon-wrong .simon-world-dot{background:#ff5757!important;opacity:1;transform:scale(1.6);box-shadow:0 0 22px #ff5757}
    @keyframes simonWrong{0%,100%{transform:translateX(0)}35%{transform:translateX(-5px)}70%{transform:translateX(5px)}}
    .simon-desktop-ui{position:absolute;left:50%;top:calc(50% + 168px);translate:-50% 0;z-index:12;display:flex;align-items:center;gap:12px;min-height:38px;white-space:nowrap}
    .simon-status{font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:#8e9096}.simon-status strong{color:#f5f2e9;font-weight:600}
    .simon-skip{border:0;background:none;color:#686b70;font-size:.66rem;text-transform:uppercase;letter-spacing:.12em;cursor:pointer;padding:8px}.simon-skip:hover{color:#f5f2e9}
    body.simon-mode .hub-instruction{color:#f5f2e9}.simon-success .hub-center h2{animation:simonTitlePulse .65s ease}@keyframes simonTitlePulse{50%{text-shadow:0 0 38px rgba(216,255,102,.35)}}
    .simon-mobile-panel{position:absolute;left:20px;right:20px;bottom:max(122px,calc(env(safe-area-inset-bottom) + 106px));z-index:12;padding:16px;border:1px solid rgba(255,255,255,.14);border-radius:20px;background:rgba(9,10,13,.78);backdrop-filter:blur(16px);box-shadow:0 18px 60px rgba(0,0,0,.38)}
    .simon-mobile-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.simon-mobile-head span{font-size:.67rem;letter-spacing:.13em;text-transform:uppercase;color:#a7a9ae}.simon-mobile-head button{border:0;background:none;color:#777;font-size:.65rem;text-transform:uppercase;letter-spacing:.1em;padding:6px;cursor:pointer}
    .simon-mobile-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.simon-mobile-key{min-height:52px;border:1px solid rgba(255,255,255,.1);border-radius:13px;background:rgba(255,255,255,.035);display:flex;align-items:center;gap:8px;padding:10px;color:#d8d9dd;text-align:left;font-size:.73rem}.simon-mobile-key i{width:9px;height:9px;flex:0 0 9px;border-radius:50%;background:var(--signal,#d8ff66);opacity:.5}.simon-mobile-key.simon-lit,.simon-mobile-key.simon-correct{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.55);color:#fff}.simon-mobile-key.simon-lit i,.simon-mobile-key.simon-correct i{opacity:1;transform:scale(1.5);box-shadow:0 0 18px var(--signal,#d8ff66)}.simon-mobile-key.simon-wrong{border-color:#ff5757;animation:simonWrong .32s ease}
    .simon-mobile-key[data-key="games"]{--signal:#ff8f55}.simon-mobile-key[data-key="production"]{--signal:#ffd56a}.simon-mobile-key[data-key="social"]{--signal:#71d7ff}.simon-mobile-key[data-key="editing"]{--signal:#ff8fa7}.simon-mobile-key[data-key="ai"]{--signal:#a58cff}
    @media(min-width:901px) and (pointer:fine){.simon-mobile-panel{display:none!important}}
    @media(max-width:900px),(pointer:coarse){.simon-desktop-ui{display:none!important}.mobile-hero .chapter-content{padding-bottom:max(280px,env(safe-area-inset-bottom))}}
  `;
  document.head.appendChild(style);

  const desktopUI = document.createElement('div');
  desktopUI.className = 'simon-desktop-ui';
  desktopUI.innerHTML = `<span class="simon-status" data-simon-status>Watch the signal</span><button class="simon-skip" type="button">Skip game</button>`;
  document.querySelector('.hub')?.appendChild(desktopUI);

  const mobileHero = mobileExperience?.querySelector('.mobile-hero');
  const mobilePanel = document.createElement('div');
  mobilePanel.className = 'simon-mobile-panel';
  mobilePanel.innerHTML = `
    <div class="simon-mobile-head"><span data-simon-mobile-status>Watch the signal</span><button type="button">Skip</button></div>
    <div class="simon-mobile-grid">
      ${disciplines.map(item => `<button type="button" class="simon-mobile-key" data-key="${item.key}"><i></i><span>${item.label}</span></button>`).join('')}
    </div>`;
  mobileHero?.appendChild(mobilePanel);

  const desktopStatus = desktopUI.querySelector('[data-simon-status]');
  const mobileStatus = mobilePanel.querySelector('[data-simon-mobile-status]');
  const mobileKeys = new Map([...mobilePanel.querySelectorAll('.simon-mobile-key')].map(button => [button.dataset.key, button]));

  const setStatus = text => {
    if (desktopStatus) desktopStatus.innerHTML = text;
    if (mobileStatus) mobileStatus.textContent = text.replace(/<[^>]+>/g, '');
  };

  const wait = ms => new Promise(resolve => window.setTimeout(resolve, ms));
  const randomKey = () => disciplines[Math.floor(Math.random() * disciplines.length)].key;

  const clearSignalClasses = () => {
    document.querySelectorAll('.simon-lit,.simon-correct,.simon-wrong').forEach(node => node.classList.remove('simon-lit','simon-correct','simon-wrong'));
  };

  const signalElement = key => coarse ? mobileKeys.get(key) : worldByKey.get(key);

  const flash = async (key, duration = 420) => {
    const targets = [worldByKey.get(key), mobileKeys.get(key)].filter(Boolean);
    targets.forEach(node => node.classList.add('simon-lit'));
    await wait(reduceMotion ? 170 : duration);
    targets.forEach(node => node.classList.remove('simon-lit'));
    await wait(reduceMotion ? 80 : 150);
  };

  const playSequence = async () => {
    if (!state.active) return;
    state.showing = true;
    state.inputIndex = 0;
    setStatus(`<strong>Round ${state.round + 1}/3</strong> · Watch the signal`);
    await wait(state.round === 0 ? 450 : 300);
    for (const key of state.sequence) {
      if (!state.active) return;
      await flash(key);
    }
    state.showing = false;
    setStatus(`<strong>Your turn</strong> · Repeat ${state.sequence.length} signals`);
  };

  const startRound = async () => {
    if (!state.active) return;
    const targetLength = 3 + state.round;
    while (state.sequence.length < targetLength) {
      let next = randomKey();
      if (next === state.lastKey && disciplines.length > 1) next = randomKey();
      state.sequence.push(next);
      state.lastKey = next;
    }
    await playSequence();
  };

  const finish = async () => {
    state.active = false;
    state.completed = true;
    state.showing = false;
    document.body.classList.remove('simon-mode');
    document.body.classList.add('simon-success');
    setStatus('<strong>Signal matched</strong> · Worlds unlocked');
    await wait(850);
    desktopUI.style.opacity = '0';
    mobilePanel.style.opacity = '0';
    await wait(280);
    desktopUI.hidden = true;
    mobilePanel.hidden = true;
    window.setTimeout(() => document.body.classList.remove('simon-success'), 700);
  };

  const repeatAfterMistake = async wrongNode => {
    state.showing = true;
    wrongNode?.classList.add('simon-wrong');
    setStatus('Almost · Watch it again');
    await wait(430);
    wrongNode?.classList.remove('simon-wrong');
    await playSequence();
  };

  const handleInput = async (key, node) => {
    if (!state.active || state.showing) return;
    const expected = state.sequence[state.inputIndex];
    if (key !== expected) {
      state.inputIndex = 0;
      await repeatAfterMistake(node);
      return;
    }

    node?.classList.add('simon-correct');
    window.setTimeout(() => node?.classList.remove('simon-correct'), 190);
    state.inputIndex += 1;

    if (state.inputIndex < state.sequence.length) return;

    state.showing = true;
    setStatus(`Nice · Round ${state.round + 1} clear`);
    await wait(560);
    state.round += 1;
    state.inputIndex = 0;
    if (state.round >= 3) return finish();
    await startRound();
  };

  const skip = () => {
    state.active = false;
    state.completed = true;
    state.showing = false;
    clearSignalClasses();
    document.body.classList.remove('simon-mode');
    desktopUI.hidden = true;
    mobilePanel.hidden = true;
  };

  const start = () => {
    if (state.active || state.completed) return;
    state.active = true;
    state.round = 0;
    state.inputIndex = 0;
    state.sequence = [];
    state.lastKey = '';
    desktopUI.hidden = false;
    mobilePanel.hidden = false;
    desktopUI.style.opacity = '';
    mobilePanel.style.opacity = '';
    document.body.classList.add('simon-mode');
    startRound();
  };

  desktopUI.querySelector('.simon-skip')?.addEventListener('click', skip);
  mobilePanel.querySelector('.simon-mobile-head button')?.addEventListener('click', skip);

  worldByKey.forEach((world, key) => {
    if (!world) return;
    world.addEventListener('click', event => {
      if (!state.active) return;
      event.preventDefault();
      event.stopPropagation();
    }, true);
    world.addEventListener('mouseenter', () => {
      if (!coarse) handleInput(key, world);
    });
  });

  mobileKeys.forEach((button, key) => {
    button.addEventListener('click', () => handleInput(key, button));
  });

  const intro = document.getElementById('intro');
  const enter = document.getElementById('enterButton');
  const beginSoon = () => window.setTimeout(start, reduceMotion ? 500 : 900);

  enter?.addEventListener('click', beginSoon, { once:true });
  if (!intro || intro.classList.contains('hidden') || sessionStorage.getItem('portfolio-intro-seen') === '1') beginSoon();
})();
