# Corrales, gallinero, bebedero, comedero, pozo, molino, noria y rueda hidráulica (con sus ruedas que giran aparte)
# y acabados de adobe, ladrillo, paja y teja (0.49). Mismas medidas y ejes que el juego.
import sys
exec(open('/home/claude/juego041/blender/comun_bd.py').read().replace("OUT = sys.argv", "OUT0 = sys.argv"))
OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else '/tmp/maquinas'
P = {}
def pick(L): return L[rnd.randrange(len(L))]
WATER = 0x3d86b8; HAY = 0xcbb86a; BAMBOO = 0x9db35a
def fence(hw, g):  # cerca con postes cada ~1 m, dos travesaños y puerta de golpe en +z (hueco de ancho g)
    m = M()
    def seg(x0, z0, x1, z1):
        L = math.hypot(x1 - x0, z1 - z0); n = max(1, round(L))
        for y in (.4, .85): m.add(log((x0, y, z0), (x1, y, z1), .045, var(LOG), 5))
        for k in range(n + 1):
            x, z = x0 + (x1 - x0) * k / n, z0 + (z1 - z0) * k / n
            m.add(log((x, 0, z), (x, 1.05, z), .06, var(STICK), 5)); m.add(cone((x, 1.05, z), (x, 1.13, z), .06, 5, var(STICK)) if False else M())
    seg(-hw, -hw, hw, -hw); seg(-hw, -hw, -hw, hw); seg(hw, -hw, hw, hw); seg(-hw, hw, -g / 2, hw); seg(g / 2, hw, hw, hw)
    for x in (-g / 2, g / 2): m.add(log((x, 0, hw), (x, 1.5, hw), .1, LOG2, 6))
    m.add(log((-g / 2 - .1, 1.4, hw), (g / 2 + .1, 1.4, hw), .06, LOG2, 5))  # dintel
    for k in range(3): m.add(box(-g / 2 + .45, .3 + k * .35, hw - .5, .06, .06, .9, LOG, ry=0))  # portón abierto hacia dentro
    m.add(box(-g / 2 + .45, .65, hw - .5, .05, .8, .05, LOG2, rx=.7))
    return m
def hay(x, y, z, sx, sz):  # paca de paja
    return puff((x, y, z), .5, .55, lambda ny, q: var(HAY if q > .3 else 0xb8a65a, .06), rnd, .2, 1).add(M()) if False else box(x, y, z, sx, .45, sz, var(HAY, .05), top=0xd8c878)
P['corral'] = fence(3, 1.6).add(hay(-2.2, .23, -2.2, .9, .5))
cg = fence(4, 1.8)
for x, z in ((-3.9, -3.9), (.1, -3.9), (-3.9, -1.0), (.1, -1.0)): cg.add(log((x, 0, z), (x, 2.5 if z < -2 else 2.2, z), .12, LOG, 6))
cg.add(box(-1.9, 2.6, -2.45, 4.6, .08, 3.4, LEAFD, rx=.18))
for r in range(5):  # techo de hojas en hileras
    for k in range(9):
        z = -4.1 + r * .7; y = 2.62 - r * .12; x = -4.0 + k * .5 + (.25 if r % 2 else 0)
        if x > .3: continue
        cg.tri2((x - .3, y + .06, z), (x + .3, y + .06, z), (x, y - .06, z + .55), var(LEAF if (r + k) % 2 else LEAF2, .1))
cg.add(box(-1.9, 2.15, -1.0, 4, .1, .1, LOG2)).add(box(-1.9, .5, -3.85, 3.9, .5, .08, LOG2))
cg.add(hay(-3.0, .23, -3.2, 1.2, .6)).add(hay(-3.0, .68, -3.2, 1.0, .55)).add(hay(-.9, .23, -3.2, 1.0, .55))
cg.add(box(-1.9, .35, -1.3, 1.5, .3, .45, LOG2)).add(box(-1.9, .5, -1.3, 1.4, .04, .35, WATER))
P['corral_g'] = cg
ga = box(0, .05, 0, 2.3, .1, 2.3, 0x8a6a45)
for k in range(8): ga.add(log((-1.1 + k * .314, .1, -1.1), (-1.1 + k * .314, 1.25, -1.1), .045, var(STICK), 5))
for z in (-1.1 + k * .314 for k in range(8)):
    ga.add(log((-1.1, .1, z), (-1.1, 1.25, z), .045, var(STICK), 5)); ga.add(log((1.1, .1, z), (1.1, 1.25, z), .045, var(STICK), 5))
