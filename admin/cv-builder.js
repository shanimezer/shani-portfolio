(() => {
  const KEY = 'shani-career-database-v1';
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const makeId = prefix => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,7)}`;
  const escape = value => { const d=document.createElement('div'); d.textContent=String(value??''); return d.innerHTML; };
  const splitTags = value => String(value||'').split(',').map(x=>x.trim()).filter(Boolean);
  const splitLines = value => String(value||'').split('\n').map(x=>x.trim()).filter(Boolean);

  const defaults = {
    profile:{name:'Shani Mezer',email:'',phone:'',location:'Tel Aviv, Israel',website:'',linkedin:'',summaryProfessional:'',summaryCreative:'',summaryConcise:'',languages:'English, Hebrew'},
    experience:[],education:[],skills:[],awards:[],projectMeta:{}
  };
  const load = () => { try { return {...structuredClone(defaults),...JSON.parse(localStorage.getItem(KEY)||'{}')}; } catch { return structuredClone(defaults); } };
  let db = load();
  let cvModel = null;
  const save = () => localStorage.setItem(KEY,JSON.stringify(db));
  const close = id => document.getElementById(id)?.close();
  $$('[data-close]').forEach(b=>b.onclick=()=>close(b.dataset.close));

  const emptyEntry = type => type==='experience' ? {id:makeId('exp'),title:'',organization:'',location:'',start:'',end:'',summary:'',bullets:[],tags:[],priority:2,include:true}
    : type==='education' ? {id:makeId('edu'),degree:'',institution:'',location:'',start:'',end:'',details:'',tags:[],include:true}
    : type==='skills' ? {id:makeId('skill'),name:'',group:'Creative & Technical',keywords:[],level:'',include:true}
    : {id:makeId('award'),title:'',issuer:'',year:'',details:'',tags:[],include:true};

  function renderCareer(){
    const root=$('#careerPanels');
    root.innerHTML=`
      <section class="career-panel active" data-career-panel="profile">${profileHtml()}</section>
      <section class="career-panel" data-career-panel="experience">${listHtml('experience','Work experience')}</section>
      <section class="career-panel" data-career-panel="education">${listHtml('education','Education')}</section>
      <section class="career-panel" data-career-panel="skills">${listHtml('skills','Skills')}</section>
      <section class="career-panel" data-career-panel="awards">${listHtml('awards','Awards & recognition')}</section>`;
    bindCareerInputs();
  }
  function profileHtml(){ const p=db.profile; return `<div class="profile-grid">
    ${field('Name','profile.name',p.name)}${field('Email','profile.email',p.email)}${field('Phone','profile.phone',p.phone)}${field('Location','profile.location',p.location)}${field('Website','profile.website',p.website)}${field('LinkedIn','profile.linkedin',p.linkedin)}
    ${area('Professional summary','profile.summaryProfessional',p.summaryProfessional,'full',4)}${area('Creative professional summary','profile.summaryCreative',p.summaryCreative,'full',4)}${area('Very concise summary','profile.summaryConcise',p.summaryConcise,'full',3)}${field('Languages','profile.languages',p.languages,'full')}
  </div>`; }
  function field(label,path,value,cls=''){return `<label class="${cls}">${label}<input data-path="${path}" value="${escape(value)}"></label>`}
  function area(label,path,value,cls='',rows=3){return `<label class="${cls}">${label}<textarea rows="${rows}" data-path="${path}">${escape(value)}</textarea></label>`}
  function listHtml(type,title){return `<div class="data-header"><div><h3>${title}</h3><small class="eyebrow">ONLY APPROVED FACTS ARE USED</small></div><button class="primary" data-add="${type}">+ Add</button></div><div class="data-list">${db[type].map((e,i)=>cardHtml(type,e,i)).join('')||'<div class="empty-blocks">No entries yet.</div>'}</div>`}
  function cardHtml(type,e,i){
    const common=`data-type="${type}" data-index="${i}"`;
    if(type==='experience') return `<div class="data-card" ${common}><div class="data-card-grid">${inp('Role / title','title',e.title)}${inp('Organization','organization',e.organization)}${inp('Location','location',e.location)}${inp('Start','start',e.start)}${inp('End','end',e.end)}${inp('Priority 1-4','priority',e.priority,'number')}${txt('Summary','summary',e.summary,3,'span-2')}${txt('Approved bullet points','bullets',(e.bullets||[]).join('\n'),5,'span-2')}${inp('Tags / relevant roles','tags',(e.tags||[]).join(', '),'text','span-2')}${check('Available to generator','include',e.include)}</div>${remove(type,i)}</div>`;
    if(type==='education') return `<div class="data-card" ${common}><div class="data-card-grid">${inp('Degree / program','degree',e.degree)}${inp('Institution','institution',e.institution)}${inp('Location','location',e.location)}${inp('Start','start',e.start)}${inp('End','end',e.end)}${txt('Details','details',e.details,3,'span-2')}${inp('Tags','tags',(e.tags||[]).join(', '),'text','span-2')}${check('Available to generator','include',e.include)}</div>${remove(type,i)}</div>`;
    if(type==='skills') return `<div class="data-card" ${common}><div class="data-card-grid">${inp('Skill','name',e.name)}${inp('Group','group',e.group)}${inp('Related keywords','keywords',(e.keywords||[]).join(', '),'text','span-2')}${inp('Level / note','level',e.level)}${check('Available to generator','include',e.include)}</div>${remove(type,i)}</div>`;
    return `<div class="data-card" ${common}><div class="data-card-grid">${inp('Award / recognition','title',e.title)}${inp('Issuer / festival','issuer',e.issuer)}${inp('Year','year',e.year)}${inp('Tags','tags',(e.tags||[]).join(', '))}${txt('Details','details',e.details,3,'span-2')}${check('Available to generator','include',e.include)}</div>${remove(type,i)}</div>`;
  }
  function inp(label,name,value,type='text',cls=''){return `<label class="${cls}">${label}<input type="${type}" data-field="${name}" value="${escape(value)}"></label>`}
  function txt(label,name,value,rows=3,cls=''){return `<label class="${cls}">${label}<textarea rows="${rows}" data-field="${name}">${escape(value)}</textarea></label>`}
  function check(label,name,value){return `<label class="check"><input type="checkbox" data-field="${name}" ${value!==false?'checked':''}> ${label}</label>`}
  function remove(type,i){return `<div class="data-card-actions"><button class="mini-danger" data-remove="${type}" data-index="${i}">Remove</button></div>`}
  function bindCareerInputs(){
    $('[data-career-panel="profile"]')?.querySelectorAll('[data-path]').forEach(el=>el.oninput=()=>{const k=el.dataset.path.split('.')[1];db.profile[k]=el.value});
    $$('.data-card').forEach(card=>card.querySelectorAll('[data-field]').forEach(el=>el.oninput=()=>{const item=db[card.dataset.type][+card.dataset.index];let v=el.type==='checkbox'?el.checked:el.value;if(['tags','keywords','bullets'].includes(el.dataset.field))v=el.dataset.field==='bullets'?splitLines(v):splitTags(v);if(el.dataset.field==='priority')v=Number(v)||1;item[el.dataset.field]=v}));
    $$('[data-add]').forEach(b=>b.onclick=()=>{db[b.dataset.add].push(emptyEntry(b.dataset.add));renderCareer();activateCareerTab(b.dataset.add)});
    $$('[data-remove]').forEach(b=>b.onclick=()=>{db[b.dataset.remove].splice(+b.dataset.index,1);renderCareer();activateCareerTab(b.dataset.remove)});
  }
  function activateCareerTab(name){$$('.career-tabs button').forEach(b=>b.classList.toggle('active',b.dataset.careerTab===name));$$('.career-panel').forEach(p=>p.classList.toggle('active',p.dataset.careerPanel===name))}
  $$('.career-tabs button').forEach(b=>b.onclick=()=>activateCareerTab(b.dataset.careerTab));
  $('#openCareerData').onclick=()=>{renderCareer();$('#careerDialog').showModal()};
  $('#saveCareerData').onclick=()=>{save();close('careerDialog')};

  function selectedProject(){const id=$('.project-item.active')?.dataset.id;return window.PortfolioCMS.get().find(p=>p.id===id)}
  $('#openProjectCv').onclick=()=>{
    const p=selectedProject();if(!p)return alert('Select a project first.');
    const m=db.projectMeta[p.id]||{cvTitle:'',cvSummary:'',bullets:[],roles:p.roles||[],industries:p.categories||[],skills:[],priority:2,include:true};
    const f=$('#projectCvForm');f.dataset.projectId=p.id;$('#projectCvTitle').textContent=`CV data · ${p.title}`;
    ['cvTitle','cvSummary'].forEach(k=>f.elements[k].value=m[k]||'');f.elements.bullets.value=(m.bullets||[]).join('\n');f.elements.roles.value=(m.roles||[]).join(', ');f.elements.industries.value=(m.industries||[]).join(', ');f.elements.skills.value=(m.skills||[]).join(', ');f.elements.priority.value=m.priority||2;f.elements.include.checked=m.include!==false;$('#projectCvDialog').showModal();
  };
  $('#projectCvForm').onsubmit=e=>{e.preventDefault();const f=e.currentTarget;db.projectMeta[f.dataset.projectId]={cvTitle:f.elements.cvTitle.value.trim(),cvSummary:f.elements.cvSummary.value.trim(),bullets:splitLines(f.elements.bullets.value),roles:splitTags(f.elements.roles.value),industries:splitTags(f.elements.industries.value),skills:splitTags(f.elements.skills.value),priority:Number(f.elements.priority.value)||2,include:f.elements.include.checked};save();close('projectCvDialog')};

  const tokenize = text => [...new Set(String(text||'').toLowerCase().replace(/[^a-z0-9א-ת+#. ]/g,' ').split(/\s+/).filter(x=>x.length>2))];
  const scoreText = (text,needles,priority=2) => {const hay=String(text||'').toLowerCase();let score=priority*2;needles.forEach(n=>{if(hay.includes(n))score+=n.length>6?5:3});return score};
  function sourceItems(){
    const projects=window.PortfolioCMS.get().filter(p=>(p.status||'draft')==='published'||db.projectMeta[p.id]);
    return {
      projects:projects.map(p=>{const m=db.projectMeta[p.id]||{};return {kind:'project',id:p.id,title:m.cvTitle||p.title,organization:p.client||'Selected Project',dates:p.year||'',summary:m.cvSummary||p.summary||'',bullets:m.bullets||[],tags:[...(m.roles||p.roles||[]),...(m.industries||p.categories||[]),...(m.skills||[]),p.category,p.tools].join(' '),priority:m.priority||2,include:m.include!==false}}),
      experience:db.experience.filter(x=>x.include!==false).map(x=>({...x,kind:'experience',dates:[x.start,x.end].filter(Boolean).join(' – '),tags:(x.tags||[]).join(' ')})),
      education:db.education.filter(x=>x.include!==false).map(x=>({...x,kind:'education',title:x.degree,organization:x.institution,dates:[x.start,x.end].filter(Boolean).join(' – '),summary:x.details,tags:(x.tags||[]).join(' '),priority:2})),
      awards:db.awards.filter(x=>x.include!==false).map(x=>({...x,kind:'award',organization:x.issuer,dates:x.year,summary:x.details,tags:(x.tags||[]).join(' '),priority:2})),
      skills:db.skills.filter(x=>x.include!==false).map(x=>({...x,kind:'skill',title:x.name,tags:[x.name,x.group,...(x.keywords||[])].join(' '),priority:2}))
    };
  }
  function buildModel(){
    const role=$('#cvTargetRole').value.trim(),jd=$('#cvJobDescription').value.trim(),needles=tokenize(`${role} ${jd}`),src=sourceItems(),len=$('#cvLength').value;
    const rank=arr=>arr.map(x=>({...x,score:scoreText(`${x.title} ${x.organization||''} ${x.summary||''} ${(x.bullets||[]).join(' ')} ${x.tags||''}`,needles,x.priority||2)})).sort((a,b)=>b.score-a.score);
    const limits=len==='one'?{projects:3,experience:3,education:2,awards:2,skills:12}:{projects:5,experience:5,education:3,awards:4,skills:18};
    cvModel={role,language:$('#cvLanguage').value,tone:$('#cvTone').value,needles,groups:{}};
    Object.keys(src).forEach(k=>cvModel.groups[k]=rank(src[k]).slice(0,limits[k]));
    renderSelection();renderCv();
  }
  function renderSelection(){
    const labels={projects:'Selected projects',experience:'Experience',education:'Education',skills:'Skills',awards:'Awards'};
    $('#cvSelection').innerHTML=Object.entries(cvModel.groups).map(([k,items])=>`<div class="selection-group"><h4>${labels[k]}</h4>${items.map((x,i)=>`<label class="selection-item"><input type="checkbox" data-group="${k}" data-index="${i}" checked><span><strong>${escape(x.title||x.name)}</strong><small>${escape(x.organization||x.group||'')}</small></span><span class="score-pill">${x.score}</span></label>`).join('')||'<div class="selection-item"><small>No approved entries yet</small></div>'}</div>`).join('');
    $$('#cvSelection input').forEach(i=>i.onchange=renderCv);
  }
  function chosen(group){return (cvModel.groups[group]||[]).filter((_,i)=>$(`#cvSelection input[data-group="${group}"][data-index="${i}"]`)?.checked)}
  function summary(){const p=db.profile,tone=cvModel.tone;let base=tone==='creative'?p.summaryCreative:tone==='concise'?p.summaryConcise:p.summaryProfessional;if(!base)base=`Multidisciplinary digital media creator with experience across ${chosen('skills').slice(0,4).map(x=>x.title).join(', ')||'creative production and storytelling'}.`;return base}
  function renderCv(){if(!cvModel)return;const p=db.profile,exp=chosen('experience'),pro=chosen('projects'),edu=chosen('education'),skills=chosen('skills'),awards=chosen('awards');
    $('#cvPreview').innerHTML=`<header><div class="cv-header-line"><div><h1>${escape(p.name)}</h1><strong>${escape(cvModel.role||'Creative Professional')}</strong></div></div><div class="cv-contact">${[p.location,p.phone,p.email,p.website,p.linkedin].filter(Boolean).map(escape).join(' · ')}</div></header><p class="cv-summary">${escape(summary())}</p>${section('Experience',exp.map(entryHtml).join(''))}${section('Selected Projects',pro.map(entryHtml).join(''))}${section('Education',edu.map(entryHtml).join(''))}${section('Skills',skills.length?`<p>${skills.map(x=>escape(x.title)).join(' · ')}</p>`:'')}${section('Awards & Recognition',awards.map(entryHtml).join(''))}`;
    const all=[...exp,...pro,...edu,...skills,...awards];$('#cvMatchSummary').textContent=`${all.length} approved entries selected · based on ${cvModel.needles.length} job keywords`;
  }
  function section(title,body){return body?`<section><h2>${title}</h2>${body}</section>`:''}
  function entryHtml(x){const bullets=(x.bullets||[]).slice(0,4);return `<div class="cv-entry"><div class="cv-entry-head"><h3>${escape(x.title||x.name)}</h3><span class="cv-entry-meta">${escape(x.dates||'')}</span></div>${x.organization?`<div class="cv-entry-meta">${escape(x.organization)}${x.location?` · ${escape(x.location)}`:''}</div>`:''}${x.summary?`<p>${escape(x.summary)}</p>`:''}${bullets.length?`<ul>${bullets.map(b=>`<li>${escape(b)}</li>`).join('')}</ul>`:''}</div>`}
  function plainText(){return $('#cvPreview').innerText.trim()}
  $('#openCvGenerator').onclick=()=>{$('#cvGeneratorDialog').showModal()};
  $('#buildCv').onclick=buildModel;
  $('#cvSelection').onchange=renderCv;
  $('#copyCv').onclick=async()=>{if(!cvModel)return alert('Build a CV first.');await navigator.clipboard.writeText(plainText());alert('CV text copied.')};
  $('#downloadCv').onclick=()=>{if(!cvModel)return alert('Build a CV first.');const html=`<!doctype html><meta charset="utf-8"><title>${escape(db.profile.name)} CV</title><style>body{font-family:Arial,sans-serif;color:#181818;max-width:820px;margin:40px auto;padding:0 30px}h1{font-size:34px;margin:0}h2{font-size:15px;text-transform:uppercase;letter-spacing:.12em;border-bottom:1px solid #aaa;padding-bottom:5px;margin-top:24px}.cv-entry-head{display:flex;justify-content:space-between}.cv-entry-meta{font-size:12px;color:#555}li{margin:4px 0}</style>${$('#cvPreview').innerHTML}`;download('shani-mezer-tailored-cv.html',html,'text/html')};
  $('#printCv').onclick=()=>{if(!cvModel)return alert('Build a CV first.');window.print()};
  function download(name,content,type){const blob=new Blob([content],{type});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
})();
