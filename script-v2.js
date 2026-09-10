/* ClarityOps v2 — DRIVE LINE
   INVARIANT: one RAF, one scroll source. Do not add a second. */

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

/* Marquee: each logo owns its trailing margin so translateX(-50%)
   lands exactly on the duplicate. A flex `gap` leaves half a gap at
   the seam and the loop visibly jumps. */
(function buildLogos() {
  const track = document.getElementById('logoTrack');
  if (!track) return;
  const make = () => LOGOS.map(([f, alt]) => {
    const img = document.createElement('img');
    img.src = 'assets/images/clients/' + f;
    img.alt = alt;
    img.loading = 'lazy';
    img.decoding = 'async';
    img.onerror = () => { img.style.display = 'none'; };
    return img;
  });
  make().forEach(i => track.appendChild(i));
  make().forEach(i => { i.setAttribute('aria-hidden', 'true'); track.appendChild(i); });
})();

/* Reveal — one observer, unobserve on fire. */
(function reveal() {
  const els = document.querySelectorAll('[data-r]');
  if (!('IntersectionObserver' in window)) {
    els.forEach(e => e.classList.add('in'));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  els.forEach(e => io.observe(e));
})();

/* Scroll: nav progress rule + sheet indicator.
   Per-sheet offsets are cached and recomputed on resize only —
   never read from a library's preset offsets. */
(function scroll() {
  const bar   = document.getElementById('navProgress');
  const label = document.getElementById('navSheet');
  const sheets = [...document.querySelectorAll('[data-sheet]')];
  let cache = [], docH = 1, ticking = false;

  function measure() {
    docH = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    cache = sheets.map(el => ({
      top: el.getBoundingClientRect().top + window.scrollY,
      no: el.dataset.sheet,
      label: el.dataset.label || ''
    }));
  }

  function frame() {
    const y = window.scrollY;
    if (bar) bar.style.width = Math.min(1, y / docH) * 100 + '%';
    if (label && cache.length) {
      let cur = cache[0];
      for (const s of cache) if (y >= s.top - 140) cur = s;
      const next = 'SHEET ' + cur.no + ' / ' + cur.label;
      if (label.textContent !== next) label.textContent = next;
    }
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { ticking = true; requestAnimationFrame(frame); }
  }, { passive: true });

  let rt;
  window.addEventListener('resize', () => {
    clearTimeout(rt); rt = setTimeout(() => { measure(); frame(); }, 150);
  });

  measure(); frame();
})();

/* ── THE BENCH ───────────────────────────────────────────────────
   One pinned frame; its contents transform as you scroll. The object is
   the subject and the copy moves around it — never over it, so no scrim
   is needed. Chapters, a readout, and a document.title that narrates. */
(function bench() {
  const wrap = document.getElementById('bench');
  const screens = document.getElementById('devScreens');
  const copy = document.getElementById('benchCopy');
  const ro = document.getElementById('benchRo');
  if (!wrap || !screens || !copy) return;

  const CH = [
    { slug:'labinno', short:'Labinno', url:'clarityopsio.notion.site',
      metric:'7 connected databases · 6 live projects · delivered natively in French',
      title:'Construction Operations OS', loc:'Labinno · Geneva',
      d:'Projects, tasks, meeting minutes, clients, partners, team roles and documents in one place, with separate views for the team, the client and outside partners. Every project runs from tender submission to handover.' },
    { slug:'bourbon-holdings', short:'Bourbon Holdings', url:'bourbonholdings.notion.site',
      metric:'629 heir records migrated · 6 automations across 5 platforms',
      title:'Deal Flow & Automation OS', loc:'Bourbon Holdings · Los Angeles',
      d:'A new lead becomes a deal with the contact matched automatically. Every deal gets its own Drive folder and a generated property summary doc. AI parses the MLS report into it. Calls log themselves. Refund windows are watched daily.' },
    { slug:'fryaway', short:'FryAway', url:'clarityopsio.notion.site',
      metric:'4 reporting surfaces collapsed into 1 daily page · ROAS computed automatically',
      title:'Marketing Performance OS', loc:'FryAway · DTC',
      d:'Six databases on a shared date axis, so paid, owned and organic finally line up. One snapshot each morning: revenue by channel, ad spend by platform, ROAS calculated, and a rolling 30-day trend.' },
    { slug:'mae-media', short:'MAE Media', url:'maemedia.notion.site',
      metric:'10+ automations across 8 platforms · 1 weekly scorecard',
      title:'Agency Operations & Automation OS', loc:'MAE Media · Media & marketing',
      d:'Seven databases spanning clients, projects, campaigns, invoices, tasks and team, plus a weekly scorecard layer. Drive folders on project creation. Daily Meta Ads sync across two ad accounts. QuickBooks feeding a live scorecard.' },
  ];

  // build layers + chapters
  CH.forEach((c, i) => {
    const img = document.createElement('img');
    img.src = `assets/images/case-studies/${c.slug}/hero.png`;
    img.alt = `${c.title} — ${c.loc}`;
    img.loading = i === 0 ? 'eager' : 'lazy';
    img.decoding = 'async';
    screens.appendChild(img);

    const ch = document.createElement('div');
    ch.className = 'bench__ch';
    ch.innerHTML = `<div class="bench__kicker"></div>
      <h3 class="bench__t"></h3><div class="bench__loc"></div><p class="bench__d"></p>`;
    ch.querySelector('.bench__kicker').textContent = c.metric;
    ch.querySelector('.bench__t').textContent = c.title;
    ch.querySelector('.bench__loc').textContent = c.loc;
    ch.querySelector('.bench__d').textContent = c.d;
    copy.appendChild(ch);
  });

  const imgs = [...screens.children];
  const chs  = [...copy.children];
  const roLabel = document.getElementById('roLabel');
  const roBar   = document.getElementById('roBar');
  const roCt    = document.getElementById('roCt');
  const devUrl  = document.getElementById('devUrl');

  // runway: one viewport of dwell per chapter, plus one to enter
  wrap.style.minHeight = (CH.length + 1) * 100 + 'svh';

  let cur = -1, ticking = false;
  function apply() {
    const r = wrap.getBoundingClientRect();
    const span = Math.max(1, wrap.offsetHeight - innerHeight);
    const p = Math.min(1, Math.max(0, -r.top / span));
    const active = r.top <= 0 && r.bottom >= innerHeight;

    ro.classList.toggle('on', active);
    roBar.style.width = (p * 100).toFixed(1) + '%';
    roCt.textContent = String(Math.round(p * 100)).padStart(3, '0');

    const i = Math.min(CH.length - 1, Math.floor(p * CH.length));
    if (i !== cur) {
      cur = i;
      imgs.forEach((el, n) => el.classList.toggle('on', n === i));
      chs.forEach((el, n) => el.classList.toggle('on', n === i));
      roLabel.textContent = CH[i].short;
      devUrl.textContent = CH[i].url;
      if (active) document.title = `ClarityOps | ${CH[i].short}`;
    }
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(apply); } }, { passive: true });
  addEventListener('resize', apply);
  apply();
})();
