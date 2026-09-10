import * as THREE from 'three';
import { makeEnv } from './env.js';
import { makeCamera } from './camera.js';
import { makeDriveLine } from './driveline.js';
import { makeSprockets } from './sprockets.js';

/* INVARIANT: this is the ONLY requestAnimationFrame on the site.
   A second RAF, or a second scroll reader, makes the canvas one frame
   stale and it will jitter in a way nobody can attribute six months
   from now. Do not add one. */

const qs = new URLSearchParams(location.search);

function tier() {
  if (qs.get('nogl') === '1') return 'E';
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return 'E';
  try {
    const c = document.createElement('canvas');
    if (!(c.getContext('webgl2') || c.getContext('webgl'))) return 'E';
  } catch { return 'E'; }
  const w = innerWidth, mem = navigator.deviceMemory || 4;
  if (w < 760) return 'E';           // phones get the CSS/SVG story, not a throttled scene
  if (w < 1180 || mem <= 4) return 'B';
  return 'A';
}

export function boot(canvas) {
  const T = tier();
  document.documentElement.dataset.gl = T;
  if (T === 'E') return { tier: T, enabled: false };

  const renderer = new THREE.WebGLRenderer({
    canvas, antialias: true, alpha: true,
    powerPreference: 'high-performance',
  });
  const DPR_CAP = T === 'A' ? 2 : 1.5;
  renderer.setPixelRatio(Math.min(devicePixelRatio, DPR_CAP));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.7;

  const scene = new THREE.Scene();
  scene.environment = makeEnv(renderer);

  const key = new THREE.DirectionalLight('#ffffff', 2.6);
  key.position.set(2.5, 3.2, 4.0);
  scene.add(key);
  const rim = new THREE.DirectionalLight('#fcff02', 0.9);
  rim.position.set(-3.0, -1.0, -2.0);
  scene.add(rim);
  scene.add(new THREE.AmbientLight('#4a5560', 0.6));

  const { cam, apply: applyCam, resize: resizeCam } = makeCamera(innerWidth / innerHeight);
  const line = makeDriveLine();
  const spr  = makeSprockets();
  scene.add(line.mesh, spr.group);

  // ── scroll: single source, cached extent, recomputed on resize only
  let docH = 1, progress = 0, target = 0;
  function measure() {
    docH = Math.max(1, document.documentElement.scrollHeight - innerHeight);
    renderer.setSize(innerWidth, innerHeight, false);
    resizeCam(innerWidth / innerHeight);
  }
  function readScroll() { target = Math.min(1, Math.max(0, scrollY / docH)); }

  // ── pause gates
  let visible = !document.hidden;
  let idleFrames = 0;
  document.addEventListener('visibilitychange', () => {
    visible = !document.hidden;
    if (visible) { idleFrames = 0; start(); }
  });

  let rafId = null, running = false;
  function frame() {
    // ease toward target so a flung scroll has weight
    const d = target - progress;
    progress += d * 0.09;
    if (Math.abs(d) < 0.00015) { progress = target; idleFrames++; } else idleFrames = 0;

    applyCam(progress);
    line.apply(progress);
    spr.apply(progress);
    renderer.render(scene, cam);

    // idle ladder: stop entirely once the frame stops changing
    if (!visible || idleFrames > 26) { running = false; rafId = null; return; }
    rafId = requestAnimationFrame(frame);
  }
  function start() {
    if (running || !visible) return;
    running = true; rafId = requestAnimationFrame(frame);
  }

  addEventListener('scroll', () => { readScroll(); idleFrames = 0; start(); }, { passive: true });
  let rt; addEventListener('resize', () => {
    clearTimeout(rt); rt = setTimeout(() => { measure(); readScroll(); idleFrames = 0; start(); }, 150);
  });
  canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); running = false; });

  measure(); readScroll(); progress = target; start();

  // reveal only once a real frame exists — no flash of empty canvas
  requestAnimationFrame(() => canvas.classList.add('is-live'));

  return { tier: T, enabled: true, renderer, scene, cam };
}
