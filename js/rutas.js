let grabandoRuta=false;

let puntosRuta=[];

let lineaRuta=null;


function iniciarRuta(){

grabandoRuta=true;

puntosRuta=[];

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


localStorage.setItem(

nombre,

JSON.stringify(
puntosRuta
)

);

let idRuta=
Date.now();

enviarSheets({

tipo:"ruta",

idRuta:idRuta,

nombre:nombre,

fecha:Date.now(),

totalPuntos:
puntosRuta.length

});


puntosRuta.forEach(

p=>{

enviarSheets({

tipo:"puntoRuta",

idRuta:idRuta,

lat:p.lat,

lon:p.lon,

fecha:p.fecha

});

}

);

document.getElementById(
"estadoRuta"
).innerHTML=

"■ Guardada: "+nombre;

cargarRutas();

console.log(
"Ruta guardada:",
nombre
);

}



setInterval(()=>{

if(

!grabandoRuta ||

window.latActual==null

){

return;

}


puntosRuta.push({

lat:
window.latActual,

lon:
window.lonActual,

fecha:
Date.now()

});


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


if(
localStorage.length===0
){

lista.innerHTML=

"Sin rutas";

return;

}


for(

let i=0;

i<localStorage.length;

i++

){

let nombre=

localStorage.key(i);


lista.innerHTML+=

`

<div
onclick="verRuta('${nombre}')"

style="
padding:8px;
margin-bottom:8px;
background:#f2f2f2;
border-radius:10px;
cursor:pointer;
">

🗺 ${nombre}

</div>

`;

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



document.addEventListener(

"DOMContentLoaded",

()=>{

setTimeout(()=>{

cargarRutas();

},500);

}

);
