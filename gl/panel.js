/* ClarityOps v2 · PANEL · the focal sequence.
   A mimic panel: enamel steel plate, seven instruments, ten conduits, one agent
   module, one gauge. On arrival the instruments hover above their sockets like an
   exploded product render. As you scroll they seat, the conduits draw, the lamps
   come on, the gauge sweeps, and signals start to travel. Soft studio light, real
   contact shadows, no postprocessing. */

import * as THREE from 'three';

const RUN = 0x6eb707;
const NODES = [
  { name: 'Projects', x: 0,     y: 0.45, r: 0.5 },
  { name: 'Clients',  x: -2.35, y: 1.9,  r: 0.38 },
  { name: 'Deals',    x: 2.35,  y: 1.9,  r: 0.38 },
  { name: 'Team',     x: -2.35, y: 0.2,  r: 0.38 },
  { name: 'Docs',     x: 2.35,  y: 0.2,  r: 0.38 },
  { name: 'Tasks',    x: -2.35, y: -1.5, r: 0.38 },
  { name: 'Invoices', x: 2.35,  y: -1.5, r: 0.38 },
];
const MODULE = { x: 0.95, y: -2.3, w: 1.5, h: 0.62 };
const GAUGE  = { x: -1.25, y: -2.3, r: 0.46 };
const ROUTES = [
  [[-2.35, 1.9], [-1.15, 1.9], [-1.15, 0.6], [0, 0.6]],
  [[2.35, 1.9], [1.15, 1.9], [1.15, 0.6], [0, 0.6]],
  [[-2.35, -1.5], [-1.45, -1.5], [-1.45, 0.3], [0, 0.3]],
  [[2.35, -1.5], [1.45, -1.5], [1.45, 0.3], [0, 0.3]],
  [[-2.35, 1.9], [-2.35, 0.2]], [[-2.35, 0.2], [-2.35, -1.5]],
  [[2.35, 1.9], [2.35, 0.2]],   [[2.35, 0.2], [2.35, -1.5]],
  [[0, 0.45], [0, -1.35], [0.95, -1.35], [0.95, -1.99]],
  [[0.2, -2.3], [-0.79, -2.3]],
];
const PLATE = { w: 7.6, h: 6.4 };

const clamp01 = v => Math.min(1, Math.max(0, v));
const win = (t, a, b) => clamp01((t - a) / (b - a));
const out3 = x => 1 - Math.pow(1 - x, 3);
const out5 = x => 1 - Math.pow(1 - x, 5);

function rrect(w, h, r) {
  const s = new THREE.Shape(), x = -w / 2, y = -h / 2;
  s.moveTo(x + r, y); s.lineTo(x + w - r, y); s.quadraticCurveTo(x + w, y, x + w, y + r);
  s.lineTo(x + w, y + h - r); s.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  s.lineTo(x + r, y + h); s.quadraticCurveTo(x, y + h, x, y + h - r);
  s.lineTo(x, y + r); s.quadraticCurveTo(x, y, x + r, y);
  return s;
}
function slab(w, h, r, depth, bevel) {
  const g = new THREE.ExtrudeGeometry(rrect(w, h, r), { depth, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 4, curveSegments: 14 });
  g.translate(0, 0, -(depth + bevel));            // front face at z = 0
  return g;
}
/* Manhattan routing with filleted elbows, the way a line diagram is drawn. */
function route(pts, r = 0.24) {
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
function glowTexture() {
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d'), g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = g; x.fillRect(0, 0, 128, 128);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
/* A synthetic studio: one big softbox above, a warm fill left, a cool strip right,
   an enamel-coloured floor bounce. This is what makes clearcoat and steel read. */
function studio() {
  const s = new THREE.Scene(); s.background = new THREE.Color(0x6f746f);
  const light = (w, h, color, i, pos) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide }));
    m.material.color.multiplyScalar(i); m.position.set(...pos); m.lookAt(0, 0, 0); s.add(m);
  };
  light(12, 12, 0xffffff, 5.5, [0, 9, 3]); light(6, 9, 0xf6f1e6, 2.6, [-9, 2, 4]);
  light(3.5, 10, 0xdde6ec, 2.0, [9, 1, -1]); light(24, 24, 0xa9b1a6, 0.7, [0, -9, 0]);
  return s;
}

