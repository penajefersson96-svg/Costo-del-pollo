/* ══ CostódelPollo · app.js PARTE 1/2 ══ */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const nf2=new Intl.NumberFormat('es',{minimumFractionDigits:2,maximumFractionDigits:2});
const nf0=new Intl.NumberFormat('es',{maximumFractionDigits:0});
const nf3=new Intl.NumberFormat('es',{maximumFractionDigits:3});
const money=v=>'$'+nf2.format(v),smart=v=>'$'+(Math.abs(v)>=1000?nf0.format(v):nf2.format(v));
const num=el=>{const v=parseFloat(el.value);return isFinite(v)?v:0};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DAY=864e5,MAXD=45,KD='pc_d3',KS='pc_s3';
document.head.insertAdjacentHTML('beforeend','<style>.tabs{position:sticky;top:0;z-index:50;display:flex;gap:6px;padding:8px 2px;background:var(--pap);overflow-x:auto}.tab{flex:1;white-space:nowrap;font:inherit;font-weight:900;font-size:.76rem;padding:9px 8px;border:2px solid var(--ink);border-radius:99px;background:#fff;cursor:pointer}.tab.on{background:var(--ye);box-shadow:2px 2px 0 var(--ink)}.page{display:none}.page.on{display:block}.fr input[type=date]{flex:1;padding:9px 8px;font-size:.85rem}.mq{width:76px;flex:none}.mcv{font-size:.66rem;font-weight:800;color:var(--i2);white-space:nowrap}.l2b{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:7px}.l2b input{padding:8px 7px;font-size:.9rem;text-align:right}</style>');
$('#hoy').textContent=new Date().toLocaleDateString('es',{weekday:'long',day:'numeric',month:'long',year:'numeric'});

/* Fechas del ciclo (fin máx. 45 días) */
const c1=$('#fN').closest('.card');
$('#fFecha').closest('.f').style.display='none';
const dw=document.createElement('div');dw.className='r2';
dw.innerHTML='<div class="f"><label class="lb">Inicio del ciclo</label><input type="date" id="fIni"></div><div class="f"><label class="lb">Fin del ciclo (máx. 45 días)</label><input type="date" id="fFin"></div>';
c1.insertBefore(dw,$('#fN').closest('.r2'));

/* Tarjeta Mortalidad: registro por fecha */
const mW=$('#fM').closest('.f');mW.style.display='none';
const mC=document.createElement('section');mC.className='card';
mC.innerHTML='<span class="tag">☠️ Mortalidad</span><p class="sub">Anota fecha y cantidad: la app calcula cuánto comió cada muerto según sus días vividos. Los muertos NO entran al peso de venta.</p><div id="mortRows"></div><button class="addb" id="btnMort" type="button">＋ Se murieron… (fecha y cantidad)</button><div class="strip">☠️ <b id="mTot">0</b> muertos · mort. <b id="mPct">0%</b> · Pérdida: <b id="mLoss">$0,00</b></div>';
mC.appendChild(mW);
c1.parentElement.insertBefore(mC,$('#gc').closest('.card'));
$('#fv').closest('.sub').innerHTML='Ciclo de <b id="fv">45</b> días (máx. 45). Cada insumo y cada muerto consumen según sus días vividos.';
$('#btnMort').onclick=()=>{addMRow(new Date().toISOString().slice(0,10),'');recalcM();recalc();draft()};
$('#mortRows').addEventListener('click',e=>{if(e.target.closest('.fd')){e.target.closest('.fr').remove();recalcM();recalc();draft()}});
function addMRow(d='',q=''){const w=document.createElement('div');w.className='fr';w.innerHTML='<div class="l1"><input type="date" class="mdt" value="'+d+'"><input type="number" class="mq" inputmode="numeric" min="0" step="1" placeholder="Cant." value="'+q+'"><span class="mcv"></span><button type="button" class="fd">✕</button></div>';$('#mortRows').appendChild(w)}
function cycleDays(){const a=$('#fIni').valueAsDate,b=$('#fFin').valueAsDate;if(!a||!b)return MAXD;return Math.min(MAXD,Math.max(1,Math.round((b-a)/DAY)+1))}
function frac(days,a,b){if(days<=0)return 0;return Math.max(0,Math.min(days,b)-a+1)/(b-a+1)}
function mortGroups(){const ini=$('#fIni').valueAsDate,cd=cycleDays(),G=[];$$('#mortRows .fr').forEach(r=>{const q=Math.max(0,Math.round(num(r.querySelector('.mq'))));if(!q)return;const dv=r.querySelector('.mdt').valueAsDate;let D=cd;if(ini&&dv)D=Math.min(cd,Math.max(1,Math.floor((dv-ini)/DAY)+1));G.push({q,D})});return G}
function recalcM(){let acc=0;const ini=$('#fIni').valueAsDate,cd=cycleDays();$$('#mortRows .fr').forEach(r=>{const q=Math.max(0,Math.round(num(r.querySelector('.mq'))));const dv=r.querySelector('.mdt').valueAsDate;let D=cd;if(ini&&dv)D=Math.min(cd,Math.max(1,Math.floor((dv-ini)/DAY)+1));if(q){acc+=q;r.querySelector('.mcv').textContent='murió el día '+D+' · acum. '+acc}else r.querySelector('.mcv').textContent=''});$('#fM').value=acc||'';return acc}

