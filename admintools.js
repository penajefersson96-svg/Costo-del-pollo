/* ══ admintools.js · cerrar sesiones y jornada ══ */
(function(){
  document.addEventListener('DOMContentLoaded',()=>{
    const esp=setInterval(()=>{
      const p=window.NUBE_PERFIL;if(!p)return;
      clearInterval(esp);
      if(p.rol!=='admin'&&p.rol!=='fundador')return;
      if($('#atCard'))return;
      const main=document.querySelector('main')||document.body;
      const t=loadJSON('pc_tenant',null);if(!t)return;
      const card=document.createElement('div');card.className='card';card.id='atCard';
      card.innerHTML='<h2>Herramientas de administración</h2>'+
        '<label style="font-size:12px;color:var(--mut)">CERRAR SESIÓN ABIERTA (empleado o encargado)</label>'+
        '<div class="grid2"><input id="csUsu" placeholder="usuario"><button class="btn btn-g" id="csBtn">Cerrar sesión</button></div>'+
        '<label style="font-size:12px;color:var(--mut);margin-top:12px">HORARIO DE JORNADA (empleados y encargados)</label>'+
        '<div class="grid2"><input id="hjIni" type="time"><input id="hjFin" type="time"></div>'+
        '<button class="btn btn-p btn-w" id="hjBtn" style="margin-top:8px">Guardar horario</button>';
      main.appendChild(card);
      db.collection('negocios').doc(t.id).get().then(d=>{const hor=(d.data()&&d.data().horario)||{ini:'05:00',fin:'21:00'};$('#hjIni').value=hor.ini;$('#hjFin').value=hor.fin}).catch(()=>{});
      $('#csBtn').onclick=async()=>{
        const usu=$('#csUsu').value.trim().toLowerCase();if(!usu)return;
        try{
          const q=await db.collection('negocios/'+t.id+'/usuarios').where('usu','==',usu).limit(1).get();
          if(q.empty){toast('Usuario no encontrado');return}
          await q.docs[0].ref.update({sesion:null});
          toast('Sesión cerrada: ya puede entrar');
        }catch(e){toast('Error: '+e.message)}
      };
      $('#hjBtn').onclick=async()=>{
        try{await db.collection('negocios').doc(t.id).update({horario:{ini:$('#hjIni').value||'05:00',fin:$('#hjFin').value||'21:00'}});toast('Horario guardado')}catch(e){toast('Error: '+e.message)}
      };
    },800);
  });
})();