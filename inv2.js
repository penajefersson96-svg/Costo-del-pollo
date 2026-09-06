/* ══ inv2.js · Inventario con auto-descuento ══ */
const KI='pc_inv2';
function inv(){return loadJSON(KI,{items:[],compras:[],consumos:[]})}
function saveInv(v){saveJSON(KI,v)}
const eq=(a,b)=>+a===+b;
const hoyISO=()=>new Date().toISOString().slice(0,10);
function lotesAct(){return lotes().filter(s=>!s.data.fin)}
function comprasDe(v,id){return v.compras.filter(c=>eq(c.it,id)).reduce((a,c)=>a+val(c.cant),0)}
function manualDe(v,id){return v.consumos.filter(c=>eq(c.it,id)).reduce((a,c)=>a+val(c.cant),0)}
function autoDe(v,it){
  if(!+it.auto)return 0;let t=0;
  lotesAct().forEach(s=>{
    const r=calcLote(s.data),ini=s.data.ini||hoyISO();
    const start=new Date(it.desde&&it.desde>ini?it.desde:ini),end=new Date(hoyISO());
    const el=Math.max(0,Math.floor((end-start)/864e5)+1);
    const diasUso=Math.round(el*(Math.min(7,Math.max(1,+it.freq||7))/7));
    t+=val(it.g)/1000*r.V*diasUso;
  });
  return t;
}
function autoDaily(v,it){
  if(!+it.auto)return 0;
  const V=lotesAct().reduce((a,s)=>a+calcLote(s.data).V,0);
  return val(it.g)/1000*V*(Math.min(7,Math.max(1,+it.freq||7))/7);
}
function manualAvg(v,id){return v.consumos.filter(c=>eq(c.it,id)&&(Date.now()-new Date(c.fecha).getTime())<7*864e5).reduce((a,c)=>a+val(c.cant),0)/7}
function stockItem(v,id){const it=v.items.find(x=>eq(x.id,id));return comprasDe(v,id)-manualDe(v,id)-(it?autoDe(v,it):0)}
function precioItem(v,id){const cs=v.compras.filter(c=>eq(c.it,id));const q=cs.reduce((a,c)=>a+val(c.cant),0),m=cs.reduce((a,c)=>a+val(c.costo),0);return q>0?m/q:0}
function itemUn(v,id){const i=v.items.find(x=>eq(x.id,id));return i?i.un:'kg'}
function pintaSelects(v){
  const opts=v.items.map(i=>'<option value="'+i.id+'">'+esc(i.nom)+'</option>').join('');
  $('#cItem').innerHTML=opts||'<option value="">Sin artículos</option>';
  $('#dItem').innerHTML=opts||'<option value="">Sin artículos</option>';
  $('#dLote').innerHTML=lotesAct().map(s=>'<option value="'+s.id+'">'+esc(s.nombre)+'</option>').join('')||'<option value="">Sin lotes activos</option>';
}
let editItem=null;
function limpiaForm(){editItem=null;$('#iNom').value='';$('#iG').value='';$('#iFreq').value=7;$('#iAuto').value='1';$('#btnItem').textContent='Agregar artículo';$('#btnCancel').hidden=true;$('#formTitle').textContent='Nuevo artículo'}
function cargaForm(i){editItem=i.id;$('#iNom').value=i.nom;$('#iUn').value=i.un;$('#iAuto').value=+i.auto?'1':'0';$('#iG').value=i.g||'';$('#iFreq').value=i.freq||7;$('#btnItem').textContent='Guardar cambios';$('#btnCancel').hidden=false;$('#formTitle').textContent='Editar artículo'}
$('#btnCancel').onclick=limpiaForm;
$('#btnItem').onclick=()=>{
  const n=$('#iNom').value.trim();if(!n){toast('Escribe el nombre');return}
  const v=inv();
  if(editItem){const i=v.items.find(x=>eq(x.id,editItem));if(i){i.nom=n;i.un=$('#iUn').value;i.auto=+$('#iAuto').value;i.g=val($('#iG').value);i.freq=Math.min(7,Math.max(1,val($('#iFreq').value,7)||7));if(+i.auto&&!i.desde)i.desde=hoyISO()}}
  else v.items.push({id:Date.now(),nom:n,un:$('#iUn').value,auto:+$('#iAuto').value,g:val($('#iG').value),freq:Math.min(7,Math.max(1,val($('#iFreq').value,7)||7)),desde:hoyISO()});
  saveInv(v);limpiaForm();render();toast('Artículo guardado: '+n);
};
function sugerido(){
  const v=inv(),s=lotes().find(x=>x.id===+$('#dLote').value),it=v.items.find(x=>eq(x.id,+$('#dItem').value));
  if(!s||!it||!val(it.g)){$('#dSug').textContent='—';return}
  const d=val(it.g)/1000*calcLote(s.data).V;
  $('#dSug').textContent='~'+nf2.format(d)+' '+it.un+'/día de uso';
  if(!val($('#dCant').value))$('#dCant').value=d.toFixed(2);
}
function pintaCompra(){const sacos=val($('#cSacos').value),peso=val($('#cPeso').value);$('#cTotal').textContent=nf2.format(sacos*peso);$('#cUn').textContent=itemUn(inv(),+$('#cItem').value)}
function render(){
  const v=inv();
  $('#itemsList').innerHTML=v.items.length?v.items.map(i=>{
    const st=stockItem(v,i.id),au=autoDe(v,i),rate=autoDaily(v,i)+manualAvg(v,i.id);
    const dias=rate>0?st/rate:-1;
    const sem=st<=0?'bad':(dias>=0&&dias<3)?'bad':(dias>=0&&dias<7)?'warn':'ok';
    const rinde=st<=0?'sin stock':dias<0?'sin consumo activo':'rinde ~'+nf0.format(dias)+' días';
    return '<div class="item"><div><div class="t">'+esc(i.nom)+( +i.auto?' · auto':'')+'</div><div class="s">'+nf2.format(st)+' '+i.un+' en stock · '+rinde+'</div><div class="s">Auto: '+nf2.format(au)+' '+i.un+' · Manual: '+nf2.format(manualDe(v,i.id))+' '+i.un+'</div></div><div style="display:flex;gap:6px;align-items:center"><span class="badge b-'+sem+'"><i></i>'+i.un+'</span><button class="mini" data-ed="'+i.id+'">Ajustes</button><button class="mini d" data-di="'+i.id+'">✕</button></div></div>';
  }).join(''):'<p class="muted">Agrega tu primer artículo.</p>';
  let al='';
  v.items.forEach(i=>{const st=stockItem(v,i.id),rate=autoDaily(v,i)+manualAvg(v,i.id);
    if(st<=0)al+='<div class="alert">Sin stock de '+esc(i.nom)+'. Registra una compra.</div>';
    else if(rate>0&&st/rate<3)al+='<div class="alert">Queda poco '+esc(i.nom)+': ~'+nf0.format(st/rate)+' días de uso. Compra pronto.</div>'});
  $('#alertasInv').innerHTML=al||'<p class="muted">Sin alertas. Stock saludable.</p>';
  const lot=lotes();
  $('#histTbl').innerHTML=v.consumos.length?'<table class="tbl"><tr><th>Fecha</th><th>Lote</th><th>Artículo</th><th>Cant.</th><th>Costo</th><th>Motivo</th><th></th></tr>'+v.consumos.slice().reverse().map(c=>{
    const L=lot.find(s=>s.id===+c.lote),I=v.items.find(x=>eq(x.id,c.it));
    return '<tr><td>'+esc((c.fecha||'').slice(8,10)+'/'+(c.fecha||'').slice(5,7))+'</td><td>'+esc(L?L.nombre:'—')+'</td><td>'+esc(I?I.nom:'—')+'</td><td>'+nf2.format(c.cant)+'</td><td>'+money(c.cant*precioItem(v,c.it))+'</td><td>'+esc(c.nota||'')+'</td><td><button class="mini d" data-dc="'+c.id+'">✕</button></td></tr>';
  }).join('')+'</table>':'<p class="muted">Aún no hay consumos manuales.</p>';
  pintaSelects(v);pintaCompra();
}
$('#btnCompra').onclick=()=>{const v=inv();const it=+$('#cItem').value;if(!it){toast('Primero agrega un artículo');return}
  const sacos=val($('#cSacos').value),peso=val($('#cPeso').value),cant=sacos*peso;
  if(cant<=0){toast('Indica N° de sacos y peso por saco');return}
  v.compras.push({id:Date.now(),it,fecha:$('#cFec').value,cant,costo:val($('#cCosto').value),sacos,peso});
  saveInv(v);$('#cSacos').value='';$('#cPeso').value='';$('#cCosto').value='';render();toast('Compra: +'+nf2.format(cant)+' '+itemUn(v,it))};
