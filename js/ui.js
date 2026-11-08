/* رابط کاربری: ساخت هدر و منوها، صفحه‌های داخلی (درباره، پروژه‌ها، پایداری، خدمات، تیم، تماس)، مودال پروژه، رویدادهای کلیک و آدرس (#/...)، و HUD پیمایش (نوار پیشرفت و کادر پایین‌چپ). */
let cat='all',strat='envelope',sid=1,svt='services';
const MK="";
const bd=s=>`<div class="bdg"><span>${s.sectionNum}</span><span>/</span><span>${s.title}</span></div>`;
const hd=s=>`<div class="hd">${bd(s)}<h2>${s.headline}</h2><p>${s.subtitle||''}</p></div>`;
const MS=`<svg viewBox="0 0 100 135" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round"><path d="${MK}"/><path d="M50 32L50 92"/></svg>`;
const H={
hero(){const T=t();return `<div class="pill sub">✦ ${T.brand.taglineEn}</div><div class="hc"><div class="tile glass">${MS}</div><h1>${T.hero.headline}</h1><p class="lead">${T.hero.subheadline}</p><div class="btns"><button class="btn p" data-a="go" data-v="about">${T.hero.ctaExplore}</button><button class="btn" data-a="go" data-v="projects">${T.hero.ctaProjects}</button></div></div><div class="ft"><span>${T.hero.founded}</span><button data-a="go" data-v="about">${T.hero.scrollHint}<br>⌄</button></div>`},
about(){const T=t(),A=T.about;return `<div class="in">${hd({...A,subtitle:''})}<div class="g12"><div style="display:grid;gap:18px"><p class="glass pad lead2">${A.lead}</p><p>${A.p1}</p><p>${A.p2}</p><p>${A.p3}</p><div class="vis"><b>◈ ${A.visionTitle}</b><p style="color:#fff;margin-top:6px">${A.visionText}</p></div></div>
<div style="display:grid;gap:16px"><div class="st"><div class="glass"><b>${N('۲۰+','20+')}</b><span>${N('سال پشتوانه تجربی','Years Experience')}</span></div><div class="glass"><b>${N('۱۲+','12+')}</b><span>${N('پروژه شاخص مطالعاتی','Landmark Studies')}</span></div><div class="glass"><b>${N('۱۳۹۹','2020')}</b><span>${N('سال تأسیس در مشهد','Established in Mashhad')}</span></div><div class="glass"><b>EC++</b><span>${N('بالاترین رتبه مبحث ۱۹','Peak Part 19 Class')}</span></div></div>
<div class="glass pad ci"><span>⌖ ${T.contact.address}</span><span>✆ <a href="tel:09339039563">${T.contact.phones[0]}</a> / <a href="tel:09151213005">${T.contact.phones[1]}</a></span><a href="https://instagram.com/isb.group" target="_blank" rel="noopener">◎ ${T.contact.instagram}</a></div></div></div></div>`},
projects(){const T=t(),P=T.projects,cs=['all','residential','industrial','public','landscape','research'],ps=cat=='all'?D.projects:D.projects.filter(p=>p.categories.includes(cat));
const stl=s=>s=='completed'?P.completed:s=='competition'?P.competition:P.ongoing;
return `<div class="in">${hd(P)}<div class="tabs" role="tablist">${cs.map(c=>`<button class="chip sub${c==cat?' on':''}" data-a="cat" data-v="${c}" role="tab">${P[c]}</button>`).join('')}</div><div class="pj">${ps.map((p,i)=>{const m=p.metrics[0];return `<article class="card glass gi${i==0&&cat=='all'?' f':''}" data-a="proj" data-v="${p.slug}" tabindex="0"><div class="im" style="background-image:url(${img(p.coverImage)})">${p.energyClass?`<span class="ec">⛨ ${p.energyClass}</span>`:''}<span>${stl(p.status)}</span></div><div class="bd"><small>${g(p.location)} · ${p.year}</small><small>${g(p.typology)}</small><h3>${g(p.title)}</h3><p>${g(p.description)}</p><small>${P.architectLabel}: ${g(p.architect)}</small>${m?`<div class="mt"><span>${g(m.label)}</span><b>${m.value}${m.unit?' '+m.unit:''}</b></div>`:''}</div></article>`}).join('')}</div></div>`},
sustainability(){const T=t(),S=T.sustainability,ids=['envelope','daylight','ventilation','renewable','water'],ix=ids.indexOf(strat),W=[24,23,18,13,8,8,6,6],Wk=Object.keys(S.sarvWeights),Lv=[['green','#5FA37A'],['gold','#EAB308'],['silver','#8FA3D6'],['turquoise','#3fd0c9']];
return `<div class="in">${hd(S)}<div class="tabs">${ids.map(i=>`<button class="chip sub${i==strat?' on':''}" data-a="st" data-v="${i}">${S.tabs[i]}</button>`).join('')}</div><div class="glass pad"><h3>${S.tabs[strat]}</h3><p style="margin-top:8px">${S[strat+'Desc']}</p><div class="hl">${HL[ix].map(h=>`<div><span>${N(h[0],h[1])}</span><b>${h[2]}</b></div>`).join('')}</div></div>
<div class="sx"><div><svg id="ring" viewBox="0 0 400 400" role="img" aria-label="${S.tabs.sarv}">${ring(Wk,W,S)}</svg></div><div class="glass pad"><h3>✦ ${S.sarvTitle}</h3><p style="margin:8px 0">${S.sarvDesc}</p><p style="font-size:.86rem;color:var(--ice)">${S.sarvVsPart19}</p><div class="lv">${Lv.map(l=>`<div><i style="background:${l[1]}"></i>${S.sarvLevels[l[0]]}</div>`).join('')}</div></div></div></div>`},
services(){const T=t(),V=T.services,sv=D.services.find(s=>s.id==sid)||D.services[0];
const body=svt=='services'?`<div class="sv"><div class="glass pad" style="display:grid;gap:8px"><small style="color:var(--ice)">${N('محور','Domain')} ${N(fa(sv.id),sv.id)}</small><h3>${g(sv.title)}</h3><p>${g(sv.description)}</p>${sv.id==13?`<p style="font-size:.84rem;color:#7fe0ae">${N('مشاور آکوستیک همکار: مهندس سمیه امینی‌نسب، پژوهشگر گروه آکوستیک مرکز تحقیقات راه، مسکن و شهرسازی','Acoustics consultant: Eng. Somayeh Aminineshab, BHRC acoustics researcher')}</p>`:''}${(sv.highlights||[]).map(h=>`<small>• ${g(h)}</small>`).join('')}</div><div class="sl">${D.services.map(s=>`<button class="${s.id==sv.id?'on':''}" data-a="sv" data-v="${s.id}"><b>${String(s.id).padStart(2,'0')}</b><h4>${g(s.title)}</h4></button>`).join('')}</div></div>`
:`<div class="ed">${D.educationalPrograms.map(e=>`<div class="glass pad">${IM['/education/'+(/expo/i.test(e.id)?'expolab404':'designbuilder-course')+'.jpg']?`<img alt="" src="${IM['/education/'+(/expo/i.test(e.id)?'expolab404':'designbuilder-course')+'.jpg']}">`:''}<h3>${g(e.title)}</h3>${['hours','audience','instructors','description'].map(k=>e[k]?`<p style="font-size:.86rem;margin-top:4px">${typeof e[k]=='string'?e[k]:g(e[k])}</p>`:'').join('')}${e.syllabus?`<ul>${e.syllabus.map(s=>`<li>${g(s)}</li>`).join('')}</ul>`:''}</div>`).join('')}</div>`;
return `<div class="in">${hd(V)}<div class="tabs"><button class="chip sub${svt=='services'?' on':''}" data-a="tab" data-v="services">${N('خدمات مهندسی (۱۳ محور)','Engineering Services (13)')}</button><button class="chip sub${svt=='education'?' on':''}" data-a="tab" data-v="education">🎓 ${N('دوره‌های آموزشی و رویدادها','Education & Workshops')}</button></div>${body}</div>`},
team(){const T=t(),M=T.team,card=m=>`<div class="glass gi pad">${m.photo?`<img class="av" alt="" src="${img(m.photo)}">`:`<div class="av">${m.initials}</div>`}<h4>${g(m.name)}</h4><span class="r">${g(m.role)}</span><p>${g(m.bio)}</p></div>`;
return `<div class="in">${hd(M)}<div class="glass pad cert" style="display:grid;grid-template-columns:minmax(220px,1fr) 1.4fr;gap:24px;align-items:center"><img data-a="cert" alt="${M.certificateMehregan}" src="${img('/credentials/mehregan-sarv-tala.jpg')}"><div><h3>🏅 ${M.certificateMehregan}</h3><p class="w">⚠ ${M.certificateDisclaimer}</p></div></div><h3>${M.coreTeam}</h3><div class="tm">${D.teamMembers.filter(m=>!m.isConsultant).map(card).join('')}</div><h3>${M.consultants}</h3><div class="tm">${D.teamMembers.filter(m=>m.isConsultant).map(card).join('')}</div><h3>${N('دفاتر معماری و طراحان همکار در پروژه‌ها','Collaborating Architectural Offices')}</h3><div class="chips">${OFF.map(o=>`<span>${N(o[0],o[1])}</span>`).join('')}</div></div>`},
contact(){const T=t(),C=T.contact,F=C.form,f=(k,ty='text',w='')=>`<label class="${w}">${F[k]}<input type="${ty}" name="${k}" placeholder="${F[k+'Placeholder']||''}"${k=='name'||k=='email'?' required':''}></label>`;
return `<div class="in">${hd(C)}<div class="ct"><div style="display:grid;gap:14px"><div class="glass pad ci"><h4>${C.addressTitle}</h4><span>${C.address}</span><a href="https://www.openstreetmap.org/search?query=${encodeURIComponent(N('مشهد بلوار فرهنگ','Mashhad Farhang Blvd'))}" target="_blank" rel="noopener">${C.mapOpen}</a></div><div class="glass pad ci"><h4>${C.phonesTitle}</h4>${C.phones.map(p=>`<a href="tel:${p.replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d))}">${p}</a>`).join('')}<h4>${C.instagramTitle}</h4><a href="https://instagram.com/isb.group" target="_blank" rel="noopener">${C.instagram}</a></div></div>
<form class="glass pad" id="cf" novalidate><h3 class="w" style="grid-column:1/-1">${F.title}</h3><label class="hp">${F.honeypotLabel}<input name="website" tabindex="-1" autocomplete="off"></label>${f('name')}${f('email','email')}${f('phone','tel')}${f('company')}<label>${F.projectType}<select name="pt">${F.projectTypeOptions.map(o=>`<option>${o}</option>`).join('')}</select></label>${f('location')}<label class="w">${F.message}<textarea name="message" placeholder="${F.messagePlaceholder}"></textarea></label><button class="btn p" type="submit" style="grid-column:1/-1">${F.submit}</button><p id="fm" role="status"></p></form></div></div>`}};
function ring(Wk,W,S){const T=W.reduce((a,b)=>a+b),col=['#4fb4ff','#5f8bff','#7a7dff','#3fd0c9','#5FD6A0','#8be07a','#b4e36a','#DCE4F5'];let a=-Math.PI/2,h='';const P=(r,q)=>[200+r*Math.cos(q),200+r*Math.sin(q)];
Wk.forEach((k,i)=>{const b=a+W[i]/T*2*Math.PI-.035,s=a+.035,[x1,y1]=P(168,s),[x2,y2]=P(168,b),[x3,y3]=P(112,b),[x4,y4]=P(112,s),l=b-s>Math.PI?1:0;h+=`<path data-w="${i}" fill="${col[i]}" fill-opacity=".55" stroke="${col[i]}" stroke-width="1.5" d="M${x1} ${y1}A168 168 0 ${l} 1 ${x2} ${y2}L${x3} ${y3}A112 112 0 ${l} 0 ${x4} ${y4}Z"><title>${S.sarvWeights[k]} ${W[i]}%</title></path>`;a=b+.035});
return h+`<text id="rt" x="200" y="196" text-anchor="middle" fill="#fff" font-size="40" font-weight="900" font-family="Kalameh">${N('سرو سبز','Sarv')}</text><text id="rs" x="200" y="230" text-anchor="middle" fill="#8FA3D6" font-size="18" font-family="Kalameh">${N('هشت حوزه','8 domains')}</text>`}
function proj(slug){const p=D.projects.find(x=>x.slug==slug);if(!p)return;const P=t().projects,c=p.chartData,mx=c?Math.max(...c.items.flatMap(i=>[i.cooling,i.heating,i.total,i.value].filter(v=>v!=null)),1):1;
$('#modal').innerHTML=`<div class="md glass"><button class="x" data-a="x" aria-label="${t().nav.close}">✕</button><h2>${g(p.title)}</h2><p style="color:var(--ice)">${g(p.typology)} · ${g(p.location)} · ${p.year}${p.energyClass?' · '+P.energyClass+' '+p.energyClass:''}</p><p>${g(p.description)}</p><div class="gal">${p.images.map(i=>`<figure><img loading="lazy" alt="${g(i.alt)}" src="${img(i.src)}">${i.caption?g(i.caption):''}</figure>`).join('')}</div><h3>${P.collaborationScope}</h3><ul>${g(p.isbRole).map(r=>`<li>${r}</li>`).join('')}</ul>${p.metrics.length?`<h3>${P.keyMetrics}</h3><div class="mx">${p.metrics.map(m=>`<div><b>${m.value}${m.unit?' '+m.unit:''}</b>${g(m.label)}</div>`).join('')}</div>`:''}${p.strategies.length?`<h3>${P.strategies}</h3><ul>${p.strategies.map(s=>`<li>${g(s)}</li>`).join('')}</ul>`:''}${c?`<h3>${g(c.title)}</h3><div class="br">${c.items.map(i=>`<span>${i.name||i.scenario||''}</span><span>${['cooling','heating','total','value'].filter(k=>i[k]!=null).map(k=>`<i style="width:${i[k]/mx*100}%;margin:2px 0"></i><small>${i[k]}</small>`).join('')}</span>`).join('')}</div>`:''}${p.certification?`<h3>🏅 ${g(p.certification.name)} (${p.certification.date})</h3>${p.certification.image?`<img alt="" src="${img(p.certification.image)}">`:''}<small>${g(p.certification.disclaimer)}</small>`:''}<small style="color:var(--ice)">${P.disclaimerNotice}</small></div>`;document.body.classList.add('mo');if(location.hash!=='#project/'+slug)history.replaceState(null,'','#project/'+slug)}
function cert(){$('#modal').innerHTML=`<div class="md glass"><button class="x" data-a="x">✕</button><img alt="" src="${img('/credentials/mehregan-sarv-tala.jpg')}"></div>`;document.body.classList.add('mo')}
const closeM=()=>{document.body.classList.remove('mo');if(location.hash.startsWith('#project'))history.replaceState(null,'',location.pathname)};
let PK=null,curK=null;
const Q=()=>L=='fa'?0:1,sn=i=>SEC[i][Q()],FN=x=>L=='fa'?fa(x):String(x),tt=it=>Array.isArray(it.t)?it.t[Q()]:typeof it.t=='function'?it.t():g(it.t);
const ITEMS=[],add=(s,k,x,z,w,h,t)=>ITEMS.push({s,k,x,z,w,h,t});
CH.forEach((c,i)=>add(0,'ch:'+i,-27.5+i*11,-34,9.6,9.6,c.n));
[['داستان ما','Our story'],['رویکرد ما','Our approach'],['چشم‌انداز','Vision']].forEach((t,i)=>add(1,'about:'+i,-24+(i-1)*12.5,-4,11,11,t));
D.projects.forEach((p,i)=>add(2,'proj:'+p.slug,24+(i%4-1.5)*9.6,-4+(Math.floor(i/4)-1)*7.4,9,6.6,p.title));add(2,'',24+(3-1.5)*9.6,-4+2*7.4,9,6.6,['به‌زودی','Coming soon']);
['envelope','daylight','ventilation','renewable','water','sarv'].forEach((k,i)=>add(3,'sus:'+k,-24+(i%3-1)*12.8,26+(Math.floor(i/3)-.5)*11.5,12,10.5,()=>t().sustainability.tabs[k]||N('سرو سبز و وزن حوزه‌ها','Sarv Sabz weights')));
D.services.forEach((s,i)=>add(4,'sv:'+s.id,24+(i%5-2)*7.6,26+(Math.floor(i/5)-1)*7.6,7,7,s.title));add(4,'edu',24+(3-2)*7.6,26+7.6,7,7,['آموزش و رویدادها','Education & Events']);add(4,'',24+(4-2)*7.6,26+7.6,7,7,['به‌زودی','Coming soon']);
[['اعتبارنامهٔ سرو طلایی','Sarv Tala certificate'],['تیم اصلی','Core team'],['مشاوران','Consultants'],['دفاتر همکار','Partner offices']].forEach((t,i)=>add(5,'team:'+i,-24+(i-1.5)*9.8,56,9,9,t));
[['تلفن','Phone'],['نشانی','Address'],['اینستاگرام','Instagram'],['فرم تماس','Contact form']].forEach((t,i)=>add(6,i==2?'ig':'contact:'+i,24+(i-1.5)*9.8,56,9,9,t));
const vd=i=>[N('شش ایستگاه از ساختمان سبز تا پسماند؛ روی هر کدام کلیک کنید.','Six stations from green building to waste. Click any one.'),N('ISB در یک نگاه: داستان، رویکرد و چشم‌انداز.','ISB at a glance: story, approach and vision.'),t().projects.subtitle,t().sustainability.subtitle,t().services.subtitle,t().team.subtitle,t().contact.subtitle][i];
const views=()=>SEC.map((s,i)=>`<div class="view" id="v${i}"><div class="vh"><div class="tb">${FN('0'+(i+1))} — ${sn(i)}</div><p>${vd(i)}</p></div>${ITEMS.filter(x=>x.s==i).map((it,j)=>it.k?`<button class="it" data-a="open" data-v="${it.k}" aria-label="${tt(it)}"><em class="fr"><i></i><i></i><i></i><i></i></em><span class="cp"><b>${FN(String(j+1).padStart(2,'0'))}</b>${tt(it)}</span></button>`:`<div class="it soon"><em class="fr"></em><span class="cp">${tt(it)}</span></div>`).join('')}</div>`).join('');
const chPage=k=>{const c=CH[k],q=Q();return `<div class="in"><article class="cd on glass" style="width:min(44rem,100%);margin:auto"><header><span class="num">${FN('0'+(k+1))}</span><div><small class="kick">${c.n[1].toUpperCase()} · ${FN('0'+(k+1))}/${FN('06')}</small><h2>${c.h[q]}</h2></div></header><p class="lede">${c.d[q]}</p><dl class="sp">${c.sp.map(r=>`<div><dt>${r[q]}</dt><dd>${r[q+2]}</dd></div>`).join('')}</dl><div class="mtr"><b data-n="${c.m[0]}" data-d="${c.m[1]}" data-s="${c.m[2]}">0</b><span>${c.m[3][q]}</span></div><div class="chips">${c.c[q].map(x=>`<span>${x}</span>`).join('')}</div><footer><button class="btn" data-a="ch" data-v="${(k+5)%6}">${L=='fa'?'›':'‹'}</button><span>${c.n[q]}</span><button class="btn p" data-a="ch" data-v="${(k+1)%6}">${L=='fa'?'‹':'›'}</button></footer></article></div>`};
function count(root){root.querySelectorAll('[data-n]').forEach(c=>{const n=+c.dataset.n,t0=performance.now();(function f(x){const k=Math.min(1,(x-t0)/1500);c.textContent=(L=='fa'?fa:z=>z)((n*(1-Math.pow(1-k,3))).toFixed(+c.dataset.d||0)).replace('.',L=='fa'?'٫':'.')+(c.dataset.s||'');if(k<1)requestAnimationFrame(f)})(t0)})}
function chrome(){const T=t(),all=[N('صفحه اصلی','Home')].concat(SEC.map((s,i)=>sn(i)));
$('#dep').textContent=T.brand.department;$('#lb').textContent=L=='fa'?'EN':'فا';
$('#nv').innerHTML=all.map((x,i)=>`<button data-a="sec" data-v="${i}">${x}</button>`).join('');$('#drawer').innerHTML=all.map((x,i)=>`<button data-a="sec" data-v="${i}">${x}</button>`).join('');
$('#idx').innerHTML=SEC.map((s,i)=>`<button data-a="sec" data-v="${i+1}"><b>${FN('0'+(i+1))}</b>${sn(i)}</button>`).join('');
$('#hv').innerHTML=`<div class="hh"><small class="kick">ISB GROUP · MASHHAD</small><h1>${T.brand.name}</h1><h2 class="gd">${T.hero.headline}</h2><p class="lead">${T.hero.subheadline}</p><div class="btns" style="justify-content:flex-start"><button class="btn p" data-a="sec" data-v="1">${N('ورود به شهرک پایدار','Enter the sustainable district')}</button></div><small class="fd">${T.hero.founded}</small></div>`;
$('#views').innerHTML=views();ITEMS.forEach(it=>it.el=null);SEC.forEach((s,i)=>{const els=[...$('#v'+i).querySelectorAll('.it')];ITEMS.filter(x=>x.s==i).forEach((it,j)=>it.el=els[j])});
$('#lbs').innerHTML=SEC.map((s,i)=>`<button class="lb2${i%2?' p':''}" data-a="sec" data-v="${i+1}">${sn(i)}</button>`).join('');$('#ll').innerHTML=SEC.map(()=>'<path/><circle r="4"/>').join('');
$('#bk').textContent=N('بازگشت','Back');$('#tag').textContent=N('ساختن امروز، زیستن فردا','Build today, live tomorrow');$('#scr').firstChild.textContent=N('اسکرول کنید','Scroll');if(window.__rst)window.__rst()}
function secTo(i){document.body.classList.remove('mn');if(PK)closeP();if(!i)return scrollTo({top:0,behavior:'smooth'});const r=document.querySelectorAll('#track>.sc')[i-1].getBoundingClientRect();scrollTo({top:r.top+scrollY+r.height/2-innerHeight/2,behavior:'smooth'})}
const rs=id=>{if(PK==id)$('#pgc').innerHTML=H[id]()};
function showK(k){const [a,b]=k.split(':');let pk,html,cr=null;
if(a=='ch'){pk='ch';html=chPage(+b);cr=CH[+b].n[Q()]}else if(a=='about'){pk='about';html=H.about();cr=sn(1)}else if(a=='sus'){pk='sustainability';if(b!='sarv')strat=b;html=H.sustainability();cr=sn(3)}else if(a=='sv'){sid=+b;svt='services';pk='services';html=H.services();cr=sn(4)}else if(a=='edu'){svt='education';pk='services';html=H.services();cr=sn(4)}else if(a=='team'){pk='team';html=H.team();cr=sn(5)}else if(a=='contact'){pk='contact';html=H.contact();cr=sn(6)}else return;
PK=pk;curK=k;$('#pgc').innerHTML=html;$('#pcr').textContent=cr;document.body.classList.add('pgo');$('#pgv').scrollTop=0;if(pk=='ch')count($('#pgc'))}
function openK(k){const [a,b]=k.split(':');if(a=='proj')return proj(b);if(a=='ig')return window.open('https://instagram.com/isb.group','_blank','noopener');if(location.hash!=='#/'+k)history.pushState(null,'','#/'+k);showK(k)}
function closeP(){PK=null;curK=null;document.body.classList.remove('pgo');if(location.hash.startsWith('#/'))history.replaceState(null,'',location.pathname+location.search)}
document.addEventListener('click',e=>{if(e.target.id=='modal')return closeM();const a=e.target.closest('[data-a]');if(!a)return;const k=a.dataset.a,v=a.dataset.v;
({sec:()=>secTo(+v),open:()=>openK(v),ch:()=>openK('ch:'+v),back:closeP,cat:()=>{cat=v;rs('projects')},st:()=>{strat=v;rs('sustainability')},sv:()=>{sid=+v;rs('services')},tab:()=>{svt=v;rs('services')},proj:()=>proj(v),x:closeM,lang:setL,cert,menu:()=>document.body.classList.toggle('mn')})[k]?.()});
document.addEventListener('keydown',e=>{if(e.key=='Escape'){closeM();if(PK)closeP();document.body.classList.remove('mn')}});
addEventListener('popstate',()=>{const h=location.hash;if(h.startsWith('#/'))showK(h.slice(2));else{PK=null;curK=null;document.body.classList.remove('pgo');closeM()}});
addEventListener('scroll',()=>$('#hd').classList.toggle('sc',scrollY>40),{passive:true});
chrome();if(location.hash.startsWith('#/'))showK(location.hash.slice(2));else if(location.hash.startsWith('#project/'))proj(location.hash.slice(9));

