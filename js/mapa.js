let mapa = null;
let marcadoresET = [];
let marcadorUsuario = null;
let ultimaPosicionCalle = null;
let ultimaConsultaCalle = 0;
let ultimaCalleUsuario = "";
let observadorGPS = null;
let avisosVozActivos = leerPreferenciaVoz();
let ultimaCalleAnunciada = "";
let modoDireccionMarcha = false;
let ultimaPosicionRumbo = null;
let rumboActual = null;
let temaPreferido = leerPreferenciaTexto("streetEdisonTema", "claro");
let tamanoTextoPreferido = leerPreferenciaTexto("streetEdisonTamanoTexto", "normal");

const INTERVALO_MINIMO_CALLE_MS = 15000;
const DISTANCIA_MINIMA_CALLE_M = 35;
const DISTANCIA_MINIMA_RUMBO_M = 8;
const VELOCIDAD_MINIMA_RUMBO_MS = 1.1;

function leerPreferenciaVoz() {
  try {
    return localStorage.getItem("streetEdisonVozActiva") === "true";
  } catch (error) {
    return false;
  }
}

function guardarPreferenciaVoz(activa) {
  try {
    localStorage.setItem("streetEdisonVozActiva", activa ? "true" : "false");
  } catch (error) {
    console.warn("No se pudo guardar la preferencia de voz:", error);
  }
}

function leerPreferenciaTexto(clave, valorPorDefecto) {
  try {
    return localStorage.getItem(clave) || valorPorDefecto;
  } catch (error) {
    return valorPorDefecto;
  }
}

function guardarPreferenciaTexto(clave, valor) {
  try {
    localStorage.setItem(clave, valor);
  } catch (error) {
    console.warn("No se pudo guardar la preferencia:", error);
  }
}

function aplicarPreferenciasVisuales() {
  document.body.classList.toggle("preferencia-tema-oscuro", temaPreferido === "oscuro");
  document.body.classList.toggle("preferencia-texto-grande", tamanoTextoPreferido === "grande");
  document.body.classList.toggle("preferencia-texto-muy-grande", tamanoTextoPreferido === "muy-grande");
  actualizarEstadoPreferencias();
}

function actualizarEstadoPreferencias() {
  const botonesTema = {
    claro: document.getElementById("btn-tema-claro"),
    oscuro: document.getElementById("btn-tema-oscuro")
  };

  Object.entries(botonesTema).forEach(([tema, boton]) => {
    if (boton) boton.classList.toggle("activo", temaPreferido === tema);
  });

  const botonesTexto = {
    normal: document.getElementById("btn-texto-normal"),
    grande: document.getElementById("btn-texto-grande"),
    "muy-grande": document.getElementById("btn-texto-muy-grande")
  };

  Object.entries(botonesTexto).forEach(([tamano, boton]) => {
    if (boton) boton.classList.toggle("activo", tamanoTextoPreferido === tamano);
  });
}

function seleccionarTema(tema) {
  if (!["claro", "oscuro"].includes(tema)) return;
  temaPreferido = tema;
  guardarPreferenciaTexto("streetEdisonTema", temaPreferido);
  aplicarPreferenciasVisuales();
}

function seleccionarTamanoTexto(tamano) {
  if (!["normal", "grande", "muy-grande"].includes(tamano)) return;
  tamanoTextoPreferido = tamano;
  guardarPreferenciaTexto("streetEdisonTamanoTexto", tamanoTextoPreferido);
  aplicarPreferenciasVisuales();
}

function alternarMenuPreferencias() {
  const menu = document.getElementById("menu-preferencias");
  if (!menu) return;
  menu.classList.toggle("oculto");
}

function cerrarMenuPreferencias() {
  const menu = document.getElementById("menu-preferencias");
  if (menu) menu.classList.add("oculto");
}

function conectarCierreMenuPreferencias() {
  document.addEventListener("click", (evento) => {
    const menu = document.getElementById("menu-preferencias");
    const boton = document.getElementById("btn-menu-preferencias");
    if (!menu || menu.classList.contains("oculto")) return;
    if (menu.contains(evento.target) || (boton && boton.contains(evento.target))) return;
    cerrarMenuPreferencias();
  });

  document.addEventListener("keydown", (evento) => {
    if (evento.key === "Escape") cerrarMenuPreferencias();
  });
}

/**
 * Inicializa el mapa Leaflet en el contenedor #mapa.
 */
