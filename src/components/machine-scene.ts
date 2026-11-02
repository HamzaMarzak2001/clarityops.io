/* The operation as a machine, drawn the way a scanner sees it: points and hairlines, no surfaces.
   Scrolling flies the camera into it, chamber by chamber. All motion runs in the vertex shader. */
import { AdditiveBlending, BoxGeometry, Group, DoubleSide, BufferGeometry, Color, CatmullRomCurve3, CustomBlending, CylinderGeometry, ExtrudeGeometry, Path, Shape, Vector2 as V2, Float32BufferAttribute, LineSegments, Mesh, NoBlending, OneFactor, OneMinusSrcAlphaFactor, PerspectiveCamera, PlaneGeometry, Points, Scene, ShaderMaterial, Vector2, Vector3, WebGLRenderer, WebGLRenderTarget, AddEquation } from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

class Cloud {
  p: number[] = []; r: number[] = []; f: number[] = []; a: number[] = []; g: number[] = []; n: number[] = [];
  ln_n: number[] = []; tone = 1;
  /* Black solids that hide what's behind them, so the machine reads as parts rather than as a see-through cloud. */
  solids: BufferGeometry[] = [];
  lp: number[] = []; lr: number[] = []; lf: number[] = []; la: number[] = []; lg: number[] = [];
  /* rot: spin speed and centre. flow: position along the light path, brightness of the light, travel speed. */
  rot: [number, number, number] = [0, 0, 0];
  flow: [number, number, number] = [0, 0, 0];
  alt: [number, number, number] = [0, 0, 0];
  group = 0;
  pt(x: number, y: number, z: number, nx = 0, ny = 0, nz = 0) { this.p.push(x, y, z); this.n.push(nx * this.tone, ny * this.tone, nz * this.tone); this.r.push(...this.rot); this.f.push(...this.flow); this.a.push(...this.alt); this.g.push(this.group); }
  ln(ax: number, ay: number, az: number, bx: number, by: number, bz: number) {
    this.lp.push(ax, ay, az, bx, by, bz);
    this.ln_n.push(0, 0, this.tone, 0, 0, this.tone);
    for (let i = 0; i < 2; i++) { this.lr.push(...this.rot); this.lf.push(...this.flow); this.la.push(...this.alt); this.lg.push(this.group); }
  }
}
const TAU = Math.PI * 2;
let seed = 19;
const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };

function ring(c: Cloud, z: number, r: number, n: number, cx = 0, cy = 0, line = true) {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * TAU;
    c.pt(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z);
    if (line) { const b = ((i + 1) / n) * TAU; c.ln(cx + Math.cos(a) * r, cy + Math.sin(a) * r, z, cx + Math.cos(b) * r, cy + Math.sin(b) * r, z); }
  }
}
function casing(c: Cloud, z0: number, z1: number, R: (z: number) => number, q: number, ribs = 24) {
  const len = Math.abs(z1 - z0);
  const rings = Math.round(len * 1.6);
  for (let i = 0; i <= rings; i++) {
    const z = z0 + ((z1 - z0) * i) / rings, r = R(z), heavy = i % 8 === 0;
    if (heavy || i % 2 === 0) ring(c, z, r, Math.round((heavy ? 300 : 90) * q), 0, 0, heavy);
    if (heavy) { ring(c, z, r * 1.035, Math.round(190 * q), 0, 0, true); for (let b = 0; b < 32; b++) { const a = (b / 32) * TAU; c.pt(Math.cos(a) * r * 1.018, Math.sin(a) * r * 1.018, z + 0.14); } }
  }
  for (let k = 0; k < ribs; k++) {
    const a = (k / ribs) * TAU;
    const N = Math.round(len * 8 * q);
    for (let i = 0; i < N; i++) { const z = z0 + ((z1 - z0) * i) / N, r = R(z); c.pt(Math.cos(a) * r, Math.sin(a) * r, z); }
    c.ln(Math.cos(a) * R(z0), Math.sin(a) * R(z0), z0, Math.cos(a) * R(z1), Math.sin(a) * R(z1), z1);
  }
}
/** A stage of blades around the axis. */
function rotor(c: Cloud, z: number, r0: number, r1: number, blades: number, twist: number, depth: number, speed: number, q: number) {
  const keep = c.rot; c.rot = [speed, 0, 0];
  for (let b = 0; b < blades; b++) {
    const a0 = (b / blades) * TAU;
    const U = Math.round(26 * Math.sqrt(q) + 6), V = Math.round(9 * Math.sqrt(q) + 3);
    for (let u = 0; u <= U; u++) for (let v = 0; v <= V; v++) {
      const uu = u / U, vv = v / V - 0.5, r = r0 + (r1 - r0) * uu, sweep = (0.42 - 0.2 * uu) * vv + twist * uu;
      c.pt(Math.cos(a0 + sweep) * r, Math.sin(a0 + sweep) * r, z + vv * depth * (1 - uu * 0.45));
    }
    const edge = (vv: number) => { let px = 0, py = 0, pz = 0; for (let u = 0; u <= 8; u++) { const uu = u / 8, r = r0 + (r1 - r0) * uu, s = (0.42 - 0.2 * uu) * vv + twist * uu, x = Math.cos(a0 + s) * r, y = Math.sin(a0 + s) * r, zz = z + vv * depth * (1 - uu * 0.45); if (u) c.ln(px, py, pz, x, y, zz); px = x; py = y; pz = zz; } };
    edge(-0.5); edge(0.5);
  }
  ring(c, z, r0, Math.round(120 * q)); ring(c, z - depth / 2, r0, Math.round(120 * q));
  ring(c, z, r1 * 1.01, Math.round(220 * q));
  c.rot = keep;
}
/** A gear drawn like a technical drawing: one exact tooth outline, a web, a hub and paired spokes. */
function gear(c: Cloud, cx: number, cy: number, z: number, r: number, teeth: number, speed: number, width: number, q: number, phase = 0, lit = false) {
  const keep = c.rot, keepF = c.flow; c.rot = [speed, cx, cy];
  const pitch = TAU / teeth, add = r * (1 / teeth) * 1.7, root = r - add * 1.15, tip = r + add;
  const at = (a: number, rr: number, zz: number): [number, number, number] => [cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, zz];
  for (const zz of width > 0 ? [z - width / 2, z + width / 2] : [z]) {
    let prev: [number, number, number] | null = null;
    for (let i = 0; i < teeth; i++) {
      const m = phase + i * pitch;
      for (const [o, rr] of [[-0.34, root], [-0.15, tip], [0.15, tip], [0.34, root]] as const) {
        const a = m + o * pitch, p = at(a, rr, zz);
        if (lit) c.flow = [(((a % TAU) + TAU) % TAU) * 10.13, 1, 0];
        if (prev) c.ln(...prev, ...p);
        c.pt(...p);
        prev = p;
      }
    }
    if (prev) c.ln(...prev, ...at(phase - 0.34 * pitch, root, zz));
    c.flow = keepF;
    ring(c, zz, root * 0.9, Math.round(r * 26 * q + 24), cx, cy);
    ring(c, zz, r * 0.2, Math.round(r * 10 + 18), cx, cy);
    ring(c, zz, r * 0.13, Math.round(r * 8 + 14), cx, cy);
    const spokes = Math.max(5, Math.round(teeth / 7)), w = 0.1;
    for (let k = 0; k < spokes; k++) {
      const a = (k / spokes) * TAU + phase;
      for (const side of [-1, 1]) c.ln(...at(a + (side * w * 1.6) / 2, r * 0.2, zz), ...at(a + (side * w * 0.5) / 2, root * 0.9, zz));
    }
  }
  c.rot = keep; c.flow = keepF;
}
const withRot = (g: BufferGeometry, rot: [number, number, number]) => {
  let o = g.index ? g.toNonIndexed() : g;
  o.deleteAttribute("uv");
  const n = o.getAttribute("position").count, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = rot[0]; a[i * 3 + 1] = rot[1]; a[i * 3 + 2] = rot[2]; }
  o.setAttribute("aRot", new Float32BufferAttribute(a, 3));
  return o;
};
const arcPts = (cx: number, cy: number, r: number, a0: number, a1: number, n: number) => Array.from({ length: n + 1 }, (_, i) => { const a = a0 + ((a1 - a0) * i) / n; return new V2(cx + Math.cos(a) * r, cy + Math.sin(a) * r); });

