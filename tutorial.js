/* ══ tutorial.js · guía por rol, una sola vez ══ */
(function(){
  const T={
    fundador:[
      ['Bienvenido, Fundador','Tu rango abre el Panel de Fundador: códigos, planes y suspensiones de todos los alquileres. Tu propio negocio (AVI-0001) es gratis para siempre.'],
      ['Nadie entra sin código','Cada dispositivo se vincula una vez con su código. Tú entras con AVI-0001 y tu usuario; clientes y empleados, con el suyo.'],
      ['Tu negocio y el panel, separados','Los usuarios de tu granja nunca ven el panel; y tú ves la carátula de los alquileres, nunca sus números.']
    ],
    admin:[
      ['Bienvenido, Admin','Mandas en tu negocio: lotes, inventario, usuarios y reportes.'],
      ['Crear un lote','Cálculo → llena pollitos, alimento y costos → Guardar. El lote aparece en Lotes con su semáforo de mortalidad.'],
      ['Inventario','Registra compras y el consumo diario; la app descuenta existencias y te avisa.'],
      ['Reporte con gráfica','Lotes → Reporte: imagen lista para WhatsApp o Guardar archivo como respaldo.'],
      ['Usuarios y candados','Crea usuarios con rango. Con 2 admins, borrar datos o cambiar el nombre exige aprobación del otro.']
    ],
    emp:[
      ['Bienvenido, Empleado','Tu labor: reportar lo que pasa en la granja. El dinero no se muestra en tu pantalla: eso es del admin.'],
      ['Reportar muertos','Lotes → Reportar muertos: fecha, cantidad y causa. Queda marcado al lote al instante.'],
      ['Consumo del día','Inventario → Consumo diario: fecha, lote, artículo, cantidad y el motivo obligatorio.']
    ],
    ext:[
      ['Bienvenido, Empleado +','Ves lotes y resultados como el admin, pero no editas costos ni borras nada.'],
      ['Cerrar lotes','Puedes marcar un lote como finalizado cuando termine su ciclo.'],
      ['Reportar','Igual que empleado: muertos y consumo con motivo.']
    ]
  };
  function rolDe(p){return p.rol==='fundador'?'fundador':p.rol==='admin'?'admin':(p.ext?'ext':'emp')}
  window.lanzarTutorial=async function(){
    const u=window.NUBE_USER,t=loadJSON('pc_tenant',null);
    if(!u||!t)return;
    if(loadJSON('pc_tut_'+u.uid,0))return;
    let p=null;
    try{const d=await db.collection('negocios/'+t.id+'/usuarios').doc(u.uid).get();if(d.exists)p=d.data()}catch(e){return}
    if(!p)return;
    const pasos=T[rolDe(p)]||T.emp;let i=0;
    const ov=document.createElement('div');ov.id='loginOv';ov.style.display='flex';
    function pintar(){
      ov.innerHTML='<div class="loginCard"><h2>'+pasos[i][0]+'</h2><p class="muted">'+pasos[i][1]+'</p><p class="muted" style="margin-top:10px">Paso '+(i+1)+' de '+pasos.length+'</p><div class="grid2"><button class="btn btn-g" id="tSkip">Saltar</button><button class="btn btn-p" id="tNext">'+(i<pasos.length-1?'Siguiente':'Empezar a trabajar')+'</button></div></div>';
      $('#tSkip').onclick=()=>{saveJSON('pc_tut_'+u.uid,1);ov.remove()};
      $('#tNext').onclick=()=>{if(i<pasos.length-1){i++;pintar()}else{saveJSON('pc_tut_'+u.uid,1);ov.remove()}};
    }
    document.body.appendChild(ov);pintar();
  };
})();