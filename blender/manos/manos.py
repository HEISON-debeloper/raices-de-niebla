# Manos de primera persona desde el modelo enviado (dos antebrazos con mano, palmas verticales, pulgar arriba, dedos hacia el centro).
# Articulaciones medidas con cortes cada 1 cm (medir_manos.py) y vistas con rejilla. Pesos: cálculo de calor de Blender.
# Salida: manos.js → window.CHF (misma forma que window.CHM: posiciones, normales, uv, índices, huesos, pesos, textura).
import bpy, bmesh, numpy as np, json, base64, io, math
from mathutils import Vector
from mathutils.kdtree import KDTree
K = .47  # escala: muñeca → punta del dedo medio = 17 cm (como la mano de la vista)
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath='/home/claude/juego041/blender/manos/manos_pbr.glb')
o = [x for x in bpy.data.objects if x.type == 'MESH'][0]; bpy.context.view_layer.objects.active = o; o.select_set(True)
bpy.ops.object.transform_apply(location=True, rotation=True, scale=True); me = o.data; me.calc_loop_triangles()
# ---- articulaciones de la mano de x>0 (Blender: x, y = profundidad (palma hacia +y), z = alto) ----
W = (.40, -.03, .152); E = (.93, -.02, .18)
FING = [((.215, -.02, .228), (.06, -.005, .23)), ((.215, -.02, .163), (.04, -.005, .163)), ((.215, -.025, .096), (.05, -.02, .093)), ((.225, -.02, .065), (.12, -.014, .012))]  # índice, medio, anular, meñique: (nudillo, punta)
TH = [(.37, -.01, .215), (.29, -.015, .28), (.245, -.015, .32), (.205, -.015, .348)]  # pulgar: base, nudillo, falange, punta
R3 = {1: [[0, 0, 1], [1, 0, 0], [0, 1, 0]], -1: [[0, 0, -1], [-1, 0, 0], [0, 1, 0]]}  # por lado geométrico (x>0 / x<0)  # de la pose del modelo a la de la vista (antebrazo hacia −y, pulgar +z)
B = []; HEADB = {}; TAILB = {}
def lerp(a, b, t): return tuple(a[i] + (b[i] - a[i]) * t for i in range(3))
SG = {}
for sd, sg in (('R', 1), ('L', -1)):  # la palma mira hacia +y: las puntas de los dedos se curvan hacia +y (índice: nudillo y −,020 → punta y −,005)
    SG[sd] = sg
    m = lambda p: (sg * p[0], p[1], p[2])
    B += ['fo' + sd, 'hand' + sd]; HEADB['fo' + sd] = m(E); TAILB['fo' + sd] = m(W); HEADB['hand' + sd] = m(W); TAILB['hand' + sd] = m(FING[1][0])
    for f, (mcp, tip) in enumerate(FING):
        js = [mcp, lerp(mcp, tip, .44), lerp(mcp, tip, .75), tip]
        for k in range(3): n = 'f%s%d_%d' % (sd, f, k); B.append(n); HEADB[n] = m(js[k]); TAILB[n] = m(js[k + 1])
    for k in range(3): n = 't%s_%d' % (sd, k); B.append(n); HEADB[n] = m(TH[k]); TAILB[n] = m(TH[k + 1])
