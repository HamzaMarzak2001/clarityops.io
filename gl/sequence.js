import * as THREE from 'three';
import { HDRLoader } from 'three/addons/loaders/HDRLoader.js';
import { makeMark } from './mark.js';

/* THE SEQUENCE — Palmo's architecture, verified from their bundles:
 *   - Lenis with autoRaf:false; GSAP's ticker is the SINGLE clock
 *   - gsap.ticker.add(t => lenis.raf(t*1000)); lagSmoothing(0)
 *   - lenis.on('scroll', ScrollTrigger.update)
 *   - the pin is CSS position:sticky, NOT ScrollTrigger pin
 *   - runway height measured by ResizeObserver from the copy, so the
 *     scroll length is always exactly as long as the content
 *   - a scrub:true master timeline tweens the 3D directly
 */

export const CHAPTERS = [
  { n:'00', label:'Intake',     title:'Intake' },
  { n:'01', label:'Scattered',  title:'Scattered' },
  { n:'02', label:'Assembling', title:'Assembling' },
  { n:'03', label:'The mark',   title:'The mark' },
  { n:'04', label:'Running',    title:'Running' },
];

export async function bootSequence({ gsap, ScrollTrigger, canvas, wrapper, pin, copy }) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const small   = innerWidth < 760;
  if (reduced || small) { document.documentElement.dataset.gl = 'E'; return null; }

  const renderer = new THREE.WebGLRenderer({ canvas, alpha:true, antialias:true,
    powerPreference:'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.8));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 1.05;

  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x14181e, 7, 24);

  // A real HDRI is most of why studio work reads as real. Procedural
  // gradients vary only in latitude, so metal reflects the same ramp from
  // every angle and looks dead.
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const hdr = await new HDRLoader().loadAsync('vendor/hdri/empty_warehouse_01_1k.hdr');
  hdr.mapping = THREE.EquirectangularReflectionMapping;
  scene.environment = pmrem.fromEquirectangular(hdr).texture;
  hdr.dispose(); pmrem.dispose();

  const key = new THREE.DirectionalLight('#ffffff', 1.35);
  key.position.set(-3.4, 5.2, 3.0);
  scene.add(key, new THREE.HemisphereLight('#e9ecef', '#0a0b0d', 0.30));

  const cam = new THREE.PerspectiveCamera(30, innerWidth/innerHeight, 0.1, 120);
  const mark = await makeMark();
  scene.add(mark.group);

  // state object the timeline tweens; the renderer only ever reads it
  const S = { t:0, camX:0.42, camY:0.06, camZ:0.95, fov:24, rotY:-0.9, rotX:0.18, exposure:1.05 };

  function draw(ms) {
    cam.position.set(S.camX, S.camY, S.camZ);
    cam.lookAt(0, 0.02, 0);
    cam.fov = S.fov; cam.updateProjectionMatrix();
    renderer.toneMappingExposure = S.exposure;
    mark.apply(S.t, ms);
    mark.group.rotation.y = S.rotY + Math.sin(ms * 0.00018) * 0.035;
    mark.group.rotation.x = S.rotX;
    renderer.render(scene, cam);
  }
  gsap.ticker.add(draw);

  // ── runway: measured from the copy, exactly like Palmo
  const ro = new ResizeObserver(() => {
    wrapper.style.height = copy.offsetHeight + 'px';
    ScrollTrigger.refresh();
  });
  ro.observe(copy);
  wrapper.style.height = copy.offsetHeight + 'px';

  // ── the master scrub timeline
  const tl = gsap.timeline({
    scrollTrigger: { trigger: wrapper, start:'top top', end:'bottom bottom', scrub: true },
    defaults: { ease:'power2.inOut' },
  });

  tl.to(S, { t:0.22, camX:1.10, camY:0.42, camZ:2.05, fov:28, rotY:-0.45, rotX:0.14 })
    .to(S, { t:0.48, camX:0.55, camY:0.55, camZ:3.10, fov:31, rotY:-0.10, rotX:0.08 })
    .to(S, { t:0.74, camX:0.10, camY:0.22, camZ:3.90, fov:33, rotY: 0.16, rotX:0.03, exposure:1.12 })
    .to(S, { t:1.00, camX:0.00, camY:0.06, camZ:4.15, fov:34, rotY: 0.62, rotX:0.00 });

  // ── chapter readout + document.title, driven off the same progress
  const roLabel = document.getElementById('seqLabel');
  const roBar   = document.getElementById('seqBar');
  const roCt    = document.getElementById('seqCt');
  const roEl    = document.getElementById('seqRo');
  const chapters = [...copy.querySelectorAll('[data-ch]')];
  let cur = -1;

  ScrollTrigger.create({
    trigger: wrapper, start:'top top', end:'bottom bottom',
    onUpdate: (self) => {
      const p = self.progress;
      roBar.style.width = (p*100).toFixed(1) + '%';
      roCt.textContent = String(Math.round(p*100)).padStart(3,'0');
      const i = Math.min(CHAPTERS.length-1, Math.floor(p * CHAPTERS.length));
      if (i !== cur) {
        cur = i;
        // label swap as its own micro-timeline, Palmo-style
        gsap.timeline()
          .to(roLabel, { autoAlpha:0, y:-6, duration:0.15, ease:'power2.in' })
          .add(() => { roLabel.textContent = CHAPTERS[i].label; })
          .fromTo(roLabel, { autoAlpha:0, y:6 }, { autoAlpha:1, y:0, duration:0.24, ease:'power2.out' });
        chapters.forEach((c, n) => c.classList.toggle('on', n === i));
        document.title = `ClarityOps | ${CHAPTERS[i].title}`;
      }
    },
    onToggle: (self) => roEl.classList.toggle('on', self.isActive),
  });

  addEventListener('resize', () => {
    renderer.setSize(innerWidth, innerHeight, false);
    cam.aspect = innerWidth/innerHeight; cam.updateProjectionMatrix();
  });

  canvas.classList.add('is-live');
  return { renderer, scene, cam, mark, tl, S };
}
