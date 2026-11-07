// Prueba rápida del tubo en UNA sola pasada (un navegador, un servidor):
//   errores de carga · paridad CPU/GPU · física · capturas pequeñas en una sola hoja.
// Uso: node tools/probar.js [vistas.json] [--paridad] [--fisica] [--cal=baja] [--esperar=4000]
//   vistas.json = [["nombre", "código JS que coloca la cámara"], ...]  (sin vistas: solo la del inicio)
// Salida: texto en consola + /tmp/probar/hoja.png (todas las capturas juntas, 480×270 cada una).
// Rápido a propósito: SwiftShader tarda segundos por cuadro; a 480×270 y calidad baja son ~4× menos.
const { chromium } = require('playwright'); const http = require('http'), fs = require('fs'), path = require('path');
const ROOT = path.resolve(__dirname, '..'), OUT = '/tmp/probar'; fs.mkdirSync(OUT, { recursive: true });
const arg = n => (process.argv.find(a => a.startsWith('--' + n + '=')) || '').split('=')[1];
const MIME = { '.js': 'application/javascript', '.html': 'text/html; charset=utf-8', '.webp': 'image/webp', '.glb': 'model/gltf-binary', '.json': 'application/json', '.png': 'image/png' };
const srv = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]); const f = path.join(ROOT, u.endsWith('/') ? u + 'index.html' : u); fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': MIME[path.extname(f)] || 'application/octet-stream' }); r.end(d); }); }).listen(0);
(async () => {
  const port = srv.address().port, vistasArg = process.argv.slice(2).find(a => !a.startsWith('--'));
  const vistas = vistasArg ? JSON.parse(fs.readFileSync(vistasArg, 'utf8')) : [['inicio', '0']];
  const b = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const p = await (await b.newContext({ viewport: { width: 480, height: 270 } })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error' && !/GPU stall/.test(m.text())) errs.push(m.text().slice(0, 600)); });
  const t0 = Date.now(); await p.goto(`http://localhost:${port}/prueba/?fija&calidad=${arg('cal') || 'baja'}`);
  await p.waitForFunction(() => window.__escena && (window.__escena.listo || window.__escena.errores.length), null, { timeout: 600000 });
  const info = await p.evaluate(() => ({ e: __escena.errores, c: __escena.cargados.filter(s => s.startsWith('flora')) }));
  console.log(`carga ${((Date.now() - t0) / 1000).toFixed(1)} s`, info.c.join(' '), info.e.length ? 'ERRORES ' + JSON.stringify(info.e) : '');
  if (process.argv.includes('--paridad')) console.log('paridad', JSON.stringify(await p.evaluate(async () => {
    const THREE = await import('three'), M = await import('/prueba/js/tubo/mundo.js'), G = await import('/prueba/js/tubo/mundo-glsl.js'), N = 64, pts = [];
    for (let i = 0; i < N; i++) pts.push([Math.random() * M.C - M.C / 2, Math.random() * 40000 - 20000]);
    let k = 0; for (let i = 0; i < 6 && k < 24; i++) for (let j = -4; j < 4 && k < 24; j++) { const L = M.lago(i, j); if (!L) continue; const s = L.rL * 0.6 + Math.random() * (L.Len - L.rL); pts[k++] = [L.cx + L.sgn * s, L.cz + 25 * Math.sin(s / 90 + L.f1) + 10 * Math.sin(s / 37 + L.f2)]; pts[k++] = [L.cx + Math.random() * L.rL, L.cz]; }
    const rt = new THREE.WebGLRenderTarget(N, 1, { type: THREE.FloatType }), r = __escena.renderer;
    const mat = new THREE.ShaderMaterial({ uniforms: { P: { value: pts.map(q => new THREE.Vector2(q[0], q[1])) } }, vertexShader: 'void main(){gl_Position=vec4(position.xy,0.,1.);}',
      fragmentShader: 'precision highp float; precision highp int;\n' + G.GLSL_MUNDO + 'uniform vec2 P[64]; void main(){ int i=int(gl_FragCoord.x); float h,W,l,n,s,v,b; datos(P[i],h,W,l,n,s,v,b); gl_FragColor=vec4(h,W,b,s+2.*v);}' });
    const sc = new THREE.Scene(), q = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat); q.frustumCulled = false; sc.add(q);
    r.setRenderTarget(rt); r.render(sc, new THREE.Camera()); const o = new Float32Array(N * 4); r.readRenderTargetPixels(rt, 0, 0, N, 1, o); r.setRenderTarget(null);
    let eh = 0, ew = 0; pts.forEach((q, i) => { const D = M.datos(q[0], q[1]); eh = Math.max(eh, Math.abs(D.h - o[i * 4])); ew = Math.max(ew, Math.abs(D.W - o[i * 4 + 1])); });
    return { errAltura_m: +eh.toFixed(3), errAgua_m: +ew.toFixed(3), ok: eh < 0.05 && ew < 0.05 };
  })));
  if (process.argv.includes('--fisica')) console.log('fisica', JSON.stringify(await p.evaluate(() => {
    const E = __escena, c = E.ctl(), st = c.st, cam = E.cam, x0 = E.rioU(0, 0) + 60, z0 = 0;
    E.modo(false); c.poner(x0, E.alturaFn(x0, z0) + 1.65, z0); st.keys.add('Space'); c.update(1 / 60); st.keys.delete('Space');
    let maxY = -1e9, t = 0; while (st.aire && t < 5) { c.update(1 / 60); t += 1 / 60; maxY = Math.max(maxY, cam.position.y); }
    const salto = +(maxY - E.alturaFn(cam.position.x, cam.position.z) - 1.65).toFixed(2);
    const xr = E.rioU(0, 0); c.poner(xr + 70, E.alturaFn(xr + 70, 0) + 1.65, 0); st.yaw = Math.PI / 2; st.keys.add('KeyW');
    let nado = false; for (let i = 0; i < 60 * 40 && !nado; i++) { c.update(1 / 60); nado = st.nadando; } st.keys.delete('KeyW');
    return { saltoMax_m: salto, llegaANadar: nado };
  })));
  const fotos = [];
  for (const [n, f] of vistas) {
    await p.evaluate(f); await p.evaluate(() => __escena.flora().generar(__escena.cam.position, Infinity));
    await p.waitForTimeout(+arg('esperar') || 4000); const file = `${OUT}/${n}.png`; await p.screenshot({ path: file, timeout: 300000 }); fotos.push(file);
    console.log(n, await p.evaluate(() => document.getElementById('fps').textContent.split('·').slice(2).join('·').trim()));
  }
  // hoja de contactos (2 columnas) con Python/PIL
  require('child_process').execFileSync('python3', ['-c', `from PIL import Image\nimport sys\nf=sys.argv[1:]\nims=[Image.open(x) for x in f]\ns=Image.new('RGB',(960,270*((len(ims)+1)//2)))\n[s.paste(im,(480*(i%2),270*(i//2))) for i,im in enumerate(ims)]\ns.save('${OUT}/hoja.png')`, ...fotos]);
  console.log('hoja', `${OUT}/hoja.png`, errs.length ? '| errores: ' + JSON.stringify(errs.slice(0, 5)) : '| sin errores');
  await b.close(); srv.close();
})().catch(e => { console.log('FALLO', e.message); process.exit(1); });