for x in (-1.1, -.8, -.5, .5, .8, 1.1): ga.add(log((x, .1, 1.1), (x, 1.25, 1.1), .045, var(STICK), 5))
ga.add(box(0, 1.15, 1.1, .9, .25, .08, LOG2))
ga.add(box(0, 1.38, 0, 2.7, .08, 2.75, LEAFD, rx=.22))
for r in range(4):
    for k in range(6):
        z = -1.3 + r * .65; y = 1.62 - r * .15; x = -1.25 + k * .5 + (.25 if r % 2 else 0)
        if x > 1.3: continue
        ga.tri2((x - .3, y + .05, z), (x + .3, y + .05, z), (x, y - .1, z + .5), var(LEAF if (r + k) % 2 else LEAF2, .1))
ga.add(log((-1, .5, -.3), (1, .5, -.3), .03, STICK, 4)).add(log((-1, .75, .2), (1, .75, .2), .03, STICK, 4))  # perchas
ga.add(box(0, .2, 1.5, .55, .04, .7, LOG, rx=.35))  # rampa
ga.add(puff((-.6, .18, -.7), .3, .5, lambda ny, q: HAY, rnd, .2, 0))  # nido
for k in range(3): ga.add(puff((-.6 + (k - 1) * .07, .25, -.7 + (k % 2) * .05), .035, 1.3, lambda ny, q: 0xf4ecd8, rnd, 0, 0))  # huevos
ga.add(box(.4, .14, .2, 1.2, .05, .25, BAMBOO))
P['gallinero'] = ga
be = box(0, .34, 0, 1.25, .28, .5, LOG2).add(box(0, .46, 0, 1.15, .03, .38, WATER, top=0x5aa0d0))
for x in (-.5, .5):
    for z in (-.15, .15): be.add(log((x, 0, z), (x, .3, z), .05, STICK, 4))
P['bebedero'] = be
co = box(0, .4, 0, 1.25, .26, .5, LOG2)
for k in range(5): co.add(puff((-.45 + k * .22, .56, (rnd.random() - .5) * .1), .17, .5, lambda ny, q: var(0x9aa85a if q > .4 else HAY, .06), rnd, .2, 0))
for x in (-.5, .5):
    for z in (-.15, .15): co.add(log((x, 0, z), (x, .4, z), .05, STICK, 4))
co.add(log((-.55, .3, -.24), (-.55, .9, -.24), .04, STICK, 4)).add(log((.55, .3, -.24), (.55, .9, -.24), .04, STICK, 4)).add(log((-.6, .9, -.24), (.6, .9, -.24), .04, LOG, 4))
P['comedero'] = co
po = M()
for r in range(3):
    for k in range(12):
        a = (k + (r % 2) * .5) / 12 * 6.283; po.add(box(math.cos(a) * .78, .13 + r * .26, math.sin(a) * .78, .42, .25, .22, var(pick(STONE), .08), ry=-a + math.pi / 2))
po.add(tube([(0, .38, 0), (0, .4, 0)], [.66, .66], 12, lambda t, q: 0x163248))  # agua honda
for x in (-.9, .9): po.add(log((x, 0, 0), (x, 1.95, 0), .06, LOG2, 6))
po.add(log((-1.0, 1.9, 0), (1.0, 1.9, 0), .05, LOG, 6)).add(tube([(-.4, 1.72, 0), (.4, 1.72, 0)], [.1, .1], 6, lambda t, q: LOG))  # torno
po.add(log((.4, 1.72, 0), (.55, 1.55, 0), .025, 0x3a3a3a, 4)).add(log((0, 1.72, 0), (0, 1.0, 0), .012, ROPE, 3))
po.add(tube([(0, .7, 0), (0, .95, 0)], [.13, .15], 7, lambda t, q: 0x8a5a3a))
for k in range(4):  # techito
    a = k * math.pi / 2 + math.pi / 4; po.tri2((0, 2.5, 0), (math.cos(a) * 1.15, 1.95, math.sin(a) * 1.15), (math.cos(a + math.pi / 2) * 1.15, 1.95, math.sin(a + math.pi / 2) * 1.15), var(0x8a6a45, .08))
