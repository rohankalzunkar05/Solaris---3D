"""Read-only audit for the saved Blender source and its live atlas collection."""
import bpy
import json
import subprocess
from pathlib import Path

path = Path(bpy.data.filepath)
assert path.name.lower() == "solarsystem.blend"
collection = bpy.data.collections["SOLARIS · Orbital atlas"]
expected = set("""sun mercury venus earth mars jupiter saturn uranus neptune ceres pluto
haumea makemake eris moon phobos deimos io europa ganymede callisto enceladus titan
titania oberon triton charon saturn-rings asteroid-belt""".split())
assert {o.name for o in collection.objects} == expected
# Blender disallows linking its currently open file as a library. Read the saved
# version in an independent background process, without resetting the live scene.
probe = "import bpy,json; print('SOLARIS_AUDIT='+json.dumps({'objects':list(bpy.data.objects.keys()),'images':[i.name for i in bpy.data.images if i.packed_file],'collections':list(bpy.data.collections.keys())}))"
audit = subprocess.run([bpy.app.binary_path, "--background", "--disable-autoexec", str(path),
                        "--python-exit-code", "1", "--python-expr", probe],
                       capture_output=True, text=True, timeout=90, check=True)
disk = json.loads(next(line.split("=",1)[1] for line in audit.stdout.splitlines() if line.startswith("SOLARIS_AUDIT=")))
assert expected <= set(disk["objects"])
assert {"SOLARIS · Orbital atlas","SOLARIS · Studio"} <= set(disk["collections"])
assert len(disk["images"]) >= 11
for obj in collection.objects:
    assert obj.type == "MESH" and len(obj.data.polygons) and obj.data.materials
packed = [img.name for img in bpy.data.images if img.packed_file]
assert len(packed) >= 11
result = {"savedFile": str(path), "savedBytes": path.stat().st_size,
          "verifiedSavedMeshNames": len(expected), "packedImages": packed,
          "sceneCamera": bpy.context.scene.camera.name,
          "exportBytes": (path.parent / "web/public/models/solaris.glb").stat().st_size}


