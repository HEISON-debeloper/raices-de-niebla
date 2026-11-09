# Corta el modelo de la app 3D en las piezas del esqueleto del juego, endereza piernas, baja el brazo de la pose T,
# reduce cada pieza a su presupuesto de triángulos y da a cada triángulo el color de la textura → ia_partes.json
import bpy, bmesh, numpy as np, json, math
from mathutils import Vector
bpy.ops.wm.open_mainfile(filepath='/home/claude/juego041/blender/ia/hombre-red.blend')
o=[x for x in bpy.data.objects if x.type=='MESH'][0]; me=o.data
img=bpy.data.images[0]; W,H=img.size; PX=np.array(img.pixels[:],dtype=np.float32).reshape(H,W,4)[:,:,:3]
def g(z):  # altura del modelo → altura del juego (continua por tramos, articulaciones alineadas)
    return float(np.interp(z,[0,.10,.60,.95,1.467,1.59,1.65,1.907],[-.03,.02,.46,.9,1.48,1.565,1.64,1.885]))
YC=.025
import os; SINTAPA=os.environ.get('SINTAPA','').split(',')
V=np.array([v.co[:] for v in me.vertices])
# centro de la pierna derecha por altura (para enderezar el compás de las piernas)
leg=V[(V[:,0]>.02)&(V[:,2]<.95)]
hs=np.linspace(0,.95,40); cx=[]
for h in hs:
    s=leg[np.abs(leg[:,2]-h)<.03]; cx.append((s[:,0].min()+s[:,0].max())/2 if len(s) else .1)
cx=np.array(cx); legx=lambda z: float(np.interp(z,hs,cx))
# cada pieza = el modelo recortado con planos (corte limpio) y luego tapado: [(punto, normal hacia lo que se descarta)]
CUT={'up':[((.225,0,0),(-1,0,0)),((.44,0,0),(1,0,0)),((0,0,1.35),(0,0,-1)),((0,0,1.6),(0,0,1))],
     'torso':[((0,0,1.03),(0,0,-1)),((0,0,1.58),(0,0,1)),((.225,0,0),(1,0,0)),((-.225,0,0),(-1,0,0))],
     'neck':[((0,0,1.58),(0,0,-1)),((0,0,1.645),(0,0,1)),((.12,0,0),(1,0,0)),((-.12,0,0),(-1,0,0))],
     'head':[((0,0,1.645),(0,0,-1))],
     'hips':[((0,0,.88),(0,0,-1)),((0,0,1.03),(0,0,1))],
     'thigh':[((0,0,.6),(0,0,-1)),((0,0,.88),(0,0,1)),((0,0,0),(-1,0,0))],
     'shin':[((0,0,.10),(0,0,-1)),((0,0,.6),(0,0,1)),((0,0,0),(-1,0,0))],
     'foot_bare':[((0,0,.10),(0,0,1)),((0,0,0),(-1,0,0))]}
J={'hips':(0,.95),'torso':(0,1.03),'neck':(0,1.58),'head':(0,1.64),'thigh':(.092,.9),'shin':(.092,.46),'foot_bare':(.092,.02)}
def to_local(p,k):
    x,y,z=p
    if k=='up':  # brazo en T → colgando: a lo largo del brazo pasa a -y; arriba del brazo pasa a afuera (+x)
        return ((z-1.467), -(x-.19)*1.25, -(y-.03))
    if k in('thigh','shin','foot_bare'): x=x-legx(min(z,.95))
    jx,jy=J[k]; return (x if k not in('thigh','shin','foot_bare') else x, g(z)-jy, -(y-YC))
BUD={'head':2200,'torso':1700,'hips':520,'neck':160,'up':420,'thigh':520,'shin':420,'foot_bare':300}
uv=me.uv_layers.active.data
out={}
bm0=bmesh.new(); bm0.from_mesh(me)
for k in BUD:
    bm=bm0.copy(); uvl=bm.loops.layers.uv.active
    for co,no in CUT[k]:
        bmesh.ops.bisect_plane(bm,geom=bm.verts[:]+bm.edges[:]+bm.faces[:],plane_co=co,plane_no=no,clear_outer=True)
    if k in('hips','torso','thigh'):  # bajo el bóxer el modelo trae otra capa de piel: se quita (caras con color de piel tapadas por la tela)
        uvl=bm.loops.layers.uv.active; mala=[]
        for f in bm.faces:
            if f.calc_center_median().z>1.11: continue
            u=sum((l[uvl].uv for l in f.loops),Vector((0,0)))/len(f.loops); c=PX[min(H-1,int(u.y*H)),min(W-1,int(u.x*W))]
            if c.max()-c.min()>.12 and f.calc_center_median().z>.885: mala.append(f)
        bmesh.ops.delete(bm,geom=mala,context='FACES'); print(k,'piel interior quitada',len(mala))
    bmesh.ops.triangulate(bm,faces=bm.faces[:])
    m2=bpy.data.meshes.new(k); bm.to_mesh(m2); bm.free()
    ob=bpy.data.objects.new(k,m2); bpy.context.scene.collection.objects.link(ob)
    m2=ob.data; bm=bmesh.new(); bm.from_mesh(m2)
    tl=bm.faces.layers.int.new('tapa'); antes=set(bm.faces)
    if k not in SINTAPA: bmesh.ops.holes_fill(bm,edges=[e for e in bm.edges if e.is_boundary],sides=0)
    nuevas=[f for f in bm.faces if f not in antes]
    for f in nuevas: f[tl]=1
    bmesh.ops.triangulate(bm,faces=nuevas,quad_method='BEAUTY',ngon_method='BEAUTY')
    bm.to_mesh(m2); bm.free(); uvd=m2.uv_layers.active.data
    tris=[]; tap=m2.attributes.get('tapa')
    m2.calc_loop_triangles(); cs_all=[]
    for t in m2.loop_triangles:
        pts=[m2.vertices[i].co for i in t.vertices]
        us=[uvd[l].uv for l in t.loops]; samp=[(sum(u[0] for u in us)/3,sum(u[1] for u in us)/3)]+[(u[0],u[1]) for u in us]
        c=np.mean([PX[min(H-1,max(0,int(v*H))),min(W-1,max(0,int(u*W)))] for u,v in samp],0)
        isT=bool(tap and tap.data[t.polygon_index].value)
        if not isT: cs_all.append(c)
        tris.append(([to_local(tuple(p),k) for p in pts],c,isT))
    avg=np.mean(cs_all,0)
    tris=[[[round(q,4) for q in v] for v in L]+[[float(round(min(1,x*1.08),4)) for x in (avg if T else c)]] for L,c,T in tris]
    out[k]=tris; print(k,len(tris))
json.dump(out,open('/home/claude/juego041/blender/ia/ia_partes.json','w'))