P['pozo'] = po
mo = box(0, .25, 0, 2.2, .5, 2.2, 0x8a857c)
for r in range(2):
    for k in range(4): mo.add(box(-.83 + k * .55, .12 + r * .25, 1.11, .52, .23, .05, var(pick(STONE))))
for k in range(6):  # paredes de tablas verticales
    x = -.85 + k * .34; mo.add(box(x, 1.4, 1.0, .32, 1.8, .06, var(pick(PLANK)))); mo.add(box(x, 1.4, -1.0, .32, 1.8, .06, var(pick(PLANK))))
    mo.add(box(1.0, 1.4, x, .06, 1.8, .32, var(pick(PLANK)))); mo.add(box(-1.0, 1.4, x, .06, 1.8, .32, var(pick(PLANK))))
for sg in (-1, 1):
    mo.add(box(sg * .55, 2.5, 0, 1.35, .1, 2.4, LOG2, rz=-sg * .45))
    for k in range(8): mo.add(box(sg * .55, 2.56, -1.05 + k * .3, 1.33, .03, .27, var(pick(PLANK), .1), rz=-sg * .45))
mo.add(log((0, 2.85, -1.25), (0, 2.85, 1.25), .07, LOG, 6))
mo.add(tube([(1.15, 1.3, 0), (1.42, 1.3, 0)], [1.3, 1.3], 14, lambda t, q: var(0x7a5a3a, .04)))  # rueda del molino
for k in range(8):
    a = k / 8 * 6.283; mo.add(box(1.48, 1.3 + math.sin(a) * 1.25, math.cos(a) * 1.25, .1, .5, .35, LOG2, rx=a))
mo.add(log((1.0, 1.3, 0), (1.6, 1.3, 0), .1, 0x4a4a4a, 6)).add(box(-1.01, 1.0, 0, .06, .8, .4, 0x3a2a1a, ry=0))
P['molino'] = mo
no = M()
for sx in (-.75, .75):
    no.add(log((sx, 0, -1.1), (sx, 1.95, 0), .08, LOG2, 6)).add(log((sx, 0, 1.1), (sx, 1.95, 0), .08, LOG2, 6)); no.add(box(sx, 1.9, 0, .2, .2, .32, LOG))
no.add(box(0, .08, -.9, 1.7, .1, .12, LOG2)).add(box(0, .08, .9, 1.7, .1, .12, LOG2))
no.add(box(0, 3.3, 1.05, .36, .12, 1.9, BAMBOO)).add(box(0, 3.37, 1.05, .26, .02, 1.85, WATER)).add(log((0, 1.95, 1.9), (0, 3.25, 1.9), .05, LOG2, 5))
P['noria'] = no
nw = M(); R_, n = 1.55, 16
for k in range(n):
    a = k / n * 6.283; nw.add(box(0, R_ * math.sin(a), R_ * math.cos(a), .16, 2 * math.pi * R_ / n + .04, .12, var(LOG, .05), rx=-a))
    if k % 2 == 0: nw.add(log((0, 0, 0), (0, R_ * math.sin(a), R_ * math.cos(a)), .035, LOG2, 4))
    else: nw.add(tube([(-.12, (R_ + .12) * math.sin(a), (R_ + .12) * math.cos(a)), (.12, (R_ + .12) * math.sin(a), (R_ + .12) * math.cos(a))], [.12, .12], 6, lambda t, q: 0xb4673c))  # cangilones de barro
nw.add(tube([(-.7, 0, 0), (.7, 0, 0)], [.08, .08], 6, lambda t, q: LOG))
P['noria_w'] = nw
rh = M()
for sx in (-.7, .7): rh.add(log((sx, 0, 0), (sx, 1.6, 0), .09, LOG2, 6)).add(box(sx, 1.3, 0, .2, .2, .32, LOG))
rh.add(box(0, .06, 0, 1.6, .12, .14, LOG2)).add(box(1.0, 1.3, 0, .3, .3, .3, 0x7a776f))
P['rueda_h'] = rh
rw = M(); R_, n = 1.15, 12
for k in range(n):
    a = k / n * 6.283; rw.add(box(0, R_ * math.sin(a), R_ * math.cos(a), .6, 2 * math.pi * R_ / n + .05, .1, var(LOG, .05), rx=-a))
    rw.add(box(0, (R_ + .12) * math.sin(a), (R_ + .12) * math.cos(a), .55, .34, .05, var(0x7a5a3a, .06), rx=-a))  # paletas
    if k % 3 == 0: rw.add(log((0, 0, 0), (0, R_ * math.sin(a), R_ * math.cos(a)), .04, LOG2, 4))
