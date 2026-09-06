/* ══ fb.js · conexión a la nube ══ */
const FB_CFG={apiKey:"AIzaSyBICp3WRkCPMzCbBYIahyIj1q9UkZ05sbk",authDomain:"sistema-avicola-a0412.firebaseapp.com",projectId:"sistema-avicola-a0412",storageBucket:"sistema-avicola-a0412.firebasestorage.app",messagingSenderId:"191648659782",appId:"1:191648659782:web:a02fa6de5b608484f6cd47"};
function cargarSDK(urls){return urls.reduce((p,u)=>p.then(()=>new Promise((res,rej)=>{const s=document.createElement('script');s.src=u;s.onload=res;s.onerror=rej;document.head.appendChild(s)})),Promise.resolve())}
const fbListo=cargarSDK([
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth-compat.js',
  'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js'
]).then(()=>{
  firebase.initializeApp(FB_CFG);
  window.fb=firebase;window.db=firebase.firestore();window.auth=firebase.auth();
});