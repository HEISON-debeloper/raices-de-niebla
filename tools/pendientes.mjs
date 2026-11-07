// Mide pendientes y error de la malla lejana del relieve: node tools/pendientes.mjs prueba/js/terreno.js (necesita three en node_modules)
const T = await import(new URL(process.argv[2] || '../prueba/js/terreno.js', import.meta.url).href.startsWith('file:') && process.argv[2] ? (await import('node:url')).pathToFileURL((await import('node:path')).resolve(process.argv[2])).href : new URL('../prueba/js/terreno.js', import.meta.url).href);
const h = T.heightFn, S = 2400, step = 10, deg = [], alto = [];
for (let x = -S; x <= S; x += step) for (let z = -S; z <= S; z += step) {
  const gx = (h(x + 2, z) - h(x - 2, z)) / 4, gz = (h(x, z + 2) - h(x, z - 2)) / 4;
  deg.push(Math.atan(Math.hypot(gx, gz)) * 180 / Math.PI); alto.push(h(x, z));
}
const q = (a, p) => { const s = [...a].sort((u, v) => u - v); return s[Math.floor(p * (s.length - 1))].toFixed(1); };
console.log('pendiente (°): mediana', q(deg, .5), 'p90', q(deg, .9), 'p99', q(deg, .99), 'máx', q(deg, 1), '| >35°:', (deg.filter(d => d > 35).length / deg.length * 100).toFixed(1) + '%', '>45°:', (deg.filter(d => d > 45).length / deg.length * 100).toFixed(2) + '%');
console.log('altura (m): mín', q(alto, 0), 'mediana', q(alto, .5), 'p99', q(alto, .99), 'máx', q(alto, 1));
// error de la malla lejana: diferencia entre la altura real y la interpolada con vértices cada 25 m
let e = 0, e99 = []; for (let i = 0; i < 20000; i++) { const x = (Math.random() * 2 - 1) * 2200, z = (Math.random() * 2 - 1) * 2200, x0 = Math.floor(x / 25) * 25, z0 = Math.floor(z / 25) * 25, u = (x - x0) / 25, v = (z - z0) / 25;
  const b = h(x0, z0) * (1 - u) * (1 - v) + h(x0 + 25, z0) * u * (1 - v) + h(x0, z0 + 25) * (1 - u) * v + h(x0 + 25, z0 + 25) * u * v; e99.push(Math.abs(b - h(x, z))); }
console.log('error de la malla a 25 m (m): p99', q(e99, .99), 'máx', q(e99, 1));
