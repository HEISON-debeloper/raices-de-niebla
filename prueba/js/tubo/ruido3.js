// Ruido 3D idéntico en JavaScript y en GLSL (hash entero de 32 bits): la GPU dibuja el mismo relieve que la CPU usa
// para caminar, nadar y colocar árboles. Cambiar uno sin el otro rompe esa igualdad: hay una prueba numérica.

export function hash3(x, y, z) {
  let h = (Math.imul(x | 0, 0x8da6b343) ^ Math.imul(y | 0, 0xd8163841) ^ Math.imul(z | 0, 0xcb1ab31f)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x7feb352d) >>> 0;
  h = Math.imul(h ^ (h >>> 15), 0x846ca68b) >>> 0;
  h = (h ^ (h >>> 16)) >>> 0;
  return h / 4294967296;
}

export function n3(x, y, z) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const fx = x - xi, fy = y - yi, fz = z - zi;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), w = fz * fz * (3 - 2 * fz);
  const a = hash3(xi, yi, zi), b = hash3(xi + 1, yi, zi), c = hash3(xi, yi + 1, zi), d = hash3(xi + 1, yi + 1, zi);
  const e = hash3(xi, yi, zi + 1), f = hash3(xi + 1, yi, zi + 1), g = hash3(xi, yi + 1, zi + 1), h = hash3(xi + 1, yi + 1, zi + 1);
  const x1 = a + (b - a) * u, x2 = c + (d - c) * u, x3 = e + (f - e) * u, x4 = g + (h - g) * u;
  const y1 = x1 + (x2 - x1) * v, y2 = x3 + (x4 - x3) * v;
  return y1 + (y2 - y1) * w;
}

/** fbm 3D, 0–1. Cada octava dobla la frecuencia y se desplaza (mismo desplazamiento en GLSL). */
export function fbm3(x, y, z, oct) {
  let s = 0, a = 0.5, n = 0;
  for (let i = 0; i < oct; i++) { s += a * n3(x, y, z); n += a; a *= 0.5; x = x * 2 + 17.3; y = y * 2 + 9.1; z = z * 2 + 4.7; }
  return s / n;
}

export const GLSL_RUIDO = /* glsl */`
float hash3(ivec3 p){
  uint h = (uint(p.x)*0x8da6b343u) ^ (uint(p.y)*0xd8163841u) ^ (uint(p.z)*0xcb1ab31fu);
  h = (h ^ (h>>16u))*0x7feb352du; h = (h ^ (h>>15u))*0x846ca68bu; h = h ^ (h>>16u);
  return float(h)/4294967296.;
}
float n3(vec3 p){
  vec3 i = floor(p), f = p - i; vec3 u = f*f*(3.-2.*f); ivec3 q = ivec3(i);
  float a=hash3(q), b=hash3(q+ivec3(1,0,0)), c=hash3(q+ivec3(0,1,0)), d=hash3(q+ivec3(1,1,0));
  float e=hash3(q+ivec3(0,0,1)), f2=hash3(q+ivec3(1,0,1)), g=hash3(q+ivec3(0,1,1)), h=hash3(q+ivec3(1,1,1));
  float x1=a+(b-a)*u.x, x2=c+(d-c)*u.x, x3=e+(f2-e)*u.x, x4=g+(h-g)*u.x;
  float y1=x1+(x2-x1)*u.y, y2=x3+(x4-x3)*u.y;
  return y1+(y2-y1)*u.z;
}
float fbm3(vec3 p, int oct){
  float s=0., a=.5, n=0.;
  for(int i=0;i<8;i++){ if(i>=oct) break; s+=a*n3(p); n+=a; a*=.5; p=p*2.+vec3(17.3,9.1,4.7); }
  return s/n;
}
`;
