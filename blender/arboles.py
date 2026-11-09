# Vegetación low-poly estilizada para Raíces de Niebla (0.44). Blender (bpy) + exportación compacta al juego.
# Especies (4 variantes cada una, como el juego): árbol del valle, roble andino del bosque de niebla, palma de cera,
# arbusto, frailejón y roca. Árboles y arbustos con 3 niveles de detalle (cerca, medio, lejos); palma con 2.
# Origen en la base del tronco, y hacia arriba, metros. Colores por cara con degradado: arriba más claro y cálido,
# abajo más oscuro y frío (oclusión pintada), como en los juegos estilizados.
import bpy, bmesh, json, math, random, base64, struct, sys
from mathutils import Vector
OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else '/tmp/arboles'

def srgb(h): return ((h >> 16 & 255) / 255, (h >> 8 & 255) / 255, (h & 255) / 255)
def mixc(a, b, t):
    A, B = srgb(a), srgb(b); t = max(0, min(1, t)); c = [A[i] + (B[i] - A[i]) * t for i in range(3)]
    return (int(c[0] * 255) << 16) | (int(c[1] * 255) << 8) | int(c[2] * 255)
def shade(h, k):
    c = srgb(h); c = [max(0, min(1, v * k)) for v in c]; return (int(c[0] * 255) << 16) | (int(c[1] * 255) << 8) | int(c[2] * 255)

class M:
    def __init__(s): s.t = []
    def tri(s, a, b, c, col): col = (col & 0xf8f8f8) | 0x040404; s.t.append((tuple(a), tuple(b), tuple(c), col))
    def tri2(s, a, b, c, col): s.tri(a, b, c, col); s.tri(a, c, b, col)  # hoja de dos caras
    def add(s, o): s.t += o.t; return s
def orient(m, ctr):
    o = []
    for a, b, c, k in m.t:
        A, B, C = Vector(a), Vector(b), Vector(c); n = (B - A).cross(C - A); g = (A + B + C) / 3
        o.append((a, c, b, k) if n.dot(g - Vector(ctr(g))) < 0 else (a, b, c, k))
    m.t = o; return m

def frame(d):
    d = Vector(d).normalized(); u = (Vector((0, 1, 0)) if abs(d.y) < .95 else Vector((1, 0, 0))).cross(d).normalized(); return u, d.cross(u)
def tube(pts, rs, sides, colf, rot=0.0):
    """tubo por polilínea (rama/tronco) con caras planas; colf(t, ángulo) -> color"""
    m = M(); R = []
    for i, p in enumerate(pts):
        d = Vector(pts[min(i + 1, len(pts) - 1)]) - Vector(pts[max(i - 1, 0)]); u, v = frame(d)
        R.append([Vector(p) + (u * math.cos(rot + 2 * math.pi * k / sides) + v * math.sin(rot + 2 * math.pi * k / sides)) * rs[i] for k in range(sides)])
    for i in range(len(pts) - 1):
        for k in range(sides):
            j = (k + 1) % sides; a, b, c, d = R[i][k], R[i][j], R[i + 1][j], R[i + 1][k]
            col = colf(i / (len(pts) - 1), k / sides)
            m.tri(a, b, c, col); m.tri(a, c, d, col)
    # tapa arriba
    top = Vector(pts[-1]) + (Vector(pts[-1]) - Vector(pts[-2])).normalized() * rs[-1] * .3
    for k in range(sides): m.tri(R[-1][k], R[-1][(k + 1) % sides], top, colf(1, 0))
    # orientar con el eje del tubo más cercano
    P = [Vector(p) for p in pts]
    def axis(g):
        best, bd = P[0], 1e9
        for i in range(len(P) - 1):
            a, b = P[i], P[i + 1]; ab = b - a; t = max(0, min(1, (g - a).dot(ab) / max(ab.length_squared, 1e-9))); q = a + ab * t
            if (g - q).length < bd: bd, best = (g - q).length, q
        return best
    return orient(m, axis)

