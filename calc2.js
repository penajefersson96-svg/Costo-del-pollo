/* ══ calc2.js · Cálculo vinculado a inventario ══ */
document.head.insertAdjacentHTML('beforeend','<style>.row{border:1px solid var(--line);border-radius:12px;padding:12px;margin-bottom:10px;background:#FBFCFA}.row .r-top{display:flex;gap:8px;margin-bottom:10px}.row .fn{flex:1}.row select{width:auto}.del{flex:none;width:34px;height:34px;border-radius:10px;border:1px solid #E4C6BF;background:#fff;color:var(--red);font-weight:800;cursor:pointer}.row label{display:block;font-size:.6rem;font-weight:800;text-transform:uppercase;letter-spacing:.06em;color:var(--mut);margin-bottom:4px}.row .grid2{margin-bottom:8px}.r-sum{border-top:1px dashed var(--line);padding-top:8px;font-size:.72rem}.mrow{border:1px solid var(--line);border-radius:12px;padding:10px;margin-bottom:8px;display:flex;gap:8px;flex-wrap:wrap;align-items:center;background:#FBFCFA}.mrow input[type=date]{flex:1;min-width:130px}.mrow .mq{width:70px}.mrow .mc{flex:1;min-width:90px}</style>');
function invItems(){return loadJSON('pc_inv2',{items:[],compras:[],consumos:[]}).items}
function invCompras(){return loadJSON('pc_inv2',{items:[],compras:[],consumos:[]}).compras}
function precioInv(id){const cs=invCompras().filter(c=>+c.it===+id);const q=cs.reduce((a,c)=>a+val(c.cant),0),m=cs.reduce((a,c)=>a+val(c.costo),0);return q>0?m/q:0}
function addRow(d={}){
  const it=d.it?invItems().find(x=>+x.id===+d.it):null;
  const w=document.createElement('div');w.className='row';
  w.innerHTML='<div class="r-top">'+(it
    ?'<input type="text" class="fn" value="'+esc(it.nom)+'" disabled><input type="hidden" class="fit" value="'+it.id+'">'
    :'<input type="text" class="fn" placeholder="Insumo" value="'+esc(d.n||'')+'"><input type="hidden" class="fit" value="">')
    +'<select class="fu"><option value="kg"'+((d.u||(it?it.un:'kg'))==='kg'?' selected':'')+'>kg</option><option value="L"'+((d.u||(it?it.un:'kg'))==='L'?' selected':'')+'>L</option></select><button type="button" class="del">✕</button></div>'
    +'<div class="grid2"><div><label>Precio por kg/L</label><input type="number" class="fpp" inputmode="decimal" min="0" step="any" placeholder="$0" value="'+(d.pp??'')+'"></div><div><label>Gramos/pollo</label><input type="number" class="fg" inputmode="decimal" min="0" step="any" placeholder="0" value="'+(d.g??'')+'"></div></div>'
    +'<div class="grid2"><div><label>Desde el día</label><input type="number" class="fa" inputmode="numeric" min="1" max="45" value="'+(d.a??1)+'"></div><div><label>Hasta el día</label><input type="number" class="fb" inputmode="numeric" min="1" max="45" value="'+(d.b??45)+'"></div></div>'
    +'<div class="r-sum muted">—</div>';
  $('#feedRows').appendChild(w);
}
function addMRow(m={}){const w=document.createElement('div');w.className='mrow';
w.innerHTML='<input type="date" class="mdt" value="'+(m.d||'')+'"><input type="number" class="mq" inputmode="numeric" min="0" step="1" placeholder="Cant." value="'+(m.q??'')+'"><input type="text" class="mc" placeholder="Causa (opcional)" value="'+esc(m.c||'')+'"><button type="button" class="del">✕</button>';
$('#mortRows').appendChild(w)}
function resetRows(l){$('#feedRows').innerHTML='';(l||[]).forEach(addRow);pintaAddSel()}
function pintaAddSel(){
  const used=$$('#feedRows .fit').map(i=>i.value).filter(Boolean);
  const its=invItems().filter(i=>!used.includes(String(i.id)));
  $('#addSel').innerHTML=its.length?its.map(i=>'<option value="'+i.id+'">'+esc(i.nom)+'</option>').join(''):'<option value="">Sin artículos en inventario</option>';
}
function collect(){return{nombre:$('#cNom').value,ini:$('#cIni').value,fin:$('#cFin').value,n:$('#cN').value,cp:$('#cCP').value,med:$('#cMD').value,kg:$('#cKG').value,precio:$('#cPR').value,
mort:$$('#mortRows .mrow').map(r=>({d:r.querySelector('.mdt').value,q:r.querySelector('.mq').value,c:r.querySelector('.mc').value})),
rows:$$('#feedRows .row').map(r=>{const f=r.querySelector('.fit').value;return{it:f||undefined,n:r.querySelector('.fn').value,u:r.querySelector('.fu').value,pp:r.querySelector('.fpp').value,g:r.querySelector('.fg').value,a:r.querySelector('.fa').value,b:r.querySelector('.fb').value}})}}
function apply(d){if(!d)return;$('#cNom').value=d.nombre||'';$('#cIni').value=d.ini||'';$('#cFin').value=d.fin||'';$('#cN').value=d.n??'';$('#cCP').value=d.cp??'';$('#cMD').value=d.med??'';$('#cKG').value=d.kg??'';$('#cPR').value=d.precio??'';$('#mortRows').innerHTML='';(d.mort||[]).forEach(addMRow);
resetRows((d.rows||[]).map(r=>({it:r.it,n:r.n,u:r.u,pp:r.pp!==undefined?r.pp:(val(r.c)>0?val(r.p)/val(r.c):''),g:r.g,a:r.a,b:r.b})))}
let lastR=null,editId=null,dT2;
function recalc(){
  const d=collect(),r=calcLote(d);lastR=r;
  $('#fv').textContent=r.cd;
  $('#s1').textContent=nf3.format(r.pl)+' kg';$('#s2').textContent=nf0.format(r.kt)+' kg';$('#s3').textContent=money(r.ca);
  $('#mTot').textContent=nf0.format(r.M);$('#mPct').textContent=nf2.format(r.mp)+'%';$('#mLoss').textContent=money(r.loss);
  $('#rV').textContent=nf0.format(r.V);$('#rVsub').textContent='de '+nf0.format(r.N)+' · mort. '+nf2.format(r.mp)+'%';
  $('#rI').textContent=smart(r.inv);$('#rIsub').textContent='Pollitos '+money(r.cp)+' · Alim. '+money(r.ca)+' · Med. '+money(r.md);
  $('#rP').textContent=isFinite(r.cPol)?smart(r.cPol):'—';
  $('#rK').textContent=isFinite(r.cKg)?smart(r.cKg):'—';
  $('#rKsub').textContent=r.pr>0&&isFinite(r.cKg)?(r.pr>=r.cKg?'+'+money(r.pr-r.cKg)+'/kg sobre costo':'-'+money(r.cKg-r.pr)+'/kg bajo costo'):'—';
  $('#rIn').textContent=smart(r.ing);$('#chM').textContent=isFinite(r.mar)?nf2.format(r.mar)+'%':'—';
  $('#rG').textContent=smart(r.gan);$('#rG').className=r.gan>=0?'pos':'neg';
  $('#chP').textContent='Por pollo: '+(isFinite(r.gp)?money(r.gp):'—');
  $$('#feedRows .row').forEach((el,i)=>{const rw=d.rows[i];if(!rw)return;const pp=val(rw.pp),g=val(rw.g);
    const a=Math.min(45,Math.max(1,val(rw.a,1)||1)),b=Math.min(45,Math.max(a,val(rw.b,45)||45));
    let eq=V0(r)*frac(r.cd,a,b);r.groups.forEach(x=>{eq+=x.q*frac(x.D,a,b)});
    const per=g/1000*frac(r.cd,a,b)*pp,tot=g/1000*eq*pp;
    el.querySelector('.r-sum').textContent=(pp||g)?('$'+nf2.format(pp)+' por '+rw.u+' · '+money(per)+' por pollo · total '+money(tot)):'—'});
  clearTimeout(dT2);dT2=setTimeout(()=>saveJSON(KD,collect()),350);
}
function V0(r){return r.V}
$('#btnAdd').onclick=()=>{const id=+$('#addSel').value;if(!id){toast('Crea el artículo primero en Inventario');return}
  const it=invItems().find(x=>+x.id===id);
  addRow({it:it.id,u:it.un,pp:precioInv(it.id)?precioInv(it.id).toFixed(2):''});pintaAddSel();recalc()};
