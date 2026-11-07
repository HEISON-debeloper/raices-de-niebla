// Valle andino: relieve, río, máscaras (pasto, bosque) y material con texturas reales mezcladas por pendiente y altura.
import * as THREE from 'three';
import { fbm, ridge, smooth } from './ruido.js';
import { mate } from './materiales.js';

export const SIZE = 900, N = 288, WATER_Y = 0, FAR = 5200, FN = 256;
const STEP = SIZE / N;

/** Centro del río en función de z (serpentea por el fondo del valle). */
export const riverX = z => 38 * Math.sin(z / 110 + 0.6) + 14 * Math.sin(z / 41 + 1.3);

/** Altura analítica (sirve dentro y fuera del mapa: también para las montañas lejanas).
 *  Diseño medible (tools: pend.mjs): la cordillera sube de forma progresiva desde el río (envolvente d^1,6 hasta
 *  ~1.000 m a 2,7 km), con ruido suave de longitud de onda larga. Así casi todo se puede subir caminando
 *  (pendiente p99 < 40°), no hay aristas y la malla lejana coincide con la altura real (los árboles no flotan).
 *  El valle sigue al río hasta el horizonte: el cauce ya no corta zanjas verticales en las montañas. */
export function heightFn(x, z) {
  const d = Math.abs(x - riverX(z));
  let h = 1.2 + 0.03 * d + (fbm(x / 60, z / 60) - 0.5) * 6 * smooth(12, 40, d);
  const t = Math.min(1, Math.max(0, (d - 60) / 2700));
  const env = 1000 * Math.pow(t, 1.6) * (0.9 + 0.2 * fbm(x / 1100 + 7.3, z / 1100 - 2.9, 3));
  h += env;
  h += 18 * (fbm(x / 260 + 1.7, z / 260 + 5.1, 4) - 0.5) * smooth(40, 320, d);     // colinas
  h += 4 * (fbm(x / 55, z / 55, 3) - 0.5) * smooth(30, 200, d);                    // detalle
  const k = 1 + Math.max(0, Math.abs(z) - 430) / 350;   // fuera del mapa el cauce se ensancha (y la malla lejana lo alcanza a ver)
  const c = 1 - smooth(7 * k, 17 * k, d);           // cauce
  h = h * (1 - c) + (-2.4 + 0.6 * fbm(x / 12, z / 12)) * c;
  return h;
}

/** Máscara de bosque (0–1): manchas en el valle y bosque de niebla en las laderas, hasta el límite de árboles (~600 m). */
export function forestFn(x, z, h) {
  const d = Math.abs(x - riverX(z));
  const valle = smooth(0.5, 0.6, fbm(x / 140 + 11, z / 140 - 7, 4)) * smooth(20, 55, d);
  const ladera = smooth(0.38, 0.5, fbm(x / 90 - 5, z / 90 + 3, 4)) * smooth(25, 60, h);   // bosque de niebla en las laderas
  return Math.max(valle, ladera) * (1 - smooth(560, 680, h));   // límite de árboles ~600 m
}

