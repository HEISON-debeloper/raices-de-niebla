# Construcciones low-poly estilizadas (0.46). Mismas medidas que el juego: casilla de 3 m, pared de 2,4 m sobre y=0 a lo largo de x
# (grosor en z), techo a dos aguas con cumbrera en z (aleros en x), puerta con hueco de 1,1 m. Niveles: 1 fibra/varas y hojas,
# 2 madera, 3 piedra. El material del juego es de dos caras, así que la orientación de caras no importa aquí.
import sys
exec(open('/home/claude/juego041/blender/comun.py').read())
OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else '/tmp/construcciones'
rnd = random.Random(4242)
def var(c, a=.08): return shade(c, 1 - a + 2 * a * rnd.random())
def box(cx, cy, cz, sx, sy, sz, col, ry=0.0, rx=0.0, rz=0.0, top=None):
    """caja con giro (rx, ry, rz) en orden ZYX; top: color distinto para la cara de arriba"""
    m = M(); x0, x1, y0, y1, z0, z1 = -sx / 2, sx / 2, -sy / 2, sy / 2, -sz / 2, sz / 2
    def R(p):
        x, y, z = p
        x, y = x * math.cos(rz) - y * math.sin(rz), x * math.sin(rz) + y * math.cos(rz)
        y, z = y * math.cos(rx) - z * math.sin(rx), y * math.sin(rx) + z * math.cos(rx)
        x, z = x * math.cos(ry) + z * math.sin(ry), -x * math.sin(ry) + z * math.cos(ry)
        return (x + cx, y + cy, z + cz)
    F = [((x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1), col), ((x1, y0, z0), (x0, y0, z0), (x0, y1, z0), (x1, y1, z0), shade(col, .92)),
         ((x1, y0, z1), (x1, y0, z0), (x1, y1, z0), (x1, y1, z1), shade(col, .95)), ((x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0), shade(col, .95)),
         ((x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0), top if top is not None else shade(col, 1.06)), ((x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1), shade(col, .8))]
    for a, b, c, d, k in F: a, b, c, d = R(a), R(b), R(c), R(d); m.tri(a, b, c, k); m.tri(a, c, d, k)
    return m
def log(a, b, r, col, sides=6):  # tronco/vara entre dos puntos, con veta (caras alternas más oscuras)
    return tube([a, ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2), b], [r, r * .97, r * .94], sides, lambda t, q: shade(col, .9 if int(q * sides) % 2 else 1.03))
STICK, LOG, LOG2, BARK, LEAF, LEAF2, LEAFD, ROPE = 0x8a6a46, 0x8a6038, 0x6e4a2a, 0x5a3e24, 0x5a8f3c, 0x6fa246, 0x3f6e2c, 0xc2a868
STONE = [0x8f8b83, 0x7d7a73, 0x9a968d, 0x857f74, 0x6f6c66]; MORTAR = 0x5a5650; PLANK = [0x9a7048, 0x8a6240, 0xa47a50, 0x7e5838]
