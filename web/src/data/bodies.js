// Quantities are rounded reference measurements. The scene uses its own illustrative scale.
export const metrics = [
  { key: "diameter", label: "Diameter", unit: "km" },
  { key: "mass", label: "Mass", unit: "kg" },
  { key: "gravity", label: "Gravity", unit: "m/s²" },
  { key: "distance", label: "Distance from Sun", unit: "million km" },
  { key: "orbit", label: "Orbital period", unit: "days" },
  { key: "rotation", label: "Rotation period", unit: "h" },
  { key: "temperature", label: "Temperature", unit: "°C" },
];

const nasa = "https://science.nasa.gov/";
const factSheets = "https://nssdc.gsfc.nasa.gov/planetary/factsheet/";
const source = (label, url) => ({ label, url });
const feature = (label, path) => source(label, nasa + path);
const moon = (name, description) => ({ name, description });
const planetMeasures = source("NASA · Planetary measurements", factSheets);
const conventions = source(
  "NASA · Measurement definitions",
  factSheets + "planetfact_notes.html",
);
const satelliteList = source(
  "JPL · Recognized satellites",
  "https://ssd.jpl.nasa.gov/sats/discovery.html",
);
const satelliteGuide = feature(
  "NASA · Solar system moons",
  "solar-system/moons/facts/",
);
const dwarfMeasures = source(
  "JPL · Physical parameters",
  "https://ssd.jpl.nasa.gov/planets/phys_par.html",
);
const dwarfSizes = feature(
  "NASA · Sizes and distances",
  "solar-system/planet-sizes-and-locations-in-our-solar-system/",
);
const voyager = feature("NASA · Voyager 2", "mission/voyager/voyager-2/");

