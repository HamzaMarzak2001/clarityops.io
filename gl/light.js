/* ClarityOps v2 · LIGHT · the focal sequence.
   The system, made of light. Thousands of particles in the brand's light hold
   the ClarityOps mark. As you scroll they scatter into disconnected tools,
   regroup into seven database nodes with automations streaming between them
   and an AI core at the centre, then flow back into the mark, which sets as
   liquid glass while the real Notion systems float in around it.
   Particle physics and the glass studio follow the canvasui recipes. */

import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';
import { toCreasedNormals } from 'three/addons/utils/BufferGeometryUtils.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const MARK_SVG = 'assets/logos/logo-icon-white.svg';
const SCREENS = ['labinno', 'bourbon-holdings', 'fryaway', 'mae-media'].map(s => `assets/images/case-studies/${s}/hero.png`);
const LIGHT_A = new THREE.Color(0xe4ff5a);   // the brand's light, hot
const LIGHT_B = new THREE.Color(0x6eb707);   // the brand's light, deep
const RING = 7;                              // seven databases around one AI core
const LINKS = [[0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [1, 4], [2, 5], [3, 6]];   // ten automations, node 0 is the core

const clamp01 = v => Math.min(1, Math.max(0, v));
const win = (t, a, b) => clamp01((t - a) / (b - a));
const out3 = x => 1 - Math.pow(1 - x, 3);
const inout = x => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const lerp = (a, b, t) => a + (b - a) * t;
const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }

/* ── particles: soft additive discs in the brand's light ─────── */
const VERT = `
in float aSeed; in float aGlow;
uniform float uTime, uSize, uDpr, uRefDist, uDrift;
out float vGlow; out float vSeed;
void main() {
  vec3 p = position;
  float t = uTime + aSeed * 39.0;
  p += uDrift * 0.006 * vec3(sin(t * 1.7 + aSeed * 61.0), cos(t * 1.3 + aSeed * 23.0), sin(t * 2.3 + aSeed * 47.0));
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  float jitter = 0.55 + 0.9 * fract(aSeed * 7.13);
  gl_PointSize = clamp(uSize * uDpr * jitter * (uRefDist / max(-mv.z, 0.1)), 0.0, 40.0);
  vGlow = aGlow; vSeed = aSeed;
  gl_Position = projectionMatrix * mv;
}`;
const FRAG = `
precision highp float;
in float vGlow; in float vSeed;
uniform vec3 uA, uB; uniform float uTime, uAlpha;
out vec4 outColor;
void main() {
  vec2 c = gl_PointCoord - 0.5; float r2 = dot(c, c);
  float core = 1.0 - smoothstep(0.015, 0.08, r2);
  float halo = 1.0 - smoothstep(0.05, 0.25, r2);
  float tw = 0.7 + 0.3 * sin(uTime * 2.2 + vSeed * 80.0);
  vec3 col = mix(uB, uA, vGlow);
  float a = (core * 0.85 + halo * 0.3) * tw * (0.45 + 0.55 * vGlow) * uAlpha;
  if (a < 0.015) discard;
  outColor = vec4(col * a, a);
}`;

/* ── streams: automations flowing along the links ─────────────── */
const STREAM_VERT = `
out vec2 vUv;
void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`;
const STREAM_FRAG = `
precision highp float;
in vec2 vUv;
uniform vec3 uA, uB; uniform float uTime, uAlpha, uPhase;
out vec4 outColor;
void main() {
  float flow = fract(vUv.x * 3.0 - uTime * 0.9 - uPhase);
  float pulse = pow(1.0 - flow, 6.0);
  float base = 0.18;
  float edge = 1.0 - smoothstep(0.35, 0.5, abs(vUv.y - 0.5));
  float a = (base + pulse * 1.4) * edge * uAlpha;
  outColor = vec4(mix(uB, uA, pulse) * a, a);
}`;

