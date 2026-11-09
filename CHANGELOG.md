# Registro de cambios

Generado desde la constante `CHANGELOG` del juego con `tools/desde-artefacto.py`.

## 0.48.0 · Lugares de la historia hechos en Blender

- Avioneta caída: fuselaje con franja roja, nariz y cola, timón, un ala entera y la otra rota, cabina con el parabrisas roto, hélice doblada, ruedas, restos de aluminio, maleta y la mancha quemada del aterrizaje.
- Cabaña del guardabosques: troncos con las puntas cortadas, techo de tejamanil, chimenea de piedra, puerta entreabierta, cama con manta, mesa, estante con ollas, banco, leñera y huerto.
- Mina abandonada: rocas con musgo, marco de troncos con tornapuntas, derrumbe y tablas cruzadas en la boca, rieles con durmientes, vagoneta con mineral, letrero y farol.
- Entradas de cueva con helechos y musgo colgando.
- Con esto termina el remodelado en Blender: personaje, vegetación, animales, construcciones, herramientas, objetos y lugares.

## 0.47.0 · Herramientas y objetos nuevos hechos en Blender

- Las 18 herramientas rehechas: hachas de piedra, pedernal y hierro con cabeza amarrada y filo claro; lanzas con punta de piedra o de hierro; martillo, cuchillo con mango atado, palo, garrote con clavos, boleadoras, arco con empuñadura de cuero, ballesta, honda, pala, azada, hoz, picos de hierro y de pedernal.
- Objetos del suelo nuevos: rama con hojitas, piedra facetada, mata de cabuya, hojas grandes, matico, guadua con nudos, arcilla y pluma.
- Fogata nueva: anillo de piedras, leña cruzada y ceniza.
- Se ven igual en tercera persona y en la vista en primera persona.

## 0.46.0 · Construcciones nuevas hechas en Blender

- Nivel 1 (fibra): varas amarradas, paredes de bahareque con varas tejidas y hojas en tejas, techo de hojas en hileras con borde dentado y pilotes de vara.
- Nivel 2 (madera): piso de tablas con clavos sobre vigas, pared de troncos con los cortes claros en las esquinas, techo de tejamanil en hileras solapadas.
- Nivel 3 (piedra): losas irregulares, mampostería de piedras de distinto tamaño con argamasa, techo de lajas de pizarra y pilotes de piedra apilada.
- Puerta de tablas con travesaños en Z y aldaba; escaleras con peldaños, zancas y pasamanos; refugio inclinado con hojas en tejas.
- Muebles nuevos: cama con colchón, manta y almohada; cama de hojas; caja con cerradura; mesa de tablas; estante con frascos y vasijas; horno de barro; chimenea con brasas; colector con agua; tendedero con ropa y poste.
- Mismas medidas de antes (casilla de 3 m, pared de 2,4 m): las construcciones guardadas encajan igual. Adobe, ladrillo, paja, teja y las máquinas siguen como estaban.

## 0.45.0 · Animales nuevos hechos en Blender

- Vaca, mula, venado, puma, cabra, guagua, conejo, cuy, gallina y serpiente rehechos en estilo low-poly: pelaje facetado con lomo claro y vientre en degradado, ojos con brillo y orejas con el interior rosado.
- Detalles nuevos: astas del venado con puntas, cuernos curvos de la cabra y de la vaca, ubre con pezones, barba de la cabra, crin en sierra de la mula, cola del puma con la punta oscura, cola de algodón del conejo, cresta y cola en abanico de la gallina y lengua roja de la serpiente.
- Mismas medidas y patas articuladas de antes: el paso, el trote, el galope y el salto se animan igual.

## 0.44.0 · Árboles y plantas nuevos hechos en Blender

- Árbol del valle: tronco con raíces en contrafuerte, tres ramas y copa redonda de racimos facetados con luz cálida arriba y sombra fría abajo.
- Roble andino del bosque de niebla: tronco alto con musgo, copa por pisos, bromelias rojas en el tronco y barbas de musgo colgando.
- Palma de cera: tallo claro con anillos, cogollo verde y hojas arqueadas con folíolos; las dos de abajo, secas y amarillas.
- Arbusto de racimos redondos (algunos con bayas moradas), frailejón con falda de hojas secas, roseta plateada y flores amarillas, y rocas facetadas con musgo y liquen.
- Cuatro variantes por especie y tres niveles de detalle para que lo lejano siga siendo liviano; el bosque lejano de las montañas usa el árbol sencillo nuevo en vez de conos.

## 0.43.0 · Personaje nuevo hecho en Blender

- El personaje se rehízo en Blender con estilo low-poly: cuerpo facetado con sombras marcadas, cara nueva (ojos grandes con brillo, nariz en cuña, cejas y boca), pelo con flequillo en punta y patillas, bóxer con elástico y costura, botas con suela y cordones, camisa y mangas nuevas y mochila con tapa, bolsillo, correas y hebilla.
- Cada pieza conserva las articulaciones de antes: caminar, correr, talar, nadar, el equilibrio y el muñeco de trapo funcionan igual.
- Es la primera tanda del remodelado: siguen árboles y plantas, animales, construcciones y objetos.

## 0.42.10 · Siempre sobre el suelo

- Estando quieto, el personaje ya no puede quedar flotando o enterrado si algo cambia debajo (una base que se rompe, un traslado): ahora cae o sube al suelo enseguida. Lo encontró el robot que juega partidas rápidas (80 h de juego en 8 partidas).

## 0.42.9 · Ajuste automático más inteligente

- Si el celular va lento, el ajuste automático apaga primero el detalle del suelo y luego el posproceso HDR (medido con gráficos al máximo en un Android lento simulado: cada uno pesa cerca de un tercio del cuadro); solo después baja el trazado de rayos y el perfil.
- Cuando el celular va sobrado, los devuelve en orden inverso.

## 0.42.8 · Últimos pendientes de la auditoría

- Árboles talados: cada casilla tiene una clave exacta; antes, talar un árbol podía hacer desaparecer otro a unos 24 km. Las partidas guardadas siguen sirviendo.
- Las llamas de un incendio se apoyan en el suelo que se ve (antes podían flotar o hundirse).
- Brillo de luces fuertes: la imagen se reduce en pasos (½, ¼, ⅛) antes de difuminar, así el brillo ya no titila al mover la cámara.
- Reflejo plano del agua en 16 bits: el cielo y el sol reflejados ya no se queman en blanco.
- Mapa más nítido en pantallas de alta resolución.
- Se borró código que ya no se usaba (manos rígidas viejas, ajuste de precisión desactivado, variables y valores sin uso).

## 0.42.7 · Sonido en celulares

- La música tiene un cupo propio de voces (un tercio, mínimo 2): en perfiles bajos ya no deja sin voces a los pasos, golpes y animales.
- Mochila y cajas: las casillas se pueden recorrer con Tab y usar con Enter o Espacio, y los lectores de pantalla dicen el objeto y la cantidad.

## 0.42.6 · Animales, construcción y conexión

- Los animales salvajes ya no atraviesan paredes, puertas, muebles ni las cercas de los corrales.
- No se puede poner una base encima de un mueble o una máquina.
- Multijugador directo: si la conexión se corta un momento (cambio de Wi-Fi, pantalla apagada) espera 12 s a que vuelva en vez de cortar la partida.
- Sala: si el anfitrión cambia de mundo, los invitados lo cargan.
- La ventana de Estado solo se redibuja cuando cambia algo (antes 4 veces por segundo).

## 0.42.5 · Gráficos, multijugador y controles

- Árboles y pasto con distinto balanceo ya no comparten por error el mismo sombreador (algunos se mecían con la amplitud de otro).
- El reflejo del agua muestra al jugador igual que la cámara.
- Multijugador: lo que llega del otro jugador se valida (posición, nombre, chat y clima); un dato roto ya no puede congelar el juego ni meter código en la ventana.
- Escribir en buscadores o en el chat ya no mueve al personaje ni activa atajos.
- Al cambiar de ventana se sueltan todas las teclas (antes el personaje podía seguir caminando solo).
- Mando: el gatillo izquierdo ya no queda apuntando al soltar el mando; táctil: apuntar no queda pegado si el dedo se pierde.
- No llueve dentro de un refugio cerrado.
- Los animales del corral vuelven a hacer sus sonidos.
- Atacar cuerpo a cuerpo suena al lanzar el golpe.

## 0.42.4 · Más fluido en celular

- Luces de antorchas y fogatas con trazado: la prueba de sombra cuesta unas 7 veces menos; en celular se trazan hasta 2 luces (4 en calidad alta).
- Reflejos trazados del agua: cada paso lee la altura una vez en vez de cuatro.
- Construir canales y puentes ya no deja memoria gráfica ocupada al mover la silueta.
- Crecida del río: revisa objetos y animales solo cuando el agua sube 5 cm, no en cada cuadro.
- Bases grandes: buscar el piso, el techo y el nivel bajo los pies usa un índice por casilla en vez de recorrer todas las piezas.
- La barra de salud y estado solo se redibuja cuando cambia algo.
- Girar el celular o cambiar el tamaño de la ventana espera a que termine antes de recalcular la pantalla.
- El muñeco de trapo no acumula atraso cuando el celular va lento.

## 0.42.3 · Agua y terreno

- Lagos vecinos de distinto nivel ya no forman paredes de agua de hasta 14 m: entre los dos queda un borde de tierra que sostiene el lago alto (en 5 mundos de prueba, los bordes con caída de más de 1 m bajaron de 832 a 79).
- Costa: se quitó un acantilado recto de 2 a 15 m que aparecía donde la orilla se mete tierra adentro.
- Las cuevas comprueban que la entrada esté seca en todo su radio.
- Si no encuentra un valle para empezar, busca un sitio seco (antes podía dejarte en el agua).
- Los tramos de río cortados por un lago junto al mar marcan bien su desembocadura.
- Al recorrer mucho, el mundo borra solo los datos más viejos (antes los borraba todos de golpe y daba un tirón).
- iPhone: el número de núcleos ya no baja el perfil gráfico (Safari no lo informa bien).

## 0.42.2 · Sin trampas ni objetos perdidos

- Desmontar ya no devuelve todo el material de objetos baratos (antes daba experiencia de Fabricación infinita): cada material sobrante tiene una probabilidad de recuperarse.
- Soltar y volver a recoger un objeto conserva su durabilidad, calidad, agua y edad (antes volvía como nuevo).
- Recoger una pila con la mochila casi llena guarda lo que cabe y deja el resto en el suelo (antes se borraba).
- Quitarse la mochila sin una casilla libre ya no la hace desaparecer.
- La prensa comprueba que tienes 6 frutas antes de usarlas; el jugo que no cabe cae al suelo.
- Corral grande: 6 espacios, así las vacas pueden tener terneros. La mula ya no se reproduce (es estéril).
- La comida guardada en cajas también se daña con los días y conserva su edad al sacarla.
- Si un rayo, el desgaste o una roca destruyen una caja, su contenido queda en el suelo.
- Al reaparecer te bajas de la mula y se reinician las brasas y el jabón.
- Con más de 60 objetos en el suelo se borra primero una flecha o un objeto quieto, no el último soltado.
- Lo que no cabe al desarmar, cancelar o fabricar recetas dobles cae al suelo.
- La experiencia de Fabricación ganada con máquinas, construcción o la lupa también sube de nivel.
- Fabricar en lote usa el tiempo con fuelle.

## 0.42.1 · No perder la partida

- Si algo falla durante el juego, ya no se congela: sigue andando y muestra el error en un aviso.
- Se guarda solo al salir de la app, cambiar de app o apagar la pantalla (si ya guardaste o cargaste en esta sesión, o si no había partida).
- «Guardar partida y recargar» ahora guarda siempre y al volver carga la partida.
- Al abrir el juego avisa si hay una partida guardada.
- Botón Atrás del navegador: cierra menús o abre la pausa en vez de salir del juego.
- Si el celular libera la memoria gráfica, guarda, recarga y continúa la partida.
- Cargar una partida dañada o con objetos desconocidos ya no rompe el juego.
- Si el navegador no deja guardar, carga la copia más reciente.
- En Extremo no se puede cargar estando muerto.
- Si la carga inicial falla, el mensaje queda visible con un botón Reintentar.
- Con el menú de pausa abierto dibuja a 15 cuadros/s (gasta menos batería).
- Se guardan también el jabón, las brasas de la olla y la lluvia del día.

## 0.42.0 · Más rápido en celulares Android

- Medido antes de cambiar: en un celular de gama baja simulado el cuadro tardaba 223 ms en el preset Bajo; el suelo era el 54 % de ese tiempo y su textura de detalle (hasta 7 lecturas por píxel) un tercio.
- Suelo ligero en Ultra bajo y Bajo: una sola lectura de textura por píxel en vez de hasta 7 (sin relieve ni mezcla triplanar). En Medio y Alto se ve igual que antes.
- Resolución base por preset (al recargar): Ultra bajo 0,9 y Bajo 1,1 (antes 1,5 en todos los celulares). Medio y Alto no cambian.
- Resultado medido en la misma prueba: Bajo 223 → 126 ms por cuadro (−43 %), Ultra bajo 195 → 92 ms (−53 %).
- No cambia: jugabilidad, mundo, guardado ni los presets Medio y Alto.

## 0.41.3 · Pulgares más cortos, manos en espejo y agarre con la muñeca recta

- Pulgar: las tres falanges miden 39, 28 y 22 mm (antes 48, 32 y 25) y nace 4 mm más cerca de la muñeca, así la punta llega a la mitad de la primera falange del índice, como en una mano real; la eminencia tenar es un poco más baja.
- Espejo: la mano izquierda es ahora el reflejo exacto de la derecha en todas las poses. Desde 0.41.1 las dos mallas son imágenes especulares, pero la función que espejaba las poses seguía escrita para la malla antigua y volteaba la palma: con las manos abiertas una enseñaba el dorso y la otra la palma (por eso parecían dos manos izquierdas), al beber una mano quedaba boca abajo y al frotar las palmas no se miraban. Se corrigieron además las poses de la mano derecha que estaban al revés: nadar (palmas abajo), frotar (palma hacia dentro), trabajo a mano limpia y recoger (palma abajo), beber (palmas arriba), colocar (palma al frente), cubrirse (palmas hacia dentro) y tirar del arco (dorso hacia afuera).
- Agarre: el hacha, el martillo, el palo, el garrote, el cuchillo y la hoz se sujetan con el mango inclinado hacia el hombro, perpendicular al antebrazo; la muñeca queda casi recta (antes doblada 83°, con la mano colgando y la palma hacia la cámara, que se leía como una mano izquierda vista por el dorso). Se ve el dorso de los dedos y el pulgar sobre el mango; la cabeza del hacha queda fuera del encuadre, como en cualquier juego en primera persona. La lanza va tumbada en la mano como una jabalina: el asta sale entre el índice y el pulgar (ángulo propio de agarre, 120° en vez de 72°) y la muñeca pasa de 85° a 33° de flexión.
- No cambia: hachazos, golpes, lanzamientos, guardia y puños del jab, antorcha, arco y ballesta, tercera persona y multijugador. Controles y cámara iguales.
- Pruebas: grupo Manos (0.41.3): manos abiertas con el dorso o las palmas hacia ti (deben ser espejo una de otra), hacha y lanza en mano, beber congelado.

## 0.41.2 · Manos de primera persona rehechas

- Anatomía: la piel de cada mano es ahora un solo tubo continuo desde el codo hasta la punta de los dedos. El antebrazo se estrecha hacia la muñeca (con el huesito del lado del meñique) y se funde con la palma sin el escalón que había. La palma es más ancha en los nudillos que en la muñeca, con la eminencia del pulgar y la del meñique, un hueco en el centro y dos pliegues suaves; el dorso es una cúpula lisa con los cuatro nudillos marcados. Los nudillos van en arco (el del medio más adelante, el del meñique 1 cm más atrás) y los dedos salen de ahí con membranas entre ellos, largos y grosores reales (índice 7,4 cm, medio 8,2, anular 7,7, meñique 6,1), sección aplanada por la palma, nudillos medios más anchos, pliegues en las articulaciones y yemas. Las uñas tienen raíz bajo la piel, lunilla, cuerpo rosado y borde libre claro.
- Pulgar: nace en la eminencia tenar e inclinado hacia la palma, girado sobre su propio eje para que la uña mire hacia afuera y la flexión vaya hacia la palma y cruzándola (oposición), como en una mano real. Antes estaba plano en el plano de la palma como el de un maniquí. Cada pose (relajada, abierta, agarre, gancho, cuenco, puño, mango) tiene su propio giro del pulgar, calculado para que en el puño cruce por delante de los dedos y en el agarre rodee el mango.
- Puños del jab: el eje y el giro de cada puño se volvieron a buscar para la mano nueva (700 ejes por 24 giros): en guardia los nudillos miran al frente y arriba con la palma hacia dentro y el pulgar encima; al golpear, nudillos al frente y palma abajo.
- Movimiento: cada brazo entra subiendo desde abajo y sale bajando (antes aparecía y desaparecía de golpe), y su objetivo se sigue con un retraso corto (70 ms en reposo, 20 ms en golpes, trabajo o apuntado) para que los cambios de pose no den saltos sin quitar respuesta a los golpes. En reposo los dedos se mueven un poco por su cuenta con ondas lentas de fases distintas, la mano que sujeta algo aprieta y afloja el mango cada 7 u 8 s, el pulgar y la separación de los dedos también respiran, y las dos manos comparten la respiración; todo se apaga suavemente al actuar.
- Piel: moteado fijo de ±3 % por vértice (no parpadea), cara interna del antebrazo más clara, palma rosada, nudillos y pliegues algo más oscuros. Más resolución: 1.735 vértices por mano (antes 1.148); el costo es despreciable incluso con seis manos en pantalla (multijugador).
- No cambia: los huesos y las poses se llaman igual, así que la tercera persona, el muñeco de trapo, los nudillos lastimados, los guantes y el otro jugador en red usan la misma mano nueva sin tocar nada más. Controles, cámara y jugabilidad iguales.
- Pruebas: grupo Manos (0.41.2): ver cada pose en primera persona, guardia congelada, inquietud en reposo y hacha en mano.

## 0.41.1 · Multijugador por la sala de Claude y manos derecha e izquierda bien

