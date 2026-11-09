# Personaje low-poly estilizado para Raíces de Niebla (0.43). Se ejecuta con el Blender de Python (bpy).
# Cada pieza se modela con su origen en la articulación del juego (mismas medidas que el cuerpo procedural de 0.31–0.42),
# así la animación existente la mueve igual. Ejes: se modela en coordenadas del juego (x derecha, y arriba, z adelante)
# y al exportar se usan tal cual; para el render de Blender se convierten (Blender: z arriba, -y adelante).
# Salida: personaje.json (por pieza: posiciones, normales planas y colores por vértice, triángulos sueltos) + render.png
import bpy, bmesh, json, math, sys
from mathutils import Vector, Matrix
OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else '/tmp/personaje'
def srgb(h): return ((h >> 16 & 255) / 255, (h >> 8 & 255) / 255, (h & 255) / 255)
P = dict(skin=0xd09a72, skinS=0xb27a55, skinL=0xe2ae86, lip=0xa85c50, hair=0x2b1d14, hairL=0x3d2a1c, brow=0x24170f, white=0xf2ede2,
         iris=0x5a3d24, pupil=0x120c08, boxer=0x2e5c8a, boxerD=0x234a70, band=0xe4ddd0, boot=0x6b4529, bootD=0x4a2e1a, sole=0x2a1f17,
         lace=0xc9a874, cloth=0xffffff, clothD=0xd8d8d8, pack=0x6a5236, packD=0x4a3824, strap=0x3a2a1a, buckle=0xb8a070, nail=0xe9c4b0)

def orient(m, ctr):
    """da vuelta los triángulos cuya normal apunta hacia dentro; ctr(centroide) -> punto interior de referencia"""
    o = []
    for a, b, c, k in m.t:
        A, B, C = Vector(a), Vector(b), Vector(c); n = (B - A).cross(C - A); g = (A + B + C) / 3
        o.append((a, c, b, k) if n.dot(g - Vector(ctr(g))) < 0 else (a, b, c, k))
    m.t = o; return m
class M:  # malla acumulada: triángulos con color por cara (normales planas = aspecto low-poly)
    def __init__(s): s.t = []  # [(v0,v1,v2,color)]
    def tri(s, a, b, c, col): s.t.append((tuple(a), tuple(b), tuple(c), col))
    def quad(s, a, b, c, d, col): s.tri(a, b, c, col); s.tri(a, c, d, col)
    def add(s, o): s.t += o.t; return s
    def xf(s, f):
        o = M(); o.t = [(f(a), f(b), f(c), k) for a, b, c, k in s.t]; return o

def ring_mesh(prof, seg, col, sx=1, sz=1, cx=0, cz=0, rot=0, cap_top=True, cap_bot=True):
    """perfil de torno [(y, radio)] de arriba abajo → sólido con 'seg' lados (pocos lados = facetas). col: color o f(x,y,z)"""
    m = M(); R = []
    for y, r in prof:
        R.append([(cx + math.cos(rot + 2 * math.pi * i / seg) * r * sx, y, cz + math.sin(rot + 2 * math.pi * i / seg) * r * sz) for i in range(seg)])
    cf = col if callable(col) else (lambda x, y, z: col)
    for k in range(len(R) - 1):
        A, B = R[k], R[k + 1]
        for i in range(seg):
            j = (i + 1) % seg; a, b, c, d = A[i], A[j], B[j], B[i]
            cc = [(a[q] + b[q] + c[q] + d[q]) / 4 for q in range(3)]
            m.quad(a, b, c, d, cf(*cc))
    def cap(Rr, up):
        cy = Rr[0][1]; ctr = (cx, cy, cz)
        for i in range(seg):
            j = (i + 1) % seg; a, b = Rr[i], Rr[j]
            cc = [(a[q] + b[q] + ctr[q]) / 3 for q in range(3)]
            (m.tri(ctr, b, a, cf(*cc)) if up else m.tri(ctr, a, b, cf(*cc)))
    if cap_top: cap(R[0], True)
    if cap_bot: cap(R[-1], False)
    ys = [y for y, r in prof]; ymid = (max(ys) + min(ys)) / 2
    return orient(m, lambda g: (cx, g.y if min(ys) + 1e-4 < g.y < max(ys) - 1e-4 else ymid, cz))

