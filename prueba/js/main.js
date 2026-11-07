// Raíces de Niebla · prueba gráfica: valle andino con Three.js moderno y recursos reales CC0.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { crearTerreno, materialTerreno, riverX, WATER_Y, SIZE, FAR } from './terreno.js';
import { crearPasto } from './pasto.js';
import { crearAgua } from './agua.js';
import { crearCielo } from './cielo.js';
import { PaseNiebla } from './niebla.js';
import { Especie, sembrar, bosqueLejano } from './vegetacion.js';
import { Manada } from './animales.js';
import { crearControles } from './controles.js';
import { rng } from './ruido.js';
import { Tree } from '../vendor/ez-tree.es.js';
import { VIENTO } from './vegetacion.js';

const TEX = { grass: 'rocky_terrain_02', forest: 'brown_mud_leaves_01', rock: 'aerial_rocks_02', bank: 'coast_sand_rocks_02', paramo: 'aerial_grass_rock' };
// especies: modelo de Poly Haven, cantidad, regla de dónde crece, distancia mínima, escala
// Árboles generados con EZ-Tree (MIT): roble andino, aliso, fresno y pino de plantación. alto = metros.
const ARBOLES = [
  { preset: 'Oak Medium', semilla: 11, n: 700, donde: 'bosque', min: 6, alto: [13, 19], nombre: 'roble' },
  { preset: 'Oak Large', semilla: 23, n: 160, donde: 'bosque', min: 10, alto: [17, 24], nombre: 'roble grande' },
  { preset: 'Aspen Medium', semilla: 7, n: 260, donde: 'borde', min: 6, alto: [11, 16], nombre: 'aliso' },
  { preset: 'Ash Medium', semilla: 5, n: 600, donde: 'bosque', min: 6, alto: [12, 17], nombre: 'fresno' },
  { preset: 'Pine Medium', semilla: 3, n: 300, donde: 'alto', min: 7, alto: [14, 22], nombre: 'pino' },
  { preset: 'Bush 1', semilla: 9, n: 120, donde: 'borde', min: 4, alto: [1.6, 2.6], nombre: 'arbusto', near: 14, mid: 70, far: 260 },
];
const ESPECIES = [
  { id: 'shrub_02', n: 90, donde: 'pradera', min: 5, esc: [0.7, 1.2], near: 14, far: 200 },
  { id: 'fern_02', n: 240, donde: 'sotobosque', min: 2, esc: [0.9, 1.5], near: 10, far: 110, sombraLejos: false },
  { id: 'rock_moss_set_01', n: 45, donde: 'orilla', min: 5, esc: [0.7, 1.3], near: 20, far: 400 },
  { id: 'rock_moss_set_02', n: 40, donde: 'roca', min: 8, esc: [0.8, 1.6], near: 20, far: 450 },
  { id: 'tree_stump_01', n: 14, donde: 'borde', min: 10, esc: [0.9, 1.2], near: 15, far: 160 },
  { id: 'dry_branches_medium_01', n: 24, donde: 'sotobosque', min: 8, esc: [0.9, 1.3], near: 15, far: 120 },
];
/** Genera un árbol EZ-Tree; la versión lejana tiene menos caras por rama y hojas más grandes y escasas. */
function arbol(preset, semilla, lejos) {
  const t = new Tree(); t.loadPreset(preset); t.options.seed = semilla;
  if (lejos) { const b = t.options.branch; for (const k in b.segments) b.segments[k] = Math.max(3, Math.round(b.segments[k] * 0.5)); for (const k in b.sections) b.sections[k] = Math.max(1, Math.round(b.sections[k] * 0.6)); t.options.leaves.count = Math.round(t.options.leaves.count * 0.6); t.options.leaves.size *= 1.3; }   // hojas dobles: las de un solo plano desaparecen vistas de canto
  t.generate(); t.updateMatrixWorld(true); return { scene: t };
}
// dpr: resolución máxima; min: hasta dónde puede bajar la resolución dinámica para sostener ~55 FPS
const CALIDAD = {
  alta: { dpr: 2, min: 1, msaa: 4, sombra: 2048, lod: 1 },
  media: { dpr: 1.5, min: 0.8, msaa: 2, sombra: 1536, lod: 0.7 },
  baja: { dpr: 1, min: 0.6, msaa: 0, sombra: 1024, lod: 0.45 },
};

