/* ══ usuarios2.js v3 · compartir y compatibilidad ══ */
const LINK_APP='https://penajefersson96-svg.github.io/Sistema-Avicola/';
function render(){try{const c=document.querySelector('#usersList');if(!c)return;const u=loadJSON('pc_users',[]);c.innerHTML=u.map(x=>'<div class="item"><div><div class="t">'+esc(x.nom)+'</div><div class="s">'+esc(x.usu)+' · '+(x.rol==='admin'?'Admin':(x.ext?'Encargado':'Empleado'))+'</div></div></div>').join('')||'<p class="muted">Sin usuarios locales.</p>'}catch(e){}}
document.addEventListener('DOMContentLoaded',()=>{
  const sh=$('#btnShare')||Array.from(document.querySelectorAll('button')).find(b=>/copiar|compartir/i.test(b.textContent||''));
  if(sh)sh.onclick=async()=>{
    try{if(navigator.share){await navigator.share({url:LINK_APP});return}}catch(e){}
    try{await navigator.clipboard.writeText(LINK_APP);toast('Link copiado')}catch(e){}
  };
  render();
});