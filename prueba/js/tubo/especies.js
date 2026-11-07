// Especies del tubo y reglas de siembra por bioma.
// Árboles: EZ-Tree (MIT), 15 variantes (roble, fresno, aliso, pino × pequeño/mediano/grande + 3 arbustos); los grandes
// se escalan a 30–45 m (ceibas). Plantas y rocas: Poly Haven CC0 con detalle cercano/lejano e imposter.
// alto = metros; near/mid/far = distancias (m) de detalle cercano, detalle lejano e imposter.

export const ARBOLES = [
  { id: 'roble_g', nombre: 'ceibas', preset: 'Oak Large', semilla: 23, alto: [30, 44], near: 36, mid: 120, far: 900 },
  { id: 'fresno_g', nombre: 'fresnos gigantes', preset: 'Ash Large', semilla: 31, alto: [26, 36], near: 36, mid: 120, far: 900 },
  { id: 'aliso_g', nombre: 'alisos grandes', preset: 'Aspen Large', semilla: 17, alto: [18, 25], near: 30, mid: 100, far: 700 },
  { id: 'pino_g', nombre: 'pinos grandes', preset: 'Pine Large', semilla: 13, alto: [24, 34], near: 30, mid: 100, far: 800 },
  { id: 'roble', nombre: 'robles', preset: 'Oak Medium', semilla: 11, alto: [13, 19], near: 24, mid: 80, far: 600 },
  { id: 'fresno', nombre: 'fresnos', preset: 'Ash Medium', semilla: 5, alto: [12, 17], near: 24, mid: 80, far: 600 },
  { id: 'aliso', nombre: 'alisos', preset: 'Aspen Medium', semilla: 7, alto: [11, 16], near: 24, mid: 80, far: 550 },
  { id: 'pino', nombre: 'pinos', preset: 'Pine Medium', semilla: 3, alto: [14, 22], near: 24, mid: 80, far: 600 },
  { id: 'roble_p', nombre: 'robles jóvenes', preset: 'Oak Small', semilla: 29, alto: [5, 9], near: 16, mid: 55, far: 350 },
  { id: 'fresno_p', nombre: 'fresnos jóvenes', preset: 'Ash Small', semilla: 37, alto: [4, 7], near: 16, mid: 55, far: 350 },
  { id: 'aliso_p', nombre: 'alisos jóvenes', preset: 'Aspen Small', semilla: 41, alto: [4, 7], near: 16, mid: 55, far: 350 },
  { id: 'pino_p', nombre: 'pinos jóvenes', preset: 'Pine Small', semilla: 19, alto: [5, 9], near: 16, mid: 55, far: 350 },
  { id: 'arbusto1', nombre: 'arbustos', preset: 'Bush 1', semilla: 9, alto: [1.4, 2.6], near: 9, mid: 36, far: 220 },
  { id: 'arbusto2', nombre: 'arbustos', preset: 'Bush 2', semilla: 43, alto: [1.2, 2.2], near: 9, mid: 36, far: 220 },
  { id: 'arbusto3', nombre: 'frailejones', preset: 'Bush 3', semilla: 47, alto: [1.8, 3.2], near: 9, mid: 36, far: 220 },
];
export const MODELOS = [
  { id: 'shrub_01', esc: [0.8, 1.4], near: 9, mid: 40, far: 180 },
  { id: 'shrub_02', esc: [0.7, 1.2], near: 9, mid: 40, far: 180 },
  { id: 'fern_02', esc: [0.9, 1.6], near: 8, mid: 32, far: 120, sombraLejos: false },
  { id: 'grass_medium_01', esc: [0.9, 1.6], near: 6, mid: 24, far: 90, sombraLejos: false },
  { id: 'grass_medium_02', esc: [0.9, 1.6], near: 6, mid: 24, far: 90, sombraLejos: false },
  { id: 'rock_moss_set_01', esc: [0.5, 1.6], near: 12, mid: 45, far: 400 },
  { id: 'rock_moss_set_02', esc: [0.6, 2.2], near: 12, mid: 45, far: 450 },
  { id: 'boulder_01', esc: [0.5, 6], near: 16, mid: 70, far: 700 },
  { id: 'tree_stump_01', esc: [0.9, 1.3], near: 10, mid: 40, far: 160 },
  { id: 'dry_branches_medium_01', esc: [0.9, 1.3], near: 10, mid: 35, far: 120 },
];

