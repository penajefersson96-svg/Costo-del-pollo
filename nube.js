/* ══ nube.js · dos puertas + bóveda + login en la nube ══ */
(function(){
  const OV=document.createElement('div');OV.id='loginOv';OV.style.display='none';
  document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(OV));
  function mostrar(h){OV.innerHTML='<div class="loginCard">'+h+'</div>';OV.style.display='flex'}
  function ocultar(){OV.style.display='none'}
  function tenant(){return loadJSON('pc_tenant',null)}
  const correo=(usu,neg)=>usu.toLowerCase()+'@'+neg+'.avicola.app';
  function FBD(){if(!window.db&&typeof firebase!=='undefined'&&firebase.firestore)window.db=firebase.firestore();return window.db}
  function FBA(){if(!window.auth&&typeof firebase!=='undefined'&&firebase.auth)window.auth=firebase.auth();return window.auth}
  async function arrancar(){
    try{await fbListo}catch(e){}
    if(!window.db){mostrar('<h2>Conectando con la nube…</h2><p class="muted">Si esto no avanza, revisa tu internet.</p><button class="btn btn-p btn-w" onclick="location.reload()">Reintentar</button>');return}
    const t=tenant();
    if(!t){pantallaCodigo();return}
    FBA().onAuthStateChanged(u=>{if(u){ocultar();window.NUBE_USER=u}else pantallaLogin(t)});
  }
  function pantallaCodigo(){
    mostrar('<h2>Sistema Avícola</h2><p class="muted">Bienvenido. Entra con el código de tu negocio o solicita el tuyo.</p><button class="btn btn-p btn-w" id="ncLogin">Iniciar sesión</button><button class="btn btn-g btn-w" style="margin-top:8px" id="ncReg">Quiero alquilar / Registrarme</button><a class="btn btn-g btn-w" style="margin-top:8px;display:block" href="https://wa.me/584242300131" target="_blank">¿Dudas? Escríbeme por WhatsApp</a>');
    $('#ncLogin').onclick=()=>{
      mostrar('<h2>Código de tu negocio</h2><div class="field"><label>Código</label><input id="ncCod" placeholder="AVI-0000" style="text-transform:uppercase"></div><button class="btn btn-p btn-w" id="ncBtn">Vincular dispositivo</button><p class="muted" style="margin-top:8px"><a href="#" id="ncVolver">Volver</a></p>');
      $('#ncVolver').onclick=e=>{e.preventDefault();pantallaCodigo()};
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
    };
    $('#ncReg').onclick=()=>{
      mostrar('<h2>Solicitar mi código</h2><div class="field"><label>Tu nombre</label><input id="rNom"></div><div class="field"><label>Nombre del negocio</label><input id="rNeg"></div><div class="field"><label>Correo</label><input id="rMail" type="email"></div><div class="field"><label>WhatsApp</label><input id="rWa" inputmode="numeric" placeholder="584XXXXXXXXX"></div><button class="btn btn-p btn-w" id="rBtn">Enviar solicitud</button><p class="muted" style="margin-top:8px"><a href="#" id="rVolver">Volver</a></p>');
      $('#rVolver').onclick=e=>{e.preventDefault();pantallaCodigo()};
      $('#rBtn').onclick=async()=>{
        const nom=$('#rNom').value.trim(),neg=$('#rNeg').value.trim(),mail=$('#rMail').value.trim(),wa=$('#rWa').value.trim();
        if(!nom||!neg||!wa){toast('Completa nombre, negocio y WhatsApp');return}
        try{
          await FBD().collection('solicitudes').add({nom,neg,mail,wa,estado:'pendiente',creado:Date.now()});
          mostrar('<h2>¡Solicitud enviada!</h2><p class="muted">Te contactaremos por WhatsApp con tu código para empezar tu mes de prueba.</p><button class="btn btn-p btn-w" onclick="location.reload()">Entendido</button>');
        }catch(e){toast('Error: '+e.message)}
      };
    };
  }
  function pantallaLogin(t){
    mostrar('<h2>'+esc(t.nombre||'Sistema Avícola')+'</h2><p class="muted">Código '+esc(t.code)+' · entra con tu usuario</p><div class="field"><label>Usuario</label><input id="lgU2"></div><div class="field"><label>Clave</label><input id="lgP2" type="password"></div><button class="btn btn-p btn-w" id="lgB2">Entrar</button><p class="muted" style="margin-top:8px"><a href="#" id="lgOtro">Cambiar de negocio</a></p>');
    $('#lgOtro').onclick=e=>{e.preventDefault();localStorage.removeItem('pc_tenant');location.reload()};
    $('#lgB2').onclick=async()=>{
      try{await FBA().signInWithEmailAndPassword(correo($('#lgU2').value.trim(),t.id),$('#lgP2').value);toast('Bienvenido')}
      catch(err){toast('Usuario o clave incorrectos')}
    };
  }
  function salir(){FBA().signOut();localStorage.removeItem('pc_session');location.reload()}
  document.addEventListener('DOMContentLoaded',arrancar);
})();