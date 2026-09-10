import * as THREE from 'three';

/* A two-band vertical gradient painted into a canvas, then PMREM'd.
   Deliberately NOT RoomEnvironment: that file is the default grey photo
   studio and is the most recognisable "I used the three.js example"
   signature in the ecosystem. Zero downloaded textures. */
export function makeEnv(renderer) {
  const c = document.createElement('canvas');
  c.width = 64; c.height = 256;
  const g = c.getContext('2d');

  const grad = g.createLinearGradient(0, 0, 0, 256);
  grad.addColorStop(0.00, '#c8d2de');  // cool sky band — this IS the light
  grad.addColorStop(0.34, '#78838f');
  grad.addColorStop(0.50, '#343b44');  // horizon
  grad.addColorStop(0.62, '#0d0f13');
  grad.addColorStop(1.00, '#060708');  // floor
  g.fillStyle = grad;
  g.fillRect(0, 0, 64, 256);

  // one warm highlight band — gives the metal something to catch
  const hl = g.createLinearGradient(0, 40, 0, 96);
  hl.addColorStop(0, 'rgba(252,255,2,0)');
  hl.addColorStop(0.5, 'rgba(252,255,2,0.30)');
  hl.addColorStop(1, 'rgba(252,255,2,0)');
  g.fillStyle = hl;
  g.fillRect(0, 40, 64, 56);

  const tex = new THREE.CanvasTexture(c);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;

  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const env = pmrem.fromEquirectangular(tex).texture;

  tex.dispose();
  pmrem.dispose();
  return env;
}
