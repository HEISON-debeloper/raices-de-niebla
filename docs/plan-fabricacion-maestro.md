# Raíces de Niebla · Plan del sistema de fabricación (prompt maestro)

Actualizado: 2026-11-04. Origen: prompt maestro de supervivencia primitiva (32 secciones, 14 fases).

## Enlace para jugar (desde la 0.36.2)

- El juego está publicado como página en https://claude.ai/artifact/FoXaX2PdPPHa2fhgeQG1Va. Cada versión nueva se publica en ese mismo enlace (Artifact con `url`), así que quien lo abra siempre tiene la última. La página es privada: se comparte desde el menú Compartir de la página.

## Decisiones tomadas

- **Tiempo de fabricación:** como dice el prompt, con pasos, tiempo, dificultad y posibilidad de error. Esto reemplaza la fabricación al instante de la 0.26.2.
- **Catálogo:** unas 250 recetas útiles en lugar de 1.000. El juego es un solo HTML y el proyecto tiene un límite de 2 millones de caracteres.
- **Eras:** se mantienen las 8 eras del juego. El cobre y el bronce entran antes del hierro.
- **Ritmo:** una fase por versión; cada fase se integra y se prueba antes de pasar a la siguiente.

## Diagnóstico inicial (0.26.2)

Un solo HTML con Three.js r128. Objetos (`ITEMS`) y recetas (`RECIPES`) son datos: unos 80 objetos, 45 recetas en 7 eras y 24 piezas de construcción.

Lo que ya había:
- fabricación a mano, en mesa, horno y fogata, con niveles de Fabricación, eras y días;
- construcción por piezas con soporte, desgaste por clima, reparar y desmontar;
- huerta, crianza, caza con lanza, arco y ballesta, y molino de agua;
- fuego con combustible, cocina, enfermedades, comida que se daña y guardado con migración.

## Fases

| Fase | Versión | Estado |
|---|---|---|
| Base: materiales con propiedades, técnicas con pasos y tiempo, dificultad, error sin pérdida, calidad, reparar, desmontar, buscadores | 0.27.0 | Hecha |
| Recolección ampliada: obsidiana, granito, caliza, corteza, resina, tendones, conchas, cañas; madera húmeda y seca | 0.28.0 | Hecha |
| Herramientas y armas: variantes de sílex, obsidiana y hueso; honda, boleadoras, garrote, escudos (el arpón pasa a la fase de pesca) | 0.29.0 | Hecha |
| Fuego, cocina y cerámica por etapas: amasar, secar y cocer; ollas, vasijas, tejas y hornos | 0.30.0 | Hecha |
| Construcción ampliada: barro, paja, teja, ladrillo, chimenea, puentes (torres pendientes) | 0.32.0 | Hecha |
| Agricultura y agua: azada, hoz, filtros, canales, pozo, riego | 0.34.0 | Hecha |
| Mecanismos conectados: polea, prensa, fuelle, telar, noria y rueda hidráulica | 0.36.0 | Hecha |
| Ropa, decoración e instrumentos | — | Pendiente |
| Descubrimiento de recetas y cobre y bronce | — | Pendiente |
| Animaciones, sonidos y partículas por técnica | — | Pendiente |

## Arquitectura de la 0.27.0

- `MAT`: propiedades de 21 materiales (dureza, flexibilidad, fragilidad, resistencia al fuego y al agua, facilidad de trabajo, calidad y uso).
- `TECH`: 12 técnicas, cada una con pasos, tiempo base, dificultad, herramienta que ayuda y forma de fallar.
- `tecOf(r)` asigna la técnica de cada receta según sus materiales; `r.tec` permite fijarla a mano.
- `recMeta(r)` calcula tiempo, dificultad y calidad de los materiales, y guarda el resultado.
- Calidad: 6 niveles. Multiplica los usos de 0,55× a 1,75×. Se guarda en cada objeto (`q`, `dmax`) y no cambia el formato de guardado.

