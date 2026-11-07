// Mundo-tubo v2 (cilindro de O'Neill): el suelo es la cara interior de un cilindro de radio R. Todo se calcula en
// coordenadas DESENROLLADAS: x = arco alrededor del tubo (periódico, C), y = altura (hacia el eje), z = a lo largo
// del eje (infinito). Solo al dibujar se enrolla (curva.js).
//
// Relieve (de grande a pequeño):
//  · 3 ríos principales a lo largo del eje (enorme, mediano, pequeño) que desembocan en MARES: anillos de agua que
//    rodean el tubo cada PZ metros. Entre ríos, cordilleras cuya altura varía por región (colinas ~180 m … nevados ~560 m).
//  · Lagos en las cumbres (uno por celda de ~1 km, si hay montaña) de los que baja un arroyo serpenteante hasta el
//    río más cercano, con cascadas; nacederos (manantiales) sin lago. Pantanos en los valles bajos y junto al mar.
//  · Volcanes de distintos tamaños con cráter y lago de lava.
// Las funciones existen dos veces, JS (caminar, nadar, sembrar) y GLSL (dibujar, en mundo-glsl.js) y deben
// coincidir: hay una prueba numérica (error medido < 2 cm).
import { fbm3, hash3 } from './ruido3.js';

export const R = 1000, C = 2 * Math.PI * R, WATER_Y = 0, RIOS = 3;
export const PZ = 16000, ZMAR = 8000, SW = 1500;
/** Mundo de pruebas: solo un tramo de 1 km a lo largo del eje, cerrado por las tapas del cilindro (muros hasta cerca del eje). */
export const ZMIN = -500, ZMAX = 500;
export const tapa = z => 880 * sm(0, 1, (Math.abs(z - (ZMIN + ZMAX) / 2) - (ZMAX - ZMIN) / 2 + 60) / 130);          // mares: periodo a lo largo del eje, centro, semiancho
export const NIEVE = 400, ARBOL_MAX = 320;                 // línea de nieve y límite de árboles (m)
const LX = C / 6, LZ = 1024, VX = C / 3, VZ = 1000;   // volcanes: una fila de celdas que coincide con el tramo de pruebas        // celdas de lagos y de volcanes
const ANCHO = [45, 16, 7], HONDO = [8, 5.5, 3];            // ríos principales: semiancho base y profundidad

const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const cl = (x, a, b) => Math.min(b, Math.max(a, x));
/** Lleva x al tramo [-C/2, C/2) alrededor de ref (el mundo se repite cada C en x). */
export const envolver = (x, ref = 0) => x - C * Math.floor((x - ref) / C + 0.5);
// ruido sobre la superficie del cilindro: periódico en x sin costura
const f = (x, z, s, ox, oy, oz, oct) => { const a = x / R; return fbm3(R * Math.cos(a) / s + ox, R * Math.sin(a) / s + oy, z / s + oz, oct); };

/** Centro del río principal k según z (en metros de arco). */
export const rioU = (k, z) => k * C / RIOS + 300 + 70 * Math.sin(z / 260 + k * 2.1) + 25 * Math.sin(z / 83 + k * 1.3);
/** Río principal más cercano: distancia en arco, índice y semiancho en este z. */
export function rio(x, z) {
  let m = 1e9, k = 0;
  for (let i = 0; i < RIOS; i++) { const d = Math.abs(envolver(x - rioU(i, z))); if (d < m) { m = d; k = i; } }
  return { d: m, k, w: ANCHO[k] * (0.8 + 0.4 * Math.sin(z / 350 + 2.1 * k)) };
}
/** Mar más cercano: distancia a su centro a lo largo del eje y máscara 0–1. */
export function mar(z) { const dz = Math.abs(z - (Math.round((z - ZMAR) / PZ) * PZ + ZMAR)); return { dz, m: 1 - sm(SW, SW + 600, dz) }; }

/** Relieve suave (sin detalle fino): base de las montañas, y nivel de referencia de lagos y arroyos. */
export function hsuave(x, z, r = rio(x, z)) {
  const d = r.d, t = cl((d - 60) / 1000, 0, 1);
  const reg = 0.85 + 0.3 * f(x, z, 1100, 7.3, -2.9, 1.1, 3), amp = 340 * (0.5 + 0.9 * f(x, z, 2600, -11.2, 4.4, 2.7, 2));
  let h = 1.2 + 0.03 * d + amp * Math.pow(t, 1.4) * reg;
  h += 45 * (f(x, z, 600, 3.3, -8.1, 5.5, 3) - 0.5) * sm(80, 400, d) + 18 * (f(x, z, 260, 1.7, 5.1, -3.3, 4) - 0.5) * sm(40, 320, d);
  const M = mar(z);
  if (M.m > 0) { const hm = -8 - 55 * (1 - sm(500, 1400, M.dz)) + 270 * Math.max(0, f(x, z, 700, -2.2, 6.6, -4.4, 3) - 0.62); h = h * (1 - M.m) + hm * M.m; }
  return h;
}

