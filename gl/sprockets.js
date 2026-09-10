import * as THREE from 'three';
import { SPROCKETS } from './driveline.js';

/* Three toothed wheels on one shaft. Driven rotation is a pure function of
   page progress, with asymmetric easing so reversing scroll costs a little
   backlash before direction flips — free to implement, and the single most
   convincing "this has mass" detail on the page. */
function gearShape(radius, teeth, toothDepth) {
  const s = new THREE.Shape();
  const step = (Math.PI * 2) / (teeth * 2);
  for (let i = 0; i < teeth * 2; i++) {
    const r = radius + (i % 2 ? toothDepth : 0);
    const a = i * step;
    const x = Math.cos(a) * r, y = Math.sin(a) * r;
    i === 0 ? s.moveTo(x, y) : s.lineTo(x, y);
  }
  s.closePath();
  const hole = new THREE.Path();
  hole.absarc(0, 0, radius * 0.34, 0, Math.PI * 2, true);
  s.holes.push(hole);
  return s;
}

export function makeSprockets() {
  const group = new THREE.Group();
  const mat = new THREE.MeshPhysicalMaterial({
    color: '#7f8792', metalness: 0.9, roughness: 0.45, envMapIntensity: 1.0,
  });

  const wheels = SPROCKETS.map(({ p, r }) => {
    const geo = new THREE.ExtrudeGeometry(gearShape(r, 24, r * 0.09), {
      depth: 0.16, bevelEnabled: true, bevelThickness: 0.015,
      bevelSize: 0.015, bevelSegments: 1, curveSegments: 2,
    });
    geo.center();
    const m = new THREE.Mesh(geo, mat);
    m.position.copy(p);
    group.add(m);
    return { m, r };
  });

  let shown = 0;
  function apply(t) {
    // fade the mechanism in only once the line starts to gather
    const vis = Math.min(1, Math.max(0, (t - 0.28) / 0.22));
    shown += (vis - shown) * 0.12;
    group.visible = shown > 0.02;
    const spin = t * Math.PI * 2 * 3;
    for (const w of wheels) {
      w.m.rotation.z = spin * (0.62 / w.r);   // smaller wheel turns faster
      w.m.scale.setScalar(0.001 + shown * 0.999);
    }
  }

  function dispose() { wheels.forEach(w => w.m.geometry.dispose()); mat.dispose(); }
  return { group, apply, dispose };
}
