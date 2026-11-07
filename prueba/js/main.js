// Raíces de Niebla · prueba gráfica: valle andino con Three.js moderno y recursos reales CC0.
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { crearTerreno, materialTerreno, riverX, WATER_Y, SIZE } from './terreno.js';
import { crearPasto } from './pasto.js';
import { crearAgua } from './agua.js';
import { crearCielo } from './cielo.js';
import { PaseNiebla } from './niebla.js';
import { Especie, sembrar } from './vegetacion.js';
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
  if (lejos) { const b = t.options.branch; for (const k in b.segments) b.segments[k] = Math.max(3, Math.round(b.segments[k] * 0.5)); for (const k in b.sections) b.sections[k] = Math.max(1, Math.round(b.sections[k] * 0.6)); t.options.leaves.count = Math.round(t.options.leaves.count * 0.5); t.options.leaves.size *= 1.4; t.options.leaves.billboard = 'single'; }
  t.generate(); t.updateMatrixWorld(true); return { scene: t };
}
const CALIDAD = {
  alta: { dpr: 2, msaa: 4, sombra: 2048, bloom: true, lod: 1 },
  media: { dpr: 1.5, msaa: 2, sombra: 1536, bloom: false, lod: 0.7 },
  baja: { dpr: 1, msaa: 0, sombra: 1024, bloom: false, lod: 0.45 },
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
const agua = crearAgua(cielo.estado.dir);
scene.add(agua.grupo);

// ---------- posproceso ----------
let composer, niebla, bloom;
function montarComposer() {
  const Q = CALIDAD[calidad], w = innerWidth, h = innerHeight, dpr = Math.min(devicePixelRatio, Q.dpr);
  renderer.setPixelRatio(dpr);
  const rt = new THREE.WebGLRenderTarget(w * dpr, h * dpr, { type: THREE.HalfFloatType, samples: Q.msaa });
  rt.depthTexture = new THREE.DepthTexture(w * dpr, h * dpr); rt.depthTexture.type = THREE.FloatType;
  if (composer) composer.dispose();
  composer = new EffectComposer(renderer, rt); composer.setPixelRatio(dpr); composer.setSize(w, h);
  composer.addPass(new RenderPass(scene, cam));
  niebla = niebla || new PaseNiebla(cam); composer.addPass(niebla);
  if (Q.bloom) { bloom = new UnrealBloomPass(new THREE.Vector2(w / 2, h / 2), 0.18, 0.5, 1.4); composer.addPass(bloom); }
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
const datos = { listo: false, errores: [], cargados: [] };
window.__escena = datos;

async function iniciar() {
  progreso(0.02, 'Generando el valle…');
  const T = {};
  const capas = Object.entries(TEX).map(([k, id]) => Promise.all([
    paso(tex(`assets/tex/${id}/Diffuse.webp`, true), 'Texturas del suelo…'), paso(tex(`assets/tex/${id}/nor_gl.webp`)), paso(tex(`assets/tex/${id}/Rough.webp`)),
  ]).then(([d, n, r]) => { T[k] = { d, n, r }; }));
  const cache = new Map();
  const glb = id => { if (!cache.has(id)) cache.set(id, paso(cargarModelo(`assets/models/${id}`), 'Árboles y rocas…').catch(e => { datos.errores.push(id + ': ' + e.message); return null; })); return cache.get(id); };
  const modelos = ESPECIES.map(e => Promise.all([glb(e.id), glb(e.id + '_lod1')]).then(([a, b]) => ({ e, a, b })));
  const fauna = Promise.all(['deer', 'stag'].map(k => paso(cargarModelo(`assets/animales/${k}`), 'Animales…').catch(e => { datos.errores.push(k + ': ' + e.message); return null; })));
  await Promise.all(capas);

  const mat = materialTerreno(T, terr.dataTex, calidad);
  terrMesh = new THREE.Mesh(terr.geo, mat); terrMesh.receiveShadow = true; terrMesh.castShadow = true;
  terrFar = new THREE.Mesh(terr.far, mat); terrFar.receiveShadow = true;
  scene.add(terrMesh, terrFar);
  pasto = crearPasto(terr.dataTex, new THREE.Vector4(-SIZE / 2, -SIZE / 2, SIZE, WATER_Y));
  pasto.calidad(calidad); scene.add(pasto.mesh);

  const rnd = rng(1234);
  const reglas = {
    bosque: (x, z, y, n) => n.y > 0.62 && y > WATER_Y + 1.5 && terr.forestAt(x, z) > 0.5,
    borde: (x, z, y, n) => n.y > 0.85 && y > WATER_Y + 1.5 && Math.abs(terr.forestAt(x, z) - 0.35) < 0.25,
    alto: (x, z, y, n) => n.y > 0.75 && y > 70 && y < 210,
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
      sp.colocar(items); especies.push(sp); scene.add(sp.grupo);
      datos.cargados.push(`${a.nombre}: ${items.length} (${Math.round(sp.tris[0])} / ${Math.round(sp.tris[1])} triángulos, ${h0.toFixed(1)} u de alto)`);
    } catch (err) { datos.errores.push(a.nombre + ': ' + err.message); }
  }
  const [deer, stag] = await fauna;
  manada = new Manada(terr, rnd); scene.add(manada.grupo);
  const z0 = 40, x0 = riverX(z0) + 26, prado = new THREE.Vector3(riverX(-30) + 34, 0, -30);
  if (deer) manada.agregar(deer, 3, prado, 1.35);
  if (stag) manada.agregar(stag, 1, prado, 1.95);

  cam.position.set(x0, terr.heightAt(x0, z0) + 1.65, z0);
  controles = crearControles(cam, renderer.domElement, terr, WATER_Y);
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
  pasto.calidad(q); agua.calidad(q); montarComposer();
}
agua.calidad(calidad); document.querySelectorAll('[data-q]').forEach(b => b.classList.toggle('on', b.dataset.q === calidad));
addEventListener('resize', () => { cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); if (composer) montarComposer(); });

