# Raíces de Niebla 0.37.0 — Auditoría (etapa 1)

Fecha: 4 de noviembre de 2026. No se modificó el juego: es solo diagnóstico. La copia de seguridad del archivo 0.37.0 está guardada antes de cualquier cambio.

## Cómo se midió

- **Análisis estático**
  - Se extrajo el script principal (927 KB, 49 módulos) y se revisó la sintaxis con Node.
  - Un análisis de árbol de sintaxis buscó funciones duplicadas en el mismo ámbito, funciones nunca usadas y objetos de Three.js creados dentro de funciones que corren en cada cuadro.
- **Perfilado en ejecución**
  - Chromium sin ventana con SwiftShader, que dibuja con el procesador, sin tarjeta gráfica.
  - Se envolvió con cronómetro cada sistema del ciclo: lógica, render, vegetación, pasto, fauna, sonido, sombras de terreno (RT), HDR, etc.
  - Se probaron tres calidades (Bajo, Medio, Alto), de pie, corriendo y con saltos de 180 a 220 m para forzar la carga de sectores.
- **Comparación de efectos (A/B):** en calidad Alto se apagó un efecto a la vez y se midió el tiempo de cuadro.
- **Memoria:** contadores del renderizador y del heap de JavaScript durante 16 saltos de 220 m.
- **Hidrología:** 6 semillas, revisando los ~20 000 nodos de río de cada mundo contra la malla del terreno.
- **Entrada y guardado:** pruebas automáticas de teclas con menús abiertos, clic derecho y guardar/cargar.

**Límite importante:** con SwiftShader los FPS absolutos (~1 FPS) no representan un PC real. Los tiempos de JavaScript sí son comparables. Los costos de tarjeta gráfica se dan como proporción del cuadro, no en milisegundos reales.

## Resultado general

- Sintaxis correcta.
- 0 funciones duplicadas en un mismo ámbito.
- 0 errores en la prueba de humo (511 opciones de Pruebas).
- No hay fugas de memoria apreciables.
- No hay agua cuesta arriba en ninguna semilla.

Los problemas reales están en tirones al cargar sectores, en la textura y el ajuste de los ríos al terreno y en tres errores de entrada y estado.

## Problemas encontrados

Gravedad: **Alta** = se nota al jugar o rompe la partida; **Media** = se nota a veces; **Baja** = limpieza o casos raros.

### A. Rendimiento

| # | Problema | Evidencia | Gravedad |
|---|---|---|---|
| A1 | Tirón al cruzar de sector (cada 128 m): la reconstrucción del sector, las sombras de terreno, la vegetación y el pasto se recalculan en el mismo cuadro | updateSectors 28–36 ms, RT.update hasta 49 ms, Veg.update 8–12 ms, Under 6–7 ms; total de 50 a 100 ms en un cuadro, cada ~23 s corriendo | **Alta**: causa más probable del lag en PC |
| A2 | Picos del sonido al correr: se sintetizan pasos y música en el hilo principal | Snd.update: media 1–1,7 ms, picos de 15–18 ms | Media |
| A3 | Pico al aparecer un animal: se genera su modelo en ese cuadro | Fauna3D.sync: picos de 6–12 ms | Media |
| A4 | Costo de tarjeta gráfica (Alto, 960×540, relativo) | Sombras ~13 % del cuadro, sombras de terreno ~8 %, pasto ~4 %, HDR+oclusión+brillo ~6 %. El resto es el sombreado de terreno y vegetación. Con ¼ de los píxeles el cuadro baja a la mitad, así que el límite son los píxeles | Media |
| A5 | En PC la resolución interna llega a 2× la de la pantalla (dprMax 2): en monitores de alta densidad son 4× píxeles | Configuración CFG.dprMax | Media |
| A6 | Ajuste de los pies al suelo (IK) en cada cuadro | Body.ik: 0,3–0,9 ms de media, picos de 4,9 ms | Baja |
| A7 | El ciclo fijo hace como máximo 4 pasos por cuadro: por debajo de 15 FPS el juego entra en cámara lenta | Ciclo `frame()` | Baja: solo equipos muy lentos |

### B. Memoria

| # | Problema | Evidencia | Gravedad |
|---|---|---|---|
| B1 | Sin fuga apreciable | Geometrías 96 → 123–134 estable; texturas 22 → 28; heap ~48 MB estable en 16 saltos | — |
| B2 | Piezas quitadas sin liberar su geometría: trampas (aro y estaca nuevos por trampa), piezas de construcción (salvo huerta, puente y canal) y modelo de cada animal | Revisión de Build3D.sync y Fauna3D.sync | Baja |

### C. Estabilidad, entrada y guardado (comprobados con pruebas)

| # | Problema | Evidencia | Gravedad |
|---|---|---|---|
| C1 | Una tecla pulsada con un menú abierto se ejecuta al cerrarlo | Prueba: Q con el inventario abierto → al cerrar, el personaje golpea. La cola de acción no se borra al abrir menús y el teclado no revisa la pausa | Media |
| C2 | Talar o picar automático sigue golpeando un árbol aunque el jugador ya no esté ahí | Prueba: tras moverse 85 m sin joystick, seguía golpeando un árbol a 84 m. Solo se cancela con el joystick y el objetivo no se valida por distancia. Pasa con la corriente del río, resbalones, teletransporte o cargar partida | Media |
| C3 | Al cargar partida no se reinician los estados pasajeros: golpe en curso, cubrirse, enfriamiento y barra de vida | Revisión de Save.load | Media |
| C4 | Al abrir menús no se sueltan el clic derecho, el botón Cubrir ni el gatillo izquierdo | Revisión de resetAll; en la prueba se soltó bien con mouseup | Baja |
| C5 | Código muerto: strikeOld, waterTouch, startPiece, buildFar y buildLakes (estas dos vacías) | Árbol de sintaxis | Baja |

### D. Hidrología (6 semillas)

Generación: 220–320 ms por mundo, ~19 000–20 000 nodos de río, ~1 200–1 340 tramos y ~1 100 lagos. Cada consulta de agua tarda ~0,5 µs.