def blob(cx, cy, cz, rx, ry, rz, col, w=8, h=6, f=None):
    """esfera de pocas caras (w lados, h anillos); f opcional deforma (x,y,z)->(x,y,z) en la esfera unidad"""
    m = M(); V = []
    for k in range(h + 1):
        th = math.pi * k / h; row = []
        for i in range(w):
            ph = 2 * math.pi * i / w; x, y, z = math.sin(th) * math.cos(ph), math.cos(th), math.sin(th) * math.sin(ph)
            if f: x, y, z = f(x, y, z)
            row.append((cx + x * rx, cy + y * ry, cz + z * rz))
        V.append(row)
    cf = col if callable(col) else (lambda x, y, z: col)
    for k in range(h):
        for i in range(w):
            j = (i + 1) % w; a, b, c, d = V[k][i], V[k][j], V[k + 1][j], V[k + 1][i]
            cc = [(a[q] + b[q] + c[q] + d[q]) / 4 for q in range(3)]
            if k == 0: m.tri(a, c, d, cf(*cc))
            elif k == h - 1: m.tri(a, b, c, cf(*cc))
            else: (m.tri(a, c, b, cf(*cc)), m.tri(a, d, c, cf(*cc)))
    return orient(m, lambda g: (cx, cy, cz))

def box(cx, cy, cz, sx, sy, sz, col, bev=0.0):
    m = M(); x0, x1, y0, y1, z0, z1 = cx - sx / 2, cx + sx / 2, cy - sy / 2, cy + sy / 2, cz - sz / 2, cz + sz / 2
    v = lambda a, b, c: (a, b, c)
    F = [((x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1)), ((x1, y0, z0), (x0, y0, z0), (x0, y1, z0), (x1, y1, z0)),
         ((x1, y0, z1), (x1, y0, z0), (x1, y1, z0), (x1, y1, z1)), ((x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0)),
         ((x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0)), ((x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1))]
    for a, b, c, d in F: m.quad(a, b, c, d, col)
    return orient(m, lambda g: (cx, cy, cz))

S = P
# ---------------- piezas (origen = articulación del juego) ----------------
parts = {}
# cadera con bóxer (grupo hips en y=.95); elástico claro, costura central
def boxC(x, y, z):
    if y > .085: return S['band']
    if abs(x) < .012 and z > 0: return S['boxerD']
    return S['boxer']
parts['hips'] = ring_mesh([(.12, .148), (.09, .155), (.06, .16), (.02, .168), (-.03, .172), (-.08, .16), (-.115, .128), (-.132, .06)], 10, boxC, sz=.78).add(
    ring_mesh([(.135, .14), (.12, .148)], 10, S['skin'], sz=.78, cap_bot=False))
# torso: pecho ancho, cintura, clavículas; ombligo y pezones como facetas oscuras
def torC(x, y, z):
    if z > .09 and abs(x) < .015 and .07 < y < .12: return S['skinS']
    if y > .44 and abs(x) > .13: return S['skinL']
    return S['skin'] if y > .2 or z < .05 else S['skin']
parts['torso'] = ring_mesh([(.535, .075), (.505, .15), (.465, .205), (.41, .212), (.33, .2), (.25, .178), (.16, .158), (.08, .15), (.0, .146), (-.025, .144)], 10, torC, sz=.64).add(
    blob(.175, .452, 0, .055, .05, .055, S['skin'], 6, 4)).add(blob(-.175, .452, 0, .055, .05, .055, S['skin'], 6, 4)).add(
    box(.075, .335, .13, .04, .012, .006, S['skinS'])).add(box(-.075, .335, .13, .04, .012, .006, S['skinS']))
