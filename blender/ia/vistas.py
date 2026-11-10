import bpy, math, sys
bpy.ops.wm.open_mainfile(filepath='/home/claude/juego041/blender/ia/hombre40k.blend')
sc = bpy.context.scene; sc.render.engine = 'BLENDER_WORKBENCH'; sc.display.shading.light = 'STUDIO'; sc.display.shading.color_type = 'TEXTURE'
sc.display.shading.show_xray = False
cam = bpy.data.objects.new('c', bpy.data.cameras.new('c')); sc.collection.objects.link(cam); sc.camera = cam; cam.data.type = 'ORTHO'
OUT = '/home/claude/juego041/blender/ia/anatomia/'
def shot(name, loc, rot, scale, cz, res=(1200, 1200), cx=0, cy=0):
    cam.data.ortho_scale = scale; cam.location = loc; cam.rotation_euler = rot
    sc.render.resolution_x, sc.render.resolution_y = res; sc.render.filepath = OUT + name + '.png'; bpy.ops.render.render(write_still=True)
r = math.radians
# cuerpo entero frente/lado, 2 m de alto en 1200 px → 600 px por metro; centro z .95
shot('frente', (0, -5, .95), (r(90), 0, 0), 2.0, .95)
shot('lado', (5, 0, .95), (r(90), 0, r(90)), 2.0, .95)
shot('arriba', (0, 0, 5), (0, 0, 0), 2.0, 0)
# acercamientos: brazo derecho desde el frente (x .1-.95, z 1.25-1.7), piernas de lado, cabeza de lado, pie
shot('brazo', (.52, -5, 1.47), (r(90), 0, 0), .9, 1.47, (1200, 600))
shot('brazo_arriba', (.52, .03, 5), (0, 0, 0), .9, 0, (1200, 600))
shot('cabeza_lado', (5, .02, 1.66), (r(90), 0, r(90)), .5, 1.66)
shot('cabeza_frente', (0, -5, 1.66), (r(90), 0, 0), .5, 1.66)
shot('pierna_lado', (5, .05, .5), (r(90), 0, r(90)), 1.1, .5)
shot('pierna_frente', (.15, -5, .5), (r(90), 0, 0), 1.1, .5)
shot('pie_lado', (5, 0, .12), (r(90), 0, r(90)), .45, .12)
shot('cadera_frente', (0, -5, .98), (r(90), 0, 0), .6, .98)
shot('cadera_lado', (5, .03, .98), (r(90), 0, r(90)), .6, .98)
shot('hombro_frente', (.15, -5, 1.48), (r(90), 0, 0), .5, 1.48)
