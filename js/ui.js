/* رابط کاربری: ساخت هدر و منوها، صفحه‌های داخلی (درباره، پروژه‌ها، پایداری، خدمات، تیم، تماس)، مودال پروژه، رویدادهای کلیک و آدرس (#/...)، و HUD پیمایش (نوار پیشرفت و کادر پایین‌چپ). */
let pst='all',stg='all',dept='all',cat='all',strat='envelope',sid=1,svt='services';
const MK="";
const bd=s=>`<div class="bdg"><span>${s.sectionNum}</span><span>/</span><span>${s.title}</span></div>`;
const hd=s=>`<div class="hd">${bd(s)}<h2>${s.headline}</h2><p>${s.subtitle||''}</p></div>`;
const MS=`<svg viewBox="0 0 100 135" fill="none" stroke="#fff" stroke-width="7" stroke-linejoin="round"><path d="${MK}"/><path d="M50 32L50 92"/></svg>`;
const H={
hero(){const T=t();return `<div class="pill sub">✦ ${T.brand.taglineEn}</div><div class="hc"><div class="tile glass">${MS}</div><h1>${T.hero.headline}</h1><p class="lead">${T.hero.subheadline}</p><div class="btns"><button class="btn p" data-a="go" data-v="about">${T.hero.ctaExplore}</button><button class="btn" data-a="go" data-v="projects">${T.hero.ctaProjects}</button></div></div><div class="ft"><span>${T.hero.founded}</span><button data-a="go" data-v="about">${T.hero.scrollHint}<br>⌄</button></div>`},
about(){const T=t(),A=T.about;return `<div class="in">${hd({...A,subtitle:''})}<div class="g12"><div style="display:grid;gap:18px"><p class="glass pad lead2">${A.lead}</p><p>${A.p1}</p><p>${A.p2}</p><p>${A.p3}</p><div class="vis"><b>◈ ${A.visionTitle}</b><p style="color:#fff;margin-top:6px">${A.visionText}</p></div></div>
<div style="display:grid;gap:16px"><div class="st"><div class="glass"><b>${N('۲۰+','20+')}</b><span>${N('سال پشتوانه تجربی','Years Experience')}</span></div><div class="glass"><b>${N('۱۲+','12+')}</b><span>${N('پروژه شاخص مطالعاتی','Landmark Studies')}</span></div><div class="glass"><b>${N('۱۳۹۹','2020')}</b><span>${N('سال تأسیس در مشهد','Established in Mashhad')}</span></div><div class="glass"><b>EC++</b><span>${N('بالاترین رتبه مبحث ۱۹','Peak Part 19 Class')}</span></div></div>
<div class="glass pad ci"><span>⌖ ${T.contact.address}</span><span>✆ <a href="tel:09339039563">${T.contact.phones[0]}</a> / <a href="tel:09151213005">${T.contact.phones[1]}</a></span><a href="https://instagram.com/isb.group" target="_blank" rel="noopener">◎ ${T.contact.instagram}</a></div></div></div>${clipsHTML()}</div>`},
projects(){const T=t(),P=T.projects,cs=['all','residential','industrial','public','landscape','research'],ss=['all','completed','ongoing','competition'],
 ps=D.projects.filter(p=>(cat=='all'||p.categories.includes(cat))&&(pst=='all'||p.status==pst)),
 stl=s=>s=='completed'?P.completed:s=='competition'?P.competition:P.ongoing,
 card=(p,i)=>{const m=p.metrics[0];return `<article class="pcard${i==0&&cat=='all'&&pst=='all'?' f':''}" data-a="proj" data-v="${p.slug}" tabindex="0" role="button" aria-label="${g(p.title)}" style="--i:${i}"><div class="pc-im" style="background-image:url(${img(p.coverImage)})"><span class="pc-st ${p.status}">${stl(p.status)}</span>${p.energyClass?`<span class="pc-ec">⛨ ${p.energyClass}</span>`:''}</div><div class="pc-b"><span class="pc-meta">${g(p.location)} · ${fa(p.year)}</span><h3>${g(p.title)}</h3><span class="pc-ty">${g(p.typology)}</span><p>${g(p.description)}</p><div class="pc-f">${m?`<span><b>${m.value}${m.unit?' '+m.unit:''}</b> ${g(m.label)}</span>`:'<span></span>'}<span class="pc-go">${P.viewProject} ←</span></div></div></article>`};
return `<div class="in pj2">${hd(P)}<div class="pf"><div class="tabs" role="tablist">${cs.map(c=>`<button class="chip sub${c==cat?' on':''}" data-a="cat" data-v="${c}" role="tab">${P[c]}</button>`).join('')}</div><div class="tabs">${ss.map(c=>`<button class="chip sub${c==pst?' on':''}" data-a="pstat" data-v="${c}">${c=='all'?P.allStatus:stl(c)}</button>`).join('')}</div><p class="muted">${fa(ps.length)} ${P.count}</p></div><div class="pgrid">${ps.map(card).join('')||`<p class="muted">—</p>`}</div></div>`},
sustainability(){const T=t(),S=T.sustainability,ids=['envelope','daylight','ventilation','renewable','water'],ix=ids.indexOf(strat),SV=window.SARV||{categories:[],strategies:[],levels:[]},cats=SV.categories,
 st=(SV.strategies||[]).find(x=>x.id==strat)||{services:[]},tg=LAB.toggles[strat],Lc={green:'#5FA37A',gold:'#EAB308',silver:'#8FA3D6',turquoise:'#3fd0c9'};
if(!sarvV||sarvV.length!=cats.length)sarvV=cats.map(()=>50);setTimeout(sarvUpdate,0);
return `<div class="in lab">${hd(S)}
<section class="lab-s"><header><h3>${S.labTitle}</h3><p>${S.labLead}</p></header>
<div class="lab-tabs" role="tablist">${ids.map(i=>`<button class="lt${i==strat?' on':''}" data-a="st" data-v="${i}" role="tab" aria-selected="${i==strat}"><span>${S.tabs[i]}</span></button>`).join('')}</div>
<div class="lab-p glass"><div class="lab-d"><div id="labSvg">${LAB.svg(strat,labSt)}</div><div class="lab-sw" role="group">${tg.map((x,i)=>`<button class="${i==labSt?'on':''}" data-a="labt" data-v="${i}">${N(x[0],x[1])}</button>`).join('')}</div><small class="muted">${S.schem}</small></div>
<div class="lab-i"><h3>${S.tabs[strat]}</h3><p>${S[strat+'Desc']}</p><h4>${S.keyFigures}</h4><div class="lab-fig">${HL[ix].map(h=>`<div><b>${h[2]}</b><span>${N(h[0],h[1])}</span></div>`).join('')}</div>${st.services.length?`<h4>${S.relatedServices}</h4><div class="chips">${st.services.map(id=>{const v=D.services.find(x=>x.id==id);return v?`<button class="chip sub" data-a="svopen" data-v="${id}">${g(v.title)}</button>`:''}).join('')}</div>`:''}</div></div></section>
<section class="sarv"><header><h3>✦ ${S.sarvTitle}</h3><p>${S.sarvDesc}</p></header>
<div class="sarv-w"><div class="tower" id="tower" aria-hidden="true">${cats.map((c,i)=>`<div class="tw" style="flex:${c.weight} 1 0"><i class="tw-f"></i><span class="tw-l"><b>${g(c.name)}</b><small>${fa(c.weight)}</small></span></div>`).join('')}</div>
<div class="est glass"><h3>${S.estTitle}</h3><p class="muted">${S.estLead}</p>${cats.map((c,i)=>`<label class="sv-row"><span>${g(c.name)} <small>${S.weightLbl} ${fa(c.weight)}</small></span><input type="range" class="sv-r" min="0" max="100" step="5" value="${sarvV[i]}" data-i="${i}" aria-label="${g(c.name)}"><output></output></label>`).join('')}
<div class="est-res"><div><small>${S.score}</small><b id="estScore">0</b></div><div id="estLvl" class="est-l"></div></div><p class="muted">${S.estNote}</p>
<div class="lv">${Object.keys(Lc).map(k=>`<div><i style="background:${Lc[k]}"></i>${S.sarvLevels[k]}</div>`).join('')}</div><p class="note">${S.sarvVsPart19}</p><button class="btn p" data-a="consult">${S.estCta}</button></div></div></section></div>`},
services(){const T=t(),V=T.services,SV=D.services,GR=D.serviceGroups||[],ST=D.serviceStages||[],on=s=>stg=='all'||(s.stages||[]).includes(stg),hit=SV.filter(on).length,pi=ST.findIndex(x=>x.id==stg),
 ic=s=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${SVI[s.icon]||SVI.Leaf}</svg>`,
 card=(s,i)=>`<button class="svc${stg!='all'?(on(s)?' hit':' dim'):''}" data-a="svopen" data-v="${s.id}" style="--i:${i}"><span class="svc-top"><span class="svc-ic">${ic(s)}</span><span class="svc-n">${fa(String(s.id).padStart(2,'0'))}</span></span><b>${g(s.title)}</b><span class="svc-d">${g(s.description)}</span><span class="svc-st" aria-hidden="true">${ST.map(x=>`<i class="${(s.stages||[]).includes(x.id)?'y':''}" title="${g(x.name)}"></i>`).join('')}</span></button>`,
 body=svt=='services'?`<div class="srail-w"><h3>${V.finderTitle}</h3><p class="muted">${V.finderHint}</p><div class="srail" style="--p:${pi<0?0:ST.length>1?pi/(ST.length-1)*100:0}" role="tablist">${ST.map((x,i)=>`<button class="srn${x.id==stg?' on':''}" data-a="stg" data-v="${x.id}" role="tab" aria-selected="${x.id==stg}"><i>${fa(i+1)}</i><span><b>${g(x.name)}</b><small>${g(x.hint)}</small></span></button>`).join('')}</div><p class="srail-msg">${stg=='all'?`<span>${fa(SV.length)} ${V.relevant}</span>`:`<span><b>${fa(hit)}</b> ${V.of} ${fa(SV.length)} ${V.relevant}</span> <button class="chip sub" data-a="stg" data-v="all">✕ ${V.all}</button>`}</p></div>`+GR.map(gr=>{const L=SV.filter(s=>s.group==gr.id);if(!L.length)return'';const k=L.filter(on).length;return `<section class="sg"><header><h3>${g(gr.name)}</h3><p>${g(gr.description)}</p>${stg!='all'?`<small class="sg-n">${fa(k)} ${V.of} ${fa(L.length)}</small>`:''}</header><div class="sgrid">${L.map(card).join('')}</div></section>`}).join('')+`<div class="cta glass"><div><h3>${V.ctaTitle}</h3><p>${V.ctaText}</p></div><button class="btn p" data-a="consult">${V.ctaButton}</button></div>`
 :`<div class="ed">${D.educationalPrograms.map((e,i)=>{const im=IM['/education/'+(/expo/i.test(e.id)?'expolab404':'designbuilder-course')+'.jpg'];return `<article class="cc glass" style="--i:${i}">${im?`<img alt="" loading="lazy" src="${im}">`:''}<div class="cc-b"><h4>${g(e.title)}</h4><div class="chips">${e.hours?`<span>⏱ ${e.hours}</span>`:''}${e.audience?`<span>${g(e.audience)}</span>`:''}</div>${e.description?`<p>${typeof e.description=='string'?e.description:g(e.description)}</p>`:''}${e.instructors?`<p class="r">${g(e.instructors)}</p>`:''}${e.syllabus?`<details><summary>${V.syllabus}</summary><ul>${e.syllabus.map(x=>`<li>${g(x)}</li>`).join('')}</ul></details>`:''}</div></article>`}).join('')}</div>`;
return `<div class="in sv2">${hd(V)}<div class="tabs"><button class="chip sub${svt=='services'?' on':''}" data-a="tab" data-v="services">${V.tabServices} <small>${fa(SV.length)}</small></button><button class="chip sub${svt=='education'?' on':''}" data-a="tab" data-v="education">🎓 ${V.tabEducation}</button></div>${body}</div>`},
team(){const T=t(),M=T.team,C=window.CRED||{certificates:[],testimonials:[]},ms=D.teamMembers,deps=D.departments||[],
 por=(m,c)=>m.photo?`<span class="tpw"><img class="${c}" alt="" loading="lazy" src="${img(m.photo)}" onload="if(this.naturalWidth<480)this.parentNode.classList.add('lowres')"></span>`:`<div class="${c} tp-ph" aria-hidden="true">${m.initials||g(m.name).trim().charAt(0)}</div>`,
 lead=ms.filter(m=>m.level=='leader'),rest=ms.filter(m=>m.level!='leader'),shown=dept=='all'?rest:rest.filter(m=>m.department==dept),
 cnt=id=>ms.filter(m=>m.department==id).length,
 card=(m,i)=>`<button class="tcard" data-a="member" data-v="${m.id}" style="--i:${i}">${por(m,'tp-img')}<span class="tc-b"><b>${g(m.name)}</b><span class="r">${g(m.role)}</span></span></button>`,
 lcard=(m,i)=>`<button class="tcard lead" data-a="member" data-v="${m.id}" style="--i:${i}">${por(m,'tp-img')}<span class="tc-b"><small>${M.leadership}</small><b>${g(m.name)}</b><span class="r">${g(m.role)}</span><span class="tc-t">${g(m.title)}</span><span class="tc-go">${M.profile} ←</span></span></button>`,
 certs=C.certificates||[],tes=(C.testimonials||[]).filter(x=>x.approved!==false),
 stat=(n,l)=>n>0?`<div class="tr-stat"><b>${fa(n)}</b><span>${l}</span></div>`:'',
 stars=n=>`<span class="stars" aria-label="${fa(n)}/${fa(5)}">${'★'.repeat(Math.round(n))}<i>${'★'.repeat(5-Math.round(n))}</i></span>`,
 avg=tes.length?tes.reduce((q,x)=>q+(+x.rating||0),0)/tes.length:0;
return `<div class="in tr">${hd(M)}
<div class="tr-stats">${stat(ms.length,M.statPeople)}${stat(certs.length,M.statCerts)}${stat(D.projects.length,M.statProjects)}${stat(OFF.length,M.statOffices)}</div>
${lead.length?`<div class="tr-lead">${lead.map(lcard).join('')}</div>`:''}
<div><div class="tr-filter" role="tablist">${[['all',M.allDepartments,ms.length]].concat(deps.filter(d=>cnt(d.id)).map(d=>[d.id,g(d.name),cnt(d.id)])).map(d=>`<button class="chip sub${d[0]==dept?' on':''}" data-a="dept" data-v="${d[0]}" role="tab">${d[1]} <small>${fa(d[2])}</small></button>`).join('')}</div>
<div class="tr-grid">${shown.length?shown.map(card).join(''):`<p class="muted">${M.emptyDept}</p>`}</div></div>
${certs.length?`<section class="tr-sec"><h3>${M.credentialsTitle}</h3><div class="cg">${certs.map((c,i)=>`<article class="cc glass" style="--i:${i}"><button class="cc-img" data-a="cert" data-v="${c.id}" aria-label="${M.viewFullCert}"><img alt="${g(c.title)}" loading="lazy" src="${img(c.image)}"></button><div class="cc-b"><h4>${g(c.title)}</h4><span class="r">${M.issuer}: ${g(c.issuer)} · ${g(c.date)}</span>${c.note&&g(c.note)?`<p class="w">⚠ ${g(c.note)}</p>`:''}</div></article>`).join('')}</div></section>`:''}
${tes.length?`<section class="tr-sec"><h3>${M.testimonialsTitle}</h3><p class="tr-avg">${stars(avg)} <b>${fa(avg.toFixed(1))}</b> <span class="muted">${M.ratingAvg} · ${fa(tes.length)}</span></p><div class="cg">${tes.map((x,i)=>`<figure class="cc glass tq" style="--i:${i}">${stars(+x.rating||0)}<blockquote>${g(x.text)}</blockquote><figcaption><b>${g(x.name)}</b><span class="r">${g(x.role)}</span></figcaption></figure>`).join('')}</div></section>`:''}
<section class="tr-sec"><h3>${N('دفاتر معماری و طراحان همکار در پروژه‌ها','Collaborating Architectural Offices')}</h3><div class="chips">${OFF.map(o=>`<span>${N(o[0],o[1])}</span>`).join('')}</div></section></div>`},
contact(){const T=t(),C=T.contact,F=C.form,K=window.CONTACT||{accounts:[],posts:[],phones:[],people:[]},f=(k,ty='text',w='')=>`<label class="${w}">${F[k]}<input type="${ty}" name="${k}" placeholder="${F[k+'Placeholder']||''}"${k=='name'||k=='email'?' required':''}></label>`,
 en=n=>String(n).replace(/[۰-۹]/g,d=>'۰۱۲۳۴۵۶۷۸۹'.indexOf(d)),wa=n=>'https://wa.me/98'+en(n).replace(/^0/,''),
 ig=K.accounts.find(x=>x.platform=='instagram'&&x.active!==false),ph=K.phones||[],waP=ph.find(x=>x.whatsapp),
 IC={ig:'<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1"/>',wa:'<path d="M20 12a8 8 0 1 1-3.4-6.5L20 4l-1 3.6A8 8 0 0 1 20 12z"/><path d="M9 9c0 3 3 6 6 6l1.2-1.4-2-1-1 .8c-1-.4-2-1.4-2.4-2.4l.8-1-1-2z"/>',ph:'<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z"/>'},
 ic=k=>`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[k]}</svg>`,
 chan=(k,href,title,hint,val,ext)=>`<a class="chn" href="${href}"${ext?' target="_blank" rel="noopener"':''}><span class="chn-i">${ic(k)}</span><span><b>${title}</b><small>${hint}</small><em dir="ltr">${val}</em></span></a>`,
 acc=a=>{const ps=K.posts.filter(p=>p.account==a.id).slice(0,6);return `<article class="acc glass"><header><span class="chn-i">${ic('ig')}</span><div><b dir="ltr">@${a.handle}</b><small>${g(a.role)}</small></div><a class="btn" href="${a.url}" target="_blank" rel="noopener">${C.openPage} ↗</a></header>${ps.length?`<div class="acc-g">${ps.map(p=>`<a class="acc-p" href="${p.url||a.url}" target="_blank" rel="noopener"><span style="background-image:url(${img(p.image)})" role="img" aria-label="${g(p.caption)}"></span><small>${g(p.caption)}</small></a>`).join('')}</div>`:`<p class="muted">${C.noPosts}</p>`}</article>`};
return `<div class="in ctp">${hd(C)}
<section class="ctp-s"><h3>${C.channels}</h3><div class="chn-g">${ig?chan('ig',ig.url,N('اینستاگرام','Instagram'),C.instaHint,'@'+ig.handle,1):''}${waP?chan('wa',wa(waP.number),C.whatsapp,C.whatsappHint,N(waP.number,en(waP.number)),1):''}${ph[0]?chan('ph','tel:'+en(ph[0].number),C.call,C.callHint,en(ph[0].number)):''}</div>
${ph.length>1?`<div class="ph-l">${ph.map(p=>`<a href="tel:${en(p.number)}"><b dir="ltr">${en(p.number)}</b><small>${g(p.label)}</small></a>`).join('')}</div>`:''}</section>
${(K.people||[]).length?`<section class="ctp-s"><h3>${C.people}</h3><div class="ppl">${K.people.map(x=>`<div class="ppl-c glass"><div><b>${g(x.name)}</b><small>${g(x.role)}</small></div><div class="ppl-a"><a class="btn" href="tel:${en(x.phone)}">${C.call}</a>${x.whatsapp?`<a class="btn" href="${wa(x.phone)}" target="_blank" rel="noopener">${C.whatsapp}</a>`:''}</div></div>`).join('')}</div></section>`:''}
${K.accounts.filter(a=>a.active!==false).length?`<section class="ctp-s"><h3>${C.pages}</h3><p class="muted">${C.pagesLead}</p><div class="acc-w">${K.accounts.filter(a=>a.active!==false).map(acc).join('')}</div></section>`:''}
<section class="ctp-s ct"><div style="display:grid;gap:14px"><div class="glass pad ci"><h4>${C.addressTitle}</h4><span>${C.address}</span><a href="https://www.openstreetmap.org/search?query=${encodeURIComponent(N('مشهد بلوار فرهنگ','Mashhad Farhang Blvd'))}" target="_blank" rel="noopener">${C.mapOpen}</a></div></div>
<form class="glass pad" id="cf" novalidate><h3 class="w" style="grid-column:1/-1">${F.title}</h3><label class="hp">${F.honeypotLabel}<input name="website" tabindex="-1" autocomplete="off"></label>${f('name')}${f('email','email')}${f('phone','tel')}${f('company')}<label>${F.projectType}<select name="pt">${F.projectTypeOptions.map(o=>`<option>${o}</option>`).join('')}</select></label>${f('location')}<label class="w">${F.message}<textarea name="message" placeholder="${F.messagePlaceholder}"></textarea></label><button class="btn p" type="submit" style="grid-column:1/-1">${F.submit}</button><p id="fm" role="status"></p></form></section></div>`}};
function ring(Wk,W,S){const T=W.reduce((a,b)=>a+b),col=['#4fb4ff','#5f8bff','#7a7dff','#3fd0c9','#5FD6A0','#8be07a','#b4e36a','#DCE4F5'];let a=-Math.PI/2,h='';const P=(r,q)=>[200+r*Math.cos(q),200+r*Math.sin(q)];
Wk.forEach((k,i)=>{const b=a+W[i]/T*2*Math.PI-.035,s=a+.035,[x1,y1]=P(168,s),[x2,y2]=P(168,b),[x3,y3]=P(112,b),[x4,y4]=P(112,s),l=b-s>Math.PI?1:0;h+=`<path data-w="${i}" fill="${col[i]}" fill-opacity=".55" stroke="${col[i]}" stroke-width="1.5" d="M${x1} ${y1}A168 168 0 ${l} 1 ${x2} ${y2}L${x3} ${y3}A112 112 0 ${l} 0 ${x4} ${y4}Z"><title>${S.sarvWeights[k]} ${W[i]}%</title></path>`;a=b+.035});
return h+`<text id="rt" x="200" y="196" text-anchor="middle" fill="#fff" font-size="40" font-weight="900" font-family="Kalameh">${N('سرو سبز','Sarv')}</text><text id="rs" x="200" y="230" text-anchor="middle" fill="#8FA3D6" font-size="18" font-family="Kalameh">${N('هشت حوزه','8 domains')}</text>`}
function proj(slug){const p=D.projects.find(x=>x.slug==slug);if(!p)return;const P=t().projects,c=p.chartData,I=D.projects.findIndex(x=>x.slug==slug),pv=D.projects[(I+D.projects.length-1)%D.projects.length],nx=D.projects[(I+1)%D.projects.length],
 mx=c?Math.max(...c.items.flatMap(i=>[i.cooling,i.heating,i.total,i.value].filter(v=>v!=null)),1):1,
 stl=s=>s=='completed'?P.completed:s=='competition'?P.competition:P.ongoing,
 fact=(l,v)=>v?`<div><small>${l}</small><b>${v}</b></div>`:'',
 cs=p.certification;
$('#modal').innerHTML=`<div class="md pd glass" role="dialog" aria-modal="true" aria-label="${g(p.title)}"><button class="x" data-a="x" aria-label="${P.close}">✕</button>
<header class="pd-h" style="background-image:linear-gradient(180deg,rgba(5,12,38,.25),rgba(5,12,38,.92)),url(${img(p.coverImage)})"><div class="pd-chips"><span class="pc-st ${p.status}">${stl(p.status)}</span>${p.energyClass?`<span class="pc-ec">⛨ ${p.energyClass}</span>`:''}${cs?`<span class="pc-ec gold">🏅 ${g(cs.name)}</span>`:''}</div><h2>${g(p.title)}</h2><p>${g(p.typology)}</p></header>
<div class="pd-facts">${fact(P.location,g(p.location))}${fact(P.year,fa(p.year))}${fact(P.architectLabel,p.architect?g(p.architect):'')}${fact(P.status,stl(p.status))}</div>
<section class="pd-s"><p class="pd-lead">${g(p.description)}</p></section>
${g(p.isbRole).length?`<section class="pd-s"><h3>${P.collaborationScope}</h3><ul class="pd-role">${g(p.isbRole).map(r=>`<li>${r}</li>`).join('')}</ul></section>`:''}
${p.metrics.length?`<section class="pd-s"><h3>${P.keyMetrics}</h3><div class="pd-mx">${p.metrics.map(m=>`<div><b>${m.value}${m.unit?'<small> '+m.unit+'</small>':''}</b><span>${g(m.label)}</span></div>`).join('')}</div></section>`:''}
${p.strategies.length?`<section class="pd-s"><h3>${P.strategies}</h3><div class="chips">${p.strategies.map(s=>`<span>${g(s)}</span>`).join('')}</div></section>`:''}
${c?`<section class="pd-s"><h3>${g(c.title)}</h3><div class="pd-br">${c.items.map(i=>`<div class="pd-row"><span>${i.name||i.scenario||''}</span><div>${['cooling','heating','total','value'].filter(k=>i[k]!=null).map(k=>`<div class="pd-bar"><i style="width:${Math.max(2,i[k]/mx*100)}%"></i><small>${i[k]}</small></div>`).join('')}</div></div>`).join('')}</div></section>`:''}
${p.images&&p.images.length?`<section class="pd-s"><h3>${P.gallery}</h3><div class="pd-gal">${p.images.map(i=>`<figure><img loading="lazy" alt="${g(i.alt)}" src="${img(i.src)}">${i.caption&&g(i.caption)?`<figcaption>${g(i.caption)}</figcaption>`:''}</figure>`).join('')}</div></section>`:''}
${cs?`<section class="pd-s pd-cert"><h3>${P.certBlock}</h3><div class="pd-cb">${cs.image?`<button class="pd-ci" data-a="cert" data-v="sarv-tala-mehregan" aria-label="${P.viewCert}"><img alt="" loading="lazy" src="${img(cs.image)}"></button>`:''}<div><b>${g(cs.name)}</b><span class="muted">${cs.date}</span><p class="w">⚠ ${g(cs.disclaimer)}</p><small class="muted">${P.disclaimerNotice}</small></div></div></section>`:''}
<nav class="pd-nav"><button data-a="proj" data-v="${pv.slug}">→ ${P.prevProject}<b>${g(pv.title)}</b></button><button data-a="proj" data-v="${nx.slug}">${P.nextProject} ←<b>${g(nx.title)}</b></button></nav></div>`;
document.body.classList.add('mo');const md=$('#modal .md');if(md)md.scrollTop=0;if(location.hash!=='#project/'+slug)history.replaceState(null,'','#project/'+slug)}

function cert(v){const c=((window.CRED||{}).certificates||[]).find(x=>x.id==v),src=c?c.image:'/credentials/mehregan-sarv-tala.jpg';$('#modal').innerHTML=`<div class="md glass"><button class="x" data-a="x">✕</button><img alt="${c?g(c.title):''}" src="${img(src)}"></div>`;document.body.classList.add('mo')}
const closeM=()=>{document.body.classList.remove('mo');if(location.hash.startsWith('#project'))history.replaceState(null,'',location.pathname)};
let PK=null,curK=null;
const Q=()=>L=='fa'?0:1,sn=i=>SEC[i][Q()],FN=x=>L=='fa'?fa(x):String(x),tt=it=>Array.isArray(it.t)?it.t[Q()]:typeof it.t=='function'?it.t():g(it.t);
const ITEMS=[],add=(s,k,x,z,w,h,t)=>ITEMS.push({s,k,x,z,w,h,t});
CH.forEach((c,i)=>add(0,'ch:'+i,-27.5+i*11,-34,9.6,9.6,c.n));
[['داستان ما','Our story'],['رویکرد ما','Our approach'],['چشم‌انداز','Vision']].forEach((t,i)=>add(1,'about:'+i,-24+(i-1)*12.5,-4,11,11,t));
/* فاصلهٔ ستون‌ها و ردیف‌های پروژه (واحد دنیای سه‌بعدی). با بزرگ‌تر کردن این دو عدد، تیترها از هم دورتر می‌شوند. */
const PGX=10.8,PGZ=8.8;
D.projects.forEach((p,i)=>add(2,'proj:'+p.slug,24+(i%4-1.5)*PGX,-4+(Math.floor(i/4)-1)*PGZ,9,6.6,p.title));add(2,'',24+(3-1.5)*PGX,-4+2*PGZ,9,6.6,['به‌زودی','Coming soon']);
['envelope','daylight','ventilation','renewable','water','sarv'].forEach((k,i)=>add(3,'sus:'+k,-24+(i%3-1)*12.8,26+(Math.floor(i/3)-.5)*11.5,12,10.5,()=>t().sustainability.tabs[k]||N('سرو سبز و وزن حوزه‌ها','Sarv Sabz weights')));
D.services.forEach((s,i)=>add(4,'sv:'+s.id,24+(i%5-2)*7.6,26+(Math.floor(i/5)-1)*7.6,7,7,s.title));add(4,'edu',24+(3-2)*7.6,26+7.6,7,7,['آموزش و رویدادها','Education & Events']);add(4,'',24+(4-2)*7.6,26+7.6,7,7,['به‌زودی','Coming soon']);
[['اعتبارنامهٔ سرو طلایی','Sarv Tala certificate'],['تیم اصلی','Core team'],['مشاوران','Consultants'],['دفاتر همکار','Partner offices']].forEach((t,i)=>add(5,'team:'+i,-24+(i-1.5)*9.8,56,9,9,t));
[['تلفن','Phone'],['نشانی','Address'],['اینستاگرام','Instagram'],['فرم تماس','Contact form']].forEach((t,i)=>add(6,i==2?'ig':'contact:'+i,24+(i-1.5)*9.8,56,9,9,t));
const vd=i=>[N('شش ایستگاه از ساختمان سبز تا پسماند؛ روی هر کدام کلیک کنید.','Six stations from green building to waste. Click any one.'),N('ISB در یک نگاه: داستان، رویکرد و چشم‌انداز.','ISB at a glance: story, approach and vision.'),t().projects.subtitle,t().sustainability.subtitle,t().services.subtitle,t().team.subtitle,t().contact.subtitle][i];
const views=()=>SEC.map((s,i)=>`<div class="view" id="v${i}"><div class="vh"><div class="tb">${FN('0'+(i+1))} — ${sn(i)}</div><p>${vd(i)}</p>${i==2?`<button class="btn" style="pointer-events:auto;margin-top:10px" data-a="open" data-v="projects:0">${t().projects.viewAll} ←</button>`:''}</div>${ITEMS.filter(x=>x.s==i).map((it,j)=>it.k?`<button class="it" data-a="open" data-v="${it.k}" aria-label="${tt(it)}"><em class="fr"><i></i><i></i><i></i><i></i></em><span class="cp"><b>${FN(String(j+1).padStart(2,'0'))}</b>${tt(it)}</span></button>`:`<div class="it soon"><em class="fr"></em><span class="cp">${tt(it)}</span></div>`).join('')}</div>`).join('');
const chPage=k=>{const c=CH[k],q=Q();return `<div class="in"><article class="cd on glass" style="width:min(44rem,100%);margin:auto"><header><span class="num">${FN('0'+(k+1))}</span><div><small class="kick">${c.n[1].toUpperCase()} · ${FN('0'+(k+1))}/${FN('06')}</small><h2>${c.h[q]}</h2></div></header><p class="lede">${c.d[q]}</p><dl class="sp">${c.sp.map(r=>`<div><dt>${r[q]}</dt><dd>${r[q+2]}</dd></div>`).join('')}</dl><div class="mtr"><b data-n="${c.m[0]}" data-d="${c.m[1]}" data-s="${c.m[2]}">0</b><span>${c.m[3][q]}</span></div><div class="chips">${c.c[q].map(x=>`<span>${x}</span>`).join('')}</div><footer><button class="btn" data-a="ch" data-v="${(k+5)%6}">${L=='fa'?'›':'‹'}</button><span>${c.n[q]}</span><button class="btn p" data-a="ch" data-v="${(k+1)%6}">${L=='fa'?'‹':'›'}</button></footer></article></div>`};
function count(root){root.querySelectorAll('[data-n]').forEach(c=>{const n=+c.dataset.n,t0=performance.now();(function f(x){const k=Math.min(1,(x-t0)/1500);c.textContent=(L=='fa'?fa:z=>z)((n*(1-Math.pow(1-k,3))).toFixed(+c.dataset.d||0)).replace('.',L=='fa'?'٫':'.')+(c.dataset.s||'');if(k<1)requestAnimationFrame(f)})(t0)})}
function chrome(){const T=t(),all=[N('صفحه اصلی','Home')].concat(SEC.map((s,i)=>sn(i)));
$('#dep').textContent=T.brand.department;$('#lb').textContent=L=='fa'?'EN':'فا';
$('#nv').innerHTML=all.map((x,i)=>`<button data-a="sec" data-v="${i}">${x}</button>`).join('');$('#drawer').innerHTML=all.map((x,i)=>`<button data-a="sec" data-v="${i}">${x}</button>`).join('');
$('#idx').innerHTML=SEC.map((s,i)=>`<button data-a="sec" data-v="${i+1}"><b>${FN('0'+(i+1))}</b>${sn(i)}</button>`).join('');
$('#hv').innerHTML=`<div class="hh"><small class="kick">${T.brand.shortName} · MASHHAD</small><h1>${T.hero.teamTitle}</h1><p class="lead">${T.hero.subheadline}</p><div class="hfaces">${D.teamMembers.slice(0,5).map((m,i)=>m.photo?`<img class="hf" style="--i:${i}" alt="" src="${img(m.photo)}">`:`<span class="hf" style="--i:${i}">${m.initials||g(m.name).trim().charAt(0)}</span>`).join('')}<span class="hf-t"><b>${fa(D.teamMembers.length)}</b> ${T.hero.peopleLabel}</span></div><div class="btns" style="justify-content:flex-start"><button class="btn p" data-a="open" data-v="team:1">${T.hero.ctaTeam}</button><button class="btn" data-a="sec" data-v="1">${T.hero.ctaEnter}</button></div><small class="fd">${T.brand.name} — ${T.hero.founded}</small></div>`;
$('#views').innerHTML=views();ITEMS.forEach(it=>it.el=null);SEC.forEach((s,i)=>{const els=[...$('#v'+i).querySelectorAll('.it')];ITEMS.filter(x=>x.s==i).forEach((it,j)=>it.el=els[j])});
$('#lbs').innerHTML=SEC.map((s,i)=>`<button class="lb2${i%2?' p':''}" data-a="sec" data-v="${i+1}">${sn(i)}</button>`).join('');$('#ll').innerHTML=SEC.map(()=>'<path/><circle r="4"/>').join('');
$('#bk').textContent=N('بازگشت','Back');$('#tag').textContent=N('ساختن امروز، زیستن فردا','Build today, live tomorrow');$('#scr').firstChild.textContent=N('اسکرول کنید','Scroll');if(window.__rst)window.__rst()}
function secTo(i){document.body.classList.remove('mn');if(PK)closeP();if(!i)return scrollTo({top:0,behavior:'smooth'});const r=document.querySelectorAll('#track>.sc')[i-1].getBoundingClientRect();scrollTo({top:r.top+scrollY+r.height/2-innerHeight/2,behavior:'smooth'})}
const rs=id=>{if(PK==id)$('#pgc').innerHTML=H[id]()};
function showK(k){clipStop();const [a,b]=k.split(':');let pk,html,cr=null;
if(a=='ch'){pk='ch';html=chPage(+b);cr=CH[+b].n[Q()]}else if(a=='about'){pk='about';html=H.about();cr=sn(1)}else if(a=='projects'){pk='projects';html=H.projects();cr=sn(2)}else if(a=='sus'){pk='sustainability';if(b!='sarv')strat=b;html=H.sustainability();cr=sn(3)}else if(a=='sv'){sid=+b;svt='services';pk='services';html=H.services();cr=sn(4);setTimeout(()=>openService(+b),60)}else if(a=='edu'){svt='education';pk='services';html=H.services();cr=sn(4)}else if(a=='team'){pk='team';html=H.team();cr=sn(5)}else if(a=='contact'){pk='contact';html=H.contact();cr=sn(6)}else return;
PK=pk;curK=k;$('#pgc').innerHTML=html;$('#pcr').textContent=cr;document.body.classList.add('pgo');$('#pgv').scrollTop=0;if(pk=='ch')count($('#pgc'))}
function openK(k){const [a,b]=k.split(':');if(a=='proj')return proj(b);if(a=='ig')return window.open('https://instagram.com/isb.group','_blank','noopener');if(location.hash!=='#/'+k)history.pushState(null,'','#/'+k);showK(k)}
function closeP(){clipStop();PK=null;curK=null;document.body.classList.remove('pgo');if(location.hash.startsWith('#/'))history.replaceState(null,'',location.pathname+location.search)}
/* ---------- برآورد رتبهٔ سرو سبز و برج (امتیاز = مجموع وزن×تحقق، نسبت به جمع وزن‌ها) ---------- */
let labSt=0,sarvV=null;
function sarvUpdate(){const SV=window.SARV,S=t().sustainability;if(!SV||!sarvV||!document.getElementById('tower'))return;const cats=SV.categories,tot=cats.reduce((q,c)=>q+c.weight,0)||1,score=cats.reduce((q,c,i)=>q+c.weight*sarvV[i]/100,0)/tot*100,
 Lc={green:'#5FA37A',gold:'#EAB308',silver:'#8FA3D6',turquoise:'#3fd0c9'},lv=[...SV.levels].sort((a,b)=>b.min-a.min).find(l=>l.strict?score>l.min:score>=l.min);
document.querySelectorAll('#tower .tw-f').forEach((e,i)=>{e.style.height=sarvV[i]+'%'});
document.querySelectorAll('.sv-r').forEach((r,i)=>{const o=r.parentNode.querySelector('output');if(o)o.textContent=fa(sarvV[i])+'٪'});
const sc=document.getElementById('estScore'),lb=document.getElementById('estLvl');if(sc)sc.textContent=fa(Math.round(score));
if(lb){lb.innerHTML=lv?`<i style="background:${Lc[lv.id]}"></i>${S.sarvLevels[lv.id]}`:`<i style="background:#555"></i>${S.noLevel}`}}
document.addEventListener('input',e=>{const r=e.target;if(r&&r.classList&&r.classList.contains('sv-r')){sarvV[+r.dataset.i]=+r.value;sarvUpdate()}});
/* ---------- کلیپ‌های همایش (آپارات): پیش‌نمایش با پوستر، پخش با کلیک، پخش پشت‌سرهم بر اساس مدت هر کلیپ ---------- */
let clipI=0,clipTimer=null,clipSeq=false;
const aparatEmbed=u=>{const m=String(u||'').match(/aparat\.com\/v\/([A-Za-z0-9]+)/)||String(u||'').match(/videohash\/([A-Za-z0-9]+)/);return m?'https://www.aparat.com/video/video/embed/videohash/'+m[1]+'/vt/frame':''};
function clipsHTML(){const A=t().about,C=window.CLIPS||[];if(!C.length)return'';if(clipI>=C.length)clipI=0;
return `<section class="clips"><header><h3>${A.clipsTitle}</h3><p>${A.clipsLead}</p></header><div class="clips-w"><div class="clip-stage" id="clipStage">${clipStage(clipI)}</div><div class="clip-list" role="list">${C.map((c,i)=>`<button class="clip-c${i==clipI?' on':''}${c.orientation=='portrait'?' pt':''}" role="listitem" data-a="clip" data-v="${i}" aria-current="${i==clipI}"><span class="clip-p" style="${c.poster?`background-image:url(${img(c.poster)})`:''}"><i>▶</i>${c.orientation=='portrait'?`<em>${A.clipReels}</em>`:''}${c.duration?`<em class="d">${fa(Math.max(1,Math.round(c.duration/60)))} ${A.clipMin}</em>`:''}</span><span class="clip-t"><b>${g(c.title)}</b><small>${c.event&&g(c.event)?g(c.event)+' · ':''}${c.year?fa(c.year):''}</small></span></button>`).join('')}</div></div><div class="clip-bar"><button class="btn${clipSeq?' p':''}" data-a="clipseq">${clipSeq?A.clipSeqOff:A.clipSeqOn}</button><small class="muted">${A.clipSeqNote}</small></div></section>`}
function clipStage(i,play){const A=t().about,c=(window.CLIPS||[])[i];if(!c)return'';const src=aparatEmbed(c.aparatUrl),pt=c.orientation=='portrait';
return `<div class="clip-fr${pt?' pt':''}">${play&&src?`<iframe src="${src}" title="${g(c.title)}" allow="fullscreen; autoplay; picture-in-picture" allowfullscreen loading="lazy" referrerpolicy="origin"></iframe>`:`<button class="clip-big" data-a="clipplay" style="${c.poster?`background-image:linear-gradient(180deg,rgba(5,12,38,.2),rgba(5,12,38,.75)),url(${img(c.poster)})`:''}" aria-label="${A.clipPlay}"><span class="clip-pl">▶</span><b>${g(c.title)}</b></button>`}${clipSeq&&play&&c.duration?`<span class="clip-prog" style="animation-duration:${c.duration}s"></span>`:''}</div><div class="clip-meta"><span>${A.clipNow}: <b>${g(c.title)}</b></span><a href="${c.aparatUrl}" target="_blank" rel="noopener">${A.clipOpen} ↗</a></div>`}
function clipPlay(i,play){const C=window.CLIPS||[];if(!C.length)return;clearTimeout(clipTimer);clipI=(i+C.length)%C.length;const st=document.getElementById('clipStage');if(!st)return;st.innerHTML=clipStage(clipI,play);
document.querySelectorAll('.clip-c').forEach((b,j)=>{b.classList.toggle('on',j==clipI);b.setAttribute('aria-current',j==clipI)});
const c=C[clipI];if(play&&clipSeq&&c.duration)clipTimer=setTimeout(()=>clipPlay(clipI+1,true),Math.max(3,c.duration)*1000)}
function clipStop(){clearTimeout(clipTimer);clipTimer=null;clipSeq=false}
function clipSeqToggle(){clipSeq=!clipSeq;const b=document.querySelector('[data-a="clipseq"]'),A=t().about;if(b){b.textContent=clipSeq?A.clipSeqOff:A.clipSeqOn;b.classList.toggle('p',clipSeq)}if(clipSeq)clipPlay(clipI,true);else{clearTimeout(clipTimer);clipPlay(clipI,true)}}
/* ---------- آیکن خدمات (ساده، هم‌سبک) ---------- */
const SVI={Leaf:'<path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14"/><path d="M5 19l7-7"/>',Activity:'<path d="M3 12h4l3-8 4 16 3-8h4"/>',BarChart3:'<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',Sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',Layers:'<path d="M12 3l9 5-9 5-9-5 9-5z"/><path d="M3 13l9 5 9-5"/>',Search:'<circle cx="11" cy="11" r="7"/><path d="M21 21l-5-5"/>',Zap:'<path d="M13 2L4 14h7l-1 8 9-12h-7l1-8z"/>',Wind:'<path d="M3 8h11a3 3 0 1 0-3-3M3 12h16a3 3 0 1 1-3 3M3 16h8"/>',Cpu:'<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4"/>',Thermometer:'<path d="M14 14.8V5a2 2 0 0 0-4 0v9.8a4 4 0 1 0 4 0z"/>',Droplets:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',Award:'<circle cx="12" cy="9" r="6"/><path d="M8.5 14.5L7 22l5-3 5 3-1.5-7.5"/>',Volume2:'<path d="M4 9v6h4l5 4V5L8 9H4z"/><path d="M16 9a4 4 0 0 1 0 6M19 6a8 8 0 0 1 0 12"/>'};
/* ---------- جزئیات هر خدمت (کشوی کناری؛ روی موبایل از پایین) ---------- */
function openService(id){const s=D.services.find(x=>x.id==id);if(!s)return;const V=t().services,gr=(D.serviceGroups||[]).find(x=>x.id==s.group),sts=(D.serviceStages||[]).filter(x=>(s.stages||[]).includes(x.id));
let d=document.getElementById('mdr');if(!d){d=document.createElement('div');d.id='mdr';document.body.appendChild(d)}
d.innerHTML=`<div class="mdr-bg" data-a="mx"></div><aside class="mdr-p glass" role="dialog" aria-modal="true" aria-label="${g(s.title)}"><button class="mdr-x" data-a="mx" aria-label="${V.close}">✕</button><div class="sd-h"><span class="svc-ic big"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${SVI[s.icon]||SVI.Leaf}</svg></span><span class="svc-n">${V.domain} ${fa(String(s.id).padStart(2,'0'))}</span></div><div class="mdr-b">${gr?`<small class="kick2">${g(gr.name)}</small>`:''}<h3>${g(s.title)}</h3><p>${g(s.description)}</p>${(s.highlights||[]).length?`<ul>${s.highlights.map(h=>`<li>${g(h)}</li>`).join('')}</ul>`:''}${s.id==13?`<p class="w">${V.acousticNote}</p>`:''}${sts.length?`<h4>${V.suitableFor}</h4><div class="chips">${sts.map(x=>`<span>${g(x.name)}</span>`).join('')}</div>`:''}<button class="btn p" data-a="consult" style="justify-self:start;margin-top:12px">${V.ctaButton}</button></div></aside>`;
document.body.classList.add('mdo');d.querySelector('.mdr-x').focus({preventScroll:true})}

/* ---------- پروفایل اعضای تیم (کشوی کناری؛ روی موبایل از پایین باز می‌شود) ---------- */
function openMember(id){const m=D.teamMembers.find(x=>x.id==id);if(!m)return;const M=t().team,dp=(D.departments||[]).find(d=>d.id==m.department),ex=(m.expertise&&m.expertise[L])||[],ed=m.education?g(m.education):'',
 ln=[[m.linkedin,'LinkedIn',m.linkedin],[m.instagram,'Instagram',m.instagram],[m.email,N('ایمیل','Email'),m.email&&'mailto:'+m.email]].filter(x=>x[0]);
let d=document.getElementById('mdr');if(!d){d=document.createElement('div');d.id='mdr';document.body.appendChild(d)}
d.innerHTML=`<div class="mdr-bg" data-a="mx"></div><aside class="mdr-p glass" role="dialog" aria-modal="true" aria-label="${g(m.name)}"><button class="mdr-x" data-a="mx" aria-label="${M.close}">✕</button>${m.photo?`<span class="tpw mdrw"><img class="tp-img" alt="" src="${img(m.photo)}" onload="if(this.naturalWidth<480)this.parentNode.classList.add('lowres')"></span>`:`<div class="mdr-img tp-ph" aria-hidden="true">${m.initials||g(m.name).trim().charAt(0)}</div>`}<div class="mdr-b">${dp?`<small class="kick2">${g(dp.name)}</small>`:''}<h3>${g(m.name)}</h3><span class="r">${g(m.role)}</span>${g(m.title)?`<p class="mdr-t">${g(m.title)}</p>`:''}${g(m.bio)?`<p>${g(m.bio)}</p>`:''}${ex.length?`<h4>${M.expertise}</h4><div class="chips">${ex.map(x=>`<span>${x}</span>`).join('')}</div>`:''}${ed?`<h4>${M.education}</h4><p>${ed}</p>`:''}${ln.length?`<h4>${M.reach}</h4><div class="mdr-ln">${ln.map(x=>`<a href="${x[2]}" target="_blank" rel="noopener">${x[1]}</a>`).join('')}</div>`:''}</div></aside>`;
document.body.classList.add('mdo');d.querySelector('.mdr-x').focus({preventScroll:true})}
function closeMember(){const d=document.getElementById('mdr');if(d)d.innerHTML='';document.body.classList.remove('mdo')}
document.addEventListener('click',e=>{if(e.target.id=='modal')return closeM();const a=e.target.closest('[data-a]');if(!a)return;const k=a.dataset.a,v=a.dataset.v;
({sec:()=>secTo(+v),open:()=>openK(v),ch:()=>openK('ch:'+v),back:closeP,cat:()=>{cat=v;rs('projects')},pstat:()=>{pst=v;rs('projects')},st:()=>{strat=v;labSt=0;rs('sustainability')},labt:()=>{labSt=+v;const el=document.getElementById('labSvg');if(el)el.innerHTML=LAB.svg(strat,labSt);document.querySelectorAll('.lab-sw button').forEach((b,j)=>b.classList.toggle('on',j==labSt))},sv:()=>{sid=+v;rs('services')},tab:()=>{svt=v;rs('services')},proj:()=>proj(v),x:closeM,lang:setL,cert:()=>cert(v),dept:()=>{dept=v;rs('team')},member:()=>openMember(v),mx:closeMember,clip:()=>clipPlay(+v,true),clipplay:()=>clipPlay(clipI,true),clipseq:clipSeqToggle,stg:()=>{stg=(stg==v?'all':v);rs('services')},svopen:()=>openService(+v),consult:()=>{closeMember();if(PK)closeP();const b=document.getElementById('isb-mascot-btn');if(b)b.click()},menu:()=>document.body.classList.toggle('mn')})[k]?.()});
document.addEventListener('keydown',e=>{const el=e.target;if((e.key=='Enter'||e.key==' ')&&el&&el.matches&&el.matches('[role="button"][data-a]')){e.preventDefault();el.click();return}if(e.key=='Escape'){if(document.body.classList.contains('mdo')){closeMember();return}closeM();if(PK)closeP();document.body.classList.remove('mn')}});
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
