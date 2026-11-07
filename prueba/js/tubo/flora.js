// Vegetación infinita: el tubo se divide en celdas de ~98 m (64 alrededor de la vuelta, infinitas a lo largo).
// Cada celda se siembra de forma determinista (misma semilla → mismos árboles siempre) y se guarda en caché.
//  · Celdas cercanas (≤ RN): siembra densa, una lista por especie con niveles de detalle (Especie).
//  · Celdas lejanas (hasta ±LZ a lo largo y toda la vuelta, incluido el "techo"): pocos árboles pintados (imposters).
// Generar una celda cuesta ~1–2 ms: al moverse se generan pocas por cuadro para no trabar la imagen.
import * as THREE from 'three';
import { C, alturaFn, bosqueFn, distRio, envolver } from './mundo.js';
import { hash3 } from './ruido3.js';
import { rng } from '../ruido.js';

const NC = 64, G = C / NC;

export class Flora {
  /** capas: [{ paso, elegir(info, rnd) → {k, s} | null }]; especies: Especie[]; lejanas: [{ k, sp }] con imposter. */
  constructor(capas, especies, lejanas, opts = {}) {
    this.capas = capas; this.especies = especies; this.lejanas = lejanas;
    this.RN = opts.RN ?? 560; this.LZ = opts.LZ ?? 2700; this.nLejos = opts.nLejos ?? 20;
    this.cerca = new Map(); this.lejos = new Map(); this.cola = []; this.celda = null; this.sucio = false;
    this.grupo = new THREE.Group(); this.ims = lejanas.map(() => null); this.stats = { cerca: 0, lejos: 0, ms: 0 };
  }
  semilla(i, j, t) { return Math.floor(hash3(i, j, t) * 4294967296); }
  info(x, z) {
    const y = alturaFn(x, z), e = 1, a = alturaFn(x + e, z), b = alturaFn(x, z + e), l = Math.hypot(y - a, e, y - b);
    return { x, z, y, n: { x: (y - a) / l, y: e / l, z: (y - b) / l }, f: bosqueFn(x, z, y), d: distRio(x, z) };
  }
  genCerca(i, j) {
    const out = [];
    this.capas.forEach((cp, t) => {
      const r = rng(this.semilla(i, j, 11 + t)), n = Math.round(G / cp.paso), p = G / n;
      for (let b = 0; b < n; b++) for (let a = 0; a < n; a++) {
        const x = i * G + (a + r()) * p, z = j * G + (b + r()) * p, u = r();
        if (cp.previo && !cp.previo(x, z, u)) continue;
        const inf = this.info(x, z), e = cp.elegir(inf, r, u); if (!e) continue;
        out.push({ k: e.k, x, y: inf.y - (e.hundir ?? 0.15), z, ry: r() * 6.283, s: e.s });
      }
    });
    return out;
  }
  genLejos(i, j) {
    const r = rng(this.semilla(i, j, 99)), out = [];
    for (let t = 0; t < this.nLejos; t++) {
      const x = (i + r()) * G, z = (j + r()) * G, y = alturaFn(x, z), f = bosqueFn(x, z, y), u = r();
      if (f < 0.3 || u > f * f) continue;
      const a = alturaFn(x + 6, z), b = alturaFn(x, z + 6); if (6 / Math.hypot(y - a, 6, y - b) < 0.62) continue;
      const L = this.lejanas, alto = L.findIndex(q => q.sp.nombre === 'pino');
      const q = y > 150 && alto >= 0 && r() < 0.75 ? alto : Math.floor(r() * L.length), sp = L[q].sp;
      out.push({ q, x, y: y - 1.5, z, ry: r() * 6.283, s: (sp.alto[0] + r() * (sp.alto[1] - sp.alto[0])) / sp.h0 * 1.35 });
    }
    return out;
  }
  /** Celdas que necesita la posición de la cámara (i envuelto en 0..63, j libre). */
  necesarias(cam) {
    const ci = Math.floor(cam.x / G), cj = Math.floor(cam.z / G), cerca = [], lejos = [], rc = Math.ceil(this.RN / G) + 1, rz = Math.ceil(this.LZ / G);
    for (let dj = -rz; dj <= rz; dj++) for (let di = -NC / 2; di < NC / 2; di++) {
      const i = ci + di, j = cj + dj, cx = envolver((i + 0.5) * G, cam.x) - cam.x, cz = (j + 0.5) * G - cam.z;
      const k = (((i % NC) + NC) % NC) + ',' + j;
      if (Math.abs(di) <= rc && Math.abs(dj) <= rc && Math.hypot(cx, cz) <= this.RN) cerca.push(k); else lejos.push(k);
    }
    return { cerca, lejos, id: ci + ',' + cj };
  }
  /** Llamar cada cuadro. presupuesto en ms (Infinity = todo ya, para la carga). */
  actualizar(cam, presupuesto = 5) {
    const t0 = performance.now(), nec = this.necesarias(cam);
    if (nec.id !== this.celda) { this.celda = nec.id; this.nec = nec; this.sucio = true; }
    if (!this.sucio) return false;
    const { cerca, lejos } = this.nec;
    for (const [lista, mapa, gen] of [[cerca, this.cerca, 'genCerca'], [lejos, this.lejos, 'genLejos']]) for (const k of lista) {
      if (mapa.has(k)) continue;
      if (performance.now() - t0 > presupuesto) return false;   // sigue en el próximo cuadro
      const [i, j] = k.split(',').map(Number); mapa.set(k, this[gen](i, j));
    }
    this.reconstruir(cam); this.sucio = false; this.stats.ms = performance.now() - t0;
    if (this.cerca.size > 900) this.cerca.clear();   // caché acotada (se regenera igual: es determinista)
    if (this.lejos.size > 20000) this.lejos.clear();
    return true;
  }
  reconstruir(cam) {
    const listas = this.especies.map(() => []);
    for (const k of this.nec.cerca) for (const it of this.cerca.get(k)) listas[it.k].push({ ...it, x: envolver(it.x, cam.x) });
    listas.forEach((L, k) => this.especies[k].colocar(L));
    this.stats.cerca = listas.reduce((a, L) => a + L.length, 0);
    const lj = this.lejanas.map(() => []);
    for (const k of this.nec.lejos) for (const it of this.lejos.get(k)) lj[it.q].push(it);
    const q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3(), M = new THREE.Matrix4();
    this.stats.lejos = 0;
    lj.forEach((L, n) => {
      let im = this.ims[n];
      if (!im || im.userData.max < L.length) {
        if (im) { this.grupo.remove(im); im.dispose(); }
        const src = this.lejanas[n].sp.l2[0], max = Math.ceil(L.length * 1.4 + 500);
        im = new THREE.InstancedMesh(src.geometry, src.material, max); im.userData.max = max;
        im.frustumCulled = false; im.castShadow = false; im.receiveShadow = false; this.grupo.add(im); this.ims[n] = im;
      }
      L.forEach((p, i) => { e.set(0, p.ry, 0); q.setFromEuler(e); im.setMatrixAt(i, M.compose(v.set(envolver(p.x, cam.x), p.y, p.z), q, s.setScalar(p.s))); });
      im.count = L.length; im.instanceMatrix.needsUpdate = true; this.stats.lejos += L.length;
    });
  }
}
