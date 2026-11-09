# Lugares de la historia low-poly (0.48): avioneta caída, cabaña del guardabosques, mina abandonada y entrada de cueva.
# Misma distribución que el juego (puerta, boca de la mina, fuselaje), así los choques y las notas siguen cuadrando.
import sys
exec(open('/home/claude/juego041/blender/comun.py').read())
OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else '/tmp/lugares'
rnd = random.Random(31)
def var(c, a=.07): return shade(c, 1 - a + 2 * a * rnd.random())
def box(cx, cy, cz, sx, sy, sz, col, rx=0.0, ry=0.0, rz=0.0):
    m = M(); x0, x1, y0, y1, z0, z1 = -sx / 2, sx / 2, -sy / 2, sy / 2, -sz / 2, sz / 2
    def R(p):
        x, y, z = p
        x, y = x * math.cos(rz) - y * math.sin(rz), x * math.sin(rz) + y * math.cos(rz)
        y, z = y * math.cos(rx) - z * math.sin(rx), y * math.sin(rx) + z * math.cos(rx)
        x, z = x * math.cos(ry) + z * math.sin(ry), -x * math.sin(ry) + z * math.cos(ry)
        return (x + cx, y + cy, z + cz)
    F = [((x0, y0, z1), (x1, y0, z1), (x1, y1, z1), (x0, y1, z1), col), ((x1, y0, z0), (x0, y0, z0), (x0, y1, z0), (x1, y1, z0), shade(col, .9)),
         ((x1, y0, z1), (x1, y0, z0), (x1, y1, z0), (x1, y1, z1), shade(col, .95)), ((x0, y0, z0), (x0, y0, z1), (x0, y1, z1), (x0, y1, z0), shade(col, .95)),
         ((x0, y1, z1), (x1, y1, z1), (x1, y1, z0), (x0, y1, z0), shade(col, 1.08)), ((x0, y0, z0), (x1, y0, z0), (x1, y0, z1), (x0, y0, z1), shade(col, .8))]
    for a, b, c, d, k in F: a, b, c, d = R(a), R(b), R(c), R(d); m.tri(a, b, c, k); m.tri(a, c, d, k)
    return m
def log(a, b, r, col, sides=6): return tube([a, ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2), b], [r, r * .97, r * .94], sides, lambda t, q: shade(col, .9 if int(q * sides) % 2 else 1.04))
def rk(r, col, x, y, z, sx=1, sy=1, sz=1, seed=None):
    m = puff((0, 0, 0), r, 1, lambda ny, q: shade(col, .82 + .3 * q + .12 * ny) if not (ny > .55 and q > .55) else shade(0x5d6b3e, .9 + .2 * q), random.Random(seed if seed is not None else rnd.random() * 1e6), .24, 1)
    m.t = [tuple([(v[0] * sx + x, v[1] * sy + y, v[2] * sz + z) for v in t[:3]] + [t[3]]) for t in m.t]; return m
LOG, LOG2, WD, STONE = 0x7a5432, 0x5e3f24, 0x8a6a45, 0x7d7a73
L = {}
# ---------------- avioneta (fuselaje a lo largo de z, nariz +z) ----------------
CH, CH2, AL, RED = 0xb8b2a6, 0x9c968a, 0xc8ccd0, 0xa83a2a
a = M()
for k in range(14):  # mancha quemada en el suelo (polígono irregular)
    t0, t1 = k / 14 * 6.283, (k + 1) / 14 * 6.283; r0, r1 = 5 + rnd.random(), 5 + rnd.random()
    a.tri((0, .03, 0), (math.cos(t1) * r1, .03, math.sin(t1) * r1), (math.cos(t0) * r0, .03, math.sin(t0) * r0), var(0x2a2622, .1))
