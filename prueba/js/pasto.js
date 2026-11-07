// Pasto en la GPU: cada brizna se ubica en el shader según su número de instancia, en una cuadrícula fija del
// mundo alrededor de la cámara. Altura y densidad salen de la textura de datos del terreno. Viento animado.
import * as THREE from 'three';
import { mate } from './materiales.js';

export const PASTO = { alta: { lado: 260, radio: 42 }, media: { lado: 150, radio: 30 }, baja: { lado: 110, radio: 24 } };

export function crearPasto(dataTex, terr, dataFar, far) {
  // una mata = 4 briznas de 3 tramos; atributo blade = (desplazamiento x, desplazamiento z, giro, escala)
  const pos = [], bl = [], idx = []; const B = [[0, 0, 0, 1], [0.32, 0.18, 2.1, 0.8], [-0.25, 0.3, 4.2, 0.9], [0.1, -0.33, 1.1, 0.7]];
  B.forEach((b, k) => { const o = pos.length / 3; for (let r = 0; r <= 3; r++) for (const sx of [-0.5, 0.5]) { pos.push(sx, r / 3, 0); bl.push(...b); }
    for (let r = 0; r < 3; r++) { const a = o + r * 2; idx.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); } });
  const g = new THREE.InstancedBufferGeometry();
  g.setIndex(idx); g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('blade', new THREE.Float32BufferAttribute(bl, 4));
  g.setAttribute('normal', new THREE.Float32BufferAttribute(pos.map((_, i) => i % 3 === 1 ? 1 : 0), 3));
  g.instanceCount = 0;
  const U = {
    uData: { value: dataTex }, uTerr: { value: terr }, uDataFar: { value: dataFar }, uFar: { value: far }, uCam: { value: new THREE.Vector3() }, uTime: { value: 0 },
    uR: { value: 40 }, uSide: { value: 200 }, uSpacing: { value: 0.4 }, uWind: { value: new THREE.Vector2(0.9, 0.35) },
    uBase: { value: new THREE.Color().setRGB(0.045, 0.06, 0.012) }, uTip: { value: new THREE.Color().setRGB(0.115, 0.135, 0.028) },
  };
  /* MeshStandard con rugosidad 1: recibe la luz ambiental del cielo igual que el suelo (con Lambert quedaba negro a la sombra) y,
   al no tener mapa de entorno como espejo, ninguna brizna puede reflejar el disco del sol (un píxel blanco con halo). */
const m = new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 1, metalness: 0, envMapIntensity: 0.9 });
  m.onBeforeCompile = s => {
    Object.assign(s.uniforms, U);
    s.vertexShader = VERT_PARS + s.vertexShader
      .replace('#include <beginnormal_vertex>', VERT_MAIN)
      .replace('#include <begin_vertex>', 'vec3 transformed = gpos;');
    s.fragmentShader = 'centroid varying float vG; centroid varying float vGc; uniform vec3 uBase, uTip;\n' + s.fragmentShader
      .replace('vec4 diffuseColor = vec4( diffuse, opacity );',
        'float g = clamp(vG,0.,1.), gv = clamp(vGc,0.,1.); vec3 gc = mix(uBase*mix(.75,1.15,gv), uTip*mix(.8,1.2,gv), g); vec4 diffuseColor = vec4(gc*(.72+.28*g), 1.);');
    mate(s);
  };
  m.customProgramCacheKey = () => 'pasto';
  const mesh = new THREE.Mesh(g, m);
  mesh.frustumCulled = false; mesh.receiveShadow = true; mesh.castShadow = false; mesh.layers.set(1);   // capa 1: no entra al reflejo del agua
  return {
    mesh, U,
    calidad(q) { const c = PASTO[q]; U.uSide.value = c.lado; U.uR.value = c.radio; U.uSpacing.value = 2 * c.radio / c.lado; g.instanceCount = c.lado * c.lado; },
    update(t, cam) { U.uTime.value = t; U.uCam.value.copy(cam); },
  };
}

const VERT_PARS = /* glsl */`
uniform sampler2D uData, uDataFar; uniform vec4 uTerr, uFar; uniform vec3 uCam; uniform float uTime, uR, uSide, uSpacing; uniform vec2 uWind;
attribute vec4 blade;
centroid varying float vG; centroid varying float vGc;   // centroid + clamp: con MSAA la GPU extrapolaba vG en briznas de menos de un píxel → puntos brillantes
float gh(vec2 c){ vec3 q=fract(vec3(c.xyx)*.1031); q+=dot(q,q.yzx+33.33); return fract((q.x+q.y)*q.z); }
`;

const VERT_MAIN = /* glsl */`
float fid = float(gl_InstanceID);
vec2 cell = floor(uCam.xz/uSpacing) + vec2(mod(fid,uSide), floor(fid/uSide)) - floor(uSide*.5);
float r1=gh(cell), r2=gh(cell+17.31), r3=gh(cell+41.77), r4=gh(cell+73.13);
vec2 wp = (cell + vec2(r1,r2))*uSpacing;
vec4 D = (abs(wp.x) < uTerr.z*.5 && abs(wp.y) < uTerr.z*.5) ? texture2D(uData,(wp-uTerr.xy)/uTerr.z) : texture2D(uDataFar,(wp-uFar.xy)/uFar.z);   // fuera del mapa central: datos lejanos
float dist = length(wp-uCam.xz);
float keep = step(r3, D.g) * (1.-smoothstep(uR*.55,uR,dist));
float hgt = mix(.16,.52,r4*r4) * keep * (.5+.5*D.g) * blade.w;
float ang = r1*6.2831853 + blade.z; vec2 dir = vec2(cos(ang),sin(ang)), sd = vec2(-dir.y,dir.x);
wp += vec2(blade.x, blade.y)*uSpacing*.9;
float y = position.y, wdt = .028*(1.-y*.9)*(.75+r2*.5);
float gust = .5+.5*sin(uTime*1.3 + wp.x*.07 + wp.y*.05) + .3*sin(uTime*3.1 + wp.x*.29 - wp.y*.21);
vec2 bend = (uWind*(.25+gust*.75) + dir*.3) * y*y*hgt*.55;
vec3 gpos = vec3(wp.x, D.r, wp.y) + vec3(sd.x*position.x*wdt, y*hgt*(1.-.25*dot(bend,bend)), sd.y*position.x*wdt) + vec3(bend.x,0.,bend.y);
vec3 objectNormal = normalize(vec3(dir.x*.3, 1., dir.y*.3));
vG = y; vGc = r2;
`;
