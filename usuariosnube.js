/* ══ usuariosnube.js v4 · creador de siempre + nube + equipo visible ══ */
(function(){
  function authSec(){if(!window._asec){window._asec=firebase.initializeApp(FB_CFG,'sec'+Date.now()).auth()}return window._asec}
  const corr=(u,id)=>u.toLowerCase()+'@'+id+'.avicola.app';
  document.addEventListener('DOMContentLoaded',()=>{
    const cb=$('#cuBtn');if(cb){const c=cb.closest('.card');if(c)c.remove()}
    let btn=null;
    document.querySelectorAll('button').forEach(b=>{if(b.textContent.trim()==='Crear usuario')btn=b});
    if(!btn)return;
    const card=btn.closest('.card');
    const sel=card.querySelector('select');
    const mailWrap=document.createElement('div');
    mailWrap.className='field';mailWrap.id='mailField';mailWrap.style.display='none';
    mailWrap.innerHTML='<label>Correo personal (para recuperar clave)</label><input id="uMail" type="email" placeholder="correo@ejemplo.com">';
    card.insertBefore(mailWrap,btn);
    if(sel)sel.addEventListener('change',()=>{mailWrap.style.display=/admin/i.test(sel.options[sel.selectedIndex].text)?'':'none'});
    const nb=btn.cloneNode(true);btn.parentNode.replaceChild(nb,btn);
    nb.onclick=async e=>{
      e.preventDefault();
      const ins=card.querySelectorAll('input:not(#uMail)');
      const nom=ins[0].value.trim(),ced=(ins[1]?ins[1].value.trim():''),ext=ins[2]?ins[2].checked:false,usu=ins[3].value.trim(),pin=ins[4].value;
      const mail=$('#uMail')?$('#uMail').value.trim():'';
      const rolTxt=sel?sel.options[sel.selectedIndex].text:'';
      const rol=/admin/i.test(rolTxt)?'admin':'emp';
      if(!nom||!usu||pin.length<6){toast('Nombre, usuario y clave de 6+');return}
      if(rol==='admin'&&!mail){toast('El admin necesita su correo personal');return}
      const arr=loadJSON('pc_users',[]);
      arr.push({id:Date.now(),nom,ced,usu,pin,rol,ext});
      saveJSON('pc_users',arr);
      const t=loadJSON('pc_tenant',null);
      if(t&&window.firebase){
        try{
          const cred=await authSec().createUserWithEmailAndPassword(corr(usu,t.id),pin);
          await db.collection('negocios/'+t.id+'/usuarios').doc(cred.user.uid).set({uid:cred.user.uid,nom,ced,usu,mail,rol,ext,creado:Date.now()});
          toast('Usuario creado en la nube y en el equipo');
        }catch(err){toast('Ojo, nube falló: '+err.message)}
      }else toast('Usuario creado en el equipo');
      ins[0].value='';if(ins[1])ins[1].value='';ins[3].value='';ins[4].value='';if(ins[2])ins[2].checked=false;if($('#uMail'))$('#uMail').value='';
      if(typeof render==='function')render();
      listaEquipo();
    };
    async function listaEquipo(){
      const t=loadJSON('pc_tenant',null);if(!t)return;
      try{
        const s=await db.collection('negocios/'+t.id+'/usuarios').get();
        const perfil=window.NUBE_PERFIL||{};
        const docs=s.docs.map(d=>d.data()).sort((a,b)=>(a.creado||0)-(b.creado||0));
        const primerAdmin=(docs.find(x=>x.rol==='admin')||{}).usu;
        let vis=docs;
        if(perfil.rol==='admin'&&perfil.usu!==primerAdmin){vis=docs.filter(x=>x.rol!=='admin'||x.usu===perfil.usu)}
        const loc=loadJSON('pc_users',[]);
        vis.forEach(p=>{if(!loc.some(x=>x.usu===p.usu))loc.push({id:p.uid||Date.now(),nom:p.nom,ced:p.ced||'',usu:p.usu,pin:'••••••',rol:p.rol==='fundador'?'admin':p.rol,ext:!!p.ext})});
        for(let i=loc.length-1;i>=0;i--){if(loc[i].pin==='••••••'&&!vis.some(v=>v.usu===loc[i].usu))loc.splice(i,1)}
        saveJSON('pc_users',loc);
        if(typeof render==='function')render();
      }catch(e){}
    }
    window._listaEquipo=listaEquipo;
    const esp=setInterval(()=>{
      const perfil=window.NUBE_PERFIL;if(!perfil)return;
      clearInterval(esp);
      listaEquipo();
      if(perfil.rol==='admin'||perfil.rol==='fundador'){
        if($('#csBtn'))return;
        const wrap=document.createElement('div');wrap.style.marginTop='12px';
        wrap.innerHTML='<label style="font-size:12px;color:var(--mut)">CERRAR SESIÓN ABIERTA DE UN EMPLEADO</label><div class="grid2"><input id="csUsu" placeholder="usuario"><button class="btn btn-g" id="csBtn">Cerrar sesión</button></div>';
        card.appendChild(wrap);
        $('#csBtn').onclick=async()=>{
          const usu=$('#csUsu').value.trim().toLowerCase();if(!usu)return;
          const t=loadJSON('pc_tenant',null);
          try{
            const q=await db.collection('negocios/'+t.id+'/usuarios').where('usu','==',usu).limit(1).get();
            if(q.empty){toast('Usuario no encontrado');return}
            await q.docs[0].ref.update({sesion:null});
            toast('Sesión cerrada: ya puede entrar de nuevo');
          }catch(e){toast('Error: '+e.message)}
        };
      }
    },800);
  });
})();