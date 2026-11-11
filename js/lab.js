/* «آزمایشگاه پایداری»: طرح‌های شماتیک SVG برای پنج راهبرد (پوسته، نور روز، تهویه، تجدیدپذیر، آب).
   هر طرح دو حالت دارد (st = 0 یا 1) که با کلید بالای آن عوض می‌شود. این‌ها فقط تصویر آموزشی‌اند و داده‌ی پروژه نیستند. */
(function(){
  var B='#7edcff',G='#f4c65e',R='#ff8b6b',W='#dce4f5',M='#223981',D='#0c2a75';
  function arrow(x1,y1,x2,y2,c,w,cls){
    var a=Math.atan2(y2-y1,x2-x1),h=9+w,hx=x2-Math.cos(a)*h,hy=y2-Math.sin(a)*h,px=-Math.sin(a)*(h/2.2),py=Math.cos(a)*(h/2.2);
    return '<g class="'+(cls||'')+'"><line x1="'+x1+'" y1="'+y1+'" x2="'+hx+'" y2="'+hy+'" stroke="'+c+'" stroke-width="'+w+'" stroke-linecap="round"/><polygon points="'+x2+','+y2+' '+(hx+px)+','+(hy+py)+' '+(hx-px)+','+(hy-py)+'" fill="'+c+'"/></g>';
  }
  function txt(x,y,s,c,anchor){return '<text x="'+x+'" y="'+y+'" fill="'+(c||W)+'" font-size="11" text-anchor="'+(anchor||'middle')+'" font-family="Kalameh,Tahoma,sans-serif">'+s+'</text>';}
  function wrap(inner){return '<svg viewBox="0 0 360 220" role="img" class="lab-svg">'+inner+'</svg>';}

  var S={
    envelope:function(st){ /* st: 0 بدون عایق، 1 با عایق */
      var o=txt(60,28,N('داخل (گرم)','Inside (warm)'),G)+txt(300,28,N('بیرون (سرد)','Outside (cold)'),B)+
      '<rect x="140" y="40" width="70" height="150" fill="'+M+'" stroke="'+B+'" stroke-opacity=".5"/>'+txt(175,205,N('دیوار','Wall'),W);
      if(st){o+='<rect x="110" y="40" width="30" height="150" fill="'+G+'" fill-opacity=".85"/>'+txt(125,205,N('عایق','Insulation'),G)+
        arrow(70,115,108,115,R,2,'flow')+arrow(215,115,250,115,R,1.5,'flow f2');}
      else{o+=arrow(70,70,320,70,R,5,'flow')+arrow(70,115,320,115,R,5,'flow f2')+arrow(70,160,320,160,R,5,'flow f3');}
      return wrap(o+txt(180,18,st?N('تلفات حرارتی کم','Low heat loss'):N('تلفات حرارتی زیاد','High heat loss'),st?'#7dffb0':R));
    },
    daylight:function(st){ /* st: 0 تابستان (خورشید بالا)، 1 زمستان (خورشید پایین) */
      var sun=st?{x:35,y:105}:{x:55,y:22},hit=st?{x:228,y:178}:{x:122,y:84};
      return wrap('<rect x="120" y="60" width="150" height="120" fill="none" stroke="'+B+'" stroke-width="2"/><rect x="114" y="98" width="12" height="46" fill="'+B+'" fill-opacity=".45"/><rect x="60" y="82" width="62" height="6" fill="'+G+'"/><line x1="120" y1="180" x2="270" y2="180" stroke="'+W+'" stroke-width="3"/>'+
      '<circle cx="'+sun.x+'" cy="'+sun.y+'" r="14" fill="'+G+'"/>'+arrow(sun.x+14,sun.y+8,hit.x,hit.y,G,3,'flow')+
      (st?'<rect x="150" y="150" width="86" height="30" fill="'+G+'" fill-opacity=".22"/>':'')+
      txt(90,76,N('سایه‌بان','Overhang'),G)+txt(195,198,st?N('نور تا عمق اتاق می‌رسد','Light reaches deep'):N('سایه‌بان مانع تابش مستقیم','Overhang blocks sun'),W)+txt(290,24,st?N('زمستان','Winter'):N('تابستان','Summer'),G,'end'));
    },
    ventilation:function(st){ /* st: 0 بسته، 1 تهویهٔ طبیعی */
      var o='<rect x="90" y="50" width="180" height="130" fill="none" stroke="'+B+'" stroke-width="2"/><rect x="84" y="140" width="12" height="28" fill="'+(st?B:M)+'"/><rect x="264" y="62" width="12" height="28" fill="'+(st?B:M)+'"/>'+txt(180,200,N('ورودی پایین','Low inlet')+' ← → '+N('خروجی بالا','High outlet'),W);
      if(st){o+=arrow(30,154,110,154,B,4,'flow')+'<path d="M112 154 C170 150 190 110 240 80" fill="none" stroke="'+B+'" stroke-width="4" stroke-linecap="round" class="flow f2"/>'+arrow(240,80,320,60,B,4,'flow f3');}
      else{o+='<line x1="84" y1="140" x2="96" y2="168" stroke="'+R+'" stroke-width="3"/><line x1="96" y1="140" x2="84" y2="168" stroke="'+R+'" stroke-width="3"/>'+txt(180,115,N('هوای ساکن','Stagnant air'),R);}
      return wrap(o+txt(180,22,st?N('جریان هوا با اختلاف دما','Stack-driven airflow'):N('بدون تهویهٔ طبیعی','No natural ventilation'),st?'#7dffb0':R));
    },
    renewable:function(st){ /* st: 0 مصرف مستقیم، 1 مازاد به شبکه */
      var o='<circle cx="52" cy="40" r="16" fill="'+G+'"/><polygon points="120,100 270,100 250,70 140,70" fill="'+B+'" fill-opacity=".6" stroke="'+B+'"/><rect x="130" y="100" width="130" height="80" fill="'+M+'" stroke="'+B+'" stroke-opacity=".5"/>'+txt(195,150,N('ساختمان','Building'),W)+txt(195,64,N('پنل‌های خورشیدی','PV panels'),B);
      o+=arrow(70,52,150,82,G,3,'flow')+arrow(195,102,195,126,G,3,'flow f2');
      if(st){o+='<line x1="320" y1="70" x2="320" y2="170" stroke="'+W+'" stroke-width="3"/><line x1="305" y1="85" x2="335" y2="85" stroke="'+W+'" stroke-width="3"/>'+arrow(262,140,312,140,'#7dffb0',3,'flow f3')+txt(320,190,N('شبکه','Grid'),W);}
      return wrap(o+txt(180,18,st?N('مازاد تولید به شبکه می‌رود','Surplus feeds the grid'):N('تولید، مستقیم مصرف می‌شود','Direct self-consumption'),st?'#7dffb0':G));
    },
    water:function(st){ /* st: 0 جمع‌آوری باران، 1 استفادهٔ مجدد */
      var lvl=st?150:110,o='<polygon points="70,90 190,90 160,55 100,55" fill="'+M+'" stroke="'+B+'"/><rect x="82" y="90" width="96" height="70" fill="'+M+'" stroke="'+B+'" stroke-opacity=".5"/><rect x="230" y="110" width="70" height="70" fill="'+M+'" stroke="'+B+'"/><rect x="232" y="'+lvl+'" width="66" height="'+(180-lvl)+'" fill="'+B+'" fill-opacity=".55"/>'+txt(265,102,N('مخزن','Tank'),W);
      o+='<path d="M178 100 C205 100 205 120 230 130" fill="none" stroke="'+B+'" stroke-width="3" stroke-dasharray="4 4" class="flow"/>';
      if(!st){for(var i=0;i<5;i++)o+='<line x1="'+(90+i*22)+'" y1="'+(8+(i%2)*8)+'" x2="'+(84+i*22)+'" y2="'+(34+(i%2)*8)+'" stroke="'+B+'" stroke-width="3" stroke-linecap="round" class="flow f'+(i%3+1)+'"/>';}
      else{o+=arrow(265,182,265,208,B,3,'flow')+'<path d="M240 210 q15 -22 30 0 q15 -22 30 0" fill="none" stroke="#7dffb0" stroke-width="3"/>'+txt(110,205,N('آبیاری و سیفون','Irrigation & flushing'),'#7dffb0');}
      return wrap(o+txt(180,18,st?N('آب خاکستری/باران دوباره مصرف می‌شود','Water is reused'):N('باران از بام جمع‌آوری می‌شود','Rain is harvested from the roof'),st?'#7dffb0':B));
    }
  };
  var T={ /* برچسب کلید دوحالته برای هر راهبرد: [حالت ۰، حالت ۱] */
    envelope:[['بدون عایق','No insulation'],['با عایق','Insulated']],daylight:[['تابستان','Summer'],['زمستان','Winter']],
    ventilation:[['پنجره‌ها بسته','Closed'],['تهویهٔ طبیعی','Natural ventilation']],renewable:[['مصرف مستقیم','Self-use'],['مازاد به شبکه','Export to grid']],water:[['جمع‌آوری باران','Harvesting'],['استفادهٔ مجدد','Reuse']]
  };
  window.LAB={svg:function(id,st){return S[id](st?1:0)},toggles:T};
})();