// ---------- bucle ----------
let tPrev = performance.now(), t = 0, fpsN = 0, fpsT = 0;
const frustum = new THREE.Frustum(), pv = new THREE.Matrix4();
function frame() {
  const now = performance.now(), dt = Math.min((now - tPrev) / 1000, 0.1); tPrev = now; t += dt;
  renderer.info.reset();
  if (datos.listo) {
    controles.update(dt);
    cielo.update(t, cam.position); agua.update(t, cielo.sol); pasto.update(t, cam.position);
    manada.update(dt, cam.position);
    cam.updateMatrixWorld(); frustum.setFromProjectionMatrix(pv.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    for (const s of especies) s.actualizar(cam.position, frustum, CALIDAD[calidad].lod);
    niebla.material.uniforms.uTime.value = t; VIENTO.value = t;
    composer.render(dt);
    fpsN++; fpsT += dt;
    if (fpsT >= 1) { const i = renderer.info.render; $('fps').textContent = `${Math.round(fpsN / fpsT)} FPS · ${i.calls} llamadas · ${(i.triangles / 1e6).toFixed(2)} M triángulos`; datos.fps = fpsN / fpsT; datos.calls = i.calls; datos.tris = i.triangles; fpsN = 0; fpsT = 0; }
  }
  requestAnimationFrame(frame);
}
renderer.info.autoReset = false;
iniciar().catch(e => { datos.errores.push(String(e && e.stack || e)); $('cargando-txt').textContent = 'Error: ' + e.message; console.error(e); });
requestAnimationFrame(frame);

// para pruebas automáticas y capturas
datos.vista = (x, z, lx, ly, lz, hora) => { cam.position.set(x, 0, z); controles.st.y = null; controles.update(0); controles.mirarA(lx, ly, lz); controles.update(0); if (hora != null) { cielo.setHora(hora); actualizarSolAgua(); } };
datos.calidad = ponerCalidad; datos.riverX = riverX; datos.terr = terr;