ICO = None
def puff(c, r, fl, colf, rnd, jit=.22, sub=1):
    """racimo de hojas facetado: icosaedro subdividido, deformado al azar; colf(normal_y, altura_rel) -> color"""
    bm = bmesh.new(); bmesh.ops.create_icosphere(bm, subdivisions=sub + 1, radius=1)
    J = {}
    for v in bm.verts:
        k = (round(v.co.x, 3), round(v.co.y, 3), round(v.co.z, 3)); J.setdefault(k, 1 + (rnd.random() * 2 - 1) * jit)
    m = M()
    for f in bm.faces:
        vs = []
        for v in f.verts:
            j = J[(round(v.co.x, 3), round(v.co.y, 3), round(v.co.z, 3))]
            # Blender ico: z arriba → juego y arriba
            vs.append((c[0] + v.co.x * r * j, c[1] + v.co.z * r * fl * j, c[2] + v.co.y * r * j))
        g = [sum(q[i] for q in vs) / 3 for i in range(3)]
        ny = (g[1] - c[1]) / (r * fl)
        col = colf(ny, rnd.random())
        m.tri(vs[0], vs[1], vs[2], col)
    bm.free()
    return orient(m, lambda g: c)

def leaf_col(base, rnd):
    # degradado de copa: arriba más claro/cálido, abajo oscuro/frío; un poco de variación por cara
    def f(ny, r):
        top = mixc(base, 0xd8e070, .28); bot = mixc(shade(base, .55), 0x1c3a3a, .25)
        return shade(mixc(bot, top, ny * .5 + .5), .92 + .16 * r)
    return f

# ---------------- especies ----------------
def tree_valle(seed, lod):
    rnd = random.Random(seed); m = M()
    H = 3.6 + rnd.random() * .8; bark, barkD = 0x6b5038, 0x4a3524
    lean = Vector(((rnd.random() - .5) * .25, 1, (rnd.random() - .5) * .25)).normalized()
    pts = [Vector((0, -.2, 0)) + lean * H * i / 4 for i in range(5)]
    for i in range(1, 4): pts[i] += Vector(((rnd.random() - .5) * .12, 0, (rnd.random() - .5) * .12))
    sides = [7, 5, 4][lod]
    m.add(tube([tuple(p) for p in pts], [.34, .27, .23, .2, .17], sides, lambda t, a: mixc(barkD, bark, t * .6 + .4 * ((a * 3) % 1 > .5))))
    if lod == 0:  # raíces en contrafuerte
        for k in range(4):
            a = k * math.pi / 2 + rnd.random() * .6; d = Vector((math.cos(a), 0, math.sin(a)))
            r0 = Vector((0, .35, 0)) + d * .12; r1 = d * .75 + Vector((0, -.12, 0))
            m.add(tube([tuple(r0), tuple((r0 + r1) / 2 + Vector((0, .05, 0))), tuple(r1)], [.12, .09, .03], 4, lambda t, a: barkD))
    top = pts[-1]; puffs = []
    nb = [3, 3, 0][lod]
    for k in range(nb):  # ramas principales hacia la copa
        a = k * 2.094 + rnd.random() * .8; d = Vector((math.cos(a) * .75, 1, math.sin(a) * .75)).normalized()
        L = 1.9 + rnd.random() * .8; mid = top + d * L * .55 + Vector((0, .2, 0)); end = top + d * L
        m.add(tube([tuple(top - lean * .4), tuple(mid), tuple(end)], [.17, .11, .06], [5, 4, 3][lod], lambda t, a: mixc(barkD, bark, .5 + t * .5)))
        puffs.append((end + Vector((0, .5, 0)), 1.35 + rnd.random() * .4))
    if lod == 2: puffs = []
    puffs.append((top + Vector((0, 1.9, 0)), 1.7 + rnd.random() * .3))
    if lod == 0:
        for k in range(3):
            a = rnd.random() * 6.28; puffs.append((top + Vector((math.cos(a) * 1.3, 1.1 + rnd.random() * .5, math.sin(a) * 1.3)), 1.0 + rnd.random() * .3))
    greens = [0x5a9a3a, 0x6aa842, 0x4f8c36, 0x78b048]
    lodK = [1, 1.25, 1.0][lod]
    if lod == 2:
        m.add(puff(top + Vector((0, 1.5, 0)), 2.6, .8, leaf_col(greens[seed % 4], rnd), rnd, .15, 0))
    else:
        for c, r in puffs: m.add(puff(tuple(c), r * lodK, .78, leaf_col(greens[rnd.randrange(4)], rnd), rnd, .2, 1 if lod == 0 else 0))
    return m

