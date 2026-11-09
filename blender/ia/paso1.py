# Importa el modelo de la app 3D, lo reduce a 40 mil caras y guarda .blend; imprime perfil de ancho por altura
import bpy, numpy as np, time
t=time.time()
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath='hombre.glb')
o=[x for x in bpy.data.objects if x.type=='MESH'][0]
bpy.context.view_layer.objects.active=o; o.select_set(True)
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
m=o.modifiers.new('d','DECIMATE'); m.ratio=40000/len(o.data.polygons)
bpy.ops.object.modifier_apply(modifier='d')
print('caras',len(o.data.polygons),round(time.time()-t),'s')
v=np.array([p.co[:] for p in o.data.vertices]); print('min',v.min(0).round(3),'max',v.max(0).round(3))
z0,z1=v[:,2].min(),v[:,2].max()
for h in np.linspace(z0,z1,40):
    s=v[np.abs(v[:,2]-h)<.02]
    if len(s): print(round(h,3),'x',s[:,0].min().round(3),s[:,0].max().round(3),'y',s[:,1].min().round(3),s[:,1].max().round(3))
bpy.ops.wm.save_as_mainfile(filepath='/home/claude/juego041/blender/ia/hombre40k.blend')
