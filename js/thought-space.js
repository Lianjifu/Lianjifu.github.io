import * as THREE from "../lib/three/three.module.min.js";

/** Decorative scene. Content and navigation never depend on a WebGL frame. */
export function createThoughtSpace(stage, { onUnavailable }) {
  const mount = stage.querySelector(".space-canvas");
  const compact = matchMedia("(max-width: 760px)").matches;
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: !compact,
    powerPreference: "low-power",
  });
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 80);
  camera.position.set(0, 0.1, 8.6);
  renderer.setClearColor(0x080c18, 0);
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, compact ? 1.35 : 1.7));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  mount.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-hidden", "true");

  let destroyed = false;
  let running = false;
  let frame = 0;
  let previous = 0;
  let elapsed = 0;
  let scroll = 0;
  let slowFrames = 0;
  let sampleFrames = 0;
  let adapted = false;
  const pointer = new THREE.Vector2();
  const resources = new Set();
  const keep = (resource) => {
    resources.add(resource);
    return resource;
  };
  let seed = 3127;
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };
  const world = new THREE.Group();
  world.rotation.set(0.15, 0, -0.24);
  scene.add(world);

  // Soft round point sprites avoid square particles without external textures.
  const spriteCanvas = document.createElement("canvas");
  spriteCanvas.width = spriteCanvas.height = 64;
  const ctx = spriteCanvas.getContext("2d");
  const gradient = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  gradient.addColorStop(0, "#ffffff");
  gradient.addColorStop(0.2, "#ffffff");
  gradient.addColorStop(0.5, "rgba(255,255,255,.38)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 64, 64);
  const sprite = keep(new THREE.CanvasTexture(spriteCanvas));

  function points(positions, color, size, opacity = 1, colors) {
    const geometry = keep(new THREE.BufferGeometry());
    geometry.setAttribute(
      "position",
      new THREE.Float32BufferAttribute(positions, 3),
    );
    if (colors)
      geometry.setAttribute(
        "color",
        new THREE.Float32BufferAttribute(colors, 3),
      );
    const material = keep(
      new THREE.PointsMaterial({
        color,
        size,
        map: sprite,
        transparent: true,
        opacity,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        vertexColors: !!colors,
      }),
    );
    return new THREE.Points(geometry, material);
  }
  function line(positions, color, opacity) {
    const geometry = keep(new THREE.BufferGeometry().setFromPoints(positions));
    return new THREE.Line(
      geometry,
      keep(
        new THREE.LineBasicMaterial({
          color,
          transparent: true,
          opacity,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        }),
      ),
    );
  }

  const starPositions = [];
  for (let i = 0; i < (compact ? 260 : 700); i++) {
    starPositions.push(
      (random() - 0.5) * 15,
      (random() - 0.5) * 10,
      (random() - 0.5) * 8 - 3,
    );
  }
  const stars = points(starPositions, 0x9eaedc, 0.032, 0.8);
  scene.add(stars);

  // Distant spiral arms sit behind the thought-space, moving more slowly than its orbiting core.
  const galaxyPositions = [];
  const galaxyColors = [];
  const galaxyColor = new THREE.Color();
  for (let i = 0; i < (compact ? 800 : 2200); i++) {
    const radius = 2.8 + random() * 3.8;
    const arm = i % 3;
    const angle =
      (arm * Math.PI * 2) / 3 + radius * 0.7 + (random() - 0.5) * 0.45;
    galaxyPositions.push(
      Math.cos(angle) * radius,
      Math.sin(angle) * radius * 0.6,
      (random() - 0.5) * 0.7 - 3.4,
    );
    galaxyColor.setHSL(0.59 + random() * 0.13, 0.45, 0.45 + random() * 0.2);
    galaxyColors.push(galaxyColor.r, galaxyColor.g, galaxyColor.b);
  }
  const galaxy = points(
    galaxyPositions,
    0xffffff,
    compact ? 0.038 : 0.028,
    0.52,
    galaxyColors,
  );
  galaxy.rotation.z = -0.3;
  scene.add(galaxy);
  const brightPositions = [];
  for (let i = 0; i < (compact ? 14 : 32); i++) {
    brightPositions.push(
      (random() - 0.5) * 12,
      (random() - 0.5) * 8,
      -2 - random() * 4,
    );
  }
  const beacons = points(brightPositions, 0xd2d5ff, 0.095, 0.8);
  scene.add(beacons);

  // A hollow particle lattice preserves transparency and reveals the far side as it rotates.
  const corePositions = [];
  const coreColors = [];
  const count = compact ? 1000 : 2300;
  const c = new THREE.Color();
  for (let i = 0; i < count; i++) {
    const y = 1 - (i / (count - 1)) * 2;
    const radius = Math.sqrt(1 - y * y);
    const angle = i * Math.PI * (3 - Math.sqrt(5));
    const scale = 1.52 + Math.sin(angle * 2.5 + y * 7) * 0.06;
    corePositions.push(
      Math.cos(angle) * radius * scale,
      y * scale,
      Math.sin(angle) * radius * scale,
    );
    c.setHSL(0.61 + (y + 1) * 0.035, 0.65, 0.52 + random() * 0.18);
    coreColors.push(c.r, c.g, c.b);
  }
  const core = points(
    corePositions,
    0xffffff,
    compact ? 0.042 : 0.035,
    0.95,
    coreColors,
  );
  world.add(core);

  const wireGeometry = keep(new THREE.IcosahedronGeometry(1.42, 2));
  const edges = keep(new THREE.WireframeGeometry(wireGeometry));
  const mesh = new THREE.LineSegments(
    edges,
    keep(
      new THREE.LineBasicMaterial({
        color: 0x8c83e2,
        transparent: true,
        opacity: 0.075,
        depthWrite: false,
      }),
    ),
  );
  world.add(mesh);
  // Meridians describe the same spherical structure in both the SVG fallback and WebGL scene.
  for (let j = 0; j < 9; j++) {
    const meridian = [];
    for (let i = 0; i <= 160; i++) {
      const a = (i / 160) * Math.PI * 2;
      const angle = (j / 9) * Math.PI;
      meridian.push(
        new THREE.Vector3(
          Math.cos(a) * Math.cos(angle) * 1.55,
          Math.sin(a) * 1.55,
          Math.cos(a) * Math.sin(angle) * 1.55,
        ),
      );
    }
    world.add(line(meridian, 0x8c86e5, 0.18));
  }
  for (let j = 1; j < 8; j++) {
    const latitude = [];
    const phi = (j / 8) * Math.PI;
    for (let i = 0; i <= 160; i++) {
      const a = (i / 160) * Math.PI * 2;
      latitude.push(
        new THREE.Vector3(
          Math.cos(a) * Math.sin(phi) * 1.55,
          Math.cos(phi) * 1.55,
          Math.sin(a) * Math.sin(phi) * 1.55,
        ),
      );
    }
    world.add(line(latitude, 0x737bc4, 0.1));
  }

  const orbits = [];
  const palette = [0xc0a5ff, 0x749cfc, 0x79ced9, 0x9783e8];
  const tilts = [
    [0.65, 0.2, 0.1],
    [-0.55, -0.3, 0.7],
    [1.1, 0.2, -0.9],
    [0.2, 0.6, -1.1],
  ];
  for (let j = 0; j < 4; j++) {
    const group = new THREE.Group();
    group.rotation.set(...tilts[j]);
    const major = 2.38 + j * 0.13;
    const minor = 1.85 + j * 0.09;
    const curve = [];
    for (let i = 0; i <= 300; i++) {
      const a = (i / 300) * Math.PI * 2;
      curve.push(
        new THREE.Vector3(Math.cos(a) * major, Math.sin(a) * minor, 0),
      );
    }
    group.add(line(curve, palette[j], 0.58));
    const dust = [];
    for (let i = 0; i < (compact ? 150 : 340); i++) {
      const a = random() * Math.PI * 2;
      dust.push(
        Math.cos(a) * major + (random() - 0.5) * 0.09,
        Math.sin(a) * minor + (random() - 0.5) * 0.09,
        (random() - 0.5) * 0.05,
      );
    }
    group.add(points(dust, palette[j], 0.029, 0.65));
    const travelers = points(new Float32Array(24 * 3), palette[j], 0.075, 0.95);
    group.add(travelers);
    world.add(group);
    orbits.push({
      group,
      major,
      minor,
      travelers,
      offset: j * 1.63,
      speed: 0.07 + j * 0.018,
    });
  }

  // Sparse connections are refreshed in place instead of creating geometry each frame.
  const connectionGeometry = keep(new THREE.BufferGeometry());
  connectionGeometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(
      [
        1.2, 0.7, 0.5, 2.1, 0.3, 0.2, -1.1, -0.8, 0.6, -2.1, 0.2, 0.1, 0.5, 1.3,
        0.4, -0.3, 2.2, -0.2,
      ],
      3,
    ),
  );
  const connections = new THREE.LineSegments(
    connectionGeometry,
    keep(
      new THREE.LineBasicMaterial({
        color: 0xc3b0ff,
        transparent: true,
        opacity: 0.16,
        depthWrite: false,
      }),
    ),
  );
  world.add(connections);

  function resize() {
    if (destroyed) return;
    const width = Math.max(1, mount.clientWidth);
    const height = Math.max(1, mount.clientHeight);
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    // Keep the full orbital silhouette visible even in a portrait viewport.
    camera.position.z = camera.aspect < 1.1 ? 9.8 : 8.6;
    camera.updateProjectionMatrix();
    if (!running) draw();
  }
  const resizeObserver = new ResizeObserver(resize);
  function onPointer(event) {
    pointer.set(
      (event.clientX / innerWidth - 0.5) * 0.45,
      (event.clientY / innerHeight - 0.5) * 0.3,
    );
  }
  function resetPointer() {
    pointer.set(0, 0);
  }
  function onContextLost(event) {
    event.preventDefault();
    dispose();
    onUnavailable(new Error("WebGL context lost"));
  }
  renderer.domElement.addEventListener("webglcontextlost", onContextLost);
  window.addEventListener("pointermove", onPointer, { passive: true });
  document.documentElement.addEventListener("pointerleave", resetPointer);

  function draw() {
    if (destroyed) return;
    world.rotation.y = elapsed * 0.032 + pointer.x;
    world.rotation.x = 0.15 + pointer.y;
    world.position.y = scroll * 0.25;
    world.scale.setScalar(1 - scroll * 0.1);
    core.rotation.y = elapsed * -0.019;
    mesh.rotation.y = elapsed * -0.019;
    stars.rotation.z = elapsed * 0.002;
    galaxy.rotation.z = -0.3 + elapsed * 0.006;
    galaxy.position.x = pointer.x * -0.2;
    beacons.material.opacity = 0.7 + Math.sin(elapsed * 0.35) * 0.1;
    connections.material.opacity =
      0.07 + (Math.sin(elapsed * 0.65) + 1) * 0.045;
    orbits.forEach((orbit) => {
      const positions = orbit.travelers.geometry.attributes.position;
      for (let i = 0; i < 24; i++) {
        const angle =
          elapsed * orbit.speed +
          orbit.offset +
          (Math.floor(i / 8) * Math.PI * 2) / 3 -
          (i % 8) * 0.011;
        positions.setXYZ(
          i,
          Math.cos(angle) * orbit.major,
          Math.sin(angle) * orbit.minor,
          0,
        );
      }
      positions.needsUpdate = true;
    });
    try {
      renderer.render(scene, camera);
    } catch (error) {
      dispose();
      onUnavailable(error);
    }
  }
  function tick(now) {
    if (!running || destroyed) return;
    const delta = previous ? now - previous : 16;
    previous = now;
    elapsed += Math.min(delta, 50) / 1000;
    // Adapt once after sustained slow frames, avoiding oscillation between quality levels.
    if (!adapted && ++sampleFrames <= 150 && delta > 28) slowFrames++;
    if (!adapted && sampleFrames >= 150) {
      adapted = true;
      if (slowFrames > 50) {
        renderer.setPixelRatio(1);
        core.geometry.setDrawRange(0, Math.floor(count * 0.65));
        resize();
      }
    }
    draw();
    if (!destroyed && running) frame = requestAnimationFrame(tick);
  }
  function setRunning(value) {
    if (destroyed || running === value) return;
    running = value;
    stage.dataset.animating = String(value);
    cancelAnimationFrame(frame);
    previous = 0;
    if (value) frame = requestAnimationFrame(tick);
  }
  function dispose() {
    if (destroyed) return;
    destroyed = true;
    running = false;
    stage.dataset.animating = "false";
    cancelAnimationFrame(frame);
    resizeObserver.disconnect();
    window.removeEventListener("pointermove", onPointer);
    document.documentElement.removeEventListener("pointerleave", resetPointer);
    renderer.domElement.removeEventListener("webglcontextlost", onContextLost);
    resources.forEach((resource) => resource.dispose());
    renderer.dispose();
    renderer.domElement.remove();
  }
  resizeObserver.observe(mount);
  resize();
  if (destroyed) throw new Error("Initial thought-space frame failed");
  return {
    setRunning,
    setScroll(value) {
      scroll = value;
    },
    dispose,
  };
}
