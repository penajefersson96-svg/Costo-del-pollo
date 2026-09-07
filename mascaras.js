/* ══ mascaras.js v5 · menú reconstruible y dinero precavido ══ */
(function(){
  let USED='';
  const S=()=>loadJSON('pc_session',null);
  function rolDe(p){return p?(p.rol==='fundador'?'admin':p.rol):null}
  document.addEventListener('DOMContentLoaded',()=>{
    ocultarDinero();
    const s=S();
    if(!s||rolDe(s)==='emp')document.documentElement.classList.add('premask');
    if(s){USED=s.usu||'';arranque(s)}
    const poll=setInterval(()=>{
      const p=window.NUBE_PERFIL;
      if(!p)return;
      if(USED===(p.usu||''))return;
      USED=p.usu||'';
      if(rolDe(p)==='emp')document.documentElement.classList.add('premask');
      arranque(p);
    },100);
    const vig=setInterval(()=>{
      if(window.NUBE_USER&&!$('#sideOut')&&typeof asegurarSalirNube==='function'){try{asegurarSalirNube(window.NUBE_USER)}catch(e){}}
      const p=window.NUBE_PERFIL;
      if(p&&rolDe(p)!=='emp')document.documentElement.classList.remove('premask');
    },1000);
    setTimeout(()=>clearInterval(vig),9000);
  });
  function ocultarDinero(){
    document.querySelectorAll('.t,.s,b,strong,div,span').forEach(el=>{
      if(el.children.length===0&&!el.dataset.din&&/\$|ganancia|inversión/i.test(el.textContent||'')){el.dataset.din='1';el.style.display='none'}
    });
  }
  function mostrarDinero(){
    document.querySelectorAll('[data-din]').forEach(el=>{el.style.display='';delete el.dataset.din});
  }
  function ocultarPorTexto(sels,re){
    const rx=new RegExp(re,'i');
    document.querySelectorAll(sels.join(',')).forEach(el=>{if(rx.test(el.textContent||''))el.style.display='none'});
  }
  function ocultarBotones(textos){
    document.querySelectorAll('button,a.btn').forEach(b=>{textos.forEach(t=>{if((b.textContent||'').trim().toLowerCase().indexOf(t.toLowerCase())===0)b.style.display='none'})});
  }
  function arranque(p){
    saveJSON('pc_session',{nom:p.nom,usu:p.usu,rol:rolDe(p),ext:!!p.ext});
    document.body.classList.remove('rol-fund','rol-admin','rol-enc','rol-emp');
    document.body.classList.add(rolDe(p)==='admin'?(p.rol==='fundador'?'rol-fund':'rol-admin'):(p.ext?'rol-enc':'rol-emp'));
    try{if(typeof buildSide==='function')buildSide()}catch(e){}
    try{if(typeof recortarMenu==='function')recortarMenu();if(typeof paginaPermitida==='function')paginaPermitida()}catch(e){}
    try{if(typeof asegurarSalirNube==='function'&&window.NUBE_USER)asegurarSalirNube(window.NUBE_USER)}catch(e){}
    try{
      const side=$('#side');
      if(side&&!$('#sideTut')&&window.lanzarTutorial){
        const a=document.createElement('a');a.href='#';a.id='sideTut';
        a.innerHTML='<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5A2.5 2.5 0 006.5 22H20V2H6.5A2.5 2.5 0 004 4.5v15z"/></svg><span>Tutorial</span>';
        a.onclick=e=>{e.preventDefault();lanzarTutorial(true)};
        side.appendChild(a);
      }
      document.querySelectorAll('button,a').forEach(b=>{if((b.textContent||'').trim()==='Ver más'){b.onclick=e=>{e.preventDefault();if(window.lanzarTutorial)lanzarTutorial(true)}}});
    }catch(e){}
    navegar(p);
    if(rolDe(p)!=='emp')mostrarDinero();
    [0,300,1200,2500].forEach(ms=>setTimeout(aplicar,ms));
  }
  function navegar(p){
    if(!p||rolDe(p)!=='emp')return;
    const enc=!!p.ext;
    const pag=(location.pathname.split('/').pop()||'index.html');
    if(pag==='index.html'||pag===''||pag==='usuarios2.html'||(!enc&&pag==='calculo2.html'))location.replace('lotes2.html');
  }
  function aplicar(){
    const p=window.NUBE_PERFIL||S();if(!p)return;
    if(rolDe(p)!=='emp'){mostrarDinero();document.documentElement.classList.remove('premask');return}
    const enc=!!p.ext;
    ocultarDinero();
    if(enc){
      ocultarPorTexto(['.field'],'precio|costo|bs|ganancia|inversión');
      ocultarBotones(['Eliminar','Borrar']);
    }else{
      ocultarPorTexto(['.field','.card'],'precio|costo|ganancia|inversión|compra');
      ocultarBotones(['Cerrar','Eliminar','Borrar','Registrar compra','Agregar compra','Nueva compra']);
    }
    botonReporteEquipo();
    document.documentElement.classList.remove('premask');
  }
  function botonReporteEquipo(){
    document.querySelectorAll('button,a.btn').forEach(b=>{
      if(!/reporte/i.test(b.textContent||'')||b.dataset.eqrep)return;
      b.dataset.eqrep='1';
      const nb=b.cloneNode(true);b.parentNode.replaceChild(nb,b);
      nb.onclick=e=>{e.preventDefault();reporteDiario()};
    });
  }
  async function reporteDiario(){
    const p=window.NUBE_PERFIL||{};const t=loadJSON('pc_tenant',null);
    const hoy=new Date().toISOString().slice(0,10);
    let txt='*REPORTE DEL DÍA* '+hoy+'\nNegocio: '+(t?t.nombre:'-')+'\nEnvía: '+(p.nom||'-')+' ('+(p.ext?'Encargado':'Empleado')+')';
    const lotes=loadJSON('pc_lotes',[]);
    let n=0;
    lotes.forEach(l=>{(l.muertos||[]).forEach(m=>{if(String(m.f||'').indexOf(hoy)===0){n++;txt+='\n• Lote '+(l.nombre||l.id)+': '+m.c+' muertos ('+(m.causa||'sin causa')+')'}})});
    const cons=loadJSON('pc_consumo',loadJSON('pc_consumos',[]))||[];
    cons.forEach(c=>{if(String(c.f||'').indexOf(hoy)===0){n++;txt+='\n• Consumo: '+(c.art||c.articulo||'-')+' x'+(c.cant||c.cantidad||'-')+' — '+(c.motivo||'')}});
    if(!n)txt+='\n• Sin novedades hoy';
    let wa='';
    if(t&&window.db){try{const d=await db.collection('negocios').doc(t.id).get();wa=(d.data()&&d.data().contacto&&d.data().contacto.wa)||''}catch(e){}}
    if(wa)location.href='https://wa.me/'+wa+'?text='+encodeURIComponent(txt);
    else{try{await navigator.clipboard.writeText(txt);toast('Reporte copiado: pégalo al admin')}catch(e){toast(txt)}}
  }
})();