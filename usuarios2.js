/* ══ usuarios2.js · equipo, roles y link ══ */
const KU='pc_users';
function users(){return loadJSON(KU,[])}
function saveUsers(u){saveJSON(KU,u)}
const LINK_APP='https://penajefersson96-svg.github.io/Sistema-Avicola/';
function render(){
  const u=users();
  $('#usersList').innerHTML=u.length?u.map(x=>'<div class="item"><div><div class="t">'+esc(x.nom)+'</div><div class="s">C.I. '+esc(x.ced||'—')+' · @'+esc(x.usu||'—')+'</div></div><div style="display:flex;gap:6px;align-items:center"><span class="badge '+(x.rol==='admin'?'b-ok':'b-warn')+'"><i></i>'+(x.rol==='admin'?'Admin':(x.ext?'Empleado +':'Empleado'))+'</span><button class="mini d" data-du="'+x.id+'">✕</button></div></div>').join(''):'<p class="muted">Aún no hay usuarios. Crea el primero abajo.</p>';
}
$('#btnUser').onclick=()=>{
  const nom=$('#uNom').value.trim(),ced=$('#uCed').value.trim(),rol=$('#uRol').value,ext=$('#uExt').checked,usu=$('#uUsu').value.trim(),pin=$('#uPin').value.trim();
  if(!nom){toast('Escribe el nombre completo');return}
  if(!usu){toast('Escribe el usuario');return}
  if(pin.length<4){toast('Clave de al menos 4 dígitos');return}
  const u=users();
  if(u.some(x=>(x.usu||'').toLowerCase()===usu.toLowerCase())){toast('Ese usuario ya existe');return}
  u.push({id:Date.now(),nom,ced,rol,ext,usu,pin});
  saveUsers(u);['uNom','uCed','uUsu','uPin'].forEach(i=>$('#'+i).value='');render();toast('Usuario creado: '+nom);
};
$('#btnVer').onclick=()=>{const c=$('#rolesCard');const open=c.style.display!=='none';c.style.display=open?'none':'block';$('#btnVer').textContent=open?'Ver más':'Ver menos'};
$('#btnShare').onclick=async()=>{
  const txt='Instala la app de la granja: '+LINK_APP;
  try{if(navigator.share){await navigator.share({title:'App de la granja',text:txt,url:LINK_APP});return}}catch(e){}
  if(navigator.clipboard){navigator.clipboard.writeText(txt).then(()=>toast('Link copiado, compártelo por WhatsApp'))}else toast('Link: '+LINK_APP)};
document.addEventListener('click',e=>{
  const b=e.target.closest('[data-du]');if(!b)return;
  if(b.dataset.arm){saveUsers(users().filter(x=>+x.id!==+b.dataset.du));render();toast('Usuario eliminado')}
  else{b.dataset.arm=1;b.textContent='¿Seguro?';setTimeout(()=>{b.textContent='✕';delete b.dataset.arm},2200)}
});
render();