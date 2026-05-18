let ultimaCalle="";


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
maximumAge:0

}

);

}



async function mostrarPosicion(
posicion
){

let lat=
posicion.coords.latitude;

let lon=
posicion.coords.longitude;



try{

let respuesta=
await fetch(

`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`

);


let datos=
await respuesta.json();



let calle=
"Desconocida";


if(
datos.address.road
){

calle=
datos.address.road;

}



window.latActual=
lat;

window.lonActual=
lon;

window.calleActual=
calle;



document.getElementById(
"ubicacion"
).innerHTML=

`

📍 Calle actual:

<br><br>

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

"Ahora estás en " +
calle

);

ultimaCalle=
calle;

}


}catch{

document.getElementById(
"ubicacion"
).innerHTML=

"No se pudo obtener calle";

}

}



function hablar(
texto
){

let voz=
new SpeechSynthesisUtterance(
texto
);

voz.lang="es-ES";

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
