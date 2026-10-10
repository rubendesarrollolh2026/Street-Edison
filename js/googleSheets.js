const URL_SHEETS = "https://script.google.com/macros/s/AKfycbyYJRSPi63eYaSiY_cneoEjmY2pedGCwsxmkuOWpDhUqIWTdoZzQ1DrgAh3muoI0s0SAg/exec";

/**
 * Carga los cuadros de alumbrado (ETs/CMs) desde Google Apps Script.
 * Utiliza un parámetro anti-caché (_t=timestamp) para evitar respuestas obsoletas
 * sin añadir cabeceras personalizadas que puedan activar preflight CORS en Apps Script.
 * Si falla la red, recupera los datos previamente guardados en localStorage sin borrarlos.
 */
async function cargarETdesdeSheets() {
  try {
    // Parámetro anti-caché dinámico para evitar respuestas HTTP en disco/memoria obsoletas
    const urlAntiCache = `${URL_SHEETS}?tipo=et&_t=${Date.now()}`;

    const respuesta = await fetch(urlAntiCache);

    if (!respuesta.ok) {
      throw new Error(`HTTP Error ${respuesta.status}`);
    }

    const datos = await respuesta.json();

    if (!Array.isArray(datos)) {
      throw new Error("Formato de datos devuelto por la API no es válido");
    }

    // Normalizar y validar estructura de puntos activos
    const listaET = datos
      .map(et => ({
        nombre: String(et.nombre || "Cuadro sin nombre").trim(),
        latitud: parseFloat(et.lat !== undefined ? et.lat : et.latitud),
        longitud: parseFloat(et.lon !== undefined ? et.lon : et.longitud),
        calle: String(et.calle || "Ubicación no especificada").trim(),
        fecha: et.fecha || null
      }))
      .filter(et => !isNaN(et.latitud) && !isNaN(et.longitud) && et.latitud !== 0 && et.longitud !== 0);

    // Sobrescribir la caché local de forma limpia con la colección activa sincronizada
    localStorage.setItem("ETs", JSON.stringify(listaET));

    return {
      ok: true,
      datos: listaET,
      fuente: "red",
      total: listaET.length
    };

  } catch (error) {
    console.warn("Error descargando datos desde Google Sheets:", error);

    // Si falla la red, utilizar la caché local previamente guardada
    const datosCache = localStorage.getItem("ETs");
    if (datosCache) {
      try {
        const listaET = JSON.parse(datosCache);
        if (Array.isArray(listaET) && listaET.length > 0) {
          return {
            ok: true,
            datos: listaET,
            fuente: "cache",
            total: listaET.length,
            error: error.message
          };
        }
      } catch (e) {
        console.error("Error parseando caché local:", e);
      }
    }

    return {
      ok: false,
      datos: [],
      fuente: "ninguna",
      error: error.message
    };
  }
}
