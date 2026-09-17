/* ClarityOps v2 · PANEL · DOM instruments.
   INVARIANT: one clock (gsap.ticker), one scroll source (ScrollTrigger).
   No window scroll listeners anywhere in this file. */

const LOGOS = [
  ['bigthinkers.svg','Big Thinkers'],['blackridge_co.svg','BlackRidge & Co.'],
  ['btrustbuilders.svg','B Trust Builders'],['Client_success_solutions.svg','Client Success Solutions'],
  ['expertsagency.svg','Experts Agency'],['FryAway.png','FryAway'],['LTC.svg','LTC'],
  ['Mercy_Elroi.svg','Mercy Elroi'],['Pet_Friends.svg','Pet Friends'],
  ['Printsbymilly.svg','Prints By Milly'],['Rettain.svg','Rettain'],
  ['Riwaya_Travel.svg','Riwaya Travel'],['SLE.svg','SLE'],
  ['Summit_Acquisition.svg','Summit Acquisition'],['trendify.svg','Trendify'],
  ['Xsama.svg','Xsama'],['360captures.svg','360 Captures'],
];

const BUILDS = [
  { slug:'labinno', short:'Labinno', url:'clarityopsio.notion.site',
    metric:'7 connected databases, 6 live projects, delivered natively in French',
    title:'Construction Operations OS', loc:'Labinno, Geneva',
    d:'Projects, tasks, meeting minutes, clients, partners, team roles and documents in one place, with separate views for the team, the client and outside partners. Every project runs from tender submission to handover.' },
  { slug:'bourbon-holdings', short:'Bourbon Holdings', url:'bourbonholdings.notion.site',
    metric:'629 heir records migrated, 6 automations across 5 platforms',
    title:'Deal Flow & Automation OS', loc:'Bourbon Holdings, Los Angeles',
    d:'A new lead becomes a deal with the contact matched automatically. Every deal gets its own Drive folder and a generated property summary doc. AI parses the MLS report into it. Calls log themselves. Refund windows are watched daily.' },
  { slug:'fryaway', short:'FryAway', url:'clarityopsio.notion.site',
    metric:'4 reporting surfaces collapsed into 1 daily page, ROAS computed automatically',
    title:'Marketing Performance OS', loc:'FryAway, DTC',
    d:'Six databases on a shared date axis, so paid, owned and organic finally line up. One snapshot each morning: revenue by channel, ad spend by platform, ROAS calculated, and a rolling 30-day trend.' },
  { slug:'mae-media', short:'MAE Media', url:'maemedia.notion.site',
    metric:'10+ automations across 8 platforms, 1 weekly scorecard',
    title:'Agency Operations & Automation OS', loc:'MAE Media, Media & marketing',
    d:'Seven databases spanning clients, projects, campaigns, invoices, tasks and team, plus a weekly scorecard layer. Drive folders on project creation. Daily Meta Ads sync across two ad accounts. QuickBooks feeding a live scorecard.' },
];

const pad3 = p => String(Math.round(p * 100)).padStart(3, '0');

