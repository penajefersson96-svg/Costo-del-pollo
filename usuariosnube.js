/* ══ usuariosnube.js v7 · rangos claros y correo directo ══ */
(function(){
  function authSec(){if(!window._asec){window._asec=firebase.initializeApp(FB_CFG,'sec'+Date.now()).auth()}return window._asec}
  const corr=(u,id)=>u.toLowerCase()+'@'+id+'.avicola.app';
  const rotulo=p=>p.rol==='fundador'?'Fundador':p.rol==='admin'?'Admin':(p.ext?'Encargado':'Empleado');
  document.addEventListener('DOMContentLoaded',()=>{
    const cb=$('#cuBtn');if(cb){const c=cb.closest('.card');if(c)c.remove()}
    document.querySelectorAll('.card').forEach(c=>{if(/^EQUIPO/i.test(c.textContent.trim())&&!c.querySelector('#cuBtn'))c.style.display='none'});
    let btn=null;
    document.querySelectorAll('button').forEach(b=>{if(b.textContent.trim()==='Crear usuario')btn=b});
    if(!btn)return;
    const card=btn.closest('.card');
    const sel=card.querySelector('select');
    const ins0=card.querySelectorAll('input');
    if(ins0[2]){const w=ins0[2].closest('.field')||ins0[2].parentElement;if(w)w.style.display='none'}
    if(sel&&!Array.from(sel.options).some(o=>/encargado/i.test(o.text))){const o=document.createElement('option');o.value='enc';o.textContent='Encargado';sel.appendChild(o)}
    const mailWrap=document.createElement('div');
    mailWrap.className='field';mailWrap.id='mailField';
    mailWrap.innerHTML='<label>Correo</label><input id="uMail" type="email" placeholder="correo@ejemplo.com">';
    card.insertBefore(mailWrap,btn);
    function mailVis(){mailWrap.style.display=(sel&&/admin/i.test(sel.options[sel.selectedIndex].text))?'':'none'}
    mailVis();
    if(sel)sel.addEventListener('change',mailVis);
    const eq=document.createElement('div');eq.id='eqList';eq.style.marginTop='12px';
    card.appendChild(eq);
    const nb=btn.cloneNode(true);btn.parentNode.replaceChild(nb,btn);
    nb.onclick=async e=>{
      e.preventDefault();
      const ins=card.querySelectorAll('input:not(#uMail)');
      const nom=ins[0].value.trim(),ced=(ins[1]?ins[1].value.trim():''),usu=ins[3].value.trim(),pin=ins[4].value;
      const mail=$('#uMail')?$('#uMail').value.trim():'';
      const rolTxt=sel?sel.options[sel.selectedIndex].text:'';
      const esAdmin=/admin/i.test(rolTxt),esEnc=/encargado/i.test(rolTxt);
      const rol=esAdmin?'admin':'emp',ext=esEnc;
      if(!nom||!usu||pin.length<6){toast('Nombre, usuario y clave de 6+');return}
      if(esAdmin&&!mail){toast('El administrador necesita su correo');return}
      const t=loadJSON('pc_tenant',null);
      if(t&&window.firebase){
        try{
          const cred=await authSec().createUserWithEmailAndPassword(corr(usu,t.id),pin);
          await db.collection('negocios/'+t.id+'/usuarios').doc(cred.user.uid).set({uid:cred.user.uid,nom,ced,usu,mail,rol,ext,creado:Date.now()});
          toast('Usuario creado en la nube: '+usu);
        }catch(err){toast('Ojo, nube falló: '+err.message);return}
      }else{toast('Sin nube: no se pudo crear');return}
      ins[0].value='';if(ins[1])ins[1].value='';ins[3].value='';ins[4].value='';if($('#uMail'))$('#uMail').value='';
      listaEquipo();
    };
    async function listaEquipo(){
      const t=loadJSON('pc_tenant',null);if(!t||!$('#eqList'))return;
      try{
        const s=await db.collection('negocios/'+t.id+'/usuarios').get();
        const perfil=window.NUBE_PERFIL||{};
        const docs=s.docs.map(d=>d.data()).sort((a,b)=>(a.creado||0)-(b.creado||0));
        const primerAdmin=(docs.find(x=>x.rol==='admin')||{}).usu;
        let vis=docs;
        if(perfil.rol==='admin'&&perfil.usu!==primerAdmin){vis=docs.filter(x=>x.rol!=='admin'||x.usu===perfil.usu)}
        $('#eqList').innerHTML='<h2>Equipo ('+vis.length+')</h2>'+vis.map(p=>'<div class="item"><div><div class="t">'+esc(p.nom)+'</div><div class="s">'+esc(p.usu)+' · '+rotulo(p)+(p.mail?' · '+esc(p.mail):'')+'</div></div></div>').join('');
      }catch(e){}
    }
    window._listaEquipo=listaEquipo;
    const esp=setInterval(()=>{const p=window.NUBE_PERFIL;if(p&&p.usu){clearInterval(esp);listaEquipo()}},800);
  });
})();