function inicializarMapa() {
  if (mapa) return;

  // Centro inicial por defecto
  mapa = L.map('mapa', {
    zoomControl: false
  }).setView([41.5, 2.2], 11);

  // Control de zoom en la esquina superior derecha
  L.control.zoom({ position: 'topright' }).addTo(mapa);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap',
    maxZoom: 19
  }).addTo(mapa);
}

/**
 * Renderiza la lista de cuadros en el mapa mediante marcadores.
 * Preserva internamente las coordenadas y las utiliza para generar las acciones del popup,
 * sin mostrar latitud/longitud ni fecha en el texto principal del popup.
 */
function mostrarETenMapa(listaET) {
  if (!mapa) return;

  // Limpiar marcadores anteriores
  marcadoresET.forEach(m => mapa.removeLayer(m));
  marcadoresET = [];

  if (!listaET || listaET.length === 0) return;

  listaET.forEach(et => {
    if (isNaN(et.latitud) || isNaN(et.longitud)) return;

    const marcador = L.marker([et.latitud, et.longitud]);
    const nombreEscapado = String(et.nombre).replace(/'/g, "\\'");
    const calleEscapada = String(et.calle).replace(/'/g, "\\'");

    // Popup con Nombre, Calle e icono oficial de Google Maps
    const contenidoPopup = `
      <div class="popup-cuadro">
        <h3>⚡ ${et.nombre}</h3>
        <p>📍 ${et.calle}</p>
        <div class="popup-acciones">
          <a href="https://www.google.com/maps/dir/?api=1&destination=${et.latitud},${et.longitud}"
             target="_blank"
             rel="noopener noreferrer"
             class="btn-popup btn-llegar">
            <svg class="icon-gmaps" viewBox="0 0 24 24" width="18" height="18">
              <path fill="#EA4335" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
              <circle fill="#FFFFFF" cx="12" cy="9" r="2.5"/>
            </svg>
            <span>Cómo llegar con Google Maps</span>
          </a>
          <button type="button"
                  onclick="compartirUbicacion('${nombreEscapado}', '${calleEscapada}', ${et.latitud}, ${et.longitud})"
                  class="btn-popup btn-compartir">
            🔗 Compartir
          </button>
        </div>
      </div>
    `;

    marcador.bindPopup(contenidoPopup);

    // Tooltip flotante con el nombre del cuadro
    marcador.bindTooltip(`⚡ ${et.nombre}`, {
      permanent: false,
      direction: 'top',
      offset: [0, -10]
    });

    // Guardar referencia completa internamente
    marcador.etData = et;

    marcador.addTo(mapa);
    marcadoresET.push(marcador);
  });

  // Ajustar la vista del mapa para encuadrar todos los cuadros
  if (marcadoresET.length > 0) {
    const grupo = L.featureGroup(marcadoresET);
    mapa.fitBounds(grupo.getBounds().pad(0.1));
  }
}

/**
 * Comparte la información del cuadro (Nombre, Calle, Coordenadas y Enlace a Google Maps).
 * Utiliza navigator.share() si está disponible; de lo contrario, copia al portapapeles.
 */
function compartirUbicacion(nombre, calle, lat, lon) {
  const url = `https://maps.google.com/?q=${lat},${lon}`;
  const titulo = `⚡ ${nombre}`;
  const textoInfo = `⚡ ${nombre}\n📍 ${calle}\n🗺️ Coordenadas: ${lat}, ${lon}`;
  const textoCompleto = `${textoInfo}\n\nEnlace Google Maps: ${url}`;

  if (navigator.share) {
    navigator.share({
      title: titulo,
      text: textoInfo,
      url: url
    }).catch((err) => {
      // Si el usuario cancela la acción, no forzamos error
      if (err.name !== 'AbortError') {
        copiarAlPortapapeles(textoCompleto);
      }
    });
  } else {
    copiarAlPortapapeles(textoCompleto);
  }
}

/**
 * Copia un texto al portapapeles y muestra una notificación visual.
 */
function copiarAlPortapapeles(texto) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(texto)
      .then(() => mostrarNotificacion("Información copiada al portapapeles"))
      .catch(() => copiarFallback(texto));
  } else {
    copiarFallback(texto);
  }
}

function copiarFallback(texto) {
  const area = document.createElement("textarea");
  area.value = texto;
  area.style.position = "fixed";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.select();
  try {
    document.execCommand("copy");
    mostrarNotificacion("Información copiada al portapapeles");
  } catch (e) {
    mostrarNotificacion("No se pudo copiar la información");
  }
  document.body.removeChild(area);
}