- Multijugador desde el enlace de Claude: ahí la página no puede abrir conexiones directas (WebRTC no existe; por eso al hermano le salía «Este navegador no permite conexiones directas»). Ahora usa la sala en tiempo real de Claude: uno elige «Crear partida» y le sale un código de 4 letras o números (por ejemplo K7Q2); el otro elige «Unirme a una partida» y lo escribe. Pueden entrar más de dos. Necesita internet y que todos abran el juego desde el enlace de Claude con la sesión iniciada; si alguien no puede entrar, hay que invitarlo al juego desde Claude (Compartir, por correo). Fuera de Claude (archivo descargado u otra página) sigue la conexión directa por Wi-Fi con los códigos largos.
- Por la sala se comparte lo mismo que en la 0.41.0: el mundo del que crea la partida, la hora, el día, el clima, el cuerpo completo de cada uno con su nombre y los mensajes. Cada jugador envía su estado unas 15 veces por segundo (cerca de 1 KB/s).
- Manos en primera persona: la mano del lado derecho de la pantalla estaba armada como mano izquierda (el pulgar quedaba del lado contrario) y la del lado izquierdo como derecha. Ahora cada una es la correcta; las herramientas siguen dentro de los dedos, la lanza se agarra por encima y los puños del jab conservan su orientación con el pulgar en su lugar.
- Tercera persona (lo que ve tu hermano de ti): todo el cuerpo estaba armado en espejo, con la herramienta en la mano izquierda, la antorcha en la derecha y el jab y los nudillos lastimados del lado contrario. Ahora la herramienta va en la derecha y la antorcha en la izquierda, como en primera persona. El muñeco de trapo se ajustó al cambio y cae igual que antes.
- Pruebas: grupo Manos y sala (0.41.1): ver las manos en primera persona con hacha, ver en tercera persona la herramienta en la derecha y la antorcha en la izquierda, y abrir el multijugador.

## 0.41.0 · Multijugador en red local

- Nuevo: dos jugadores en la misma montaña, cada uno en su dispositivo. En el menú de pausa (Esc o el botón de menú) está «Multijugador (red local)». Uno elige «Crear partida», copia el código y se lo manda al otro (por WhatsApp o como quieran); el otro elige «Unirme», pega el código, copia su código de respuesta y se lo devuelve; el primero lo pega y quedan conectados. No hace falta servidor ni instalar nada; los dos deben estar en la misma red Wi-Fi.
- Se comparte: el mundo (quien se une pasa al mundo del anfitrión; guarda tu partida antes si quieres conservarla), la hora, el día y el clima (los manda el anfitrión), y cada uno ve al otro con el cuerpo completo y su nombre encima: caminar, correr, nadar, agacharse, mirar, lo que lleva en la mano, golpes, trabajo, ropa, nudillos lastimados y caídas. Hay mensajes cortos entre los dos en la misma ventana.
- Todavía es de cada uno: árboles talados, rocas, objetos recogidos, construcciones, animales e inventario. Si uno tala un árbol, el otro lo sigue viendo en pie. Eso es lo siguiente por compartir.
- Por dentro: conexión directa WebRTC con canal de datos; los códigos (unos 580 caracteres) van comprimidos. El estado se envía 15 veces por segundo por un canal sin reenvío y la hora y el clima cada 2 s; usa cerca de 1 KB/s en cada sentido. El otro jugador es un segundo cuerpo completo (el personaje ahora se arma con una función que se puede usar dos veces).
- Pruebas: grupo Multijugador (0.41.0): abrir la ventana, Eco (un segundo jugador que repite lo que haces 1 s después, para probar sin otro dispositivo) y medir la conexión.

## 0.40.3 · Manos que agarran de verdad, nudillos lastimados y más carga con la Fuerza

- Manos en primera persona: se veían torcidas porque la herramienta iba en la muñeca, en medio del grosor de la mano (el mango salía por el dorso), y el puño de agarre se cerraba dejando un hueco de 1 cm para un mango de 4 cm. Ahora el mango pasa por el centro de los dedos doblados con una pose de agarre propia (cada dedo ajustado a un círculo alrededor del mango). Con la lanza la mano giraba sin control porque el asta va casi paralela al antebrazo: ahora la agarra por encima, con los nudillos arriba. El arco queda dentro de la mano izquierda y la hoja de la hoz ya no flota separada del mango.
- Puños del jab con la mano vacía: la mano en guardia mostraba la palma al revés con la muñeca doblada 85° y el puño que golpeaba llegaba con la palma hacia arriba. El eje y el giro de cada puño se hallaron por búsqueda (600 ejes por 24 giros) para que en guardia los nudillos miren al frente y arriba y al golpear vayan al frente con la palma abajo, con la muñeca doblada 34° como mucho. El pulgar del puño, que quedaba estirado hacia abajo, ahora va doblado bajo los dedos (también en tercera persona).
- Golpear duro a mano limpia duele: contra una roca −1,2 de salud por golpe (−0,5 si golpeas con una piedra en la mano), contra un árbol −0,3. Los nudillos de la mano que golpeó se ponen rojos y, si sigues, oscuros como con costra; se ve en primera y en tercera persona y sana solo en unas 25 horas de juego. Si la salud baja de 30, el golpe automático se detiene.
- Carga: 50 kg al empezar (Fuerza 30) y +0,5 kg por cada punto de Fuerza: 85 kg con Fuerza 100 (antes 30 a 53 kg). La carretilla (+20) y la mula con alforjas (+40) suman igual que antes.
- Casillas: +1 casilla en la mochila por cada punto entero de Fuerza sobre 30: 24 casillas al empezar, 94 con Fuerza 100 y 110 con la mochila de fibra. Si la Fuerza baja, una casilla con algo adentro no se pierde: se quita sola cuando la vacías. Para quitarte la mochila de fibra deben estar vacías las últimas 16 casillas. En Estado hay una sección Carga con el máximo y de dónde salen las casillas.
- Pruebas: grupo Manos y carga (0.40.3): golpear una roca o un árbol a mano limpia, ver nudillos, medir, Fuerza 30/65/100 y bajar la Fuerza con la mochila llena.

## 0.40.2 · Las caídas siguen la inercia

- Si caes o mueres mientras corres, el cuerpo ahora cae hacia donde ibas: los pies se frenan como en un tropiezo y el pecho y la cabeza siguen de largo. Antes los golpes empujaban siempre hacia atrás, y corriendo el cuerpo se iba de espaldas aunque siguiera avanzando.
- La mezcla depende de la velocidad: quieto o caminando despacio (menos de 1,2 m/s) cada causa cae como en la 0.40.0 (roca hacia atrás, rayo desplomado, barro de espaldas); a 4 m/s o más manda del todo la inercia; en medio se mezclan. Se usa la velocidad del último cuadro antes del golpe.
- El tambaleo de la 0.40.1 sigue la misma regla: un golpe recibido corriendo te inclina hacia delante, no hacia atrás.
- En toda caída el jugador queda donde quedó el cuerpo; al levantarse ya no se desliza de vuelta al punto donde empezó la caída.
- No cambia: daño, aturdimientos, controles ni cámara. Pruebas: grupo Inercia al caer (0.40.2): corriendo con roca, barro y muerte, y quieto con roca para comparar.

## 0.40.1 · Equilibrio activo y resbalones que ruedan

- Equilibrio: cuando algo te empuja sin tumbarte, el cuerpo se inclina hacia donde lo empujan desde los tobillos, dobla las rodillas, abre y mueve los brazos para no caer, y vuelve al centro en un segundo con un pequeño rebote. Lo activan los golpes recibidos (hacia atrás; más fuerte cuanto más daño: una mordida de serpiente es un respingo, el zarpazo del puma casi te bota), los aterrizajes de 1,8 a 4 m (hacia delante) y el suelo que se escurre en laderas de más de 40° (tambaleo con los brazos abiertos).
- Resbalones que ruedan: en una ladera muy empinada (más de 46°), si ya vas deslizando rápido (más de 1,8 m/s), pierdes el pie: el cuerpo cae y rueda cuesta abajo dando vueltas mientras la ladera siga por encima de 35°; al llegar a terreno más suave frena, se queda quieto y te levantas donde paró. La cámara lo sigue. Después hay 4 s antes de poder volver a rodar.
- Muñeco de trapo mejorado: tono muscular (al caer el cuerpo cae como una pieza los primeros 0,3 s y luego se afloja; al morir se afloja casi de inmediato), el suelo empuja según la inclinación real de la ladera, el roce actúa a lo largo del suelo con roce estático (en reposo no se arrastra), y el cuerpo choca con troncos y piedras grandes en vez de atravesarlos. Te levantas cuando el cuerpo ya paró, no a mitad de la caída.
- No cambia: daño, controles, cámara, ni la duración de los aturdimientos que ya existían (el cuerpo se levanta a lo sumo 0,4 s más tarde que en la 0.40.0). Lo único nuevo en el juego es la caída al resbalar rápido en laderas de más de 46°, que antes solo te deslizaba. Costo: 0,02 a 0,05 ms por cuadro con el cuerpo en el suelo.
- Pruebas: grupo Equilibrio activo (0.40.1): golpe fuerte, empujón de lado, aterrizar de 3 m, ladera empinada (busca una cerca y te pone en ella) y medir.

## 0.40.0 · Muñeco de trapo: muerte y caídas fuertes

- El cuerpo del jugador ahora tiene un muñeco de trapo físico: 15 puntos (pelvis, pecho, cabeza, hombros, codos, muñecas, caderas, rodillas y tobillos) unidos por huesos de largo fijo, con codos y rodillas que solo doblan hacia su lado. Choca con el suelo real, roza, y en el agua flota un poco.
- Al morir, el cuerpo cae sin fuerza según cómo murió (hacia atrás por golpes, hacia delante por caída o ahogo) y conserva la velocidad que llevaba. El aviso HAS MUERTO sale 2,6 s después, para ver la caída. En primera persona la cámara pasa sola a tercera persona y vuelve al reintentar.
- Los golpes que ya te aturdían ahora te tiran al suelo: un rayo te desploma, la roca te empuja hacia atrás, el barro te hace resbalar de espaldas, y una caída fuerte (más de 4 m) te deja en el suelo. Te quedas tendido mientras dura el aturdimiento y luego te levantas en 0,8 s, pasando por agachado.
- No cambia: el daño, la duración del aturdimiento, los controles ni la cámara (fuera de la muerte en primera persona). Costo medido: 0,01 a 0,05 ms por cuadro mientras el muñeco está activo; con el cuerpo de pie no cuesta nada. En el perfil Bajo usa la mitad de iteraciones.
- Siguiente: 0.40.1 equilibrio activo (tropezones, empujones y resbalones que ruedan cuesta abajo) y 0.40.2 animales.
- Pruebas: grupo Muñeco de trapo (0.40.0): rayo, roca, barro, caída de 6,5 m, morir y medir.

## 0.39.5 · Jab alternado con la mano vacía

- Con la mano vacía, el golpe ahora es un jab: el puño sale recto desde la guardia, a la altura de la barbilla, el brazo se estira del todo y vuelve rápido. La otra mano queda arriba cubriendo la cara, y el hombro del puño se adelanta con un pequeño giro de la cadera.
- Cada golpe alterna la mano: derecha, izquierda, derecha… Si dejas de golpear más de 1,2 s, el siguiente vuelve a empezar con la derecha. Con antorcha en la izquierda golpea siempre la derecha.
- En primera persona el puño se cierra de verdad (pose nueva de puño, con el pulgar cruzado sobre los dedos) y la muñeca queda recta. En tercera persona, con la mano vacía, el cuerpo ya no hace el movimiento del hachazo: hace la guardia y el jab, y la guardia se mantiene un momento después del último golpe.
- No cambia: el clic izquierdo y el botón Golpear, el daño, el alcance, el instante del contacto, ni el golpe con herramienta.
- Pruebas: grupo Jab alternado (0.39.5): tercera persona de lado, primera persona, y cuatro golpes seguidos.

## 0.39.4 · Correr en bajada

- En bajada la carrera se veía rara: en cada paso la cadera se hundía hasta 22 cm y volvía a subir. El pie de adelante apoya mucho más abajo que el de atrás, y el ajuste de los pies al suelo bajaba todo el cuerpo para alcanzarlo, como dando sentones. Además la zancada era igual de larga que en plano.
- Ahora, cuesta abajo, la zancada se acorta según la pendiente (en una bajada del 34 %, un 27 % más corta), la cadera baja como mucho lo justo y sigue el terreno más despacio, y las rodillas absorben la diferencia; el tronco se echa menos hacia atrás. Medido corriendo en una bajada del 34 %: la cadera sube y baja 8 cm por paso (antes 19) y los dos pies siguen tocando el suelo en cada paso.
- En plano y en subida la zancada no cambia; la cadera sigue el terreno un poco más despacio al moverse, igual en todo terreno.
- Pruebas: grupo Correr en bajada (0.39.4): ir a una bajada pareja con la cámara de lado.

## 0.39.3 · La carrera va hacia adelante

- Corriendo hacia adelante el personaje parecía correr de espaldas. Causa medida: la rodilla se doblaba cuando la pierna iba hacia atrás y se estiraba cuando iba hacia adelante, al revés de una carrera real. Con el pie en el suelo, el pie iba hacia adelante a 7,8 m/s respecto al cuerpo (como caminar hacia atrás) y en el aire volvía hacia atrás.
- Ahora la rodilla se dobla cuando la pierna vuelve adelante por el aire (el talón sube detrás) y llega estirada a apoyar; la pequeña flexión al recibir el peso va justo después del apoyo. Con el pie en el suelo, el pie va hacia atrás a 5,4 m/s corriendo a 5,5 m/s: casi no patina.
- El paso al correr es más largo: 2,8 pasos por segundo a 5,5 m/s, como un corredor real (antes 4 pasos por segundo, las piernas iban muy rápido). Caminar no cambia de ritmo.
- Pruebas: grupo Carrera hacia adelante (0.39.3): cámara de lado para ver la carrera, y medir hacia dónde va el pie abajo y arriba al caminar y al correr.

## 0.39.2 · Manos con huesos en tercera persona

- Tercera entrega de la etapa del personaje. Las manos de tercera persona eran tres mallas rígidas por mano (relajada, agarre y abierta) hechas de esferas y cilindros, que se cambiaban de golpe; de cerca se veían dedos de bolas (F1 de la auditoría).
- Ahora la tercera persona usa el mismo antebrazo y mano con huesos y piel continua de la primera persona (0.37.0): dedos de tres falanges que se doblan con la piel, uñas, nudillos y palma más clara; las poses se mezclan en el tiempo en vez de saltar. El antebrazo va del color de la piel del brazo (en primera persona conserva el tono más claro del lado interno). Los guantes, cuando existan, cambiarán de color en la misma malla.
- Cuesta menos: el personaje pasa de 53 980 vértices visibles en 66 mallas a 38 612 en menos mallas, con 2 mallas con huesos (una por brazo). Las herramientas, la antorcha, el IK de pies y la primera persona no cambian.
- Pruebas: grupo Manos con huesos en tercera persona (0.39.2): mano de cerca, agarre del hacha de cerca, y vértices y mallas con huesos.

## 0.39.1 · Personaje: inclinación, mirada, hombros, golpe y resuello

- Segunda entrega de la etapa del personaje, sobre el mismo cuerpo de siempre (huesos de pelvis, tronco, cuello, cabeza, brazos y piernas con colores por vértice) y su animación por capas calculada en cada cuadro. Capas nuevas, todas con delta time:
- Giro: el cuerpo se inclina hacia adentro de la curva según la velocidad de giro (cadera hasta 5° caminando y 10° corriendo), el tronco acompaña y la cabeza se adelanta al giro.
- Aceleración y frenada: el tronco va adelante al arrancar (hasta 22° corriendo) y atrás al frenar (7°), y en las cuestas se inclina hacia arriba según la pendiente bajo los pies (dos lecturas de altura por cuadro).
- Mirada: en tercera persona la cabeza sigue hacia donde apunta la cámara (hasta 57° a los lados y 23° arriba o abajo) y el tronco un poco; si la cámara queda detrás, vuelve al frente.
- Hombros independientes: suben con la respiración y cada uno sube un poco cuando su brazo va atrás. Resuello: después de correr la respiración es más rápida y más honda, y baja despacio al parar.
- Golpe recibido: el cuerpo se encoge y se tuerce durante 0,35 s (tronco 9°, cabeza 21°, brazos arriba). Hombro: el deltoides va en el brazo y se mueve con él (antes era una bola fija del torso que se separaba al levantar el brazo).
- Costo: 13 µs por cuadro en el PC de pruebas (toda la animación del cuerpo). Jugabilidad, controles, cámara y física no cambian.
- Pruebas: grupo Personaje (0.39.1): la cabeza sigue a la cámara, correr en círculos y frenar, recibir un golpe, y medir las capas nuevas y el costo.

## 0.39.0 · Personaje: nado, salto y arco

- Empieza la etapa del personaje. Se revisó con capturas: quieto desde cuatro ángulos, caminando, corriendo, de lado, agachado, saltando, nadando, la cara de cerca y la primera persona con hacha y arco. Lo que se ve bien queda igual; esta versión corrige tres cosas.
- Nado. Flotando, los brazos quedaban en cruz, rígidos y a la altura de los hombros; ahora bracean a media altura con los codos doblados (manos de 27 a 29 cm bajo el agua, antes de 9 a 34) y el cuerpo va 10 cm más hundido (base de la cabeza de 6 a 15 cm sobre el agua, antes de 16 a 25). Nadando, la cabeza iba 17 cm bajo el agua y los pies subían hasta 8 cm de la superficie; ahora el cuerpo va 12 cm más arriba (cabeza a 5 cm) y la patada es más corta (pies de 12 a 37 cm bajo el agua, antes de 8 a 52).
- Salto. En el aire las dos piernas se recogían iguales y los brazos quedaban a medio levantar, como sentado en el aire. Ahora al despegar los brazos suben, una pierna va adelante doblada y la otra atrás; al caer las piernas se recogen y los brazos bajan; al aterrizar hay una flexión de 0,3 s (cadera 11 cm abajo, rodillas y tronco).
- Arco. Era 7 cilindros sueltos con huecos entre uno y otro, en las dos vistas; ahora es un solo tubo curvo con su cuerda.
- Pruebas: grupo Personaje (0.39.0): ir a agua honda para flotar y nadar, cámara de lado para el salto, arco en tercera persona de cerca, y medir el nado (altura de pies, manos y cabeza respecto al agua en un ciclo completo).

## 0.38.5 · Los ríos nacen en manantiales y lagunas

- Antes, el 39–41 % de los ríos de cada mundo (458–520) nacía de golpe a mitad de ladera: el cauce empezaba con todo su ancho y 60 cm de hondo, como un canal cortado. Los demás salen de un lago.
- Ahora esos ríos nacen en un manantial: una poza redondeada de unos 3 m de radio y 70–90 cm de hondo, de agua quieta y clara, de la que sale el arroyo. En el páramo y la cumbre, donde la ladera es suave, nacen en una laguna de montaña de 6 a 9 m de radio. El arroyo sale bajito y gana hondura en sus primeros 40 m.
- El agua del manantial es limpia: «Beber del manantial» no da diarrea y la cantimplora se llena con agua limpia. Las lagunas y los ríos siguen siendo agua sin filtrar.
- En 6 mundos: 410–485 manantiales y 35–47 lagunas por mundo; los ríos que empiezan cortados bajan de 458–520 a 0–3 (tramos de menos de 30 m). En el borde de las pozas, 0,1–0,3 % de los puntos quedan con agua sobre el suelo y ninguno con el agua tapada. Las mediciones de la 0.38.0 (agua colgada, paredes de agua, agua tapada, cuesta arriba) no cambian, y generar la red de ríos tarda lo mismo (267–283 ms de media).
- En partidas guardadas, junto a cada nacimiento el terreno cambia un poco (la poza).
- Pruebas: grupo Nacimientos (0.38.5): ir al manantial más cercano, ir a la laguna de montaña más cercana y contar los nacimientos del mundo.

