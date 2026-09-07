/* ══ usuariosnube.js · el creador de siempre, ahora con nube ══ */
(function(){
  function authSec(){if(!window._asec){window._asec=firebase.initializeApp(FB_CFG,'sec'+Date.now()).auth()}return window._asec}
  const corr=(u,id)=>u.toLowerCase()+'@'+id+'.avicola.app';
  document.addEventListener('DOMContentLoaded',()=>{
    const cb=$('#cuBtn');if(cb){const c=cb.closest('.card');if(c)c.remove()}
    let btn=null;
    document.querySelectorAll('button').forEach(b=>{if(b.textContent.trim()==='Crear usuario')btn=b});
    if(!btn)return;
    const nb=btn.cloneNode(true);btn.parentNode.replaceChild(nb,btn);
    nb.onclick=async e=>{
      e.preventDefault();
      const card=nb.closest('.card');
      const ins=card.querySelectorAll('input');
      const sel=card.querySelector('select');
      const nom=ins[0].value.trim(),ced=(ins[1]?ins[1].value.trim():''),ext=ins[2]?ins[2].checked:false,usu=ins[3].value.trim(),pin=ins[4].value;
      const rolTxt=sel?sel.options[sel.selectedIndex].text:'';
      const rol=/admin/i.test(rolTxt)?'admin':'emp';
      if(!nom||!usu||pin.length<6){toast('Nombre, usuario y clave de 6+');return}
      const arr=loadJSON('pc_users',[]);
      arr.push({id:Date.now(),nom,ced,usu,pin,rol,ext});
      saveJSON('pc_users',arr);
      const t=loadJSON('pc_tenant',null);
      if(t&&window.firebase){
        try{
          const cred=await authSec().createUserWithEmailAndPassword(corr(usu,t.id),pin);
          await db.collection('negocios/'+t.id+'/usuarios').doc(cred.user.uid).set({uid:cred.user.uid,nom,ced,usu,mail:'',rol,ext,creado:Date.now()});
          toast('Usuario creado en la nube y en el equipo');
        }catch(err){toast('Ojo, nube falló: '+err.message)}
      }else toast('Usuario creado en el equipo');
      ins[0].value='';if(ins[1])ins[1].value='';ins[3].value='';ins[4].value='';if(ins[2])ins[2].checked=false;
      if(typeof render==='function')render();
    };
  });
})();