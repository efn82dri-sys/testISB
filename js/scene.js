/* صحنهٔ سه‌بعدی (three.js): رندرر، نور، متریال‌ها، شش مدل مسیر پایداری، شهرک (جاده، درخت، برج، ماشین، دوچرخه، خط افق). حرکت دوربین در camera.js است. */
(()=>{
let R;try{R=new THREE.WebGLRenderer({canvas:$('#gl'),antialias:true,powerPreference:'high-performance'})}catch(e){return}
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches,mob=innerWidth<760,gl=$('#gl');
R.setPixelRatio(Math.min(devicePixelRatio,mob?1.35:1.75));
R.setClearColor(0x0c2a75);R.toneMapping=THREE.ACESFilmicToneMapping;R.toneMappingExposure=1.12;
R.outputColorSpace=THREE.SRGBColorSpace;
R.shadowMap.enabled=true;R.shadowMap.type=mob?THREE.PCFShadowMap:THREE.PCFSoftShadowMap;
const sc=new THREE.Scene(),cam=new THREE.OrthographicCamera(-1,1,1,-1,-800,1200),C=h=>new THREE.Color(h),U={uAcc:{value:C('#5f8bff')}};
sc.add(new THREE.HemisphereLight(0xcfe0ff,0x0a1a40,1.4));const dl=new THREE.DirectionalLight(0xffffff,2.1);dl.position.set(-30,60,40);dl.castShadow=true;dl.shadow.mapSize.set(mob?512:1024,mob?512:1024);dl.shadow.camera.left=-180;dl.shadow.camera.right=180;dl.shadow.camera.top=180;dl.shadow.camera.bottom=-180;sc.add(dl);
const mt=(c,m=.3,r=.45,e)=>new THREE.MeshStandardMaterial(Object.assign({color:c,metalness:m,roughness:r},e?{emissive:e[0],emissiveIntensity:e[1]}:{}));
const WH=mt(0xeaf0ff,.1,.35),DK=mt(0x0b1538,.5,.5),GR=mt(0x00a54e,.1,.55,[0x00a54e,.3]),BL=mt(0x2f5fd0,.3,.3,[0x2f5fd0,.7]),AQ=mt(0x4f86ff,0,.5,[0x4f86ff,1.6]);
const GL=new THREE.MeshStandardMaterial({color:0x7fb2ff,transparent:true,opacity:.32,metalness:.5,roughness:.12,emissive:0x2f5fd0,emissiveIntensity:.3,depthWrite:false});
const mb=(g,w,h,d,x,y,z,m)=>{const o=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),m);o.position.set(x,y,z);g.add(o);return o};
const mc=(g,r,h,x,y,z,m,r2)=>{const o=new THREE.Mesh(new THREE.CylinderGeometry(r,r2==null?r:r2,h,28),m);o.position.set(x,y,z);g.add(o);return o};
const ms=(g,r,x,y,z,m)=>{const o=new THREE.Mesh(new THREE.SphereGeometry(r,16,12),m);o.position.set(x,y,z);g.add(o);return o};
const TRUNK=mt(0x9b795b,.05,.8),LEAF1=mt(0x1d8b62,.05,.72),LEAF2=mt(0x36a978,.05,.68),LEAF3=mt(0x55b987,.05,.7),LEAF4=mt(0x78c99a,.05,.72),TREE_RING=mt(0x6f9d72,.05,.8);
const tree=(g,x,z,s=1)=>{
  // layered canopy, trunk, and a subtle planted base; shared materials keep draw cost predictable
  mc(g,.105*s,1.25*s,x,.62*s,z,TRUNK);
  ms(g,.58*s,x,1.35*s,z,LEAF1);
  ms(g,.46*s,x-.27*s,1.62*s,z+.12*s,LEAF2);
  ms(g,.43*s,x+.25*s,1.58*s,z-.12*s,LEAF3);
  ms(g,.34*s,x,1.92*s,z,LEAF4);
  const ring=new THREE.Mesh(new THREE.TorusGeometry(.42*s,.035*s,5,20),TREE_RING);
  ring.rotation.x=Math.PI/2;ring.position.set(x,.12,z);g.add(ring);
};
const edges=(g,o,col)=>{const l=new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry),new THREE.LineBasicMaterial({color:col,transparent:true,opacity:.9}));l.position.copy(o.position);g.add(l)};
const anim=[],st=[];
const LW=new THREE.LineBasicMaterial({color:0xcfe0ff,transparent:true,opacity:.28});
const padX=g=>{const tp=[];for(let i=0;i<120;i++){const a=i/120*6.2832,l=i%10==0?.7:.3;tp.push(new THREE.Vector3(Math.cos(a)*11.6,.26,Math.sin(a)*11.6),new THREE.Vector3(Math.cos(a)*(11.6+l),.26,Math.sin(a)*(11.6+l)))}
g.add(new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(tp),LW));const dp=[];for(let i=0;i<=96;i++){const a=i/96*6.2832;dp.push(new THREE.Vector3(Math.cos(a)*9.4,.27,Math.sin(a)*9.4))}
const dr=new THREE.Line(new THREE.BufferGeometry().setFromPoints(dp),new THREE.LineDashedMaterial({color:0x8fa3d6,dashSize:.5,gapSize:.35}));dr.computeLineDistances();g.add(dr);
const gl=new THREE.Mesh(new THREE.PlaneGeometry(46,46),new THREE.ShaderMaterial({uniforms:{uAcc:U.uAcc},transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,vertexShader:'varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'uniform vec3 uAcc;varying vec2 v;void main(){float r=length(v-.5)*2.;gl_FragColor=vec4(uAcc*exp(-r*4.)*.5*step(r,1.),1.);}'}));gl.rotation.x=-Math.PI/2;gl.position.y=.03;g.add(gl)};
const pad=()=>{const g=new THREE.Group();mc(g,11,.5,0,0,0,DK,11.4);const r=new THREE.Mesh(new THREE.TorusGeometry(10.8,.07,8,90),AQ);r.rotation.x=Math.PI/2;r.position.y=.28;g.add(r);padX(g);return g};
/* 0 green building */
(()=>{const g=pad();for(let k=0;k<8;k++){const y=.5+k*1.7,s=k%2?1:-1;mb(g,5,.22,5,0,y,0,WH);mb(g,4.6,1.45,4.6,0,y+.84,0,GL);mb(g,4.4,.3,1.5,0,y+.4,s*3,GR);for(let j=-1;j<2;j++)ms(g,.36,j*1.4,y+.85,s*3,GR)}
mb(g,5.2,.4,5.2,0,14.1,0,GR);const rf=new THREE.Group();rf.position.y=14.3;g.add(rf);tree(rf,-1.3,-1,1.4);tree(rf,1.2,1,1.2);tree(rf,0,1.6,1);
for(let i=0;i<9;i++){const a=i/9*6.283;tree(g,Math.cos(a)*8.4,Math.sin(a)*8.4,.8+(i%3)*.25)}st.push(g)})();
/* 1 energy */
(()=>{const g=pad(),pv=mt(0x16348f,.7,.25,[0x2f5fd0,.4]);for(let r=0;r<2;r++)for(let c=-1;c<2;c++){const p=new THREE.Group();p.position.set(c*3.4,1.7,-1.5+r*3.4);p.rotation.x=-.6;g.add(p);mb(p,3.1,.14,2.3,0,0,0,pv);mb(p,3.3,.1,2.5,0,-.08,0,WH);mc(g,.1,1.4,c*3.4,1,-1.1+r*3.4,WH)}
mc(g,.2,14,-6.5,7.2,-5,WH,.35);mb(g,.7,.6,1.4,-6.5,14.3,-5,WH);const bl=new THREE.Group();bl.position.set(-6.5,14.3,-4.1);g.add(bl);
for(let i=0;i<3;i++){const q=new THREE.Group();q.rotation.z=i*2.094;bl.add(q);mb(q,.34,6,.1,0,3,0,WH)}
[0xdce4f5,0x8fa3d6,0x2f5fd0,0x00a54e].forEach((c,i)=>mb(g,1.1,1.5+i*1.5,1.1,2+i*1.5,(1.5+i*1.5)/2+.25,6,mt(c,.2,.4,[c,.35])));
anim.push(tm=>{bl.rotation.z=tm*1.3});st.push(g)})();
/* 2 water */
(()=>{const g=pad();mb(g,6,4,5,-3.5,2.3,-2.5,WH);mb(g,5.6,3,.1,-3.5,2.4,0,GL);mb(g,6.6,.3,5.6,-3.5,4.5,-2.5,GR);mc(g,1.8,5,4,2.8,-3.5,GL);const wt=mc(g,1.6,4.6,4,2.6,-3.5,BL);
g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([new THREE.Vector3(-1,4.5,-4),new THREE.Vector3(1,5.6,-4),new THREE.Vector3(3,4.6,-3.8),new THREE.Vector3(4,5.2,-3.5)]),20,.12,8),AQ));
const N2=140,pa=new Float32Array(N2*3);for(let i=0;i<N2;i++){pa[i*3]=-6+Math.random()*5;pa[i*3+1]=4.7+Math.random()*5;pa[i*3+2]=-5+Math.random()*5}
const pg2=new THREE.BufferGeometry();pg2.setAttribute('position',new THREE.BufferAttribute(pa,3));g.add(new THREE.Points(pg2,new THREE.PointsMaterial({color:0x9fd8ff,size:.22,transparent:true,depthWrite:false})));
mc(g,4,.2,2,.4,5.5,BL);const rp=[];for(let i=0;i<3;i++){const r=new THREE.Mesh(new THREE.TorusGeometry(1,.04,6,40),AQ);r.rotation.x=Math.PI/2;r.position.set(2,.6,5.5);g.add(r);rp.push(r)}
tree(g,-1.5,6.5,1.2);tree(g,5.5,7,1);tree(g,-4,7.5,.9);const gw=new THREE.Group();gw.position.set(-6,1.8,5);gw.rotation.x=.4;g.add(gw);gw.add(new THREE.Mesh(new THREE.TorusGeometry(1.7,.09,8,40),GR));ms(gw,.28,1.7,0,0,WH);
anim.push(tm=>{const p=pg2.attributes.position;for(let i=0;i<N2;i++){let y=p.getY(i)-.1-(i%3)*.02;if(y<4.7)y=9.7;p.setY(i,y)}p.needsUpdate=true;const s=.65+.3*Math.sin(tm*.5);wt.scale.y=s;wt.position.y=.5+2.3*s;rp.forEach((r,i)=>r.scale.setScalar(.4+((tm*.4+i/3)%1)*3));gw.rotation.y=tm});st.push(g)})();
/* 3 materials */
(()=>{const g=pad(),ls=[];mb(g,13,.3,5.2,0,.45,0,DK);[0xe9c46a,0xeaf0ff,0x4f86ff,0x00a54e,0x9aa8c8].forEach((c,i)=>{const q=new THREE.Group();q.position.set(-5.2+i*2.6,4.1,0);g.add(q);const o=mb(q,2,7,5,0,0,0,mt(c,.1,.6,[c,.12]));edges(q,o,0xdce4f5);ls.push(q)});
anim.push(tm=>ls.forEach((q,i)=>{q.position.y=4.1+Math.sin(tm*.9+i*1.1)*.5}));st.push(g)})();
/* 4 BIM */
(()=>{const g=pad(),wm=new THREE.MeshStandardMaterial({color:0x2f5fd0,transparent:true,opacity:.16,emissive:0x2f5fd0,emissiveIntensity:.4,depthWrite:false});
[[6,3,6,0],[5,3,5,3],[4,3,4,6],[3,3,3,9]].forEach(a=>{const o=mb(g,a[0],a[1],a[2],0,.5+a[3]+a[1]/2,0,wm);edges(g,o,0x9fc0ff)});const sp2=mb(g,7,.06,7,0,.5,0,AQ),nd=[];
for(let i=0;i<9;i++){const a=i/9*6.283,r=7.5+(i%3),n=ms(g,.3,Math.cos(a)*r,3+(i%4)*2.5,Math.sin(a)*r,i%2?GR:WH);nd.push(n);g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints([n.position.clone(),new THREE.Vector3(0,n.position.y,0)]),new THREE.LineBasicMaterial({color:0x6f93ff,transparent:true,opacity:.6})))}
const cr=new THREE.Group();cr.position.set(7,0,-5);g.add(cr);mc(cr,.18,16,0,8.3,0,WH);const bm=new THREE.Group();bm.position.y=16.5;cr.add(bm);mb(bm,11,.3,.3,-3,0,0,WH);mb(bm,.5,.5,.5,2.6,0,0,GR);mc(bm,.03,5,-6,-2.5,0,AQ);
anim.push(tm=>{sp2.position.y=.6+((tm*.18)%1)*12.5;bm.rotation.y=Math.sin(tm*.3)*.8;nd.forEach((n,i)=>n.scale.setScalar(1+.35*Math.sin(tm*2+i)))});st.push(g)})();
/* 5 waste */
(()=>{const g=pad(),cols=[0x2f5fd0,0x00a54e,0xeaf0ff,0x223981],bx2=[];cols.forEach((c,i)=>{const x=-4.5+i*3;mb(g,2.3,2.8,2.4,x,1.7,2.5,mt(c,.2,.5,[c,.15]));mb(g,2.5,.3,2.6,x,3.25,2.5,mt(c,.3,.4));bx2.push(x)});
const cb=[];for(let i=0;i<12;i++)cb.push(mb(g,.55,.55,.55,0,0,0,mt(cols[i%4],.2,.5,[cols[i%4],.4])));
const arc=new THREE.Group();arc.position.y=8;g.add(arc);for(let i=0;i<3;i++){const q=new THREE.Group();q.rotation.y=i*2.094;arc.add(q);const t1=new THREE.Mesh(new THREE.TorusGeometry(2.4,.14,8,40,1.7),GR);t1.rotation.x=Math.PI/2;q.add(t1);const c=new THREE.Mesh(new THREE.ConeGeometry(.4,.8,12),GR);c.position.set(-.3,0,2.38);c.rotation.z=Math.PI/2;q.add(c)}
anim.push(tm=>{arc.rotation.y=tm*.6;cb.forEach((c,i)=>{const k=(tm*.25+i/12)%1,x0=-9,b=bx2[i%4];c.position.set(x0+(b-x0)*k,9+(3.6-9)*k+Math.sin(k*Math.PI)*3,-2+4.5*k);c.rotation.set(k*6,k*4,0);c.scale.setScalar(k>.92?Math.max(.05,1-(k-.92)*12):1)})});st.push(g)})();