| # | Problema | Evidencia | Gravedad |
|---|---|---|---|
| D1 | Agua cuesta arriba | 0 en las 6 semillas | Bien |
| D2 | Río "colgado": el agua queda más de 0,35 m por encima de una de sus orillas | 174–243 nodos por mundo (~1 %); máximo de 7,5 a 12,6 m | **Alta**: "ríos que se elevan sobre el terreno" |
| D3 | La malla del terreno tapa el agua en el centro del cauce | 145–236 nodos por mundo, hasta 8,6 m | **Alta**: "ríos interrumpidos" |
| D4 | La textura del río se estira y cambia de forma con el tiempo | En el sombreador el desplazamiento es tiempo × velocidad del vértice, y la velocidad cambia de punto a punto del río. La diferencia entre vértices vecinos crece sin límite: a los 10 min ya se estira decenas de veces | **Alta**: causa encontrada en el código |
| D5 | Posible parpadeo donde se solapan río, lago, mar o bordes de sector | Todas son transparentes, sin escribir profundidad y con el mismo orden de dibujo, así que el orden cambia al moverse | Media: no verificado a simple vista |
| D6 | "Paredes" de agua visibles donde la orilla está baja | Los bordes de la cinta del río bajan 2,2 m bajo el nivel del agua | Media (va con D2) |
| D7 | Los ríos nacen donde el caudal acumulado pasa un umbral, no desde lagos o manantiales explícitos. Solo 1 tramo por mundo termina sin desembocar (se infiltra) | Datos de los tramos | Diseño (etapa 4) |

### E. Controles

| # | Problema | Gravedad |
|---|---|---|
| E1 | Una sola sensibilidad para ratón y táctil: sin separar horizontal y vertical, y sin invertir la cámara | Media |
| E2 | La página usa `viewport-fit=cover` pero ningún botón respeta las áreas seguras: en iPhone horizontal pueden quedar bajo la muesca o la barra de inicio | Media |
| E3 | Las teclas no se pueden personalizar | Baja |

### F. Personaje (revisión inicial; la revisión visual a fondo es la etapa 2)

- En tercera persona las manos siguen siendo las antiguas, con dedos hechos de esferas. Solo la primera persona usa la mano con huesos.
- En primera persona el brazo superior es una pieza rígida aparte del antebrazo con piel. La unión queda fuera de la vista, pero no es una sola piel.
- Rostro, proporciones y deformaciones al caminar, nadar y saltar todavía no se han revisado visualmente.

## Plan por versiones

Cada versión es un parche pequeño, con prueba de humo y pruebas específicas, sin rehacer sistemas.

1. **0.37.1 — Estabilidad** (C1–C5, B2)
   - Vaciar la cola de acciones y soltar los botones al abrir menús.
   - Cancelar el golpe automático si el jugador se aleja del objetivo por cualquier causa.
   - Reiniciar los estados pasajeros al cargar partida.
   - Liberar geometrías al quitar piezas.
   - Borrar el código muerto.
   - Sin cambios visuales.
2. **0.37.2 — Agua visible** (D4, D5)
   - Hacer que la textura avance con la distancia recorrida a lo largo del río y con un tiempo que se reinicia, así no se estira nunca.
   - Fijar el orden de dibujo de mar, lago y río y evitar la doble mezcla donde se solapan.
3. **0.37.3 — Tirones** (A1–A3)
   - Repartir la reconstrucción de sectores, vegetación y sombras de terreno en varios cuadros con un presupuesto en milisegundos.
   - Reutilizar los nodos de sonido.
   - Guardar los modelos de animales ya generados.
   - Medir antes y después.
4. **0.38.x — Hidrología** (D2, D3, D6, D7)
   - Que el nivel del río nunca supere sus dos orillas: tallar el cauce o bajar el agua.
   - Que la malla del terreno respete el lecho.
   - Nacimientos en lagos de montaña y manantiales.
   - Repetir esta misma auditoría con 6 semillas como criterio de aceptación.
5. Después, en el orden del documento:
   - personaje y animación (etapa 2);
   - controles y opciones de sensibilidad, invertir y áreas seguras (etapa 3);
   - agua dinámica (etapa 5);
   - calidad gráfica configurable y resolución interna (etapas 6 y 7).

## Pruebas realizadas

- Sintaxis del script principal: correcta.
- Árbol de sintaxis: 0 duplicados en un mismo ámbito; 5 funciones nunca usadas; creaciones de Three.js en funciones por cuadro, todas guardadas en caché salvo los casos de B2.
- Perfil de los sistemas en Bajo, Medio y Alto: de pie, corriendo y después de correr.
- Comparación A/B de efectos en Alto.
- Prueba de resolución: 960×540 contra 480×270.
- Picos al cargar sectores: 4 saltos de 180 m.
- Memoria: 16 saltos de 220 m.
- Hidrología: 6 semillas (inicial, 12345, 777, 2024, 99999 y 31337).
- Entrada: tecla con menú abierto, clic derecho con menú, talar automático y alejarse.
- Prueba de humo 0.37.0: 511 opciones, 0 errores.

## Seguimiento: hidrología 0.38.0 (5 de noviembre de 2026)

La auditoría de ríos se repitió con más detalle antes de corregir. El problema principal de D2 no estaba en la orilla a 4 m sino en el terreno de alrededor: muchos ríos corrían sobre un terraplén angosto.

**Qué se encontró**

- En 6 mundos, el agua queda más de 1 m por encima del terreno natural en el 16–17,5 % del recorrido, y más de 3 m en el 8–9 %. Un dique de 4 m de ancho contenía el agua, así que la prueba de la orilla a 4 m no lo detectaba; a 12 m del borde los dos lados quedaban más de 3 m abajo en el 2,7–3,0 % del recorrido.
- Causas, en los nodos con agua elevada más de 1 m (3 mundos): el límite de tallado de 4 m, cuando un umbral río abajo sostiene el agua (~50 %), y el nivel del lago al que llega el tramo (~45 %). El resto se debe a uniones y al mar.
- D3 casi no existe en la malla de Alto (2 m). En la de Bajo (2,67 m) las quebradas angostas se veían como una cadena de cuadros de agua: 330–661 cortes por mundo.
- Restos de D2 visibles: orillas dentro de un lago (el recorte dejaba el río por encima del lago), afluentes que llegaban hasta 10 m más altos a la unión, tramos que terminan en medio de otro río con la cota mal tomada, y la pared vertical de 2,2 m del borde de la cinta.

**Qué cambió (0.38.0)**