const $ = id => document.getElementById(id);
const progreso = (k, txt) => { $('barra').style.width = (k * 100).toFixed(0) + '%'; if (txt) $('cargando-txt').textContent = txt; };
const movil = matchMedia('(pointer: coarse)').matches;
let calidad = new URLSearchParams(location.search).get('calidad') || (movil ? 'media' : 'alta');

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.62;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
$('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.1, 3500);
cam.layers.enable(1);   // capa 1 = pasto y plantas pequeñas: se ven, pero no se reflejan en el agua
const terr = crearTerreno();
const cielo = crearCielo(renderer, scene);
const agua = crearAgua();
scene.add(agua.grupo);

// ---------- posproceso ----------
let composer, niebla;
// Resolución dinámica SIN parpadeo: el lienzo de la pantalla tiene tamaño fijo y solo cambian los búferes internos
// donde se dibuja la escena; el último pase (tono y color) los escala al lienzo. Redimensionar el lienzo lo borraba.
const ESCALONES = [0.6, 0.7, 0.8, 0.9, 1, 1.15, 1.3, 1.5, 1.75, 2];
let escala = 0;
function rango() { const Q = CALIDAD[calidad], max = Math.min(devicePixelRatio, Q.dpr); return { max, min: Math.min(max, Q.min) }; }
function tamInterno() { return [Math.max(1, Math.round(innerWidth * escala)), Math.max(1, Math.round(innerHeight * escala))]; }
function aplicarEscala() { const [w, h] = tamInterno(); composer.renderTarget1.setSize(w, h); composer.renderTarget2.setSize(w, h); }
function montarComposer() {
  const Q = CALIDAD[calidad], { max, min } = rango();
  if (!escala || escala > max || escala < min) escala = movil ? Math.max(min, max * 0.8) : max;
  renderer.setPixelRatio(max); renderer.setSize(innerWidth, innerHeight);     // lienzo fijo a la resolución máxima
  const [w, h] = tamInterno();
  const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: Q.msaa });
  rt.depthTexture = new THREE.DepthTexture(w, h); rt.depthTexture.type = THREE.FloatType;
  if (composer) composer.dispose();
  composer = new EffectComposer(renderer, rt);          // sin composer.setSize: los búferes conservan el tamaño interno
  composer.addPass(new RenderPass(scene, cam));
  niebla = niebla || new PaseNiebla(cam); composer.addPass(niebla);
  // sin bloom: agrandaba cualquier píxel suelto muy brillante hasta un círculo amarillo ("bosque encantado")
  composer.addPass(new OutputPass());
  cielo.sol.shadow.mapSize.setScalar(Q.sombra); if (cielo.sol.shadow.map) { cielo.sol.shadow.map.dispose(); cielo.sol.shadow.map = null; }
}

// ---------- carga ----------
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
/** Modelo .glb; si el servidor no lo sirve (el enlace de Claude no sirve .glb) usa la copia .json con todo incrustado. */
const cargarModelo = base => loader.loadAsync(base + '.glb').catch(() => loader.loadAsync(base + '.json'));
const tl = new THREE.TextureLoader();
const aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
function tex(url, srgb) {
  return new Promise((ok, mal) => tl.load(url, t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso; if (srgb) t.colorSpace = THREE.SRGBColorSpace; ok(t); }, undefined, mal));
}
let hechos = 0, total = 0;
const paso = (p, txt) => { total++; return p.then(r => { hechos++; progreso(hechos / total, txt); return r; }); };

const especies = [];
let terrMesh, terrFar, pasto, manada, controles;
const datos = { listo: false, errores: [], cargados: [], fija: new URLSearchParams(location.search).has('fija') };
window.__escena = datos;

