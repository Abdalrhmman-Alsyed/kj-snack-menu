// Procedural 3D burger (three.js): scattered pieces → assemble → scroll-driven exploded "anatomy".
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { mulberry32 } from './burst.js';

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const smooth = (a, b, v) => { const t = clamp01((v - a) / (b - a)); return t * t * (3 - 2 * t); };
const lerp = (a, b, t) => a + (b - a) * t;

// deterministic pseudo-noise from a 3D position (sum of sines) — identical for duplicated seam vertices
function n3(x, y, z) {
  return (
    Math.sin(x * 5.1 + y * 2.3 + z * 1.7) * 0.5 +
    Math.sin(z * 6.7 - x * 3.3 + y * 1.1) * 0.35 +
    Math.sin((x + z) * 11.3 + y * 7.7) * 0.2 +
    Math.sin(x * 23.1 - z * 19.7 + y * 3.1) * 0.1
  );
}

function canvasTex(size, draw, { srgb = true, repeat = 1 } = {}) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const g = c.getContext('2d');
  draw(g, size);
  const t = new THREE.CanvasTexture(c);
  if (srgb) t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  if (repeat !== 1) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(repeat, repeat); }
  return t;
}

function blobs(g, size, n, rnd, color, rMin, rMax) {
  for (let i = 0; i < n; i++) {
    const x = rnd() * size, y = rnd() * size, r = rMin + rnd() * (rMax - rMin);
    const grd = g.createRadialGradient(x, y, 0, x, y, r);
    grd.addColorStop(0, color);
    grd.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = grd;
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
}

function makeTextures() {
  const rnd = mulberry32(9);
  const bun = canvasTex(512, (g, s) => {
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, s, s);
    blobs(g, s, 140, rnd, 'rgba(120,55,10,0.10)', 10, 60);
    blobs(g, s, 60, rnd, 'rgba(255,255,255,0.35)', 8, 30);
  });
  const patty = canvasTex(512, (g, s) => {
    g.fillStyle = '#7a4325'; g.fillRect(0, 0, s, s);
    blobs(g, s, 260, rnd, 'rgba(40,16,6,0.55)', 4, 22);
    blobs(g, s, 160, rnd, 'rgba(170,95,50,0.45)', 3, 14);
    for (let i = 0; i < 1600; i++) { g.fillStyle = rnd() > 0.5 ? 'rgba(30,12,4,.6)' : 'rgba(190,120,70,.4)'; g.fillRect(rnd() * s, rnd() * s, 2 + rnd() * 3, 2 + rnd() * 3); }
  }, { repeat: 1 });
  const tomato = canvasTex(512, (g, s) => {
    const c = s / 2;
    g.fillStyle = '#c41a12'; g.fillRect(0, 0, s, s);
    g.fillStyle = '#e8402c'; g.beginPath(); g.arc(c, c, s * 0.46, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#f2634a'; g.beginPath(); g.arc(c, c, s * 0.16, 0, Math.PI * 2); g.fill();
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2 + 0.3;
      g.save(); g.translate(c + Math.cos(a) * s * 0.28, c + Math.sin(a) * s * 0.28); g.rotate(a);
      g.fillStyle = '#ff8f6a'; g.beginPath(); g.ellipse(0, 0, s * 0.1, s * 0.075, 0, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#ffd98a';
      for (let j = 0; j < 6; j++) { g.beginPath(); g.ellipse((rnd() - 0.5) * s * 0.12, (rnd() - 0.5) * s * 0.08, 6, 3.5, rnd() * 3, 0, Math.PI * 2); g.fill(); }
      g.restore();
    }
    blobs(g, s, 40, rnd, 'rgba(255,255,255,0.12)', 10, 40);
  });
  const pickle = canvasTex(256, (g, s) => {
    const c = s / 2;
    g.fillStyle = '#2f5a14'; g.fillRect(0, 0, s, s);
    g.fillStyle = '#87b33a'; g.beginPath(); g.arc(c, c, s * 0.44, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#b7d870'; g.beginPath(); g.arc(c, c, s * 0.24, 0, Math.PI * 2); g.fill();
    g.fillStyle = '#e9f2b8';
    for (let k = 0; k < 9; k++) { const a = (k / 9) * Math.PI * 2; g.beginPath(); g.ellipse(c + Math.cos(a) * s * 0.17, c + Math.sin(a) * s * 0.17, 7, 4, a, 0, Math.PI * 2); g.fill(); }
  });
  const shadow = canvasTex(256, (g, s) => {
    const grd = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    grd.addColorStop(0, 'rgba(60,20,0,0.55)');
    grd.addColorStop(0.55, 'rgba(60,20,0,0.22)');
    grd.addColorStop(1, 'rgba(60,20,0,0)');
    g.fillStyle = grd; g.fillRect(0, 0, s, s);
  }, { srgb: false });
  return { bun, patty, tomato, pickle, shadow };
}

// ---------------------------------------------------------------- parts
function bunColors(geo, isTop) {
  const pos = geo.attributes.position;
  const col = new Float32Array(pos.count * 3);
  const toast = new THREE.Color('#e48f35'), dark = new THREE.Color('#b85a17'), crumb = new THREE.Color('#f6d9a2'), c = new THREE.Color();
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i), y = pos.getY(i), z = pos.getZ(i);
    const r = Math.hypot(x, z);
    if (isTop) {
      if (y < 0.035 && r < 0.97) c.copy(crumb);
      else c.copy(toast).lerp(dark, Math.pow(clamp01((y - 0.1) / 0.8), 1.6) * 0.75 + n3(x, y, z) * 0.06);
    } else {
      if (y > 0.36 && r < 0.93) c.copy(crumb);
      else c.copy(toast).lerp(dark, clamp01(0.25 - y) * 0.9 + n3(x, y, z) * 0.05);
    }
    col.set([c.r, c.g, c.b], i * 3);
  }
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
}

