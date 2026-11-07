# Cómo trabajar en este repositorio (rápido y sin vueltas)

Usuarios: Santiago y Heison (hablan por voz, en español). Quieren avance rápido: entregas pequeñas y frecuentes.

## Ciclo de trabajo (cada entrega)
1. Cambio mínimo que resuelve lo pedido. Nada de refactors no pedidos.
2. Prueba en UNA pasada: `node tools/probar.js vistas.json --paridad --fisica` (~2 min).
   - Capturas a 480×270 y calidad baja, todas juntas en `/tmp/probar/hoja.png` (mirar solo esa imagen).
   - Si se tocó `mundo.js`, se toca también `mundo-glsl.js`: `--paridad` debe dar ok (< 5 cm).
3. Commit (autor Claude) + push a `main`, y publicar en el artefacto de la prueba solo los archivos cambiados.
4. Respuesta corta: qué cambió, qué medir en el iPhone.

## Reglas para no perder tiempo
- Medidas numéricas en Node antes que capturas (las capturas en SwiftShader tardan segundos por cuadro).
- Nunca esperar con `sleep`: lanzar pruebas largas en segundo plano y seguir trabajando.
- Si algo falla 2 veces con el mismo enfoque: parar y preguntar.
- Las capturas no miden FPS reales: el rendimiento lo miden los usuarios en el iPhone (Alta/Media).
- El enlace del artefacto no sirve `.glb`: tras cambiar modelos, `node tools/glb-a-json.mjs --lista`.

## Mapa del código (prueba/js/tubo/)
mundo.js + mundo-glsl.js (relieve, ríos, lagos, volcanes, biomas) · terreno.js (anillos + texturas por nivel) ·
agua.js · curva.js (enrollar el tubo, luz del sol) · cielo.js · flora.js + especies.js (vegetación) ·
controles.js (caminar, saltar, nadar, volar, gravedad del cilindro) · main.js.