## Fase 2 (0.28.0)

- Acciones nuevas en el mundo: sacar corteza, recoger resina, golpear la roca, cortar cañas y secar leña.
  - Usan la lista `GATH` y se agregan a `BKS`, que es la lista de acciones que maneja el módulo de construcción.
  - Cada lugar queda marcado con una clave en `st.taken` (`co`, `re`, `rk` o `ca`) para que lo recolectado vuelva solo con los días.
- La roca da material según la zona: caliza en el valle, piedra y a veces pedernal en el bosque, granito y 20 % de obsidiana en el páramo, y 40 % de obsidiana en la cumbre.
- Leña húmeda: la que se recoge o se tala bajo aguacero o tormenta sale como `rama_h` o `tronco_h`. Se seca en `newDay` o con la acción de secar junto a una fogata.
- 10 recetas nuevas con `nm`, el nombre propio de la receta cuando el objeto que se fabrica ya existe.

## Fase 3 (0.29.0)

- Armas a distancia como datos en `RW`, cada una con munición, alcance, daño, recarga, puntería y recuperación. Por ahora son el arco, la ballesta y la honda; `rangedW()` elige la mejor que tengas con munición.
- Las boleadoras usan la acción `bola`. Si aciertan, el animal queda con `tied` = 8 s, sin moverse, y recibe daño ×1,6.
- Escudos: se ponen en la casilla nueva `escudo` del equipo y tienen un campo `def` (0,18 el de corteza y 0,3 el de madera). `hurtPlayer` lo aplica al daño de puma y serpiente.
- Herramientas que funcionan con solo llevarlas:
  - aguja: mejora la calidad al coser;
  - cincel: mejora la calidad al tallar;
  - raspador: da 1 cuero más al despiezar;
  - pala: 4 de arcilla por lugar;
  - taladro: el fuego prende en 8 s y con 20 % más de éxito.
- El mortero se usa desde la mochila y muele 2 mazorcas en 1 de harina.
- Pendiente: los escudos no tienen durabilidad (las prendas se guardan solo por su identificador), y el arpón espera a la fase de pesca.

## Fase 4 (0.30.0)

- Cerámica en tres pasos:
  - Las piezas crudas (`b_*_c`) se moldean con la técnica `moldear`.
  - Se secan en `newDay` o con la acción de secar junto al fuego, que usa la lista `DRYM` compartida con la leña. Así pasan a seca (`b_*_s`).
  - Al final se cuecen.
- Cocer:
  - En la fogata, cada receta tiene una probabilidad de rajarse (`brk` = 0,2 a 0,25). Si se raja, se pierden los materiales. Es distinto del error normal, que no gasta nada.
  - En el horno la probabilidad baja a `brk` = 0,03 y caben 4 tejas o 4 ladrillos por tanda. Los ladrillos solo se cuecen en el horno.
- Platos en la olla de barro (la olla es herramienta y no se gasta): sopa, caldo y mazamorra. El caldo cura (`heal`) y los tres se dañan en 2 días.
- La vasija hace que la comida dure el doble.
- Brasas: `st.ember` guarda la hora límite. Mientras no venza, la fogata se enciende al instante.
- Pendiente: tejas y ladrillos aún no tienen uso en construcción (fase 5). No hay propagación del fuego ni lámpara de aceite.

## Fase 5 (0.32.0)

- Revestimientos (`Build.FIN`), aplicados desde el menú Gestionar:
  - adobe y ladrillo para paredes y puertas;
  - paja y teja para techos.
  - Se guardan en `p.fin`. Multiplican la resistencia, cambian el desgaste diario, quitan la lluvia en techos y suman abrigo.
  - La geometría de cada revestimiento es `GEN.<pieza>_<revestimiento>`.