1. Donde el río va elevado, el terreno se rellena como una llanura a ras del agua (0,1 m por encima), con un talud de 0,25 (14°) hacia el terreno natural. El ancho de la llanura es 2,5 m por cada metro de elevación, hasta 30 m. El agua del río no cambia de altura.
2. Si una orilla (a 0,9, 2,5 o 4,5 m del borde, en cada vértice y a mitad de segmento) cae dentro de un lago o del mar, el río no queda más alto que ese nivel. Después se aplica un mínimo río abajo para que nunca suba.
3. En los últimos 40 m antes de una unión, el afluente baja hasta la cota de la unión. Los tramos que terminan en medio de otro río igualan su cota si llegan hasta 60 cm por debajo.
4. Cinta del río: el borde exterior baja inclinado (1,4 m afuera, 1,1 m abajo) en vez de una pared vertical. Sobre lagos y mar es transparente en todo el recorrido.
5. Ancho mínimo del cauce: 0,75 veces la separación de la malla (1,5 m de medio ancho en Medio y Alto, 2 m en Bajo y Ultra bajo).

**Resultado en 6 mundos** (inicial, 12345, 777, 2024, 99999 y 31337). Los porcentajes son del recorrido de los ríos, muestreado cada 3 m sin los 25 m finales de cada desembocadura. "Al aire" y "colgada" cuentan el agua de un lago o de otro río como orilla.

| Medida | Malla | 0.37.4 | 0.38.0 |
|---|---|---|---|
| Agua cuesta arriba entre vértices | Alto y Bajo | 0 | 0 |
| Río sobre terraplén (a 12 m, los dos lados más de 3 m abajo) | Alto y Bajo | 2,73–2,98 % | 0,02–0,04 % |
| Río sobre terraplén de más de 1,5 m | Alto y Bajo | 4,54–4,98 % | 0,30–0,41 % |
| Borde de la cinta al aire (pared de agua) | Alto (2 m) | 0,13–0,23 % | 0,06–0,13 % |
| Agua colgada (orilla a 4 m más de 35 cm abajo) | Alto (2 m) | 0,16–0,23 % | 0,06–0,11 % |
| Agua tapada en el centro del cauce | Alto (2 m) | 0–0,01 % | 0–0,01 % |
| Borde de la cinta al aire | Bajo (2,67 m) | 0,16–0,25 % | 0,10–0,16 % |
| Agua colgada | Bajo (2,67 m) | 0,17–0,24 % | 0,08–0,11 % |
| Agua tapada en el centro del cauce | Bajo (2,67 m) | 0,27–0,53 % | 0–0,02 % |
| Cortes de quebradas por mundo | Bajo (2,67 m) | 330–661 | 0–16 |
| D2 con el criterio original (nodos, solo terreno) | Bajo (2,67 m) | 174–243 | 138–187 |
| D3 con el criterio original (nodos) | Bajo (2,67 m) | 145–236 | 46–67 |

El criterio original de D2 solo mira el terreno, así que cuenta como "colgada" la orilla que es fondo de lago o cauce de otro río aunque el agua la cubra; por eso baja menos. Generar la red de ríos tarda 40–66 ms más en PC (mínimo de 4 corridas por mundo).

**Lo que queda**

- Tramos distintos que se cruzan o se rozan a diferente altura sin estar unidos: unos 0,03–0,05 % del recorrido.
- Diferencias solo de malla: unos 0,03 %.
- 3 tramos por mundo que terminan en medio de otro río más de 60 cm por debajo: se dejan así, porque subirlos los dejaría colgados junto a lagos.
- D7, los nacimientos en lagos de montaña y manantiales, queda para la 0.38.1.
- Fuera de la hidrología: los ríos de tierras bajas son de agua turbia café y desde arriba parecen un camino de tierra (etapa 6). Las cintas de río solo se dibujan en los 3×3 sectores cercanos; falta comprobar cuánto se nota a distancia.

## Seguimiento: 0.38.1 (reporte del iPhone, 5 de noviembre de 2026)

En el iPhone (perfil Alto, malla de 2,67 m) el río se veía "pintado en el suelo" al pararse encima y, al nadar, el agua parecía una lámina en el aire.

**Causa principal:** desde la 0.33.1, en calidad Alto el personaje se dibuja en una segunda pasada, después de calcular la oclusión ambiental. El agua no escribe profundidad, así que en esa pasada el cuerpo se pintaba entero encima del agua. Corrección: antes de la pasada del personaje se escribe solo la profundidad de las superficies de agua (ríos, lagos, mar; capa 5). Lo que queda bajo el agua ya no se dibuja encima.

**Causas que lo hacían más visible:**

- La orilla subía solo 0,3 m por metro desde el borde del agua y la llanura de relleno de la 0.38.0 quedaba a 0,1 m sobre el agua.
- Con la malla de 2,67 m, la orilla quedaba a ras del agua en el 19–20 % del recorrido, el centro tenía menos de 50 cm de hondo en el 55–57 % y la profundidad mediana era de 0,45 m.

**Cambios:**

- Orilla de 0,78 m por metro.
- Llanura a 0,7 m sobre el agua.
- Fondo mínimo de 0,6 m.
- Cinta del río armada cada ~4 m, con los bordes pegados a la malla y un tramo por sector (antes los sectores vecinos dibujaban el mismo tramo dos veces).
- Helechos fuera de la franja que cubre el agua.

**Medido** (3 mundos para orillas y profundidad, 6 mundos para el resto). En la 0.38.1 el borde de la cinta baja hasta el terreno donde este queda bajo el nivel del agua, así que esos puntos ya no dejan agua en el aire:

| Medida (malla 2,67 m) | 0.38.0 | 0.38.1 |
|---|---|---|
| Orilla a ras del agua (a 2 m, menos de 30 cm arriba) | 18,9–19,9 % | 3,6–4,3 % |
| Menos de 50 cm de hondo en el centro | 54,6–57,5 % | 24,6–29,7 % |
| Las dos a la vez (río "pintado") | 11,4–12,5 % | 2,0–2,6 % |
| Profundidad mediana en el centro | 0,44–0,46 m | 0,59–0,60 m |
| Agua cuesta arriba (6 mundos) | 0 | 0 |
| Nodos con agua tapada en el centro (6 mundos) | 46–67 | 13–28 |
| Terreno bajo el nivel del agua en el borde de la cinta, contando agua vecina (6 mundos) | 0,10–0,16 % | 0,09–0,16 % |
| Borde del agua más de 15 cm en el aire (medición del juego, semilla inicial) | sin medir | 0,0 % |

Con la malla de 2 m, la orilla a ras baja de 5,9–6,6 % a 0,8–0,9 %. El tiempo de armar los sectores cercanos no cambió (mediana de 86 a 87 ms en 12 puntos con ríos).

**Lo que queda:** el agua turbia de tierras bajas sigue viéndose como tierra desde arriba. Se resolverá en la etapa de texturas y reflejos del agua.

**Ajuste 0.38.2:** la pasada de profundidad de la 0.38.1 ocultaba entera la parte del cuerpo bajo el agua y la línea del agua parecía un portal. Se reemplazó por esto:

- El jugador se dibuja después del agua en todos los perfiles.
- Un sombreador en la piel y la ropa tiñe lo que queda bajo el nivel del agua del lugar con el color de ese río, lago o mar, más fuerte cuanto más hondo (38–72 %).
- Esa parte baja su opacidad un 30–50 %, así se ve la superficie del agua encima.
- Con la cámara bajo el agua no se tiñe nada.

**Ajuste 0.38.3: parpadeo del agua.** Reporte del iPhone: «la textura del agua del río a veces parpadea, justo cuando la toco». Se buscó, cuadro a cuadro y con el reloj del juego a 1/30 (cada cuadro de prueba ≈ 22 ms de juego), todo lo que puede cambiar el agua de golpe al entrar a un río. Configuración del iPhone: puntero táctil, luz «medio», perfil Alto, malla 2,67 m.

- Sin cambios de calidad de la luz, el agua no cambia de golpe entre cuadros: solo se mueven la espuma y el pasto.
- El ajuste automático de la luz sí lo produce. Con el personaje dentro de una quebrada el cuadro tarda 50 % más que sin el agua del río (383–400 ms frente a 567–600 ms en el entorno de pruebas). El iPhone ya iba justo: en la 0.37.3, la mitad de los cuadros bajo 17 ms y el 95 % bajo 20 ms. Si baja de 48 cuadros/s durante 2 s, la luz pasa de «medio» a «bajo» y el reflejo del agua y el rebote de luz se apagaban en un cuadro. La luz volvía a subir tras 8 s con cuadros de sobra.
- Con la luz «alto», el reflejo de objetos se prendía y apagaba de golpe: el plano salía de un punto 6 m delante de la cámara que entraba y salía del cauce.

No se pudo medir en el iPhone cuántos cuadros por segundo da dentro del río; por eso la 0.38.3 trae un registro de 15 s que lo muestra.

| Medida | 0.38.2 | 0.38.3 |
|---|---|---|
| Mayor cambio del agua de un cuadro al siguiente al subir la luz dentro de una quebrada | 30,3 niveles | 2,5 niveles |
| Cambios de luz en 460 s, 300 dentro del río (código real; 41 cuadros/s en el río con «medio», 59 con «bajo», supuestos) | 48 | 10 |
| Reflejo de objetos entrando a una quebrada con la cámara moviéndose (luz «alto») | 5 cortes de golpe en 200 cuadros | 0 (se prende una vez en 0,35 s) |

**Lo que queda (etapa de texturas y reflejos del agua):**
- A través del agua se ven los triángulos del lecho y las líneas de la oclusión ambiental. La oclusión se calcula sobre el lecho porque el agua no escribe profundidad.
- El reflejo «medio» marca un borde nítido entre orilla y cielo. Sale de la grilla de alturas de 2 m, más gruesa que una quebrada.
- Cada recálculo de sombras cambia la luz en un cuadro.

**Seguimiento 0.38.4: registros del iPhone con la 0.38.3.** Santiago corrió los tres registros de Pruebas → Agua sin parpadeo:

| Registro | Cuadros/s (promedio) | Cambios de luz | Mayor cambio por cuadro: agua · rebote · reflejo de objetos |
|---|---|---|---|
| El agua 15 s, jugando (10 s dentro del agua) | 58 | ninguno con luz «alto»; justo después bajó a «medio» | 0 % · 0 % · 15 % (se apagó y prendió una vez) |
| Reflejo de objetos al entrar a un río | 58 | «alto» → «medio» a 1 s del salto (47 cuadros/s) | 7 % · 7 % · 18 % |
| Celular lento simulado | 54 | dos simulados y uno real, «medio» → «bajo» (33 cuadros/s) | 11 % · 11 % · 6 % |

Lo que muestran:
- Ya no hay cambios de golpe (en la 0.38.2 eran de 100 %). Los máximos de 7–18 % caen en cuadros de más de 50 ms durante un fundido.
- La luz guardada en ese iPhone es «alto», así que el reflejo de objetos estaba activo al jugar. Eso cambia la causa más probable del parpadeo original: el reflejo de objetos que se prendía y apagaba al entrar al río.
- Dentro del agua con «alto» baja de 48 cuadros/s.
- El reflejo de objetos se apagó y volvió a prender una vez por un cambio de 57 cm del agua de referencia.

Cambios de la 0.38.4:
- El plano del reflejo es el agua donde está el personaje y sigue cambios de hasta 1,5 m sin apagarse. Con el código real y una salida simulada del río hacia agua 57 cm más baja, el reflejo pasa de caer a 0 % durante 0,35 s a quedarse en 100 %.
- En el celular el reflejo se dibuja un cuadro sí y otro no, a media resolución. Su costo con «alto» dentro de una quebrada baja de 17–19 % a 8 % del cuadro en el entorno de pruebas.
- Tras un salto de lugar el ajuste automático espera 5 s antes de decidir.

## Seguimiento: nacimientos 0.38.5 (D7, 5 de noviembre de 2026)

**Qué se encontró.** De los tramos que nacen (sin afluentes arriba), el 59–61 % sale de un lago. El resto, 458–520 por mundo (39–41 %), empezaba a mitad de ladera con todo su ancho y 60 cm de hondo, como un canal cortado.

**Qué cambió (0.38.5)**

- Esos tramos nacen en un manantial: una poza de 2,7–3,3 m de radio y 0,77–0,9 m de hondo en el eje, de agua quieta y clara.
- En el páramo y la cumbre, con menos de 20 % de pendiente aguas arriba, nacen en una laguna de montaña de 6–9 m de radio y 1,3–1,5 m de hondo.
- La poza son tres vértices a nivel (cabeza, centro y salida) más una tapa redonda en la cinta del agua. El arroyo sale con el 70 % de su hondura y la recupera en 40 m.
- No se hace poza junto a un lago (3×3 celdas de la grilla) ni dentro de uno, ni en tramos de menos de 30 m.
- El agua del manantial es limpia: beber no da diarrea y la cantimplora queda con agua limpia. La laguna de montaña sigue siendo agua sin filtrar.

**Resultado en 6 mundos** (tramos que nacen, por tipo de nacimiento):

