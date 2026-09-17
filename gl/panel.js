/* ClarityOps v2 · PANEL · the focal sequence, at night.
   A graphite enamel wall lit by its own lamps. Real instruments: ivory dial
   faces with engraved scales, brushed steel bezels, glass covers, needles.
   The camera opens on the gauge glass and pulls back through the wiring as the
   copy moves; instruments seat, conduits draw, lamps ignite and light the
   panel, the gauge sweeps into the run zone, signals travel. Bloom + depth of
   field. Every texture is drawn at boot, nothing is loaded. */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const LAMP = 0xd6ff33, LAMP_LIGHT = 0xa8ea2e;
const INK = '#14171a', IVORY = '#e9e6dc', RUN = '#6eb707';
const FONT = 'Archivo, "Helvetica Neue", Arial, sans-serif';
const PLATE = { w: 12.6, h: 10.2 };
/* the instrument cluster sits right of the copy column */
const NODES = [
  { name: 'PROJECTS', x: 3.3,  y: 0.25,  r: 0.62 },
  { name: 'CLIENTS',  x: 1.35, y: 1.85,  r: 0.44 },
  { name: 'DEALS',    x: 5.25, y: 1.85,  r: 0.44 },
  { name: 'TEAM',     x: 1.35, y: 0.25,  r: 0.44 },
  { name: 'DOCS',     x: 5.25, y: 0.25,  r: 0.44 },
  { name: 'TASKS',    x: 1.35, y: -1.35, r: 0.44 },
  { name: 'INVOICES', x: 5.25, y: -1.35, r: 0.44 },
];
const MODULE = { x: 4.3, y: -2.75, w: 1.9, h: 0.72 };
const GAUGE  = { x: 2.0, y: -2.75, r: 0.6 };
const ROUTES = [
  [[1.35, 1.85], [2.35, 1.85], [2.35, 0.45], [3.3, 0.45]],
  [[5.25, 1.85], [4.25, 1.85], [4.25, 0.45], [3.3, 0.45]],
  [[1.35, -1.35], [2.1, -1.35], [2.1, 0.05], [3.3, 0.05]],
  [[5.25, -1.35], [4.5, -1.35], [4.5, 0.05], [3.3, 0.05]],
  [[1.35, 1.85], [1.35, 0.25]], [[1.35, 0.25], [1.35, -1.35]],
  [[5.25, 1.85], [5.25, 0.25]], [[5.25, 0.25], [5.25, -1.35]],
  [[3.3, 0.25], [3.3, -1.6], [4.3, -1.6], [4.3, -2.39]],
  [[3.35, -2.75], [2.6, -2.75]],
];
const LOG = ['LEAD → DEAL · CONTACT MATCHED', 'DRIVE FOLDER · CREATED', 'MLS REPORT · PARSED',
  'META ADS · 2 ACCOUNTS SYNCED', 'QUICKBOOKS · SCORECARD UPDATED', 'CALL · LOGGED',
  'REFUND WINDOW · CHECKED', 'STATUS EMAIL · SENT', 'DAILY PAGE · REBUILT'];

const clamp01 = v => Math.min(1, Math.max(0, v));
const win = (t, a, b) => clamp01((t - a) / (b - a));
const out3 = x => 1 - Math.pow(1 - x, 3);
const out5 = x => 1 - Math.pow(1 - x, 5);
const lerp = (a, b, t) => a + (b - a) * t;

