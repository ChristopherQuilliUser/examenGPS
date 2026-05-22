# 🤖 Dashboard IoT Mecatrónica - BMP280 + GPS

![IoT Dashboard](https://img.shields.io/badge/Dashboard-IoT-blueviolet)
![ESP32](https://img.shields.io/badge/ESP32-Controller-green)
![TagoIO](https://img.shields.io/badge/Platform-TagoIO-orange)

Este repositorio contiene un **dashboard web moderno** que visualiza en tiempo real los datos de un **ESP32** equipado con:

- **GPS NEO-6M**: latitud, longitud, altitud GPS, velocidad, satélites, HDOP y hora local Ecuador.  
- **BMP280**: temperatura, presión y altitud estimada del sensor.  
- **Plataforma de datos**: TagoIO, utilizada para recopilar y entregar los datos al dashboard.  

El proyecto está orientado a estudiantes de **Mecatrónica** y aplicaciones educativas de IoT.

---

## 🛠 Características

- Dashboard web **moderno y vibrante** con tarjetas de datos y mapa interactivo.  
- Actualización automática cada 5 segundos.  
- Indicador de **estado de conexión** con TagoIO.  
- Visualización en **GitHub Pages** sin necesidad de servidor propio.  
- Compatible con **BMP280** y GPS, ideal para experimentos de laboratorio y proyectos educativos.  

---

## 🌐 Tecnologías utilizadas

- **Frontend**: HTML, CSS, JavaScript, Leaflet.js  
- **Backend**: Cloudflare Worker para enlazar TagoIO → GitHub Pages  
- **IoT**: ESP32 con GPS NEO-6M y sensor BMP280  
- **Plataforma IoT**: [TagoIO](https://tago.io)  

---

## 📦 Contenido del repositorio
