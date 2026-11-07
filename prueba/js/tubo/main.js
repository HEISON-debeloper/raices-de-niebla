// Raíces de Niebla · prueba gráfica: mundo-tubo (cilindro de O'Neill, radio 1 km, infinito a lo largo del eje).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { OPC } from '../materiales.js';
import { R, C, WATER_Y, alturaFn, normalFn, rioU, envolver } from './mundo.js';
import { CURVA, hacerCurvo, doblarCPU } from './curva.js';
import { crearTerreno, materialTerreno, U_CAM } from './terreno.js';
import { crearAgua } from './agua.js';
import { crearCielo } from './cielo.js';
import { crearCerca } from './cerca.js';
import { Flora } from './flora.js';
import { crearControles } from './controles.js';
import { crearPasto } from '../pasto.js';
import { PaseNiebla } from '../niebla.js';
import { Especie, VIENTO } from '../vegetacion.js';
import { Manada } from '../animales.js';
import { Tree } from '../../vendor/ez-tree.es.js';

OPC.curvo = true;   // todos los materiales se enrollan en el tubo

const TEX = { grass: 'rocky_terrain_02', forest: 'brown_mud_leaves_01', rock: 'aerial_rocks_02', bank: 'coast_sand_rocks_02', paramo: 'aerial_grass_rock' };
const ARBOLES = [
  { preset: 'Oak Medium', semilla: 11, peso: 700, alto: [13, 19], nombre: 'roble' },
  { preset: 'Oak Large', semilla: 23, peso: 160, alto: [17, 24], nombre: 'roble grande' },
  { preset: 'Aspen Medium', semilla: 7, peso: 0, alto: [11, 16], nombre: 'aliso' },
  { preset: 'Ash Medium', semilla: 5, peso: 600, alto: [12, 17], nombre: 'fresno' },
  { preset: 'Pine Medium', semilla: 3, peso: 0, alto: [14, 22], nombre: 'pino' },
  { preset: 'Bush 1', semilla: 9, peso: 0, alto: [1.6, 2.6], nombre: 'arbusto', near: 14, mid: 70, far: 260 },
];
const ESPECIES = [
  { id: 'shrub_02', esc: [0.7, 1.2], near: 14, far: 200 },
  { id: 'fern_02', esc: [0.9, 1.5], near: 10, far: 110, sombraLejos: false },
  { id: 'rock_moss_set_01', esc: [0.7, 1.3], near: 20, far: 400 },
  { id: 'rock_moss_set_02', esc: [0.8, 1.6], near: 20, far: 450 },
  { id: 'tree_stump_01', esc: [0.9, 1.2], near: 15, far: 160 },
  { id: 'dry_branches_medium_01', esc: [0.9, 1.3], near: 15, far: 120 },
];
function arbol(preset, semilla, lejos) {
  const t = new Tree(); t.loadPreset(preset); t.options.seed = semilla;
  if (lejos) { const b = t.options.branch; for (const k in b.segments) b.segments[k] = Math.max(3, Math.round(b.segments[k] * 0.5)); for (const k in b.sections) b.sections[k] = Math.max(1, Math.round(b.sections[k] * 0.6)); t.options.leaves.count = Math.round(t.options.leaves.count * 0.6); t.options.leaves.size *= 1.3; }
  t.generate(); t.updateMatrixWorld(true); return { scene: t };
}
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
const cam = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.15, 6000);
cam.layers.enable(1);
const terr = { heightAt: alturaFn, normalAt: (x, z) => { const n = normalFn(x, z); return new THREE.Vector3(n.x, n.y, n.z); } };
const cielo = crearCielo(renderer, scene);
const agua = crearAgua(); scene.add(agua.grupo);
const cerca = crearCerca(renderer);

