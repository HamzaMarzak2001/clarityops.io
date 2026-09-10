import * as THREE from 'three';

/* One camera on a fixed rail, one station per act, plus a single fov lerp.
   14deg reads orthographic / plan view (a drawing).
   42deg reads inside-the-machine.
   Using ONE scalar (fov) instead of translating the camera per act
   deletes an entire class of desync bugs. */
const STATIONS = [
  new THREE.Vector3( 2.6, 1.2, 28.5),   // fov 14 - plan view, far back
  new THREE.Vector3( 1.8, 0.6, 18.0),   // fov 22
  new THREE.Vector3( 0.8,-0.2, 12.2),   // fov 34
  new THREE.Vector3(-0.4, 0.4,  9.1),   // fov 42 - inside the machine
];
const LOOK = [
  new THREE.Vector3(0.6, 0.0, 0),
  new THREE.Vector3(0.2, 0.0, 0),
  new THREE.Vector3(0.0,-0.1, 0),
  new THREE.Vector3(0.0, 0.0, 0),
];
const FOV = [14, 22, 34, 42];

export function makeCamera(aspect) {
  const cam = new THREE.PerspectiveCamera(14, aspect, 0.1, 100);
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
