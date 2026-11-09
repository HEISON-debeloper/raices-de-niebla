# Herramientas, objetos del suelo y fogata low-poly (0.47). Herramientas: mismo marco que el juego (mango a lo largo de +y,
# agarre cerca de y=0, filo/cabeza hacia +z). Objetos del suelo: apoyados en y=0.
import sys
exec(open('/home/claude/juego041/blender/comun.py').read())
OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else '/tmp/herramientas'
rnd = random.Random(77)
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
    return orient(m, lambda g: (cx, cy, cz))
def rod(a, b, r0, r1, col, sides=6): return tube([a, ((a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2), b], [r0, (r0 + r1) / 2, r1], sides, lambda t, q: shade(col, .9 if int(q * sides) % 2 else 1.04))
def wrap(y, r, col, n=3):  # amarre de cuerda en espiral
    m = M()
    for k in range(n): m.add(rod((0, y + k * .025 - .01, 0), (0, y + k * .025 + .012, 0), r * 1.18, r * 1.18, col, 6))
    return m
def blade(pts, thick, col, edge):  # hoja plana con filo claro: pts = contorno en el plano yz (x = grosor)
    m = M(); n = len(pts); cy = sum(p[0] for p in pts) / n; cz = sum(p[1] for p in pts) / n
    for i in range(n):
        a, b = pts[i], pts[(i + 1) % n]
        m.tri((thick, cy, cz), (thick, a[0], a[1]), (thick, b[0], b[1]), col); m.tri((-thick, cy, cz), (-thick, b[0], b[1]), (-thick, a[0], a[1]), shade(col, .92))
        m.tri((thick, a[0], a[1]), (-thick, a[0], a[1]), (-thick, b[0], b[1]), edge); m.tri((thick, a[0], a[1]), (-thick, b[0], b[1]), (thick, b[0], b[1]), edge)
    return orient(m, lambda g: (0, cy, cz))
def rock_head(c, r, col, sx=1, sy=1, sz=1, seed=1):
    rr = random.Random(seed); m = puff(c, r, 1, lambda ny, q: shade(col, .85 + .25 * q + .1 * ny), rr, .25, 0)
    m.t = [tuple([tuple((c[0] + (v[0] - c[0]) * sx, c[1] + (v[1] - c[1]) * sy, c[2] + (v[2] - c[2]) * sz)) for v in t[:3]] + [t[3]]) for t in m.t]; return m
WOOD, WOODD, CORD, LEATHER = 0x8a6038, 0x6a4626, 0xc2a868, 0x8b6a48
STONE, FLINT, IRON, IRONB, BRIGHT = 0x8a877f, 0x2e3238, 0x8e98a2, 0xc8d0d8, 0xe8ecf0
T = {}
def handle(L=.7, y0=-.13, r=.022): return rod((0, y0, 0), (0, y0 + L, 0), r * 1.15, r, WOOD, 6)
T['hacha'] = handle().add(rock_head((0, .55, .06), .1, STONE, .45, .75, 1.2, 3)).add(blade([(.48, .12), (.62, .12), (.66, .23), (.44, .23)], .012, 0xb8b4a8, 0xe0dcd0)).add(wrap(.48, .03, CORD))
T['hacha_f'] = handle().add(rock_head((0, .55, .06), .1, FLINT, .45, .75, 1.2, 4)).add(blade([(.48, .12), (.62, .12), (.67, .24), (.43, .24)], .01, 0x3a4048, 0x8a96a2)).add(wrap(.48, .03, CORD))
T['hacha_h'] = rod((0, -.14, 0), (0, .58, 0), .026, .022, WOODD, 6).add(box(0, .56, .02, .05, .1, .14, IRON)).add(blade([(.46, .08), (.66, .08), (.72, .27), (.4, .27)], .013, IRON, BRIGHT))
T['lanza'] = rod((0, -.25, 0), (0, 1.22, 0), .018, .016, WOOD, 6).add(wrap(1.18, .02, CORD, 3)).add(blade([(1.22, -.04), (1.25, .04), (1.42, 0)], .012, STONE, 0xb0aca0)) if False else \
    rod((0, -.25, 0), (0, 1.22, 0), .018, .016, WOOD, 6).add(wrap(1.17, .02, CORD, 3)).add(rock_head((0, 1.32, 0), .045, STONE, .5, 2.2, 1, 5))
T['lanza_h'] = rod((0, -.25, 0), (0, 1.22, 0), .018, .016, WOODD, 6).add(box(0, 1.22, 0, .04, .06, .04, IRON)).add(blade([(1.25, -.05), (1.25, .05), (1.46, 0)], .012, IRON, BRIGHT))
T['martillo'] = handle(.5, -.13, .022).add(rock_head((0, .4, 0), .085, STONE, 1.7, 1.0, 1.0, 6)).add(wrap(.36, .028, CORD))
T['cuchillo'] = rod((0, -.03, 0), (0, .1, 0), .018, .02, WOODD, 6).add(wrap(.04, .02, CORD, 2)).add(blade([(.1, -.022), (.1, .022), (.22, .018), (.28, 0)], .008, 0xb8b4a8, 0xe8e4dc))
T['palo'] = rod((0, -.13, 0), (0, .57, .01), .026, .018, WOOD, 6).add(rod((0, .2, 0), (.02, .27, .07), .01, .005, WOOD, 4))
T['garrote'] = rod((0, -.1, 0), (0, .38, 0), .022, .028, WOOD, 6).add(tube([(0, .36, 0), (0, .5, 0), (0, .64, 0)], [.04, .062, .05], 7, lambda t, q: shade(WOODD, .9 if int(q * 7) % 2 else 1.05)))
for k in range(5): T['garrote'].add(box(math.cos(k * 1.3) * .055, .44 + k * .04, math.sin(k * 1.3) * .055, .015, .015, .015, 0x5a5a5a))  # clavos
bo = puff((0, .02, 0), .045, 1, lambda ny, q: shade(0x7a7068, .9 + .2 * q), rnd, .15, 0)
bo.add(rod((0, .02, 0), (.12, .3, 0), .006, .006, CORD, 4)).add(puff((.12, .3, 0), .04, 1, lambda ny, q: shade(0x7a7068, .9 + .2 * q), rnd, .15, 0))
bo.add(rod((0, .02, 0), (-.1, .27, .05), .006, .006, CORD, 4)).add(puff((-.1, .27, .05), .04, 1, lambda ny, q: shade(0x6a6058, .9 + .2 * q), rnd, .15, 0))
T['boleadoras'] = bo
# arco: tubo curvo con empuñadura de cuero y cuerda
pts = [(0, .45 * math.sin(-1 + k / 6) + .1, .32 * math.cos(-1 + k / 6) - .24) for k in range(13)]
ar = tube(pts, [.012 + .006 * math.cos((k - 6) / 6 * 1.4) for k in range(13)], 6, lambda t, q: WOOD)
ar.add(tube(pts[5:8], [.017, .018, .017], 6, lambda t, q: LEATHER)); ar.add(rod(pts[0], pts[-1], .003, .003, 0xe8dfc8, 3)); T['arco'] = ar
T['ballesta'] = box(0, .18, 0, .05, .55, .06, WOOD).add(box(0, .42, .0, .5, .035, .04, WOODD)).add(rod((-.24, .4, 0), (.24, .4, 0), .003, .003, CORD, 3)).add(box(0, .08, .04, .02, .06, .03, IRON))
T['honda'] = rod((0, -.08, 0), (0, .28, 0), .005, .005, CORD, 4).add(puff((0, .32, 0), .04, .6, lambda ny, q: LEATHER, rnd, .1, 0)).add(puff((0, .34, 0), .025, 1, lambda ny, q: STONE, rnd, .2, 0))
T['pala'] = rod((0, -.13, 0), (0, .55, 0), .022, .02, WOOD, 6).add(blade([(.52, -.08), (.52, .08), (.72, .085), (.8, 0), (.72, -.085)], .014, 0x9a7048, 0xb8946a))
pb = blade([(.52, -.08), (.52, .08), (.72, .085), (.8, 0), (.72, -.085)], .014, 0x9a7048, 0xb8946a); pb.t = [tuple([(v[2], v[1], v[0]) for v in t[:3]][i] for i in range(3)) + (t[3],) for t in pb.t]
T['pala'] = rod((0, -.13, 0), (0, .55, 0), .022, .02, WOOD, 6).add(pb)
T['azada'] = handle().add(rock_head((0, .55, .09), .07, STONE, .5, .8, 1.6, 8)).add(wrap(.5, .028, CORD))
ho = rod((0, -.06, 0), (0, .16, 0), .018, .02, WOODD, 6)
for k in range(9):  # hoja curva de la hoz
    a0, a1 = k / 9 * 3.2, (k + 1) / 9 * 3.2; r0, r1 = .12, .12
    p0 = (0, .16 + math.sin(a0) * r0, .12 - math.cos(a0) * r0); p1 = (0, .16 + math.sin(a1) * r1, .12 - math.cos(a1) * r1); w = .02 * (1 - k / 10)
    ho.tri((.006, p0[1], p0[2]), (.006, p1[1], p1[2]), (.006, p1[1] - w, p1[2] + w * .3), 0xb8b4a8); ho.tri((-.006, p0[1], p0[2]), (-.006, p1[1] - w, p1[2] + w * .3), (-.006, p1[1], p1[2]), 0xa8a498)
T['hoz'] = ho
T['pico'] = handle().add(tube([(0, .58, -.22), (0, .6, 0), (0, .58, .22)], [.012, .03, .012], 6, lambda t, q: IRON)).add(box(0, .57, 0, .05, .06, .06, IRONB))
T['pico_f'] = handle().add(tube([(0, .58, -.19), (0, .6, 0), (0, .58, .19)], [.012, .028, .012], 6, lambda t, q: FLINT)).add(wrap(.53, .028, CORD))
T['_gen'] = rod((0, -.1, 0), (0, .35, 0), .02, .018, WOOD, 6).add(box(0, .38, 0, .06, .08, .06, STONE))

# objetos del suelo (y=0 es el suelo)
I = {}
I['rama'] = rod((0, .04, -.45), (0, .04, .45), .033, .022, WOOD, 5).add(rod((0, .045, .05), (.12, .05, .22), .016, .008, WOOD, 4)).add(puff((.12, .06, .22), .05, .5, lambda ny, q: 0x5a8f3c, rnd, .2, 0))
I['piedra'] = rock_head((0, .05, 0), .13, STONE, 1, .65, 1.2, 11)
fb = M()
for k in range(11):  # cabuya: roseta de hojas largas
    a = k * 2.4; el = .35 + .12 * (k % 3); L = 1.3 + .2 * (k % 2); d = Vector((math.cos(a) * math.cos(el + .5), math.sin(el + .5), math.sin(a) * math.cos(el + .5)))
    s = d.cross(Vector((0, 1, 0))).normalized() * .07; b = Vector((math.cos(a) * .05, .05, math.sin(a) * .05)); mid = b + d * L * .45; tip = b + d * L
    c = [0x5f8a52, 0x6f9a5a, 0x557e48][k % 3]
    fb.tri2(tuple(b), tuple(mid + s), tuple(mid - s), shade(c, .9)); fb.tri2(tuple(mid + s), tuple(tip), tuple(mid - s), c)
fb.add(puff((0, .25, 0), .12, 1.6, lambda ny, q: 0x7aa860, rnd, .1, 0)); I['fibra'] = fb
hj = M()
for k in range(3):  # hoja grande de plátano/bijao en el suelo
    a = k * 2.1; ca, sa = math.cos(a), math.sin(a)
    for i in range(4):
        u0, u1 = i / 4, (i + 1) / 4; w0, w1 = .12 * math.sin(math.pi * max(.1, u0)), .12 * math.sin(math.pi * u1)
        def P(u, w): x, z = u * .45, w; return (x * ca - z * sa, .02 + .01 * k, x * sa + z * ca)
        hj.tri2(P(u0, 0), P(u1, 0), P(u1, w1), 0x4f8a3a); hj.tri2(P(u0, 0), P(u0, w0), P(u1, w1), 0x5a9a42)
        hj.tri2(P(u0, 0), P(u1, -w1), P(u1, 0), 0x46803a); hj.tri2(P(u0, 0), P(u0, -w0), P(u1, -w1), 0x4f8a3a)
I['hoja'] = hj
mt = rod((0, 0, 0), (0, .32, 0), .01, .008, 0x5a7a40, 4)
for k in range(6):
    a = k * 1.1; y = .1 + k * .035; d = (math.cos(a) * .13, y + .03, math.sin(a) * .13); s = (-math.sin(a) * .045, 0, math.cos(a) * .045)
    mt.tri2((0, y, 0), (d[0] + s[0], d[1], d[2] + s[2]), (d[0] - s[0], d[1], d[2] - s[2]), [0x4a9a52, 0x5aaa5a, 0x3f8a48][k % 3])
I['matico'] = mt
gd = tube([(0, .06, -.8), (0, .06, 0), (0, .06, .8)], [.06, .06, .058], 7, lambda t, q: shade(0x9db35a, .92 if int(q * 7) % 2 else 1.05))
for z in (-.5, -.1, .3, .7): gd.add(tube([(0, .06, z - .02), (0, .06, z + .02)], [.066, .066], 7, lambda t, q: 0x7a8f40))
I['guadua'] = gd
I['arcilla'] = puff((0, .02, 0), .3, .4, lambda ny, q: shade(0xb4673c, .9 + .2 * q), rnd, .2, 1).add(puff((.24, .02, .1), .16, .5, lambda ny, q: 0xc4764a, rnd, .2, 0)).add(puff((-.2, .02, -.15), .12, .5, lambda ny, q: 0xa65a34, rnd, .2, 0))
pl = rod((0, .02, -.2), (0, .03, .22), .006, .003, 0xe8e2d0, 3)
for i in range(6):
    z = -.12 + i * .06; w = .05 * math.sin(math.pi * (i + 1) / 7)
    pl.tri2((0, .025, z), (w, .02, z + .06), (0, .025, z + .06), 0xd8d2c0); pl.tri2((0, .025, z), (-w, .02, z + .06), (0, .025, z + .06), 0xc9c3b0)
I['pluma'] = pl
# fogata: anillo de piedras y leña cruzada
fo = M()
for k in range(8):
    a = k / 8 * 6.283; fo.add(rock_head((math.cos(a) * .4, .06, math.sin(a) * .4), .12, STONE, 1.1, .7, 1, 20 + k))
for k in range(4):
    a = k / 4 * 6.283 + .4; fo.add(rod((math.cos(a) * .32, .02, math.sin(a) * .32), (math.cos(a) * -.05, .26, math.sin(a) * -.05), .045, .035, WOODD, 5))
fo.add(tube([(0, .005, 0), (0, .01, 0)], [.3, .3], 10, lambda t, q: 0x2a1e16))  # ceniza
I['fogata'] = fo

def lin(c): return [round(x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4, 4) for x in srgb(c)]
pal = []; pidx = {}; comp = {}; ntri = 0
for name, m in list(('t_' + k, v) for k, v in T.items()) + list(('i_' + k, v) for k, v in I.items()):
    P16 = bytearray(); CI = bytearray()
    for a, b, c, kk in m.t:
        if kk not in pidx:
            if len(pal) >= 255: kk = min(pal, key=lambda q: sum((x - y) ** 2 for x, y in zip(srgb(q), srgb(kk))))
            else: pidx[kk] = len(pal); pal.append(kk)
        for vv in (a, b, c): P16 += struct.pack('<3h', *[max(-32767, min(32767, round(q * 10000))) for q in vv])
        CI.append(pidx[kk])
    comp[name] = [base64.b64encode(bytes(P16)).decode(), base64.b64encode(bytes(CI)).decode()]; ntri += len(m.t)
js = 'window.TL2={pal:' + json.dumps([lin(c) for c in pal]) + ',p:' + json.dumps(comp, separators=(',', ':')) + '};'
open(OUT + '.js', 'w').write(js); print('modelos', len(comp), 'triángulos', ntri, 'colores', len(pal), 'js', len(js) // 1024, 'KB')

bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
def mkobj(nm, m, off, s=1.0):
    me = bpy.data.meshes.new(nm); bm = bmesh.new(); cl = bm.loops.layers.color.new('col')
    for a, b, c, kk in m.t:
        try: f = bm.faces.new([bm.verts.new((v[0] * s + off[0], -(v[2] * s + off[2]), v[1] * s + off[1])) for v in (a, b, c)])
        except ValueError: continue
        cc = srgb(kk)
        for l in f.loops: l[cl] = (cc[0], cc[1], cc[2], 1)
    bm.to_mesh(me); bm.free()
    try: me.color_attributes.active_color = me.color_attributes['col']
    except Exception: pass
    ob = bpy.data.objects.new(nm, me); ob.rotation_euler = (0, 0, math.radians(90)); sc.collection.objects.link(ob); return ob
for i, k in enumerate(T):  # herramientas de pie, de perfil (filo hacia la cámara de lado)
    o = mkobj(k, T[k], (0, 0, 0)); o.location = ((i % 9) * .55 - 2.2, 0, 1.35 - (i // 9) * 1.5)
for i, k in enumerate(I):
    o = mkobj(k, I[k], (0, 0, 0)); o.rotation_euler = (0, 0, 0); o.location = (i * 1.0 - 3.5, -1.5, -1.6)
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = 32; cam.location = (0, -6.5, .5); cam.rotation_euler = (math.radians(88), 0, 0)
sc.render.engine = 'BLENDER_WORKBENCH'; sc.display.shading.light = 'STUDIO'; sc.display.shading.color_type = 'VERTEX'
sc.render.resolution_x, sc.render.resolution_y = 1600, 1000; sc.world = bpy.data.worlds.new('w'); sc.render.filepath = OUT + '.png'; bpy.ops.render.render(write_still=True)
