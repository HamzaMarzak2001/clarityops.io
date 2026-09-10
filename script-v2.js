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
