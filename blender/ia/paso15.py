# reduce todo el cuerpo de una vez (sin bordes abiertos la reducción queda pareja) y la cabeza aparte, más fina
import bpy
bpy.ops.wm.open_mainfile(filepath='/home/claude/juego041/blender/ia/hombre40k.blend')
o=[x for x in bpy.data.objects if x.type=='MESH'][0]; bpy.context.view_layer.objects.active=o
print('antes',len(o.data.polygons))
for nom,sel,r in [('cuerpo',lambda v:v.co.z<1.62,.426),('cabeza',lambda v:v.co.z>=1.62,.675)]:
    g=o.vertex_groups.new(name=nom); g.add([v.index for v in o.data.vertices if sel(v)],1,'REPLACE')
    d=o.modifiers.new('d','DECIMATE'); d.ratio=r; d.vertex_group=nom; d.vertex_group_factor=1
    bpy.ops.object.modifier_apply(modifier='d'); print(nom,len(o.data.polygons))
bpy.ops.wm.save_as_mainfile(filepath='/home/claude/juego041/blender/ia/hombre-red.blend')
