/* ══ nube.js · versión final y completa ══ */
(function(){
  const OV=document.createElement('div');OV.id='loginOv';OV.style.display='none';
  document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(OV));
  function mostrar(h){OV.innerHTML='<div class="loginCard">'+h+'</div>';OV.style.display='flex'}
  function ocultar(){OV.style.display='none'}
  function tenant(){return loadJSON('pc_tenant',null)}
  function devid(){let d=loadJSON('pc_devid',null);if(!d){d='D'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);saveJSON('pc_devid',d)}return d}
  const correo=(usu,neg)=>usu.toLowerCase()+'@'+neg+'.avicola.app';
  const WA='584242300131';
  const waLink=t=>'https://wa.me/'+WA+'?text='+encodeURIComponent(t);
  function FBD(){if(!window.db&&typeof firebase!=='undefined'&&firebase.firestore)window.db=firebase.firestore();return window.db}
  function FBA(){if(!window.auth&&typeof firebase!=='undefined'&&firebase.auth)window.auth=firebase.auth();return window.auth}
  function genCode(){return 'AVI-'+Math.floor(1000+Math.random()*9000)}
  function conTope(p,ms){return Promise.race([p,new Promise((_,r)=>setTimeout(()=>r(new Error('La nube tarda demasiado: revisa tu internet')),ms))])}
  window.addEventListener('error',e=>{try{toast('Error: '+e.message)}catch(_){}});
  window.addEventListener('unhandledrejection',e=>{try{toast('Error interno: '+((e.reason&&e.reason.message)||e.reason))}catch(_){}});
  let KICK=null;
  function patear(html){if(KICK){KICK();KICK=null}try{FBA().signOut()}catch(e){}mostrar(html)}
  async function arrancar(){
    try{await fbListo}catch(e){}
    if(!window.db){mostrar('<h2>Conectando con la nube…</h2><p class="muted">Si esto no avanza, revisa tu internet.</p><button class="btn btn-p btn-w" onclick="location.reload()">Reintentar</button>');return}
    const t=tenant();
    if(!t){pantallaInicio();return}
    if(loadJSON('pc_justout',0)){localStorage.removeItem('pc_justout');pantallaInicio(t);return}
    FBA().onAuthStateChanged(async u=>{
      if(!u){try{const s=await conTope(FBD().collection('negocios/'+t.id+'/usuarios').limit(1).get(),10000);if(s.empty)pantallaPrimerAdmin(t);else pantallaLogin(t)}catch(e){pantallaLogin(t)}return}
      if(window._verif){window._verif=0;return}
      const ok=loadJSON('pc_ok_'+u.uid,0);
      if(ok&&(Date.now()-ok)<6*3600*1000){continuar(u,FBD().collection('negocios/'+t.id+'/usuarios').doc(u.uid),window.NUBE_PERFIL||{});fondo(u,t,0);return}
      mostrar('<h2>Verificando sesión…</h2><p class="muted">Un momento.</p>');
      verificar(u,t,1);
    });
  }
  function fondo(u,t,n){
    conTope(FBD().collection('negocios/'+t.id+'/usuarios').doc(u.uid).get(),10000).then(async d=>{
      if(!d.exists||d.data().activo===false){patear('<h2>Cuenta eliminada o suspendida</h2><p class="muted">Contacta a tu administrador.</p>');return}
      const p=d.data();window.NUBE_PERFIL=p;
      const side=$('#side'),foot=side?side.querySelector('.side-foot'):null;
      if(foot)foot.textContent='Conectado: '+p.nom+' ('+(p.rol==='fundador'?'Fundador':p.rol==='admin'?'Admin':(p.ext?'Encargado':'Empleado'))+')';
      if(p.rol==='emp'||p.rol==='ext'){
        try{const nd=await conTope(FBD().collection('negocios').doc(t.id).get(),10000);const hor=(nd.data()&&nd.data().horario)||{ini:'05:00',fin:'21:00'};const hm=new Date();const hh=('0'+hm.getHours()).slice(-2)+':'+('0'+hm.getMinutes()).slice(-2);
        if(hh<hor.ini||hh>hor.fin){patear('<h2>Fuera de horario</h2><p class="muted">Tu jornada es de '+hor.ini+' a '+hor.fin+'.</p>');return}}catch(e){}
      }
      if(p.rol==='admin'||p.rol==='fundador'){
        const ent=loadJSON('pc_ent_'+u.uid,0);
        if(ent&&(Date.now()-ent)>6*3600*1000){patear('<h2>Sesión expirada</h2><p class="muted">Pasaron 6 horas: vuelve a entrar.</p>');return}
        const a=loadJSON('pc_act_'+u.uid,0);
        if(a&&(Date.now()-a)>30*60*1000){patear('<h2>Sesión expirada</h2><p class="muted">Por inactividad prolongada. Vuelve a entrar.</p>');return}
      }
    }).catch(()=>{if((n||0)<1)setTimeout(()=>fondo(u,t,(n||0)+1),5000)});
  }
  async function verificar(u,t,intento){
    try{
      const ref=FBD().collection('negocios/'+t.id+'/usuarios').doc(u.uid);
      const d=await conTope(ref.get(),10000);
      if(!d.exists){
        const vac=await conTope(FBD().collection('negocios/'+t.id+'/usuarios').limit(1).get(),10000);
        if(vac.empty){
          mostrar('<h2>Ficha desaparecida</h2><p class="muted">Tu acceso existe pero tu ficha no. Si eres el dueño de este negocio, restáurala.</p><div class="grid2"><button class="btn btn-g" id="rsNo">Cancelar</button><button class="btn btn-p" id="rsSi">Restaurar mi ficha</button></div>');
          $('#rsNo').onclick=async()=>{await FBA().signOut();pantallaLogin(t)};
          $('#rsSi').onclick=async()=>{
            await FBD().collection('negocios').doc(t.id).set({code:'AVI-0001',nombre:'Mi Granja',plan:'fundador',activo:true,fundador:true,creado:Date.now(),hasta:'2099-12-31'},{merge:true});
            await ref.set({uid:u.uid,nom:'Fundador',usu:(u.email||'fundador').split('@')[0],mail:'',rol:'fundador',ext:true,creado:Date.now()});
            continuar(u,ref,{nom:'Fundador',rol:'fundador',ext:true});
          };
          return;
        }
        await FBA().signOut();mostrar('<h2>Cuenta eliminada</h2><p class="muted">Tu administrador eliminó esta cuenta. Pide una nueva.</p>');return;
      }
      const p=d.data(),s=p.sesion;
      if(p.rol==='emp'||p.rol==='ext'){
        const nd=await conTope(FBD().collection('negocios').doc(t.id).get(),10000);
        const hor=(nd.data()&&nd.data().horario)||{ini:'05:00',fin:'21:00'};
        const hm=new Date();const hh=('0'+hm.getHours()).slice(-2)+':'+('0'+hm.getMinutes()).slice(-2);
        if(hh<hor.ini||hh>hor.fin){await FBA().signOut();mostrar('<h2>Fuera de horario</h2><p class="muted">Tu jornada es de '+hor.ini+' a '+hor.fin+'. Fuera de ese horario la app queda cerrada para empleados.</p>');return}
      }
      if(p.rol==='admin'||p.rol==='fundador'){
        const ent=loadJSON('pc_ent_'+u.uid,0);
        if(ent&&(Date.now()-ent)>6*3600*1000){await FBA().signOut();mostrar('<h2>Sesión expirada</h2><p class="muted">Por seguridad tu sesión terminó tras 6 horas. Vuelve a entrar.</p>');return}
      }
      if(s&&s.dev&&s.dev!==devid()&&(Date.now()-s.ts)<12*3600*1000){
        if(p.rol==='admin'||p.rol==='fundador'){
          mostrar('<h2>Sesión abierta en otro sitio</h2><p class="muted">Tu cuenta ya está abierta en otro dispositivo. Si eres tú, entra aquí y se cerrará allá.</p><div class="grid2"><button class="btn btn-g" id="sdNo">Cancelar</button><button class="btn btn-p" id="sdSi">Soy yo, entrar aquí</button></div>');
          $('#sdNo').onclick=async()=>{await FBA().signOut();pantallaLogin(t)};
          $('#sdSi').onclick=async()=>{await ref.update({sesion:{dev:devid(),ts:Date.now()}});continuar(u,ref,p)};
        }else{
          mostrar('<h2>Sesión abierta en otro sitio</h2><p class="muted">Tu cuenta está abierta en el dispositivo de la granja. Pide a tu administrador que cierre esa sesión o te restablezca la clave.</p><button class="btn btn-p btn-w" id="sdNo">Entendido</button>');
          $('#sdNo').onclick=async()=>{await FBA().signOut();pantallaLogin(t)};
        }
        return;
      }
      await conTope(ref.update({sesion:{dev:devid(),ts:Date.now()}}),10000);
      continuar(u,ref,p);
    }catch(e){
      if(intento<2){verificar(u,t,intento+1);return}
      mostrar('<h2>La nube no responde</h2><p class="muted">'+esc(e.message)+'</p><div class="grid2"><button class="btn btn-g" onclick="location.reload()">Reintentar</button><button class="btn btn-p" id="vOut">Cancelar</button></div>');
      $('#vOut').onclick=async()=>{await FBA().signOut();pantallaLogin(t)};
    }
  }
  function continuar(u,ref,p){
    if(KICK)KICK();
    KICK=ref.onSnapshot(snap=>{if(!snap.exists||snap.data().activo===false){KICK=null;salir()}});
    window.NUBE_USER=u;window.NUBE_PERFIL=p;
        saveJSON('pc_session',{nom:p.nom,usu:p.usu,rol:p.rol==='fundador'?'admin':p.rol,ext:!!p.ext});
    document.body.classList.remove('rol-fund','rol-admin','rol-enc','rol-emp');
    document.body.classList.add(p.rol==='fundador'?'rol-fund':p.rol==='admin'?'rol-admin':(p.ext?'rol-enc':'rol-emp'));
    saveJSON('pc_ok_'+u.uid,Date.now());
    if(!loadJSON('pc_ent_'+u.uid,0))saveJSON('pc_ent_'+u.uid,Date.now());
    window._verif=0;
    const act=()=>saveJSON('pc_act_'+u.uid,Date.now());
    ['click','keydown','touchstart','scroll'].forEach(ev=>document.addEventListener(ev,act,{passive:true}));
    act();
    setInterval(()=>{const q=window.NUBE_PERFIL;if(!q||(q.rol!=='admin'&&q.rol!=='fundador'))return;const a=loadJSON('pc_act_'+u.uid,0);if(a&&(Date.now()-a)>30*60*1000)patear('<h2>Sesión expirada</h2><p class="muted">Por inactividad prolongada. Vuelve a entrar.</p>')},60000);
    ocultar();asegurarSalirNube(u);
    setTimeout(()=>{if(window.lanzarTutorial)lanzarTutorial()},900);
  }
    function pantallaInicio(t){
    mostrar('<h2>Sistema Avícola</h2><p class="muted">Bienvenido. Entra con el código de tu negocio o regístrate.</p><button class="btn btn-p btn-w" id="ncLogin">Iniciar sesión</button><button class="btn btn-g btn-w" style="margin-top:8px" id="ncReg">Registrarme</button><a class="btn btn-g btn-w" style="margin-top:8px;display:block" href="'+waLink('Hola, necesito ayuda con la app Sistema Avícola: no puedo entrar o no tengo mi código de negocio.')+'" target="_blank">¿Dudas? Escríbeme por WhatsApp</a>');
    $('#ncLogin').onclick=t?()=>pantallaLogin(t):pantallaCodigo;
    $('#ncReg').onclick=pantallaRegistro;
    conTope(FBD().collection('negocios').limit(1).get(),10000).then(s=>{
      if(s.empty&&!OV.querySelector('#ncFB')){
        const div=document.createElement('div');div.innerHTML='<button class="btn btn-g btn-w" style="margin-top:8px" id="ncFB">Soy fundador: crear mi negocio</button>';
        OV.querySelector('.loginCard').appendChild(div);
        $('#ncFB').onclick=formularioFundador;
      }
    }).catch(()=>{});
  }
  function formularioFundador(){
    mostrar('<h2>Crear mi negocio (fundador)</h2><div class="field"><label>Nombre del negocio</label><input id="fNom" value="Mi Granja"></div><div class="field"><label>Correo</label><input id="fMail" type="email"></div><div class="field"><label>Usuario</label><input id="fUsu" placeholder="fundador"></div><div class="field"><label>Clave (mín. 6)</label><input id="fPin" type="password"></div><button class="btn btn-p btn-w" id="fBtn">Crear y entrar</button>');
    $('#fBtn').onclick=async()=>{
      const nom=$('#fNom').value.trim(),mail=$('#fMail').value.trim(),usu=$('#fUsu').value.trim(),pin=$('#fPin').value;
      if(!nom||!usu||pin.length<6){toast('Nombre, usuario y clave de 6+');return}
      try{
        const ref=await FBD().collection('negocios').add({code:'AVI-0001',nombre:nom,plan:'fundador',activo:true,fundador:true,creado:Date.now(),hasta:'2099-12-31'});
        saveJSON('pc_tenant',{id:ref.id,code:'AVI-0001',nombre:nom});
        const cred=await FBA().createUserWithEmailAndPassword(correo(usu,ref.id),pin);
        await FBD().collection('negocios/'+ref.id+'/usuarios').doc(cred.user.uid).set({uid:cred.user.uid,nom,usu,mail,rol:'fundador',ext:true,creado:Date.now()});
        location.reload();
      }catch(e){toast('Error: '+e.message)}
    };
  }
  function pantallaCodigo(){
    mostrar('<h2>Código de tu negocio</h2><div class="field"><label>Código</label><input id="ncCod" placeholder="AVI-0000" style="text-transform:uppercase"></div><button class="btn btn-p btn-w" id="ncBtn">Vincular dispositivo</button><p class="muted" style="margin-top:8px"><a href="#" id="ncVolver">Volver</a></p>');
    $('#ncVolver').onclick=e=>{e.preventDefault();pantallaInicio()};
    $('#ncBtn').onclick=async()=>{
      const cod=$('#ncCod').value.trim().toUpperCase();if(!cod){toast('Escribe el código');return}
      try{
        const q=await conTope(FBD().collection('negocios').where('code','==',cod).limit(1).get(),10000);
        if(q.empty){toast('Código no válido: pídelo a tu empleador');return}
        const d=q.docs[0];
        if(d.data().activo===false){toast('Negocio suspendido: contacta al proveedor');return}
        saveJSON('pc_tenant',{id:d.id,code:cod,nombre:d.data().nombre});
        location.reload();
      }catch(e){toast('Error de red: '+e.message)}
    };
  }
  function pantallaRegistro(){
    mostrar('<h2>Registrarme</h2><p class="muted">Crea tu negocio y recibe tu código al instante.</p><div class="field"><label>Tu nombre</label><input id="rNom"></div><div class="field"><label>Nombre del negocio</label><input id="rNeg"></div><div class="field"><label>Correo</label><input id="rMail" type="email"></div><div class="field"><label>WhatsApp</label><input id="rWa" inputmode="numeric" placeholder="584XXXXXXXXX"></div><button class="btn btn-p btn-w" id="rBtn">Recibir mi código</button><p class="muted" style="margin-top:8px"><a href="#" id="rVolver">Volver</a></p>');
    $('#rVolver').onclick=e=>{e.preventDefault();pantallaInicio()};
    $('#rBtn').onclick=async()=>{
      const nom=$('#rNom').value.trim(),neg=$('#rNeg').value.trim(),mail=$('#rMail').value.trim(),wa=$('#rWa').value.trim();
      if(!nom||!neg||!wa){toast('Completa nombre, negocio y WhatsApp');return}
      try{
        let cod=genCode();
        for(let i=0;i<5;i++){const q=await FBD().collection('negocios').where('code','==',cod).limit(1).get();if(q.empty)break;cod=genCode()}
        const hasta=new Date(Date.now()+45*86400000).toISOString().slice(0,10);
        const ref=await FBD().collection('negocios').add({code:cod,nombre:neg,plan:'prueba',activo:true,fundador:false,creado:Date.now(),hasta,contacto:{nom,mail,wa}});
        mostrar('<h2>¡Listo, '+esc(nom)+'!</h2><p class="muted">Tu negocio <b>'+esc(neg)+'</b> quedó creado con <b>45 días de prueba</b>. Tu código es:</p><h1 style="letter-spacing:.05em">'+cod+'</h1><button class="btn btn-p btn-w" id="rOk">Vincular este dispositivo</button><a class="btn btn-g btn-w" style="margin-top:8px;display:block" href="'+waLink('Hola, me registré en Sistema Avícola. Mi negocio: '+neg+'. Mi código: '+cod+'. Guardo este mensaje como copia.')+'" target="_blank">Guardar copia por WhatsApp</a>');
        $('#rOk').onclick=()=>{saveJSON('pc_tenant',{id:ref.id,code:cod,nombre:neg});location.reload()};
      }catch(e){toast('Error: '+e.message)}
    };
  }
  function pantallaPrimerAdmin(t){
    mostrar('<h2>Crea tu usuario admin</h2><p class="muted">Negocio '+esc(t.nombre)+' · código '+esc(t.code)+'</p><div class="field"><label>Nombre completo</label><input id="aNom"></div><div class="field"><label>Correo (para recuperar clave)</label><input id="aMail" type="email"></div><div class="field"><label>Usuario</label><input id="aUsu"></div><div class="field"><label>Clave (mín. 6)</label><input id="aPin" type="password"></div><button class="btn btn-p btn-w" id="fBtn">Crear y entrar</button>');
    $('#fBtn').onclick=async()=>{
      const nom=$('#aNom').value.trim(),mail=$('#aMail').value.trim(),usu=$('#aUsu').value.trim(),pin=$('#aPin').value;
      if(!nom||!usu||pin.length<6){toast('Nombre, usuario y clave de 6 o más');return}
      try{
        const cred=await FBA().createUserWithEmailAndPassword(correo(usu,t.id),pin);
        await FBD().collection('negocios/'+t.id+'/usuarios').doc(cred.user.uid).set({uid:cred.user.uid,nom,usu,mail,rol:'admin',ext:true,creado:Date.now()});
        location.reload();
      }catch(e){toast('Error: '+e.message)}
    };
  }
  function pantallaLogin(t,msg){
    mostrar('<h2>'+esc(t.nombre||'Sistema Avícola')+'</h2><p class="muted">Código '+esc(t.code)+' · entra con tu usuario</p><div class="field"><label>Usuario</label><input id="lgU2"></div><div class="field"><label>Clave</label><input id="lgP2" type="password"></div><button class="btn btn-p btn-w" id="lgB2">Entrar</button><p id="lgErr" style="color:var(--red);margin-top:8px">'+(msg?esc(msg):'')+'</p><p class="muted" style="margin-top:8px"><a href="#" id="lgOlvi">Olvidé mi clave</a> · <a href="#" id="lgOtro">Cambiar de negocio</a></p>');
    $('#lgOtro').onclick=e=>{e.preventDefault();localStorage.removeItem('pc_tenant');location.reload()};
    $('#lgOlvi').onclick=e=>{
      e.preventDefault();
      mostrar('<h2>Recuperar mi clave</h2><p class="muted">Escribe tu usuario y te enviaremos un correo con el enlace para crear una clave nueva. Si tu cuenta no tiene correo registrado, pide ayuda a tu administrador.</p><div class="field"><label>Usuario</label><input id="olU"></div><button class="btn btn-p btn-w" id="olB">Enviar correo de recuperación</button><p class="muted" style="margin-top:8px"><a href="#" id="olV">Volver</a></p>');
      $('#olV').onclick=ev=>{ev.preventDefault();pantallaLogin(t)};
      $('#olB').onclick=async()=>{
        const usu=$('#olU').value.trim().toLowerCase();if(!usu){toast('Escribe tu usuario');return}
        try{
          const q=await conTope(FBD().collection('negocios/'+t.id+'/usuarios').where('usu','==',usu).limit(1).get(),10000);
          if(q.empty){toast('Usuario no encontrado');return}
          if(!q.docs[0].data().mail){toast('Esta cuenta no tiene correo: pide ayuda a tu administrador');return}
          await FBA().sendPasswordResetEmail(correo(usu,t.id));
          mostrar('<h2>Correo enviado</h2><p class="muted">Revisa tu bandeja (y la carpeta de spam). Abre el enlace, crea tu clave nueva y vuelve aquí para iniciar sesión.</p><button class="btn btn-p btn-w" id="olOk">Entendido</button>');
          $('#olOk').onclick=()=>pantallaLogin(t);
        }catch(err){toast('Error: '+err.message)}
      };
    };
    $('#lgB2').onclick=async()=>{
      $('#lgB2').textContent='Entrando…';
      try{
        await Promise.race([
          FBA().signInWithEmailAndPassword(correo($('#lgU2').value.trim(),t.id),$('#lgP2').value),
          new Promise((_,rej)=>setTimeout(()=>rej(new Error('timeout')),15000))
        ]);
        toast('Bienvenido');
        const uu=FBA().currentUser;if(uu){window._verif=1;verificar(uu,t,1)}
      }catch(err){
        $('#lgB2').textContent='Entrar';
        if(err.code==='auth/user-not-found'){
          try{
            const vac=await conTope(FBD().collection('negocios/'+t.id+'/usuarios').limit(1).get(),10000);
            if(vac.empty){
              mostrar('<h2>Recrear mi acceso</h2><p class="muted">Tu ficha no existe en la nube. Crea de nuevo tu acceso de dueño para este negocio.</p><div class="field"><label>Usuario</label><input id="rcU"></div><div class="field"><label>Clave nueva (mín. 6)</label><input id="rcP" type="password"></div><button class="btn btn-p btn-w" id="rcB">Recrear y entrar</button>');
              $('#rcB').onclick=async()=>{
                const usu=$('#rcU').value.trim(),pin=$('#rcP').value;
                if(!usu||pin.length<6){toast('Usuario y clave de 6+');return}
                const cred=await FBA().createUserWithEmailAndPassword(correo(usu,t.id),pin);
                const nd=await FBD().collection('negocios').doc(t.id).get();
                const rol=(nd.exists&&nd.data().fundador)?'fundador':'admin';
                await FBD().collection('negocios/'+t.id+'/usuarios').doc(cred.user.uid).set({uid:cred.user.uid,nom:rol==='fundador'?'Fundador':'Admin',usu,mail:'',rol,ext:true,creado:Date.now()});
                location.reload();
              };
              return;
            }
          }catch(e2){}
        }
        const er=$('#lgErr');
        if(er)er.textContent=err.message==='timeout'?'La red no responde: revisa tu internet y reintenta':'Usuario o clave incorrectos';
      }
    };
  }
  async function asegurarSalirNube(u){
    const side=$('#side');if(!side||$('#sideOut'))return;
    const a=document.createElement('a');a.href='#';a.id='sideOut';a.style.color='var(--red)';
    a.innerHTML='<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg><span>Cerrar sesión</span>';
    a.onclick=e=>{e.preventDefault();salir()};
    side.appendChild(a);
    try{
      const p=window.NUBE_PERFIL||{};
      const foot=side.querySelector('.side-foot');
      if(foot&&p.nom)foot.textContent='Conectado: '+p.nom+' ('+(p.rol==='fundador'?'Fundador':p.rol==='admin'?'Admin':(p.ext?'Encargado':'Empleado'))+')';
    }catch(e){}
  }
  function salir(){
    const t=tenant(),u=FBA()?FBA().currentUser:null;
    if(u){localStorage.removeItem('pc_ok_'+u.uid);localStorage.removeItem('pc_ent_'+u.uid);if(t){try{FBD().collection('negocios/'+t.id+'/usuarios').doc(u.uid).update({sesion:null})}catch(e){}}}
    if(KICK){KICK();KICK=null}
    FBA().signOut();localStorage.removeItem('pc_session');saveJSON('pc_justout',1);location.reload();
  }
  document.addEventListener('DOMContentLoaded',arrancar);
})();