$('#btnConsumo').onclick=()=>{const v=inv();const it=+$('#dItem').value,lot=+$('#dLote').value;if(!it||!lot){toast('Falta artículo o lote');return}
  const c=val($('#dCant').value);if(c<=0){toast('Indica la cantidad');return}
  if(c>stockItem(v,it)+1e-9)toast('Ojo: stock insuficiente, quedan '+nf2.format(stockItem(v,it))+' '+itemUn(v,it));
  v.consumos.push({id:Date.now(),it,lote:lot,fecha:$('#dFec').value,cant,nota:$('#dNota').value.trim()});
  saveInv(v);$('#dCant').value='';$('#dNota').value='';render();sugerido();toast('Consumo registrado')};
document.addEventListener('click',e=>{
  const ed=e.target.closest('[data-ed]');if(ed){const i=inv().items.find(x=>eq(x.id,+ed.dataset.ed));if(i)cargaForm(i);return}
  const di=e.target.closest('[data-di]');
  if(di){if(di.dataset.arm){const v=inv();v.items=v.items.filter(x=>+x.id!==+di.dataset.di);saveInv(v);limpiaForm();render();toast('Artículo eliminado')}else{di.dataset.arm=1;di.textContent='¿Seguro?';setTimeout(()=>{di.textContent='✕';delete di.dataset.arm},2200)}return}
  const dc=e.target.closest('[data-dc]');if(dc){const v=inv();v.consumos=v.consumos.filter(c=>+c.id!==+dc.dataset.dc);saveInv(v);render();toast('Registro eliminado')}
});
['cSacos','cPeso','cItem'].forEach(i=>document.getElementById(i).addEventListener('input',pintaCompra));
['dLote','dItem'].forEach(i=>document.getElementById(i).addEventListener('change',sugerido));
const h=hoyISO();$('#cFec').value=h;$('#dFec').value=h;
render();
/* ══ Descuento vinculado a los lotes ══ */
function recipeHoy(s){
  const r=calcLote(s.data),ini=s.data.ini||hoyISO();
  const el=Math.min(r.cd,Math.max(0,Math.floor((new Date(hoyISO())-new Date(ini))/864e5)+1));
  const map={};
  (s.data.rows||[]).forEach(rw=>{if(!rw.it)return;
    const a=Math.min(45,Math.max(1,val(rw.a,1)||1)),b=Math.min(45,Math.max(a,val(rw.b,45)||45));
    let eq=r.V*frac(el,a,b);r.groups.forEach(x=>{eq+=x.q*frac(Math.min(x.D,el),a,b)});
    map[+rw.it]=(map[+rw.it]||0)+val(rw.g)/1000*eq;
  });
  return map;
}
function autoDe(v,it){
  let t=0;lotesAct().forEach(s=>{t+=recipeHoy(s)[+it.id]||0});
  if(!t&&+it.auto){lotesAct().forEach(s=>{
    const r=calcLote(s.data),ini=s.data.ini||hoyISO();
    const start=new Date(it.desde&&it.desde>ini?it.desde:ini);
    const el=Math.max(0,Math.floor((new Date(hoyISO())-start)/864e5)+1);
    const diasUso=Math.round(el*(Math.min(7,Math.max(1,+it.freq||7))/7));
    t+=val(it.g)/1000*r.V*diasUso;
  })}
  return t;
}
function recipeDaily(v,it){
  let d=0;
  lotesAct().forEach(s=>{
    const r=calcLote(s.data),ini=s.data.ini||hoyISO();
    const el=Math.min(r.cd,Math.max(0,Math.floor((new Date(hoyISO())-new Date(ini))/864e5)+1));
    (s.data.rows||[]).forEach(rw=>{if(+rw.it!==+it.id)return;
      const a=Math.min(45,Math.max(1,val(rw.a,1)||1)),b=Math.min(45,Math.max(a,val(rw.b,45)||45));
      if(el>=a&&el<=b)d+=val(rw.g)/(b-a+1)/1000*r.V;
    });
  });
  return d;
}
function autoDaily(v,it){
  const rd=recipeDaily(v,it);
  if(rd>0)return rd;
  if(+it.auto){const V=lotesAct().reduce((a,s)=>a+calcLote(s.data).V,0);return val(it.g)/1000*V*(Math.min(7,Math.max(1,+it.freq||7))/7)}
  return 0;
}
/* ══ Roles en inventario ══ */
const S3=loadJSON('pc_session',null);
const esAdminInv=!S3||S3.rol==='admin';
const esExtInv=!!(S3&&S3.ext);
function ocultarInv(){
  const card=el=>el&&el.closest('.card');
  if(card($('#btnCompra')))card($('#btnCompra')).style.display=esAdminInv?'':'none';
  if(card($('#histTbl')))card($('#histTbl')).style.display=(esAdminInv||esExtInv)?'':'none';
  if(card($('#alertasInv')))card($('#alertasInv')).style.display=(esAdminInv||esExtInv)?'':'none';
  if(card($('#itemsList')))card($('#itemsList')).style.display=(esAdminInv||esExtInv)?'':'none';
  if(!esAdminInv)['#formTitle','#iNom','#iUn','#iAuto','#iG','#iFreq','#btnItem','#btnCancel'].forEach(s=>{const e=$(s);if(e)e.style.display='none'});
}
function quitarBotonesInv(){
  if(esAdminInv)return;
  document.querySelectorAll('#itemsList [data-ed],#itemsList [data-di]').forEach(b=>b.remove());
}
const _renderInv=render;
render=function(){_renderInv();quitarBotonesInv();ocultarInv()};
document.addEventListener('click',function(e){
  if(e.target.id==='btnConsumo'&&!esAdminInv&&!$('#dNota').value.trim()){e.stopImmediatePropagation();e.preventDefault();toast('Indica el motivo del gasto')}
},true);
ocultarInv();quitarBotonesInv();