| Mundo | Tramos que nacen | Salen de un lago | Cortados 0.38.4 | Manantiales | Lagunas de montaña | Cortados 0.38.5 | Borde de poza con agua al aire |
|---|---|---|---|---|---|---|---|
| inicial | 1 222 | 731 | 491 | 447 | 44 | 0 | 0,09 % |
| 12345 | 1 146 | 688 | 458 | 410 | 47 | 1 | 0,34 % |
| 777 | 1 221 | 750 | 471 | 430 | 41 | 0 | 0,16 % |
| 2024 | 1 270 | 772 | 498 | 457 | 38 | 3 | 0,15 % |
| 99999 | 1 251 | 751 | 500 | 463 | 36 | 1 | 0,20 % |
| 31337 | 1 260 | 740 | 520 | 485 | 35 | 0 | 0,11 % |

- Los que quedan cortados son tramos de menos de 30 m.
- Dentro de las pozas no queda agua tapada por el terreno, y ninguna poza la cruza otro río. La hondura mediana medida dentro de la poza es 0,69–0,70 m.
- La auditoría de la 0.38.0 da lo mismo: agua cuesta arriba 0; paredes de agua 0,32–0,55 %; agua colgada 0,27–0,44 %; agua tapada en el centro del cauce 0–0,01 % (5–15 nodos por mundo, antes 4–13).
- Generar la red de ríos: media de 267–272 ms en la 0.38.4 y 269–283 ms en la 0.38.5 (mínimo de 3 corridas por mundo, dos mediciones), dentro de la variación entre corridas.
- En partidas guardadas el terreno cambia un poco junto a cada nacimiento, por la poza.

**Ríos a lo lejos (comprobado, sin cambios).** Las cintas de río solo se arman en los 3×3 sectores finos (hasta 64–192 m del jugador). Más lejos, el terreno de malla media (5,3 m) y lejana (10,7 m) lleva pintado el color de agua en cada vértice que queda bajo el nivel del río, así que el cauce se ve como una línea azul continua aunque la malla solo pase bajo el agua en el 64–89 % del eje (malla de 5,3 m, 6 mundos). Desde un mirador a 230 m de un arroyo de 1,6 m de medio ancho (páramo), y desde otro sobre un río del valle, la imagen es la misma con los sectores lejanos finos, con una cinta de agua añadida en los sectores gruesos (prototipo: el terreno grueso se hunde hasta el lecho en cada celda que cruza el río y se arma la cinta cada 8 m; coste de armar los 49 sectores 95–117 ms frente a 96–121 ms) o tal como está. La hidrología queda cerrada; el prototipo no se incluye.

## Etapa 2: personaje — revisión visual y 0.39.0 (6 de noviembre de 2026)

**Cómo se revisó.** Capturas en el entorno de pruebas (perfil Alto, PC con dibujo por software): quieto desde cuatro ángulos, caminando, corriendo, de lado, agachado quieto y caminando, el salto cuadro a cuadro (reloj del juego a 1/80), flotando y nadando, la cara de frente, de tres cuartos y de perfil, las manos y los pies de cerca, y la primera persona con las manos vacías, con hacha y con arco. Las alturas del nado se midieron llamando a la animación con pasos fijos de 1/60 s durante 12 s (el personaje va 1,4 m bajo el agua).

**Lo que se ve bien y queda igual:** la postura quieta y el cambio de peso, la marcha y la carrera (balanceo de brazos, talón-punta), el agachado, la cara (ojos, cejas, nariz, labios, pelo) y las manos de tercera persona a distancia normal de juego. F1 (dedos de la mano de tercera persona hechos de esferas y cilindros) solo se nota con la cámara a menos de 1,5 m; F2 (brazo superior rígido en primera persona) no queda a la vista.

**Lo que se corrigió en la 0.39.0** (cm respecto al agua; negativo = bajo el agua):

| Medida | 0.38.5 | 0.39.0 |
|---|---|---|
| Flotando: manos | −34 a −9 (brazos en cruz, rígidos) | −29 a −27 (codos doblados, braceo) |
| Flotando: base de la cabeza | +16 a +25 | +6 a +15 |
| Nadando: pies | −52 a −8 | −37 a −12 |
| Nadando: base de la cabeza | −17 | −5 |
| Nadando: manos | −49 a +2 | −37 a +14 |
| Salto en el aire | las dos piernas recogidas iguales, brazos a medio levantar | brazos arriba al despegar, una pierna adelante y otra atrás, recogida al caer y flexión de 0,3 s al aterrizar |
| Arco (las dos vistas) | 7 cilindros sueltos con huecos | un tubo curvo con cuerda |

**Lo que queda de la etapa 2:** la unión del hombro se ve como una bola aparte con la cámara a menos de 1,5 m; la mano de tercera persona podría usar la mano con huesos de la primera persona; la animación de nado en primera persona y las de trabajo no se revisaron a fondo.

## Etapa 2, entrega 2: análisis del personaje y 0.39.1 (6 de noviembre de 2026)

**Cómo está hecho el personaje (análisis antes de tocar nada).** Todo vive en el módulo `Body` del único archivo HTML (unas 57 000 letras).

- *Modelo.* Procedural, sin archivos: cada hueso (pelvis con bóxer, tronco, cuello, cabeza, brazo, antebrazo, mano, muslo, pierna, pie) es una sola malla hecha de perfiles de torno y esferas deformadas, fundidas con colores por vértice (piel, labios, uñas, iris, bóxer). Material Lambert con colores por vértice y un sombreador añadido que tiñe lo que queda bajo el agua. Unas 20 llamadas de dibujo; sombras proyectadas. Las manos de tercera persona son tres mallas por pose (relajada, agarre, abierta) que se cambian; la primera persona usa una mano con huesos y piel continua (0.37.0). Ropa, botas, guantes y mochila son mallas que se muestran u ocultan.
- *Esqueleto.* Jerarquía de grupos de Three.js: raíz → pose → cadera → tronco → cuello → cabeza; hombro → brazo → antebrazo → mano; muslo → pierna → pie. No hay piel con pesos en tercera persona: cada pieza gira en su articulación.
- *Animación.* Procedural por capas en `animate(dt, velocidad, enSuelo, estado)`: locomoción (fase ligada a la distancia recorrida, talón-punta, balanceo de cadera, contrarrotación de hombros, cabeza estable), reposo (respiración, cambio de peso, mirar alrededor, parpadeo), acciones (talar, martillar, frotar, agacharse, antorcha, frío, cubrirse), nado y salto. Cada capa tiene su peso y se mezcla con la anterior; no hay animaciones prefabricadas.
- *Pies.* IK analítica de dos huesos (0.12.1): cada pie apoyado se lleva a la malla del terreno o a los pisos construidos, la pelvis baja hasta que el pie más bajo toca y la suela se inclina con la ladera. Tres iteraciones por cuadro.
- *Conexión con el juego.* `Render.draw` llama a `Body.animate` con la velocidad y el estado (agachado, frío, cansado, carga, antorcha, herramienta, trabajo, nado, ropa) y luego a `Body.ik`. La primera persona tiene brazos propios con IK de dos huesos pegados a la cámara.

