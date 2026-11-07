// Vegetación y rocas infinitas: el tubo se divide en celdas de ~98 m (64 alrededor de la vuelta, infinitas a lo largo).
// Cada celda se siembra de forma determinista (misma semilla → mismos árboles siempre) y se guarda en caché.
//  · Celdas cercanas (≤ RN): siembra densa por capas (árboles, sotobosque, rocas) con reglas por bioma; cada cuadro
//    solo se recorren las celdas que caen en la vista (recorte por celda, no por planta) y cada planta se reparte
//    entre detalle cercano, lejano e imposter según la distancia (Especie.agregar).
//  · Celdas lejanas (hasta ±LZ a lo largo y toda la vuelta, incluido el "techo"): árboles pintados (imposters).
// Generar una celda cuesta unos ms: al moverse se generan pocas por cuadro para no trabar la imagen.
import * as THREE from 'three';
import { C, datos, alturaFn, normalFn } from './mundo.js';
import { hash3 } from './ruido3.js';
import { rng } from '../ruido.js';
import { doblarCPU } from './curva.js';

const NC = 64, G = C / NC, RC = G * 0.71;

export class Flora {
  /** capas: [{ paso, previo(x,z,u)?, elegir(I, rnd, u) → {k, s, hundir?} | null }]; especies: Especie[]; lejanas: [{ sp }]. */
  constructor(capas, especies, lejanas, opts = {}) {
    this.capas = capas; this.especies = especies; this.lejanas = lejanas;
    this.RN = opts.RN ?? 500; this.LZ = opts.LZ ?? 2700; this.nLejos = opts.nLejos ?? 26;
    this.cerca = new Map(); this.lejos = new Map(); this.celda = null; this.sucio = false;
    this.grupo = new THREE.Group(); this.ims = lejanas.map(() => null); this.stats = { cerca: 0, lejos: 0, ms: 0, visibles: 0, celdas: 0 };
    this.tmpV = new THREE.Vector3(); this.sph = new THREE.Sphere();
  }
  semilla(i, j, t) { return Math.floor(hash3(i, j, t) * 4294967296); }
  /** Datos del punto para las reglas; la normal se calcula solo si alguna regla la pide. */
  info(x, z) {
    const D = datos(x, z); D.x = x; D.z = z; D.y = D.h; D.d = D.rio.d; D.w = D.rio.w;
    let n = null; Object.defineProperty(D, 'n', { get() { return n || (n = normalFn(x, z)); } });
    return D;
  }
  /** Siembra de una celda cercana, por partes (generador): rinde cada 48 candidatos para repartir el trabajo entre cuadros. */
  *genCerca(i, j) {
    const out = [], chicos = []; let n = 0;
    for (let t = 0; t < this.capas.length; t++) {
      const cp = this.capas[t], r = rng(this.semilla(i, j, 11 + t)), nn = Math.round(G / cp.paso), p = G / nn;
      for (let b = 0; b < nn; b++) for (let a = 0; a < nn; a++) {
        const x = i * G + (a + r()) * p, z = j * G + (b + r()) * p, u = r();
        if (cp.previo && !cp.previo(x, z, u)) continue;
        if (++n % 48 === 0) yield null;
        const I = this.info(x, z), e = cp.elegir(I, r, u); if (!e) continue;
        const sp = this.especies[e.k], it = { k: e.k, M: null, p: new THREE.Vector3(x, I.y - (e.hundir ?? 0.12), z) };
        const q = new THREE.Quaternion().setFromEuler(new THREE.Euler(e.inclinar ? (r() - 0.5) * 0.25 : 0, r() * 6.2832, e.inclinar ? (r() - 0.5) * 0.25 : 0));
        it.M = new THREE.Matrix4().compose(it.p, q, new THREE.Vector3(e.s, e.s, e.s));
        (sp.far <= 220 ? chicos : out).push(it);
      }
    }
    let ys = 0; for (const it of out) ys += it.p.y; for (const it of chicos) ys += it.p.y;
    const nAll = out.length + chicos.length, cy = nAll ? ys / nAll : alturaFn((i + 0.5) * G, (j + 0.5) * G);
    return { grandes: out, chicos, cx: (i + 0.5) * G, cz: (j + 0.5) * G, cy };
  }
  genLejos(i, j) {
    const r = rng(this.semilla(i, j, 99)), out = [], L = this.lejanas, alto = L.findIndex(q => q.sp.nombre.startsWith('pino'));
    for (let t = 0; t < this.nLejos; t++) {
      const x = (i + r()) * G, z = (j + r()) * G, D = datos(x, z), u = r();
      if (D.bosque < 0.3 || u > D.bosque * D.bosque) continue;
      const a = alturaFn(x + 6, z), b = alturaFn(x, z + 6); if (6 / Math.hypot(D.h - a, 6, D.h - b) < 0.62) continue;
      const q = D.h > 180 && alto >= 0 && r() < 0.75 ? alto : Math.floor(r() * L.length), sp = L[q].sp;
      out.push({ q, x, y: D.h - 1.5, z, ry: r() * 6.283, s: (sp.alto[0] + r() * (sp.alto[1] - sp.alto[0])) / sp.h0 * 1.35 });
    }
    return out;
  }
  /** ¿No hay ninguna planta ni roca a menos de r metros? (para elegir dónde aparece el jugador) */
  despejado(x, z, r = 4) {
    const ci = Math.floor(x / G), cj = Math.floor(z / G);
    for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
      const k = ((((ci + di) % NC) + NC) % NC) + ',' + (cj + dj), cel = this.cerca.get(k); if (!cel) continue;
      for (const L of [cel.grandes, cel.chicos]) for (const it of L) { const dx = it.p.x - x - C * Math.round((it.p.x - x) / C); if (dx * dx + (it.p.z - z) ** 2 < r * r) return false; }
    }
    return true;
  }
  /** Celdas cercanas que necesita la posición de la cámara (i envuelto en 0..63, j libre). */
  necesarias(cam) {
    const ci = Math.floor(cam.x / G), cj = Math.floor(cam.z / G), cerca = [], rc = Math.ceil(this.RN / G) + 1;
    for (let dj = -rc; dj <= rc; dj++) for (let di = -rc; di <= rc; di++) {
      const i = ci + di, j = cj + dj, cx = (i + 0.5) * G - cam.x, cz = (j + 0.5) * G - cam.z;
      if (Math.hypot(cx - C * Math.round(cx / C), cz) <= this.RN) cerca.push((((i % NC) + NC) % NC) + ',' + j);
    }
    return { cerca, id: ci + ',' + cj };
  }
  /** Celdas lejanas (toda la vuelta, ±LZ a lo largo), menos las cercanas. Se recalculan cada 300 m: de lejos no se nota. */
  lejanasDe(cam, cerca) {
    const ci = Math.floor(cam.x / G), cj = Math.floor(cam.z / G), rz = Math.ceil(this.LZ / G), set = new Set(cerca), lejos = [];
    for (let dj = -rz; dj <= rz; dj++) for (let di = -NC / 2; di < NC / 2; di++) { const k = ((((ci + di) % NC) + NC) % NC) + ',' + (cj + dj); if (!set.has(k)) lejos.push(k); }
    return lejos;
  }
  /** Generación por presupuesto (ms). presupuesto = Infinity al cargar. Devuelve true cuando todo está listo. */
  generar(cam, presupuesto = 4) {
    const t0 = performance.now(), nec = this.necesarias(cam);
    if (nec.id !== this.celda) { nec.lejos = this.nec ? this.nec.lejos : null; this.celda = nec.id; this.nec = nec; this.sucio = true; }
    if (!this.lejosPos || Math.hypot(cam.x - this.lejosPos.x - C * Math.round((cam.x - this.lejosPos.x) / C), cam.z - this.lejosPos.z) > 300) {
      this.lejosPos = { x: cam.x, z: cam.z }; this.nec.lejos = this.lejanasDe(cam, this.nec.cerca); this.sucioLejos = true; this.sucio = true;
    }
    if (!this.sucio) return true;
    const fin = () => performance.now() - t0 > presupuesto;
    for (const k of this.nec.cerca) {
      if (this.cerca.has(k)) continue;
      if (!this.enCurso || this.enCurso.k !== k) { const [i, j] = k.split(',').map(Number); this.enCurso = { k, it: this.genCerca(i, j) }; }
      let r; do { r = this.enCurso.it.next(); } while (!r.done && !fin());
      if (!r.done) return false;   // sigue en el próximo cuadro
      this.cerca.set(k, r.value); this.enCurso = null;
      if (fin()) return false;
    }
    if (this.sucioLejos) {
      for (const k of this.nec.lejos) {
        if (this.lejos.has(k)) continue;
        if (fin()) return false;
        const [i, j] = k.split(',').map(Number); this.lejos.set(k, this.genLejos(i, j));
      }
      this.reconstruirLejos(); this.sucioLejos = false;
    }
    this.sucio = false; this.stats.ms = performance.now() - t0;
    if (this.cerca.size > 400) this.cerca.clear();   // caché acotada (se regenera igual: es determinista)
    if (this.lejos.size > 20000) this.lejos.clear();
    return true;
  }
  /** Cada cuadro: recorte por celda y reparto de cada planta por distancia. */
  dibujar(cam, frustum, k = 1) {
    if (!this.nec || !this.nec.lejos) return;
    for (const sp of this.especies) sp.inicio(k);
    const v = this.tmpV, sph = this.sph; let vis = 0, nc = 0, nItems = 0;
    for (const key of this.nec.cerca) {
      const cel = this.cerca.get(key); if (!cel) continue;
      nItems += cel.grandes.length + cel.chicos.length;
      doblarCPU(cel.cx, cel.cy, cel.cz, cam.x, v); const d2c = v.distanceToSquared(cam);
      if (d2c > 150 * 150) { sph.center.copy(v); sph.radius = RC + 60; if (!frustum.intersectsSphere(sph)) continue; }
      nc++;
      const listas = d2c < 300 * 300 ? [cel.grandes, cel.chicos] : [cel.grandes];
      for (const L of listas) for (const it of L) {
        doblarCPU(it.p.x, it.p.y, it.p.z, cam.x, v); const d2 = v.distanceToSquared(cam);
        this.especies[it.k].agregar(it.M, d2); vis++;
      }
    }
    for (const sp of this.especies) sp.fin();
    this.stats.visibles = vis; this.stats.celdas = nc; this.stats.cerca = nItems;
  }
  reconstruirLejos() {
    const lj = this.lejanas.map(() => []);
    for (const k of this.nec.lejos || []) { const L = this.lejos.get(k); if (L) for (const it of L) lj[it.q].push(it); }
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
      L.forEach((p, i) => { e.set(0, p.ry, 0); q.setFromEuler(e); im.setMatrixAt(i, M.compose(v.set(p.x, p.y, p.z), q, s.setScalar(p.s))); });
      im.count = L.length; im.instanceMatrix.needsUpdate = true; this.stats.lejos += L.length;
    });
  }
}
