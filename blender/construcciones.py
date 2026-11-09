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
P = {}
def pick(L): return L[rnd.randrange(len(L))]

# ---------- base (plataforma 3×3; arriba en y=0) ----------
def base(lv):
    m = M()
    if lv == 1:  # varas amarradas
        for k in range(12): z = -1.38 + k * .25; m.add(log((-1.5, -.05, z), (1.5, -.05, z), .062, var(STICK), 5))
        for x in (-1.2, 0, 1.2): m.add(log((x, -.13, -1.5), (x, -.13, 1.5), .06, BARK, 5))
        for x in (-1.2, 0, 1.2):
            for z in (-1.2, 0, 1.2): m.add(box(x, -.03, z, .14, .03, .14, ROPE))
    elif lv == 2:  # tablas con clavos y vigas
        for k in range(6): z = -1.25 + k * .5; m.add(box((rnd.random() - .5) * .06, -.04, z, 3, .08, .47, var(pick(PLANK), .06)))
        for k in range(6):
            for x in (-1.3, 0, 1.3): m.add(box(x, .002, -1.25 + k * .5, .03, .006, .03, 0x3a3a3a))
        for x in (-1.2, 0, 1.2): m.add(box(x, -.15, 0, .18, .16, 3.06, LOG2))
    else:  # losas de piedra irregulares sobre vigas
        m.add(box(0, -.07, 0, 3, .1, 3, MORTAR))
        for i in range(5):
            for j in range(5):
                w = .56 + rnd.random() * .02; m.add(box(-1.2 + i * .6 + (rnd.random() - .5) * .03, -.015, -1.2 + j * .6 + (rnd.random() - .5) * .03, w, .05 + rnd.random() * .02, w, var(pick(STONE), .06)))
        for x in (-1.2, 0, 1.2): m.add(box(x, -.17, 0, .2, .14, 3.06, LOG2))
    return m
def legs(lv):
    m = M(); r = [.09, .13, .18][lv - 1]
    for x, z in ((-1.35, -1.35), (1.35, -1.35), (-1.35, 1.35), (1.35, 1.35), (0, 0)):
        if lv == 3:
            for k in range(4): m.add(box(x, -.125 - k * .25, z, .36, .23, .36, var(pick(STONE)), ry=k * .3))
        else: m.add(log((x, 0, z), (x, -1, z), r, STICK if lv == 1 else LOG2, 6 if lv == 2 else 5))
    return m
# ---------- pared ----------
def pared(lv):
    m = M()
    if lv == 1:  # bahareque de varas entretejidas y hojas
        for k in range(9): x = -1.4 + k * .35; m.add(log((x, 0, 0), (x, 2.35, 0), .05, var(STICK), 5))
        for r in range(9):  # varas horizontales tejidas (zigzag)
            y = .22 + r * .25
            for k in range(8):
                x0 = -1.4 + k * .35; z = .045 * (1 if (k + r) % 2 else -1)
                m.add(log((x0, y, z), (x0 + .35, y, -z), .022, var(0x9a7a50), 4))
        for s, c in ((.07, LEAF), (-.07, LEAF2)):  # hojas en tejas
            for r in range(5):
                for k in range(6):
                    x = -1.25 + k * .5 + (.25 if r % 2 else 0); y = .3 + r * .42
                    if x > 1.4: continue
                    m.tri2((x - .3, y + .3, s), (x + .3, y + .3, s), (x, y - .18, s * 1.1), var(c, .1))
    elif lv == 2:  # troncos horizontales con esquinas
        for r in range(9):
            y = .14 + r * .265; m.add(log((-1.52, y, 0), (1.52, y, 0), .14, var(pick([LOG, LOG2, 0x7a5432])), 7))
            for x in (-1.52, 1.52): m.add(puff((x, y, 0), .14, 1, lambda ny, rr: 0xc89a62 if abs(ny) < .5 else 0xa87a48, rnd, 0, 0))  # cortes claros en las puntas
        m.add(box(0, 2.42, 0, 3.1, .12, .38, LOG2))
    else:  # mampostería de piedra con argamasa
        m.add(box(0, 1.18, 0, 2.96, 2.36, .26, MORTAR))
        y = 0
        while y < 2.3:
            h = .3 + rnd.random() * .14; x = -1.48
            while x < 1.46:
                w = min(.42 + rnd.random() * .45, 1.48 - x)
                m.add(box(x + w / 2, y + h / 2, 0, w - .035, h - .035, .32 + rnd.random() * .03, var(pick(STONE), .07))); x += w
            y += h
        m.add(box(0, 2.42, 0, 3.08, .12, .4, LOG2))
    return m
