/* ══ lotes2.js · Control de lotes con roles ══ */
const S2=loadJSON('pc_session',null);
const esAdmin=!S2||S2.rol==='admin';
const esExt=!!(S2&&S2.ext);
function fila(s,abierto){
  const r=calcLote(s.data),sem=semaforo(r.mp),lbl=sem==='ok'?'OK':sem==='warn'?'ALERTA':'CRÍTICO';
  let btns='';
  if(abierto){
    btns='<div style="display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end">';
    if(esAdmin)btns+='<a class="mini" href="calculo2.html?id='+s.id+'">Editar</a>';
    btns+='<button class="mini" data-rep="'+s.id+'">Reportar muertos</button>';
    if(esAdmin)btns+='<button class="mini" data-sh="'+s.id+'">Reporte</button>';
    if(esAdmin||esExt)btns+='<button class="mini d" data-cl="'+s.id+'">Cerrar</button>';
    btns+='</div>';
  }else{
    btns=esAdmin?'<div class="s '+(r.gan>=0?'pos':'neg')+'">'+(r.gan>=0?'▲':'▼')+' '+smart(r.gan)+'</div>':'<div class="s">Lote finalizado</div>';
  }
  return '<div class="item"><div><div class="t">'+esc(s.nombre)+'</div><div class="s">Día '+r.cd+' · '+nf0.format(r.V)+' vivos · bajas '+nf0.format(r.M)+' · mort. '+nf2.format(r.mp)+'%</div><span class="badge b-'+sem+'" style="margin-top:6px"><i></i>'+lbl+'</span></div><div style="text-align:right">'+btns+'</div></div>';
}
function render(){
  const saved=lotes(),act=saved.filter(s=>!s.data.fin),cer=saved.filter(s=>s.data.fin);
  $('#kAct').textContent=act.length;
  const ti=act.reduce((a,s)=>a+calcLote(s.data).inv,0),tg=saved.reduce((a,s)=>a+calcLote(s.data).gan,0);
  $('#kInv').textContent=smart(ti);
  $('#kGan').textContent=smart(tg);$('#kGan').className=tg>=0?'pos':'neg';
  const res=$('#kAct').closest('.card');if(res)res.style.display=esAdmin?'':'none';
  $('#lotesList').innerHTML=act.length?act.map(s=>fila(s,true)).join(''):'<p class="muted">No hay lotes activos.</p>';
  $('#cerradosList').innerHTML=cer.length?cer.map(s=>fila(s,false)).join(''):'<p class="muted">Aún no hay lotes cerrados.</p>';
}
function abrirReporte(id){
  const arr=lotes(),s=arr.find(x=>x.id===id);if(!s)return;
  const ov=document.createElement('div');ov.id='loginOv';
  ov.innerHTML='<div class="loginCard"><h2>Reportar muertos · '+esc(s.nombre)+'</h2>'+
   '<div class="field"><label>Fecha</label><input type="date" id="rpF" value="'+new Date().toISOString().slice(0,10)+'"></div>'+
   '<div class="field"><label>Cantidad</label><input type="number" id="rpC" inputmode="numeric" min="0" placeholder="0"></div>'+
   '<div class="field"><label>Causa probable (opcional)</label><input type="text" id="rpK" placeholder="Ej. calor, aplastamiento…"></div>'+
   '<button class="btn btn-p btn-w" id="rpBtn">Registrar</button></div>';
  document.body.appendChild(ov);
  $('#rpBtn').onclick=()=>{
    const q=Math.max(0,Math.round(val($('#rpC').value)));
    if(!q){toast('Indica la cantidad');return}
    s.data.mort=s.data.mort||[];s.data.mort.push({d:$('#rpF').value,q:q,c:$('#rpK').value.trim()});
    saveJSON(KS,arr);ov.remove();render();toast('Reportado: '+q+' bajas en '+s.nombre);
  };
}
document.addEventListener('click',e=>{
  const rep=e.target.closest('[data-rep]');
  if(rep){abrirReporte(+rep.dataset.rep);return}
  const cl=e.target.closest('[data-cl]');
  if(cl){const arr=lotes(),s=arr.find(x=>x.id===+cl.dataset.cl);if(s){s.data.fin=s.data.fin||new Date().toISOString().slice(0,10);saveJSON(KS,arr);render();toast('Lote cerrado: '+s.nombre)}return}
  const sh=e.target.closest('[data-sh]');
  if(sh){const s=lotes().find(x=>x.id===+sh.dataset.sh);if(s)compartirReporte(s.nombre,calcLote(s.data))}
});
render();