// Vegetación y rocas con instancias: cada especie se dibuja con pocas llamadas (una por parte del modelo),
// con versión cercana detallada (LOD0) y versión lejana simplificada (LOD1) que se reparten según la distancia.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

/** Mallas del modelo (o solo las del nodo cuyo nombre empieza por `nodo`), recentradas en x,z sobre el origen. */
/** Tiempo compartido por el viento de todas las hojas. */
export const VIENTO = { value: 0 };

/** Hojas: material propio con viento que respeta las instancias (el de EZ-Tree reescribe la proyección y las ignora). */
function materialHojas(src) {
  const m = new THREE.MeshStandardMaterial({ map: src.map, color: src.color, alphaTest: Math.max(0.4, src.alphaTest || 0.5), side: THREE.DoubleSide, roughness: 0.9, metalness: 0, alphaToCoverage: true });
  m.onBeforeCompile = s => {
    s.uniforms.uTime = VIENTO;
    s.vertexShader = 'uniform float uTime;\n' + s.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
      #ifdef USE_INSTANCING
        vec3 ip = instanceMatrix[3].xyz;
      #else
        vec3 ip = vec3(0.);
      #endif
      float wo = dot(ip.xz, vec2(.13,.07)) + position.y*.08 + position.x*.05;
      transformed.xz += uv.y * .35 * vec2(sin(uTime*1.6+wo) + .4*sin(uTime*3.7+wo*1.7), cos(uTime*1.25+wo*1.3));`);
  };
  m.customProgramCacheKey = () => 'hojas';
  return m;
}

function partes(gltf, nodo) {
  const out = []; gltf.scene.updateMatrixWorld(true);
  let raiz = gltf.scene, off = new THREE.Matrix4();
  if (nodo) { let hit = null; gltf.scene.traverse(o => { if (!hit && o.name && o.name.startsWith(nodo)) hit = o; }); if (!hit) throw new Error('no existe el nodo ' + nodo); raiz = hit; const w = new THREE.Vector3().setFromMatrixPosition(raiz.matrixWorld); off.makeTranslation(-w.x, 0, -w.z); }
  raiz.traverse(o => {
    if (!o.isMesh) return;
    const src = o.material;
    // ramas de EZ-Tree (Phong con el entorno como espejo) → Standard rugoso, como todo lo demás
    const mat = src.name === 'leaves' ? materialHojas(src) : src.isMeshPhongMaterial
      ? new THREE.MeshStandardMaterial({ map: src.map, normalMap: src.normalMap, normalScale: src.normalScale, aoMap: src.aoMap, color: src.color, roughness: 0.95, metalness: 0 })
      : src.clone();
    if (mat.alphaTest > 0 || mat.transparent) { mat.transparent = false; mat.alphaTest = Math.max(mat.alphaTest, 0.42); mat.alphaToCoverage = true; mat.side = THREE.DoubleSide; }
    mat.envMapIntensity = 0.8;
    out.push({ geo: o.geometry, mat, m: off.clone().multiply(o.matrixWorld) });
  });
  return out;
}

/** Imposter: fotografía del modelo (vista de frente) en dos planos cruzados. 4 triángulos para los árboles lejanos. */
function crearImposter(renderer, ps) {
  const sc = new THREE.Scene(), obj = new THREE.Group(); sc.add(obj);
  for (const p of ps) { const m = new THREE.Mesh(p.geo, p.mat); m.applyMatrix4(p.m); obj.add(m); }
  obj.updateMatrixWorld(true);
  sc.add(new THREE.HemisphereLight(0xdfe8ff, 0x3a4028, 2.2)); const dl = new THREE.DirectionalLight(0xfff2dd, 2.4); dl.position.set(0.4, 1, 0.8); sc.add(dl);
  const box = new THREE.Box3().setFromObject(obj), sz = box.getSize(new THREE.Vector3()), c = box.getCenter(new THREE.Vector3());
  const w = Math.max(sz.x, sz.z), h = sz.y, W = 256, H = Math.min(512, Math.round(256 * h / w / 64) * 64 || 256);
  const cam = new THREE.OrthographicCamera(-w / 2, w / 2, h / 2, -h / 2, 0.1, w * 4); cam.position.set(c.x, c.y, c.z + w * 2); cam.lookAt(c);
  const rt = new THREE.WebGLRenderTarget(W, H, { samples: 4 }); rt.texture.colorSpace = THREE.SRGBColorSpace;
  const prev = renderer.getRenderTarget(), pc = renderer.getClearColor(new THREE.Color()), pa = renderer.getClearAlpha();
  renderer.setRenderTarget(rt); renderer.setClearColor(0x3d4a2a, 0); renderer.clear(); renderer.render(sc, cam);
  renderer.setRenderTarget(prev); renderer.setClearColor(pc, pa);
  const mat = new THREE.MeshStandardMaterial({ map: rt.texture, alphaTest: 0.45, side: THREE.DoubleSide, alphaToCoverage: true, roughness: 1, metalness: 0 });
  const a = new THREE.PlaneGeometry(w, h); a.translate(c.x, c.y, 0);
  const b = a.clone(); b.rotateY(Math.PI / 2);
  const geo = mergeGeometries([a, b]);
  // normales hacia arriba: el imposter se ilumina como copa, sin oscurecerse de lado
  const n = geo.attributes.normal; for (let i = 0; i < n.count; i++) n.setXYZ(i, 0, 1, 0);
  return { geo, mat };
}

export class Especie {
  constructor(nombre, g0, g1, max, opts = {}) {
    this.nombre = nombre; this.near = opts.near ?? 70; this.mid = opts.mid ?? Infinity; this.far = opts.far ?? 700; this.items = [];
    this.grupo = new THREE.Group();
    const P0 = partes(g0, opts.nodo), P1 = g1 ? partes(g1, opts.nodo) : null;
    const mk = (ps, sombra) => ps.map(p => {
      const im = new THREE.InstancedMesh(p.geo, p.mat, max); im.count = 0; im.frustumCulled = false;
      im.castShadow = sombra; im.receiveShadow = true; im.userData.m = p.m; this.grupo.add(im); return im;
    });
    this.l0 = mk(P0, true); this.l1 = P1 ? mk(P1, opts.sombraLejos ?? true) : null;
    this.l2 = null;
    if (opts.renderer && g1 && isFinite(this.mid)) {
      const im = crearImposter(opts.renderer, P1), m = new THREE.InstancedMesh(im.geo, im.mat, max);
      m.count = 0; m.frustumCulled = false; m.castShadow = false; m.receiveShadow = true; m.userData.m = new THREE.Matrix4(); this.grupo.add(m); this.l2 = [m];
    }
    this.tris = [P0, P1].map(ps => (ps || []).reduce((n, p) => n + (p.geo.index ? p.geo.index.count : p.geo.attributes.position.count) / 3, 0));
  }
  /** items: [{x,y,z,ry,s}] */
  colocar(items) {
    const q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), s = new THREE.Vector3();
    this.items = items.map(it => { e.set(0, it.ry, 0); q.setFromEuler(e); return { p: new THREE.Vector3(it.x, it.y, it.z), M: new THREE.Matrix4().compose(v.set(it.x, it.y, it.z), q, s.setScalar(it.s)) }; });
  }
  /** Reparte cada instancia entre detalle cercano y lejano, y descarta lo que está fuera de la vista
   *  (con margen para no perder sombras de lo que está justo detrás). k escala las distancias según la calidad. */
  actualizar(cam, frustum, k = 1) {
    const tmp = new THREE.Matrix4(), n2 = (this.near * k) ** 2, m2 = (this.mid * k) ** 2, f2 = (this.far * Math.max(k, 0.75)) ** 2, sph = this.sph || (this.sph = new THREE.Sphere());
    let c0 = 0, c1 = 0, c2 = 0;
    for (const it of this.items) {
      const d2 = it.p.distanceToSquared(cam);
      if (d2 > f2) continue;
      if (frustum) { sph.center.copy(it.p); sph.center.y += 4; sph.radius = d2 < 900 ? 30 : 12; if (!frustum.intersectsSphere(sph)) continue; }
      if (this.l2 && d2 > m2) { this.l2[0].setMatrixAt(c2++, it.M); continue; }
      const lejos = this.l1 && d2 > n2, set = lejos ? this.l1 : this.l0, i = lejos ? c1++ : c0++;
      for (const im of set) im.setMatrixAt(i, tmp.multiplyMatrices(it.M, im.userData.m));
    }
    if (this.l2) { this.l2[0].count = c2; this.l2[0].instanceMatrix.needsUpdate = true; }
    for (const im of this.l0) { im.count = c0; im.instanceMatrix.needsUpdate = true; }
    if (this.l1) for (const im of this.l1) { im.count = c1; im.instanceMatrix.needsUpdate = true; }
    this.visibles = [c0, c1, c2];
  }
}

/** Reparte objetos sobre el terreno con una regla de aceptación y distancia mínima entre ellos. */
export function sembrar(terr, rnd, n, regla, minDist, area = 430) {
  const out = [], cell = minDist, grid = new Map(), key = (x, z) => Math.floor(x / cell) + ',' + Math.floor(z / cell);
  for (let tries = 0; tries < n * 60 && out.length < n; tries++) {
    const x = (rnd() * 2 - 1) * area, z = (rnd() * 2 - 1) * area, y = terr.heightAt(x, z), nrm = terr.normalAt(x, z);
    if (!regla(x, z, y, nrm, rnd)) continue;
    let ok = true; const cx = Math.floor(x / cell), cz = Math.floor(z / cell);
    for (let i = -1; i <= 1 && ok; i++) for (let j = -1; j <= 1 && ok; j++) for (const p of grid.get((cx + i) + ',' + (cz + j)) || []) if ((p.x - x) ** 2 + (p.z - z) ** 2 < minDist * minDist) { ok = false; break; }
    if (!ok) continue;
    const it = { x, y, z, ry: rnd() * Math.PI * 2, s: 1 };
    out.push(it); const k = key(x, z); if (!grid.has(k)) grid.set(k, []); grid.get(k).push(it);
  }
  return out;
}