// ---------- posproceso (igual que el valle: resolución dinámica sin parpadeo) ----------
let composer, niebla;
const ESCALONES = [0.6, 0.7, 0.8, 0.9, 1, 1.15, 1.3, 1.5, 1.75, 2];
let escala = 0;
function rango() { const Q = CALIDAD[calidad], max = Math.min(devicePixelRatio, Q.dpr); return { max, min: Math.min(max, Q.min) }; }
function tamInterno() { return [Math.max(1, Math.round(innerWidth * escala)), Math.max(1, Math.round(innerHeight * escala))]; }
function aplicarEscala() { const [w, h] = tamInterno(); composer.renderTarget1.setSize(w, h); composer.renderTarget2.setSize(w, h); }
function montarComposer() {
  const Q = CALIDAD[calidad], { max, min } = rango();
  if (!escala || escala > max || escala < min) escala = movil ? Math.max(min, max * 0.8) : max;
  renderer.setPixelRatio(max); renderer.setSize(innerWidth, innerHeight);
  const [w, h] = tamInterno();
  const rt = new THREE.WebGLRenderTarget(w, h, { type: THREE.HalfFloatType, samples: Q.msaa });
  rt.depthTexture = new THREE.DepthTexture(w, h); rt.depthTexture.type = THREE.FloatType;
  if (composer) composer.dispose();
  composer = new EffectComposer(renderer, rt);
  composer.addPass(new RenderPass(scene, cam));
  if (!niebla) { niebla = new PaseNiebla(cam); niebla.material.uniforms.uTubo.value = 1; }
  composer.addPass(niebla);
  composer.addPass(new OutputPass());
  cielo.sol.shadow.mapSize.setScalar(Q.sombra); if (cielo.sol.shadow.map) { cielo.sol.shadow.map.dispose(); cielo.sol.shadow.map = null; }
}

// ---------- carga ----------
const loader = new GLTFLoader().setMeshoptDecoder(MeshoptDecoder);
const cargarModelo = base => loader.loadAsync(base + '.glb').catch(() => loader.loadAsync(base + '.json'));
const tl = new THREE.TextureLoader(), aniso = Math.min(8, renderer.capabilities.getMaxAnisotropy());
const tex = (url, srgb) => new Promise((ok, mal) => tl.load(url, t => { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.anisotropy = aniso; if (srgb) t.colorSpace = THREE.SRGBColorSpace; ok(t); }, undefined, mal));
let hechos = 0, total = 0;
const paso = (p, txt) => { total++; return p.then(r => { hechos++; progreso(hechos / total, txt); return r; }); };

let terrMat, pasto, manada, controles, flora; const especies = [];
const datos = { listo: false, errores: [], cargados: [], fija: new URLSearchParams(location.search).has('fija') };
window.__escena = datos;
const pb = new THREE.Vector3(), doblar = (p, out) => doblarCPU(p.x, p.y, p.z, cam.position.x, out);

