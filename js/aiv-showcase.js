/* ═══════════════════════════════════════════════════════════════
   AI VISIBILITY SHOWCASE — Toggle + iframe auto-height + loop-scroll
═══════════════════════════════════════════════════════════════ */

(function() {
  'use strict';

  // Scroll speed: pixels per second of VISIBLE scroll (excluding pauses).
  // ~35 px/s ≈ slow, readable. Lower = slower. Raise for faster.
  var SCROLL_SPEED_PX_PER_SEC = 35;
  // Minimum and maximum animation durations (seconds). Clamps crazy values.
  var MIN_DURATION_S = 16;
  var MAX_DURATION_S = 60;

  // ─── 1. Toggle removed ─ all showcase iframes now run a single overview ─

  // ─── 2. Auto-size iframes + compute loop-scroll distance ─────
  // Strategy:
  //   - iframe.height = natural content height (so internal layout isn't clipped)
  //   - wrapper has fixed height from CSS (--frame-h)
  //   - JS computes scrollDistance = contentHeight - wrapHeight
  //   - Sets --scroll-distance + --scroll-duration on .aiv-frame-wrap
  //   - Adds .scrolling class to activate the CSS keyframes animation
  function setupScroll(iframe) {
    try {
      var doc = iframe.contentDocument || iframe.contentWindow.document;
      if (!doc || !doc.body) return;

      var contentHeight = doc.body.scrollHeight;
      if (contentHeight <= 0) return;

      // Set iframe to its natural content height
      iframe.style.height = contentHeight + 'px';

      var wrap = iframe.closest('.aiv-frame-wrap');
      if (!wrap) return;

      var wrapHeight = wrap.clientHeight;
      if (wrapHeight <= 0) return;

      var scrollDistance = contentHeight - wrapHeight;

      if (scrollDistance > 4) {
        // Content is taller than the wrap → enable loop scroll
        var durationS = scrollDistance / SCROLL_SPEED_PX_PER_SEC;
        // The animation spends ~76% of its time actually scrolling (the rest
        // is pauses at top/bottom). Compensate so perceived speed stays constant.
        durationS = durationS / 0.76;
        durationS = Math.max(MIN_DURATION_S, Math.min(MAX_DURATION_S, durationS));

        wrap.style.setProperty('--scroll-distance', '-' + scrollDistance + 'px');
        wrap.style.setProperty('--scroll-duration', durationS + 's');
        wrap.classList.add('scrolling');
      } else {
        // Content fits → no scroll animation needed
        wrap.classList.remove('scrolling');
        wrap.style.removeProperty('--scroll-distance');
        wrap.style.removeProperty('--scroll-duration');
      }
    } catch (e) {
      // Cross-origin iframe — should not happen for same-origin embed.
      // Silently skip and leave iframe in its default state.
    }
  }

  function setupAllScrolls() {
    document.querySelectorAll('.aiv-frame').forEach(setupScroll);
  }

  // Wire up each iframe: run setup on load + after font-load grace periods
  document.querySelectorAll('.aiv-frame').forEach(function(iframe) {
    iframe.addEventListener('load', function() {
      setupScroll(iframe);
      // Re-check after fonts/images load inside the iframe
      setTimeout(function() { setupScroll(iframe); }, 400);
      setTimeout(function() { setupScroll(iframe); }, 1200);
    });

    // Iframe may already be cached & loaded by the time this runs
    if (iframe.contentDocument && iframe.contentDocument.readyState === 'complete') {
      setupScroll(iframe);
    }
  });

  // Recompute on window resize (widths change → content reflows → heights change)
  var resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(setupAllScrolls, 200);
  });

  // Recompute when feature tabs switch (iframe may have been display:none → 0 size)
  document.querySelectorAll('.tab__btn').forEach(function(tabBtn) {
    tabBtn.addEventListener('click', function() {
      setTimeout(setupAllScrolls, 100);
      setTimeout(setupAllScrolls, 500);
    });
  });

  // ─── 3. Smooth scroll for jump button ────────────────────────
  document.querySelectorAll('.aiv-jump-btn').forEach(function(btn) {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      var target = document.querySelector(btn.getAttribute('href') || '#aiv-showcase');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // ─── 4. Pause animations while iframe is far off-screen (perf) ─
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        var wrap = entry.target;
        if (entry.isIntersecting) {
          wrap.style.animationPlayState = '';
          // Recompute when it becomes visible (in case it was hidden at load time)
          var iframe = wrap.querySelector('.aiv-frame');
          if (iframe && !wrap.classList.contains('scrolling')) {
            setupScroll(iframe);
          }
        }
      });
    }, { threshold: 0 });

    document.querySelectorAll('.aiv-frame-wrap').forEach(function(wrap) {
      io.observe(wrap);
    });
  }
})();
