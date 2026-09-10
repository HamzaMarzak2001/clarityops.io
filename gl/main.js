import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }     from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass }     from 'three/addons/postprocessing/OutputPass.js';
import { makeEnv } from './env.js';
import { makeStage } from './stage.js';
import { makeCamera } from './camera.js';
import { makeDriveLine } from './driveline.js';
import { makeSprockets } from './sprockets.js';

/* INVARIANT: this is the ONLY requestAnimationFrame on the site. */

const qs = new URLSearchParams(location.search);

function tier() {
  if (qs.get('nogl') === '1') return 'E';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 'E';
  try {
    const c = document.createElement('canvas');
    if (!(c.getContext('webgl2') || c.getContext('webgl'))) return 'E';
  } catch { return 'E'; }
  const w = innerWidth, mem = navigator.deviceMemory || 4;
  if (w < 760) return 'E';
  if (w < 1180 || mem <= 4) return 'B';
  return 'A';
}

export function boot(canvas) {
  const T = tier();
  document.documentElement.dataset.gl = T;
  if (T === 'E') return { tier: T, enabled: false };

  const renderer = new THREE.WebGLRenderer({
    // NOTE: antialias is IGNORED once we render through EffectComposer.
    canvas, alpha: true, powerPreference: 'high-performance',
  });
  const DPR_CAP = T === 'A' ? 1.85 : 1.4;
  renderer.setPixelRatio(Math.min(devicePixelRatio, DPR_CAP));
  renderer.setSize(innerWidth, innerHeight, false);
  // AgX holds the accent's hue at intensity; ACES drags #fcff02 toward white.
  renderer.toneMapping = THREE.AgXToneMapping;
  renderer.toneMappingExposure = 1.0;
  if (T === 'A') { renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap; }

  const scene = new THREE.Scene();
  scene.environment = makeEnv(renderer);
  // Fog must be LIGHTER than the page ground. FogExp2(0x060607) was
  // byte-identical to the ground and therefore DELETED distant parts
  // instead of shading them.
  scene.fog = new THREE.Fog(0x232830, 6, 20);

  // Two lights, not three. The yellow rim made the accent read as a wash;
  // torque now arrives as a REFLECTION from the env's TORQUE quad.
  const key = new THREE.DirectionalLight('#ffffff', 1.6);
  key.position.set(-3.4, 5.2, 3.0);
  if (T === 'A') {
    key.castShadow = true;
    key.shadow.mapSize.set(1024, 1024);
    Object.assign(key.shadow.camera, { left: -6, right: 6, top: 6, bottom: -6 });
    key.shadow.bias = -0.0008; key.shadow.normalBias = 0.02; key.shadow.radius = 4;
  }
  scene.add(key);
  scene.add(new THREE.HemisphereLight('#e9ecef', '#0a0b0d', 0.35));

  const stage = makeStage();
  scene.add(stage.plate);
  stage.plate.position.x += 1.9;

  const { cam, apply: applyCam, resize: resizeCam } = makeCamera(innerWidth / innerHeight);
  const line = makeDriveLine();
  const spr  = makeSprockets();
  const rig  = new THREE.Group();
  rig.add(line.mesh, spr.group);
  line.mesh.castShadow = true;
  scene.add(rig);

  // ── postprocessing: bloom is what makes engaged metal read as ENERGISED.
  //    Threshold is high so only the emissive links bloom — the steel never does.
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, cam));
  // threshold 0.72 / strength 1.15 bloomed the steel's own speculars —
  // the exact recipe for demo haze. Only the emissive torque should bloom.
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(innerWidth, innerHeight),
    T === 'A' ? 0.55 : 0.42,   // strength
    0.30,                      // radius
    0.90                       // threshold
  );
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  function sized() {
    renderer.setSize(innerWidth, innerHeight, false);
    composer.setSize(innerWidth, innerHeight);
    bloom.setSize(innerWidth, innerHeight);
    resizeCam(innerWidth / innerHeight);
  }

  let docH = 1, progress = 0, target = 0;
  function measure() {
    docH = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    sized();
  }
  function readScroll() { target = Math.min(1, Math.max(0, scrollY / docH)); }

  let visible = !document.hidden, idle = 0, last = 0;
  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible) { idle = 0; start(); }
  });

  let rafId = null, running = false;
  function frame(now) {
    const d = target - progress;
    progress += d * 0.075;
    if (Math.abs(d) < 0.0002) { progress = target; idle++; } else idle = 0;

    // idle: keep it alive, but at ~30fps instead of full rate
    const throttled = idle > 40;
    if (throttled && now - last < 33) { rafId = requestAnimationFrame(frame); return; }
    last = now;

    // secondary motion — the rig is never perfectly still, so the scene reads
    // as running machinery rather than a frozen render
    const t = now * 0.001;
    rig.position.x = 1.9;   // clear of the copy column; the bench restructure replaces this
    rig.rotation.y = Math.sin(t * 0.22) * 0.10 + progress * 0.30;
    rig.rotation.x = Math.sin(t * 0.17) * 0.045 - 0.06;
    rig.position.y = Math.sin(t * 0.31) * 0.045;

    applyCam(progress);
    stage.apply(progress);
    line.apply(progress);
    spr.apply(progress);
    composer.render();

    if (!visible) { running = false; rafId = null; return; }
    rafId = requestAnimationFrame(frame);
  }
  function start() {
    if (running || !visible) return;
    running = true; rafId = requestAnimationFrame(frame);
  }

  addEventListener('scroll', () => { readScroll(); idle = 0; }, { passive: true });
  let rt; addEventListener('resize', () => {
    clearTimeout(rt); rt = setTimeout(() => { measure(); readScroll(); idle = 0; }, 150);
  });
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); running = false; });

  measure(); readScroll(); progress = target; start();
  requestAnimationFrame(() => canvas.classList.add('is-live'));

  return { tier: T, enabled: true, renderer, composer, scene, cam, bloom, rig };
}