$('#btnMort').onclick=()=>{addMRow({d:new Date().toISOString().slice(0,10)});recalc()};
$('#feedRows').addEventListener('click',e=>{if(e.target.closest('.del')){e.target.closest('.row').remove();pintaAddSel();recalc()}});
$('#mortRows').addEventListener('click',e=>{if(e.target.closest('.del')){e.target.closest('.mrow').remove();recalc()}});
document.querySelector('main').addEventListener('input',e=>{if(e.target.matches('input,select'))recalc()});
document.querySelector('main').addEventListener('change',e=>{if(e.target.matches('input,select'))recalc()});
function pintaSelect(){const sel=$('#cLoad');if(!sel)return;sel.innerHTML='<option value="">— Lote nuevo —</option>'+lotes().map(s=>'<option value="'+s.id+'"'+(s.id===editId?' selected':'')+'>'+esc(s.nombre)+'</option>').join('')}
function nuevoLote(){editId=null;['cNom','cIni','cFin','cN','cCP','cMD','cKG','cPR'].forEach(i=>$('#'+i).value='');$('#mortRows').innerHTML='';resetRows([]);recalc()}
if($('#cLoad'))$('#cLoad').onchange=e=>{const id=+e.target.value;if(!id){nuevoLote();return}editId=id;const s=lotes().find(x=>x.id===id);if(s){apply(s.data);recalc();toast('Lote cargado: '+s.nombre)}};
$('#btnSave').onclick=()=>{const d=collect();if(!val(d.n)){toast('Indica cuántos pollitos compraste');$('#cN').focus();return}
  const saved=lotes(),nombre=d.nombre.trim()||('Lote '+nf0.format(+d.n));
  const res={inv:lastR.inv,gan:lastR.gan,ing:lastR.ing,V:lastR.V,mp:lastR.mp};
  if(editId){const i=saved.findIndex(x=>x.id===editId);if(i>-1)saved[i]={id:editId,nombre,fecha:saved[i].fecha,data:d,res}}
  else{editId=Date.now();saved.unshift({id:editId,nombre,fecha:new Date().toLocaleDateString('es',{day:'2-digit',month:'short',year:'numeric'}),data:d,res})}
  saveJSON(KS,saved);pintaSelect();toast('Lote guardado: '+nombre)};
$('#btnShare').onclick=()=>compartirReporte($('#cNom').value.trim()||'Lote',lastR);
(function(){const q=new URLSearchParams(location.search).get('id');if(q){editId=+q;const s=lotes().find(x=>x.id===editId);if(s){apply(s.data)}}})();
resetRows([]);
const dr=draft();if(dr)apply(dr);
pintaSelect();recalc();