/** A gear with real thickness: rim, cut-out windows, spokes and a raised hub, all stippled and lit like machined steel. */
function solidGear(c: Cloud, g: Placed, T: number, q: number, m: number, tone: number, lit = false, hole = 0) {
  const keep = c.rot, keepF = c.flow, keepT = c.tone;
  c.rot = [g.v, g.x, g.y]; c.tone = tone;
  const { x, y, z, n, ph, r: R } = g, add = 1.7 / m, root = R - add * 1.15, tip = R + add, top = z + T / 2, bot = z - T / 2, pitch = TAU / n;
  const big = n >= 26 && !hole, bore = hole || R * (big ? 0.11 : 0.2), hubR = hole ? hole * 1.02 : R * (big ? 0.27 : 0.42), rimIn = root * 0.8, spokes = big ? Math.max(5, Math.round(n / 9)) : 0, spokeW = R * 0.1;
  const outline: V2[] = [];
  for (let i = 0; i < n; i++) for (const [o, rr] of [[-0.34, root], [-0.15, tip], [0.15, tip], [0.34, root]] as const) { const a = ph + i * pitch + o * pitch; outline.push(new V2(x + Math.cos(a) * rr, y + Math.sin(a) * rr)); }
  const shape = new Shape(outline);
  shape.holes.push(new Path(arcPts(x, y, bore, 0, TAU, 28)));
  const windows: V2[][] = [];
  for (let k = 0; k < spokes; k++) {
    const a0 = ph + (k / spokes) * TAU, a1 = ph + ((k + 1) / spokes) * TAU, gapO = spokeW / rimIn, gapI = spokeW / hubR;
    const w = [...arcPts(x, y, rimIn, a0 + gapO, a1 - gapO, 14), ...arcPts(x, y, hubR * 1.04, a1 - gapI, a0 + gapI, 8)];
    windows.push(w);
    shape.holes.push(new Path(w));
  }
  const ex = new ExtrudeGeometry(shape, { depth: T, bevelEnabled: false, curveSegments: 1 });
  ex.translate(0, 0, bot);
  c.solids.push(withRot(ex, c.rot));
  const hubTop = top + T * 0.3;
  if (!hole) { const hub = new CylinderGeometry(hubR * 0.72, hubR * 0.72, hubTop - top, 28, 1, true); hub.rotateX(Math.PI / 2); hub.translate(x, y, (top + hubTop) / 2); c.solids.push(withRot(hub, c.rot)); }
  /* Stipple the faces. Rejection on the windows keeps them open. */
  const inWindow = (a: number, rr: number) => {
    if (!spokes || rr < hubR || rr > rimIn) return false;
    const u = (((a - ph) % TAU) + TAU) % TAU, seg = TAU / spokes, d = Math.min(u % seg, seg - (u % seg));
    return d * rr > spokeW;
  };
  const faceN = Math.round(Math.PI * R * R * 62 * q);
  for (let i = 0; i < faceN; i++) {
    const a = rnd() * TAU, rr = Math.sqrt(rnd()) * root;
    if (rr < bore || inWindow(a, rr)) continue;
    const onHub = !hole && rr < hubR * 0.72;
    c.pt(x + Math.cos(a) * rr, y + Math.sin(a) * rr, (onHub ? hubTop : top) + 0.01, 0, 0, 1);
  }
  /* Teeth walls and tops. */
  const K = outline.length;
  let lastLit = c.flow;
  for (let i = 0; i < K; i++) {
    const A = outline[i], B = outline[(i + 1) % K], dx = B.x - A.x, dy = B.y - A.y, l = Math.hypot(dx, dy) || 1, nx = dy / l, ny = -dx / l;
    const mx = (A.x + B.x) / 2 - x, my = (A.y + B.y) / 2 - y, sgn = nx * mx + ny * my > 0 ? 1 : -1;
    if (lit) c.flow = [((Math.atan2(my, mx) + TAU) % TAU) * 10.13, 1, 0];
    c.ln(A.x, A.y, top, B.x, B.y, top);
    if (i % 4 === 1 || i % 4 === 2) c.ln(A.x, A.y, top, A.x, A.y, bot);
    const rows = Math.max(2, Math.round(T * 5 * Math.sqrt(q))), cols = Math.max(1, Math.round(l * 7 * Math.sqrt(q)));
    for (let u = 0; u <= cols; u++) for (let v = 0; v <= rows; v++) { const t = u / cols; c.pt(A.x + dx * t, A.y + dy * t, bot + (T * v) / rows, nx * sgn, ny * sgn, 0.05); }
    lastLit = c.flow;
  }
  void lastLit; c.flow = keepF;
  /* Window edges with a visible wall, so you see the thickness of the steel. */
  for (const w of windows) for (let i = 0; i < w.length; i++) {
    const A = w[i], B = w[(i + 1) % w.length];
    c.ln(A.x, A.y, top, B.x, B.y, top);
    const mx = (A.x + B.x) / 2 - x, my = (A.y + B.y) / 2 - y, ml = Math.hypot(mx, my) || 1;
    for (let v = 0; v <= 3; v++) c.pt(mx + x, my + y, bot + (T * v) / 3, -mx / ml, -my / ml, 0.05);
  }
  /* Machined rings, hub and bolts. */
  const ringAt = (zz: number, rr: number, nn: number) => { const t = c.tone; ring(c, zz, rr, nn, x, y); c.tone = t; };
  ringAt(top + 0.01, root * 0.92, Math.round(R * 22 + 30));
  ringAt(top + 0.01, rimIn, Math.round(R * 18 + 24));
  if (hole) {
    /* The inner edge carries light, and a ring of bolts holds it. */
    ringAt(top + 0.01, hole * 1.01, Math.round(hole * 26 + 40));
    for (const rr of [hole * 1.035, hole * 1.06]) { const N = Math.round(rr * 44 + 60); for (let i = 0; i < N; i++) { const a = (i / N) * TAU; c.flow = [a * 10.13 + rr, 1.5, 0]; c.pt(x + Math.cos(a) * rr, y + Math.sin(a) * rr, top + 0.02); } }
    c.flow = keepF;
    const bolts = Math.round(R * 5), rb = (hole + root * 0.92) / 2;
    for (let b = 0; b < bolts; b++) { const a = ph + (b / bolts) * TAU; ring(c, top + 0.02, 0.09, 10, x + Math.cos(a) * rb, y + Math.sin(a) * rb); }
    const wall = Math.round(hole * 16 + 30);
    for (let i = 0; i < wall; i++) { const a = (i / wall) * TAU; for (let v = 0; v <= 3; v++) c.pt(x + Math.cos(a) * hole, y + Math.sin(a) * hole, bot + (T * v) / 3, -Math.cos(a), -Math.sin(a), 0.05); }
  } else {
    ringAt(hubTop, hubR * 0.72, Math.round(R * 8 + 24));
    ringAt(hubTop, bore, Math.round(R * 4 + 18));
    ringAt(top, hubR, Math.round(R * 8 + 24));
    const hubWall = Math.round(R * 18 + 20);
    for (let i = 0; i < hubWall; i++) { const a = (i / hubWall) * TAU; for (let v = 0; v <= 3; v++) c.pt(x + Math.cos(a) * hubR * 0.72, y + Math.sin(a) * hubR * 0.72, top + ((hubTop - top) * v) / 3, Math.cos(a), Math.sin(a), 0.05); }
    if (R > 2) for (let b = 0; b < 8; b++) { const a = ph + (b / 8) * TAU, rb = (hubR * 0.72 + bore) / 2, bx = x + Math.cos(a) * rb, by = y + Math.sin(a) * rb; ring(c, hubTop + 0.02, R * 0.022 + 0.05, 10, bx, by); }
  }
  c.rot = keep; c.tone = keepT;
}

