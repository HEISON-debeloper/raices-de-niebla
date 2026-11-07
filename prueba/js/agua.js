// Río: superficie con reflejos reales (Water de Three.js) o, en calidad baja, un material brillante sin reflejo.
import * as THREE from 'three';
import { Water } from 'three/addons/objects/Water.js';
import { WATER_Y } from './terreno.js';

/** Textura de normales de agua generada por código: suma de ondas con frecuencias enteras (se repite sin costuras). */
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
  const t = new THREE.DataTexture(d, n, n); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.generateMipmaps = true; t.minFilter = THREE.LinearMipmapLinearFilter; t.needsUpdate = true;
  return t;
}

export function crearAgua(sunDir) {
  const geo = new THREE.PlaneGeometry(2600, 2600); geo.rotateX(-Math.PI / 2);
  const nor = normalesAgua();
  let water = null, simple = null;
  const grupo = new THREE.Group();
  function calidad(q) {
    grupo.clear();
    if (q !== 'alta') {   // media y baja: sin segundo dibujado de la escena (reflejo del cielo + ondas)
      if (!simple) {
        const t = nor.clone(); t.repeat.set(260, 260); t.needsUpdate = true;
        simple = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0x0c2622, roughness: 0.05, metalness: 0, normalMap: t, normalScale: new THREE.Vector2(0.28, 0.28), envMapIntensity: 0.9 }));
        simple.position.y = WATER_Y;
      }
      grupo.add(simple);
    } else {
      const res = q === 'alta' ? 1024 : 512;
      if (!water || water.userData.res !== res) {
        if (water) water.material.uniforms.mirrorSampler.value.dispose?.();
        water = new Water(geo, { textureWidth: res, textureHeight: res, waterNormals: nor, sunDirection: sunDir, sunColor: 0xfff3d6, waterColor: 0x1a4a42, distortionScale: 3.2, alpha: 1, fog: false });
        water.material.uniforms.size.value = 2.2; water.position.y = WATER_Y; water.userData.res = res;
      }
      grupo.add(water);
    }
  }
  function update(t, sol) {
    if (water && water.parent) { water.material.uniforms.time.value = t * 0.6; water.material.uniforms.sunColor.value.copy(sol.color).multiplyScalar(Math.min(1, sol.intensity / 3)); }
    if (simple && simple.parent) simple.material.normalMap.offset.set(t * 0.004, t * 0.0025);
  }
  return { grupo, calidad, update };
}
