import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

/* THE SEQUENCE
 * Recipe lifted from studying MengTo/kage's source. The lesson there was that
 * the geometry is almost irrelevant — kage is 25 boxes and 18 planes — and the
 * entire read comes from COLOURED light, additive haze, drifting motes, fog,
 * and a grain plate over the top. White light on grey metal is why every
 * earlier attempt looked dead.
 *
 * Scroll is a pure function: nothing integrates, so scrubbing back up
 * reproduces the same frames exactly.
 */

const TAU = Math.PI * 2;
const cvs = (w,h) => { const c=document.createElement('canvas'); c.width=w; c.height=h; return c; };
function mulberry32(a){return()=>{a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

function texGlow(inner, outer){
  const S=128,c=cvs(S,S),x=c.getContext('2d');
  const g=x.createRadialGradient(S/2,S/2,0,S/2,S/2,S/2);
  g.addColorStop(0,inner); g.addColorStop(.45,outer); g.addColorStop(1,'rgba(0,0,0,0)');
  x.fillStyle=g; x.fillRect(0,0,S,S);
  const t=new THREE.CanvasTexture(c); t.colorSpace=THREE.SRGBColorSpace; return t;
}

/* the grain plate — drawn once into the #grain div */
function paintGrain(){
  const el=document.getElementById('grain'); if(!el) return;
  const S=180,c=cvs(S,S),x=c.getContext('2d'),im=x.createImageData(S,S),d=im.data,r=mulberry32(9);
  for(let i=0;i<S*S;i++){const v=110+r()*90; d[i*4]=d[i*4+1]=d[i*4+2]=v; d[i*4+3]=255;}
  x.putImageData(im,0,0);
  el.style.backgroundImage='url('+c.toDataURL('image/png')+')';
}

export async function bootSequence({ gsap, ScrollTrigger, canvas, wrapper, pin, copy }) {
  paintGrain();

  const LOW = matchMedia('(max-width: 900px)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, powerPreference:'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio||1, LOW?1.4:1.75));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.04;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x070b12, 0.014);
  const camera = new THREE.PerspectiveCamera(38, innerWidth/innerHeight, 0.1, 200);

  /* ── LIGHT — cool key against a brand-yellow rim. The whole difference. ── */
  scene.add(new THREE.HemisphereLight(0x4a6f86, 0x05070a, 0.30));
  const key  = new THREE.DirectionalLight(0xbcd9e8, 2.10); key.position.set(-6,9,7);   scene.add(key);
  const rim  = new THREE.DirectionalLight(0xfcff02, 1.70); rim.position.set(7,3,-6);   scene.add(rim);
  const warm = new THREE.PointLight(0xffa63a, 3.4, 30, 2); warm.position.set(4.5,-1.2,3); scene.add(warm);
  const cool = new THREE.PointLight(0x6fd0ff, 2.2, 26, 2); cool.position.set(-5.5,2.5,-2); scene.add(cool);

  /* ── ENV — built from the scene so reflections carry the rim colour ── */
  const pmrem = new THREE.PMREMGenerator(renderer); pmrem.compileEquirectangularShader();
  const envScene = new THREE.Scene(); envScene.background = new THREE.Color(0x080c12);
  const quad=(c,i,x,y,z,w,h)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),
    new THREE.MeshBasicMaterial({color:new THREE.Color(c).multiplyScalar(i),side:THREE.DoubleSide}));
    m.position.set(x,y,z); m.lookAt(0,0,0); envScene.add(m);};
  quad(0xbcd9e8,12.0,-4,4,3,7,5);          // cool key
  quad(0xfcff02,16.0,4.4,1.2,-3.4,1.0,6);  // brand rim strip -> travelling highlight
  quad(0xffa63a, 4.0,3.2,-2,2.6,5,4);      // warm bounce
  quad(0xffffff,45.0,-1.6,3.0,3.6,.4,.4);  // hot pin
  scene.environment = pmrem.fromScene(envScene, 0.04).texture;

  /* ── HAZE — additive slabs. Depth. ── */
  const hazeTex = texGlow('rgba(150,195,220,.55)','rgba(90,140,175,.16)');
  const haze=[]; const hr=mulberry32(66);
  for(let i=0;i<(LOW?4:7);i++){
    const s=14+hr()*18;
    const m=new THREE.Mesh(new THREE.PlaneGeometry(s,s*.55),
      new THREE.MeshBasicMaterial({map:hazeTex,transparent:true,blending:THREE.AdditiveBlending,
        depthWrite:false,fog:false,opacity:.05+hr()*.07}));
    m.position.set((hr()-.5)*30, -2+hr()*10, -22+hr()*24);
    m.renderOrder=4; m.userData={sp:.05+hr()*.11, ph:hr()*TAU, x0:m.position.x};
    scene.add(m); haze.push(m);
  }

  /* ── MOTES — additive points. Life. ── */
  const uT={value:0};
  const N=LOW?260:520, pos=new Float32Array(N*3), sd=new Float32Array(N), pr=mulberry32(3);
  for(let i=0;i<N;i++){pos[i*3]=(pr()-.5)*34; pos[i*3+1]=pr()*16-4; pos[i*3+2]=-20+pr()*28; sd[i]=pr();}
  const pg=new THREE.BufferGeometry();
  pg.setAttribute('position',new THREE.BufferAttribute(pos,3));
  pg.setAttribute('aSeed',new THREE.BufferAttribute(sd,1));
  const motes=new THREE.Points(pg,new THREE.ShaderMaterial({
    uniforms:{uT,uTex:{value:texGlow('rgba(255,246,200,1)','rgba(252,255,2,.30)')},uSize:{value:innerHeight*.42}},
    transparent:true, blending:THREE.AdditiveBlending, depthWrite:false,
    vertexShader:`attribute float aSeed;uniform float uT;uniform float uSize;varying float vA;
      void main(){vec3 p=position;
        p.y=mod(p.y+uT*(0.16+aSeed*0.30)+8.0,16.0)-4.0;
        p.x+=sin(uT*(0.22+aSeed*0.4)+aSeed*6.28)*0.55;
        vA=0.30+0.70*sin(uT*(0.7+aSeed*1.5)+aSeed*6.28)*0.5+0.35;
        vec4 mv=modelViewMatrix*vec4(p,1.0);
        gl_PointSize=(uSize*(0.5+aSeed*0.8))/max(0.001,-mv.z);
        gl_Position=projectionMatrix*mv;}`,
    fragmentShader:`uniform sampler2D uTex;varying float vA;
      void main(){vec4 t=texture2D(uTex,gl_PointCoord);gl_FragColor=vec4(t.rgb,t.a*vA*0.7);}`
  }));
  motes.frustumCulled=false; scene.add(motes);

  /* ── THE MARK ── */
  const group=new THREE.Group(); scene.add(group);
  const svg=await new SVGLoader().loadAsync('assets/logos/logo-icon-white.svg');
  const shapes=[]; for(const p of svg.paths) for(const s of SVGLoader.createShapes(p)) shapes.push(s);
  const geo=new THREE.ExtrudeGeometry(shapes,{depth:54,bevelEnabled:true,bevelThickness:8,
    bevelSize:7,bevelSegments:5,curveSegments:LOW?16:26});
  geo.scale(1,-1,1); geo.center(); const S=3.4/500; geo.scale(S,S,S); geo.computeVertexNormals();
  const mark=new THREE.Mesh(geo,new THREE.MeshStandardMaterial({
    color:0x2a323d, metalness:0.98, roughness:0.16, envMapIntensity:1.9 }));
  group.add(mark);

  /* ── SCROLL ──
     .seq__copy is absolutely positioned, so its chapters contribute no
     height and the section collapsed to a single viewport. The runway has
     to be written explicitly: one viewport per chapter. */
  const chapters=[...copy.querySelectorAll('.seq__ch')];
  wrapper.style.minHeight = (chapters.length * 100) + 'svh';

  const state={t:0};
  gsap.to(state,{t:1,ease:'none',scrollTrigger:{
    trigger:wrapper, start:'top top', end:'bottom bottom', scrub:true }});

  // chapter swap driven off the same progress
  const chs=chapters;
  let cur=-1;
  function chapter(t){
    const i=Math.min(chs.length-1,Math.floor(t*chs.length));
    if(i===cur) return; cur=i;
    chs.forEach((el,n)=>el.classList.toggle('on',n===i));
    const title=chs[i].dataset.title;
    if(title) document.title='ClarityOps | '+title;
  }

  const clock=new THREE.Clock();
  let running=true, revealed=false;
  function frame(){
    if(!running) return;
    const dt=Math.min(clock.getDelta(),1/30); uT.value+=dt;
    const t=state.t;

    /* Copy owns the left half, the object owns the right. They never
       overlap, so no scrim is needed and legibility is a composition
       constraint rather than a darkening gradient. */
    /* Offset scales continuously with width instead of snapping at a
       breakpoint: on a wide screen the object clears the copy entirely;
       as the viewport narrows it slides back and shrinks so the headline
       always wins. */
    const k = Math.min(1, Math.max(0, (innerWidth - 760) / 560));   // 0 @760 -> 1 @1320
    camera.position.set(-0.9+t*1.6, 0.7-t*0.7, 6.6-t*2.2 + (1-k)*1.5);
    camera.lookAt(1.62*k, 0.1-t*0.15, 0);

    group.position.x = 2.6*k;
    group.scale.setScalar(0.72 + 0.28*k);
    group.rotation.y = -0.7 + t*2.1;
    group.rotation.x =  0.16 - t*0.20;
    group.position.y =  0.1 + Math.sin(uT.value*0.5)*0.045;

    for(const h of haze){
      h.position.x = h.userData.x0 + Math.sin(uT.value*h.userData.sp + h.userData.ph)*4.2;
      h.lookAt(camera.position);
    }
    chapter(t);
    renderer.render(scene,camera);
    if(!revealed){ revealed=true; canvas.classList.add('is-live'); }  // CSS gates it to 0 until now
    requestAnimationFrame(frame);
  }

  // only render while the pinned section is on screen
  const io=new IntersectionObserver(([e])=>{
    if(e.isIntersecting && !running){ running=true; clock.getDelta(); frame(); }
    else if(!e.isIntersecting){ running=false; }
  },{rootMargin:'10% 0px'});
  io.observe(wrapper);

  addEventListener('resize',()=>{
    renderer.setSize(innerWidth,innerHeight,false);
    camera.aspect=innerWidth/innerHeight; camera.updateProjectionMatrix();
  });

  frame();
  return { scene, renderer, camera, mark, state };
}