def puerta(lv):
    m = M(); SC = LOG2 if lv < 3 else 0x8a877f
    # marco
    if lv == 3:
        for sg in (-1, 1):
            for k in range(6): m.add(box(sg * .66, .2 + k * .4, 0, .26, .38, .34, var(pick(STONE))))
        m.add(box(0, 2.42, 0, 1.6, .26, .36, var(pick(STONE))))
        for sg in (-1, 1):  # paños de pared a los lados (como la pared)
            y = 0
            while y < 2.3:
                h = .34 + rnd.random() * .1; m.add(box(sg * 1.14, y + h / 2, 0, .64, h - .03, .32, var(pick(STONE), .07))); y += h
        m.add(box(sg * 1.14, 1.18, 0, .7, 2.36, .26, MORTAR)) if False else None
    else:
        for sg in (-1, 1):
            m.add(log((sg * .58, 0, 0), (sg * .58, 2.35, 0), .1, SC, 6))
            for k in range(3): m.add(log((sg * (.8 + k * .3), 0, 0), (sg * (.8 + k * .3), 2.4, 0), .15 if lv == 2 else .07, var(LOG if k % 2 else LOG2) if lv == 2 else var(STICK), 6 if lv == 2 else 5))
        m.add(box(0, 2.25, 0, 1.4, .18, .26, LOG2))
        for sg in (-1, 1): m.add(box(sg * 1.02, 2.42, 0, .96, .12, .38, LOG2))
    # hoja de la puerta entreabierta: tablas con travesaños en Z y aldaba
    door = M()
    for k in range(4): door.add(box(-.19 + k * .127, 0, 0, .12, 2.0, .05, var(pick(PLANK) if lv > 1 else 0x8a7048)))
    for y in (-.7, .7): door.add(box(0, y, .04, .5, .1, .03, LOG2))
    door.add(box(0, 0, .045, .08, 1.5, .03, LOG2, rz=.55)); door.add(box(.19, .05, .07, .05, .05, .05, 0x3a3a3a))
    a = .9
    for t in door.t:
        def R(p): x, y, z = p; return (x * math.cos(a) + z * math.sin(a) - .38, y + 1.05, -x * math.sin(a) + z * math.cos(a) + .22)
        m.t.append((R(t[0]), R(t[1]), R(t[2]), t[3]))
    return m
