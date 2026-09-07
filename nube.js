/* ══ nube.js · puertas, registro auto, login y sesión limpia ══ */
(function(){
  const OV=document.createElement('div');OV.id='loginOv';OV.style.display='none';
  document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(OV));
  function mostrar(h){OV.innerHTML='<div class="loginCard">'+h+'</div>';OV.style.display='flex'}
  function ocultar(){OV.style.display='none'}
  function tenant(){return loadJSON('pc_tenant',null)}
  const correo=(usu,neg)=>usu.toLowerCase()+'@'+neg+'.avicola.app';
  const WA='584242300131';
  const waLink=t=>'https://wa.me/'+WA+'?text='+encodeURIComponent(t);
  function FBD(){if(!window.db&&typeof firebase!=='undefined'&&firebase.firestore)window.db=firebase.firestore();return window.db}
  function FBA(){if(!window.auth&&typeof firebase!=='undefined'&&firebase.auth)window.auth=firebase.auth();return window.auth}
  function genCode(){return 'AVI-'+Math.floor(1000+Math.random()*9000)}
  async function arrancar(){
    try{await fbListo}catch(e){}
    if(!window.db){mostrar('<h2>Conectando con la nube…</h2><p class="muted">Si esto no avanza, revisa tu internet.</p><button class="btn btn-p btn-w" onclick="location.reload()">Reintentar</button>');return}
    const t=tenant();
    if(!t){pantallaInicio();return}
    if(loadJSON('pc_justout',0)){localStorage.removeItem('pc_justout');pantallaInicio(t);return}
    mostrar('<h2>Verificando sesión…</h2><p class="muted">Un momento.</p>');
    FBA().onAuthStateChanged(async u=>{
      if(u){ocultar();window.NUBE_USER=u;asegurarSalirNube(u);setTimeout(()=>{if(window.lanzarTutorial)lanzarTutorial()},900);return}
      try{
        const s=await FBD().collection('negocios/'+t.id+'/usuarios').limit(1).get();
        if(s.empty)pantallaPrimerAdmin(t);else pantallaLogin(t);
      }catch(e){pantallaLogin(t)}
    });
  }
  function pantallaInicio(t){
    mostrar('<h2>Sistema Avícola</h2><p class="muted">Bienvenido. Entra con el código de tu negocio o regístrate.</p><button class="btn btn-p btn-w" id="ncLogin">Iniciar sesión</button><button class="btn btn-g btn-w" style="margin-top:8px" id="ncReg">Registrarme</button><a class="btn btn-g btn-w" style="margin-top:8px;display:block" href="'+waLink('Hola, necesito ayuda con la app Sistema Avícola: no puedo entrar o no tengo mi código de negocio.')+'" target="_blank">¿Dudas? Escríbeme por WhatsApp</a>');
    $('#ncLogin').onclick=t?()=>pantallaLogin(t):pantallaCodigo;
    $('#ncReg').onclick=pantallaRegistro;
  }
  function pantallaCodigo(){
    mostrar('<h2>Código de tu negocio</h2><div class="field"><label>Código</label><input id="ncCod" placeholder="AVI-0000" style="text-transform:uppercase"></div><button class="btn btn-p btn-w" id="ncBtn">Vincular dispositivo</button><p class="muted" style="margin-top:8px"><a href="#" id="ncVolver">Volver</a></p>');
    $('#ncVolver').onclick=e=>{e.preventDefault();pantallaInicio()};
    $('#ncBtn').onclick=async()=>{
      const cod=$('#ncCod').value.trim().toUpperCase();if(!cod){toast('Escribe el código');return}
      try{
        const q=await FBD().collection('negocios').where('code','==',cod).limit(1).get();
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
        const hasta=new Date(Date.now()+30*86400000).toISOString().slice(0,10);
        const ref=await FBD().collection('negocios').add({code:cod,nombre:neg,plan:'prueba',activo:true,fundador:false,creado:Date.now(),hasta,contacto:{nom,mail,wa}});
        mostrar('<h2>¡Listo, '+esc(nom)+'!</h2><p class="muted">Tu negocio <b>'+esc(neg)+'</b> quedó creado con <b>30 días de prueba</b>. Tu código es:</p><h1 style="letter-spacing:.05em">'+cod+'</h1><button class="btn btn-p btn-w" id="rOk">Vincular este dispositivo</button><a class="btn btn-g btn-w" style="margin-top:8px;display:block" href="'+waLink('Hola, me registré en Sistema Avícola. Mi negocio: '+neg+'. Mi código: '+cod+'. Guardo este mensaje como copia.')+'" target="_blank">Guardar copia por WhatsApp</a>');
        $('#rOk').onclick=()=>{saveJSON('pc_tenant',{id:ref.id,code:cod,nombre:neg});location.reload()};
      }catch(e){toast('Error: '+e.message)}
    };
  }
  function pantallaPrimerAdmin(t){
    mostrar('<h2>Crea tu usuario admin</h2><p class="muted">Negocio '+esc(t.nombre)+' · código '+esc(t.code)+'</p><div class="field"><label>Nombre completo</label><input id="aNom"></div><div class="field"><label>Correo (para recuperar clave)</label><input id="aMail" type="email"></div><div class="field"><label>Usuario</label><input id="aUsu"></div><div class="field"><label>Clave (mín. 6)</label><input id="aPin" type="password"></div><button class="btn btn-p btn-w" id="aBtn">Crear y entrar</button>');
    $('#aBtn').onclick=async()=>{
      const nom=$('#aNom').value.trim(),mail=$('#aMail').value.trim(),usu=$('#aUsu').value.trim(),pin=$('#aPin').value;
      if(!nom||!usu||pin.length<6){toast('Nombre, usuario y clave de 6 o más');return}
      try{
        const cred=await FBA().createUserWithEmailAndPassword(correo(usu,t.id),pin);
        await FBD().collection('negocios/'+t.id+'/usuarios').doc(cred.user.uid).set({uid:cred.user.uid,nom,usu,mail,rol:'admin',ext:true,creado:Date.now()});
        location.reload();
      }catch(e){toast('Error: '+e.message)}
    };
  }
  function pantallaLogin(t){
    mostrar('<h2>'+esc(t.nombre||'Sistema Avícola')+'</h2><p class="muted">Código '+esc(t.code)+' · entra con tu usuario</p><div class="field"><label>Usuario</label><input id="lgU2"></div><div class="field"><label>Clave</label><input id="lgP2" type="password"></div><button class="btn btn-p btn-w" id="lgB2">Entrar</button><p class="muted" style="margin-top:8px"><a href="#" id="lgOtro">Cambiar de negocio</a></p>');
    $('#lgOtro').onclick=e=>{e.preventDefault();localStorage.removeItem('pc_tenant');location.reload()};
    $('#lgB2').onclick=async()=>{
    $('#lgB2').textContent='Entrando…';
      try{await FBA().signInWithEmailAndPassword(correo($('#lgU2').value.trim(),t.id),$('#lgP2').value);toast('Bienvenido')}
      catch(err){toast('Usuario o clave incorrectos')}
    };
  }
  async function asegurarSalirNube(u){
    const side=$('#side');if(!side||$('#sideOut'))return;
    const a=document.createElement('a');a.href='#';a.id='sideOut';a.style.color='var(--red)';
    a.innerHTML='<svg viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9"/></svg><span>Cerrar sesión</span>';
    a.onclick=e=>{e.preventDefault();salir()};
    side.appendChild(a);
    try{
      const t=tenant(),d=await FBD().collection('negocios/'+t.id+'/usuarios').doc(u.uid).get();
      if(d.exists){const p=d.data();const foot=side.querySelector('.side-foot');if(foot)foot.textContent='Conectado: '+p.nom+' ('+(p.rol==='fundador'?'Fundador':p.rol==='admin'?'Admin':(p.ext?'Empleado +':'Empleado'))+')'}
    }catch(e){}
  }
  function salir(){FBA().signOut();localStorage.removeItem('pc_session');saveJSON('pc_justout',1);location.reload()}
  document.addEventListener('DOMContentLoaded',arrancar);
})();