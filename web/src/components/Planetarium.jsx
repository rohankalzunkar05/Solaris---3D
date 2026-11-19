import React, { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Html,
  OrbitControls,
  Stars,
  useGLTF,
  useTexture,
} from "@react-three/drei";
import * as THREE from "three";
import { bodyById } from "../data/bodies";

const model = "/models/solaris.glb";
const origin = new THREE.Vector3();
const cameraDirection = new THREE.Vector3(0.37, 0.42, 1).normalize();
const tilts = {
  earth: 0.41,
  mars: 0.44,
  jupiter: 0.055,
  uranus: 1.435,
  neptune: 0.49,
};
const worldPoint = new THREE.Vector3();
const motion = new THREE.Vector3();
function glowTexture() {
  const c = document.createElement("canvas");
  c.width = c.height = 128;
  const ctx = c.getContext("2d"),
    g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, "rgba(255,246,206,1)");
  g.addColorStop(0.17, "rgba(255,197,94,.89)");
  g.addColorStop(0.3, "rgba(255,145,48,.28)");
  g.addColorStop(0.58, "rgba(244,113,34,.075)");
  g.addColorStop(1, "rgba(238,104,34,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 128, 128);
  return new THREE.CanvasTexture(c);
}
function Path({ radius, dwarf }) {
  const geometry = useMemo(() => {
    const points = Array.from(
      { length: 192 },
      (_, i) =>
        new THREE.Vector3(
          radius * Math.cos((i * Math.PI) / 96),
          0,
          radius * Math.sin((i * Math.PI) / 96),
        ),
    );
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [radius]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <lineLoop geometry={geometry}>
      <lineBasicMaterial
        color={dwarf ? "#736e65" : "#8c8477"}
        transparent
        opacity={dwarf ? 0.19 : 0.36}
        depthWrite={false}
      />
    </lineLoop>
  );
}
function World({
  source,
  moons,
  rings,
  clock,
  selected,
  labels,
  onSelect,
  targets,
  glow,
  cloud,
}) {
  const body = bodyById[source.name],
    group = useRef(),
    spin = useRef(),
    clouds = useRef(),
    satellites = useRef([]);
  const [hover, setHover] = useState(false);
  const orbit = Math.hypot(source.position.x, source.position.z),
    start = Math.atan2(source.position.z, source.position.x);
  const radius = useMemo(() => {
    source.geometry.computeBoundingSphere();
    return source.geometry.boundingSphere.radius;
  }, [source]);
  const frequency = body.properties.orbit
    ? 0.095 * Math.pow(365.2 / body.properties.orbit, 0.52)
    : 0;
  useEffect(() => {
    targets.current[body.id] = { group: group.current, radius };
    return () => {
      delete targets.current[body.id];
    };
  }, [body.id, radius, targets]);
  useFrame(() => {
    const t = clock.current,
      a = start - frequency * t;
    group.current.position.set(Math.cos(a) * orbit, 0, Math.sin(a) * orbit);
    const period = body.properties.rotation || 24;
    spin.current.rotation.y =
      t * 0.17 * Math.sign(period) * Math.pow(24 / Math.abs(period), 0.45);
    if (clouds.current)
      clouds.current.rotation.y = spin.current.rotation.y * 1.05;
    moons.forEach((m, i) => {
      const orb = m.userData.moonOrbit;
      const theta =
        Math.atan2(
          m.position.z - source.position.z,
          m.position.x - source.position.x,
        ) -
        t * (0.28 / (1 + i * 0.35));
      satellites.current[i]?.position.set(
        orb * Math.cos(theta),
        0.05 * orb * Math.sin(theta),
        orb * Math.sin(theta),
      );
    });
  });
  const stop = (e) => e.stopPropagation();
  return (
    <group
      ref={group}
      position={source.position}
      onPointerOver={(e) => {
        stop(e);
        setHover(true);
      }}
      onPointerOut={() => setHover(false)}
      onClick={(e) => {
        stop(e);
        if (e.delta < 5) onSelect(body.id);
      }}
    >
      <group rotation={rings ? rings.rotation : [0, 0, tilts[body.id] || 0]}>
        <mesh
          ref={spin}
          geometry={source.geometry}
          material={source.material}
        />
        {body.id === "earth" && (
          <>
            <mesh ref={clouds} geometry={source.geometry} scale={1.012}>
              <meshStandardMaterial
                color="#ffffff"
                alphaMap={cloud}
                transparent
                opacity={0.82}
                depthWrite={false}
              />
            </mesh>
            <mesh geometry={source.geometry} scale={1.035}>
              <shaderMaterial
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
                vertexShader={
                  "varying float rim; void main(){vec4 p=modelViewMatrix*vec4(position,1.);rim=1.-max(0.,dot(normalize(normalMatrix*normal),normalize(-p.xyz)));gl_Position=projectionMatrix*p;}"
                }
                fragmentShader={
                  "varying float rim;void main(){gl_FragColor=vec4(.22,.54,1.,.58*pow(rim,3.));}"
                }
              />
            </mesh>
          </>
        )}
      </group>
      {rings && (
        <mesh
          geometry={rings.geometry}
          material={rings.material}
          quaternion={rings.quaternion}
        />
      )}
      {moons.map((m, i) => (
        <mesh
          key={m.name}
          ref={(v) => {
            satellites.current[i] = v;
          }}
          geometry={m.geometry}
          material={m.material}
        />
      ))}
      {body.id === "sun" && (
        <sprite scale={[15, 15, 1]}>
          <spriteMaterial
            map={glow}
            blending={THREE.AdditiveBlending}
            transparent
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
      )}
      {(hover ||
        ((labels || selected === body.id) &&
          (!selected || selected === body.id) &&
          body.kind !== "Dwarf planet")) && (
        <Html
          position={[0, radius * 1.55 + 0.16, 0]}
          center
          zIndexRange={[2, 1]}
          style={{ pointerEvents: "none" }}
        >
          <span className={"world-label " + (hover ? "hover" : "")}>
            {body.name}
          </span>
        </Html>
      )}
    </group>
  );
}
function CameraRig({ targets, selected, resetToken, fullView }) {
  const controls = useRef(),
    transition = useRef(true),
    last = useRef(null),
    offset = useRef(new THREE.Vector3()),
    distance = useRef(0);
  const { camera, size, invalidate, gl } = useThree();
  const isWide = size.width > 720;
  useEffect(() => {
    const aspect = size.width / size.height;
    const radius = targets.current[selected]?.radius || 1;
    const overviewDirection = new THREE.Vector3(.11, fullView ? .33 : .61, 1).normalize();
    const halfFov = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    const outerRadius = Math.max(1, ...Object.values(targets.current).map(({group,radius}) => group.position.length() + radius));
    // Fit the entire orbital disc along both axes, including the near edge in perspective.
    const fullDistance = outerRadius * 1.07 * Math.max(
      Math.hypot(1, 1 / (aspect * halfFov)),
      Math.hypot(overviewDirection.x,overviewDirection.z) + overviewDirection.y / halfFov
    );
    distance.current = selected
      ? Math.max(radius * (selected === "saturn" ? 9 : 6.3), 2.3) /
        Math.min(1, aspect)
      : fullView ? fullDistance : Math.max(49, 86 / aspect);
    offset.current
      .copy(
        selected
          ? cameraDirection
          : overviewDirection,
      )
      .multiplyScalar(distance.current);
    transition.current = true;
    last.current = null;
    if (selected)
      camera.setViewOffset(
        size.width,
        size.height,
        isWide ? Math.min(408, size.width * 0.34) / 2 : 0,
        isWide ? 0 : size.height * 0.245,
        size.width,
        size.height,
      );
    else camera.clearViewOffset();
    camera.updateProjectionMatrix();
    invalidate();
  }, [
    camera,
    selected,
    resetToken,
    fullView,
    size.width,
    size.height,
    targets,
    invalidate,
    isWide,
  ]);
  useEffect(() => {
    function moved() {
      transition.current = false;
    }
    const c = controls.current;
    c.addEventListener("start", moved);
    return () => c.removeEventListener("start", moved);
  }, []);
  useFrame((_, dt) => {
    const c = controls.current;
    if (!c) return;
    const target = targets.current[selected]?.group?.position || origin;
    if (last.current && selected) {
      motion.copy(target).sub(last.current);
      c.target.add(motion);
      camera.position.add(motion);
    }
    if (transition.current) {
      const k = 1 - Math.exp(-Math.min(0.06, dt) * 5);
      c.target.lerp(target, k);
      worldPoint.copy(target).add(offset.current);
      camera.position.lerp(worldPoint, k);
      if (
        camera.position.distanceTo(worldPoint) < 0.025 &&
        c.target.distanceTo(target) < 0.02
      ) {
        transition.current = false;
      } else invalidate();
    }
    if (!last.current) last.current = new THREE.Vector3();
    last.current.copy(target);
    c.update();
  });
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.095}
      minDistance={0.65}
      maxDistance={220}
      maxPolarAngle={Math.PI * 0.94}
      zoomSpeed={0.85}
      rotateSpeed={0.67}
      domElement={gl.domElement}
    />
  );
}
function Universe({
  selected,
  onSelect,
  playing,
  speed,
  quality,
  paths,
  labels,
  resetToken,
  fullView,
  onReady,
}) {
  const { nodes } = useGLTF(model),
    cloud = useTexture("/images/cloud-mask.jpg");
  const clock = useRef(0),
    targets = useRef({}),
    belt = useRef(),
    glow = useMemo(glowTexture, []);
  const catalog = useMemo(
    () => Object.values(nodes).filter((n) => n.isMesh && bodyById[n.name]),
    [nodes],
  );
  const satellites = useMemo(
    () => Object.values(nodes).filter((n) => n.userData?.parentBody),
    [nodes],
  );
  const { invalidate, gl } = useThree();
  useEffect(() => {
    onReady(catalog.length);
    return () => glow.dispose();
  }, [catalog, glow, onReady]);
  useFrame((_, dt) => {
    if (playing && !document.hidden)
      clock.current += Math.min(dt, 0.07) * speed;
    if (belt.current) belt.current.rotation.y = clock.current * 0.043;
  }, -2);
  useEffect(() => {
    invalidate();
  }, [playing, speed, labels, paths, selected, quality, invalidate]);
  useEffect(() => {
    gl.domElement.setAttribute(
      "aria-label",
      "Interactive 3D solar system. Drag to orbit, scroll to zoom.",
    );
    gl.domElement.setAttribute("role", "img");
  }, [gl]);
  return (
    <>
      <ambientLight intensity={0.68} />
      <pointLight
        position={[0, 0, 0]}
        intensity={180}
        decay={1.1}
        color="#fff0db"
      />
      <directionalLight
        position={[-28, 22, 15]}
        intensity={0.55}
        color="#d7e1f2"
      />
      <Stars
        radius={155}
        depth={35}
        count={quality === "High" ? 4400 : quality === "Balanced" ? 2100 : 850}
        factor={2.45}
        saturation={0.18}
        fade
        speed={0}
      />
      {catalog.map((n) => (
        <React.Fragment key={n.name}>
          {paths &&
            n.name !== "sun" &&
            (bodyById[n.name].kind !== "Dwarf planet" ||
              selected === n.name) && (
              <Path
                radius={Math.hypot(n.position.x, n.position.z)}
                dwarf={bodyById[n.name].kind === "Dwarf planet"}
              />
            )}
          <World
            source={n}
            moons={satellites.filter((m) => m.userData.parentBody === n.name)}
            rings={n.name === "saturn" ? nodes["saturn-rings"] : null}
            {...{ clock, selected, labels, onSelect, targets, glow, cloud }}
          />
        </React.Fragment>
      ))}
      <mesh
        ref={belt}
        geometry={nodes["asteroid-belt"].geometry}
        material={nodes["asteroid-belt"].material}
      />
      <CameraRig {...{ targets, selected, resetToken, fullView }} />
    </>
  );
}
export default function Planetarium(props) {
  return (
    <Canvas
      camera={{ position: [6, 48, 66], fov: 43, near: 0.05, far: 450 }}
      dpr={
        props.quality === "High"
          ? [1, 2]
          : props.quality === "Balanced"
            ? [1, 1.4]
            : 1
      }
      frameloop={props.playing ? "always" : "demand"}
      gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
      fallback={
        <span className="scene-message">
          WebGL is unavailable. Open the atlas to explore each world.
        </span>
      }
    >
      <Suspense fallback={null}>
        <Universe {...props} />
      </Suspense>
    </Canvas>
  );
}

