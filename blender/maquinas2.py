# Telar, prensa y fuelle con sus piezas móviles; piezas sueltas del puente y de la huerta (0.51). Mismas posiciones del juego.
import sys
exec(open('/home/claude/juego041/blender/comun_bd.py').read().replace("OUT = sys.argv", "OUT0 = sys.argv"))
OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else '/tmp/maquinas2'
P = {}
def cone(base, tip, r, sides, col):
    m = M(); B = Vector(base); T = Vector(tip); u, v = frame(T - B); Pp = [B + (u * math.cos(2 * math.pi * k / sides) + v * math.sin(2 * math.pi * k / sides)) * r for k in range(sides)]
    for k in range(sides): m.tri(tuple(Pp[k]), tuple(Pp[(k + 1) % sides]), tuple(T), col); m.tri(tuple(Pp[(k + 1) % sides]), tuple(Pp[k]), tuple(B), shade(col, .8))
    return m
def pick(L): return L[rnd.randrange(len(L))]
THREAD = 0xe8dfb8; CLOTH = 0xc8b07a; IRONC = 0x8a8a80; JUICE = 0x8a2a5a
# ---------- telar (bastidores en x=±.72, rodillo de urdimbre atrás arriba, rodillo de tela adelante abajo) ----------
BK, FR = (-.5, 1.3), (.42, .86); te = M()
for sx in (-.72, .72):
    te.add(log((sx, 0, -.5), (sx, 1.6, -.5), .055, LOG2, 6)).add(log((sx, 0, .42), (sx, 1.0, .42), .055, LOG2, 6))
    te.add(log((sx, .12, -.55), (sx, .12, .47), .045, LOG, 5)).add(log((sx, 1.55, -.5), (sx, 1.0, .42), .04, LOG2, 5))
    te.add(box(sx, 0, -.5, .14, .06, .14, LOG2)).add(box(sx, 0, .42, .14, .06, .14, LOG2))  # pies
te.add(tube([(-.76, BK[1], BK[0]), (.76, BK[1], BK[0])], [.06, .06], 7, lambda t, q: LOG)).add(tube([(-.76, FR[1], FR[0]), (.76, FR[1], FR[0])], [.07, .07], 7, lambda t, q: LOG))
te.add(tube([(-.66, FR[1], FR[0]), (.66, FR[1], FR[0])], [.085, .085], 7, lambda t, q: CLOTH))  # tela enrollada
te.add(log((-.75, 1.6, -.5), (.75, 1.6, -.5), .035, LOG2, 5))
for k in range(16):  # urdimbre
    x = -.6 + k * 1.2 / 15; te.add(log((x, BK[1] + .05, BK[0]), (x, FR[1] + .07, FR[0]), .005, THREAD, 3))
tz = .12; ty = BK[1] + (FR[1] - BK[1]) * (tz - BK[0]) / (FR[0] - BK[0])
L_ = math.hypot(FR[0] - tz, FR[1] - ty); ang = math.atan2(FR[1] - ty, FR[0] - tz)
for k in range(6):  # tela tejida a rayas
    u0 = k / 6; z = tz + (FR[0] - tz) * (u0 + 1 / 12); y = ty + (FR[1] - ty) * (u0 + 1 / 12) + .065
    te.add(box(0, y, z, 1.22, .012, L_ / 6, [CLOTH, 0xa8402a, CLOTH, 0x3a6a8a, CLOTH, 0xa8402a][k], rx=-ang))
