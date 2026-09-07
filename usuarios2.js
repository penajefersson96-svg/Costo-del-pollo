/* ══ usuariosnube.js · usuarios unificados (nube + equipo) ══ */
(function(){
  function authSec(){if(!window._asec){window._asec=firebase.initializeApp(FB_CFG,'sec'+Date.now()).auth()}return window._asec}
  const corr=(u,id)=>u.toLowerCase()+'@'+id+'.avicola.app';
  function localPush(nom,usu,pin,rol,ext){
    const arr=loadJSON('pc_users',[]);
    arr.push({id:Date.now(),nom,usu,pin,rol,ext});
    saveJSON('pc_users',arr);
  }
  function localDel(usu){saveJSON('pc_users',loadJSON('pc_users',[]).filter(x=>x.usu!==usu))}
  async function lista(){
    const t=loadJSON('pc_tenant',null);if(!t||!$('#cuList'))return;
    try{
      const s=await db.collection('negocios/'+t.id+'/usuarios').get();
      $('#cuList').innerHTML='<h2 style="margin-top:10px">Equipo en la nube</h2>'+s.docs.map(d=>{const p=d.data();return '<div class="item"><div><div class="t">'+esc(p.nom)+'</div><div class="s">'+esc(p.usu)+' · '+(p.rol==='fundador'?'Fundador':p.rol==='admin'?'Admin':(p.ext?'Empleado +':'Empleado'))+'</div></div>'+(p.rol==='fundador'?'':'<button class="mini d" data-del="'+d.id+'" data-usu="'+esc(p.usu)+'">Eliminar</button>')+'</div>'}).join('');
    }catch(e){}
  }
  document.addEventListener('DOMContentLoaded',()=>{
    if(!$('#cuBtn'))return;
    const ba=$('#btnAdd');if(ba){const c=ba.closest('.card');if(c)c.style.display='none'}
    lista();
    $('#cuBtn').onclick=async()=>{
      const t=loadJSON('pc_tenant',null);if(!t){toast('Vincula primero');return}
      const nom=$('#cuNom').value.trim(),usu=$('#cuUsu').value.trim(),pin=$('#cuPin').value,rol=$('#cuRol').value;
      if(!nom||!usu||pin.length<6){toast('Nombre, usuario y clave de 6+');return}
      localPush(nom,usu,pin,rol==='admin'?'admin':'emp',rol==='ext');
      if(window.firebase){
        try{
          const cred=await authSec().createUserWithEmailAndPassword(corr(usu,t.id),pin);
          await db.collection('negocios/'+t.id+'/usuarios').doc(cred.user.uid).set({uid:cred.user.uid,nom,usu,mail:'',rol,ext:rol==='ext',creado:Date.now()});
          toast('Usuario creado en la nube y en el equipo');
        }catch(e){localDel(usu);toast('Nube falló: '+e.message);return}
      }else toast('Usuario creado solo en este equipo');
      $('#cuNom').value=$('#cuUsu').value=$('#cuPin').value='';
      lista();if(typeof render==='function')render();
    };
    const sh=$('#cuShare');if(sh)sh.onclick=async()=>{
      try{if(navigator.share){await navigator.share({url:LINK_APP});return}}catch(e){}
      try{await navigator.clipboard.writeText(LINK_APP);toast('Link copiado')}catch(e){}
    };
    document.addEventListener('click',async e=>{
      const b=e.target.closest('[data-del]');if(!b)return;
      const t=loadJSON('pc_tenant',null);
      await db.collection('negocios/'+t.id+'/usuarios').doc(b.dataset.del).delete();
      localDel(b.dataset.usu);
      toast('Usuario eliminado de la nube y del equipo');lista();if(typeof render==='function')render();
    });
  });
})();