/** A train of gears that really mesh: each one's size, position, speed and tooth phase follow from the one driving it. */
type Link = { from?: number; dir?: number; n: number; z?: number; shaft?: number };
type P3 = [number, number, number];
type Placed = { x: number; y: number; r: number; n: number; v: number; ph: number; z: number };
function train(c: Cloud, z: number, links: Link[], speed: number, width: number, q: number, m = 8, lit = false, draw?: (g: Placed) => void, at: [number, number] = [0, 0]) {
  const out: Placed[] = [];
  links.forEach((l, i) => {
    const r = l.n / m;
    if (l.shaft !== undefined) { const p = out[l.shaft]; out.push({ x: p.x, y: p.y, r, n: l.n, v: p.v, ph: 0, z: l.z ?? z }); }
    else if (l.from === undefined) out.push({ x: at[0], y: at[1], r, n: l.n, v: speed, ph: 0, z: l.z ?? z });
    else {
      const p = out[l.from], d = l.dir ?? 0, dist = p.r + r;
      /* The tooth on the driver at the contact line must meet a gap on the driven gear. */
      const pd = TAU / l.n, u = (d - p.ph) / (TAU / p.n), ph = d + Math.PI - pd * (0.5 - u);
      out.push({ x: p.x + Math.cos(d) * dist, y: p.y + Math.sin(d) * dist, r, n: l.n, v: (-p.v * p.n) / l.n, ph, z: l.z ?? p.z });
    }
    const g = out[i];
    if (draw) draw(g); else gear(c, g.x, g.y, g.z, g.r, g.n, g.v, width, q, g.ph, lit);
  });
  return out;
}

/** A pipe with light running along it. */
function pipe(c: Cloud, pts: [number, number, number][], r: number, q: number, bright = 1) {
  const curve = new CatmullRomCurve3(pts.map((p) => new Vector3(...p)), false, "centripetal");
  const len = curve.getLength(), N = Math.round(len * 10 * Math.sqrt(q)) + 6, keep = c.flow;
  const P = new Vector3(), T = new Vector3(), A = new Vector3(), B = new Vector3();
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    curve.getPointAt(t, P); curve.getTangentAt(t, T);
    A.set(T.y, -T.x, 0.3).cross(T).normalize(); B.crossVectors(T, A);
    c.flow = [t * len, bright, 0];
    const sides = 6;
    for (let s = 0; s < sides; s++) { const a = (s / sides) * TAU; c.pt(P.x + (A.x * Math.cos(a) + B.x * Math.sin(a)) * r, P.y + (A.y * Math.cos(a) + B.y * Math.sin(a)) * r, P.z + (A.z * Math.cos(a) + B.z * Math.sin(a)) * r); }
    if (i) { const Q = curve.getPointAt((i - 1) / N); c.ln(Q.x, Q.y, Q.z, P.x, P.y, P.z); }
  }
  c.flow = keep;
}
/** Racks along a wall, like the boxes in a scanned building. */
function box(c: Cloud, x: number, y: number, z: number, w: number, h: number, d: number, q: number) {
  const v = [[-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1], [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1]].map(([a, b, e]) => [x + (a * w) / 2, y + (b * h) / 2, z + (e * d) / 2]);
  for (const [a, b] of [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]]) {
    c.ln(v[a][0], v[a][1], v[a][2], v[b][0], v[b][1], v[b][2]);
    const n = Math.round(Math.hypot(v[a][0] - v[b][0], v[a][1] - v[b][1], v[a][2] - v[b][2]) * 7 * q) + 2;
    for (let i = 0; i <= n; i++) { const t = i / n; c.pt(v[a][0] + (v[b][0] - v[a][0]) * t, v[a][1] + (v[b][1] - v[a][1]) * t, v[a][2] + (v[b][2] - v[a][2]) * t); }
  }
}

function buildWorld(q: number) {
  const c = new Cloud();

  /* ---- 1. The drive. A real assembly on three levels: top train, machined plate, lower train, motors and rams. ---- */
  const T1 = 2.6, T3 = 2.4, Z1 = 4.4, Z3 = -6.2;
  train(c, Z1, [
    { n: 72 },
    { from: 0, dir: 0.3, n: 26 },
    { from: 1, dir: -0.55, n: 46 },
    { from: 0, dir: 1.2, n: 22 },
    { from: 3, dir: 0.35, n: 38 },
    { from: 0, dir: -1.3, n: 30 },
    { from: 5, dir: -0.25, n: 20 },
    { from: 4, dir: 0.9, n: 18 },
  ], 0.18, 0, q, 8, false, (g) => solidGear(c, g, T1, q, 8, 1.7, g.n === 72));
  /* Lower level: compound gears on the same shafts, so the motion really carries through. */
  train(c, Z3, [
    { n: 40 },
    { from: 0, dir: 0.75, n: 54 },
    { from: 1, dir: -0.1, n: 24 },
    { from: 0, dir: -0.6, n: 34 },
  ], 0.18, 0, q, 8, false, (g) => solidGear(c, g, T3, q * 0.8, 8, 1));
  casing(c, -10, -30, () => 6.2, q);

  /* ---- 2. The tangle: lines going everywhere, which at the end of the problem section straighten out. ---- */
  c.group = 4;
  const lines = 24;
  for (let i = 0; i < lines; i++) {
    const row = i % 6, col = Math.floor(i / 6), tx = (row - 2.5) * 1.75, ty = (col - 1.5) * 1.75 - 0.2;
    const pts: [number, number, number][] = [];
    const steps = 5;
    for (let s = 0; s <= steps; s++) { const z = -7 - (s / steps) * 21; pts.push([(rnd() - 0.5) * 10, (rnd() - 0.5) * 10, z + (rnd() - 0.5) * 2.4]); }
    const curve = new CatmullRomCurve3(pts.map((p) => new Vector3(...p)), false, "centripetal");
    const len = curve.getLength(), N = Math.round(len * 3.2) + 8, P = new Vector3(), T = new Vector3(), A = new Vector3(), B = new Vector3();
    const r = 0.15, sides = Math.max(6, Math.round(12 * Math.sqrt(q)));
    let prev: number[][] | null = null, prevAlt: number[][] | null = null;
    for (let n = 0; n <= N; n++) {
      const t = n / N;
      curve.getPointAt(t, P); curve.getTangentAt(t, T);
      A.set(T.y, -T.x, 0.3).cross(T).normalize(); B.crossVectors(T, A);
      const fz = -7 - t * 21;
      c.flow = [t * 34, 1.1, 0];
      const cur: number[][] = [], curAlt: number[][] = [];
      for (let k = 0; k < sides; k++) {
        const a = (k / sides) * TAU, ca = Math.cos(a) * r, sa = Math.sin(a) * r;
        const v = [P.x + A.x * ca + B.x * sa, P.y + A.y * ca + B.y * sa, P.z + A.z * ca + B.z * sa], w = [tx + ca, ty + sa, fz];
        cur.push(v); curAlt.push(w);
        c.p.push(v[0], v[1], v[2]); c.n.push(0, 0, 0); c.r.push(...c.rot); c.f.push(...c.flow); c.a.push(w[0], w[1], w[2]); c.g.push(c.group);
      }
      /* A hoop every few steps and four long edges: reads as a pipe, not as dust. */
      const seg = (u: number[], uA: number[], v: number[], vA: number[]) => { c.lp.push(u[0], u[1], u[2], v[0], v[1], v[2]); c.ln_n.push(0, 0, 1, 0, 0, 1); c.la.push(uA[0], uA[1], uA[2], vA[0], vA[1], vA[2]); for (let e = 0; e < 2; e++) { c.lr.push(...c.rot); c.lf.push(...c.flow); c.lg.push(c.group); } };
      if (n % 3 === 0) for (let k = 0; k < sides; k++) { const m = (k + 1) % sides; seg(cur[k], curAlt[k], cur[m], curAlt[m]); }
      if (prev && prevAlt) for (let k = 0; k < sides; k += Math.ceil(sides / 4)) seg(prev[k], prevAlt[k], cur[k], curAlt[k]);
      prev = cur; prevAlt = curAlt;
    }
  }
  c.group = 0; c.alt = [0, 0, 0]; c.flow = [0, 0, 0];

  /* ---- 3. The gear room: one train of real meshing gears, so one input drives everything. ---- */
  const Z = -41;
  casing(c, -30, -52, () => 9.4, q * 0.7, 16);
  train(c, Z, [
    { n: 34 },
    { from: 0, dir: 0.5, n: 22 },
    { from: 1, dir: -0.7, n: 28 },
    { from: 0, dir: 2.6, n: 26 },
    { from: 3, dir: 1.1, n: 18 },
    { from: 0, dir: 4.4, n: 24 },
    { from: 5, dir: 5.5, n: 30 },
  ], 0.5, 0, q, 7);
  for (let i = 0; i < 14; i++) { const a = (i / 14) * TAU; pipe(c, [[Math.cos(a) * 9.2, Math.sin(a) * 9.2, -31], [Math.cos(a) * 8.6, Math.sin(a) * 8.6, -40], [Math.cos(a) * 9.2, Math.sin(a) * 9.2, -51]], 0.08, q, 0.8); }

  /* ---- 4. The conveyor: units of work moving through, along both sides. ---- */
  const belts: [number, number][] = [[-5.6, -5.4], [5.6, -5.4], [-5.6, 5.4], [5.6, 5.4]];
  for (const [x, y] of belts) {
    for (const off of [-0.6, 0.6]) { c.ln(x + off, y, -52, x + off, y, -61); for (let i = 0; i < 70 * q; i++) c.pt(x + off, y, -52 - (i / (70 * q)) * 9); }
    for (let i = 0; i < 6; i++) {
      c.flow = [0, 0.9, 1.5];
      const z0 = -52 - (i / 6) * 9;
      c.alt = [-61, 9, 0];
      box(c, x, y + 0.42, z0, 0.92, 0.7, 1.05, q);
      c.flow = [0, 0, 0]; c.alt = [0, 0, 0];
    }
  }
  casing(c, -52, -62, () => 8.6, q * 0.5, 12);
  for (let s = -1; s <= 1; s += 2) for (let i = 0; i < 3; i++) for (let k = -1; k <= 1; k++) box(c, s * 7.3, k * 2.5, -54 - i * 2.6, 1.6, 2.2, 2.2, q * 0.65);

  /* ---- 5. The hall the three layers build up in (see buildStack). ---- */
  casing(c, -70, -94, () => 12.5, q * 0.35, 10);

  /* ---- 6. Further in: long service corridor, ending at the core. ---- */
  casing(c, -94, -128, (z) => 6.8 - Math.max(0, -z - 118) * 0.1, q * 0.6, 20);
  for (let i = 0; i < 8; i++) rotor(c, -98 - i * 3.6, 0.9, 5.6, 14 + (i % 3) * 4, i % 2 ? 0.5 : -0.5, 0.5, i % 2 ? 0.26 : -0.34, q * 0.45);
  /* The core, closing the loop. */
  const CZ = -137;
  casing(c, -128, -146, () => 9.4, q * 0.35, 12);
  for (let k = 0; k < 7; k++) {
    c.flow = [k * 3, 0.3, 0];
    ring(c, CZ + (k - 3) * 0.32, 3.8 - Math.abs(k - 3) * 0.1, Math.round(900 * q), 0, 0, k === 3);
  }
  c.flow = [0, 0, 0];
  rotor(c, CZ, 3.9, 8.8, 26, 0.5, 0.9, 0.12, q * 0.6);
  return c;
}