/* ---------- HUD پیمایش (نوار پیشرفت بالا + کادر موقعیت) ---------- */
(()=>{
const labels=window.ISB_HUD_LABELS;
 const root=document.getElementById('isb-progress');
 root.innerHTML=labels.map(()=>'<span><i></i></span>').join('');
 const bars=[...root.children].map(x=>x.firstElementChild);
 const $=id=>document.getElementById(id);
 const sections=[...document.querySelectorAll('#track>.sc')];
 const maxScroll=()=>Math.max(1,document.documentElement.scrollHeight-innerHeight);
 let active=-1,raf=0;
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function update(){
   raf=0;
   const y=window.scrollY,ratio=clamp(y/maxScroll(),0,1);
   // Use chapter anchors, matching the 3D camera's seven scroll stops.
   const anchors=[0,...sections.map(el=>{
     const r=el.getBoundingClientRect();
     return clamp(r.top+y+r.height/2-innerHeight/2,0,maxScroll());
   })];
   let idx=0,t=0;
   for(let i=1;i<anchors.length;i++){
     if(y<=anchors[i]){idx=i-1;t=clamp((y-anchors[i-1])/Math.max(1,anchors[i]-anchors[i-1]),0,1);break;}
     if(i===anchors.length-1){idx=6;t=1;}
   }
   if(y<anchors[1]){idx=0;t=clamp(y/Math.max(1,anchors[1]),0,1);}
   const n=clamp(idx,0,6);
   if(n!==active){
     active=n;
     $('isb-hud-title').textContent=labels[n][0];
     $('isb-hud-sub').textContent=labels[n][1];
     $('isb-hud-index').textContent=String(n+1).padStart(2,'0')+' / 07';
   }
   bars.forEach((bar,i)=>bar.style.width=(i<n?100:i===n?t*100:0)+'%');
   $('isb-hud-meter').style.width=((n+t)/7*100)+'%';
   $('isb-hud-coord').textContent='ZONE '+String(n+1).padStart(2,'0')+' · '+Math.round(t*100)+'%';
   $('isb-hud-state').textContent=y<40?'OVERVIEW':'LIVE NAVIGATION';
   const needle=$('isb-needle');
   $('isb-hud').style.opacity=window.matchMedia('(max-width:640px)').matches?1:(y<40?.86:1);
 }
 addEventListener('scroll',()=>{if(!raf)raf=requestAnimationFrame(update)},{passive:true});
 addEventListener('resize',()=>{if(!raf)raf=requestAnimationFrame(update)},{passive:true});
 update();
})();
