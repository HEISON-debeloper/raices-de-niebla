# Mide la malla del modelo con cortes cada 1 cm y ubica cada articulación sobre la anatomía (coordenadas de Blender:
# x = derecha del personaje (+), y = profundidad (frente = -y), z = altura, suelo = 0). Salida: anatomia/medidas.json
import bpy, numpy as np, json
bpy.ops.wm.open_mainfile(filepath='/home/claude/juego041/blender/ia/hombre40k.blend')
o = [x for x in bpy.data.objects if x.type == 'MESH'][0]; me = o.data
V = np.array([v.co[:] for v in me.vertices]); E = np.array([e.vertices[:] for e in me.edges])
def cut(axis, val, sel=None):
    """puntos donde las aristas cruzan el plano axis=val (contorno exacto del corte)"""
    a = V[E[:, 0], axis] - val; b = V[E[:, 1], axis] - val; m = (a * b) < 0
    if sel is not None: m &= sel(V[E[:, 0]]) & sel(V[E[:, 1]])
    t = (a[m] / (a[m] - b[m]))[:, None]; return V[E[m, 0]] + (V[E[m, 1]] - V[E[m, 0]]) * t
def stats(P, ax2):
    if len(P) < 8: return None
    q = P[:, ax2]; c = (q.max(0) + q.min(0)) / 2; ext = q.max(0) - q.min(0)
    return dict(c=c.tolist(), ext=ext.tolist(), n=len(P))
R = {}
# ---- pierna derecha: cortes horizontales ----
leg = []
for z in np.arange(.01, .93, .01):
    P = cut(2, z, lambda p: p[:, 0] > .015); s = stats(P, [0, 1])
    if s: leg.append((round(z, 3), s))
R['pierna'] = leg
W = np.array([s['ext'][0] for _, s in leg]); D = np.array([s['ext'][1] for _, s in leg]); Z = np.array([z for z, _ in leg])
def argmin_in(arr, lo, hi): m = (Z >= lo) & (Z <= hi); i = np.argmin(np.where(m, arr, 9)); return i
ia = argmin_in(W + D, .06, .22); ik = argmin_in(W, .45, .66)
R['tobillo'] = dict(z=Z[ia], c=leg[ia][1]['c']); R['rodilla'] = dict(z=Z[ik], c=leg[ik][1]['c'])
# ---- pie: corte vertical por el eje del pie ----
fp = V[(V[:, 0] > .05) & (V[:, 2] < .09)]
R['pie'] = dict(talon_y=float(fp[:, 1].max()), punta_y=float(fp[:, 1].min()), x=float((fp[:, 0].min() + fp[:, 0].max()) / 2), ancho=float(fp[:, 0].max() - fp[:, 0].min()))
# ---- tronco: cortes horizontales sin brazos ----
tr = []
for z in np.arange(.85, 1.91, .01):
    P = cut(2, z, lambda p: np.abs(p[:, 0]) < (.16 if z > 1.3 else .3)); s = stats(P, [0, 1])
    if s: s['yback'] = float(P[:, 1].max()); s['yfront'] = float(P[:, 1].min()); tr.append((round(z, 3), s))
R['tronco'] = tr
# entrepierna: primera altura (desde abajo) donde el corte central x≈0 toca piel
cr = [z for z in np.arange(.75, 1.0, .005) if len(cut(2, z, lambda p: np.abs(p[:, 0]) < .012)) >= 2]
R['entrepierna'] = float(min(cr)) if cr else None
# cuello: corte más angosto entre 1.5 y 1.72 (ancho x)
nz = [(z, s) for z, s in tr if 1.5 <= z <= 1.72]; nk = min(nz, key=lambda t: t[1]['ext'][0]); R['cuello_angosto'] = dict(z=nk[0], c=nk[1]['c'], ext=nk[1]['ext'])
# barbilla: punto más bajo de la cara al frente (y < -.04) por encima del cuello
face = V[(V[:, 2] > 1.55) & (V[:, 2] < 1.75) & (np.abs(V[:, 0]) < .03)]; fr = face[face[:, 1] < face[:, 1].min() + .03]
R['barbilla_z'] = float(V[(np.abs(V[:, 0]) < .02) & (V[:, 1] < -.03) & (V[:, 2] > 1.55) & (V[:, 2] < 1.75)][:, 2].min())
R['cabeza_top'] = float(V[:, 2].max())
# orejas: punto más ancho de la cabeza (x) entre 1.65 y 1.85
hz = [(z, s) for z, s in tr if 1.65 <= z <= 1.86]; ear = max(hz, key=lambda t: t[1]['ext'][0]); R['cabeza_ancha'] = dict(z=ear[0], c=ear[1]['c'], ext=ear[1]['ext'])
# ---- brazo derecho (pose T): cortes verticales a lo largo de x ----
arm = []
for x in np.arange(.15, .93, .01):
    P = cut(0, x, lambda p: p[:, 2] > 1.3); s = stats(P, [1, 2])
    if s: arm.append((round(x, 3), s))
R['brazo'] = arm
AX = np.array([x for x, _ in arm]); AH = np.array([s['ext'][1] for _, s in arm]); AD = np.array([s['ext'][0] for _, s in arm])
def amin(arr, lo, hi): m = (AX >= lo) & (AX <= hi); return int(np.argmin(np.where(m, arr, 9)))
ie = amin(AH + AD, .38, .52); iw = amin(AH + AD, .6, .74)
R['codo'] = dict(x=AX[ie], c=arm[ie][1]['c']); R['muneca'] = dict(x=AX[iw], c=arm[iw][1]['c'])
# hombro: acromion = punto más alto del hombro; axila = donde el corte vertical deja de tocar el tronco
sh = V[(V[:, 0] > .14) & (V[:, 0] < .3) & (V[:, 2] > 1.35)]; acr = sh[np.argmax(sh[:, 2])]
R['acromion'] = acr.tolist()
ax_ = [x for x, s in arm if s['ext'][1] < .16]; R['axila_x'] = float(min(ax_)) if ax_ else None
json.dump(R, open('/home/claude/juego041/blender/ia/anatomia/medidas.json', 'w'), indent=0, default=float)
print('tobillo', R['tobillo'], '\nrodilla', R['rodilla'], '\nentrepierna', R['entrepierna'], '\ncuello', R['cuello_angosto'], '\nbarbilla', R['barbilla_z'], 'top', R['cabeza_top'],
      '\ncabeza ancha', R['cabeza_ancha'], '\ncodo', R['codo'], '\nmuñeca', R['muneca'], '\nacromion', R['acromion'], 'axila x', R['axila_x'], '\npie', R['pie'])
