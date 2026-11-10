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
key = {}; P = []; N = []; UV = []; IDX = []; VIX = []
for t in me.loop_triangles:
    for li, vi in zip(t.loops, t.vertices):
        u = uvl[li].uv; k = (vi, round(u[0], 5), round(u[1], 5))
        if k not in key: key[k] = len(P); P.append(vp[vi]); N.append(vn[vi]); UV.append((u[0], u[1])); VIX.append(vi)
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
# articulaciones medidas sobre la malla (anatomia.py: cortes cada 1 cm + vistas con rejilla métrica). Coordenadas del juego:
# x = derecha, y = altura (suelo 0), z = frente (+). Cadena de cada brazo y pierna en una sola profundidad para que no quede quebrada.
ZA, ZL = -.075, -.05   # profundidad del eje del brazo (va por detrás del centro del tronco) y de la pierna
J = {'hips': (0, .95, -.03), 'torso': (0, 1.03, -.03), 'neck': (0, 1.57, -.02), 'head': (0, 1.71, -.04),
     'upR': (.195, 1.49, ZA), 'foR': (.44, 1.49, ZA), 'handR': (.66, 1.485, ZA),
     'thR': (.095, .95, ZL), 'snR': (legx(.555), .555, ZL), 'ftR': (legx(.115), .115, ZL)}
J.update({'spine1': (0, 1.06, -.05), 'spine2': (0, 1.18, -.06), 'clavR': (.025, 1.545, .03), 'neck2': (0, 1.64, -.02)})
J.update({'upTwR': (.32, 1.49, ZA), 'elbowHR': (.425, 1.49, ZA), 'foTwR': (.55, 1.488, ZA), 'hipHR': (.095, .93, ZL - .03), 'kneeHR': (legx(.57), .57, ZL + .02), 'toeR': (legx(.03), .025, .08)})
for k in ('upTw', 'elbowH', 'foTw', 'hipH', 'kneeH', 'toe'): x, y, z = J[k + 'R']; J[k + 'L'] = (-x, y, z)
for k in ('up', 'fo', 'hand', 'th', 'sn', 'ft', 'clav'): x, y, z = J[k + 'R']; J[k + 'L'] = (-x, y, z)
B = ['hips', 'torso', 'neck', 'head', 'upR', 'foR', 'handR', 'upL', 'foL', 'handL', 'thR', 'snR', 'ftR', 'thL', 'snL', 'ftL', 'spine1', 'spine2', 'clavR', 'clavL', 'neck2'] + [n + sd for sd in 'RL' for n in ('upTw', 'elbowH', 'foTw', 'hipH', 'kneeH', 'toe')]
# dedos de la mano derecha del modelo (vista desde arriba, coordenadas de Blender): eje y por dedo y articulaciones en x
FING = [(-.022, (.795, .835, .862)), (.012, (.80, .845, .877)), (.043, (.80, .842, .874)), (.074, (.80, .832, .858))]  # índice, medio, anular, meñique
FZ = 1.47
TH0, TH1 = np.array([.712, .012]), np.array([.795, -.068]); THJ = (0, .4, .7)  # pulgar: base → punta; articulaciones en fracción del largo
for sd in 'RL':
    for f in range(4):
        for k in range(3): B.append('f%s%d_%d' % (sd, f, k))
    for k in range(3): B.append('t%s_%d' % (sd, k))
FJ = {}
for sd, sg in (('R', 1), ('L', -1)):
    for f, (fy, xs) in enumerate(FING):
        for k in range(3): FJ['f%s%d_%d' % (sd, f, k)] = (sg * xs[k], FZ, -fy)
    for k in range(3):
        q = TH0 + (TH1 - TH0) * THJ[k]; FJ['t%s_%d' % (sd, k)] = (sg * q[0], FZ - .008, -q[1])
def ss(a, b, x): t = min(1, max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t)
# giro de reposo de cada hueso: de la pose del modelo (brazos en T, piernas abiertas) a la del juego (brazos y piernas rectos hacia abajo)
def rotz(a): c, s = math.cos(a), math.sin(a); return [c, -s, 0, s, c, 0, 0, 0, 1]
Q = {b: rotz(0) for b in B}
for sd, sg in (('R', 1), ('L', -1)):
    for b in ('up', 'fo', 'hand'): Q[b + sd] = rotz(-sg * math.pi / 2)
    th, sn, ft = J['th' + sd], J['sn' + sd], J['ft' + sd]
    a1 = math.atan2(sn[0] - th[0], th[1] - sn[1]); a2 = math.atan2(ft[0] - sn[0], sn[1] - ft[1])
    Q['th' + sd] = rotz(-a1); Q['sn' + sd] = rotz(-a2); Q['ft' + sd] = rotz(-a2)  # endereza: gira la pierna abierta hasta la vertical
