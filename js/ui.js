function mostrarPestana(id){

let pantallas =
document.querySelectorAll(
".contenido"
);

pantallas.forEach(

p => p.classList.add(
"oculto"
)

);

document
.getElementById(id)
.classList.remove(
"oculto"
);

}
