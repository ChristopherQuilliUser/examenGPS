// ==========================================================
// DASHBOARD IoT OPTIMIZADO
// ==========================================================

const API_URL = "https://tago-worker-sinchi.xaviersinchi607.workers.dev/";

// ==========================================
// ACTUALIZACIÓN MUCHO MÁS RÁPIDA
// ==========================================
const UPDATE_INTERVAL = 1000;

let map = null;
let marker = null;

let ultimaLat = null;
let ultimaLng = null;

let ultimoEstado = "";

// ==========================================================
// MAPA
// ==========================================================
function inicializarMapa() {

  if (typeof L === "undefined") return;

  map = L.map("map", {
    zoomControl: true,
    attributionControl: false,
    preferCanvas: true
  }).setView([-2.88771, -78.98906], 13);

  L.tileLayer(
    "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    {
      maxZoom: 19,
      updateWhenIdle: true,
      updateWhenZooming: false,
      keepBuffer: 2
    }
  ).addTo(map);

  marker = L.marker([-2.88771, -78.98906]).addTo(map);
}

// ==========================================================
// ESTADO
// ==========================================================
function actualizarEstado(texto, conectado = true) {

  if (texto === ultimoEstado) return;

  ultimoEstado = texto;

  const status = document.getElementById("status");
  if (!status) return;

  status.textContent = texto;
  status.className = conectado
    ? "status ok"
    : "status error";
}

// ==========================================================
// VALIDACIONES
// ==========================================================
function esNumeroValido(valor) {
  return valor !== undefined &&
         valor !== null &&
         valor !== "" &&
         !isNaN(Number(valor));
}

function formatearNumero(valor, decimales = 1) {
  return esNumeroValido(valor)
    ? Number(valor).toFixed(decimales)
    : "--";
}

// ==========================================================
// SET VALOR
// ==========================================================
function setValor(id, valor, sufijo = "") {

  const el = document.getElementById(id);
  if (!el) return;

  const nuevo = esNumeroValido(valor)
    ? `${valor}${sufijo}`
    : "--";

  if (el.textContent !== nuevo) {
    el.textContent = nuevo;
  }
}

function setTexto(id, texto) {

  const el = document.getElementById(id);
  if (!el) return;

  if (el.textContent !== texto) {
    el.textContent = texto;
  }
}

// ==========================================================
// CONVERTIR DATOS
// ==========================================================
function convertirDatos(array) {

  const datos = {};

  if (!Array.isArray(array)) return datos;

  for (const item of array) {

    if (!item || !item.variable) continue;

    if (
      item.variable === "location" &&
      item.location?.coordinates?.length >= 2
    ) {
      datos.location = {
        lat: Number(item.location.coordinates[1]),
        lng: Number(item.location.coordinates[0])
      };
      continue;
    }

    datos[item.variable] = item.value;
  }

  return datos;
}

// ==========================================================
// MAPA MÁS FLUIDO
// ==========================================================
function actualizarMapa(lat, lng) {

  if (!map || !marker) return;

  if (!esNumeroValido(lat) || !esNumeroValido(lng)) return;

  marker.setLatLng([lat, lng]);

  // ==========================================
  // SOLO MOVER MAPA SI CAMBIÓ MUCHO
  // ==========================================
  if (
    ultimaLat === null ||
    Math.abs(lat - ultimaLat) > 0.0005 ||
    Math.abs(lng - ultimaLng) > 0.0005
  ) {
    map.panTo([lat, lng], {
      animate: true,
      duration: 0.5
    });

    ultimaLat = lat;
    ultimaLng = lng;
  }
}