/* Insumos con ventana de días */
const DEF=[['Alimento Inicio','kg',1,14,1000],['Alimento Finalizador','kg',15,45,1600],['Maíz','kg',15,45,1200],['Harina de soya','kg',15,45,500],['Aceite','L',15,45,30],['Vinagre (en el agua)','L',1,45,20]];
let ri=0;
function addRow(d={}){ri++;const w=document.createElement('div');w.className='fr';
w.innerHTML='<div class="l1"><input type="text" class="fn" placeholder="Ej. Melaza, sal…" value="'+esc(d.n||'')+'"><select class="fu"><option value="kg"'+((d.u||'kg')==='kg'?' selected':'')+'>kg</option><option value="L"'+(d.u==='L'?' selected':'')+'>L</option></select><button type="button" class="fd">✕</button></div><div class="l2"><div><label class="lb">Saco trae (kg/L)</label><input type="number" class="fc" inputmode="decimal" min="0" step="any" placeholder="0" value="'+(d.c??'')+'"></div><div><label class="lb">Precio saco</label><input type="number" class="fp" inputmode="decimal" min="0" step="any" placeholder="$0" value="'+(d.p??'')+'"></div><div><label class="lb">Gramos x pollo</label><input type="number" class="fg" inputmode="decimal" min="0" step="any" placeholder="0" value="'+(d.g??'')+'"></div></div><div class="l2b"><div><label class="lb">Desde el día</label><input type="number" class="fa" inputmode="numeric" min="1" max="45" value="'+(d.a??1)+'"></div><div><label class="lb">Hasta el día</label><input type="number" class="fb" inputmode="numeric" min="1" max="45" value="'+(d.b??45)+'"></div></div><div class="l3">—</div>';
$('#feedRows').appendChild(w);return w}
function resetRows(l){$('#feedRows').innerHTML='';ri=0;(l&&l.length?l:DEF.map(a=>({n:a[0],u:a[1],a:a[2],b:a[3],g:a[4]}))).forEach(r=>addRow(r))}
$('#btnAdd').onclick=()=>{addRow({});$('#feedRows').lastChild.querySelector('.fn').focus()};
$('#feedRows').addEventListener('click',e=>{if(e.target.closest('.fd')){e.target.closest('.fr').remove();recalc();draft()}});