/** Lago (o nacedero) de la celda (i, j), o null. Determinista: misma celda → mismo lago. */
const cacheLagos = new Map();
export function lago(i, j) {
  const key = i + ',' + j; if (cacheLagos.has(key)) return cacheLagos.get(key);
  let L = null; const im = i - 6 * Math.floor(i / 6), p = hash3(im, j, 501);
  if (p < 0.8) {
    const nac = p >= 0.62, cx = (i + 0.15 + 0.7 * hash3(im, j, 502)) * LX, cz = (j + 0.15 + 0.7 * hash3(im, j, 503)) * LZ;
    const rr = rio(cx, cz), hc = hsuave(cx, cz, rr);
    if (mar(cz).dz > SW + 900 && rr.d > 260 && hc > 80 && Math.abs(cz) < 330) {
      const dx = envolver(rioU(rr.k, cz) - cx), sgn = dx < 0 ? -1 : 1, rL = nac ? 3 : 30 + 70 * hash3(im, j, 504);
      const nF = Math.floor(hash3(im, j, 509) * 3), Len = Math.abs(dx) - rr.w * 0.5;
      // nivel = el punto más bajo del contorno (aguas abajo y a los lados): el terreno contiene el agua sin presas gigantes
      const rr2 = rL + 20, hs = (px, pz) => hsuave(px, pz);
      const Lv = Math.min(hc - (nac ? 0.8 : 6), hs(cx + sgn * rr2, cz) - 1, hs(cx, cz + rr2) - 1, hs(cx, cz - rr2) - 1);
      L = { cx, cz, rL, L: Lv, sgn, Len, ws: 1.5 + 3 * hash3(im, j, 505), ds: 1 + 0.9 * hash3(im, j, 506),
        f1: hash3(im, j, 507) * 6.2832, f2: hash3(im, j, 508) * 6.2832, nF,
        sF: [Len * (0.2 + 0.3 * hash3(im, j, 510)), Len * (0.55 + 0.3 * hash3(im, j, 512))], HF: [6 + 18 * hash3(im, j, 511), 6 + 18 * hash3(im, j, 513)] };
    }
  }
  cacheLagos.set(key, L); return L;
}
/** ¿Algún lago o arroyo pasa por el círculo (cx, cz, rV)? (los volcanes no se ponen encima) */
function lagoCerca(cx, cz, rV) {
  const li = Math.floor(cx / LX), lj = Math.floor(cz / LZ);
  for (let dj = -1; dj <= 1; dj++) for (let di = -2; di <= 2; di++) {
    const L = lago(li + di, lj + dj); if (!L) continue;
    const dx = envolver(cx - L.cx), dz = cz - L.cz;
    if (Math.hypot(dx, dz) < rV + 60) return true;
    const rc = rV * 0.18 * 2.5 + 40, sv = dx * L.sgn; if (Math.abs(dz) < rc && sv > -rc && sv < L.Len + rc) return true;   // el arroyo puede cruzar la falda, no el cráter
  }
  return false;
}
/** Volcán de la celda (i, j), o null. */
const cacheVolc = new Map();
export function volcan(i, j) {
  const key = i + ',' + j; if (cacheVolc.has(key)) return cacheVolc.get(key);
  let V = null; const im = i - 3 * Math.floor(i / 3), p = hash3(im, j, 701);
  if (p < 1) {
    const cx = (i + 0.25 + 0.5 * hash3(im, j, 702)) * VX, cz = (j + 0.25 + 0.5 * hash3(im, j, 703)) * VZ - 500, rV = 140 + 160 * hash3(im, j, 704);
    const rr = rio(cx, cz);
    if (mar(cz).dz > SW + rV + 300 && rr.d > rV * 0.5 && !lagoCerca(cx, cz, rV)) V = { cx, cz, rV, HV: rV * (0.18 + 0.12 * hash3(im, j, 705)), rc: rV * 0.18, base: hsuave(cx, cz, rr) };
  }
  cacheVolc.set(key, V); return V;
}

