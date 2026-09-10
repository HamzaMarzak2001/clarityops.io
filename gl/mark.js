import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

/* THE MARK — the ClarityOps logo as real, machined geometry.
 *
 * Not a primitive. This is the actual brand outline, extruded with a bevel,
 * so every edge is a real chamfer that catches the kicker light. The mark is
 * already a cycle symbol — an inner C inside an outer arc that ends in an
 * arrowhead — so turning it in space is not decoration, it is the pitch.
 *
 * SVG is y-down and 0..500; we flip Y and normalise to ~3 units tall so the
 * camera rig and the plate do not need to know anything about SVG units.
 */

export async function makeMark() {
  const svg = await new SVGLoader().loadAsync('assets/logos/logo-icon-white.svg');

  const shapes = [];
  for (const p of svg.paths) for (const s of SVGLoader.createShapes(p)) shapes.push(s);

  const geo = new THREE.ExtrudeGeometry(shapes, {
    depth: 62,                 // in SVG units; normalised below
    bevelEnabled: true,
    bevelThickness: 7,
    bevelSize: 6,
    bevelOffset: 0,
    bevelSegments: 4,          // a real chamfer — this is what catches light
    curveSegments: 24,         // smooth arcs; the mark is all curves
  });

  geo.scale(1, -1, 1);         // SVG y-down -> three y-up
  geo.center();
  const S = 3.0 / 500;         // normalise: ~3 units tall
  geo.scale(S, S, S);
  geo.computeVertexNormals();

  const mat = new THREE.MeshPhysicalMaterial({
    color: '#20242a',
    metalness: 0.94,
    roughness: 0.21,
    envMapIntensity: 1.25,
    clearcoat: 0.35,
    clearcoatRoughness: 0.25,
  });

  const mesh = new THREE.Mesh(geo, mat);
  mesh.castShadow = true;

  // ── chips: small machined pieces that converge onto the mark's own
  //    surface. Targets are sampled from the real geometry, so the swarm
  //    resolves into the logo's silhouette rather than a generic cloud.
  const COUNT = 420;
  const pos = geo.getAttribute('position');
  const targets = new Float32Array(COUNT * 3);
  const starts  = new Float32Array(COUNT * 3);
  const spin    = new Float32Array(COUNT * 3);
  const seed    = new Float32Array(COUNT);

  const rnd = (i, s) => {
    const x = Math.sin(i * 91.7 + s * 47.3) * 43758.5453;
    return x - Math.floor(x);
  };

  for (let i = 0; i < COUNT; i++) {
    const v = Math.floor(rnd(i, 1) * pos.count);
    targets[i*3+0] = pos.getX(v);
    targets[i*3+1] = pos.getY(v);
    targets[i*3+2] = pos.getZ(v);
    // start: strewn wide, biased behind the mark so they fly toward camera
    const a = rnd(i, 2) * Math.PI * 2, r = 3.2 + rnd(i, 3) * 4.5;
    starts[i*3+0] = Math.cos(a) * r;
    starts[i*3+1] = Math.sin(a) * r * 0.62;
    starts[i*3+2] = -2.4 - rnd(i, 4) * 5.0;
    spin[i*3+0] = (rnd(i,5)-0.5) * 6; spin[i*3+1] = (rnd(i,6)-0.5) * 6; spin[i*3+2] = (rnd(i,7)-0.5) * 6;
    seed[i] = rnd(i, 8);
  }

  const chipGeo = new THREE.BoxGeometry(0.052, 0.052, 0.018);
  const chips = new THREE.InstancedMesh(chipGeo, mat, COUNT);
  chips.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  chips.frustumCulled = false;

  const _m = new THREE.Matrix4(), _q = new THREE.Quaternion();
  const _e = new THREE.Euler(), _p = new THREE.Vector3(), _s = new THREE.Vector3();

  function smoothstep(a, b, x) {
    const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
    return t * t * (3 - 2 * t);
  }

  /* t 0..1 — pure function of scroll, nothing accumulates */
  function apply(t, time) {
    // chips converge over the first 45% of the run
    const conv = smoothstep(0, 0.45, t);
    for (let i = 0; i < COUNT; i++) {
      const k = smoothstep(seed[i] * 0.5, seed[i] * 0.5 + 0.5, conv);
      _p.set(
        starts[i*3+0] + (targets[i*3+0] - starts[i*3+0]) * k,
        starts[i*3+1] + (targets[i*3+1] - starts[i*3+1]) * k,
        starts[i*3+2] + (targets[i*3+2] - starts[i*3+2]) * k
      );
      const wob = (1 - k) * 0.5;
      _e.set(spin[i*3+0] * (1-k) + time*0.0004*wob, spin[i*3+1] * (1-k), spin[i*3+2] * (1-k));
      _q.setFromEuler(_e);
      const sc = 0.35 + (1 - k) * 0.9;          // shrink as they land
      _s.setScalar(k > 0.985 ? 0 : sc);          // vanish once seated
      _m.compose(_p, _q, _s);
      chips.setMatrixAt(i, _m);
    }
    chips.instanceMatrix.needsUpdate = true;
    chips.visible = conv < 0.995;

    // the solid mark fades up as the chips seat
    mat.opacity = 1;
    mesh.visible = conv > 0.30;
    const solid = smoothstep(0.30, 0.62, t);
    mesh.scale.setScalar(0.92 + solid * 0.08);
  }

  const group = new THREE.Group();
  group.add(mesh, chips);

  function dispose() { geo.dispose(); chipGeo.dispose(); mat.dispose(); }
  return { group, mesh, chips, apply, dispose };
}
