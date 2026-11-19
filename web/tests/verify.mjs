// Run against a running dev or preview server. SOLARIS_BROWSER overrides browser discovery.
import assert from "node:assert/strict";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import { bodies, metrics, planetIds, dwarfIds } from "../src/data/bodies.js";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const captures = resolve(root, "test-results");
mkdirSync(captures, { recursive: true });
assert.equal(bodies.length, 14);
assert.equal(planetIds.length, 8);
assert.equal(dwarfIds.length, 5);
assert.equal(new Set(bodies.map((b) => b.id)).size, 14);
for (const b of bodies) {
  assert.ok(
    b.sources.length &&
      b.sources.every((s) => new URL(s.url).protocol === "https:"),
  );
  if (b.kind === "Planet")
    assert.ok(metrics.every((m) => Number.isFinite(b.properties[m.key])));
}
const glb = readFileSync(resolve(root, "public/models/solaris.glb"));
assert.equal(glb.readUInt32LE(8), glb.length);
const model = JSON.parse(glb.toString("utf8", 20, 20 + glb.readUInt32LE(12)));
assert.ok(model.asset.generator.includes("Blender"));
assert.ok(model.images.every((i) => i.bufferView != null));
assert.equal(model.meshes.length, 29);
console.log("PASS · catalog and exported GLB integrity");
const candidates = [
  process.env.SOLARIS_BROWSER,
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
];
const executablePath = candidates.find((x) => x && existsSync(x));
const browser = await chromium.launch({
  executablePath,
  headless: true,
  args: [
    "--enable-webgl",
    "--use-angle=swiftshader",
    "--enable-unsafe-swiftshader",
  ],
});
const base = process.env.SOLARIS_URL || "http://127.0.0.1:5173";
const errors = [],
  failures = [],
  warnings = [];
async function instrument(page) {
  page.setDefaultTimeout(20000);
  page.on("pageerror", (e) => {
    errors.push(e.message);
    console.error("Page error:", e.message);
  });
  page.on("console", (m) => {
    if (m.type() === "error") {
      errors.push(m.text());
      console.error(m.text());
    }
    if (m.type() === "warning") warnings.push(m.text());
  });
  page.on("response", (r) => {
    if (r.status() >= 400) failures.push(r.status() + " " + r.url());
  });
  await page.addInitScript(() => {
    // Observe actual draw state using the Three.js devtools event, without a production debug API.
    window.__THREE_DEVTOOLS__ = new EventTarget();
    window.__THREE_DEVTOOLS__.addEventListener("observe", ({ detail }) => {
      if (!detail.isWebGLRenderer) return;
      const render = detail.render.bind(detail);
      detail.render = (scene, camera) => {
        window.drawState = { scene, camera, renderer: detail };
        return render(scene, camera);
      };
    });
  });
}
async function ready(page) {
  await page.waitForFunction(
    () => window.drawState?.renderer.info.render.triangles > 10000,
    {},
    { timeout: 80000 },
  );
  await page.waitForFunction(() => !document.querySelector(".loading"));
}
const btn = (p, name) => p.getByRole("button", { name, exact: true });
const capture = (p, name) =>
  p.screenshot({
    path: resolve(captures, name + ".png"),
    animations: "disabled",
  });
const coords = (p) =>
  p.evaluate(() => window.drawState.camera.position.toArray());
