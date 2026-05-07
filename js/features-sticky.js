/* ════════════════════════════════════════════════════════════════
   FEATURES TABS
   Desktop (> 1024px): sticky scroll-driven tab animation. As the
     user scrolls, the section pins to the top and tabs advance with
     a progress bar, fading between panels.
   Mobile (≤ 1024px): horizontal snap-scroll carousel. The sticky
     mechanism is disabled entirely — panels lay out side-by-side in
     a flex row, user swipes horizontally. Active tab highlight is
     driven by IntersectionObserver on the visible panel. Vertical
     page scroll is fully free.
════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var section    = document.querySelector('.features');
  if (!section) return;
  var tabBtns    = Array.from(section.querySelectorAll('.tab__btn'));
  var tabPanels  = Array.from(section.querySelectorAll('.tab__panel'));
  var panelsWrap = section.querySelector('.tabs__panels');
  if (!tabBtns.length || !panelsWrap) return;
  var STEPS = tabBtns.length;

  // Breakpoint: below this width we use the carousel instead of sticky.
  var MOBILE_BP = 1024;

  // Track which mode is currently active so we don't double-init on resize.
  var currentMode = null; // 'desktop' | 'mobile'

  // ─── MOBILE CAROUSEL ──────────────────────────────────────────
  // Turns .tabs__panels into a horizontal snap-scroll container.
  // Tab buttons scroll the active panel into view; active state is
  // determined by which panel is currently visible in the scroller.
  var mobileObserver = null;
  var mobileTabClickHandlers = [];

  function enableMobileCarousel() {
    if (currentMode === 'mobile') return;
    teardownDesktop();
    currentMode = 'mobile';

    section.classList.add('features--mobile');

    // Reset any inline styles the desktop mode may have set
    panelsWrap.style.cssText = '';
    tabPanels.forEach(function (p) {
      p.style.cssText = '';
    });

    // Scroll first panel into view on init
    setTimeout(function () {
      if (tabPanels[0]) {
        panelsWrap.scrollTo({ left: 0, behavior: 'instant' in window ? 'instant' : 'auto' });
        activateTabVisual(0);
      }
    }, 0);

    // Tab button click → scroll matching panel into view
    mobileTabClickHandlers = tabBtns.map(function (btn, idx) {
      var handler = function () {
        var panel = tabPanels[idx];
        if (!panel) return;
        // Smooth scroll the panel into the panels-wrap viewport
        var panelLeft = panel.offsetLeft;
        panelsWrap.scrollTo({ left: panelLeft, behavior: 'smooth' });
      };
      btn.addEventListener('click', handler);
      return handler;
    });

    // IntersectionObserver: when a panel becomes >50% visible in the
    // scroller, mark its matching tab as active.
    if ('IntersectionObserver' in window) {
      mobileObserver = new IntersectionObserver(function (entries) {
        // Pick the most visible panel
        var best = null;
        entries.forEach(function (entry) {
          if (!best || entry.intersectionRatio > best.intersectionRatio) {
            best = entry;
          }
        });
        if (best && best.intersectionRatio > 0.5) {
          var idx = tabPanels.indexOf(best.target);
          if (idx > -1) activateTabVisual(idx);
        }
      }, {
        root: panelsWrap,
        threshold: [0.25, 0.5, 0.75]
      });
      tabPanels.forEach(function (p) { mobileObserver.observe(p); });
    }
  }

  function teardownMobileCarousel() {
    if (currentMode !== 'mobile') return;
    section.classList.remove('features--mobile');
    if (mobileObserver) {
      mobileObserver.disconnect();
      mobileObserver = null;
    }
    tabBtns.forEach(function (btn, idx) {
      var handler = mobileTabClickHandlers[idx];
      if (handler) btn.removeEventListener('click', handler);
    });
    mobileTabClickHandlers = [];
    // Clear inline styles; desktop mode will set its own
    panelsWrap.style.cssText = '';
    tabPanels.forEach(function (p) { p.style.cssText = ''; });
  }

  // Helper used by both modes — just toggles the active class on tab buttons.
  function activateTabVisual(idx) {
    tabBtns.forEach(function (b, i) { b.classList.toggle('active', i === idx); });
  }

  // ─── DESKTOP STICKY SCROLL ───────────────────────────────────
  // (The original full sticky-scroll mechanism, isolated in a closure.)
  var desktopState = null;

  function enableDesktopSticky() {
    if (currentMode === 'desktop') return;
    teardownMobileCarousel();
    currentMode = 'desktop';

    // 1. LOCK HEIGHT
    function lockPanelHeight() {
      tabPanels.forEach(function (p) {
        p.style.position = 'relative'; p.style.opacity = '1';
        p.style.pointerEvents = 'auto'; p.style.transform = 'none';
        p.style.transition = 'none'; p.style.display = 'grid';
      });
      var maxH = 0;
      tabPanels.forEach(function (p) { if (p.offsetHeight > maxH) maxH = p.offsetHeight; });
      if (maxH < 100) maxH = 420;
      panelsWrap.style.position = 'relative';
      panelsWrap.style.height   = maxH + 'px';
      tabPanels.forEach(function (p, i) {
        p.style.position = 'absolute'; p.style.top = '0';
        p.style.left = '0'; p.style.right = '0'; p.style.display = 'grid';
        p.style.opacity       = i === 0 ? '1' : '0';
        p.style.transform     = i === 0 ? 'translateY(0)' : 'translateY(16px)';
        p.style.transition    = 'opacity 0.45s ease, transform 0.45s ease';
        p.style.pointerEvents = i === 0 ? 'auto' : 'none';
        p.style.zIndex        = i === 0 ? '2' : '1';
      });
    }
    lockPanelHeight();

    // 2. PROGRESS BAR
    var barWrap = document.createElement('div');
    barWrap.className = 'features-progress-bar';
    barWrap.style.cssText = 'position:fixed;bottom:0;left:0;right:0;width:100%;height:3px;background:rgba(255,255,255,0.07);overflow:hidden;z-index:9999;opacity:0;transition:opacity 0.3s ease;pointer-events:none;';
    var barFill = document.createElement('div');
    barFill.style.cssText = 'height:100%;width:0%;background:linear-gradient(90deg,#b71baf 0%,#ff5463 50%,#ff87ba 100%);box-shadow:0 0 8px rgba(255,135,186,0.7);will-change:width;';
    barWrap.appendChild(barFill);
    document.body.appendChild(barWrap);

    // 3. STICKY SCROLL WRAPPER
    var sectionHeader = section.querySelector('.section-header');
    var wrapper = document.createElement('div');
    wrapper.className = 'features-wrapper';
    wrapper.style.cssText = 'position:relative;height:' + (window.innerHeight * (STEPS + 1)) + 'px';
    section.parentNode.insertBefore(wrapper, section);
    if (sectionHeader) {
      sectionHeader.parentNode.removeChild(sectionHeader);
      sectionHeader.style.cssText = 'padding: var(--sec-pad-y) 32px 0; max-width: var(--max-w); margin: 0 auto; background: var(--clr-bg);';
      wrapper.parentNode.insertBefore(sectionHeader, wrapper);
    }
    wrapper.appendChild(section);
    section.style.cssText = 'position:sticky;top:0;height:100vh;display:flex;flex-direction:column;justify-content:center;';

    var currentTab = 0;

    // 4. ACTIVATE TAB
    function activateTab(idx, force) {
      if (idx === currentTab && !force) return;
      currentTab = idx;
      activateTabVisual(idx);
      tabPanels.forEach(function (p, i) {
        p.style.opacity       = i === idx ? '1' : '0';
        p.style.transform     = i === idx ? 'translateY(0)' : 'translateY(16px)';
        p.style.pointerEvents = i === idx ? 'auto' : 'none';
        p.style.zIndex        = i === idx ? '2' : '1';
      });
      barFill.style.transition = 'none';
      barFill.style.width = '0%';
      void barFill.offsetWidth;
    }

    var tabClickHandlers = tabBtns.map(function (btn, idx) {
      var handler = function () {
        var total = wrapper.offsetHeight - window.innerHeight;
        var slotSize = 1 / STEPS;
        var targetRaw = (idx + 0.5) * slotSize;
        var targetY   = wrapper.offsetTop + targetRaw * total;
        window.scrollTo({ top: targetY, behavior: 'smooth' });
      };
      btn.addEventListener('click', handler);
      return handler;
    });

    // 5. SCROLL HANDLER
    function onScroll() {
      var r       = wrapper.getBoundingClientRect();
      var total   = wrapper.offsetHeight - window.innerHeight;
      var raw     = Math.max(0, Math.min(1, -r.top / total));
      var inRange = r.top <= 0 && r.bottom >= window.innerHeight;
      barWrap.style.opacity = inRange ? '1' : '0';
      if (!inRange) return;
      var slotSize = 1 / STEPS;
      var tabIdx   = Math.min(Math.floor(raw / slotSize), STEPS - 1);
      var perTab   = Math.min((raw - tabIdx * slotSize) / slotSize, 1);
      activateTab(tabIdx);
      barFill.style.transition = 'width 0.05s linear';
      barFill.style.width = (perTab * 100).toFixed(1) + '%';
    }

    function onResize() {
      wrapper.style.height = (window.innerHeight * (STEPS + 1)) + 'px';
      lockPanelHeight();
    }

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);
    window.addEventListener('load', function () { lockPanelHeight(); activateTab(currentTab, true); });
    activateTab(0);
    onScroll();

    desktopState = {
      wrapper: wrapper,
      barWrap: barWrap,
      sectionHeader: sectionHeader,
      onScroll: onScroll,
      onResize: onResize,
      tabClickHandlers: tabClickHandlers
    };
  }

  function teardownDesktop() {
    if (currentMode !== 'desktop' || !desktopState) return;
    var s = desktopState;

    window.removeEventListener('scroll', s.onScroll);
    window.removeEventListener('resize', s.onResize);

    tabBtns.forEach(function (btn, idx) {
      var h = s.tabClickHandlers[idx];
      if (h) btn.removeEventListener('click', h);
    });

    // Unwrap: move section out of wrapper, put header back inline
    if (s.wrapper && s.wrapper.parentNode) {
      if (s.sectionHeader && section) {
        s.sectionHeader.style.cssText = '';
        section.insertBefore(s.sectionHeader, section.firstChild);
      }
      if (section) {
        section.style.cssText = '';
        s.wrapper.parentNode.insertBefore(section, s.wrapper);
      }
      s.wrapper.parentNode.removeChild(s.wrapper);
    }

    if (s.barWrap && s.barWrap.parentNode) s.barWrap.parentNode.removeChild(s.barWrap);

    desktopState = null;
  }

  // ─── MODE SWITCH ─────────────────────────────────────────────
  function selectMode() {
    if (window.innerWidth <= MOBILE_BP) {
      enableMobileCarousel();
    } else {
      enableDesktopSticky();
    }
  }

  selectMode();

  // Debounced resize handler — switches between modes if crossing breakpoint
  var resizeTimer;
  window.addEventListener('resize', function () {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(selectMode, 200);
  });
})();