**Lo que faltaba frente al pedido de animación procedural real:** inclinación al girar, acelerar y frenar; equilibrio en pendiente; hombros con movimiento propio; mirada hacia la cámara; reacción a los golpes; respiración que cambie con el esfuerzo. No faltaban: IK de piernas, adaptación al terreno, sincronización de pasos (la fase va con la distancia: no hay deslizamiento de pies), transiciones suaves (mezclas con constante de tiempo), respiración y parpadeo.

**Qué cambió en la 0.39.1** (medido llamando a la animación con pasos fijos de 1/60 s):

| Capa | 0.39.0 | 0.39.1 |
|---|---|---|
| Giro de 90° caminando | sin inclinación | cadera 5° hacia la curva (10° corriendo), tronco acompaña, cabeza se adelanta 13° |
| Arranque / frenada corriendo | solo la inclinación fija de carrera | tronco adelante hasta 22° / atrás 7° |
| Pendiente | sin inclinación | tronco hacia arriba según la pendiente (hasta 9°) |
| Cámara a 60° del cuerpo | cabeza al frente | cabeza 24°, tronco 8° (tope 57°; si la cámara queda atrás, al frente) |
| Golpe recibido | nada en el cuerpo | tronco 9° atrás, cabeza 21°, brazos arriba, 0,35 s |
| Hombros | fijos | suben con la respiración y con el brazo atrás |
| Después de correr | respiración igual | resuello: más rápida y honda, baja en ~10 s |
| Hombro (geometría) | bola fija en el torso | deltoides en el brazo, se mueve con él |
| Costo de `animate` | — | 13 µs por cuadro |

Sin cambios en jugabilidad, controles, cámara, física, inventario ni combate: solo se añadieron al estado que recibe `Body.animate` la orientación, la posición, la cámara y el aviso de golpe que ya existían.

**Problemas encontrados y pendientes:** la mano de tercera persona sigue siendo de piezas rígidas (se nota a menos de 1,5 m); el tronco es una sola pieza (no hay flexión entre pelvis y pecho); la piel no tiene textura ni variación de tono; no hay sombras de contacto propias del cuerpo. Todo probado en el PC con dibujo por software, no en el teléfono.

**Entrega 3 (0.39.2): manos con huesos en tercera persona.** F1 resuelto: la tercera persona usa el antebrazo y la mano con huesos y piel continua de la primera persona (dedos de tres falanges, uñas, nudillos, palma más clara), con las poses mezcladas en el tiempo; el antebrazo va del color del brazo. Vértices visibles del personaje: 53 980 en 66 mallas → 38 612, con 2 mallas con huesos. Prueba de humo: 548 opciones, 0 errores. Pendientes de la etapa: tronco de una pieza, piel sin textura ni variación de tono, animaciones de trabajo sin revisar a fondo.

**Entrega 4 (0.39.3): la carrera iba al revés (reporte del usuario).** Corriendo hacia adelante parecía correr de espaldas. Medido: la rodilla se doblaba con la pierna yendo atrás y se estiraba con la pierna yendo adelante; con el pie apoyado, el pie iba +7,8 m/s hacia adelante respecto al cuerpo. Corregido: la flexión de la rodilla va en la vuelta por el aire y la pierna llega estirada a apoyar; con el pie apoyado ahora va −5,4 m/s (cuerpo a 5,5 m/s, casi sin patinar). Cadencia de carrera 4 → 2,8 pasos por segundo a 5,5 m/s. Prueba de humo: 550 opciones, 0 errores.

**Entrega 5 (0.39.4): correr en bajada (reporte del usuario).** En una bajada del 34 % la cadera se hundía hasta 22 cm en cada paso (rango 5–95 %: −16 a +3 cm) porque el ajuste de pies bajaba todo el cuerpo hasta el pie de adelante. Se probaron 4 variantes; la elegida acorta la zancada cuesta abajo (×0,73 al 34 %), limita cuánto baja la cadera al moverse y la hace seguir el terreno más despacio: rango −9 a −1 cm, los dos pies tocan el suelo en cada ciclo. Prueba de humo: 551 opciones, 0 errores.

**Entrega 6 (0.39.5): jab alternado (pedido del usuario).** Con la mano vacía, el golpe en tercera persona usaba la curva del hachazo; en primera persona era un empujón con la palma hacia arriba. Ahora es un jab recto desde la guardia que alterna derecha e izquierda (vuelve a la derecha tras 1,2 s sin golpear), con pose nueva de puño cerrado. Daño, alcance e instante del contacto sin cambios. Prueba de humo: 554 opciones, 0 errores.

## 0.40.0 — Muñeco de trapo: muerte y caídas fuertes
- Módulo Rag (Verlet, 15 nodos, 24 aristas, bisagras en codos y rodillas, suelo real con roce, flotación). Iteraciones: 8 en Medio/Alto, 4 en Bajo.
- Disparadores: muerte (cuerpo sin fuerza, empuje según causa), aturdimiento de rayo, roca, barro y caída >4 m (cae, queda tendido, se levanta en 0,8 s).
- Error encontrado y corregido: al levantarse el cuerpo quedaba acostado porque la animación no reescribe todos los giros; ahora se restaura la pose de reposo cada cuadro durante el levantarse.
- Medido (SwiftShader, PC): error máximo de largo de hueso 0,1–0,5 cm, sin hundirse en el suelo, 0,01–0,05 ms por cuadro con el muñeco activo. Aviso de muerte a los 2,6 s; primera persona pasa a tercera al morir.
- Prueba completa: 560 opciones, 0 errores. Sin prueba en teléfono real.