# ---------- techo a dos aguas ----------
def techo(lv):
    m = M(); sl = .38
    for sg in (-1, 1):
        if lv == 1:  # paja/hojas en hileras con borde dentado
            for r in range(4):
                for k in range(8):
                    z = -1.6 + k * .46; u = r * .45
                    x = sg * (1.62 - u * math.cos(sl)); y = 2.38 + u * math.sin(sl) + .02 * r
                    a = (x, y + .06, z - .3); b = (x, y + .06, z + .3); c = (x + sg * .55 * math.cos(sl), y - .55 * math.sin(sl) - .05, z + (rnd.random() - .5) * .1)
                    m.tri2(a, b, c, var(LEAF if (r + k) % 2 else LEAF2, .1))
            m.add(box(sg * .8, 2.62, 0, 1.85, .05, 3.3, LEAFD, rz=sg * -sl))
        elif lv == 2:  # tejamanil de madera en hileras solapadas
            m.add(box(sg * .8, 2.62, 0, 1.85, .06, 3.4, LOG2, rz=sg * -sl))
            for r in range(6):
                u = .1 + r * .3
                for k in range(12):
                    x = sg * (1.62 - u * math.cos(sl)); y = 2.31 + u * math.sin(sl) + .05
                    m.add(box(x, y, -1.62 + k * .295, .34, .03, .27, var(pick(PLANK), .1), rz=sg * -(sl + .06)))
        else:  # lajas de piedra (pizarra)
            m.add(box(sg * .8, 2.62, 0, 1.85, .07, 3.4, 0x5a5650, rz=sg * -sl))
            for r in range(6):
                u = .1 + r * .3
                for k in range(9):
                    x = sg * (1.62 - u * math.cos(sl)); y = 2.31 + u * math.sin(sl) + .055
                    m.add(box(x, y, -1.55 + k * .39 + (.19 if r % 2 else 0) * (k < 8), .34, .04, .36, var(pick([0x6f6e6a, 0x5f5e5a, 0x7a7872]), .08), rz=sg * -(sl + .05)))
    m.add(log((0, 2.94, -1.75), (0, 2.94, 1.75), .09 if lv < 3 else .1, LOG if lv < 3 else 0x7a776f, 6))
    for z in (-1.5, 1.5): m.add(box(0, 2.3, z, 3.2, .1, .1, LOG2))
    if lv == 1:
        for x in (-1.3, 0, 1.3): m.add(log((x, 2.32, -1.6), (x, 2.32, 1.6), .04, STICK, 4))
    return m
def piso(lv):
    m = base(lv)
    return m
def escalera(lv):
    m = M(); th = math.atan2(2.4, 3); c = [0x8a6a45, 0x7a5530, 0x8a867e][lv - 1]
    for k in range(9):  # peldaños
        u = (k + .5) / 9; y = 2.4 * u; z = -1.5 + 3 * u
        if lv == 3: m.add(box(0, y - .1, z, 2.8, .2, .36, var(pick(STONE))))
        else: m.add(box(0, y, z, 2.8, .07, .3, var(pick(PLANK) if lv == 2 else STICK)))
    L = math.hypot(3, 2.4)
    for sg in (-1, 1):
        m.add(log((sg * 1.42, 0, -1.5), (sg * 1.42, 2.4, 1.5), .08 if lv > 1 else .06, LOG2 if lv > 1 else STICK, 6))  # zancas
        m.add(log((sg * 1.42, 1.2, 0), (sg * 1.42, 2.3, 1.3), .05, LOG2 if lv > 1 else STICK, 5))  # pasamanos
        for t in (.3, .7): m.add(log((sg * 1.42, 2.4 * t, -1.5 + 3 * t), (sg * 1.42, 2.4 * t + .9, -1.5 + 3 * t), .04, LOG2 if lv > 1 else STICK, 4))
    return m
def inclinado(lv):
    m = M()
    for x in (-1.15, 1.15): m.add(log((x, 0, -1.1), (x, 2.0, -1.1), .07, STICK, 5)); m.add(log((x, 0, 1.1), (x, 1.25, 1.1), .06, STICK, 5))
    m.add(log((-1.3, 2.0, -1.1), (1.3, 2.0, -1.1), .06, STICK, 5)); m.add(log((-1.3, 1.25, 1.1), (1.3, 1.25, 1.1), .06, STICK, 5))
    for r in range(5):  # hojas en tejas sobre la pendiente
        for k in range(6):
            t = r / 5; z = -1.2 + t * 2.4; y = 2.05 - t * .8; x = -1.25 + k * .5 + (.25 if r % 2 else 0)
            if x > 1.3: continue
            m.tri2((x - .32, y + .02, z - .1), (x + .32, y + .02, z - .1), (x + (rnd.random() - .5) * .1, y - .3, z + .5), var(LEAF if (r + k) % 2 else LEAF2, .1))
    for k in range(7): x = -1.2 + k * .4; m.tri2((x - .25, 2.0, -1.12), (x + .25, 2.0, -1.12), (x, .1, -1.14), var(LEAF2, .1))  # pared trasera
    m.add(box(0, .03, 0, 2.2, .05, 2.0, 0x6a8a3a))  # colchón de hojas
    return m
