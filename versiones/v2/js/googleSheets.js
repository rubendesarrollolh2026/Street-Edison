const URL_SHEETS="https://script.google.com/macros/s/AKfycbyYJRSPi63eYaSiY_cneoEjmY2pedGCwsxmkuOWpDhUqIWTdoZzQ1DrgAh3muoI0s0SAg/exec";



function enviarSheets(datos){

fetch(

URL_SHEETS,

{

method:"POST",

body:JSON.stringify(
datos
),

mode:"no-cors"

}

)

.then(()=>{

console.log(
"Sheets OK"
);

})

.catch(error=>{

console.log(
error
);

});

}




function cargarRutaDesdeSheets(){

fetch(

URL_SHEETS+
"?tipo=puntosRuta"

)

.then(
r=>r.json()
)

.then(
datos=>{

console.log(
"Puntos cargados:",
datos
);

if(
datos.length===0
){

console.log(
"No hay puntos"
);

return;

}


let coordenadas=

datos.map(
p=>[
parseFloat(
p.lat
),
parseFloat(
p.lon
)
]
);


if(
window.lineaSheets
){

mapa.removeLayer(
window.lineaSheets
);

}


window.lineaSheets=

L.polyline(

coordenadas,

{

color:"red",
weight:5

}

)

.addTo(
mapa
);


mapa.fitBounds(

window.lineaSheets.getBounds()

);

})

.catch(

error=>{

console.log(
"Error:",
error
);

}

);

}
