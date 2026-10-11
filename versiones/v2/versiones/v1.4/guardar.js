let indiceEditar=-1;


function guardarET(){

let nombre=
document.getElementById(
"nombreET"
).value;


if(nombre==""){

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
window.latActual,

longitud:
window.lonActual,

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



if(indiceEditar==-1){

lista.push(
datos
);

}else{

lista[indiceEditar]=
datos;

indiceEditar=-1;

}



localStorage.setItem(

"ETs",

JSON.stringify(
lista
)

);



document.getElementById(
"nombreET"
).value="";


mostrarETs();


alert(
"Guardado"
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

let confirmar=
confirm(
"¿Eliminar ET?"
);


if(!confirmar){

return;

}



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

}



function mostrarETs(){

let lista=

JSON.parse(

localStorage.getItem(
"ETs"
)

)||[];



let html="";



lista.forEach(

(et,indice)=>{


html+=

`

<div
style="
border:1px solid #ccc;
padding:10px;
margin:10px;
">

⚡
<b>

${et.nombre}

</b>

<br>

${et.calle}

<br>

${et.hora}

<br><br>

<button
onclick="editarET(${indice})">

Editar

</button>


<button
onclick="borrarET(${indice})">

Borrar

</button>

</div>

`;

}

);



document.getElementById(
"listaET"
).innerHTML=
html;

}


mostrarETs();
