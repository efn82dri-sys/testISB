/* منطق پنل مدیریت: ورود، نمایش فهرست هر مجموعه (admin/schemas.json)، فرم افزودن/ویرایش، آپلود عکس، جابه‌جایی، حذف و ذخیره در data/*.json.
   برای اضافه کردن یک مجموعهٔ جدید فقط schemas.json را ویرایش کنید؛ نیازی به تغییر این فایل نیست. */
(function () {
  'use strict';
  var API = 'api.php';
  var $ = function (s) { return document.querySelector(s); };
  var csrf = '', schemas = null, cur = null, state = null, dirty = false, editing = null;

  /* ---------- ابزارها ---------- */
  function api(action, opt) {
    opt = opt || {};
    var init = { method: opt.body ? 'POST' : 'GET', credentials: 'same-origin', headers: {} };
    if (csrf) init.headers['X-CSRF-Token'] = csrf;
    if (opt.json) { init.headers['Content-Type'] = 'application/json'; init.body = JSON.stringify(opt.json); init.method = 'POST'; }
    if (opt.form) { init.body = opt.form; init.method = 'POST'; }
    var url = API + '?action=' + action + (opt.query || '');
    return fetch(url, init).then(function (r) {
      return r.json().catch(function () { return { ok: false, error: 'پاسخ نامعتبر از سرور' }; }).then(function (d) { d._status = r.status; return d; });
    });
  }
  function toast(msg, bad) { var t = $('#toast'); t.textContent = msg; t.className = 'toast show' + (bad ? ' bad' : ''); clearTimeout(toast.t); toast.t = setTimeout(function () { t.className = 'toast'; }, 3200); }
  function getp(o, p) { return p.split('.').reduce(function (a, k) { return a == null ? a : a[k]; }, o); }
  function el(tag, attrs, kids) {
    var e = document.createElement(tag);
    Object.keys(attrs || {}).forEach(function (k) { if (k === 'text') e.textContent = attrs[k]; else if (k === 'class') e.className = attrs[k]; else e.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (c) { e.appendChild(c); });
    return e;
  }
  function imgUrl(p) { return p ? '../assets/images' + p : ''; }
  function setDirty(v) { dirty = v; $('#btnSave').disabled = !v; }
  function slug(s) { return String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 40); }
  function items() { return cur.path ? (state[cur.path] = state[cur.path] || []) : state; }

  /* ---------- شروع و ورود ---------- */
  function show(id) { ['#app', '#login', '#needSetup'].forEach(function (s) { $(s).hidden = (s !== id); }); }
  function boot() {
    fetch('schemas.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (s) { schemas = s; return api('status'); }).then(function (st) {
      if (!st.configured) return show('#needSetup');
      if (!st.loggedIn) { show('#login'); $('#pw').focus(); return; }
      csrf = st.csrf; startApp();
    }).catch(function () { show('#login'); $('#loginErr').textContent = 'اتصال به سرور برقرار نشد. مطمئن شوید پنل روی هاست PHP باز شده است.'; });
  }
  $('#loginForm').addEventListener('submit', function (e) {
    e.preventDefault(); $('#loginErr').textContent = '';
    api('login', { json: { password: $('#pw').value } }).then(function (d) {
      if (d.ok) { csrf = d.csrf; $('#pw').value = ''; startApp(); } else $('#loginErr').textContent = d.error || 'ورود ناموفق بود';
    });
  });
  $('#btnLogout').addEventListener('click', function () {
    if (dirty && !confirm('تغییرات ذخیره‌نشده از بین می‌رود. خارج می‌شوید؟')) return;
    api('logout', { json: {} }).then(function () { setDirty(false); location.reload(); });
  });
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = ''; } });

  function startApp() {
    show('#app');
    var t = $('#tabs'); t.innerHTML = '';
    schemas.collections.forEach(function (c) {
      var b = el('button', { class: 'tab', type: 'button', text: c.label }); b.dataset.id = c.id;
      b.addEventListener('click', function () { openCollection(c.id); }); t.appendChild(b);
    });
    openCollection(schemas.collections[0].id);
  }

  /* ---------- مجموعه‌ها ---------- */
  function openCollection(id) {
    if (dirty && !confirm('تغییرات ذخیره‌نشده در این بخش از بین می‌رود. ادامه می‌دهید؟')) return;
    cur = schemas.collections.filter(function (c) { return c.id === id; })[0];
    document.querySelectorAll('.tab').forEach(function (b) { b.setAttribute('aria-current', b.dataset.id === id ? 'true' : 'false'); });
    $('#help').textContent = cur.help || ''; $('#btnAdd').textContent = '＋ ' + cur.addLabel;
    api('load', { query: '&file=' + encodeURIComponent(cur.file) }).then(function (d) {
      if (!d.ok) return toast(d.error || 'خواندن داده ممکن نبود', true);
      try { state = JSON.parse(d.json); } catch (e) { return toast('فایل داده خراب است', true); }
      if (cur.path && (state === null || Array.isArray(state))) state = {};
      setDirty(false); render();
    });
  }
  function render() {
    var L = items(), box = $('#list'); box.innerHTML = '';
    $('#count').textContent = L.length + ' مورد';
    if (!L.length) box.appendChild(el('div', { class: 'empty', text: 'هنوز چیزی اضافه نشده است.' }));
    L.forEach(function (it, i) {
      var th = el('div', { class: 'thumb' });
      var src = cur.thumb && it[cur.thumb];
      if (src) th.style.backgroundImage = 'url("' + imgUrl(src) + '")'; else th.textContent = 'بدون عکس';
      var mid = el('div', {}, [el('b', { text: getp(it, cur.itemTitle) || '(بدون عنوان)' }), el('span', { class: 'muted', text: (cur.itemSubtitle && getp(it, cur.itemSubtitle)) || '' })]);
      var acts = el('div', { class: 'acts' });
      function btn(txt, cls, fn, dis) { var b = el('button', { class: 'btn small ' + cls, type: 'button', text: txt }); if (dis) b.disabled = true; b.addEventListener('click', fn); acts.appendChild(b); }
      btn('▲', 'ghost', function () { move(i, -1); }, i === 0);
      btn('▼', 'ghost', function () { move(i, 1); }, i === L.length - 1);
      btn('ویرایش', 'ghost', function () { openForm(i); });
      btn('حذف', 'danger', function () { del(i); });
      var row = el('div', { class: 'item' + (it.active === false ? ' off' : '') }, [th, mid, acts]); box.appendChild(row);
    });
  }
  function move(i, d) { var L = items(), j = i + d; if (j < 0 || j >= L.length) return; var t = L[i]; L[i] = L[j]; L[j] = t; setDirty(true); render(); }
  function del(i) { var L = items(); if (!confirm('«' + (getp(L[i], cur.itemTitle) || 'این مورد') + '» حذف شود؟\n(بعد از «ذخیره و انتشار» از سایت پاک می‌شود)')) return; L.splice(i, 1); setDirty(true); render(); }
  $('#btnAdd').addEventListener('click', function () { openForm(-1); });

  /* ---------- فرم ---------- */
  function openForm(idx) {
    var L = items(), isNew = idx < 0, data = isNew ? {} : JSON.parse(JSON.stringify(L[idx])), getters = [];
    var body = $('#modalBody'); body.innerHTML = '';
    cur.fields.forEach(function (f) {
      if (f.type === 'id') return;
      var wrap = el('div', {}), err = el('div', { class: 'fe' }), v = data[f.key];
      if (v === undefined && f.default !== undefined) v = f.default;
      var g;
      if (f.type === 'checkbox') {
        var cb = el('input', { type: 'checkbox' }); cb.checked = !!v;
        wrap.appendChild(el('label', { class: 'chk' }, [cb, document.createTextNode(f.label)])); g = function () { return cb.checked; };
      } else {
        wrap.appendChild(el('label', { text: f.label + (f.required ? ' *' : '') }));
        if (f.type === 'bilingual') {
          var mk = function (lang) { var i = f.multiline ? el('textarea', { lang: lang }) : el('input', { type: 'text', lang: lang }); i.value = (v && v[lang]) || ''; return i; };
          var fa = mk('fa'), en = mk('en');
          wrap.appendChild(el('div', { class: 'bi' }, [el('div', {}, [el('small', { text: 'فارسی' }), fa]), el('div', {}, [el('small', { text: 'English' }), en])]));
          g = function () { return { fa: fa.value.trim(), en: en.value.trim() }; };
        } else if (f.type === 'tags') {
          var tg = function (lang) { var i = el('input', { type: 'text', lang: lang }); i.value = ((v && v[lang]) || []).join(lang === 'fa' ? '، ' : ', '); return i; };
          var tfa = tg('fa'), ten = tg('en');
          wrap.appendChild(el('div', { class: 'bi' }, [el('div', {}, [el('small', { text: 'فارسی' }), tfa]), el('div', {}, [el('small', { text: 'English' }), ten])]));
          var sp = function (x) { return x.value.split(/[,،]/).map(function (q) { return q.trim(); }).filter(Boolean); };
          g = function () { return { fa: sp(tfa), en: sp(ten) }; };
        } else if (f.type === 'checks') {
          var copts = (state[f.optionsFrom] || []).map(function (o) { return [o.id, (o.name && o.name.fa) || (o.role && o.role.fa) || o.handle || o.id]; }), boxes = [];
          var cw = el('div', { class: 'checks' });
          copts.forEach(function (o) { var cb2 = el('input', { type: 'checkbox' }); cb2.checked = (v || []).indexOf(o[0]) >= 0; boxes.push([o[0], cb2]); cw.appendChild(el('label', { class: 'chk' }, [cb2, document.createTextNode(o[1])])); });
          wrap.appendChild(cw); g = function () { return boxes.filter(function (x) { return x[1].checked; }).map(function (x) { return x[0]; }); };
        } else if (f.type === 'textarea') { var ta = el('textarea'); ta.value = v || ''; wrap.appendChild(ta); g = function () { return ta.value.trim(); }; }
        else if (f.type === 'select') {
          var opts = f.options || [];
          if (f.optionsFrom) opts = (f.noEmpty ? [] : [['', '— بدون دپارتمان —']]).concat((state[f.optionsFrom] || []).map(function (o) { return [o.id, (o.name && o.name.fa) || (o.role && o.role.fa) || o.handle || o.id]; }));
          var sel = el('select'); opts.forEach(function (o) { var op = el('option', { value: o[0], text: o[1] }); if (String(o[0]) === String(v)) op.selected = true; sel.appendChild(op); });
          wrap.appendChild(sel); g = function () { return f.numeric ? Number(sel.value) : sel.value; };
        } else if (f.type === 'image') {
          var path = v || '', th = el('div', { class: 'thumb', text: 'بدون عکس' }), file = el('input', { type: 'file', accept: 'image/jpeg,image/png,image/webp' }), msg = el('span', { class: 'muted' });
          var paint = function () { th.textContent = path ? '' : 'بدون عکس'; th.style.backgroundImage = path ? 'url("' + imgUrl(path) + '")' : ''; };
          paint(); file.hidden = true;
          var up = el('button', { class: 'btn small ghost', type: 'button', text: 'انتخاب و آپلود عکس' });
          var rm = el('button', { class: 'btn small danger', type: 'button', text: 'حذف عکس' });
          up.addEventListener('click', function () { file.click(); });
          rm.addEventListener('click', function () { path = ''; paint(); });
          file.addEventListener('change', function () {
            if (!file.files[0]) return; msg.textContent = 'در حال آپلود…';
            var fd = new FormData(); fd.append('image', file.files[0]);
            api('upload', { form: fd }).then(function (d) { if (d.ok) { path = d.path; paint(); msg.textContent = 'آپلود شد ✓'; } else { msg.textContent = ''; toast(d.error || 'آپلود ناموفق بود', true); } file.value = ''; });
          });
          wrap.appendChild(el('div', { class: 'imgf' }, [th, up, rm, file, msg])); g = function () { return path; };
        } else {
          var inp = el('input', { type: f.type === 'number' ? 'number' : f.type === 'url' ? 'url' : 'text' });
          if (f.type === 'url') inp.setAttribute('dir', 'ltr'); inp.value = v == null ? '' : v; wrap.appendChild(inp);
          g = function () { return f.type === 'number' ? (inp.value === '' ? null : Number(inp.value)) : inp.value.trim(); };
        }
        if (f.hint) wrap.appendChild(el('div', { class: 'hint', text: f.hint }));
      }
      wrap.appendChild(err); body.appendChild(wrap); getters.push({ f: f, get: g, err: err });
    });
    $('#modalTitle').textContent = (isNew ? 'افزودن: ' : 'ویرایش: ') + cur.label;
    editing = function () {
      var out = JSON.parse(JSON.stringify(data)), ok = true;
      getters.forEach(function (x) {
        var val = x.get(), f = x.f, bad = '';
        if (f.required) { if (f.type === 'bilingual' ? (!val.fa || !val.en) : f.type === 'checks' ? !val.length : (val === '' || val == null)) bad = f.type === 'bilingual' ? 'هر دو زبان (فارسی و English) باید پر شود' : 'این فیلد الزامی است'; }
        if (!bad && f.mustContain && val && String(val).indexOf(f.mustContain) < 0) bad = 'لینک باید از ' + f.mustContain + ' باشد';
        x.err.textContent = bad; if (bad) ok = false; out[f.key] = val;
      });
      if (!ok) return false;
      cur.fields.forEach(function (f) {
        if (f.type !== 'id') return;
        if (out[f.key]) return;
        if (f.numeric) { out[f.key] = L.reduce(function (m, o) { return Math.max(m, Number(o[f.key]) || 0); }, 0) + 1; return; }
        var base = slug(getp(out, f.from)) || 'item', id = base, n = 2, taken = function (z) { return L.some(function (o, k) { return k !== idx && o[f.key] === z; }); };
        while (taken(id)) id = base + '-' + (n++);
        out[f.key] = id;
      });
      if (isNew) L.push(out); else L[idx] = out;
      setDirty(true); render(); return true;
    };
    $('#modal').hidden = false; body.scrollTop = 0;
  }
  function closeModal() { $('#modal').hidden = true; editing = null; }
  $('#modalOk').addEventListener('click', function () { if (editing && editing()) closeModal(); });
  $('#modalCancel').addEventListener('click', closeModal); $('#modalClose').addEventListener('click', closeModal);
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !$('#modal').hidden) closeModal(); });

  /* ---------- ذخیره ---------- */
  $('#btnSave').addEventListener('click', function () {
    var b = $('#btnSave'); b.disabled = true;
    api('save', { json: { file: cur.file, json: JSON.stringify(state, null, 2) } }).then(function (d) {
      if (d.ok) { setDirty(false); toast('ذخیره شد و در سایت منتشر شد ✓'); } else { b.disabled = false; toast(d.error || 'ذخیره ناموفق بود', true); }
    });
  });

  /* ---------- نسخه‌های قبلی ---------- */
  $('#btnBackups').addEventListener('click', function () {
    api('backups', { query: '&file=' + encodeURIComponent(cur.file) }).then(function (d) {
      var body = $('#modalBody'); body.innerHTML = '';
      if (!d.ok || !d.backups.length) body.appendChild(el('div', { class: 'empty', text: 'هنوز نسخهٔ قبلی وجود ندارد. بعد از اولین ذخیره ساخته می‌شود.' }));
      else d.backups.forEach(function (b) {
        var when = new Date(b.time * 1000).toLocaleString('fa-IR');
        var r = el('div', { class: 'row' }, [el('span', { text: when }), el('button', { class: 'btn small ghost', type: 'button', text: 'بازگردانی' })]);
        r.querySelector('button').addEventListener('click', function () {
          if (!confirm('این نسخه جایگزین نسخهٔ فعلی شود؟ (نسخهٔ فعلی هم پشتیبان می‌شود)')) return;
          api('restore', { json: { file: cur.file, name: b.name } }).then(function (x) { if (x.ok) { closeModal(); toast('نسخه بازگردانی شد ✓'); setDirty(false); openCollection(cur.id); } else toast(x.error || 'بازگردانی ناموفق بود', true); });
        });
        body.appendChild(r);
      });
      $('#modalTitle').textContent = 'نسخه‌های قبلی: ' + cur.label; editing = null; $('#modal').hidden = false;
    });
  });
  boot();
})();