async function iniciar() {
  progreso(0.02, 'Enrollando el mundo…');
  const T = {};
  const capas = Object.entries(TEX).map(([k, id]) => Promise.all([
    paso(tex(`assets/tex/${id}/Diffuse.webp`, true), 'Texturas del suelo…'), paso(tex(`assets/tex/${id}/nor_gl.webp`)),
  ]).then(([d, n]) => { T[k] = { d, n }; }));
  const glb = id => paso(cargarModelo(`assets/models/${id}`), 'Árboles y rocas…').catch(e => { datos.errores.push(id + ': ' + e.message); return null; });
  const modelos = ESPECIES.map(e => Promise.all([glb(e.id), glb(e.id + '_lod1')]).then(([a, b]) => ({ e, a, b })));
  const fauna = Promise.all(['deer', 'stag'].map(k => paso(cargarModelo(`assets/animales/${k}`), 'Animales…').catch(e => { datos.errores.push(k + ': ' + e.message); return null; })));
  await Promise.all(capas);

  terrMat = materialTerreno(T, calidad);
  scene.add(crearTerreno(terrMat));
  pasto = crearPasto(null, new THREE.Vector4(), null, new THREE.Vector4(), cerca); pasto.calidad(calidad); scene.add(pasto.mesh);

  // especies: índice fijo k para la siembra
  const idx = {};
  for (const { e, a, b } of await Promise.all(modelos)) {
    if (!a) continue;
    const sp = new Especie(e.id, a, b, 4000, { near: e.near, far: e.far, sombraLejos: e.sombraLejos, renderer });
    if (e.near <= 15) sp.grupo.traverse(o => o.layers.set(1));
    sp.esc = e.esc; idx[e.id] = especies.length; especies.push(sp); scene.add(sp.grupo);
  }
  progreso(0.88, 'Creciendo los árboles…'); await new Promise(r => setTimeout(r, 30));
  for (const a of ARBOLES) {
    try {
      const g0 = arbol(a.preset, a.semilla, false), g1 = arbol(a.preset, a.semilla, true);
      const h0 = new THREE.Box3().setFromObject(g0.scene).getSize(new THREE.Vector3()).y;
      const sp = new Especie(a.nombre, g0, g1, 6000, { near: a.near ?? 32, mid: a.mid ?? 160, far: a.far ?? 560, renderer });
      sp.alto = a.alto; sp.h0 = h0; idx[a.nombre] = especies.length; especies.push(sp); scene.add(sp.grupo);
    } catch (err) { datos.errores.push(a.nombre + ': ' + err.message); }
  }
  // reglas de siembra (mismas ideas que el valle; f = bosque, n = normal, d = distancia al río)
  const tam = (nombre, r) => { const sp = especies[idx[nombre]]; return (sp.alto[0] + r() * (sp.alto[1] - sp.alto[0])) / sp.h0; };
  const esc = (id, r) => { const s = especies[idx[id]].esc; return s[0] + r() * (s[1] - s[0]); };
  const ok = n => n in idx;
  const fuertes = ARBOLES.filter(a => a.peso > 0 && ok(a.nombre)), sumaP = fuertes.reduce((s, a) => s + a.peso, 0);
  const capasFlora = [
    { paso: 7, previo: (x, z, u) => u < 0.5, elegir(I, r, u) {   // árboles
      if (I.y < 1.5 || I.n.y < 0.62) return null;
      if (ok('pino') && I.y > 150 && I.f > 0.3 && I.n.y > 0.75 && u < 0.3) return { k: idx.pino, s: tam('pino', r), hundir: 0.3 };
      if (I.f > 0.5 && u < 0.24) { let w = r() * sumaP; const a = fuertes.find(q => (w -= q.peso) < 0) || fuertes[0]; return { k: idx[a.nombre], s: tam(a.nombre, r), hundir: 0.3 }; }
      if (I.n.y > 0.85 && Math.abs(I.f - 0.35) < 0.25 && u < 0.05) { const n = r() < 0.65 ? 'aliso' : 'arbusto'; return ok(n) ? { k: idx[n], s: tam(n, r), hundir: 0.2 } : null; }
      return null; } },
    { paso: 6, previo: (x, z, u) => u < 0.12, elegir(I, r, u) {   // plantas y rocas
      const v = r();
      if (I.y > -0.3 && I.y < 2.2 && I.d < 24 && v < 0.5) return ok('rock_moss_set_01') ? { k: idx.rock_moss_set_01, s: esc('rock_moss_set_01', r) } : null;
      if (I.n.y < 0.9 && I.n.y > 0.6 && I.y > 6 && v < 0.35) return ok('rock_moss_set_02') ? { k: idx.rock_moss_set_02, s: esc('rock_moss_set_02', r) } : null;
      if (I.y < 1.2) return null;
      if (I.f > 0.45 && I.n.y > 0.8) { const id = v < 0.75 ? 'fern_02' : v < 0.88 ? 'dry_branches_medium_01' : 'tree_stump_01'; return ok(id) ? { k: idx[id], s: esc(id, r) } : null; }
      if (I.f < 0.2 && I.n.y > 0.9 && v < 0.3) return ok('shrub_02') ? { k: idx.shrub_02, s: esc('shrub_02', r) } : null;
      return null; } },
  ];
  const lejanas = ['roble', 'fresno', 'aliso', 'pino'].filter(ok).map(n => ({ k: idx[n], sp: especies[idx[n]] })).filter(q => q.sp.l2);
  flora = new Flora(capasFlora, especies, lejanas, { RN: 560, LZ: 2700, nLejos: movil ? 14 : 20 });
  scene.add(flora.grupo);

  // inicio: junto al río 0, mirando aguas abajo
  const z0 = 0, x0 = envolver(rioU(0, z0) + 24);
  cam.position.set(x0, alturaFn(x0, z0) + 1.65, z0);
  progreso(0.93, 'Sembrando el tubo…'); await new Promise(r => setTimeout(r, 30));
  { const t0 = performance.now(); flora.actualizar(cam.position, Infinity); datos.cargados.push(`flora: ${flora.stats.cerca} cerca, ${flora.stats.lejos} lejos, ${Math.round(performance.now() - t0)} ms`); }

  const [deer, stag] = await fauna;
  manada = new Manada(terr, () => Math.random()); scene.add(manada.grupo);
  const prado = new THREE.Vector3(envolver(rioU(0, -40) + 40), 0, -40);
  if (deer) manada.agregar(deer, 3, prado, 1.35);
  if (stag) manada.agregar(stag, 1, prado, 1.95);
  manada.grupo.traverse(o => { if (o.isMesh) hacerCurvo(o.material); });

  controles = crearControles(cam, renderer.domElement, terr, WATER_Y);
  cielo.estado.suelo = (x, z) => alturaFn(x, z);
  controles.mirarA(envolver(rioU(0, -150)), 6, -150);
  montarComposer();
  ponerHora(+$('hora').value);
  progreso(1, 'Listo');
  setTimeout(() => $('cargando').classList.add('fuera'), 300);
  datos.listo = true;
}