# camisa / abrigo (color blanco: el juego la tiñe con el color de la prenda); borde inferior y cuello más oscuros
def shC(x, y, z): return S['clothD'] if y < -.03 or y > .52 else S['cloth']
parts['shirt'] = ring_mesh([(.555, .088), (.52, .16), (.47, .222), (.41, .228), (.31, .212), (.2, .19), (.1, .175), (0, .172), (-.07, .174)], 10, shC, sz=.69).add(
    blob(.205, .45, 0, .08, .075, .082, S['cloth'], 6, 4)).add(blob(-.205, .45, 0, .08, .075, .082, S['cloth'], 6, 4)).add(
    box(0, .3, .155, .012, .42, .006, S['clothD']))
# cuello
parts['neck'] = ring_mesh([(.09, .049), (.04, .052), (0, .058), (-.045, .078)], 8, S['skin'], sz=.95)
# cabeza estilizada: cráneo facetado, mandíbula angulosa, nariz en cuña, orejas planas, cejas gruesas
def skullF(x, y, z):
    if y < -.15:  # mandíbula más estrecha y en V
        t = min(1, (-.15 - y) / .85); x *= 1 - .3 * t * t; z *= 1 - .08 * t
    if z < 0: z *= .97
    return x, y, z
def faceC(x, y, z):
    if z > .07 and -.055 < y < -.045 + .105 and abs(x) < .022 and y < .06: return S['lip']
    return S['skin']
head = blob(0, .105, .008, .088, .118, .101, S['skin'], 10, 8, skullF)
head.add(M()).add(  # nariz: cuña de 3 caras
    orient((lambda m: (m.tri((0, .118, .1), (-.014, .072, .1), (0, .07, .118), S['skinS']), m.tri((0, .118, .1), (0, .07, .118), (.014, .072, .1), S['skin']), m.tri((-.014, .072, .1), (.014, .072, .1), (0, .07, .118), S['skinS']), m)[-1])(M()), lambda g: (0, .09, .09)))
head.add(blob(0, .052, .094, .022, .007, .01, S['lip'], 8, 2))          # boca
head.add(blob(.088, .1, -.006, .012, .028, .02, S['skinS'], 6, 3)).add(blob(-.088, .1, -.006, .012, .028, .02, S['skinS'], 6, 3))  # orejas
head.add(box(.032, .143, .095, .036, .009, .012, S['brow'])).add(box(-.032, .143, .095, .036, .009, .012, S['brow']))  # cejas
parts['head'] = head
# ojos: blanco, iris y pupila planos (los párpados del juego siguen igual para parpadear)
eyes = M()
for sx in (1, -1):
    eyes.add(blob(sx * .031, .12, .089, .017, .014, .011, S['white'], 8, 4))
    eyes.add(blob(sx * .031, .119, .099, .0095, .0095, .003, S['iris'], 6, 2)).add(blob(sx * .031, .119, .1015, .0048, .0048, .0015, S['pupil'], 6, 2))
    eyes.add(box(sx * .035, .124, .1022, .003, .003, .001, S['white']))  # brillo
parts['eyes'] = eyes
# pelo: casquete facetado con mechones en punta sobre la frente y la nuca
def hairF(x, y, z): return x, y, z
def hairF(x, y, z):
    # parte de abajo dentada: flequillo en punta delante, recto atrás; nunca baja de la frente
    if y < .15:
        ang = math.atan2(z, x); front = max(0, math.sin(ang))
        teeth = .5 + .5 * math.cos(ang * 9)
        lim = .35 - front * (.12 + .18 * teeth) if front > .2 else -.45
        y = max(y, lim)
    return x * 1.04, y, z * 1.04
hair = blob(0, .118, -.006, .093, .127, .107, lambda x, y, z: S['hairL'] if y > .2 and z < .05 else S['hair'], 12, 8, hairF)
for sx in (1, -1): hair.add(box(sx * .087, .095, .03, .012, .05, .028, S['hair']))  # patillas
parts['hair'] = hair
# brazo (hombro → codo, .315 m), manga
parts['up'] = ring_mesh([(.03, .032), (.01, .052), (-.02, .058), (-.1, .053), (-.2, .046), (-.28, .04), (-.315, .024)], 8, S['skin'], sz=.92).add(blob(0, -.01, 0, .06, .055, .057, S['skin'], 6, 4))
parts['sleeve'] = ring_mesh([(.02, .072), (-.04, .072), (-.16, .062), (-.185, .062)], 8, lambda x, y, z: S['clothD'] if y < -.16 else S['cloth'], sz=.95)
# muslo con pierna del bóxer y rodilla
def thC(x, y, z):
    if y > -.14: return S['band'] if -.14 < y < -.125 else S['boxer']
    return S['skin']
