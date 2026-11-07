# Street Edison V3.1 Beta

Beta independiente basada en Street Edison V2.2, commit
`63c94f6006af81a7b5ff471b57d12c9facca840b` (6 de noviembre de 2026).

Esta copia conserva las funciones GPS, seguimiento, cuadros ET/CM, búsqueda,
calles, popups, preferencias, voz y almacenamiento de V2.2. Añade rotación
heading-up con `@tomickigrzegorz/leaflet-rotate` 0.3.0 (MIT) sobre Leaflet 1.9.4.

## Ejecución local

Desde la raíz del repositorio:

```sh
python3 -m http.server 8766 --directory versiones/v3.1-beta
```

Abre <http://localhost:8766/>. Hace falta conexión a Internet para Leaflet,
Tomicki, OpenStreetMap y la carga de datos de Google Sheets. La lectura de
Google Sheets usa la solicitud GET ya existente en V2.2; esta beta no añade
ninguna operación de escritura.

Para probar GPS desde el teléfono, publica esta carpeta en un origen HTTPS y
concede permiso de ubicación. GitHub Pages sirve la copia desde una URL HTTPS.

## Seguimiento y orientación

Al obtener ubicación con 🎯, comienza `watchPosition`, se activa el seguimiento
y el rumbo GPS aceptado se entrega a `map.setHeading()`. Tomicki interpola la
orientación en el tiempo y resuelve el cruce circular 359° → 0°. El rumbo se
filtra por velocidad y desplazamiento antes de llegar al plugin para rechazar
el ruido estando parado y no acumular un segundo suavizado para el mapa.

El marcador GPS mantiene su indicador de dirección. Con rumbo arriba, el icono
se contrarota respecto al bearing actual para apuntar hacia arriba en pantalla.
El mapa centra el vehículo aproximadamente al 64 % de su alto cuando termina
la transición de orientación. Arrastrar, hacer zoom, seleccionar un ET o girar
manualmente desactiva el seguimiento; el observador GPS sigue activo. Al dejar
el seguimiento, el mapa vuelve suavemente al norte.

## Base

Los archivos de aplicación se copiaron desde `versiones/v2.2/`, cuya copia de
V2.2 se verificó contra el commit oficial. Se omite `js/googleSheets.js.save`,
que es un archivo de respaldo y no se carga desde el HTML. Esta carpeta es
autónoma y no depende de los archivos de la raíz.