/* ── geometry helpers ─────────────────────────────────────────── */
function rrect(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function slab(w, h, r, depth, bevel) {
  const g = new THREE.ExtrudeGeometry(rrect(w, h, r), { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 16 });
  g.translate(0, 0, -(depth + bevel));            // front face at z = 0
  return g;
}
/* Manhattan routing with filleted elbows, the way a line diagram is drawn. */
function route(pts, r = 0.26) {
  const path = new THREE.CurvePath();
  const P = pts.map(p => new THREE.Vector3(p[0], p[1], 0));
  let cur = P[0];
  for (let i = 1; i < P.length - 1; i++) {
    const a = P[i - 1], b = P[i], c = P[i + 1];
    const din = b.clone().sub(a).normalize(), dout = c.clone().sub(b).normalize();
    const rr = Math.min(r, a.distanceTo(b) / 2, b.distanceTo(c) / 2);
    const p1 = b.clone().sub(din.multiplyScalar(rr)), p2 = b.clone().add(dout.multiplyScalar(rr));
    path.add(new THREE.LineCurve3(cur, p1)); path.add(new THREE.QuadraticBezierCurve3(p1, b.clone(), p2)); cur = p2;
  }
  path.add(new THREE.LineCurve3(cur, P[P.length - 1]));
  return path;
}

/* ── textures, all drawn ──────────────────────────────────────── */
function canvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return [c, c.getContext('2d')]; }
function tex(c, aniso = 8) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = aniso; return t; }

/* An instrument face: 270° scale from lower-left over the top to lower-right,
   numerals at the majors, the run zone in brand green, the legend below centre. */
function dialTexture(label, big) {
  const size = big ? 1024 : 512, [c, x] = canvas(size, size), cx = size / 2, cy = size / 2, R = size / 2;
  x.fillStyle = IVORY; x.beginPath(); x.arc(cx, cy, R, 0, Math.PI * 2); x.fill();
  x.strokeStyle = 'rgba(20,23,26,.10)'; x.lineWidth = size * .012; x.beginPath(); x.arc(cx, cy, R * .9, 0, Math.PI * 2); x.stroke();
  const a0 = Math.PI * .75, a1 = Math.PI * 2.25, n = big ? 50 : 20, every = big ? 10 : 5;
  x.strokeStyle = INK; x.fillStyle = INK; x.textAlign = 'center'; x.textBaseline = 'middle';
  for (let i = 0; i <= n; i++) {
    const a = a0 + (a1 - a0) * i / n, major = i % every === 0;
    const r1 = R * (major ? .70 : .755), r2 = R * .80;
    x.lineWidth = size * (major ? .011 : .005);
    x.beginPath(); x.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1); x.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2); x.stroke();
    if (major) { x.font = `600 ${size * (big ? .058 : .078)}px ${FONT}`; x.fillText(String(big ? i * 2 : (i / every) * 25), cx + Math.cos(a) * R * .585, cy + Math.sin(a) * R * .585); }
  }
  x.strokeStyle = RUN; x.lineWidth = size * .032; x.beginPath(); x.arc(cx, cy, R * .845, a0 + (a1 - a0) * .78, a1); x.stroke();
  x.fillStyle = INK; x.font = `600 ${size * (big ? .05 : .06)}px ${FONT}`; x.fillText(label, cx, cy + R * .33);
  x.fillStyle = 'rgba(20,23,26,.55)'; x.font = `500 ${size * .034}px ${FONT}`; x.fillText(big ? 'OPERATIONS · RUN' : 'CLARITYOPS', cx, cy + R * .47);
  return tex(c, 16);
}
/* An engraved nameplate: light lettering on a dark plate. */
function plateTexture(lines, w = 768, h = 128) {
  const [c, x] = canvas(w, h);
  x.fillStyle = '#0c0f11'; x.fillRect(0, 0, w, h);
  x.strokeStyle = 'rgba(255,255,255,.10)'; x.lineWidth = 3; x.strokeRect(6, 6, w - 12, h - 12);
  x.fillStyle = '#c9cfc4'; x.textAlign = 'center'; x.textBaseline = 'middle';
  const list = [].concat(lines); const fs = list.length > 1 ? h * .30 : h * .42;
  x.font = `600 ${fs}px ${FONT}`; x.letterSpacing = `${fs * .12}px`;
  list.forEach((s, i) => x.fillText(s, w / 2, h / 2 + (i - (list.length - 1) / 2) * fs * 1.25));
  return tex(c);
}
/* Fine enamel grain for roughness and bump. */
function grainTexture() {
  const [c, x] = canvas(256, 256), img = x.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) { const v = 118 + Math.random() * 28; img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255; }
  x.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(9, 6); return t;
}
/* The module display: a log that ticks while the system runs. */
function makeScreen() {
  const [c, x] = canvas(768, 256);
  const t = tex(c); let last = -1;
  const draw = (n, boot) => {
    x.fillStyle = '#050807'; x.fillRect(0, 0, 768, 256);
    x.fillStyle = 'rgba(214,255,51,.10)'; for (let y = 0; y < 256; y += 4) x.fillRect(0, y, 768, 1);
    x.textBaseline = 'middle'; x.font = `600 30px ${FONT}`; x.letterSpacing = '1px';
    if (!boot) { x.fillStyle = 'rgba(214,255,51,.25)'; x.fillText('STANDBY', 28, 128); t.needsUpdate = true; return; }
    for (let i = 0; i < 5; i++) {
      const k = (n - 4 + i + LOG.length * 10) % LOG.length, cur = i === 4;
      x.fillStyle = cur ? '#d6ff33' : `rgba(214,255,51,${.28 + i * .12})`;
      x.fillText(LOG[k], 28, 40 + i * 44);
      x.textAlign = 'right'; x.fillText(cur ? 'RUNNING' : 'OK', 740, 40 + i * 44); x.textAlign = 'left';
    }
    t.needsUpdate = true;
  };
  return { texture: t, update: (time, running) => { const n = running ? Math.floor(time * 0.9) : -1; if (n !== last) { last = n; draw(n, running); } } };
}
/* A dark studio: one cool softbox above, a faint warm fill, a brand strip low right. */
function studio() {
  const s = new THREE.Scene(); s.background = new THREE.Color(0x0a0c0e);
  const light = (w, h, color, i, pos) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    m.material.color.multiplyScalar(i); m.position.set(...pos); m.lookAt(0, 0, 0); s.add(m);
  };
  light(14, 8, 0xdfe9f2, 1.1, [-2, 10, 6]); light(5, 9, 0xf3ead8, 0.7, [-10, 1, 5]);
  light(3, 6, LAMP_LIGHT, 0.55, [10, -4, 3]); light(24, 24, 0x2a2f2c, 0.5, [0, -10, 0]);
  return s;
}

