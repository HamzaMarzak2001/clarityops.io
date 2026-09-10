import * as THREE from 'three';

/* 48 links, 49 spine points, 4 authored rest poses.
 *
 * INVARIANT: scene state is a PURE FUNCTION of scroll. Nothing integrates,
 * nothing accumulates. Users scroll up constantly; an accumulating solver
 * cannot be scrubbed backwards without drift or a visible re-settle.
 * Scrubbing back up the page reproduces the same frames exactly, in reverse.
 */

const LINKS  = 64;
const POINTS = LINKS + 1;
const REF    = new THREE.Vector3(0, 0, 1); // ONE fixed reference axis.

const DARK   = new THREE.Color('#000000');   // unengaged: emits nothing
const TORQUE = new THREE.Color('#fdff5c');   // engaged: emits, and blooms

/* deterministic per-index noise — never Math.random(), so every reload
   and every scrub reproduces identical geometry */
function h(i, s) {
  const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453;
  return x - Math.floor(x);
}

/* ── Poses ─────────────────────────────────────────────────────────
   The argument, told as geometry:
   0 SCATTERED — separate parts, no path between them
   1 GATHERED  — collected, slack, not yet driving
   2 TENSIONED — one continuous path under load
   3 DRIVEN    — a closed loop turning around three sprockets       */

export const SPROCKETS = [
  { p: new THREE.Vector3(-1.95, 0.02, 0), r: 0.62, label: 'NOTION' },
  { p: new THREE.Vector3( 0.30, 0.86, 0), r: 0.40, label: 'AUTOMATIONS' },
  { p: new THREE.Vector3( 1.95,-0.22, 0), r: 0.52, label: 'AI AGENTS' },
];

/* Every pose is a CLOSED loop of near-identical perimeter.
   Two reasons:
   1. Geometrically, link spacing stays constant, so 48 links never pile up
      into spaghetti — the failure you get the moment a fixed-length chain
      is asked to follow a path shorter than itself.
   2. Narratively it is truer: the parts are always the same parts. Act 1
      is not "other stuff", it is this system, disordered.
   Target perimeter ~13.8u -> 0.2875u between links -> link ~0.6u long,
   so consecutive links overlap by half and read as interlocked.        */

const RX = 2.9, RY = 1.12;

function ring(t, rx, ry, out) {
  const a = t * Math.PI * 2;
  return out.set(Math.cos(a) * rx, Math.sin(a) * ry, 0);
}

function buildPoses() {
  const poses = [[], [], [], []];

  for (let i = 0; i < POINTS; i++) {
    const t = (i % LINKS) / LINKS;          // wrap: closed loop
    const a = t * Math.PI * 2;

    // 3 DRIVEN — wrapped over the three sprockets, flat in Z
    const driven = ring(t, RX, RY, new THREE.Vector3());
    driven.y += Math.max(0, Math.sin(a)) * 0.30;   // ride up over the idler
    driven.y += 0.06;
    poses[3].push(driven);

    // 2 TENSIONED — one clean oval under load
    poses[2].push(ring(t, RX * 0.96, RY * 1.02, new THREE.Vector3()));

    // 1 GATHERED — collected but slack: same loop, sagging and wandering
    const gathered = ring(t, RX * 0.88, RY * 1.15, new THREE.Vector3());
    gathered.y -= Math.pow(Math.cos(a * 0.5), 2) * 0.55;
    gathered.z += Math.sin(a * 3.0) * 0.30 + (h(i, 4) - 0.5) * 0.16;
    poses[1].push(gathered);

    // 0 SCATTERED — the same loop, pulled apart in every axis
    const scattered = ring(t, RX * 1.15, RY * 1.4, new THREE.Vector3());
    scattered.x += (h(i, 1) - 0.5) * 2.3;
    scattered.y += (h(i, 2) - 0.5) * 2.6;
    scattered.z += (h(i, 5) - 0.5) * 2.8;
    poses[0].push(scattered);
  }
  return poses;
}

