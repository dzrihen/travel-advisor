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
const $=id=>document.getElementById(id);
let S;
function load(){try{const o=JSON.parse(localStorage.getItem(KEY)||"{}");return o&&typeof o==="object"?o:{}}catch{return{}}}
S=Object.assign({},DEF,load());if(!S.visited||typeof S.visited!=="object")S.visited={};if(!S.w||typeof S.w!=="object")S.w={};
let st;const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S));const e=$("saved");if(e){e.textContent="✓ נשמר";e.classList.add("show");clearTimeout(st);st=setTimeout(()=>e.classList.remove("show"),1200)}}catch(x){const e=$("saved");if(e){e.textContent="⚠️ השמירה נכשלה";e.classList.add("show")}}};
window.addEventListener("pagehide",save);
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
// ---- paste list ----
const norm=s=>s.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f\u0591-\u05C7]/g,"").replace(/[׳'`"”“״’]/g,"").replace(/[\u{1F1E6}-\u{1F1FF}]/gu,"").replace(/[^\p{L}\p{N} ]+/gu," ").replace(/\s+/g," ").trim();
const EN=new Intl.DisplayNames(["en"],{type:"region"});
const IDX=new Map();const addI=(k,i)=>{k=norm(k);if(k&&!IDX.has(k))IDX.set(k,i)};
C.forEach(c=>{addI(c.he,c.iso);try{addI(EN.of(c.iso),c.iso)}catch{}});Object.entries(ALIASES).forEach(([k,i])=>i&&BY[i]&&addI(k,i));
const HL=new Map();C.forEach(c=>{c.hl.forEach(h=>{const k=norm(h.replace(/\(.*\)/,""));if(k.length>3&&!IDX.has(k)&&!HL.has(k))HL.set(k,c.iso)})});
function lev(a,b){const m=a.length,n=b.length;if(Math.abs(m-n)>2)return 9;let p=[...Array(n+1).keys()];for(let i=1;i<=m;i++){const q=[i];for(let j=1;j<=n;j++)q[j]=Math.min(p[j]+1,q[j-1]+1,p[j-1]+(a[i-1]===b[j-1]?0:1));p=q}return p[n]}
function flagIso(s){const m=[...s.matchAll(/[\u{1F1E6}-\u{1F1FF}]{2}/gu)][0];if(!m)return null;const i=[...m[0]].map(ch=>String.fromCharCode(ch.codePointAt(0)-127397)).join("");return BY[i]?i:null}
function matchOne(raw){const fi=flagIso(raw);
 let s=raw.replace(/^\s*(?:[-*•●▪◦·]|\d+[.)\]]|\(?\d+\))\s*/,"");
 const head=s.split(/\s[-–—:|]\s|\s[–—]|[–—(]|\s-\s?/)[0];
 for(const cand of [head,s]){const n=norm(cand);if(!n)continue;
  if(/^[a-z]{2}$/.test(n)&&BY[n.toUpperCase()])return n.toUpperCase();
  if(IDX.has(n))return IDX.get(n);if(HL.has(n))return HL.get(n);const nh=n.replace(/^ה(?=\S{3})/,"");if(IDX.has(nh))return IDX.get(nh);
  const w=n.split(" ");for(let L=Math.min(4,w.length);L>=1;L--)for(let i=0;i+L<=w.length;i++){const k=w.slice(i,i+L).join(" ");if(k.length>=2&&IDX.has(k)&&!(k.length<=2&&L===1&&w.length>1))return IDX.get(k)}
  if(n.length>=4){let best=null,bd=9;for(const[k,i]of IDX){const d=lev(n,k);if(d<bd){bd=d;best=i}}if(bd<=(n.length>=7?2:1))return best}}
 return fi}
function parseList(txt){const parts=txt.split(/[\n\r;,\t]+/).map(x=>x.trim()).filter(x=>x&&!/^(country|countries|מדינה|מדינות|iso)$/i.test(x));const ok=new Map(),bad=[];
 parts.forEach(p=>{const i=matchOne(p);if(i)ok.set(i,(ok.get(i)||[]).concat(p));else bad.push(p)});return{ok,bad}}
let PR=null;const OPTS='<option value="">— בחר מדינה ידנית / דלג —</option>'+[...C].sort((a,b)=>a.he.localeCompare(b.he,"he")).map(c=>`<option value="${c.iso}">${flag(c.iso)} ${c.he}</option>`).join("");
const esc=s=>s.replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
function preview(){PR=parseList($("ptext").value);const ok=[...PR.ok.keys()];
 $("pprev").innerHTML=`<h4>זוהו ${ok.length} מדינות${ok.filter(i=>S.visited[i]).length?` (${ok.filter(i=>S.visited[i]).length} כבר מסומנות)`:""}</h4><div class="pm">${ok.map(i=>`<span>${flag(i)} ${BY[i].he}</span>`).join("")}</div>`+
 (PR.bad.length?`<h4>לא זוהו (${PR.bad.length})</h4>`+PR.bad.map((b,k)=>`<div class="um"><code>${esc(b)}</code><select data-k="${k}" aria-label="בחירה ידנית עבור ${esc(b)}">${OPTS}</select></div>`).join(""):"");
 $("papply").disabled=!ok.length&&!PR.bad.length}
$("pasteBtn").onclick=()=>{$("pprev").innerHTML="";$("papply").disabled=true;$("pdlg").showModal();$("ptext").focus()};
$("pclose").onclick=()=>$("pdlg").close();
$("pparse").onclick=preview;let pt;$("ptext").oninput=()=>{clearTimeout(pt);pt=setTimeout(preview,300)};
$("pfile").onchange=async e=>{const f=e.target.files[0];if(!f)return;$("ptext").value=(await f.text()).replace(/^\uFEFF/,"");e.target.value="";preview()};
$("papply").onclick=()=>{if(!PR)preview();const add=[...PR.ok.keys()];document.querySelectorAll("#pprev select").forEach(s=>s.value&&add.push(s.value));
 let n=0;add.forEach(i=>{if(!S.visited[i]){S.visited[i]={cities:[]};n++}});save();renderCountries();$("pdlg").close();
 const e=$("saved");e.textContent=`✓ נוספו ${n} מדינות ונשמר`;e.classList.add("show");clearTimeout(st);st=setTimeout(()=>e.classList.remove("show"),2500)};
function init(){renderRegions();renderCountries();renderInts();syncForm()}
init();
})();