/* ===== ISB realistic district (instanced, PBR, shadows, textured facades) ===== */
const safe=(n,f)=>{try{f()}catch(e){if(window.__DBG)throw e;console.warn('ISB '+n,e)}};
const world=new THREE.Group();sc.add(world);
const rnd=(s,n)=>{const v=Math.sin(s*91.7+n*17.3)*43758.5;return v-Math.floor(v)};
const cvs=(w,h)=>{const c=document.createElement('canvas');c.width=w;c.height=h;return c};
const ctex=(c,rep)=>{const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=4;if(rep)t.wrapS=t.wrapT=THREE.RepeatWrapping;return t};
const mat=(c,m,r,x)=>new THREE.MeshStandardMaterial(Object.assign({color:c,metalness:m,roughness:r},x||{}));
const scaleUV=(g,f,u,v)=>{const a=g.attributes.uv;for(let i=f*4;i<f*4+4;i++)a.setXY(i,a.getX(i)*u,a.getY(i)*v);a.needsUpdate=true};
const radial=()=>{const c=cvs(64,64),g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,1)');r.addColorStop(.35,'rgba(255,255,255,.35)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return ctex(c)};
/* light rig: warm sun + cool rim + sky fill + image based reflections + haze */
sc.children.forEach(o=>{if(o.isHemisphereLight){o.intensity=.6;o.color.set(0x9db8ff);o.groundColor.set(0x0b1d4d)}});
dl.color.set(0xffe5c2);dl.intensity=2.7;dl.position.set(-70,90,50);dl.target.position.set(0,0,14);sc.add(dl.target);
dl.shadow.mapSize.set(mob?1024:2048,mob?1024:2048);Object.assign(dl.shadow.camera,{left:-135,right:135,top:135,bottom:-135,near:10,far:400});dl.shadow.camera.updateProjectionMatrix();dl.shadow.bias=-.0005;dl.shadow.normalBias=.05;
const rim=new THREE.DirectionalLight(0x6f9cff,.9);rim.position.set(60,40,-70);sc.add(rim);
sc.fog=new THREE.Fog(0x0c2a75,430,640);
safe('env',()=>{const pm=new THREE.PMREMGenerator(R),es=new THREE.Scene();
es.add(new THREE.Mesh(new THREE.SphereGeometry(50,32,16),new THREE.ShaderMaterial({side:THREE.BackSide,vertexShader:'varying vec3 p;void main(){p=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',fragmentShader:'varying vec3 p;void main(){vec3 n=normalize(p);float h=n.y;vec3 c=mix(vec3(.03,.07,.2),vec3(.32,.52,.95),smoothstep(-.1,.8,h));c+=vec3(1.,.72,.42)*pow(max(0.,dot(n,normalize(vec3(-.5,.4,.6)))),20.)*3.;gl_FragColor=vec4(c,1.);}'})));
sc.environment=pm.fromScene(es,.04).texture;pm.dispose()});
/* textures: glazed facade atlas (albedo + warm lit windows), road, pavers */
let FT=null,FE=null,ROADT=null,PAVET=null;
safe('facade',()=>{const N=8,S=512,q=S/N,c=cvs(S,S),e=cvs(S,S),g=c.getContext('2d'),h=e.getContext('2d');h.fillStyle='#000';h.fillRect(0,0,S,S);
for(let i=0;i<N;i++)for(let j=0;j<N;j++){const x=i*q,y=j*q,r=Math.sin(i*12.9+j*78.2)*43758.5,rr=r-Math.floor(r);g.fillStyle='#dfe8f7';g.fillRect(x,y,q,q);
const gr=g.createLinearGradient(x,y,x+q,y+q);gr.addColorStop(0,rr>.5?'#7bb0ec':'#4f8cd4');gr.addColorStop(1,'#1c3f86');g.fillStyle=gr;g.fillRect(x+q*.1,y+q*.14,q*.8,q*.66);
g.fillStyle='rgba(255,255,255,.26)';g.beginPath();g.moveTo(x+q*.1,y+q*.14);g.lineTo(x+q*.52,y+q*.14);g.lineTo(x+q*.1,y+q*.58);g.fill();
if(rr>.62){const lg=h.createLinearGradient(x,y,x,y+q);lg.addColorStop(0,'#ffe2a8');lg.addColorStop(1,'#ff9f45');h.fillStyle=lg;h.fillRect(x+q*.1,y+q*.14,q*.8,q*.66)}}
FT=ctex(c,true);FE=ctex(e,true)});
safe('ground tex',()=>{const c=cvs(256,64),g=c.getContext('2d');g.fillStyle='#27324d';g.fillRect(0,0,256,64);for(let i=0;i<900;i++){g.fillStyle='rgba('+(i%2?'255,255,255':'0,0,0')+','+Math.random()*.05+')';g.fillRect(Math.random()*256,Math.random()*64,2,2)}
g.fillStyle='#d9e2f2';g.fillRect(0,3,256,2);g.fillRect(0,59,256,2);g.fillStyle='#f4c65e';for(let x=0;x<256;x+=64)g.fillRect(x+8,30,34,3);ROADT=ctex(c,true);
const p=cvs(128,128),k=p.getContext('2d');k.fillStyle='#b4c0d3';k.fillRect(0,0,128,128);k.strokeStyle='#8e9db6';k.lineWidth=2;for(let i=0;i<=128;i+=32){k.beginPath();k.moveTo(i,0);k.lineTo(i,128);k.moveTo(0,i);k.lineTo(128,i);k.stroke()}
for(let i=0;i<500;i++){k.fillStyle='rgba(0,0,0,.04)';k.fillRect(Math.random()*128,Math.random()*128,3,3)}PAVET=ctex(p,true)});
const WM=[0xffffff,0xd8e6ff,0xbfe3d6,0xe6d9c4].map(t=>FT?mat(t,.55,.28,{map:FT,emissive:0xffffff,emissiveMap:FE,emissiveIntensity:.9,envMapIntensity:1.2}):mat(t,.4,.4));
const ROOF=mat(0xcfd9ea,.2,.6),PVM=mat(0x1a3d8c,.7,.22,{emissive:0x2f6bd0,emissiveIntensity:.3}),METAL=mat(0xb7c4d9,.8,.3),LAWN=mat(0x2f8a58,0,.95),CURB=mat(0xcbd5e5,.05,.7),LINE=mat(0xe8eef8,0,.8),
PLATE=mat(0xffffff,.05,.85,PAVET?{map:PAVET}:{color:0xb4c0d3}),ROADM=mat(0xffffff,.1,.85,ROADT?{map:ROADT}:{color:0x27324d}),TRUNKM=mat(0x8a6a4e,.05,.85);
const BY=.62;
/* ground: blueprint grid + soft shadow catcher */
const fl=new THREE.Mesh(new THREE.PlaneGeometry(900,900),new THREE.ShaderMaterial({vertexShader:'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',fragmentShader:'varying vec3 vW;float ln(float v,float w){float d=abs(fract(v-.5)-.5);return 1.-smoothstep(0.,w,d);}void main(){vec2 p=vW.xz;float mn=max(ln(p.x/2.,.04),ln(p.y/2.,.04)),mj=max(ln(p.x/10.,.015),ln(p.y/10.,.015));gl_FragColor=vec4(vec3(.04,.14,.4)+vec3(.55,.7,1.)*(mn*.04+mj*.1),1.);}'}));fl.rotation.x=-Math.PI/2;fl.position.y=-.02;fl.userData.ns=1;world.add(fl);
const shp=new THREE.Mesh(new THREE.PlaneGeometry(900,900),new THREE.ShadowMaterial({opacity:.38}));shp.rotation.x=-Math.PI/2;shp.position.y=.005;shp.userData.ns=1;world.add(shp);
function dash(cx,cz,w,d,col){const p=[[-w/2,-d/2],[w/2,-d/2],[w/2,d/2],[-w/2,d/2],[-w/2,-d/2]].map(a=>new THREE.Vector3(cx+a[0],.7,cz+a[1])),l=new THREE.Line(new THREE.BufferGeometry().setFromPoints(p),new THREE.LineDashedMaterial({color:col,dashSize:1.4,gapSize:.9}));l.computeLineDistances();world.add(l)}
/* parcels, curbs, roads, sidewalks, crossings */
PC.forEach((c,i)=>{const w=i?40:68,d=i?26:14,g=new THREE.BoxGeometry(w,.5,d);scaleUV(g,2,w/8,d/8);const m=new THREE.Mesh(g,PLATE);m.position.set(c[0],.25,c[1]);world.add(m);
[-d/2,d/2].forEach(o=>mb(world,w+.4,.62,.4,c[0],.31,c[1]+o,CURB));[-w/2,w/2].forEach(o=>mb(world,.4,.62,d,c[0]+o,.31,c[1],CURB));dash(c[0],c[1],w+4,d+4,i%2?0xf2c14e:0xff8fa3)});
const HR=[-22,11,41],road=(x,z,len,v)=>{const g=new THREE.PlaneGeometry(len,4.4),a=g.attributes.uv;for(let i=0;i<a.count;i++)a.setX(i,a.getX(i)*len/16);const m=new THREE.Mesh(g,ROADM);m.rotation.set(-Math.PI/2,0,v?Math.PI/2:0);m.position.set(x,v?.105:.1,z);m.userData.ns=1;world.add(m)};
HR.forEach(z=>{road(0,z,104,0);[-2.9,2.9].forEach(o=>mb(world,104,.14,1.2,0,.07,z+o*1.0,CURB));[-1,1].forEach(sx=>{for(let k=0;k<7;k++)mb(world,1.5,.02,.3,sx*6.2,.115,z-2.1+k*.7,LINE)})});
road(0,26,88,1);[-2.9,2.9].forEach(o=>mb(world,1.2,.14,88,o,.07,26,CURB));
HR.forEach(z=>{for(let k=0;k<7;k++)mb(world,.3,.02,1.5,-1.9+k*.63,.12,z+3.4,LINE)});
/* instanced vegetation */
const TR=[],addTree=(x,z,s,y)=>TR.push([x,z,s||1,y==null?.5:y]);
function flushTrees(){const n=TR.length;if(!n)return;const geo=new THREE.IcosahedronGeometry(1,1),cols=[0x1f7a52,0x2f9a62,0x4aae74,0x1b6a4d],tr=new THREE.InstancedMesh(new THREE.CylinderGeometry(.08,.12,1.3,6),TRUNKM,n),fo=[0,1,2].map(()=>new THREE.InstancedMesh(geo,mat(0xffffff,0,.8),n)),d=new THREE.Object3D(),c=new THREE.Color();
TR.forEach((t,i)=>{const x=t[0],z=t[1],s=t[2],y=t[3],k=.85+rnd(i,3)*.4;d.rotation.set(0,0,0);d.scale.set(s,s,s);d.position.set(x,y+.65*s,z);d.updateMatrix();tr.setMatrixAt(i,d.matrix);
[[0,1.55,0,.62],[.32,1.95,.12,.46],[-.28,1.9,-.15,.42]].forEach((o,j)=>{d.position.set(x+o[0]*s,y+o[1]*s,z+o[2]*s);d.scale.setScalar(o[3]*s*k*1.25);d.updateMatrix();fo[j].setMatrixAt(i,d.matrix);fo[j].setColorAt(i,c.setHex(cols[(i+j)%4]))})});
[tr].concat(fo).forEach(m=>{m.castShadow=true;m.receiveShadow=true;m.frustumCulled=false;world.add(m)})}
/* architecture: textured curtain-wall towers with setbacks, plant rooms, PV and green roofs */
function fbox(w,h,d,ti){const g=new THREE.BoxGeometry(w,h,d),nx=Math.max(1,Math.round(w/1.6)),nz=Math.max(1,Math.round(d/1.6)),ny=Math.max(1,Math.round(h/1.5));
scaleUV(g,0,nz/8,ny/8);scaleUV(g,1,nz/8,ny/8);scaleUV(g,4,nx/8,ny/8);scaleUV(g,5,nx/8,ny/8);scaleUV(g,2,nx/8,nz/8);scaleUV(g,3,nx/8,nz/8);return new THREE.Mesh(g,WM[ti%4])}
function tower(x,z,w,d,h,th,seed){let y=BY,cw=w,cd=d,ch=h>5?h*.62:h;const tiers=h>5?2:1;
for(let t=0;t<tiers;t++){const b=fbox(cw,ch,cd,seed+t);b.position.set(x,y+ch/2,z);world.add(b);mb(world,cw*1.05,.16,cd*1.05,x,y+ch+.08,z,ROOF);y+=ch+.16;cw*=.72;cd*=.72;ch=h*.38}
if(th.k=='green'){mb(world,cw*1.3,.12,cd*1.3,x,y+.06,z,LAWN);addTree(x,z,.4,y+.1);addTree(x+cw*.4,z+cd*.3,.32,y+.1)}
else if(th.k=='hvac'||th.k=='tower'){mb(world,cw*.5,.5,cd*.4,x-cw*.2,y+.25,z,METAL);mb(world,.5,.9,.5,x+cw*.25,y+.45,z+cd*.2,METAL);if(th.k=='tower')mc(world,.05,2.6,x,y+1.3,z,METAL)}
else{for(let r=0;r<2;r++){const p=mb(world,cw*.7,.05,cd*.32,x,y+.2,z-cd*.2+r*cd*.4,PVM);p.rotation.x=-.35}}}
const TH=[0,{h:4.6,n:3,k:'glass'},0,{h:3,n:3,k:'green'},{h:8,n:2,k:'hvac'},{h:3,n:2,k:'pav'},{h:4.2,n:2,k:'tower'}];
function site(it,i){const th=TH[it.s],s=i+1,x=it.x,z=it.z,w=it.w,h=it.h;mb(world,w*.96,.1,h*.96,x,.55,z,CURB);mb(world,w*.9,.06,h*.9,x,.58,z,LAWN);mb(world,w*.9,.03,1.1,x,.62,z,CURB);
for(let k=0;k<th.n;k++){const bw=w*(.22+rnd(s,k+2)*.18),bd=h*(.22+rnd(s,k+9)*.18),px=x+(rnd(s,k+4)-.5)*(w*.62-bw),pz=z+(rnd(s,k+7)-.5)*(h*.62-bd),bh=th.h*(.55+rnd(s,k+3)*.8);tower(px,pz,bw,bd,bh,th,s+k)}
for(let k=0;k<8;k++){const a=k*Math.PI/4+s;addTree(x+Math.cos(a)*w*.42,z+Math.sin(a)*h*.42,.5+(k%3)*.12,.6)}}
ITEMS.forEach((it,i)=>{if(!it.k)return;
if(it.s==0){const g=st[+it.k.split(':')[1]];mb(world,it.w,.1,it.h,it.x,.55,it.z,CURB);g.scale.setScalar(.42);g.position.set(it.x,.72,it.z);world.add(g);return}
if(it.s==2){const p=D.projects.find(x=>'proj:'+x.slug==it.k),tx=new THREE.TextureLoader().load(IM[p.coverImage]);tx.colorSpace=THREE.SRGBColorSpace;mb(world,it.w-.3,.05,it.h-.3,it.x,.52,it.z,AQ);mb(world,it.w-.5,.4,it.h-.5,it.x,.75,it.z,DK);const m=new THREE.Mesh(new THREE.PlaneGeometry(it.w-1,it.h-1),new THREE.MeshBasicMaterial({map:tx,toneMapped:false,fog:false}));m.rotation.x=-Math.PI/2;m.position.set(it.x,.96,it.z);m.userData.ns=1;world.add(m);return}
safe('site',()=>site(it,i))});
safe('trees',flushTrees);
/* street life: lamps with light pools, moving traffic, distant skyline */
safe('lamps',()=>{
/* تنظیم نور چراغ‌های خیابان: برای کم/زیاد کردن نور فقط همین اعداد را عوض کن.
   glowSize: قطر هالهٔ چراغ در دنیای سه‌بعدی (هرچه بیشتر، هاله بزرگ‌تر)
   minPx / maxPx: کمترین و بیشترین اندازهٔ هاله روی صفحه (پیکسل)
   glowOpacity: شدت هاله هنگام زوم؛ farFade: چقدر هاله در نمای دور کم‌رنگ شود (۰ تا ۱)
   poolOpacity: شدت لکهٔ نور روی زمین */
const LAMP={glowSize:2.6,minPx:4,maxPx:40,glowOpacity:.85,farFade:.45,poolOpacity:.26};
const soft=()=>{const c=cvs(64,64),g=c.getContext('2d'),r=g.createRadialGradient(32,32,0,32,32,32);r.addColorStop(0,'rgba(255,255,255,.7)');r.addColorStop(.12,'rgba(255,255,255,.42)');r.addColorStop(.4,'rgba(255,255,255,.1)');r.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=r;g.fillRect(0,0,64,64);return ctex(c)};
const P=[];HR.forEach(z=>{for(let x=-48;x<=48;x+=8)P.push([x,z-3.1],[x+4,z+3.1])});for(let z=-16;z<=68;z+=8)P.push([-3.1,z],[3.1,z+4]);
const n=P.length,rt=radial(),pole=new THREE.InstancedMesh(new THREE.CylinderGeometry(.06,.08,3.2,6),METAL,n),head=new THREE.InstancedMesh(new THREE.BoxGeometry(.7,.08,.22),METAL,n),
pools=new THREE.InstancedMesh(new THREE.CircleGeometry(3.4,24),new THREE.MeshBasicMaterial({map:rt,color:0xffb868,transparent:true,opacity:LAMP.poolOpacity,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}),n),gp=new Float32Array(n*3),d=new THREE.Object3D();
P.forEach((p,i)=>{d.rotation.set(0,0,0);d.position.set(p[0],1.7,p[1]);d.updateMatrix();pole.setMatrixAt(i,d.matrix);d.position.set(p[0],3.3,p[1]);d.updateMatrix();head.setMatrixAt(i,d.matrix);d.rotation.set(-Math.PI/2,0,0);d.position.set(p[0],.16,p[1]);d.updateMatrix();pools.setMatrixAt(i,d.matrix);gp[i*3]=p[0];gp[i*3+1]=3.25;gp[i*3+2]=p[1]});
[pole,head,pools].forEach(m=>{m.frustumCulled=false;world.add(m)});pools.userData.ns=1;
const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.BufferAttribute(gp,3));const gl2=new THREE.Points(gg,new THREE.PointsMaterial({map:soft(),color:0xffc878,size:14,sizeAttenuation:false,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,fog:false}));gl2.frustumCulled=false;gl2.userData.ns=1;
/* اندازه و شدت هاله با زوم دوربین تنظیم می‌شود: در نمای دور ریز و کم‌رنگ، هنگام زوم بزرگ‌تر */
gl2.onBeforeRender=(r,sc2,c)=>{const h=Math.max(1,c.top-c.bottom),t=Math.min(1,Math.max(0,(h-40)/150));gl2.material.size=Math.min(LAMP.maxPx,Math.max(LAMP.minPx,LAMP.glowSize*innerHeight/h));gl2.material.opacity=LAMP.glowOpacity*(1-LAMP.farFade*t)};
world.add(gl2)});
safe('traffic',()=>{
const N=mob?20:40,NB=mob?12:26,M=new THREE.Matrix4(),Lm=new THREE.Matrix4(),T=new THREE.Matrix4(),cc=new THREE.Color();
const bs=new THREE.Shape();bs.moveTo(-1,.1);bs.lineTo(-1,.3);bs.quadraticCurveTo(-1,.4,-.85,.42);bs.lineTo(.55,.4);bs.quadraticCurveTo(.9,.38,1,.26);bs.lineTo(1,.1);bs.lineTo(-1,.1);
const gs=new THREE.Shape();gs.moveTo(-.62,.4);gs.quadraticCurveTo(-.45,.66,-.1,.68);gs.lineTo(.12,.67);gs.quadraticCurveTo(.4,.6,.52,.4);gs.lineTo(-.62,.4);
const ex=(s,w,b)=>{const g=new THREE.ExtrudeGeometry(s,{depth:w,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:2,curveSegments:8});g.translate(0,0,-w/2);return g};
/* Tesla-style sedans: fastback body + panoramic glass roof, aero wheels, full-width light bars */
const body=new THREE.InstancedMesh(ex(bs,.8,.035),new THREE.MeshPhysicalMaterial({color:0xffffff,metalness:.55,roughness:.2,clearcoat:1,clearcoatRoughness:.08}),N),
glass=new THREE.InstancedMesh(ex(gs,.72,.02),mat(0x0b1220,.9,.06),N),
wheel=new THREE.InstancedMesh(new THREE.CylinderGeometry(.18,.18,.13,14).rotateX(Math.PI/2),mat(0x111418,.3,.7),N*4),
head=new THREE.InstancedMesh(new THREE.BoxGeometry(.04,.05,.62),new THREE.MeshBasicMaterial({color:0xfff6dc}),N),
tail=new THREE.InstancedMesh(new THREE.BoxGeometry(.04,.055,.78),new THREE.MeshBasicMaterial({color:0xff3b30}),N);
const pal=[0xf2f4f8,0x5a6272,0x1b3a8a,0xc4161c,0x101216],cars=[];
for(let i=0;i<N;i++){const v=i%5==0,len=v?88:104;cars.push({v,len,dir:i%2?1:-1,z0:v?0:HR[i%3],p0:rnd(i,5)*len,spd:3.5+rnd(i,6)*3.5});body.setColorAt(i,cc.setHex(pal[i%5]))}
/* cyclists on the road-edge lanes */
const bw=new THREE.InstancedMesh(new THREE.TorusGeometry(.17,.016,6,18),mat(0x1a2236,.3,.6),NB*2),bsp=new THREE.InstancedMesh(new THREE.BoxGeometry(.32,.01,.01),mat(0xcfd9ea,.6,.4),NB*2),
bfr=new THREE.InstancedMesh(new THREE.BoxGeometry(.62,.03,.03),mat(0x2f5fd0,.5,.4),NB),brd=new THREE.InstancedMesh(new THREE.CylinderGeometry(.07,.09,.36,8),mat(0xffffff,0,.7),NB),bhd=new THREE.InstancedMesh(new THREE.SphereGeometry(.08,10,8),mat(0xf2c14e,0,.5),NB),
tc=[0xf2c14e,0x2f5fd0,0x00a54e,0xff8fa3,0xffffff],bikes=[];
for(let i=0;i<NB;i++){const v=i%4==0,len=v?88:104;bikes.push({v,len,dir:i%2?1:-1,z0:v?0:HR[i%3],p0:rnd(i,11)*len,spd:1.8+rnd(i,12)*1.2});brd.setColorAt(i,cc.setHex(tc[i%5]));bhd.setColorAt(i,cc.setHex(tc[(i+2)%5]))}
const all=[body,glass,wheel,head,tail,bw,bsp,bfr,brd,bhd];all.forEach(m=>{m.frustumCulled=false;m.castShadow=true;world.add(m)});
const place=(c,gap)=>{const p=(((c.p0+TM*c.spd)%c.len)+c.len)%c.len,t=c.dir>0?p:c.len-p,l=c.dir>0?gap:-gap;let x,z,r;if(c.v){x=-l;z=-18+t;r=c.dir>0?-Math.PI/2:Math.PI/2}else{x=-52+t;z=c.z0+l;r=c.dir>0?0:Math.PI}M.makeRotationY(r);return[x,z]};
let TM=0;const loc=(m,idx,x,y,z)=>{Lm.makeTranslation(x,y,z);T.multiplyMatrices(M,Lm);m.setMatrixAt(idx,T)};
anim.push(tm=>{TM=tm;
cars.forEach((c,i)=>{const q=place(c,.9);M.setPosition(q[0],.1,q[1]);body.setMatrixAt(i,M);glass.setMatrixAt(i,M);loc(head,i,.99,.32,0);loc(tail,i,-1.01,.36,0);for(let k=0;k<4;k++)loc(wheel,i*4+k,k&1?.62:-.62,.18,k&2?.4:-.4)});
bikes.forEach((c,i)=>{const q=place(c,2.6),a=-(tm*c.spd)/.17;M.setPosition(q[0],.14,q[1]);
for(let k=0;k<2;k++){Lm.makeRotationZ(a);Lm.setPosition(k?.34:-.34,.17,0);T.multiplyMatrices(M,Lm);bw.setMatrixAt(i*2+k,T);bsp.setMatrixAt(i*2+k,T)}
loc(bfr,i,0,.3,0);loc(brd,i,-.05,.62,0);loc(bhd,i,0,.92,0)});
all.forEach(m=>m.instanceMatrix.needsUpdate=true)})});
safe('skyline',()=>{const n=mob?140:300,m=mat(0x8fb2e8,.4,.5,FT?{map:FT,emissive:0xffffff,emissiveMap:FE,emissiveIntensity:.7}:{}),I=new THREE.InstancedMesh(new THREE.BoxGeometry(1,1,1),m,n),d=new THREE.Object3D(),c=new THREE.Color();let k=0;
for(let t=0;k<n&&t<n*8;t++){const x=(rnd(t,1)-.5)*360,z=-130+rnd(t,2)*300;if(Math.abs(x)<60&&z>-56&&z<78)continue;const w=3+rnd(t,3)*7,dd=3+rnd(t,4)*7,h=3+Math.pow(rnd(t,5),2)*26;d.position.set(x,h/2,z);d.scale.set(w,h,dd);d.updateMatrix();I.setMatrixAt(k,d.matrix);I.setColorAt(k++,c.setHSL(.6,.35,.2+rnd(t,6)*.18))}
I.count=k;I.castShadow=true;I.receiveShadow=true;I.frustumCulled=false;world.add(I)});
/* blueprint outlines only on the six journey models, then shadow flags */
st.forEach(g=>{const a=[];g.traverse(o=>{if(o.isMesh&&o.geometry.type=='BoxGeometry')a.push(o)});a.forEach(o=>o.add(new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry,25),LW)))});
world.traverse(o=>{if(o.isMesh&&!o.userData.ns){o.castShadow=true;o.receiveShadow=true}else if(o.isMesh){o.castShadow=false;o.receiveShadow=true}});
/* موارد زیر برای camera.js در دسترس قرار می‌گیرد */
window.ISB_3D={R,sc,cam,reduce,gl,anim};
})();
