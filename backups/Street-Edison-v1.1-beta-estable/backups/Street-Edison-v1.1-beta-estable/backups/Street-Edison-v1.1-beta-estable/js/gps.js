let ultimaCalle="";

let mapa;
let marcador;

let ultimaConsulta=0;

let ultimaLat=null;
let ultimaLon=null;


function obtenerUbicacion(){

document.getElementById(
"ubicacion"
).innerHTML=
"Modo aprendizaje iniciado...";


navigator.geolocation.watchPosition(

mostrarPosicion,
mostrarError,

{

enableHighAccuracy:true,
timeout:15000,
maximumAge:5000

}

);

}



function distanciaMetros(
lat1,
lon1,
lat2,
lon2
){

const R=6371000;

let dLat=
(lat2-lat1)
*Math.PI/180;

let dLon=
(lon2-lon1)
*Math.PI/180;

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

2*

Math.atan2(
Math.sqrt(a),
Math.sqrt(1-a)
);

return R*c;

}



async function mostrarPosicion(
posicion
){

let lat=
posicion.coords.latitude;

let lon=
posicion.coords.longitude;



if(
ultimaLat!=null
){

let distancia=

distanciaMetros(

ultimaLat,
ultimaLon,

lat,
lon

);



if(
distancia<20
){

return;

}

}



ultimaLat=lat;
ultimaLon=lon;



window.latActual=lat;
window.lonActual=lon;



if(!mapa){

crearMapa(
lat,
lon
);

}else{

actualizarMapa(
lat,
lon
);

}



let ahora=
Date.now();


if(
ahora-ultimaConsulta<10000
){

return;

}


ultimaConsulta=
ahora;



try{


let respuesta=
await fetch(

`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`

);


let datos=
await respuesta.json();


let calle=

datos.address.road
||"Desconocida";


window.calleActual=
calle;



document.getElementById(
"ubicacion"
).innerHTML=

`

📍 Calle:

<b>

${calle}

</b>

<br><br>

Lat:
${lat}

<br>

Lon:
${lon}

`;



if(
calle!=ultimaCalle
){

hablar(

"Ahora estás en "+
calle

);

ultimaCalle=
calle;

}



}catch{

document.getElementById(
"ubicacion"
).innerHTML=

`

📍 Calle:

${window.calleActual || "Desconocida"}

<br><br>

Sin conexión

`;

}

}



function crearMapa(
lat,
lon
){

mapa=
L.map(
'mapa'
).setView(
[lat,lon],
16
);


L.tileLayer(

'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',

{

attribution:
'OpenStreetMap'

}

).addTo(
mapa
);


marcador=
L.marker(
[lat,lon]
).addTo(
mapa
);


mostrarETenMapa();

}



function actualizarMapa(
lat,
lon
){

marcador.setLatLng(
[lat,lon]
);

}



function hablar(
texto
){

let voz=

new SpeechSynthesisUtterance(
texto
);

voz.lang=
"es-ES";

speechSynthesis.speak(
voz
);

}



function mostrarError(
error
){

document.getElementById(
"ubicacion"
).innerHTML=

`
Código:
${error.code}

<br>

${error.message}
`;

}
