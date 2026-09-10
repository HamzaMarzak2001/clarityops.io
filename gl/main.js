import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass }     from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass} from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass }     from 'three/addons/postprocessing/OutputPass.js';
import { makeEnv } from './env.js';
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
    canvas, antialias: T === 'A', alpha: true, powerPreference: 'high-performance',
  });
  const DPR_CAP = T === 'A' ? 1.85 : 1.4;
  renderer.setPixelRatio(Math.min(devicePixelRatio, DPR_CAP));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.25;

  const scene = new THREE.Scene();
  scene.environment = makeEnv(renderer);
  // depth: far links recede into the page ground instead of floating flat
  scene.fog = new THREE.FogExp2(0x060607, 0.035);

  const key = new THREE.DirectionalLight('#eaf2ff', 3.4);
  key.position.set(3.0, 4.0, 3.5);
  scene.add(key);
  const fill = new THREE.DirectionalLight('#5f6a7a', 1.2);
  fill.position.set(-4.0, -1.5, 2.0);
  scene.add(fill);
  const rim = new THREE.DirectionalLight('#fcff02', 1.4);
  rim.position.set(-2.0, 1.0, -4.0);
  scene.add(rim);

  const { cam, apply: applyCam, resize: resizeCam } = makeCamera(innerWidth / innerHeight);
  const line = makeDriveLine();
  const spr  = makeSprockets();
  const rig  = new THREE.Group();
  rig.add(line.mesh, spr.group);
  scene.add(rig);

  // ── postprocessing: bloom is what makes engaged metal read as ENERGISED.
  //    Threshold is high so only the emissive links bloom — the steel never does.
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, cam));
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(innerWidth, innerHeight),
    T === 'A' ? 1.15 : 0.95,   // strength
    0.62,                      // radius
    0.72                       // threshold
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
    rig.rotation.y = Math.sin(t * 0.22) * 0.10 + progress * 0.30;
    rig.rotation.x = Math.sin(t * 0.17) * 0.045 - 0.06;
    rig.position.y = Math.sin(t * 0.31) * 0.045;

    applyCam(progress);
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
