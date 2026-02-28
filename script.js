/* ─── Preloader ──────────────────────────────────────────────── */
(function() {
  document.body.classList.add('is-loading');

  const preloader = document.getElementById('preloader');
  const bar = document.getElementById('preloaderBar');
  const counter = document.getElementById('preloaderCount');

  if (!preloader) return;

  let progress = 0;
  const target = 100;
  const duration = 2000; // 2 seconds total
  const startTime = performance.now();

  function easeOutQuart(t) {
    return 1 - Math.pow(1 - t, 4);
  }

  function updateLoader(now) {
    const elapsed = now - startTime;
    const rawProgress = Math.min(elapsed / duration, 1);
    const eased = easeOutQuart(rawProgress);
    progress = Math.floor(eased * target);

    bar.style.width = progress + '%';
    counter.textContent = progress;

    if (progress < target) {
      requestAnimationFrame(updateLoader);
    } else {
      // Loading complete — dismiss preloader
      setTimeout(() => {
        preloader.classList.add('done');
        document.body.classList.remove('is-loading');

        // Restart hero animations by re-triggering them
        document.querySelectorAll('.hero-anim, .hero__visual, .float-badge--1, .float-badge--2, .float-badge--3').forEach(el => {
          el.style.animationPlayState = 'running';
        });
        document.querySelectorAll('.dc__row').forEach(el => {
          el.style.animationPlayState = 'running';
        });

        // Remove preloader from DOM after transition
        setTimeout(() => {
          preloader.remove();
        }, 1200);
      }, 400);
    }
  }

  requestAnimationFrame(updateLoader);
})();

/* ─── Navigation scroll effect ───────────────────────────────── */
const nav = document.getElementById('nav');

window.addEventListener('scroll', () => {
  if (window.scrollY > 40) {
    nav.classList.add('scrolled');
  } else {
    nav.classList.remove('scrolled');
  }
}, { passive: true });

/* ─── Mobile menu toggle ──────────────────────────────────────── */
const burger = document.getElementById('burger');
const mobileMenu = document.getElementById('mobileMenu');

burger.addEventListener('click', () => {
  const isOpen = mobileMenu.classList.toggle('open');
  burger.setAttribute('aria-expanded', isOpen);
});

// Close mobile menu on link click
document.querySelectorAll('.mobile-link').forEach(link => {
  link.addEventListener('click', () => {
    mobileMenu.classList.remove('open');
  });
});

/* ─── Scroll animations ───────────────────────────────────────── */
const animateObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const delay = entry.target.dataset.delay || 0;
      setTimeout(() => {
        entry.target.classList.add('animated');
      }, parseInt(delay));
      animateObserver.unobserve(entry.target);
    }
  });
}, {
  threshold: 0.1,
  rootMargin: '0px 0px -60px 0px'
});

document.querySelectorAll('[data-animate]').forEach(el => {
  animateObserver.observe(el);
});

/* ─── Lenis smooth scroll ────────────────────────────────────── */
const lenis = new Lenis({
  duration: 1.2,
  easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  smoothWheel: true,
  touchMultiplier: 1.5
});

function raf(time) {
  lenis.raf(time);
  requestAnimationFrame(raf);
}
requestAnimationFrame(raf);

/* ─── Smooth scroll for anchor links (via Lenis) ────────────── */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', (e) => {
    const href = anchor.getAttribute('href');
    if (href === '#') return;
    const target = document.querySelector(href);
    if (target) {
      e.preventDefault();
      const navH = nav.offsetHeight;
      lenis.scrollTo(target, { offset: -navH - 16 });
    }
  });
});

/* ─── Dashboard card live counter ────────────────────────────── */
// Adds a subtle "live" feel to the dashboard card
let counter = 4;
setInterval(() => {
  const el = document.querySelector('.dc__footer span');
  if (!el) return;
  // just blink the status to show it's live
}, 3000);