## 0.38.4 · Reflejo de objetos estable y más liviano

- Lo que mostraron los registros del iPhone con la 0.38.3: ya no hay cambios de golpe (el mayor cambio por cuadro fue 7–18 %, en cuadros lentos, contra 100 % en la 0.38.2). La luz está en «alto», así que el reflejo de objetos está activo. Dentro del agua los cuadros bajan a 47 por segundo y el ajuste pasa la luz a «medio». Además, el reflejo de objetos se apagó y volvió a prender una vez, cuando el agua de referencia cambió 57 cm.
- El plano del reflejo ahora es el agua donde está el personaje, también en los rápidos. Fuera del agua usa la más cercana al plano que ya tenía. Si el nivel cambia hasta 1,5 m, el plano lo sigue en unos 0,4 s sin apagarse. Con el código real y una salida del río hacia agua 57 cm más baja: la 0.38.3 dejaba el reflejo en 0 % durante 0,35 s; la 0.38.4 lo mantiene en 100 %. Bajando el rápido junto al inicio (2,55 m de caída en 23 m) sigue igual que antes: reflejo en 100 % todo el tiempo y plano a 7 cm del agua (mediana).
- En el celular el reflejo de objetos se dibuja un cuadro sí y otro no, a media resolución. En una quebrada con luz «alto», en el entorno de pruebas, el reflejo pasó de costar 17–19 % del cuadro a 8 %, y el cuadro promedio bajó de 744–761 a 702 ms.
- Tras un salto de lugar (reaparecer, viajar, las Pruebas) el ajuste automático espera 5 s antes de decidir: armar terreno y sombras da cuadros lentos que no son del lugar. En los registros del iPhone la luz bajó a 1–6 s de un salto.
- Registro del agua: el informe muestra cuántos cuadros tuvo el peor segundo, y el salto del plano solo se cuenta con el reflejo visible (más de 10 %). Los 57 cm del iPhone se midieron cuando el reflejo estaba casi apagado.
- Pruebas: grupo Reflejo en rápidos (0.38.4): bajar por un rápido y salir a la orilla con luz «alto» mientras se registra el agua.

## 0.38.3 · El agua deja de parpadear

- Lo que cambiaba el agua de golpe: el ajuste automático de la luz. Con el personaje dentro del río el agua llena media pantalla y su reflejo cuesta (en el entorno de pruebas el cuadro tarda 50 % más que sin el agua del río). Si los cuadros bajan de 48 por segundo durante 2 s, el ajuste baja la luz de «medio» a «bajo», y la vuelve a subir tras 8 s con cuadros de sobra. Ese cambio era instantáneo: el reflejo del agua y el rebote de luz se apagaban o encendían en un solo cuadro y, dentro del río, podía repetirse cada 5 a 8 s.
- Ahora el reflejo del agua y el rebote de luz se funden en 0,8 s; mientras se apaga, el reflejo conserva su calidad anterior. Con la luz subiendo dentro de una quebrada, el mayor cambio del agua de un cuadro al siguiente bajó de 30,3 a 2,5 niveles de brillo.
- El ajuste ya no sube y baja seguido: si después de subir la luz tiene que bajarla antes de 30 s, la próxima vez espera el triple para subirla (8, 24, 72 y hasta 120 s) y vuelve a 8 s tras 90 s estables. Con el código real y un celular supuesto que va a 41 cuadros/s dentro del río con «medio» y a 59 con «bajo», 460 s de juego (300 en el río) pasan de 48 cambios de luz a 10. Cada cambio muestra un aviso corto («Luz «bajo»: el celular iba lento…»).
- Reflejo de objetos (solo con luz «alto»): el plano del reflejo sale del agua donde está el personaje; antes salía de un punto 6 m delante de la cámara que entraba y salía del cauce, y el reflejo se prendía y apagaba de golpe. Ahora se apaga solo tras 24 cuadros sin agua a la vista, se prende y apaga en 0,35 s y su altura sigue al agua suave. Entrando a una quebrada con la cámara moviéndose: de 5 cortes de golpe en 200 cuadros a ninguno (se prende una vez, en 0,35 s, y no se vuelve a apagar).
- Pruebas: grupo Agua sin parpadeo (0.38.3): registrar el agua 15 s mientras entras al río (informe de lo que cambió de golpe y del ajuste automático), simular un celular lento dentro de una quebrada y reflejo de objetos al entrar a un río.

## 0.38.2 · Se ve el cuerpo bajo el agua

- La 0.38.1 ocultaba entera la parte del cuerpo bajo el agua y la línea del agua parecía la entrada de un portal. Ahora el jugador se dibuja después del agua y lo que queda bajo la superficie se ve a través de ella: toma el color del agua donde estás (azul, verdoso o café según el río, o el del lago o el mar), más fuerte cuanto más hondo, y deja ver un poco la superficie encima.
- Igual en todos los perfiles de calidad: antes, sin sombras de contacto, el agua tapaba casi por completo las piernas y, con ellas, el cuerpo se pintaba encima del agua.
- Si la cámara queda bajo el agua no se tiñe nada: ya se ve todo con la niebla de agua.
- Pruebas: grupo Agua y cuerpo (0.38.2): pararse en una quebrada, ver la línea del agua de lado y nadar en un río hondo.

## 0.38.1 · El agua tapa al personaje y los ríos van hundidos

- Corregido: en calidad Alto (con sombras de contacto) el personaje se dibuja en una pasada aparte, después del agua, y el agua no lo tapaba. Las piernas metidas en el río se veían enteras encima del agua: de pie, el río parecía pintado en el suelo, y al nadar el agua parecía una lámina en el aire. Ahora la superficie del agua (ríos, lagos y mar) tapa lo que queda debajo. El error venía de la 0.33.1 y se notó cuando los ríos quedaron continuos en la 0.38.0.
- Cauces hundidos: la orilla sube 0,78 m por cada metro desde el borde del agua (antes 0,3) y la llanura de relleno queda 0,7 m por encima del agua (antes 0,1). El cauce tiene al menos 0,6 m de hondo en el centro. Medido en 3 mundos con la malla de 2,67 m: la orilla a ras del agua baja de 19–20 % del recorrido a 3,5–4,3 %; menos de 50 cm de hondo, de 55–57 % a 25–30 %; la profundidad mediana en el centro sube de 0,45 a 0,60 m.
- Cinta del río: se arma cada ~4 m en vez de cada 22 m y sus bordes nunca quedan por encima del terreno. Cada tramo lo dibuja un solo sector (antes los sectores vecinos también lo dibujaban y el agua quedaba doble y más opaca cerca de sus bordes). Las quebradas son un poco más transparentes y se ve el lecho.
- Los helechos ya no crecen en la franja que cubre el agua.
- Pruebas: grupo Ríos (0.38.1): pararse en medio de una quebrada, pararse en un río hondo (nadar) y medir orillas y profundidad.

## 0.38.0 · Ríos sin diques ni paredes de agua

- Ríos elevados: cerca del 5 % del recorrido de los ríos de cada mundo corría sobre un terraplén angosto, a veces más de 10 m por encima del terreno, porque un umbral río abajo o el nivel del lago al que llegan sostenía el agua. Ahora, donde pasa eso, el terreno se rellena como una llanura a ras del agua con una pendiente suave hacia el terreno de alrededor: el río corre por un valle plano. Medido en 6 mundos: el recorrido sobre un terraplén de más de 3 m baja de 2,7–3,0 % a 0,02–0,04 %.
- Junto a lagos y al mar: si una orilla toca un lago o el mar, el río ya no queda más alto que ese nivel (antes quedaba colgado sobre el fondo del lago, con una pared de agua). Donde la cinta del río pasa sobre un lago o el mar se vuelve transparente en todo el recorrido, no solo en la desembocadura.
- Uniones: en los últimos 40 m un afluente baja hasta el nivel del río al que llega; antes podía llegar varios metros más alto y su borde quedaba en el aire. Los tramos que terminan en medio de otro río igualan su nivel con él si llegan hasta 60 cm por debajo.
- Bordes: el borde exterior de la cinta del río baja inclinado en vez de formar una pared vertical de 2,2 m. Si algún borde queda al aire, se ve como una orilla que baja.
- Quebradas cortadas: ahora tienen un ancho mínimo que depende de la malla del terreno: 3 m en Medio y Alto, 4 m en Bajo y Ultra bajo. Con la malla de 2,67 m las más angostas quedaban tapadas a trozos: los cortes por mundo bajan de 330–660 a 0–16.
- Resultado en 6 mundos con la malla de Alto: bordes del río al aire, de 0,13–0,23 % del recorrido a 0,06–0,13 %; agua colgada sobre una orilla, de 0,16–0,23 % a 0,06–0,11 %; agua cuesta arriba, 0 antes y ahora. Generar la red de ríos tarda unos 50 ms más en PC.
- El nivel del agua solo cambia cerca de lagos, del mar y de las uniones; donde el río iba elevado sube el terreno de alrededor. Una pieza construida justo al lado de uno de esos ríos puede quedar medio enterrada.
- Pruebas: grupo Ríos (0.38.0): medir los ríos de este mundo, ir a un río que antes iba sobre un dique, a la unión de dos ríos, a un río que llega a un lago y a una quebrada angosta.

## 0.37.4 · Diagnóstico de tirones en el aparato

- En el iPhone la prueba de la 0.37.3 dio: mitad de los cuadros por debajo de 17 ms (60 por segundo), 95 % por debajo de 20 ms, pero 12 de 600 cuadros pasaron de 33 ms (el peor, 68 ms). Para saber qué los causa en el propio iPhone, sin adivinar, la prueba ahora registra por cada cuadro cuánto tardó cada parte del código (lógica, personaje, terreno, vegetación, pasto, objetos y animales, cámara y luces, sombras de montañas, dibujo, sonido, interfaz) y qué sucesos hubo (terreno armado, vegetación o pasto recargados, cálculo de sombras, sombreador, geometría o textura nuevos, animal nuevo).
- Al terminar muestra un informe: tiempos de cuadro, tiempo del código, y para los cuadros lentos qué parte del código pesó más, cuánto tiempo quedó fuera del código (dibujo de la tarjeta gráfica, memoria del navegador) y qué sucesos coincidieron. Con eso se arregla la causa real en la siguiente versión.
- Dos pruebas: la dura (300 m en 600 cuadros, igual que la de la 0.37.3, para comparar) y una a velocidad real de carrera durante 20 s. Apagado, el diagnóstico no gasta nada.
- Pruebas: grupo Tirones.

## 0.37.3 · Menos tirones al avanzar (auditoría, parte 3)

- Medido antes de cambiar nada: recorrido de 400 m con instrumentos en el código. Al cruzar de sector el juego armaba de golpe hasta tres trozos de terreno cercanos (6 a 8 ms cada uno), recalculaba toda la vegetación lejana cada 20 m (7 a 16 ms) y la primera vez que calculaba las sombras de las montañas compilaba sus sombreadores en pleno juego (unos 50 ms).
- El terreno cercano ahora se arma por filas, con un tope de tiempo por cuadro y prioridad para los trozos más cercanos; mientras tanto se sigue viendo la versión de menor detalle, así que no aparecen huecos. Solo se arma de golpe cuando no hay ningún terreno (al cargar partida o saltar lejos).
- Las sombras de las montañas y la iluminación global compilan sus sombreadores durante la carga, enlazados a su destino real; antes se compilaban contra la pantalla, no servía y el primer cálculo en el juego costaba unos 50 ms.
- La vegetación lejana recuerda cada celda ya calculada en vez de volver a consultar ríos, alturas y agua en cada recarga. Las alturas que usan las sombras de las montañas se llenan en trozos de 64 celdas (antes filas enteras de 256) y la malla del terreno lejano usa menos tiempo por cuadro. Todas las variantes de los animales se generan durante la carga (47 ms), no cuando aparece el primero.
- Resultado en la misma prueba (calidad Alto): el peor cuadro bajó de 59-67 ms a 19-23 ms; el 99 % de los cuadros queda por debajo de 16 ms (antes 26-29 ms); los cuadros de más de 33 ms pasaron de 1-2 a 0. En calidad Media el peor cuadro bajó de 60 a 20 ms. Son tiempos del código del juego en el entorno de pruebas, que dibuja sin tarjeta gráfica; en un PC deberían ser menores.
- Pruebas: grupo Tirones (avanza 300 m en 10 s y muestra la mitad, el 95 % y el peor tiempo de cuadro).

## 0.37.2 · Agua visible (auditoría, parte 2)

- Arreglado: la textura de los ríos se estiraba y cambiaba de forma cada vez más con el tiempo de juego. El desplazamiento era tiempo × velocidad de cada punto del río, y como la velocidad cambia de un punto a otro la diferencia crecía sin límite (a los 10 minutos ya era decenas de veces). Ahora el agua usa dos capas de textura desfasadas que se reinician cada 4 s y se mezclan suavemente: la corriente se sigue viendo con su velocidad en cada tramo y la deformación queda acotada para siempre.
- Orden de dibujo fijo del agua: primero el mar, luego los lagos y encima los ríos. Antes los tres tenían el mismo orden y se reordenaban por distancia al moverte, lo que podía hacer parpadear las zonas donde se juntan.
- Desembocaduras: donde el río ya está encima de un lago o del mar, su cinta se vuelve transparente y queda solo la superficie del lago o del mar, sin la franja más oscura de dos capas de agua superpuestas.
- Pruebas: grupo Agua visible (ir a un río ancho, ir a una desembocadura, adelantar 20 minutos el reloj del agua).

## 0.37.1 · Estabilidad (auditoría, parte 1)

- Arreglado: una tecla pulsada con un menú abierto (por ejemplo Q en el inventario) se ejecutaba al cerrarlo. Ahora, con el juego en pausa, las acciones pedidas se descartan, y al abrir un menú se sueltan el clic derecho, el botón Cubrir y el gatillo izquierdo.
- Arreglado: talar o picar automático seguía golpeando un árbol o roca aunque te alejaras sin usar el joystick (corriente del río, resbalón, cargar partida). Ahora se cancela al estar a más de 2,6 m del objetivo, y un golpe nunca alcanza un objetivo lejano.
- Arreglado: al cargar una partida se limpian el golpe en curso, el estado de cubrirse o tensar, el enfriamiento y la barra de vida.
- Al quitar huertas, canales, puentes, escaleras de base, trampas y jaulas se libera su geometría (antes quedaba en la memoria de la tarjeta gráfica).
- Limpieza: se quitaron cinco funciones que nunca se usaban.
- Pruebas: grupo Estabilidad.

## 0.37.0 · Manos con huesos y piel, clic izquierdo y derecho

- Las manos de primera persona son nuevas: cada brazo tiene un esqueleto (antebrazo, muñeca, mano, tres falanges por dedo y tres en el pulgar) y una sola piel continua encima. En cada articulación la piel se reparte entre los dos huesos, así al cerrar la mano los dedos se doblan con la piel en vez de ser esferas pegadas a una bola. Tiene nudillos, almohadillas, eminencia del pulgar, palma más clara y uñas. Las poses (relajada, agarre, abierta, gancho para la cuerda del arco y cuenco para beber) pasan de una a otra suavemente. Con guantes la mano cambia de color.
- PC: con el ratón capturado, clic izquierdo golpea. Clic derecho mantenido: con arco tensa (al soltar dispara; más tensión, más alcance y puntería; aparece la flecha y la vista se acerca un poco), con honda o boleadoras las hace girar y al soltar las lanza, con lanza la levanta y al soltar la lanza, con ballesta apunta acercando la vista, y con cualquier otra cosa o la mano vacía te cubres.
- Cubrirse: el golpe de un animal hace un 75 % menos con algo en la mano (50 % con las manos), suena el bloqueo y gasta energía. Mientras te cubres o tensas caminas más lento. En tercera persona el cuerpo sube los brazos para cubrirse.
- En el celular hay un botón nuevo para mantener, al lado de Golpear, con un escudo de tiza; su nombre cambia según lo que llevas (Cubrir, Tensar, Girar, Apuntar). En el mando es el gatillo izquierdo.
- Pruebas: grupo Manos con huesos y clic derecho.

## 0.36.7 · Brazos tras abrir menús

- Arreglado: en primera persona, después de abrir el inventario o cualquier menú, los brazos, la herramienta y sus animaciones dejaban de verse. Con el menú abierto el juego se pausa y el tiempo del cuadro llega en cero; el cálculo del balanceo dividía por ese cero, el resultado quedaba inválido para siempre y los brazos se iban fuera de la pantalla. Ahora con el juego en pausa solo siguen pegados a la cámara, y si algún valor llegara a quedar inválido se reinicia.
- Pruebas: grupo Menús.

## 0.36.6 · Vida de árboles y rocas, golpes sincronizados

- Árboles y rocas tienen vida. Cada golpe que hace contacto les quita vida según la herramienta y tu fuerza (hacha de piedra 9, de pedernal 12, de hierro 18 contra el árbol; pico 10, martillo 6 contra la roca; con la mano casi nada). Una barra arriba muestra la vida que le queda. A 0 el árbol cae y da troncos y ramas; la roca suelta piedras (con pico, una o dos más). Si pasa un día sin golpearlos se recuperan.
- El golpe tiene su propio reloj: la animación en 1.ª y 3.ª persona y el sonido salen del mismo tiempo, y el daño y el sonido llegan en el instante en que la herramienta toca (madera, piedra o carne). Si no tocas nada solo suena el aire. Antes el sonido salía al pulsar y el talado era un temporizador aparte.
- Talar árbol y Picar la roca ahora golpean una y otra vez con la animación hasta terminar; si te mueves, paras. Si pulsas Golpear a mitad de un golpe, el siguiente queda en cola.
- El martilleo y el corte de los trabajos (fabricar, despiezar) suenan al mismo compás de la animación.
- Arreglado: la herramienta en 1.ª persona a veces no se veía porque el pasto, el suelo o una pared cercana la tapaban. Ahora los brazos se dibujan al final y nada los tapa.
- Arreglado: en 3.ª persona la herramienta desaparecía al llevar antorcha. Ahora la antorcha va en la mano izquierda y la herramienta en la derecha.
- Arreglado: algunas animaciones no salían porque se detectaban por el enfriamiento del ataque; ahora salen del reloj del golpe.
- Pruebas: grupo Vida de árboles y rocas.

## 0.36.5 · Botón Golpear fijo

- Nuevo botón redondo Golpear, igual a Saltar, Correr y Agachar, siempre en pantalla, con un puño blanco dibujado como con tiza. En PC es la tecla Q y en el mando el gatillo derecho.
- Siempre hace algo: con arco, ballesta, honda, boleadoras o lanza en la mano dispara o lanza; si hay una presa al alcance la golpea; con hacha frente a un árbol empieza a talar; si no hay nada, golpea al aire (gasta un poco de energía). Antes, sin presa al alcance, no pasaba nada y por eso no se veía la animación.
- En tercera persona el cuerpo ahora también hace el golpe (antes solo se animaba en primera persona).
- El botón se puede mover y cambiar de tamaño en Editar HUD.
- Pruebas: grupo Botón Golpear.

