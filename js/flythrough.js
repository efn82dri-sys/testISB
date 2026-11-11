/* پرواز سینمایی هیرو: یک خانهٔ شیشه‌ای در غروب که با اسکرول از میان آن عبور می‌کنید.
   همه‌چیز رویه‌ای (procedural) و با WebGL خام ساخته می‌شود: هیچ تصویر، ویدیو یا مدل سنگینی دانلود نمی‌شود.
   اگر WebGL نبود یا کاربر «کاهش حرکت» را خواسته بود، به تصویر ثابت (poster) برمی‌گردد.
   تنظیم متن‌ها: data/hero.json — مسیر دوربین: آرایهٔ KEYS پایین همین فایل. */
(function () {
  'use strict';
  var root = document.getElementById('hero');
  if (!root) return;
  var cv = root.querySelector('canvas'), pin = root.querySelector('.hero-pin');
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var gl = null;
  try { gl = cv.getContext('webgl', { alpha: true, antialias: true, premultipliedAlpha: true, powerPreference: 'high-performance' }); } catch (e) {}
  if (!gl || reduce) { root.classList.add('nogl'); return; }

  /* ---------- ریاضی ---------- */
  var M = {
    persp: function (fy, a, n, f) { var t = 1 / Math.tan(fy / 2), r = 1 / (n - f); return [t / a, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) * r, -1, 0, 0, 2 * f * n * r, 0]; },
    look: function (e, c) {
      var z = norm([e[0] - c[0], e[1] - c[1], e[2] - c[2]]), x = norm(cross([0, 1, 0], z)), y = cross(z, x);
      return [x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, e), -dot(y, e), -dot(z, e), 1];
    },
    mul: function (a, b) { var o = new Array(16); for (var i = 0; i < 4; i++) for (var j = 0; j < 4; j++) { var s = 0; for (var k = 0; k < 4; k++) s += a[k * 4 + j] * b[i * 4 + k]; o[i * 4 + j] = s; } return o; }
  };
  function dot(a, b) { return a[0] * b[0] + a[1] * b[1] + a[2] * b[2]; }
  function cross(a, b) { return [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]; }
  function norm(a) { var l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; }
  function sm(a, b, x) { x = Math.min(1, Math.max(0, (x - a) / (b - a))); return x * x * (3 - 2 * x); }
  function lerp(a, b, t) { return a + (b - a) * t; }
  var seed = 7; function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }

  /* ---------- سازندهٔ هندسه ---------- */
  function Builder() { this.v = []; }
  /* هر رأس: x y z | nx ny nz | r g b a | e (نور خودتاب) */
  Builder.prototype.tri = function (a, b, c, n, col, e) {
    var v = this.v; [a, b, c].forEach(function (p) { v.push(p[0], p[1], p[2], n[0], n[1], n[2], col[0], col[1], col[2], col[3] === undefined ? 1 : col[3], e || 0); });
  };
  Builder.prototype.quad = function (a, b, c, d, n, col, e) { this.tri(a, b, c, n, col, e); this.tri(a, c, d, n, col, e); };
  Builder.prototype.box = function (cx, cy, cz, sx, sy, sz, col, o) {
    o = o || {}; var rx = o.rx || 0, ry = o.ry || 0, e = o.e || 0, hx = sx / 2, hy = sy / 2, hz = sz / 2;
    var cX = Math.cos(rx), sX = Math.sin(rx), cY = Math.cos(ry), sY = Math.sin(ry);
    function T(p) { var x = p[0], y = p[1] * cX - p[2] * sX, z = p[1] * sX + p[2] * cX, X = x * cY + z * sY, Z = -x * sY + z * cY; return [cx + X, cy + y, cz + Z]; }
    function N(n) { return T([n[0], n[1], n[2]]).map(function (v, i) { return v - [cx, cy, cz][i]; }); }
    var f = [[[1, 0, 0], [[1, -1, -1], [1, 1, -1], [1, 1, 1], [1, -1, 1]]], [[-1, 0, 0], [[-1, -1, 1], [-1, 1, 1], [-1, 1, -1], [-1, -1, -1]]],
      [[0, 1, 0], [[-1, 1, -1], [-1, 1, 1], [1, 1, 1], [1, 1, -1]]], [[0, -1, 0], [[-1, -1, 1], [-1, -1, -1], [1, -1, -1], [1, -1, 1]]],
      [[0, 0, 1], [[-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]]], [[0, 0, -1], [[1, -1, -1], [-1, -1, -1], [-1, 1, -1], [1, 1, -1]]]];
    var self = this; f.forEach(function (fc) { var n = N(fc[0]), p = fc[1].map(function (q) { return T([q[0] * hx, q[1] * hy, q[2] * hz]); }); self.quad(p[0], p[1], p[2], p[3], n, col, e); });
  };
  Builder.prototype.cone = function (cx, cy, cz, r, h, sides, col) {
    for (var i = 0; i < sides; i++) {
      var a0 = i / sides * 6.2832, a1 = (i + 1) / sides * 6.2832, p0 = [cx + Math.cos(a0) * r, cy, cz + Math.sin(a0) * r], p1 = [cx + Math.cos(a1) * r, cy, cz + Math.sin(a1) * r], top = [cx, cy + h, cz],
        am = (a0 + a1) / 2, n = norm([Math.cos(am) * h, r, Math.sin(am) * h]); this.tri(p0, top, p1, n, col, 0);
    }
  };

  /* ---------- ساخت صحنه ---------- */
  var CONC = [0.72, 0.72, 0.7], DARK = [0.09, 0.1, 0.12], WOOD = [0.5, 0.34, 0.2], WALNUT = [0.3, 0.19, 0.11], WARM = [1, 0.8, 0.5], GLASS = [0.55, 0.78, 0.82];
  var FLOOR = 0.55, CEIL = 4.6;
  function hAt(x, z) {
    var h = Math.sin(x * 0.045) * Math.cos(z * 0.05) * 3 + Math.sin(x * 0.11 + z * 0.07) * 1.2 + Math.sin(z * 0.021) * 6 + Math.max(0, -z - 30) * 0.13 + Math.max(0, Math.abs(x) - 70) * 0.06;
    var dx = Math.max(0, Math.abs(x) - 26), dz = Math.max(0, Math.max(z - 22, -34 - z)), d = Math.hypot(dx, dz), k = Math.min(1, d / 26), s = k * k * (3 - 2 * k);
    return h * s + (-0.62) * (1 - s);
  }
  var opaque = new Builder(), glassList = [];
  (function build() {
    var b = opaque, i, x, z;
    /* زمین */
    var S = 8, R = 288, n = Math.floor(R * 2 / S);
    for (i = 0; i < n; i++) for (var j = 0; j < n; j++) {
      var x0 = -R + i * S, z0 = -R + j * S, p = [[x0, z0], [x0 + S, z0], [x0 + S, z0 + S], [x0, z0 + S]].map(function (q) { return [q[0], hAt(q[0], q[1]), q[1]]; });
      var nn = norm(cross([p[2][0] - p[0][0], p[2][1] - p[0][1], p[2][2] - p[0][2]], [p[1][0] - p[0][0], p[1][1] - p[0][1], p[1][2] - p[0][2]]));
      if (nn[1] < 0) nn = [-nn[0], -nn[1], -nn[2]];
      var hh = (p[0][1] + p[2][1]) / 2, t = Math.min(1, Math.max(0, hh / 40)), nz = (Math.sin(x0 * 0.31) * Math.cos(z0 * 0.27)) * 0.025;
      var c = [lerp(0.2, 0.3, t) + nz, lerp(0.27, 0.32, t) + nz, lerp(0.24, 0.4, t) + nz, 1];
      b.tri(p[0], p[2], p[1], nn, c, 0.28); b.tri(p[0], p[3], p[2], nn, c, 0.28);
    }
    /* رشته‌کوه‌های دور (سیلوئت) */
    for (var L = 0; L < 3; L++) {
      var zz = -330 - L * 110, hmax = 70 + L * 28;
      for (x = -900; x < 900; x += 40) {
        var h0 = hmax * (0.45 + 0.55 * Math.abs(Math.sin(x * 0.0045 + L * 2.1) * Math.cos(x * 0.0021 + L))), h1 = hmax * (0.45 + 0.55 * Math.abs(Math.sin((x + 40) * 0.0045 + L * 2.1) * Math.cos((x + 40) * 0.0021 + L)));
        var cc = [0.08 + L * 0.02, 0.12 + L * 0.025, 0.26 + L * 0.03, 1];
        b.quad([x, -40, zz], [x + 40, -40, zz], [x + 40, h1, zz], [x, h0, zz], [0, 0, 1], cc, 0);
      }
    }
    /* درخت‌ها */
    for (i = 0; i < 110; i++) {
      x = (rnd() - 0.5) * 300; z = -170 + rnd() * 230;
      if (Math.abs(x) < 34 && z > -40 && z < 28) continue;
      var y = hAt(x, z), sc = 0.8 + rnd() * 1.4, g = 0.1 + rnd() * 0.07;
      b.cone(x, y, z, 1.5 * sc, 4.2 * sc, 6, [g * 0.55, g * 1.5, g * 1.25, 1]); b.cone(x, y + 2.4 * sc, z, 1.15 * sc, 3.4 * sc, 6, [g * 0.6, g * 1.7, g * 1.35, 1]);
    }
    /* پلینت و ورودی */
    b.box(0, -0.05, 0, 31, 1.1, 18, [0.55, 0.55, 0.53, 1]);
    b.box(0, 0.5, -14.5, 31, 0.12, 13, WOOD);                       /* دک پشت */
    for (z = 14; z < 140; z += 2.2) b.box(0, -0.58, z, 2.6, 0.06, 1.2, [0.62, 0.6, 0.55, 1]);   /* مسیر ورودی */
    for (z = 16; z < 120; z += 8) [-2.6, 2.6].forEach(function (sx) { b.box(sx, -0.2, z, 0.16, 0.4, 0.16, WARM, { e: 1.3 }); });  /* چراغ‌های کوچک مسیر */
    /* کف، سقف، ستون‌ها */
    b.box(0, FLOOR - 0.02, 0, 28.4, 0.1, 16.2, WOOD);
    b.box(0, CEIL + 0.28, 0, 33, 0.5, 23, [0.82, 0.8, 0.76, 1]);
    [-14, -7, 0, 7, 14].forEach(function (cx) { [8, -8].forEach(function (cz) { b.box(cx, (FLOOR + CEIL) / 2, cz, 0.45, CEIL - FLOOR, 0.45, CONC); }); });
    b.box(-14.3, (FLOOR + CEIL) / 2, 0, 0.5, CEIL - FLOOR, 16.5, CONC);
    b.box(14.3, (FLOOR + CEIL) / 2, 0, 0.5, CEIL - FLOOR, 16.5, CONC); b.box(14.0, 2.7, 0, 0.06, 0.14, 11, WARM, { e: 1.5 });
    /* شیشه‌ها + قاب */
    for (i = 0; i < 4; i++) {
      var cx2 = -10.5 + i * 7;
      [8, -8].forEach(function (cz) {
        glassList.push({ c: [cx2, (FLOOR + CEIL) / 2, cz], s: [6.5, CEIL - FLOOR - 0.06, 0.04], col: [GLASS[0], GLASS[1], GLASS[2], 0.17], e: 0.0 });
        b.box(cx2, FLOOR + 0.05, cz, 6.55, 0.08, 0.1, DARK); b.box(cx2, CEIL - 0.04, cz, 6.55, 0.08, 0.1, DARK);
      });
    }
    /* نورهای سقفی */
    b.box(0, CEIL - 0.04, -3.2, 22, 0.05, 0.28, WARM, { e: 1.4 }); b.box(0, CEIL - 0.04, 3.4, 22, 0.05, 0.28, WARM, { e: 1.4 });
    /* مبلمان */
    b.box(-8, 0.62, 0.6, 7, 0.04, 5, [0.5, 0.46, 0.4, 1]);                                      /* فرش */
    b.box(-8, 1.05, 2.9, 5.2, 0.8, 2.0, [0.1, 0.28, 0.32, 1]); b.box(-8, 1.6, 3.8, 5.2, 0.95, 0.4, [0.12, 0.32, 0.36, 1]);
    b.box(-10.6, 1.35, 2.9, 0.4, 0.6, 2.0, [0.12, 0.3, 0.34, 1]); b.box(-5.4, 1.35, 2.9, 0.4, 0.6, 2.0, [0.12, 0.3, 0.34, 1]);
    b.box(-8, 0.95, 0.2, 2.4, 0.1, 1.3, WALNUT); [[-9, -0.3], [-7, -0.3], [-9, 0.7], [-7, 0.7]].forEach(function (q) { b.box(q[0], 0.78, q[1], 0.08, 0.34, 0.08, DARK); });
    b.box(5.5, 1.38, 3, 4.4, 0.12, 1.8, WALNUT); [[3.5, 2.3], [7.5, 2.3], [3.5, 3.7], [7.5, 3.7]].forEach(function (q) { b.box(q[0], 0.95, q[1], 0.12, 0.8, 0.12, DARK); });
    for (i = 0; i < 4; i++) { var chx = 4.2 + i * 1.15; [1.8, 4.2].forEach(function (cz) { b.box(chx, 0.95, cz, 0.55, 0.1, 0.55, [0.55, 0.4, 0.28, 1]); b.box(chx, 1.3, cz + (cz < 3 ? -0.25 : 0.25), 0.55, 0.6, 0.08, [0.5, 0.36, 0.24, 1]); }); }
    [4.2, 5.5, 6.8].forEach(function (px) { b.box(px, 3.3, 3, 0.5, 0.26, 0.5, WARM, { e: 1.5 }); b.box(px, 3.95, 3, 0.03, 1.3, 0.03, DARK); });   /* آویزها */
    b.box(10, 1.12, -3.8, 4.2, 1.0, 1.7, [0.58, 0.58, 0.56, 1]); b.box(10, 1.66, -3.8, 4.4, 0.08, 1.9, [0.8, 0.8, 0.78, 1]);   /* جزیرهٔ آشپزخانه */
    b.box(12.2, (FLOOR + CEIL) / 2, -5.6, 0.4, CEIL - FLOOR, 4.8, CONC);
    b.box(-13.9, 2.7, -2.2, 0.06, 1.7, 3.6, [0.9, 0.5, 0.28, 1], { e: 0.8 });                    /* تابلو */
    [[-12, -6], [11, 5.8]].forEach(function (q) { b.box(q[0], 0.9, q[1], 0.5, 0.7, 0.5, [0.35, 0.3, 0.27, 1]); b.cone(q[0], 1.2, q[1], 0.7, 1.9, 6, [0.1, 0.3, 0.16, 1]); });
    /* پشت‌بام و پنل‌های خورشیدی */
    for (var r = 0; r < 3; r++) for (var c = 0; c < 8; c++) b.box(-12.6 + c * 3.6, 5.45 + r * 0.38, -6.4 + r * 5.0, 3.2, 0.07, 2.0, [0.04, 0.09, 0.2, 1], { rx: -0.35, e: 0.1 });
    /* دک، استخر، شزلونگ */
    b.box(0, 0.58, -14.5, 14.6, 0.04, 5.6, [0.8, 0.8, 0.76, 1]);
    glassList.push({ c: [0, 0.57, -14.5], s: [14, 0.02, 5], col: [0.08, 0.62, 0.68, 0.88], e: 0.55 });
    [[-10, -9.8], [10, -9.8]].forEach(function (q) { b.box(q[0], 0.9, q[1], 2.4, 0.3, 0.8, [0.78, 0.76, 0.7, 1]); });
    b.box(0, 0.5, -20.2, 31, 0.9, 0.5, [0.55, 0.55, 0.52, 1]);
  })();
  var glassB = new Builder();
  glassList.forEach(function (g) { g.start = glassB.v.length / 11; glassB.box(g.c[0], g.c[1], g.c[2], g.s[0], g.s[1], g.s[2], g.col, { e: g.e }); g.count = glassB.v.length / 11 - g.start; });

  /* ---------- WebGL ---------- */
  var VS = 'attribute vec3 aP,aN;attribute vec4 aC;attribute float aE;uniform mat4 uVP;varying vec3 vN,vW;varying vec4 vC;varying float vE;void main(){vW=aP;vN=aN;vC=aC;vE=aE;gl_Position=uVP*vec4(aP,1.);}';
  var FS = 'precision mediump float;varying vec3 vN,vW;varying vec4 vC;varying float vE;uniform vec3 uCam,uFog,uSunC,uAmb,uLc0,uLc1,uLc2,uLc3;uniform vec4 uLp0,uLp1,uLp2,uLp3;uniform float uFogD,uGlass;' +
    'vec3 pl(vec4 p,vec3 c,vec3 n){vec3 d=p.xyz-vW;float l=length(d);float a=max(1.-l/p.w,0.);a*=a;return c*a*(.35+.65*max(dot(n,d/l),0.));}' +
    'void main(){vec3 n=normalize(vN);vec3 V=normalize(uCam-vW);if(dot(n,V)<0.&&uGlass>.5)n=-n;' +
    'vec3 sun=normalize(vec3(-.55,.28,-.78));float inside=step(abs(vW.x),14.)*step(abs(vW.z),8.)*step(vW.y,4.62)*step(.5,vW.y);' +
    'float dif=max(dot(n,sun),0.)*(1.-.88*inside);vec3 amb=uAmb*(.55+.45*n.y);amb=mix(amb,vec3(.46,.36,.28),inside*.75);' +
    'vec3 L=amb+uSunC*dif+pl(uLp0,uLc0,n)+pl(uLp1,uLc1,n)+pl(uLp2,uLc2,n)+pl(uLp3,uLc3,n);' +
    'vec3 col=vC.rgb*L+vC.rgb*vE*1.6;float al=vC.a;' +
    'if(uGlass>.5){float fr=pow(1.-abs(dot(n,V)),3.);col+=mix(vec3(.9,.55,.38),vec3(.28,.4,.75),clamp(V.y*-1.+.5,0.,1.))*fr*.7;al=min(1.,al+fr*.35);}' +
    'float d=length(vW-uCam);float f=1.-exp(-pow(d*uFogD,2.));col=mix(col,uFog,f*.85);al*=1.-.92*f*(1.-uGlass*.0);gl_FragColor=vec4(col*al,al);}';
  function sh(t, s) { var o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) { console.warn(gl.getShaderInfoLog(o)); return null; } return o; }
  var pr = gl.createProgram(), vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, FS);
  if (!vs || !fs) { root.classList.add('nogl'); return; }
  gl.attachShader(pr, vs); gl.attachShader(pr, fs); gl.linkProgram(pr);
  if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) { root.classList.add('nogl'); return; }
  gl.useProgram(pr);
  function buf(arr) { var b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(arr), gl.STATIC_DRAW); return b; }
  var BO = buf(opaque.v), BG = buf(glassB.v), nO = opaque.v.length / 11;
  var loc = { P: gl.getAttribLocation(pr, 'aP'), N: gl.getAttribLocation(pr, 'aN'), C: gl.getAttribLocation(pr, 'aC'), E: gl.getAttribLocation(pr, 'aE') };
  function bind(b) {
    gl.bindBuffer(gl.ARRAY_BUFFER, b); var st = 44;
    gl.enableVertexAttribArray(loc.P); gl.vertexAttribPointer(loc.P, 3, gl.FLOAT, false, st, 0); gl.enableVertexAttribArray(loc.N); gl.vertexAttribPointer(loc.N, 3, gl.FLOAT, false, st, 12);
    gl.enableVertexAttribArray(loc.C); gl.vertexAttribPointer(loc.C, 4, gl.FLOAT, false, st, 24); gl.enableVertexAttribArray(loc.E); gl.vertexAttribPointer(loc.E, 1, gl.FLOAT, false, st, 40);
  }
  function U(n) { return gl.getUniformLocation(pr, n); }
  var u = { VP: U('uVP'), cam: U('uCam'), fog: U('uFog'), sunC: U('uSunC'), amb: U('uAmb'), fd: U('uFogD'), gl: U('uGlass') };
  var LIGHTS = [[[0, 3.9, 2, 22], [1.2, 0.82, 0.5]], [[-7, 3.4, 0.5, 16], [1.0, 0.66, 0.38]], [[5, 3.2, -3, 16], [1.05, 0.7, 0.42]], [[0, 0.9, -14.5, 11], [0.12, 0.75, 0.85]]];
  LIGHTS.forEach(function (L, i) { gl.uniform4fv(U('uLp' + i), L[0]); gl.uniform3fv(U('uLc' + i), L[1]); });
  gl.uniform3f(u.fog, 0.36, 0.3, 0.42); gl.uniform3f(u.sunC, 1.05, 0.58, 0.34); gl.uniform3f(u.amb, 0.34, 0.38, 0.56); gl.uniform1f(u.fd, 0.0042);
  gl.enable(gl.DEPTH_TEST); gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); gl.clearColor(0, 0, 0, 0);

  /* ---------- مسیر دوربین (t، موقعیت، هدف) ---------- */
  var KEYS = [
    [0.00, [-46, 21, 96], [3, 5, -8]],
    [0.16, [-24, 10, 60], [1.5, 3.6, 0]],
    [0.34, [-1, 2.9, 30], [3.5, 2.9, 0]],
    [0.47, [3.5, 2.55, 13.5], [3.4, 2.75, -8]],
    [0.56, [3.5, 2.5, 4.6], [3.0, 2.7, -10]],
    [0.68, [3.2, 2.5, -2.6], [7, 2.7, -14]],
    [0.78, [4.4, 2.55, -9.6], [8, 2.6, -26]],
    [0.89, [8, 6.6, -19.5], [-2, 5.6, 6]],
    [1.00, [10, 14, -26], [4, 36, -64]]
  ];
  function cr(p0, p1, p2, p3, t) { return 0.5 * ((2 * p1) + (-p0 + p2) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t + (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t); }
  function path(p, idx) {
    p = Math.min(1, Math.max(0, p)); var i = 0; while (i < KEYS.length - 2 && p > KEYS[i + 1][0]) i++;
    var a = KEYS[Math.max(0, i - 1)], b = KEYS[i], c = KEYS[i + 1], d = KEYS[Math.min(KEYS.length - 1, i + 2)], t = (p - b[0]) / (c[0] - b[0]); t = t * t * (3 - 2 * t) * 0.35 + t * 0.65;
    return [0, 1, 2].map(function (k) { return cr(a[idx][k], b[idx][k], c[idx][k], d[idx][k], t); });
  }

  /* ---------- اندازه و رندر ---------- */
  var dpr = 1, W = 0, H = 0, quality = 1;
  function size() {
    var mob = innerWidth < 760; dpr = Math.min(devicePixelRatio || 1, mob ? 1.25 : 1.6) * quality;
    W = Math.max(2, Math.round(pin.clientWidth * dpr)); H = Math.max(2, Math.round(pin.clientHeight * dpr)); cv.width = W; cv.height = H; gl.viewport(0, 0, W, H);
  }
  var cur = 0, tgt = 0, last = 0, vis = true, slow = 0, frames = 0;
  function sortGlass(cp) { glassList.forEach(function (g) { g.d = Math.hypot(g.c[0] - cp[0], g.c[1] - cp[1], g.c[2] - cp[2]); }); return glassList.slice().sort(function (a, b) { return b.d - a.d; }); }
  function render(p) {
    var cp = path(p, 1), ct = path(p, 2), asp = W / H, fy = asp < 1 ? Math.min(1.3, 2 * Math.atan(Math.tan(0.52) / Math.max(asp, 0.5))) : 0.95;
    var VP = M.mul(M.persp(fy, asp, 0.2, 2600), M.look(cp, ct));
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); gl.uniformMatrix4fv(u.VP, false, new Float32Array(VP)); gl.uniform3fv(u.cam, cp);
    gl.uniform1f(u.gl, 0); gl.depthMask(true); bind(BO); gl.drawArrays(gl.TRIANGLES, 0, nO);
    gl.uniform1f(u.gl, 1); gl.depthMask(false); bind(BG); sortGlass(cp).forEach(function (g) { gl.drawArrays(gl.TRIANGLES, g.start, g.count); });
    gl.depthMask(true);
    var f = ct[1] - cp[1], dxz = Math.hypot(ct[0] - cp[0], ct[2] - cp[2]), pitch = Math.atan2(f, dxz), hy = 0.5 + Math.tan(pitch) / Math.tan(fy / 2) * 0.5;   /* ارتفاع افق روی صفحه */
    return { hy: hy, cp: cp };
  }

  /* ---------- متن‌ها و لایه‌ها (از CSS متغیر) ---------- */
  var stages = [].slice.call(root.querySelectorAll('[data-s]')), letters = [].slice.call(root.querySelectorAll('.mark i')), sky = root.querySelector('.sky'), warp = root.querySelector('.warp'), hint = root.querySelector('.hint'), bar = root.querySelector('.bar i'), glow = root.querySelector('.glow');
  function ui(p, hy) {
    stages.forEach(function (el) {
      var a = +el.dataset.s, b = +el.dataset.e, o = sm(a, a + 0.04, p) * (1 - sm(b - 0.04, b, p)), y = (1 - sm(a, a + 0.05, p)) * 34 - sm(b - 0.05, b, p) * 34;
      el.style.setProperty('--o', o.toFixed(3)); el.style.setProperty('--y', y.toFixed(1) + 'px'); el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
    });
    var k = sm(0.02, 0.42, p);
    letters.forEach(function (el, i) { el.style.transform = 'translate3d(' + ((i - 1) * 7 * k).toFixed(2) + 'vw,' + (-(24 + i * 7) * k).toFixed(2) + 'vh,0)'; });
    root.style.setProperty('--markO', (1 - sm(0.3, 0.5, p)).toFixed(3));
    if (sky) sky.style.transform = 'translate3d(0,' + (hy * 100 - 182).toFixed(2) + 'vh,0)';
    if (sky) sky.style.setProperty('--dusk', (1 - sm(0.5, 0.95, p) * 0.0).toFixed(2));
    root.style.setProperty('--end', sm(0.982, 1, p).toFixed(3));
    if (hint) hint.style.opacity = (1 - sm(0.0, 0.05, p)).toFixed(2);
    if (bar) bar.style.transform = 'scaleX(' + p.toFixed(3) + ')';
    if (glow) { glow.style.opacity = (sm(0.9, 0.955, p) * (1 - sm(0.985, 1, p))).toFixed(2); glow.style.transform = 'translate(-50%,-50%) scale(' + (0.35 + sm(0.9, 1, p) * 0.9).toFixed(3) + ')'; }
    if (warp) { var w = sm(0.955, 1.0, p); warp.style.opacity = Math.min(1, w * 3).toFixed(3); warp.style.transform = 'translate(-50%,-50%) scale(' + (w * w * w * 70).toFixed(2) + ')'; }
  }
  function progress() { var r = root.getBoundingClientRect(), tot = root.offsetHeight - innerHeight; return tot > 0 ? Math.min(1, Math.max(0, -r.top / tot)) : 0; }
  function frame(t) {
    var dt = Math.min(0.05, (t - last) / 1000 || 0.016); last = t; tgt = forced !== null ? forced : progress();
    var k = 1 - Math.exp(-dt * 7); cur += (tgt - cur) * k; if (Math.abs(tgt - cur) < 0.00008) cur = tgt;
    var t0 = performance.now(), info = render(cur); ui(cur, info.hy);
    if (!forced && ++frames > 30 && performance.now() - t0 > 26) { if (++slow > 8 && quality > 0.6) { quality -= 0.15; slow = 0; size(); } } else if (performance.now() - t0 < 26) slow = Math.max(0, slow - 1);
    if (vis && (Math.abs(tgt - cur) > 0.00008 || forced === null)) raf = requestAnimationFrame(frame); else running = false;
  }
  var raf = 0, running = false, forced = null;
  function kick() { if (!running) { running = true; last = performance.now(); raf = requestAnimationFrame(frame); } }
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; if (vis) kick(); }, { rootMargin: '10% 0px' }).observe(root);
  addEventListener('scroll', kick, { passive: true }); addEventListener('resize', function () { size(); kick(); });
  size(); root.classList.add('gl-on'); kick();
  /* برای تست و تنظیم: __hero.set(0.4) پیشرفت را ثابت می‌کند */
  window.__hero = { set: function (p) { forced = p; cur = p; kick(); }, release: function () { forced = null; kick(); }, ready: true };
})();