function profileTop() {
  const R = 1.1, H = 0.86;
  const pts = [new THREE.Vector2(0.001, 0), new THREE.Vector2(0.9, 0), new THREE.Vector2(1.04, 0.025)];
  for (let i = 0; i <= 28; i++) {
    const f = (i / 28) * (Math.PI / 2);
    pts.push(new THREE.Vector2(Math.max(0.001, R * Math.pow(Math.cos(f), 0.52)), 0.06 + H * Math.pow(Math.sin(f), 0.85)));
  }
  return { pts, R, H };
}
function domeAt(f) { // point + outward normal on the top bun dome for angle f
  const R = 1.1, H = 0.86, e = 1e-3;
  const p = (ff) => [R * Math.pow(Math.cos(ff), 0.52), 0.06 + H * Math.pow(Math.sin(ff), 0.85)];
  const [r, y] = p(f), [r2, y2] = p(f + e);
  const tr = r2 - r, ty = y2 - y, L = Math.hypot(tr, ty);
  return { r, y, nr: ty / L, ny: -tr / L };
}

function buildParts(tex, rnd) {
  const parts = [];
  const add = (name, obj, h, radius, label) => { parts.push({ name, obj, h, radius, label }); };

  // 0 — bottom bun
  {
    const pts = [[0.001, 0], [0.9, 0], [1.03, 0.045], [1.07, 0.18], [1.04, 0.31], [0.96, 0.375], [0.001, 0.385]].map(([x, y]) => new THREE.Vector2(x, y));
    const geo = new THREE.LatheGeometry(pts, 96);
    bunColors(geo, false);
    const mat = new THREE.MeshPhysicalMaterial({ map: tex.bun, vertexColors: true, roughness: 0.55, clearcoat: 0.25, clearcoatRoughness: 0.6, side: THREE.DoubleSide });
    const g = new THREE.Group(); g.add(new THREE.Mesh(geo, mat));
    add('bunBottom', g, 0.385, 1.07, null);
  }
  // 1 — lettuce
  {
    const segA = 180, segR = 8, pos = [], col = [], idx = [];
    const light = new THREE.Color('#9ed24f'), dark = new THREE.Color('#4f9a2c'), c = new THREE.Color();
    for (let ir = 0; ir <= segR; ir++) {
      const t = ir / segR;
      for (let ia = 0; ia <= segA; ia++) {
        const a = (ia / segA) * Math.PI * 2;
        const R = 1.22 + 0.07 * Math.sin(a * 7) + 0.045 * Math.sin(a * 13 + 1.3) + 0.03 * Math.sin(a * 29);
        const r = lerp(0.15, R, t);
        const y = 0.03 + t * t * (0.07 * Math.sin(a * 11) + 0.04 * Math.sin(a * 23 + 2)) - t * t * t * 0.07;
        pos.push(Math.cos(a) * r, y, Math.sin(a) * r);
        c.copy(dark).lerp(light, t * 0.9 + 0.1 * Math.sin(a * 17));
        col.push(c.r, c.g, c.b);
      }
    }
    for (let ir = 0; ir < segR; ir++) for (let ia = 0; ia < segA; ia++) {
      const a = ir * (segA + 1) + ia, b = a + segA + 1;
      idx.push(a, b, a + 1, b, b + 1, a + 1);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
    geo.setIndex(idx); geo.computeVertexNormals();
    const mat = new THREE.MeshPhysicalMaterial({ vertexColors: true, roughness: 0.45, clearcoat: 0.4, clearcoatRoughness: 0.35, side: THREE.DoubleSide, sheen: 0.4, sheenColor: new THREE.Color('#d8ff9a') });
    const g = new THREE.Group(); g.add(new THREE.Mesh(geo, mat));
    add('lettuce', g, 0.08, 1.22, 1);
  }
  // 2 — patty
  {
    const pts = [[0.001, 0], [0.92, 0], [1.04, 0.035], [1.09, 0.17], [1.04, 0.305], [0.92, 0.34], [0.001, 0.34]].map(([x, y]) => new THREE.Vector2(x, y));
    const geo = new THREE.LatheGeometry(pts, 120);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const r = Math.hypot(x, z);
      const n = n3(x * 1.3, y * 2, z * 1.3);
      const k = 1 + n * 0.03 * smooth(0.6, 1.0, r);
      p.setXYZ(i, x * k, y + (y > 0.2 ? n * 0.02 : -n * 0.012) * smooth(0.0, 0.5, r), z * k);
    }
    geo.computeVertexNormals();
    const mat = new THREE.MeshStandardMaterial({ map: tex.patty, bumpMap: tex.patty, bumpScale: 2.2, roughness: 0.78, color: '#ffffff' });
    const g = new THREE.Group(); g.add(new THREE.Mesh(geo, mat));
    add('patty', g, 0.34, 1.09, 2);
  }
  // 3 — cheese
  {
    const geo = new THREE.PlaneGeometry(2.1, 2.1, 48, 48);
    geo.rotateX(-Math.PI / 2);
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z);
      const d = smooth(0.92, 1.5, r);
      p.setY(i, 0.012 - d * 0.42 - d * d * 0.1 * (1 + Math.sin(x * 4 + z * 3)) + Math.sin(x * 3.1) * Math.cos(z * 2.7) * 0.006);
      // pull corners slightly inward as they drape
      const pull = 1 - d * 0.12;
      p.setX(i, x * pull); p.setZ(i, z * pull);
    }
    geo.computeVertexNormals();
    const mat = new THREE.MeshPhysicalMaterial({ color: '#ffb31a', roughness: 0.32, clearcoat: 0.55, clearcoatRoughness: 0.25, side: THREE.DoubleSide, emissive: '#ff7a00', emissiveIntensity: 0.08 });
    const m = new THREE.Mesh(geo, mat); m.rotation.y = 0.35;
    const g = new THREE.Group(); g.add(m);
    add('cheese', g, 0.04, 1.2, 3);
  }
  // 4 — pickles
  {
    const g = new THREE.Group();
    const side = new THREE.MeshStandardMaterial({ color: '#3d6b1c', roughness: 0.4 });
    const top = new THREE.MeshPhysicalMaterial({ map: tex.pickle, roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.2 });
    const geo = new THREE.CylinderGeometry(0.27, 0.27, 0.05, 40);
    geo.translate(0, 0.025, 0);
    for (let k = 0; k < 4; k++) {
      const a = (k / 4) * Math.PI * 2 + 0.5, rr = 0.52 + rnd() * 0.08;
      const m = new THREE.Mesh(geo, [side, top, top]);
      m.position.set(Math.cos(a) * rr, rnd() * 0.02, Math.sin(a) * rr);
      m.rotation.set((rnd() - 0.5) * 0.12, rnd() * 3, (rnd() - 0.5) * 0.12);
      g.add(m);
    }
    add('pickles', g, 0.06, 0.82, 4);
  }
  // 5 — tomato slices
  {
    const g = new THREE.Group();
    const side = new THREE.MeshPhysicalMaterial({ color: '#d5221a', roughness: 0.25, clearcoat: 0.8, clearcoatRoughness: 0.15 });
    const top = new THREE.MeshPhysicalMaterial({ map: tex.tomato, roughness: 0.28, clearcoat: 0.7, clearcoatRoughness: 0.2 });
    const geo = new THREE.CylinderGeometry(0.62, 0.62, 0.09, 56);
    geo.translate(0, 0.045, 0);
    [[-0.4, 0, 0.1], [0.42, 0.025, -0.08]].forEach(([x, y, z], i) => {
      const m = new THREE.Mesh(geo, [side, top, top]);
      m.position.set(x, y, z);
      m.rotation.set(0, i * 1.4, (i ? -1 : 1) * 0.04);
      g.add(m);
    });
    add('tomato', g, 0.11, 1.04, 5);
  }
  // 6 — onion rings
  {
    const g = new THREE.Group();
    const mat = new THREE.MeshPhysicalMaterial({ color: '#f1def4', roughness: 0.3, clearcoat: 0.6, clearcoatRoughness: 0.25, emissive: '#7a2a7a', emissiveIntensity: 0.06 });
    [[0.62, 0.05, 0.1, 0.05], [0.44, 0.045, -0.25, -0.1], [0.27, 0.04, 0.35, -0.2]].forEach(([R, tR, x, z]) => {
      const m = new THREE.Mesh(new THREE.TorusGeometry(R, tR, 14, 72), mat);
      m.rotation.x = Math.PI / 2;
      m.position.set(x, tR, z);
      g.add(m);
    });
    add('onion', g, 0.1, 0.95, 6);
  }
  // 7 — top bun + sesame
  {
    const { pts } = profileTop();
    const geo = new THREE.LatheGeometry(pts, 110);
    bunColors(geo, true);
    const mat = new THREE.MeshPhysicalMaterial({ map: tex.bun, vertexColors: true, roughness: 0.42, clearcoat: 0.45, clearcoatRoughness: 0.45, side: THREE.DoubleSide, sheen: 0.3, sheenColor: new THREE.Color('#ffcf8a') });
    const g = new THREE.Group(); g.add(new THREE.Mesh(geo, mat));
    const N = 78;
    const seeds = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshStandardMaterial({ color: '#fff1cf', roughness: 0.5 }), N);
    const d = new THREE.Object3D(), nrm = new THREE.Vector3();
    for (let i = 0; i < N; i++) {
      const f = 0.3 + rnd() * 1.18, th = rnd() * Math.PI * 2;
      const s = domeAt(Math.min(f, 1.5));
      nrm.set(s.nr * Math.cos(th), s.ny, s.nr * Math.sin(th)).normalize();
      d.position.set(s.r * Math.cos(th), s.y, s.r * Math.sin(th)).addScaledVector(nrm, 0.004);
      d.lookAt(d.position.clone().add(nrm));
      d.rotateZ(rnd() * Math.PI);
      d.scale.set(0.045, 0.024, 0.014);
      d.updateMatrix();
      seeds.setMatrixAt(i, d.matrix);
    }
    g.add(seeds);
    add('bunTop', g, 0.92, 1.1, 7);
  }

  // stack heights (assembled)
  const base = [0, 0.37, 0.43, 0.77, 0.8, 0.85, 0.955, 1.0];
  parts.forEach((p, i) => { p.baseY = base[i]; });
  return parts;
}

