"""Run inside the existing Solarsystem.blend via the Blender Lab MCP bridge."""
import bpy
import bmesh
import math
import random
from pathlib import Path
from mathutils import Vector, noise

root = Path(bpy.data.filepath).parent
assert Path(bpy.data.filepath).name.lower() == "solarsystem.blend"
output = root / "web/public/models/solaris.glb"
output.parent.mkdir(parents=True, exist_ok=True)
rng = random.Random(742)
scene = bpy.context.scene
name = "SOLARIS · Orbital atlas"
collection = bpy.data.collections.get(name)
if collection:
    for obj in list(collection.objects):
        previous_mesh = obj.data
        bpy.data.objects.remove(obj, do_unlink=True)
        if isinstance(previous_mesh, bpy.types.Mesh) and previous_mesh.users == 0:
            bpy.data.meshes.remove(previous_mesh)
else:
    collection = bpy.data.collections.new(name)
    scene.collection.children.link(collection)

# Keep the starter objects available without displaying the cube in the atlas.
if bpy.data.objects.get("Cube"):
    bpy.data.objects["Cube"].hide_viewport = True
    bpy.data.objects["Cube"].hide_render = True

def organize(obj, key):
    obj.name = key
    obj.data.name = key + " geometry"
    for old in list(obj.users_collection):
        old.objects.unlink(obj)
    collection.objects.link(obj)
    return obj

def material(key, color, painted=False):
    mat = bpy.data.materials.get("SOLARIS / " + key) or bpy.data.materials.new("SOLARIS / " + key)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    nodes.clear()
    output_node = nodes.new("ShaderNodeOutputMaterial")
    shader = nodes.new("ShaderNodeBsdfPrincipled")
    links = mat.node_tree.links
    links.new(shader.outputs["BSDF"], output_node.inputs["Surface"])
    shader.inputs["Roughness"].default_value = 0.94
    shader.inputs["Base Color"].default_value = (*color, 1)
    path = root / "art/textures" / (key + ".jpg")
    if path.exists():
        img = bpy.data.images.load(str(path), check_existing=True)
        img.pack()
        node = nodes.new("ShaderNodeTexImage")
        node.image = img
        links.new(node.outputs["Color"], shader.inputs["Base Color"])
        if key == "sun":
            links.new(node.outputs["Color"], shader.inputs["Emission Color"])
            shader.inputs["Emission Strength"].default_value = 1.8
    elif painted:
        node = nodes.new("ShaderNodeVertexColor")
        node.layer_name = "Surface"
        links.new(node.outputs["Color"], shader.inputs["Base Color"])
    return mat

def paint(obj, values):
    attr = obj.data.color_attributes.new(name="Surface", type="FLOAT_COLOR", domain="POINT")
    for item, rgb in zip(attr.data, values):
        item.color = (*rgb, 1)

def sphere(key, radius, pos, color=(0.44, 0.4, 0.32), stretch=(1, 1, 1)):
    textured = (root / "art/textures" / (key + ".jpg")).exists()
    bpy.ops.mesh.primitive_uv_sphere_add(segments=80 if textured else 40, ring_count=40 if textured else 24,
                                          radius=radius, location=pos)
    obj = organize(bpy.context.object, key)
    if not textured:
        colors = []
        offset = rng.random() * 83
        for v in obj.data.vertices:
            n = v.co.normalized()
            terrain = noise.fractal(n * 5 + Vector((offset, 2, 0)), 1, 2, 4)
            colors.append([max(0.015, min(1, c * (0.78 + terrain * 0.52))) for c in color])
            v.co *= 1 + terrain * 0.013
            for axis in range(3):
                v.co[axis] *= stretch[axis]
        paint(obj, colors)
    for face in obj.data.polygons:
        face.use_smooth = True
    obj.data.materials.append(material(key, color, not textured))
    return obj

# Distances/radii and initial angles are composed for exploration, in Blender units.
spec = [("sun",0,2.45,0),("mercury",4,0.31,19),("venus",6.1,.53,137),
        ("earth",8.5,.58,314),("mars",11,.43,212),("jupiter",16,1.48,27),
        ("saturn",21,1.19,151),("uranus",26,.85,247),("neptune",31,.84,329),
        ("ceres",13.1,.23,94),("pluto",35,.30,62),("haumea",38,.25,201),
        ("makemake",41,.28,295),("eris",44,.29,132)]
positions = {}
radii = {}
for key, distance, radius, deg in spec:
    angle = math.radians(deg)
    pos = (math.cos(angle)*distance, math.sin(angle)*distance, 0)
    positions[key], radii[key] = pos, radius
    sphere(key, radius, pos, (.61,.40,.29) if key in ["pluto","makemake"] else (.51,.49,.45),
           (1.42,.84,.73) if key=="haumea" else (1,1,1))
moons = {"earth":["moon"], "mars":["phobos","deimos"], "jupiter":["io","europa","ganymede","callisto"],
         "saturn":["enceladus","titan"], "uranus":["titania","oberon"], "neptune":["triton"], "pluto":["charon"]}
for parent, names in moons.items():
    for index, key in enumerate(names):
        orbit = radii[parent] * (2.6 + index * .84)
        angle = index * 2.35 + 1
        x,y,z = positions[parent]
        rgb = {"io":(.83,.55,.15), "titan":(.72,.38,.12),"europa":(.71,.62,.46),
               "enceladus":(.84,.87,.9)}.get(key,(.44,.42,.39))
        obj = sphere(key, max(.055, radii[parent]*(.26 if parent=="earth" else .13)),
                     (x+orbit*math.cos(angle), y+orbit*math.sin(angle),z), rgb,
                     (1.4,.85,.75) if parent=="mars" else (1,1,1))
        obj["parentBody"], obj["moonOrbit"] = parent, orbit

