/* دستیار سه‌بعدی ISB: کاراکتر متحرک (چشم، دهان، پرش)، حباب گفتار، دکمه و فرم «مشاورهٔ آنلاین» (تیکت). تنظیم آدرس سرویس تیکت و ایمیل: CFG در ابتدای همین فایل. */
(()=>{
'use strict';
/* ------------------ تنظیمات: اینجا آدرس سرویس تیکت را بگذارید ------------------ */
const CFG=window.ISB_TICKET_CONFIG=Object.assign({
  endpoint:'',            // مثال: 'https://api.example.com/tickets'  (POST, JSON)
  email:'',               // مثال: 'info@isb-group.ir'  -> دکمه ارسال با ایمیل فعال می‌شود
  greetingDelay:1400,     // نمایش پیام خوشامد بعد از لود (ms)
  autoOpenBubble:true,    // پیام خوشامد در صفحهٔ اصلی
   guide:true,             // توضیح کاراکتر برای هر بخش هنگام اسکرول (false = خاموش)
   tipDwell:550            // چند میلی‌ثانیه توقف در هر بخش تا کاراکتر شروع به صحبت کند
},window.ISB_TICKET_CONFIG||{});

const TXT=window.ISB_ASSISTANT_TEXT;
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const lang=()=>document.documentElement.lang==='en'?'en':'fa';
const tx=()=>TXT[lang()];
let topic=0;
let guideReady=false;
function applyLang(){const t=tx();$$('#isb-mascot-btn [data-t],#isb-bubble [data-t],#isb-panel [data-t]').forEach(e=>{if(t[e.dataset.t]!=null)e.textContent=t[e.dataset.t]});
 $('#isb-chips').innerHTML=t.topics.map((s,i)=>'<button type="button" class="'+(i===topic?'on':'')+'" data-i="'+i+'">'+s+'</button>').join('');
 $('#isb-mascot-btn').setAttribute('aria-label',t.btn);guideReady&&guideLang();}
new MutationObserver(applyLang).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
applyLang();

/* ------------------ پنل تیکت ------------------ */
const panel=$('#isb-panel'),bub=$('#isb-bubble'),mbtn=$('#isb-mascot-btn');
let API={cheer(){},wave(){}};
const open=()=>{panel.classList.add('on');guideHide();API.cheer(1.4);setTimeout(()=>{const n=$('#isb-n');n&&n.focus({preventScroll:true})},350)};
const close=()=>panel.classList.remove('on');
mbtn.addEventListener('click',()=>panel.classList.contains('on')?close():open());
panel.querySelector('.cl').addEventListener('click',close);
addEventListener('keydown',e=>{if(e.key==='Escape'){close();guideHide()}});
bub.querySelector('.go').addEventListener('click',open);
bub.querySelector('.no').addEventListener('click',()=>guideHide());
bub.querySelector('.x').addEventListener('click',()=>{guideHide();guideClosed()});
$('#isb-chips').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;topic=+b.dataset.i;$$('#isb-chips button').forEach((x,i)=>x.classList.toggle('on',i===topic))});
$('#isb-again').addEventListener('click',()=>{$('#isb-ok').hidden=true;$('#isb-form').hidden=false;$('#isb-m').value=''});
const mkId=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return 'ISB-'+String(d.getFullYear()).slice(2)+p(d.getMonth()+1)+p(d.getDate())+'-'+Math.random().toString(36).slice(2,6).toUpperCase()};
$('#isb-form').addEventListener('submit',async ev=>{
 ev.preventDefault();const t=tx(),err=$('#isb-err');err.textContent='';
 if($('#isb-hp').value)return;
 const name=$('#isb-n').value.trim(),contact=$('#isb-c').value.trim(),msg=$('#isb-m').value.trim();
 const okC=/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contact)||/^[+\d۰-۹][\d۰-۹\s\-()]{6,}$/.test(contact);
 if(name.length<2)return err.textContent=t.eName;
 if(!okC)return err.textContent=t.eContact;
 if(msg.length<5)return err.textContent=t.eMsg;
 const ticket={id:mkId(),topic:t.topics[topic],name,contact,message:msg,lang:lang(),page:location.href,at:new Date().toISOString()};
 const btn=$('#isb-form .send');btn.disabled=true;const old=btn.textContent;btn.textContent=t.sending;
 let netFail=false;
 if(CFG.endpoint){try{const r=await fetch(CFG.endpoint,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(ticket)});if(!r.ok)throw 0}catch(_){netFail=true}}
 try{const a=JSON.parse(localStorage.getItem('isb_tickets')||'[]');a.push(ticket);localStorage.setItem('isb_tickets',JSON.stringify(a.slice(-20)))}catch(_){}
 btn.disabled=false;btn.textContent=old;
 $('#isb-tk').textContent=ticket.id;$('#isb-form').hidden=true;$('#isb-ok').hidden=false;
 const ml=$('#isb-mail');
 if(CFG.email){ml.hidden=false;ml.href='mailto:'+CFG.email+'?subject='+encodeURIComponent('Ticket '+ticket.id+' - '+ticket.topic)+'&body='+encodeURIComponent(name+'\n'+contact+'\n\n'+msg)}else ml.hidden=true;
 if(netFail)err.textContent=t.eNet;
 API.cheer(2.4);
});

