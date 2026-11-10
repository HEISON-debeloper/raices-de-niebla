# Personaje completo desde el modelo de la app 3D (sin cortar ni rehacer): una sola malla lisa con su textura,
# reducida solo lo necesario para el celular, con pesos de piel para 16 huesos que siguen al esqueleto del juego.
# Salida: personaje-completo.js (window.CHM: posiciones, normales, uv, índices, huesos, pesos, textura jpg)
import bpy, numpy as np, json, base64, io, math, sys
TRI = int(sys.argv[-1]) if sys.argv[-1].isdigit() else 60000
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath='/home/claude/juego041/blender/ia/hombre.glb')
o = [x for x in bpy.data.objects if x.type == 'MESH'][0]; bpy.context.view_layer.objects.active = o; o.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True)
d = o.modifiers.new('d', 'DECIMATE'); d.ratio = TRI / len(o.data.polygons); bpy.ops.object.modifier_apply(modifier='d')
me = o.data; me.calc_loop_triangles()
# vértices por esquina (posición + uv + normal suave); se unen los que comparten las tres cosas
uvl = me.uv_layers.active.data; vn = np.array([v.normal[:] for v in me.vertices]); vp = np.array([v.co[:] for v in me.vertices])
key = {}; P = []; N = []; UV = []; IDX = []
for t in me.loop_triangles:
    for li, vi in zip(t.loops, t.vertices):
        u = uvl[li].uv; k = (vi, round(u[0], 5), round(u[1], 5))
        if k not in key: key[k] = len(P); P.append(vp[vi]); N.append(vn[vi]); UV.append((u[0], u[1]))
        IDX.append(key[k])
P = np.array(P); N = np.array(N); UV = np.array(UV); print('triángulos', len(IDX) // 3, 'vértices', len(P))
# blender (x, y, z) → juego (x, z, -y)
G = np.stack([P[:, 0], P[:, 2], -P[:, 1]], 1); GN = np.stack([N[:, 0], N[:, 2], -N[:, 1]], 1)
# centro de cada pierna por altura (las piernas vienen abiertas en compás)
L = G[(G[:, 0] > .02) & (G[:, 1] < .95)]; hs = np.linspace(0, .95, 40); cx = []
for h in hs:
    s = L[np.abs(L[:, 1] - h) < .03]; cx.append((s[:, 0].min() + s[:, 0].max()) / 2 if len(s) else .1)
legx = lambda z: float(np.interp(z, hs, cx))
DZ = -.03
J = {'hips': (0, .97, DZ), 'torso': (0, 1.04, DZ), 'neck': (0, 1.58, DZ), 'head': (0, 1.65, DZ),
     'upR': (.19, 1.467, DZ), 'foR': (.44, 1.467, DZ), 'handR': (.68, 1.467, DZ),
     'thR': (legx(.95), .95, DZ), 'snR': (legx(.6), .6, DZ), 'ftR': (legx(.08), .073, DZ)}
for k in ('up', 'fo', 'hand', 'th', 'sn', 'ft'): x, y, z = J[k + 'R']; J[k + 'L'] = (-x, y, z)
B = ['hips', 'torso', 'neck', 'head', 'upR', 'foR', 'handR', 'upL', 'foL', 'handL', 'thR', 'snR', 'ftR', 'thL', 'snL', 'ftL']
def ss(a, b, x): t = min(1, max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t)
# giro de reposo de cada hueso: de la pose del modelo (brazos en T, piernas abiertas) a la del juego (brazos y piernas rectos hacia abajo)
def rotz(a): c, s = math.cos(a), math.sin(a); return [c, -s, 0, s, c, 0, 0, 0, 1]
Q = {b: rotz(0) for b in B}
for sd, sg in (('R', 1), ('L', -1)):
    for b in ('up', 'fo', 'hand'): Q[b + sd] = rotz(-sg * math.pi / 2)
    th, sn, ft = J['th' + sd], J['sn' + sd], J['ft' + sd]
    a1 = math.atan2(sn[0] - th[0], th[1] - sn[1]); a2 = math.atan2(ft[0] - sn[0], sn[1] - ft[1])
    Q['th' + sd] = rotz(-a1); Q['sn' + sd] = rotz(-a2); Q['ft' + sd] = rotz(-a2)  # endereza: gira la pierna abierta hasta la vertical
IW = []; WW = []
for (x, y, z) in G:
    w = {}
    def add(b, v):
        if v > 0: w[b] = w.get(b, 0) + v
    ax = abs(x); sd = 'R' if x > 0 else 'L'
    warm = ss(.17, .24, ax) * ss(1.28, 1.36, y)
    # brazo: hombro → codo → muñeca a lo largo de |x|
    if warm > 0:
        e = ss(.41, .47, ax); h = ss(.65, .71, ax)
        add('up' + sd, warm * (1 - e)); add('fo' + sd, warm * e * (1 - h)); add('hand' + sd, warm * h)
    rb = 1 - warm
    if rb > 0:
        if y > 1.0:  # tronco, cuello y cabeza
            t1 = ss(1.0, 1.08, y); n1 = ss(1.53, 1.59, y); h1 = ss(1.62, 1.67, y)
            add('hips', rb * (1 - t1)); add('torso', rb * t1 * (1 - n1)); add('neck', rb * n1 * (1 - h1)); add('head', rb * h1)
        else:  # cadera y piernas
            hp = ss(.86, .97, y) if ax > .035 else ss(.80, .9, y)
            add('hips', rb * hp); lg = rb * (1 - hp)
            k1 = ss(.57, .64, y); f1 = ss(.07, .13, y)
            add('th' + sd, lg * k1); add('sn' + sd, lg * (1 - k1) * f1); add('ft' + sd, lg * (1 - k1) * (1 - f1))
    top = sorted(w.items(), key=lambda kv: -kv[1])[:2]; tot = sum(v for _, v in top) or 1
    ii = [B.index(b) for b, _ in top] + [0] * (4 - len(top)); ww = [round(v / tot * 255) for _, v in top] + [0] * (4 - len(top))
    ww[0] += 255 - sum(ww); IW.append(ii); WW.append(ww)
enc = lambda a: base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
img = bpy.data.images[0]; Wd, Ht = img.size; px = (np.array(img.pixels[:], dtype=np.float32).reshape(Ht, Wd, 4)[::-1, :, :3] * 255).clip(0, 255).astype(np.uint8)
from PIL import Image
im = Image.fromarray(px).resize((2048, 2048), Image.LANCZOS); bio = io.BytesIO(); im.save(bio, 'JPEG', quality=86); jpg = base64.b64encode(bio.getvalue()).decode()
out = {'p': enc((G * 1e4).round().astype('<i2')), 'n': enc((GN * 127).round().clip(-127, 127).astype('i1')),
       'uv': enc((UV.clip(0, 1) * 65535).round().astype('<u2')), 'i': enc(np.array(IDX, dtype='<u2' if len(P) < 65536 else '<u4')), 'i32': len(P) >= 65536,
       'si': enc(np.array(IW, dtype='u1')), 'sw': enc(np.array(WW, dtype='u1')),
       'bones': B, 'j': [J[b] for b in B], 'q': [Q[b] for b in B], 'tex': jpg}
js = 'window.CHM=' + json.dumps(out, separators=(',', ':')) + ';'
open('/home/claude/juego041/blender/ia/personaje-completo.js', 'w').write(js); print('js', len(js) // 1024, 'KB', 'textura', len(jpg) // 1024, 'KB')
