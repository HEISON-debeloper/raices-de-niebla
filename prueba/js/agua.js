// Río: una sola agua para todas las calidades. Refleja el cielo (luz de entorno), dos capas de ondas que se desplazan
// en direcciones distintas (no se ve la repetición) y brillo del sol. No vuelve a dibujar la escena: antes la calidad
// Alta usaba un reflejo real (Water.js) que costaba un segundo dibujado completo y en el iPhone mostraba remolinos grises.
import * as THREE from 'three';
import { WATER_Y } from './terreno.js';

/** Normales de agua generadas por código: suma de ondas con frecuencias enteras (se repite sin costuras). */
function normalesAgua(n = 256) {
  const H = new Float32Array(n * n), W = [];
  let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
  for (let i = 0; i < 28; i++) { const a = r() * 6.283, f = 1 + Math.floor(r() * 9); W.push([Math.round(Math.cos(a) * f), Math.round(Math.sin(a) * f), r() * 6.283, 1 / (f + 1.5)]); }
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) { let v = 0; for (const [kx, ky, p, am] of W) v += am * Math.sin(6.283 * (kx * x + ky * y) / n + p); H[y * n + x] = v; }
  const d = new Uint8Array(n * n * 4), at = (x, y) => H[((y + n) % n) * n + (x + n) % n];
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) {
    const dx = (at(x + 1, y) - at(x - 1, y)) * 2.2, dy = (at(x, y + 1) - at(x, y - 1)) * 2.2, l = Math.hypot(dx, dy, 1), k = (y * n + x) * 4;
    d[k] = (-dx / l * 0.5 + 0.5) * 255; d[k + 1] = (-dy / l * 0.5 + 0.5) * 255; d[k + 2] = (1 / l * 0.5 + 0.5) * 255; d[k + 3] = 255;
  }
  const t = new THREE.DataTexture(d, n, n); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.generateMipmaps = true;
  t.minFilter = THREE.LinearMipmapLinearFilter; t.magFilter = THREE.LinearFilter; t.needsUpdate = true;
  return t;
}

export function crearAgua() {
  const geo = new THREE.PlaneGeometry(10400, 10400); geo.rotateX(-Math.PI / 2);   // cubre todo el mundo (5,2 km + margen): antes acababa a 1,3 km en un borde recto
  const U = { uTime: { value: 0 }, uNor: { value: normalesAgua() } };
  const m = new THREE.MeshStandardMaterial({ color: 0x15332d, roughness: 0.14, metalness: 0, envMapIntensity: 0.75, side: THREE.DoubleSide });   // también se ve desde abajo al bucear
  m.onBeforeCompile = s => {
    Object.assign(s.uniforms, U);
    s.vertexShader = 'varying vec3 vWPa;\n' + s.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n vWPa=(modelMatrix*vec4(transformed,1.)).xyz;');
    s.fragmentShader = 'varying vec3 vWPa; uniform float uTime; uniform sampler2D uNor;\n' + s.fragmentShader.replace('#include <normal_fragment_maps>', /* glsl */`
      vec2 ua = vWPa.xz*.055 + uTime*vec2(.018,.011), ub = vWPa.xz*.17 + uTime*vec2(-.013,.021);
      vec3 na = texture2D(uNor,ua).xyz*2.-1., nb = texture2D(uNor,ub).xyz*2.-1.;
      float fade = 1.-smoothstep(60.,220.,length(vWPa.xz-cameraPosition.xz));      // lejos el agua se calma: sin parpadeo
      vec2 d = (na.xy*.6 + nb.xy*.4) * .32 * fade;
      normal = normalize((viewMatrix*vec4(normalize(vec3(d.x,1.,d.y)),0.)).xyz);`);
  };
  m.customProgramCacheKey = () => 'agua';
  const mesh = new THREE.Mesh(geo, m); mesh.position.y = WATER_Y; mesh.receiveShadow = true;
  const grupo = new THREE.Group(); grupo.add(mesh);
  return { grupo, calidad() {}, update(t) { U.uTime.value = t; } };
}