export function crearTerreno() {
  const V = N + 1, H = new Float32Array(V * V);
  for (let j = 0; j < V; j++) for (let i = 0; i < V; i++) H[j * V + i] = heightFn(-SIZE / 2 + i * STEP, -SIZE / 2 + j * STEP);
  const at = (i, j) => H[Math.min(N, Math.max(0, j)) * V + Math.min(N, Math.max(0, i))];
  /** Altura exacta de la malla (interpolación bilineal de la cuadrícula). */
  function heightAt(x, z) {
    const fx = (x + SIZE / 2) / STEP, fz = (z + SIZE / 2) / STEP, i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j;
    if (i < 0 || j < 0 || i >= N || j >= N) return heightFn(x, z);
    const a = at(i, j), b = at(i + 1, j), c = at(i, j + 1), d = at(i + 1, j + 1);
    return u + v <= 1 ? a + (b - a) * u + (c - a) * v : d + (c - d) * (1 - u) + (b - d) * (1 - v);
  }
  function normalAt(x, z) {
    const e = STEP;
    return new THREE.Vector3(heightAt(x - e, z) - heightAt(x + e, z), 2 * e, heightAt(x, z - e) - heightAt(x, z + e)).normalize();
  }
  // datos para la GPU: R altura, G densidad de pasto, B bosque, A libre
  const D = new Float32Array(V * V * 4);
  for (let j = 0; j < V; j++) for (let i = 0; i < V; i++) {
    const x = -SIZE / 2 + i * STEP, z = -SIZE / 2 + j * STEP, h = at(i, j);
    const ny = 2 * STEP / Math.hypot(at(i - 1, j) - at(i + 1, j), 2 * STEP, at(i, j - 1) - at(i, j + 1));
    const f = forestFn(x, z, h);
    const grass = smooth(0.8, 0.9, ny) * smooth(0.7, 1.6, h - WATER_Y) * (1 - smooth(640, 720, h)) * (1 - 0.65 * f);
    const k = (j * V + i) * 4; D[k] = h; D[k + 1] = grass; D[k + 2] = f; D[k + 3] = 1;
  }
  const dataTex = new THREE.DataTexture(toHalf(D), V, V, THREE.RGBAFormat, THREE.HalfFloatType);
  dataTex.magFilter = dataTex.minFilter = THREE.LinearFilter; dataTex.wrapS = dataTex.wrapT = THREE.ClampToEdgeWrapping; dataTex.needsUpdate = true;

  const geo = new THREE.PlaneGeometry(SIZE, SIZE, N, N); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let k = 0; k < p.count; k++) p.setY(k, heightAt(p.getX(k), p.getZ(k)));
  geo.computeVertexNormals();
  // montañas lejanas: anillo de baja resolución hasta 2,6 km, hundido bajo el mapa principal
  // Cuadrícula no uniforme: pocos vértices dentro del mapa (quedan ocultos), muy densos justo afuera (~3 m: el cauce del
  // río, de ~17 m, ya no se convierte en paredes verticales como pasaba con 20 m) y cada vez más separados (~25 m).
  const far = new THREE.PlaneGeometry(FAR, FAR, 260, 260); far.rotateX(-Math.PI / 2);
  const q = far.attributes.position, H0 = SIZE / 2 - 20, HF = FAR / 2;
  const g = u => { const a = Math.abs(u) / HF, t0 = 0.1; const r = a < t0 ? H0 * a / t0 : H0 + (HF - H0) * Math.pow((a - t0) / (1 - t0), 1.4); return Math.sign(u) * r; };
  for (let k = 0; k < q.count; k++) {
    const x = g(q.getX(k)), z = g(q.getZ(k)), inside = Math.max(Math.abs(x), Math.abs(z)) < SIZE / 2 - 45;   // la franja del borde conserva su altura
    q.setXYZ(k, x, inside ? heightFn(x, z) - 40 : heightFn(x, z), z);
  }
  far.computeVertexNormals();
  // datos de las montañas lejanas (20 m por texel): altura, pasto y bosque. Sin esto el shader estiraba el borde del mapa
  // y pintaba todas las montañas lejanas de roca y páramo.
  const V2 = FN + 1, D2 = new Float32Array(V2 * V2 * 4), S2 = FAR / FN;
  for (let j = 0; j < V2; j++) for (let i = 0; i < V2; i++) {
    const x = -FAR / 2 + i * S2, z = -FAR / 2 + j * S2, h = heightFn(x, z), k = (j * V2 + i) * 4;
    const dx = heightFn(x + 5, z) - heightFn(x - 5, z), dz = heightFn(x, z + 5) - heightFn(x, z - 5), ny = 10 / Math.hypot(dx, 10, dz), f = forestFn(x, z, h);
    D2[k] = h; D2[k + 1] = smooth(0.8, 0.9, ny) * smooth(0.7, 1.6, h - WATER_Y) * (1 - smooth(640, 720, h)) * (1 - 0.65 * f); D2[k + 2] = f; D2[k + 3] = 1;
  }
  const dataFar = new THREE.DataTexture(toHalf(D2), V2, V2, THREE.RGBAFormat, THREE.HalfFloatType);
  dataFar.magFilter = dataFar.minFilter = THREE.LinearFilter; dataFar.wrapS = dataFar.wrapT = THREE.ClampToEdgeWrapping; dataFar.needsUpdate = true;
  return { geo, far, dataTex, dataFar, heightAt, normalAt, forestAt: (x, z) => forestFn(x, z, heightAt(x, z)), heightFn, forestFn };
}

