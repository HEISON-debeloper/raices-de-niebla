// Terreno infinito del tubo: anillos anidados alrededor de la cámara (geometry clipmap). Nivel l = cuadrícula de
// 130×130 celdas con separación s = 2^l m; cada nivel tapa el hueco del siguiente.
// v2: la altura NO se calcula por vértice en cada cuadro: cada nivel tiene una TEXTURA DE DATOS (133×133 texeles, uno
// por vértice) que la GPU genera con las fórmulas de mundo-glsl.js solo cuando la cámara cruza una celda del nivel.
// Así el relieve puede ser todo lo complejo que haga falta (lagos, arroyos, volcanes…) sin que cueste por cuadro.
//  · texA = (parte entera de h, fracción de h, parte entera del agua, fracción): media precisión exacta al milímetro.
//  · texB = (densidad de pasto, bosque, pantano, volcán).
// Los vértices caen exactamente en el centro de los texeles: la altura dibujada es la misma que calcula la CPU para
// caminar (mundo.js), con error < 2 cm medido. Geomorfismo en el borde de cada nivel: sin grietas al moverse.
import * as THREE from 'three';
import { GLSL_MUNDO } from './mundo-glsl.js';
import { mate } from '../materiales.js';

export const M = 64, HUECO = 31, NIVELES = 8, T = 2 * M + 5;   // 8 niveles: 1 m … 128 m (±8,3 km a lo largo del eje)   // T texeles por lado (índices -M-2 … M+2)

/** position = (i, 0, j): índice de la cuadrícula; el shader arma la posición real. */
function geoNivel(l) {
  const pos = [], idx = [], n = 2 * M + 3, id = (i, j) => (j + M + 1) * n + (i + M + 1);
  for (let j = -M - 1; j <= M + 1; j++) for (let i = -M - 1; i <= M + 1; i++) pos.push(i, 0, j);
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

/** Generador de las texturas de datos por nivel (en la GPU). */
export function crearNiveles(renderer) {
  const niveles = [];
  const mat = new THREE.ShaderMaterial({
    glslVersion: THREE.GLSL3,
    uniforms: { uNiv: { value: new THREE.Vector4() } },
    defines: { MODO: 0 },
    vertexShader: 'out vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }',
    fragmentShader: /* glsl */`
      precision highp float; precision highp int;
      ${GLSL_MUNDO}
      uniform vec4 uNiv; in vec2 vUv;
      layout(location = 0) out vec4 gA; layout(location = 1) out vec4 gB;
      void main(){
        vec2 pp = floor(vUv*${T}.) - ${M + 2}.; float s = uNiv.z;
        vec2 p = vec2(uNiv.x + clamp(pp.x*s, -TC*.5, TC*.5), uNiv.y + pp.y*s);   // el tubo da una vuelta: lo que sobra se junta en la costura opuesta
        float h, W, lava, ni, sw, vm, bo, ny = 1.;
        #if MODO == 2
          // niveles gruesos: promedio de 4 muestras; el agua solo donde TODA la celda está bajo el agua (sin lagos falsos lejanos)
          float hs = 0., vs = 1e9, bos = 0., sws = 0., vms = 0.;
          for (int k = 0; k < 4; k++) { vec2 o = vec2(k == 1 || k == 3 ? .25 : -.25, k >= 2 ? .25 : -.25) * s;
            datos(p + o, h, W, lava, ni, sw, vm, bo); hs += h; vs = min(vs, W - h); bos += bo; sws += sw; vms += vm; }
          h = hs * .25; W = h + vs; bo = bos * .25; sw = sws * .25; vm = vms * .25;
        #else
          datos(p, h, W, lava, ni, sw, vm, bo);
          #if MODO == 1
            float e = .5, hx = alturaFn(p + vec2(e, 0.)), hz = alturaFn(p + vec2(0., e)); ny = e / length(vec3(h - hx, e, h - hz));
          #endif
        #endif
        float g = smt(.8, .9, ny) * smt(.7, 1.6, h - W) * (1. - smt(ARBOL_MAX, ARBOL_MAX + 40., h)) * (1. - .65 * bo) * (1. - vm) * (1. - .6 * sw);
        gA = vec4(floor(h), h - floor(h), floor(W), W - floor(W));
        gB = vec4(g, bo, sw, vm);
      }`,
  });
  const mats = [0, 1, 2].map(m => { const k = mat.clone(); k.defines = { MODO: m }; k.uniforms = { uNiv: { value: new THREE.Vector4() } }; return k; });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2)), sc = new THREE.Scene(), oc = new THREE.OrthographicCamera(); quad.frustumCulled = false; sc.add(quad);
  for (let l = 0; l < NIVELES; l++) {
    const rt = new THREE.WebGLRenderTarget(T, T, { count: 2, type: THREE.HalfFloatType, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: false });
    for (const t of rt.textures) { t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping; }
    niveles.push({ s: 2 ** l, rt, texA: rt.textures[0], texB: rt.textures[1], uNiv: { value: new THREE.Vector4(1e9, 1e9, 2 ** l, l) }, modo: l === 0 ? 1 : l >= 3 ? 2 : 0 });
  }
  let hechos = 0;
  return {
    niveles,
    /** Regenera los niveles cuya celda cambió. Devuelve cuántos se regeneraron. */
    update(cam) {
      let n = 0; const prev = renderer.getRenderTarget();
      for (const N of niveles) {
        const s2 = 2 * N.s, cx = Math.floor(cam.x / s2 + 0.5) * s2, cz = Math.floor(cam.z / s2 + 0.5) * s2;
        if (cx === N.uNiv.value.x && cz === N.uNiv.value.y) continue;
        N.uNiv.value.x = cx; N.uNiv.value.y = cz;
        const m = mats[N.modo]; m.uniforms.uNiv.value.copy(N.uNiv.value); quad.material = m;
        renderer.setRenderTarget(N.rt); renderer.render(sc, oc); n++; hechos++;
      }
      renderer.setRenderTarget(prev); return n;
    },
    get hechos() { return hechos; },
  };
}