/* ─── Number counter animation ───────────────────────────────── */
function animateValue(el, start, end, duration, suffix = '') {
  let startTime = null;

  function step(timestamp) {
    if (!startTime) startTime = timestamp;
    const progress = Math.min((timestamp - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * (end - start) + start) + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

// Animate stat cards when they come into view
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const numEl = entry.target.querySelector('.stat-card__num');
      if (!numEl) return;
      const text = numEl.textContent.trim();
      const suffix = text.replace(/[0-9]/g, '');
      const num = parseInt(text);
      if (!isNaN(num)) {
        animateValue(numEl, 0, num, 1500, suffix);
      }
      statObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('.stat-card').forEach(card => {
  statObserver.observe(card);
});

/* ─── Tool stack connector line animation ───────────────────── */
const connectors = document.querySelector('.tool-stack__connectors');
if (connectors) {
  const connectorObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        connectorObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  connectorObserver.observe(connectors);
}

/* ─── Service card mouse-tracking glow ──────────────────────── */
document.querySelectorAll('.service-card').forEach(card => {
  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    card.style.setProperty('--mouse-x', x + '%');
    card.style.setProperty('--mouse-y', y + '%');
  });
});

/* ─── Scroll effects: darkening + parallax ──────────────────── */
const scrollDarken = document.getElementById('scrollDarken');
let ticking = false;
window.addEventListener('scroll', () => {
  if (!ticking) {
    requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPercent = Math.min(scrollY / docHeight, 1);

      // Progressive darkening: 0 at top → 0.4 at bottom (reduced for better visibility)
      if (scrollDarken) {
        scrollDarken.style.opacity = scrollPercent * 0.4;
      }

      // Subtle parallax on section tags
      document.querySelectorAll('.section__tag').forEach(tag => {
        const rect = tag.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          const offset = (rect.top / window.innerHeight) * 10;
          tag.style.transform = 'translateY(' + offset + 'px)';
        }
      });
      ticking = false;
    });
    ticking = true;
  }
}, { passive: true });

/* Dashboard scroll listener removed — using CSS animation only */

/* ─── Interactive Stars Background ────────────────────────── */
(function() {
  const canvas = document.getElementById('starsCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h;
  let starMouseX = 0, starMouseY = 0;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
    // Rebase stars to new dimensions
    stars.forEach(s => {
      s.baseX = ((s.baseX % w) + w) % w;
      s.baseY = ((s.baseY % h) + h) % h;
    });
  }

  // Create stars
  const STAR_COUNT = 140;
  const stars = [];
  for (let i = 0; i < STAR_COUNT; i++) {
    // Each star gets its own drift direction and speed
    const angle = Math.random() * Math.PI * 2;
    const speed = Math.random() * 0.15 + 0.05; // slow, gentle drift
    stars.push({
      x: 0,
      y: 0,
      baseX: Math.random() * (window.innerWidth || 1920),
      baseY: Math.random() * (window.innerHeight || 1080),
      size: Math.random() * 1.8 + 0.3,
      alpha: Math.random() * 0.5 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinkleOffset: Math.random() * Math.PI * 2,
      // Cursor parallax strength
      parallaxFactor: Math.random() * 0.3 + 0.05,
      // Constant drift velocity
      driftVX: Math.cos(angle) * speed,
      driftVY: Math.sin(angle) * speed
    });
  }

  w = canvas.width = window.innerWidth;
  h = canvas.height = window.innerHeight;
  window.addEventListener('resize', resize);

  document.addEventListener('mousemove', (e) => {
    starMouseX = (e.clientX / w - 0.5) * 2; // -1 to 1
    starMouseY = (e.clientY / h - 0.5) * 2; // -1 to 1
  });

  let frame = 0;
  function drawStars() {
    ctx.clearRect(0, 0, w, h);
    frame++;

    for (let i = 0; i < stars.length; i++) {
      const s = stars[i];

      // Constant drift — update base position each frame
      s.baseX += s.driftVX;
      s.baseY += s.driftVY;

      // Wrap base position around screen
      if (s.baseX < 0) s.baseX += w;
      if (s.baseX > w) s.baseX -= w;
      if (s.baseY < 0) s.baseY += h;
      if (s.baseY > h) s.baseY -= h;

      // Cursor parallax offset layered on top of drift
      const offsetX = starMouseX * s.parallaxFactor * 40;
      const offsetY = starMouseY * s.parallaxFactor * 40;

      s.x = s.baseX + offsetX;
      s.y = s.baseY + offsetY;

      // Wrap final position
      if (s.x < 0) s.x += w;
      if (s.x > w) s.x -= w;
      if (s.y < 0) s.y += h;
      if (s.y > h) s.y -= h;

      // Twinkle
      const twinkle = Math.sin(frame * s.twinkleSpeed + s.twinkleOffset) * 0.5 + 0.5;
      const alpha = s.alpha * (0.4 + twinkle * 0.6);

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, ' + alpha + ')';
      ctx.fill();

      // Glow for larger stars
      if (s.size > 1.2) {
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * 3, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(252, 255, 2, ' + (alpha * 0.08) + ')';
        ctx.fill();
      }
    }

    requestAnimationFrame(drawStars);
  }
  drawStars();
})();

/* ─── Cursor glow follower ───────────────────────────────────── */
const glow = document.createElement('div');
glow.className = 'cursor-glow';
document.body.appendChild(glow);

let mouseX = -100, mouseY = -100;
let glowX = -100, glowY = -100;

document.addEventListener('mousemove', (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

function updateGlow() {
  glowX += (mouseX - glowX) * 0.12;
  glowY += (mouseY - glowY) * 0.12;
  glow.style.transform = 'translate(' + (glowX - 150) + 'px, ' + (glowY - 150) + 'px)';
  requestAnimationFrame(updateGlow);
}
updateGlow();
