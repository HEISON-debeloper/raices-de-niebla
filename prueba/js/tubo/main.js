// Raíces de Niebla · prueba gráfica: mundo-tubo v2 (cilindro de O'Neill, radio 1 km, infinito a lo largo del eje).
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { OPC } from '../materiales.js';
import { R, C, alturaFn, aguaFn, normalFn, rioU, envolver, datos as datosMundo } from './mundo.js';
import { CURVA, hacerCurvo } from './curva.js';
import { crearNiveles, crearTerreno, materialTerreno, U_CAM } from './terreno.js';
import { crearAgua } from './agua.js';
import { crearCielo } from './cielo.js';
import { Flora } from './flora.js';
import { crearControles } from './controles.js';
import { crearPasto } from '../pasto.js';
import { PaseNiebla } from '../niebla.js';
import { Especie, VIENTO } from '../vegetacion.js';
import { Manada } from '../animales.js';
import { Tree } from '../../vendor/ez-tree.es.js';
import { ARBOLES, MODELOS, reglasFlora } from './especies.js';

OPC.curvo = true;   // todos los materiales se enrollan en el tubo

const TEX = { grass: 'rocky_terrain_02', forest: 'brown_mud_leaves_01', rock: 'aerial_rocks_02', bank: 'coast_sand_rocks_02', paramo: 'aerial_grass_rock' };
function arbol(preset, semilla, lejos) {
  const t = new Tree(); t.loadPreset(preset); t.options.seed = semilla;
  if (lejos) { const b = t.options.branch; for (const k in b.segments) b.segments[k] = 3; for (const k in b.sections) b.sections[k] = Math.max(1, Math.round(b.sections[k] * 0.3)); t.options.leaves.count = Math.round(t.options.leaves.count * 0.25); t.options.leaves.size *= 2.2; }   // versión lejana: ~1/6 de los triángulos
  t.generate(); t.updateMatrixWorld(true); return { scene: t };
}
const CALIDAD = {
  alta: { dpr: 2, min: 1, msaa: 4, sombra: 2048, lod: 0.85 },
  media: { dpr: 1.5, min: 0.8, msaa: 2, sombra: 1536, lod: 0.6 },
  baja: { dpr: 1, min: 0.6, msaa: 0, sombra: 1024, lod: 0.4 },
};

