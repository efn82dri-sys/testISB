/* زبان سایت (فارسی/انگلیسی): انتخاب زبان فعلی L، گرفتن ترجمه t()، انتخاب متن دوزبانه N(فارسی, انگلیسی)، اعداد فارسی fa() و تابع تعویض زبان setL(). */
const $=s=>document.querySelector(s),fa=n=>String(n).replace(/\d/g,d=>'۰۱۲۳۴۵۶۷۸۹'[d]);
let L='fa';
const t=()=>D.translations[L],g=o=>o?o[L]??o:'',img=p=>IM[p]||p,N=(a,b)=>L==='fa'?a:b;
function setL(){L=L=='fa'?'en':'fa';document.documentElement.lang=L;document.documentElement.dir=L=='fa'?'rtl':'ltr';chrome();if(curK)showK(curK)}
