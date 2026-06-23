/* ===================================================================
   CRM Flow Lab — main.js
   Animations: scroll progress, typewriter, countup, ring fill,
   particle canvas, 3D tilt, connector draw, tool-strike
   =================================================================== */

// ── Scroll progress bar ──────────────────────────────────────────────
const progressBar = document.getElementById('scrollProgress');
window.addEventListener('scroll', () => {
  const total = document.body.scrollHeight - window.innerHeight;
  progressBar.style.width = ((window.scrollY / total) * 100) + '%';
}, { passive: true });

// ── Navbar scroll shadow ─────────────────────────────────────────────
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 80);
}, { passive: true });

// ── Mobile hamburger ─────────────────────────────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('active');
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('open');
  });
});

// ── Smooth scroll ────────────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const target = document.querySelector(anchor.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
  });
});

// ── Typewriter effect ────────────────────────────────────────────────
const typedEl = document.getElementById('heroTyped');
const phrases = [
  'Your Entire Business',
  'Lead Generation',
  'Client Onboarding',
  'Sales Follow-up',
  'Reputation Management',
];
let phraseIdx = 0, charIdx = 0, deleting = false;

function type() {
  const current = phrases[phraseIdx];
  if (!deleting) {
    typedEl.textContent = current.slice(0, ++charIdx);
    if (charIdx === current.length) {
      deleting = true;
      setTimeout(type, 2200);
      return;
    }
  } else {
    typedEl.textContent = current.slice(0, --charIdx);
    if (charIdx === 0) {
      deleting = false;
      phraseIdx = (phraseIdx + 1) % phrases.length;
    }
  }
  setTimeout(type, deleting ? 45 : 80);
}
type();

// ── Particle canvas ──────────────────────────────────────────────────
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles;

  function resize() {
    W = canvas.width  = canvas.offsetWidth;
    H = canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize, { passive: true });

  function makeParticle() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      a: Math.random() * 0.6 + 0.1,
    };
  }

  particles = Array.from({ length: 80 }, makeParticle);

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(192,96,20,${p.a})`;
      ctx.fill();
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0) p.x = W;
      if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H;
      if (p.y > H) p.y = 0;
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ── CountUp animation ────────────────────────────────────────────────
function animateCount(el) {
  const target = parseInt(el.dataset.target, 10);
  const prefix = el.dataset.prefix || '';
  const suffix = el.dataset.suffix || '';
  const duration = 1800;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // ease-out quad
    const eased = 1 - (1 - progress) * (1 - progress);
    const value = Math.floor(eased * target);
    el.textContent = prefix + value.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
}

// ── SVG Ring animation ───────────────────────────────────────────────
function animateRing(ring) {
  const pct = parseFloat(ring.dataset.pct) || 0;
  const circumference = 251.2; // 2πr = 2π×40
  ring.style.strokeDashoffset = circumference * (1 - pct / 100);

  // Inject gradient into the SVG
  const svg = ring.closest('svg');
  if (!svg.querySelector('defs')) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <linearGradient id="ringGrad${svg.dataset.id || Math.random().toString(36).slice(2)}" x1="0" y1="1" x2="1" y2="0">
        <stop offset="0%" stop-color="#C06014"/>
        <stop offset="100%" stop-color="#D9791F"/>
      </linearGradient>`;
    svg.appendChild(defs);
    const gradId = defs.querySelector('linearGradient').id;
    ring.style.stroke = `url(#${gradId})`;
  }
}

// ── IntersectionObserver — fade-up + countup + rings ────────────────
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el = entry.target;

    // Stagger siblings in a grid
    const siblings = Array.from(el.parentElement.children);
    const idx = siblings.indexOf(el);
    const delay = Math.min(idx * 90, 450);

    setTimeout(() => {
      el.classList.add('visible');

      // CountUp inside this element
      el.querySelectorAll('.count-up').forEach(animateCount);

      // Rings inside this element
      el.querySelectorAll('.ring-fill').forEach(animateRing);

      // Connector path draw
      el.querySelectorAll('.connector-path').forEach(p => p.classList.add('drawn'));
    }, delay);

    io.unobserve(el);
  });
}, { threshold: 0.12 });

document.querySelectorAll('.fade-up').forEach(el => io.observe(el));

// ── Tool-strike trigger (separate observer for the infographic) ───────
const toolsIO = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    toolsIO.unobserve(entry.target);
  });
}, { threshold: 0.2 });

document.querySelectorAll('.tools-infographic').forEach(el => toolsIO.observe(el));

// ── 3D Tilt on service cards ─────────────────────────────────────────
document.querySelectorAll('.tilt-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `perspective(800px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px) scale(1.01)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

// ── Hero stat counters (trigger as soon as hero loads) ───────────────
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.hero-stats .count-up').forEach(animateCount);
  }, 600);
});

// ── Contact form ─────────────────────────────────────────────────────
const form        = document.getElementById('contactForm');
const submitBtn   = document.getElementById('submitBtn');
const btnText     = submitBtn.querySelector('.btn-text');
const btnLoading  = submitBtn.querySelector('.btn-loading');
const formSuccess = document.getElementById('formSuccess');

form.addEventListener('submit', e => {
  e.preventDefault();
  const name     = document.getElementById('name').value.trim();
  const email    = document.getElementById('email').value.trim();
  const business = document.getElementById('business').value;
  const message  = document.getElementById('message').value.trim();

  if (!name || !email || !business || !message) { shakeForm(); return; }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    highlight(document.getElementById('email')); return;
  }

  btnText.style.display    = 'none';
  btnLoading.style.display = 'inline';
  submitBtn.disabled = true;

  const phone   = document.getElementById('phone').value.trim();
  const subject = encodeURIComponent(`New Inquiry from ${name} — CRM Flow Lab`);
  const body    = encodeURIComponent(`Name: ${name}\nEmail: ${email}\nPhone: ${phone || 'N/A'}\nBusiness Type: ${business}\n\nMessage:\n${message}`);

  setTimeout(() => {
    window.location.href = `mailto:info@crmflowlab.com?subject=${subject}&body=${body}`;
    setTimeout(() => {
      btnText.style.display    = 'inline';
      btnLoading.style.display = 'none';
      submitBtn.disabled = false;
      form.reset();
      formSuccess.style.display = 'flex';
      setTimeout(() => { formSuccess.style.display = 'none'; }, 6000);
    }, 1000);
  }, 600);
});

function highlight(field) {
  field.style.borderColor = '#FF4D6D';
  field.focus();
  setTimeout(() => { field.style.borderColor = ''; }, 2500);
}

function shakeForm() {
  const wrap = document.querySelector('.contact-form-wrap');
  wrap.style.animation = 'none';
  void wrap.offsetHeight;
  wrap.style.animation = 'shake 0.4s ease';
}

// Inject shake + other one-off keyframes
const extraStyles = document.createElement('style');
extraStyles.textContent = `
  @keyframes shake {
    0%,100% { transform: translateX(0); }
    20%      { transform: translateX(-6px); }
    40%      { transform: translateX(6px); }
    60%      { transform: translateX(-4px); }
    80%      { transform: translateX(4px); }
  }
`;
document.head.appendChild(extraStyles);