## 0.36.4 · Animaciones en primera persona

- En primera persona ahora ves tus propios brazos, manos con dedos y la herramienta, pegados a la cámara. Antes solo flotaba la herramienta y un antebrazo del cuerpo de tercera persona. Los brazos usan IK de dos huesos (hombro, codo, muñeca), así que cada animación solo mueve la mano y el codo se dobla solo.
- Movimiento: respiración en reposo, balanceo al caminar y más fuerte al correr (la herramienta baja y se inclina), retraso al girar la cámara, salto y aterrizaje, agacharse, temblor de frío, cansancio, golpe recibido y sacudida.
- Acciones: talar a dos manos (carga, golpe e impacto), martillar sujetando la pieza, frotar con las dos manos para encender fuego, trabajar o despiezar con el cuchillo, golpe con herramienta, puñetazo con la mano vacía, lanzar la lanza, tensar y soltar el arco (el arco va en la mano izquierda), retroceso de la ballesta, girar y soltar la honda, girar sobre la cabeza y lanzar las boleadoras, recoger, comer (con mordiscos), beber con las manos en cuenco, colocar piezas, sacar y guardar la herramienta y, tras 9 s quieto, mirar la herramienta.
- La antorcha pasa a la mano izquierda, con llama que titila. Con guantes se ven las manos enguantadas.
- Pruebas: grupo Animaciones 1.ª persona.

## 0.36.3 · Flechas que se clavan y objetos con forma

- Lo lanzado ya no resbala sin fin. Al tocar el suelo la flecha y la lanza se clavan, inclinadas según como llegaron; la piedra y las boleadoras pierden casi toda la velocidad y se quedan cerca de donde caen. Antes el suelo las frenaba como a un objeto soltado de la mano y a 22 m/s resbalaban unos 30 m o más cuesta abajo.
- Los objetos en el suelo ya no son cubos blancos: la flecha tiene asta, punta y plumas y vuela apuntando a donde va; la lanza tiene su punta (de piedra o de hierro); las boleadoras son tres bolas con sus cuerdas y giran en el aire; las piedras y minerales son rocas con textura; ramas, palos, cañas, guaduas y troncos son palos. Todo lo demás se ve con su propio ícono, siempre de frente a la cámara.
- Pruebas: Disparar → soltar objetos variados.

## 0.36.2 · Botón para disparar siempre

- Antes el botón de disparar solo aparecía con un animal en la mira, así que con el arco en la mano no había nada que tocar. Ahora, con un arco, ballesta, honda, boleadoras o lanza en la mano, el primer botón de acción es siempre el de tirar, con la munición que queda («Disparar el arco al frente · 6 flechas»). Sin flechas o piedras, el botón lo dice.
- Si hay una presa en la mira, apunta a ella como antes (con su porcentaje). Si no, tira hacia donde mira la cámara: la flecha, la piedra, las boleadoras o la lanza vuelan (más alto si miras hacia arriba) y caen al suelo, donde se pueden recoger.
- El arma que llevas en la mano manda: si tienes arco y honda, dispara la que tengas en la mano.
- Pruebas: grupo Disparar.

## 0.36.1 · Objetos con función y máquinas con ventana

- Se acabó el mensaje «se usa como herramienta al fabricar». Todo lo que tiene uso propio se lleva en la mano desde la barra rápida o la mochila: boleadoras, arco, ballesta, honda, pala, azada, hoz, picos, lanzas, hachas… Se ven en la mano y el aviso dice para qué sirven (por ejemplo, boleadoras: acércate a un animal a menos de 16 m y aparece «Lanzar boleadoras»). Volver a tocarlo lo guarda.
- Lo que es material (rama, piedra, fibra…) o herramienta de trabajo (aguja, cincel…) abre Fabricar con las recetas donde se usa.
- Telar, prensa y fuelle tienen ventana propia, en un panel a la derecha para ver la máquina mientras trabaja. Se cargan materiales (×1, ×5 o todo, hasta 20) y la máquina trabaja sola aunque te alejes; lo hecho queda guardado en la máquina hasta que lo recoges. Barra de progreso, tiempo restante, cancelar (devuelve los materiales) y aviso al terminar. Con la rueda hidráulica, el doble de rápido.
- Animación: el peine del telar golpea, los lizos suben y bajan y la lanzadera cruza la tela; el tornillo de la prensa gira y baja; el fuelle se abre y se cierra cuando fundes o cuando la rueda lo mueve.
- Telar rehecho: dos bastidores, rodillo de urdimbre atrás, rodillo de tela adelante y 16 hilos que van exactamente de uno al otro, con la tela tejida encima (antes los palitos flotaban).
- Pruebas: grupo Mano y máquinas.

## 0.36.0 · Fase 7: mecanismos conectados

- Rueda hidráulica (era 5: 8 troncos, 4 cuerdas, 6 piedras): en la orilla de un río, a menos de 4 m del agua que corre; gira con la corriente. Por un eje de madera (se ve, con postes cada 2,5 m) mueve las máquinas a menos de 8 m: telar, prensa y fuelle trabajan el doble de rápido.
- Noria (era 4: 6 troncos, 4 guaduas, 4 cuerdas, 3 vasijas): rueda con vasijas en la orilla que sube el agua 2,5 m y la vierte en una canaleta. Un canal que toque la noria recibe el agua a esa altura: así se riegan terrenos más altos que el río (el agua sigue sin subir sola).
- Fuelle de cuero (era 5): junto a un horno, las fundiciones tardan 40 % menos; movido por la rueda, 60 % menos.
- Prensa de tornillo (era 5): 6 moras o uchuvas → 2 jugos de fruta (sed +25, hambre +6). Telar (era 4): 6 fibras → 1 tela. Ropa de tela (era 4: 3 telas y 1 cuerda): +5 °C, liviana (0,8 kg).
- Polea de madera (era 4: tronco y 2 cuerdas): sube el pozo a nivel 2 (Gestionar → mejorar): riega con el balde en 5 s en vez de 12 y hasta 16 m en vez de 10.
- Pruebas: grupo Mecanismos (kit, taller completo junto al río, datos).

## 0.35.4 · Girar el canal y escalera arreglada

- Canal: botón «Girar 45°» al construir. Suelto, gira el tramo en pasos de 45° respecto a donde miras. Pegado a otro canal, elige el tramo siguiente: recto, 45° o 90° a la izquierda o a la derecha. Por defecto siempre sigue recto (antes el giro dependía de hacia dónde mirabas y, mirando hacia el canal anterior, se iba de lado). Después de construir vuelve a recto.
- Escalera del cimiento alto: los largueros arrancaban 50 cm más arriba que los peldaños, así que arriba los palitos quedaban sueltos y parecía flotar. Ahora largueros y peldaños van sobre la misma línea, del borde de la base al suelo, y el pasamanos va aparte sobre el borde.
- Pruebas: grupo Canal y escalera.

## 0.35.3 · Cimiento: primero el lugar, después la altura

- Al elegir Base, el fantasma vuelve a moverse normal a ras del suelo y mirar arriba o abajo no lo levanta.
- Primer toque, «Fijar aquí»: el fantasma se queda quieto en ese lugar. Ahí sí, mirar arriba lo sube y mirar abajo lo baja (se detiene en 6 m y en el suelo). Segundo toque, «Colocar»: se construye a esa altura. «Cambiar lugar» suelta el fantasma para buscar otro sitio.
- Una base pegada a otra se coloca de una vez, a la altura de su vecina (no necesita fijar).

## 0.35.2 · Altura del cimiento con la mirada

- Con Base elegida en Construir, mirar hacia arriba sube el cimiento y mirar hacia abajo lo baja, de forma continua (4,5 m por cada radián de giro de la cámara, unos 8 cm por grado). El fantasma se queda quieto en 6 m al seguir mirando arriba y en el suelo al seguir mirando abajo. Mientras cambia, un aviso muestra la altura (máximo y mínimo incluidos).
- El botón de acción muestra la altura y el costo (×materiales); tocarlo vuelve el cimiento al suelo.
- Pruebas: grupo Altura con la mirada.

## 0.35.1 · Arreglo: pantalla gris en iPhone

- Con la opción «Precisión media en sombreadores (experimental)» prendida, el juego cambiaba la precisión solo en la parte de píxeles de cada sombreador. En iPhone eso no se permite: aparecía el error «Precisions of uniform viewMatrix differ between VERTEX and FRAGMENT shaders», los sombreadores no se armaban y la escena quedaba gris.
- La opción se quitó del menú y queda apagada siempre, aunque se hubiera guardado prendida. No hace falta borrar nada: con esta versión el juego vuelve a verse.

## 0.35.0 · El agua solo baja, obra limpia y cimientos altos

- Canales con alturas: cada tramo sigue el terreno (una altura en cada punta) y se ve inclinado. El agua sale al nivel del río o la laguna y nunca sube: el canal puede ir en zanja hasta 1 m bajo el suelo, pero si el terreno queda más de 1 m por encima del nivel del agua que llega, ese tramo y los que siguen quedan secos y, al construirlo, el juego avisa: «el agua no sube». Cuesta abajo el agua baja con el terreno. La huerta solo se riega si el agua del canal llega a su nivel (hasta 1 m de zanja).
- Construir limpia el suelo: el pasto, los helechos, los arbustos y los frailejones que quedan dentro de una base, piso, huerta, corral, canal, pozo o mueble desaparecen (no se dibujan ni se pueden recoger). Al quitar la pieza vuelven a salir.
- Cimientos con altura (desde la 0.35.2 se ajusta mirando hacia arriba o hacia abajo). Las bases vecinas se alinean solas a esa altura: así se hacen casas en zancos o flotantes. Desde 1,3 m de pilotes cada metro más suma 50 % de materiales (a 3 m cuesta ×1,85; a 6 m ×3,35). El cimiento alto trae una escalera de mano hacia donde estás para subir caminando.
- Pruebas: grupo Alturas y obra limpia.

## 0.34.2 · Canales que se unen solos en serie

- Al construir un canal cerca de la punta libre de otro (a menos de 2,4 m de donde iría), el fantasma se pega solo a esa punta: sigue en línea recta o gira 45° o 90° según hacia dónde miras. Las puntas quedan exactamente juntas, así que el agua siempre pasa de un tramo al siguiente.
- Cada punta tiene una unión redonda de guadua (con agua cuando el canal la lleva), para que los tramos y las curvas se vean continuos.
- Pruebas: grupo Canales en serie (arma una serie con curvas desde el agua).

## 0.34.1 · Botón Atrás arreglado en el celular

- El botón Atrás no respondía al tocarlo en el celular: el juego no lo reconocía como parte de la interfaz, tomaba el toque como mover la cámara y bloqueaba el clic. En PC funcionaba porque el ratón no pasa por ese camino. Ahora se reconoce y cierra o vuelve atrás en todas las ventanas.

## 0.34.0 · Fase 6: agricultura y agua

- Azada de piedra (era 2: rama, piedra y cuerda): al sembrar con ella en la mochila prepara la tierra; la huerta da 1 más y está lista 1 día antes. Hoz de pedernal (era 2): al cosechar da 1 semilla más y corta el doble de hierba. Las dos se gastan con el uso.
- Agua limpia o sin filtrar: la cantimplora ahora recuerda de dónde viene el agua. Del río o la laguna sale sin filtrar (puede dar diarrea, como antes). Del colector, del pozo o del filtro sale limpia y no enferma. Antes el agua del colector se volvía riesgosa al pasarla a la cantimplora.
- Filtro de arena y carbón (era 3: vasija, 4 arena, 3 carbón, 2 hierba): junto al agua llena la cantimplora con agua limpia (10 s); lejos del agua limpia la que ya tiene (6 s). Sirve 24 veces y después la arena se tapa.
- Canal de riego (era 3: 1 guadua y 2 piedras): tramo de 2 m de guadua partida sobre estacas, en la dirección en que miras. Tiene agua si una punta toca un río o una laguna, o si toca otro canal con agua: se encadenan desde la orilla. Con agua se ve el agua corriendo por dentro y riega sola la huerta que toca, todos los días.
- Pozo (era 3: 14 piedras, 3 cuerdas y una olla de barro como balde): se cava en el valle o el bosque de niebla, o a menos de 25 m de agua. Brocal de piedra, horcón, rodillo, cuerda y balde. Beber (agua limpia, sed +30), llenar la cantimplora con agua limpia y regar con el balde todas las huertas secas a menos de 10 m (12 s).
- Arreglo: la chimenea y el puente de la 0.32.0 no aparecían en el menú Construir. Ya están, junto con el canal y el pozo.
- Pruebas: grupo Agricultura y agua.

## 0.33.1 · Ventanas con Atrás y piel sin pixelado

- Con cualquier ventana abierta (Mochila, Fabricar, Construir, Mapa, Diario, Estado, Novedades, Pausa) se ocultan la barra de arriba, los vitales, la barra rápida y los controles.
- Todas las ventanas tienen el mismo botón Atrás arriba a la derecha (en PC con la etiqueta Esc). Atrás y Esc vuelven un nivel: de Configuración a Pausa; si no, cierran la ventana. Sin ventana abierta, Esc cierra el panel creativo y, si no está abierto, abre Pausa. Se quitaron los botones Cerrar sueltos de abajo y las X para que no haya dos formas distintas.
- Piel pixelada: venía de las sombras de contacto, que se calculan a media resolución; sobre el cuerpo (brazos, axilas, cuello) quedaban bloques. Ahora el personaje se dibuja después de calcularlas: no recibe sombras de contacto, pero sí la sombra del sol, y su propia sombra sigue cayendo sobre el suelo.
- Pruebas: grupo Ventanas y piel.

## 0.33.0 · Interfaz nueva y modo creativo

- Un solo archivo: ya no hay versión de prueba aparte. Las herramientas de prueba (Ir a, Siguiente, Hora y todas las Pruebas de cada versión) viven en el Modo creativo: Pausa → Modo creativo: sí. Aparece el botón Creativo en la barra de arriba, que abre un panel con todo eso y tres trucos: Inmortal (barras siempre llenas), Construir gratis y Darme materiales. Se recuerda entre partidas. Apagado, el juego queda limpio.
- Vitales nuevos: hora grande, día y clima con ícono; cada barra con ícono, nombre, número y brillo de su color; si baja de 25 % se pone roja y late. Temperatura y carga en dos fichas; los estados (fuego, sangrado, antorcha…) como etiquetas.
- Barra superior: todos los botones juntos en una sola barra de vidrio con íconos (Mochila, Fabricar, Construir, Mapa, Diario, Estado, Novedades, cámara y Pausa). En pantallas angostas solo los íconos.
- Controles táctiles: Saltar, Correr y Agachar como botones de vidrio con ícono, juntos a la derecha; Correr y Agachar se iluminan en dorado cuando están activos. Palanca más limpia.
- Botones de acción verdes con la tecla (E, R, F) en una etiqueta en PC; barra rápida, mensajes en píldora con animación y barra de progreso dorada.
- Pruebas: grupo Interfaz nueva.

## 0.32.5 · Bordes de sombra sin dientes de sierra

- Las sombras del sol tenían bordes en escalera (dientes de sierra). El filtro tomaba 17 muestras de sí o no del mapa de sombras, sin mezclar entre píxeles, así que el borde salía en escalones del tamaño de cada píxel del mapa (3 cm). Ahora se usa un filtro bilineal de 3×3: cada punto mezcla los píxeles vecinos según qué tan cerca está de cada uno, y el borde pasa de sombra a luz de forma continua.
- En el perfil Alto el mapa de sombras sube de 1024 a 2048 píxeles por lado: cada píxel cubre 1,6 cm en vez de 3,1 cm, y la sombra es más nítida sin escalones.
- Pruebas: grupo Bordes de sombra (cambiar entre el filtro suave y el anterior para comparar; datos del mapa).

## 0.32.4 · Agacharse y personaje sin manchas

- Agacharse: botón Agachar (arriba de Correr), tecla X o Z, o el botón de la palanca derecha del mando. Agachado caminas a 45 % de la velocidad, no puedes correr, la cámara baja y el personaje dobla rodillas y se inclina. Los animales te oyen la mitad y te ven 40 % menos: sirve para acercarte a cazar. Saltar, correr o el botón De pie te levantan. El botón se puede mover y cambiar de tamaño en Editar interfaz.
- Manchas raras en el personaje al caminar: venían de las sombras de contacto acumuladas de la 0.32.3. Lo acumulado se guardaba para el punto del mundo y el personaje, que se mueve, heredaba sombras de cuadros anteriores. Ahora lo acumulado no puede salirse del rango de lo que se ve alrededor en el cuadro actual (recorte por vecindad, como el suavizado temporal de los juegos): el pasto sigue estable y el personaje queda limpio.
- Pruebas: grupo Agacharse.

## 0.32.3 · Pasto y hierba sin parpadeo (gráfica al máximo)

- Las sombritas oscuras alrededor de cada mata de pasto, hierba y matorral parpadeaban al caminar. No eran sombras del sol (el pasto no proyecta sombra del sol), sino las sombras de contacto (oclusión en pantalla), que solo están en los perfiles Medio y Alto. Se calculaban con un patrón de ruido pegado a la pantalla: al moverse la cámara, el pasto pasaba por encima del patrón y los halos cambiaban de forma en cada cuadro.
- Ahora se acumulan en el tiempo: cada cuadro se busca dónde estaba ese punto del suelo en el cuadro anterior y se mezcla con lo ya calculado (88 % historia, 12 % nuevo); el ruido gira cada cuadro y se promedia. Si algo tapa o destapa el punto (la profundidad no coincide) se usa solo lo nuevo, para que no queden fantasmas.
- Pruebas: grupo Pasto sin parpadeo (acumulación sí/no para comparar, ver solo las sombras de contacto).

## 0.32.2 · Sombras que no parpadean al caminar

- Las sombras de matorrales, pasto y ramas parpadeaban al moverse. La sombra del sol sigue al jugador, y su posición se redondeaba en los ejes del mundo; pero la cuadrícula del mapa de sombras está girada hacia el sol, así que cada paso la corría una fracción de píxel y los bordes pequeños saltaban. Ahora se redondea en los ejes de la propia luz: la cuadrícula queda fija sobre el suelo al caminar.
- La dirección del sol se actualiza en pasos de 0,5°: antes giraba un poquito en cada cuadro y las sombras temblaban aunque uno estuviera quieto.
- Pruebas: grupo Sombras → medir si la sombra parpadea al caminar (mide el corrimiento en 12 pasos).

## 0.32.1 · Arreglo de imagen: HDR, exposición, oclusión y sombras