## 0.40.1 — Equilibrio activo y resbalones que ruedan
- Equilibrio: resorte amortiguado de inclinación (k 28, c 4,2; tope 0,45 rad) desde los tobillos, con rodillas y brazos. Empujones: hurtPlayer (k = 0,6 + daño/8, máx. 3), aterrizajes de 1,8–4 m, tambaleo con deslizamiento en laderas >40°.
- Resbalón: en slipStep, ladera >46° y deslizamiento >1,8 m/s → caída con muñeco, giro cuesta abajo mientras la pendiente >35°, el jugador sigue a la pelvis; enfriamiento de 4 s.
- Muñeco: tono muscular por ajuste de forma (Müller 2016), contacto por la normal del terreno, roce una vez por paso con roce estático, choque con troncos (World.objAt), reposo medido por el centro del cuerpo.
- Errores corregidos durante la prueba: el cuerpo se arrastraba cuesta arriba (contacto vertical) → normal de la ladera; rodaba a 0,3 m/s (roce aplicado 8 veces por paso) → una vez; resbalaba sin girar → par de giro; se levantaba a mitad del movimiento / se arrastraba sin fin → roce estático y reposo por el centro.
- Medido (SwiftShader, PC): ladera de ~50°, 12 m de recorrido en 4,3 s, se levanta a los 4,9 s; error de hueso ≤0,9 cm; 0,02–0,05 ms por cuadro. Golpe de roca de 0.40.0 sin cambios visibles (se levanta 0,4 s más tarde). Sin prueba en teléfono real.

## 0.40.2 — Las caídas siguen la inercia
- Informe del usuario: corriendo hacia delante, el personaje caía hacia atrás. Causa: los empujones de cada causa (roca, barro, muerte por golpe, tambaleo de hurtPlayer) iban siempre hacia atrás, sin mirar la velocidad.
- Arreglo: lvx/lvz = última velocidad antes del golpe; peso w = (v − 1,2)/2,8 entre 0 y 1. El empujón de la causa se escala por (1 − w) y se suma uno de tropiezo: pies −0,75·v·w, rodillas −0,4·v·w, pecho +0,35·v·w, cabeza +0,5·v·w. El tambaleo mezcla la dirección del golpe con la de la marcha con el mismo peso. En toda caída el jugador sigue a la pelvis.
- Medido (SwiftShader, PC): corriendo a 5,5 m/s cae hacia delante y avanza ~0,8 m; quieto, la roca sigue tumbando hacia atrás; se levanta a ~1,4 s sin deslizarse de vuelta.

## 0.40.3 — Manos que agarran, nudillos lastimados y carga según la Fuerza
- Informe del usuario: manos torcidas en primera persona. Causas medidas: (1) la herramienta iba en la muñeca (0, −3, 3 cm), en medio del grosor de la mano, y el mango salía por el dorso; (2) la pose de agarre dejaba un hueco de 1 cm para un mango de 4 cm; (3) con la lanza el asta va casi paralela al antebrazo y el giro de la mano quedaba indefinido; (4) jab: guardia con la palma a 128° del objetivo y la muñeca doblada 85°, golpe con la palma 159° al revés; pulgar del puño con la punta por encima de la muñeca.
- Arreglos: mango en el centro de los dedos doblados (muñeca: ∓3,5 cm, −9,8 cm); pose `wrap` ajustada por mínimos cuadrados a un mango de 2,1 cm de radio; lanza con agarre por encima (X fijo); arco recentrado; hoja de la hoz unida al mango; puños con eje y giro hallados por búsqueda (600 × 24): errores de palma de 1° a 7°, nudillos de 4° a 17°, muñeca de 27° a 34°; pulgar doblado.
- Nudillos: roca −1,2 de salud por golpe (×0,4 con piedra en la mano), árbol −0,3; moretón por mano (0–1) en los vértices del dorso y nudillos, en primera y tercera persona (89 y 51 vértices cambian de color en tercera persona), sana a 0,04 por hora de juego; el golpe automático se detiene con salud < 30.
- Carga: maxLoad = 50 + 0,5·(Fuerza − 30) (+20 carretilla, +40 mula con alforjas). Casillas = 24 (+16 mochila) + ⌊Fuerza⌋ − 30. Prueba: 30 → 50 kg y 24; 65 → 67,5 kg y 59; 100 → 85 kg y 94 (110 con mochila); al bajar la Fuerza, las casillas con algo se mantienen hasta vaciarlas.
- Decisiones del usuario: carga 50 → 85 kg; +1 casilla por cada punto de Fuerza.

## 0.41.0 — Multijugador en red local
- Pedido del usuario: modo multijugador en LAN para jugar con su hermano.
- Diseño: WebRTC (canal de datos) sin servidor, señalización manual con dos códigos comprimidos (deflate-raw + base64url, ~575–580 caracteres). STUN público opcional; en LAN bastan los candidatos locales (mDNS). Anfitrión con autoridad sobre semilla, día, hora y clima.
- Compartido: semilla (el invitado recarga el mundo del anfitrión), hora/día/clima cada 2 s, estado del cuerpo 15 Hz por canal sin reenvío (posición, mirada, velocidad y los campos que recibe Body.animate), nombre, mensajes. El cuerpo remoto es una segunda instancia completa (Body pasó a ser la fábrica mkBody()).
- No compartido aún: árboles talados, rocas, objetos, construcciones, animales, inventario.
- Prueba (dos contextos de Chromium, SwiftShader, mismo equipo, mDNS desactivado): conexión en 23 s (incluye 2 × 3,5 s de espera de STUN inalcanzable y la recarga del mundo), semilla y hora igualadas, posiciones correctas en ambos lados, ~1 KB/s por sentido, desconexión limpia. La latencia medida (800–900 ms) es del entorno lento, no de la red. Sin prueba en dos teléfonos reales ni dentro del enlace publicado (puede que el entorno del enlace limite WebRTC).

## 0.41.1 — Multijugador por la sala de Claude y manos derecha e izquierda bien
- Informe del usuario: al hermano le salió «Este navegador no permite conexiones directas (WebRTC)» desde el enlace. Causa: en la página publicada `RTCPeerConnection` no existe. Solución: transporte por la capacidad `room` de Claude (presencia ≤4 KB, ~30 envíos/s compartidos): sala «rdn-» + código de 4 caracteres; estado a 15 Hz en la presencia, mundo del anfitrión cada 2 s, mensajes como {i,t}. Varios jugadores. WebRTC queda para cuando el juego se abre fuera de Claude. Requisito de la plataforma: los jugadores deben tener sesión en Claude y estar admitidos (de la organización o invitados); quien entra por enlace público sin sesión no puede conectarse.
- Prueba de la sala con una sala simulada de la misma forma (BroadcastChannel, dos pestañas): crear y unirse por la ventana, semilla y hora igualadas, posiciones correctas, mensaje recibido, salida detectada. Error encontrado y corregido: la ventana se redibujaba con cada actualización de la sala y borraba lo escrito. No probado con la sala real de Claude ni en dos teléfonos.
- Informe del usuario: en primera persona la mano izquierda parecía la derecha y viceversa. Causa medida: la cámara de primera persona mira hacia −z y el cuerpo hacia +z; la mano del lado derecho de la pantalla se armaba con la geometría de una mano izquierda (determinante de dedos, palma y pulgar = −1). Arreglo: `skinHand(−s)` en primera persona, mango al lado de la palma (+s·3,5 cm), y en las poses sin herramienta con giro fijo se invierten eje y giro (palma y antebrazo iguales, pulgar al lado correcto). Lanza: giro (0,7, 0,7, 0) elegido entre 6.
- Hallado al revisar: en tercera persona todo el cuerpo estaba en espejo (hacha a 0,27 m a la izquierda del cuerpo; antorcha a la derecha; jab y nudillos del lado contrario). Arreglo: raíz con escala x = −1 (hacha ahora a 0,27 m a la derecha) y corrección del muñeco de trapo para la reflexión (cuaternión del hueso = reflejo de q_padre⁻¹·q_mundo; marco con −X y −Z). Caídas de roca, quieto y corriendo: error de hueso ≤1 cm, se levanta igual.