function actualizarBarraCalle(texto) {
  const el = document.getElementById("texto-calle-actual");
  if (!el) return;
  el.textContent = texto;
}

function actualizarEstadoBotonVoz() {
  const boton = document.getElementById("btn-voz");
  if (!boton) return;

  boton.classList.toggle("activo", avisosVozActivos);
  boton.textContent = avisosVozActivos ? "🔊" : "🔇";
  boton.title = avisosVozActivos ? "Silenciar avisos de voz" : "Activar avisos de voz";
}

function alternarVoz() {
  avisosVozActivos = !avisosVozActivos;
  guardarPreferenciaVoz(avisosVozActivos);
  actualizarEstadoBotonVoz();

  if (avisosVozActivos && !("speechSynthesis" in window)) {
    mostrarNotificacion("La voz no está disponible en este navegador.");
    return;
  }

  mostrarNotificacion(avisosVozActivos ? "Avisos de voz activados" : "Avisos de voz silenciados");
}

function anunciarCalle(calle) {
  if (!avisosVozActivos || !calle || calle === ultimaCalleAnunciada) return;
  if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") return;

  try {
    const aviso = new SpeechSynthesisUtterance(`Ahora estás en ${calle}`);
    aviso.lang = "es-ES";
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(aviso);
    ultimaCalleAnunciada = calle;
  } catch (error) {
    console.warn("No se pudo reproducir el aviso de voz:", error);
  }
}

function calcularDistanciaMetros(lat1, lon1, lat2, lon2) {
  const radioTierra = 6371000;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;

  return radioTierra * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcularRumboGrados(lat1, lon1, lat2, lon2) {
  const phi1 = lat1 * Math.PI / 180;
  const phi2 = lat2 * Math.PI / 180;
  const deltaLon = (lon2 - lon1) * Math.PI / 180;
  const y = Math.sin(deltaLon) * Math.cos(phi2);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLon);

  return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360;
}

function suavizarRumbo(rumboPrevio, rumboNuevo) {
  if (rumboPrevio === null) return rumboNuevo;

  let diferencia = ((rumboNuevo - rumboPrevio + 540) % 360) - 180;
  return (rumboPrevio + diferencia * 0.35 + 360) % 360;
}

function actualizarEstadoBotonOrientacion() {
  const boton = document.getElementById("btn-orientacion");
  if (!boton) return;

  boton.classList.toggle("activo", modoDireccionMarcha);
  boton.title = modoDireccionMarcha ? "Dirección de marcha arriba" : "Norte arriba";
}

function alternarOrientacionMapa() {
  modoDireccionMarcha = !modoDireccionMarcha;
  actualizarEstadoBotonOrientacion();

  if (modoDireccionMarcha) {
    mostrarNotificacion(rumboActual === null ? "Esperando rumbo fiable del GPS" : "Dirección de marcha activada");
  } else {
    mostrarNotificacion("Norte arriba activado");
  }

  actualizarIndicadorRumbo();
}

function actualizarRumboDesdePosicion(lat, lon, posicion) {
  const coords = posicion.coords || {};
  let rumboDetectado = Number.isFinite(coords.heading) && coords.heading >= 0 ? coords.heading : null;
  const velocidad = Number.isFinite(coords.speed) ? coords.speed : null;

  if (rumboDetectado === null && ultimaPosicionRumbo) {
    const distancia = calcularDistanciaMetros(ultimaPosicionRumbo.lat, ultimaPosicionRumbo.lon, lat, lon);
    const segundos = Math.max((Date.now() - ultimaPosicionRumbo.tiempo) / 1000, 0.1);
    const velocidadCalculada = distancia / segundos;

    if (distancia >= DISTANCIA_MINIMA_RUMBO_M && velocidadCalculada >= VELOCIDAD_MINIMA_RUMBO_MS) {
      rumboDetectado = calcularRumboGrados(ultimaPosicionRumbo.lat, ultimaPosicionRumbo.lon, lat, lon);
    }
  }

  ultimaPosicionRumbo = { lat, lon, tiempo: Date.now() };

  if (rumboDetectado === null || (velocidad !== null && velocidad < VELOCIDAD_MINIMA_RUMBO_MS)) return;

  rumboActual = suavizarRumbo(rumboActual, rumboDetectado);
  actualizarIndicadorRumbo();
}