function tween(el,t,f){if(!isFinite(t)){el.textContent='—';el.dataset.v=0;return}const s=parseFloat(el.dataset.v||0);el.dataset.v=t;if(s===t){el.textContent=f(t);return}if(el._r)cancelAnimationFrame(el._r);const t0=performance.now();const st=n=>{const k=Math.min(1,(n-t0)/380),e=1-Math.pow(1-k,3);el.textContent=f(s+(t-s)*e);if(k<1)el._r=requestAnimationFrame(st)};el._r=requestAnimationFrame(st)}
function setT(el,t){if(el.textContent!==t){el.textContent=t;el.classList.remove('tick');void el.offsetWidth;el.classList.add('tick')}}

let last={inv:0,gan:0,ing:0,V:0};
function recalc(){
 const N=num($('#fN')),cd=cycleDays(),groups=mortGroups();
 const M=groups.reduce((s,g)=>s+g.q,0),V=Math.max(0,Math.round(N-M));
 const cp=num($('#fCP')),md=num($('#fMD')),kgC=num($('#fKG')),pr=num($('#fPR'));
 let ca=0,kt=0;const items=[];
 $$('#feedRows .fr').forEach(r=>{
  const c=num(r.querySelector('.fc')),p=num(r.querySelector('.fp')),g=num(r.querySelector('.fg'));
  const a=Math.min(45,Math.max(1,num(r.querySelector('.fa'))||1)),b=Math.min(45,Math.max(a,num(r.querySelector('.fb'))||45));
  const pp=c>0?p/c:0;
  let eq=V*frac(cd,a,b);groups.forEach(x=>{eq+=x.q*frac(x.D,a,b)});
  const kg=g/1000*eq,tot=kg*pp;
  ca+=tot;kt+=kg;items.push({g,pp,a,b});
  const l3=r.querySelector('.l3'),txt=(p||g)?('$'+nf2.format(pp)+' por '+r.querySelector('.fu').value+' · por pollo: '+money(g/1000*frac(cd,a,b)*pp)+' · Total: <b>'+money(tot)+'</b>'):'—';
  if(l3.dataset.l!==txt){l3.innerHTML=txt;l3.dataset.l=txt}
 });
 const inv=cp+md+ca,consV=V>0?kt/V:0,cPol=V>0?inv/V:NaN,cKg=kgC>0?inv/kgC:NaN,ing=kgC*pr,gan=ing-inv,mar=inv>0?gan/inv*100:NaN,gp=V>0?gan/V:NaN,pm=V>0?kgC/V:NaN,mp=N>0?M/N*100:0;
 $('#fv').textContent=cd;
 tween($('#rV'),V,v=>nf0.format(Math.round(v)));setT($('#rVsub'),'de '+nf0.format(N)+' · mort. '+nf2.format(mp)+'%');
 tween($('#rI'),inv,smart);setT($('#rIsub'),'Pollitos '+money(cp)+' · Alim. '+money(ca)+' · Med. '+money(md));
 tween($('#rC'),consV,v=>nf3.format(v)+' kg');setT($('#rCsub'),'total consumido: '+nf0.format(kt)+' kg/L');
 tween($('#rP'),cPol,smart);tween($('#rK'),cKg,smart);
 setT($('#rKsub'),pr>0&&isFinite(cKg)?(pr>=cKg?'✅ +'+money(pr-cKg)+'/kg':'⚠️ -'+money(cKg-pr)+'/kg'):'venta: '+(pr>0?money(pr):'—'));
 tween($('#rIn'),ing,smart);tween($('#rG'),gan,smart);
 const gc=$('#gc');gc.classList.remove('pos','neg');gc.classList.add(gan>=0?'pos':'neg');
 $('#chM').textContent='Margen: '+(isFinite(mar)?nf2.format(mar)+'%':'—');
 $('#chP').textContent='Por pollo: '+(isFinite(gp)?money(gp):'—');
 setT($('#s1'),nf3.format(consV));setT($('#s2'),nf0.format(kt));setT($('#s3'),money(ca));
 $('#pm').textContent=isFinite(pm)&&pm>0?nf3.format(pm)+' kg':'—';
 const chickPer=N>0?cp/N:0,medPer=N>0?md/N:0;let loss=0;
 groups.forEach(x=>{let f=0;items.forEach(it=>{f+=it.g/1000*frac(x.D,it.a,it.b)*it.pp});loss+=x.q*(chickPer+medPer+f)});
 $('#mTot').textContent=nf0.format(M);$('#mPct').textContent=nf2.format(mp)+'%';$('#mLoss').textContent=money(loss);
 last={inv,gan,ing,V};
}

