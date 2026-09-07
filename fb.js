/* ══ fb.js · conexión a la nube con reintentos ══ */
const FB_CFG={apiKey:"AIzaSyBICp3WRkCPMzCbBYIahyIj1q9UkZ05sbk",authDomain:"sistema-avicola-a0412.firebaseapp.com",projectId:"sistema-avicola-a0412",storageBucket:"sistema-avicola-a0412.firebasestorage.app",messagingSenderId:"191648659782",appId:"1:191648659782:web:a02fa6de5b608484f6cd47"};
function cargaUno(u){return new Promise((res,rej)=>{const s=document.createElement('script');s.src=u;s.onload=res;s.onerror=()=>rej(new Error('fallo '+u));document.head.appendChild(s)})}
async function cargarConReintentos(){
  const versiones=['10.12.2','9.23.0'];
  for(const v of versiones){
    try{
      for(const f of ['firebase-app-compat.js','firebase-auth-compat.js','firebase-firestore-compat.js']){
        await cargaUno('https://www.gstatic.com/firebasejs/'+v+'/'+f);
      }
      firebase.initializeApp(FB_CFG);
      window.fb=firebase;window.db=firebase.firestore();window.auth=firebase.auth();
      return;
    }catch(e){}
  }
  window.fbError=true;
}
const fbListo=cargarConReintentos();