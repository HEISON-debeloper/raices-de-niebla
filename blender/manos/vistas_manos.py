import bpy, math, numpy as np
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath='manos.glb')
sc=bpy.context.scene;sc.render.engine='BLENDER_WORKBENCH';sc.display.shading.color_type='TEXTURE';sc.display.shading.light='STUDIO'
cam=bpy.data.objects.new('c',bpy.data.cameras.new('c'));sc.collection.objects.link(cam);sc.camera=cam;cam.data.type='ORTHO'
def shot(n,loc,rot,s,res=(1400,700)):
    cam.location=loc;cam.rotation_euler=rot;cam.data.ortho_scale=s;sc.render.resolution_x,sc.render.resolution_y=res;sc.render.filepath='/home/claude/juego041/blender/manos/'+n+'.png';bpy.ops.render.render(write_still=True)
r=math.radians
# mano de la derecha (x>0): frente (cámara en -y), atrás (+y), arriba (+z)
shot('d_frente',(.45,-5,.175),(r(90),0,0),.7)
shot('d_atras',(.45,5,.175),(r(90),0,r(180)),.7)
shot('d_arriba',(.45,0,5),(0,0,0),.7)