// ---------------------------------------------------------------- scene
export function createBurger({ canvas, heroSpot, anatomySpot, labelsRoot, reduced = false }) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch (e) {
    return null;
  }
  if (!renderer.getContext()) return null;

  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  scene.environmentIntensity = 0.55;

  const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
  const CAMZ = 16;
  camera.position.set(0, 0, CAMZ);

  scene.add(new THREE.HemisphereLight('#fff4e0', '#8a4a1a', 1.0));
  const key = new THREE.DirectionalLight('#fff1dc', 2.6); key.position.set(4, 6, 6); scene.add(key);
  const rim = new THREE.DirectionalLight('#ffd08a', 2.4); rim.position.set(-6, 3, -4); scene.add(rim);
  const fill = new THREE.DirectionalLight('#ffe7c4', 0.7); fill.position.set(-3, -2, 6); scene.add(fill);

  const rnd = mulberry32(21);
  const tex = makeTextures();
  const parts = buildParts(tex, rnd);
  const CENTER = 0.96; // vertical centre of the assembled stack
  // extra lift of each layer when exploded (cheese drapes down, so it gets more room above the patty)
  const EXTRA = [0, 0.5, 1.0, 1.85, 2.35, 2.85, 3.35, 3.95];

  const root = new THREE.Group();
  const tilt = new THREE.Group();
  const spin = new THREE.Group();
  root.add(tilt); tilt.add(spin);
  scene.add(root);

  const shadow = new THREE.Mesh(new THREE.PlaneGeometry(3.4, 3.4), new THREE.MeshBasicMaterial({ map: tex.shadow, transparent: true, depthWrite: false, opacity: 0.85 }));
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.y = -CENTER - 0.02;
  tilt.add(shadow);

  // scattered start state (relative offsets)
  parts.forEach((p, i) => {
    spin.add(p.obj);
    const a = (i / parts.length) * Math.PI * 2 + rnd() * 0.6;
    const R = 2.1 + rnd() * 1.4;
    p.off = {
      x: Math.cos(a) * R * 1.25,
      y: Math.sin(a) * R * 0.8 + (i === 7 ? 1.8 : 0),
      z: (rnd() - 0.5) * 3,
      rx: (rnd() - 0.5) * 2.6,
      ry: (rnd() - 0.5) * 3,
      rz: (rnd() - 0.5) * 2.6,
      s: 0,
    };
    p.explRot = (rnd() - 0.5) * 0.5;
    p.label = labelsRoot ? labelsRoot.querySelector(`[data-part="${p.label}"]`) : null;
  });

  const state = { progress: 0, scatter: 1, squash: 1, mx: 0, my: 0, tmx: 0, tmy: 0, visible: true, intro: false };
  const clock = new THREE.Clock();

  // ---------- layout
  let W = 1, H = 1, isMobile = false, gap = 60, labelW = {};
  function resize() {
    const r = canvas.parentElement.getBoundingClientRect();
    W = Math.max(1, r.width); H = Math.max(1, r.height);
    renderer.setSize(W, H, false);
    camera.aspect = W / H;
    camera.updateProjectionMatrix();
    isMobile = W < 980;
    if (labelsRoot) {
      gap = labelsRoot.querySelector('.callout__line')?.offsetWidth || 40;
      parts.forEach((p) => { if (p.label) labelW[p.name] = p.label.querySelector('.callout__box').offsetWidth; });
    }
  }
  const ro = new ResizeObserver(resize);
  ro.observe(canvas.parentElement);
  resize();

  const visH = () => 2 * CAMZ * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
  function target(el, fitW, fitH, fill) {
    const cr = canvas.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const wpp = visH() / H; // world units per px
    const cx = r.left + r.width / 2 - cr.left, cy = r.top + r.height / 2 - cr.top;
    const s = Math.min((r.width * wpp * fill) / fitW, (r.height * wpp * fill) / fitH);
    return { x: (cx / W - 0.5) * W * wpp, y: -(cy / H - 0.5) * H * wpp, s };
  }

  const v = new THREE.Vector3();
  function render() {
    const dt = Math.min(clock.getDelta(), 0.05);
    const t = clock.elapsedTime;
    const p = state.progress;

    // phases from the scroll progress of the pinned stage
    const move = smooth(0.03, 0.2, p);
    const e = smooth(0.18, 0.44, p) * (1 - smooth(0.78, 0.9, p));

    const ex = isMobile ? 1.4 : 1; // phones: spread the layers further so the labels breathe
    const fitH = lerp(2.05, 1.95 + EXTRA[7] * ex + 0.3, e);
    const a = target(heroSpot, 2.55, 2.05, 0.72);
    const b = target(anatomySpot, 2.5, fitH, 0.95);
    root.position.set(lerp(a.x, b.x, move), lerp(a.y, b.y, move), 0);
    const s = lerp(a.s, b.s, move);
    root.scale.set(s, s * state.squash, s);

    // pointer parallax
    state.mx += (state.tmx - state.mx) * Math.min(1, dt * 4);
    state.my += (state.tmy - state.my) * Math.min(1, dt * 4);
    tilt.rotation.x = 0.36 + e * 0.12 + state.my * 0.12 - state.scatter * 0.2;
    tilt.rotation.z = -state.mx * 0.05;
    spin.rotation.y = (reduced ? 0 : t * 0.22) + p * Math.PI * 1.6 + state.mx * 0.35;
    shadow.material.opacity = 0.85 * (1 - e) * (1 - state.scatter);

    parts.forEach((part, i) => {
      const o = part.off;
      const yA = part.baseY - CENTER;
      const yE = yA + (EXTRA[i] - EXTRA[7] / 2) * ex;
      const float = state.scatter * Math.sin(t * 1.6 + i * 1.3) * 0.12;
      part.obj.position.set(o.x, lerp(yA, yE, e) + o.y + float, o.z);
      part.obj.rotation.set(o.rx + e * 0.15 * Math.sin(i), o.ry + e * part.explRot * 2 + state.scatter * t * 0.4, o.rz);
      part.obj.scale.setScalar(Math.max(0.0001, o.s));

      // callouts follow the 3D layer
      if (part.label) {
        const k = 7 - part.label.dataset.part; // top layer first
        const vis = clamp01((e - 0.35 - k * 0.07) / 0.2) * move;
        part.label.style.setProperty('--v', vis.toFixed(3));
        if (vis > 0.001) {
          part.obj.getWorldPosition(v);
          v.y += (part.h / 2) * s;
          v.project(camera);
          const sx = (v.x + 1) / 2 * W, sy = (1 - v.y) / 2 * H;
          const rpx = (part.radius * s) / (visH() / H) * 0.92;
          const right = isMobile ? true : part.label.dataset.part % 2 === 1;
          let ex = sx + (right ? rpx : -rpx);
          const bw = labelW[part.name] || 160;
          if (right) ex = Math.min(ex, W - 10 - gap - bw); else ex = Math.max(ex, 10 + gap + bw);
          part.label.classList.toggle('is-r', right);
          part.label.classList.toggle('is-l', !right);
          part.label.style.transform = `translate3d(${ex.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`;
        }
      }
    });

    renderer.render(scene, camera);
  }

  let running = false;
  function start() { if (!running) { running = true; clock.getDelta(); renderer.setAnimationLoop(render); } }
  function stop() { if (running) { running = false; renderer.setAnimationLoop(null); } }
  const io = new IntersectionObserver(([en]) => { en.isIntersecting ? start() : stop(); }, { rootMargin: '100px' });
  io.observe(canvas);
  start();

  window.addEventListener('pointermove', (ev) => {
    state.tmx = (ev.clientX / window.innerWidth) * 2 - 1;
    state.tmy = (ev.clientY / window.innerHeight) * 2 - 1;
  }, { passive: true });

  // ---------- intro: scattered pieces fly together
  function intro({ onLand } = {}) {
    const tl = gsap.timeline();
    if (reduced) {
      parts.forEach((p) => Object.assign(p.off, { x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 }));
      tl.to(parts.map((p) => p.off), { s: 1, duration: 0.6, stagger: 0.03, ease: 'power2.out' })
        .to(state, { scatter: 0, duration: 0.6 }, 0)
        .add(() => onLand && onLand());
      return tl;
    }
    tl.to(parts.map((p) => p.off), { s: 1, duration: 0.7, stagger: { each: 0.06, from: 'random' }, ease: 'back.out(2)' });
    tl.addLabel('gather', '+=0.25');
    parts.forEach((p, i) => {
      const last = i === parts.length - 1;
      tl.to(p.off, {
        x: 0, z: 0, rx: 0, ry: 0, rz: 0,
        duration: last ? 0.95 : 0.85,
        ease: 'expo.inOut',
      }, `gather+=${i * 0.075}`);
      tl.to(p.off, { y: 0, duration: last ? 1.0 : 0.85, ease: last ? 'bounce.out' : 'expo.inOut' }, `gather+=${i * 0.075}`);
    });
    tl.to(state, { scatter: 0, duration: 1.2, ease: 'power2.inOut' }, 'gather');
    tl.add(() => {
      gsap.fromTo(state, { squash: 0.84 }, { squash: 1, duration: 0.9, ease: 'elastic.out(1.2, 0.35)' });
      onLand && onLand();
    }, `gather+=${(parts.length - 1) * 0.075 + 0.62}`);
    return tl;
  }

  return {
    intro,
    setProgress(p) { state.progress = p; },
    resize,
    dispose() { stop(); ro.disconnect(); io.disconnect(); renderer.dispose(); },
  };
}

