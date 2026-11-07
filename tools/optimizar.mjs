// Optimiza los recursos crudos (RAW) para el navegador y los deja en prueba/assets/.
// Modelos: soldar, simplificar a maxTris, texturas WebP 1024, compresión meshopt -> <id>.glb
//          y una versión lejana (LOD1) más simple con texturas de 256 -> <id>_lod1.glb
// Texturas de terreno: WebP (difusa y normal 2048, rugosidad 1024).
import fs from 'node:fs'; import path from 'node:path';
import { NodeIO } from '@gltf-transform/core';
import { ALL_EXTENSIONS } from '@gltf-transform/extensions';
import { dedup, prune, weld, simplify, textureCompress, meshopt } from '@gltf-transform/functions';
import { MeshoptSimplifier, MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer';
import sharp from 'sharp';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const RAW = process.env.RAW, OUT = path.join(ROOT, 'prueba', 'assets');
const cfg = JSON.parse(fs.readFileSync(path.join(ROOT, 'prueba', 'assets.json'), 'utf8')), O = cfg.optimizar;
await MeshoptSimplifier.ready; await MeshoptEncoder.ready; await MeshoptDecoder.ready;
const io = new NodeIO().registerExtensions(ALL_EXTENSIONS).registerDependencies({ 'meshopt.encoder': MeshoptEncoder, 'meshopt.decoder': MeshoptDecoder });
const tris = doc => { let n = 0; for (const m of doc.getRoot().listMeshes()) for (const p of m.listPrimitives()) { const i = p.getIndices(), a = p.getAttribute('POSITION'); n += (i ? i.getCount() : a.getCount()) / 3 } return Math.round(n) };
const rep = { modelos: {}, texturas: {} };
fs.mkdirSync(path.join(OUT, 'models'), { recursive: true });
for (const id of cfg.models.ids) {
  const dir = path.join(RAW, 'models', id); if (!fs.existsSync(dir)) continue;
  const g = fs.readdirSync(dir).find(f => f.endsWith('.gltf')); if (!g) continue;
  try {
    const src = path.join(dir, g); let doc = await io.read(src); const t0 = tris(doc);
    const r0 = Math.min(1, O.maxTris / t0);
    await doc.transform(weld(), simplify({ simplifier: MeshoptSimplifier, ratio: r0, error: 0.01 }), dedup(), prune(),
      textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [O.texModel, O.texModel], quality: 85 }), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
    const t1 = tris(doc); const f0 = path.join(OUT, 'models', id + '.glb'); await io.write(f0, doc);
    let d2 = await io.read(src);
    await d2.transform(weld(), simplify({ simplifier: MeshoptSimplifier, ratio: r0 * O.lod1, error: 0.08 }), dedup(), prune(),
      textureCompress({ encoder: sharp, targetFormat: 'webp', resize: [O.texModelLod1, O.texModelLod1], quality: 80 }), meshopt({ encoder: MeshoptEncoder, level: 'medium' }));
    const t2 = tris(d2); const f1 = path.join(OUT, 'models', id + '_lod1.glb'); await io.write(f1, d2);
    rep.modelos[id] = { trisOriginal: t0, tris: t1, trisLod1: t2, kb: Math.round(fs.statSync(f0).size / 1024), kbLod1: Math.round(fs.statSync(f1).size / 1024) };
    console.log('modelo', id, JSON.stringify(rep.modelos[id]));
  } catch (e) { console.log('FALLA modelo', id, e.message); rep.modelos[id] = { error: e.message } }
}
for (const id of cfg.textures.ids) {
  const dir = path.join(RAW, 'tex', id); if (!fs.existsSync(dir)) continue; const o = path.join(OUT, 'tex', id); fs.mkdirSync(o, { recursive: true }); rep.texturas[id] = {};
  for (const [m, sz, q] of [['Diffuse', O.terrDiff, 82], ['nor_gl', O.terrNor, 90], ['Rough', O.terrRough, 80]]) {
    const f = path.join(dir, m + '.jpg'); if (!fs.existsSync(f)) continue;
    const d = path.join(o, m + '.webp'); await sharp(f).resize(sz, sz).webp({ quality: q }).toFile(d);
    rep.texturas[id][m] = Math.round(fs.statSync(d).size / 1024);
  }
  console.log('textura', id, JSON.stringify(rep.texturas[id]));
}
fs.writeFileSync(path.join(OUT, '_informe.json'), JSON.stringify(rep, null, 1));