function actualizarIndicadorRumbo() {
  const marcador = document.querySelector(".marcador-gps-usuario");
  if (!marcador) return;

  const mostrarRumbo = modoDireccionMarcha && rumboActual !== null;
  marcador.classList.toggle("con-rumbo", mostrarRumbo);
  marcador.style.setProperty("--rumbo-gps", `${rumboActual || 0}deg`);
}

function debeConsultarCalle(lat, lon) {
  if (!ultimaPosicionCalle) return true;

  const ahora = Date.now();
  const distancia = calcularDistanciaMetros(
    ultimaPosicionCalle.lat,
    ultimaPosicionCalle.lon,
    lat,
    lon
  );

  return distancia >= DISTANCIA_MINIMA_CALLE_M && ahora - ultimaConsultaCalle >= INTERVALO_MINIMO_CALLE_MS;
}

async function actualizarCalleActual(lat, lon) {
  if (!debeConsultarCalle(lat, lon)) return;

  ultimaConsultaCalle = Date.now();
  ultimaPosicionCalle = { lat, lon };

  if (!ultimaCalleUsuario) {
    actualizarBarraCalle("Localizando calle…");
  }

  try {
    const respuesta = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`,
      { cache: "force-cache" }
    );

    if (!respuesta.ok) {
      throw new Error(`HTTP ${respuesta.status}`);
    }

    const datos = await respuesta.json();
    const direccion = datos.address || {};
    const calle = direccion.road || direccion.pedestrian || direccion.footway || direccion.path || direccion.cycleway || "";

    if (calle && calle !== ultimaCalleUsuario) {
      ultimaCalleUsuario = calle;
      window.calleActual = calle;
      actualizarBarraCalle(calle);
      anunciarCalle(calle);
    } else if (!calle && !ultimaCalleUsuario) {
      actualizarBarraCalle("Calle no disponible");
    }
  } catch (error) {
    console.warn("No se pudo obtener la calle actual:", error);
    if (!ultimaCalleUsuario) {
      actualizarBarraCalle("Calle no disponible");
    }
  }
}

function actualizarMarcadorUsuario(lat, lon) {
  if (marcadorUsuario) {
    marcadorUsuario.setLatLng([lat, lon]);
    return;
  }

  const iconoUsuario = L.divIcon({
    html: `<div class="marcador-gps-usuario"></div>`,
    className: "",
    iconSize: [24, 24],
    iconAnchor: [12, 12]
  });

  marcadorUsuario = L.marker([lat, lon], { icon: iconoUsuario, zIndexOffset: 2000 }).addTo(mapa);
  actualizarIndicadorRumbo();
}

function procesarPosicionUsuario(posicion, centrarMapa) {
  const lat = posicion.coords.latitude;
  const lon = posicion.coords.longitude;

  if (!mapa) return;

  window.latActual = lat;
  window.lonActual = lon;

  actualizarMarcadorUsuario(lat, lon);
  actualizarRumboDesdePosicion(lat, lon, posicion);

  if (centrarMapa) {
    mapa.setView([lat, lon], 16);
  }

  actualizarCalleActual(lat, lon);
}

function iniciarObservacionGPS(opcionesGPS) {
  if (observadorGPS !== null || !navigator.geolocation) return;

  observadorGPS = navigator.geolocation.watchPosition(
    (posicion) => procesarPosicionUsuario(posicion, false),
    (error) => console.warn("Error observando GPS:", error),
    opcionesGPS
  );
}

function inicializarControlesInterfaz() {
  aplicarPreferenciasVisuales();
  actualizarEstadoBotonVoz();
  actualizarEstadoBotonOrientacion();
  conectarCierreMenuPreferencias();
}

inicializarControlesInterfaz();

/**
 * Permite al usuario consultar opcionalmente su ubicación actual.
 * Detecta contextos inseguros (HTTP en IP de red local) que restringen navigator.geolocation.
 */
function centrarEnMiUbicacion() {
  if (!navigator.geolocation) {
    mostrarNotificacion("Tu navegador no soporta geolocalización.");
    return;
  }

  // Verificación del contexto seguro exigido por los navegadores modernos para GPS
  const esContextoSeguro = window.isSecureContext || location.hostname === "localhost" || location.hostname === "127.0.0.1";

  if (!esContextoSeguro) {
    mostrarNotificacion("GPS bloqueado: HTTP en IP local no es seguro. Requiere HTTPS o localhost.");
    console.warn("Geolocation desactivado por el navegador: se requiere HTTPS o localhost en dispositivos móviles.");
    return;
  }

  mostrarNotificacion("Obteniendo ubicación...");

  const opcionesGPS = { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 };

  navigator.geolocation.getCurrentPosition(
    (posicion) => {
      procesarPosicionUsuario(posicion, true);
      iniciarObservacionGPS(opcionesGPS);
      mostrarNotificacion("Ubicación actualizada");
    },
    (error) => {
      console.warn("Error GPS:", error);
      let msj = "No se pudo obtener la ubicación actual.";

      if (error.code === 1) { // PERMISSION_DENIED
        msj = "Permiso de ubicación denegado en el navegador.";
      } else if (error.code === 2) { // POSITION_UNAVAILABLE
        msj = "Ubicación no disponible en este dispositivo.";
      } else if (error.code === 3) { // TIMEOUT
        // Reintento rápido con menor precisión
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            procesarPosicionUsuario(pos, true);
            iniciarObservacionGPS({ enableHighAccuracy: false, timeout: 10000, maximumAge: 15000 });
            mostrarNotificacion("Ubicación aproximada obtenida");
          },
          () => mostrarNotificacion("Tiempo de espera agotado al buscar ubicación."),
          { enableHighAccuracy: false, timeout: 5000 }
        );
        return;
      }

      mostrarNotificacion(msj);
    },
    opcionesGPS
  );
}

/* ==========================================================================
   FUNCIONES DEL BUSCADOR
   ========================================================================== */

/**
 * Abre o cierra el panel del buscador.
 */
function alternarBuscador() {
  const panel = document.getElementById("panel-buscador");
  const input = document.getElementById("input-buscador");

  if (!panel) return;

  if (panel.classList.contains("oculto")) {
    panel.classList.remove("oculto");
    if (input) {
      input.focus();
      if (input.value.trim() !== "") {
        ejecutarBusqueda();
      }
    }
  } else {
    cerrarBuscador();
  }
}

/**
 * Cierra el panel de búsqueda y limpia los resultados.
 */
function cerrarBuscador() {
  const panel = document.getElementById("panel-buscador");
  const input = document.getElementById("input-buscador");
  const contResultados = document.getElementById("resultados-buscador");

  if (panel) panel.classList.add("oculto");
  if (input) input.value = "";
  if (contResultados) contResultados.innerHTML = "";
}

/**
 * Ejecuta la búsqueda sobre los marcadores cargados en el mapa.
 */
function ejecutarBusqueda() {
  const input = document.getElementById("input-buscador");
  const contResultados = document.getElementById("resultados-buscador");

  if (!input || !contResultados) return;

  const query = input.value.trim().toLowerCase();

  if (query === "") {
    contResultados.innerHTML = "";
    return;
  }

  // Filtrar marcadores coincidentes por nombre o calle
  const coincidencias = marcadoresET.filter(m => {
    if (!m.etData) return false;
    const nombre = String(m.etData.nombre).toLowerCase();
    const calle = String(m.etData.calle).toLowerCase();
    return nombre.includes(query) || calle.includes(query);
  });

  if (coincidencias.length === 0) {
    contResultados.innerHTML = `<div class="sin-resultados">No se encontraron cuadros</div>`;
    return;
  }

  // Renderizar la lista de resultados
  let htmlResultados = "";
  coincidencias.forEach((marcador) => {
    const et = marcador.etData;
    const indexEnArray = marcadoresET.indexOf(marcador);

    const nombreEscapado = String(et.nombre).replace(/"/g, '&quot;');
    const calleEscapada = String(et.calle).replace(/"/g, '&quot;');

    htmlResultados += `
      <div class="item-resultado" onclick="seleccionarCuadroBuscado(${indexEnArray})">
        <div class="item-titulo">⚡ ${nombreEscapado}</div>
        <div class="item-subtitulo">📍 ${calleEscapada}</div>
      </div>
    `;
  });

  contResultados.innerHTML = htmlResultados;
}

/**
 * Selecciona un cuadro de la lista de resultados:
 * Cierra el buscador, centra el mapa en sus coordenadas con zoom 17 y abre su popup.
 */
function seleccionarCuadroBuscado(index) {
  const marcador = marcadoresET[index];
  if (!marcador || !marcador.etData) return;

  const et = marcador.etData;

  // 1. Cerrar buscador
  cerrarBuscador();

  // 2. Centrar mapa y aplicar zoom adecuado para identificar la ubicación
  mapa.setView([et.latitud, et.longitud], 17);

  // 3. Abrir la ficha/popup del marcador
  marcador.openPopup();
}
