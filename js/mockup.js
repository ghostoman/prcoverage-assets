/**
 * mockup.js — Hero Dashboard Mockup
 *
 * 1. On load  : strong perspective tilt (rotateX 18deg) — cinematic approach
 * 2. On scroll: perspective smoothly straightens to 0deg
 * 3. Once flat: all charts animate — counters, donut arcs, bar fills
 */

(function () {
  'use strict';

  /* ─── Elements ─── */
  const screen = document.querySelector('.hero__screen--elevated');
  const glow   = document.querySelector('.hero__screen-glow');
  if (!screen) return;

  /* ─── Early exit: hero-anim mode — no tilt, just show ─── */
  if (screen.querySelector('.hero-anim')) {
    screen.style.opacity = '1';
    screen.style.transform = 'none';
    screen.style.width = '100%';
    screen.style.display = 'block';
    screen.style.minHeight = '430px';
    screen.style.willChange = 'auto';
    if (glow) glow.classList.add('visible');
    return;
  }

  /* ─── State ─── */
  let chartsAnimated = false;
  let firstScrollTouch = false;

  /* ══════════════════════════════════════════════════════════
     1. INITIAL TILT STATE — instant, no transition
  ══════════════════════════════════════════════════════════ */
  function applyInitialTilt() {
    screen.style.transform       = 'perspective(1200px) rotateX(18deg) scale(0.95)';
    screen.style.transformOrigin = 'center bottom';
    screen.style.opacity         = '0';          /* invisible until scroll */
    screen.style.boxShadow       = '0 70px 160px rgba(0,0,0,0.72), 0 0 0 1px rgba(255,135,186,0.30), 0 0 90px rgba(183,27,175,0.28)';
    screen.style.transition      = 'none';
    screen.style.willChange      = 'transform, opacity';
  }
  applyInitialTilt();

  /* ══════════════════════════════════════════════════════════
     2. SCROLL-DRIVEN PERSPECTIVE STRAIGHTEN
  ══════════════════════════════════════════════════════════ */
  function onScroll() {
    const rect  = screen.getBoundingClientRect();
    const VH    = window.innerHeight;

    // Progress: 0 = element bottom enters viewport, 1 = element center hits 45% VH
    const elCenter    = rect.top + rect.height / 2;
    const triggerStart = VH * 1.05;
    const triggerEnd   = VH * 0.42;

    const raw   = 1 - Math.max(0, Math.min(1, (elCenter - triggerEnd) / (triggerStart - triggerEnd)));
    // Ease-in-out quad
    const eased = raw < 0.5 ? 2 * raw * raw : 1 - Math.pow(-2 * raw + 2, 2) / 2;

    const rotX  = (18 * (1 - eased)).toFixed(2);
    const sc    = (0.95 + 0.05 * eased).toFixed(4);
    const shY   = Math.round(70  - 30  * eased);
    const shB   = Math.round(160 - 60  * eased);
    const shA   = (0.72 - 0.22 * eased).toFixed(2);
    const glA   = (0.28 - 0.08 * eased).toFixed(2);

    // opacity: fades in together with the perspective unfold
    // starts appearing at raw > 0.05, fully visible at raw ~0.55
    const opacity = Math.max(0, Math.min(1, (raw - 0.05) / 0.5)).toFixed(4);

    // Enable smooth transition after first scroll contact
    if (!firstScrollTouch && raw > 0.005) {
      firstScrollTouch = true;
      screen.style.transition = 'transform 0.06s linear, box-shadow 0.06s linear, opacity 0.06s linear';
    }

    screen.style.opacity   = opacity;

    // Reveal glow slightly after mockup starts appearing
    if (glow && parseFloat(opacity) > 0.15 && !glow.classList.contains('visible')) {
      glow.classList.add('visible');
    }

    screen.style.transform = `perspective(1200px) rotateX(${rotX}deg) scale(${sc})`;
    screen.style.boxShadow = `0 ${shY}px ${shB}px rgba(0,0,0,${shA}), 0 0 0 1px rgba(255,135,186,0.30), 0 0 ${Math.round(90 - 40 * eased)}px rgba(183,27,175,${glA})`;

    // Trigger chart animations only when fully visible (opacity = 1)
    if (parseFloat(opacity) >= 1 && !chartsAnimated) {
      chartsAnimated = true;
      setTimeout(() => {
        animateStatCounters();
        animateDonutArcs();
        animateBarFills();
      }, 80);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  setTimeout(onScroll, 120); // run once after layout

  /* ══════════════════════════════════════════════════════════
     3. STAT COUNTERS  21 / 6 / 164
  ══════════════════════════════════════════════════════════ */
  function animateStatCounters() {
    const els = document.querySelectorAll('.app-stat-value[data-count]');
    els.forEach((el, i) => {
      const target   = parseInt(el.dataset.count, 10);
      const duration = 1600;
      // Start from 0 — no visible jump since mockup was hidden until now
      el.textContent = '0';

      setTimeout(() => {
        const t0 = performance.now();
        (function tick(now) {
          const p    = Math.min((now - t0) / duration, 1);
          const ease = 1 - Math.pow(1 - p, 3);
          el.textContent = Math.round(target * ease);
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        })(performance.now());
      }, i * 120);
    });
  }

  /* ══════════════════════════════════════════════════════════
     4. DONUT ARCS — stroke-dasharray from 0 to target
  ══════════════════════════════════════════════════════════ */
  function animateDonutArcs() {
    const arcs = [
      { sel: '.donut-arc--blue',   da0: 133, da1: 43,  off: 0    },
      { sel: '.donut-arc--orange', da0: 43,  da1: 133, off: -133 },
      { sel: '.donut-arc--green',  da0: 88,  da1: 88,  off: 0    },
      { sel: '.donut-arc--red',    da0: 88,  da1: 88,  off: -88  },
    ];

    // Reset to 0
    arcs.forEach(({ sel, off }) => {
      const el = document.querySelector(sel);
      if (!el) return;
      el.style.transition       = 'none';
      el.style.strokeDasharray  = '0 176';
      el.style.strokeDashoffset = '0';
    });

    const duration = 1500;
    const t0       = performance.now();

    requestAnimationFrame(function tick(now) {
      const p    = Math.min((now - t0) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);

      arcs.forEach(({ sel, da0, da1, off }) => {
        const el = document.querySelector(sel);
        if (!el) return;
        const v0 = (da0 * ease).toFixed(1);
        const v1 = (176 - v0).toFixed(1);
        el.style.strokeDasharray  = `${v0} ${v1}`;
        el.style.strokeDashoffset = (off * ease).toFixed(1);
      });

      if (p < 1) requestAnimationFrame(tick);
    });
  }

  /* ══════════════════════════════════════════════════════════
     5. BAR FILLS — width 0 → --w (CSS custom property)
  ══════════════════════════════════════════════════════════ */
  function animateBarFills() {
    const bars = document.querySelectorAll('.app-bar-fill');
    bars.forEach((bar, i) => {
      const targetW = bar.style.getPropertyValue('--w') || getComputedStyle(bar).getPropertyValue('--w') || '70%';
      bar.style.transition = 'none';
      bar.style.width = '0%';

      setTimeout(() => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            bar.style.transition = 'width 1.3s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            bar.style.width = targetW;
          });
        });
      }, 60 + i * 90);
    });
  }

})();