fus = [(0, .95, -3.2), (0, .97, -1.0), (0, .95, 1.2), (0, .92, 3.2)]
a.add(tube(fus, [.9, .98, .98, .92], 9, lambda t, q: (RED if .42 < q < .58 else CH) if q < .5 else (RED if .42 < q < .58 else CH2)))
a.add(tube([(0, .92, 3.2), (0, .9, 4.4), (0, .85, 5.0)], [.92, .55, .15], 9, lambda t, q: shade(CH, .95)))  # nariz
a.add(tube([(0, .95, -3.2), (0, 1.1, -5.0), (0, 1.25, -6.2)], [.9, .45, .12], 9, lambda t, q: CH2))  # cola
a.add(box(0, 2.0, -5.6, .1, 1.6, 1.3, CH, rz=.08)); a.add(box(0, 2.3, -5.7, .11, .35, 1.1, RED))  # timón
a.add(box(0, 1.25, -5.4, 3.0, .08, .85, CH2))
a.add(box(-3.4, 1.6, .3, 4.8, .14, 1.6, CH, rz=.06)); a.add(box(-5.3, 1.66, .3, .9, .15, 1.6, RED, rz=.06))  # ala izquierda entera
a.add(box(2.6, .9, .5, 2.0, .14, 1.6, CH2, rz=-.4)); a.add(box(3.9, .25, .9, 1.2, .1, 1.3, CH2, rx=.2, ry=.6, rz=-.15))  # ala derecha rota
a.add(box(0, 1.85, 1.6, 1.3, .5, 1.2, 0x2a3a42)); a.add(box(0, 1.82, 2.2, 1.2, .45, .1, 0x9ab8c4, rx=-.5))  # cabina y parabrisas roto
a.add(tube([(0, .9, 5.0), (0, .9, 5.15)], [.12, .1], 6, lambda t, q: 0x2a2a2a))
for ang in (.3, 2.4): a.add(box(math.cos(ang) * .5, .9 + math.sin(ang) * .5, 5.15, .1, 1.0, .05, 0x3a3a3a, rz=ang))  # hélice doblada
a.add(tube([(-1.4, .33, 1.8), (-1.65, .33, 1.8)], [.3, .3], 8, lambda t, q: 0x181818)); a.add(log((-1.4, .7, 1.8), (-1.4, .35, 1.8), .04, 0x4a4540, 5))  # rueda
a.add(tube([(1.6, .2, 1.9), (1.85, .2, 2.0)], [.3, .3], 8, lambda t, q: 0x181818))
for (x, z, s) in ((4.2, -2.8, 1), (-4.5, 3.2, .8), (2.6, -4.5, .7), (-2.0, -3.5, .5)):  # restos
    a.add(box(x, .08, z, 1.2 * s, .05, .8 * s, var(AL, .1), rx=rnd.random() * .3, ry=rnd.random() * 3, rz=rnd.random() * .3))
a.add(box(1.2, .3, -1.6, .6, .45, .4, 0x6a4a2e)); a.add(box(1.25, .56, -1.6, .64, .06, .44, 0x5a3a20))  # maleta
a.add(rk(.4, 0x3a3633, -2.5, .15, -1.8)); a.add(rk(.3, 0x3a3633, 2.2, .1, 3.1))
L['avioneta'] = a
# ---------------- cabaña (4,4 × 3,6 m; puerta en +z al centro) ----------------
c = box(0, -.2, 0, 4.7, .35, 3.9, 0x5a4430).add(box(0, -.01, 0, 4.3, .06, 3.5, 0x8a6a45))
for k in range(4):  # tablas del piso
    c.add(box(0, .025, -1.3 + k * .87, 4.3, .02, .02, 0x6a4a2e))
for k in range(7):
    y = .25 + k * .34; col = var(LOG if k % 2 else LOG2, .05)
    c.add(log((-2.35, y, -1.8), (2.35, y, -1.8), .17, col, 7)); c.add(log((-2.2, y, -1.95), (-2.2, y, 1.95), .17, col, 7)); c.add(log((2.2, y, -1.95), (2.2, y, 1.95), .17, col, 7))
    if k < 6: c.add(log((-2.35, y, 1.8), (-.55, y, 1.8), .17, col, 7)); c.add(log((.55, y, 1.8), (2.35, y, 1.8), .17, col, 7))
    else: c.add(log((-2.35, y, 1.8), (2.35, y, 1.8), .17, col, 7))
    for x in (-2.2, 2.2):
        for z in (-1.8, 1.8): c.add(puff((x + (.2 if x > 0 else -.2), y, z + (.2 if z > 0 else -.2)), .16, 1, lambda ny, q: 0xc8986a, rnd, 0, 0))  # puntas de tronco