te.add(box(.75, .5, .2, .3, .04, .3, LOG)).add(log((.75, 0, .2), (.75, .5, .2), .03, LOG2, 4))  # banquito
for k in range(3): te.add(puff((.75 + (k - 1) * .08, .58, .2), .05, 1, lambda ny, q, k=k: [0xa8402a, 0x3a6a8a, THREAD][k], rnd, .1, 0))  # ovillos
P['telar'] = te
bt = log((-.62, 0, 0), (-.62, -.5, 0), .025, LOG2, 5).add(log((.62, 0, 0), (.62, -.5, 0), .025, LOG2, 5)).add(box(0, -.5, 0, 1.3, .07, .06, LOG)).add(log((-.64, 0, 0), (.64, 0, 0), .03, LOG2, 5))
for k in range(20): bt.add(box(-.57 + k * .06, -.38, 0, .008, .2, .008, 0x9a7a50))  # peine
P['telar_bt'] = bt
he = log((-.66, 0, 0), (.66, 0, 0), .02, LOG2, 5)
for k in range(10): he.add(box(-.55 + k * .12, -.08, 0, .006, .16, .006, THREAD))
P['telar_he'] = he
sh = box(0, 0, 0, .22, .035, .06, 0x8a5a2a)
sh.add(cone((.11, 0, 0), (.17, 0, 0), .018, 4, 0x6a4a28)).add(cone((-.11, 0, 0), (-.17, 0, 0), .018, 4, 0x6a4a28)).add(tube([(-.05, .02, 0), (.05, .02, 0)], [.015, .015], 5, lambda t, q: THREAD))
P['telar_sh'] = sh
# ---------- prensa de tornillo (cuba de piedra, travesaño arriba; el tornillo baja y gira) ----------
pr = tube([(0, 0, 0), (0, .32, 0)], [.44, .42], 10, lambda t, q: var(0x7a776f, .05)).add(tube([(0, .32, 0), (0, .36, 0)], [.36, .36], 10, lambda t, q: 0x5a3d26))
pr.add(tube([(0, .36, 0), (0, .44, 0)], [.31, .31], 10, lambda t, q: JUICE))  # fruta prensada
pr.add(box(.46, .09, 0, .16, .08, .26, 0x7a776f)).add(cone((.52, .1, 0), (.62, .05, 0), .03, 4, JUICE))  # pico con jugo
for sx in (-.5, .5): pr.add(box(sx, .85, 0, .15, 1.72, .15, LOG2)).add(box(sx, .02, 0, .3, .05, .3, LOG2))
pr.add(box(0, 1.66, 0, 1.24, .18, .2, LOG)).add(tube([(0, 1.56, 0), (0, 1.76, 0)], [.08, .08], 6, lambda t, q: IRONC))  # tuerca
for k in range(4): pr.add(tube([(.6 + k * .02, .05, .3 + k * .02), (.6 + k * .02, .28, .3 + k * .02)], [.06, .055], 6, lambda t, q: 0xb08a5a)) if k == 0 else None  # jarra
P['prensa'] = pr
sc = M()
for k in range(14):  # tornillo con rosca
    y = k * .075; a = k * .9; sc.add(box(math.cos(a) * .045, y + .02, math.sin(a) * .045, .05, .025, .05, IRONC, ry=-a))
