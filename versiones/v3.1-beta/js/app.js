/**
 * Punto de entrada principal para Street Edison Pública V3 (Fase 1).
 */
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Inicializar mapa inmediatamente (independiente de GPS o red)
  inicializarMapa();

  // 2. Cargar datos de cuadros desde Google Sheets o Caché local
  actualizarEstadoConexion("cargando", "Cargando...");

  const resultado = await cargarETdesdeSheets();

  if (resultado.ok && resultado.datos.length > 0) {
    // 3. Representar puntos en el mapa
    mostrarETenMapa(resultado.datos);

    if (resultado.fuente === "red") {
      actualizarEstadoConexion("en-linea", `${resultado.total} cuadros`);
    } else {
      actualizarEstadoConexion("cache", `${resultado.total} cuadros (Caché)`);
      mostrarNotificacion("Sin conexión: mostrando datos guardados en caché.");
    }
  } else {
    actualizarEstadoConexion("error", "Error de datos");
    mostrarNotificacion("No se pudieron cargar los cuadros de alumbrado.");
  }
});

/**
 * Actualiza el indicador visual de estado en la cabecera.
 */
function actualizarEstadoConexion(tipo, texto) {
  const badge = document.getElementById("estado-conexion");
  const textoElem = document.getElementById("texto-estado");

  if (!badge || !textoElem) return;

  badge.className = `estado-badge ${tipo}`;
  textoElem.textContent = texto;
}

/**
 * Muestra una notificación flotante temporal (toast).
 */
function mostrarNotificacion(mensaje, duracion = 3500) {
  const el = document.getElementById("notificacion");
  if (!el) return;

  el.textContent = mensaje;
  el.classList.remove("oculto");

  if (window.toastTimeout) clearTimeout(window.toastTimeout);

  window.toastTimeout = setTimeout(() => {
    el.classList.add("oculto");
  }, duracion);
}