function collect(){return{nombre:$('#fNombre').value,ini:$('#fIni').value,fin:$('#fFin').value,n:$('#fN').value,cp:$('#fCP').value,med:$('#fMD').value,kg:$('#fKG').value,precio:$('#fPR').value,mort:$$('#mortRows .fr').map(r=>({d:r.querySelector('.mdt').value,q:r.querySelector('.mq').value})),rows:$$('#feedRows .fr').map(r=>({n:r.querySelector('.fn').value,u:r.querySelector('.fu').value,c:r.querySelector('.fc').value,p:r.querySelector('.fp').value,g:r.querySelector('.fg').value,a:r.querySelector('.fa').value,b:r.querySelector('.fb').value}))}}
function apply(d){if(!d)return;$('#fNombre').value=d.nombre||'';$('#fIni').value=d.ini||'';$('#fFin').value=d.fin||'';$('#fFecha').value=d.ini?new Date(d.ini+'T00:00:00').toLocaleDateString('es'):'';$('#fN').value=d.n??'';$('#fCP').value=d.cp??'';$('#fMD').value=d.med??'';$('#fKG').value=d.kg??'';$('#fPR').value=d.precio??'';$('#mortRows').innerHTML='';(d.mort||[]).forEach(m=>addMRow(m.d,m.q));resetRows(d.rows&&d.rows.length?d.rows:null);recalc()}
let dT;function draft(){clearTimeout(dT);dT=setTimeout(()=>{try{localStorage.setItem(KD,JSON.stringify(collect()))}catch(e){}},350)}
const onIn=e=>{if(e.target.matches('input,select')){recalcM();recalc();draft()}};
document.querySelector('main').addEventListener('input',onIn);
document.querySelector('main').addEventListener('change',onIn);

/* Pestañas tipo app */
const main=document.querySelector('main');
main.insertAdjacentHTML('afterbegin','<nav class="tabs"><button class="tab on" data-t="calc">🧮 Cálculo</button><button class="tab" data-t="feed">🌾 Alimento</button><button class="tab" data-t="mort">☠️ Muertes</button><button class="tab" data-t="lotes">🗂️ Lotes</button></nav>');
['calc','feed','mort','lotes'].forEach((t,i)=>{const p=document.createElement('div');p.className='page'+(i===0?' on':'');p.id='pg-'+t;main.appendChild(p)});
$('#pg-calc').append(c1,$('#fCP').closest('.card'),$('#fKG').closest('.card'),$('#gc').closest('.card'));
$('#pg-feed').append($('#feedRows').closest('.card'));
$('#pg-mort').append(mC);
$('#pg-lotes').append($('#savedList').closest('.card'),$('#chart').closest('.card'));
document.querySelector('.tabs').addEventListener('click',e=>{const b=e.target.closest('.tab');if(!b)return;$$('.tab').forEach(x=>x.classList.toggle('on',x===b));$$('.page').forEach(p=>p.classList.toggle('on',p.id==='pg-'+b.dataset.t))});

