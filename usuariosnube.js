/* ══ usuariosnube.js · altas en la nube ══ */
(function(){
  function authSec(){if(!window._asec){window._asec=firebase.initializeApp(FB_CFG,'sec'+Date.now()).auth()}return window._asec}
  const corr=(u,id)=>u.toLowerCase()+'@'+id+'.avicola.app';
  async function lista(){
    const t=loadJSON('pc_tenant',null);if(!t||!$('#cuList'))return;
    const s=await db.collection('negocios/'+t.id+'/usuarios').get();
    $('#cuList').innerHTML=s.docs.map(d=>{const p=d.data();return '<div class="item"><div><div class="t">'+esc(p.nom)+'</div><div class="s">'+esc(p.usu)+' · '+(p.rol==='fundador'?'Fundador':p.rol==='admin'?'Admin':(p.ext?'Empleado +':'Empleado'))+'</div></div></div>'}).join('');
  }
  document.addEventListener('DOMContentLoaded',()=>{
    if(!$('#cuBtn'))return;
    lista();
    $('#cuBtn').onclick=async()=>{
      const t=loadJSON('pc_tenant',null);if(!t){toast('Vincula primero');return}
      const nom=$('#cuNom').value.trim(),usu=$('#cuUsu').value.trim(),pin=$('#cuPin').value,rol=$('#cuRol').value;
      if(!nom||!usu||pin.length<6){toast('Nombre, usuario y clave de 6+');return}
      try{
        const cred=await authSec().createUserWithEmailAndPassword(corr(usu,t.id),pin);
        await db.collection('negocios/'+t.id+'/usuarios').doc(cred.user.uid).set({uid:cred.user.uid,nom,usu,mail:'',rol,ext:rol==='ext',creado:Date.now()});
        toast('Usuario creado en la nube: '+usu);
        $('#cuNom').value=$('#cuUsu').value=$('#cuPin').value='';
        lista();
      }catch(e){toast('Error: '+e.message)}
    };
  });
})();