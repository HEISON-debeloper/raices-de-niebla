// Valle andino: relieve, río, máscaras (pasto, bosque) y material con texturas reales mezcladas por pendiente y altura.
import * as THREE from 'three';
import { fbm, ridge, smooth } from './ruido.js';

export const SIZE = 900, N = 288, WATER_Y = 0;
const STEP = SIZE / N;

/** Centro del río en función de z (serpentea por el fondo del valle). */
export const riverX = z => 38 * Math.sin(z / 110 + 0.6) + 14 * Math.sin(z / 41 + 1.3);

/** Altura analítica (sirve dentro y fuera del mapa: también para las montañas lejanas). */
export function heightFn(x, z) {
  const d = Math.abs(x - riverX(z));
  let h = 1.2 + 0.035 * d + (fbm(x / 60, z / 60) - 0.5) * 7 * smooth(12, 40, d);
  const m = Math.pow(smooth(70, 420, d), 1.4);
  h += m * (40 + 210 * ridge(x / 300 + 3.1, z / 300 - 1.7) + 38 * ridge(x / 85 - 2.3, z / 85 + 4.1)) + 26 * (fbm(x / 45, z / 45) - 0.3) * smooth(60, 220, d);
  const far = Math.max(Math.abs(x), Math.abs(z));
  h += smooth(380, 900, far) * 160 * (0.6 + 0.6 * ridge(x / 500, z / 500));
  const c = 1 - smooth(7, 17, d);           // cauce
  h = h * (1 - c) + (-2.4 + 0.6 * fbm(x / 12, z / 12)) * c;
  return h;
}

/** Máscara de bosque (0–1): manchas de bosque fuera del cauce y por debajo de 170 m. */
export function forestFn(x, z, h) {
  const d = Math.abs(x - riverX(z));
  const valle = smooth(0.5, 0.6, fbm(x / 140 + 11, z / 140 - 7, 4)) * smooth(20, 55, d);
  const ladera = smooth(0.38, 0.5, fbm(x / 90 - 5, z / 90 + 3, 4)) * smooth(25, 60, h);   // bosque de niebla en las laderas
  return Math.max(valle, ladera) * (1 - smooth(185, 225, h));
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
    const grass = smooth(0.8, 0.9, ny) * smooth(0.7, 1.6, h - WATER_Y) * (1 - smooth(140, 190, h)) * (1 - 0.65 * f);
    const k = (j * V + i) * 4; D[k] = h; D[k + 1] = grass; D[k + 2] = f; D[k + 3] = 1;
  }
  const dataTex = new THREE.DataTexture(toHalf(D), V, V, THREE.RGBAFormat, THREE.HalfFloatType);
  dataTex.magFilter = dataTex.minFilter = THREE.LinearFilter; dataTex.wrapS = dataTex.wrapT = THREE.ClampToEdgeWrapping; dataTex.needsUpdate = true;

  const geo = new THREE.PlaneGeometry(SIZE, SIZE, N, N); geo.rotateX(-Math.PI / 2);
  const p = geo.attributes.position;
  for (let k = 0; k < p.count; k++) p.setY(k, heightAt(p.getX(k), p.getZ(k)));
  geo.computeVertexNormals();
  // montañas lejanas: anillo de baja resolución hasta 2,6 km, hundido bajo el mapa principal
  const far = new THREE.PlaneGeometry(5200, 5200, 260, 260); far.rotateX(-Math.PI / 2);
  const q = far.attributes.position;
  for (let k = 0; k < q.count; k++) {
    const x = q.getX(k), z = q.getZ(k), inside = Math.max(Math.abs(x), Math.abs(z)) < SIZE / 2 - 45;   // la franja del borde conserva su altura: sin costura
    q.setY(k, inside ? heightFn(x, z) - 40 : heightFn(x, z));
  }
  far.computeVertexNormals();
  return { geo, far, dataTex, heightAt, normalAt, forestAt: (x, z) => forestFn(x, z, heightAt(x, z)) };
}

function toHalf(f) { const o = new Uint16Array(f.length); for (let i = 0; i < f.length; i++) o[i] = THREE.DataUtils.toHalfFloat(f[i]); return o; }

/** Material del terreno: 4 capas reales (pasto, suelo de bosque, roca triplanar, orilla) mezcladas en el shader. */
export function materialTerreno(tex, dataTex, calidad) {
  const m = new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0 });
  const U = {
    tGd: { value: tex.grass.d }, tGn: { value: tex.grass.n }, tGr: { value: tex.grass.r },
    tFd: { value: tex.forest.d }, tFn: { value: tex.forest.n }, tFr: { value: tex.forest.r },
    tRd: { value: tex.rock.d }, tRn: { value: tex.rock.n }, tRr: { value: tex.rock.r },
    tBd: { value: tex.bank.d }, tBn: { value: tex.bank.n }, tBr: { value: tex.bank.r },
    tPd: { value: tex.paramo.d }, tPn: { value: tex.paramo.n }, tPr: { value: tex.paramo.r },
    tData: { value: dataTex },
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
  };
  m.customProgramCacheKey = () => 'terreno' + m.defines.TRIPLANAR;
  return m;
}