rw.add(tube([(-.8, 0, 0), (.8, 0, 0)], [.09, .09], 6, lambda t, q: LOG))
P['rueda_h_w'] = rw
# ---------- acabados ----------
ADO = [0xb08a62, 0xa47e58, 0xba9468, 0x9c7650]; BRI = [0xa4513a, 0x9a4a34, 0xb05a40, 0x8f4430]; MORT = 0xd8d0c0
def adobe_wall(x0, x1):
    m = box((x0 + x1) / 2, 1.18, 0, x1 - x0, 2.36, .26, 0x7d5f42)
    for r in range(6):
        x = x0 + (.37 if r % 2 else 0) - (.37 if r % 2 else 0)
        x = x0 - (.37 if r % 2 else 0)
        while x < x1 - .05:
            w = min(.72, x1 - x); xa = max(x, x0)
            if x + w > x0 + .05: m.add(box((xa + x + w) / 2, .2 + r * .39, 0, x + w - xa - .03, .36, .32 + rnd.random() * .03, var(pick(ADO), .05)))
            x += .75
    return m
def brick_wall(x0, x1):
    m = box((x0 + x1) / 2, 1.21, 0, x1 - x0, 2.42, .3, MORT)
    for r in range(11):
        x = x0 - (.25 if r % 2 else 0)
        while x < x1 - .03:
            xa = max(x, x0); xb = min(x + .48, x1)
            if xb - xa > .05: m.add(box((xa + xb) / 2, .11 + r * .22, 0, xb - xa - .02, .19, .34, var(pick(BRI), .05)))
            x += .5
    return m
P['pared_adobe'] = adobe_wall(-1.5, 1.5).add(box(0, 2.42, 0, 3.06, .1, .4, LOG2))
pa = adobe_wall(-1.5, -.55).add(adobe_wall(.55, 1.5)).add(box(0, 2.2, 0, 1.3, .18, .3, LOG2)).add(box(0, 2.45, 0, 3.06, .3, .32, 0x8f6d4c))
for sg in (-1, 1): pa.add(log((sg * .55, 0, 0), (sg * .55, 2.3, 0), .11, LOG2, 6))
P['pared_ladrillo'] = brick_wall(-1.5, 1.5).add(box(0, 2.46, 0, 3.1, .08, .4, 0x9a4a34))
pl = brick_wall(-1.5, -.55).add(brick_wall(.55, 1.5))
for k in range(5): pl.add(box(-.55 + k * .275, 2.3, 0, .26, .2, .34, var(pick(BRI)), rz=(k - 2) * .12))  # arco de ladrillo
def door_leaf(m, col):
    d = M()
    for k in range(4): d.add(box(-.19 + k * .127, 0, 0, .12, 2.0, .05, var(col)))
    for y in (-.7, .7): d.add(box(0, y, .04, .5, .1, .03, LOG2))
    d.add(box(.19, .05, .07, .05, .05, .05, 0x3a3a3a))
    a = .9
    for t in d.t:
        R_ = lambda p: (p[0] * math.cos(a) + p[2] * math.sin(a) - .38, p[1] + 1.05, -p[0] * math.sin(a) + p[2] * math.cos(a) + .22)
        m.t.append((R_(t[0]), R_(t[1]), R_(t[2]), t[3]))
    return m
P['puerta_adobe'] = door_leaf(pa, 0x8a6038); P['puerta_ladrillo'] = door_leaf(pl, 0x7a5030)
tp = M()
for sg in (-1, 1):
    tp.add(box(sg * .8, 2.6, 0, 1.85, .06, 3.4, LOG2, rz=-sg * .38))
    for r in range(5):  # paja en mechones gruesos con borde deshilachado
        u = r * .36
        for k in range(10):
            z = -1.65 + k * .37; x = sg * (1.62 - u * math.cos(.38)); y = 2.4 + u * math.sin(.38) + .08
            tp.add(box(x, y, z, .55, .1, .39, var([0xc9b06a, 0xbda15a, 0xd3bb78, 0xb69a52][(r + k) % 4], .06), rz=-sg * (.38 + .08)))
            if r == 0: tp.tri2((x + sg * .2, y - .05, z - .18), (x + sg * .2, y - .05, z + .18), (x + sg * .38, y - .22, z + (rnd.random() - .5) * .1), 0xb69a52)