parts['thigh'] = ring_mesh([(.045, .062), (.02, .097), (-.06, .095), (-.12, .09), (-.15, .087), (-.26, .075), (-.37, .063), (-.44, .056), (-.465, .04)], 8, thC, sz=.95).add(blob(0, -.43, .045, .026, .024, .014, S['skin'], 6, 4))
parts['shin'] = ring_mesh([(.02, .047), (0, .055), (-.07, .058), (-.15, .053), (-.25, .044), (-.35, .036), (-.43, .031), (-.455, .026)], 8, S['skin'], sz=.95).add(blob(0, -.13, -.028, .04, .065, .03, S['skin'], 6, 4))
# pies: descalzo (con dedos en bloque) y con bota (suela, cordones, caña)
def foot(bare):
    m = M(); c = S['skin'] if bare else S['boot']
    m.add(blob(0, -.025, 0, .038, .04, .038, c, 6, 4))
    m.add(blob(0, -.045, .045, .046, .028, .1, c, 8, 4))
    if bare:
        for k, (x, L) in enumerate([(-.026, .024), (-.009, .021), (.006, .018), (.019, .016), (.031, .014)]):
            m.add(box(x, -.058, .14 + L / 2 - .01, .012 if k else .016, .016, L, S['skin']))
    else:
        m.add(box(0, -.068, .045, .105, .018, .27, S['sole']))
        m.add(ring_mesh([(.13, .052), (.02, .054), (-.04, .05)], 8, lambda x, y, z: S['bootD'] if y > .11 else S['boot']))
        for k in range(3): m.add(box(0, .04 - k * .045 if k < 2 else -.02, .052 + k * .02, .05, .006, .006, S['lace']))
    return m
parts['foot_bare'] = foot(True); parts['foot_boot'] = foot(False)
# mochila: cuerpo, tapa, bolsillo, correas y hebilla
pk = box(0, 0, 0, .3, .36, .16, S['pack']).add(box(0, .14, .01, .31, .1, .17, S['packD'])).add(box(0, -.07, .085, .2, .14, .03, S['packD']))
pk.add(box(.1, .04, -.09, .04, .3, .02, S['strap'])).add(box(-.1, .04, -.09, .04, .3, .02, S['strap'])).add(box(0, .1, .1, .04, .03, .01, S['buckle']))
parts['pack'] = pk

# ---------------- exportar al formato del juego ----------------
def lin(c): return tuple((v / 12.92 if v <= .04045 else ((v + .055) / 1.055) ** 2.4) for v in srgb(c))
out = {}; ntri = 0
for name, m in parts.items():
    pos, nor, col = [], [], []
    for a, b, c, k in m.t:
        A, B, C = Vector(a), Vector(b), Vector(c); n = (B - A).cross(C - A)
        if n.length < 1e-12: continue
        n.normalize(); L = lin(k)
        for v in (A, B, C): pos += [round(v.x, 4), round(v.y, 4), round(v.z, 4)]; nor += [round(n.x, 3), round(n.y, 3), round(n.z, 3)]; col += [round(L[0], 3), round(L[1], 3), round(L[2], 3)]
    out[name] = {'p': pos, 'n': nor, 'c': col}; ntri += len(pos) // 9
import base64, struct
pal = []; comp = {}
for name, m in parts.items():
    P16 = bytearray(); CI = bytearray()
    for a, b, c, k in m.t:
        if k not in pal: pal.append(k)
        for v in (a, b, c): P16 += struct.pack('<3h', *[max(-32767, min(32767, round(q * 10000))) for q in v])
        CI.append(pal.index(k))
    comp[name] = [base64.b64encode(bytes(P16)).decode(), base64.b64encode(bytes(CI)).decode()]