for z in (-1.85, 1.85):  # hastiales
    for k, w in enumerate((4.2, 3.0, 1.8, .8)): c.add(box(0, 2.6 + k * .34, z, w, .34, .12, var(LOG2 if k % 2 == 0 else LOG, .05)))
for sg in (-1, 1):  # techo de tejamanil
    c.add(box(sg * 1.3, 3.05, 0, 3.0, .1, 4.8, 0x5e3f24, rz=-sg * .5))
    for r in range(7):
        u = .15 + r * .38
        for k in range(14): c.add(box(sg * (2.6 - u * math.cos(.5)), 2.42 + u * math.sin(.5) + .06, -2.2 + k * .34, .44, .03, .3, var(0x8a6a45, .12), rz=-sg * (.5 + .05)))
c.add(log((0, 3.7, -2.45), (0, 3.7, 2.45), .1, LOG, 6))
for k in range(12): c.add(box(1.6, .2 + k * .34, -1.75, .72, .32, .72, var(STONE if k < 9 else 0x8a877f, .08)))  # chimenea de piedra
c.add(box(1.5, .08, -1.35, 1.0, .15, .7, 0x6f6a63))
# puerta entreabierta, cama, mesa, estante, olla, banco, leñera, huerto y letrero
door = box(-.38, 1.0, 2.2, .9, 1.9, .07, 0x6a4a2e, ry=.9)
c.add(door).add(box(-1.1, .3, -.85, 1.8, .22, .9, LOG)).add(box(-1.1, .46, -.85, 1.7, .12, .8, 0xb8a678)).add(box(-.75, .54, -.85, .9, .05, .82, 0x8a4a3a)).add(box(-1.75, .56, -.85, .4, .1, .5, 0xd8cfb0))
c.add(box(.9, .8, -.55, 1.1, .08, .7, WD))
for x, z in ((.4, -.8), (1.4, -.8), (.4, -.3), (1.4, -.3)): c.add(log((x, 0, z), (x, .78, z), .045, WD, 5))
c.add(box(-.2, 1.55, -1.65, 1.3, .06, .3, WD)); c.add(puff((.1, 1.78, -1.65), .2, 1.1, lambda ny, q: 0xb4673c, rnd, .1, 0)); c.add(puff((-.5, 1.7, -1.65), .12, 1.2, lambda ny, q: 0x3a6a8a, rnd, .05, 0))
c.add(tube([(-.4, 0, .5), (-.4, .4, .5)], [.2, .2], 7, lambda t, q: WD))
for i in range(4):
    for j in range(2): c.add(log((-3.1, .14 + j * .22, -.6 + i * .28 - .65), (-3.1, .14 + j * .22, -.6 + i * .28 + .65), .11, var(LOG2), 6))
c.add(box(-4.3, .03, 2.6, 3.4, .06, 2.2, 0x4a3a28))
for k in range(5):
    for q in range(3): c.add(puff((-5.5 + k * .6, .18, 2.0 + q * .5), .14, .9, lambda ny, rr: 0x5a9a3a if rr > .3 else 0x6aa842, rnd, .2, 0))  # huerto
c.add(log((-5.7, 0, 1.6), (-5.7, .9, 1.6), .04, WD, 4)).add(log((-2.9, 0, 1.6), (-2.9, .9, 1.6), .04, WD, 4))
c.add(box(2.4, .5, 3.1, 1.5, .1, .4, WD)).add(log((1.8, 0, 3.1), (1.8, .5, 3.1), .05, WD, 4)).add(log((3, 0, 3.1), (3, .5, 3.1), .05, WD, 4))
L['cabana'] = c
# ---------------- mina (boca en z=-1,95; rieles hacia +z) ----------------
m = M()
for (r, col, x, y, z, sx, sy, sz) in ((2.6, 0x6f6a63, -3.5, 1.6, -4.5, 1.4, 1, 1.2), (3, 0x7a756c, 3.4, 1.9, -4.4, 1.3, 1.1, 1.2), (3.4, 0x68635b, 0, 3, -6.4, 1.8, 1, 1.2),
        (2.2, 0x77726a, -1.6, 3.5, -3.6, 1, 1.2, 1), (2, 0x706b63, 1.7, 3.6, -3.4, 1, 1.2, 1), (1.8, 0x8a857c, -5.6, 1, -2.2, 1, 1, 1), (1.7, 0x8a857c, 5.7, 1, -2, 1, .9, 1)):
    m.add(rk(r, col, x, y, z, sx, sy, sz))