/* ------------------ کاراکتر (رندر اصلی مجموعه + انیمیشن سه‌بعدی‌نما) ------------------ */
const host=$('#isb-mascot'),reduce=matchMedia('(prefers-reduced-motion:reduce)').matches;
const BODY='assets/images/mascot-body.webp',HEAD='assets/images/mascot-head.webp';
const HO=[51.52,-3.36],HW=161,HH=179;
host.innerHTML='<div class="mc-stage"><div class="mc-glow"></div><div class="mc-shadow"></div><div class="mc-fig"><img class="mc-body" alt="" width="256" height="464" style="left:0;top:0"><div class="mc-head" style="left:'+HO[0]+'px;top:'+HO[1]+'px;width:'+HW+'px;height:'+HH+'px"><img alt="" style="left:0;top:0" width="'+HW+'" height="'+HH+'"><svg viewBox="0 0 287 319" width="'+HW+'" height="'+HH+'"><defs><clipPath id="mcClip"><path id="mcClipP"/></clipPath><radialGradient id="mcBl"><stop offset="0" stop-color="#ff8fa3" stop-opacity=".75"/><stop offset="1" stop-color="#ff8fa3" stop-opacity="0"/></radialGradient></defs>'
 +'<g id="mcBlush" opacity="0"><ellipse cx="94" cy="224" rx="26" ry="14" fill="url(#mcBl)" transform="rotate(6.6 94 224)"/><ellipse cx="230" cy="236" rx="26" ry="14" fill="url(#mcBl)" transform="rotate(6.6 230 236)"/></g>'
 +'<g id="mcEyes"></g><g transform="translate(157.6 228) rotate(6.6)"><path id="mcMouth" fill="#35101a"/><ellipse id="mcTongue" fill="#e8667f" clip-path="url(#mcClip)"/></g></svg></div></div><div class="spk-wrap"></div></div>';
const stage=host.querySelector('.mc-stage'),fig=host.querySelector('.mc-fig'),headEl=host.querySelector('.mc-head'),glow=host.querySelector('.mc-glow'),shadow=host.querySelector('.mc-shadow');
host.querySelector('.mc-body').src=BODY;headEl.querySelector('img').src=HEAD;
const eyesG=host.querySelector('#mcEyes'),mouthP=host.querySelector('#mcMouth'),clipP=host.querySelector('#mcClipP'),tongue=host.querySelector('#mcTongue'),blush=host.querySelector('#mcBlush');
const NS='http://www.w3.org/2000/svg',EYE=[[115.7,183.7],[201.7,193.7]];
const eyes=EYE.map(p=>{const g=document.createElementNS(NS,'g');g.setAttribute('transform','translate('+p[0]+' '+p[1]+') rotate(6.6)');
 g.innerHTML='<g class="o"><ellipse rx="15.5" ry="24" fill="#07080d"/><ellipse cx="5" cy="-10" rx="4.4" ry="4.8" fill="#fff" opacity=".95"/><circle cx="-4.5" cy="10.5" r="2" fill="#fff" opacity=".5"/></g><path class="h" d="M-17 8Q0 -18 17 8" fill="none" stroke="#07080d" stroke-width="6.5" stroke-linecap="round" style="display:none"/>';
 eyesG.appendChild(g);return{g,o:g.querySelector('.o'),h:g.querySelector('.h'),p:p}});