# ---- pesos automáticos (Blender, difusión de calor): esqueleto puesto sobre el modelo en pose T ----
TAIL = {'hips': (0, 1.06, -.05), 'spine1': (0, 1.18, -.06), 'spine2': (0, 1.32, -.05), 'torso': (0, 1.57, -.02), 'neck': (0, 1.71, -.04), 'head': (0, 1.9, -.02)}
for sd, sg in (('R', 1), ('L', -1)):
    TAIL['clav' + sd] = J['up' + sd]; TAIL['up' + sd] = J['fo' + sd]; TAIL['fo' + sd] = J['hand' + sd]
    TAIL['elbowH' + sd] = (sg * .475, 1.49, ZA); TAIL['hipH' + sd] = (J['th' + sd][0], .87, ZL - .09); TAIL['kneeH' + sd] = (J['sn' + sd][0], .53, ZL + .06)
    TAIL['toe' + sd] = (J['ft' + sd][0], .02, .175); TAIL['hand' + sd] = (sg * .785, 1.475, ZA)
    TAIL['th' + sd] = J['sn' + sd]; TAIL['sn' + sd] = J['ft' + sd]; TAIL['ft' + sd] = J['toe' + sd]
    for f, (fy, xs) in enumerate(FING):
        tips = list(xs[1:]) + [xs[2] + (xs[2] - xs[1]) * 1.2]
        for k in range(3): TAIL['f%s%d_%d' % (sd, f, k)] = (sg * tips[k], FZ, -fy)
    for k in range(3):
        q = TH0 + (TH1 - TH0) * (THJ[k + 1] if k < 2 else 1.0); TAIL['t%s_%d' % (sd, k)] = (sg * q[0], FZ - .008, -q[1])
HEAD = dict(J); HEAD.update(FJ); HEAD['sn' + 'R'] = J['snR']; 

tob = lambda g: (g[0] * 10, -g[2] * 10, g[1] * 10)  # juego → Blender, ×10: el cálculo de calor falla con modelos de 2 m
# copia soldada (el modelo viene partido por las costuras de la textura y así el cálculo de calor falla), ×10 de escala
import bmesh as _bm
wm = me.copy(); wo = bpy.data.objects.new('peso', wm); bpy.context.scene.collection.objects.link(wo)
_b = _bm.new(); _b.from_mesh(wm); _bm.ops.remove_doubles(_b, verts=_b.verts[:], dist=.0004)
for v in _b.verts: v.co *= 10
_b.to_mesh(wm); print('bordes abiertos tras soldar', sum(1 for e in _b.edges if e.is_boundary)); _b.free()
arm = bpy.data.armatures.new('esq'); ao = bpy.data.objects.new('esq', arm); bpy.context.scene.collection.objects.link(ao)
bpy.context.view_layer.objects.active = ao; bpy.ops.object.mode_set(mode='EDIT')
NEWB = {'neck2'} | {n + sd for sd in 'RL' for n in ('upTw', 'elbowH', 'foTw', 'hipH', 'kneeH', 'toe')}
for b in B:
    if b in NEWB: continue  # ayudantes: sus pesos se reparten después a partir de los del hueso principal
    eb = arm.edit_bones.new(b); eb.head = tob(HEAD[b]); eb.tail = tob(TAIL[b])
    if (eb.tail - eb.head).length < 1e-3: eb.tail = eb.head + __import__('mathutils').Vector((0, 0, .2))
bpy.ops.object.mode_set(mode='OBJECT')
for x in bpy.data.objects: x.select_set(False)
wo.select_set(True); ao.select_set(True); bpy.context.view_layer.objects.active = ao
bpy.ops.object.parent_set(type='ARMATURE_AUTO')
gi = {g.index: g.name for g in wo.vertex_groups}
from mathutils.kdtree import KDTree
kd = KDTree(len(wm.vertices))
for v in wm.vertices: kd.insert(v.co, v.index)
kd.balance(); HW = [{gi[g.group]: g.weight for g in v.groups if g.weight > .01 and gi.get(g.group) in B} for v in wm.vertices]
HEAT = {}
for v in me.vertices:
    _, j, _ = kd.find(v.co * 10)
    if HW[j]: HEAT[v.index] = HW[j]