/** Reglas de siembra. I: datos del punto (mundo.js) + n (normal) + d, w (río más cercano). Devuelven {k, s, hundir?}. */
export function reglasFlora(idx, especies) {
  const ok = id => id in idx;
  const tam = (id, r) => { const sp = especies[idx[id]]; return (sp.alto[0] + r() * (sp.alto[1] - sp.alto[0])) / sp.h0; };
  const esc = (id, r, lo, hi) => { const s = especies[idx[id]].esc; return (lo ?? s[0]) + r() * ((hi ?? s[1]) - (lo ?? s[0])); };
  const arb = (id, r, hundir = 0.3) => ok(id) ? { k: idx[id], s: tam(id, r), hundir } : null;
  const mod = (id, r, lo, hi, hundir = 0.12) => ok(id) ? { k: idx[id], s: esc(id, r, lo, hi), hundir, inclinar: true } : null;
  const elige = (r, ...pares) => { let u = r(); for (let i = 0; i < pares.length; i += 2) { if ((u -= pares[i + 1]) < 0) return pares[i]; } return pares[pares.length - 2]; };
  return [
    { paso: 4.5, previo: (x, z, u) => u < 0.6, elegir(I, r, u) {   // ÁRBOLES
      if (I.y < I.W + 1.2 || I.nieve > 0.3 || I.mar > 0.3 || I.volcan > 0.15) return null;
      const f = I.bosque, h = I.y;
      if (I.pantano > 0.3) return r() < 0.08 ? arb('aliso_p', r) : null;
      if (f < 0.12) return r() < 0.02 && I.n.y > 0.8 && h < 300 ? arb(elige(r, 'roble', 0.5, 'aliso', 0.5), r) : null;   // árboles sueltos en la pradera
      if (I.n.y < 0.6 || r() > f * 0.9) return null;
      if (h < 120 && I.hum > 0.4) return arb(elige(r, 'roble_g', 0.07, 'fresno_g', 0.05, 'roble', 0.2, 'fresno', 0.18, 'aliso_g', 0.1, 'roble_p', 0.15, 'fresno_p', 0.12, 'aliso_p', 0.13), r);   // selva
      if (h > 190) return arb(elige(r, 'pino_g', 0.22, 'pino', 0.45, 'pino_p', 0.25, 'aliso', 0.08), r);                                               // bosque de montaña
      return arb(elige(r, 'roble', 0.25, 'fresno', 0.22, 'aliso', 0.15, 'aliso_g', 0.08, 'roble_p', 0.1, 'fresno_p', 0.1, 'aliso_p', 0.1), r);          // bosque templado
    } },
    { paso: 2.4, previo: (x, z, u) => u < 0.45, elegir(I, r, u) {   // SOTOBOSQUE, ROCAS, ORILLAS
      if (I.y < I.W + 0.3 || I.mar > 0.5) return null;
      const v = r(), f = I.bosque, h = I.y;
      if (I.nieve > 0.5) return v < 0.03 ? mod('boulder_01', r, 0.6, 3) : null;
      if (I.volcan > 0.15) return v < 0.07 ? mod('boulder_01', r, 0.5, 3.5) : v < 0.1 ? mod('tree_stump_01', r) : v < 0.14 ? mod('dry_branches_medium_01', r) : null;
      if (I.pantano > 0.25) return v < 0.6 ? mod(elige(r, 'grass_medium_01', 0.5, 'grass_medium_02', 0.5), r, 1.2, 2.2) : v < 0.68 ? mod('dry_branches_medium_01', r) : null;
      const orilla = h < I.W + 2.2 && (I.d < I.w * 0.5 + 22 || I.arroyo || I.cuenco);
      if (orilla) return v < 0.1 ? mod('rock_moss_set_01', r) : v < 0.3 && f > 0.15 ? mod('fern_02', r) : v < 0.5 ? mod(elige(r, 'grass_medium_01', 0.5, 'grass_medium_02', 0.5), r) : null;
      const ny = I.n.y;
      if (ny < 0.85) {   // laderas: rocas de todos los tamaños
        if (v < 0.015) return mod('boulder_01', r, 2.5, 7);
        if (v < 0.16) return mod('boulder_01', r, 0.4, 2.2);
        return v < 0.3 ? mod('rock_moss_set_02', r) : v < 0.36 && f > 0.3 ? mod('fern_02', r) : null;
      }
      if (h > 280 && h < 360) return v < 0.3 ? arb(elige(r, 'arbusto3', 0.6, 'arbusto2', 0.4), r, 0.15) : v < 0.5 ? mod(elige(r, 'grass_medium_01', 0.5, 'grass_medium_02', 0.5), r) : v < 0.58 ? mod('rock_moss_set_01', r) : null;   // páramo
      if (f > 0.4) {   // suelo de bosque y selva
        const selva = h < 120 && I.hum > 0.4;
        if (v < (selva ? 0.5 : 0.35)) return mod('fern_02', r);
        if (v < 0.62) return mod(elige(r, 'shrub_01', 0.5, 'shrub_02', 0.5), r);
        if (v < 0.76) return arb(elige(r, 'arbusto1', 0.4, 'arbusto2', 0.3, 'arbusto3', 0.3), r, 0.15);
        if (v < 0.84) return mod(elige(r, 'grass_medium_01', 0.5, 'grass_medium_02', 0.5), r);
        if (v < 0.87) return mod('dry_branches_medium_01', r);
        return v < 0.885 ? mod('tree_stump_01', r) : v < 0.9 ? mod('rock_moss_set_02', r) : null;
      }
      // pradera: matas sueltas, arbustos y alguna roca grande
      if (v < 0.006) return mod('boulder_01', r, 2, 6);
      return v < 0.1 ? mod(elige(r, 'shrub_01', 0.5, 'shrub_02', 0.5), r) : v < 0.2 ? mod(elige(r, 'grass_medium_01', 0.5, 'grass_medium_02', 0.5), r) : v < 0.23 ? mod('rock_moss_set_02', r) : v < 0.26 ? arb('arbusto1', r, 0.15) : null;
    } },
  ];
}
