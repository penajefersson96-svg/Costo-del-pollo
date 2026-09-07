/* ══ tutorial.js · guía por pestaña y por rol, rever cuando quieras ══ */
(function(){
  const T={
    fundador:[
      ['Tu rango','Fundador: ves el Panel de Alquileres (códigos, planes, suspensiones). Tu negocio AVI-0001 es gratis para siempre y vive separado del panel.'],
      ['Inicio','Carátula de tus lotes activos, nombre del negocio (con aprobación si hay 2 admins), respaldo en archivo y aprobaciones pendientes.'],
      ['Cálculo','La calculadora: pollitos, alimento, precios y gastos → costo por kg y ganancia estimada. Crea y edita lotes.'],
      ['Lotes','Semáforo de mortalidad por lote, día de ciclo, vivos y bajas. Botón Reporte = imagen con gráfica para WhatsApp.'],
      ['Inventario','Artículos con existencias, compras, consumo diario con motivo y alertas de mínimos.'],
      ['Usuarios','Crea socios y empleados con rango, comparte el link de la app y mira dispositivos vinculados.']
    ],
    admin:[
      ['Inicio','Resumen de lotes activos, nombre del negocio, respaldo (Guardar/Restaurar archivo) y aprobaciones cuando hay 2 admins.'],
      ['Cálculo','Crear un lote: pollitos, alimento por ave, precios y gastos. La app calcula costo/kg, carne e ingreso. Guardar lo publica en Lotes.'],
      ['Lotes','Cada lote con su semáforo (OK/ALERTA/CRÍTICO), día y vivos. Reporte = gráfica por WhatsApp. Cerrar = fin de ciclo con ganancia.'],
      ['Inventario','Compra de alimento/medicinas, consumo diario que descuenta existencias, y alertas cuando queda poco.'],
      ['Usuarios','Crea usuarios con rango (admin/empleado/empleado +), cambia claves y comparte el link de instalación.']
    ],
    emp:[
      ['Tu menú','Ves solo Lotes e Inventario: tu trabajo es reportar, no ver plata.'],
      ['Lotes → Reportar muertos','Fecha, cantidad y causa de las bajas. Queda marcado al lote y el admin lo ve al instante.'],
      ['Inventario → Consumo diario','Fecha, lote, artículo, cantidad y el motivo obligatorio del gasto.']
    ],
    ext:[
      ['Tu menú','Como empleado, más ver resultados y cerrar lotes cuando termine el ciclo.'],
      ['Lotes','Semáforo y vivos por lote; botón Cerrar para finalizar el ciclo. No editas costos ni borras.'],
      ['Reportar','Muertos y consumo con motivo, igual que empleado.']
    ]
  };
  function rolDe(p){return p.rol==='fundador'?'fundador':p.rol==='admin'?'admin':(p.ext?'ext':'emp')}
  window.lanzarTutorial=async function(forzar){
    const u=window.NUBE_USER,t=loadJSON('pc_tenant',null);
    if(!u||!t)return;
    if(!forzar&&loadJSON('pc_tut_'+u.uid,0))return;
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
  document.addEventListener('DOMContentLoaded',()=>{
    const side=$('#side');if(!side||$('#sideTut'))return;
    const a=document.createElement('a');a.href='#';a.id='sideTut';
    a.innerHTML='<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z"/></svg><span>Tutorial</span>';
    a.onclick=e=>{e.preventDefault();lanzarTutorial(true)};
    side.appendChild(a);
  });
})();