/* What we do, as a system built in three layers along one axis (z here, up on screen).
   Each is a real part of the logic: the plan underneath, the mechanism placed on it, the agents working over it. */
function buildStack(q: number) {
  const R0 = 6.7, m = 10, T = 0.95;
  const L1 = new Cloud(), L2 = new Cloud(), L3 = new Cloud(), up12 = new Cloud(), up23 = new Cloud(), frame = new Cloud(), glow = new Cloud();
  const gears: Placed[] = [];
  train(L2, 0, [{ n: 30 }, { from: 0, dir: 0.5, n: 16 }, { from: 0, dir: 1.75, n: 16 }, { from: 0, dir: 3, n: 16 }, { from: 0, dir: 4.25, n: 16 }, { from: 0, dir: 5.5, n: 16 }], 0.34, 0, q, m, false, (g) => { gears.push(g); solidGear(L2, g, T, q * 1.4, m, 1.7); });
  ring(L2, 0, R0, Math.round(300 * Math.max(0.5, q)));
  ring(L2, 0, R0 - 0.16, Math.round(220 * Math.max(0.5, q)));

  /* Layer 1, the design: a plate carrying the plan. Boxes for the parts of the operation, routes for how work moves between them. */
  const disc = new Shape(arcPts(0, 0, R0, 0, TAU, 96));
  const dg = new ExtrudeGeometry(disc, { depth: 0.22, bevelEnabled: false, curveSegments: 1 });
  dg.translate(0, 0, -0.22);
  L1.solids.push(withRot(dg, [0, 0, 0]));
  L1.tone = 0.75;
  const dN = Math.round(Math.PI * R0 * R0 * 42 * q);
  for (let i = 0; i < dN; i++) { const a = rnd() * TAU, r = Math.sqrt(rnd()) * R0; L1.pt(Math.cos(a) * r, Math.sin(a) * r, 0.01, 0, 0, 1); }
  L1.tone = 0.45;
  for (let v = -6; v <= 6; v++) { const h = Math.sqrt(Math.max(0, R0 * R0 - v * v)) * 0.985; L1.ln(v, -h, 0.01, v, h, 0.01); L1.ln(-h, v, 0.01, h, v, 0.01); }
  L1.tone = 1.3;
  ring(L1, 0.01, R0, Math.round(320 * Math.max(0.5, q)));
  ring(L1, 0.01, R0 - 0.3, 120);
  for (let i = 0; i < 72; i++) { const a = (i / 72) * TAU, r0 = R0 - (i % 6 === 0 ? 0.3 : 0.14); L1.ln(Math.cos(a) * r0, Math.sin(a) * r0, 0.01, Math.cos(a) * R0, Math.sin(a) * R0, 0.01); }
  const rect = (x: number, y: number, w: number, h: number) => {
    const P: [number, number][] = [[x - w / 2, y - h / 2], [x + w / 2, y - h / 2], [x + w / 2, y + h / 2], [x - w / 2, y + h / 2]];
    P.forEach((p, i) => { const e = P[(i + 1) % 4]; L1.ln(p[0], p[1], 0.03, e[0], e[1], 0.03); const n = Math.round(Math.hypot(e[0] - p[0], e[1] - p[1]) * 16 * Math.sqrt(Math.max(q, 0.4))); for (let k = 0; k <= n; k++) L1.pt(p[0] + ((e[0] - p[0]) * k) / n, p[1] + ((e[1] - p[1]) * k) / n, 0.03); });
    L1.ln(x - w / 2 + 0.16, y + h / 2 - 0.3, 0.03, x + w * 0.1, y + h / 2 - 0.3, 0.03);
    for (let b = 0; b < 2; b++) L1.ln(x - w / 2 + 0.16, y - 0.05 - b * 0.22, 0.03, x + w / 2 - 0.2 - b * 0.4, y - 0.05 - b * 0.22, 0.03);
  };
  const route = (a: [number, number], mid: [number, number], b: [number, number]) => {
    let d = rnd() * 10;
    for (const [u, v] of [[a, mid], [mid, b]] as [[number, number], [number, number]][]) {
      const len = Math.hypot(v[0] - u[0], v[1] - u[1]), n = Math.max(2, Math.round(len * 16 * Math.sqrt(Math.max(q, 0.4))));
      for (let k = 0; k <= n; k++) { L1.flow = [d * 2, 1.3, 0]; L1.pt(u[0] + ((v[0] - u[0]) * k) / n, u[1] + ((v[1] - u[1]) * k) / n, 0.03); d += len / n; }
      L1.flow = [d * 2, 1.3, 0]; L1.ln(u[0], u[1], 0.03, v[0], v[1], 0.03);
    }
    L1.flow = [0, 0, 0];
    const s = 0.14; for (const [p, e] of [[[mid[0] - s, mid[1]], [mid[0], mid[1] + s]], [[mid[0], mid[1] + s], [mid[0] + s, mid[1]]], [[mid[0] + s, mid[1]], [mid[0], mid[1] - s]], [[mid[0], mid[1] - s], [mid[0] - s, mid[1]]]] as number[][][]) L1.ln(p[0], p[1], 0.03, e[0], e[1], 0.03);
  };
  rect(0, 0, 3, 2.2);
  gears.slice(1).forEach((g) => { rect(g.x, g.y, 2.2, 1.6); route([g.x * 0.5, 0], [g.x, g.x > 0 ? g.y * 0.2 : g.y * 0.2], [g.x, g.y - Math.sign(g.y) * 0.8]); });

  /* Layer 3, the agents: a track directly over the gears, and small machines that run it and stop at every one. */
  const trackR = gears[1].x * gears[1].x + gears[1].y * gears[1].y;
  const tr = Math.sqrt(trackR);
  L3.tone = 1.4;
  ring(L3, 0, R0, Math.round(300 * Math.max(0.5, q)));
  for (let i = 0; i < 2; i++) ring(L3, 0, tr + (i ? 0.16 : -0.16), Math.round(300 * Math.max(0.5, q)));
  const bars = Math.round(180 * Math.max(0.5, q));
  for (let i = 0; i < bars; i++) { const a = (i / bars) * TAU; L3.ln(Math.cos(a) * (tr - 0.16), Math.sin(a) * (tr - 0.16), 0, Math.cos(a) * (tr + 0.16), Math.sin(a) * (tr + 0.16), 0); }
  ring(L3, 0, 1.2, 60); ring(L3, 0, 0.8, 44);
  for (let k = 0; k < 5; k++) {
    const a = 0.5 + (k * 1.25), ca = Math.cos(a), sa = Math.sin(a);
    L3.tone = 0.9;
    L3.ln(ca * 1.2, sa * 1.2, 0, ca * R0, sa * R0, 0);
    const b = a + 0.035; L3.ln(Math.cos(b) * 1.2, Math.sin(b) * 1.2, 0, Math.cos(b) * R0, Math.sin(b) * R0, 0);
    for (let i = 0; i < 90 * q; i++) { const t = 1.2 + rnd() * (R0 - 1.2), w = a + rnd() * 0.035; L3.pt(Math.cos(w) * t, Math.sin(w) * t, 0); }
    L3.tone = 1.4;
    ring(L3, 0.01, 0.42, 22, ca * tr, sa * tr);
  }
  L3.rot = [0.42, 0, 0];
  for (let k = 0; k < 3; k++) {
    const a = (k / 3) * TAU + 0.2, x = Math.cos(a) * tr, y = Math.sin(a) * tr, w = 0.62;
    const G = new BoxGeometry(w * 1.5, w * 1.5, w); G.rotateZ(a); G.translate(x, y, 0.42);
    L3.solids.push(withRot(G, L3.rot));
    L3.tone = 1.7;
    const cs = Math.cos(a), sn = Math.sin(a), q1 = w * 0.75;
    const corner = (u: number, v: number, z: number): P3 => [x + cs * u * q1 - sn * v * q1, y + sn * u * q1 + cs * v * q1, z];
    for (const z of [0.42 - w / 2, 0.42 + w / 2]) for (const [u0, v0, u1, v1] of [[-1, -1, 1, -1], [1, -1, 1, 1], [1, 1, -1, 1], [-1, 1, -1, -1]]) L3.ln(...corner(u0, v0, z), ...corner(u1, v1, z));
    for (const [u, v] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) L3.ln(...corner(u, v, 0.42 - w / 2), ...corner(u, v, 0.42 + w / 2));
    for (const r of [0.24, 0.34]) { const n = Math.round(70 * Math.max(0.6, q)); for (let i = 0; i < n; i++) { const u = (i / n) * TAU; L3.flow = [u * 10.13 + k * 7, 2.4, 0]; L3.pt(x + Math.cos(u) * r, y + Math.sin(u) * r, 0.42 + w / 2 + 0.02); } }
    /* An arm reaching down to the gear it's working on. */
    L3.flow = [0, 0, 0]; L3.tone = 1.4;
    for (const o of [-0.1, 0.1]) { L3.ln(x + o, y, 0.42 - w / 2, x + o * 0.4, y, -0.75); for (let i = 0; i < 14; i++) L3.pt(x + o - o * 0.6 * (i / 14), y, 0.42 - w / 2 - (0.42 - w / 2 + 0.75) * (i / 14)); }
    L3.flow = [0, 0, 0];
  }
  L3.rot = [0, 0, 0]; L3.tone = 1;

  /* What each layer hands to the next: columns that carry light upward once the upper layer is in place. Height 0 to 1, stretched to the gap. */
  const column = (c: Cloud, x: number, y: number, r: number, sides: number) => {
    const N = Math.round(44 * Math.max(0.6, q)), ph = rnd() * 20;
    for (let i = 0; i <= N; i++) { const z = i / N; c.flow = [z * 12 - ph, 1.6, 0]; for (let k = 0; k < sides; k++) { const a = (k / sides) * TAU; c.pt(x + Math.cos(a) * r, y + Math.sin(a) * r, z); } }
    c.flow = [0, 0, 0];
    for (let k = 0; k < sides; k++) { const a = (k / sides) * TAU; c.ln(x + Math.cos(a) * r, y + Math.sin(a) * r, 0, x + Math.cos(a) * r, y + Math.sin(a) * r, 1); }
  };
  for (const g of gears) { column(up12, g.x, g.y, g.n >= 26 ? 0.3 : 0.17, 8); column(up23, g.x, g.y, 0.12, 6); }

  /* The result: one frame closing around all three, and light running through every layer at once. Height -1 to 1, stretched to the gap. */
  frame.tone = 1.5;
  for (const [z, r] of [[-1.28, 7.05], [-1.2, 7.15], [1.2, 7.15], [1.28, 7.05]] as const) ring(frame, z, r, Math.round(380 * Math.max(0.5, q)));
  for (let k = 0; k < 24; k++) { const a = (k / 24) * TAU, x = Math.cos(a) * 7.15, y = Math.sin(a) * 7.15; frame.ln(x, y, -1.2, x, y, 1.2); const n = Math.round(30 * Math.max(0.6, q)); for (let i = 0; i <= n; i++) frame.pt(x, y, -1.2 + (2.4 * i) / n); }
  for (const z of [-1, 0, 1]) { const n = Math.round(560 * Math.max(0.5, q)); for (let i = 0; i < n; i++) { const a = (i / n) * TAU; glow.flow = [a * 10.13 * 2 + z * 5, 2.6, 0]; const p: P3 = [Math.cos(a) * 6.86, Math.sin(a) * 6.86, z]; glow.pt(...p); } }
  glow.flow = [0, 0, 0];
  const crown = Math.round(500 * Math.max(0.6, q));
  for (let i = 0; i < crown; i++) { const z = -1 + rnd() * 3.1, a = rnd() * TAU, r = 0.16; glow.flow = [z * 9 + rnd(), 2.6, 0]; glow.pt(Math.cos(a) * r, Math.sin(a) * r, z); }
  glow.flow = [0, 0, 0];
  for (const [z, r] of [[2.1, 0.75], [2.1, 1.05]] as const) { const n = 90; for (let i = 0; i < n; i++) { const a = (i / n) * TAU; glow.flow = [a * 10.13, 2.6, 0]; glow.pt(Math.cos(a) * r, Math.sin(a) * r, z); } }
  glow.flow = [0, 0, 0];
  return { L1, L2, L3, up12, up23, frame, glow };
}