def mesh_object(key, vertices, faces):
    mesh = bpy.data.meshes.new(key)
    mesh.from_pydata(vertices, [], faces)
    mesh.update()
    obj = bpy.data.objects.new(key, mesh)
    collection.objects.link(obj)
    return organize(obj, key)

# The radial image carries both color and opacity, including the Cassini Division.
vertices, faces = [], []
segments = 192
for radius in (radii["saturn"]*1.15, radii["saturn"]*2.32):
    for k in range(segments):
        angle = math.tau*k/segments
        vertices.append((math.cos(angle)*radius, math.sin(angle)*radius, 0))
for k in range(segments):
    n = (k+1) % segments
    faces.append((k, segments+k, segments+n, n))
rings = mesh_object("saturn-rings", vertices, faces)
rings.location = positions["saturn"]
rings.rotation_euler[0] = math.radians(26.7)
uvs = rings.data.uv_layers.new(name="Radial profile")
for loop in rings.data.loops:
    uvs.data[loop.index].uv = (float(loop.vertex_index >= segments), .5)
ring_mat = material("saturn-rings", (1,1,1))
image_node = ring_mat.node_tree.nodes.new("ShaderNodeTexImage")
image_node.image = bpy.data.images.load(str(root/"art/textures/saturn-rings.png"), check_existing=True)
image_node.image.pack()
image_node.extension = "EXTEND"
shader = ring_mat.node_tree.nodes.get("Principled BSDF")
ring_mat.node_tree.links.new(image_node.outputs["Color"], shader.inputs["Base Color"])
ring_mat.node_tree.links.new(image_node.outputs["Alpha"], shader.inputs["Alpha"])
ring_mat.surface_render_method = "BLENDED"
rings.data.materials.append(ring_mat)

# Batch irregular low-poly rocks into a single mesh and draw call.
template = bmesh.new()
bmesh.ops.create_icosphere(template, subdivisions=1, radius=1)
template.verts.index_update()
directions = [v.co.copy() for v in template.verts]
facets = [[v.index for v in f.verts] for f in template.faces]
template.free()
vertices, faces, colors = [], [], []
for _ in range(680):
    angle = rng.random()*math.tau
    radius = rng.uniform(12.3,14.45)
    center = Vector((math.cos(angle)*radius,math.sin(angle)*radius,rng.gauss(0,.16)))
    size = rng.uniform(.019,.065)
    start = len(vertices)
    gray = rng.uniform(.045,.21)
    stretch = rng.uniform(.63,1.4)
    for direction in directions:
        v = direction*size*rng.uniform(.7,1.27)
        v.x *= stretch
        vertices.append(center + v)
        colors.append((gray,gray*.84,gray*.73))
    faces.extend([[start+idx for idx in f] for f in facets])
belt = mesh_object("asteroid-belt",vertices,faces)
paint(belt,colors)
belt.data.materials.append(material("asteroid-belt",(1,1,1),True))

bpy.ops.object.select_all(action="DESELECT")
for obj in collection.objects:
    obj.select_set(True)
bpy.context.view_layer.objects.active = collection.objects.get("sun")
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == "VIEW_3D":
            area.spaces.active.region_3d.view_distance = 65
            area.spaces.active.region_3d.view_location = (0,0,0)
result_export = bpy.ops.export_scene.gltf(filepath=str(output), export_format="GLB", use_selection=True,
                                          export_extras=True, export_yup=True)
assert "FINISHED" in result_export
# The source file has its own overview camera and lighting for Blender renders.
rig_name = "SOLARIS · Studio"
rig = bpy.data.collections.get(rig_name)
if rig is None:
    rig = bpy.data.collections.new(rig_name)
    scene.collection.children.link(rig)
def rig_object(key, data):
    obj = bpy.data.objects.get(key)
    if obj is None:
        obj = bpy.data.objects.new(key, data)
        rig.objects.link(obj)
    return obj

cam_name = "SOLARIS overview camera"
cam = rig_object(cam_name, bpy.data.cameras.get(cam_name) or bpy.data.cameras.new(cam_name))
cam.location = (5,-71,43)
cam.rotation_euler = (-cam.location).to_track_quat("-Z","Y").to_euler()
cam.data.type = "ORTHO"
cam.data.ortho_scale = 94
scene.camera = cam
light_name = "SOLARIS solar illumination"
lamp = rig_object(light_name, bpy.data.lights.get(light_name) or bpy.data.lights.new(light_name,"POINT"))
lamp.location = (0,0,0)
lamp.data.energy = 22000
lamp.data.color = (1,.89,.72)
lamp.data.use_shadow = False
for screen in bpy.data.screens:
    for area in screen.areas:
        if area.type == "VIEW_3D":
            space = area.spaces.active
            space.region_3d.view_rotation = cam.rotation_euler.to_quaternion()
            space.shading.color_type = "TEXTURE"
            space.overlay.show_floor = False
            space.overlay.show_axis_x = False
            space.overlay.show_axis_y = False
bpy.ops.object.select_all(action="DESELECT")
# Preserve the pre-existing backup. Restore the user's preference immediately.
prefs = bpy.context.preferences.filepaths
prior = prefs.save_version
try:
    prefs.save_version = 0
    bpy.ops.wm.save_as_mainfile(filepath=bpy.data.filepath)
finally:
    prefs.save_version = prior
result = {"file":bpy.data.filepath, "objects":sorted(o.name for o in collection.objects),
          "exportBytes":output.stat().st_size, "packedImages":sum(bool(i.packed_file) for i in bpy.data.images)}


