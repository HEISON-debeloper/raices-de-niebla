// Agua del tubo: los mismos anillos del terreno, con la altura del NIVEL DE AGUA LOCAL de la textura del nivel (mar y
// ríos a 0, lagos de montaña y arroyos a su cota, lava en los cráteres). Se dibuja solo donde el agua queda por encima
// del terreno (misma malla y misma interpolación: el borde coincide exacto con la orilla). Doble cara: al bucear se ve
// la superficie desde abajo. Donde la superficie es casi vertical (cascadas) se vuelve espuma blanca que cae.
import * as THREE from 'three';
import { normalesAgua } from '../agua.js';
import { GEOS, GLSL_NIVEL, U_CAM } from './terreno.js';
import { curvar } from './curva.js';

export function crearAgua(niveles) {
  const U = { uTime: { value: 0 }, uNor: { value: normalesAgua() }, uCam: U_CAM };
  const mats = niveles.map(N => {
    const m = new THREE.MeshStandardMaterial({ color: 0x15332d, roughness: 0.14, metalness: 0, envMapIntensity: 0.4, side: THREE.DoubleSide });
    m.onBeforeCompile = s => {
      Object.assign(s.uniforms, U, { uNiv: N.uNiv, texA: { value: N.texA }, texB: { value: N.texB } });
      s.vertexShader = 'varying vec3 vWPa; varying float vV; varying float vLava; varying vec3 vNa;\n' + GLSL_NIVEL + s.vertexShader
        .replace('#include <beginnormal_vertex>', /* glsl */`
          vec2 pp = nivelPP(), q = nivelXZ(pp); float s = uNiv.z;
          // El agua nunca flota: en un vértice seco vecino de agua, la superficie baja hasta el suelo de ese vértice
          // (orilla), en vez de caer hasta el nivel 0 formando una pared colgada entre dos vértices.
          vec4 A = leerA(pp); float h = alturaDe(A), W = aguaDe(A);
          vec2 o[4]; o[0] = vec2(1.,0.); o[1] = vec2(-1.,0.); o[2] = vec2(0.,1.); o[3] = vec2(0.,-1.);
          float Wn[4]; float wMax = -1e9;
          for (int k = 0; k < 4; k++) { vec4 An = leerA(pp + o[k]); float wk = aguaDe(An), hk = alturaDe(An); Wn[k] = wk > hk ? wk : -1e9; wMax = max(wMax, Wn[k]); }
          if (W <= h) W = wMax > -1e8 ? min(wMax, h) : W;
          for (int k = 0; k < 4; k++) if (Wn[k] < -1e8) Wn[k] = W;   // vecinos secos: superficie plana (sin falsas cascadas)
          vec3 objectNormal = normalize(vec3(Wn[1] - Wn[0], 2.*s, Wn[3] - Wn[2])); vNa = objectNormal;
          vec4 B = texture2D(texB, uvNivel(pp)); vV = W - h; vLava = (B.a > .5 && W > 30.) ? 1. : 0.;`)
        .replace('#include <begin_vertex>', 'vec3 transformed = vec3(q.x, W, q.y); vWPa = transformed;');
      s.fragmentShader = 'varying vec3 vWPa; varying float vV; varying float vLava; varying vec3 vNa; uniform float uTime; uniform sampler2D uNor;\n' + s.fragmentShader
        .replace('#include <clipping_planes_fragment>', '#include <clipping_planes_fragment>\n if (vV < 0.) discard;')
        .replace('#include <normal_fragment_maps>', /* glsl */`
          vec2 ua = vWPa.xz*.055 + uTime*vec2(.018,.011), ub = vWPa.xz*.17 + uTime*vec2(-.013,.021);
          vec3 na = texture2D(uNor,ua).xyz*2.-1., nb = texture2D(uNor,ub).xyz*2.-1.;
          float fade = 1.-smoothstep(60.,220.,length(vWPa.xz-cameraPosition.xz));
          float caida = smoothstep(.25,.6,1.-normalize(vNa).y);                                  // cascada: superficie casi vertical
          vec2 d = (na.xy*.6 + nb.xy*.4) * .32 * fade * (1.-caida);
          vec3 nG = normalize(vNa);
          vec3 nW = normalize(nG + vec3(d.x, 0., d.y));
          normal = normalize((viewMatrix*vec4(nW,0.)).xyz) * (gl_FrontFacing ? 1. : -1.);`)
        .replace('#include <roughnessmap_fragment>', /* glsl */`
          float roughnessFactor = roughness;
          float caidaR = smoothstep(.25,.6,1.-normalize(vNa).y);
          float esp = texture2D(uNor, vec2(vWPa.x*.21, vWPa.y*.08 + uTime*.9)).x * texture2D(uNor, vec2(vWPa.z*.17+.3, vWPa.y*.05 + uTime*1.4)).y;
          roughnessFactor = mix(roughnessFactor, .95, max(caidaR, vLava));
          diffuseColor.rgb = mix(diffuseColor.rgb, vec3(.75,.8,.85)*(.4+.65*esp), caidaR*.9);     // espuma que cae (con vetas: no un plano blanco)
          if (vLava > .5) { float cr = texture2D(uNor, vWPa.xz*.03).z, cr2 = texture2D(uNor, vWPa.xz*.11 + uTime*.004).x;   // lava: costra oscura con grietas que brillan
            float grieta = smoothstep(.55,.75,cr*.6+cr2*.4); diffuseColor.rgb = mix(vec3(.05,.04,.035), vec3(.2,.08,.03), grieta); totalEmissiveRadiance += mix(vec3(0.), vec3(4.,1.1,.15)*(.7+.3*sin(uTime*2.+cr*30.)), grieta); }`)
        .replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>');
      curvar(s);
    };
    m.customProgramCacheKey = () => 'aguaTubo';
    return m;
  });
  const grupo = new THREE.Group();
  GEOS.forEach((g, l) => { const me = new THREE.Mesh(g, mats[l]); me.frustumCulled = false; me.receiveShadow = true; me.renderOrder = 1; grupo.add(me); });
  return { grupo, calidad() {}, update(t) { U.uTime.value = t; } };
}
