<img src="icono.png" width="96" align="right" alt="">

# Raíces de Niebla

Juego 3D de supervivencia en los Andes colombianos: valle, bosque de niebla, páramo y cumbre. Recolecta, fabrica herramientas por eras, construye, cultiva, caza y sobrevive al frío, al hambre y al clima. Primera y tercera persona, personaje con animación procedural y muñeco de trapo, y multijugador para dos.

Hecho con HTML, JavaScript y Three.js r128, todo en un solo archivo (`index.html`). Árboles, animales, texturas y sonido se generan por código.

**Versión actual:** ver [`CHANGELOG.md`](CHANGELOG.md).

## Jugar

| Dónde | Cómo |
|---|---|
| **Navegador** (PC, Android, iPhone) | https://heison-debeloper.github.io/raices-de-niebla/ |
| **Android (APK)** | [Releases](../../releases/latest) → descargar `raices-de-niebla-X.Y.Z.apk` → abrirlo → permitir «instalar apps de origen desconocido» |
| **iPhone** | Abrir el enlace del navegador en **Safari** → Compartir → **Añadir a pantalla de inicio**. Se abre a pantalla completa como una app |

- El APK funciona **sin internet** y se instala **encima** del anterior sin perder la partida (todas las versiones usan la misma firma).
- En el APK el botón **Atrás** del teléfono equivale a la tecla Escape (cierra menús o abre la pausa).
- **Multijugador:** el modo por código de red local (WebRTC) funciona en el navegador y en el APK. El modo «sala de Claude» solo funciona dentro del enlace de Claude.

## Estructura

```
index.html                 el juego (versión actual, carga Three.js desde vendor/)
vendor/                    Three.js r128 y Sky.js (licencia MIT)
versiones/                 versiones completas tal como se publicaron en Claude
docs/                      auditoría técnica y planes de diseño
CHANGELOG.md               registro de cambios (se genera desde el juego)
android/                   proyecto Android mínimo: abre el juego a pantalla completa
.github/workflows/apk.yml  compila y publica el APK en cada cambio
tools/desde-artefacto.py   convierte una versión nueva en index.html + CHANGELOG.md
```

## Publicar una versión nueva

```bash
cp ruta/raices-de-niebla-vX.Y.Z.html versiones/
python3 tools/desde-artefacto.py versiones/raices-de-niebla-vX.Y.Z.html   # valida el JS y regenera CHANGELOG.md
git add -A && git commit -m "Versión X.Y.Z" && git push
```

En unos 5 minutos GitHub Actions deja el APK en Releases y GitHub Pages actualiza la versión web.

## Firma del APK

`android/app/raices.keystore` es una llave fija y pública, pensada para uso personal: permite actualizar sin desinstalar. Para publicar en Google Play hay que crear una llave privada y guardarla en los *Secrets* del repositorio.
