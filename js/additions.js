/* ===================================================================
   CRM Flow Lab — additions.js
   Multi-page rebuild: slider, FAQ, spotlight, back-to-top, reveals
   Loaded AFTER main.js on every page.
   =================================================================== */
(function () {
  'use strict';

  // ── Extra scroll reveals ──────────────────────────────────────────
  var revealIO = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        revealIO.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal-left, .reveal-right, .reveal-scale, [data-stagger]')
    .forEach(function (el) { revealIO.observe(el); });

  // ── Spotlight cards: track mouse ──────────────────────────────────
  document.querySelectorAll('.spotlight').forEach(function (card) {
    card.addEventListener('pointermove', function (ev) {
      var r = card.getBoundingClientRect();
      card.style.setProperty('--mx', (ev.clientX - r.left) + 'px');
      card.style.setProperty('--my', (ev.clientY - r.top) + 'px');
    });
  });

  // ── Testimonial slider ────────────────────────────────────────────
  document.querySelectorAll('.tslider').forEach(function (slider) {
    var track  = slider.querySelector('.tslider-track');
    var slides = slider.querySelectorAll('.tslide');
    var dotsWrap = slider.parentElement.querySelector('.tslider-dots');
    var prev = slider.parentElement.querySelector('.tarrow-prev');
    var next = slider.parentElement.querySelector('.tarrow-next');
    if (!track || !slides.length) return;

    var idx = 0, timer = null;

    if (dotsWrap) {
      slides.forEach(function (_, i) {
        var d = document.createElement('button');
        d.className = 'tdot' + (i === 0 ? ' active' : '');
        d.setAttribute('aria-label', 'Go to testimonial ' + (i + 1));
        d.addEventListener('click', function () { go(i); restart(); });
        dotsWrap.appendChild(d);
      });
    }
    var dots = dotsWrap ? dotsWrap.querySelectorAll('.tdot') : [];

    function go(i) {
      idx = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (idx * 100) + '%)';
      dots.forEach(function (d, j) { d.classList.toggle('active', j === idx); });
    }
    function restart() {
      if (timer) clearInterval(timer);
      timer = setInterval(function () { go(idx + 1); }, 6000);
    }
    if (prev) prev.addEventListener('click', function () { go(idx - 1); restart(); });
    if (next) next.addEventListener('click', function () { go(idx + 1); restart(); });
    slider.addEventListener('pointerenter', function () { if (timer) clearInterval(timer); });
    slider.addEventListener('pointerleave', restart);

    // swipe support
    var startX = 0;
    slider.addEventListener('touchstart', function (e) { startX = e.touches[0].clientX; }, { passive: true });
    slider.addEventListener('touchend', function (e) {
      var dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) { go(idx + (dx < 0 ? 1 : -1)); restart(); }
    }, { passive: true });

    restart();
  });

  // ── FAQ accordion ─────────────────────────────────────────────────
  document.querySelectorAll('.faq-item').forEach(function (item) {
    var q = item.querySelector('.faq-q');
    var a = item.querySelector('.faq-a');
    if (!q || !a) return;
    q.addEventListener('click', function () {
      var isOpen = item.classList.contains('open');
      // close siblings
      item.parentElement.querySelectorAll('.faq-item.open').forEach(function (sib) {
        sib.classList.remove('open');
        sib.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!isOpen) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });

  // ── Back to top ───────────────────────────────────────────────────
  var toTop = document.getElementById('toTop');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.classList.toggle('show', window.scrollY > 700);
    }, { passive: true });
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Active nav link from current page ─────────────────────────────
  var page = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.nav-link').forEach(function (link) {
    var href = (link.getAttribute('href') || '').toLowerCase();
    if (!href || href.charAt(0) === '#') return;
    var file = href.split('/').pop().split('#')[0];
    if (file === page || (page === '' && file === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ── Subtle magnetic pull on primary CTAs (desktop only) ──────────
  if (window.matchMedia('(pointer: fine)').matches) {
    document.querySelectorAll('.btn-primary.btn-lg').forEach(function (btn) {
      btn.addEventListener('pointermove', function (ev) {
        var r = btn.getBoundingClientRect();
        var x = (ev.clientX - r.left - r.width / 2) / r.width;
        var y = (ev.clientY - r.top - r.height / 2) / r.height;
        btn.style.transform = 'translate(' + (x * 6) + 'px,' + (y * 6 - 2) + 'px)';
      });
      btn.addEventListener('pointerleave', function () { btn.style.transform = ''; });
    });
  }
})();

/* ── Videos: play only when scrolled into view (nothing downloads on page load) ── */
(function () {
  var vids = document.querySelectorAll('video[data-autoplay]');
  if (!vids.length) return;
  if (!('IntersectionObserver' in window)) {
    vids.forEach(function (v) { v.preload = 'metadata'; v.play().catch(function () {}); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      var v = e.target;
      if (e.isIntersecting) { v.preload = 'auto'; v.play().catch(function () {}); }
      else if (!v.paused) { v.pause(); }
    });
  }, { rootMargin: '200px 0px', threshold: 0.25 });
  vids.forEach(function (v) { io.observe(v); });
})();