export async function bootPanel({ gsap, ScrollTrigger, reduce, canvas, wrapper, copy }) {
  const chapters = [...copy.querySelectorAll('.seq__ch')];
  const legend = document.getElementById('seqLegend'), lab = document.getElementById('seqLabel');
  const bar = document.getElementById('seqBar'), ct = document.getElementById('seqCt');
  wrapper.style.minHeight = chapters.length * 100 + 'svh';
  scrollTo(0, 0);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFShadowMap;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 100);
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(studio(), 0.05).texture; pmrem.dispose();
  scene.environmentIntensity = 1.0;

  const key = new THREE.DirectionalLight(0xffffff, 2.4); key.position.set(-4.5, 7.5, 7.5);
  key.castShadow = true; key.shadow.mapSize.set(2048, 2048); key.shadow.bias = -0.0004; key.shadow.normalBias = 0.02;
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6, near: 1, far: 30 });
  scene.add(key, key.target, new THREE.HemisphereLight(0xffffff, 0x8f978d, 0.35));

  const M = {
    enamel: new THREE.MeshPhysicalMaterial({ color: 0xd4dad1, roughness: 0.42, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.32 }),
    socket: new THREE.MeshStandardMaterial({ color: 0xb4bbb1, roughness: 0.6, polygonOffset: true, polygonOffsetFactor: -1 }),
    steel:  new THREE.MeshStandardMaterial({ color: 0xd9dde0, metalness: 0.95, roughness: 0.3 }),
    graphite: new THREE.MeshStandardMaterial({ color: 0x24282c, roughness: 0.5, metalness: 0.15 }),
    dial:   new THREE.MeshStandardMaterial({ color: 0xeef0ea, roughness: 0.5 }),
    glass:  new THREE.MeshPhysicalMaterial({ color: 0x0e1214, roughness: 0.12, clearcoat: 1, clearcoatRoughness: 0.08 }),
    run:    new THREE.MeshStandardMaterial({ color: RUN, emissive: RUN, emissiveIntensity: 1.6, roughness: 0.35 }),
  };
  const lampMat = () => new THREE.MeshStandardMaterial({ color: 0x8f979d, emissive: RUN, emissiveIntensity: 0, roughness: 0.35 });
  const glowMap = glowTexture();
  const glowMat = () => new THREE.SpriteMaterial({ map: glowMap, color: 0x9be03a, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false });
  const shadow = m => { m.castShadow = true; m.receiveShadow = true; return m; };

  const group = new THREE.Group(); scene.add(group);
  const plate = shadow(new THREE.Mesh(slab(PLATE.w, PLATE.h, 0.34, 0.26, 0.06), M.enamel)); group.add(plate);
  for (const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) {           // mounting screws
    const s = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.04, 20), M.steel);
    s.rotation.x = Math.PI / 2; s.position.set(sx * (PLATE.w / 2 - 0.3), sy * (PLATE.h / 2 - 0.3), 0.02); group.add(s);
    const slot = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.018, 0.012), M.graphite); slot.position.set(s.position.x, s.position.y, 0.042); slot.rotation.z = sx * sy * 0.6; group.add(slot);
  }

  const lamps = [];   // { mat, sprite }
  const addLamp = (parent, x, y, z, r = 0.07) => {
    const mat = lampMat();
    const l = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.06, 20), mat); l.rotation.x = Math.PI / 2; l.position.set(x, y, z); parent.add(l);
    const sp = new THREE.Sprite(glowMat()); sp.scale.setScalar(0.9); sp.position.set(x, y, z + 0.14); parent.add(sp);
    lamps.push({ mat, sprite: sp.material }); return l;
  };
  const nameplate = (x, y, w = 0.6) => { const n = new THREE.Mesh(new THREE.BoxGeometry(w, 0.13, 0.02), M.graphite); n.position.set(x, y, 0.01); group.add(n); };

  const pucks = NODES.map((n, i) => {
    const sock = new THREE.Mesh(new THREE.CircleGeometry(n.r + 0.1, 48), M.socket); sock.position.set(n.x, n.y, 0.003); sock.receiveShadow = true; group.add(sock);
    const bez = shadow(new THREE.Mesh(new THREE.TorusGeometry(n.r + 0.06, 0.04, 12, 56), M.steel)); bez.position.set(n.x, n.y, 0.04); group.add(bez);
    nameplate(n.x, n.y - n.r - 0.24, n.r > 0.4 ? 0.8 : 0.6);
    const g = new THREE.Group(); g.position.set(n.x, n.y, 0); group.add(g);
    const puck = shadow(new THREE.Mesh(new THREE.CylinderGeometry(n.r, n.r, 0.1, 56), M.enamel)); puck.rotation.x = Math.PI / 2; puck.position.z = 0.05; g.add(puck);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(n.r * 0.76, 0.008, 6, 56), M.graphite); ring.position.z = 0.101; g.add(ring);
    addLamp(g, n.r * 0.5, n.r * 0.5, 0.13, n.r > 0.4 ? 0.08 : 0.065);
    const dir = new THREE.Vector2(Math.cos(i * 2.4 + 0.7), Math.sin(i * 2.4 + 0.7));
    return { g, dir, d: i * 0.018 };
  });

  const tubes = ROUTES.map(pts => {
    const path = route(pts);
    const geo = new THREE.TubeGeometry(path, 96, 0.045, 10, false);
    const m = shadow(new THREE.Mesh(geo, M.steel)); m.position.z = 0.03; group.add(m);
    return { m, path, count: geo.index.count };
  });

  const mod = new THREE.Group(); mod.position.set(MODULE.x, MODULE.y, 0); group.add(mod);
  const modSock = new THREE.Mesh(new THREE.PlaneGeometry(MODULE.w + 0.16, MODULE.h + 0.16), M.socket); modSock.position.set(MODULE.x, MODULE.y, 0.003); group.add(modSock);
  mod.add(shadow(new THREE.Mesh(slab(MODULE.w, MODULE.h, 0.08, 0.14, 0.03), M.graphite)));
  const screen = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.32), M.glass); screen.position.set(-0.18, 0, 0.006); mod.add(screen);
  mod.children[0].position.z = 0.17; screen.position.z = 0.176;
  addLamp(mod, 0.52, 0, 0.19, 0.06);
  nameplate(MODULE.x, MODULE.y - 0.56, 0.9);

  const gauge = new THREE.Group(); gauge.position.set(GAUGE.x, GAUGE.y, 0); group.add(gauge);
  const gsock = new THREE.Mesh(new THREE.CircleGeometry(GAUGE.r + 0.1, 48), M.socket); gsock.position.z = 0.003; gauge.add(gsock);
  const gbez = shadow(new THREE.Mesh(new THREE.TorusGeometry(GAUGE.r + 0.05, 0.045, 12, 56), M.steel)); gbez.position.z = 0.045; gauge.add(gbez);
  const dial = new THREE.Mesh(new THREE.CylinderGeometry(GAUGE.r, GAUGE.r, 0.03, 56), M.dial); dial.rotation.x = Math.PI / 2; dial.position.z = 0.015; gauge.add(dial);
  const zone = new THREE.Mesh(new THREE.RingGeometry(GAUGE.r * 0.66, GAUGE.r * 0.8, 32, 1, 0.25, 1.05), M.run); zone.position.z = 0.032; gauge.add(zone);
  for (let i = 0; i < 9; i++) { const a = -2.5 + i * (3.6 / 8); const tick = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.012, 0.01), M.graphite); tick.position.set(Math.cos(a) * GAUGE.r * 0.86, Math.sin(a) * GAUGE.r * 0.86, 0.032); tick.rotation.z = a; gauge.add(tick); }
  const needle = new THREE.Group(); needle.position.z = 0.05; gauge.add(needle);
  const nd = new THREE.Mesh(new THREE.BoxGeometry(GAUGE.r * 0.8, 0.02, 0.016), M.graphite); nd.position.x = GAUGE.r * 0.36; needle.add(nd);
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.03, 24), M.graphite); hub.rotation.x = Math.PI / 2; needle.add(hub);
  addLamp(gauge, GAUGE.r * 0.72, -GAUGE.r * 0.72, 0.05, 0.05);
  nameplate(GAUGE.x, GAUGE.y - GAUGE.r - 0.22, 0.7);

  const pulses = tubes.map(() => { const p = new THREE.Mesh(new THREE.SphereGeometry(0.055, 14, 14), M.run); p.visible = false; p.position.z = 0.03; group.add(p); return p; });

  /* Layout: the panel owns the right ~52% of the screen on desktop; on narrow
     screens it sits above the copy and is allowed to crop at the edges. */
  let k = 1, vw = 1, vh = 1, copyRightPx = 0;
  const measure = () => {
    vw = canvas.clientWidth || innerWidth; vh = canvas.clientHeight || innerHeight;
    k = clamp01((vw - 700) / 500);
    copyRightPx = chapters[0].firstElementChild.getBoundingClientRect().right;
    renderer.setSize(vw, vh, false); camera.aspect = vw / vh; camera.updateProjectionMatrix();
  };
  measure(); new ResizeObserver(measure).observe(canvas); document.fonts?.ready.then(measure);

  const state = { t: reduce ? 1 : 0 };
  const mouse = new THREE.Vector2(), tilt = new THREE.Vector2();
  if (!reduce) addEventListener('pointermove', e => { mouse.set((e.clientX / innerWidth - 0.5) * 2, (e.clientY / innerHeight - 0.5) * 2); }, { passive: true });

  const readout = p => {
    const n = chapters.length, i = Math.min(n - 1, Math.round(p * (n - 1)));
    chapters.forEach((c, j) => c.classList.toggle('on', j === i));
    if (lab.textContent !== chapters[i].dataset.title) { lab.textContent = chapters[i].dataset.title; document.title = 'ClarityOps | ' + chapters[i].dataset.title; }
    bar.style.transform = `scaleX(${p})`; ct.textContent = String(Math.round(p * 100)).padStart(3, '0');
  };
  if (!reduce) {
    gsap.to(state, { t: 1, ease: 'none', scrollTrigger: { trigger: wrapper, start: 'top top', end: 'bottom bottom', scrub: 0.6,
      onUpdate: self => readout(self.progress), onToggle: self => legend.classList.toggle('on', self.isActive) } });
  } else { chapters.forEach(c => c.classList.add('on')); }

  const t0 = performance.now();
  let live = true, first = true;
  new IntersectionObserver(([e]) => { live = e.isIntersecting; }).observe(canvas);

  function frame() {
    const t = state.t, time = (performance.now() - t0) / 1000;
    /* camera: in for the disassembly, out to see the whole machine run */
    const cz = 12.6 - 2.2 * out3(win(t, 0, 0.42)) + 2.8 * out3(win(t, 0.58, 0.9));
    const visH = 2 * cz * Math.tan(camera.fov * Math.PI / 360), visW = visH * camera.aspect;
    /* desktop: instruments sit right of the copy, plate stays inside the frame */
    const copyRight = (copyRightPx / vw - 0.5) * visW, instL = 2.35 + 0.46, pad = 0.3;
    let s = 0.88, cx = Math.max(0.2 * visW, copyRight + instL * s + pad);
    if (cx + PLATE.w / 2 * s > visW / 2 - 0.05) { s = Math.max(0.55, (visW / 2 - 0.05 - copyRight - pad) / (instL + PLATE.w / 2)); cx = copyRight + instL * s + pad; }
    /* narrow: the plate sits above the copy and may crop at the edges */
    const fit = Math.min(0.9, clamp01(visW * 0.85 / PLATE.w));
    group.scale.setScalar(k * s + (1 - k) * fit);
    group.position.x = cx * k;
    group.position.y = (1 - k) * visH * 0.22;
    tilt.lerp(mouse, 0.05);
    group.rotation.set(0.05 + tilt.y * 0.05 + Math.sin(time * 0.35) * 0.01, -0.16 * k + 0.1 * out3(win(t, 0.55, 1)) + tilt.x * 0.07, 0);
    camera.position.set(0, 0.3, cz); camera.lookAt(0, 0, 0);
    key.target.position.copy(group.position);

    /* instruments: hover, drift, then seat (staggered) */
    const drift = win(t, 0.12, 0.42);
    pucks.forEach(({ g, dir, d }, i) => {
      const seat = out5(win(t, 0.4 + d, 0.58 + d));
      const hover = (0.85 + 0.8 * drift + Math.sin(time * 0.9 + i) * 0.04) * (1 - seat);
      const sc = 0.46 * drift * (1 - seat);
      g.position.set(NODES[i].x + dir.x * sc, NODES[i].y + dir.y * sc, hover);
      g.rotation.set(dir.y * sc * 0.9, -dir.x * sc * 0.9, 0);
    });
    const mseat = out5(win(t, 0.46, 0.64));
    mod.position.z = (1.0 + 0.4 * drift + Math.sin(time * 0.8 + 3) * 0.04) * (1 - mseat);
    mod.rotation.set(0.25 * drift * (1 - mseat), -0.2 * drift * (1 - mseat), 0);
    /* conduits draw, in sequence */
    tubes.forEach(({ m, count }, i) => { const p = out3(win(t, 0.5 + i * 0.02, 0.63 + i * 0.02)); m.geometry.setDrawRange(0, Math.floor(p * count)); m.visible = p > 0; });
    /* lamps come on, the gauge sweeps into the run zone */
    lamps.forEach((l, i) => { const p = out3(win(t, 0.62 + i * 0.018, 0.7 + i * 0.018)); l.mat.emissiveIntensity = 1.9 * p; l.mat.color.setHex(0x8f979d).lerp(new THREE.Color(RUN), p); l.sprite.opacity = 0.7 * p; });
    const gt = out3(win(t, 0.66, 0.84));
    needle.rotation.z = -2.45 + 3.1 * gt + (t > 0.84 ? Math.sin(time * 1.7) * 0.025 : 0);
    /* signals travel */
    const run = win(t, 0.8, 0.92);
    pulses.forEach((p, i) => { p.visible = run > 0; if (!p.visible) return; const u = (time * 0.16 + i * 0.37) % 1; const pt = tubes[i].path.getPointAt(u); p.position.set(pt.x, pt.y, 0.03); p.scale.setScalar(run); });

    renderer.render(scene, camera);
    if (first) { first = false; canvas.classList.add('is-live'); }
  }
  gsap.ticker.add(() => { if (live) frame(); });
  frame();
  ScrollTrigger.refresh();
  return { renderer, scene, camera, group, state };
}