resetRows(null);
try{const d=JSON.parse(localStorage.getItem(KD)||'null');if(d)apply(d)}catch(e){}
recalcM();recalc();
/* ══ FIN PARTE 1 — pega la PARTE 2 al final ══ */
/* ══ CostódelPollo · app.js PARTE 2/2 ══ */
document.head.insertAdjacentHTML('beforeend','<style>.cr.live{opacity:.8;border:2px dashed var(--i2);border-radius:10px;padding:8px;margin-top:6px}.cr.live .cb{animation:none}</style>');
let saved=[];try{saved=JSON.parse(localStorage.getItem(KS)||'[]')}catch(e){}
function renderChart(){
  const ch=$('#chart');
  const live={nombre:($('#fNombre').value||'Lote en curso'),fecha:'ahora',live:true,res:{inv:last.inv,ing:last.ing,gan:last.gan,V:last.V}};
  const all=[live,...saved],mx=Math.max(...all.map(s=>Math.max(s.res.inv,s.res.ing)),1);
  ch.innerHTML=all.slice(0,9).map(s=>{const wi=Math.max(3,s.res.inv/mx*100),wg=Math.max(3,s.res.ing/mx*100),m=s.res.inv>0?nf0.format(s.res.gan/s.res.inv*100)+'%':'—';return '<div class="cr'+(s.live?' live':'')+'"><div class="cn"><span>'+(s.live?'🔄 ':'🐔 ')+esc(s.nombre)+'</span><small>'+esc(s.fecha)+'</small></div><div class="cbl"><div class="cb i" style="--w:'+wi+'%"></div><span class="cv">Inv. '+smart(s.res.inv)+'</span></div><div class="cbl"><div class="cb g" style="--w:'+wg+'%"></div><span class="cv">Ing. '+smart(s.res.ing)+'</span></div><div class="cg '+(s.res.gan>=0?'pos2':'neg2')+'">'+(s.res.gan>=0?'▲':'▼')+' '+smart(s.res.gan)+' · margen '+m+'</div></div>'}).join('');
}
let dcT;function debChart(){clearTimeout(dcT);dcT=setTimeout(renderChart,400)}
const _rc=recalc;recalc=function(){_rc();debChart()};
function renderSaved(){
  $('#cnt').textContent=saved.length;
  $('#savedList').innerHTML=saved.length?saved.map(s=>'<div class="sim" data-id="'+s.id+'"><div><h3>🐔 '+esc(s.nombre)+'</h3><div class="me">'+esc(s.fecha)+' · '+nf0.format(s.res.V)+' pollos · inv. '+smart(s.res.inv)+'</div><div class="g '+(s.res.gan>=0?'pos2':'neg2')+'">'+(s.res.gan>=0?'▲':'▼')+' '+smart(s.res.gan)+'</div></div><div class="sa"><button class="mini" data-a="l">Cargar</button><button class="mini md" data-a="d">✕</button></div></div>').join(''):'<div class="empty">Aún no has guardado lotes. 🐔</div>';
  renderChart();
}
$('#savedList').addEventListener('click',e=>{const b=e.target.closest('[data-a]');if(!b)return;const id=+b.closest('.sim').dataset.id;
  if(b.dataset.a==='l'){const s=saved.find(x=>x.id===id);if(s){apply(s.data);scrollTo({top:0,behavior:'smooth'});toast('📂 '+s.nombre)}}
  else{if(b.dataset.arm){saved=saved.filter(x=>x.id!==id);try{localStorage.setItem(KS,JSON.stringify(saved))}catch(e){}renderSaved();toast('🗑️ Eliminada')}else{b.dataset.arm=1;b.textContent='¿Seguro?';b.classList.add('armed');setTimeout(()=>{b.textContent='✕';b.classList.remove('armed');delete b.dataset.arm},2200)}}});
$('#btnSave').onclick=()=>{const d=collect();if(!parseFloat(d.n)){toast('🐣 Escribe cuántos pollitos compraste');$('#fN').focus();return}
  saved.unshift({id:Date.now(),nombre:d.nombre.trim()||('Lote '+nf0.format(+d.n)),fecha:new Date().toLocaleDateString('es',{day:'2-digit',month:'short',year:'numeric'}),data:d,res:{inv:last.inv,gan:last.gan,ing:last.ing,V:last.V}});
  try{localStorage.setItem(KS,JSON.stringify(saved));localStorage.setItem(KD,JSON.stringify(d))}catch(e){}
  renderSaved();toast('💾 Lote guardado y en la gráfica')};
