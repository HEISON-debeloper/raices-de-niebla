// Sol del tubo: una esfera brillante en el eje que viaja a lo largo del tubo. La hora fija su posición z respecto al
// jugador: a mediodía está justo encima (90°); al amanecer y al atardecer está lejos por el eje, con luz rasante.
// Como el sol está quieto en el mundo, volar a lo largo del tubo también cambia la hora local.
// La luz de cada punto se calcula por píxel (curva.js); aquí: la luz direccional con sombras cerca de la cámara,
// la luz ambiental (cielo de Preetham solo como mapa de entorno) y la esfera visible.
import * as THREE from 'three';
import { Sky } from 'three/addons/objects/Sky.js';
import { R } from './mundo.js';
import { CURVA } from './curva.js';

export function crearCielo(renderer, scene) {
  const sol = new THREE.DirectionalLight(0xffffff, 4.6); sol.castShadow = true;
  const sc = sol.shadow.camera; sc.left = -70; sc.right = 70; sc.top = 70; sc.bottom = -70; sc.near = 1; sc.far = 600;
  sol.shadow.bias = -0.0004; sol.shadow.normalBias = 0.5;
  scene.add(sol, sol.target);

  // esfera del sol + halo (en coordenadas ya enrolladas: el eje pasa por (xCámara, R, z))
  const esfera = new THREE.Mesh(new THREE.SphereGeometry(1, 24, 12), new THREE.MeshBasicMaterial({ color: new THREE.Color(40, 34, 26), fog: false }));
  const cv = document.createElement('canvas'); cv.width = cv.height = 128; const g = cv.getContext('2d'), gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
  gr.addColorStop(0, 'rgba(255,240,210,1)'); gr.addColorStop(0.25, 'rgba(255,220,170,.35)'); gr.addColorStop(1, 'rgba(255,200,150,0)'); g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(cv), color: new THREE.Color(3, 2.6, 2.1), blending: THREE.AdditiveBlending, depthWrite: false, transparent: true }));
  esfera.frustumCulled = halo.frustumCulled = false; scene.add(esfera, halo);

  const sky = new Sky(), su = sky.material.uniforms; sky.scale.setScalar(1000);
  su.turbidity.value = 6; su.rayleigh.value = 1.2; su.mieCoefficient.value = 0.004; su.mieDirectionalG.value = 0.82;
  if (su.cloudCoverage) su.cloudCoverage.value = 0;
  const envScene = new THREE.Scene(); envScene.add(sky);
  const pmrem = new THREE.PMREMGenerator(renderer); let envRT = null, elevEnv = -99;
  const dir = new THREE.Vector3(0, 1, 0), col = new THREE.Color();
  const estado = { hora: 12, dir, elev: 90, zSol: 0, on: true, fondo: new THREE.Color(0.5, 0.55, 0.6) };

  /** hora 6–18: de día; fuera de ese rango el sol se apaga. */
  function setHora(hora, cam) {
    estado.hora = hora; estado.on = hora > 6.05 && hora < 17.95;
    const el = Math.max(0.6, 90 * Math.sin(Math.PI * (hora - 6) / 12));
    estado.zSol = cam.z + (R - cam.y) / Math.tan(THREE.MathUtils.degToRad(el)) * (hora < 12 ? -1 : 1);
    local(cam, true);
  }
  /** Elevación del sol vista desde la cámara (cambia si uno vuela a lo largo del tubo). */
  function local(cam, forzar) {
    const dz = estado.zSol - cam.z, dy = R - cam.y;
    dir.set(0, dy, dz).normalize();
    const elev = estado.on ? THREE.MathUtils.radToDeg(Math.asin(dir.y)) : -10;
    estado.elev = elev;
    CURVA.uSolT.value.set(estado.on ? 1 : 0, R, estado.zSol);
    const k = THREE.MathUtils.smoothstep(elev, -3, 25), warm = 1 - THREE.MathUtils.smoothstep(elev, 2, 30);
    col.setRGB(1, 0.93 - 0.32 * warm, 0.85 - 0.55 * warm);
    sol.color.setRGB(1, 1, 1); sol.intensity = estado.on ? 4.6 : 0;   // color y atenuación van por píxel (curva.js)
    if (forzar || Math.abs(elev - elevEnv) > 0.7) {
      elevEnv = elev; su.turbidity.value = 4.5 + 4 * warm;
      su.sunPosition.value.copy(estado.on ? dir : new THREE.Vector3(0, -0.2, 1));
      if (envRT) envRT.dispose(); envRT = pmrem.fromScene(envScene, 0.035);
      scene.environment = envRT.texture; scene.environmentIntensity = 0.12 + 0.4 * k;
    }
    estado.k = k; estado.warm = warm; estado.col = col;
  }
  function update(t, cam) {
    local(cam, false);
    // sombra: sigue a la cámara (plano local), alineada a texeles
    const s = 140 / sol.shadow.mapSize.x, tx = Math.round(cam.x / s) * s, tz = Math.round(cam.z / s) * s;
    sol.target.position.set(tx, Math.min(cam.y - 10, (estado.suelo ? estado.suelo(tx, tz) : 0) + 20), tz);
    sol.position.copy(sol.target.position).addScaledVector(dir, 300);
    // esfera visible: en el eje; si está más lejos que el plano lejano se dibuja más cerca y proporcionalmente más chica
    const dz = estado.zSol - cam.z, dist = Math.hypot(R - cam.y, dz), lim = 4200, f = Math.min(1, lim / dist);
    esfera.position.set(cam.x, R - (R - cam.y) * (1 - f), cam.z + dz * f).y = cam.y + (R - cam.y) * f;
    esfera.scale.setScalar(28 * f); halo.position.copy(esfera.position); halo.scale.setScalar(420 * f);
    esfera.visible = halo.visible = estado.on;
  }
  return { sol, setHora, update, estado, esfera };
}