# ---- pesos por calor sobre una copia soldada ----
wm = me.copy(); wo = bpy.data.objects.new('peso', wm); bpy.context.scene.collection.objects.link(wo)
b_ = bmesh.new(); b_.from_mesh(wm); bmesh.ops.remove_doubles(b_, verts=b_.verts[:], dist=.0005); b_.to_mesh(wm); b_.free()
arm = bpy.data.armatures.new('esq'); ao = bpy.data.objects.new('esq', arm); bpy.context.scene.collection.objects.link(ao)
bpy.context.view_layer.objects.active = ao; bpy.ops.object.mode_set(mode='EDIT')
for n in B: eb = arm.edit_bones.new(n); eb.head = HEADB[n]; eb.tail = TAILB[n]
bpy.ops.object.mode_set(mode='OBJECT')
for x in bpy.data.objects: x.select_set(False)
wo.select_set(True); ao.select_set(True); bpy.context.view_layer.objects.active = ao; bpy.ops.object.parent_set(type='ARMATURE_AUTO')
gi = {g.index: g.name for g in wo.vertex_groups}; kd = KDTree(len(wm.vertices))
for v in wm.vertices: kd.insert(v.co, v.index)
kd.balance(); HW = [{gi[g.group]: g.weight for g in v.groups if g.weight > .01} for v in wm.vertices]
# ---- vértices por esquina ----
uvl = me.uv_layers.active.data; vn = np.array([v.normal[:] for v in me.vertices]); vp = np.array([v.co[:] for v in me.vertices])
key = {}; P = []; N = []; UV = []; IDX = []; VIX = []
for t in me.loop_triangles:
    for li, vi in zip(t.loops, t.vertices):
        u = uvl[li].uv; k = (vi, round(u[0], 5), round(u[1], 5))
        if k not in key: key[k] = len(P); P.append(vp[vi]); N.append(vn[vi]); UV.append((u[0], u[1])); VIX.append(vi)
        IDX.append(key[k])
P = np.array(P); N = np.array(N); UV = np.array(UV); print('triángulos', len(IDX) // 3, 'vértices', len(P))
IW = []; WW = []; sinpeso = 0
for n, vi in enumerate(VIX):
    _, j, _ = kd.find(Vector(vp[vi])); w = HW[j]
    if not w:  # sin peso: el hueso más cercano
        sinpeso += 1; p = Vector(vp[vi]); best = min(B, key=lambda b: (p - (Vector(HEADB[b]) + Vector(TAILB[b])) / 2).length); w = {best: 1}
    top = sorted(w.items(), key=lambda kv: -kv[1])[:4]; tot = sum(v for _, v in top)
    ii = [B.index(b) for b, _ in top] + [0] * (4 - len(top)); ww = [round(v / tot * 255) for _, v in top] + [0] * (4 - len(top)); ww[0] += 255 - sum(ww); IW.append(ii); WW.append(ww)
print('sin peso de calor', sinpeso)
toG = lambda a: np.stack([a[:, 0], a[:, 2], -a[:, 1]], 1)
G = toG(P) * K; GN = toG(N)
J = [tuple((np.array([h[0], h[2], -h[1]]) * K).tolist()) for h in (HEADB[b] for b in B)]
Q = [sum(R3[SG['R' if b.endswith('R') or b[1] == 'R' else 'L']], []) for b in B]
enc = lambda a: base64.b64encode(np.ascontiguousarray(a).tobytes()).decode()
img = [i for i in bpy.data.images if 'diffuse' in i.name][0]; Wd, Ht = img.size
px = (np.array(img.pixels[:], dtype=np.float32).reshape(Ht, Wd, 4)[::-1, :, :3] * 255).clip(0, 255).astype(np.uint8)
from PIL import Image
im = Image.fromarray(px).resize((1024, 1024), Image.LANCZOS); bio = io.BytesIO(); im.save(bio, 'JPEG', quality=88); jpg = base64.b64encode(bio.getvalue()).decode()
out = {'p': enc((G * 1e4).round().astype('<i2')), 'n': enc((GN * 127).round().clip(-127, 127).astype('i1')), 'uv': enc((UV.clip(0, 1) * 65535).round().astype('<u2')),
       'i': enc(np.array(IDX, dtype='<u2')), 'i32': False, 'si': enc(np.array(IW, dtype='u1')), 'sw': enc(np.array(WW, dtype='u1')), 'bones': B, 'j': J, 'q': Q, 'tex': jpg}
js = 'window.CHF=' + json.dumps(out, separators=(',', ':')) + ';'
open('/home/claude/juego041/blender/manos/manos.js', 'w').write(js); print('js', len(js) // 1024, 'KB; huesos', len(B))
for b, q in zip(B[:4], Q[:4]): print(b, q)
