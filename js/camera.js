/* دوربین و اسکرول: مکث روی نمای ایزومتریک کامل (key(0))، زوم بین بخش‌ها، اسکرول نرم‌شده sy (ضریب ۵٫۵) و حرکت دوربین (ضریب ۹)، جای کادرها و برچسب‌ها روی شهرک.
   مقدار نرم‌شدهٔ اسکرول در window.__isbSY منتشر می‌شود و دستیار (guide.js) با آن هم‌گام است. */
(()=>{
const {R,sc,cam,reduce,gl,anim}=window.ISB_3D||{};
if(!R)return;
/* camera track */
const sm=(a,b,x)=>{x=Math.min(1,Math.max(0,(x-a)/(b-a)));return x*x*(3-2*x)},lerp=(a,b,t)=>a+(b-a)*t,V=new THREE.Vector3(),asp=()=>innerWidth/innerHeight;
function key(i){const a=asp();if(i==0)return{x:-1,z:10,fs:Math.max(135,190/a),p:35.264,a:45};const c=PC[i-1],fs=i==1?Math.max(27,76/a):Math.max(33,47/a);return{x:c[0],z:c[1]-fs*.1,fs,p:89.4,a:0}}
function prog(){
const E=[...document.querySelectorAll('#track>.sc')];
if(!E.length)return[0,0,1];
const maxY=Math.max(0,document.documentElement.scrollHeight-innerHeight);
const y=Math.min(maxY,Math.max(0,sy));
const P=[0];
E.forEach(el=>{
  const r=el.getBoundingClientRect();
  const anchor=r.top+scrollY+r.height/2-innerHeight/2;
  P.push(Math.min(maxY,Math.max(0,anchor)));
});
for(let k=1;k<P.length;k++){
  if(y<=P[k]){
    const start=P[k-1],end=Math.max(start+1,P[k]);
    return[k-1,Math.min(1,Math.max(0,(y-start)/(end-start))),P[1]];
  }
}
return[E.length-1,1,P[1]];
}
const S=Object.assign({},key(0)),pr=(x,y,z)=>{V.set(x,y,z).project(cam);return[(V.x*.5+.5)*innerWidth,(-V.y*.5+.5)*innerHeight]};
let mx=0,last=performance.now(),tm=0,lai=-1,lf='',sy=scrollY;window.__isbSY=sy;window.__rst=()=>{lai=-1};
addEventListener('pointermove',e=>{mx=e.clientX/innerWidth-.5});
const fit=()=>R.setSize(innerWidth,innerHeight,false);fit();addEventListener('resize',fit);
function tick(now){const dt=Math.min(.05,(now-last)/1e3);last=now;tm+=dt;sy+=(scrollY-sy)*(1-Math.exp(-dt*(reduce?40:5.5)));if(Math.abs(scrollY-sy)<.1)sy=scrollY;window.__isbSY=sy;
const pg=prog(),i=pg[0],e=i==0?sm(Math.min(.85,innerHeight*1.2/Math.max(1,pg[2])),1,pg[1]):sm(.18,.82,pg[1]),A=key(i),B=key(i+1),td=A.p>80&&B.p>80,si=Math.sin(Math.PI*e);
const T={x:lerp(A.x,B.x,e),z:lerp(A.z,B.z,e),fs:lerp(A.fs,B.fs,e)*(td?1+.28*si:1),p:lerp(A.p,B.p,e)-(td?26*si:0),a:lerp(A.a,B.a,e)+(td?30*si:0)};
const k=1-Math.exp(-dt*(reduce?30:9));for(const q in T)S[q]+=(T[q]-S[q])*k;
const as=asp(),hh=S.fs/2,az=(S.a+(S.p<60?mx*5+Math.sin(tm*.2)*1.5:0))*Math.PI/180,pe=S.p*Math.PI/180;
cam.left=-hh*as;cam.right=hh*as;cam.top=hh;cam.bottom=-hh;cam.updateProjectionMatrix();
cam.position.set(S.x+Math.sin(az)*Math.cos(pe)*400,Math.sin(pe)*400,S.z+Math.cos(az)*Math.cos(pe)*400);cam.lookAt(S.x,0,S.z);cam.updateMatrixWorld();
anim.forEach(f=>f(tm));
const cv=i+e;
for(let j=1;j<=7;j++){const v=document.getElementById('v'+(j-1));if(!v)continue;const ac=PK?0:Math.max(0,Math.min(1,1-Math.abs(cv-j)*3.2));v.style.opacity=ac;v.style.visibility=ac>.01?'visible':'hidden';
if(ac>.01)ITEMS.forEach(it=>{if(it.s!=j-1||!it.el)return;const y0=.9,x0=it.x-it.w/2,z0=it.z-it.h/2,p0=pr(x0,y0,z0),px=pr(x0+it.w,y0,z0),pz=pr(x0,y0,z0+it.h),p3=pr(x0+it.w,y0,z0+it.h),fr=it.el.firstElementChild,cp=it.el.lastElementChild;
fr.style.transform='matrix('+(px[0]-p0[0])/100+','+(px[1]-p0[1])/100+','+(pz[0]-p0[0])/100+','+(pz[1]-p0[1])/100+','+p0[0]+','+p0[1]+')';
const xs=[p0[0],px[0],pz[0],p3[0]],ys=[p0[1],px[1],pz[1],p3[1]],mnx=Math.min.apply(null,xs),mxx=Math.max.apply(null,xs),mxy=Math.max.apply(null,ys);cp.style.width=Math.max(96,Math.min(260,(mxx-mnx)*.92))+'px';cp.style.transform='translate('+(mnx+mxx)/2+'px,'+(mxy+8)+'px) translateX(-50%)'})}
const rv=Math.min(1,sy/(innerHeight*.7)),bl=PK?10:14*(1-sm(0,1,rv)),fs2=bl>.4?'blur('+bl.toFixed(1)+'px)':'none';if(fs2!==lf){lf=fs2;gl.style.filter=fs2}
const hv=$('#hv');hv.style.opacity=Math.max(0,1-rv*1.7);hv.style.pointerEvents=rv<.4?'auto':'none';hv.style.visibility=rv<.6?'visible':'hidden';hv.style.transform='translateY('+(-sy*.25)+'px)';
const lop=PK?0:(1-sm(55,80,S.p))*sm(.25,.8,rv),LB=$('#lbs').children,ll=$('#ll').children;
PC.forEach((c,j)=>{const p=pr(c[0],6,c[1]),o=LO[j],x=p[0]+o[0],y=p[1]+o[1],el=LB[j];if(!el)return;el.style.transform='translate('+x+'px,'+y+'px) translate(-50%,-50%)';el.style.opacity=lop;el.style.pointerEvents=lop>.5?'auto':'none';
ll[j*2].setAttribute('d','M'+x+' '+y+'L'+p[0]+' '+p[1]);ll[j*2].style.opacity=lop;ll[j*2+1].setAttribute('cx',p[0]);ll[j*2+1].setAttribute('cy',p[1]);ll[j*2+1].style.opacity=lop});
const ai=Math.round(cv);if(ai!==lai){lai=ai;document.querySelectorAll('#nv button').forEach((b,j)=>b.classList.toggle('on',j==ai));document.querySelectorAll('#idx button').forEach((b,j)=>b.classList.toggle('on',j==ai-1))}
$('#idx').style.opacity=cv>.6&&!PK?1:0;$('#scr').style.opacity=sy<60?1:0;
{const nd=document.getElementById('isb-needle'),cl=document.querySelector('#isb-compass small');if(nd)nd.style.transform='rotate('+S.a.toFixed(1)+'deg)';if(cl)cl.textContent=S.a>30?'SE · ISOMETRIC':S.a<6?'N · TOP VIEW':'ROTATING TO N'}
R.render(sc,cam);requestAnimationFrame(tick)}
requestAnimationFrame(tick)
})();
