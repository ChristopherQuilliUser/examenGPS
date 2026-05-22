// ==========================================================
// DASHBOARD IoT - script.js
// Compatible con Cloudflare Worker + TagoIO (BMP280)
// ==========================================================

const API_URL = "https://tago-worker-sinchi.xaviersinchi607.workers.dev/";
const UPDATE_INTERVAL = 5000;

let map = null;
let marker = null;

// ----------------------------------------------------------
// Inicializar mapa
// ----------------------------------------------------------
function inicializarMapa() {
  const mapElement = document.getElementById("map");
  if (!mapElement || typeof L === "undefined") return;

  const latInicial = -2.88771;
  const lngInicial = -78.98906;

  map = L.map("map").setView([latInicial, lngInicial], 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(map);

  marker = L.marker([latInicial, lngInicial]).addTo(map);
  marker.bindPopup("Esperando datos del GPS...");
  setTimeout(() => map.invalidateSize(), 500);
}

// ----------------------------------------------------------
// Estado de conexión
// ----------------------------------------------------------
function actualizarEstado(texto, conectado = true) {
  const status = document.getElementById("status");
  if (!status) return;

  status.textContent = texto;
  status.classList.remove("ok", "error");
  status.classList.add(conectado ? "ok" : "error");
}

// ----------------------------------------------------------
// Validaciones
// ----------------------------------------------------------
function esNumeroValido(valor) {
  return valor !== undefined && valor !== null && valor !== "" && !isNaN(Number(valor));
}

function formatearNumero(valor, decimales = 1) {
  return esNumeroValido(valor) ? Number(valor).toFixed(decimales) : "--";
}

// ----------------------------------------------------------
// Mostrar valor en pantalla (numérico)
function setValor(id, valor, sufijo = "") {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = esNumeroValido(valor) ? `${valor}${sufijo}` : "--";
}

// ----------------------------------------------------------
// Mostrar texto (no numérico, como hora)
function setTexto(id, texto) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = texto ?? "--";
}

// ----------------------------------------------------------
// Convertir array TagoIO a objeto
// ----------------------------------------------------------
function convertirDatos(array) {
  const datos = {};
  if (!Array.isArray(array)) return datos;

  array.forEach(item => {
    if (!item || !item.variable) return;

    // Manejo de location
    if (item.variable === "location" && item.location?.coordinates?.length >= 2) {
      datos.location = {
        lat: Number(item.location.coordinates[1]),
        lng: Number(item.location.coordinates[0])
      };
      return;
    }

    // Variables normales
    datos[item.variable] = item.value;
  });

  return datos;
}

// ----------------------------------------------------------
// Actualizar mapa
// ----------------------------------------------------------
function actualizarMapa(lat, lng) {
  if (!map || !marker || !esNumeroValido(lat) || !esNumeroValido(lng)) return;

  marker.setLatLng([lat, lng]);
  marker.bindPopup(`<b>Ubicación GPS</b><br>Latitud: ${lat.toFixed(6)}<br>Longitud: ${lng.toFixed(6)}`);
  map.setView([lat, lng], 17);
  setTimeout(() => map.invalidateSize(), 100);
}

// ----------------------------------------------------------
// Cargar datos desde Worker
// ----------------------------------------------------------
async function cargarDatos() {
  try {
    actualizarEstado("Conectando con TagoIO...", true);

    const response = await fetch(API_URL, { method: "GET", cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const raw = await response.json();
    const arrayDatos = Array.isArray(raw) ? raw : (raw.result && Array.isArray(raw.result) ? raw.result : []);
    const datos = convertirDatos(arrayDatos);

    // Coordenadas GPS
    let lat = datos.location?.lat ?? datos.latitud;
    let lng = datos.location?.lng ?? datos.longitud;

    if (lat && lng) {
      setValor("latitud", lat.toFixed(6));
      setValor("longitud", lng.toFixed(6));
      actualizarMapa(lat, lng);
    } else {
      setValor("latitud", "--");
      setValor("longitud", "--");
    }

    // GPS
    setValor("satelites", datos.satelites);
    setValor("hdop", formatearNumero(datos.hdop, 2));
    setValor("altitud_gps", formatearNumero(datos.altitud_gps, 1), " m");
    setValor("velocidad", formatearNumero(datos.velocidad, 2), " km/h");

    // BMP280
    setValor("temperatura", formatearNumero(datos.temperatura, 1), " °C");
    setValor("presion", formatearNumero(datos.presion, 1), " hPa");
    setValor("altitud_bmp", formatearNumero(datos.altitud_bmp, 1), " m");

    // Hora local GMT-5
    const ahoraUTC = new Date();
    const horaGMT5 = new Date(ahoraUTC.getTime() - 5 * 60 * 60 * 1000);
    const hh = String(horaGMT5.getUTCHours()).padStart(2, "0");
    const mm = String(horaGMT5.getUTCMinutes()).padStart(2, "0");
    const ss = String(horaGMT5.getUTCSeconds()).padStart(2, "0");
    setTexto("hora_ecuador", `${hh}:${mm}:${ss}`);

    // Última actualización del dashboard
    const lastUpdate = document.getElementById("last-update");
    if (lastUpdate) lastUpdate.textContent = "Última actualización: " + new Date().toLocaleTimeString("es-EC");

    actualizarEstado("Conectado a TagoIO", true);

  } catch (error) {
    console.error("Error:", error);
    actualizarEstado("Error de conexión con TagoIO", false);

    // Mostrar valores en "--" cuando hay error
    setValor("latitud", "--");
    setValor("longitud", "--");
    setValor("satelites", "--");
    setValor("hdop", "--");
    setValor("altitud_gps", "--");
    setValor("velocidad", "--");
    setValor("temperatura", "--");
    setValor("presion", "--");
    setValor("altitud_bmp", "--");
    setTexto("hora_ecuador", "--:--:--");
  }
}

// ----------------------------------------------------------
// Inicio
// ----------------------------------------------------------
document.addEventListener("DOMContentLoaded", () => {
  inicializarMapa();
  cargarDatos();
  setInterval(cargarDatos, UPDATE_INTERVAL);

  window.addEventListener("resize", () => {
    if (map) setTimeout(() => map.invalidateSize(), 100);
  });
});