function actualizarNiebla() {
  const n = niebla && niebla.material.uniforms, el = cielo.estado.elev, k = THREE.MathUtils.smoothstep(el, -3, 25), warm = 1 - THREE.MathUtils.smoothstep(el, 2, 30);
  if (!n) return;
  n.uSun.value.copy(cielo.estado.dir);
  n.uFog.value.setRGB(0.42 + 0.14 * warm, 0.5, 0.58 - 0.12 * warm).multiplyScalar(0.06 + 0.6 * k);   // aire del tubo iluminado: el fondo a lo largo del eje es bruma clara
  n.uSunCol.value.setRGB(1, 0.93 - 0.32 * warm, 0.85 - 0.55 * warm).multiplyScalar(0.15 + 0.6 * k);
  n.uDens.value = 0.0013 + 0.004 * warm; n.uDist.value = 0.00022;
  n.uLuz.value = 0.15 + 0.85 * k;
  scene.background = n.uFog.value;
}
function ponerHora(h) { cielo.setHora(h, cam.position); actualizarNiebla(); $('hora-v').textContent = fmtHora(h); }

// ---------- interfaz ----------
$('hora').addEventListener('input', ev => { if (datos.listo) ponerHora(+ev.target.value); });
const fmtHora = h => `${Math.floor(h)}:${String(Math.round((h % 1) * 60)).padStart(2, '0')}`;
for (const b of document.querySelectorAll('[data-q]')) b.addEventListener('click', () => ponerCalidad(b.dataset.q));
function ponerCalidad(q) {
  calidad = q; document.querySelectorAll('[data-q]').forEach(b => b.classList.toggle('on', b.dataset.q === q));
  if (!terrMat) return;
  terrMat.defines.TRIPLANAR = q === 'baja' ? 0 : 1; terrMat.needsUpdate = true;
  escala = 0; pasto.calidad(q); montarComposer();
}
document.querySelectorAll('[data-q]').forEach(b => b.classList.toggle('on', b.dataset.q === calidad));
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
addEventListener('resize', () => { cam.aspect = innerWidth / innerHeight; cam.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight); if (composer) montarComposer(); });

