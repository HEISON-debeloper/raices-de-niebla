// Convierte .glb a .gltf JSON con el búfer incrustado (base64): el enlace de Claude no sirve .glb, sí .json.
// Uso: node tools/glb-a-json.mjs prueba/assets/models/boulder_01.glb [...]   |   node tools/glb-a-json.mjs --lista  (los de prueba/assets.json → json)
import fs from 'node:fs';
let archivos = process.argv.slice(2);
if (archivos[0] === '--lista') { const cfg = JSON.parse(fs.readFileSync('prueba/assets.json', 'utf8')); archivos = cfg.json.flatMap(id => [`prueba/assets/models/${id}.glb`, `prueba/assets/models/${id}_lod1.glb`]); }
for (const f of archivos) {
  const b = fs.readFileSync(f), dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  if (dv.getUint32(0, true) !== 0x46546c67) throw new Error('no es glb: ' + f);
  let o = 12, json = null, bin = null;
  while (o < b.length) { const len = dv.getUint32(o, true), type = dv.getUint32(o + 4, true); const chunk = b.subarray(o + 8, o + 8 + len); if (type === 0x4e4f534a) json = JSON.parse(chunk.toString('utf8')); else if (type === 0x004e4942) bin = chunk; o += 8 + len; }
  json.buffers[0].uri = 'data:application/octet-stream;base64,' + Buffer.from(bin).toString('base64');
  const out = f.replace(/\.glb$/, '.json'); fs.writeFileSync(out, JSON.stringify(json)); console.log(out, (fs.statSync(out).size / 1e6).toFixed(2), 'MB');
}
