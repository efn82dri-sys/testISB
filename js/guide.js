/* راهنمای دستیار هنگام اسکرول: برای هر بخش شهرک توضیح کوتاه می‌گوید. موقعیت پیوستهٔ دوربین را با gPos() از window.__isbSY می‌خواند تا با camera.js هم‌گام باشد. متن‌ها: data/guide.json */
(()=>{
'use strict';
const M=window.ISB_MASCOT;
const {CFG,$,lang,panel,bub,st,reduce}=M;


/* ================== راهنمای کاراکتر: خوش‌آمدگویی + توضیح کوتاه هر بخش هنگام اسکرول ==================
   منطق تشخیص بخش دقیقاً همان فرمول دوربین سه‌بعدی است (۷ توقف روی #track>.sc)، پس هر وقت
   دوربین روی یک بخش «می‌نشیند» و کاربر چند لحظه می‌ماند، کاراکتر دربارهٔ همان بخش حرف می‌زند. */
const GT=window.ISB_GUIDE_TEXT;
const CTA=[1,0,0,0,0,0,0,1];          // بخش‌هایی که دکمهٔ مشاوره دارند: خانه و تماس
const bh=$('#isb-bh'),bt=$('#isb-bt'),acts=bub.querySelector('.acts'),goB=bub.querySelector('.go'),noB=bub.querySelector('.no'),xB=bub.querySelector('.x');
let gCur=-1,gShown=-1,gTok=0,gStarted=false,gDwell=0,gHide=0,gRev=[],gRaf=0,gClosed=0,gHidAt=0,gPersist=false;
const gSeen={};
try{gClosed=+sessionStorage.getItem('isb_guide_x')||0}catch(_){}
const gOff=()=>gClosed>=2;               // کاربر دو بار × زده: دیگر خودکار صحبت نمی‌کنیم
const gOn=()=>bub.classList.contains('on');
const gBlocked=()=>{const c=document.body.classList;return panel.classList.contains('on')||c.contains('pgo')||c.contains('mo')||c.contains('mn')||document.hidden};
const coarse=()=>matchMedia('(pointer:coarse)').matches;
const esc=x=>x.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const smS=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)};
/* موقعیت پیوستهٔ دوربین: 0 = خانه، 1..7 = بخش‌ها (همان prog() و easing در tick سه‌بعدی) */
function gPos(){
  const E=[...document.querySelectorAll('#track>.sc')];if(!E.length)return 0;
  const maxY=Math.max(0,document.documentElement.scrollHeight-innerHeight),y=Math.min(maxY,Math.max(0,window.__isbSY!=null?window.__isbSY:scrollY)),P=[0];
  E.forEach(el=>{const r=el.getBoundingClientRect();P.push(Math.min(maxY,Math.max(0,r.top+scrollY+r.height/2-innerHeight/2)))});
  for(let k=1;k<P.length;k++){if(y<=P[k]){const a=P[k-1],b=Math.max(a+1,P[k]);return k-1+(k==1?smS(Math.min(.85,innerHeight*1.2/b),1,Math.min(1,Math.max(0,(y-a)/(b-a)))):smS(.18,.82,Math.min(1,Math.max(0,(y-a)/(b-a)))))}}
  return E.length;
}
function gContent(i){const G=GT[lang()],sm=matchMedia('(max-width:640px)').matches;return{head:G.head[i],text:(sm?G.tipsS:G.tips)[i].replace('{tap}',G.tap[coarse()?0:1]),cta:CTA[i],go:i===7?G.goT:G.go,no:G.no,x:G.x}}
function gRender(i,instant){
  const c=gContent(i),words=c.text.split(' ');
  bh.textContent=c.head;bub.classList.toggle('gs',i>0);
  bt.innerHTML=words.map(w=>'<span class="gw'+(instant?' gv':'')+'">'+esc(w)+'</span>').join(' ');
  acts.hidden=!c.cta;goB.textContent=c.go;noB.textContent=c.no;xB.setAttribute('aria-label',c.x);
  return words.length;
}
function gArm(ms){clearTimeout(gHide);gHide=setTimeout(guideHide,ms)}
function gSpeak(i,o){
  o=o||{};if(gBlocked())return;
  const tok=++gTok,was=gOn();clearTimeout(gHide);gRev.forEach(clearTimeout);gRev=[];
  const show=()=>{
    if(tok!==gTok||gBlocked())return;
    gShown=i;gSeen[i]=Date.now();
    const n=gRender(i,false);bub.classList.add('on');
    const ws=[...bt.querySelectorAll('.gw')];
    if(reduce)ws.forEach(w=>w.classList.add('gv'));else{ws.forEach((w,k)=>gRev.push(setTimeout(()=>w.classList.add('gv'),140+k*78)));st.talk=(140+n*78)/1000+.4}
    if(i===0&&!o.replay)M.API.cheer(1.1);
    gPersist=i===0&&!o.replay;                                   // خوش‌آمد تا اسکرول/بستن می‌ماند
    if(!gPersist)gArm(i===7&&!o.replay?18000:Math.min(12000,Math.max(5500,2200+n*380)));
  };
  if(was){bub.classList.remove('on');setTimeout(show,260)}else show();
}
function guideHide(){gTok++;clearTimeout(gHide);gRev.forEach(clearTimeout);gRev=[];bub.classList.remove('on');gShown=-1;st.talk=0;gHidAt=Date.now()}
function guideClosed(){gClosed++;try{sessionStorage.setItem('isb_guide_x',gClosed)}catch(_){}}
function guideLang(){if(gShown>=0&&gOn())gRender(gShown,true)}
function guideReplay(){                                           // نزدیک شدن موس به کاراکتر = تکرار توضیح بخش فعلی
  if(gOn()||gBlocked()||Date.now()-gHidAt<4000)return;
  gSpeak(gCur>=0?gCur:Math.round(gPos()),{replay:true});
}
function gAuto(r){
  if(gBlocked()){gCur=-1;return}                                  // مثلاً پنجرهٔ پروژه باز است؛ بعد از بسته شدن دوباره بررسی می‌شود
  if(r===0?!CFG.autoOpenBubble:!CFG.guide)return;
  if(gOff())return;
  if(gSeen[r]&&Date.now()-gSeen[r]<90000)return;                  // تازه گفته‌ایم؛ تکرار نکن
  if(r>0&&!reduce&&st.jump===0)st.jv=300;                         // یک پرش کوچک هنگام ورود به بخش جدید
  gSpeak(r);
}
function gEval(){
  gRaf=0;
  const cv=gPos(),r=Math.round(cv),near=Math.abs(cv-r)<.14,c=document.body.classList;
  if(gOn()&&(c.contains('pgo')||c.contains('mo')||c.contains('mn')))guideHide();
  if(gShown>=0&&Math.abs(cv-gShown)>.32)guideHide();              // کاربر دارد از این بخش دور می‌شود
  if(!near){clearTimeout(gDwell);gCur=-1;return}
  if(r===gCur)return;
  gCur=r;clearTimeout(gDwell);
  const first=!gStarted;gStarted=true;
  gDwell=setTimeout(()=>gAuto(r),(first&&r===0)?CFG.greetingDelay:CFG.tipDwell);
}
const gQ=()=>{if(!gRaf)gRaf=requestAnimationFrame(gEval)};
addEventListener('scroll',gQ,{passive:true});addEventListener('resize',gQ,{passive:true});(document.readyState==='complete'?gQ():addEventListener('load',gQ));
document.addEventListener('visibilitychange',()=>{if(!document.hidden)gQ()});
new MutationObserver(gQ).observe(document.body,{attributes:true,attributeFilter:['class']});
bub.addEventListener('pointerenter',()=>clearTimeout(gHide));
bub.addEventListener('focusin',()=>clearTimeout(gHide));
bub.addEventListener('pointerleave',()=>{if(gOn()&&!gPersist)gArm(2600)});
M.hooks.hide=guideHide;M.hooks.closed=guideClosed;M.hooks.lang=guideLang;M.hooks.replay=guideReplay;
M.guideReady=true;gEval();
})();