/* ── targets: three shapes the same particles take ────────────── */
/* the mark, sampled from the SVG by alpha, given a little thickness */
async function markTargets(n) {
  const svg = await (await fetch(MARK_SVG)).text();
  const img = new Image(); img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  await img.decode();
  const S = 480, [c, x] = canvas(S, S); x.drawImage(img, 0, 0, S, S);
  const d = x.getImageData(0, 0, S, S).data;
  const px = [], w = []; let total = 0;
  for (let i = 0; i < S * S; i++) { const a = d[i * 4 + 3]; if (a < 12) continue; total += a; px.push(i); w.push(total); }
  const out = new Float32Array(n * 3), glow = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const pick = Math.random() * total; let lo = 0, hi = w.length - 1;
    while (lo < hi) { const m = (lo + hi) >> 1; if (w[m] < pick) lo = m + 1; else hi = m; }
    const p = px[lo], X = p % S, Y = Math.floor(p / S);
    out[i * 3] = (X + Math.random() - S / 2) / S;
    out[i * 3 + 1] = -(Y + Math.random() - S / 2) / S;
    out[i * 3 + 2] = (Math.random() - 0.5) * 0.09;
    glow[i] = 0.25 + 0.75 * Math.pow(Math.random(), 1.6);
  }
  return { pos: out, glow };
}
/* scattered: seven loose clusters far apart, plus dust */
function scatterTargets(n) {
  const out = new Float32Array(n * 3);
  const centers = Array.from({ length: 7 }, (_, i) => { const a = i / 7 * Math.PI * 2 + 0.4, r = 0.75 + 0.35 * Math.random(); return [Math.cos(a) * r * 1.25, Math.sin(a) * r * 0.85, (Math.random() - 0.5) * 0.9]; });
  for (let i = 0; i < n; i++) {
    const dust = i % 9 === 0, cc = centers[i % 7], s = dust ? 0.55 : 0.09;
    out[i * 3] = (dust ? 0 : cc[0]) + gauss() * s; out[i * 3 + 1] = (dust ? 0 : cc[1]) + gauss() * s * (dust ? 0.7 : 1); out[i * 3 + 2] = (dust ? 0 : cc[2]) + gauss() * s * 0.6;
  }
  return out;
}
/* the network: core at the centre, seven nodes around it, particles along the links */
function nodePositions() {
  const P = [[0, 0.02, 0]];
  for (let i = 0; i < RING; i++) { const a = -Math.PI / 2 + i / RING * Math.PI * 2; P.push([Math.cos(a) * 0.62, Math.sin(a) * 0.62 * 0.92 + 0.02, (i % 2 ? 0.08 : -0.08)]); }
  return P;
}
function linkCurves(P) {
  return LINKS.map(([a, b]) => {
    const A = new THREE.Vector3(...P[a]), B = new THREE.Vector3(...P[b]);
    const mid = A.clone().add(B).multiplyScalar(0.5); const away = mid.clone().sub(new THREE.Vector3(0, 0.02, 0)).multiplyScalar(0.28); mid.add(away); mid.z += 0.12;
    return new THREE.QuadraticBezierCurve3(A, mid, B);
  });
}
function networkTargets(n, P, curves) {
  const out = new Float32Array(n * 3); const tmp = new THREE.Vector3();
  for (let i = 0; i < n; i++) {
    const r = i % 20;
    if (r < 3) { out[i * 3] = P[0][0] + gauss() * 0.075; out[i * 3 + 1] = P[0][1] + gauss() * 0.075; out[i * 3 + 2] = P[0][2] + gauss() * 0.075; }
    else if (r < 12) { const k = 1 + (i % RING); out[i * 3] = P[k][0] + gauss() * 0.06; out[i * 3 + 1] = P[k][1] + gauss() * 0.06; out[i * 3 + 2] = P[k][2] + gauss() * 0.06; }
    else { curves[i % curves.length].getPoint(Math.random(), tmp); out[i * 3] = tmp.x + gauss() * 0.012; out[i * 3 + 1] = tmp.y + gauss() * 0.012; out[i * 3 + 2] = tmp.z + gauss() * 0.012; }
  }
  return out;
}

