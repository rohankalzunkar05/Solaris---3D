# SOLARIS

SOLARIS is a local, interactive 3D planetarium. Its observatory uses the meshes and embedded materials exported from the included Blender scene. The illustrated orbits help with exploration. The object atlas supplies real measurements and links to the scientific sources.

## Run the website

Use a current Node.js installation compatible with Vite 7. This project was built and tested with Node 22.20.0. From the project root:

```powershell
cd web
npm ci
npm run dev
```

Open the local URL printed by Vite. The first visit opens the Saturn introduction. **Enter Solar System** opens the observatory. Click the SOLARIS wordmark to revisit the introduction.

```powershell
npm run build
npm run preview
```

The production site is generated in `web/dist/`. Serve it over HTTP at the site root. All runtime models, imagery and fonts are local. Source links in the atlas open the original external publications.

## Explore

- Drag to orbit, scroll or pinch to zoom, and right-drag or move two fingers to pan. Click a planet in the scene or choose its thumbnail in the celestial index.
- Open **Object atlas** for the Sun, eight planets and five dwarf planets. Search using the magnifier or the slash key. The information panel includes measurements, moons, exploration and sources.
- **Guided tour** steps through the Sun and eight planets. **Compare** places seven measurements for two different planets side by side.
- The controls below the scene pause motion, change its illustrative speed, reset the current camera and return to the system overview. Space toggles motion. Escape closes the active panel.
- Display settings adjust star density, pixel ratio, orbit lines and labels. The scale control in the footer explains the illustration and credits its imagery. Initial motion respects the reduced-motion preference.

## Project files

| Location | Purpose |
|---|---|
| `Solarsystem.blend` | Editable Blender source. Open with the Blender version used for this project, 5.3, or a compatible release. |
| `Solarsystem.blend1` | Original backup retained from the initial workspace. |
| `art/build_scene.py` | Blender authoring and GLB export, intended for the original project file. |
| `art/bridge.py`, `art/verify_scene.py` | Client for the installed Blender Lab MCP bridge and read-only verification of the saved source. |
| `art/textures/` | Source maps, licenses and image credits. |
| `art/make_previews.py` | Generates small portraits and the starfield. Dwarf and procedural moon portraits project actual GLB mesh geometry and vertex colors. Requires Python, NumPy and Pillow. |
| `web/public/models/solaris.glb` | Self-contained geometry and material export served by the observatory. |
| `web/public/images/` | Cassini imagery, body portraits, cloud mask and backdrop. |
| `web/src/components/` | First visit, 3D scene, navigation index, comparison and atlas components. |
| `web/src/data/bodies.js` | Body catalog, measurement conventions, mission descriptions, moon entries and primary source URLs. |
| `web/src/App.jsx`, `web/src/styles.css` | Navigation, playback, settings and responsive layout. |
| `web/tests/verify.mjs` | Catalog, GLB and browser verification. |
| `context.md`, `WORK_LOG.md`, `TASKS.md` | Current project state, chronological changes and requirement verification. |

## Blender workflow

Open the original `Solarsystem.blend`. The **SOLARIS · Orbital atlas** collection contains the 29 web meshes. **SOLARIS · Studio** contains the source scene's overview camera and solar light. The GLB contains only the atlas collection. The web renderer supplies its own lights, animated transforms, orbit curves, starfield, solar halo and Earth atmosphere.

To verify with the installed Blender Lab MCP 1.0.3 add-on, start its loopback bridge with the project open, then run this command from the project root:

```powershell
python art/bridge.py art/verify_scene.py
```

The authoring command below **rebuilds the generated atlas collection and saves the original file**. If you have hand-edited that collection, incorporate those changes into the authoring script before rebuilding.

```powershell
python art/bridge.py art/build_scene.py
python art/make_previews.py
```

The website runs without a live Blender connection. The original packed materials and export reside in the project.

## Verification

With the website running, use another terminal from `web/`:

```powershell
npm test
```

The browser test defaults to `http://127.0.0.1:5173`. Set `SOLARIS_URL` for another server, or `SOLARIS_BROWSER` to the executable path of an installed Chrome or Chromium-compatible browser. Tests use an isolated browser profile and write desktop and mobile review images under `web/test-results/`.

The suite inspects actual Three.js draw state and embedded textures, picks a mesh using its projected center, exercises navigation and information panels, and checks browser errors and HTTP responses. Mobile verification uses Chromium device emulation. On-device GPU performance and Safari remain unmeasured.

## Scientific and visual conventions

Positions, body sizes and speeds are independently compressed. The orbits are circular illustrations. The catalog records temperature conventions, retrograde rotation and estimates. Unavailable values are displayed with a dash. Satellite counts are snapshots and can change with new discoveries. Procedural dwarf and moon relief is illustrative.

Planetary map source and reuse details, including the ring profile and two Cassini portraits, are listed in [the image credits](art/textures/CREDITS.md).