try {
  const page = await browser.newPage({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  });
  await instrument(page);
  await page.goto(base, { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  await capture(page, "01-introduction");
  assert.equal(await page.locator(".index-card").count(), 9);
  await btn(page, "Enter Solar System").click();
  await ready(page);
  await btn(page, "Pause movement").click();
  const actual = await page.evaluate(() => {
    const { scene, renderer } = window.drawState;
    let meshes = 0,
      maps = 0,
      moonMaterials = [];
    scene.traverse((o) => {
      if (o.isMesh) {
        meshes++;
        if (o.material?.map?.image) maps++;
        if (o.material?.name) moonMaterials.push(o.material.name);
      }
    });
    return {
      meshes,
      maps,
      materials: moonMaterials,
      triangles: renderer.info.render.triangles,
    };
  });
  assert.ok(actual.maps >= 11 && actual.meshes >= 29);
  console.log(
    "PASS · browser GLB decode and rendering",
    JSON.stringify(actual),
  );
  await capture(page, "02-observatory");
  const earth = () =>
    page.evaluate(() => {
      let mesh;
      window.drawState.scene.traverse((o) => {
        if (o.material?.name === "SOLARIS / earth") mesh = o;
      });
      return [mesh.parent.parent.position.toArray(), mesh.rotation.y];
    });
  const stopped = await earth();
  await page.waitForTimeout(220);
  assert.deepEqual(await earth(), stopped);
  await page.getByLabel("Orbital speed").selectOption("5");
  await btn(page, "Play movement").click();
  await page.waitForTimeout(550);
  assert.notDeepEqual(await earth(), stopped);
  await btn(page, "Pause movement").click();
  // Hit-test a real planet at its projected mesh center.
  const screen = await page.evaluate(() => {
    const { scene, camera, renderer } = window.drawState;
    let mesh;
    scene.traverse((o) => {
      if (o.material?.name === "SOLARIS / jupiter") mesh = o;
    });
    const p = mesh.getWorldPosition(camera.position.clone()).project(camera);
    const r = renderer.domElement.getBoundingClientRect();
    return {
      x: r.left + (r.width * (p.x + 1)) / 2,
      y: r.top + (r.height * (1 - p.y)) / 2,
    };
  });
  await page.mouse.move(screen.x, screen.y);
  await page
    .locator(".world-label.hover")
    .filter({ hasText: "Jupiter" })
    .waitFor();
  await page.mouse.click(screen.x, screen.y);
  await page
    .getByRole("heading", { name: "Jupiter", exact: true, level: 2 })
    .waitFor();
  await page.waitForTimeout(800);
  const before = await coords(page);
  await page.mouse.move(480, 320);
  await page.mouse.wheel(0, -200);
  await page.waitForTimeout(400);
  assert.notDeepEqual(await coords(page), before);
  const rotated = await coords(page);
  await page.mouse.move(480, 330);
  await page.mouse.down();
  await page.mouse.move(538, 355, { steps: 5 });
  await page.mouse.up();
  await page.waitForTimeout(200);
  assert.notDeepEqual(await coords(page), rotated);
  const panned = await coords(page);
  await page.mouse.down({ button: "right" });
  await page.mouse.move(575, 378, { steps: 4 });
  await page.mouse.up({ button: "right" });
  await page.waitForTimeout(200);
  assert.notDeepEqual(await coords(page), panned);
  await btn(page, "Reset camera").click();
  await page.waitForTimeout(600);
  await btn(page, "Explore Earth").click();
  await btn(page, "Properties").click();
  assert.match(await page.locator(".measures").innerText(), /12,756/);
  await btn(page, "Moons").click();
  await page.locator(".moon-row").filter({ hasText: "Moon" }).waitFor();
  await btn(page, "Exploration").click();
  assert.match(await page.locator(".drawer").innerText(), /Landsat/);
  await btn(page, "Overview").click();
  await page.waitForTimeout(1700);
  await capture(page, "03-earth");
  await btn(page, "Compare").click();
  await page.getByLabel("First planet").selectOption("jupiter");
  assert.equal(await page.locator(".comparison tbody tr").count(), 7);
  await page.getByLabel("Second planet").selectOption("neptune");
  assert.match(await page.locator(".comparison").innerText(), /Neptune/);
  await btn(page, "Object atlas").click();
  for (const body of bodies) {
    await page
      .locator(".atlas-row")
      .filter({ has: page.getByText(body.name, { exact: true }) })
      .click();
    await page
      .getByRole("heading", { name: body.name, level: 2, exact: true })
      .waitFor();
    await btn(page, "Properties").click();
    assert.ok((await page.locator(".measures dd").count()) >= 5);
    if (body.moons.length) {
      await btn(page, "Moons").click();
      assert.equal(await page.locator(".moon-row").count(), body.moons.length);
    }
    await btn(page, "Object atlas").click();
  }
  console.log(
    "PASS · all 14 atlas records, measurement panels and every cataloged moon section",
  );
  await btn(page, "Search bodies").click();
  await page.getByLabel("Search celestial bodies").fill("mercury");
  assert.equal(await page.locator(".atlas-row").count(), 1);
  await page.getByLabel("Search celestial bodies").fill("nomatch");
  await page.getByText("No matching bodies.", { exact: false }).waitFor();
  await btn(page, "Clear search").click();
  await btn(page, "Dwarf planets").click();
  assert.equal(await page.locator(".atlas-row").count(), 5);
  await page.locator(".atlas-row").filter({ hasText: "Haumea" }).click();
  await page.getByRole("heading", { name: "Haumea", level: 2 }).waitFor();
  await btn(page, "System overview").click();
  await page.waitForFunction((ids) => {
    const {scene,camera} = window.drawState;
    const visible = new Set();
    scene.traverse(o=>{
      const key=o.material?.name?.replace("SOLARIS / ","");
      if (!ids.includes(key)) return;
      const p=o.getWorldPosition(camera.position.clone()).project(camera);
      if (Math.abs(p.x)<.99 && Math.abs(p.y)<.99 && p.z>0 && p.z<1) visible.add(key);
    });
    return visible.size===ids.length;
  },bodies.map(b=>b.id));
  console.log("PASS · complete-system camera frames all 14 catalog bodies");
  await btn(page, "Guided tour").click();
  for (let i = 0; i < 8; i++) await btn(page, "Next tour stop").click();
  await btn(page, "Finish tour").click();
  assert.equal(await page.locator(".drawer").count(), 0);
  await btn(page, "Display settings").click();
  await page.getByLabel("Render quality").selectOption("Low");
  await page.getByLabel("Planet labels").uncheck();
  await page.getByLabel("Orbital paths").uncheck();
  assert.equal(await page.locator(".world-label").count(), 0);
  await btn(page, "Close settings").click();
  await btn(page, "Illustrative scale").click();
  await page.getByText("Scale & credits").waitFor();
  await btn(page, "Close credits").click();
  await page.reload();
  await ready(page);
  assert.equal(await btn(page, "Enter Solar System").count(), 0);
  console.log(
    "PASS · pause/play, speed, mesh hover/click, focus, zoom/pan/orbit/reset, 4 information tabs, comparison, search, dwarf atlas, 9-stop tour, settings, credits and returning visit",
  );
  await page.close();
  const mobile = await browser.newPage({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
  });
  await instrument(mobile);
  await mobile.goto(base, { waitUntil: "networkidle" });
  await capture(mobile, "04-mobile-introduction");
  assert.ok(
    await mobile.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  const displayButton = await btn(mobile, "Display settings").boundingBox();
  assert.ok(
    displayButton.x + displayButton.width <= 390,
    "Header tools should fit on a phone",
  );
  await btn(mobile, "Enter Solar System").click();
  await ready(mobile);
  await btn(mobile, "Explore Saturn").click();
  await mobile.getByRole("heading", { name: "Saturn", level: 2 }).waitFor();
  await btn(mobile, "Properties").click();
  await mobile.waitForTimeout(1600);
  const sheet = await mobile.locator(".drawer").boundingBox();
  assert.ok(
    sheet.x >= 0 && sheet.x + sheet.width <= 390,
    "Detail sheet must fit the viewport",
  );
  await capture(mobile, "05-mobile-saturn");
  assert.ok(
    await mobile.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  );
  await btn(mobile, "Close panel").click();
  await btn(mobile, "Object atlas").click();
  await btn(mobile, "Dwarf planets").click();
  assert.equal(await mobile.locator(".atlas-row").count(), 5);
  console.log(
    "PASS · mobile first visit, horizontal celestial index, 3D rendering, selection, sheet and dwarf navigation",
  );
  assert.deepEqual(errors, []);
  assert.deepEqual(failures, []);
  console.log("PASS · no browser errors or HTTP failures. Browser warnings:", [
    ...new Set(warnings),
  ]);
} finally {
  await browser.close();
}