- Rayas negras: venían de las sombras de contacto (oclusión en pantalla). Leían la profundidad de un píxel y la posición de otro, así que el piso y las paredes planas se sombreaban solos y aparecía el patrón del ruido en rayas. Se rehízo: muestras alineadas a cada píxel, normal calculada sin cruzar bordes, caída suave con la distancia, ruido en bloques de 4×4 y un desenfoque que respeta los bordes. Ahora solo se oscurecen rincones, esquinas y la base de objetos.
- Exposición automática: medía 64 puntos sueltos de la imagen y saltaba al moverse. Ahora mide toda la imagen, ignora extremos y se adapta más rápido al pasar a la luz que a la sombra, como el ojo.
- Interiores: bajo un techo, un piso superior, un refugio inclinado o la cabaña entra ~70 % menos luz del cielo y de la luz que rebota. Antes el interior se iluminaba como afuera y se veía lavado y amarillo.
- Bordes suaves (MSAA ×4) en la escena HDR para el perfil Alto: antes el HDR dibujaba sin suavizado y los bordes finos parpadeaban en escalera. Se apaga en Pausa → Imagen.
- Techo que desaparecía: estando bajo techo, el techo se ocultaba entero (para ver adentro con la cámara de 3.ª persona) y con él su sombra, así que el sol entraba de lleno y el interior salía amarillo y quemado. Ahora en 1.ª persona el techo se ve, y en 3.ª persona se oculta solo a la cámara pero sigue dando sombra.
- Sombras del sol: sesgo según la normal para que las paredes de lado al sol no salgan con rayas (acné de sombras).
- Pruebas: grupo Luz e imagen (dentro de la casa a mediodía, ver solo la oclusión, MSAA, techos sí/no, datos de exposición).

## 0.32.0 · Construcción con barro, paja y teja (fase 5)

- Revestir (menú Gestionar de cada pieza, con martillo): paredes y puertas de adobe (6 adobes: 50 % más de resistencia y la mitad de desgaste) o de ladrillo (8 ladrillos y 1 de cal: más del doble de resistencia y casi sin desgaste); techos de paja (12 de hierba y 2 cuerdas: no entra lluvia) o de teja (8 tejas: no entra lluvia, más del doble de resistencia, casi sin desgaste). Cada revestimiento se ve distinto.
- Abrigo: un techo de paja suma +2 °C, y una casa cerrada con las 4 paredes revestidas suma otros +2 °C (aparece como «casa de barro o ladrillo»).
- Chimenea (era 3, de piedra y arcilla; nivel 2 de ladrillo con cal desde la era 4): junto a una fogata la lluvia ya no la apaga, gasta 30 % menos leña y calienta más (+15 °C de cerca en vez de +12, y +8 en vez de +6 a media distancia).
- Puente de troncos (era 2, 6 troncos y 4 cuerdas): párate en la orilla mirando al agua y el puente cruza solo hasta la otra orilla (de 4 a 14 m). Se camina encima sin nadar, con barandas de cuerda y pilotes; no se cae al río.
- Pruebas: grupo Construcción (materiales, casa de adobe, ladrillo y teja, río para el puente, fogata para la chimenea).

## 0.31.0 · Personaje nuevo

- Cuerpo humano completo en lugar de tubos y esferas: torso, cuello, hombros, brazos, piernas y pelvis con perfiles torneados (más anchos en el músculo, más finos en codos, rodillas y tobillos).
- Cara: ojos con esclerótica, iris y pupila, párpados que parpadean (más caídos si está cansado), cejas, nariz con aletas y orificios, labios, orejas con pabellón y lóbulo, mandíbula y mentón, y pelo corto.
- Manos con cinco dedos de tres falanges y uñas, y pies con cinco dedos y uñas. Las uñas y los dedos de los pies solo se dibujan si están descubiertos: con botas se ve la bota; con guantes, la mano sin uñas. Cada mano tiene tres poses: relajada, agarre (al llevar herramienta o antorcha) y abierta (al nadar, agacharse o encender fuego).
- Empieza solo con bóxer corto; la camisa o el abrigo se ven cuando te pones ropa en el torso. El equipo dice «Sin camisa», «Bóxer corto» y «Descalzo».
- Animación procedural por capas: marcha con balanceo y giro de cadera, contrarrotación de hombros y cabeza estable; reposo con respiración, cambio de peso, mirar alrededor y parpadeo; talar a dos manos (carga sobre el hombro derecho con giro del tronco, golpe en diagonal con las rodillas flexionadas e impacto); martillar; agacharse; encender fuego arrodillado; frío; antorcha; nado.
- Rendimiento: cada hueso es una sola malla con colores por vértice, así que el personaje entero son unas 20 llamadas de dibujo (como antes).
- Pruebas: grupo Personaje (cámara cerca, botas o descalzo, abrigo o sin camisa, talar, encender fuego, frío, triángulos).

## 0.30.0 · Fuego, cocina y cerámica (fase 4)

- Cerámica por etapas: 1) moldear la arcilla (olla, vasija, 2 tejas o 2 ladrillos con fibra); 2) secar la pieza cruda: sola en un día o en 8 s junto a una fogata encendida («Secar junto al fuego», que también seca la leña); 3) cocerla.
- Cocer en la fogata: la temperatura no es pareja y la pieza puede rajarse (20 a 25 %); si se raja se pierde. Cocer en el horno: casi nunca se raja (3 %) y caben 4 tejas o 4 ladrillos. Los ladrillos solo se cuecen en el horno; secos ya son adobe.
- Vasija de barro: llevarla duplica lo que dura la comida en la mochila. Tejas y ladrillos quedan listos para la fase de construcción.
- Cocina con la olla de barro (la olla no se gasta): sopa de carne y papa (+40 hambre, +20 sed), caldo de hueso (+10 hambre, +25 sed y +8 de salud) y mazamorra de maíz con leche (+30 hambre, +12 sed). Los platos se dañan en 2 días.
- Brasas: junto a una fogata encendida, con la olla de barro, «Llevar brasas en la olla». Durante 2 h enciendes cualquier fogata al instante.
- La olla de barro ya no sale directo de la arcilla: se moldea, se seca y se cuece.
- Pruebas: grupo Cerámica y cocina (arcilla e ingredientes, barro crudo para secar, barro seco con horno y fogata, llevar brasas).

## 0.29.0 · Herramientas y armas (fase 3)

- Armas nuevas: honda (usa piedras, 22 m, 22 de daño, 1 s entre tiros, recuperas 30 % de las piedras), boleadoras (se lanzan hasta 16 m y dejan al animal enredado 8 s sin poder huir; 70 % de las veces las recuperas) y garrote (cuerpo a cuerpo, 22 de daño, se ve en la mano).
- Escudos: de corteza (18 % menos de daño de los animales) y de madera (30 %). Se llevan en la casilla nueva Escudo del equipo puesto.
- Herramientas que trabajan solas con solo llevarlas: aguja de hueso (mejor calidad al coser cuero), cincel (mejor calidad al tallar piedra), raspador (1 cuero más al despiezar), pala de madera (4 de arcilla por lugar en vez de 2) y taladro de arco (el fuego prende en 8 s en vez de 20 y con 20 % más de éxito).
- Mortero de piedra (de granito): desde la mochila muele 2 mazorcas en 1 de harina sin necesitar el molino.
- Lanzas nuevas: endurecida al fuego (solo 2 ramas, junto a la fogata), con punta de hueso y con punta de obsidiana (sale de muy buena calidad). Flechas con punta de hueso.
- La calidad del arma a distancia ahora cambia el daño (de 85 % a 115 %), y los animales enredados reciben más daño.
- Pruebas: grupo Herramientas y armas (kit, materiales, cazar con honda y boleadoras, puma con escudo).

## 0.28.0 · Recolección ampliada (fase 2)

- Árboles sin talar: «Sacar corteza» (cuchillo o hacha, vuelve en 3 días) y, en uno de cada tres árboles, «Recoger resina» (cuchillo, vuelve en 2 días).
- Rocas grandes: «Golpear la roca» con martillo o con una piedra. La roca no desaparece y se puede volver a golpear a los 2 días. Lo que sale depende de la zona: caliza en el valle, piedra y a veces pedernal en el bosque, granito y a veces obsidiana en el páramo, y más obsidiana en la cumbre.
- Cañas bravas en orillas de barro y de río del valle y el bosque («Cortar cañas»). Conchas al recoger arena en la playa del mar. Tendones al despiezar venados, pumas, vacas, cabras y mulas.
- Leña húmeda: la que recoges o talas bajo un aguacero o una tormenta sale húmeda; pesa más y no sirve para fabricar, construir ni el fuego. Se seca sola en un día o en 8 s junto a una fogata encendida (botón «Secar leña»).
- Cada material nuevo tiene propiedades: la obsidiana da el mejor filo pero es frágil, el granito es el más duro, la caliza y las conchas rinden cal, el tendón es el más flexible.
- Recetas nuevas con esos materiales: cuerda de corteza, cuerda de tendón, antorcha de resina (2 por rama), martillo de granito, cuchillo y hacha de obsidiana (salen de mejor calidad), arco con cuerda de tendón, flechas de caña (6 en vez de 5), cal de caliza y cal de conchas.
- Pruebas: grupo Recolección para ir a un árbol, a una roca del páramo o del valle, a una orilla con cañas, poner un aguacero y secar leña.

## 0.27.0 · Fabricación por pasos, calidad y materiales (fase 1)

- Fabricar vuelve a tomar tiempo, ahora con pasos: cada receta usa una técnica (tallar piedra, tallar hueso, trabajar madera, trenzar, tejer, coser cuero, moldear arcilla, cocer al fuego, hornear y fundir, forjar, mezclar, atar) con sus pasos en pantalla, de 3 a 25 s. Hay que quedarse quieto; si te mueves se interrumpe sin gastar materiales.
- Dificultad y error: cada receta tiene dificultad (su era más la de la técnica). Si tu nivel de Fabricación es bajo puede fallar (hasta 35 %); al fallar no se gastan materiales.
- Calidad: las herramientas, armas y objetos con desgaste salen Deficiente, Rudimentaria, Normal, Buena, Excelente o Excepcional según tu nivel, la dificultad, los materiales (el pedernal y el hierro suben la calidad, la piedra común la baja), la herramienta adecuada y la mesa u horno. La calidad cambia los usos que aguanta (de 55 % a 175 %).
- Materiales con propiedades: dureza, flexibilidad, fragilidad, resistencia al fuego y al agua, y facilidad de trabajo, con para qué sirve cada uno. Se ven al tocar el material en la mochila.
- Reparar: las herramientas gastadas se reparan con 1 unidad de su material principal; recuperan todos los usos pero el máximo baja 10 % cada vez. Desmontar: devuelve parte de los materiales (más con más nivel y si está en buen estado, nunca el 100 %); si no hay espacio no se pierde nada.
- Fabricar varios: ×5 o Máx encadena los objetos uno tras otro mientras sigas quieto.
- Buscadores: en la mochila y en la pantalla de fabricación (por nombre de objeto o de material).
- Pruebas: grupo Fabricación por pasos (materiales, calidad prevista por nivel, hacha gastada para reparar o desmontar, terminar ya, ver materiales y técnicas).

## 0.26.2 · Fabricar al instante y mochila al doble

- Todo se fabrica al instante, también en el horno y junto al fuego (antes 12 a 15 s quieto). Fabricar varios de una vez ahora funciona con todas las recetas.
- Mochila al doble: 24 casillas (antes 12) y 40 con la mochila de fibra (antes 20). Las partidas guardadas se amplían solas al cargar.
- La resolución ya no se usa para optimizar: el ajuste automático baja el trazado de rayos y, si hace falta, el perfil, pero la resolución solo cambia si la eliges tú. Los perfiles tampoco limitan la densidad de píxeles.
- El medidor de rendimiento se oculta mientras hay un menú abierto (antes tapaba la mochila).

## 0.26.1 · Límite de cuadros elegible

- En Pausa → Configuración → Rendimiento se elige el límite de cuadros por segundo: 30, 60, 120 o sin límite. Por defecto: 30 en Ultra bajo y Bajo, sin límite en Medio y Alto.
- 120 solo se alcanza en pantallas de 120 Hz y si el navegador lo permite (Safari en iPhone suele limitar a 60).
- El ajuste automático de calidad usa umbrales según el límite elegido, y el medidor muestra el límite (por ejemplo «FPS 58/60»).
- Pruebas: en el grupo Rendimiento Android, opciones para cada límite.

## 0.26.0 · Optimización para Android

- Perfiles de rendimiento: al arrancar el juego lee el chip gráfico (Adreno, Mali, Apple…), la memoria y los núcleos, mide el procesador con una prueba corta y elige Ultra bajo, Bajo, Medio o Alto. Alto es el juego de siempre (el iPhone queda igual). Se cambia en Pausa → Configuración → Rendimiento.
- Ultra bajo y Bajo dibujan la escena una sola vez: sin HDR, sombras de contacto, resplandor ni trazado de rayos. Distancia de vegetación 70 o 95 m (antes 150) con más neblina, terreno con menos triángulos, pasto y helechos apagados o reducidos, texturas a un cuarto o a la mitad, máximo 5 o 7 animales y 6 o 10 sonidos a la vez. Ultra bajo sin sombras; Bajo recalcula las sombras cada 3 cuadros.
- Giro de la cámara: el recorte «Dibujar solo lo que se ve» ya no se rehace en cada cuadro mientras giras (cada 450 ms en Ultra bajo, 250 en Bajo, 90 en Medio), usa un cono más ancho para que no aparezcan cosas tarde, no copia la cámara y solo sube a la tarjeta gráfica lo que quedó visible.
- Límite de 30 cuadros por segundo en Ultra bajo y Bajo (estables, menos calor). El ajuste automático usa umbrales de 26 y 29 con el límite, y si la resolución ya está al mínimo y los cuadros siguen bajos baja un perfil solo (calentamiento).
- Medidor en pantalla (arriba al centro): cuadros por segundo, perfil, resolución, luz, HDR, sombras, tiempo del recorte, llamadas de dibujo y triángulos. Visible por defecto en Ultra bajo y Bajo.
- Interfaz: el panel de barras solo se reescribe si cambió. Pantalla de carga con consejos y pistas de las notas, y el perfil y chip detectados.
- Precisión media en sombreadores: opción experimental (apagada por defecto) porque en chips Mali puede verse granulado. Distancia, terreno, texturas, sonidos, suavizado y precisión se aplican al recargar (botón «Guardar partida y recargar»).
- Pruebas: grupo Rendimiento Android para detectar el celular, elegir cada perfil, el medidor, el límite de 30, simular calentamiento, ver los datos del recorte y recargar.

## 0.25.0 · Era 7: química primitiva

- Se abre con Fabricación 7 (700 objetos fabricados) y desde el día 70.
- Horno: carbón vegetal (2 troncos → 3), cal (piedra calcinada), vidrio (arena de playa o de orilla, con cal) y alcohol destilado de maíz. Mesa: frascos de vidrio, lupa y pólvora (salitre, carbón y guano). Fuego: conserva de carne en frasco y jabón (cal y grasa).
- Arena: en playas y orillas de arena aparece «Recoger: Arena» (3 por lugar, vuelve al día siguiente).
- Usos: la lupa enciende la fogata al instante con sol (8 a 16 h, sin nubes). El alcohol desinfecta: quita la infección y la fiebre baja a 2 h. El jabón da 2 días con la mitad del riesgo de intoxicarte y +6 de ánimo. La pólvora vuela una roca grande: 6 piedras, 2 de pedernal y a veces mineral de hierro. La cal encala bases, paredes, puertas, techos, pisos, escaleras, horno, mesa y molino (Gestionar): se desgastan la mitad y resisten 20 % más.
- La comida ahora se daña en la mochila: carne cruda 2 días, leche 2, carne asada, frutas y arepas 4, huevos 6, carne ahumada 12, papas y mazorcas 20. Se convierte en comida podrida. Las conservas en frasco no se dañan; la mochila dice cuántos días dura cada cosa.
- Pruebas: grupo Era 7 para abrirla con materiales, mesa y horno con fogata, ir a la playa por arena, usar la lupa, volar una roca, curar una infección con alcohol y ver la comida dañarse.

## 0.24.0 · Era 6: mecánica artesanal

- Fabricación sube ahora hasta el nivel 8. La era 6 se abre con Fabricación 6 (480 objetos fabricados) y desde el día 40; las eras 7 y 8 piden además los días 70 y 100.
- Mesa de trabajo: rueda de madera con aro de hierro, carretilla (llevarla suma 20 kg de carga), polea, ballesta, pedernal y acero, alforjas y montura. A mano: arco y flechas (5 por receta, con punta de pedernal y plumas).
- Arco: tiros hasta 30 m, 40 de daño, 1,2 s entre tiros. Ballesta: hasta 40 m, 70 de daño, 4 s de recarga y más puntería. La mitad de las flechas se recupera. Se dispara con el botón «Disparar» apuntando con la cámara.
- Pedernal y acero: la fogata se enciende en 2 s y siempre prende (antes 20 s frotando palos).
- Mula: con alforjas y una mula que te sigue a menos de 20 m llevas 40 kg más. Con montura puedes montarla: 5 m/s al paso y 8 m/s al galope; si entras al agua te bajas.
- Molino de agua (Construir ▸ Taller): va en la orilla, a menos de 8 m de un río; muele 2 mazorcas en 3 de harina de maíz. Con 2 de harina junto al fuego haces una arepa (+26 de hambre).
- Pruebas: grupo Era 6 para abrirla con materiales, probar arco y ballesta con venados, la mula con montura y alforjas, el molino junto a un río, el pedernal y la carretilla.

## 0.23.0 · Clima en rachas y fauna viva

- Clima procedural (fase 5): el tiempo llega en rachas de 2 a 6 días que salen de la semilla del mundo: tiempo normal, veranillo, días lluviosos, neblina persistente y frente frío; desde el día 20 también sequía, helada larga y temporal (nunca dos seguidas). Reemplaza el ciclo fijo de temporadas duras de antes.
- Cada racha cambia la probabilidad de cada tiempo, la temperatura, los incendios (4 veces más en sequía), las crecientes (casi seguras con aguacero en un temporal) y las manadas. El día antes se nota una señal («las nubes se cargan sobre las montañas…») y el Diario muestra la racha actual y, cuando hay señal, la que viene.
- Fauna: cada especie tiene una abundancia. Cada animal que matas la baja 12 % (mínimo 25 %) y se recupera 5 % por día; con pocos animales aparecen menos. Además migran: en sequía los venados bajan al valle cerca del agua y en lluvias suben al bosque; con frío los pumas bajan al bosque; con neblina hay más guaguas. El Diario muestra si están escasos, normales o abundantes.
- Cantimplora: se llena en ríos, lagos y el mar también nadando, desde orillas más altas, o tocándola en la barra rápida cerca del agua.
- Choza de pastores: muro de 2,25 a 2,6 m, puerta de dos tramos con dintel y techo más alto: se entra caminando.
- Texturas: las de hojas y ramas ya no se deslizan cuando el viento las mueve, y el detalle del suelo se desvanece mucho más lejos (150 a 260 m) para que no se note un borde moviéndose.

## 0.22.0 · Lugares procedurales y fibra de las plantas