js = 'window.CH2={pal:' + json.dumps([[round(x, 4) for x in lin(c)] for c in pal]) + ',p:' + json.dumps(comp, separators=(',', ':')) + '};'
open(OUT + '.js', 'w').write(js); print('js', len(js) // 1024, 'KB')
print('piezas', len(out), 'triángulos', ntri)

# ---------------- render de vista previa en Blender (personaje armado en pose neutra) ----------------
bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
OFF = {'hips': (0, .95, 0), 'torso': (0, 1.03, 0), 'shirt': (0, 1.03, 0), 'neck': (0, 1.58, 0), 'head': (0, 1.64, 0), 'eyes': (0, 1.64, 0), 'hair': (0, 1.64, 0),
       'up_R': (.2, 1.48, 0), 'up_L': (-.2, 1.48, 0), 'thigh_R': (.092, .9, 0), 'thigh_L': (-.092, .9, 0), 'shin_R': (.092, .46, 0), 'shin_L': (-.092, .46, 0),
       'foot_boot_R': (.092, .02, 0), 'foot_boot_L': (-.092, .02, 0), 'pack': (0, 1.31, -.2)}
def mkobj(nm, m, off, mirror=False):
    me = bpy.data.meshes.new(nm); bm = bmesh.new(); cl = bm.loops.layers.color.new('col')
    for a, b, c, k in m.t:
        vs = []
        for v in (a, b, c):
            x, y, z = v; x = -x if mirror else x
            vs.append(bm.verts.new((x + off[0], -(z + off[2]), y + off[1])))
        if mirror: vs = vs[::-1]
        try: f = bm.faces.new(vs)
        except ValueError: continue
        cc = srgb(k)
        for l in f.loops: l[cl] = (cc[0], cc[1], cc[2], 1)
    bm.to_mesh(me); bm.free()
    try: me.color_attributes.active_color = me.color_attributes['col']
    except Exception: pass
    ob = bpy.data.objects.new(nm, me); sc.collection.objects.link(ob)
    for p in me.polygons: p.use_smooth = False
    return ob
for k, off in OFF.items():
    base = k.replace('_R', '').replace('_L', '')
    if base == 'shirt': continue
    mkobj(k, parts[base], off, mirror=k.endswith('_L') and base.startswith('foot'))
# antebrazos y manos aproximados solo para la vista previa (en el juego son la mano con huesos de 0.40)
for s in (1, -1):
    mkobj('fore%d' % s, ring_mesh([(0, .04), (-.1, .04), (-.27, .027)], 8, S['skin'], sz=.8), (s * .2, 1.165, 0))
    mkobj('hand%d' % s, blob(0, 0, 0, .04, .055, .02, S['skin'], 6, 4), (s * .2, .85, 0))
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = 50
sun = bpy.data.objects.new('sol', bpy.data.lights.new('sol', 'SUN')); sun.data.energy = 3.5; sun.rotation_euler = (math.radians(50), 0, math.radians(35)); sc.collection.objects.link(sun)
sc.render.engine = 'BLENDER_WORKBENCH'; sc.display.shading.light = 'STUDIO'; sc.display.shading.color_type = 'VERTEX'
sc.display.shading.show_shadows = True; sc.display.shading.show_cavity = True
sc.render.resolution_x, sc.render.resolution_y = 1200, 900; sc.render.film_transparent = False
w = bpy.data.worlds.new('w'); sc.world = w
imgs = []
for i, ang in enumerate([20, 160, 290]):
    a = math.radians(ang); d = 2.7
    cam.location = (math.sin(a) * d, -math.cos(a) * d, 1.0); cam.rotation_euler = (math.radians(90), 0, a)
    sc.render.filepath = OUT + '_%d.png' % i; bpy.ops.render.render(write_still=True); imgs.append(sc.render.filepath)
# primer plano de la cara
cam.location = (0.22, -0.75, 1.76); cam.rotation_euler = (math.radians(90), 0, math.radians(16)); cam.data.lens = 85
sc.render.filepath = OUT + '_cara.png'; bpy.ops.render.render(write_still=True)
print('render', imgs)
