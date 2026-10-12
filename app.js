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
function go(t){document.querySelectorAll(".tab").forEach(e=>e.classList.toggle("on",e.id===t));document.querySelectorAll("nav button").forEach(b=>b.classList.toggle("on",b.dataset.tab===t));if(t==="recs")renderRecs();if(t==="plan")renderPlan();scrollTo(0,0)}
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
  <button class="primary go" data-plan="${c.iso}">המשך לתכנון ←</button></article>`}).join("");
 document.querySelectorAll("[data-plan]").forEach(b=>b.onclick=()=>openPlan(b.dataset.plan))}
// ---- plan view ----
const INTN=Object.fromEntries(INT);
function openPlan(iso){S.lastDest=iso;save();go("plan");renderPlan()}
$("back").onclick=()=>go("recs");
const pad=n=>String(n).padStart(2,"0");
function planDates(){const P=S.plan||(S.plan={pax:2,dep:"",ret:"",month:0});return P}
function flightLinks(from,to,P,label){const direct=S.flight==="direct";
 let q=`Flights from ${from} to ${to}`;if(P.dep)q+=` on ${P.dep}`;if(P.ret)q+=` through ${P.ret}`;else if(!P.dep&&P.month)q+=` in ${new Intl.DateTimeFormat("en",{month:"long"}).format(new Date(2026,P.month-1,1))}`;if(direct)q+=" nonstop";q+=` ${P.pax} ${P.pax>1?"adults":"adult"}`;
 const g="https://www.google.com/travel/flights?hl=iw&q="+encodeURIComponent(q);
 const ymd=d=>d?d.slice(2).replace(/-/g,""):"";let sk=`https://www.skyscanner.co.il/transport/flights/${from.toLowerCase()}/${to.toLowerCase()}/`;
 if(P.dep){sk+=ymd(P.dep)+"/"+(P.ret?ymd(P.ret)+"/":"")}const sp=new URLSearchParams({adultsv2:P.pax,rtn:P.ret?1:0});if(direct)sp.set("preferdirects","true");if(!P.dep&&P.month){const y=P.month>=new Date().getMonth()+1?new Date().getFullYear():new Date().getFullYear()+1;sp.set("oym",String(y).slice(2)+pad(P.month))}sk+="?"+sp;
 let kw=`https://www.kiwi.com/he/search/results/tel-aviv-israel/${to}/${P.dep||"anytime"}/${P.ret||(P.dep?"no-return":"anytime")}?adults=${P.pax}`;if(direct)kw+="&stopNumber=0%7Etrue";
 return `<div class="links" aria-label="${label}"><a href="${g}" target="_blank" rel="noopener">Google Flights</a><a href="${sk}" target="_blank" rel="noopener" class="alt">Skyscanner</a><a href="${kw}" target="_blank" rel="noopener" class="alt">Kiwi</a></div>`}
