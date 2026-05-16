async function obtenerUbicacion(){

document.getElementById("ubicacion").innerHTML=
"Buscando ubicación...";

navigator.geolocation.getCurrentPosition(
mostrarPosicion,
mostrarError,
{
enableHighAccuracy:true,
timeout:15000
}
);

}


async function mostrarPosicion(posicion){

let lat=posicion.coords.latitude;
let lon=posicion.coords.longitude;

try{

let respuesta=await fetch(
`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
);

let datos=await respuesta.json();

let calle="Desconocida";

if(datos.address.road){

calle=datos.address.road;

}

document.getElementById("ubicacion").innerHTML=
`
Latitud: ${lat}<br>
Longitud: ${lon}<br><br>

📍 Calle:<br>
<b>${calle}</b>
`;

}catch{

document.getElementById("ubicacion").innerHTML=
`
Latitud: ${lat}<br>
Longitud: ${lon}<br><br>

No se pudo obtener calle
`;

}

}


function mostrarError(error){

document.getElementById("ubicacion").innerHTML=
`
Código: ${error.code}<br>
${error.message}
`;

}