/* ── the scene ────────────────────────────────────────────────── */
export async function bootPanel({ gsap, ScrollTrigger, reduce, canvas: cv, wrapper, copy, onChapter }) {
  const chapters = [...copy.querySelectorAll('.seq__ch')];
  const legend = document.getElementById('seqLegend'), lab = document.getElementById('seqLabel');
  const bar = document.getElementById('seqBar'), ct = document.getElementById('seqCt');
  wrapper.style.minHeight = chapters.length * 100 + 'svh';
  scrollTo(0, 0);
  const fx = !/nofx=1/.test(location.search);

  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: !fx, powerPreference: 'high-performance' });
  const mobile = () => innerWidth < 700;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile() ? 1.25 : 1.35));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;

  const scene = new THREE.Scene(); scene.background = new THREE.Color(0x090b0d);
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 80);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studio(), 0.05).texture; pmrem.dispose();
  scene.environmentIntensity = 0.9;

  const key = new THREE.DirectionalLight(0xdfe9f2, 1.5); key.position.set(-6, 9, 9);
  key.castShadow = true; key.shadow.mapSize.set(1024, 1024); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.03;
  Object.assign(key.shadow.camera, { left: -8, right: 8, top: 6, bottom: -6, near: 1, far: 40 });
  key.target.position.set(2.5, 0, 0);
  const wash = new THREE.PointLight(0x6eb707, 0, 14, 2); wash.position.set(7.5, -4.5, 4.5);
  scene.add(key, key.target, wash, new THREE.HemisphereLight(0x8fa0aa, 0x000000, 0.22));

  const grain = grainTexture();
  const M = {
    enamel: new THREE.MeshPhysicalMaterial({ color: 0x1c2024, roughness: 0.52, roughnessMap: grain, bumpMap: grain, bumpScale: 0.004, clearcoat: 0.7, clearcoatRoughness: 0.32 }),
    socket: new THREE.MeshStandardMaterial({ color: 0x0b0d0f, roughness: 0.85, polygonOffset: true, polygonOffsetFactor: -1 }),
    steel:  new THREE.MeshPhysicalMaterial({ color: 0xb8bec3, metalness: 1, roughness: 0.38, anisotropy: 0.6 }),
    graphite: new THREE.MeshStandardMaterial({ color: 0x22262a, roughness: 0.55, metalness: 0.1 }),
    glass:  new THREE.MeshPhysicalMaterial({ color: 0xdfe6ea, roughness: 0.04, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true, opacity: 0.16, depthWrite: false }),
    needle: new THREE.MeshStandardMaterial({ color: 0x14171a, roughness: 0.4 }),
    tip:    new THREE.MeshStandardMaterial({ color: LAMP, emissive: LAMP, emissiveIntensity: 1.2, roughness: 0.4 }),
    pulse:  new THREE.MeshStandardMaterial({ color: LAMP, emissive: LAMP, emissiveIntensity: 4.5, roughness: 0.3 }),
  };
  const lampMat = () => new THREE.MeshStandardMaterial({ color: 0x3a4044, emissive: LAMP, emissiveIntensity: 0, roughness: 0.25 });
  const shadow = m => { m.castShadow = true; m.receiveShadow = true; return m; };

  const group = new THREE.Group(); scene.add(group);
  group.add(shadow(new THREE.Mesh(slab(PLATE.w, PLATE.h, 0.3, 0.3, 0.06), M.enamel)));
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.09, 0.04, 20), M.steel);
    s.rotation.x = Math.PI / 2; s.position.set(sx * (PLATE.w / 2 - 0.32), sy * (PLATE.h / 2 - 0.32), 0.02); group.add(s);
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.018, 0.012), M.graphite); slot.position.set(s.position.x, s.position.y, 0.042); slot.rotation.z = sx * sy * 0.6; group.add(slot);
  }
  const nameplate = (x, y, lines, w = 0.96) => {
    const h = w / 6, m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshStandardMaterial({ map: plateTexture(lines, 768, 128), roughness: 0.6 }));
    m.position.set(x, y, 0.006); group.add(m);
  };
  nameplate(-3.0, -3.55, ['CLARITYOPS · OPERATIONS PANEL', '7 DATABASES   10 AUTOMATIONS   1 AGENT'], 3.6);

  const lamps = [];     // { mat, light }
  const addLamp = (x, y, r = 0.075, lit = false) => {
    const mat = lampMat();
    const dome = new THREE.Mesh(new THREE.SphereGeometry(r, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2), mat);
    dome.rotation.x = Math.PI / 2; dome.position.set(x, y, 0.03); group.add(dome);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(r + 0.025, 0.018, 10, 32), M.steel); ring.position.set(x, y, 0.03); group.add(ring);
    const light = lit ? new THREE.PointLight(LAMP_LIGHT, 0, 2.6, 2) : null;
    if (light) { light.position.set(x, y, 0.32); group.add(light); }
    lamps.push({ mat, light });
  };

  /* an instrument: recess + bezel + lamp on the panel; the body (steel drum,
     ivory face, needle, glass) lifts as one piece when the panel is in pieces */
  const needles = [];
  const instrument = (n, big) => {
    const sock = new THREE.Mesh(new THREE.CircleGeometry(n.r + 0.12, 64), M.socket); sock.position.set(n.x, n.y, 0.003); sock.receiveShadow = true; group.add(sock);
    const bez = shadow(new THREE.Mesh(new THREE.TorusGeometry(n.r + 0.07, 0.05, 14, 72), M.steel)); bez.position.set(n.x, n.y, 0.05); group.add(bez);
    addLamp(n.x + (n.r + 0.3) * 0.707, n.y + (n.r + 0.3) * 0.707, big ? 0.085 : 0.07, big);
    nameplate(n.x, n.y - n.r - 0.3, n.name, big ? 1.2 : 0.96);
    const g = new THREE.Group(); g.position.set(n.x, n.y, 0); group.add(g);
    const h = 0.12;
    const drum = shadow(new THREE.Mesh(new THREE.CylinderGeometry(n.r, n.r, h, 72), M.steel)); drum.rotation.x = Math.PI / 2; drum.position.z = h / 2; g.add(drum);
    const face = new THREE.Mesh(new THREE.CircleGeometry(n.r * 0.97, 72), new THREE.MeshStandardMaterial({ map: dialTexture(n.name, big), roughness: 0.6 })); face.position.z = h + 0.002; g.add(face);
    const piv = new THREE.Group(); piv.position.z = h + 0.03; g.add(piv);
    const nd = new THREE.Mesh(new THREE.BoxGeometry(n.r * 0.78, n.r * 0.05, 0.014), M.needle); nd.position.x = n.r * 0.31; piv.add(nd);
    const tp = new THREE.Mesh(new THREE.BoxGeometry(n.r * 0.16, n.r * 0.05, 0.015), M.tip); tp.position.x = n.r * 0.62; piv.add(tp);
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(n.r * 0.09, n.r * 0.09, 0.03, 24), M.needle); hub.rotation.x = Math.PI / 2; piv.add(hub);
    const glass = new THREE.Mesh(new THREE.CylinderGeometry(n.r * 1.0, n.r * 1.0, 0.03, 72), M.glass); glass.rotation.x = Math.PI / 2; glass.position.z = h + 0.09; g.add(glass);
    needles.push(piv);
    return g;
  };
  const setNeedle = (piv, v) => { piv.rotation.z = -(Math.PI * 0.75 + Math.PI * 1.5 * clamp01(v)); };
  const insts = NODES.map((n, i) => ({ g: instrument(n, i === 0), dir: new THREE.Vector2(Math.cos(i * 2.4 + 0.7), Math.sin(i * 2.4 + 0.7)), d: i * 0.018, n }));
  const gauge = instrument({ ...GAUGE, name: 'THROUGHPUT' }, true); const gaugeNeedle = needles[needles.length - 1];

  const tubes = ROUTES.map(pts => {
    const path = route(pts), geo = new THREE.TubeGeometry(path, 96, 0.055, 12, false);
    const m = shadow(new THREE.Mesh(geo, M.steel)); m.position.z = 0.035; group.add(m);
    return { m, path, count: geo.index.count };
  });
  const pulses = tubes.map(() => { const p = new THREE.Mesh(new THREE.SphereGeometry(0.065, 16, 12), M.pulse); p.visible = false; group.add(p); return p; });

  const screen = makeScreen();
  const mod = new THREE.Group(); mod.position.set(MODULE.x, MODULE.y, 0); group.add(mod);
  const modSock = new THREE.Mesh(new THREE.PlaneGeometry(MODULE.w + 0.2, MODULE.h + 0.2), M.socket); modSock.position.set(MODULE.x, MODULE.y, 0.003); group.add(modSock);
  const body = shadow(new THREE.Mesh(slab(MODULE.w, MODULE.h, 0.08, 0.16, 0.03), M.graphite)); body.position.z = 0.19; mod.add(body);
  const disp = new THREE.Mesh(new THREE.PlaneGeometry(1.32, 0.44), new THREE.MeshBasicMaterial({ map: screen.texture })); disp.position.set(-0.12, 0, 0.196); mod.add(disp);
  addLamp(MODULE.x + MODULE.w / 2 + 0.28, MODULE.y + 0.14, 0.07, true);
  nameplate(MODULE.x, MODULE.y - MODULE.h / 2 - 0.26, 'AGENT', 1.1);

  /* ── post ─────────────────────────────────────────────────── */
  let composer = null, bokeh = null, bloom = null;
  const target = new THREE.WebGLRenderTarget(2, 2, { type: THREE.HalfFloatType, samples: 4 });
  if (fx) {
    composer = new EffectComposer(renderer, target);
    composer.addPass(new RenderPass(scene, camera));
    if (!mobile()) { bokeh = new BokehPass(scene, camera, { focus: 2.5, aperture: 0.012, maxblur: 0.011 }); composer.addPass(bokeh); }
    bloom = new UnrealBloomPass(new THREE.Vector2(2, 2), 0.5, 0.4, 1.0); composer.addPass(bloom);
    composer.addPass(new OutputPass());
  }

  /* ── camera path: macro on the gauge glass, then out through the wiring ── */
  const K = {
    posD: [[1.35, -2.95, 2.5], [1.4, -0.2, 9.4], [1.2, 0.3, 10.7], [1.1, 0.2, 11.5], [1.0, 0.1, 12.3]],
    tgtD: [[1.35, -2.75, 0], [1.2, 0.1, 0], [1.1, 0.2, 0], [1.1, 0.1, 0], [1.1, 0.0, 0]],
    posM: [[2.0, -3.7, 2.7], [3.3, -0.4, 9.2], [3.3, 0.0, 10.6], [3.3, -0.1, 11.4], [3.3, -0.2, 12.2]],
    tgtM: [[2.0, -3.25, 0], [3.3, 0.0, 0], [3.3, 0.1, 0], [3.3, 0.0, 0], [3.3, -0.1, 0]],
  };
  const curve = a => new THREE.CatmullRomCurve3(a.map(p => new THREE.Vector3(...p)), false, 'catmullrom', 0.5);
  const C = { posD: curve(K.posD), tgtD: curve(K.tgtD), posM: curve(K.posM), tgtM: curve(K.tgtM) };

  let k = 1, vw = 1, vh = 1;
  const measure = () => {
    vw = cv.clientWidth || innerWidth; vh = cv.clientHeight || innerHeight;
    k = clamp01((vw - 700) / 500);
    camera.aspect = vw / vh; camera.fov = lerp(52, 30, k); camera.updateProjectionMatrix();
    renderer.setSize(vw, vh, false); composer?.setSize(vw, vh); bloom?.resolution.set(vw, vh);
  };
  measure(); new ResizeObserver(measure).observe(cv);

  const state = { t: reduce ? 1 : 0 };
  const mouse = new THREE.Vector2(), tilt = new THREE.Vector2();
  if (!reduce) addEventListener('pointermove', e => { mouse.set((e.clientX / innerWidth - 0.5) * 2, (e.clientY / innerHeight - 0.5) * 2); }, { passive: true });

  let curCh = -1;
  const readout = p => {
    const n = chapters.length, i = Math.min(n - 1, Math.round(p * (n - 1)));
    if (i !== curCh) { curCh = i; onChapter?.(i); lab.textContent = chapters[i].dataset.title; document.title = 'ClarityOps | ' + chapters[i].dataset.title; }
    bar.style.transform = `scaleX(${p})`; ct.textContent = String(Math.round(p * 100)).padStart(3, '0');
  };
  if (!reduce) {
    gsap.to(state, { t: 1, ease: 'none', scrollTrigger: { trigger: wrapper, start: 'top top', end: 'bottom bottom', scrub: 0.5,
      onUpdate: self => readout(self.progress), onToggle: self => legend.classList.toggle('on', self.isActive) } });
  } else { chapters.forEach(c => c.classList.add('on')); }

  try { await renderer.compileAsync(scene, camera); } catch (e) { console.warn('[panel] compile:', e); }
  const t0 = performance.now();
  let live = true, first = true;
  new IntersectionObserver(([e]) => { live = e.isIntersecting; }).observe(cv);
  const P = new THREE.Vector3(), T = new THREE.Vector3(), tmp = new THREE.Vector3();

  function frame() {
    const t = state.t, time = (performance.now() - t0) / 1000;
    /* camera */
    P.copy(C.posM.getPoint(t)).lerp(C.posD.getPoint(t), k);
    T.copy(C.tgtM.getPoint(t)).lerp(C.tgtD.getPoint(t), k);
    tilt.lerp(mouse, 0.04);
    const drift = 1 - win(t, 0, 0.15);
    P.x += Math.sin(time * 0.3) * 0.03 * (1 - drift) + tilt.x * 0.12; P.y += Math.cos(time * 0.24) * 0.02 + tilt.y * 0.06;
    T.x += tilt.x * 0.22 * (0.4 + 0.6 * (1 - drift)); T.y -= tilt.y * 0.12;
    camera.position.copy(P); camera.lookAt(T);
    if (bokeh) {
      bokeh.enabled = t < 0.42;               /* depth of field only for the macro opening */
      const focusAt = tmp.set(GAUGE.x, GAUGE.y, 0.15).lerp(T, win(t, 0.08, 0.3));
      bokeh.uniforms.focus.value = camera.position.distanceTo(focusAt);
      bokeh.uniforms.aperture.value = lerp(0.014, 0.0018, out3(win(t, 0.05, 0.35)));
    }
    /* instruments: hover exploded, drift apart, then seat (staggered) */
    const apart = win(t, 0.12, 0.42);
    insts.forEach(({ g, dir, d, n }) => {
      const seat = out5(win(t, 0.42 + d, 0.6 + d));
      const hover = (0.55 + 0.7 * apart + Math.sin(time * 0.8 + d * 40) * 0.03) * (1 - seat);
      const sc = 0.5 * apart * (1 - seat);
      g.position.set(n.x + dir.x * sc, n.y + dir.y * sc, hover);
      g.rotation.set(dir.y * sc * 0.7, -dir.x * sc * 0.7, 0);
    });
    const gseat = out5(win(t, 0.4, 0.56)); gauge.position.z = (0.35 * apart) * (1 - gseat);
    const mseat = out5(win(t, 0.5, 0.68)); mod.position.z = (0.7 + 0.5 * apart) * (1 - mseat); mod.rotation.set(0.2 * apart * (1 - mseat), -0.15 * apart * (1 - mseat), 0);
    /* conduits draw in sequence */
    tubes.forEach(({ m, count }, i) => { const p = out3(win(t, 0.5 + i * 0.018, 0.63 + i * 0.018)); m.geometry.setDrawRange(0, Math.floor(p * count)); m.visible = p > 0; });
    /* lamps ignite and light the panel */
    lamps.forEach((l, i) => { const p = out3(win(t, 0.62 + i * 0.016, 0.7 + i * 0.016)); const flick = p > 0 && p < 1 ? (0.6 + 0.4 * Math.sin(time * 40 + i)) : 1; l.mat.emissiveIntensity = 4.2 * p * flick; if (l.light) l.light.intensity = 1.4 * p * flick; });
    wash.intensity = 0.6 * out3(win(t, 0.66, 0.9));
    /* needles */
    const run = win(t, 0.8, 0.92), sweep = out5(win(t, 0.66, 0.84));
    setNeedle(gaugeNeedle, 0.88 * sweep + Math.sin(time * 1.9) * 0.012 * run);
    needles.forEach((piv, i) => { if (piv === gaugeNeedle) return; setNeedle(piv, (0.45 + 0.1 * Math.sin(i * 1.7)) * sweep + Math.sin(time * (1.3 + i * 0.2) + i) * 0.03 * run); });
    /* signals travel; the display ticks */
    pulses.forEach((p, i) => { p.visible = run > 0; if (!p.visible) return; const u = (time * 0.14 + i * 0.37) % 1; const pt = tubes[i].path.getPointAt(u); p.position.set(pt.x, pt.y, 0.035); p.scale.setScalar(run); });
    screen.update(time, t > 0.55);

    if (composer) composer.render(); else renderer.render(scene, camera);
    if (first) { first = false; cv.classList.add('is-live'); }
  }
  gsap.ticker.add(() => { if (live) frame(); });
  frame();
  ScrollTrigger.refresh();
  return { renderer, scene, camera, state };
}