- Lugares hechos por reglas (fase 4 del plan): cada región de 600 m puede tener unas ruinas de piedra (1 a 3 cuartos con muros caídos, escombros y a veces una columna), un campamento abandonado (carpa, a veces caída, círculo de piedras, troncos para sentarse, cajas y un letrero) o una choza de pastores en el páramo (muro redondo de piedra con techo de paja entero o hundido). Cada uno es distinto según su semilla.
- Cada lugar tiene botín de 2 o 3 objetos según su tipo (pedernal, huesos, sal y semillas en las ruinas; cuerda, carne ahumada, antorchas y cuero en los campamentos; cuero, papas y sal en las chozas). Aparecen en el mapa (ocre si no los has revisado, gris si ya) y en la lista de lugares del Diario. Tienen choques y el terreno se aplana debajo.
- La fibra ya no está suelta en el suelo: sale de las plantas. La cabuya (fique) es una roseta de hojas largas: al arrancar da 2 o 3 de fibra (una más con cuchillo) y rebrota. Los arbustos sin fruta también dan 1 de fibra de su corteza (2 con cuchillo).
- Luz: la exposición automática ya no aclara la imagen más de lo normal (solo la oscurece cuando hay demasiada luz), el brillo objetivo es más bajo y el resplandor solo aparece en luces muy fuertes.
- Pruebas: grupo Lugares, fibra y luz para ir a cada tipo de lugar, ver cuántos hay y buscar una cabuya.

## 0.21.0 · Menús nuevos, buceo y desembocaduras

- Menús rediseñados: paneles con cabecera fija y botón ✕, pestañas, tarjetas y barras. Cada objeto (58) y cada pieza de construcción (23) tiene un ícono dibujado por código.
- Mochila: cuadrícula con íconos, cantidad y barra de desgaste; pestañas Materiales, Comida, Herramientas, Ropa y Animales; panel con lo que hace cada objeto y para qué recetas sirve; doble toque para usar; Mover (toca otra casilla: intercambia o junta montones); Ordenar (junta montones y ordena por tipo); asignar a la barra rápida 1 a 4 con un toque; equipo puesto con íconos.
- Fabricar, mesa de trabajo y horno: pestaña «Puedo hacer» con lo que ya alcanza, pestañas por era, materiales con ícono y cantidad que tienes y que faltan, y botones ×5 y Máx para fabricar varios seguidos.
- Construir: piezas en tarjetas con dibujo, pestañas Casa, Vivir, Taller y Granja, y materiales por nivel en verde o rojo. La caja de almacenamiento y la barra rápida también usan íconos.
- Desembocaduras: se quitó el ensanche de la 0.20.0 (se veía como un parche claro sobre el mar); ahora solo en los últimos ~25 m el color del río pasa al del mar o el lago.
- Nado más rápido (1,9 m/s; 3 m/s rápido). Buceo con la cámara: mira hacia abajo y avanza para hundirte, hacia arriba para subir; quieto mantienes la profundidad. La cámara en tercera persona ya no se pega al personaje al nadar.
- PC: después del primer clic el ratón mueve la cámara sin mantener el clic (Esc lo suelta; se puede apagar en Configuración).
- Imagen: las sombras de contacto se calculan a media resolución y se suavizan (menos granulado) y las hojas ya no muestran el dibujo de grietas de roca.

## 0.20.0 · HDR, sombras de contacto y desembocaduras suaves

- HDR: la escena se dibuja con 16 bits por canal y una exposición automática ajusta el brillo como el ojo: baja en la playa y a pleno sol (ya no queda la imagen lavada) y sube en el bosque. Mapa de tonos ACES y resplandor suave en lo muy brillante. Si el aparato no puede, se usa la imagen de antes sin errores.
- Sombras de contacto: oclusión ambiental en pantalla (8 muestras por píxel con la profundidad) que oscurece rincones, la base de troncos, rocas y arbustos hasta 70 m. Se suma a la oclusión del relieve y a la luz que rebota que ya existían.
- Relieve en las texturas del suelo: la luz del sol se calcula sobre la pendiente de la textura (grietas de la roca, matas del pasto, ondas de la arena), más marcado con el sol bajo.
- Dibujar solo lo que se ve: árboles, arbustos, rocas, pasto y helechos fuera de la vista ya no se envían a la tarjeta gráfica (en las pruebas se dibuja cerca de la mitad); lo cercano siempre se dibuja para no perder sombras.
- Desembocaduras: en los últimos 90 m el río se ensancha, pierde profundidad y su agua se vuelve transparente poco a poco hasta fundirse con el lago o el mar; las orillas son más tendidas y la franja de barro o arena llega más lejos del agua.
- Animales: velocidades de huida más reales (venado 8 m/s, conejo 6,5, puma 7,5, vaca 5, gallina 4).
- Pantalla de carga: si algo falla al iniciar, ahora se muestra el motivo en vez de quedarse quieta; Three.js se descarga de un segundo servidor si el primero no responde y los pasos de carga ya no dependen de la animación del navegador.
- Configuración y Pruebas: opciones para HDR, exposición, sombras de contacto, resplandor, relieve y recorte por vista.

## 0.19.0 · Animales procedurales y ríos que sí llegan

- Animales hechos por reglas: un solo constructor arma cuerpo (pecho, vientre y cadera), cuello, cabeza, hocico, orejas, ojos, cola, cuernos o astas y cuatro patas con rodilla y pezuña. Cada especie es una tabla de números (largo, grosor, alto de patas, cuello, cabeza, colores y patrón del pelaje).
- Pelaje con lomo y vientre de distinto color, vetas suaves y patrones: manchas de la vaca, parches de la cabra y el cuy, puntos blancos de la guagua. Venados con y sin astas, cabras con barba y cuernos curvos, mula con crin, gallinas blancas, rojizas o negras.
- Tres variantes por especie y cada animal con su propia escala, así ninguno es igual a otro.
- Las patas se mueven al caminar: trote en diagonal, galope cuando corren, salto con las patas juntas en conejo y cuy, y paso alterno en la gallina. Los animales de crianza usan los mismos modelos.
- Ríos: se revisaron los 1131 finales de río. Antes 108 llegaban al lago con un escalón de agua, 11 quedaban separados por una barra de tierra y 45 morían a pocos metros del agua; ahora el cauce sigue la pendiente o se prolonga hasta entrar al lago o al mar, y en los últimos 45 m su nivel baja hasta el del lago. Quedan 3 casos raros.
- Ríos: el nivel del agua ahora sigue el relieve fino (antes salía de celdas de 96 m), así ya no hay ríos que corren por encima de una loma como un acueducto; si hay un umbral, el cauce lo corta hasta 4 m.
- Pruebas: grupo Animales y ríos con galería de todas las especies y variantes, ver venados, pumas, conejos, vacas y gallinas caminando, comparar con los animales antiguos y datos.

## 0.18.0 · Pasto, helechos y pantalla de carga

- Pasto: matas de 9 hojas alrededor tuyo (28 m) que toman el color exacto del suelo donde nacen, se mecen con el viento y se encogen suavemente en el borde para que no aparezcan de golpe. No crece en agua, arena, guijarros ni laderas empinadas; en el páramo es más alto (pajonal).
- Helechos procedurales en el bosque de niebla y junto a quebradas y suelos húmedos, con hojas arqueadas.
- Pantalla de carga: antes de empezar se generan las texturas y los modelos, se calcula el relieve con ríos, lagos y mar, se construye el terreno cercano, se suben las texturas y se compilan todos los sombreadores. Así no hay tirones al empezar a caminar ni al ver algo por primera vez.
- Optimización: los árboles y arbustos lejanos usan 2 variantes en vez de 4 y la palma lejana comparte su modelo medio (menos mallas y llamadas de dibujo); la especie de cada árbol se guarda en vez de recalcularse; el pasto guarda cada celda calculada y al caminar solo copia posiciones.
- Arreglo: en la 0.16.0 y la 0.17.0 el detalle fino de la textura del suelo solo funcionaba cerca del origen del mapa (la cámara no llegaba al sombreador de esos materiales); ahora se ve en todo el mundo. La clasificación del suelo (pasto, roca, arena) se calcula por vértice en vez de por píxel.
- Pruebas: grupo Pasto, helechos y carga (encender/apagar, distancia del pasto, datos, tiempos de la carga y repetir la carga).

## 0.17.0 · Modelos 3D procedurales

- Árboles hechos por reglas: el tronco se divide en ramas y cada rama en ramas más finas, con largo, ángulo, grosor y curvatura de cada especie; las hojas son racimos en las puntas, más oscuros por debajo. Cada especie es una tabla de números, sin modelos dibujados a mano.
- Tres árboles según la altura: árbol del valle de copa ancha, roble andino alto y oscuro con musgo en el tronco, y palma de cera (más de 10 m, tallo claro y hojas arqueadas) en la franja media del bosque.
- Frailejones con tallo cubierto de hojas secas, roseta de hojas plateadas y a veces varas con flores amarillas; arbustos con la misma regla de ramas; rocas con relieve propio y musgo en algunas.
- Cuatro variantes de cada especie según la semilla, giradas y escaladas. Tres niveles de detalle: modelo completo hasta 35 m, simplificado hasta 90 m y copa de dos racimos más lejos.
- Las sombras de copa siguen la forma real de cada variante y el árbol que talas cae con la misma forma que tenía en pie.
- Pruebas: grupo Modelos 3D procedurales con galería de todas las variantes, ir a cada especie, comparar con los modelos antiguos, distancia de detalle, regenerar variantes y datos.

## 0.16.0 · Texturas procedurales

- Todo el detalle de superficie se genera con código al iniciar, sin imágenes: un solo generador (ruido, fBm y celdas) y recetas por material.
- Suelo: el pasto tiene grano fino y matas; la roca tiene placas con grietas oscuras; la arena tiene ondas. La textura sigue las coordenadas del mundo, así no se estira, y en las laderas empinadas la roca se proyecta desde tres lados para no deformarse.
- Cada tipo de suelo se elige solo según el color y la pendiente que ya tenía el terreno, por eso las orillas, la playa y el páramo conservan sus colores y ganan textura.
- Se mezclan dos escalas de la misma textura y una variación grande cada ~270 m para que no se note la repetición.
- Árboles, arbustos y frailejones: corteza con vetas verticales y hojas con manchas. Rocas sueltas y derrumbes: textura de roca.
- Agua: textura nueva con vetas alargadas en el sentido de la corriente; la espuma de los rápidos sale de esas vetas.
- Pruebas: grupo Texturas procedurales para encenderlas o apagarlas, cambiar intensidad y tamaño, ver los canales, regenerar con otra semilla y ver los datos.

## 0.15.0 · Sonido procedural: música con motivo y efectos nuevos

- Música adaptativa nueva, hecha por código: un motivo de cuatro notas (re, fa, mi, la) que cambia de carácter según lo que pasa. Soledad: flauta sola con silencios largos. Peligro: latido de bombo, notas graves cortas y un mi bemol que choca. Esperanza: rasgueo de cuerdas en acordes mayores y un final que sube y resuelve. Misterio: el motivo al revés sobre tonos enteros, con eco, campana y soplo.
- La música lee el estado del juego: la noche, la niebla, las cuevas y el Bosque de niebla traen misterio; el puma, el granizo, la creciente, el incendio y la salud baja traen peligro; el día con buena salud, hambre y sed, el fuego cerca y el techo traen esperanza; y la soledad queda de fondo. Con tormenta, durmiendo o bajo el agua no hay música.
- Los cambios de música entran solo al inicio de un compás (72 pulsos por minuto). El peligro entra enseguida con un golpe de bombo y se retira en unos siete compases; las demás sensaciones suben y bajan en tres a cinco. Un bordón en re sirve de ancla a todas y el motivo reaparece cada cierto tiempo, con una variación distinta cada vez.
- Pasos por capas: roce de la ropa, impacto del talón, crujido del suelo y punta del pie. Cada suelo suena distinto (arena y nieve con muchos granitos, hojarasca crujiente, madera con tonos que se apagan, barro con burbujas) y cada paso cambia un poco en tono, volumen y filtro. Al correr, la punta cae más tarde que el talón.
- Golpes por material: chasquido, cuerpo y resonancia. La carne suena sorda, la madera hueca con tres tonos, la piedra seca y dura y el metal con cuatro tonos de proporciones no exactas. Se usan en el hacha, el pico, el martillo, la lanza clavada y los golpes del combate.
- Fuego vivo: el rugido grave titila despacio y los chasquidos son clics desiguales, con algún estallido de leña de vez en cuando.
- Pruebas: en el menú de pruebas, el grupo Sonido procedural (0.15.0) permite oír cada sensación de la música por separado, una mezcla, el estado actual, caminar, correr, los golpes y el fuego.

## 0.14.0 · Los ríos de nuevo: hidrología completa

- Red de ríos calculada a partir del relieve: el agua baja por la pendiente, se junta en afluentes y confluencias, serpentea y termina en un lago o en el mar. Es determinista: la misma semilla da los mismos ríos.
- Cauces tallados en el terreno: el lecho queda por debajo de las orillas, con un borde alto pequeño en cada margen y un escalón suave; el agua sigue el cauce sin quedar flotando y los ríos se ensanchan y se angostan.
- Cuatro tipos de agua: cristalina de montaña, limpia de bosque, turbia (marrón) y de pantano; se mezclan suavemente entre un tramo y otro. Rápidos con espuma y chispas, tramos calmos con vetas de espuma.
- Lagos con cuenca y orilla de contorno irregular (se dibujan con el contorno exacto); las lagunas pequeñas ya no son huecos sueltos. El nivel de cada lago es estable.
- Mar abierto: la costa se coloca por la semilla; hay playa de arena, llanura suave, fondo marino, olas y un nivel del mar fijo. Más allá se ve el mar hasta el horizonte. Los ríos que llegan al mar desembocan sin escalones.
- Orillas: arena, barro, guijarros y suelo mojado según el tramo, con la franja más ancha en la parte interior de las curvas; sin árboles ni objetos en la playa.
- Pruebas: grupo Hidrología con ir a quebrada, río grande, rápido, confluencia, lago, desembocadura, playa y mar adentro, creciente, regenerar con otros parámetros y apagar.
- Límite conocido: el mundo es de cuencas cerradas, por eso pocos ríos llegan al mar; la mayoría termina en lagos. Fuera de 19 km del inicio no hay ríos.

## 0.13.1 · Música compuesta y más capas de sonido

- Música de día en ritmo de bambuco (6/8): cada pieza se compone al momento con un motivo de 2 compases que se desarrolla en frases de 4 compases con cadencias (media cadencia en la dominante y cierre en la tónica), forma A, A variada, B más aguda y A final. Tonalidad menor andina (La, Si, Re o Mi menor) y progresiones como i–VII–VI–V, i–iv–VII–V o i–III–VII–V.
- Instrumentos nuevos: quena con adornos (apoyatura, escalón de entrada, trino y caída final), zampoña con voces paralelas más graves, charango con trémolo en las notas largas, tiple y guitarra con rasgueo y bajo de bambuco, bombo y maracas en la segunda vuelta. Humanización: pequeñas variaciones de tiempo y volumen.
- Atardecer: arpegios lentos con colchón de cuerdas; la quena entra en la segunda vuelta y la pieza cierra en un acorde de tónica con campana. Noche: bordón grave, campanas, quena lejana y racimos de campanillas. Con un puma cerca, el bombo se acompaña de maracas y un bordón disonante.
- Efectos: los pasos suenan con talón y punta, más roce de ropa; hojas que se agitan y crujidos de árboles con viento en el bosque de niebla; insectos de día en el valle. Cada instrumento usa una sola voz por acorde, así la música deja más voces libres para los efectos.
- Pruebas: las piezas de música del grupo Sonido ahora usan la composición nueva, y Oír aves incluye hojas, crujido e insectos.

## 0.13.0 · Sonido completo

- Todo el sonido se sintetiza en el aparato con Web Audio, sin archivos de audio: pesa casi nada y no se descarga nada. Máximo 16 voces a la vez; si hay más, se descartan primero las menos importantes (la música cede ante un golpe o un rugido).
- Música (suena cerca del 40 % del tiempo, con silencios largos entre piezas): de día, flauta andina y tiple punteado en escala menor pentatónica; al atardecer, acordes arpegiados con colchón de cuerdas; de noche, notas graves y campanas lejanas; si un puma acecha o ataca cerca, bombo y bordón que suben con la cercanía. No hay música en tormenta ni aguacero, en cuevas, bajo el agua, durmiendo ni muerto. Cada pieza se compone al momento (la melodía cambia cada vez).
- Ambiente que reacciona al mundo: viento por zona y clima, lluvia en tres capas (gotas, goteo en hojas y rumor grave) que se apaga bajo techo y bajo el dosel del bosque, quebrada con más o menos fuerza según la velocidad de la corriente y desde el lado donde está, orilla de lago más suave, fuego con crepitar que se acerca o se aleja, grillos de noche, cuevas con zumbido grave, goteras y murciélagos, creciente, granizo e incendio.
- Aves de seis especies (más activas al amanecer), halcón en el páramo, ranas cerca del agua de noche, búho, gallo al amanecer en el valle, ráfagas de viento y crujidos del bosque; todo se coloca a la izquierda o a la derecha según dónde esté y se apaga con la distancia y detrás de ti.
- Truenos con retraso real según la distancia (un rayo lejano suena varios segundos después del relámpago; uno cercano, casi de inmediato, con un chasquido seco y un zumbido breve en los oídos). Derrumbes, temblores y manadas tienen su propio retumbar.
- Pasos que cambian con el suelo (hierba, paja, hojarasca, tierra, arena, roca, barro, madera, nieve y agua), con la velocidad y con las botas; salto y caída según la altura; nado, buceo con burbujas; respiración agitada al correr o con poca energía, latido cuando estás muy herido o cerca de un puma, escalofríos con frío, tos si estás enfermo, ruido de estómago con hambre y ronquidos al dormir.
- Efectos de todo lo que haces: recoger objetos según el material (madera, piedra, planta, metal, tela, comida, líquido, hueso), hacha, pico, martillo, cuchillo, lanza, lazos y jaulas, encender y apagar fuego, asar, ahumar, cavar, sembrar, verter y llenar, fabricar, construir (distinto en los niveles 1, 2 y 3) y desmontar, vestirse y equipar, árboles que caen y rocas que ruedan.
- Fauna con voz: cuy, gallina, cabra, vaca, mula, venado, puma (gruñido, rugido y bufido), serpiente de cascabel y pasos de pezuñas; cada sonido tiene de 3 a 5 variaciones, así que nunca se repite igual.
- Interfaz: clic, pestañas, abrir y cerrar ventanas, error, aceptar, papel al leer notas, guardar y logros.
- Configuración > Sonido: volumen general y de música, ambiente, efectos e interfaz, cada categoría con su interruptor, y un botón para probar. Se guarda en el aparato.
- Aviso: el audio empieza con el primer toque en la pantalla (regla de iPhone y Android) y en iPhone el interruptor lateral de silencio apaga los sonidos de la página; si no oyes nada, revísalo y sube el volumen.
- Pruebas: grupo Sonido (0.13.0) con un botón para oír cada familia de sonidos, cada tipo de música, el bombo de peligro, tormenta de noche, amanecer y un diagnóstico del audio.

## 0.12.1 · Suelo exacto, pies, resbalón y reflejos

