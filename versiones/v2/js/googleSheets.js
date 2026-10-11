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



/* ===========================
   ET
=========================== */

async function cargarETdesdeSheets(){

try{

let respuesta=

await fetch(

URL_SHEETS+
"?tipo=et"

);

let datos=

await respuesta.json();

console.log(
"ET cargadas:",
datos
);

if(
!datos ||
datos.length===0
){
return;
}


let listaET=[];


datos.forEach(

et=>{

listaET.push({

nombre:
et.nombre,

latitud:
parseFloat(
et.lat
),

longitud:
parseFloat(
et.lon
),

calle:
et.calle,

hora:
et.fecha

});

}

);


localStorage.setItem(

"ETs",

JSON.stringify(
listaET
)

);


if(
typeof mostrarETs==="function"
){

mostrarETs();

}


if(
typeof mostrarETenMapa==="function"
){

mostrarETenMapa();

}

}
catch(error){

console.log(
"Error ET:",
error
);

}

}



/* ===========================
   RUTAS
=========================== */

async function cargarRutasDesdeSheets(){

try{

let respuesta=

await fetch(

URL_SHEETS+
"?tipo=ruta"

);

let datos=

await respuesta.json();

console.log(
"Rutas cargadas:",
datos
);


if(
!datos ||
datos.length===0
){
return;
}


datos.forEach(

ruta=>{

let puntosLimpios=

ruta.puntos.map(

p=>({

lat:
parseFloat(
p.lat
),

lon:
parseFloat(
p.lon
),

fecha:
p.fecha

})

);


console.log(
"Guardando:",
ruta.nombre,
puntosLimpios.length
);


localStorage.setItem(

ruta.nombre,

JSON.stringify(
puntosLimpios
)

);

}

);


if(
typeof cargarRutas==="function"
){

cargarRutas();

}

}
catch(error){

console.log(
"Error rutas:",
error
);

}

}



/* ===========================
   ARRANQUE
=========================== */

document.addEventListener(

"DOMContentLoaded",

async()=>{

await cargarETdesdeSheets();

await cargarRutasDesdeSheets();

console.log(
"Street Edison sincronizado"
);

}

);