print('pesos automáticos en', len(HEAT), 'de', len(me.vertices), 'vértices')
IW = []; WW = []
for n, (x, y, z) in enumerate(G):
    w = {}
    def add(b, v):
        if v > 0: w[b] = w.get(b, 0) + v
    ax = abs(x); sd = 'R' if x > 0 else 'L'
    warm = ss(.17, .24, ax) * ss(1.28, 1.36, y)
    # brazo: hombro → codo → muñeca a lo largo de |x|
    if warm > 0:
        e = ss(.41, .47, ax); h = ss(.65, .71, ax)
        add('up' + sd, warm * (1 - e)); add('fo' + sd, warm * e * (1 - h))
        hw = warm * h
        if hw > 0:
            by = -z  # y de Blender
            tl = None
            if .69 < ax < .815 and by < -.008 - (ax - .70) * .35:  # pulgar
                d = TH1 - TH0; t = float(np.dot(np.array([ax, by]) - TH0, d) / np.dot(d, d))
                a0 = ss(.08, .2, t); a1 = ss(.34, .46, t); a2 = ss(.64, .76, t)
                add('hand' + sd, hw * (1 - a0)); add('t%s_0' % sd, hw * a0 * (1 - a1)); add('t%s_1' % sd, hw * a1 * (1 - a2)); add('t%s_2' % sd, hw * a2)
            elif ax > .775:
                fi = 0 if by <= -.004 else 1 if by <= .028 else 2 if by <= .058 else 3
                xs = FING[fi][1]; a0 = ss(xs[0] - .012, xs[0] + .008, ax); a1 = ss(xs[1] - .008, xs[1] + .008, ax); a2 = ss(xs[2] - .007, xs[2] + .007, ax)
                add('hand' + sd, hw * (1 - a0)); add('f%s%d_0' % (sd, fi), hw * a0 * (1 - a1)); add('f%s%d_1' % (sd, fi), hw * a1 * (1 - a2)); add('f%s%d_2' % (sd, fi), hw * a2)
            else: add('hand' + sd, hw)
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
    hw_ = HEAT.get(VIX[n])
    if hw_ and not any(k[0] in 'ft' and k[:2] != 'ft' and k[:2] != 'th' for k in w): w = hw_  # dedos: se quedan los pesos por regiones
    w = dict(w); g_ = lambda k: w.get(k, 0)
    def mv(src, dst, f):  # pasa la fracción f del peso de src al ayudante dst
        v = g_(src) * f
        if v > 0: w[src] = g_(src) - v; w[dst] = g_(dst) + v
    sd = 'R' if x > 0 else 'L'; ax = abs(x)
    # columna: el cálculo de calor deja el abdomen entero al pecho; se reparte cadera → vértebra 1 → vértebra 2 → pecho por altura
    tt = g_('hips') + g_('spine1') + g_('spine2') + g_('torso')
    if tt > 0 and .9 < y < 1.45:
        C_ = [.95, 1.06, 1.18, 1.32]; hw = [max(0, 1 - abs(y - c) / .12) for c in C_]
        if y <= C_[0]: hw = [1, 0, 0, 0]
        if y >= C_[-1]: hw = [0, 0, 0, 1]
        sh_ = sum(hw) or 1
        for nm_, hv in zip(('hips', 'spine1', 'spine2', 'torso'), hw): w[nm_] = tt * hv / sh_
    mv('up' + sd, 'upTw' + sd, ss(.25, .40, ax)); mv('fo' + sd, 'foTw' + sd, ss(.50, .64, ax))
    e = .5 * math.exp(-((ax - .44) / .035) ** 2); mv('upTw' + sd, 'elbowH' + sd, e); mv('up' + sd, 'elbowH' + sd, e); mv('fo' + sd, 'elbowH' + sd, e)
    e = .5 * math.exp(-((y - .555) / .045) ** 2); mv('th' + sd, 'kneeH' + sd, e); mv('sn' + sd, 'kneeH' + sd, e)
    e = .55 * math.exp(-((y - .92) / .07) ** 2) * ss(-.01, .06, -.03 - z); mv('th' + sd, 'hipH' + sd, e); mv('hips', 'hipH' + sd, e * .6)
    if y < .07: mv('ft' + sd, 'toe' + sd, ss(.065, .095, z))
    e = ss(1.59, 1.63, y) * (1 - ss(1.67, 1.72, y)) * .55; mv('neck', 'neck2', e); mv('head', 'neck2', e)
    w = {k: v for k, v in w.items() if v > 1e-4}
    top = sorted(w.items(), key=lambda kv: -kv[1])[:4]; tot = sum(v for _, v in top) or 1
    ii = [B.index(b) for b, _ in top] + [0] * (4 - len(top)); ww = [round(v / tot * 255) for _, v in top] + [0] * (4 - len(top))
    ww[0] += 255 - sum(ww); IW.append(ii); WW.append(ww)
enc = lambda a: base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
img = bpy.data.images[0]; Wd, Ht = img.size; px = (np.array(img.pixels[:], dtype=np.float32).reshape(Ht, Wd, 4)[::-1, :, :3] * 255).clip(0, 255).astype(np.uint8)
from PIL import Image
im = Image.fromarray(px).resize((2048, 2048), Image.LANCZOS); bio = io.BytesIO(); im.save(bio, 'JPEG', quality=86); jpg = base64.b64encode(bio.getvalue()).decode()
out = {'p': enc((G * 1e4).round().astype('<i2')), 'n': enc((GN * 127).round().clip(-127, 127).astype('i1')),
       'uv': enc((UV.clip(0, 1) * 65535).round().astype('<u2')), 'i': enc(np.array(IDX, dtype='<u2' if len(P) < 65536 else '<u4')), 'i32': len(P) >= 65536,
       'si': enc(np.array(IW, dtype='u1')), 'sw': enc(np.array(WW, dtype='u1')),
       'bones': B, 'j': [J.get(b, FJ.get(b)) for b in B], 'q': [Q.get(b, rotz(0)) for b in B], 'tex': jpg}
js = 'window.CHM=' + json.dumps(out, separators=(',', ':')) + ';'
open('/home/claude/juego041/blender/ia/personaje-completo.js', 'w').write(js); print('js', len(js) // 1024, 'KB', 'textura', len(jpg) // 1024, 'KB')