// ---------- bucle ----------
let tPrev = performance.now(), t = 0, fpsN = 0, fpsT = 0, ultimoCambio = 0, peor = 0; const fpsHist = [];
const frustum = new THREE.Frustum(), pv = new THREE.Matrix4();
let elevPrev = 0;
function frame() {
  const now = performance.now(), dtr = (now - tPrev) / 1000, dt = Math.min(dtr, 0.1); tPrev = now; t += dt; peor = Math.max(peor, dtr);
  renderer.info.reset();
  if (datos.listo) {
    controles.update(dt);
    CURVA.uDoblez.value.x = cam.position.x; U_CAM.value.copy(cam.position);
    cerca.update(cam.position);
    cielo.update(t, cam.position); if (Math.abs(cielo.estado.elev - elevPrev) > 0.2) { elevPrev = cielo.estado.elev; actualizarNiebla(); }
    agua.update(t); pasto.update(t, cam.position);
    manada.update(dt, cam.position);
    flora.actualizar(cam.position, 4);
    cam.updateMatrixWorld(); frustum.setFromProjectionMatrix(pv.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    for (const s of especies) s.actualizar(cam.position, frustum, CALIDAD[calidad].lod, doblar);
    niebla.material.uniforms.uTime.value = t; VIENTO.value = t;
    niebla.material.uniforms.uAgua.value = controles.st.bajoAgua ? 1 : 0;
    document.body.classList.toggle('nadando', controles.st.nadando && !controles.st.volar);
    composer.render(dt);
    fpsN++; fpsT += dt;
    if (fpsT >= 1) {
      const fps = fpsN / fpsT, { max, min } = rango();
      fpsHist.push(fps); if (fpsHist.length > 3) fpsHist.shift();
      if (!datos.fija && t > 4 && t - ultimoCambio > 3 && fpsHist.length === 3) {
        const prom = fpsHist.reduce((a, b) => a + b) / 3, cand = ESCALONES.filter(e => e >= min - 1e-6 && e <= max + 1e-6);
        let k = cand.findIndex(e => e >= escala - 1e-6); if (k < 0) k = cand.length - 1;
        const nk = prom < 46 ? k - 1 : prom > 58 ? k + 1 : k;
        if (nk !== k && nk >= 0 && nk < cand.length) { escala = cand[nk]; aplicarEscala(); ultimoCambio = t; fpsHist.length = 0; }
      }
      const [iw, ih] = tamInterno(), i = renderer.info.render; $('fps').textContent = `${Math.round(fps)} FPS · peor ${Math.round(peor * 1000)} ms · ${iw}×${ih} · ${(i.triangles / 1e6).toFixed(2)} M tri`;
      if (controles.st.volar) $('alt').textContent = `${Math.round(cam.position.y - Math.max(alturaFn(cam.position.x, cam.position.z), 0))} m sobre el suelo · ${Math.round(controles.st.vel * 3.6)} km/h · ${Math.round(R - cam.position.y)} m al eje`;
      peor = 0; datos.fps = fps; datos.calls = i.calls; datos.tris = i.triangles; fpsN = 0; fpsT = 0;
    }
  }
  requestAnimationFrame(frame);
}
renderer.info.autoReset = false;
iniciar().catch(e => { datos.errores.push(String(e && e.stack || e)); $('cargando-txt').textContent = 'Error: ' + e.message; console.error(e); });
requestAnimationFrame(frame);

// para pruebas automáticas y capturas
datos.vista = (x, z, lx, ly, lz, hora) => { ponerModo(false); cam.position.set(x, 0, z); controles.st.y = null; controles.update(0); controles.mirarA(lx, ly, lz); controles.update(0); if (hora != null) ponerHora(hora); };
datos.mirarVuelo = (x, y, z, lx, ly, lz, hora) => { ponerModo(true); cam.position.set(x, y, z); controles.mirarA(lx, ly, lz); controles.st.y = y; controles.update(0); if (hora != null) ponerHora(hora); };
Object.assign(datos, { calidad: ponerCalidad, cam, renderer, ctl: () => controles, flora: () => flora, alturaFn, rioU, C, R, escala: e => { escala = e; aplicarEscala(); }, hora: ponerHora });
