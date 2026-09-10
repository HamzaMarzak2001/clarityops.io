import * as THREE from 'three';

/* The environment IS the surface appearance of a metal at metalness ~0.9.
 *
 * The previous version painted a 64x256 purely VERTICAL gradient: it varied
 * only in latitude, so every azimuth was identical and a link could rotate a
 * full 360 degrees while reflecting exactly the same grey ramp. That is the
 * literal cause of "dead metal" — there was no highlight to travel.
 *
 * Replaced with a lightformer studio: hard-edged, over-bright emissive quads
 * PMREM'd into an env map. The KICKER is a tall narrow strip rather than a
 * DirectionalLight specifically because a directional light on metal makes a
 * DOT, while a tall bright strip makes a highlight that TRAVELS along the
 * link as it turns.
 *
 * ACCEPTANCE TEST: rotate one link 360 on debug.html. If no highlight
 * travels across its surface, the environment is still wrong and nothing
 * downstream will fix it.
 */

function quad(w, h, colour, mult, pos, aim, rotX) {
  const m = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(colour).multiplyScalar(mult),
      side: THREE.DoubleSide,
      toneMapped: false,
    })
  );
  m.position.set(...pos);
  if (rotX !== undefined) m.rotation.x = rotX;
  else m.lookAt(aim ? new THREE.Vector3(...aim) : new THREE.Vector3(0, 0, 0));
  return m;
}

export function makeEnv(renderer) {
  const s = new THREE.Scene();

  //                w    h    colour     mult   position             aim
  s.add(quad(7.0, 4.0, '#ffffff', 9.0,  [-3.2, 3.4,  2.6]));           // KEY
  s.add(quad(0.9, 7.0, '#eef4ff', 26.0, [ 2.4, 1.6, -4.2]));           // KICKER — the travelling highlight
  s.add(quad(6.0, 6.0, '#7f93b4', 2.4,  [ 4.6,-0.4,  3.0]));           // FILL
  s.add(quad(10.0,6.0, '#e9ecef', 3.0,  [ 0.0,-2.6,  0.0], null, -Math.PI / 2)); // BOUNCE — the plate seen in the metal
  s.add(quad(0.35,0.35,'#ffffff', 60.0, [-1.1, 2.2,  3.4]));           // HOT PIN — the pinpoint
  s.add(quad(0.5, 3.2, '#fcff02', 14.0, [-4.4, 0.4, -1.0]));           // TORQUE — brand arrives as a reflection first

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const env = pmrem.fromScene(s, 0.02).texture;

  s.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
  pmrem.dispose();
  return env;
}