- Chimenea: pieza nueva junto a la fogata. `Build.chimneyNear(f)` hace que la fogata gaste ×0,7 de leña, que la lluvia no la apague y que caliente 15 °C de cerca (8 a media distancia).
- Puente de troncos: el largo `p.L` (4 a 14 m) se calcula desde la orilla. `floorAt` reconoce el tablero, y el nado se desactiva cuando hay tablero sobre el agua.
- Pendiente: torres de vigilancia, puentes de cuerda, muros de piedra seca, ventanas.

## Fase 6 · agricultura y agua (0.34.0)

- Azada de piedra (era 2): al sembrar marca la parcela como preparada (`crop.z`); `cropNeed` resta 1 día y la cosecha da 1 más. Se gasta 1 de durabilidad por siembra.
- Hoz de pedernal (era 2): al cosechar da 1 semilla más; al cortar hierba da el doble. Se gasta con cada uso.
- Cantimplora con calidad de agua (`it.cw`): del río o la laguna queda en 0; del colector, el pozo o el filtro queda en 1. Beber agua limpia no tiene riesgo de diarrea.
- Filtro de arena y carbón (era 3, 24 usos): junto al agua llena la cantimplora limpia en 10 s; lejos limpia la que ya tiene en 6 s.
- Canal de riego (era 3): tramo de 2 m orientado con `st.face`. `canalFlow()` hace una búsqueda en anchura desde los tramos cuya punta toca agua. `irrigate()` marca `h.irr` y riega las huertas a menos de 2,6 m de una punta con agua; corre cada media hora de juego y al empezar el día.
- Pozo (era 3): en el valle o el bosque de niebla, o a menos de 25 m de agua. Acciones `pdrink`, `pfill` y `pwater` (riega con el balde las huertas a menos de 10 m, 12 s).
- Arreglo: `ORDER` no tenía chimenea ni puente desde la 0.32.0; ahora tiene chimenea, puente, canal y pozo.
- Pendiente para más adelante: cultivos nuevos (quinua, frijol, haba), terrazas y canales de piedra.

## Fase 6 · ajustes posteriores (0.34.2 a 0.35.4)

- Canales en serie: el tramo nuevo se pega a la punta libre más cercana (2,4 m); el botón Girar elige recto, 45° o 90° a cada lado (por defecto recto).
- El agua solo baja: cada tramo guarda la altura de sus puntas (`ya`, `yb`); el agua sale al nivel del río y puede ir en zanja hasta 1 m (`DIG`); si el terreno queda más alto, el tramo y los siguientes quedan secos.
- Construir limpia el suelo (`Build.clearAt`, `World.setClear`): pasto, helechos, arbustos y frailejones no aparecen dentro de las piezas y vuelven al quitarlas.
- Cimiento con altura de 0 a 6 m en dos pasos: Fijar aquí y luego la mirada sube o baja; desde 1,3 m de pilotes, +50 % de materiales por metro (`liftK`); escalera de mano (`p.lad`, rampa en `floorAt`).

## Fase 7 · mecanismos conectados (0.36.0)

- Rueda hidráulica (era 5, a menos de 4 m de un río): `powered(p)` es cierto para telar, prensa y fuelle a menos de 8 m; ejes de madera visibles con postes (`shafts`). Las máquinas movidas trabajan el doble de rápido.
- Noria (era 4, a menos de 3 m del agua): guarda `p.wl` (nivel del agua) y alimenta los canales que la tocan con nivel `wl + 2,5 m` dentro de `canalFlow`.
- Fuelle (era 5, a menos de 3 m de un horno): `fuelleK` multiplica el tiempo de las recetas de horno por 0,6, o 0,4 si la rueda lo mueve.
- Prensa (era 5): 6 moras o uchuvas → 2 jugos. Telar (era 4): 6 fibras → 1 tela. Ropa de tela (era 4): +5 °C, 0,8 kg.
- Polea de madera (era 4): pozo nivel 2, riega en 5 s y hasta 16 m.
- Ruedas que giran: `make()` agrega la malla `noria_w` o `rueda_h_w` como hija y `sync` la rota con el tiempo.