m.add(log((-1.2, 0, -1.95), (-1.2, 2.7, -1.95), .18, LOG, 7)).add(log((1.2, 0, -1.95), (1.2, 2.7, -1.95), .18, LOG, 7)).add(log((-1.5, 2.75, -1.95), (1.5, 2.75, -1.95), .2, LOG, 7))
m.add(log((-1.2, 1.9, -1.9), (-.4, 2.65, -1.9), .07, LOG2, 5)).add(log((1.2, 1.9, -1.9), (.4, 2.65, -1.9), .07, LOG2, 5))
m.add(box(0, 1.25, -2.3, 2.1, 2.5, .3, 0x070707))
for (r, col, x, y, z, sx, sy, sz) in ((.55, 0x77726a, -.7, .35, -1.4, 1.3, .8, 1), (.6, 0x6f6a63, .2, .45, -1.3, 1.2, 1, 1), (.5, 0x7a756c, .85, .3, -1.5, 1, 1, 1), (.8, 0x6a655d, 0, .9, -1.7, 1.4, 1, 1)):
    m.add(rk(r, col, x, y, z, sx, sy, sz))  # derrumbe en la boca
m.add(box(.2, 1, -1.25, 2.2, .12, .26, LOG2, rz=.5)).add(box(-.2, 1.4, -1.3, 2.0, .12, .26, LOG, rz=-.4))  # tablas cruzadas
for x in (-.4, .4): m.add(box(x, .06, 2.4, .07, .07, 7, 0x5a5652))  # rieles
for k in range(9): m.add(box(0, .03, -1.0 + k * .9, 1.2, .05, .18, var(LOG2)))  # durmientes
m.add(box(0, .7, 4.8, 1.1, .7, 1.6, 0x5a4a40)).add(box(0, 1.05, 4.8, 1.2, .1, 1.7, 0x3a322c))  # vagoneta
for x in (-.55, .55):
    for z in (4.3, 5.3): m.add(tube([(x, .3, z), (x * 1.2, .3, z)], [.2, .2], 8, lambda t, q: 0x222222))
