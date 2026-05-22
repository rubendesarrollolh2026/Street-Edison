let indiceEditar=-1;

let marcadoresET=[];


function guardarET(){

let nombre=
document.getElementById(
"nombreET"
).value;


if(
nombre==""
){

alert(
"Introduce nombre ET"
);

return;

}


let datos={

nombre:nombre,

calle:
window.calleActual
||"Desconocida",

latitud:
window.latActual
||0,

longitud:
window.lonActual
||0,

hora:
new Date()
.toLocaleString()

};


let lista=

JSON.parse(

localStorage.getItem(
"ETs"
)

)||[];



if(
indiceEditar==-1
){

lista.push(
datos
);

}
else{

lista[indiceEditar]=
datos;

indiceEditar=-1;

}


localStorage.setItem(

"ETs",

JSON.stringify(
lista)

);


console.log(
"ET guardada:",
datos
);

enviarSheets({

tipo:"et",

nombre:datos.nombre,

lat:datos.latitud,

lon:datos.longitud,

calle:datos.calle,

fecha:datos.hora

});


document.getElementById(
"nombreET"
).value="";


mostrarETs();

mostrarETenMapa();

}



function mostrarETenMapa(){

if(
!mapa
){

return;

}


marcadoresET.forEach(

m=>mapa.removeLayer(m)

);

marcadoresET=[];


let lista=

JSON.parse(

localStorage.getItem(
"ETs"
)

)||[];



lista.forEach(

et=>{


if(
et.latitud==null ||
et.longitud==null
){

return;

}


let marcadorET=

L.marker(

[
et.latitud,
et.longitud
]

)

.addTo(
mapa
)

.bindPopup(

`

<b>

⚡ ${et.nombre}

</b>

<br><br>

${et.calle}

<br>

${et.hora}

<br><br>

<button
onclick="editarET(${lista.indexOf(et)})"
>

✏

</button>

<button
onclick="borrarET(${lista.indexOf(et)})"
>

🗑

</button>

`

);

marcadorET.bindTooltip(

`⚡ ${et.nombre}`,

{

permanent:true,
direction:'right'

}

);


marcadoresET.push(
marcadorET
);

}

);

}




function editarET(indice){

let lista=

JSON.parse(

localStorage.getItem(
"ETs"
)

)||[];


document.getElementById(
"nombreET"
).value=

lista[indice].nombre;


indiceEditar=
indice;

}




function borrarET(indice){

let lista=

JSON.parse(

localStorage.getItem(
"ETs"
)

)||[];


lista.splice(
indice,
1
);


localStorage.setItem(

"ETs",

JSON.stringify(
lista
)

);


mostrarETs();

mostrarETenMapa();

}



/* ocultamos lista temporalmente */

function mostrarETs(){

return;

}