def tree_bosque(seed, lod):
    rnd = random.Random(seed); m = M()
    H = 6.2 + rnd.random() * 1.4; bark, barkD, moss = 0x5a5040, 0x3a3428, 0x5f7a3a
    pts = []
    for i in range(6):
        y = H * i / 5; pts.append((math.sin(y * .7 + seed) * .12, y - .2, math.cos(y * .5 + seed) * .12))
    sides = [7, 5, 4][lod]
    m.add(tube(pts, [.4, .33, .28, .24, .2, .16], sides, lambda t, a: mixc(barkD, moss if (a < .35 and t < .7) else bark, .7 if a < .35 else .5 + t * .3)))
    top = Vector(pts[-1]); greens = [0x2f6a34, 0x3a7a3a, 0x2a5e30, 0x447f40]
    tiers = [(H * .62, 2.3, 5), (H * .82, 2.0, 4), (H + .5, 1.5, 2)]
    if lod == 2:
        m.add(puff((0, H * .78, 0), 2.7, .55, leaf_col(greens[seed % 4], rnd), rnd, .15, 0)); return m
    for (y, rr, n) in tiers:
        for k in range(n if lod == 0 else max(1, n // 2)):
            a = k / n * 6.283 + rnd.random() * .5; off = rr * (.7 if n > 1 else 0)
            c = (math.cos(a) * off, y + rnd.random() * .3, math.sin(a) * off)
            if n > 1 and lod < 2:  # rama hacia el racimo
                m.add(tube([(pts[3][0], y - .6, pts[3][2]), (c[0] * .6, y - .2, c[2] * .6), c], [.11, .07, .04], [4, 3][lod], lambda t, a: barkD))
            m.add(puff(c, (1.15 + rnd.random() * .35) * (1.2 if lod else 1), .55, leaf_col(greens[rnd.randrange(4)], rnd), rnd, .2, 1 if lod == 0 else 0))
    if lod == 0:
        # bromelias (rojas) y musgo colgante (barbas de viejo)
        for k in range(3):
            y = H * (.35 + .15 * k); a = rnd.random() * 6.28; c = (math.cos(a) * .3, y, math.sin(a) * .3)
            for q in range(6):
                b = q * 1.047; tip = (c[0] + math.cos(b) * .28, c[1] + .22, c[2] + math.sin(b) * .28)
                m.tri2(c, tip, (c[0] + math.cos(b + .4) * .1, c[1] + .05, c[2] + math.sin(b + .4) * .1), 0xb8323a if q % 2 else 0x4f8a3a)
        for k in range(10):
            a = rnd.random() * 6.28; r = 1 + rnd.random() * 1.4; y = H * .6 + rnd.random() * 1.2
            x, z = math.cos(a) * r, math.sin(a) * r; L = .6 + rnd.random() * .7
            m.tri2((x - .08, y, z), (x + .08, y, z), (x + (rnd.random() - .5) * .1, y - L, z), 0xa8b49a)
    return m

def palma(seed, lod):
    rnd = random.Random(seed); m = M(); H = 10 + rnd.random() * 3.5
    segs = 10 if lod == 0 else 4; pts = []; rs = []
    for i in range(segs + 1):
        y = H * i / segs; pts.append(((rnd.random() - .5) * .08 * (i > 0), y, (rnd.random() - .5) * .08 * (i > 0))); rs.append(.22 - .07 * i / segs + (.03 if 0 < i < 3 else 0))
    # anillos claros y oscuros (cicatrices de hojas): color por tramo
    m.add(tube(pts, rs, 6 if lod == 0 else 5, lambda t, a: 0xc9c2ae if int(t * segs) % 2 == 0 else 0xa79f8a))
    top = Vector(pts[-1]); m.add(tube([tuple(top), tuple(top + Vector((0, 1.1, 0)))], [.17, .12], 6, lambda t, a: mixc(0x6f8a4a, 0x88a35a, t)))
    nf = 11 if lod == 0 else 7; fs = 6 if lod == 0 else 3
    for k in range(nf):
        ph = k / nf * 6.283 + rnd.random() * .3; el = .5 + .5 * rnd.random(); dry = k >= nf - 2
        L = 3.2 + rnd.random() * .7; hdir = Vector((math.cos(ph), 0, math.sin(ph)))
        d = (hdir * math.cos(el) + Vector((0, math.sin(el) if not dry else -.6, 0))).normalized()
        p = top + Vector((0, .9, 0)); sp = [p.copy()]
        for i in range(fs): d = (d + Vector((0, -.36, 0))).normalized(); p = p + d * (L / fs); sp.append(p.copy())
        side = d.cross(Vector((0, 1, 0))).normalized()
        c0 = 0xb59a4a if dry else 0x3e7a34; c1 = 0xd0b866 if dry else 0x6aa04a
        for i in range(fs):
            a, b = sp[i], sp[i + 1]; t = (i + 1) / fs; w = .75 * math.sin(math.pi * max(.15, t)) ** .6 * (0.3 if i == fs - 1 else 1)
            col = mixc(c0, c1, t * .7)
            for sgn in (1, -1):  # folíolos en V caídos
                tip = b + side * w * sgn + Vector((0, -w * .55, 0))
                m.tri2(a, b, tip, shade(col, .85 if sgn > 0 else 1.0))
    return m

def arbusto(seed, lod):
    rnd = random.Random(seed); m = M(); greens = [0x4f8a3a, 0x5c9640, 0x467d36, 0x68a046]
    n = [6, 3, 1][lod]
    for k in range(n):
        a = rnd.random() * 6.28; r = .35 * (k > 0) + rnd.random() * .15 * (k > 0)
        c = (math.cos(a) * r, .5 + rnd.random() * .25 + (.15 if k == 0 else 0), math.sin(a) * r)
        m.add(puff(c, (.48 + rnd.random() * .15) * (1.6 if lod == 2 else 1.15 if lod == 1 else 1), .82, leaf_col(greens[rnd.randrange(4)], rnd), rnd, .22, 1 if lod == 0 else 0))
    if lod < 2: m.add(tube([(0, 0, 0), (0, .45, 0)], [.06, .04], 4, lambda t, a: 0x4a3a2a))
    if lod == 0 and seed % 2 == 0:  # bayas
        for k in range(9):
            a = rnd.random() * 6.28; e = rnd.random() * 1.2; r = .62
            c = (math.cos(a) * math.cos(e) * r, .6 + math.sin(e) * r * .8, math.sin(a) * math.cos(e) * r)
            m.add(puff(c, .045, 1, lambda ny, rr: 0x8a2a5a if rr < .5 else 0xb03a6a, rnd, 0, 0))
    return m

def frailejon(seed):
    rnd = random.Random(seed); m = M(); H = .6 + .9 * rnd.random()
    # tallo cubierto de hojas secas que cuelgan (falda)
    m.add(tube([(0, 0, 0), (0, H * .5, 0), (0, H, 0)], [.13, .15, .17], 7, lambda t, a: mixc(0x5a4a38, 0x7a6a50, t)))
    for k in range(int(H * 14)):
        y = .1 + rnd.random() * (H - .15); a = rnd.random() * 6.28; d = Vector((math.cos(a), 0, math.sin(a)))
        b = Vector((0, y, 0)) + d * .15; tip = b + d * .12 + Vector((0, -.22, 0)); s = d.cross(Vector((0, 1, 0))) * .05
        m.tri2(tuple(b + s), tuple(b - s), tuple(tip), mixc(0x6a5a40, 0x9a8a68, rnd.random()))
    # roseta de hojas plateadas y velludas
    top = Vector((0, H, 0)); n = 22
    for k in range(n):
        ph = k * 2.39996; inner = k / n; el = .5 + .8 * inner; L = .46 + .16 * rnd.random() - .14 * inner
        h = Vector((math.cos(ph), 0, math.sin(ph))); d = (h * math.cos(el) + Vector((0, math.sin(el), 0))).normalized()
        s = d.cross(Vector((0, 1, 0))).normalized(); w = .1 + .02 * rnd.random()
        base = top + h * .05; mid = base + d * L * .45; tip = base + d * L + Vector((0, -.06 * (1 - inner), 0))
        col = mixc(0x9aa88a, 0xe2e6cc, inner * .7 + .3 * rnd.random())
        m.tri2(tuple(base), tuple(mid + s * w), tuple(mid - s * w), shade(col, .9)); m.tri2(tuple(mid + s * w), tuple(tip), tuple(mid - s * w), col)
    for k in range(2 if rnd.random() < .5 else 0):  # varas con flores amarillas
        a = rnd.random() * 6.28; h = Vector((math.cos(a) * .12, 0, math.sin(a) * .12)); e = top + h * 2.5 + Vector((0, .45 + .25 * rnd.random(), 0))
        m.add(tube([tuple(top + h), tuple(e)], [.016, .01], 3, lambda t, a: 0x7a8a5a))
        for q in range(3): m.add(puff(tuple(e + Vector(((rnd.random() - .5) * .12, -.05 * q, (rnd.random() - .5) * .12))), .06, 1, lambda ny, rr: 0xf2c632 if rr > .3 else 0xd89a20, rnd, .15, 0))
    return m

def roca(seed, mossy):
    rnd = random.Random(seed); sx, sy, sz = .9 + .3 * rnd.random(), .5 + .25 * rnd.random(), 1 + .3 * rnd.random()
    def col(ny, r):
        g = shade(mixc(0x6e6a64, 0x9a958c, ny * .5 + .5), .85 + .25 * r)
        if mossy and ny > .45: return mixc(g, 0x5f7a38 if r > .3 else 0x7a8f48, .75)
        if r < .06: return 0xb8b49a  # liquen
        return g
    m = puff((0, .05, 0), .62, sy / 1, col, rnd, .26, 1)
    for i, (a, b, c, k) in enumerate(m.t):  # aplastar abajo (enterrada) y escalar
        f = lambda v: (v[0] * sx, max(-.15, v[1]), v[2] * sz)
        m.t[i] = (f(a), f(b), f(c), k)
    return m

# ---------------- generar y exportar ----------------
SEED = 1717; models = {}; cp = {}
def canopy(m, ymin):
    r, top, bot = 0, 0, 1e9
    for a, b, c, k in m.t:
        for v in (a, b, c):
            if v[1] > ymin: r = max(r, math.hypot(v[0], v[2])); top = max(top, v[1]); bot = min(bot, v[1])
    return {'r': round(r, 2), 'top': round(top, 2), 'bot': round(bot, 2)}
for v in range(4):
    sd = SEED + v * 977
    for sp, fn in (('valle', tree_valle), ('bosque', tree_bosque)):
        for lod in range(3): models['t_%s_%d_%d' % (sp, v, lod)] = fn(sd + v * 13 + (0 if sp == 'valle' else 31), lod)
        cp[sp + str(v)] = canopy(models['t_%s_%d_0' % (sp, v)], 3.0 if sp == 'valle' else 4.0)
    for lod in range(2): models['t_palma_%d_%d' % (v, lod)] = palma(sd + 71, lod)
    cp['palma' + str(v)] = canopy(models['t_palma_%d_0' % v], 8.0)
    for lod in range(3): models['b_%d_%d' % (v, lod)] = arbusto(sd + 53 + v, lod)
    models['f_%d' % v] = frailejon(sd + 91 + v)
    models['r_%d' % v] = roca(sd + 113 + v, v % 2)

def lin(c): return [round(x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4, 4) for x in srgb(c)]
pal = []; pidx = {}; comp = {}; ntri = 0
for name, m in models.items():
    P16 = bytearray(); CI = bytearray()
    for a, b, c, k in m.t:
        if k not in pidx:
            if len(pal) >= 255:  # paleta llena: color más parecido
                k = min(pal, key=lambda q: sum((x - y) ** 2 for x, y in zip(srgb(q), srgb(k))))
            else: pidx[k] = len(pal); pal.append(k)
        for vv in (a, b, c): P16 += struct.pack('<3h', *[max(-32767, min(32767, round(q * 1000))) for q in vv])  # milímetros
        CI.append(pidx[k])
    comp[name] = [base64.b64encode(bytes(P16)).decode(), base64.b64encode(bytes(CI)).decode()]; ntri += len(m.t)
js = 'window.VG2={pal:' + json.dumps([lin(c) for c in pal]) + ',cp:' + json.dumps(cp) + ',p:' + json.dumps(comp, separators=(',', ':')) + '};'
open(OUT + '.js', 'w').write(js)
print('modelos', len(models), 'triángulos', ntri, 'colores', len(pal), 'js', len(js) // 1024, 'KB')
for k in ('t_valle_0_0', 't_bosque_0_0', 't_palma_0_0', 'b_0_0', 'f_0', 'r_1', 't_valle_0_1', 't_valle_0_2'): print(' ', k, len(models[k].t))

# ---------------- render de vista previa ----------------
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
def mkobj(nm, m, off):
    me = bpy.data.meshes.new(nm); bm = bmesh.new(); cl = bm.loops.layers.color.new('col')
    for a, b, c, k in m.t:
        try: f = bm.faces.new([bm.verts.new((v[0] + off[0], -(v[2] + off[2]), v[1] + off[1])) for v in (a, b, c)])
        except ValueError: continue
        cc = srgb(k)
        for l in f.loops: l[cl] = (cc[0], cc[1], cc[2], 1)
    bm.to_mesh(me); bm.free()
    try: me.color_attributes.active_color = me.color_attributes['col']
    except Exception: pass
    ob = bpy.data.objects.new(nm, me); sc.collection.objects.link(ob)
row = [('t_valle_0_0', -9), ('t_bosque_1_0', -3.5), ('t_palma_2_0', 2), ('b_0_0', 5.5), ('f_1', 7.2), ('r_1', 9.2)]
for k, x in row: mkobj(k, models[k], (x, 0, 0))
for i, k in enumerate(['t_valle_0_1', 't_valle_0_2']): mkobj(k, models[k], (-9 + (i + 1) * 0, 0, 7 + i * 7))
g = bpy.data.meshes.new('suelo'); bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=30); bm.to_mesh(g); bm.free()
go = bpy.data.objects.new('suelo', g); sc.collection.objects.link(go)
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = 28; cam.location = (0, -24, 7.5); cam.rotation_euler = (math.radians(80), 0, 0)
sc.render.engine = 'BLENDER_WORKBENCH'; sc.display.shading.light = 'STUDIO'; sc.display.shading.color_type = 'VERTEX'
sc.display.shading.show_shadows = True; sc.display.shading.show_cavity = True; sc.render.resolution_x, sc.render.resolution_y = 1600, 900
sc.world = bpy.data.worlds.new('w'); sc.render.filepath = OUT + '.png'; bpy.ops.render.render(write_still=True)
