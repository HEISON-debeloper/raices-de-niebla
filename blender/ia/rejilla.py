# Dibuja rejilla métrica sobre las vistas ortográficas (cada 1 cm fina, cada 5 cm marcada con su valor)
from PIL import Image, ImageDraw
import sys
D = '/home/claude/juego041/blender/ia/anatomia/'
# nombre: (eje horizontal, centro h, eje vertical, centro v, escala ortográfica)
V = {'frente': ('x', 0, 'z', .95, 2.0), 'lado': ('y', 0, 'z', .95, 2.0), 'brazo': ('x', .52, 'z', 1.47, .9), 'brazo_arriba': ('x', .52, 'y', .03, .9),
     'cabeza_lado': ('y', .02, 'z', 1.66, .5), 'cabeza_frente': ('x', 0, 'z', 1.66, .5), 'pierna_lado': ('y', .05, 'z', .5, 1.1), 'pierna_frente': ('x', .15, 'z', .5, 1.1),
     'pie_lado': ('y', 0, 'z', .12, .45), 'cadera_frente': ('x', 0, 'z', .98, .6), 'cadera_lado': ('y', .03, 'z', .98, .6), 'hombro_frente': ('x', .15, 'z', 1.48, .5)}
for n, (ha, hc, va, vc, s) in V.items():
    im = Image.open(D + n + '.png').convert('RGB'); W, H = im.size; ppm = max(W, H) / s; d = ImageDraw.Draw(im, 'RGBA')
    X = lambda u: W / 2 + (u - hc) * ppm; Y = lambda v: H / 2 - (v - vc) * ppm
    step = .01 if s <= 1.1 else .05
    import math
    u = math.floor((hc - W / 2 / ppm) / step) * step
    while u < hc + W / 2 / ppm:
        big = abs(round(u / .05) * .05 - u) < 1e-6 if step == .01 else abs(round(u / .1) * .1 - u) < 1e-6
        d.line((X(u), 0, X(u), H), (255, 0, 0, 110 if big else 35)); 
        if big: d.text((X(u) + 2, 2), '%s%.2f' % (ha, u), (200, 0, 0))
        u += step
    v = math.floor((vc - H / 2 / ppm) / step) * step
    while v < vc + H / 2 / ppm:
        big = abs(round(v / .05) * .05 - v) < 1e-6 if step == .01 else abs(round(v / .1) * .1 - v) < 1e-6
        d.line((0, Y(v), W, Y(v)), (0, 0, 255, 110 if big else 35))
        if big: d.text((2, Y(v) + 1), '%s%.2f' % (va, v), (0, 0, 200))
        v += step
    im.save(D + n + '_r.png')