tp.add(tube([(0, 2.97, -1.8), (0, 2.97, 1.8)], [.15, .15], 7, lambda t, q: 0xa88e4a))
for z in (-1.5, 1.5): tp.add(box(0, 2.3, z, 3.2, .1, .1, LOG2))
P['techo_paja'] = tp
tt = M()
for sg in (-1, 1):
    tt.add(box(sg * .8, 2.62, 0, 1.85, .08, 3.4, LOG2, rz=-sg * .38))
    for r in range(5):
        for k in range(9):
            u = .1 + r * .34; x = sg * (1.62 - u * math.cos(.38)); y = 2.38 + u * math.sin(.38) + .06; z = -1.55 + k * .385
            tt.add(tube([(x, y, z - .19), (x, y, z + .19)], [.1, .09], 5, lambda t, q, c=var(pick([0xb0583a, 0xa44f34, 0xbc6242]), .05): c if q < .6 else shade(c, .75)))
tt.add(tube([(0, 3.03, -1.75), (0, 3.03, 1.75)], [.12, .12], 6, lambda t, q: 0x9a4a34))
for z in (-1.5, 1.5): tt.add(box(0, 2.3, z, 3.2, .1, .1, LOG2))
P['techo_teja'] = tt

def lin(c): return [round(x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4, 4) for x in srgb(c)]
pal = []; pidx = {}; comp = {}; ntri = 0
for name, m in P.items():
    P16 = bytearray(); CI = bytearray()
    for a, b, c, kk in m.t:
        if kk not in pidx:
            if len(pal) >= 255: kk = min(pal, key=lambda q: sum((x - y) ** 2 for x, y in zip(srgb(q), srgb(kk))))
            else: pidx[kk] = len(pal); pal.append(kk)
        for vv in (a, b, c): P16 += struct.pack('<3h', *[max(-32767, min(32767, round(q * 1000))) for q in vv])
        CI.append(pidx[kk])
    comp[name] = [base64.b64encode(bytes(P16)).decode(), base64.b64encode(bytes(CI)).decode()]; ntri += len(m.t)
js = 'window.MQ2={pal:' + json.dumps([lin(c) for c in pal]) + ',p:' + json.dumps(comp, separators=(',', ':')) + '};'
open(OUT + '.js', 'w').write(js); print('piezas', len(comp), 'triángulos', ntri, 'colores', len(pal), 'js', len(js) // 1024, 'KB')

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
for k, off in (('corral_g', (-9, 0, 0)), ('corral', (-1.5, 0, 0)), ('gallinero', (4, 0, 1)), ('pozo', (7.5, 0, 1)), ('molino', (11.5, 0, 1)), ('noria', (15.5, 0, 1)), ('bebedero', (3, 0, 4.5)), ('comedero', (5, 0, 4.5)), ('rueda_h', (19, 0, 1))):
    mkobj(k, P[k], off)
mkobj('nw', P['noria_w'], (15.5, 1.9, 1)); mkobj('rw', P['rueda_h_w'], (19, 1.3, 1))
for i, (k, rot) in enumerate((('pared_adobe', 0), ('puerta_adobe', 0), ('pared_ladrillo', 0), ('puerta_ladrillo', 0))): mkobj(k, P[k], (-9 + i * 3.2, 0, 8))
mkobj('tp', P['techo_paja'], (4.5, -2.3, 8)); mkobj('tt', P['techo_teja'], (8.5, -2.3, 8))
gm = bpy.data.meshes.new('suelo'); bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=40); bm.to_mesh(gm); bm.free(); sc.collection.objects.link(bpy.data.objects.new('suelo', gm))
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = 24; cam.location = (5, -26, 14); cam.rotation_euler = (math.radians(60), 0, 0)
sc.render.engine = 'BLENDER_WORKBENCH'; sc.display.shading.light = 'STUDIO'; sc.display.shading.color_type = 'VERTEX'; sc.display.shading.show_shadows = True
sc.render.resolution_x, sc.render.resolution_y = 1800, 1000; sc.world = bpy.data.worlds.new('w'); sc.render.filepath = OUT + '.png'; bpy.ops.render.render(write_still=True)
