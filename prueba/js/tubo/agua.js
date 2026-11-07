// Agua del tubo: los mismos anillos del terreno a altura 0 (el agua se ve en todo el mundo y sigue la curva).
// Donde el suelo está por encima, el terreno la tapa. Doble cara: desde abajo se ve la superficie al bucear.
import * as THREE from 'three';
import { normalesAgua } from '../agua.js';
import { GLSL_MUNDO, WATER_Y } from './mundo.js';
import { GEOS, GLSL_NIVEL, U_CAM } from './terreno.js';
import { curvar } from './curva.js';

export function crearAgua() {
  const U = { uTime: { value: 0 }, uNor: { value: normalesAgua() }, uCam: U_CAM, uAguaY: { value: WATER_Y } };
  const m = new THREE.MeshStandardMaterial({ color: 0x15332d, roughness: 0.14, metalness: 0, envMapIntensity: 0.4, side: THREE.DoubleSide });
  m.onBeforeCompile = s => {
    Object.assign(s.uniforms, U);
    s.vertexShader = 'varying vec3 vWPa; uniform float uAguaY;\n' + GLSL_MUNDO + GLSL_NIVEL + s.vertexShader
      .replace('#include <beginnormal_vertex>', 'float sN; vec2 q = nivelXZ(sN); vec3 objectNormal = vec3(0.,1.,0.);')
      .replace('#include <begin_vertex>', 'vec3 transformed = vec3(q.x, uAguaY, q.y); vWPa = transformed;');
    s.fragmentShader = 'varying vec3 vWPa; uniform float uTime; uniform sampler2D uNor;\n' + GLSL_MUNDO + s.fragmentShader
      .replace('#include <opaque_fragment>', 'outgoingLight *= mix(1., .45, smoothstep(250., 1200., length(vWPa - cameraPosition)));\n#include <opaque_fragment>').replace('#include <normal_fragment_maps>', /* glsl */`
      if (distRio(vWPa.xz) > 19.) discard;   // solo en los cauces: lejos el terreno es más grueso que un río y el agua asomaba en manchas
      vec2 ua = vWPa.xz*.055 + uTime*vec2(.018,.011), ub = vWPa.xz*.17 + uTime*vec2(-.013,.021);
      vec3 na = texture2D(uNor,ua).xyz*2.-1., nb = texture2D(uNor,ub).xyz*2.-1.;
      float fade = 1.-smoothstep(60.,220.,length(vWPa.xz-cameraPosition.xz));
      vec2 d = (na.xy*.6 + nb.xy*.4) * .32 * fade;
      normal = normalize((viewMatrix*vec4(normalize(vec3(d.x,1.,d.y)),0.)).xyz) * (gl_FrontFacing ? 1. : -1.);`);
    curvar(s);
  };
  m.customProgramCacheKey = () => 'aguaTubo';
  const grupo = new THREE.Group();
  for (const g of GEOS) { const me = new THREE.Mesh(g, m); me.frustumCulled = false; me.receiveShadow = true; me.renderOrder = 1; grupo.add(me); }
  return { grupo, calidad() {}, update(t) { U.uTime.value = t; } };
}