const SOLID_VS = `attribute vec3 aRot; uniform float t; varying vec3 vN; varying vec3 vP; varying vec3 vC;
      void main(){ vec3 p=position, n=normal; vC=aRot; if(aRot.x!=0.){ float a=t*aRot.x,c=cos(a),s=sin(a); vec2 d=p.xy-aRot.yz; p.xy=aRot.yz+vec2(c*d.x-s*d.y,s*d.x+c*d.y); n.xy=vec2(c*n.x-s*n.y,s*n.x+c*n.y); if(position.z>-9.) p.z+=.16*sin(t*.55+aRot.y*.7+aRot.z*.5); } vN=n; vP=p; gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.); }`;
const SOLID_FS = `precision highp float; uniform float t, resX, resY, veil, dim; uniform vec2 edge, lampC; varying vec3 vN; varying vec3 vP; varying vec3 vC;
      void main(){
        vec3 n=normalize(vN);
        vec2 lamp=lampC+vec2(15.*sin(t*.23),12.*cos(t*.17));
        float pool=.35+smoothstep(26.,4.,distance(vP.xy,lamp));
        float c;
        if(abs(n.z)>.9){
          float sheen=0.;
          if(abs(vC.x)>.001){ float ang=atan(vP.y-vC.z,vP.x-vC.y); sheen=pow(abs(cos(ang+.75)),8.); }
          c=.03+.13*sheen;
        } else c=.012+.1*pow(max(dot(n,normalize(vec3(-.45,.7,.55))),0.),1.5);
        c*=pool*mix(.4,1.,smoothstep(1.,3.2,vP.z));
        float x=gl_FragCoord.x/resX, y=gl_FragCoord.y/resY;
        c*=mix(1.,smoothstep(edge.x,edge.y,x),veil)*mix(1.,smoothstep(.93,.82,y),veil)*min(1.,dim);
        gl_FragColor=vec4(c*.97,c,c*.92,1.);
      }`;