function toHalf(f) { const o = new Uint16Array(f.length); for (let i = 0; i < f.length; i++) o[i] = THREE.DataUtils.toHalfFloat(f[i]); return o; }

/** Material del terreno: 5 capas reales (pradera, suelo de bosque, roca triplanar, orilla, páramo) mezcladas en el shader.
 *  La rugosidad va en el canal alfa de cada textura difusa: así el shader usa 11 samplers (+3 de Three.js) y cabe en el
 *  límite de 16 de los celulares; con texturas de rugosidad aparte eran 19 y en el teléfono el shader no compilaba. */
export function materialTerreno(tex, dataTex, calidad, dataFar) {
  const m = new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0 });
  const U = {
    tGd: { value: tex.grass.d }, tGn: { value: tex.grass.n },
    tFd: { value: tex.forest.d }, tFn: { value: tex.forest.n },
    tRd: { value: tex.rock.d }, tRn: { value: tex.rock.n },
    tBd: { value: tex.bank.d }, tBn: { value: tex.bank.n },
    tPd: { value: tex.paramo.d }, tPn: { value: tex.paramo.n },
    tData: { value: dataTex }, tDataFar: { value: dataFar },
    uFar: { value: new THREE.Vector4(-FAR / 2, -FAR / 2, FAR, 0) },
    uTile: { value: new THREE.Vector4(1 / 6, 1 / 4, 1 / 10, 1 / 4) },
    uTerr: { value: new THREE.Vector4(-SIZE / 2, -SIZE / 2, SIZE, WATER_Y) },
  };
  m.defines = { TRIPLANAR: calidad === 'baja' ? 0 : 1 };
  m.onBeforeCompile = s => {
    Object.assign(s.uniforms, U);
    s.vertexShader = 'varying vec3 vWP;\nvarying vec3 vWN;\n' + s.vertexShader.replace('#include <project_vertex>',
      '#include <project_vertex>\n vWP=(modelMatrix*vec4(transformed,1.)).xyz; vWN=normalize(mat3(modelMatrix)*objectNormal);');
    s.fragmentShader = FRAG_PARS + s.fragmentShader
      .replace('#include <map_fragment>', FRAG_MAP)
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = tRough;')

      .replace('#include <normal_fragment_maps>', 'normal = normalize((viewMatrix*vec4(tNW,0.)).xyz);');
    mate(s);   // sin brillo rasante (ver materiales.js)
  };
  m.customProgramCacheKey = () => 'terreno' + m.defines.TRIPLANAR;
  return m;
}

const FRAG_PARS = /* glsl */`
uniform sampler2D tGd,tGn,tFd,tFn,tRd,tRn,tBd,tBn,tPd,tPn,tData,tDataFar;
uniform vec4 uTile, uTerr, uFar;
varying vec3 vWP; varying vec3 vWN;
// hash sin seno: el clásico fract(sin(x)*43758.5) se degrada en las GPU de Apple con argumentos grandes
float th1(vec2 p){ vec3 q=fract(vec3(p.xyx)*.1031); q+=dot(q,q.yzx+33.33); return fract((q.x+q.y)*q.z); }
float tn1(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(th1(i),th1(i+vec2(1,0)),f.x),mix(th1(i+vec2(0,1)),th1(i+vec2(1,1)),f.x),f.y); }
// albedo (rgb) y rugosidad (a) sin repetición visible: mezcla dos escalas desfasadas según un ruido
vec4 albT(sampler2D t, vec2 uv){ vec4 a=texture2D(t,uv), b=texture2D(t,uv*.37+vec2(.41,.17)); return mix(a,b,smoothstep(.3,.7,tn1(uv*.11))*.55); }
// normal de proyección superior (whiteout) en espacio mundo
vec3 nTop(sampler2D t, vec2 uv, vec3 N){ vec3 n=texture2D(t,uv).xyz*2.-1.; return normalize(vec3(n.x+N.x, abs(n.z)*N.y, n.y+N.z)); }
`;

