(()=>{
const INT=[["views","נופים"],["trek","טרקים"],["day","טיולי יום"],["beach","חופים"],["city","ערים ותרבות"],["attr","אטרקציות"],["food","אוכל"],["nature","טבע וחיות"],["ski","סקי"],["adv","הרפתקאות"],["shop","קניות"],["night","חיי לילה"],["hist","היסטוריה"],["road","נסיעה ברכב שכור"],["relax","רגוע וספא"]];
const MONTHS=["ינואר","פברואר","מרץ","אפריל","מאי","יוני","יולי","אוגוסט","ספטמבר","אוקטובר","נובמבר","דצמבר"];
const MODE={t:"🚆 רכבת",c:"🚗 רכב",b:"🚌 אוטובוס",f:"⛴️ מעבורת"};
const flag=i=>i.replace(/./g,c=>String.fromCodePoint(127397+c.charCodeAt(0)));
const parseM=s=>{const m=new Set();(s||"").split(",").forEach(r=>{const[a,b]=r.split("-").map(Number);if(!a)return;let x=a;const e=b||a;for(let k=0;k<12;k++){m.add(x);if(x===e)break;x=x%12+1}});return m};
const C=RAW.map(r=>({iso:r[0],he:r[1],region:r[2],fh:r[3],direct:!!r[4],budget:r[5],months:parseM(r[6]),monthsTxt:r[6],sc:[...r[7]].map(Number),hl:r[8].split("|"),nb:r[9]?r[9].split(";").map(x=>{const[i,h,m]=x.split(":");return{iso:i,h:+h,mode:m}}):[]}));
const BY=Object.fromEntries(C.map(c=>[c.iso,c]));
const KEY="travelAdvisor.v1";
const DEF={visited:{},w:{},flight:"any",maxh:8,days:10,month:0,budget:2,revisit:false,combo:true,comboH:4};
let S=Object.assign({},DEF,JSON.parse(localStorage.getItem(KEY)||"{}"));
const save=()=>localStorage.setItem(KEY,JSON.stringify(S));
const $=id=>document.getElementById(id);
let region="הכל";
// tabs
function go(t){document.querySelectorAll(".tab").forEach(e=>e.classList.toggle("on",e.id===t));document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("on",b.dataset.tab===t));if(t==="recs")renderRecs();scrollTo(0,0)}
document.querySelectorAll("[data-tab]").forEach(b=>b.onclick=()=>go(b.dataset.tab));
document.querySelectorAll("[data-go]").forEach(b=>b.onclick=()=>go(b.dataset.go));
// countries
function renderRegions(){$("regions").innerHTML=["הכל","שביקרתי",...new Set(C.map(c=>c.region))].map(r=>`<button class="${r===region?"on":""}">${r}</button>`).join("");[...$("regions").children].forEach(b=>b.onclick=()=>{region=b.textContent;renderRegions();renderCountries()})}
function renderCountries(){const q=$("q").value.trim().toLowerCase();
 const L=C.filter(c=>(region==="הכל"||(region==="שביקרתי"?S.visited[c.iso]:c.region===region))&&(!q||c.he.includes(q)||c.iso.toLowerCase()===q)).sort((a,b)=>a.he.localeCompare(b.he,"he"));
 $("countries").innerHTML=L.map(c=>{const v=S.visited[c.iso];return `<div class="c ${v?"v":""}" data-i="${c.iso}" role="checkbox" aria-checked="${!!v}" tabindex="0"><span>${flag(c.iso)}</span><span>${c.he}${v&&v.cities?.length?` <small class="muted">(${v.cities.length} ערים)</small>`:""}</span>${v?`<button class="ed" title="ערים" aria-label="ערים ב${c.he}">✎</button>`:""}</div>`}).join("")||'<p class="muted">לא נמצא</p>';
 $("vcount").textContent=Object.keys(S.visited).length}
$("countries").onclick=e=>{const el=e.target.closest(".c");if(!el)return;const i=el.dataset.i;
 if(e.target.classList.contains("ed")){$("dlgT").textContent="ערים ב"+BY[i].he;$("dlgC").value=(S.visited[i].cities||[]).join(", ");$("dlg").showModal();$("dlg").onclose=()=>{if($("dlg").returnValue==="ok"){S.visited[i].cities=$("dlgC").value.split(/[,،]/).map(s=>s.trim()).filter(Boolean);save();renderCountries()}};return}
 if(S.visited[i])delete S.visited[i];else S.visited[i]={cities:[]};save();renderCountries()};
$("countries").onkeydown=e=>{if(e.key===" "||e.key==="Enter"){e.preventDefault();e.target.click()}};
$("q").oninput=renderCountries;
// interests
function renderInts(){$("interests").innerHTML=INT.map(([k,n])=>`<div class="int"><span>${n}</span><span class="lv" data-k="${k}">${[0,1,2,3].map(l=>`<button class="${(S.w[k]||0)===l?"on":""}" aria-label="${n} ${l}">${l}</button>`).join("")}</span></div>`).join("");
 document.querySelectorAll(".lv").forEach(g=>[...g.children].forEach((b,l)=>b.onclick=()=>{S.w[g.dataset.k]=l;save();renderInts()}))}
// trip form
$("month").innerHTML+=MONTHS.map((m,i)=>`<option value="${i+1}">${m}</option>`).join("");
const F=["flight","maxh","days","month","budget","comboH"];
function syncForm(){F.forEach(f=>$(f).value=S[f]);$("revisit").checked=S.revisit;$("combo").checked=S.combo;$("maxhV").textContent=S.maxh;$("comboHV").textContent=S.comboH}
F.forEach(f=>$(f).oninput=()=>{S[f]=f==="flight"?$(f).value:+$(f).value;save();syncForm()});
["revisit","combo"].forEach(f=>$(f).onchange=()=>{S[f]=$(f).checked;save()});
// scoring
function nearMonth(c,m){return c.months.has(m%12+1)||c.months.has((m+10)%12+1)}
function score(c){const r={parts:[],why:[]};const v=!!S.visited[c.iso];
 if(c.fh>S.maxh)return null; if(S.flight==="direct"&&!c.direct)return null; if(v&&!S.revisit)return null;
 const tw=INT.reduce((a,[k])=>a+(S.w[k]||0),0);
 let fit=tw?INT.reduce((a,[k],i)=>a+(S.w[k]||0)*c.sc[i],0)/(tw*5)*70:40; r.parts.push(["התאמה לתחומי עניין",fit]);
 INT.forEach(([k,n],i)=>{if((S.w[k]||0)>=2&&c.sc[i]>=4)r.why.push(n)});
 let s=0;if(S.month){s=c.months.has(S.month)?12:nearMonth(c,S.month)?4:-10;r.season=s>0?(s>10?"עונה מעולה":"עונת מעבר"):"לא העונה המומלצת"} else s=5; r.parts.push(["עונה",s]);
 const b=c.budget>S.budget?-12*(c.budget-S.budget):3; r.parts.push(["תקציב",b]);
 let f=c.direct?6:0; if(c.fh>9&&S.days<8)f-=10; if(c.fh<=4&&S.days<=5)f+=4; if(c.fh>12&&S.days>=14)f+=3; r.parts.push(["טיסה ומשך",f]);
 const nbs=c.nb.filter(n=>BY[n.iso]&&n.h<=S.comboH).map(n=>({...n,c:BY[n.iso],v:!!S.visited[n.iso]})).sort((a,b)=>a.v-b.v||a.h-b.h);
 r.combos=nbs; let cb=0; if(S.combo){const nv=nbs.filter(n=>!n.v);cb=nv.length?Math.min(10,4+nv.length*2):nbs.length?1:-6} r.parts.push(["שילוב מדינה שכנה",cb]);
 const vp=v?-(20+Math.min(10,(S.visited[c.iso].cities||[]).length*3)):8; r.parts.push([v?"כבר ביקרת (מותר)":"מדינה חדשה בשבילך",vp]);
 r.total=Math.max(0,Math.round(r.parts.reduce((a,p)=>a+p[1],0)));r.c=c;r.v=v;return r}
function renderRecs(){const R=C.map(score).filter(Boolean).sort((a,b)=>b.total-a.total).slice(0,15);
 if(!R.length){$("list").innerHTML='<div class="card">לא נמצאו יעדים. נסה להגדיל את שעות הטיסה או לאפשר קונקשן.</div>';return}
 $("list").innerHTML=R.map((r,i)=>{const c=r.c;const vc=r.v?(S.visited[c.iso].cities||[]):[];
  const hl=c.hl.map(h=>vc.some(x=>h.includes(x)||x.includes(h))?`<s>${h}</s>`:h).join(" · ");
  return `<article class="card"><h3>${i+1}. ${flag(c.iso)} ${c.he} <span class="tag">${c.region}</span>${r.v?'<span class="tag w">ביקרת – ערים חדשות</span>':''}<span class="score">${r.total}</span></h3>
  <p>📍 <b>מה לראות:</b> ${hl}</p>
  <p>✈️ ~${c.fh} שעות מנתב"ג · ${c.direct?"יש טיסה ישירה (משוער)":"בדרך כלל עם קונקשן"} · 💰 ${"₪".repeat(c.budget)} · 🗓️ עונה מומלצת: ${fmtM(c)}${r.season?` (<b>${r.season}</b>)`:""}</p>
  ${r.why.length?`<p>✅ <b>למה זה מתאים:</b> ${r.why.join(", ")}</p>`:""}
  <div class="bars">${r.parts.map(p=>`<span class="bar">${p[0]}: ${p[1]>0?"+":""}${Math.round(p[1])}</span>`).join("")}</div>
  ${S.combo&&r.combos.length?`<div class="combo">🔗 <b>שילובים אפשריים:</b> ${r.combos.slice(0,4).map(n=>`${flag(n.iso)} ${n.c.he} (~${n.h} ש' ב${MODE[n.mode]}${n.v?", ביקרת":""})`).join(" · ")}</div>`:""}
  </article>`}).join("")}
function fmtM(c){return c.monthsTxt.split(",").map(r=>r.split("-").map(m=>MONTHS[m-1]).join("–")).join(", ")}
// export/import/reset
$("exp").onclick=()=>{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([JSON.stringify(S,null,2)],{type:"application/json"}));a.download="travel-profile.json";a.click()};
$("imp").onchange=async e=>{try{S=Object.assign({},DEF,JSON.parse(await e.target.files[0].text()));save();init();alert("הפרופיל יובא")}catch{alert("קובץ לא תקין")}};
$("reset").onclick=()=>{if(confirm("למחוק את כל הנתונים?")){S=JSON.parse(JSON.stringify(DEF));save();init()}};
function init(){renderRegions();renderCountries();renderInts();syncForm()}
init();
})();