for k in range(6): m.add(rk(.15, 0x9a6a3a if k % 2 else 0x7a7068, (k % 3 - 1) * .3, 1.12, 4.6 + (k // 3) * .4, seed=k))  # mineral en la vagoneta
m.add(log((-2.6, 0, 1.4), (-2.6, 1.5, 1.4), .05, WD, 5)).add(log((-1.2, 0, 1.4), (-1.2, 1.5, 1.4), .05, WD, 5)).add(box(-1.9, 1.3, 1.4, 1.7, .5, .06, WD))  # letrero
m.add(box(-1.9, 1.3, 1.44, 1.3, .08, .01, 0x2a2018)).add(box(-1.9, 1.15, 1.44, 1.0, .06, .01, 0x2a2018))
m.add(log((1.8, 0, .2), (1.8, 1.6, .2), .04, WD, 4)).add(puff((1.8, 1.65, .2), .08, 1, lambda ny, q: 0xffc060, rnd, 0, 0))  # farol
m.add(rk(.25, 0x77726a, 2.2, .15, 2.2)).add(rk(.3, 0x6f6a63, -3, .18, 3))
L['mina'] = m
# ---------------- entrada de cueva ----------------
cv = M()
for (r, col, x, y, z, sx, sy, sz) in ((2.8, 0x6f6a63, -3.6, 1.7, -3, 1.5, 1, 1.3), (3, 0x7a756c, 3.7, 1.9, -3.2, 1.4, 1.1, 1.3), (3.6, 0x68635b, 0, 3.1, -6, 1.9, 1, 1.3),
        (2.4, 0x77726a, -1.5, 3.7, -3, 1.1, 1.1, 1), (2.2, 0x706b63, 1.6, 3.8, -2.9, 1.1, 1.1, 1), (1.5, 0x8a857c, -5.8, .8, -1.2, 1, 1, 1), (1.4, 0x8a857c, 5.9, .8, -1, 1, .9, 1)):
    cv.add(rk(r, col, x, y, z, sx, sy, sz))
cv.add(box(-1.35, 1.3, -2.15, .5, 2.6, .9, 0x5e5852, rz=.06)).add(box(1.35, 1.3, -2.15, .5, 2.6, .9, 0x5e5852, rz=-.06)).add(box(0, 2.8, -2.2, 3.2, .6, .9, 0x5a544e)).add(box(0, 1.25, -2.4, 2.2, 2.5, .3, 0x030303))
for k in range(8):  # musgo y helechos en la boca
    x = -1.6 + k * .45; cv.tri2((x, 2.55, -1.75), (x + .2, 2.55, -1.75), (x + .1, 2.1 - rnd.random() * .4, -1.7), 0x4a7a34)
cv.add(rk(.5, 0x77726a, -.7, .3, -.5, 1.2, .8, 1)).add(rk(.35, 0x6f6a63, 1.1, .2, .4))
L['cueva'] = cv

def lin(c): return [round(x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4, 4) for x in srgb(c)]
pal = []; pidx = {}; comp = {}; ntri = 0
for name, mm in L.items():
    P16 = bytearray(); CI = bytearray()
    for a_, b_, c_, kk in mm.t:
        if kk not in pidx:
            if len(pal) >= 255: kk = min(pal, key=lambda q: sum((x - y) ** 2 for x, y in zip(srgb(q), srgb(kk))))
            else: pidx[kk] = len(pal); pal.append(kk)
        for vv in (a_, b_, c_): P16 += struct.pack('<3h', *[max(-32767, min(32767, round(q * 1000))) for q in vv])
        CI.append(pidx[kk])
    comp[name] = [base64.b64encode(bytes(P16)).decode(), base64.b64encode(bytes(CI)).decode()]; ntri += len(mm.t)
js = 'window.PL2={pal:' + json.dumps([lin(c) for c in pal]) + ',p:' + json.dumps(comp, separators=(',', ':')) + '};'
open(OUT + '.js', 'w').write(js); print('lugares', len(comp), 'triángulos', ntri, 'colores', len(pal), 'js', len(js) // 1024, 'KB')

bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
def mkobj(nm, mm, off):
    me = bpy.data.meshes.new(nm); bm = bmesh.new(); cl = bm.loops.layers.color.new('col')
    for a_, b_, c_, kk in mm.t:
        try: f = bm.faces.new([bm.verts.new((v[0] + off[0], -(v[2] + off[2]), v[1] + off[1])) for v in (a_, b_, c_)])
        except ValueError: continue
        cc = srgb(kk)
        for l in f.loops: l[cl] = (cc[0], cc[1], cc[2], 1)
    bm.to_mesh(me); bm.free()
    try: me.color_attributes.active_color = me.color_attributes['col']
    except Exception: pass
    sc.collection.objects.link(bpy.data.objects.new(nm, me))
for k, x in (('avioneta', -15), ('cabana', -3), ('mina', 8), ('cueva', 20)): mkobj(k, L[k], (x, 0, 0))
gm = bpy.data.meshes.new('suelo'); bm = bmesh.new(); bmesh.ops.create_grid(bm, x_segments=1, y_segments=1, size=40); bm.to_mesh(gm); bm.free(); sc.collection.objects.link(bpy.data.objects.new('suelo', gm))
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = 26; cam.location = (2, -30, 13); cam.rotation_euler = (math.radians(66), 0, 0)
sc.render.engine = 'BLENDER_WORKBENCH'; sc.display.shading.light = 'STUDIO'; sc.display.shading.color_type = 'VERTEX'; sc.display.shading.show_shadows = True
sc.render.resolution_x, sc.render.resolution_y = 1800, 900; sc.world = bpy.data.worlds.new('w'); sc.render.filepath = OUT + '.png'; bpy.ops.render.render(write_still=True)
