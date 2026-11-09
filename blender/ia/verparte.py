import bpy,bmesh,json,math,sys
k=sys.argv[-1]; D=json.load(open('ia_partes.json'))[k]
bpy.ops.wm.read_factory_settings(use_empty=True); sc=bpy.context.scene
me=bpy.data.meshes.new(k); bm=bmesh.new(); cl=bm.loops.layers.color.new('col')
for t in D:
    vs=[bm.verts.new((v[0],-v[2],v[1])) for v in t[:3]]
    try: f=bm.faces.new(vs)
    except ValueError: continue
    for l in f.loops: l[cl]=(*t[3],1)
bm.to_mesh(me); me.color_attributes.active_color=me.color_attributes['col']
ob=bpy.data.objects.new(k,me); sc.collection.objects.link(ob)
cam=bpy.data.objects.new('c',bpy.data.cameras.new('c')); sc.collection.objects.link(cam); sc.camera=cam
cam.data.type='ORTHO'; cam.data.ortho_scale=.6
sc.render.engine='BLENDER_WORKBENCH'; sc.display.shading.color_type='VERTEX'; sc.display.shading.light='FLAT'; sc.display.shading.show_backface_culling=True
sc.render.resolution_x=sc.render.resolution_y=500
cy=sum(v[1] for t in D for v in t[:3])/len(D)/3
out=[]
for i,a in enumerate([0,90,180]):
    r=math.radians(a); cam.location=(math.sin(r)*3,-math.cos(r)*3,cy); cam.rotation_euler=(math.radians(90),0,r)
    sc.render.filepath=f'/tmp/claude-0/-home-claude/b25e8c7e-e5e4-5cb8-9275-bbae2cd15096/scratchpad/p{i}.png'; bpy.ops.render.render(write_still=True)
