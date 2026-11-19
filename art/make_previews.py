"""Prepare small UI portraits from the same source maps used by the Blender scene."""
from pathlib import Path
import math
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

root = Path(__file__).resolve().parents[1]
out = root / "web/public/images"
out.mkdir(parents=True, exist_ok=True)
size = 224
y,x = np.mgrid[-1:1:complex(size),-1:1:complex(size)]
z = np.sqrt(np.maximum(0,1-x*x-y*y))
mask = x*x+y*y <= 1
light = np.clip(-.60*x - .31*y + .73*z, 0, 1)
for path in (root/"art/textures").glob("*.jpg"):
    if path.stem == "clouds":
        continue
    texture = np.asarray(Image.open(path).convert("RGB"))
    h,w = texture.shape[:2]
    u = ((.53+np.arctan2(x,z)/(2*math.pi))%1*w).astype(int)
    v = np.minimum(h-1, ((.5+np.arcsin(y)/math.pi)*h).astype(int))
    rgb = texture[v,u].astype(float)
    if path.stem == "earth":
        cloud = np.asarray(Image.open(root/"art/textures/clouds.jpg").convert("L").resize((w,h)))[v,u,None]/255
        rgb = rgb*(1-cloud*.82)+240*cloud*.82
    diffuse = (.25+.75*light) if path.stem=="sun" else (.08+.92*light**.72)
    pixels = np.dstack((np.clip(rgb*diffuse[:,:,None]*1.2,0,255),mask*255)).astype("uint8")
    Image.fromarray(pixels).save(out/(path.stem+".webp"),quality=88)
# A static, seeded deep-sky backdrop keeps the introduction lightweight.
rng = np.random.default_rng(73)
w,h = 1900,1140
Y,X = np.mgrid[0:h,0:w]
density = np.zeros((h,w))
for n,weight in ((7,.48),(18,.26),(40,.16),(100,.10)):
    field = Image.fromarray(rng.integers(0,255,(n,2*n),dtype=np.uint8)).resize((w,h),Image.Resampling.BICUBIC)
    density += np.asarray(field)/255*weight
band = np.exp(-((Y-(h*.66-X*.18 + 80*np.sin(X/w*4)))/190)**2)
mist = np.maximum(0,density-.22)**1.8*band
base = np.zeros((h,w,3))+[7,9,14]
base += mist[:,:,None]*np.array([106,99,114])
base += np.exp(-(((X/w-.76)/.34)**2+((Y/h-.45)/.43)**2))[:,:,None]*[6,5,4]
im=Image.fromarray(np.uint8(np.clip(base,0,255)))
draw=ImageDraw.Draw(im)
for i in range(3900):
    sx,sy=int(rng.uniform(0,w)),int(rng.uniform(0,h))
    intensity = int(rng.uniform(31,150))
    if rng.random()<.09:
        draw.ellipse((sx,sy,sx+1,sy+1),fill=(intensity,intensity,min(255,intensity+10)))
    else:
        draw.point((sx,sy),fill=(intensity,intensity,min(255,intensity+12)))
for _ in range(24):
    sx,sy=int(rng.uniform(0,w)),int(rng.uniform(0,h))
    draw.line((sx-2,sy,sx+2,sy), fill=(85,88,91))
    draw.line((sx,sy-2,sx,sy+2), fill=(75,80,86))
    draw.point((sx,sy),fill=(220,222,220))
im.save(out/"starfield.webp",quality=87)


# Project the exported vertex-painted meshes for dwarf and moon entries. Keep the
# illustrative relief and color visible without starting another WebGL canvas.
import json
import struct

glb = (root / "web/public/models/solaris.glb").read_bytes()
json_size = struct.unpack_from("<I", glb, 12)[0]
gltf = json.loads(glb[20:20 + json_size])
binary = memoryview(glb)[28 + json_size:]
def read_accessor(index):
    info = gltf["accessors"][index]
    view = gltf["bufferViews"][info["bufferView"]]
    dtype = np.dtype({5121:"u1",5123:"<u2",5125:"<u4",5126:"<f4"}[info["componentType"]])
    cols = {"VEC4":4,"VEC3":3,"SCALAR":1}[info["type"]]
    start = view.get("byteOffset",0) + info.get("byteOffset",0)
    arr = np.ndarray((info["count"],cols),dtype=dtype,buffer=binary,offset=start,
                     strides=(view.get("byteStride",cols*dtype.itemsize),dtype.itemsize))
    return arr / np.iinfo(dtype).max if info.get("normalized") else arr

for node in gltf["nodes"]:
    key = node["name"]
    if key in {"asteroid-belt","saturn-rings"} or (root / "art/textures" / (key+".jpg")).exists():
        continue
    primitive = gltf["meshes"][node["mesh"]]["primitives"][0]
    attributes = primitive["attributes"]
    positions = read_accessor(attributes["POSITION"])
    normals = read_accessor(attributes["NORMAL"])
    rgb = read_accessor(attributes["COLOR_0"])[:,:3]
    triangles = read_accessor(primitive["indices"]).reshape(-1,3)
    light = np.maximum(0, normals @ np.array([-.64,.47,.61]))
    shades = np.uint8(255*np.clip(rgb*(.045+light[:,None]*1.2),0,1)**(1/2.2))
    xy = positions[:,:2].copy() * [1,-1]
    xy = xy / np.max(np.abs(xy))*176 + 192
    im = Image.new("RGBA",(384,384))
    draw = ImageDraw.Draw(im)
    for face in triangles[np.argsort(positions[triangles,2].mean(axis=1))]:
        draw.polygon([tuple(v) for v in xy[face]],fill=tuple(shades[face].mean(axis=0).astype(int))+(255,))
    im.resize((128,128),Image.Resampling.LANCZOS).save(out / (key+".webp"),quality=84)