const FRAG_PARS = /* glsl */`
uniform sampler2D tGd,tGn,tGr,tFd,tFn,tFr,tRd,tRn,tRr,tBd,tBn,tBr,tPd,tPn,tPr,tData;
uniform vec4 uTile, uTerr;
varying vec3 vWP; varying vec3 vWN;
float th1(vec2 p){ return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453); }
float tn1(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(th1(i),th1(i+vec2(1,0)),f.x),mix(th1(i+vec2(0,1)),th1(i+vec2(1,1)),f.x),f.y); }
// albedo sin repetición visible: mezcla dos escalas desfasadas según un ruido
vec3 albT(sampler2D t, vec2 uv){ vec3 a=texture2D(t,uv).rgb, b=texture2D(t,uv*.37+vec2(.41,.17)).rgb; return mix(a,b,smoothstep(.3,.7,tn1(uv*.11))*.55); }
// normal de proyección superior (whiteout) en espacio mundo
vec3 nTop(sampler2D t, vec2 uv, vec3 N){ vec3 n=texture2D(t,uv).xyz*2.-1.; return normalize(vec3(n.x+N.x, abs(n.z)*N.y, n.y+N.z)); }
`;

const FRAG_MAP = /* glsl */`
vec3 N = normalize(vWN);
vec4 TD = texture2D(tData,(vWP.xz-uTerr.xy)/uTerr.z);
float h = vWP.y, slope = 1.-N.y, nz = tn1(vWP.xz*.045), nz2 = tn1(vWP.xz*.21);
float wR = max(smoothstep(.26,.40,slope+(nz-.5)*.12), smoothstep(200.,260.,h+nz*35.)*.9);
float wB = (1.-smoothstep(uTerr.w+.7,uTerr.w+2.4,h+(nz2-.5)*1.4))*(1.-wR);
float wF = clamp(TD.b*1.4,0.,1.)*(1.-wR)*(1.-wB);
float wG0 = max(0.,1.-wR-wB-wF), pa = smoothstep(170.,215.,h+(nz-.5)*40.);
float wG = wG0*(1.-pa), wP = wG0*pa;
vec2 uG=vWP.xz*uTile.x, uF=vWP.xz*uTile.y, uB=vWP.xz*uTile.w;
vec2 uP=vWP.xz*uTile.x*.8;
vec3 aG=albT(tGd,uG), aF=albT(tFd,uF), aB=albT(tBd,uB), aP=albT(tPd,uP);
vec3 nG=nTop(tGn,uG,N), nF=nTop(tFn,uF,N), nB=nTop(tBn,uB,N), nP=nTop(tPn,uP,N);
float rG=texture2D(tGr,uG).r, rF=texture2D(tFr,uF).r, rB=texture2D(tBr,uB).r, rP=texture2D(tPr,uP).r;
vec3 aR, nR; float rR;
#if TRIPLANAR == 1
{ vec3 w=pow(abs(N),vec3(4.)); w/=w.x+w.y+w.z; float s=uTile.z;
  vec2 ux=vWP.zy*s, uy=vWP.xz*s, uz=vWP.xy*s;
  aR=texture2D(tRd,ux).rgb*w.x+texture2D(tRd,uy).rgb*w.y+texture2D(tRd,uz).rgb*w.z;
  vec3 nx=texture2D(tRn,ux).xyz*2.-1., ny=texture2D(tRn,uy).xyz*2.-1., nzz=texture2D(tRn,uz).xyz*2.-1.;
  nx=vec3(nx.xy+N.zy,abs(nx.z)*N.x); ny=vec3(ny.xy+N.xz,abs(ny.z)*N.y); nzz=vec3(nzz.xy+N.xy,abs(nzz.z)*N.z);
  nR=normalize(nx.zyx*w.x+ny.xzy*w.y+nzz.xyz*w.z);
  rR=texture2D(tRr,ux).r*w.x+texture2D(tRr,uy).r*w.y+texture2D(tRr,uz).r*w.z; }
#else
{ vec2 u=vWP.xz*uTile.z; aR=albT(tRd,u); nR=nTop(tRn,u,N); rR=texture2D(tRr,u).r; }
#endif
vec3 alb = aG*wG + aF*wF + aR*wR + aB*wB + aP*wP;
alb *= mix(.82,1.12,tn1(vWP.xz*.013)) * mix(1.,.86,wF);           // variación de color a gran escala
diffuseColor.rgb *= alb;
vec3 tNW = normalize(nG*wG + nF*wF + nR*wR + nB*wB + nP*wP);
float tRough = clamp(rG*wG + rF*wF + rR*wR + rB*wB + rP*wP, .35, 1.);
`;