export function bootUI({ gsap, ScrollTrigger, lenis, reduce }) {
  history.scrollRestoration = 'manual';
  logos();
  reveal(reduce);
  rules(ScrollTrigger);
  nav(gsap, ScrollTrigger);
  counters(ScrollTrigger, reduce);
  layers(ScrollTrigger);
  locks(ScrollTrigger);
  wall(ScrollTrigger, reduce);
  anchors(lenis);
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

/* Logo wall: each logo owns its trailing margin so translateX(-50%) lands on the duplicate. */
function logos() {
  const track = document.getElementById('wallTrack');
  if (!track) return;
  const make = hidden => LOGOS.map(([f, alt]) => {
    const img = document.createElement('img');
    img.src = 'assets/images/clients/' + f; img.alt = hidden ? '' : alt;
    img.loading = 'lazy'; img.decoding = 'async';
    if (hidden) img.setAttribute('aria-hidden', 'true');
    img.onerror = () => { img.style.display = 'none'; };
    return img;
  });
  make(false).forEach(i => track.appendChild(i));
  make(true).forEach(i => track.appendChild(i));
}

function reveal(reduce) {
  const els = document.querySelectorAll('[data-r]');
  if (reduce || !('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.1, rootMargin: '0px 0px -8% 0px' });
  els.forEach(e => io.observe(e));
}

/* The section device: the rule energizes once, when the section arrives. */
function rules(ST) {
  document.querySelectorAll('.rule').forEach(rule => {
    ST.create({ trigger: rule, start: 'top 82%', once: true,
      onEnter: () => { rule.classList.add('is-on'); rule.closest('section')?.classList.add('is-on'); } });
  });
}

function nav(gsap, ST) {
  const bar = document.getElementById('nav');
  ST.create({ start: 'top -48', end: 'max', toggleClass: { targets: bar, className: 'is-solid' } });
  gsap.to('#navGauge', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.4 } });
}

/* Split-flap counters: every digit is a column that rolls to its value. */
function counters(ST, reduce) {
  document.querySelectorAll('[data-count]').forEach(el => {
    const n = Number(el.dataset.count), suffix = el.dataset.suffix || '';
    const str = n.toLocaleString('en-US') + suffix;
    el.textContent = '';
    const cols = [];
    for (const ch of str) {
      if (/\d/.test(ch)) {
        const flap = document.createElement('span'); flap.className = 'flap';
        const col = document.createElement('span');
        col.textContent = '0123456789'.split('').join('\n');
        col.style.whiteSpace = 'pre'; col.style.lineHeight = '1';
        flap.appendChild(col); el.appendChild(flap); cols.push([col, Number(ch)]);
      } else {
        const s = document.createElement('span'); s.textContent = ch; el.appendChild(s);
      }
    }
    const settle = () => cols.forEach(([col, d], i) => setTimeout(() => { col.style.transform = `translateY(${-d}em)`; }, i * 90));
    if (reduce) { cols.forEach(([col, d]) => { col.style.transition = 'none'; col.style.transform = `translateY(${-d}em)`; }); return; }
    ST.create({ trigger: el, start: 'top 85%', once: true, onEnter: settle });
  });
}

/* The three layers: each row lights its lamp and its group on the schematic as it arrives. */
function layers(ST) {
  const fig = document.getElementById('sysFig');
  const groups = fig ? [...fig.querySelectorAll('[data-layer]')] : [];
  groups.forEach(g => { g.style.transition = 'opacity .8s cubic-bezier(.16,1,.3,1)'; g.style.opacity = '.22'; });
  document.querySelectorAll('.layer[data-layer]').forEach(row => {
    ST.create({ trigger: row, start: 'top 72%', once: true, onEnter: () => {
      row.classList.add('is-on');
      groups.filter(g => g.dataset.layer === row.dataset.layer).forEach(g => { g.style.opacity = '1'; });
    } });
  });
}

function locks(ST) {
  document.querySelectorAll('.lock').forEach(el => {
    ST.create({ trigger: el, start: 'top 80%', once: true, onEnter: () => el.classList.add('is-on') });
  });
}

/* As-built: the sticky monitor. Chapters, a readout, and a document.title that narrates. */
function wall(ST, reduce) {
  const wrap = document.getElementById('wallpin');
  const screens = document.getElementById('monScreens');
  const copy = document.getElementById('wallCopy');
  if (!wrap || !screens || !copy) return;
  const ro = document.getElementById('wallRo'), roLabel = document.getElementById('roLabel');
  const roBar = document.getElementById('roBar'), roCt = document.getElementById('roCt'), url = document.getElementById('monUrl');

  BUILDS.forEach((c, i) => {
    const img = document.createElement('img');
    img.src = `assets/images/case-studies/${c.slug}/hero.png`;
    img.alt = `${c.title}, ${c.loc}`; img.loading = i === 0 ? 'eager' : 'lazy'; img.decoding = 'async';
    screens.appendChild(img);
    const ch = document.createElement('div'); ch.className = 'wallch';
    ch.innerHTML = `<p class="wallch__m"></p><h3 class="wallch__t"></h3><p class="wallch__l"></p><p class="wallch__d"></p>`;
    ch.querySelector('.wallch__m').textContent = c.metric;
    ch.querySelector('.wallch__t').textContent = c.title;
    ch.querySelector('.wallch__l').textContent = c.loc;
    ch.querySelector('.wallch__d').textContent = c.d;
    copy.appendChild(ch);
  });
  const imgs = [...screens.children], chs = [...copy.children];
  wrap.style.minHeight = (BUILDS.length + 1) * 100 + 'svh';

  let cur = -1;
  const show = (i, active) => {
    if (i === cur) return; cur = i;
    imgs.forEach((el, n) => el.classList.toggle('on', n === i));
    chs.forEach((el, n) => el.classList.toggle('on', n === i));
    roLabel.textContent = BUILDS[i].short; url.textContent = BUILDS[i].url;
    if (active) document.title = `ClarityOps | ${BUILDS[i].short}`;
  };
  if (reduce) { wrap.style.minHeight = ''; show(0, false); return; }
  ST.create({ trigger: wrap, start: 'top 140%', once: true, onEnter: () => imgs.forEach(i => { i.loading = 'eager'; }) });
  ST.create({ trigger: wrap, start: 'top top', end: 'bottom bottom',
    onUpdate: self => {
      const p = self.progress;
      roBar.style.transform = `scaleX(${p})`; roCt.textContent = pad3(p);
      show(Math.min(BUILDS.length - 1, Math.floor(p * BUILDS.length)), self.isActive);
    },
    onToggle: self => { ro.classList.toggle('on', self.isActive); if (!self.isActive) document.title = 'ClarityOps. One system that runs your operations'; } });
  show(0, false);
}

function anchors(lenis) {
  if (!lenis) return;
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href').slice(1); const el = id && document.getElementById(id);
      if (!el) return; e.preventDefault(); lenis.scrollTo(el, { offset: -64, duration: 1.4 });
    });
  });
}