/** Vértices: posición plana (xz) con geomorfismo, y lectura de la textura del nivel. */
export const GLSL_NIVEL = /* glsl */`
uniform vec3 uCam; uniform vec4 uNiv; uniform sampler2D texA, texB;
#define TCc 6283.185307179586
vec2 nivelPP(){
  float s = uNiv.z; vec2 pp = position.xz, q = uNiv.xy + pp*s;
  vec2 dd = abs(q - uCam.xz)/s; float al = clamp((max(dd.x, dd.y) - 44.)/13., 0., 1.);
  return pp - mod(pp, 2.)*al;    // cerca del borde los vértices impares se funden con la cuadrícula del nivel siguiente
}
vec2 nivelXZ(vec2 pp){ float s = uNiv.z; return vec2(uNiv.x + clamp(pp.x*s, -TCc*.5, TCc*.5), uNiv.y + pp.y*s); }
vec2 uvNivel(vec2 pp){ return (pp + ${M + 2}.5) / ${T}.; }
vec4 leerA(vec2 pp){ return texture2D(texA, uvNivel(pp)); }
float alturaDe(vec4 A){ return A.r + A.g; }
float aguaDe(vec4 A){ return A.b + A.a; }
`;

export function crearTerreno(materiales) {
  const grupo = new THREE.Group();
  GEOS.forEach((g, l) => { const m = new THREE.Mesh(g, materiales[l]); m.frustumCulled = false; m.receiveShadow = true; m.castShadow = false; grupo.add(m); });
  return grupo;
}