- El suelo es uno solo: la malla que ves. Antes la física y los objetos usaban un relieve ligeramente distinto (media 8 cm, hasta 2 m en riscos). Ahora pasos, árboles, objetos, gotas, cámara y pies usan exactamente la superficie dibujada, triángulo por triángulo.
- Pies exactos: cada pie se apoya en el suelo real (también pisos y escaleras): la pelvis sube o baja lo justo, la pierna se estira o dobla con cinemática inversa de dos huesos y la suela se inclina para quedar paralela a la ladera. Ya no se hunden 5 cm en el suelo plano ni atraviesan las laderas.
- Resbalón: en pendientes de más de 40° el personaje se desliza cuesta abajo, cada vez más rápido (hasta 9 m/s), no puede subir y se detiene al llegar a terreno más suave. Si resbalas por un risco, cuenta la caída como siempre.
- Reflejos del agua: el trazado leía el relieve sin suavizar (de ahí los bloques) y arrancaba a 3 m, así que la orilla cercana no se reflejaba. Ahora lee con interpolación, arranca a 70 cm, refina el punto de impacto y los reflejos de objetos (calidad alta) tienen más resolución.
- Pruebas: grupo Suelo, pies, resbalón y reflejos (0.12.1).

## 0.12.0 · Dificultad, logros y temporadas duras

- Dificultad (Pausa, Configuración, Juego): Fácil (hambre y sed ×0,7, el puma hace 30 % menos de daño), Normal (como siempre) y Extremo (hambre y sed ×1,3, el puma hace 30 % más de daño y aparece un segundo puma). En Extremo solo se guarda al dormir y morir borra la partida y empieza una montaña nueva. Extremo no se puede bajar. La elección se recuerda y se guarda con la partida.
- Temporadas duras desde el día 30, cada 15 días y de 5 días: sequía dura (casi sin lluvia, +2 °C y sed ×1,3), helada larga (−5 °C y 50 % diario de helada sobre las huertas sin antorcha de poste ni fogata cerca) y temporal de lluvias (lluvia y tormentas casi sin parar, −2 °C). Se anuncian al empezar y acabar, y se ven en la pantalla (junto al clima) y en Estado (próxima en N días).
- Logros (se ven en el Diario y se guardan en este navegador aunque cambies de montaña): Primera noche, Fuego propio, Cazador, Herrero, Techo seguro, Pies de páramo, Agricultor, Sobreviviente (7 días), Montañero (30), Leyenda (100), Uno con la montaña (365), Guardián de la montaña (día 30 sin matar un puma), Sin rasguños (10 días sin heridas), Curtido (una temporada dura completa) y Ganadero (Crianza nivel 2). Al ganar uno sale un aviso.
- Pruebas: grupo Dificultad, logros y temporadas duras (0.12.0).

## 0.11.1 · Murciélagos en las cuevas

- Animales en las cuevas: de 4 a 9 murciélagos por cueva, colgados del techo (con preferencia cerca del guano). Se asustan si te acercas (más con la antorcha encendida o corriendo) y con los temblores: vuelan por la cueva unos 7 a 14 s y vuelven a colgarse. No hacen daño.
- Pruebas: grupo Cuevas con murciélagos (0.11.1).

## 0.11.0 · Crianza de animales

- Animales nuevos en el campo: cuy y gallina en el valle, cabra en el bosque de niebla y el páramo, vaca y mula en el valle. Se pueden cazar como los demás.
- Jaula trampa (era 2: 8 ramas y 3 cuerdas): se arma en el suelo, con o sin hierba de cebo, y atrapa vivos cuyes, gallinas y conejos cuando te alejas más de 6 m. Los sacas con Sacar vivo.
- Cabra, vaca y mula no caben en jaula: acércate despacio con hierba y pulsa Ofrecer hierba (3, 4 y 5 veces). Cuando confían en ti, te siguen.
- Cortar hierba: acción en el valle, el bosque de niebla y el páramo cuando tienes algo de crianza (cerca, jaula, animales o corral).
- Gallinero (era 2), corral de 6 × 6 m (era 3) y corral grande con establo de 8 × 8 m (era 4), con cerca que sí detiene. Se ponen con la puerta hacia ti. Bebedero y comedero (era 3) a menos de 7 m amplían las reservas de agua (6 a 18) y comida (6 a 22).
- Menú del corral (Atender): dar hierba o mazorca, dar agua con la cantimplora, limpiar (da estiércol), recoger productos, cepillar, curar con cataplasma, llevar conmigo, soltar y sacrificar. Un animal que te sigue se mete al corral con Meter al corral.
- Cada día cada animal come y bebe. Alimentado: gana 10 de confianza. Sin comer: pierde 20, no produce y a los 3 días se escapa o muere. Con 60 de confianza produce: huevos (gallina), leche (cabra, vaca) o estiércol (cuy, conejo, mula); a 100 produce uno más. Con dos animales de la misma especie y 60 de confianza hay 25 % de cría diaria.
- Suciedad: tras 5 días sin limpiar, cada animal tiene 20 % diario de enfermar y se pierde confianza hasta que lo curas con cataplasma. Los corrales sin techo atraen al puma de noche salvo que haya una antorcha de poste encendida o una fogata a menos de 8 m.
- Habilidad Crianza (se ve en el Diario): nivel 5 duplica la confianza ganada y permite mellizos.
- Pruebas: grupo Crianza de animales (0.11.0).

## 0.10.2 · Menús de mesa y horno, pausa, interfaz editable y arreglos

- Mesa de trabajo y horno con su propio menú: junto a la mesa aparece Usar la mesa de trabajo, con el abrigo, las pieles y las herramientas de piedra fina y de hierro; junto al horno, Usar el horno de fundición, con el lingote. El botón Fabricar del principio ya solo muestra lo que se hace con las manos, así que construir una mesa tiene sentido. Se quitan los botones de la 0.10.1.
- Menú de pausa (botón Pausa arriba a la derecha o la tecla Esc): Continuar, Guardar, Cargar, Configuración, Editar interfaz, Pantalla completa, Novedades y Nueva montaña (pide confirmar). Guardar, Cargar, Nueva montaña y Pantalla completa salieron de la pantalla.
- Configuración: calidad de luz y sombras (apagado, bajo, medio, alto), cada efecto por separado (sombras de montañas, oclusión, reflejos del agua, luces con sombras, sombras de árboles, reflejo de objetos, luz que rebota), resolución (máxima a mínima), ajuste automático de rendimiento que se puede apagar, sensibilidad de la cámara, primera persona e interfaz. Todo se recuerda al volver a abrir el juego.
- Editor de interfaz: arrastra Saltar, Correr, los botones de acción y la barra rápida donde quieras, cambia el tamaño de Saltar y Correr e invierte los lados (palanca a la derecha y botones a la izquierda). El botón Correr ahora empieza del lado de la palanca. Se guarda solo.
- La palanca ya no se arrastra por la pantalla: aparece donde apoyas el dedo y se queda fija ahí; el pulgar solo se mueve dentro del círculo.
- Energía: ya no se gasta mientras descansas quieto más de 3 s y se recupera 10 por hora de juego (15 junto a un fuego, +3 bajo refugio). Antes el gasto base era mayor que la recuperación y nunca subía.
- El personaje salta más alto desde el inicio (unos 0,8 m en vez de 0,5 m).
- Ríos: ahora nacen afinándose desde un manantial en vez de aparecer cortados a mitad de ladera. Las quebradas pueden cambiar un poco de forma en los mapas guardados.
- Colisiones: las alas, la cola y la nariz de la avioneta ya no se atraviesan.
- Primera persona: ya no se ve el cuerpo; solo el brazo y lo que llevas en la mano.
- Bajo el agua: la cámara ya no salta ni sale del agua al bucear, y el cambio de nivel es suave.
- Pies en desnivel: al pararte en una pendiente el cuerpo baja hacia el pie más bajo y el otro pie se dobla para no meterse en el suelo.
- Agujero negro visual en el cielo, hacia el sur y a unos 20° sobre el horizonte, con disco de acreción y anillo de luz. No hace nada, es solo decorativo.
- Derrumbes más peligrosos: caen 14 rocas en vez de 7, más grandes y más rápidas, hasta 70 de daño por golpe, y ocurren más seguido en laderas de 30° o más con lluvia fuerte (y rara vez en laderas muy empinadas sin lluvia).
- Temblor más largo: tras el aviso dura unos 48 s de juego con sacudida continua. Las casas de materiales básicos (nivel 1) se caen, las de nivel 2 pueden perder piezas y las de piedra se agrietan. Si el techo de una casa se cae contigo debajo, recibes daño. En laderas pueden caer rocas.
- Pruebas: grupo Menús, arreglos y temblor (0.10.2).

## 0.10.1 · Mesa y horno con botón propio

- Al acercarte a la mesa de fabricación aparece el botón Fabricar en la mesa, que abre el menú con las recetas que piden mesa. Al acercarte al horno aparece Fundir lingote: si falta algo (mineral, troncos, Fabricación 5 o haber explorado la mina) te dice qué.

## 0.10.0 · Eras 3 a 5: barro, hierro, ropa y huerta

- Fabricar muestra las cinco eras (Piedra tosca, Hueso y cuero, Barro y piedra fina, Troncos y piedra, Hierro primitivo). Cada nivel de Fabricación abre una era; la construcción de nivel 2 se abre en la era 3 y la de nivel 3 en la era 4 (la puerta de nivel 2 en la era 2). Las piezas bloqueadas muestran con qué nivel se abren.
- Mesa de fabricación (Construir, era 3): el abrigo, las pieles, las herramientas de piedra fina y las de hierro se hacen a menos de 3 m de ella.
- Arcilla y plumas en el suelo del valle y el bosque de niebla. La arcilla se cava con el palo cavador (2 por vez). Olla de barro: se cuece 10 s junto a una fogata encendida y sirve para el colector de lluvia.
- Piedra fina: hacha (tala en 4 s, 120 golpes, 30 de daño) y pico de piedra fina (100 usos).
- Hierro: veta de hierro nueva en las cuevas, que se abre con pico y da 2 de mineral; horno de fundición (era 4: 10 piedras y 4 arcillas) que con 2 troncos de combustible funde 3 de mineral en un lingote (30 s). Con lingotes se hacen el hacha de hierro (tala en 3 s, 200 golpes, 38 de daño), la lanza de hierro (55 de daño de cerca, 82 lanzada, 150 usos) y la puerta reforzada. La era 5 se abre al explorar la mina abandonada.
- Herramientas por nivel: se usa siempre la mejor que lleves. El tiempo de tala ahora depende del hacha (6, 4 o 3 s) y ya no de tu nivel de Fabricación.
- Ropa: ropa de cuero (+8 °C), abrigo de cuero y fibra (+12), pieles completas (+16), botas de cuero (la serpiente hace la mitad de daño y a veces no envenena) y mochila de fibra (20 casillas en vez de 12; desde la 0.26.2, 40 en vez de 24). Se visten desde la Mochila, se quitan en Equipo puesto y se ven en el cuerpo.
- Estante para ahumar (era 3): convierte 4 carnes crudas en carne ahumada (+28 de hambre) en 30 s, con una fogata encendida a menos de 4 m.
- Huerta (era 4, valle o bosque de niebla, a menos de 45 m de una de tus bases): papa lista en 5 días (3 a 5 papas) y maíz en 8 días (2 mazorcas). Necesita lluvia o riego con la cantimplora cada 2 días: si pasan 4 días sin agua se seca. Abonar con guano o estiércol acorta 2 días y suma 1 unidad. En la temporada seca, las noches claras del bosque alto pueden traer helada; una antorcha de poste encendida o una fogata a menos de 6 m protege el cultivo. Al cosechar recuperas semillas.
- Mejoras de Pruebas: menú Eras 3 a 5, hierro y huerta. Ir a: arcilla y pluma. La crianza de animales llega en la 0.10.1.

## 0.9.2 · Reflejos reparados e iluminación global

- Reflejos del agua arreglados: la cámara no llegaba al cálculo del reflejo (error de la librería gráfica con este tipo de material), por eso el agua se veía lisa; ahora se reflejan montañas, árboles, cielo y sol, con más reflejo al mirar de lejos y menos al mirar desde arriba
- Iluminación global propia tipo Lumen (calidad media y alta): la luz del sol que rebota en el suelo y las laderas iluminadas vuelve a las zonas en sombra con el color del terreno, verde del pasto, café de la roca y blanco de la nieve; ya no hay sombras negras planas
- Varios rebotes: cada actualización del mapa de luz usa el rebote anterior como fuente, así la luz se reparte más lejos y suave
- El rebote se calcula en un mapa pequeño de 128 por 128 al terminar cada mapa de luz, sin costo por cuadro; se apaga solo en cuevas, de noche y en calidad baja
- Pruebas: nuevo grupo Reflejos e iluminación global (rebote sí o no, rebote exagerado para verlo, laguna a media tarde, valle a media tarde)

## 0.9.1 · Trazado de rayos completo

- Sombras de árboles: cada árbol que ves tiene una copa con altura real en un mapa de copas (copa y tronco) y los rayos del sol la atraviesan: el suelo del bosque queda a la sombra con bordes suaves y se mueve con la hora, y las copas altas reciben sol aunque el suelo esté oscuro
- Reflejos en el agua con árboles: lagunas y quebradas reflejan también las copas de los árboles cercanos (ya no solo el terreno y el cielo)
- Reflejo de objetos (calidad alta): el jugador, las casas, los animales y los árboles cercanos se reflejan en el agua con un reflejo real del mundo; en calidad media sigue el reflejo por rayos de terreno, árboles y cielo
- Luz de fogatas, antorchas y fogones de construcción con rayos también fuera de las cuevas: la luz se calcula por píxel, ilumina según la forma del terreno y las paredes y las lomas le hacen sombra; antes era luz por vértice sin sombras
- Sombras cercanas ampliadas: el área con sombra detallada del jugador, las casas y los animales pasa de 12 m a 20 m (media) y 32 m (alta) con mejor resolución
- Las normales de los objetos con instancias (árboles, rocas) ahora giran con cada ejemplar, así la luz de las fogatas los ilumina bien
- Rendimiento: el mapa de copas se rehace solo al moverte unos 20 m o al talar; el reflejo de objetos solo se dibuja si hay agua a la vista y baja solo si no se llega a 48 cuadros por segundo
- Pruebas: nuevo grupo Trazado completo (sombras de árboles, reflejo de objetos, sombras cercanas, bosque a media tarde, fogata de noche, orilla con árboles, costo)

## 0.9.0 · Trazado de rayos propio

- Motor de trazado de rayos hecho a medida para este mundo, sin tarjeta especial: el relieve se guarda como un mapa de alturas en la tarjeta gráfica (dos mapas, uno fino de 512 m alrededor tuyo y otro de 4 km) y desde él se lanzan rayos por cada punto del suelo
- Sombras de montañas: al amanecer y al atardecer las cordilleras tapan el sol de verdad, con sombras largas y bordes suaves que se acortan con la hora. Se recalculan solo cuando el sol se mueve o tú te alejas
- Oclusión ambiental: los valles, quebradas y pies de ladera reciben menos luz del cielo que las lomas, y eso se nota en el suelo, los árboles y las rocas
- Reflejos en el agua: lagunas y quebradas reflejan el cielo, las montañas lejanas (con su color por altura y su niebla) y el brillo del sol sobre las olas; el reflejo se hace más fuerte al mirar casi horizontal
- Antorcha en cuevas con rayos: la luz sale de tu mano, rebota en cada pared y proyecta sombras detrás de las esquinas y los pilares (ya no es luz por vértices); la luz no atraviesa paredes ni el techo
- Rendimiento: el cálculo se reparte en varios cuadros y solo se rehace cuando hace falta. Si la pantalla baja de 48 cuadros por segundo con la resolución ya al mínimo, el juego baja solo la calidad del trazado (alto, medio, bajo) y la vuelve a subir cuando sobra margen
- Pruebas: nuevo grupo Trazado de rayos (encender o apagar, calidad, sombras, oclusión, agua, antorcha, mapa de luz, costo, amanecer en el páramo, atardecer en el bosque, laguna al mediodía y cueva con antorcha)

## 0.8.0 · Mundo abierto

- Se acabó la isla: el mundo es abierto y se genera al caminar, hasta 80 km en cada dirección desde el inicio (160 km de lado). El terreno es suave, no de cubos: montañas, valles, páramos y cumbres con formas distintas en cada rumbo, con las mismas cuatro zonas de altura
- Cada partida empieza en un valle plano y seco que el juego busca por todo el mapa. La avioneta cae ahí y la cabaña del campesino (bosque de niebla) y la mina (páramo) siguen estando a unos 500 a 900 m, alcanzables a pie
- Cuevas en lugares al azar: no hay un número fijo, aparecen más o menos una cada 700 m en el bosque de niebla y el páramo, cada una con su propio laberinto, recursos, temblores y nota. Las que descubres quedan en el mapa y en Lugares
- Lagunas, quebradas y vegetación varían por región: las quebradas solo corren a alturas medias, las lagunas ocupan terreno casi plano, y hay comarcas húmedas con más árboles (y más frailejones en el páramo) y comarcas secas con más matorral y rocas
- Mapa sin bordes: se centra en ti, se va dibujando al explorar y muestra los km² explorados. Los marcadores y lugares funcionan igual. Al llegar a los 80 km el juego avisa del borde del mundo
- Rendimiento: el relieve lejano se genera en segundo plano y sigue al jugador sin tirones; solo se mantiene lo que está cerca. Los objetos soltados lejos se quedan quietos hasta que vuelves
- Las partidas guardadas de versiones anteriores no se pueden cargar porque el mundo es otro
- Pruebas: nuevo grupo Mundo abierto (dónde estoy, volver al inicio, cueva más cercana, contar cuevas y lagunas, viajar 3 o 20 km, borde del mundo, revelar mapa)

## 0.7.0 · Fase 5 · entrega 2 · cuevas

- Hasta 4 cuevas por montaña: dos en el bosque de niebla y dos en el páramo, siempre alcanzables a pie. Se ven como una boca negra entre rocas; al caminar hacia ella entras, y al volver hacia la entrada del fondo sales. Aparecen en el mapa, en Lugares y en el menú Ir a
- Cada cueva es un laberinto distinto de 30 a 150 m: pasillos anchos, salones altos, ramales sin salida y tramos angostos. En un tramo angosto solo pasas si cargas menos del 60 % de tu peso máximo; si no, te lo dice y debes dejar carga a la entrada
- Oscuridad total: sin antorcha no ves nada (la antorcha dura 1 hora y alumbra unos 20 m). Dentro hace 10 °C constantes, no llueve ni hay eventos del clima ni animales, y no se puede construir
- Recursos nuevos: salitre, sal de roca, pedernal (piedra fina) y guano en los salones (se vuelven a formar a los 5 días) y agua limpia que gotea de la roca para beber sin riesgo
- Temblores: cada 1 a 3 minutos la cueva cruje durante 3 s y caen 5 rocas del techo con la misma física de los derrumbes; en los pasillos angostos hay menos riesgo que en los salones altos
- Una nota de un buscador de salitre en el fondo de cada cueva (4 notas más, 16 en total) con pistas sobre el salitre, el pedernal y el guano
- Pruebas: nuevo grupo para ir a cada cueva, entrar directo, ir al fondo, provocar un temblor y darme los recursos. Aún no hay animales en las cuevas ni sonido de eco y goteo (el juego todavía no tiene audio)

