/* ClarityOps v3 · behaviour. Native scroll. One ScrollTrigger per sticky sequence. */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);

const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
history.scrollRestoration = 'manual';

/* reveal */
(() => {
  const els = $$('.reveal');
  if (reduce || !('IntersectionObserver' in window)) return els.forEach(e => e.classList.add('in'));
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .12, rootMargin: '0px 0px -6% 0px' });
  els.forEach(e => io.observe(e));
})();

/* nav hides on the way down, returns on the way up */
(() => {
  const nav = $('#nav'); let last = 0;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: self => { const y = self.scroll(); nav.classList.toggle('is-hidden', y > 120 && y > last + 2); last = y; } });
})();

/* the MacBook: scales up while the page goes dark, then the product runs */
(() => {
  const track = $('#mbpTrack'), mbp = $('#mbp'), screen = $('#screen'), hq = $('#hq');
  if (!track) return;
  const fit = () => { hq.style.transform = `scale(${screen.clientWidth / 1280})`; screen.style.height = ''; };
  fit(); new ResizeObserver(fit).observe(screen);
  const events = $$('.hq__ev'), newRow = $('#hqNewRow'), agent = $('#hqAgent'), kpi = $('#hqKpi'), stage = $('#hqStage');
  const agentText = agent.dataset.text; agent.textContent = '';
  const steps = [
    () => { events[0].classList.add('on'); },
    () => { newRow.hidden = false; events[1].classList.add('on'); },
    () => { events[2].classList.add('on'); },
    () => { events[3].classList.add('on'); stage.className = 'pill pill--qual'; stage.textContent = 'Qualified'; },
    () => { events[4].classList.add('on'); typeAgent(); },
    () => { events[5].classList.add('on'); kpi.querySelector('b').textContent = '$3.41M'; kpi.querySelector('em').textContent = '+ $640k today'; },
  ];
  let done = -1, typing = null;
  function typeAgent() { if (typing || reduce) { agent.textContent = agentText; return; } let i = 0; typing = setInterval(() => { agent.textContent = agentText.slice(0, ++i); if (i >= agentText.length) clearInterval(typing); }, 18); }
  function reset() { events.forEach(e => e.classList.remove('on')); newRow.hidden = true; stage.className = 'pill pill--lead'; stage.textContent = 'Lead'; agent.textContent = ''; if (typing) { clearInterval(typing); typing = null; } kpi.querySelector('b').textContent = '$2.77M'; kpi.querySelector('em').textContent = 'this quarter'; done = -1; }
  reset();
  if (reduce) { steps.forEach(s => s()); mbp.style.transform = 'scale(1.16)'; return; }
  ScrollTrigger.create({ trigger: track, start: 'top top', end: 'bottom bottom', scrub: 0.5,
    onUpdate: self => {
      const p = self.progress;
      const z = gsap.utils.clamp(0, 1, p / 0.38), s = 1 + 0.22 * (1 - Math.pow(1 - z, 3));
      mbp.style.transform = `scale(${s}) translateY(${-2 * z}vh)`;
      document.body.classList.toggle('is-dark', p > 0.14 && p < 0.97);
      const n = Math.floor(gsap.utils.clamp(0, 1, (p - 0.3) / 0.6) * steps.length);
      if (n < done + 1) { reset(); }
      while (done < n - 1 && done < steps.length - 1) { done++; steps[done](); }
    },
    onLeaveBack: reset });
})();

/* feature tabs: driven by the hold's scroll, and clickable */
(() => {
  const hold = $('#featHold'); if (!hold) return;
  const tabs = $$('.tabs button', hold), shots = $$('.feat-card__shot img', hold), copies = $$('[data-feat]', hold);
  const show = i => { tabs.forEach((t, j) => t.classList.toggle('is-on', j === i)); shots.forEach((s, j) => s.classList.toggle('is-on', j === i)); copies.forEach((c, j) => { c.hidden = j !== i; }); };
  tabs.forEach((t, i) => t.addEventListener('click', () => { locked = true; show(i); }));
  let locked = false; show(0);
  if (reduce || innerWidth < 760) return;
  ScrollTrigger.create({ trigger: hold, start: 'top top', end: 'bottom bottom', onUpdate: self => { if (!locked) show(Math.min(tabs.length - 1, Math.floor(self.progress * tabs.length))); }, onLeave: () => { locked = false; }, onLeaveBack: () => { locked = false; } });
})();

/* numbers count up once */
(() => {
  $$('[data-count]').forEach(el => {
    const to = Number(el.dataset.count), suffix = el.dataset.suffix || '';
    const fmt = v => Math.round(v).toLocaleString('en-US') + suffix;
    if (reduce) return el.textContent = fmt(to);
    el.textContent = fmt(0);
    ScrollTrigger.create({ trigger: el, start: 'top 85%', once: true, onEnter: () => gsap.to({ v: 0 }, { v: to, duration: 1.6, ease: 'power3.out', onUpdate() { el.textContent = fmt(this.targets()[0].v); } }) });
  });
})();

/* the four builds: an accordion the scroll drives, and the hand can override */
(() => {
  const track = $('#accTrack'); if (!track) return;
  const panels = $$('.acc__p', track), navs = $$('.acc__nav button', track);
  const show = i => { panels.forEach((p, j) => p.classList.toggle('is-on', j === i)); navs.forEach((b, j) => b.classList.toggle('is-on', j === i)); };
  let locked = false;
  panels.forEach((p, i) => p.addEventListener('click', () => { locked = true; show(i); }));
  navs.forEach((b, i) => b.addEventListener('click', () => { locked = true; show(i); }));
  show(0);
  if (reduce || innerWidth < 760) return;
  ScrollTrigger.create({ trigger: track, start: 'top top', end: 'bottom bottom', onUpdate: self => { if (!locked) show(Math.min(panels.length - 1, Math.floor(self.progress * panels.length))); }, onLeave: () => { locked = false; }, onLeaveBack: () => { locked = false; } });
})();

/* one FAQ open at a time */
(() => { const all = $$('.faq details'); all.forEach(d => d.addEventListener('toggle', () => { if (d.open) all.forEach(o => { if (o !== d) o.open = false; }); })); })();

document.fonts?.ready.then(() => ScrollTrigger.refresh());
addEventListener('load', () => ScrollTrigger.refresh());