/** Material del terreno para un nivel (todos comparten el programa; cambian las texturas y el centro). */
export function materialTerreno(tex, calidad, N) {
  const m = new THREE.MeshStandardMaterial({ roughness: 1, metalness: 0 });
  const U = {
    tGd: { value: tex.grass.d }, tGn: { value: tex.grass.n }, tFd: { value: tex.forest.d }, tFn: { value: tex.forest.n },
    tRd: { value: tex.rock.d }, tRn: { value: tex.rock.n }, tBd: { value: tex.bank.d }, tBn: { value: tex.bank.n },
    tPd: { value: tex.paramo.d }, tPn: { value: tex.paramo.n },
    uTile: { value: new THREE.Vector4(1 / 6, 1 / 4, 1 / 10, 1 / 4) }, uCam: U_CAM,
    uNiv: N.uNiv, texA: { value: N.texA }, texB: { value: N.texB },
  };
  m.defines = { TRIPLANAR: calidad === 'baja' ? 0 : 1 };
  m.onBeforeCompile = s => {
    Object.assign(s.uniforms, U);
    s.vertexShader = 'varying vec3 vWP; varying vec3 vWN; varying vec4 vB; varying float vW;\n' + GLSL_NIVEL + s.vertexShader
      .replace('#include <beginnormal_vertex>', /* glsl */`
        vec2 pp = nivelPP(), q = nivelXZ(pp); float s = uNiv.z;
        vec4 A = leerA(pp); float hT = alturaDe(A);
        float hx1 = alturaDe(leerA(pp + vec2(1., 0.))), hx0 = alturaDe(leerA(pp - vec2(1., 0.)));
        float hz1 = alturaDe(leerA(pp + vec2(0., 1.))), hz0 = alturaDe(leerA(pp - vec2(0., 1.)));
        vec3 objectNormal = normalize(vec3(hx0 - hx1, 2.*s, hz0 - hz1));
        vB = texture2D(texB, uvNivel(pp)); vW = aguaDe(A);`)
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
uniform vec4 uTile; uniform vec3 uCam;
varying vec3 vWP; varying vec3 vWN; varying vec4 vB; varying float vW;
float th1(vec2 p){ vec3 q=fract(vec3(p.xyx)*.1031); q+=dot(q,q.yzx+33.33); return fract((q.x+q.y)*q.z); }
float tn1(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.-2.*f);
  return mix(mix(th1(i),th1(i+vec2(1,0)),f.x),mix(th1(i+vec2(0,1)),th1(i+vec2(1,1)),f.x),f.y); }
vec4 albT(sampler2D t, vec2 uv){ vec4 a=texture2D(t,uv), b=texture2D(t,uv*.37+vec2(.41,.17)); return mix(a,b,smoothstep(.3,.7,tn1(uv*.11))*.55); }
vec3 nTop(sampler2D t, vec2 uv, vec3 N){ vec3 n=texture2D(t,uv).xyz*2.-1.; return normalize(vec3(n.x+N.x, abs(n.z)*N.y, n.y+N.z)); }
`;

// Capas: pradera, suelo de bosque, roca (triplanar), orilla/arena, páramo; y por código: nieve, pantano (barro húmedo),
// ceniza volcánica. Los pesos salen de altura, pendiente, nivel de agua local y las máscaras de la textura del nivel.
const FRAG_MAP = /* glsl */`
vec3 N = normalize(vWN);
float h = vWP.y, slope = 1.-N.y, nz = tn1(vWP.xz*.045), nz2 = tn1(vWP.xz*.21);
float volc = vB.a, pant = vB.b;
float wR = max(smoothstep(.30,.46,slope+(nz-.5)*.12), smoothstep(380.,430.,h+nz*30.)*.85);
wR = max(wR, volc*smoothstep(.12,.3,slope));
float wS = smoothstep(375.,425.,h+(nz-.5)*50.)*(1.-smoothstep(.45,.6,slope))*(1.-volc);     // nieve: en lo alto, no en paredes
float wB = (1.-smoothstep(vW+.7,vW+2.4,h+(nz2-.5)*1.4))*(1.-wR);                                // orilla: junto al agua local (mar, río, lago)
float wF = clamp(vB.g*1.4,0.,1.)*(1.-wR)*(1.-wB);
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
alb = mix(alb, alb*vec3(.22,.2,.19), volc*(1.-wR)*.9 + volc*wR*.6);                         // ceniza y roca volcánica oscura
alb = mix(alb, vec3(.07,.065,.045)*mix(.7,1.2,nz2), pant*.85);                                 // barro de pantano
alb = mix(alb, vec3(.86,.88,.92)*mix(.9,1.05,nz2), wS);                                        // nieve
float dcam = length(vWP - uCam);
alb = mix(alb, vec3(.03,.05,.02)*mix(.8,1.25,tn1(vWP.xz*.03)), clamp(vB.g*1.3,0.,1.)*smoothstep(120.,520.,dcam)*.85*(1.-wS));   // de lejos, ladera boscosa = color de copas
diffuseColor.rgb *= alb;
vec3 tNW = normalize(mix(nacc, N, wS*.7));
float tRough = mix(clamp(acc.a, .55, 1.), .72, wS); tRough = mix(tRough, .35, pant*.8);
`;