const spkW=host.querySelector('.spk-wrap'),spk=[];for(let i=0;i<7;i++){const e=document.createElement('div');e.className='spk';e.textContent=i%3===0?'✦':'✧';stage.appendChild(e);spk.push(e)}
// ماسک آلفا برای تشخیص دقیق لمس روی بدن
let alpha=null;{const im=new Image();im.onload=()=>{try{const c=document.createElement('canvas');c.width=256;c.height=464;const x=c.getContext('2d',{willReadFrequently:true});x.drawImage(im,0,0,256,464);alpha=x.getImageData(0,0,256,464).data}catch(e){}};im.src=BODY}
let k=1;
function layout(){const h=innerWidth<=640?172:Math.max(200,Math.min(285,innerHeight*.3));k=h/464;
 host.style.width=256*k+'px';host.style.height=h+'px';stage.style.transform='scale('+k+')';
 document.documentElement.style.setProperty('--mw',256*k+'px');document.documentElement.style.setProperty('--mh',h+'px')}
addEventListener('resize',layout);layout();

const st={hov:0,hovT:0,cheer:0,talk:0,look:{x:0,y:0},lookT:{x:0,y:0},jump:0,jv:0,blink:0,nextBlink:2.2,wink:0,nextWink:8,hit:false,phrase:0,t:0};
API.cheer=d=>{st.cheer=d||1.4;if(st.jump<1)st.jv=420};
API.wave=()=>{};
function hitTest(cx,cy){const r=host.getBoundingClientRect();if(cx<r.left||cx>r.right||cy<r.top||cy>r.bottom)return false;
 const x=Math.round((cx-r.left)/k),y=Math.round((cy-r.top)/k+st.jump);if(x<0||y<0||x>=256||y>=464)return false;
 if(!alpha)return true;return alpha[(y*256+x)*4+3]>40}
let hb=0;
function hoverBubble(){guideReplay()}
addEventListener('pointermove',e=>{
 const r=host.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height*.2;
 st.lookT.x=Math.max(-1,Math.min(1,(e.clientX-cx)/(innerWidth*.45)));st.lookT.y=Math.max(-1,Math.min(1,(e.clientY-cy)/(innerHeight*.5)));
 const h=hitTest(e.clientX,e.clientY);
 if(h&&!st.hit){st.phrase=(st.phrase+1)%3;st.jv=300;hoverBubble()}
 st.hit=h;st.hovT=h?1:0;host.classList.toggle('hit',h);document.documentElement.style.cursor=h?'pointer':'';
},{passive:true});
document.addEventListener('mouseleave',()=>{st.hovT=0;st.hit=false;st.lookT.x=st.lookT.y=0;host.classList.remove('hit');document.documentElement.style.cursor=''});
addEventListener('pointerdown',e=>{if(hitTest(e.clientX,e.clientY)){e.preventDefault();open()}},{passive:false});
addEventListener('click',e=>{if(hitTest(e.clientX,e.clientY)){e.stopPropagation();e.preventDefault()}},true);

function mouth(t){const w=21+5*t,d=13+10*t,p='M'+(-w)+' -4Q0 -1 '+w+' -4Q'+(w*.62)+' '+d+' 0 '+d+'Q'+(-w*.62)+' '+d+' '+(-w)+' -4Z';
 mouthP.setAttribute('d',p);clipP.setAttribute('d',p);clipP.setAttribute('transform','translate(157.6 228) rotate(6.6)');
 tongue.setAttribute('cx',0);tongue.setAttribute('cy',d*.78);tongue.setAttribute('rx',w*.46);tongue.setAttribute('ry',d*.32)}
