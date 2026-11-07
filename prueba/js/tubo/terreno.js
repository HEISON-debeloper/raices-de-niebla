// Terreno infinito del tubo: anillos anidados alrededor de la cámara (geometry clipmap). Nivel l = cuadrícula de
// 130×130 celdas con separación s = 2^l m; cada nivel tapa el hueco del siguiente. La altura NO se guarda: el
// shader la calcula con la misma función que usa la CPU (mundo.js), así no hay mapa central, ni malla lejana, ni
// costuras. Junto al borde de cada nivel los vértices impares se funden con la cuadrícula del nivel siguiente
// (geomorfismo), por eso no aparecen grietas ni saltos al moverse.
import * as THREE from 'three';
import { GLSL_MUNDO, WATER_Y } from './mundo.js';
import { mate } from '../materiales.js';

export const M = 64, HUECO = 31, NIVELES = 7;

/** position = (i, s, j): índice de la cuadrícula y separación del nivel; el shader arma la posición real. */
function geoNivel(l) {
  const s = 2 ** l, pos = [], idx = [], n = 2 * M + 3, id = (i, j) => (j + M + 1) * n + (i + M + 1);
  for (let j = -M - 1; j <= M + 1; j++) for (let i = -M - 1; i <= M + 1; i++) pos.push(i, s, j);
  for (let j = -M - 1; j <= M; j++) for (let i = -M - 1; i <= M; i++) {
    if (l > 0 && i >= -HUECO && i + 1 <= HUECO && j >= -HUECO && j + 1 <= HUECO) continue;   // hueco: lo cubre el nivel fino
    const a = id(i, j), b = id(i + 1, j), c = id(i, j + 1), d = id(i + 1, j + 1);
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setIndex(idx);
  g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 1e7);
  return g;
}
export const GEOS = Array.from({ length: NIVELES }, (_, l) => geoNivel(l));
export const U_CAM = { value: new THREE.Vector3() };

/** Posición plana (xz) del vértice del nivel, con geomorfismo y recorte a media vuelta del tubo. */
export const GLSL_NIVEL = /* glsl */`
uniform vec3 uCam;
vec2 nivelXZ(out float s){
  s = position.y;
  vec2 c = floor(uCam.xz/(2.*s)+.5)*2.*s, q = c + position.xz*s;
  vec2 dd = abs(q-uCam.xz)/s; float al = clamp((max(dd.x,dd.y)-44.)/13., 0., 1.);
  q -= mod(position.xz, 2.)*s*al;
  q.x = uCam.x + clamp(q.x-uCam.x, -TC*.5, TC*.5);   // el tubo da una vuelta: lo que sobra se junta en la costura opuesta
  return q;
}
`;

export function crearTerreno(material) {
  const grupo = new THREE.Group();
  for (const g of GEOS) { const m = new THREE.Mesh(g, material); m.frustumCulled = false; m.receiveShadow = true; m.castShadow = false; grupo.add(m); }
  return grupo;
}

