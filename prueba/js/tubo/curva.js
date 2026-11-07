// Enrolla el mundo plano en el tubo al dibujar. Cada material pasa por curvar(shader):
//  · posición: el punto plano (x, y, z) se dibuja a distancia R−y del eje, en el ángulo (x − xCámara)/R. Junto a la
//    cámara el doblez es la identidad, así que caminar, colisiones y sombras siguen siendo planas.
//  · sol: está en el eje, en z = zSol. Por la simetría del cilindro, la luz que recibe cada punto en SU marco local es
//    (0, R−y, zSol−z): se calcula por píxel con la posición plana. Exacto en todo el tubo, también en el "techo".
// Las normales quedan en el marco plano local, que es justo el marco en que se calcula esa luz.
import * as THREE from 'three';
import { R } from './mundo.js';

export const CURVA = {
  uDoblez: { value: new THREE.Vector2(0, R) },          // x de la cámara, radio
  uSolT: { value: new THREE.Vector3(0, R, 0) },        // (encendido 0/1, altura del eje, z del sol)
};

const PROJ = /* glsl */`
vec4 wpD = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
  wpD = batchingMatrix * wpD;
#endif
#ifdef USE_INSTANCING
  wpD = instanceMatrix * wpD;
#endif
wpD = modelMatrix * wpD;
vPlano = wpD.xyz;
wpD.xyz = doblar( wpD.xyz );
vec4 mvPosition = viewMatrix * wpD;
gl_Position = projectionMatrix * mvPosition;`;

export const GLSL_DOBLAR = /* glsl */`
uniform vec2 uDoblez;
vec3 doblar(vec3 p){ float a=(p.x-uDoblez.x)/uDoblez.y, r=uDoblez.y-p.y; return vec3(uDoblez.x+r*sin(a), uDoblez.y-r*cos(a), p.z); }
`;

const LUZ = THREE.ShaderChunk.lights_fragment_begin.replace(
  'getDirectionalLightInfo( directionalLight, directLight );',
  'getDirectionalLightInfo( directionalLight, directLight ); solLocal( directLight );');
if (LUZ === THREE.ShaderChunk.lights_fragment_begin) throw new Error('curva.js: cambió lights_fragment_begin');

const FRAG = /* glsl */`
void solLocal(inout IncidentLight L){
  vec3 d = vec3(0., uSolT.y - vPlano.y, uSolT.z - vPlano.z); d = normalize(d);
  float e = d.y;                                      // seno de la elevación local del sol
  float k = smoothstep(-.05, .42, e) * uSolT.x, warm = 1. - smoothstep(.035, .5, e);
  L.direction = normalize((viewMatrix*vec4(d,0.)).xyz);
  L.color *= k * vec3(1., .93-.32*warm, .85-.55*warm);
}
`;

export function curvar(s) {
  Object.assign(s.uniforms, CURVA);
  if (!s.vertexShader.includes('#include <project_vertex>')) throw new Error('curva.js: falta project_vertex');
  s.vertexShader = 'varying vec3 vPlano;\n' + GLSL_DOBLAR + s.vertexShader.replace('#include <project_vertex>', PROJ);
  if (!s.fragmentShader.includes('#include <lights_pars_begin>')) throw new Error('curva.js: falta lights_pars_begin');
  s.fragmentShader = 'varying vec3 vPlano; uniform vec3 uSolT;\n' + s.fragmentShader
    .replace('#include <lights_pars_begin>', '#include <lights_pars_begin>\n' + FRAG)   // después de definir IncidentLight
    .replace('#include <lights_fragment_begin>', LUZ);
}

/** Para materiales ajenos (venados): agrega el doblez sin tocar lo demás. */
export function hacerCurvo(m) {
  const prev = m.onBeforeCompile && m.onBeforeCompile !== THREE.Material.prototype.onBeforeCompile ? m.onBeforeCompile : null;
  m.onBeforeCompile = (s, r) => { if (prev) prev(s, r); curvar(s); };
  const key = m.customProgramCacheKey ? m.customProgramCacheKey.bind(m) : () => '';
  m.customProgramCacheKey = () => key() + '|curvo';
  return m;
}

/** Posición dibujada (doblada) de un punto plano, para recortes por cámara y distancias en la CPU. */
export function doblarCPU(x, y, z, camX, out) {
  const a = (x - camX) / R, r = R - y;
  out.x = camX + r * Math.sin(a); out.y = R - r * Math.cos(a); out.z = z; return out;
}
