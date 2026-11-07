# Raíces de Niebla · Plan procedural con uso mínimo de tokens

Actualizado: 2026-11-04. Versión actual: 0.36.0.

## Reglas de ahorro (aplican a todas las fases)

1. **Parches, no reentregas.** Cada cambio es un parche (`patchNNN.py` con `once()`) sobre el HTML existente; el archivo completo solo se entrega al cerrar versión.
2. **Leer por rangos.** Antes de editar se lee solo la función o bloque afectado.
3. **Motor único, especies y materiales como datos.** Árboles y arbustos: `ModelGen.SP`; animales: `AnimGen.SPEC`; texturas: `TexGen.RC`; pasto y helechos: `Under.G`; objetos: `ITEMS`; recetas: `RECIPES`; íconos: `Icons.KIND`; comida que se daña: `SPOIL`; perfiles de rendimiento: `PERF.PR`.
4. **Pruebas con scripts reutilizables.** Humo (`w2x0s.js`), evaluación funcional (`hy_dbg2.js` + archivo de prueba), capturas (`tx_shot.js`), rendimiento relativo (`tx_perf.js`), carga (`ld_test.js`).
5. **Versiones pequeñas.** Una fase = una versión.
6. **Voz para decidir, texto para escribir código.**

## Línea base medida por Heison

- 0.18.0 en iPhone 15 Pro Max, gráficos al máximo, todo activado: 60 FPS, resolución 100 %.

## Estado de fases

| Fase | Versión | Estado |
|---|---|---|
| Texturas procedurales | 0.16.0 | Hecha |
| F1 · Árboles, arbustos, frailejón, rocas | 0.17.0 | Hecha |
| F2 · Pasto, helechos, pantalla de carga | 0.18.0 | Hecha, 60 FPS confirmados |
| F3 · Animales + finales de ríos | 0.19.0 | Hecha |
| HDR, AO, luz, menús nuevos | 0.20.0–0.21.0 | Hecha |
| F4 · Lugares procedurales | 0.22.0 | Hecha |
| F5 · Sucesos del clima | 0.23.0 | Hecha |
| Era 6 · Mecánica artesanal | 0.24.0 | Hecha |
| Era 7 · Química primitiva | 0.25.0 | Hecha (falta probar en iPhone) |
| Optimización Android (perfiles de rendimiento) | 0.26.0 | Hecha (falta medir en el Android del hermano con el medidor) |
| Sistema de fabricación, fase 1 (ver plan-fabricacion-maestro.md) | 0.27.0 | Hecha |
| Personaje humano nuevo y animación procedural | 0.31.0 | Hecha (falta verlo en iPhone y Android) |
| Era 8 · Inicio industrial | — | Pendiente |

## Límites declarados

- Casi fotorrealismo y rendimiento óptimo a la vez, solo con código y en navegador, no es alcanzable por completo.
- El asistente no escucha ni ve en el iPhone; sonido, aspecto y sensación se validan con la retroalimentación de Heison.

## Próximo paso

Pedir al hermano de Santiago los números del medidor (FPS, perfil, llamadas y triángulos) con la 0.26.0. Pendientes de optimización: varyings empaquetados, web worker y caché en IndexedDB.

Era 8 (día 100): rueda hidráulica con dínamo, bombillos y cerca eléctrica, mosquete de avancarga (20 s de recarga, usa la pólvora), estufa de hierro. Luego balance con testers.