sc.add(tube([(0, -.02, 0), (0, 1.07, 0)], [.045, .045], 6, lambda t, q: 0x7a7a72)).add(tube([(0, -.03, 0), (0, .04, 0)], [.3, .3], 9, lambda t, q: LOG))
sc.add(log((-.45, .95, 0), (.45, .95, 0), .032, LOG2, 5)).add(puff((-.45, .95, 0), .045, 1, lambda ny, q: LOG2, rnd, 0, 0)).add(puff((.45, .95, 0), .045, 1, lambda ny, q: LOG2, rnd, 0, 0))
P['prensa_sc'] = sc
# ---------- fuelle (base fija; la tapa articulada en x=-.34) ----------
fu = box(0, .16, 0, .7, .06, .44, LOG).add(box(-.2, .06, 0, .12, .14, .12, LOG2)).add(box(.2, .06, 0, .12, .14, .12, LOG2)).add(box(-.36, .22, 0, .08, .1, .44, LOG2))
fu.add(tube([(.35, .2, 0), (.62, .2, 0)], [.05, .03], 6, lambda t, q: 0x5a5a5a))  # tobera de hierro
P['fuelle'] = fu
hg = box(.34, .1, 0, .7, .06, .44, LOG)
for k in range(5): hg.add(box(.05 + k * .13, -.01, 0, .12, .1, .4, var(0x8b6a48, .08)))  # cuero plegado
hg.add(log((-.05, .12, 0), (-.45, .2, 0), .03, LOG2, 5)).add(puff((-.47, .2, 0), .045, 1, lambda ny, q: LOG2, rnd, 0, 0))  # asa
P['fuelle_hg'] = hg
# ---------- piezas del puente (el juego las repite según el largo) ----------
for k in range(3): P['pu_tabla%d' % k] = box(0, -.06, 0, 1.8 + rnd.random() * .06, .09, .28, var(pick([LOG, LOG2, 0x7a5432]), .06)).add(box(-.8, -.005, 0, .03, .01, .03, 0x3a3a3a)).add(box(.8, -.005, 0, .03, .01, .03, 0x3a3a3a))
P['pu_viga'] = log((0, 0, -.5), (0, 0, .5), .13, LOG2, 7)  # largo 1 en z: el juego la estira
P['pu_poste'] = log((0, 0, 0), (0, 1.0, 0), .05, STICK, 5).add(puff((0, 1.0, 0), .06, .6, lambda ny, q: ROPE, rnd, 0, 0))
P['pu_soga'] = tube([(0, 0, -.5), (0, -.03, 0), (0, 0, .5)], [.025, .025, .025], 4, lambda t, q: ROPE)
P['pu_pilote'] = log((0, 0, 0), (0, -2.2, 0), .12, LOG2, 6).add(tube([(0, -.5, 0), (0, -.45, 0)], [.135, .135], 6, lambda t, q: ROPE))
# ---------- huerta: cama de tierra y cada etapa de cultivo ----------
for wet in (0, 1):
    soil = 0x35261a if wet else 0x4a3524; ridge = 0x45301f if wet else 0x5a4330
    h = box(0, -.6, 0, 3, 1.3, 3, soil)
    for z in (-1.05, -.35, .35, 1.05):
        h.add(tube([(-1.4, .06, z), (1.4, .06, z)], [.12, .12], 5, lambda t, q: ridge if q < .6 else shade(ridge, .85)))
        for k in range(5): h.add(rk_ := puff((-1.2 + k * .6 + rnd.random() * .2, .12, z + (rnd.random() - .5) * .1), .03, .7, lambda ny, q: shade(ridge, .8), rnd, .2, 0))
    for x, z in ((-1.5, -1.5), (1.5, -1.5), (-1.5, 1.5), (1.5, 1.5)): h.add(log((x, 0, z), (x, .55, z), .05, STICK, 4))
    for z in (-1.5, 1.5): h.add(log((-1.5, .45, z), (1.5, .45, z), .015, ROPE, 3))
    for x in (-1.5, 1.5): h.add(log((x, .45, -1.5), (x, .45, 1.5), .015, ROPE, 3))
    if wet:
        for k in range(6): h.add(box(-1.2 + k * .48, .005, (rnd.random() - .5) * 2.4, .3, .005, .2, 0x2a3a48))  # charquitos
    P['hu_cama%d' % wet] = h
P['cu_brote'] = tube([(0, .1, 0), (0, .2, 0)], [.012, .008], 4, lambda t, q: 0x6aaa4a)
for (a, b) in ((-.6, .3), (.6, .3)): P['cu_brote'].tri2((0, .2, 0), (a * .1, .24, .02), (a * .1, .2, -.03), 0x7aba5a)
for sg in range(1, 5):  # papa: mata que crece, flores blancas en la etapa 3, amarilla y con papas en la 4
    r = .06 + .055 * sg; m = M()
    for k in range(2 + sg):
        a = k * 2.4; d = Vector((math.cos(a), 0, math.sin(a))) * r * .8
        m.add(puff((d.x, .1 + r * .8, d.z), r * .7, .75, lambda ny, q, sg=sg: (0x93a040 if sg == 4 else 0x4f8a3a) if q > .35 else (0xa8a848 if sg == 4 else 0x5a9a42), rnd, .2, 0))
    if sg == 3:
        for k in range(3): m.tri2((math.cos(k * 2.1) * r - .03, .1 + r * 1.55, math.sin(k * 2.1) * r), (math.cos(k * 2.1) * r + .03, .1 + r * 1.55, math.sin(k * 2.1) * r), (math.cos(k * 2.1) * r, .1 + r * 1.62, math.sin(k * 2.1) * r + .03), 0xf4f0e8)
    if sg == 4:
        for k in range(2): m.add(puff((.1 + k * .05, .07, .05 - k * .06), .05, .7, lambda ny, q: 0xb08a50, rnd, .2, 0))
    P['cu_papa%d' % sg] = m
