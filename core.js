/* ══ AVIPRO v2 · core.js completo ══ */
const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
const nf2=new Intl.NumberFormat('es',{minimumFractionDigits:2,maximumFractionDigits:2});
const nf0=new Intl.NumberFormat('es',{maximumFractionDigits:0});
const nf3=new Intl.NumberFormat('es',{maximumFractionDigits:3});
const money=v=>'$'+nf2.format(v);
const smart=v=>'$'+(Math.abs(v)>=1000?nf0.format(v):nf2.format(v));
const num=el=>{const v=parseFloat(el.value);return isFinite(v)?v:0};
const val=(v,f=0)=>{const x=parseFloat(v);return isFinite(x)?x:f};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const DAY=864e5,MAXD=45;
const KD='pc_d3',KS='pc_s3',KN='avipro_negocio';
let tT;function toast(m){let t=$('#toast');if(!t){t=document.createElement('div');t.id='toast';document.body.appendChild(t)}t.textContent=m;t.classList.add('show');clearTimeout(tT);tT=setTimeout(()=>t.classList.remove('show'),2400)}
function negocio(){return localStorage.getItem(KN)||'Mi Granja'}
function setNegocio(n){localStorage.setItem(KN,n.trim()||'Mi Granja');pintaTop()}
function pintaTop(){const b=$('.biz');if(b)b.textContent=negocio();const d=$('.date');if(d)d.textContent=new Date().toLocaleDateString('es',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
function loadJSON(k,f){try{const v=JSON.parse(localStorage.getItem(k));return v??f}catch(e){return f}}
function saveJSON(k,v){try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function lotes(){return loadJSON(KS,[])}
function draft(){return loadJSON(KD,null)}
function frac(days,a,b){if(days<=0)return 0;return Math.max(0,Math.min(days,b)-a+1)/(b-a+1)}
function cycleDays(ini,fin){if(!ini||!fin)return MAXD;const a=new Date(ini),b=new Date(fin);if(isNaN(a)||isNaN(b))return MAXD;return Math.min(MAXD,Math.max(1,Math.round((b-a)/DAY)+1))}
function mortGroups(ini,mort,cd){return (mort||[]).map(m=>{const q=Math.max(0,Math.round(val(m.q)));if(!q)return null;let D=cd;if(ini&&m.d){const dv=new Date(m.d);if(!isNaN(dv))D=Math.min(cd,Math.max(1,Math.floor((dv-new Date(ini))/DAY)+1))}return{q,D}}).filter(Boolean)}
function calcLote(d){
  d=d||{};
  const N=val(d.n),cd=cycleDays(d.ini,d.fin),groups=mortGroups(d.ini,d.mort,cd);
  const M=groups.reduce((s,g)=>s+g.q,0),V=Math.max(0,Math.round(N-M));
  const cp=val(d.cp),md=val(d.med),kgC=val(d.kg),pr=val(d.precio);
  let ca=0,kt=0;const items=[];
  (d.rows||[]).forEach(r=>{
    const c=val(r.c),p=val(r.p),g=val(r.g);
    const a=Math.min(45,Math.max(1,val(r.a,1)||1)),b=Math.min(45,Math.max(a,val(r.b,45)||45));
    const pp=(r.pp!==undefined&&r.pp!=='')?val(r.pp):(c>0?p/c:0);
    let eq=V*frac(cd,a,b);groups.forEach(x=>{eq+=x.q*frac(x.D,a,b)});
    const kg=g/1000*eq,tot=kg*pp;
    ca+=tot;kt+=kg;items.push({g,pp,a,b,u:r.u});
  });
  const inv=cp+md+ca,consV=V>0?kt/V:0,cPol=V>0?inv/V:NaN,cKg=kgC>0?inv/kgC:NaN;
  const ing=kgC*pr,gan=ing-inv,mar=inv>0?gan/inv*100:NaN,gp=V>0?gan/V:NaN,pm=V>0?kgC/V:NaN,mp=N>0?M/N*100:0;
  const chickPer=N>0?cp/N:0,medPer=N>0?md/N:0;let loss=0;
  groups.forEach(x=>{let f=0;items.forEach(it=>{f+=it.g/1000*frac(x.D,it.a,it.b)*it.pp});loss+=x.q*(chickPer+medPer+f)});
  let pl=0;(d.rows||[]).forEach(r=>{const a=Math.min(45,Math.max(1,val(r.a,1)||1)),b=Math.min(45,Math.max(a,val(r.b,45)||45));pl+=val(r.g)/1000*frac(cd,a,b)});
  return{N,M,V,cd,groups,ca,kt,inv,consV,pl,cPol,cKg,ing,gan,mar,gp,pm,mp,loss,items,cp,md,kgC,pr};
}
function semaforo(mp){return mp<5?'ok':(mp<=8?'warn':'bad')}
function exportTxt(){return JSON.stringify({app:'avipro',saved:lotes(),draft:draft(),negocio:negocio()})}
function importTxt(txt){const d=JSON.parse(txt);if(!Array.isArray(d.saved))throw 0;if(d.negocio)setNegocio(d.negocio);saveJSON(KS,d.saved);if(d.draft)saveJSON(KD,d.draft);return d.saved.length}
/* ══ Reporte gráfico para WhatsApp ══ */
function canvasReporte(nombre,r){
  const W=1080,H=1350,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
  const F='system-ui,sans-serif';
  x.fillStyle='#F3F5F2';x.fillRect(0,0,W,H);
  x.fillStyle='#1E5631';x.fillRect(0,0,W,260);
  x.fillStyle='#F2F7F0';x.font='800 30px '+F;x.fillText(negocio().toUpperCase(),60,90);
  x.globalAlpha=.8;x.font='600 26px '+F;x.fillText('Reporte de lote · '+new Date().toLocaleDateString('es'),60,140);x.globalAlpha=1;
  x.font='800 56px '+F;x.fillText(nombre,60,215);
  const sem=semaforo(r.mp),col=sem==='ok'?'#1E7A3C':sem==='warn'?'#A97A12':'#C0392B';
  x.fillStyle=col;x.beginPath();x.arc(78,320,16,0,7);x.fill();
  x.fillStyle='#182420';x.font='800 34px '+F;x.fillText('Mortalidad '+nf2.format(r.mp)+'%  ·  Día '+r.cd,110,332);
  let y=410;
  const fila=(l,v)=>{x.fillStyle='#61706A';x.font='700 28px '+F;x.fillText(l,60,y);x.fillStyle='#182420';x.font='800 34px '+F;x.textAlign='right';x.fillText(v,W-60,y);x.textAlign='left';y+=64};
  fila('Pollitos iniciales',nf0.format(r.N));fila('Aves vivas',nf0.format(r.V));fila('Alimento por pollo',nf3.format(r.pl)+' kg');fila('Inversión total',smart(r.inv));fila('Costo por kg',isFinite(r.cKg)?smart(r.cKg):'—');fila('Carne en canal',nf0.format(r.kgC)+' kg');fila('Ingreso estimado',smart(r.ing));
  y+=10;const mx=Math.max(r.inv,r.ing,1);
  x.fillStyle='#61706A';x.font='700 26px '+F;x.fillText('Inversión',60,y);x.fillText('Ingreso',60,y+70);
  x.fillStyle='#C98A2D';x.fillRect(260,y-26,640*r.inv/mx,34);
  x.fillStyle='#1E7A3C';x.fillRect(260,y+44,640*r.ing/mx,34);
  y+=150;
  x.fillStyle=r.gan>=0?'#1E7A3C':'#C0392B';x.font='800 64px '+F;
  x.fillText((r.gan>=0?'Ganancia ':'Pérdida ')+smart(Math.abs(r.gan)),60,y);
  x.fillStyle='#61706A';x.font='600 22px '+F;x.fillText('Generado con Sistema Avícola',60,H-40);
  return c;
}
async function compartirReporte(nombre,r){
  try{
    const blob=await new Promise(res=>canvasReporte(nombre,r).toBlob(res,'image/png'));
    const f=new File([blob],'reporte-'+nombre.replace(/\s+/g,'-')+'.png',{type:'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'Reporte '+nombre});return}
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=f.name;a.click();toast('Imagen descargada, compártela por WhatsApp');
  }catch(e){toast('No se pudo compartir en este navegador')}
}
/* ══ Barra lateral ══ */
function buildSide(){
  const old=document.querySelector('.nav');if(old)old.remove();
  const links=[['index.html','Inicio','M3 10.5L12 3l9 7.5V21h-5v-6h-4v6H3z'],['calculo2.html','Cálculo','M5 3h14v18H5zM8 7h8M8 11h8M8 15h5'],['lotes2.html','Lotes','M4 8h16M4 12h16M4 16h16'],['inventario2.html','Inventario','M3 7l9-4 9 4v10l-9 4-9-4zM3 7l9 4 9-4M12 11v10'],['usuarios2.html','Usuarios','M12 12a4 4 0 100-8 4 4 0 000 8zM4 20c0-4 4-6 8-6s8 2 8 6']];
  const cur=location.pathname.split('/').pop()||'index.html';
  const side=document.createElement('aside');side.id='side';
  side.innerHTML='<div class="side-head"><div class="biz">'+esc(negocio())+'</div><div class="prod">Sistema avícola</div></div>'+links.map(l=>'<a href="'+l[0]+'" class="'+(cur===l[0]?'on':'')+'"><svg viewBox="0 0 24 24"><path d="'+l[2]+'"/></svg><span>'+l[1]+'</span>'+''+'</a>').join('')+'<div class="side-foot">v2 • sincronizado en la nube</div>';
  document.body.appendChild(side);
  const back=document.createElement('div');back.id='sideBack';back.onclick=()=>{side.classList.remove('open');back.classList.remove('open')};document.body.appendChild(back);
  const btn=document.createElement('button');btn.id='menuBtn';btn.setAttribute('aria-label','Menú');btn.innerHTML='<svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16"/></svg>';
  btn.onclick=()=>{side.classList.add('open');back.classList.add('open')};
  document.querySelector('.top').appendChild(btn);
}
document.addEventListener('DOMContentLoaded',()=>{pintaTop();buildSide();agregarSalir()});
/* ══ Login local ══ */
function sesion(){return loadJSON('pc_session',null)}
function salir(){localStorage.removeItem('pc_session');location.reload()}
function asegurarLogin(){
  const usuarios=loadJSON('pc_users',[]);
  if(!usuarios.length)return;
  if(sesion())return;
  const ov=document.createElement('div');ov.id='loginOv';
  ov.innerHTML='<div class="loginCard"><h2>Entrar</h2>'+
   '<div class="field"><label>Usuario</label><select id="lgU">'+usuarios.map(x=>'<option value="'+x.id+'">'+esc(x.nom)+'</option>').join('')+'</select></div>'+
   '<div class="field"><label>Clave</label><input type="password" id="lgP" inputmode="numeric" placeholder="••••"></div>'+
   '<button class="btn btn-p btn-w" id="lgBtn">Entrar</button></div>';
  document.body.appendChild(ov);
  $('#lgBtn').onclick=()=>{
    const usr=usuarios.find(x=>x.id===+$('#lgU').value);
    if(usr&&usr.pin===$('#lgP').value){saveJSON('pc_session',{id:usr.id,nom:usr.nom,rol:usr.rol});location.reload()}
    else toast('Clave incorrecta');
  };
}
function agregarSalir(){
  const side=$('#side'),s=sesion();if(!side||!s)return;
  const foot=side.querySelector('.side-foot');
  if(foot)foot.innerHTML='Conectado: '+esc(s.nom)+' ('+(s.rol==='admin'?'Admin':'Empleado')+')<br><a href="#" id="lgOut" style="color:var(--red);font-weight:800">Cerrar sesión</a>';
  const o=$('#lgOut');if(o)o.onclick=e=>{e.preventDefault();salir()};
}
/* ══ Login manual (sobrescribe el anterior) ══ */
function asegurarLogin(){
  const usuarios=loadJSON('pc_users',[]);
  if(!usuarios.length)return;
  if(sesion())return;
  const ov=document.createElement('div');ov.id='loginOv';
  ov.innerHTML='<div class="loginCard"><h2>Entrar</h2>'+
   '<div class="field"><label>Usuario</label><input type="text" id="lgU" placeholder="tu usuario"></div>'+
   '<div class="field"><label>Clave</label><input type="password" id="lgP" placeholder="••••"></div>'+
   '<button class="btn btn-p btn-w" id="lgBtn">Entrar</button></div>';
  document.body.appendChild(ov);
  $('#lgBtn').onclick=()=>{
    const u=$('#lgU').value.trim(),p=$('#lgP').value;
    const usr=usuarios.find(x=>(x.usu||'').toLowerCase()===u.toLowerCase()&&x.pin===p);
       if(usr){saveJSON('pc_session',{id:usr.id,nom:usr.nom,rol:usr.rol,ext:!!usr.ext});location.reload()}
    else toast('Usuario o clave incorrectos');
  };
}
/* ══ Acciones delicadas con aprobación de admins ══ */
function admins(){return loadJSON('pc_users',[]).filter(u=>u.rol==='admin')}
function pend(){return loadJSON('pc_pend',[])}
function guardarPend(p){saveJSON('pc_pend',p)}
function pedirAccion(clave,desc){
  const s=sesion();if(!s||s.rol!=='admin'){toast('Solo administradores');return}
  const p=pend();
  if(!p.some(x=>x.clave===clave)){p.push({clave,desc,por:s.id,porNom:s.nom});guardarPend(p);toast('Solicitud enviada: falta que el otro administrador apruebe con su usuario')}
  else toast('Ya hay una solicitud pendiente de esta acción');
}
function aprobarAccion(clave){guardarPend(pend().filter(x=>x.clave!==clave))}
function txtReporte(nombre,r){
  return negocio()+' · Reporte de lote\n'+nombre+'\nDía '+r.cd+' · Mortalidad '+nf2.format(r.mp)+'%\nPollitos '+nf0.format(r.N)+' · Vivos '+nf0.format(r.V)+'\nInversión '+smart(r.inv)+' · Costo/kg '+(isFinite(r.cKg)?smart(r.cKg):'—')+'\nCarne '+nf0.format(r.kgC)+' kg · Ingreso '+smart(r.ing)+'\n'+(r.gan>=0?'Ganancia ':'Pérdida ')+smart(Math.abs(r.gan));
}
async function compartirReporte(nombre,r){
  try{
    const blob=await new Promise(res=>canvasReporte(nombre,r).toBlob(res,'image/png'));
    const f=new File([blob],'reporte.png',{type:'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'Reporte '+nombre});return}
    const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='reporte-'+nombre.replace(/\s+/g,'-')+'.png';document.body.appendChild(a);a.click();a.remove();toast('Imagen descargada');return;
  }catch(e){}
  window.open('https://wa.me/?text='+encodeURIComponent(txtReporte(nombre,r)),'_blank');
}
/* ══ Menú recortado para empleados ══ */
function recortarMenu(){
  const s=sesion();if(!s||s.rol==='admin')return;
  const ok=['index.html','lotes2.html','inventario2.html'];
  $$('#side a').forEach(a=>{if(!ok.includes(a.getAttribute('href')))a.remove()});
}
document.addEventListener('DOMContentLoaded',recortarMenu);
/* ══ Cerrar sesión visible ══ */
function asegurarSalir(){
  const s=sesion(),side=$('#side');if(!s||!side||$('#sideOut'))return;
  const a=document.createElement('a');a.href='#';a.id='sideOut';a.style.color='var(--red)';
  a.innerHTML='<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg><span>Cerrar sesión</span>';
  a.onclick=e=>{e.preventDefault();salir()};
  side.appendChild(a);
  const foot=side.querySelector('.side-foot');
  if(foot)foot.textContent='Conectado: '+s.nom+' ('+(s.rol==='admin'?'Admin':(s.ext?'Empleado +':'Empleado'))+')';
}
document.addEventListener('DOMContentLoaded',asegurarSalir);
/* ══ Página permitida por rol ══ */
function paginaPermitida(){
  const s=sesion();if(!s||s.rol==='admin')return;
  const cur=location.pathname.split('/').pop()||'index.html';
  if(cur!=='lotes2.html'&&cur!=='inventario2.html')location.replace('lotes2.html');
}
function recortarMenu(){
  const s=sesion();if(!s||s.rol==='admin')return;
  const ok=['lotes2.html','inventario2.html'];
  $$('#side a').forEach(a=>{if(!ok.includes(a.getAttribute('href')))a.remove()});
}
document.addEventListener('DOMContentLoaded',paginaPermitida);
async function compartirReporte(nombre,r){
  const txt=txtReporte(nombre,r);
  try{
    const blob=await new Promise(res=>canvasReporte(nombre,r).toBlob(res,'image/png'));
    const f=new File([blob],'reporte.png',{type:'image/png'});
    if(navigator.canShare&&navigator.canShare({files:[f]})){await navigator.share({files:[f],title:'Reporte '+nombre});return}
  }catch(e){}
  try{navigator.clipboard&&navigator.clipboard.writeText(txt)}catch(e){}
  window.open('https://wa.me/?text='+encodeURIComponent(txt),'_blank');
  toast('Reporte copiado y WhatsApp abierto');
}
/* ══ Sesión inválida si el usuario fue eliminado ══ */
function validarSesion(){
  const s=sesion();if(!s)return;
  const u=loadJSON('pc_users',[]).find(x=>+x.id===+s.id);
  if(!u){localStorage.removeItem('pc_session');location.reload()}
}
document.addEventListener('DOMContentLoaded',validarSesion);