## 0.41.2 — Manos de primera persona rehechas
- Pedido del usuario: corregir anatomía, posición FPS, calidad visual y animaciones de reposo de las manos, sin rehacer el sistema ni tocar otros sistemas.
- Análisis previo (skinHand 0.37.0): antebrazo y palma eran dos tubos abiertos sin empalme (escalón visible en la muñeca); palma en caja (sección superelíptica casi constante, sin tenar/hipotenar ni cúpula dorsal); nudillos en línea recta; dedos cilíndricos sin membranas ni pliegues; pulgar plano en el plano de la palma (7° de inclinación) con el giro de flexión acoplado al de separación (orden de Euler XYZ); uñas como placas blancas; 14/10/20 vértices por anillo; sin movimiento de dedos en reposo; brazos que aparecían y desaparecían de golpe; cambios de pose instantáneos.
- Cambios (mismos huesos y mismas poses, API igual): tubo continuo codo→muñeca→palma→dedos (24 vértices por anillo en antebrazo y palma, 14 en dedos; 1.735 vértices por mano frente a 1.148); antebrazo que pasa de elipse a la sección de la palma sin escalón y con la cabeza del cúbito; palma con eminencias tenar e hipotenar, hueco central, dos pliegues, dorso en cúpula, nudillos en arco (8,2·(x+0,008)²), extremo dorsal redondeado y placa palmar de membranas; dedos con largos y radios reales, base ancha (membranas) cerrada dentro de la palma (antes al doblar se veía el interior del tubo como ranura), nudillos medios más anchos, pliegues en PIP/DIP, yemas, uñas con raíz/lunilla/cuerpo/borde; pulgar con orden de Euler XZY (giro sobre su eje antes de la separación): dirección en reposo (−0,63,−0,64,−0,44) y giro por pose (quinto valor t[4]) resuelto numéricamente para que el puño cruce los dedos y el agarre rodee el mango; moteado ±3 % por vértice; triángulos con orientación fija (la prueba por el centro fallaba en los anillos inclinados).
- Primera persona: eje y giro de los puños vueltos a buscar (700 × 24): errores de 2° a 10°; cada brazo entra subiendo y sale bajando (show 0→1 a 10/s); objetivo suavizado (13/s en reposo, 45/s en acción); inquietud: ondas por dedo (0,04–0,055 rad), reapriete cada ~7 s (0,09 rad), pulgar y separación, respiración compartida, atenuada al actuar (4/s). Probé manos en reposo a la vista (abajo): con el hombro a −25 cm y la muñeca a −20 cm la mano colgando exigía 86° de muñeca; se descartó (quedan ocultas sin herramienta, como antes).
- Comprobado: 16 animaciones de primera persona (hacha, talar, martillar, frotar, cuchillo, lanza, arco, ballesta, honda, boleadoras, comer, beber, recoger, antorcha, cubrir, tensar), guardia y jab, tercera persona (hacha a la derecha +0,27 m), nudillos lastimados (12/30 vértices teñidos en tercera persona, rojos en el puño en primera), muñeco de trapo. Sin prueba en teléfono real.

## 0.41.3 — Pulgares más cortos, manos en espejo y agarre con la muñeca recta
- Diagnóstico medido en 0.41.2 (orientación real de cada mano en el espacio del ojo, script hands413.js): la quiralidad era correcta (f·(d×t) = −0,76 para la derecha y +0,76 para la izquierda, imágenes especulares), pero (a) con el hacha la muñeca quedaba doblada 83° (dedos (−0,78,−0,57,−0,24) contra antebrazo (−0,30,0,53,−0,79)) con la palma hacia la cámara, porque el agarre fija el mango a 71,6° de los dedos y la pose ponía el mango a 26° del antebrazo; con la lanza 85° y con el cuchillo 105°; (b) `mir()` seguía escrito para la malla antigua y volteaba la palma: manos abiertas → dorso en una y palma en la otra; beber → derecha boca abajo; frotar → las dos palmas hacia la izquierda.
- Espejo geométrico: T→(−x,y,z), Z→(−x,y,z), X→(x,−y,−z) (el eje X de la muñeca es ±el dorso según el lado de la malla; con fx, en las poses derechas sin herramienta dorso = X y pulgar ≈ −Z). Poses derechas corregidas por anatomía: nado, frotar, trabajo a mano limpia, arco (BX), recoger, beber, colocar, cubrirse, pose de prueba.
- Agarre: `solve` recibe el ángulo del mango φ (GRIPA por herramienta; 1,25 por defecto) y fija `tl.rotation.x=φ`, así el mango sigue apuntando justo a Z. Hacha/martillo/palo/garrote: Z (0,45,0,85,0,2) → muñeca 27°, dorso (0,8,−0,31,−0,51), pulgar sobre el mango; la cabeza queda fuera del encuadre (con mango hacia delante no hay solución con la muñeca recta: el mango mide 0,55 y la mano está a 0,42 de la cámara). Cuchillo y hoz: Z (0,25,0,92,0,2) → 38°, hoja a la vista. Lanza: φ = 2,1 (120°), sin X → muñeca 33°, pulgar a lo largo del asta (0,25,−0,07,−0,97).
- Pulgar: falanges 39/28/22 mm (antes 48/32/25), base (−0,024,−0,024,−0,009), tenar 0,013.
- Comprobado en 0.41.3: hacha, lanza, antorcha+hacha, guardia, jab, beber (dorso (0,−1,−0,06) en las dos), frotar (dorsos (∓1,0,0)), abrir dorso/palma (dorso (0,0,±1) en las dos, pulgares simétricos), cuchillo, comer; prueba completa de humo. Sin prueba en teléfono real.
