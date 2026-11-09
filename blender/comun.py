# Ayudas compartidas (copiadas de arboles.py) para Raíces de Niebla (0.44). Blender (bpy) + exportación compacta al juego.
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

