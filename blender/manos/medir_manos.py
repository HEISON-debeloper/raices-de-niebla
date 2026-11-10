import bpy, numpy as np
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath='manos.glb')
o=[x for x in bpy.data.objects if x.type=='MESH'][0]; me=o.data; Mw=np.array(o.matrix_world)
V=np.array([v.co[:] for v in me.vertices]); V=(np.c_[V,np.ones(len(V))]@Mw.T)[:,:3]; E=np.array([e.vertices[:] for e in me.edges])
def cut(axis,val,sel=None):
    a=V[E[:,0],axis]-val;b=V[E[:,1],axis]-val;m=(a*b)<0
    if sel is not None: m&=sel(V[E[:,0]])&sel(V[E[:,1]])
    t=(a[m]/(a[m]-b[m]))[:,None];return V[E[m,0]]+(V[E[m,1]]-V[E[m,0]])*t
for x in np.arange(.42,.0,-.01):
    P=cut(0,x,lambda p:p[:,0]>0)
    if len(P)==0: print(round(x,3),'-');continue
    z=np.sort(P[:,2]);gaps=np.where(np.diff(z)>.008)[0];edges=np.split(z,gaps+1)
    cl=[]
    for g in edges:
        m=(P[:,2]>=g.min()-1e-6)&(P[:,2]<=g.max()+1e-6);q=P[m]
        cl.append('z[%.3f,%.3f] y[%.3f,%.3f]'%(g.min(),g.max(),q[:,1].min(),q[:,1].max()))
    print(round(x,3),len(edges),' | '.join(cl))
print('extremos x>0: min x',V[V[:,0]>0][:,0].min(),'max z',V[V[:,0]>0][:,2].max(), 'en x',V[V[:,0]>0][np.argmax(V[V[:,0]>0][:,2])][0])