/** Todo lo que define un punto del mundo: altura, nivel de agua local, máscaras. */
export function datos(x, z) {
  const r = rio(x, z), M = mar(z), d = r.d;
  let h = hsuave(x, z, r);
  h += 6 * (f(x, z, 60, 0, 0, 0, 4) - 0.5) * sm(12, 40, d) + 4 * (f(x, z, 55, -4.2, 2.2, 8.8, 3) - 0.5) * sm(30, 200, d);
  // pantanos: valle bajo del río grande y franja detrás de la costa
  let sw = sm(0.56, 0.68, f(x, z, 220, 9.9, -1.1, 3.7, 3)) * Math.max((1 - sm(60, 160, d)) * (r.k === 0 ? 1 : 0.3), sm(SW + 150, SW + 500, M.dz) * (1 - sm(SW + 600, SW + 900, M.dz)));
  sw *= (1 - sm(3, 8, h)) * (1 - M.m);
  if (sw > 0) h = h * (1 - sw) + (0.25 + 1.4 * (f(x, z, 16, 2.5, 7.5, -1.5, 2) - 0.5)) * sw;
  let W = 0, lava = 0, vm = 0, arroyo = 0, cuenco = 0, Wst = -1e9;
  // lagos y arroyos (celda propia y vecinas)
  const ci = Math.floor(x / LX), cj = Math.floor(z / LZ);
  // 1º arroyos de todos los lagos vecinos, 2º lagos: el cuenco y el borde de un lago mandan sobre un arroyo ajeno que pase
  for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
    const Lg = lago(ci + di, cj + dj); if (!Lg) continue;
    const dzp = z - Lg.cz; if (Math.abs(dzp) > 230) continue;
    const dxp = envolver(x - Lg.cx), dl = Math.hypot(dxp, dzp), rL = Lg.rL;
    const s = cl(dxp * Lg.sgn, 0, Lg.Len), mnd = 25 * Math.sin(s / 90 + Lg.f1) + 10 * Math.sin(s / 37 + Lg.f2), lat = Math.abs(dzp - mnd);
    if (s > rL * 0.5 && lat < 70 && s < Lg.Len - 0.01) {
      // nivel del agua: mínimo de 5 muestras aguas arriba (nunca sube), nunca por encima del lago
      let Ws = 1e9; for (let q = 0; q < 5; q++) { const sq = Math.max(rL * 0.5, s - 40 * q); Ws = Math.min(Ws, hsuave(Lg.cx + Lg.sgn * sq, Lg.cz + 25 * Math.sin(sq / 90 + Lg.f1) + 10 * Math.sin(sq / 37 + Lg.f2))); }
      // cascadas: aguas arriba el terreno sube hasta un escarpe (corredor que se desvanece a lo ancho y junto al lago)
      let D = 0; for (let q = 0; q < Lg.nF; q++) D += Lg.HF[q] * (1 - sm(Lg.sF[q] - 3, Lg.sF[q], s)) * sm(Lg.sF[q] - 220, Lg.sF[q] - 30, s);
      D *= sm(rL * 0.5, rL + 60, s);
      Ws = Math.min(Ws - 1.5 + D, Lg.L); Ws = Lg.L + (Ws - Lg.L) * sm(rL + 5, rL + 70, s);   // nunca sobre el lago; la salida baja en rápidos
      Ws = Math.min(Ws, Math.max(0, (d - r.w * 0.6) * 0.3));
      h += D * (1 - sm(40, 70, lat));
      const ws = Lg.ws, fondo = Ws - Lg.ds * (1 - sm(0, ws, lat)), hc = Math.min(h, fondo);
      const cw = 1 - sm(ws, ws + 2 + 1.5 * (h - hc), lat);   // paredes del cauce: a lo sumo ~40°
      h = h * (1 - cw) + hc * cw;
      let Dm = 0; for (let q = 0; q < Lg.nF; q++) Dm += Lg.HF[q] * sm(Lg.sF[q] - 3, Lg.sF[q], s) * (1 - sm(Lg.sF[q] + 12, Lg.sF[q] + 30, s));   // muro de tierra junto a la caída
      const dr = Math.max(0, Ws + Dm + 0.35 - h), bw = sm(ws * 0.6, ws * 0.9, lat) * (1 - sm(ws * 1.8, ws * 1.8 + 1 + 1.5 * dr, lat)) * sm(rL * 0.95, rL + 5, dl);
      h = h * (1 - bw) + (h + dr) * bw;
      if (lat < ws * 1.5) Wst = Math.max(Wst, Ws);
      if (lat < ws * 2.6) arroyo = 1;
    }
  }
  for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
    const Lg = lago(ci + di, cj + dj); if (!Lg) continue;
    const dzp = z - Lg.cz; if (Math.abs(dzp) > 230) continue;
    const dxp = envolver(x - Lg.cx), dl = Math.hypot(dxp, dzp), rL = Lg.rL;
    if (dl < rL + 120) {   // cuenco y borde (presa natural)
      cuenco = 1;
      // salida: por donde sale su propio arroyo el borde tiene una muesca (si no, el arroyo nacía de la nada)
      const s2 = cl(dxp * Lg.sgn, 0, Lg.Len), lat2 = Math.abs(dzp - 25 * Math.sin(s2 / 90 + Lg.f1) - 10 * Math.sin(s2 / 37 + Lg.f2));
      const sal = s2 > rL * 0.5 ? (1 - sm(Lg.ws * 1.2, Lg.ws * 2.6 + 4, lat2)) * sm(rL - 2, rL + 2, dl) : 0;
      const bowl = Lg.L - 1 - 9 * (1 - sm(0, rL, dl)), hb = bowl, wIn = (1 - sm(0, 1, (dl - rL) / Math.min(110, 2 + 2.5 * Math.abs(h - hb)))) * (1 - sal);   // fondo del lago definido (tapa zanjas de arroyos ajenos)
      h = h * (1 - wIn) + hb * wIn;
      const dr = Math.max(0, Lg.L + 2.5 - h), o = rL + Math.max(20, 8 + 1.3 * dr), wRim = sm(rL, rL + 3 + 1.3 * dr, dl) * (1 - sm(o, o + 4 + 2.5 * dr, dl)) * (1 - sal);
      h = h * (1 - wRim) + (h + dr) * wRim;
      if (dl < rL + 3 && sal < 0.5) W = Math.max(W, Lg.L);   // agua solo dentro del cuenco: afuera la sostiene el borde
    }
  }
  if (Wst > h && Wst - h < 2.6) W = Math.max(W, Wst);   // el agua del arroyo solo donde su cauce sigue ahí (un lago u otro corte no la deja colgada)
  // volcanes
  const vi = Math.floor(x / VX), vj = Math.floor((z + 500) / VZ);
  for (let dj = -1; dj <= 1; dj++) for (let di = -1; di <= 1; di++) {
    const V = volcan(vi + di, vj + dj); if (!V) continue;
    const dl = Math.hypot(envolver(x - V.cx), z - V.cz); if (dl > V.rV) continue;
    h = h + (V.base - h) * (1 - sm(V.rV * 0.45, V.rV, dl));   // base plana: el cono queda simétrico y el cráter no se derrama
    const cono = V.HV * Math.pow(1 - sm(0, V.rV, dl), 1.6) - 0.3 * V.HV * (1 - sm(0, V.rc * 1.3, dl));   // cráter en cuenco
    h += cono * (1 + 0.03 * (f(x, z, 40, 1, 1, 1, 2) - 0.5)); vm = Math.max(vm, 1 - sm(V.rV * 0.85, V.rV * 1.05, dl));
    if (dl < V.rc * 1.3) { W = Math.max(W, V.base + 0.76 * V.HV); lava = 1; }
  }
  // cauce del río principal (al final: corta todo lo demás)
  const w = r.w, c = 1 - sm(w * 0.5, w * 0.5 + Math.max(0.8 * w, 14), d);
  if (c > 0) { const fondo = -1.5 - HONDO[r.k] * (w / ANCHO[r.k]) * Math.pow(1 - sm(0, w * 0.45, d), 0.8) + 0.8 * (f(x, z, 9, 3.1, 1.9, -6.2, 2) - 0.5); h = h * (1 - c) + fondo * c; }
  h += tapa(z);   // tapas del cilindro: el tramo de pruebas termina en muros
  // máscaras
  const nieve = sm(NIEVE - 25, NIEVE + 25, h + 25 * (f(x, z, 80, 5, 5, 5, 2) - 0.5)) * (1 - vm);
  const hum = f(x, z, 900, -7.7, 1.2, 9.3, 2);
  const sel = sm(0.42, 0.55, f(x, z, 140, 11, -7, 2, 3)) * (1 - sm(90, 140, h)) * (0.6 + 0.4 * hum);
  const bos = sm(0.45, 0.58, f(x, z, 90, -5, 3, 9, 3)) * sm(25, 60, h) * (1 - sm(ARBOL_MAX - 30, ARBOL_MAX + 30, h));
  const bosque = Math.max(sel, bos * 0.85) * (1 - nieve) * (1 - vm) * (1 - M.m) * (1 - 0.7 * sw) * sm(0.6, 1.8, h - W);
  return { h, W, lava, nieve, pantano: sw, volcan: vm, bosque, hum, mar: M.m, rio: r, arroyo, cuenco };
}

export const alturaFn = (x, z) => datos(x, z).h;
export const aguaFn = (x, z) => datos(x, z).W;
export function normalFn(x, z, e = 1) {
  const h = alturaFn(x, z), a = alturaFn(x + e, z), b = alturaFn(x, z + e), l = Math.hypot(h - a, e, h - b);
  return { x: (h - a) / l, y: e / l, z: (h - b) / l };
}