## 0.6.2 · Física de rocas y empujones

- Los derrumbes ya no son un cálculo: tras el aviso de 5 s caen 7 rocas reales desde la ladera de arriba. Caen con la gravedad, rebotan, ruedan por la pendiente y se frenan en el agua. Esquivarlas depende de dónde estés y hacia dónde corran; si una te alcanza, el daño depende de su velocidad (hasta 45, con 1,5 s de respiro entre golpes)
- Las rocas rápidas dañan las piezas construidas que golpean (según su velocidad) y empujan los objetos del suelo
- Los objetos sueltos se empujan caminando contra ellos: salen rodando o deslizándose según su forma
- Pruebas: nuevo grupo con derrumbe en una ladera empinada (te deja al pie de ella) y empujar objetos

## 0.6.1 · Gravedad y agua que corre

- Los objetos que sueltas desde la Mochila ya no desaparecen: salen despedidos, caen con la gravedad (9,8 m/s²), rebotan y ruedan cuesta abajo (piedras, troncos, guaduas y ramas ruedan fácil; hojas y fibra se quedan donde caen). Se recogen con Recoger y se guardan con la partida (máximo 60; el más viejo se pierde)
- Al caer al agua, la madera, las ramas, las hojas y la guadua flotan y la corriente se las lleva río abajo; las piedras y lo pesado se hunden y quedan en el fondo
- Los ríos tienen corriente: el agua corre por la pendiente hacia abajo, de 0,5 m/s en tramos suaves hasta 2,4 m/s en tramos empinados. Te arrastra al nadar y te empuja al vadear con el agua sobre las rodillas, así que cruzar a favor es fácil y contra la corriente cuesta
- Espuma que baja con el agua, gotas que saltan en los tramos empinados y caen por gravedad, y salpicaduras al caer de cierta altura al agua
- Los muebles (camas, cajas, postes) caen hasta el suelo o el piso inferior cuando se derrumba lo que los sostenía, y se dañan según la altura
- Pruebas: nuevo grupo con soltar objetos, ir a un río con corriente, ir a una cascada y medir la corriente

## 0.6.0 · Construcción estilo ARK y primera persona

- Primera persona: botón 1.ª persona (tecla V) pone la cámara a la altura de los ojos, con mira en el centro. El cuerpo gira hacia donde miras, la tala, la pesca y el martillo funcionan igual y se recuerda tu elección. Por ahora no se dibujan las manos ni la herramienta en pantalla. Al construir, la pieza se apunta con la mira
- Bases niveladas: la primera base se coloca a la altura del punto más alto de su casilla, con pilotes hasta el suelo. Las bases vecinas se alinean automáticamente a la misma altura (se encajan en la cuadrícula de 3 m) y alargan los pilotes hasta 4 m; ya no quedan escalones ni paredes desniveladas. Si el suelo sobresale más de 1 m o los pilotes pasarían de 4 m, la vista previa roja dice por qué
- Construir hacia arriba: nuevas piezas Piso superior y Escalera, cada una en 3 niveles de material. El piso se apoya en paredes del nivel de abajo (o se extiende una casilla desde otro piso apoyado), sirve de techo plano abajo y de suelo arriba, y se pisa de verdad. La escalera sube 2,4 m hacia donde miras y necesita un piso al frente; deja el hueco encima. Hasta 3 pisos sobre el suelo
- Las paredes, puertas, techos inclinados y muebles se colocan en el piso donde estás parado. Pisos y escaleras se desgastan, se reparan, se mejoran y se desmontan como las demás piezas; si quitas un apoyo, cae lo que dependía de él
- El refugio y la lluvia distinguen pisos: bajo un piso superior estás cubierto; arriba, solo si hay techo
- Pruebas: nuevo grupo con alternar primera persona, kit de materiales, ir a una ladera para probar la nivelación y una casa de 2 pisos con escalera

## 0.5.1 · Pantalla y ventana

- La ventana del juego ocupa siempre toda la pantalla del navegador y se redimensiona sola al girar el teléfono, cambiar el tamaño de la ventana o abrir y cerrar las barras del navegador. Respeta el área segura de iPhone (muesca y barra inferior)
- Botón Pantalla completa (arriba a la derecha): activa y desactiva el modo de pantalla completa y, en el teléfono, intenta bloquear la orientación horizontal. En iPhone Safari no permite pantalla completa de una página: usa Compartir y Añadir a pantalla de inicio y el juego se abre sin barras
- En pantallas bajas (teléfono horizontal) los botones Mochila, Fabricar, Estado y Novedades pasan arriba para no tapar los controles táctiles
- Se quitó el encabezado de texto que se veía encima del juego y el rebote al arrastrar la página: el arrastre solo controla el juego

## 0.5.0 · Fase 5 · entrega 1

- Construcción instantánea: al elegir la pieza y pulsar Colocar, aparece al momento, sin espera ni quedarte quieto. Cuesta los mismos materiales; el menú Construir ya no muestra segundos
- Tres lugares clave, siempre alcanzables a pie y en el mismo sitio para una misma montaña: los restos de la avioneta (valle alto, junto al inicio, quemados y sin objetos útiles), la cabaña del campesino (bosque de niebla) y la mina abandonada (páramo). El terreno se nivela alrededor y no crecen árboles encima
- Cabaña del campesino: tiene techo y chimenea, así que te cubre de la lluvia. Al registrarla encuentras una olla de barro, 4 semillas de papa y 4 de maíz (las semillas servirán al llegar el cultivo)
- Mina abandonada: bocamina tapada por un derrumbe, rieles y vagoneta. Al registrarla encuentras 3 de mineral de hierro y un pico viejo (se usarán en la era del hierro). Todavía no se puede entrar: las cuevas llegan en la siguiente entrega
- Doce notas de papel repartidas por los tres lugares: 4 del piloto, 4 de don Aurelio y 4 de los mineros. Se leen con el botón Leer, cuentan la historia en tono sobrio y dan pistas de supervivencia. Un destello amarillo marca las que no has leído
- Botón Diario (tecla J): días sobrevividos, habilidades, lugares descubiertos, notas encontradas (se pueden releer), animales vistos y plantas y recursos identificados
- Botón Mapa (tecla M): dibujado sobre papel, se revela solo al explorar (unos 110 m alrededor). Muestra lagunas, quebradas, zonas, lugares descubiertos y tu posición con la dirección. Tocar el mapa pone o quita un marcador propio (hasta 12)
- Ir a... ahora incluye Lugares clave y Nota sin leer más cercana. Pruebas: nuevo grupo Mundo vivo (0.5.0) para ir a cada lugar, leer todas las notas, revelar u ocultar el mapa y borrar el diario
- El guardado (versión 9) incluye notas, lugares, mapa y marcadores; las partidas anteriores se cargan sin ellos

## 0.4.3 · Fase 4 · entrega 3

- Fase 4 completa. Construcción de nivel 3 (piedra y troncos) para base, pared, puerta y techo: resistencia de 900, 800, 600 y 700 puntos, 40 s por pieza y desgaste de solo 1 por día. No se quema en un incendio. Se llega mejorando desde el nivel 2 en Gestionar
- Colector de lluvia (4 ramas, 6 hojas y 1 olla): junta 1 sorbo por hora de lluvia, hasta 8, de agua limpia sin riesgo de diarrea. Bebes de él o llenas la cantimplora. La olla de guadua (2 guaduas y 3 fibras, con cuchillo) es provisional hasta la arcilla de la fase 5
- Eventos aleatorios, cada uno con aviso previo en pantalla: creciente súbita del río (agua turbia y estruendo; el río sube 1,5 m en 18 s, arrastra piezas y fogatas de la orilla y a ti si estás en el agua; baja cuando pasa la tormenta); granizada (en el páramo y la cumbre con tormenta: 10 de salud por hora sin techo ni árbol); derrumbe (aguacero en ladera de más de 35°: aléjate 7 m en 5 s o pierdes 60); temblor (los animales se inquietan 30 s antes; la tierra tiembla y las piezas de nivel 3 pierden 50); manada de venados; incendio forestal en temporada seca (humo y niebla naranja 10 s antes; el fuego avanza 1 m/s en anillo, quema a 12 de salud por segundo y destruye piezas de nivel 1 y 2; la lluvia lo apaga)
- Los ríos del mundo suben y bajan de verdad: nadar, beber y los choques usan el nivel nuevo del agua
- Pruebas: grupo «Nuevo en 0.4.3 · nivel 3, colector y eventos» para disparar cada evento al instante, casa de nivel 3, colector bajo aguacero e ir a la quebrada

## 0.4.2 · Fase 4 · entrega 2b

- Herramientas en la mano: hacha, martillo, lanza, cuchillo y palo se equipan desde la Mochila (botón Equipar en la mano) o tocándolas en la barra rápida; tocar otra vez la guarda. El personaje las lleva en la mano derecha y aparecen en Equipo puesto
- Talar exige el hacha en la mano (si la llevas en la mochila se equipa sola al empezar). El personaje la levanta y golpea el árbol en ciclos de 1,7 s, inclinando el cuerpo; al terminar el árbol cae hacia el lado contrario a ti
- Construir equipa el martillo y lo golpea en ciclos de 0,9 s; despiezar equipa el cuchillo
- Combate: el arma que llevas en la mano pega primero (martillo 18 de daño, palo 8; lanza 35, hacha 25, cuchillo 15 como antes). Si se rompe o la sueltas, la mano queda vacía
- Pruebas: grupo «Nuevo en 0.4.2 · herramientas» con kit de herramientas, equipar y guardar, y árbol al frente

## 0.4.1 · Fase 4 · entrega 2

- Talar: con el hacha, el botón Talar árbol (6 s) derriba un árbol y da de 3 a 5 troncos y 2 ramas. El árbol no rebrota. Nuevo objeto: tronco (3 kg, 5 por casilla)
- Botón Construir (tecla B) con 11 piezas. Eliges la pieza, caminas y miras donde quieres ponerla: un contorno verde indica que cabe y uno rojo dice por qué no. Construir pide el martillo, los materiales y quedarte quieto 6 a 20 s
- Estructura en celdas de 3 × 3 m: base (se nivela en pendientes de hasta 25°), pared (en el borde de una base), puerta (nivel 2), techo (necesita base y 2 paredes). Nivel 1: ramas, hojas y cuerda. Nivel 2: troncos, cuerda y fibra, con el triple de resistencia
- Las paredes y la puerta bloquean el paso; la base eleva el suelo. Con 4 paredes y una puerta el refugio queda cerrado: +8 °C, el puma no se acerca y la lluvia no te moja. Con techo y 2 paredes: +4 °C. El techo de nivel 1 deja pasar 30 % de la lluvia y el de nivel 2 nada
- Piezas sueltas: refugio inclinado (sin base), cama de hojas, cama de cuero, caja de almacenamiento (16 casillas), tendedero (seca la ropa en 20 s junto a una fogata), antorcha de poste (luz de noche y aleja al puma 8 m; 12 h por rama) y fogata con techo (la lluvia no la apaga)
- Dormir en una cama: el reloj corre x10 y la energía sube 8 por hora al aire libre, 12 bajo techo y 15 en cama de cuero. Te despiertas al llenar la energía, con hambre o sed, con dolor, si te mueves o si hay un puma cerca. Al despertar se guarda la partida
- Gestionar: cerca de una pieza, el botón Gestionar permite reparar (25 puntos por unidad del material principal), mejorar de nivel 1 a 2 o desmontar (devuelve el 50 %). Si quitas un apoyo, caen las piezas que dependían de él
- Desgaste diario: nivel 1 pierde 10 puntos por día (20 si llovió), nivel 2 pierde 3. Una pieza sin resistencia se derrumba. Los rayos del páramo y la cumbre buscan la pieza más alta
- Pruebas: grupo «Nuevo en 0.4.1 · construcción» con kit de herramientas, casas automáticas de nivel 1 y 2, construir sin gastar materiales, dormir, desgaste, aguacero nocturno, puma y tormenta en el páramo

## 0.4.0 · Fase 4 · entrega 1

- Fase 3 cerrada: caza, puma, serpiente, heridas, esquiva, lazos y ánimo
- Seis climas que se sortean cada 6 horas con transición de 20 minutos: despejado (+3 °C; de 11 a 15 h la sed baja 25 % más rápido), nublado, niebla (−1 °C; visión corta y los animales te detectan 40 % más tarde), llovizna (−2 °C; ropa mojada en 30 min), aguacero (−4 °C; ropa mojada en 5 min) y tormenta eléctrica (−5 °C)
- Temporadas: el año dura 48 días con dos secas y dos lluvias de 12 días, empezando en seca. En lluvias la llovizna, el aguacero y la niebla son más probables; en seca, el despejado
- Lluvia visible, cielo y luz que se oscurecen, niebla densa y aviso antes de un aguacero o una tormenta
- Bajo un árbol te mojas 60 % menos; mojado, el cuerpo pierde 8 °C de sensación térmica hasta que te seques junto al fuego
- El aguacero y la tormenta apagan las fogatas sin árbol cerca; la llovizna las gasta al doble
- Correr bajo aguacero o tormenta: 5 % por segundo de resbalar (3 de daño y 1 s en el suelo)
- Tormenta: cada 10 a 24 s cae un rayo. En bosque, páramo y cumbre, si eres lo más alto en 50 m (sin árboles a la vista, o nadando) hay 50 % de que te caiga: 40 de daño. Refúgiate bajo los árboles
- Estado y barras muestran clima y temporada; Pruebas con los seis climas, temporadas, rayo y mojarse

## 0.3.2 · Fase 3 · entrega 3

- Esquiva: el puma se agazapa 0,5 s antes de saltar y la serpiente tarda 0,4 s en morder. Salta (o aléjate más de 3 m del puma) para esquivar: no hay daño, sube la Agilidad y el ánimo
- Combo: golpes seguidos en menos de 1,3 s suben el daño 15 % cada uno (hasta ×1,45). Cada golpe cuesta 2 de energía y sin energía pegas al 60 %
- Aviso de golpe: la pantalla se enrojece al recibir daño
- Lazo con cebo: arma el lazo en el suelo con una mora o uchuva de cebo. Los conejos y las guaguas tranquilos a menos de 25 m se acercan solos y quedan atrapados (80 % con cebo, 35 % sin él). Recoge el lazo para recuperarlo. Solo funciona con animales a menos de 130 m de ti; el venado lo ignora
- Los lazos se guardan con la partida
- Ánimo con consecuencias: comer carne asada +6, cazar una presa +4, cazar un puma +10, esquivar +3, atrapar con lazo +5; una mordida grave −6. Animado (70 o más) da puntería ×1,05 y velocidad ×1,1; decaído (menos de 30) puntería ×0,85 y velocidad ×0,85
- Menú Pruebas con lazos, conejos, ánimo y práctica de esquiva; Ir a lazo más cercano

## 0.3.1 · Fase 3 · entrega 2

- Puma (Bosque de niebla y páramo, de noche y al anochecer, desde el día 2): te acecha despacio, ataca a 10 m/s, muerde con 18 de daño y sangrado y se retira 5 s antes de volver. No cruza el agua y le teme al fuego y a la antorcha. Si lo hieres mucho huye; si no te alcanza en 15 s se rinde
- Serpiente (valle y bosque, de día): inmóvil entre la hierba, avisa con un siseo a 3 m y muerde si te quedas a menos de 1,4 m (5 de daño, veneno 4 de salud por hora durante 8 h)
- Heridas: sangrado leve (2 de salud por hora, se corta solo a las 3 h) y grave (6 por hora, no para sin venda). Una herida sin vendar 5 h se infecta: fiebre 16 h, 1,5 de salud por hora
- Venda (3 fibras y 1 hoja grande): detiene el sangrado y acelera el cierre de la herida
- Matico: nueva planta en el valle y el bosque. Cataplasma de matico (2 matico y 1 hoja grande): cura fiebre e infección, cierra la herida, reduce el veneno a la mitad y da 8 de salud
- Muertes nuevas: desangrado, veneno e infección
- Menú Pruebas con puma, serpiente, heridas, venda y matico; Estado y barras muestran sangrado, veneno y fiebre

## 0.3.0 · Fase 3 · entrega 1

- Fase 2 cerrada: se puede sobrevivir 3 días y morir de hambre, sed o frío (comprobado con simulación)
- Fauna: conejo (de día), guagua (de noche) y venado (al amanecer y al atardecer) aparecen cerca de ti en el valle y el bosque de niebla
- Sentidos: ven en un cono al frente y oyen en todas direcciones. Quieto te ven menos; el ruido sube con la velocidad (inclina poco la palanca para acercarte sin que te oigan); de noche ven menos
- Huyen al notarte: el conejo en zigzag a 9 m/s y el venado a 12 m/s; el animal herido también huye
- Atacar de cerca con lanza (35), hacha (25), cuchillo (15) o puños (4); el golpe vale doble si el animal no te ha notado
- Lanzar la lanza de piedra hasta 18 m hacia donde mira la cámara: 52 de daño; la precisión sube con la Puntería y baja con la distancia
- Despiezar con cuchillo (quieto 3 s, el venado 6 s): carne cruda, cuero y hueso según la presa
- Asar carne junto a una fogata encendida: +20 de hambre. La carne cruda da +8 pero 40 % de intoxicación (vomitas: −15 hambre, −15 sed, −10 energía)
- Tercer botón de acción (tecla F en teclado) y barra de progreso al despiezar o asar
- Menú Pruebas con opciones de caza; Ir a animal vivo o presa muerta; el Diagnóstico muestra el estado de los animales

## 0.2.3 · Fase 2 · entrega 3

- Natación: en agua de más de 1,3 m el personaje nada en la superficie con brazada y patada
- Nadar va a 1 m/s (1,6 m/s con Correr) y gasta el doble de energía; entrena la Resistencia
- Bucear: botón para sumergirse y subir; oxígeno de 20 s (hasta 40 s con Resistencia 100); sin oxígeno pierdes 10 de salud por segundo
- Con más de la mitad de la carga máxima te hundes poco a poco; sin energía también
- El agua del páramo y la cumbre enfría 1 °C por hora de nado
- Las orillas casi verticales no se pueden trepar desde el agua
- Barra de oxígeno y aviso Nadando en pantalla
- Corregido: los menús ya se desplazan con el dedo y tienen barra de desplazamiento visible que también se puede arrastrar
- Menú Pruebas con opciones de natación

## 0.2.2 · Fase 2 · entrega 3

- Fabricación, fogata, antorcha, agua y cantimplora

## 0.2.1 · Fase 2 · entrega 2

- Recolección, mochila, peso y barra rápida

## 0.2.0 · Fase 2 · entrega 1

- Estadísticas, temperatura, muerte y atributos

## 0.1.x · Fase 1

- Mundo, agua, vegetación, día y noche, cuerpo y controles

## 0.0.x · Fase 0

- Cimientos, controles y guardado
