# Animales low-poly estilizados para Raíces de Niebla (0.45). Mismo esquema del juego (AnimGen): por especie y variante,
# un cuerpo y patas sueltas con su eje en el hombro/cadera (x, y, z) para animar el paso. +z = hacia donde mira, y arriba, suelo y=0.
# Medidas de cada especie iguales a las del juego (largo, grosor, alto de pata), con siluetas y detalles nuevos.
import sys, os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)) if '__file__' in dir() else '/home/claude/juego041/blender')
exec(open('/home/claude/juego041/blender/comun.py').read())
OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else '/tmp/animales'

def vnz(x, y, z, s):
    def f(a, b, c):
        v = math.sin(a * 127.1 + b * 311.7 + c * 74.7 + s * 13.3) * 43758.5453; return v - math.floor(v)
    xi, yi, zi = math.floor(x), math.floor(y), math.floor(z); xf, yf, zf = x - xi, y - yi, z - zi
    u, v, w = xf * xf * (3 - 2 * xf), yf * yf * (3 - 2 * yf), zf * zf * (3 - 2 * zf); l = lambda a, b, t: a + (b - a) * t
    return l(l(l(f(xi, yi, zi), f(xi + 1, yi, zi), u), l(f(xi, yi + 1, zi), f(xi + 1, yi + 1, zi), u), v), l(l(f(xi, yi, zi + 1), f(xi + 1, yi, zi + 1), u), l(f(xi, yi + 1, zi + 1), f(xi + 1, yi + 1, zi + 1), u), v), w)

def ell(c, r, colf, w=8, h=6, rot=0.0):
    """elipsoide facetado; r=(rx,ry,rz); rot: giro sobre x (cabeceo); colf(x,y,z,ny) por cara"""
    m = M(); V = []
    cr, sr = math.cos(rot), math.sin(rot)
    for k in range(h + 1):
        th = math.pi * k / h; row = []
        for i in range(w):
            ph = 2 * math.pi * i / w
            x, y, z = math.sin(th) * math.cos(ph) * r[0], math.cos(th) * r[1], math.sin(th) * math.sin(ph) * r[2]
            y, z = y * cr - z * sr, y * sr + z * cr
            row.append((c[0] + x, c[1] + y, c[2] + z))
        V.append(row)
    for k in range(h):
        for i in range(w):
            j = (i + 1) % w; a, b, cc, d = V[k][i], V[k][j], V[k + 1][j], V[k + 1][i]
            for tri in ((a, cc, b), (a, d, cc)) if 0 < k < h - 1 else (((a, cc, d),) if k == 0 else ((a, cc, b),)):
                g = [sum(q[t] for q in tri) / 3 for t in range(3)]; ny = (g[1] - c[1]) / max(r[1], 1e-6)
                m.tri(*tri, colf(g[0], g[1], g[2], ny))
    return orient(m, lambda g: c)
def seg(a, b, r0, r1, sides, colf):
    return tube([a, ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2), b], [r0, (r0 + r1) / 2, r1], sides, lambda t, q: colf)
def cone(base, tip, r, sides, col):
    m = M(); B = Vector(base); T = Vector(tip); u, v = frame(T - B); P = [B + (u * math.cos(2 * math.pi * k / sides) + v * math.sin(2 * math.pi * k / sides)) * r for k in range(sides)]
    for k in range(sides): m.tri(tuple(P[k]), tuple(P[(k + 1) % sides]), tuple(T), col); m.tri(tuple(P[(k + 1) % sides]), tuple(P[k]), tuple(B), shade(col, .8))
    return orient(m, lambda g: tuple(B + (T - B) * .3))