const lerp=(a,b,k)=>a+(b-a)*k;
let prev=performance.now(),vis=true;
document.addEventListener('visibilitychange',()=>{vis=!document.hidden;prev=performance.now()});
new IntersectionObserver(es=>{vis=es[0].isIntersecting&&!document.hidden}).observe(host);
function loop(now){requestAnimationFrame(loop);if(!vis)return;
 const dt=Math.min(.05,(now-prev)/1e3);prev=now;st.t+=dt;const t=st.t;
 const hv=st.hov=lerp(st.hov,Math.max(st.hovT,st.cheer>0?1:0),1-Math.exp(-dt*9));
 if(st.cheer>0)st.cheer=Math.max(0,st.cheer-dt);
  if(st.talk>0)st.talk=Math.max(0,st.talk-dt);const tk=st.talk>0?Math.min(1,st.talk*4):0;
 const ks=1-Math.exp(-dt*6);st.look.x=lerp(st.look.x,(st.talk>0?lerp(st.lookT.x,.5,.55):st.lookT.x),ks);st.look.y=lerp(st.look.y,st.lookT.y,ks);
 if(st.jv!==0||st.jump>0){st.jv-=1500*dt;st.jump+=st.jv*dt;if(st.jump<=0){st.jump=0;st.jv=0}}
 if(st.hit&&st.jump===0&&Math.random()<dt*.8)st.jv=240;
 const br=Math.sin(t*1.9),sway=reduce?0:Math.sin(t*.8)*5,str=1+Math.min(.07,Math.abs(st.jv)*.00018);
 const sy=(1+br*.006)*str,sx=(1-br*.003)/str;
 fig.style.transform='translateY('+(-st.jump)+'px) rotateY('+(st.look.x*11+sway)+'deg) rotateZ('+(Math.sin(t*9)*1.3*hv)+'deg) scale('+sx+','+sy+')';
 headEl.style.transform='translate('+(st.look.x*3)+'px,'+(br*-.6-st.look.y*1.5-tk*Math.abs(Math.sin(t*9))*1.6)+'px) rotate('+(st.look.x*3.5+Math.sin(t*10)*3.2*hv-hv*2)+'deg)';
 const sc=1-Math.min(.4,st.jump/110);shadow.style.transform='scale('+sc+','+sc+')';shadow.style.opacity=.55+.45*sc;
 // چهره
 st.nextBlink-=dt;if(st.nextBlink<0){st.blink=.15;st.nextBlink=2+Math.random()*3.5}
 let bl=0;if(st.blink>0){st.blink-=dt;bl=Math.sin(Math.max(0,st.blink)/.15*Math.PI)}
 st.nextWink-=dt;if(st.nextWink<0&&hv<.3){st.wink=.45;st.nextWink=9+Math.random()*7}
 const wk=st.wink>0?(st.wink-=dt,1):0,happy=hv>.5;
 eyes.forEach((e,i)=>{const closed=happy||(wk&&i===1);e.o.style.display=closed?'none':'';e.h.style.display=closed?'':'none';
  e.o.setAttribute('transform','translate('+(st.look.x*4)+' '+(st.look.y*3)+') scale(1 '+(1-bl*.92)+')')});
 mouth(Math.min(1,Math.max(hv*1.15,tk*(.2+.4*Math.abs(Math.sin(t*12.5))*(.65+.35*Math.sin(t*5.3))))));blush.setAttribute('opacity',hv);
 // جرقه‌ها
 spk.forEach((e,i)=>{const a=t*1.8+i/spk.length*6.283,r=92+Math.sin(t*2.6+i)*7;e.style.opacity=Math.min(1,hv*1.2)*(.55+.45*Math.sin(t*5+i));
  e.style.transform='translate('+(150+Math.cos(a)*r*1.15)+'px,'+(78+Math.sin(a)*r*.62-st.jump*.4)+'px) scale('+(.7+Math.sin(t*4+i)*.35)+') rotate('+t*60+'deg)'});
}
requestAnimationFrame(loop);

/* ---- اتصال به guide.js (راهنمای هر بخش) ----
   guide.js بعد از این فایل لود می‌شود و توابع واقعی را در guideHooks می‌گذارد؛ تا آن موقع این توابع کاری نمی‌کنند. */
const guideHooks={hide(){},closed(){},lang(){},replay(){}};
function guideHide(){guideHooks.hide()}
function guideClosed(){guideHooks.closed()}
function guideLang(){guideHooks.lang()}
function guideReplay(){guideHooks.replay()}
window.ISB_MASCOT={CFG,$,lang,panel,bub,st,reduce,hooks:guideHooks,
  get API(){return API},
  get guideReady(){return guideReady},set guideReady(v){guideReady=v}};
})();