function renderPlan(){const c=BY[S.lastDest];if(!c){$("planBody").innerHTML='<div class="card">בחר יעד מתוך ההמלצות.</div>';return}
 const P=planDates();const ap=AIRPORTS[c.iso]||[];const ai=Math.min(P.ap||0,ap.length-1);const to=ap[ai]||"";
 const r=score(c)||{combos:c.nb.filter(n=>BY[n.iso]).map(n=>({...n,c:BY[n.iso],v:!!S.visited[n.iso]}))};
 const tw=INT.reduce((a,[k])=>a+(S.w[k]||0),0);
 const trips=(TRIPS[c.iso]||[]).map(t=>({t,s:t[4].reduce((a,k)=>a+(S.w[k]||0),0)})).sort((a,b)=>b.s-a.s);
 const en=(()=>{try{return EN.of(c.iso)}catch{return c.he}})();
 const combos=(r.combos||[]).slice(0,3);
 $("planBody").innerHTML=`<article class="card"><h3>${flag(c.iso)} תכנון טיול ל${c.he}</h3>
 <p>✈️ זמן טיסה משוער מנתב"ג: ~${c.fh} שעות · ${c.direct?"בדרך כלל יש טיסות ישירות מנתב\"ג":"בדרך כלל אין טיסה ישירה – צפו לקונקשן"} <small class="muted">(משוער)</small>${S.flight==="direct"?" · מסונן לטיסות ישירות":""}</p>
 <div class="pform">
  <label>שדה יעד<select id="pAp">${ap.map((a,i)=>`<option value="${i}" ${i===ai?"selected":""}>${a}</option>`).join("")}</select></label>
  <label>יציאה<input type="date" id="pDep" value="${P.dep}"></label>
  <label>חזרה<input type="date" id="pRet" value="${P.ret}"></label>
  <label>או חודש (גמיש)<select id="pMon"><option value="0">—</option>${MONTHS.map((m,i)=>`<option value="${i+1}" ${P.month==i+1?"selected":""}>${m}</option>`).join("")}</select></label>
  <label>נוסעים<input type="number" id="pPax" min="1" max="9" value="${P.pax}"></label>
 </div>
 <h4>חיפוש טיסות TLV ← ${to}</h4>${flightLinks("TLV",to,P,"טיסות")}
 ${combos.map(n=>{const na=(AIRPORTS[n.iso]||[])[0];if(!na)return"";const P1={...P,ret:""},P2={...P,dep:P.ret||"",ret:""};
  return `<div class="combo">🔗 <b>שילוב עם ${flag(n.iso)} ${n.c.he}</b> (~${n.h} ש' ב${MODE[n.mode]}): כדאי לבדוק "טיסה פתוחה" – הלוך ל־${to} וחזור מ־${na} (או הפוך), כדי לא לחזור על הדרך.
   <div class="links"><a class="alt" target="_blank" rel="noopener" href="https://www.google.com/travel/flights?hl=iw&q=${encodeURIComponent(`One way flights from TLV to ${to}${P1.dep?" on "+P1.dep:""}${S.flight==="direct"?" nonstop":""}`)}">הלוך TLV←${to}</a><a class="alt" target="_blank" rel="noopener" href="https://www.google.com/travel/flights?hl=iw&q=${encodeURIComponent(`One way flights from ${na} to TLV${P2.dep?" on "+P2.dep:""}${S.flight==="direct"?" nonstop":""}`)}">חזור ${na}←TLV</a><a class="alt" target="_blank" rel="noopener" href="https://www.skyscanner.co.il/transport/flights/tlv/${to.toLowerCase()}/?adultsv2=${P.pax}&rtn=0">Skyscanner כיוון אחד</a></div></div>`}).join("")}
 </article>
 <article class="card"><h3>🧭 טיולי יום מומלצים</h3><p class="muted">${tw?"מדורג לפי תחומי העניין שבחרת":"הגדר תחומי עניין בפרופיל לדירוג אישי"}. הנתונים כלליים – בדקו עונות, שעות ופתיחה לפני היציאה.</p>
 ${trips.map(({t})=>{const[base,name,desc,tm,tags]=t;const q=`${name} ${c.he}`;const qe=`${name} ${en}`;
  return `<div class="trip"><h4>${name}</h4><div class="muted">📍 מ${base} · ⏱️ ${tm}</div><p>${desc}</p>
  <div>${tags.map(k=>`<span class="ichip ${(S.w[k]||0)>=1?"m":""}">${INTN[k]}</span>`).join("")}</div>
  <div class="links"><a class="alt" target="_blank" rel="noopener" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(name.split(" – ")[0]+", "+base+", "+c.he)}">🗺️ מפה</a><a class="alt" target="_blank" rel="noopener" href="https://www.getyourguide.com/s/?q=${encodeURIComponent(qe)}">GetYourGuide</a><a class="alt" target="_blank" rel="noopener" href="https://www.viator.com/searchResults/all?text=${encodeURIComponent(qe)}">Viator</a></div></div>`}).join("")}
 </article>`;
 const upd=()=>{P.ap=+$("pAp").value;P.dep=$("pDep").value;P.ret=$("pRet").value;P.month=+$("pMon").value;P.pax=Math.max(1,Math.min(9,+$("pPax").value||1));save();renderPlan()};
 ["pAp","pDep","pRet","pMon","pPax"].forEach(id=>$(id).onchange=upd)}
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
