let flechaVehiculo=null;

let ultimaLatVehiculo=null;
let ultimaLonVehiculo=null;


function calcularAngulo(
lat1,
lon1,
lat2,
lon2
){

let y=
lon2-lon1;

let x=
lat2-lat1;

return Math.atan2(
y,
x
)*(180/Math.PI);

}


function crearFlecha(
lat,
lon
){

if(
typeof mapa==="undefined"
){

return;
}

const iconoFlecha=
L.divIcon({

html:

"<div id='flechaVehiculo' style='font-size:40px;color:red;filter:drop-shadow(2px 2px 3px black);'>➤</div>",

className:"",

iconSize:[40,40],
iconAnchor:[20,20]

});


if(
!flechaVehiculo
){

flechaVehiculo=
L.marker(
[lat,lon],
{
icon:iconoFlecha,
zIndexOffset:1000
}
).addTo(
mapa
);

}else{

flechaVehiculo.setLatLng(
[
lat,
lon
]
);

}


if(
ultimaLatVehiculo!=null
){

let angulo=

calcularAngulo(

ultimaLatVehiculo,
ultimaLonVehiculo,

lat,
lon

);

let flechaDOM=

document.getElementById(
"flechaVehiculo"
);

if(
flechaDOM
){

flechaDOM.style.transform=

`rotate(${angulo}deg)`;

}

}


ultimaLatVehiculo=lat;
ultimaLonVehiculo=lon;

}


setInterval(()=>{

if(

window.latActual==null ||

typeof mapa==="undefined"

){

return;

}

crearFlecha(

window.latActual,
window.lonActual

);

},1000);
