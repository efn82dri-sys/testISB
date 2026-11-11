/* نقطهٔ شروع سایت: همهٔ فایل‌های داده (data/*.json) را می‌خواند، آن‌ها را به ساختاری که کد انتظار دارد تبدیل می‌کند، بعد فایل‌های js را به ترتیب لود می‌کند.
   ترتیب لود مهم است: i18n ← ui ← scene ← camera ← mascot ← guide. */
(function(){
  'use strict';
  var BASE_IMG='assets/images';
  function get(u){
    return fetch(u,{cache:'no-cache'}).then(function(r){ if(!r.ok) throw new Error(u+' → '+r.status); return r.json(); });
  }
  function pair(o){ return [o.fa,o.en]; }

  Promise.all([
    get('data/fa.json'),get('data/en.json'),get('data/projects.json'),get('data/services.json'),
    get('data/team.json'),get('data/chapters.json'),get('data/guide.json'),get('data/town.json'),get('data/images.json'),get('data/credentials.json'),get('data/clips.json').catch(function(){return []}),get('data/sarv.json'),get('data/contact.json')
  ]).then(function(a){
    var fa=a[0],en=a[1],projects=a[2],services=a[3],team=a[4],chapters=a[5],guide=a[6],town=a[7],images=a[8],credentials=a[9],clips=a[10],sarv=a[11],contact=a[12];

    /* --- داده‌های اصلی (D) --- */
    window.D={projects:projects,services:services.services,serviceGroups:services.groups,serviceStages:services.stages,educationalPrograms:services.educationalPrograms,
              teamMembers:team.teamMembers,departments:team.departments,translations:{fa:fa,en:en}};
    window.CRED=credentials;
    window.SARV=sarv;
    window.CONTACT=contact;
    window.CLIPS=(Array.isArray(clips)?clips:[]).filter(function(c){return c.active!==false});
    window.OFF=team.partnerOffices.map(pair);

    /* --- تصاویر: کلید = مسیر داخل پروژه، مقدار = آدرس فایل --- */
    window.IM={};
    images.forEach(function(p){ window.IM[p]=BASE_IMG+p; });

    /* --- فصل‌های مسیر پایداری --- */
    window.CH=chapters.map(function(c){return{
      n:pair(c.name),h:pair(c.headline),d:pair(c.description),c:[c.chips.fa,c.chips.en],
      m:[c.metric.value,c.metric.decimals,c.metric.suffix,pair(c.metric.label)],
      sp:c.specs.map(function(s){return [s.label.fa,s.label.en,s.value.fa,s.value.en];})
    };});

    /* --- هفت بخش شهرک --- */
    window.SEC=town.sections.map(function(s){return pair(s.name);});
    window.PC=town.sections.map(function(s){return s.cameraCenter;});
    window.LO=town.sections.map(function(s){return s.labelOffset;});
    window.HL=town.sustainabilityHighlights.map(function(g){return g.map(function(h){return [h.fa,h.en,h.value];});});

    /* --- دستیار ISB و HUD --- */
    window.ISB_ASSISTANT_TEXT=guide.assistantTexts;
    window.ISB_HUD_LABELS=guide.hudLabels.map(function(h){return [h.title,h.subtitle];});
    var G={};
    ['fa','en'].forEach(function(l){var g=guide.guide[l];
      G[l]={head:g.headings,tips:g.tips,tipsS:g.shortTips,go:g.startButton,goT:g.ticketButton,no:g.laterButton,x:g.closeButton,tap:g.tapWords};});
    window.ISB_GUIDE_TEXT=G;

    loadScripts(['js/i18n.js','js/lab.js','js/ui.js','js/scene.js','js/camera.js','js/mascot.js','js/guide.js']);
  }).catch(function(e){
    console.error('ISB: خطا در لود داده‌ها',e);
    document.body.insertAdjacentHTML('afterbegin',
      '<div style="position:fixed;inset:0;z-index:99999;display:grid;place-items:center;background:#071d45;color:#fff;padding:24px;text-align:center;font:16px/2 Tahoma,sans-serif" dir="rtl">'+
      '<div><b>سایت لود نشد.</b><br>اگر فایل را مستقیم (file://) باز کرده‌اید، باید از یک سرور محلی استفاده کنید:<br>'+
      '<code dir="ltr" style="background:#0c2a75;padding:2px 10px;border-radius:6px">python -m http.server 8000</code></div></div>');
  });

  /* فایل‌ها را به ترتیب اجرا می‌کند (async=false یعنی ترتیب حفظ شود). */
  function loadScripts(list){
    list.forEach(function(src){
      var s=document.createElement('script'); s.src=src; s.async=false;
      s.onerror=function(){console.error('ISB: لود نشد → '+src)};
      document.body.appendChild(s);
    });
  }
})();
