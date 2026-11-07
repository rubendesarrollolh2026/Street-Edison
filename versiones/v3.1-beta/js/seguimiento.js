let seguimientoActivo=false;

let eventosMapaConectados=false;


function alternarSeguimiento(){

seguimientoActivo=
!seguimientoActivo;

console.log(
"Seguimiento:",
seguimientoActivo
);

if(

seguimientoActivo &&

typeof mapa!=="undefined"

){

mapa.setView(

[

window.latActual,
window.lonActual

],

16

);

conectarEventosMapa();

}

}


function desactivarSeguimiento(){

seguimientoActivo=false;

console.log(
"Seguimiento desactivado"
);

}


function conectarEventosMapa(){

if(
eventosMapaConectados
){

return;

}

eventosMapaConectados=true;


mapa.on(
"dragstart",
()=>{

if(
seguimientoActivo
){

desactivarSeguimiento();

}

}
);


mapa.on(
"zoomstart",
()=>{

if(
seguimientoActivo
){

desactivarSeguimiento();

}

}
);

}


setInterval(()=>{

if(

seguimientoActivo &&

typeof mapa!=="undefined" &&

window.latActual!=null

){

mapa.setView(

[

window.latActual,
window.lonActual

],

16

);

}

},1000);