async function iniciar() {
  progreso(0.02, 'Generando el valle…');
  const T = {};
  // Diffuse.webp lleva el color en rgb y la rugosidad en alfa (ver tools/optimizar.mjs)
  const capas = Object.entries(TEX).map(([k, id]) => Promise.all([
    paso(tex(`assets/tex/${id}/Diffuse.webp`, true), 'Texturas del suelo…'), paso(tex(`assets/tex/${id}/nor_gl.webp`)),
  ]).then(([d, n]) => { T[k] = { d, n }; }));
  const cache = new Map();
  const glb = id => { if (!cache.has(id)) cache.set(id, paso(cargarModelo(`assets/models/${id}`), 'Árboles y rocas…').catch(e => { datos.errores.push(id + ': ' + e.message); return null; })); return cache.get(id); };
  const modelos = ESPECIES.map(e => Promise.all([glb(e.id), glb(e.id + '_lod1')]).then(([a, b]) => ({ e, a, b })));
  const fauna = Promise.all(['deer', 'stag'].map(k => paso(cargarModelo(`assets/animales/${k}`), 'Animales…').catch(e => { datos.errores.push(k + ': ' + e.message); return null; })));
  await Promise.all(capas);

  const mat = materialTerreno(T, terr.dataTex, calidad, terr.dataFar);
  terrMesh = new THREE.Mesh(terr.geo, mat); terrMesh.receiveShadow = true; terrMesh.castShadow = true;
  terrFar = new THREE.Mesh(terr.far, mat); terrFar.receiveShadow = true;
  scene.add(terrMesh, terrFar);
  pasto = crearPasto(terr.dataTex, new THREE.Vector4(-SIZE / 2, -SIZE / 2, SIZE, WATER_Y), terr.dataFar, new THREE.Vector4(-FAR / 2, -FAR / 2, FAR, 0));
  pasto.calidad(calidad); scene.add(pasto.mesh);

  const rnd = rng(1234);
  const reglas = {
    bosque: (x, z, y, n) => n.y > 0.62 && y > WATER_Y + 1.5 && terr.forestAt(x, z) > 0.5,
    borde: (x, z, y, n) => n.y > 0.85 && y > WATER_Y + 1.5 && Math.abs(terr.forestAt(x, z) - 0.35) < 0.25,
    alto: (x, z, y, n) => n.y > 0.75 && y > 25 && terr.forestAt(x, z) > 0.3,
    pradera: (x, z, y, n, r) => n.y > 0.9 && y > WATER_Y + 1.2 && terr.forestAt(x, z) < 0.2 && r() < 0.5,
    sotobosque: (x, z, y, n) => n.y > 0.8 && y > WATER_Y + 1.2 && terr.forestAt(x, z) > 0.45,
    roca: (x, z, y, n) => n.y < 0.9 && n.y > 0.6 && y > 6,
    orilla: (x, z, y, n) => y > WATER_Y - 0.3 && y < WATER_Y + 2.2 && Math.abs(x - riverX(z)) < 24,
  };
  for (const { e, a, b } of await Promise.all(modelos)) {
    if (!a) continue;
    const sp = new Especie(e.nodo || e.id, a, b, e.n, { near: e.near, mid: e.mid, far: e.far, sombraLejos: e.sombraLejos, renderer, nodo: e.nodo });
    const items = sembrar(terr, rnd, e.n, reglas[e.donde], e.min);
    for (const it of items) it.s = e.esc[0] + rnd() * (e.esc[1] - e.esc[0]);
    if (e.near <= 15) sp.grupo.traverse(o => o.layers.set(1));
    sp.colocar(items); especies.push(sp); scene.add(sp.grupo); datos.cargados.push(`${e.nodo || e.id}: ${items.length} (${Math.round(sp.tris[0])} / ${Math.round(sp.tris[1])} triángulos)`);
  }
  progreso(0.9, 'Creciendo los árboles…'); await new Promise(r => setTimeout(r, 30));
  for (const a of ARBOLES) {
    try {
      const g0 = arbol(a.preset, a.semilla, false), g1 = arbol(a.preset, a.semilla, true);
      const h0 = new THREE.Box3().setFromObject(g0.scene).getSize(new THREE.Vector3()).y;
      const sp = new Especie(a.nombre, g0, g1, a.n, { near: a.near ?? 32, mid: a.mid ?? 160, far: a.far ?? 900, renderer });
      const items = sembrar(terr, rnd, a.n, reglas[a.donde], a.min);
      for (const it of items) it.s = (a.alto[0] + rnd() * (a.alto[1] - a.alto[0])) / h0;
      sp.alto = a.alto; sp.h0 = h0;
      sp.colocar(items); especies.push(sp); scene.add(sp.grupo);
      datos.cargados.push(`${a.nombre}: ${items.length} (${Math.round(sp.tris[0])} / ${Math.round(sp.tris[1])} triángulos, ${h0.toFixed(1)} u de alto)`);
    } catch (err) { datos.errores.push(a.nombre + ': ' + err.message); }
  }
  // montañas lejanas (450 m a 2,2 km): bosque de imposters
  { const t0 = performance.now(), fuentes = especies.filter(sp => sp.l2 && sp.h0 && ['roble', 'fresno', 'aliso', 'pino'].includes(sp.nombre));
    const bl = bosqueLejano(fuentes, terr, rnd, movil ? 22000 : 32000, SIZE / 2 - 10, 1600); scene.add(bl.grupo);
    datos.cargados.push(`bosque lejano: ${bl.n} árboles en ${Math.round(performance.now() - t0)} ms`); }
  const [deer, stag] = await fauna;
  manada = new Manada(terr, rnd); scene.add(manada.grupo);
  const z0 = 40, x0 = riverX(z0) + 26, prado = new THREE.Vector3(riverX(-30) + 34, 0, -30);
  if (deer) manada.agregar(deer, 3, prado, 1.35);
  if (stag) manada.agregar(stag, 1, prado, 1.95);

  cam.position.set(x0, terr.heightAt(x0, z0) + 1.65, z0);
  controles = crearControles(cam, renderer.domElement, terr, WATER_Y);
  cielo.estado.suelo = (x, z) => terr.heightAt(x, z);
  controles.mirarA(riverX(-120), 8, -120);
  montarComposer();
  cielo.setHora(9.2); actualizarSolAgua();
  progreso(1, 'Listo');
  setTimeout(() => $('cargando').classList.add('fuera'), 300);
  datos.listo = true;
}

