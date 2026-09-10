import * as THREE from 'three';

/* THE PLATE — the entire contrast answer.
 *
 * A dark object on a near-black page separates by ~6 L*. The eye has nothing
 * to lock onto. Rather than lighten the brand, we put a genuinely LIGHT
 * object inside the scene, underneath: a tilted machinist's surface plate.
 * Object-to-plate separation ~64 L*. The page ground stays #060607 — the
 * plate is an object in the document, not a new page colour.
 *
 * It is a BOX, not a plane: the 0.06u edge catches a specular line, and that
 * is most of why this reads as a machined surface plate rather than a lighter
 * rectangle someone drew.
 */

function plateTexture() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 600;
  const g = c.getContext('2d');

  g.fillStyle = '#c9ced4';
  g.fillRect(0, 0, 1024, 600);

  const rg = g.createRadialGradient(430, 276, 0, 430, 276, 0.78 * Math.hypot(512, 300));
  rg.addColorStop(0, '#f3f5f6');
  rg.addColorStop(1, 'rgba(243,245,246,0)');
  g.fillStyle = rg;
  g.fillRect(0, 0, 1024, 600);

  // 24px inset hairline — gives the eye a definite edge
  g.strokeStyle = '#9aa0a8'; g.lineWidth = 1;
  g.strokeRect(24.5, 24.5, 1024 - 49, 600 - 49);

  // corner ticks
  g.beginPath();
  [[24,24],[1000,24],[24,576],[1000,576]].forEach(([x,y],i)=>{
    const sx = i % 2 ? -1 : 1, sy = i < 2 ? 1 : -1;
    g.moveTo(x, y); g.lineTo(x + 26*sx, y); g.moveTo(x, y); g.lineTo(x, y + 26*sy);
  });
  g.stroke();

  // seven tick marks on the left rail — the seven databases.
  // the annotation confirms something already drawn.
  g.strokeStyle = '#8f959d';
  for (let i = 0; i < 7; i++) {
    const y = 150 + i * 50;
    g.beginPath(); g.moveTo(48, y); g.lineTo(78, y); g.stroke();
  }

  // 0 / 5 / 10 scale bar, bottom-left
  g.strokeStyle = '#7d838b'; g.fillStyle = '#7d838b';
  g.font = '11px ui-monospace, Menlo, monospace';
  g.beginPath(); g.moveTo(60, 540); g.lineTo(260, 540); g.stroke();
  [0,5,10].forEach((n,i)=>{
    const x = 60 + i * 100;
    g.beginPath(); g.moveTo(x, 540); g.lineTo(x, 530); g.stroke();
    g.fillText(String(n), x - 3, 526);
  });

  // title block, bottom-right
  g.fillText('CLARITYOPS · DRIVE LINE · SCALE 1:1', 660, 566);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 8;
  return tex;
}

export function makeStage() {
  const tex = plateTexture();
  const mat = new THREE.MeshStandardMaterial({
    map: tex,
    emissiveMap: tex,
    emissive: new THREE.Color('#e6e9ec'),
    emissiveIntensity: 0.20,   // animated 0.20 -> 0.35; capped because emissive
                               // is added AFTER shadowing and would wash the
                               // contact shadow out at 1.0
    roughness: 0.62,
    metalness: 0.04,
    envMapIntensity: 0.5,
    fog: false,                // the plate is never fogged
  });

  const plate = new THREE.Mesh(new THREE.BoxGeometry(9.2, 0.06, 5.4), mat);
  plate.rotation.x = -0.38;    // ~22deg — a drafting-table tilt
  plate.position.set(0.10, -1.55, 0);
  plate.receiveShadow = true;

  function apply(t) {
    mat.emissiveIntensity = 0.20 + Math.min(1, Math.max(0, t)) * 0.15;
  }
  function dispose() { plate.geometry.dispose(); mat.dispose(); tex.dispose(); }

  return { plate, apply, dispose };
}
