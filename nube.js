/* ══ nube.js · bóveda + login en la nube ══ */
(function(){
  const OV=document.createElement('div');OV.id='loginOv';OV.style.display='none';
  document.addEventListener('DOMContentLoaded',()=>document.body.appendChild(OV));
  function mostrar(h){OV.innerHTML='<div class="loginCard">'+h+'</div>';OV.style.display='flex'}
  function ocultar(){OV.style.display='none'}
  function tenant(){return loadJSON('pc_tenant',null)}
  const correo=(usu,neg)=>usu.toLowerCase()+'@'+neg+'.avicola.app';
  async function arrancar(){
    await fbListo;
    const t=tenant();
    if(!t){pantallaCodigo();return}
    fb.auth.onAuthStateChanged(u=>{if(u){ocultar();window.NUBE_USER=u}else pantallaLogin(t)});
  }
  function pantallaCodigo(){
    mostrar('<h2>Código de tu negocio</h2><p class="muted">Pídelo a tu empleador. Si eres el fundador, créalo abajo.</p><div class="field"><label>Código</label><input id="ncCod" placeholder="AVI-0000" style="text-transform:uppercase"></div><button class="btn btn-p btn-w" id="ncBtn">Vincular dispositivo</button><div id="ncFund" style="margin-top:10px"></div>');
    fb.db.collection('negocios').limit(1).get().then(s=>{
      if(s.empty){$('#ncFund').innerHTML='<button class="btn btn-g btn-w" id="ncFB">Soy fundador: crear mi negocio</button>';$('#ncFB').onclick=formularioFundador}
    });
    $('#ncBtn').onclick=async()=>{
      const cod=$('#ncCod').value.trim().toUpperCase();if(!cod){toast('Escribe el código');return}
      const q=await fb.db.collection('negocios').where('code','==',cod).limit(1).get();
      if(q.empty){toast('Código no válido: pídelo a tu empleador');return}
      const d=q.docs[0];
      if(d.data().activo===false){toast('Negocio suspendido: contacta al proveedor');return}
      saveJSON('pc_tenant',{id:d.id,code:cod,nombre:d.data().nombre});
      location.reload();
    };
  }
  function formularioFundador(){
    mostrar('<h2>Crear mi negocio (fundador)</h2><div class="field"><label>Nombre del negocio</label><input id="fNom" value="Mi Granja"></div><div class="field"><label>Usuario</label><input id="fUsu" placeholder="fundador"></div><div class="field"><label>Clave (mín. 4)</label><input id="fPin" type="password"></div><button class="btn btn-p btn-w" id="fBtn">Crear y entrar</button>');
    $('#fBtn').onclick=async()=>{
      const nom=$('#fNom').value.trim(),usu=$('#fUsu').value.trim(),pin=$('#fPin').value;
      if(!nom||!usu||pin.length<4){toast('Completa nombre, usuario y clave de 4+');return}
      try{
        const ref=await fb.db.collection('negocios').add({code:'AVI-0001',nombre:nom,plan:'pago',activo:true,fundador:true,creado:Date.now(),hasta:'2099-12-31'});
        saveJSON('pc_tenant',{id:ref.id,code:'AVI-0001',nombre:nom});
        const cred=await fb.auth.createUserWithEmailAndPassword(correo(usu,ref.id),pin);
        await fb.db.collection('negocios/'+ref.id+'/usuarios').doc(cred.user.uid).set({uid:cred.user.uid,nom:nom+' (fundador)',usu,rol:'fundador',ext:true,creado:Date.now()});
        location.reload();
      }catch(e){toast('Error: '+e.message)}
    };
  }
  function pantallaLogin(t){
    mostrar('<h2>'+esc(t.nombre||'Sistema Avícola')+'</h2><p class="muted">Código '+esc(t.code)+' · entra con tu usuario</p><div class="field"><label>Usuario</label><input id="lgU2"></div><div class="field"><label>Clave</label><input id="lgP2" type="password"></div><button class="btn btn-p btn-w" id="lgB2">Entrar</button><p class="muted" style="margin-top:8px"><a href="#" id="lgOtro">Cambiar de negocio</a></p>');
    $('#lgOtro').onclick=e=>{e.preventDefault();localStorage.removeItem('pc_tenant');location.reload()};
    $('#lgB2').onclick=async()=>{
      try{await fb.auth.signInWithEmailAndPassword(correo($('#lgU2').value.trim(),t.id),$('#lgP2').value);toast('Bienvenido')}
      catch(err){toast('Usuario o clave incorrectos')}
    };
  }
  function salir(){fb.auth.signOut();localStorage.removeItem('pc_session');location.reload()}
  document.addEventListener('DOMContentLoaded',arrancar);
})();