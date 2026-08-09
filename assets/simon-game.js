(() => {
  'use strict';

  const desktopExperience = document.getElementById('desktopExperience');
  const mobileExperience = document.getElementById('mobileExperience');
  if (!desktopExperience && !mobileExperience) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = window.matchMedia('(pointer: coarse)').matches;

  const disciplines = [
    { key:'directing', label:'Directing', selector:'.world-directing', frequency:523.25 },
    { key:'games', label:'Games', selector:'.world-games', frequency:587.33 },
    { key:'production', label:'Production', selector:'.world-production', frequency:659.25 },
    { key:'social', label:'Social', selector:'.world-social', frequency:698.46 },
    { key:'editing', label:'Editing', selector:'.world-editing', frequency:783.99 },
    { key:'ai', label:'AI Lab', selector:'.world-ai', frequency:880.00 }
  ];

  const disciplineByKey = new Map(disciplines.map(item => [item.key, item]));
  const worldByKey = new Map(disciplines.map(item => [item.key, document.querySelector(item.selector)]));
  worldByKey.forEach((world, key) => {
    if (!world) return;
    world.dataset.simonKey = key;
    if (!world.querySelector('.simon-world-dot')) {
      const dot = document.createElement('span');
      dot.className = 'simon-world-dot';
      dot.setAttribute('aria-hidden', 'true');
      world.appendChild(dot);
    }
  });

  const state = { active:false, showing:false, round:0, inputIndex:0, sequence:[], completed:false, lastKey:'' };
  let audioContext = null;
  let masterGain = null;

  const ensureAudio = () => {
    if (reduceMotion) return null;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    if (!audioContext) {
      audioContext = new AudioContext();
      masterGain = audioContext.createGain();
      masterGain.gain.value = 0.11;
      masterGain.connect(audioContext.destination);
    }
    if (audioContext.state === 'suspended') audioContext.resume().catch(() => {});
    return audioContext;
  };

  const playTone = (frequency, duration = .16, volume = .055, delay = 0) => {
    const ctx = ensureAudio();
    if (!ctx || !masterGain) return;
    const start = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, start);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(volume, start + .018);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start(start);
    osc.stop(start + duration + .03);
  };

  const playKeyTone = key => playTone(disciplineByKey.get(key)?.frequency || 523.25);
  const playSuccessChord = () => {
    [523.25,659.25,783.99,1046.5].forEach((frequency,index) => playTone(frequency,.55,.04,index * .045));
  };

  const style = document.createElement('style');
  style.textContent = `
    .simon-world-dot{position:absolute;left:16px;top:15px;width:8px;height:8px;border-radius:50%;background:#d8ff66;opacity:.34;box-shadow:0 0 0 rgba(216,255,102,0);transition:opacity .16s ease,transform .16s ease,box-shadow .16s ease}
    .world-games .simon-world-dot{background:#ff8f55}.world-production .simon-world-dot{background:#ffd56a}.world-social .simon-world-dot{background:#71d7ff}.world-editing .simon-world-dot{background:#ff8fa7}.world-ai .simon-world-dot{background:#a58cff}
    .world.simon-lit,.world.simon-correct{border-color:rgba(255,255,255,.88)!important;background:rgba(34,36,43,.96)!important;box-shadow:0 0 0 1px rgba(255,255,255,.1),0 18px 70px rgba(0,0,0,.5)!important}
    .world.simon-lit .simon-world-dot,.world.simon-correct .simon-world-dot{opacity:1;transform:scale(1.75);box-shadow:0 0 24px currentColor}
    .world.simon-wrong{animation:simonWrong .32s ease}.world.simon-wrong .simon-world-dot{background:#ff5757!important;opacity:1;transform:scale(1.6);box-shadow:0 0 22px #ff5757}
    @keyframes simonWrong{0%,100%{translate:0 0}35%{translate:-5px 0}70%{translate:5px 0}}
    .simon-desktop-ui{position:absolute;left:50%;top:calc(50% + 168px);translate:-50% 0;z-index:12;display:flex;align-items:center;gap:12px;min-height:38px;white-space:nowrap;transition:opacity .28s ease}
    .simon-status{font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;color:#8e9096}.simon-status strong{color:#f5f2e9;font-weight:600}
    .simon-skip{border:0;background:none;color:#686b70;font-size:.66rem;text-transform:uppercase;letter-spacing:.12em;cursor:pointer;padding:8px}.simon-skip:hover{color:#f5f2e9}
    body.simon-mode .hub-instruction{color:#f5f2e9}
    body.simon-celebrating .hub:before{animation:simonRingBurst 1.15s ease-out}body.simon-celebrating .hub:after{animation:simonRingBurst 1.15s .08s ease-out}
    body.simon-celebrating .hub-center h2{animation:simonTitlePulse 1.15s ease}
    body.simon-celebrating .world{animation:simonWorldJoy .72s var(--joy-delay,0ms) ease both}
    body.simon-celebrating .world-directing{--joy-delay:0ms}body.simon-celebrating .world-games{--joy-delay:70ms}body.simon-celebrating .world-production{--joy-delay:140ms}body.simon-celebrating .world-social{--joy-delay:210ms}body.simon-celebrating .world-editing{--joy-delay:280ms}body.simon-celebrating .world-ai{--joy-delay:350ms}
    body.simon-celebrating .world .simon-world-dot{animation:simonDotJoy .85s var(--joy-delay,0ms) ease both}
    @keyframes simonTitlePulse{0%,100%{text-shadow:none;transform:scale(1)}45%{text-shadow:0 0 48px rgba(216,255,102,.5);transform:scale(1.025)}}
    @keyframes simonRingBurst{0%{opacity:.08;scale:1}45%{opacity:.42;scale:1.06}100%{opacity:.08;scale:1.13}}
    @keyframes simonWorldJoy{0%,100%{border-color:var(--line);background:rgba(17,18,23,.62)}50%{border-color:rgba(255,255,255,.9);background:rgba(38,40,47,.98);box-shadow:0 0 42px rgba(216,255,102,.12),0 20px 70px rgba(0,0,0,.5);transform:translateY(-4px) scale(1.025)}}
    @keyframes simonDotJoy{0%,100%{opacity:.34;transform:scale(1)}50%{opacity:1;transform:scale(2.2);box-shadow:0 0 30px currentColor}}
    .simon-mobile-panel{position:absolute;left:20px;right:20px;bottom:max(122px,calc(env(safe-area-inset-bottom) + 106px));z-index:12;padding:16px;border:1px solid rgba(255,255,255,.14);border-radius:20px;background:rgba(9,10,13,.78);backdrop-filter:blur(16px);box-shadow:0 18px 60px rgba(0,0,0,.38);transition:opacity .28s ease}
    .simon-mobile-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}.simon-mobile-head span{font-size:.67rem;letter-spacing:.13em;text-transform:uppercase;color:#a7a9ae}.simon-mobile-head button{border:0;background:none;color:#777;font-size:.65rem;text-transform:uppercase;letter-spacing:.1em;padding:6px;cursor:pointer}
    .simon-mobile-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.simon-mobile-key{min-height:52px;border:1px solid rgba(255,255,255,.1);border-radius:13px;background:rgba(255,255,255,.035);display:flex;align-items:center;gap:8px;padding:10px;color:#d8d9dd;text-align:left;font-size:.73rem}.simon-mobile-key i{width:9px;height:9px;flex:0 0 9px;border-radius:50%;background:var(--signal,#d8ff66);opacity:.5}.simon-mobile-key.simon-lit,.simon-mobile-key.simon-correct{background:rgba(255,255,255,.12);border-color:rgba(255,255,255,.55);color:#fff}.simon-mobile-key.simon-lit i,.simon-mobile-key.simon-correct i{opacity:1;transform:scale(1.5);box-shadow:0 0 18px var(--signal,#d8ff66)}.simon-mobile-key.simon-wrong{border-color:#ff5757;animation:simonWrong .32s ease}
    .simon-mobile-key[data-key="games"]{--signal:#ff8f55}.simon-mobile-key[data-key="production"]{--signal:#ffd56a}.simon-mobile-key[data-key="social"]{--signal:#71d7ff}.simon-mobile-key[data-key="editing"]{--signal:#ff8fa7}.simon-mobile-key[data-key="ai"]{--signal:#a58cff}
    body.simon-celebrating .simon-mobile-key{animation:simonMobileJoy .7s var(--mobile-delay,0ms) ease both}.simon-mobile-key:nth-child(1){--mobile-delay:0ms}.simon-mobile-key:nth-child(2){--mobile-delay:70ms}.simon-mobile-key:nth-child(3){--mobile-delay:140ms}.simon-mobile-key:nth-child(4){--mobile-delay:210ms}.simon-mobile-key:nth-child(5){--mobile-delay:280ms}.simon-mobile-key:nth-child(6){--mobile-delay:350ms}
    @keyframes simonMobileJoy{0%,100%{transform:scale(1)}50%{transform:scale(1.055);background:rgba(255,255,255,.16);border-color:rgba(255,255,255,.72)}}
    @media(min-width:901px) and (pointer:fine){.simon-mobile-panel{display:none!important}}
    @media(max-width:900px),(pointer:coarse){.simon-desktop-ui{display:none!important}.mobile-hero .chapter-content{padding-bottom:max(280px,env(safe-area-inset-bottom))}}
    @media(prefers-reduced-motion:reduce){body.simon-celebrating .world,body.simon-celebrating .simon-mobile-key,body.simon-celebrating .hub:before,body.simon-celebrating .hub:after,body.simon-celebrating .hub-center h2{animation:none!important}}
  `;
  document.head.appendChild(style);

  const desktopUI = document.createElement('div');
  desktopUI.className = 'simon-desktop-ui';
  desktopUI.innerHTML = `<span class="simon-status" data-simon-status>Watch the signal</span><button class="simon-skip" type="button">Skip game</button>`;
  document.querySelector('.hub')?.appendChild(desktopUI);

  const mobileHero = mobileExperience?.querySelector('.mobile-hero');
  const mobilePanel = document.createElement('div');
  mobilePanel.className = 'simon-mobile-panel';
  mobilePanel.innerHTML = `<div class="simon-mobile-head"><span data-simon-mobile-status>Watch the signal</span><button type="button">Skip</button></div><div class="simon-mobile-grid">${disciplines.map(item => `<button type="button" class="simon-mobile-key" data-key="${item.key}"><i></i><span>${item.label}</span></button>`).join('')}</div>`;
  mobileHero?.appendChild(mobilePanel);

  const desktopStatus = desktopUI.querySelector('[data-simon-status]');
  const mobileStatus = mobilePanel.querySelector('[data-simon-mobile-status]');
  const mobileKeys = new Map([...mobilePanel.querySelectorAll('.simon-mobile-key')].map(button => [button.dataset.key, button]));
  const setStatus = text => { if (desktopStatus) desktopStatus.innerHTML = text; if (mobileStatus) mobileStatus.textContent = text.replace(/<[^>]+>/g, ''); };
  const wait = ms => new Promise(resolve => window.setTimeout(resolve, ms));
  const randomKey = () => disciplines[Math.floor(Math.random() * disciplines.length)].key;
  const clearSignalClasses = () => document.querySelectorAll('.simon-lit,.simon-correct,.simon-wrong').forEach(node => node.classList.remove('simon-lit','simon-correct','simon-wrong'));

  const flash = async (key, duration = 420) => {
    const targets = [worldByKey.get(key), mobileKeys.get(key)].filter(Boolean);
    targets.forEach(node => node.classList.add('simon-lit'));
    playKeyTone(key);
    await wait(reduceMotion ? 170 : duration);
    targets.forEach(node => node.classList.remove('simon-lit'));
    await wait(reduceMotion ? 80 : 150);
  };

  const playSequence = async () => {
    if (!state.active) return;
    state.showing = true; state.inputIndex = 0;
    setStatus(`<strong>Round ${state.round + 1}/3</strong> · Watch the signal`);
    await wait(state.round === 0 ? 450 : 300);
    for (const key of state.sequence) { if (!state.active) return; await flash(key); }
    state.showing = false;
    setStatus(`<strong>Your turn</strong> · Repeat ${state.sequence.length} signals`);
  };

  const startRound = async () => {
    if (!state.active) return;
    const targetLength = 3 + state.round;
    while (state.sequence.length < targetLength) {
      let next = randomKey();
      if (next === state.lastKey && disciplines.length > 1) next = randomKey();
      state.sequence.push(next); state.lastKey = next;
    }
    await playSequence();
  };

  const finish = async () => {
    state.active = false; state.completed = true; state.showing = false;
    document.body.classList.remove('simon-mode');
    setStatus('<strong>Signal matched</strong> · Worlds unlocked');
    playSuccessChord();
    document.body.classList.add('simon-celebrating');
    for (const item of disciplines) { playKeyTone(item.key); await wait(reduceMotion ? 35 : 75); }
    await wait(reduceMotion ? 250 : 1050);
    document.body.classList.remove('simon-celebrating');
    desktopUI.style.opacity = '0'; mobilePanel.style.opacity = '0';
    await wait(280);
    desktopUI.hidden = true; mobilePanel.hidden = true;
  };

  const repeatAfterMistake = async wrongNode => {
    state.showing = true; wrongNode?.classList.add('simon-wrong'); setStatus('Almost · Watch it again');
    await wait(430); wrongNode?.classList.remove('simon-wrong'); await playSequence();
  };

  const handleInput = async (key, node) => {
    if (!state.active || state.showing) return;
    ensureAudio();
    const expected = state.sequence[state.inputIndex];
    if (key !== expected) { state.inputIndex = 0; await repeatAfterMistake(node); return; }
    playKeyTone(key);
    node?.classList.add('simon-correct'); window.setTimeout(() => node?.classList.remove('simon-correct'), 190); state.inputIndex += 1;
    if (state.inputIndex < state.sequence.length) return;
    state.showing = true; setStatus(`Nice · Round ${state.round + 1} clear`); await wait(560); state.round += 1; state.inputIndex = 0;
    if (state.round >= 3) return finish();
    await startRound();
  };

  const skip = () => { state.active=false; state.completed=true; state.showing=false; clearSignalClasses(); document.body.classList.remove('simon-mode','simon-celebrating'); desktopUI.hidden=true; mobilePanel.hidden=true; };
  const start = () => { if (state.active || state.completed) return; state.active=true; state.round=0; state.inputIndex=0; state.sequence=[]; state.lastKey=''; desktopUI.hidden=false; mobilePanel.hidden=false; desktopUI.style.opacity=''; mobilePanel.style.opacity=''; document.body.classList.add('simon-mode'); startRound(); };

  desktopUI.querySelector('.simon-skip')?.addEventListener('click', skip);
  mobilePanel.querySelector('.simon-mobile-head button')?.addEventListener('click', skip);
  worldByKey.forEach((world,key) => {
    if (!world) return;
    world.addEventListener('click', event => { if (!state.active) return; event.preventDefault(); event.stopPropagation(); }, true);
    world.addEventListener('mouseenter', () => { if (!coarse) handleInput(key,world); });
  });
  mobileKeys.forEach((button,key) => button.addEventListener('click', () => handleInput(key,button)));

  const intro = document.getElementById('intro');
  const enter = document.getElementById('enterButton');
  const beginSoon = () => { ensureAudio(); window.setTimeout(start, reduceMotion ? 500 : 900); };
  enter?.addEventListener('click', beginSoon, { once:true });
  if (!intro || intro.classList.contains('hidden') || sessionStorage.getItem('portfolio-intro-seen') === '1') beginSoon();
})();