/* ── the glass studio (canvasui's room, ring light in the brand's colour) ── */
const ROOM_BLOCKS = [
  { p: [-10.906, -1, 1.846], r: [0, -0.195, 0], s: [2.328, 7.905, 4.651] }, { p: [-5.607, -0.754, -0.758], r: [0, 0.994, 0], s: [1.97, 1.534, 3.955] },
  { p: [6.167, -0.16, 7.803], r: [0, 0.561, 0], s: [3.927, 6.285, 3.687] }, { p: [-2.017, 0.018, 6.124], r: [0, 0.333, 0], s: [2.002, 4.566, 2.064] },
  { p: [2.291, -0.756, -2.621], r: [0, -0.286, 0], s: [1.546, 1.552, 1.496] }, { p: [-2.193, -0.369, -5.547], r: [0, 0.516, 0], s: [3.875, 3.487, 2.986] },
];
const ROOM_FORMERS = [
  { kind: 'ring', i: 15, p: [2, 3, -2], s: [10, 10, 10], look: true }, { kind: 'box', i: 80, p: [-14, 10, 8], s: [0.1, 2.5, 2.5] },
  { kind: 'box', i: 80, p: [-14, 14, -4], s: [0.1, 2.5, 2.5], light: true }, { kind: 'box', i: 23, p: [14, 12, 0], s: [0.1, 5, 5], light: true },
  { kind: 'box', i: 16, p: [0, 9, 14], s: [5, 5, 0.1], light: true }, { kind: 'box', i: 80, p: [7, 8, -14], s: [2.5, 2.5, 0.1], light: true },
  { kind: 'box', i: 80, p: [-7, 16, -14], s: [2.5, 2.5, 0.1], light: true }, { kind: 'box', i: 20, p: [0, 15, 0], s: [10, 1, 10], light: true },
];
function studio(highlight) {
  const s = new THREE.Scene(), room = new THREE.Group(); room.position.set(0, -0.5, 0); s.add(room);
  for (const [x, z] of [[-15, 15], [15, 15], [15, -15], [-15, -15]]) { const sp = new THREE.SpotLight(0xffffff, 2, 0, 0.2, 1, 0); sp.position.set(x, 20, z); room.add(sp, sp.target); }
  const center = new THREE.PointLight(0xffffff, 100, 28, 2); center.position.set(0.5, 14, 0.5); room.add(center);
  const box = new THREE.BoxGeometry();
  const shell = new THREE.Mesh(box, new THREE.MeshStandardMaterial({ color: 0x555555, side: THREE.BackSide })); shell.position.set(0, 13.2, 0); shell.scale.set(31.5, 28.5, 31.5); room.add(shell);
  const white = new THREE.MeshStandardMaterial({ color: 0xffffff });
  for (const b of ROOM_BLOCKS) { const m = new THREE.Mesh(box, white); m.position.set(...b.p); m.rotation.set(...b.r); m.scale.set(...b.s); room.add(m); }
  for (const f of ROOM_FORMERS) {
    const g = f.kind === 'ring' ? new THREE.RingGeometry(0.5, 1, 64) : box;
    const mat = new THREE.MeshBasicMaterial({ side: THREE.DoubleSide, toneMapped: false }); mat.color.set(f.kind === 'ring' ? highlight : 0xffffff).multiplyScalar(f.i);
    const m = new THREE.Mesh(g, mat); m.position.set(...f.p); m.scale.set(...f.s); if (f.look) m.lookAt(0, 0, 0); room.add(m);
    if (f.light) { const l = new THREE.PointLight(0xffffff, 100, 28, 2); l.position.set(...f.p); room.add(l); }
  }
  return s;
}
/* the mark as liquid glass: SVG shapes, extruded with a melted lip */
async function glassMark(material) {
  const svg = await (await fetch(MARK_SVG)).text();
  const parsed = new SVGLoader().parse(svg); const shapes = [];
  for (const path of parsed.paths) shapes.push(...SVGLoader.createShapes(path));
  const box = new THREE.Box2(); for (const sh of shapes) for (const p of sh.getPoints(4)) box.expandByPoint(p);
  const size = Math.max(box.max.x - box.min.x, box.max.y - box.min.y);
  const depth = 0.16 * size, bevel = 0.5 * depth;
  let geo = new THREE.ExtrudeGeometry(shapes, { depth: Math.max(depth - bevel * 2, depth * 0.1), bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel * 0.9, bevelOffset: 0, bevelSegments: 12, curveSegments: 24 });
  geo = toCreasedNormals(geo, Math.PI / 7);
  geo.rotateX(Math.PI);
  geo.computeBoundingBox(); const c = geo.boundingBox.getCenter(new THREE.Vector3()); geo.translate(-c.x, -c.y, -c.z);
  geo.scale(1 / size, 1 / size, 1 / size);          // longest side = 1, like the particle mark
  const mesh = new THREE.Mesh(geo, material); mesh.userData.thicknessBase = depth / size;
  return mesh;
}
/* the light behind everything: what the glass refracts */
function backdropTexture() {
  const [c, x] = canvas(512, 512);
  const g = x.createRadialGradient(300, 240, 10, 300, 240, 330);
  g.addColorStop(0, '#4c6a12'); g.addColorStop(0.35, '#1c2a0c'); g.addColorStop(0.7, '#0d1010'); g.addColorStop(1, '#0a0c0e');
  x.fillStyle = g; x.fillRect(0, 0, 512, 512);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

/* ── the scene ────────────────────────────────────────────────── */
export async function bootLight({ gsap, ScrollTrigger, reduce, canvas: cv, wrapper, copy, onChapter }) {
  const chapters = [...copy.querySelectorAll('.seq__ch')];
  const legend = document.getElementById('seqLegend'), lab = document.getElementById('seqLabel');
  const bar = document.getElementById('seqBar'), ct = document.getElementById('seqCt');
  wrapper.style.minHeight = chapters.length * 100 + 'svh';
  scrollTo(0, 0);
  const mobile = innerWidth < 700, fx = !/nofx=1/.test(location.search);
  const N = mobile ? 9000 : 16000, CAM_Z = 5.4, S = 2.75;

  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile ? 1.25 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;

  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x0a0c0e);
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100); camera.position.set(0, 0, CAM_Z);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studio(0xb8ff3a), 0.6, 0.1, 1000).texture; pmrem.dispose();

  const world = new THREE.Group(); scene.add(world);      // placed right of the copy, or above it
  const rig = new THREE.Group(); world.add(rig);           // floats and rocks; mark space, longest side = 1
  const back = new THREE.Mesh(new THREE.PlaneGeometry(10, 10), new THREE.MeshBasicMaterial({ map: backdropTexture() })); back.position.z = -2.8; world.add(back);

  /* particles */
  const mark = await markTargets(N);
  const P = nodePositions(), curves = linkCurves(P);
  const T = { mark: mark.pos, scatter: scatterTargets(N), net: networkTargets(N, P, curves) };
  const homes = new Float32Array(T.mark), pos = new Float32Array(T.mark), vel = new Float32Array(N * 3), seeds = new Float32Array(N);
  for (let i = 0; i < N; i++) seeds[i] = Math.random();
  const geo = new THREE.BufferGeometry();
  const posAttr = new THREE.BufferAttribute(pos, 3); posAttr.setUsage(THREE.DynamicDrawUsage);
  geo.setAttribute('position', posAttr); geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1)); geo.setAttribute('aGlow', new THREE.BufferAttribute(mark.glow, 1));
  const pmat = new THREE.ShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: VERT, fragmentShader: FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: { uTime: { value: 0 }, uSize: { value: mobile ? 2.3 : 2.9 }, uDpr: { value: 1 }, uRefDist: { value: CAM_Z }, uDrift: { value: reduce ? 0 : 0.7 }, uA: { value: LIGHT_A }, uB: { value: LIGHT_B }, uAlpha: { value: 1 } } });
  const points = new THREE.Points(geo, pmat); points.frustumCulled = false; rig.add(points);

  /* streams and node glows */
  const smat = () => new THREE.ShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: STREAM_VERT, fragmentShader: STREAM_FRAG, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uTime: { value: 0 }, uAlpha: { value: 0 }, uPhase: { value: Math.random() }, uA: { value: LIGHT_A }, uB: { value: LIGHT_B } } });
  const streams = curves.map(c => { const m = new THREE.Mesh(new THREE.TubeGeometry(c, 48, 0.011, 6, false), smat()); rig.add(m); return m; });
  const [gc, gx] = canvas(128, 128); const gg = gx.createRadialGradient(64, 64, 0, 64, 64, 64); gg.addColorStop(0, 'rgba(255,255,255,1)'); gg.addColorStop(0.3, 'rgba(255,255,255,.45)'); gg.addColorStop(1, 'rgba(255,255,255,0)'); gx.fillStyle = gg; gx.fillRect(0, 0, 128, 128);
  const glowTex = new THREE.CanvasTexture(gc);
  const glows = P.map((p, i) => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: i ? 0x9fe62a : 0xe4ff5a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false })); s.position.set(...p); s.scale.setScalar(i ? 0.26 : 0.42); rig.add(s); return s; });

  /* the glass mark */
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, metalness: 0, roughness: 0.2, transmission: 1, ior: 1.6, thickness: 0.18, dispersion: 1.2, clearcoat: 0.6, clearcoatRoughness: 0.06, specularIntensity: 1, attenuationColor: new THREE.Color(0xc4ec6e), attenuationDistance: 0.9, transparent: true, opacity: 0 });
  const gm = await glassMark(glass); gm.visible = false; gm.scale.setScalar(0.84); rig.add(gm);

  /* the real systems, floating in as glass cards */
  const loader = new THREE.TextureLoader();
  const CARD_HOMES = [[1.5, 0.8, -0.1], [1.55, -0.55, 0.1], [0.25, 1.12, -0.2], [0.4, -1.08, 0]];
  const cards = SCREENS.map((src, i) => {
    const tex = loader.load(src); tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
    const g = new THREE.Group();
    const img = new THREE.Mesh(new THREE.PlaneGeometry(1, 0.65), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0 })); g.add(img);
    const frame = new THREE.Mesh(new THREE.PlaneGeometry(1.06, 0.71), new THREE.MeshPhysicalMaterial({ color: 0xffffff, transmission: 0.9, roughness: 0.4, thickness: 0.05, ior: 1.4, transparent: true, opacity: 0 })); frame.position.z = -0.012; g.add(frame);
    g.userData = { home: new THREE.Vector3(...CARD_HOMES[i]), mats: [img.material, frame.material] };
    world.add(g); return g;
  });

  /* post: a little bloom on the light */
  let composer = null, bloom = null;
  if (fx) {
    composer = new EffectComposer(renderer, new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, samples: 4 }));
    composer.addPass(new RenderPass(scene, camera));
    bloom = new UnrealBloomPass(new THREE.Vector2(2, 2), 0.5, 0.55, 0.65); composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  /* layout */
  let k = 1, vw = 1, vh = 1, copyRightPx = 0;
  const measure = () => {
    vw = cv.clientWidth || innerWidth; vh = cv.clientHeight || innerHeight; k = clamp01((vw - 700) / 500);
    copyRightPx = chapters[0].firstElementChild.getBoundingClientRect().right;
    camera.aspect = vw / vh; camera.updateProjectionMatrix();
    renderer.setSize(vw, vh, false); composer?.setSize(vw, vh); bloom?.resolution.set(vw, vh);
    pmat.uniforms.uDpr.value = renderer.getPixelRatio();
  };
  measure(); new ResizeObserver(measure).observe(cv); document.fonts?.ready.then(measure);

  /* scroll */
  const state = { t: reduce ? 1 : 0 };
  let curCh = -1;
  const readout = p => {
    const n = chapters.length, i = Math.min(n - 1, Math.round(p * (n - 1)));
    if (i !== curCh) { curCh = i; onChapter?.(i); lab.textContent = chapters[i].dataset.title; document.title = 'ClarityOps | ' + chapters[i].dataset.title; }
    bar.style.transform = `scaleX(${p})`; ct.textContent = String(Math.round(p * 100)).padStart(3, '0');
  };
  if (!reduce) gsap.to(state, { t: 1, ease: 'none', scrollTrigger: { trigger: wrapper, start: 'top top', end: 'bottom bottom', scrub: 0.5, onUpdate: self => readout(self.progress), onToggle: self => legend.classList.toggle('on', self.isActive) } });
  else chapters.forEach(c => c.classList.add('on'));

  /* cursor: push, swirl, spring back */
  const ptr = { x: 0, y: 0, on: false, speed: 0, lx: 0, ly: 0, lt: 0, sx: 0, sy: 0 };
  if (!reduce) {
    addEventListener('pointermove', e => {
      const r = cv.getBoundingClientRect(); ptr.x = e.clientX - r.left; ptr.y = e.clientY - r.top; const now = performance.now();
      if (ptr.on && ptr.lt) { const dt = Math.max((now - ptr.lt) / 1000, 1e-3), dx = ptr.x - ptr.lx, dy = ptr.y - ptr.ly, sp = Math.hypot(dx, dy) / dt; ptr.speed += (sp - ptr.speed) * 0.35; if (sp > 1) { const inv = 1 / Math.max(Math.hypot(dx, dy), 1e-3); ptr.sx += (dx * inv - ptr.sx) * 0.4; ptr.sy += (dy * inv - ptr.sy) * 0.4; } }
      ptr.lx = ptr.x; ptr.ly = ptr.y; ptr.lt = now; ptr.on = true;
    }, { passive: true });
    addEventListener('pointerleave', () => { ptr.on = false; ptr.speed = 0; ptr.lt = 0; });
  }
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), inv = new THREE.Matrix4(), lo = new THREE.Vector3(), ld = new THREE.Vector3();
  const cr = new THREE.Vector3(), cu = new THREE.Vector3(), cb = new THREE.Vector3(), shv = new THREE.Vector3();

  function simulate(dt, soft) {
    const stiffness = soft ? 26 : 60, decay = Math.exp(-7.2 * dt);
    let pushing = false, ox = 0, oy = 0, oz = 0, dx = 0, dy = 0, dz = 1, rad = 0, accel = 0, shove = 0;
    if (ptr.on && !reduce) {
      ndc.set((ptr.x / vw) * 2 - 1, -(ptr.y / vh) * 2 + 1); ray.setFromCamera(ndc, camera);
      points.updateWorldMatrix(true, false); inv.copy(points.matrixWorld).invert();
      lo.copy(ray.ray.origin).applyMatrix4(inv); ld.copy(ray.ray.direction).transformDirection(inv);
      const worldScale = rig.scale.x, perPx = (2 * camera.position.distanceTo(world.position) * Math.tan(camera.fov * Math.PI / 360)) / vh;
      rad = (120 * perPx) / worldScale; accel = 26; shove = Math.min(ptr.speed / 900, 2) * 14;
      camera.matrixWorld.extractBasis(cr, cu, cb); shv.set(0, 0, 0).addScaledVector(cr, ptr.sx).addScaledVector(cu, -ptr.sy).transformDirection(inv);
      ox = lo.x; oy = lo.y; oz = lo.z; dx = ld.x; dy = ld.y; dz = ld.z; pushing = true;
    }
    const r2max = rad * rad, swirl = 0.7;
    for (let i = 0; i < N; i++) {
      const ix = i * 3, iy = ix + 1, iz = ix + 2; let vx = vel[ix], vy = vel[iy], vz = vel[iz];
      if (pushing) {
        const wx = pos[ix] - ox, wy = pos[iy] - oy, wz = pos[iz] - oz, t = Math.max(wx * dx + wy * dy + wz * dz, 0);
        let rx = wx - dx * t, ry = wy - dy * t, rz = wz - dz * t; const d2 = rx * rx + ry * ry + rz * rz;
        if (d2 < r2max) { const d = Math.sqrt(d2), iv = 1 / Math.max(d, 1e-5); rx *= iv; ry *= iv; rz *= iv; const fall = 1 - d / rad, f = fall * fall * dt;
          const tx = dy * rz - dz * ry, ty = dz * rx - dx * rz, tz = dx * ry - dy * rx;
          vx += (rx + tx * swirl) * accel * f + shv.x * shove * f; vy += (ry + ty * swirl) * accel * f + shv.y * shove * f; vz += (rz + tz * swirl) * accel * f + shv.z * shove * f; }
      }
      vx += (homes[ix] - pos[ix]) * stiffness * dt; vy += (homes[iy] - pos[iy]) * stiffness * dt; vz += (homes[iz] - pos[iz]) * stiffness * dt;
      vx *= decay; vy *= decay; vz *= decay;
      pos[ix] += vx * dt; pos[iy] += vy * dt; pos[iz] += vz * dt; vel[ix] = vx; vel[iy] = vy; vel[iz] = vz;
    }
    posAttr.needsUpdate = true;
  }
  /* the shape the particles are asked to take, from scroll position */
  let lastKey = '';
  function retarget(t) {
    let from = T.mark, to = T.mark, e = 0, key = 'mark';
    if (t >= 0.10 && t < 0.31) { from = T.mark; to = T.scatter; e = inout(win(t, 0.10, 0.30)); key = 'ms'; }
    else if (t >= 0.31 && t < 0.57) { from = T.scatter; to = T.net; e = inout(win(t, 0.32, 0.56)); key = 'sn'; }
    else if (t >= 0.57 && t < 0.81) { from = T.net; to = T.mark; e = inout(win(t, 0.58, 0.80)); key = 'nm'; }
    const k2 = key + e.toFixed(3); if (k2 === lastKey) return; lastKey = k2;
    for (let i = 0; i < N; i++) { const ei = clamp01((e - seeds[i] * 0.3) / 0.7), ix = i * 3; homes[ix] = from[ix] + (to[ix] - from[ix]) * ei; homes[ix + 1] = from[ix + 1] + (to[ix + 1] - from[ix + 1]) * ei; homes[ix + 2] = from[ix + 2] + (to[ix + 2] - from[ix + 2]) * ei; }
  }

  try { await renderer.compileAsync(scene, camera); } catch (e) { console.warn('[light] compile:', e); }
  const mouse = new THREE.Vector2(), tilt = new THREE.Vector2();
  if (!reduce) addEventListener('pointermove', e => mouse.set((e.clientX / innerWidth - 0.5) * 2, (e.clientY / innerHeight - 0.5) * 2), { passive: true });
  let live = true, first = true, last = 0, elapsed = Math.random() * 100;
  new IntersectionObserver(([e]) => { live = e.isIntersecting; }).observe(cv);
  const camLook = new THREE.Vector3();

  function frame(now) {
    const real = last ? (now - last) / 1000 : 0, dt = Math.min(real, 1 / 30); last = now;
    if (real > 0.25) { for (let i = 0; i < N * 3; i++) { pos[i] += (homes[i] - pos[i]) * 0.85; vel[i] = 0; } }   /* after a stall, the cloud catches up instead of lagging */
    const t = state.t; elapsed += dt * 1.6;
    /* layout: right of the copy, or above it */
    const cz = CAM_Z - 0.45 * inout(win(t, 0.3, 0.56)) + 1.3 * out3(win(t, 0.78, 1));
    const visH = 2 * cz * Math.tan(camera.fov * Math.PI / 360), visW = visH * camera.aspect;
    const copyRight = (copyRightPx / vw - 0.5) * visW;
    world.position.set(k * (copyRight + 1.55 + 0.35 * win(t, 0.32, 0.5) * (1 - win(t, 0.6, 0.78))), (1 - k) * 0.55, 0);
    rig.scale.setScalar(S * (k + (1 - k) * 0.6));
    tilt.lerp(mouse, 0.05);
    rig.rotation.set(Math.cos(elapsed / 4) / 12 + tilt.y * 0.08, Math.sin(elapsed / 4) / 9 + tilt.x * 0.14, Math.sin(elapsed / 4) / 30);
    rig.position.y = Math.sin(elapsed / 1.5) / 14;
    camera.position.set(tilt.x * 0.15, tilt.y * -0.08, cz); camLook.set(world.position.x * 0.9, world.position.y * 0.8, 0); camera.lookAt(camLook);
    pmat.uniforms.uRefDist.value = cz;
    /* particles */
    retarget(t);
    const morphing = (t > 0.1 && t < 0.31) || (t > 0.31 && t < 0.57) || (t > 0.57 && t < 0.81);
    if (dt > 0) simulate(dt, morphing);
    pmat.uniforms.uTime.value += dt;
    const ga = out3(win(t, 0.80, 0.92));
    pmat.uniforms.uAlpha.value = 1 - 0.6 * ga; points.scale.setScalar(1 + 0.1 * ga);
    /* the network: streams and node glows */
    const na = win(t, 0.40, 0.52) * (1 - win(t, 0.60, 0.72));
    streams.forEach((m, i) => { m.material.uniforms.uAlpha.value = na * (0.6 + 0.4 * Math.sin(elapsed + i)); m.material.uniforms.uTime.value += dt; m.visible = na > 0.01; });
    glows.forEach((s, i) => { s.material.opacity = na * (i ? 0.55 : 0.9) * (0.8 + 0.2 * Math.sin(elapsed * 2 + i)); s.visible = na > 0.01; });
    /* the glass sets, the systems float in */
    gm.visible = ga > 0.01; glass.opacity = ga;
    cards.forEach((g, i) => {
      const ca = out3(win(t, 0.84 + i * 0.03, 0.96 + i * 0.03)), sc = k + (1 - k) * 0.6;
      g.visible = ca > 0.01; g.userData.mats[0].opacity = ca; g.userData.mats[1].opacity = ca * 0.8;
      g.position.copy(g.userData.home).multiplyScalar(sc); g.position.z += -1.3 * (1 - ca) + Math.sin(elapsed / 2 + i) * 0.04;
      g.scale.setScalar(0.62 * sc * (0.85 + 0.15 * ca)); g.lookAt(camera.position.x, camera.position.y, camera.position.z + 6);
    });
    if (composer) composer.render(); else renderer.render(scene, camera);
    if (first) { first = false; cv.classList.add('is-live'); }
  }
  gsap.ticker.add(() => { if (live) frame(performance.now()); });
  frame(performance.now());
  ScrollTrigger.refresh();
  return { renderer, scene, camera, state, world };
}