# ---------- muebles ----------
def cama_h(lv):
    m = M()
    for k in range(5): m.add(puff(((k - 2) * .38, .12, (rnd.random() - .5) * .2), .32, .38, lambda ny, rr: var(LEAF if rr > .5 else LEAF2, .06), rnd, .15, 0))
    m.add(puff((.6, .2, 0), .22, .5, lambda ny, rr: 0x9a8a60, rnd, .1, 0))
    return m
def cama_c(lv):
    m = M()
    for x, z in ((-.9, -.4), (.9, -.4), (-.9, .4), (.9, .4)): m.add(log((x, 0, z), (x, .48, z), .05, LOG2, 5))
    m.add(box(0, .4, 0, 1.95, .1, .95, LOG)); m.add(box(0, .49, 0, 1.85, .09, .86, 0xc8b88a, top=0xd8caa0))  # colchón
    m.add(box(.2, .55, 0, 1.2, .04, .88, 0x8a4a3a, top=0xa05a44))  # manta
    m.add(puff((-.68, .6, 0), .2, .45, lambda ny, rr: 0xe8e0c8, rnd, .1, 0))  # almohada
    m.add(box(-.98, .7, 0, .08, .6, .95, LOG2))
    return m
def caja(lv):
    m = M()
    for k in range(4): m.add(box(0, .08 + k * .12, 0, .9, .11, .6, var(pick(PLANK))))
    m.add(box(0, .53, 0, .96, .08, .66, LOG2, top=0x7a5432))
    for x in (-.4, .4): m.add(box(x, .27, 0, .05, .54, .63, 0x4a3a28))
    m.add(box(0, .42, .31, .1, .1, .03, 0x3a3a3a))  # cerradura
    return m
def mesa(lv):
    m = M()
    for k in range(4): m.add(box(0, .88, -.32 + k * .213, 1.5, .07, .2, var(pick(PLANK), .05)))
    for x, z in ((-.65, -.35), (.65, -.35), (-.65, .35), (.65, .35)): m.add(log((x, 0, z), (x, .85, z), .055, LOG2, 6))
    m.add(box(0, .3, 0, 1.3, .05, .05, LOG2))
    m.add(box(-.4, .94, 0, .3, .03, .2, 0x3c4048, ry=.4)); m.add(puff((.35, .97, .1), .07, .8, lambda ny, rr: ROPE, rnd, .1, 0)); m.add(box(-.05, .94, .22, .22, .03, .14, 0x8b6a48, ry=-.3))
    return m
def estante(lv):
    m = M()
    for x in (-.6, .6):
        for z in (-.3, .3): m.add(log((x, 0, z), (x, 1.75, z), .045, STICK, 5))
    for y in (.5, 1.0, 1.5): m.add(box(0, y, 0, 1.3, .04, .66, var(pick(PLANK))))
    m.add(box(0, 1.78, 0, 1.5, .06, .85, LEAF)); m.add(box(0, 1.83, 0, 1.4, .05, .75, LEAF2))
    for k in range(4):  # frascos y vasijas
        m.add(tube([(-.45 + k * .3, .52, -.1), (-.45 + k * .3, .72, -.1)], [.07, .06], 6, lambda t, q, k=k: [0x7a3a2a, 0x3a6a8a, 0xa08a5a, 0x6a3426][k]))
        m.add(puff((-.45 + k * .3, 1.08, .1), .08, 1.1, lambda ny, rr, k=k: [0xb05a40, 0x8a6a45, 0x9a4a34, 0xc0a070][k], rnd, .05, 0))
    return m
def horno(lv):
    m = M()
    m.add(box(0, .15, 0, 1.15, .3, 1.15, 0x7a776f))
    m.add(puff((0, .3, 0), .62, .9, lambda ny, rr: var(0x9a7058 if ny > -.2 else 0x7a5848, .06), rnd, .1, 1))
    m.add(box(0, .38, .55, .44, .42, .1, 0x1a1410))  # boca
    m.add(tube([(0, .7, -.18), (0, 1.25, -.18)], [.14, .11], 6, lambda t, q: 0x6a665f))
    for k in range(8):
        a = k / 8 * 6.283; m.add(puff((math.cos(a) * .55, .32, math.sin(a) * .55), .16, .8, lambda ny, rr: var(pick(STONE)), rnd, .2, 0))
    return m
