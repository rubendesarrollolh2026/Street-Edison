let grabandoRuta=false;

let puntosRuta=[];

let lineaRuta=null;

let ultimaLatRuta=null;
let ultimaLonRuta=null;


function distanciaMetros(
lat1,
lon1,
lat2,
lon2
){

let R=6371000;

let dLat=
(lat2-lat1)*
Math.PI/180;

let dLon=
(lon2-lon1)*
Math.PI/180;

let a=

Math.sin(
dLat/2
)**2+

Math.cos(
lat1*Math.PI/180
)*

Math.cos(
lat2*Math.PI/180
)*

Math.sin(
dLon/2
)**2;

let c=

2*Math.atan2(
Math.sqrt(a),
Math.sqrt(1-a)
);

return R*c;

}



function iniciarRuta(){

grabandoRuta=true;

puntosRuta=[];

ultimaLatRuta=null;
ultimaLonRuta=null;


if(
lineaRuta
){

mapa.removeLayer(
lineaRuta
);

lineaRuta=null;

}


document.getElementById(
"estadoRuta"
).innerHTML=

"▶ Grabando ruta";

}



function detenerRuta(){

grabandoRuta=false;

let nombre=

prompt(
"Nombre ruta:"
);

if(
!nombre
){

nombre=
"Ruta-"+Date.now();

}


let idRuta=
Date.now();


/* guardar local primero */

localStorage.setItem(

nombre,

JSON.stringify(
puntosRuta
)

);


/* enviar UNA sola vez */

enviarSheets({

tipo:"rutaCompleta",

idRuta:idRuta,

nombre:nombre,

fecha:Date.now(),

puntos:puntosRuta

});


document.getElementById(
"estadoRuta"
).innerHTML=

"■ Guardada: "+nombre;


cargarRutas();

}



setInterval(()=>{


if(

!grabandoRuta ||

window.latActual==null

){

return;

}


if(

ultimaLatRuta!=null

){

let distancia=

distanciaMetros(

ultimaLatRuta,
ultimaLonRuta,

window.latActual,
window.lonActual

);


if(
distancia>500
){

console.log(
"Salto GPS ignorado"
);

return;

}

}


puntosRuta.push({

lat:
window.latActual,

lon:
window.lonActual,

fecha:
Date.now()

});


ultimaLatRuta=
window.latActual;

ultimaLonRuta=
window.lonActual;


document.getElementById(
"estadoRuta"
).innerHTML=

"▶ Grabando: "+

puntosRuta.length+

" puntos";


},3000);




function cargarRutas(){

let lista=

document.getElementById(
"listaRutas"
);

if(
!lista
){
return;
}


lista.innerHTML="";


for(

let i=0;

i<localStorage.length;

i++

){

let nombre=

localStorage.key(i);


if(
nombre==="ETs"
){
continue;
}


try{

let datos=

JSON.parse(

localStorage.getItem(
nombre
)

);


if(
!Array.isArray(
datos
)){
continue;
}


if(
datos.length===0
){
continue;
}


if(
!("lat" in datos[0])
){
continue;
}


lista.innerHTML+=

`

<div

style="
padding:8px;
margin-bottom:8px;
background:#f2f2f2;
border-radius:10px;
display:flex;
justify-content:space-between;
align-items:center;
">

<span
onclick="verRuta('${nombre}')"
style="cursor:pointer;">

🗺 ${nombre}

</span>

<span
onclick="borrarRutaLocal('${nombre}')"
style="
cursor:pointer;
font-size:18px;
">

🗑

</span>

</div>

`;

}
catch(e){

console.log(
"Ruta ignorada:",
nombre
);

}

}

}



function verRuta(nombre){

let datos=

localStorage.getItem(
nombre
);

if(
!datos
){
return;
}


let puntos=

JSON.parse(
datos
);


let coordenadas=

puntos.map(
p=>[
p.lat,
p.lon
]
);


if(
lineaRuta
){

mapa.removeLayer(
lineaRuta
);

}


lineaRuta=

L.polyline(

coordenadas,

{
color:"blue",
weight:5
}

).addTo(
mapa
);


mapa.fitBounds(
lineaRuta.getBounds()
);

}



function borrarRutaLocal(nombre){

localStorage.removeItem(
nombre
);

cargarRutas();

}



document.addEventListener(

"DOMContentLoaded",

()=>{

setTimeout(()=>{

cargarRutas();

},500);

}
);
