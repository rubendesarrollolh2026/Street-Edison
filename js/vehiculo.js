let puntoVehiculo=null;


function crearPunto(
lat,
lon
){

if(
typeof mapa==="undefined"
){

return;

}


const iconoPunto=

L.divIcon({

html:`

<div style="

width:18px;
height:18px;

background:red;

border-radius:50%;

border:2px solid white;

box-shadow:
4px 4px 8px rgba(0,0,0,0.6);

">

</div>

`,

className:"",

iconSize:[18,18],

iconAnchor:[9,9]

});


if(
!puntoVehiculo
){

puntoVehiculo=

L.marker(

[lat,lon],

{

icon:iconoPunto,

zIndexOffset:1000

}

).addTo(
mapa
);

}
else{

puntoVehiculo.setLatLng(

[
lat,
lon
]

);

}

}



setInterval(()=>{

if(

window.latActual==null ||

typeof mapa==="undefined"

){

return;

}


crearPunto(

window.latActual,
window.lonActual

);

},1000);let puntoVehiculo=null;


function crearPunto(
lat,
lon
){

if(
typeof mapa==="undefined"
){

return;

}


const iconoPunto=

L.divIcon({

html:`

<div style="

width:18px;
height:18px;

background:red;

border-radius:50%;

border:2px solid white;

box-shadow:
4px 4px 8px rgba(0,0,0,0.6);

">

</div>

`,

className:"",

iconSize:[18,18],

iconAnchor:[9,9]

});


if(
!puntoVehiculo
){

puntoVehiculo=

L.marker(

[lat,lon],

{

icon:iconoPunto,

zIndexOffset:1000

}

).addTo(
mapa
);

}
else{

puntoVehiculo.setLatLng(

[
lat,
lon
]

);

}

}



setInterval(()=>{

if(

window.latActual==null ||

typeof mapa==="undefined"

){

return;

}


crearPunto(

window.latActual,
window.lonActual

);

},1000);