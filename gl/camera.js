import * as THREE from 'three';

/* One camera on a fixed rail, one station per act, plus a single fov lerp.
   14deg reads orthographic / plan view (a drawing).
   42deg reads inside-the-machine.
   Using ONE scalar (fov) instead of translating the camera per act
   deletes an entire class of desync bugs. */
const STATIONS = [
  new THREE.Vector3( 0.5, 2.9, 8.6),
  new THREE.Vector3( 0.3, 2.1, 7.0),
  new THREE.Vector3(-0.2, 1.4, 5.8),
  new THREE.Vector3(-0.5, 0.9, 4.9),
];
const LOOK = [
  new THREE.Vector3(0.0,-0.45, 0),
  new THREE.Vector3(0.0,-0.35, 0),
  new THREE.Vector3(0.0,-0.25, 0),
  new THREE.Vector3(0.0,-0.15, 0),
];
const FOV = [26, 30, 36, 42];

export function makeCamera(aspect) {
  const cam = new THREE.PerspectiveCamera(26, aspect, 0.1, 100);
  const rail = new THREE.CatmullRomCurve3(STATIONS, false, 'catmullrom', 0.4);
  const lookRail = new THREE.CatmullRomCurve3(LOOK, false, 'catmullrom', 0.4);
  const _p = new THREE.Vector3(), _l = new THREE.Vector3();

  function apply(t) {
    const u = Math.min(1, Math.max(0, t));
    rail.getPoint(u, _p);
    lookRail.getPoint(u, _l);
    cam.position.copy(_p);
    cam.lookAt(_l);

    // fov across the four stations
    const seg = u * (FOV.length - 1);
    const i = Math.min(FOV.length - 2, Math.floor(seg));
    const f = seg - i;
    cam.fov = FOV[i] + (FOV[i + 1] - FOV[i]) * f;
    cam.updateProjectionMatrix();
  }

  function resize(a) { cam.aspect = a; cam.updateProjectionMatrix(); }

  return { cam, apply, resize };
}