def chimenea(lv):
    m = M(); S1 = [0xa4513a, 0x9a4a34, 0xb05a40] if lv >= 2 else STONE
    for r in range(9):
        for x, z, w, d in ((0, -.33, .8, .14), (0, .33, .8, .14), (-.33, 0, .14, .52), (.33, 0, .14, .52)):
            m.add(box(x, .17 + r * .36, z, w - .02, .33, d, var(pick(S1), .06)))
    m.add(box(0, 3.3, 0, .95, .12, .95, pick(S1))); m.add(box(0, .35, .4, .5, .35, .08, 0x1a1614))
    m.add(puff((0, .25, .25), .18, .6, lambda ny, rr: 0xff8a30 if rr > .5 else 0xd04a20, rnd, .2, 0))  # brasas
    return m
def poste(lv):
    m = log((0, 0, 0), (0, 2.15, 0), .06, LOG, 6)
    m.add(tube([(0, 2.15, 0), (0, 2.3, 0)], [.17, .12], 6, lambda t, q: 0x4a3a28)); m.add(box(0, 2.17, 0, .32, .05, .32, 0x5a4028))
    return m
def tendedero(lv):
    m = log((-.9, 0, 0), (-.9, 1.7, 0), .05, STICK, 5).add(log((.9, 0, 0), (.9, 1.7, 0), .05, STICK, 5)).add(log((-.92, 1.6, 0), (.92, 1.6, 0), .012, ROPE, 4))
    for x, c, h in ((-.4, 0x4a6aa0, .45), (.1, 0xa04a4a, .4), (.55, 0xd0c8a8, .35)):
        m.tri2((x - .15, 1.6, 0), (x + .15, 1.6, 0), (x + .12, 1.6 - h, .02), c); m.tri2((x - .15, 1.6, 0), (x + .12, 1.6 - h, .02), (x - .14, 1.6 - h, -.02), shade(c, .9))
    return m
def colector(lv):
    m = tube([(0, 0, 0), (0, .75, 0)], [.32, .34], 10, lambda t, q: var(0x9db35a, .05) if int(q * 10) % 2 else 0x8a9e4e)
    for y in (.2, .55): m.add(tube([(0, y, 0), (0, y + .04, 0)], [.345, .345], 10, lambda t, q: 0x6b4a2e))
    for k in range(10):  # embudo de hojas
        a = k / 10 * 6.283; b = (k + 1) / 10 * 6.283
        m.tri2((math.cos(a) * .3, .8, math.sin(a) * .3), (math.cos(b) * .3, .8, math.sin(b) * .3), (math.cos((a + b) / 2) * .95, 1.12, math.sin((a + b) / 2) * .95), var(LEAF, .1))
    m.add(tube([(0, .76, 0), (0, .78, 0)], [.3, .3], 10, lambda t, q: 0x3d86b8))
    for x in (.5, -.5): m.add(log((x, 0, 0), (x, 1.0, 0), .03, STICK, 4))
    return m

for lv in (1, 2, 3):
    for nm, f in (('base', base), ('legs', legs), ('pared', pared), ('puerta', puerta), ('techo', techo), ('piso', piso), ('escalera', escalera)):
        P[nm + str(lv)] = f(lv)
for nm, f in (('inclinado', inclinado), ('cama_h', cama_h), ('cama_c', cama_c), ('caja', caja), ('mesa', mesa), ('estante', estante), ('horno', horno), ('poste', poste), ('tendedero', tendedero), ('colector', colector)):
    for lv in (1, 2, 3): P[nm + str(lv)] = f(lv)
for lv in (1, 2, 3): P['chimenea' + str(lv)] = chimenea(lv)