const $ = id => document.getElementById(id);
const progreso = (k, txt) => { $('barra').style.width = (k * 100).toFixed(0) + '%'; if (txt) $('cargando-txt').textContent = txt; };
const movil = matchMedia('(pointer: coarse)').matches;
let calidad = new URLSearchParams(location.search).get('calidad') || (movil ? 'media' : 'alta');
if (movil) document.body.classList.add('movil');

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setSize(innerWidth, innerHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 0.62;
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
$('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
const cam = new THREE.PerspectiveCamera(62, innerWidth / innerHeight, 0.15, 6000);
cam.layers.enable(1);
const terr = { heightAt: alturaFn, waterAt: aguaFn, normalAt: (x, z) => { const n = normalFn(x, z); return new THREE.Vector3(n.x, n.y, n.z); } };
const cielo = crearCielo(renderer, scene);
const niveles = crearNiveles(renderer);
const agua = crearAgua(niveles.niveles); scene.add(agua.grupo);

// ---------- posproceso (resolución dinámica sin parpadeo, como el valle) ----------
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
const paso = (p, txt) => { total++; return p.then(r => { hechos++; progreso(hechos / total * 0.6, txt); return r; }); };
const respiro = () => new Promise(r => setTimeout(r, 0));

let terrMats, pasto, manada, controles, flora; const especies = [], idx = {};
const datos = { listo: false, errores: [], cargados: [], fija: new URLSearchParams(location.search).has('fija') };
window.__escena = datos;

async function iniciar() {
  progreso(0.02, 'Enrollando el mundo…');
  const T = {};
  const capas = Object.entries(TEX).map(([k, id]) => Promise.all([
    paso(tex(`assets/tex/${id}/Diffuse.webp`, true), 'Texturas del suelo…'), paso(tex(`assets/tex/${id}/nor_gl.webp`)),
  ]).then(([d, n]) => { T[k] = { d, n }; }));
  const glb = id => paso(cargarModelo(`assets/models/${id}`), 'Plantas y rocas…').catch(e => { datos.errores.push(id + ': ' + e.message); return null; });
  const modelos = MODELOS.map(e => Promise.all([glb(e.id), glb(e.id + '_lod1')]).then(([a, b]) => ({ e, a, b })));
  const fauna = Promise.all(['deer', 'stag'].map(k => paso(cargarModelo(`assets/animales/${k}`), 'Animales…').catch(e => { datos.errores.push(k + ': ' + e.message); return null; })));
  await Promise.all(capas);

  terrMats = niveles.niveles.map(N => materialTerreno(T, calidad, N));
  scene.add(crearTerreno(terrMats));
  pasto = crearPasto(null, new THREE.Vector4(), null, new THREE.Vector4(), niveles.niveles[0]); pasto.calidad(calidad); scene.add(pasto.mesh);

  for (const { e, a, b } of await Promise.all(modelos)) {
    if (!a) continue;
    const sp = new Especie(e.id, a, b, e.caps || [400, 2500, 6000], { near: e.near, mid: e.mid, far: e.far, sombraLejos: e.sombraLejos, renderer });
    if (e.near <= 15) sp.grupo.traverse(o => o.layers.set(1));
    sp.esc = e.esc; idx[e.id] = especies.length; especies.push(sp); scene.add(sp.grupo);
    datos.cargados.push(`${e.id}: ${Math.round(sp.tris[0])} / ${Math.round(sp.tris[1])} tri`);
  }
  let n = 0;
  for (const a of ARBOLES) {
    progreso(0.6 + 0.3 * (n++ / ARBOLES.length), `Creciendo ${a.nombre}…`); await respiro();
    try {
      const t0 = performance.now(), g0 = arbol(a.preset, a.semilla, false), g1 = arbol(a.preset, a.semilla, true);
      const h0 = new THREE.Box3().setFromObject(g0.scene).getSize(new THREE.Vector3()).y;
      const sp = new Especie(a.id, g0, g1, a.caps || [300, 2000, 6000], { near: a.near, mid: a.mid, far: a.far, renderer });
      sp.alto = a.alto; sp.h0 = h0; idx[a.id] = especies.length; especies.push(sp); scene.add(sp.grupo);
      datos.cargados.push(`${a.id}: ${Math.round(sp.tris[0])} / ${Math.round(sp.tris[1])} tri, ${h0.toFixed(1)} u, ${Math.round(performance.now() - t0)} ms`);
    } catch (err) { datos.errores.push(a.id + ': ' + err.message); }
  }
  const lejanas = ['roble', 'fresno', 'aliso', 'pino', 'roble_g', 'pino_g'].filter(k => k in idx).map(k => ({ sp: especies[idx[k]] })).filter(q => q.sp.l2);
  flora = new Flora(reglasFlora(idx, especies), especies, lejanas, { RN: 500, LZ: 2700, nLejos: movil ? 18 : 26 });
  scene.add(flora.grupo);

  // inicio: junto al río grande, mirando aguas abajo
  const z0 = 0, x0 = envolver(rioU(0, z0) + 40);
  controles = crearControles(cam, renderer.domElement, terr);
  controles.poner(x0, alturaFn(x0, z0) + 1.65, z0);
  progreso(0.92, 'Sembrando el tubo…'); await respiro();
  { const t0 = performance.now(); flora.generar(cam.position, Infinity); datos.cargados.push(`flora: ${flora.stats.cerca} cerca, ${flora.stats.lejos} lejos, ${Math.round(performance.now() - t0)} ms`); }
  // un sitio despejado para aparecer: sin plantas ni rocas a menos de 4 m, fuera del agua
  for (let t = 0; t < 200; t++) { const x = x0 + (t % 2 ? 1 : -1) * Math.ceil(t / 2) * 3, z = z0 + ((t * 7) % 11 - 5) * 2; const D = datosMundo(x, z); if (D.h > D.W + 0.5 && flora.despejado(x, z, 4)) { controles.poner(envolver(x), D.h + 1.65, z); break; } }

  const [deer, stag] = await fauna;
  manada = new Manada(terr, () => Math.random()); scene.add(manada.grupo);
  const prado = new THREE.Vector3(envolver(rioU(0, -40) + 60), 0, -40);
  if (deer) manada.agregar(deer, 3, prado, 1.35);
  if (stag) manada.agregar(stag, 1, prado, 1.95);
  manada.grupo.traverse(o => { if (o.isMesh) hacerCurvo(o.material); });

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
  n.uFog.value.setRGB(0.46 + 0.16 * warm, 0.56, 0.7 - 0.16 * warm).multiplyScalar(0.05 + 0.5 * k);   // aire del tubo iluminado: bruma azulada
  n.uSunCol.value.setRGB(1, 0.93 - 0.32 * warm, 0.85 - 0.55 * warm).multiplyScalar(0.15 + 0.6 * k);
  n.uDens.value = 0.0013 + 0.004 * warm; n.uDist.value = 0.00014;
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
  if (!terrMats) return;
  for (const m of terrMats) { m.defines.TRIPLANAR = q === 'baja' ? 0 : 1; m.needsUpdate = true; }
  escala = 0; pasto.calidad(q); montarComposer();
}
document.querySelectorAll('[data-q]').forEach(b => b.classList.toggle('on', b.dataset.q === calidad));
const vel = $('vel');
function ponerModo(volar) {
  if (controles.st.volar && !volar) controles.soltar();   // al apagar el vuelo se cae
  controles.st.volar = volar; document.body.classList.toggle('volando', volar);
  document.querySelectorAll('[data-modo]').forEach(b => b.classList.toggle('on', (b.dataset.modo === 'volar') === volar));
  if (!volar) $('alt').textContent = '';
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
    niveles.update(cam.position);
    cielo.update(t, cam.position); if (Math.abs(cielo.estado.elev - elevPrev) > 0.2) { elevPrev = cielo.estado.elev; actualizarNiebla(); }
    agua.update(t); pasto.update(t, cam.position);
    manada.update(dt, cam.position);
    flora.generar(cam.position, 4);
    cam.updateMatrixWorld(); frustum.setFromProjectionMatrix(pv.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    flora.dibujar(cam.position, frustum, CALIDAD[calidad].lod);
    const nu = niebla.material.uniforms; nu.uTime.value = t; VIENTO.value = t;
    nu.uAgua.value = controles.st.bajoAgua ? 1 : 0; nu.uAguaY.value = controles.st.agua;
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
      if (controles.st.volar) $('alt').textContent = `${Math.round(cam.position.y - Math.max(alturaFn(cam.position.x, cam.position.z), controles.st.agua))} m sobre el suelo · ${Math.round(controles.st.vel * 3.6)} km/h · ${Math.round(R - cam.position.y)} m al eje`;
      peor = 0; datos.fps = fps; datos.calls = i.calls; datos.tris = i.triangles; fpsN = 0; fpsT = 0;
    }
  }
  requestAnimationFrame(frame);
}
renderer.info.autoReset = false;
iniciar().catch(e => { datos.errores.push(String(e && e.stack || e)); $('cargando-txt').textContent = 'Error: ' + e.message; console.error(e); });
requestAnimationFrame(frame);

// para pruebas automáticas y capturas
datos.vista = (x, z, lx, ly, lz, hora) => { ponerModo(false); controles.poner(x, alturaFn(x, z) + 1.65, z); controles.update(0); controles.mirarA(lx, ly, lz); if (hora != null) ponerHora(hora); };
datos.mirarVuelo = (x, y, z, lx, ly, lz, hora) => { ponerModo(true); controles.poner(x, y, z); controles.mirarA(lx, ly, lz); controles.update(0); if (hora != null) ponerHora(hora); };
Object.assign(datos, { calidad: ponerCalidad, cam, renderer, ctl: () => controles, flora: () => flora, niveles, especies, alturaFn, aguaFn, datosMundo, rioU, C, R, escala: e => { escala = e; aplicarEscala(); }, hora: ponerHora, modo: ponerModo });