export function makeDriveLine() {
  const poses = buildPoses();

  const geo = new THREE.TorusGeometry(0.128, 0.031, 8, 20);
  const mat = new THREE.MeshPhysicalMaterial({
    color: '#cfd6de',
    metalness: 0.88,
    roughness: 0.22,
    envMapIntensity: 3.2,
    vertexColors: true,          // gives us vColor from instanceColor
  });
  mat.onBeforeCompile = (sh) => {
    sh.uniforms.uEmit = { value: 4.2 };
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <color_fragment>', '')          // never tint the metal
      .replace('#include <emissivemap_fragment>',
               '#include <emissivemap_fragment>\n\ttotalEmissiveRadiance = vColor.rgb * uEmit;')
      .replace('void main() {', 'uniform float uEmit;\nvoid main() {');
  };
  mat.customProgramCacheKey = () => 'driveline-emissive-v2';
  mat.needsUpdate = true;

  const mesh = new THREE.InstancedMesh(geo, mat, LINKS);
  mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  mesh.frustumCulled = false;
  mesh.count = LINKS;

  // per-link colour buffer
  const colors = new Float32Array(LINKS * 3);
  mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);
  mesh.instanceColor.setUsage(THREE.DynamicDrawUsage);

  // per-link engagement seed, so the energy travels as a wave through the
  // line rather than a gradient sliding along a mesh
  const seed = new Float32Array(LINKS);
  for (let i = 0; i < LINKS; i++) seed[i] = i / LINKS * 0.72 + h(i, 9) * 0.28;

  const spine = Array.from({ length: POINTS }, () => new THREE.Vector3());
  const _m = new THREE.Matrix4();
  const _q = new THREE.Quaternion();
  const _basis = new THREE.Matrix4();
  const _x = new THREE.Vector3(), _y = new THREE.Vector3(), _z = new THREE.Vector3();
  const _pos = new THREE.Vector3(), _scale = new THREE.Vector3(1, 1.3, 1);
  const _c = new THREE.Color();

  function easeInOut(x) { return x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2; }
  function smoothstep(a, b, x) {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  /* t: 0..1 page progress. Pure function — same t always yields same frame. */
  function apply(t) {
    const u = Math.min(1, Math.max(0, t));
    const seg = u * 3;                       // 4 poses -> 3 segments
    const i0 = Math.min(2, Math.floor(seg));
    const f = easeInOut(seg - i0);
    const A = poses[i0], B = poses[i0 + 1];

    for (let i = 0; i < POINTS; i++) spine[i].lerpVectors(A[i], B[i], f);

    for (let i = 0; i < LINKS; i++) {
      const a = spine[i], b = spine[i + 1];

      _y.subVectors(b, a);
      const len = _y.length() || 1e-5;
      _y.divideScalar(len);                  // tangent -> local +Y

      _x.crossVectors(REF, _y);
      if (_x.lengthSq() < 1e-8) _x.set(1, 0, 0);
      _x.normalize();
      _z.crossVectors(_x, _y).normalize();

      _basis.makeBasis(_x, _y, _z);
      _q.setFromRotationMatrix(_basis);
      // alternating quarter roll about the tangent — the entire difference
      // between "a drive line" and "a necklace"
      if (i % 2) _q.multiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI / 2));

      _pos.addVectors(a, b).multiplyScalar(0.5);
      _m.compose(_pos, _q, _scale);
      mesh.setMatrixAt(i, _m);

      // engagement: torque travels through the line as u advances
      const e = smoothstep(seed[i] - 0.12, seed[i] + 0.12, u);
      _c.copy(DARK).lerp(TORQUE, e);
      _c.toArray(colors, i * 3);
    }

    mesh.instanceMatrix.needsUpdate = true;
    mesh.instanceColor.needsUpdate = true;
  }

  function dispose() { geo.dispose(); mat.dispose(); }

  return { mesh, apply, dispose, LINKS };
}