const FRAG_MAP = /* glsl */`
vec3 N = normalize(vWN);
bool dentro = abs(vWP.x) < uTerr.z*.5 && abs(vWP.z) < uTerr.z*.5;
vec4 TD = dentro ? texture2D(tData,(vWP.xz-uTerr.xy)/uTerr.z) : texture2D(tDataFar,(vWP.xz-uFar.xy)/uFar.z);
float h = vWP.y, slope = 1.-N.y, nz = tn1(vWP.xz*.045), nz2 = tn1(vWP.xz*.21);
float wR = max(smoothstep(.30,.46,slope+(nz-.5)*.12), smoothstep(820.,920.,h+nz*50.)*.85);   // roca: laderas muy empinadas y cumbres
float wB = (1.-smoothstep(uTerr.w+.7,uTerr.w+2.4,h+(nz2-.5)*1.4))*(1.-wR);
float wF = clamp(TD.b*1.4,0.,1.)*(1.-wR)*(1.-wB);
float wG0 = max(0.,1.-wR-wB-wF), pa = smoothstep(620.,720.,h+(nz-.5)*60.);   // páramo sobre el límite de árboles
float wG = wG0*(1.-pa), wP = wG0*pa;
vec4 acc = vec4(0.); vec3 nacc = vec3(0.);
// cada capa se lee solo donde pesa algo: en la mayoría de los píxeles son 1 o 2 capas (importa en celulares)
if (wG > .002) { vec2 u=vWP.xz*uTile.x;    acc += albT(tGd,u)*wG; nacc += nTop(tGn,u,N)*wG; }
if (wF > .002) { vec2 u=vWP.xz*uTile.y;    acc += albT(tFd,u)*wF; nacc += nTop(tFn,u,N)*wF; }
if (wB > .002) { vec2 u=vWP.xz*uTile.w;    acc += albT(tBd,u)*wB; nacc += nTop(tBn,u,N)*wB; }
if (wP > .002) { vec2 u=vWP.xz*uTile.x*.8; acc += albT(tPd,u)*wP; nacc += nTop(tPn,u,N)*wP; }
if (wR > .002) {
#if TRIPLANAR == 1
  vec3 w=pow(abs(N),vec3(4.)); w/=w.x+w.y+w.z; float s=uTile.z;
  vec2 ux=vWP.zy*s, uy=vWP.xz*s, uz=vWP.xy*s;
  vec4 aR=texture2D(tRd,ux)*w.x+texture2D(tRd,uy)*w.y+texture2D(tRd,uz)*w.z;
  vec3 nx=texture2D(tRn,ux).xyz*2.-1., ny=texture2D(tRn,uy).xyz*2.-1., nzz=texture2D(tRn,uz).xyz*2.-1.;
  nx=vec3(nx.xy+N.zy,abs(nx.z)*N.x); ny=vec3(ny.xy+N.xz,abs(ny.z)*N.y); nzz=vec3(nzz.xy+N.xy,abs(nzz.z)*N.z);
  vec3 nR=normalize(nx.zyx*w.x+ny.xzy*w.y+nzz.xyz*w.z);
#else
  vec2 u=vWP.xz*uTile.z; vec4 aR=albT(tRd,u); vec3 nR=nTop(tRn,u,N);
#endif
  acc += aR*wR; nacc += nR*wR;
}
vec3 alb = acc.rgb * mix(.82,1.12,tn1(vWP.xz*.013)) * mix(1.,.86,wF);   // variación de color a gran escala
// de lejos una ladera boscosa se ve del color de las copas, no del suelo
float dcam = length(vWP - cameraPosition);
alb = mix(alb, vec3(.03,.05,.02)*mix(.8,1.25,tn1(vWP.xz*.03)), clamp(TD.b*1.3,0.,1.)*smoothstep(120.,520.,dcam)*.85);
diffuseColor.rgb *= alb;
vec3 tNW = normalize(nacc);
float tRough = clamp(acc.a, .55, 1.);   // nunca por debajo de .55: tierra y hierba no son espejos
`;