const VS = /* glsl */ `
attribute vec3 aRot; attribute vec3 aFlow; attribute vec3 aAlt; attribute float aGroup; attribute vec3 aN;
uniform float t, tidy, dpr, dim, fogFar, clipZ, hallFade; uniform float isLine; uniform vec2 lampC;
varying float vA; varying float vL;
void main(){
  vec3 p=position;
  float g=aGroup, alpha=1.;
  if(g>3.5){
    float k=smoothstep(0.,1.,tidy);
    p=mix(position,aAlt,k);
    float un=1.-k;
    p+=un*.05*vec3(sin(t*2.1+position.z*2.),cos(t*1.7+position.x*3.),0.);
  }
  if(aFlow.z>0.){ float L=aAlt.y, z0=aAlt.x; p.z=z0+mod(p.z-z0-t*aFlow.z,L); float e=(p.z-z0)/L; alpha*=smoothstep(0.,.06,e)*smoothstep(1.,.94,e); }
  if(aRot.x!=0.){ float a=t*aRot.x,c=cos(a),s=sin(a); vec2 d=p.xy-aRot.yz; p.xy=aRot.yz+vec2(c*d.x-s*d.y,s*d.x+c*d.y); if(position.z>-9.) p.z+=.16*sin(t*.55+aRot.y*.7+aRot.z*.5); }
  /* Seen from outside, only the intake end is drawn; deeper rooms exist only once you've gone in. */
  alpha*=smoothstep(clipZ-1.5,clipZ,position.z);
  alpha*=1.-hallFade*smoothstep(-71.,-67.,position.z);
  if(g>3.5) alpha*=1.-smoothstep(-12.,-9.,clipZ);
  /* Machined steel, in dots: a lamp sweeping across the machine, a turned-metal sheen on faces, light catching walls. */
  float lit=1.;
  float tone=length(aN);
  if(isLine>.5){ if(tone>0.) lit=tone; }
  else if(tone>.01){
    vec3 n=aN/tone;
    if(aRot.x!=0.){ float a=t*aRot.x,c=cos(a),s=sin(a); n.xy=vec2(c*n.x-s*n.y,s*n.x+c*n.y); }
    vec2 lamp=lampC+vec2(15.*sin(t*.23),12.*cos(t*.17));
    float pool=.45+1.2*smoothstep(26.,3.,distance(p.xy,lamp));
    float shade;
    if(n.z>.9){
      float sheen=0.;
      if(abs(aRot.x)>.001){ float ang=atan(p.y-aRot.z,p.x-aRot.y); sheen=pow(abs(cos(ang+.75)),16.); }
      shade=.55+2.2*sheen;
    } else {
      vec3 L=normalize(vec3(-.45,.7,.55));
      shade=.1+1.5*pow(max(dot(normalize(n),L),0.),1.4);
    }
    lit=tone*shade*pool;
  }
  vec4 mv=modelViewMatrix*vec4(p,1.);
  float dist=-mv.z;
  float fog=smoothstep(fogFar,fogFar*.2,dist)*smoothstep(1.2,6.,dist);
  float bright=aFlow.y;
  float pulse=bright>0.?(aFlow.z>0.?.75:pow(.5+.5*sin(aFlow.x*.62-t*2.4),10.)):0.;
  if(g>3.5) pulse*=smoothstep(.3,1.,tidy)*.9+.1;
  vL=clamp(pulse*bright,0.,1.);
  float strong=g>3.5?1.9:1.;
  vA=alpha*fog*(isLine>.5?.24:.62)*strong*dim*lit+vL*fog*alpha*.9*min(1.,dim*1.4);
  gl_Position=projectionMatrix*mv;
  gl_PointSize=isLine>.5?1.:dpr*clamp(.8+8./dist,.8,2.2)*(1.+vL*.5);
}`;
const FS = /* glsl */ `
precision highp float;
uniform vec2 band, edge; uniform float veil, resX, resY, navFade;
varying float vA; varying float vL;
void main(){
  bool paper=gl_FragCoord.y<band.y&&gl_FragCoord.y>band.x;
  /* A long, soft fall-off across the whole screen, never a shape: most of the copy sits to the left. */
  float a=vA*mix(1.,mix(.12,1.,smoothstep(edge.x,edge.y,gl_FragCoord.x/resX)),veil)*mix(1.,smoothstep(.93,.82,gl_FragCoord.y/resY),navFade);
  if(paper){ vec3 c=mix(vec3(.08,.1,.06),vec3(.34,.5,.03),vL); gl_FragColor=vec4(c*a*1.25,a*1.25); }
  else { vec3 c=mix(vec3(.76,.8,.72),vec3(.9,.95,.02),vL); gl_FragColor=vec4(c*a,0.); }
}`;
const BG_FS = /* glsl */ `
precision highp float;
uniform vec2 band;
void main(){ bool paper=gl_FragCoord.y<band.y&&gl_FragCoord.y>band.x; if(!paper) discard; gl_FragColor=vec4(.91,.93,.882,1.); }`;
/* Speed: the frame pulls radially and the colours separate, as in the references. Only runs while moving. */
const POST_FS = /* glsl */ `
precision highp float;
uniform sampler2D tex; uniform float amt; varying vec2 vUv;
void main(){
  vec2 d=vUv-.5; float l=length(d);
  vec3 c=vec3(0.);
  const int N=9;
  for(int i=0;i<N;i++){
    float k=float(i)/float(N-1)*amt*l*.5;
    c.r+=texture2D(tex,vUv-d*k*1.25).r; c.g+=texture2D(tex,vUv-d*k).g; c.b+=texture2D(tex,vUv-d*k*.75).b;
  }
  gl_FragColor=vec4(c/float(N),1.);
}`;

export type Shot = { pos: Vector3; look: Vector3 };
export type ChainAnchor = { x: number; y: number; r: number; hole?: number; kind?: "clear" | "soft" | "dim" };