export const bodies = [
  {
    id: "sun",
    name: "Sun",
    kind: "Star",
    type: "G2 V star",
    overview:
      "At the center of our solar system, hydrogen nuclei fuse into helium inside a core roughly 15 million degrees hot. The energy released there eventually reaches the photosphere and escapes as the sunlight we see.",
    properties: {
      diameter: 1391400,
      mass: 1.9884e30,
      gravity: 274,
      distance: null,
      orbit: null,
      rotation: 609.12,
      temperature: 5500,
    },
    notes:
      "Diameter uses the mean radius. Temperature is the effective photospheric temperature. The quoted rotation period applies at 16° latitude. Solar plasma turns faster near the equator than near the poles.",
    atmosphere:
      "The chromosphere and a narrow transition region lead into the corona, a tenuous outer atmosphere that extends into space.",
    surface:
      "The photosphere is a luminous layer of plasma, mostly hydrogen and helium. Rising hot material gives it a granular texture.",
    layers:
      "Fusion powers the core. Radiation carries energy through the radiative zone. In the convection zone, rising and sinking plasma carries energy toward the photosphere.",
    activity:
      "Solar activity waxes and wanes over roughly 11 years. Evolving magnetic fields produce sunspots, flares and eruptions of plasma called coronal mass ejections.",
    facts: [
      "The Sun contains about 99.8% of the mass in our solar system.",
      "During a total solar eclipse the Moon covers the bright photosphere, revealing the faint corona.",
    ],
    missions: [
      "In 2021 Parker Solar Probe entered the corona and sampled its particles and magnetic fields directly.",
    ],
    moonCount: null,
    moons: [],
    sources: [
      feature("NASA · Sun facts", "sun/facts/"),
      source("NASA · Sun measurements", factSheets + "sunfact.html"),
      feature("NASA · Parker Solar Probe", "mission/parker-solar-probe/"),
    ],
  },
  {
    id: "mercury",
    name: "Mercury",
    kind: "Planet",
    type: "Terrestrial planet",
    overview:
      "The smallest planet races around the Sun in 88 Earth days. Sunlight bakes its rocky plains, yet inside deep polar craters some patches of ground remain in shadow all year.",
    properties: {
      diameter: 4879,
      mass: 3.3e23,
      gravity: 3.7,
      distance: 57.9,
      orbit: 88.0,
      rotation: 1407.6,
      temperature: 167,
    },
    notes:
      "Temperature averages day and night. Individual locations can reach about 430 °C in daylight and −180 °C at night.",
    atmosphere:
      "Solar wind and meteoroid impacts knock atoms from the ground into a sparse exosphere containing oxygen, sodium, hydrogen, helium and potassium.",
    surface:
      "Impact basins and volcanic plains cover the rocky crust. A metallic core fills about 85% of the planet’s radius.",
    facts: [
      "Mercury turns three times on its axis in two trips around the Sun.",
      "From one sunrise to the next, two Mercurian years pass.",
    ],
    missions: [
      "MESSENGER was the first spacecraft to orbit Mercury. Its instruments found evidence of water ice in permanently shaded polar terrain.",
    ],
    moonCount: "0",
    moons: [],
    sources: [
      feature("NASA · Mercury facts", "mercury/facts/"),
      planetMeasures,
      conventions,
      feature("NASA · MESSENGER", "mission/messenger/"),
    ],
  },
  {
    id: "venus",
    name: "Venus",
    kind: "Planet",
    type: "Terrestrial planet",
    overview:
      "Nearly the size of Earth, Venus hides a volcanic landscape beneath a bright cloud deck. Its dense atmosphere traps heat so effectively that the ground is hotter here than on Mercury.",
    properties: {
      diameter: 12104,
      mass: 4.87e24,
      gravity: 8.9,
      distance: 108.2,
      orbit: 224.7,
      rotation: -5832.5,
      temperature: 464,
    },
    notes:
      "Temperature is the mean at the surface. A negative rotation period denotes retrograde spin relative to Earth.",
    atmosphere:
      "Carbon dioxide dominates the air. Clouds of sulfuric acid obscure the ground in visible light.",
    surface:
      "Radar reveals mountains, volcanic plains and ridged highlands. Venera landers photographed dark, rocky ground beneath the clouds.",
    facts: [
      "A full turn relative to the stars takes longer than a Venusian year.",
      "The Sun rises in the west on Venus.",
    ],
    missions: [
      "Magellan used radar in the 1990s to map the terrain through the clouds.",
      "The Soviet Venera landers returned photographs and measurements before the heat disabled their instruments.",
    ],
    moonCount: "0",
    moons: [],
    sources: [
      feature("NASA · Venus facts", "venus/venus-facts/"),
      planetMeasures,
      conventions,
      feature("NASA · Magellan radar mapping", "image-detail/venus-2/"),
    ],
  },
  {
    id: "earth",
    name: "Earth",
    kind: "Planet",
    type: "Terrestrial planet",
    overview:
      "Liquid oceans cover most of Earth. Above them, clouds and winds redistribute heat and moisture. Beneath them, moving plates continually remake the ocean floor and the continents.",
    properties: {
      diameter: 12756,
      mass: 5.97e24,
      gravity: 9.8,
      distance: 149.6,
      orbit: 365.2,
      rotation: 23.9,
      temperature: 15,
    },
    notes:
      "Diameter is equatorial. The rotation period is measured against distant stars. Temperature is a rounded global surface mean.",
    atmosphere:
      "Dry air near the surface is about 78% nitrogen and 21% oxygen. Water vapor varies from place to place.",
    surface:
      "Ocean basins and continents share a rocky crust. Where plates converge, terrain rises into mountain belts. Where they pull apart, new crust forms.",
    facts: [
      "Earth is the only world known to host life.",
      "Charged particles guided by Earth’s magnetic field can make the upper atmosphere glow in auroras.",
    ],
    missions: [
      "The NASA and USGS Landsat record began in 1972. Early images helped researchers redraw the Antarctic coastline and trace the changing courses of Amazon tributaries.",
    ],
    moonCount: "1",
    moons: [
      moon(
        "Moon",
        "One turn takes as long as one orbit, keeping the near side toward Earth. Its dark plains preserve ancient lava flows inside impact basins.",
      ),
    ],
    sources: [
      feature("NASA · Earth facts", "earth/facts/"),
      planetMeasures,
      conventions,
      feature("NASA · Moon facts", "moon/facts/"),
      feature("NASA · Landsat 1", "mission/landsat-1/"),
    ],
  },
  {
    id: "mars",
    name: "Mars",
    kind: "Planet",
    type: "Terrestrial planet",
    overview:
      "Rust-colored dust settles over immense volcanoes, canyon walls and ancient river channels. The dry landscape preserves evidence that water once flowed and collected in lakes.",
    properties: {
      diameter: 6792,
      mass: 6.42e23,
      gravity: 3.7,
      distance: 228,
      orbit: 687,
      rotation: 24.6,
      temperature: -65,
    },
    notes:
      "Temperature is a global surface mean. The thin atmosphere allows large temperature swings.",
    atmosphere:
      "Mostly carbon dioxide, with smaller amounts of nitrogen and argon. Winds can carry fine dust across the planet.",
    surface:
      "Iron oxides tint the rocks and dust red. Water ice survives below the ground and in the polar regions.",
    facts: [
      "Olympus Mons is the largest volcano in the solar system.",
      "The Valles Marineris canyon system stretches thousands of kilometers.",
    ],
    missions: [
      "At Gale crater, Curiosity found lake sediments whose minerals and chemistry record conditions that could once have supported microbes.",
      "Perseverance explores Jezero crater and collects rock samples.",
    ],
    moonCount: "2",
    moons: [
      moon(
        "Phobos",
        "The larger inner moon is irregularly shaped and slowly spirals toward Mars.",
      ),
      moon(
        "Deimos",
        "Smaller and farther out than Phobos, Deimos also follows a nearly circular path close to the equatorial plane.",
      ),
    ],
    sources: [
      feature("NASA · Mars facts", "mars/facts/"),
      planetMeasures,
      conventions,
      satelliteGuide,
      feature(
        "NASA · Gale crater findings",
        "resource/a-guide-to-gale-crater/",
      ),
    ],
  },
  {
    id: "jupiter",
    name: "Jupiter",
    kind: "Planet",
    type: "Gas giant",
    overview:
      "Bright zones alternate with dark belts across the largest planet. Jet streams carry neighboring bands in opposite directions, while the Great Red Spot turns within the southern cloud deck.",
    properties: {
      diameter: 142984,
      mass: 1.898e27,
      gravity: 23.1,
      distance: 778.5,
      orbit: 4331,
      rotation: 9.9,
      temperature: -110,
    },
    notes:
      "Temperature and effective equatorial gravity are specified at one bar of atmospheric pressure. Gravity includes rotation.",
    atmosphere:
      "Hydrogen and helium surround clouds containing ammonia and water. Storms and winds shape the bands seen from space.",
    surface:
      "Below the clouds, pressure compresses hydrogen into fluid and eventually metallic hydrogen. There is no solid landing surface.",
    facts: [
      "Jupiter spins faster than any other planet.",
      "Galileo observed its four large inner satellites in 1610.",
    ],
    missions: [
      "Juno measured variations in gravity that trace the east-west jets to depths of about 3,000 km.",
    ],
    moonCount: "115 · JPL, Nov 2026",
    moons: [
      moon(
        "Io",
        "Tidal heating powers the most volcanically active world in the solar system.",
      ),
      moon(
        "Europa",
        "A fractured shell of water ice covers evidence of a subsurface ocean.",
      ),
      moon(
        "Ganymede",
        "The largest moon in the solar system is wider than Mercury.",
      ),
      moon(
        "Callisto",
        "This outermost Galilean moon preserves a heavily cratered surface.",
      ),
    ],
    sources: [
      feature("NASA · Jupiter facts", "jupiter/jupiter-facts/"),
      planetMeasures,
      conventions,
      satelliteList,
      satelliteGuide,
      feature("NASA · Juno", "mission/juno/"),
    ],
  },
  {
    id: "saturn",
    name: "Saturn",
    kind: "Planet",
    type: "Gas giant",
    overview:
      "Saturn’s rings resolve into countless independently orbiting particles. Between the broad A and B rings, the Cassini Division cuts a dark lane thousands of kilometers wide.",
    properties: {
      diameter: 120536,
      mass: 5.68e26,
      gravity: 9.0,
      distance: 1432,
      orbit: 10747,
      rotation: 10.7,
      temperature: -140,
    },
    notes:
      "Temperature and effective equatorial gravity are specified at one bar. The quoted rotation period is approximate.",
    atmosphere:
      "Clouds and jet streams band an envelope of hydrogen and helium. A six-sided jet encircles the north pole.",
    surface:
      "Pressure increases continuously through the atmosphere into layers of fluid hydrogen. The visible globe shows clouds.",
    facts: [
      "Saturn’s average density is lower than that of liquid water.",
      "Water ice makes up most of the ring material.",
    ],
    missions: [
      "Voyager images first revealed the northern hexagon. Cassini later followed its structure during a mission that orbited Saturn from 2004 to 2017.",
    ],
    moonCount: "293 · JPL, Nov 2026",
    moons: [
      moon(
        "Titan",
        "A thick atmosphere covers lakes and seas of liquid methane and ethane.",
      ),
      moon(
        "Enceladus",
        "Water-rich plumes escape from this icy moon, offering samples of material from its interior.",
      ),
    ],
    sources: [
      feature("NASA · Saturn facts", "saturn/facts/"),
      planetMeasures,
      conventions,
      satelliteList,
      satelliteGuide,
    ],
  },
  {
    id: "uranus",
    name: "Uranus",
    kind: "Planet",
    type: "Ice giant",
    overview:
      "A pale blue-green world rolls through the outer solar system with its axis tipped nearly into its orbital plane. Near a solstice, one pole receives sunlight for years while the other lies in darkness.",
    properties: {
      diameter: 51118,
      mass: 8.68e25,
      gravity: 8.7,
      distance: 2867,
      orbit: 30589,
      rotation: -17.2,
      temperature: -195,
    },
    notes:
      "Temperature and effective equatorial gravity refer to the one-bar level. Negative rotation indicates retrograde spin.",
    atmosphere:
      "Methane in a hydrogen-helium atmosphere absorbs red light, contributing to the planet’s blue-green appearance.",
    surface:
      "The atmosphere grades into hot, dense material rich in water, ammonia and methane above a rocky center.",
    facts: [
      "The rotation axis tilts about 98°.",
      "Uranus has narrow rings and a magnetic field strongly tilted relative to its spin axis.",
    ],
    missions: [
      "William Herschel discovered Uranus with a telescope in 1781. In 1986 Voyager 2 flew past, imaging its rings and moons at close range.",
    ],
    moonCount: "29 · JPL, Nov 2026",
    moons: [
      moon(
        "Miranda",
        "Terraces and enormous fault canyons divide its small surface.",
      ),
      moon("Ariel", "Intersecting valleys cross this bright moon."),
      moon("Umbriel", "Old craters cover the darkest of the five major moons."),
      moon(
        "Titania",
        "The largest Uranian moon was discovered by William Herschel in 1787.",
      ),
      moon(
        "Oberon",
        "Dark material lies on some crater floors of the outermost major moon.",
      ),
    ],
    sources: [
      feature("NASA · Uranus facts", "uranus/facts/"),
      planetMeasures,
      conventions,
      satelliteList,
      feature("NASA · Uranian moons", "uranus/moons/facts/"),
      voyager,
    ],
  },
  {
    id: "neptune",
    name: "Neptune",
    kind: "Planet",
    type: "Ice giant",
    overview:
      "Sunlight takes hours to reach the outermost planet. Despite the weak sunlight, dark storms and fast winds sweep Neptune’s cold atmosphere.",
    properties: {
      diameter: 49528,
      mass: 1.02e26,
      gravity: 11.0,
      distance: 4515,
      orbit: 59800,
      rotation: 16.1,
      temperature: -200,
    },
    notes:
      "Temperature and effective equatorial gravity refer to the one-bar level. Voyager images often enhanced Neptune’s blue to make clouds more visible.",
    atmosphere:
      "Hydrogen and helium dominate. Methane absorbs red light and helps give Neptune its blue-green hue.",
    surface:
      "Beneath the visible clouds, the atmosphere merges into a deep, hot fluid envelope rich in water, ammonia and methane.",
    facts: [
      "Discrepancies in the orbit of Uranus helped astronomers predict where to look for Neptune.",
      "A single orbit takes roughly 165 Earth years.",
    ],
    missions: [
      "Voyager 2 flew past in August 1989, recording atmospheric storms and photographing eruptions on Triton.",
    ],
    moonCount: "16 · JPL, Nov 2026",
    moons: [
      moon(
        "Triton",
        "Neptune’s largest moon travels opposite the planet’s rotation. Voyager 2 saw plumes rising above its icy terrain.",
      ),
    ],
    sources: [
      feature("NASA · Neptune facts", "neptune/neptune-facts/"),
      planetMeasures,
      conventions,
      satelliteList,
      voyager,
      feature("NASA · Triton plumes", "photojournal/tritons-volcanic-plumes/"),
    ],
  },
  {
    id: "pluto",
    name: "Pluto",
    kind: "Dwarf planet",
    type: "Kuiper Belt world",
    overview:
      "A bright, heart-shaped region breaks the mottled surface of Pluto. In its western half, broad plains of nitrogen ice lie beside mountains built from water ice.",
    properties: {
      diameter: 2376,
      mass: 1.3e22,
      gravity: 0.6,
      distance: 5906.4,
      orbit: 90560,
      rotation: -153.3,
      temperature: -225,
    },
    notes:
      "Temperature is a rounded surface mean. Negative rotation denotes retrograde spin.",
    atmosphere:
      "A thin nitrogen atmosphere contains traces of methane and carbon monoxide. Surface ices exchange material with the atmosphere.",
    surface:
      "Nitrogen-rich glaciers flow between icy mountains. Crater counts vary dramatically between different terrains.",
    facts: [
      "Pluto approaches closer to the Sun than Neptune during part of its orbit.",
      "The IAU classified Pluto as a dwarf planet in 2006.",
    ],
    missions: [
      "New Horizons flew through the Pluto system in July 2015, revealing glaciers, hazes and complex geology.",
    ],
    moonCount: "5",
    moons: [
      moon(
        "Charon",
        "About half as wide as Pluto, Charon is the largest of its five moons.",
      ),
      moon(
        "Styx, Nix, Kerberos and Hydra",
        "These four small moons were found in Hubble Space Telescope observations.",
      ),
    ],
    sources: [
      feature("NASA · Pluto facts", "dwarf-planets/pluto/facts/"),
      planetMeasures,
      conventions,
      satelliteGuide,
    ],
  },
  {
    id: "ceres",
    name: "Ceres",
    kind: "Dwarf planet",
    type: "Main-belt world",
    overview:
      "Ceres orbits among the asteroids between Mars and Jupiter. On its dark surface, patches of bright salt record the movement of brines beneath the crust.",
    properties: {
      diameter: 964,
      mass: 9.384e20,
      gravity: 0.27,
      distance: 413,
      orbit: 1682,
      rotation: 9.07,
      temperature: null,
    },
    notes:
      "Diameter is equatorial. A representative mean surface temperature is omitted from this catalog.",
    atmosphere:
      "Observations indicate intermittent water vapor around this small world.",
    surface:
      "Rock, salts and ice occur in the crust. Occator crater contains particularly bright carbonate deposits.",
    facts: [
      "Ceres is the largest object in the main asteroid belt.",
      "It was the first dwarf planet visited by a spacecraft.",
    ],
    missions: [
      "After observing Vesta, Dawn orbited Ceres and identified carbonate salts in Occator crater.",
    ],
    moonCount: "0",
    moons: [],
    sources: [
      feature("NASA · Ceres facts", "dwarf-planets/ceres/facts/"),
      dwarfSizes,
      dwarfMeasures,
      feature("NASA · Dawn findings", "mission/dawn/toolkit/highlights/"),
    ],
  },
  {
    id: "haumea",
    name: "Haumea",
    kind: "Dwarf planet",
    type: "Kuiper Belt world",
    overview:
      "Haumea spins in under four hours. Its stretched shape, two companions and ring make this distant world unusually distinctive in telescope observations.",
    properties: {
      diameter: 1740,
      mass: 4.006e21,
      gravity: 0.35,
      distance: 6500,
      orbit: 104000,
      rotation: 3.91,
      temperature: null,
    },
    notes:
      "The diameter is a representative equatorial estimate for an elongated body. Gravity is approximate and varies with location. The orbit is rounded from JPL’s period in years.",
    atmosphere: "The available data leave its atmosphere poorly constrained.",
    surface:
      "Observations are consistent with rock beneath an icy exterior. Detailed surface geography remains unresolved.",
    facts: [
      "A ring briefly dimmed a background star before and after Haumea passed in front of it.",
    ],
    missions: [
      "Astronomers reported the ring in 2017 using a stellar occultation. Hubble observations have also resolved the dwarf planet and its moons.",
    ],
    moonCount: "2",
    moons: [
      moon(
        "Hiʻiaka",
        "The outer of the two known moons was discovered in 2005.",
      ),
      moon(
        "Namaka",
        "Namaka follows the inner orbit and was also discovered in 2005.",
      ),
    ],
    sources: [
      feature("NASA · Haumea facts", "dwarf-planets/haumea/"),
      dwarfSizes,
      dwarfMeasures,
    ],
  },
  {
    id: "makemake",
    name: "Makemake",
    kind: "Dwarf planet",
    type: "Kuiper Belt world",
    overview:
      "Makemake is a bright, reddish-brown world beyond Neptune. Sunlight reflected by its icy surface carries spectral signatures of frozen methane and ethane.",
    properties: {
      diameter: 1434,
      mass: 3.1e21,
      gravity: 0.4,
      distance: 6900,
      orbit: 112000,
      rotation: 22.5,
      temperature: null,
    },
    notes:
      "Mass and gravity are model estimates in JPL’s table. The orbital period in days is rounded from JPL’s value in years.",
    atmosphere:
      "A thin atmosphere might develop near the closest part of its orbit. Its properties are uncertain.",
    surface:
      "Frozen hydrocarbons coat parts of the surface. Its distance makes small-scale details difficult to resolve.",
    facts: [
      "Makemake was first observed at Palomar Observatory in 2005.",
      "Its name comes from Rapanui mythology.",
    ],
    missions: [
      "A study of Hubble images revealed a faint satellite beside the bright dwarf planet. The discovery was announced in 2016.",
    ],
    moonCount: "1 provisional",
    moons: [
      moon(
        "MK 2",
        "Nicknamed MK 2, S/2015 (136472) 1 appeared over a thousand times fainter than Makemake in Hubble observations.",
      ),
    ],
    sources: [
      feature("NASA · Makemake facts", "dwarf-planets/makemake/"),
      dwarfSizes,
      dwarfMeasures,
    ],
  },
  {
    id: "eris",
    name: "Eris",
    kind: "Dwarf planet",
    type: "Trans-Neptunian world",
    overview:
      "Eris follows a long, steeply inclined orbit far beyond Neptune. Although close to Pluto in size, Eris has the greater mass, as astronomers could establish by tracking its moon.",
    properties: {
      diameter: 2326,
      mass: 1.66e22,
      gravity: 0.77,
      distance: 10000,
      orbit: 204000,
      rotation: 378.5,
      temperature: null,
    },
    notes:
      "NASA estimates a surface range of −243 to −217 °C. The rotation shown uses the 2023 light-curve result of 15.771 days. The orbital period is rounded from JPL’s value in years.",
    atmosphere:
      "Volatile material can freeze onto the surface at large distances from the Sun. A persistent substantial atmosphere has not been established.",
    surface:
      "This remote, reflective world is extremely cold. Its surface terrain is unresolved.",
    facts: [
      "Sunlight takes more than nine hours to reach Eris at its average distance.",
      "Eris and its moon appear to turn in step.",
    ],
    missions: [
      "Brightness measurements from Palomar, Hubble and the Dark Energy Survey revealed a rotation period closely matching the orbit of Dysnomia.",
    ],
    moonCount: "1",
    moons: [
      moon(
        "Dysnomia",
        "This small satellite completes a nearly circular orbit in about 16 Earth days.",
      ),
    ],
    sources: [
      feature("NASA · Eris facts", "dwarf-planets/eris/"),
      dwarfSizes,
      dwarfMeasures,
      source(
        "Rotation · Bernstein et al. (2023)",
        "https://doi.org/10.3847/PSJ/acdd5f",
      ),
    ],
  },
];

export const bodyById = Object.fromEntries(
  bodies.map((body) => [body.id, body]),
);
export const planetIds = bodies
  .filter((body) => body.kind === "Planet")
  .map((body) => body.id);
export const dwarfIds = bodies
  .filter((body) => body.kind === "Dwarf planet")
  .map((body) => body.id);