export function materialTerreno(tex, calidad) {
  const m = new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0 });
  const U = {
    tGd: { value: tex.grass.d }, tGn: { value: tex.grass.n }, tFd: { value: tex.forest.d }, tFn: { value: tex.forest.n },
    tRd: { value: tex.rock.d }, tRn: { value: tex.rock.n }, tBd: { value: tex.bank.d }, tBn: { value: tex.bank.n },
    tPd: { value: tex.paramo.d }, tPn: { value: tex.paramo.n },
    uTile: { value: new THREE.Vector4(1 / 6, 1 / 4, 1 / 10, 1 / 4) }, uAgua: { value: WATER_Y }, uCam: U_CAM,
  };
  m.defines = { TRIPLANAR: calidad === 'baja' ? 0 : 1 };
  m.onBeforeCompile = s => {
    Object.assign(s.uniforms, U);
    s.vertexShader = 'varying vec3 vWP; varying vec3 vWN; varying float vB;\n' + GLSL_MUNDO + GLSL_NIVEL + s.vertexShader
      .replace('#include <beginnormal_vertex>', /* glsl */`
        float sN; vec2 q = nivelXZ(sN); float e = max(sN, 1.);
        float hT = alturaFn(q), hx = alturaFn(q+vec2(e,0.)), hz = alturaFn(q+vec2(0.,e));
        vec3 objectNormal = normalize(vec3(hT-hx, e, hT-hz));
        vB = bosqueFn(q, hT);`)
      .replace('#include <begin_vertex>', 'vec3 transformed = vec3(q.x, hT, q.y); vWP = transformed; vWN = objectNormal;');
    s.fragmentShader = FRAG_PARS + s.fragmentShader
      .replace('#include <map_fragment>', FRAG_MAP)
      .replace('#include <roughnessmap_fragment>', 'float roughnessFactor = tRough;')
      .replace('#include <normal_fragment_maps>', 'normal = normalize((viewMatrix*vec4(tNW,0.)).xyz);');
    mate(s);
  };
  m.customProgramCacheKey = () => 'terrenoTubo' + m.defines.TRIPLANAR;
  return m;
}

const FRAG_PARS = /* glsl */`
uniform sampler2D tGd,tGn,tFd,tFn,tRd,tRn,tBd,tBn,tPd,tPn;
uniform vec4 uTile; uniform float uAgua; uniform vec3 uCam;
varying vec3 vWP; varying vec3 vWN; varying float vB;
float th1(vec2 p){ vec3 q=fract(vec3(p.xyx)*.1031); q+=dot(q,q.yzx+33.33); return fract((q.x+q.y)*q.z); }
float tn1(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(th1(i),th1(i+vec2(1,0)),f.x),mix(th1(i+vec2(0,1)),th1(i+vec2(1,1)),f.x),f.y); }
vec4 albT(sampler2D t, vec2 uv){ vec4 a=texture2D(t,uv), b=texture2D(t,uv*.37+vec2(.41,.17)); return mix(a,b,smoothstep(.3,.7,tn1(uv*.11))*.55); }
vec3 nTop(sampler2D t, vec2 uv, vec3 N){ vec3 n=texture2D(t,uv).xyz*2.-1.; return normalize(vec3(n.x+N.x, abs(n.z)*N.y, n.y+N.z)); }
`;

// Igual que el valle, con el relieve del tubo: límite de árboles ~330 m, páramo encima y roca en las cumbres (~400 m).
// Las coordenadas de textura usan x plano: a 6,3 km por vuelta la repetición de las texturas no se nota en la costura.
const FRAG_MAP = /* glsl */`
vec3 N = normalize(vWN);
float h = vWP.y, slope = 1.-N.y, nz = tn1(vWP.xz*.045), nz2 = tn1(vWP.xz*.21);
float wR = max(smoothstep(.30,.46,slope+(nz-.5)*.12), smoothstep(370.,420.,h+nz*30.)*.85);
float wB = (1.-smoothstep(uAgua+.7,uAgua+2.4,h+(nz2-.5)*1.4))*(1.-wR);
float wF = clamp(vB*1.4,0.,1.)*(1.-wR)*(1.-wB);
float wG0 = max(0.,1.-wR-wB-wF), pa = smoothstep(290.,350.,h+(nz-.5)*40.);
float wG = wG0*(1.-pa), wP = wG0*pa;
vec4 acc = vec4(0.); vec3 nacc = vec3(0.);
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
vec3 alb = acc.rgb * mix(.82,1.12,tn1(vWP.xz*.013)) * mix(1.,.86,wF);
float dcam = length(vWP - uCam);
alb = mix(alb, vec3(.03,.05,.02)*mix(.8,1.25,tn1(vWP.xz*.03)), clamp(vB*1.3,0.,1.)*smoothstep(120.,520.,dcam)*.85);   // de lejos, ladera boscosa = color de copas
diffuseColor.rgb *= alb;
vec3 tNW = normalize(nacc);
float tRough = clamp(acc.a, .55, 1.);
`;