export function createMachine(canvas: HTMLCanvasElement, opts: { mobile: boolean }) {
  const q = opts.mobile ? 0.34 : 1;
  const renderer = new WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: "high-performance" });
  renderer.setClearColor(0x000000, 1);
  renderer.autoClear = false;
  let ratio = Math.min(devicePixelRatio || 1, opts.mobile ? 1.5 : 2);
  const scene = new Scene();
  const camera = new PerspectiveCamera(opts.mobile ? 62 : 44, 1, 0.2, 120);
  const world = buildWorld(q);

  const uni = { t: { value: 0 }, tidy: { value: 0 }, dpr: { value: ratio }, dim: { value: 1 }, fogFar: { value: 40 }, hallFade: { value: 0 }, lampC: { value: new Vector2(9, 2) }, clipZ: { value: -999 }, band: { value: new Vector2(-1, -1) }, veil: { value: 0 }, resX: { value: 1 }, resY: { value: 1 }, navFade: { value: 0 }, edge: { value: new Vector2(0.12, 0.72) } };
  const blend = { blending: CustomBlending, blendEquation: AddEquation, blendSrc: OneFactor, blendDst: OneMinusSrcAlphaFactor, transparent: true, depthWrite: false, depthTest: true } as const;
  const geom = (p: number[], r: number[], f: number[], a: number[], g: number[], n: number[]) => {
    const G = new BufferGeometry();
    G.setAttribute("aN", new Float32BufferAttribute(n, 3));
    G.setAttribute("position", new Float32BufferAttribute(p, 3));
    G.setAttribute("aRot", new Float32BufferAttribute(r, 3));
    G.setAttribute("aFlow", new Float32BufferAttribute(f, 3));
    G.setAttribute("aAlt", new Float32BufferAttribute(a, 3));
    G.setAttribute("aGroup", new Float32BufferAttribute(g, 1));
    return G;
  };
  const points = new Points(geom(world.p, world.r, world.f, world.a, world.g, world.n), new ShaderMaterial({ uniforms: { ...uni, isLine: { value: 0 } }, vertexShader: VS, fragmentShader: FS, ...blend }));
  const lines = new LineSegments(geom(world.lp, world.lr, world.lf, world.la, world.lg, world.ln_n), new ShaderMaterial({ uniforms: { ...uni, isLine: { value: 1 } }, vertexShader: VS, fragmentShader: FS, ...blend }));
  points.frustumCulled = lines.frustumCulled = false;
  scene.add(lines, points);
  /* The solids paint black and hold depth, so nearer parts cover the ones behind. */
  const solids = new Mesh(mergeGeometries(world.solids), new ShaderMaterial({
    uniforms: { t: uni.t, resX: uni.resX, resY: uni.resY, veil: uni.veil, edge: uni.edge, dim: uni.dim, lampC: uni.lampC },
    vertexShader: SOLID_VS, fragmentShader: SOLID_FS,
    side: DoubleSide, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 6,
  }));
  solids.frustumCulled = false;
  solids.renderOrder = -1;
  scene.add(solids);
  const count = world.p.length / 3;

  /* The three layers of What we do, as their own group so each can move along the axis. */
  const stackGroup = new Group();
  stackGroup.position.set(0, 0, -82);
  stackGroup.rotation.x = -Math.PI / 2;
  scene.add(stackGroup);
  const tS = { value: 0 };
  const parts = buildStack(q);
  const mk = (c: Cloud, parent: Group = stackGroup, over: Partial<typeof uni> = { t: tS }) => {
    const dU = { value: 0 }, u = { ...uni, dim: dU, clipZ: { value: -999 }, fogFar: { value: 90 }, hallFade: { value: 0 }, ...over };
    const g = new Group();
    const P = new Points(geom(c.p, c.r, c.f, c.a, c.g, c.n), new ShaderMaterial({ uniforms: { ...u, isLine: { value: 0 } }, vertexShader: VS, fragmentShader: FS, ...blend }));
    g.add(P);
    if (c.lp.length) g.add(new LineSegments(geom(c.lp, c.lr, c.lf, c.la, c.lg, c.ln_n), new ShaderMaterial({ uniforms: { ...u, isLine: { value: 1 } }, vertexShader: VS, fragmentShader: FS, ...blend })));
    if (c.solids.length) { const M = new Mesh(mergeGeometries(c.solids), new ShaderMaterial({ uniforms: { t: u.t, resX: u.resX, resY: u.resY, veil: u.veil, edge: u.edge, dim: dU, lampC: u.lampC }, vertexShader: SOLID_VS, fragmentShader: SOLID_FS, side: DoubleSide, polygonOffset: true, polygonOffsetFactor: 2, polygonOffsetUnits: 6 })); M.renderOrder = -1; g.add(M); }
    g.traverse((o) => { o.frustumCulled = false; });
    parent.add(g);
    return { g, set(a: number, z: number, sz = 1) { dU.value = a; g.visible = a > 0.003; g.position.z = z; g.scale.z = sz; } };
  };
  const st = { L1: mk(parts.L1), L2: mk(parts.L2), L3: mk(parts.L3), up12: mk(parts.up12), up23: mk(parts.up23), frame: mk(parts.frame), glow: mk(parts.glow) };
  const ss = (a: number, b: number, x: number) => { const k = Math.min(1, Math.max(0, (x - a) / (b - a))); return k * k * (3 - 2 * k); };

  /* The drive line: one train of meshing gears that runs down the rest of the page, from What we do to Contact.
     It is anchored to the page rather than to the flying camera, so each gear stays with its section, and scrolling is what turns it. */
  const chainScene = new Scene(), chainRoot = new Group(), chainCam = new PerspectiveCamera(46, 1, 1, 90);
  /* A closer, wider lens: thick gears show their walls more as they pass, and the page's top face stays exact. */
  const CHAIN_D = 21, CHAIN_T = 2.2, CHAIN_Z = 3.2, CHAIN_M = 10;
  chainCam.position.z = CHAIN_Z + CHAIN_T / 2 + CHAIN_D;
  chainScene.add(chainRoot);
  const chainOver = { t: { value: 0 }, lampC: { value: new Vector2(0, 0) }, veil: { value: 0 }, navFade: { value: 0 } };
  let chainParts: { clear: ReturnType<typeof mk>; soft: ReturnType<typeof mk>; dim: ReturnType<typeof mk>; back: ReturnType<typeof mk> } | null = null;
  let chainK = 1, chainTop = 0, chainEnd = 0;

  /* Paper is painted by the world itself, so a section edge cuts cleanly across it. */
  const bgScene = new Scene();
  const fsVS = "varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }";
  const bg = new Mesh(new PlaneGeometry(2, 2), new ShaderMaterial({ uniforms: { band: uni.band }, vertexShader: fsVS, fragmentShader: BG_FS, depthTest: false, depthWrite: false }));
  bg.frustumCulled = false;
  bgScene.add(bg);
  const postScene = new Scene();
  const postUni = { tex: { value: null as unknown }, amt: { value: 0 } };
  const post = new Mesh(new PlaneGeometry(2, 2), new ShaderMaterial({ uniforms: postUni, vertexShader: fsVS, fragmentShader: POST_FS, depthTest: false, depthWrite: false, blending: NoBlending }));
  post.frustumCulled = false;
  postScene.add(post);
  let rt: WebGLRenderTarget | null = null;
  const ortho = new PerspectiveCamera();

  const size = () => {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setPixelRatio(ratio); renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const W = renderer.domElement.width, H = renderer.domElement.height;
    uni.resX.value = W; uni.resY.value = H; uni.dpr.value = ratio;
    rt?.dispose(); rt = new WebGLRenderTarget(W, H, { depthBuffer: true });
    postUni.tex.value = rt.texture;
  };
  const drawAll = () => { renderer.clear(); renderer.render(bgScene, ortho); renderer.render(scene, camera); if (chainScene.visible) { renderer.clearDepth(); renderer.render(chainScene, chainCam); } };

  return {
    count, camera, resize: size,
    /** Lays the chain through the given anchors (page pixels). Gears between them are solved so that every pair truly meshes. */
    setChain(anchors: ChainAnchor[], vw: number, vh: number, classify: (x: number, y: number, r: number) => "clear" | "soft" | "dim") {
      chainRoot.children.slice().forEach((o) => { chainRoot.remove(o); o.traverse((n) => { (n as Mesh).geometry?.dispose?.(); ((n as Mesh).material as ShaderMaterial)?.dispose?.(); }); });
      const k = (2 * CHAIN_D * Math.tan((chainCam.fov * Math.PI) / 360)) / vh, m = CHAIN_M;
      chainK = k;
      const wu = (a: ChainAnchor) => ({ x: (a.x - vw / 2) * k, y: -a.y * k, n: Math.max(10, Math.round(a.r * k * m)), hole: (a.hole ?? 0) * k, kind: a.kind });
      const A = anchors.map(wu);
      const sizes = opts.mobile ? [10, 13, 11] : [14, 20, 12, 18];
      const links: Link[] = [{ n: A[0].n }], meta: { hole: number; kind?: "clear" | "soft" | "dim" }[] = [{ hole: A[0].hole, kind: A[0].kind }];
      let cx = A[0].x, cy = A[0].y, cn = A[0].n, zig = 1, si = 0;
      const place = (from: number, dir: number, n: number, hole = 0, kind?: "clear" | "soft" | "dim") => { const dist = (cn + n) / m; cx += Math.cos(dir) * dist; cy += Math.sin(dir) * dist; cn = n; links.push({ from, dir, n }); meta.push({ hole, kind }); };
      for (let i = 1; i < A.length; i++) {
        const b = A[i], rb = b.n / m;
        for (let guard = 0; guard < 60; guard++) {
          const D = Math.hypot(b.x - cx, b.y - cy), rc = cn / m, base = Math.atan2(b.y - cy, b.x - cx), big = Math.max(...sizes) / m;
          if (D - rc - rb <= 2 * big) {
            const rf = Math.max(Math.min(...sizes) / m, ((D - rc - rb) / 2) * 1.04), nf = Math.ceil(rf * m), r = nf / m;
            const a = rc + r, c0 = rb + r, cosA = Math.max(-1, Math.min(1, (a * a + D * D - c0 * c0) / (2 * a * D))), dir = base + zig * Math.acos(cosA);
            place(links.length - 1, dir, nf);
            place(links.length - 1, Math.atan2(b.y - cy, b.x - cx), b.n, b.hole, b.kind);
            zig = -zig;
            break;
          }
          const n = sizes[si++ % sizes.length];
          place(links.length - 1, base + zig * 0.42, n);
          zig = -zig;
        }
      }
      const cl = { clear: new Cloud(), soft: new Cloud(), dim: new Cloud(), back: new Cloud() };
      const Q = opts.mobile ? 0.34 : 0.72;
      let idx = 0;
      train(cl.clear, CHAIN_Z, links, 0.5, 0, Q, m, false, (g) => {
        const M = meta[idx++], px = g.x / k + vw / 2, py = -g.y / k, kind = M.kind ?? classify(px, py, g.r / k);
        solidGear(cl[kind], g, CHAIN_T, Q, m, 1.6, M.hole > 0 || g.n >= 26, M.hole);
      }, [A[0].x, A[0].y]);
      /* A second level behind, on the same shafts, so the line has depth of its own. */
      let every = 0, px0 = A[0].x, py0 = A[0].y;
      const Pos: [number, number][] = [[px0, py0]];
      links.forEach((l, i) => { if (!i) return; const p = Pos[l.from!], d = (links[l.from!].n + l.n) / m; Pos.push([p[0] + Math.cos(l.dir!) * d, p[1] + Math.sin(l.dir!) * d]); });
      Pos.forEach((p, i) => {
        if (meta[i].hole || every++ % 3) return;
        const nB = Math.round(links[i].n * 1.5) + 8;
        train(cl.back, -5, [{ n: nB }, { from: 0, dir: opts.mobile ? 2.6 : (i % 2 ? 0.4 : -0.5), n: 16 }], 0.5, 0, Q * 0.45, m, false, (g) => solidGear(cl.back, g, 1.3, Q * 0.45, m, 1), p);
      });
      chainParts = { clear: mk(cl.clear, chainRoot, chainOver), soft: mk(cl.soft, chainRoot, chainOver), dim: mk(cl.dim, chainRoot, chainOver), back: mk(cl.back, chainRoot, chainOver) };
      const ys = Pos.map((p) => -p[1] / k);
      chainTop = Math.min(...ys) - 500; chainEnd = Math.max(...ys) + 500;
      chainRoot.traverse((o) => { o.frustumCulled = false; });
      chainCam.aspect = vw / vh; chainCam.updateProjectionMatrix();
    },
    lowerQuality() { if (ratio <= 1) return; ratio = Math.max(1, ratio - 0.25); size(); },
    draw(s: { chain: { y: number; turn: number; move: number; t: number }; stack: { d: number; dt: number }; navFade: number; edge: [number, number]; shift: [number, number]; clipZ: number; fogFar: number; t: number; pos: Vector3; look: Vector3; roll: number; tidy: number; dim: number; veil: number; speed: number; bandTop: number; bandBottom: number }) {
      const vhNow = canvas.clientHeight;
      chainScene.visible = !!chainParts && s.chain.y + vhNow > chainTop && s.chain.y < chainEnd;
      if (chainParts && chainScene.visible) {
        const c = s.chain, l = (rest: number, go: number) => rest + (go - rest) * c.move;
        chainRoot.position.y = (c.y + vhNow / 2) * chainK;
        chainOver.t.value = c.t * 0.22 + c.turn * 0.0024;
        chainOver.lampC.value.set(0, -(c.y + vhNow / 2) * chainK);
        /* Same behaviour as the rooms above: full strength while you travel, quiet the moment you stop to read. */
        chainParts.clear.set(l(0.2, 1.1), 0);
        chainParts.soft.set(l(0.15, 1.1), 0);
        chainParts.dim.set(l(0.1, 1), 0);
        chainParts.back.set(l(0.06, 0.7), 0);
      }
      /* What we do: plan, then mechanism on top, then agents on top, then all three lock into one running system. */
      const inHall = s.pos.z < -52 && s.pos.z > -100, d = s.stack.d;
      stackGroup.visible = inHall;
      if (!inHall) uni.hallFade.value = 0;
      if (inHall) {
        const a1 = ss(-0.14, 0.08, d), a2 = ss(0.3, 0.46, d), a3 = ss(0.62, 0.78, d), lock = ss(0.8, 0.93, d), done = ss(0.86, 0.97, d), gap = 3.7 - 2.3 * lock, B = s.dim * 1.75 * (1 - 0.8 * ss(1.04, 1.2, d));
        uni.hallFade.value = ss(-0.12, 0, d);
        tS.value += s.stack.dt * (1 + 1.6 * lock);
        st.L1.set(a1 * B, -gap - (1 - a1) * 2.2);
        st.L2.set(a2 * B, (1 - a2) * (1 - a2) * 10);
        st.L3.set(a3 * B, gap + (1 - a3) * (1 - a3) * 10);
        st.up12.set(ss(0.42, 0.5, d) * B, -gap + 0.02, gap * ss(0.42, 0.5, d));
        st.up23.set(ss(0.74, 0.82, d) * B, 0.5, Math.max(0.01, (gap - 0.5) * ss(0.74, 0.82, d)));
        st.frame.set(done * B, 0, gap);
        st.glow.set(done * B, 0, gap);
      }
      uni.edge.value.set(...s.edge); uni.navFade.value = s.navFade; solids.visible = s.pos.z > -3; uni.t.value = s.t; uni.tidy.value = s.tidy; uni.dim.value = s.dim; uni.veil.value = s.veil; uni.fogFar.value = s.fogFar; uni.clipZ.value = s.clipZ;
      /* From screen pixels, top down, to GL pixels, bottom up. */
      const H = renderer.domElement.height, k = H / canvas.clientHeight;
      uni.band.value.set(H - s.bandBottom * k, H - s.bandTop * k);
      camera.position.copy(s.pos); camera.up.set(Math.sin(s.roll), Math.cos(s.roll), 0); camera.lookAt(s.look);
      /* The vanishing point can be moved on screen: the whole corridor then converges behind the portrait. */
      const w = canvas.clientWidth, hh = canvas.clientHeight;
      if (s.shift[0] || s.shift[1]) camera.setViewOffset(w, hh, -s.shift[0], -s.shift[1], w, hh); else camera.clearViewOffset();
      if (s.speed > 0.004 && rt) {
        renderer.setRenderTarget(rt); drawAll();
        renderer.setRenderTarget(null); postUni.amt.value = Math.min(1, s.speed); renderer.render(postScene, ortho);
      } else drawAll();
    },
    dispose() { renderer.dispose(); rt?.dispose(); },
  };
}
export { Vector3, Color, AdditiveBlending };