SPEC = {
 'conejo': dict(L=.36, g=.13, w=.95, leg=.07, lr=.025, neck=(.06, .6), head=(.085, 1.25), snout=.03, ear=(.2, .04, .15), tail=(.05, .045, 0, 1), back=[0x8d7b68, 0x6e6152, 0xa89884], belly=0xe6dfd2, legc=0x7a6a58, pat=0, eye=.016),
 'guagua': dict(L=.62, g=.22, w=.95, leg=.15, lr=.035, neck=(.08, .35), head=(.12, 1.3), snout=.06, ear=(.05, .04, .4), tail=0, back=[0x5a4632, 0x4a3a2a, 0x6a5640], belly=0xb0a080, legc=0x45362a, pat='puntos', eye=.018),
 'venado': dict(L=1.15, g=.25, w=.8, leg=.78, lr=.045, neck=(.48, 1), head=(.12, 1.5), snout=.1, ear=(.16, .06, .5), tail=(.14, .05, .6, 0), horn='astas', back=[0xa87b4f, 0x8e6842, 0xb68c5c], belly=0xe8dcc6, legc=0x8a6a44, pat=0, eye=.02),
 'puma': dict(L=1.25, g=.22, w=.85, leg=.52, lr=.06, neck=(.2, .45), head=(.125, 1.1), snout=.025, ear=(.065, .04, .35), tail=(.95, .055, .9, 0), back=[0xd98a3e, 0xc97b34, 0xe59a4e], belly=0xf2dfc4, legc=0xd08540, pat=0, eye=.022, paw=1),
 'cabra': dict(L=.95, g=.24, w=.85, leg=.5, lr=.045, neck=(.32, .85), head=(.11, 1.45), snout=.08, ear=(.12, .05, 1.2), tail=(.1, .04, -.6, 0), horn='cabra', back=[0xcdbca0, 0x8a6a4a, 0xe8e2d4], belly=0xe8e0d0, legc=0x9a8a70, pat='parches', eye=.018, beard=1),
 'vaca': dict(L=1.65, g=.42, w=.85, leg=.62, lr=.08, neck=(.3, .4), head=(.18, 1.5), snout=.12, ear=(.13, .07, 1.4), tail=(.8, .025, 1.3, 1), horn='vaca', back=[0xf1ede4, 0xf1ede4, 0x8a5a3a], belly=0xf1ede4, legc=0xe0dccc, pat='manchas', spot=[0x2a2a2a, 0x2a2a2a, 0xf1ede4], eye=.025, udder=1),
 'mula': dict(L=1.45, g=.34, w=.8, leg=.82, lr=.065, neck=(.62, .95), head=(.14, 2.1), snout=.14, ear=(.3, .06, .2), tail=(.75, .04, 1.4, 1), back=[0x7a6048, 0x5a4636, 0x8e7a66], belly=0xb09a80, legc=0x5a4028, pat=0, eye=.024, mane=1),
 'cuy': dict(L=.28, g=.12, w=1.05, leg=.04, lr=.02, neck=(.03, .3), head=(.08, 1.1), snout=.02, ear=(.03, .035, .6), tail=0, back=[0xb08a5a, 0xf1ede4, 0x3a2a22], belly=0xf1ede4, legc=0x7a5a3a, pat='parches', spot=[0xf1ede4, 0xb08a5a, 0xf1ede4], eye=.014, paw=1)}
DARK, PINK, HORN, WHITE = 0x1c1612, 0xc89a90, 0xd8cfb8, 0xf4f0ea