function actualizarSolAgua() {
  const n = niebla && niebla.material.uniforms, el = cielo.estado.elev, k = THREE.MathUtils.smoothstep(el, -3, 25), warm = 1 - THREE.MathUtils.smoothstep(el, 2, 30);
  if (n) {
    n.uSun.value.copy(cielo.estado.dir);
    n.uFog.value.setRGB(0.42 + 0.14 * warm, 0.5, 0.58 - 0.12 * warm).multiplyScalar(0.09 + 0.26 * k);
    n.uSunCol.value.copy(cielo.sol.color).multiplyScalar(0.15 + 0.6 * k);
    n.uDens.value = 0.0013 + 0.004 * warm; n.uDist.value = 0.00016;
  }
}

// ---------- interfaz ----------
$('hora').addEventListener('input', ev => { cielo.setHora(+ev.target.value); actualizarSolAgua(); $('hora-v').textContent = fmtHora(+ev.target.value); });
const fmtHora = h => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;
for (const b of document.querySelectorAll('[data-q]')) b.addEventListener('click', () => ponerCalidad(b.dataset.q));
function ponerCalidad(q) {
  calidad = q; document.querySelectorAll('[data-q]').forEach(b => b.classList.toggle('on', b.dataset.q === q));
  if (!terrMesh) return;
  terrMesh.material.defines.TRIPLANAR = q === 'baja' ? 0 : 1; terrMesh.material.needsUpdate = true;
  escala = 0; pasto.calidad(q); agua.calidad(q); montarComposer();
}
agua.calidad(calidad); document.querySelectorAll('[data-q]').forEach(b => b.classList.toggle('on', b.dataset.q === calidad));
// ---------- vuelo ----------
const vel = $('vel');
function ponerModo(volar) {
  controles.st.volar = volar; document.body.classList.toggle('volando', volar);
  document.querySelectorAll('[data-modo]').forEach(b => b.classList.toggle('on', (b.dataset.modo === 'volar') === volar));
  if (!volar) { controles.st.y = null; $('alt').textContent = ''; }
}
document.querySelectorAll('[data-modo]').forEach(b => b.addEventListener('click', () => controles && ponerModo(b.dataset.modo === 'volar')));
vel.addEventListener('input', () => { if (controles) controles.st.vel = +vel.value; $('vel-v').textContent = Math.round(vel.value * 3.6) + ' km/h'; });
for (const [id, d] of [['subir', 1], ['bajar', -1]]) {
  const b = $(id), on = ev => { ev.preventDefault(); controles && (controles.st.sube = d); }, off = () => controles && (controles.st.sube = 0);
  b.addEventListener('touchstart', on, { passive: false }); b.addEventListener('touchend', off); b.addEventListener('touchcancel', off);
  b.addEventListener('mousedown', on); b.addEventListener('mouseup', off); b.addEventListener('mouseleave', off);
}
addEventListener('keydown', ev => { if (ev.code === 'KeyF' && controles) ponerModo(!controles.st.volar); });
datos.volar = ponerModo;
addEventListener('resize', () => { cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); if (composer) montarComposer(); });

