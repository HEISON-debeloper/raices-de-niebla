// Mundo-tubo (cilindro de O'Neill): el suelo es la cara interior de un cilindro de radio R que gira; "abajo" es hacia
// afuera del eje. Todo se calcula en coordenadas DESENROLLADAS (planas): x = arco alrededor del tubo (periódico, C),
// y = altura sobre el suelo (hacia el eje), z = a lo largo del eje (infinito). Solo al dibujar se enrolla (curva.js).
// Relieve: RIOS ríos a lo largo del eje separados por cordilleras de ~400 m que suben de forma progresiva.
// Las funciones existen dos veces, JS (caminar, nadar, sembrar) y GLSL (dibujar); deben coincidir (prueba numérica).
import { fbm3, GLSL_RUIDO } from './ruido3.js';

export const R = 1000, C = 2 * Math.PI * R, WATER_Y = 0, RIOS = 3;
const sm = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

/** Centro del río k en función de z (en metros de arco). */
export const rioU = (k, z) => k * C / RIOS + 300 + 70 * Math.sin(z / 260 + k * 2.1) + 25 * Math.sin(z / 83 + k * 1.3);

/** Distancia (en arco) al río más cercano. */
export function distRio(x, z) {
  let m = 1e9;
  for (let k = 0; k < RIOS; k++) { let d = x - rioU(k, z); d -= C * Math.floor(d / C + 0.5); m = Math.min(m, Math.abs(d)); }
  return m;
}

// ruido sobre la superficie del cilindro: periódico en x sin costura
function f(x, z, s, ox, oy, oz, oct) { const a = x / R; return fbm3(R * Math.cos(a) / s + ox, R * Math.sin(a) / s + oy, z / s + oz, oct); }

export function alturaFn(x, z) {
  const d = distRio(x, z);
  let h = 1.2 + 0.03 * d + (f(x, z, 60, 0, 0, 0, 4) - 0.5) * 6 * sm(12, 40, d);
  const t = Math.min(1, Math.max(0, (d - 60) / 950));
  h += 340 * Math.pow(t, 1.4) * (0.85 + 0.3 * f(x, z, 1100, 7.3, -2.9, 1.1, 3));
  h += 18 * (f(x, z, 260, 1.7, 5.1, -3.3, 4) - 0.5) * sm(40, 320, d);
  h += 4 * (f(x, z, 55, -4.2, 2.2, 8.8, 3) - 0.5) * sm(30, 200, d);
  const c = 1 - sm(7, 17, d);
  if (c > 0) {   // cauce hondo (hasta ~7 m): se puede bucear por debajo
    const fondo = -1.5 - 5.5 * Math.pow(1 - sm(0, 13, d), 0.8) + 0.8 * (f(x, z, 9, 3.1, 1.9, -6.2, 2) - 0.5);
    h = h * (1 - c) + fondo * c;
  }
  return h;
}

/** Bosque 0–1: manchas en el valle y bosque de niebla en las laderas hasta el límite de árboles (~330 m). */
export function bosqueFn(x, z, h) {
  const d = distRio(x, z);
  const v = sm(0.5, 0.6, f(x, z, 140, 11, -7, 2, 3)) * sm(20, 55, d);
  const l = sm(0.38, 0.5, f(x, z, 90, -5, 3, 9, 3)) * sm(25, 60, h);
  return Math.max(v, l) * (1 - sm(300, 360, h));
}

export function normalFn(x, z, e = 1) {
  const h = alturaFn(x, z), a = alturaFn(x + e, z), b = alturaFn(x, z + e), l = Math.hypot(h - a, e, h - b);
  return { x: (h - a) / l, y: e / l, z: (h - b) / l };
}

/** Lleva x al tramo [-C/2, C/2) alrededor de ref (el mundo se repite cada C en x). */
export const envolver = (x, ref = 0) => x - C * Math.floor((x - ref) / C + 0.5);

export const GLSL_MUNDO = GLSL_RUIDO + /* glsl */`
#define TR 1000.
#define TC 6283.185307179586
float smt(float a, float b, float x){ float t=clamp((x-a)/(b-a),0.,1.); return t*t*(3.-2.*t); }
float distRio(vec2 p){
  float m=1e9;
  for(int k=0;k<3;k++){ float fk=float(k); float u=fk*TC/3.+300.+70.*sin(p.y/260.+fk*2.1)+25.*sin(p.y/83.+fk*1.3);
    float d=p.x-u; d-=TC*floor(d/TC+.5); m=min(m,abs(d)); }
  return m;
}
float fc(vec2 p, float s, vec3 o, int oct){ float a=p.x/TR; return fbm3(vec3(TR*cos(a)/s, TR*sin(a)/s, p.y/s)+o, oct); }
float alturaFn(vec2 p){
  float d=distRio(p);
  float h=1.2+.03*d+(fc(p,60.,vec3(0.),4)-.5)*6.*smt(12.,40.,d);
  float t=clamp((d-60.)/950.,0.,1.);
  h+=340.*pow(t,1.4)*(.85+.3*fc(p,1100.,vec3(7.3,-2.9,1.1),3));
  h+=18.*(fc(p,260.,vec3(1.7,5.1,-3.3),4)-.5)*smt(40.,320.,d);
  h+=4.*(fc(p,55.,vec3(-4.2,2.2,8.8),3)-.5)*smt(30.,200.,d);
  float c=1.-smt(7.,17.,d);
  if(c>0.){ float fondo=-1.5-5.5*pow(1.-smt(0.,13.,d),.8)+.8*(fc(p,9.,vec3(3.1,1.9,-6.2),2)-.5); h=h*(1.-c)+fondo*c; }
  return h;
}
float bosqueFn(vec2 p, float h){
  float d=distRio(p);
  float v=smt(.5,.6,fc(p,140.,vec3(11.,-7.,2.),3))*smt(20.,55.,d);
  float l=smt(.38,.5,fc(p,90.,vec3(-5.,3.,9.),3))*smt(25.,60.,h);
  return max(v,l)*(1.-smt(300.,360.,h));
}
`;