/** flat SVG burger used when WebGL is unavailable */
export const fallbackBurgerSVG = `<svg class="fallback-burger" viewBox="0 0 240 220" aria-hidden="true">
  <g stroke="#151214" stroke-width="5" stroke-linejoin="round">
    <path d="M24 96c0-44 42-72 96-72s96 28 96 72z" fill="#EE9636"/>
    <path d="M14 112c14-12 24 8 40 0s26 10 40 0 26 10 40 0 26 10 40 0 20 6 32 0" fill="none" stroke="#3E9E3A" stroke-width="12" stroke-linecap="round"/>
    <path d="M22 116h196l-16 20H38z" fill="#FFB31A"/>
    <rect x="18" y="128" width="204" height="34" rx="17" fill="#6B3418"/>
    <path d="M22 172h196c0 20-18 30-38 30H60c-20 0-38-10-38-30z" fill="#EE9636"/>
  </g>
  <g fill="#FFF1CF"><ellipse cx="80" cy="62" rx="7" ry="4" transform="rotate(-20 80 62)"/><ellipse cx="120" cy="48" rx="7" ry="4"/><ellipse cx="160" cy="62" rx="7" ry="4" transform="rotate(20 160 62)"/><ellipse cx="100" cy="80" rx="7" ry="4"/><ellipse cx="140" cy="80" rx="7" ry="4"/></g>
</svg>`;