def lin(c): return [round(x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4, 4) for x in srgb(c)]
pal = []; pidx = {}; comp = {}; ntri = 0; seen = {}
for name, m in P.items():
    P16 = bytearray(); CI = bytearray()
    for a, b, c, kk in m.t:
        if kk not in pidx:
            if len(pal) >= 255: kk = min(pal, key=lambda q: sum((x - y) ** 2 for x, y in zip(srgb(q), srgb(kk))))
            else: pidx[kk] = len(pal); pal.append(kk)
        for vv in (a, b, c): P16 += struct.pack('<3h', *[max(-32767, min(32767, round(q * 1000))) for q in vv])
        CI.append(pidx[kk])
    key = (bytes(P16), bytes(CI))
    if key in seen: comp[name] = seen[key]; continue  # muebles iguales en los 3 niveles: una sola copia
    comp[name] = seen[key] = name
    comp[name] = [base64.b64encode(bytes(P16)).decode(), base64.b64encode(bytes(CI)).decode()]; seen[key] = name; ntri += len(m.t)
js = 'window.BD2={pal:' + json.dumps([lin(c) for c in pal]) + ',p:' + json.dumps(comp, separators=(',', ':')) + '};'
open(OUT + '.js', 'w').write(js); print('piezas', len(P), 'triángulos', ntri, 'colores', len(pal), 'js', len(js) // 1024, 'KB')

# vista previa: casita de cada nivel (base, 3 paredes, puerta, techo) y muebles al frente
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
def mkobj(nm, m, off, ry=0.0):
    me = bpy.data.meshes.new(nm); bm = bmesh.new(); cl = bm.loops.layers.color.new('col')
    for a, b, c, kk in m.t:
        vs = []
        for v in (a, b, c):
            x, y, z = v; x, z = x * math.cos(ry) + z * math.sin(ry), -x * math.sin(ry) + z * math.cos(ry)
            vs.append(bm.verts.new((x + off[0], -(z + off[2]), y + off[1])))
        try: f = bm.faces.new(vs)
        except ValueError: continue
        cc = srgb(kk)
        for l in f.loops: l[cl] = (cc[0], cc[1], cc[2], 1)
    bm.to_mesh(me); bm.free()
    try: me.color_attributes.active_color = me.color_attributes['col']
    except Exception: pass
    sc.collection.objects.link(bpy.data.objects.new(nm, me))
for i, lv in enumerate((1, 2, 3)):
    X = -4.2 + i * 4.2
    mkobj('b%d' % lv, P['base%d' % lv], (X, 1, 0)); mkobj('l%d' % lv, P['legs%d' % lv], (X, 1, 0))
    mkobj('pa%d' % lv, P['pared%d' % lv], (X, 1, -1.5)); mkobj('pi%d' % lv, P['pared%d' % lv], (X - 1.5, 1, 0), math.pi / 2)
    mkobj('pd%d' % lv, P['pared%d' % lv], (X + 1.5, 1, 0), math.pi / 2); mkobj('pu%d' % lv, P['puerta%d' % lv], (X, 1, 1.5))
    mkobj('t%d' % lv, P['techo%d' % lv], (X, 1, 0))
for k, (nm, x) in enumerate((('cama_c1', -5), ('caja1', -3.4), ('mesa1', -2.1), ('estante1', -.5), ('horno1', 1), ('chimenea1', 2.6), ('colector1', 4), ('tendedero1', 5.6), ('inclinado1', 8.2), ('cama_h1', -7), ('poste1', 7))):
    mkobj(nm, P[nm], (x, 0, 3.6))
gm = bpy.data.meshes.new('suelo'); bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=30); bm.to_mesh(gm); bm.free(); sc.collection.objects.link(bpy.data.objects.new('suelo', gm))
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = 30; cam.location = (1.5, -16, 7.5); cam.rotation_euler = (math.radians(68), 0, math.radians(4))
sc.render.engine = 'BLENDER_WORKBENCH'; sc.display.shading.light = 'STUDIO'; sc.display.shading.color_type = 'VERTEX'; sc.display.shading.show_shadows = True
sc.render.resolution_x, sc.render.resolution_y = 1600, 900; sc.world = bpy.data.worlds.new('w'); sc.render.filepath = OUT + '.png'; bpy.ops.render.render(write_still=True)