// ---------- bucle ----------
let tPrev = performance.now(), t = 0, fpsN = 0, fpsT = 0, ultimoCambio = 0, peor = 0; const fpsHist = [];
const frustum = new THREE.Frustum(), pv = new THREE.Matrix4();
function frame() {
  const now = performance.now(), dtr = (now - tPrev) / 1000, dt = Math.min(dtr, 0.1); tPrev = now; t += dt; peor = Math.max(peor, dtr);
  renderer.info.reset();
  if (datos.listo) {
    controles.update(dt);
    cielo.update(t, cam.position); agua.update(t, cielo.sol); pasto.update(t, cam.position);
    manada.update(dt, cam.position);
    cam.updateMatrixWorld(); frustum.setFromProjectionMatrix(pv.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    for (const s of especies) s.actualizar(cam.position, frustum, CALIDAD[calidad].lod);
    niebla.material.uniforms.uTime.value = t; VIENTO.value = t;
    niebla.material.uniforms.uAgua.value = controles.st.bajoAgua ? 1 : 0; niebla.material.uniforms.uLuz.value = 0.15 + 0.85 * THREE.MathUtils.smoothstep(cielo.estado.elev, -3, 25);
    document.body.classList.toggle('nadando', controles.st.nadando && !controles.st.volar);
    composer.render(dt);
    fpsN++; fpsT += dt;
    if (fpsT >= 1) {
      const fps = fpsN / fpsT, { max, min } = rango();
      // resolución dinámica por escalones, con histéresis y como mucho un cambio cada 3 s
      fpsHist.push(fps); if (fpsHist.length > 3) fpsHist.shift();
      if (!datos.fija && t > 4 && t - ultimoCambio > 3 && fpsHist.length === 3) {
        const prom = fpsHist.reduce((a, b) => a + b) / 3, cand = ESCALONES.filter(e => e >= min - 1e-6 && e <= max + 1e-6);
        let k = cand.findIndex(e => e >= escala - 1e-6); if (k < 0) k = cand.length - 1;
        const nk = prom < 46 ? k - 1 : prom > 58 ? k + 1 : k;
        if (nk !== k && nk >= 0 && nk < cand.length) { escala = cand[nk]; aplicarEscala(); ultimoCambio = t; fpsHist.length = 0; }
      }
      const [iw, ih] = tamInterno(), i = renderer.info.render; $('fps').textContent = `${Math.round(fps)} FPS · peor ${Math.round(peor * 1000)} ms · ${iw}×${ih} · ${(i.triangles / 1e6).toFixed(2)} M tri`;
      if (controles && controles.st.volar) $('alt').textContent = `${Math.round(cam.position.y - Math.max(terr.heightAt(cam.position.x, cam.position.z), 0))} m sobre el suelo · ${Math.round(controles.st.vel * 3.6)} km/h`;
      peor = 0; datos.fps = fpsN / fpsT; datos.calls = i.calls; datos.tris = i.triangles; fpsN = 0; fpsT = 0; }
  }
  requestAnimationFrame(frame);
}
renderer.info.autoReset = false;
iniciar().catch(e => { datos.errores.push(String(e && e.stack || e)); $('cargando-txt').textContent = 'Error: ' + e.message; console.error(e); });
requestAnimationFrame(frame);

// para pruebas automáticas y capturas
datos.vista = (x, z, lx, ly, lz, hora) => { cam.position.set(x, 0, z); controles.st.y = null; controles.update(0); controles.mirarA(lx, ly, lz); controles.update(0); if (hora != null) { cielo.setHora(hora); actualizarSolAgua(); } };
datos.calidad = ponerCalidad; datos.riverX = riverX; datos.terr = terr; datos.renderer = renderer; datos.cam = cam; datos.escala = e => { escala = e; aplicarEscala(); }; datos.lejos = () => terrFar; datos.ctl = () => controles; datos.mirarVuelo = (x, y, z, lx, ly, lz) => { ponerModo(true); cam.position.set(x, y, z); controles.mirarA(lx, ly, lz); controles.st.y = y; controles.update(0); };
