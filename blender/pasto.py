# Pasto y helechos low-poly (0.50). Pasto: 3 matas en tonos de gris (el juego las tiñe con el color del terreno), hojas
# curvas de 3 tramos, más oscuras abajo y claras en la punta, algunas con espiga. Helechos: 3 variantes con frondas
# pinnadas (folíolos en zigzag), verde oscuro en el centro a verde claro en la punta y la punta enrollada.
import sys
exec(open('/home/claude/juego041/blender/comun.py').read())
OUT = sys.argv[sys.argv.index('--') + 1] if '--' in sys.argv else '/tmp/pasto'
def gray(v): v = max(0, min(255, int(v * 160))); return (v << 16) | (v << 8) | v
G = {}
for vv in range(3):
    rnd = random.Random(4100 + vv * 13); m = M(); nb = 10 + vv
    for k in range(nb):
        a = rnd.random() * 6.283; r = rnd.random() * .22; x0, z0 = math.cos(a) * r, math.sin(a) * r
        h = .32 + .44 * rnd.random(); w = .028 + .018 * rnd.random(); la = rnd.random() * 6.283; le = .12 + .3 * rnd.random()
        d = Vector((math.cos(la), 0, math.sin(la))); s = Vector((-d.z, 0, d.x)) * w; base = Vector((x0, 0, z0)); pts = []
        for i in range(4):
            t = i / 3; pts.append(base + d * (le * t * t) + Vector((0, h * (1 - (1 - t) ** 1.6), 0)))
        for i in range(3):
            t0, t1 = i / 3, (i + 1) / 3; w0, w1 = 1 - t0 * .75, 1 - t1 * .75 if i < 2 else 0
            a0, b0, a1, b1 = pts[i] + s * w0, pts[i] - s * w0, pts[i + 1] + s * w1, pts[i + 1] - s * w1
            c = gray(.58 + .62 * (t0 + t1) / 2 + (rnd.random() - .5) * .08)
            if i < 2: m.tri(a0, b0, a1, c); m.tri(b0, b1, a1, c)
            else: m.tri(a0, b0, a1, c)
        if k % 5 == 0:  # espiga
            tip = pts[-1]; top = tip + Vector((d.x * .05, .12, d.z * .05))
            for q in range(3): m.tri(tip + Vector(((q - 1) * .015, 0, 0)), top + Vector(((q - 1) * .02, -.02 * q, 0)), tip + Vector(((q - 1) * .015 + .02, .04, 0)), gray(1.45))
    G['grass_%d' % vv] = m
for vv in range(3):
    rnd = random.Random(4200 + vv * 17); m = M(); nf = 6 + vv
    c0, c1 = 0x2f5a26, 0x74a646
    for k in range(nf):
        ph = k / nf * 6.283 + rnd.random() * .4; el = .8 + .45 * rnd.random(); L = .6 + .35 * rnd.random()
        h = Vector((math.cos(ph), 0, math.sin(ph))); s = Vector((-h.z, 0, h.x)); d = (h * math.cos(el) + Vector((0, math.sin(el), 0))).normalized()
        p = Vector((0, .02, 0)); sp = [p.copy()]; ns = 6
        for i in range(ns):
            d = (d + Vector((0, -.32, 0))).normalized(); p = p + d * (L / ns); sp.append(p.copy())
        tip = sp[-1] + (sp[-1] - sp[-2]) * .3 + Vector((0, .04, 0)); sp.append(tip)  # punta enrollada hacia arriba
        for i in range(len(sp) - 1):  # raquis
            m.tri(sp[i] + s * .008, sp[i] - s * .008, sp[i + 1], mixc(0x3a5a22, 0x5a7a32, i / ns))
        for i in range(1, ns):  # folíolos alternos
            t = i / ns; w = .17 * math.sin(math.pi * max(.12, t)) ** .8
            for sg in (1, -1):
                a = sp[i]; b = sp[i] + (sp[i + 1] - sp[i]) * .9; leaf = a + (s * sg + (sp[i + 1] - sp[i]).normalized() * .35) * w + Vector((0, -.03, 0))
                m.tri(a, b, leaf, mixc(c0, c1, t * .8 + .1 * rnd.random()))
    G['fern_%d' % vv] = m
def lin(c): return [round(x / 12.92 if x <= .04045 else ((x + .055) / 1.055) ** 2.4, 4) for x in srgb(c)]
pal = []; pidx = {}; comp = {}; ntri = 0
for name, mm in G.items():
    P16 = bytearray(); CI = bytearray()
    for a, b, c, kk in mm.t:
        if kk not in pidx: pidx[kk] = len(pal); pal.append(kk)
        for vv in (a, b, c): P16 += struct.pack('<3h', *[max(-32767, min(32767, round(q * 10000))) for q in vv])
        CI.append(pidx[kk])
    comp[name] = [base64.b64encode(bytes(P16)).decode(), base64.b64encode(bytes(CI)).decode()]; ntri += len(mm.t)
# el pasto lleva brillo en gris > 1 (lineal) igual que antes: se guarda el valor como factor y no como color sRGB
palL = [([round(((q >> 16) & 255) / 160, 3)] * 3 if (q >> 16) == ((q >> 8) & 255) == (q & 255) else lin(q)) for q in pal]
js = 'window.GR2={pal:' + json.dumps(palL) + ',p:' + json.dumps(comp, separators=(',', ':')) + '};'
open(OUT + '.js', 'w').write(js); print('modelos', len(comp), 'triángulos', ntri, 'colores', len(pal), 'js', len(js) // 1024, 'KB', {k: len(v.t) for k, v in G.items()})
bpy.ops.wm.read_factory_settings(use_empty=True); sc = bpy.context.scene
def mkobj(nm, mm, off, tint=None):
    me = bpy.data.meshes.new(nm); bm = bmesh.new(); cl = bm.loops.layers.color.new('col')
    for a, b, c, kk in mm.t:
        try: f = bm.faces.new([bm.verts.new((v[0] * 2 + off[0], -(v[2] * 2 + off[2]), v[1] * 2 + off[1])) for v in (a, b, c)])
        except ValueError: continue
        cc = srgb(kk)
        if tint: cc = (cc[0] * tint[0] * 1.6, cc[1] * tint[1] * 1.6, cc[2] * tint[2] * 1.6)
        for l in f.loops: l[cl] = (min(1, cc[0]), min(1, cc[1]), min(1, cc[2]), 1)
    bm.to_mesh(me); bm.free()
    try: me.color_attributes.active_color = me.color_attributes['col']
    except Exception: pass
    sc.collection.objects.link(bpy.data.objects.new(nm, me))
for i in range(3): mkobj('g%d' % i, G['grass_%d' % i], (i * 1.3 - 3.2, 0, 0), (.45, .7, .25)); mkobj('f%d' % i, G['fern_%d' % i], (i * 1.6 + .9, 0, 0))
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.data.lens = 40; cam.location = (0, -6, 2.2); cam.rotation_euler = (math.radians(75), 0, 0)
sc.render.engine = 'BLENDER_WORKBENCH'; sc.display.shading.light = 'STUDIO'; sc.display.shading.color_type = 'VERTEX'
sc.render.resolution_x, sc.render.resolution_y = 1400, 700; sc.world = bpy.data.worlds.new('w'); sc.render.filepath = OUT + '.png'; bpy.ops.render.render(write_still=True)