def quad(k, seed):
    S = SPEC[k]; R = random.Random(seed); j = lambda v: v * (.92 + .16 * R.random())
    L, g, w, leg, lr = j(S['L']), j(S['g']), S['w'], j(S['leg']), S['lr']; hb = leg + g * .75
    back = S['back'][seed % len(S['back'])]; belly = S['belly']; legc = S['legc']; spot = S['spot'][seed % len(S['spot'])] if 'spot' in S else shade(back, .55); ps = R.random() * 100
    def fur(x, y, z, ny):
        t = max(0, min(1, (-ny + .1) / .65)) * max(0, min(1, (hb + g * .2 - y) / (g * .8)))
        c = mixc(back, belly, round(t * 3) / 3); c = shade(c, .97 + .06 * vnz(x * 5, y * 5, z * 5, ps))
        if S['pat'] == 'manchas' and vnz(x * 3.2 + ps, y * 3.2, z * 3.2, ps + 1) > .56: c = spot
        elif S['pat'] == 'parches' and vnz(x * 2.4 + ps, y * 2.4, z * 2.4, ps + 2) > .6: c = spot
        elif S['pat'] == 'puntos' and -.3 < ny < .55 and (int((y - hb) * 22) % 3 == 0) and vnz(x * 9, y * 3, z * 9, ps + 3) > .45: c = 0xf0ece0
        if ny > .55: c = shade(c, 1.06)  # lomo con luz
        return c
    P = M()
    # tronco: pecho, vientre y anca (lomo marcado, poca curvatura = facetas grandes)
    P.add(ell((0, hb, 0), (g * w, g, L * .5), fur, 9, 6))
    P.add(ell((0, hb + g * .1, L * .22), (g * w * 1.06, g * 1.05, L * .3), fur, 8, 5))
    P.add(ell((0, hb + g * .07, -L * .26), (g * w * 1.04, g, L * .28), fur, 8, 5))
    # cuello y cabeza
    na, nl = S['neck'][1], j(S['neck'][0]); n0 = (0, hb + g * .35, L * .4); n1 = (0, n0[1] + math.sin(na) * nl, n0[2] + math.cos(na) * nl)
    hr, hl = j(S['head'][0]), S['head'][1]
    P.add(tube([n0, ((n0[0] + n1[0]) / 2, (n0[1] + n1[1]) / 2 + .01, (n0[2] + n1[2]) / 2), n1], [g * .58, g * .5, hr * .85], 7, lambda t, q: fur(0, n0[1] + t * (n1[1] - n0[1]), 0, .3 if q < .5 else -.2)))
    if S.get('mane'):  # crin en sierra
        for i in range(7):
            t = i / 6; p = (0, n0[1] + g * .45 + (n1[1] + hr * .7 - n0[1] - g * .45) * t, n0[2] - .02 + (n1[2] - hr * .3 - n0[2] + .02) * t)
            P.tri2((-.012, p[1], p[2] - .04), (.012, p[1], p[2] + .04), (0, p[1] + .07, p[2] - .02), shade(back, .45))
    hc = (0, n1[1] + hr * .2, n1[2] + hr * .3)
    P.add(ell(hc, (hr * .85, hr * .9, hr * hl * .6), fur, 8, 5, -.25))
    sn = (0, hc[1] - hr * .35, hc[2] + hr * hl * .55)
    P.add(ell(sn, (hr * .6, hr * .55, S['snout'] + hr * .4), lambda x, y, z, ny: shade(fur(x, y, z, ny), .9), 7, 4, -.2))
    nose = (0, sn[1] + hr * .12, sn[2] + S['snout'] + hr * .28); P.add(ell(nose, (hr * .32, hr * .22, hr * .12), lambda *a: PINK if k in ('vaca', 'conejo', 'cuy') else DARK, 6, 3))
    for sd in (-1, 1):
        e = (sd * hr * .66, hc[1] + hr * .25, hc[2] + hr * .35); er = S['eye'] * 1.25
        P.add(ell(e, (er, er, er), lambda *a: DARK, 6, 4)); P.add(ell((e[0] + sd * er * .25, e[1] + er * .45, e[2] + er * .55), (er * .28, er * .28, er * .2), lambda *a: WHITE, 4, 2))
        el, ew, ea = S['ear']; eb = Vector((sd * hr * .5, hc[1] + hr * .62, hc[2] - hr * .1)); et = eb + Vector((sd * math.sin(ea) * el, math.cos(ea) * el, -el * .2))
        side = Vector((0, 0, 1)) * ew
        P.tri2(tuple(eb - side), tuple(eb + side), tuple(et), mixc(back, PINK, .25)); P.tri2(tuple(eb - side * .55 + Vector((0, 0, .004))), tuple(eb + side * .55 + Vector((0, 0, .004))), tuple(et * .85 + eb * .15 + Vector((0, 0, .004))), PINK if k in ('conejo', 'cuy', 'cabra', 'vaca') else shade(back, .7))
        h = S.get('horn')
        if h == 'cabra':
            a = (sd * hr * .3, hc[1] + hr * .8, hc[2]); b = (sd * hr * .45, a[1] + hr * 1.3, a[2] - hr * .9); c = (sd * hr * .62, b[1] + hr * .05, b[2] - hr * .9)
            P.add(tube([a, b, c], [.026, .018, .005], 5, lambda t, q: mixc(0x8a7a60, 0xb8ab90, t)))
        if h == 'vaca':
            a = (sd * hr * .6, hc[1] + hr * .75, hc[2] - hr * .1); b = (sd * hr * 1.25, a[1] + hr * .2, a[2] + hr * .1); c = (sd * hr * 1.4, a[1] + hr * .55, a[2] + hr * .2)
            P.add(tube([a, b, c], [.032, .02, .006], 5, lambda t, q: mixc(HORN, 0x4a4030, t * t)))
        if h == 'astas' and seed % 3 != 2:
            a = Vector((sd * hr * .35, hc[1] + hr * .8, hc[2] - hr * .1)); b = a + Vector((sd * hr * .75, hr * 2.2, -hr * .6)); c = b + Vector((sd * hr * .2, hr * 1.2, hr * .8))
            col = 0x9a8466; P.add(tube([tuple(a), tuple((a + b) / 2), tuple(b), tuple(c)], [.022, .017, .013, .005], 5, lambda t, q: mixc(0x7a6448, 0xd8ccb0, t)))
            for t, d in ((.45, Vector((sd * hr * -.2, hr * .9, hr * .9))), (1.0, Vector((sd * hr * .5, hr * .4, -hr * .9)))):
                p = a + (b - a) * t; P.add(tube([tuple(p), tuple(p + d)], [.012, .004], 4, lambda tt, q: 0xc8b898))
    if S.get('beard'): P.add(cone((0, sn[1] - hr * .25, sn[2] - hr * .1), (0, sn[1] - hr * 1.1, sn[2] - hr * .2), .03, 5, shade(back, .8)))
    if S.get('udder'):
        P.add(ell((0, hb - g * .85, -L * .2), (g * .35, g * .22, g * .4), lambda *a: PINK, 6, 4))
        for q in range(4): P.add(cone(((q % 2 - .5) * g * .3, hb - g * .98, -L * .2 + (q // 2 - .5) * g * .3), ((q % 2 - .5) * g * .3, hb - g * 1.1, -L * .2 + (q // 2 - .5) * g * .3), .015, 4, PINK))
    if S.get('tail'):
        tl, tr, dr, tuft = S['tail']; p = (0, hb + g * .35, -L * .5); pts = [p]; n = max(2, math.ceil(tl / .15))
        for i in range(n):
            an = -.35 - dr * (i + 1) / n; p = (0, p[1] + math.sin(an) * tl / n, p[2] - math.cos(an) * tl / n); pts.append(p)
        tipc = DARK if k == 'puma' else back
        P.add(tube(pts, [tr * (1 - .4 * i / n) for i in range(n + 1)], 5, lambda t, q: mixc(back, tipc, max(0, t - .6) * 2.5)))
        if tuft: P.add(ell(pts[-1], (tr * 2.4, tr * 3.2, tr * 2.4), lambda *a: WHITE if k == 'conejo' else shade(back, .45), 6, 4))
    body = P
    # patas: eje en hombro/cadera; muslo grueso, rodilla, caña fina y casco o almohadilla
    legs = []; hx = g * w * .55
    for fz, sd, ph in ((1, -1, 0), (1, 1, math.pi), (-1, -1, math.pi), (-1, 1, 0)):
        top = hb - g * .25; lz = fz * L * .3; kz = .02 if fz > 0 else -.05
        a, kn, ft = (0, 0, 0), (0, -top * .5, kz), (0, -top, 0)
        def lc(t, q, top=top): return mixc(fur(0, top - t * top * .5, 0, 0), legc, min(1, t * 1.6))
        pl = tube([a, kn], [lr * 1.7, lr * 1.08], 6, lambda t, q: lc(t * .5, q)).add(tube([kn, ft], [lr * 1.05, lr * .8], 5, lambda t, q: lc(.5 + t * .5, q)))
        hoof = legc if S.get('paw') or k == 'conejo' else 0x2a221c
        pl.add(ell((0, -top + lr * .5, lr * .3), (lr * 1.15, lr * .6, lr * 1.45), lambda *a: hoof, 6, 3))
        legs.append({'m': pl, 'x': sd * hx, 'y': top, 'z': lz, 'ph': ph})
    return body, legs, hb

def gallina(seed):
    R = random.Random(seed); base = [0xf1ede4, 0x9a5a2a, 0x2a2422][seed % 3]; y0 = .32; ps = R.random() * 50
    fe = lambda x, y, z, ny: shade(base, .9 + .18 * vnz(x * 20, y * 20, z * 20, ps) + (.08 if ny > .4 else 0))
    P = M(); P.add(ell((0, y0, 0), (.16, .17, .22), fe, 8, 5, .15))
    n0, n1 = (0, y0 + .1, .14), (0, y0 + .25, .19); P.add(tube([n0, n1], [.08, .05], 6, lambda t, q: fe(0, 0, 0, 0)))
    P.add(ell((0, n1[1] + .03, n1[2] + .01), (.055, .06, .065), fe, 6, 4)); P.add(cone((0, n1[1] + .02, n1[2] + .055), (0, n1[1] + .015, n1[2] + .105), .018, 4, 0xe0a030))
    for i in range(3): P.tri2((0, n1[1] + .07, n1[2] - .03 + i * .025), (0, n1[1] + .07, n1[2] + i * .025), (0, n1[1] + .115 - .01 * abs(i - 1), n1[2] - .015 + i * .025), 0xc02a2a)
    P.add(ell((0, n1[1] - .02, n1[2] + .05), (.01, .025, .012), lambda *a: 0xc02a2a, 5, 3))
    for sd in (-1, 1): P.add(ell((sd * .045, n1[1] + .04, n1[2] + .035), (.011, .011, .011), lambda *a: 0x1a1410, 5, 3))
    for i in range(5):  # cola en abanico
        a = (0, y0 + .05, -.17); b = ((i - 2) * .035, y0 + .25 + .03 * math.sin(i), -.3 - .015 * i)
        P.tri2(a, (b[0] - .025, b[1], b[2]), (b[0] + .025, b[1] + .02, b[2]), shade(base, .8 if base != 0x2a2422 else 1.4))
    for sd in (-1, 1): P.add(ell((sd * .15, y0 + .02, -.01), (.03, .1, .16), lambda x, y, z, ny: shade(fe(x, y, z, ny), .85), 6, 4, .1))
    legs = []
    for sd, ph in ((-1, 0), (1, math.pi)):
        top = y0 - .12; pl = tube([(0, 0, 0), (0, -top, .01)], [.013, .01], 4, lambda t, q: 0xe0a030)
        for t in (-1, 0, 1): pl.add(tube([(0, -top + .005, 0), (t * .04, -top + .005, .06)], [.007, .005], 3, lambda tt, q: 0xe0a030))
        legs.append({'m': pl, 'x': sd * .06, 'y': top, 'z': 0, 'ph': ph})
    return P, legs, y0

def serpiente(seed):
    R = random.Random(seed); c1 = [0x6a7a3a, 0x5a4a2a, 0x7a6a3a][seed % 3]; c2 = [0x3a4a22, 0x2a2218, 0xd8c060][seed % 3]; n = 22; L = 1.4 + .4 * R.random(); pts = []; rs = []
    for i in range(n + 1):
        t = i / n; pts.append((math.sin(t * math.pi * 2.2) * .14 * (.4 + .6 * math.sin(t * math.pi)), .04, (.5 - t) * L)); rs.append(max(.005, .045 * min(1, (n - i) / (n * .35)) * (.85 if i < 2 else 1)))
    P = tube(pts, rs, 6, lambda t, q: c2 if int(t * n) % 4 == 0 else (shade(c1, 1.15) if q > .5 else c1))
    P.add(ell((pts[0][0], .05, pts[0][2] + .04), (.058, .036, .08), lambda x, y, z, ny: shade(c1, 1.1 if ny > 0 else .8), 7, 4))
    for sd in (-1, 1): P.add(ell((pts[0][0] + sd * .037, .066, pts[0][2] + .07), (.009, .009, .009), lambda *a: 0xd8a020, 4, 2))
    P.tri2((pts[0][0] - .006, .045, pts[0][2] + .115), (pts[0][0] + .006, .045, pts[0][2] + .115), (pts[0][0], .045, pts[0][2] + .17), 0xc02a3a)  # lengua
    return P, [], .05

models = {}; meta = {}
for k in list(SPEC) + ['gallina', 'serpiente']:
    for v in range(3):
        sd = 9100 + v * 131 + len(k) * 17
        body, legs, hb = gallina(sd) if k == 'gallina' else serpiente(sd) if k == 'serpiente' else quad(k, sd)
        models['%s_%d' % (k, v)] = body
        for i, l in enumerate(legs): models['%s_%d_p%d' % (k, v, i)] = l['m']
        meta['%s_%d' % (k, v)] = {'hb': round(hb, 4), 'legs': [[round(l['x'], 4), round(l['y'], 4), round(l['z'], 4), round(l['ph'], 4)] for l in legs]}

def lin(c): return [round(x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4, 4) for x in srgb(c)]
pal = []; pidx = {}; comp = {}; ntri = 0
for name, m in models.items():
    P16 = bytearray(); CI = bytearray()
    for a, b, c, kk in m.t:
        if kk not in pidx:
            if len(pal) >= 255: kk = min(pal, key=lambda q: sum((x - y) ** 2 for x, y in zip(srgb(q), srgb(kk))))
            else: pidx[kk] = len(pal); pal.append(kk)
        for vv in (a, b, c): P16 += struct.pack('<3h', *[max(-32767, min(32767, round(q * 10000))) for q in vv])  # 0,1 mm
        CI.append(pidx[kk])
    comp[name] = [base64.b64encode(bytes(P16)).decode(), base64.b64encode(bytes(CI)).decode()]; ntri += len(m.t)
js = 'window.AN2={pal:' + json.dumps([lin(c) for c in pal]) + ',meta:' + json.dumps(meta, separators=(',', ':')) + ',p:' + json.dumps(comp, separators=(',', ':')) + '};'
open(OUT + '.js', 'w').write(js)
print('modelos', len(models), 'triángulos', ntri, 'colores', len(pal), 'js', len(js) // 1024, 'KB')

# vista previa: una fila con todas las especies (variante 0) en reposo
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
def mkobj(nm, m, off):
    me = bpy.data.meshes.new(nm); bm = bmesh.new(); cl = bm.loops.layers.color.new('col')
    for a, b, c, kk in m.t:
        try: f = bm.faces.new([bm.verts.new((v[0] + off[0], -(v[2] + off[2]), v[1] + off[1])) for v in (a, b, c)])
        except ValueError: continue
        cc = srgb(kk)
        for l in f.loops: l[cl] = (cc[0], cc[1], cc[2], 1)
    bm.to_mesh(me); bm.free()
    try: me.color_attributes.active_color = me.color_attributes['col']
    except Exception: pass
    sc.collection.objects.link(bpy.data.objects.new(nm, me))
x = -5.0; ROW2 = {'guagua': -3.4}
for k in ['vaca', 'mula', 'venado', 'puma', 'cabra', 'guagua', 'conejo', 'cuy', 'gallina', 'serpiente']:
    if k in ROW2: x = ROW2[k]
    zrow = 2.2 if k in ('guagua', 'conejo', 'cuy', 'gallina', 'serpiente') else 0
    key = k + '_0'; L = SPEC[k]['L'] if k in SPEC else (.5 if k == 'gallina' else 1.6); x += max(.6, L * .55) * (2 if zrow else 1)
    # de perfil: girar 90° (z del juego → x de la escena)
    rot = lambda m: m  # se dibuja girando coordenadas
    def turned(m):
        o = M(); o.t = [(tuple((v[2], v[1], -v[0]) for v in ()) ) for _ in ()]; return m
    off = (x, 0, zrow)
    def rm(m, off=off):
        o = M(); o.t = [((a[2], a[1], -a[0]), (b[2], b[1], -b[0]), (c[2], c[1], -c[0]), kk) for a, b, c, kk in m.t]; return o
    mkobj(key, rm(models[key]), off)
    for i, l in enumerate(meta[key]['legs']):
        lm = models['%s_p%d' % (key, i)]; mkobj(key + 'p%d' % i, rm(lm), (x + l[2], l[1], -l[0] + zrow))
    x += max(.6, L * .55)
gm = bpy.data.meshes.new('suelo'); bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=20); bm.to_mesh(gm); bm.free(); sc.collection.objects.link(bpy.data.objects.new('suelo', gm))
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = 35; cam.location = (0, -8.5, 3.2); cam.rotation_euler = (math.radians(72), 0, 0)
sc.render.engine = 'BLENDER_WORKBENCH'; sc.display.shading.light = 'STUDIO'; sc.display.shading.color_type = 'VERTEX'; sc.display.shading.show_shadows = True
sc.render.resolution_x, sc.render.resolution_y = 1600, 900; sc.world = bpy.data.worlds.new('w'); sc.render.filepath = OUT + '.png'; bpy.ops.render.render(write_still=True)