$('#btnClear').onclick=function(){if(this.dataset.arm){delete this.dataset.arm;this.textContent='🧹 Limpiar';this.classList.remove('armed');['fNombre','fN','fCP','fMD','fKG','fPR','fIni','fFin'].forEach(i=>$('#'+i).value='');$('#fFecha').value=new Date().toLocaleDateString('es');$('#mortRows').innerHTML='';resetRows(null);recalcM();recalc();try{localStorage.removeItem(KD)}catch(e){}toast('🧹 Datos limpiados')}else{this.dataset.arm=1;this.textContent='¿Seguro?';this.classList.add('armed');setTimeout(()=>{delete this.dataset.arm;this.textContent='🧹 Limpiar';this.classList.remove('armed')},2500)}};
/* Respaldo anti-borrado */
function openBK(mode){$('#bkP').hidden=false;const ex=mode==='e';$('#bkText').readOnly=ex;$('#bkText').value=ex?JSON.stringify({app:'Costódelpollo',saved:saved,draft:collect()}):'';$('#bkCopy').hidden=!ex;$('#bkDown').hidden=!ex;$('#bkRest').hidden=ex;$('#bkHint').textContent=ex?'Copia este texto o descarga el archivo y guárdalo en Drive/Notas. Así no pierdes nada aunque borres la app.':'Pega aquí el texto de tu respaldo y toca ✔ Restaurar.';$('#bkText').focus()}
$('#btnExp').onclick=()=>openBK('e');$('#btnImp').onclick=()=>openBK('i');$('#bkClose').onclick=()=>$('#bkP').hidden=true;
$('#bkCopy').onclick=()=>{const t=$('#bkText');t.focus();t.select();try{navigator.clipboard.writeText(t.value);toast('📋 Copiado')}catch(e){try{document.execCommand('copy');toast('📋 Copiado')}catch(e2){toast('Mantén pulsado el texto y elige Copiar')}}};
$('#bkDown').onclick=()=>{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([$('#bkText').value],{type:'application/json'}));a.download='Costódelpollo-respaldo.json';a.click();toast('⬇ Archivo descargado')};
$('#bkRest').onclick=()=>{try{const d=JSON.parse($('#bkText').value);if(!Array.isArray(d.saved))throw 0;saved=d.saved;try{localStorage.setItem(KS,JSON.stringify(saved))}catch(e){}if(d.draft)apply(d.draft);renderSaved();$('#bkP').hidden=true;toast('✅ Restaurado: '+saved.length+' lotes')}catch(e){toast('⚠️ Texto no válido')}};
let tT;function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(tT);tT=setTimeout(()=>t.classList.remove('show'),2400)}
renderSaved();
/* ══ PARCHE 1 ══ */
document.head.insertAdjacentHTML('beforeend','<style>.fr .l1{flex-wrap:wrap}.mcv{white-space:normal;flex-basis:100%;order:9;margin-top:3px}.fr input[type=date]{min-width:0;flex:1;font-size:.95rem;padding:10px 8px}.mq{width:88px}</style>');
$('#pm').closest('.hint').innerHTML='🐔 Peso medio por pollo <b>vivo/vendido</b>: <span id="pm">—</span> · los muertos no se pesan';
$('#rC').closest('.ti').querySelector('.tl2').textContent='🌾 Come un pollo vivo';
const _rc2=recalc;
recalc=function(){_rc2();
  const cd=cycleDays();let pl=0;
  $$('#feedRows .fr').forEach(r=>{const g=num(r.querySelector('.fg'));const a=Math.min(45,Math.max(1,num(r.querySelector('.fa'))||1)),b=Math.min(45,Math.max(a,num(r.querySelector('.fb'))||45));pl+=g/1000*frac(cd,a,b)});
  const rC=$('#rC');rC.dataset.v=pl;rC.textContent=nf3.format(pl)+' kg';
  $('#rCsub').textContent='lote completo (vivos+muertos): '+$('#s2').textContent+' kg/L';
};
recalc();
/* ══ PARCHE 2 ══ */
$('#pm').closest('.hint').innerHTML='🥩 Carne total: <b id="ct">0</b> kg (la que pusiste, con muertos o sin muertos) · peso medio por vivo: <span id="pm">—</span>';
const _rc3=recalc;
recalc=function(){_rc3();$('#ct').textContent=$('#fKG').value||'0'};
recalc();
/* ══ PARCHE 3 · nombre nuevo y carne limpia ══ */
document.title='Precio del Pollo · Calculadora';
document.querySelector('h1').innerHTML='Precio del <em>Pollo</em>';
document.querySelector('.tl').textContent='Calculadora de costos · Pollo de engorde';
$('#pm').closest('.hint').innerHTML='🥩 Carne total en canal: <b id="ct">0</b> kg<span id="pm" hidden></span>';
recalc();
/* ══ PARCHE 4 · archivo con hoja de compartir ══ */
$('#bkDown').onclick=async()=>{
  const txt=$('#bkText').value;
  const file=new File([txt],'precio-del-pollo-respaldo.json',{type:'application/json'});
  try{
    if(navigator.canShare&&navigator.canShare({files:[file]})){
      await navigator.share({files:[file],title:'Respaldo Precio del Pollo'});
      toast('📤 Elige dónde guardarlo');
    }else{
      const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([txt],{type:'application/json'}));a.download='precio-del-pollo-respaldo.json';a.click();
      toast('⬇ Revisa Descargas · si no aparece, usa Copiar');
    }
  }catch(e){toast('📋 Mejor usa Copiar y pégalo en Notas/Drive');}
};
/* ══ PARCHE 5 · descarga directa ══ */
$('#bkDown').onclick=()=>{
  const txt=$('#bkText').value;
  const url=URL.createObjectURL(new Blob([txt],{type:'application/json'}));
  const a=document.createElement('a');
  a.href=url;a.download='precio-del-pollo-respaldo.json';
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(()=>URL.revokeObjectURL(url),4000);
  toast('⬇ Revisa tus Descargas');
};
/* ══ PARCHE 6 · restaurar desde archivo ══ */
const bkText=$('#bkText');
if(!$('#bkFileInput')){
  const wrap=document.createElement('div');
  wrap.innerHTML='<button class="mini" id="bkFileBtn" type="button" hidden>📂 Cargar archivo</button><input type="file" id="bkFileInput" accept=".json,application/json" hidden>';
  bkText.parentElement.insertBefore(wrap,bkText.nextSibling);
}
const fileBtn=$('#bkFileBtn'),fileIn=$('#bkFileInput');
const _openBK=openBK;
openBK=function(mode){_openBK(mode);fileBtn.hidden=(mode==='e')};
fileBtn.onclick=()=>fileIn.click();
fileIn.onchange=async e=>{
  const f=e.target.files[0];if(!f)return;
  try{
    const txt=await f.text();
    JSON.parse(txt);
    bkText.value=txt;
    toast('✅ Archivo cargado, toca ✔ Restaurar');
  }catch(err){toast('⚠️ Archivo no válido');}
  fileIn.value='';
};
/* ══ PARCHE 7 · instalable + offline ══ */
if(!document.querySelector('link[rel=manifest]')){
  const ml=document.createElement('link');ml.rel='manifest';ml.href='manifest.json';document.head.appendChild(ml);
}
if('serviceWorker' in navigator){window.addEventListener('load',()=>{navigator.serviceWorker.register('sw.js').catch(()=>{})})}
