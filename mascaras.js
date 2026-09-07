/* ══ mascaras.js · cada rango ve lo que le toca ══ */
(function(){
  function listo(){return window.NUBE_PERFIL}
  function ocultarDinero(){
    document.querySelectorAll('.t,.s,b,strong,div,span').forEach(el=>{
      if(el.children.length===0&&/\$|ganancia|inversión/i.test(el.textContent||''))el.style.display='none';
    });
  }
  function ocultarPorTexto(sels,re){
    const rx=new RegExp(re,'i');
    document.querySelectorAll(sels.join(',')).forEach(el=>{if(rx.test(el.textContent||''))el.style.display='none'});
  }
  function ocultarBotones(textos){
    document.querySelectorAll('button,a.btn').forEach(b=>{textos.forEach(t=>{if((b.textContent||'').trim().toLowerCase().indexOf(t.toLowerCase())===0)b.style.display='none'})});
  }
  function navegar(){
    const p=listo();if(!p)return;
    const rol=p.rol==='fundador'?'admin':p.rol;const enc=!!p.ext&&rol==='emp';
    const pag=(location.pathname.split('/').pop()||'index.html');
    if(rol==='emp'){
      if(pag==='index.html'||pag===''){location.replace('lotes2.html');return}
      if(pag==='usuarios2.html'){location.replace('lotes2.html');return}
      if(!enc&&pag==='calculo2.html'){location.replace('lotes2.html');return}
    }
  }
  function aplicar(){
    const p=listo();if(!p)return;
    const rol=p.rol==='fundador'?'admin':p.rol;const enc=!!p.ext&&rol==='emp';
    if(rol!=='emp')return;
    ocultarDinero();
    if(enc){
      ocultarPorTexto(['.field'],'precio|costo|bs|ganancia|inversión');
      ocultarBotones(['Eliminar','Borrar']);
    }else{
      ocultarPorTexto(['.field','.card'],'precio|costo|ganancia|inversión|compra');
      ocultarBotones(['Cerrar','Eliminar','Borrar','Registrar compra','Agregar compra','Nueva compra']);
    }
  }
  document.addEventListener('DOMContentLoaded',()=>{navegar();setTimeout(aplicar,600);setTimeout(aplicar,1800);setTimeout(aplicar,3500)});
})();