for sg in range(1, 5):  # maíz: caña con hojas largas; mazorca con barbas en la etapa 4
    h = .15 + .33 * sg; m = tube([(0, .1, 0), (0, .1 + h, 0)], [.024, .016], 5, lambda t, q: 0x6a9a3a)
    for k in range(2 + sg):
        y = .1 + h * (.3 + .6 * k / (1 + sg)); a = k * 2.6; d = Vector((math.cos(a), 0, math.sin(a)))
        m.tri2((0, y, 0), tuple(Vector((0, y, 0)) + d * .38 + Vector((0, -.08, 0))), tuple(Vector((0, y + .06, 0)) + d * .1), mixc(0x4f7a30, 0x6a9a3a, k / 4))
    if sg == 4:
        m.add(puff((.05, .1 + h * .62, 0), .06, 1.7, lambda ny, q: 0xe8c840 if q > .2 else 0x9aa850, rnd, .1, 0))
        for k in range(4): m.add(log((0, .1 + h, 0), (math.cos(k) * .05, .1 + h + .18, math.sin(k) * .05), .008, 0xc8b060, 3))
    P['cu_maiz%d' % sg] = m

def lin(c): return [round(x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4, 4) for x in srgb(c)]
pal = []; pidx = {}; comp = {}; ntri = 0
for name, m in P.items():
    P16 = bytearray(); CI = bytearray()
    for a, b, c, kk in m.t:
        if kk not in pidx:
            if len(pal) >= 255: kk = min(pal, key=lambda q: sum((x - y) ** 2 for x, y in zip(srgb(q), srgb(kk))))
            else: pidx[kk] = len(pal); pal.append(kk)
        for vv in (a, b, c): P16 += struct.pack('<3h', *[max(-32767, min(32767, round(q * 10000))) for q in vv])
        CI.append(pidx[kk])
    comp[name] = [base64.b64encode(bytes(P16)).decode(), base64.b64encode(bytes(CI)).decode()]; ntri += len(m.t)
js = 'window.MQ3={pal:' + json.dumps([lin(c) for c in pal]) + ',p:' + json.dumps(comp, separators=(',', ':')) + '};'
open(OUT + '.js', 'w').write(js); print('piezas', len(comp), 'triángulos', ntri, 'colores', len(pal), 'js', len(js) // 1024, 'KB')

bpy.ops.wm.read_factory_settings(use_empty=True); sc_ = bpy.context.scene
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
    sc_.collection.objects.link(bpy.data.objects.new(nm, me))
mkobj('te', P['telar'], (-4, 0, 0)); mkobj('bt', P['telar_bt'], (-4, 1.55, -.05)); mkobj('he', P['telar_he'], (-4, 1.12, -.22)); mkobj('sh', P['telar_sh'], (-4, 1.03, .05))
mkobj('pr', P['prensa'], (-1.5, 0, 0)); mkobj('sc', P['prensa_sc'], (-1.5, .55, 0)); mkobj('fu', P['fuelle'], (0, 0, 0)); mkobj('hg', P['fuelle_hg'], (-.34, .2, 0))
mkobj('h', P['hu_cama1'], (3, .6, 0))
for i, x in enumerate((-1.05, -.35, .35, 1.05)):
    mkobj('pa%d' % i, P['cu_papa%d' % (i + 1)], (3 + x, .6, -1.05)); mkobj('ma%d' % i, P['cu_maiz%d' % (i + 1)], (3 + x, .6, .35))
for k in range(16): mkobj('t%d' % k, P['pu_tabla%d' % (k % 3)], (7.5, .5, -2.3 + k * .3))
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc_.collection.objects.link(cam); sc_.camera = cam
cam.data.lens = 30; cam.location = (1.5, -11, 5); cam.rotation_euler = (math.radians(68), 0, 0)
sc_.render.engine = 'BLENDER_WORKBENCH'; sc_.display.shading.light = 'STUDIO'; sc_.display.shading.color_type = 'VERTEX'; sc_.display.shading.show_shadows = True
sc_.render.resolution_x, sc_.render.resolution_y = 1600, 900; sc_.world = bpy.data.worlds.new('w'); sc_.render.filepath = OUT + '.png'; bpy.ops.render.render(write_still=True)
