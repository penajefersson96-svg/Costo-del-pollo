(function(){
  var x=new XMLHttpRequest();
  x.open('GET','style.css',false);
  x.send();
  if(x.status===200||x.status===0){
    var s=document.createElement('style');
    s.textContent=x.responseText;
    document.head.appendChild(s);
  }
})();