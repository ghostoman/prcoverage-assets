/**
 * PRcoverage.ai — Main JavaScript
 * Modules: Nav scroll | Typewriter | Tabs | FAQ | Scroll reveal | Counters | Scrollytelling
 */

document.addEventListener('DOMContentLoaded', () => {
  initNav();
  initMobileMenu();
  initDropdowns();
  // initTypewriter();       // moved to gsap-animations.js
  initTabs();
  initFAQ();
  // initScrollReveal();     // moved to gsap-animations.js
  // initCounters();         // moved to gsap-animations.js
  // initAIVMockup();    // moved to gsap-animations.js
  // initReportsMockup(); // moved to gsap-animations.js
  // initSoMMockup();     // moved to gsap-animations.js
  // initAgentMockup();   // moved to gsap-animations.js
  initSmoothScroll();
  // initHeroWidgets();      // moved to gsap-animations.js
  // initHeroAnim();         // moved to gsap-animations.js
});

/* ── 0a. HERO WIDGETS ────────────────────────────────────── */
function initHeroWidgets() {
  const wLeft  = document.getElementById('heroWidgetLeft');
  const wRight = document.getElementById('heroWidgetRight');
  if (!wLeft || !wRight) return;

  setTimeout(() => {
    wLeft.classList.add('visible');
    wRight.classList.add('visible');
  }, 600);

  /* LEFT: typewriter AI answer */
  const hwText    = document.getElementById('hwText');
  const hwSources = document.getElementById('hwSources');
  const hwBadge   = wLeft.querySelector('.hw-badge');
  const hwChips   = wLeft.querySelectorAll('.hw-chip');
  const answer = 'PRcoverage.ai stands out for tracking earned media\'s impact in ChatGPT, Gemini and Claude — cited by top journalists and analysts.';

  function typeAnswer(cb) {
    hwText.textContent = '';
    let i = 0;
    const iv = setInterval(() => {
      hwText.textContent = answer.slice(0, i++);
      if (i > answer.length) { clearInterval(iv); cb && cb(); }
    }, 30);
  }

  function showSources() {
    hwSources.classList.add('visible');
    hwChips.forEach((c, i) => setTimeout(() => c.classList.add('visible'), i * 150));
    setTimeout(() => hwBadge && hwBadge.classList.add('visible'), 500);
  }

  function runLeftLoop() {
    hwText.textContent = '';
    hwSources.classList.remove('visible');
    hwBadge && hwBadge.classList.remove('visible');
    hwChips.forEach(c => c.classList.remove('visible'));
    setTimeout(() => typeAnswer(() => setTimeout(() => {
      showSources();
      setTimeout(runLeftLoop, 6000);
    }, 400)), 600);
  }

  /* RIGHT: bars + rotating alert */
  const modelFills = wRight.querySelectorAll('.hw-model-fill');
  const modelPcts  = ['hwGPTPct','hwGemPct','hwClaPct'].map(id => document.getElementById(id));
  const targets    = [78, 62, 54];
  const hwAlert    = document.getElementById('hwAlert');
  const outlets    = ['Forbes', 'TechCrunch', 'Wired', 'Bloomberg', 'Reuters'];
  let alertIdx = 0;

  modelFills.forEach((fill, i) => {
    setTimeout(() => {
      fill.style.width = targets[i] + '%';
      let n = 0;
      const iv = setInterval(() => {
        n = Math.min(n + 1, targets[i]);
        if (modelPcts[i]) modelPcts[i].textContent = n + '%';
        if (n >= targets[i]) clearInterval(iv);
      }, Math.round(3000 / targets[i]));
    }, i * 250 + 1200);
  });

  setTimeout(() => hwAlert.classList.add('visible'), 2500);
  setInterval(() => {
    hwAlert.classList.remove('visible');
    setTimeout(() => {
      alertIdx = (alertIdx + 1) % outlets.length;
      const strong = hwAlert.querySelector('strong');
      if (strong) strong.textContent = outlets[alertIdx];
      hwAlert.classList.add('visible');
    }, 400);
  }, 3500);

  setTimeout(runLeftLoop, 1000);
}

/* ── 0b. HERO ANIMATION ─────────────────────────────────── */
function initHeroAnim() {
  const anim   = document.getElementById('heroAnim');
  if (!anim) return;

  const phase1 = document.getElementById('haPhase1');
  const phase2 = document.getElementById('haPhase2');
  const phase3 = document.getElementById('haPhase3');
  const links  = Array.from(anim.querySelectorAll('.ha-link'));
  const rows   = [0,1,2].map(i => document.getElementById('haRow' + i));
  const cursor = document.getElementById('haCursor');
  const panel  = document.getElementById('haPromptPanel');
  const pText  = document.getElementById('haPromptText');

  const prompts = [
    '“What are the best tools for PR measurement in 2025?”',
    '“How do PR teams track earned media ROI?”',
    '“What metrics should PR professionals report to clients?”'
  ];

  // — Helper: transition between phases —
  function goPhase(show, hide) {
    if (hide) {
      hide.classList.remove('ha-active');
      hide.classList.add('ha-exit');
      setTimeout(() => hide.classList.remove('ha-exit'), 600);
    }
    setTimeout(() => show.classList.add('ha-active'), 80);
  }

  // — Cursor swoops to a row, triggers click highlight + prompt —
  function moveCursor(rowEl, cb) {
    if (!cursor || !rowEl) { cb && setTimeout(cb, 100); return; }
    const rr = rowEl.getBoundingClientRect();
    cursor.style.opacity = '1';
    cursor.style.top    = (rr.top  + rr.height / 2 - 10) + 'px';
    cursor.style.left   = (rr.left + 48) + 'px';
    setTimeout(cb, 700);
  }

  function clickRows(idx, done) {
    if (idx >= 3) { setTimeout(done, 1000); return; }
    moveCursor(rows[idx], () => {
      if (rows[idx]) rows[idx].classList.add('ha-row--active');
      if (pText) pText.textContent = prompts[idx];
      if (panel) panel.classList.add('ha-panel--visible');
      setTimeout(() => {
        if (rows[idx]) rows[idx].classList.remove('ha-row--active');
        if (panel) panel.classList.remove('ha-panel--visible');
        setTimeout(() => clickRows(idx + 1, done), 200);
      }, 1800);
    });
  }

  // — Main loop —
  function runLoop() {
    // Reset all
    [phase1, phase2, phase3].forEach(p => {
      p.classList.remove('ha-active', 'ha-exit');
    });
    links.forEach(l => l.classList.remove('ha-link--in'));
    rows.forEach(r => r && r.classList.remove('ha-row--active'));
    if (panel) panel.classList.remove('ha-panel--visible');
    if (cursor) cursor.style.opacity = '0';

    // Phase 1: links pop in
    phase1.classList.add('ha-active');
    links.forEach((l, i) => setTimeout(() => l.classList.add('ha-link--in'), 400 + i * 300));

    const afterLinks = 400 + links.length * 300 + 1600;

    // Phase 2: question
    setTimeout(() => goPhase(phase2, phase1), afterLinks);

    // Phase 3: table + cursor
    setTimeout(() => {
      goPhase(phase3, phase2);
      setTimeout(() => clickRows(0, () => {
        if (cursor) cursor.style.opacity = '0';
        setTimeout(() => {
          goPhase(phase1, phase3);
          setTimeout(runLoop, 800);
        }, 1200);
      }), 600);
    }, afterLinks + 2800);
  }

  // Fix mockup.js opacity conflict — if hero-anim present, show immediately
  const screen = anim.closest('.hero__screen--elevated');
  if (screen) {
    screen.style.opacity = '1';
    const glow = document.querySelector('.hero__screen-glow');
    if (glow) glow.classList.add('visible');
  }

  setTimeout(runLoop, 800);
}

/* ── 0. SMOOTH SCROLL ────────────────────────────────────── */
function initSmoothScroll() {
  const NAV_H = 72;

  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const id = this.getAttribute('href').slice(1);
      if (!id) return;
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - NAV_H;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    });
  });
}

/* ── 1. NAV SCROLL ────────────────────────────────────────── */
function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  const onScroll = () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
}

/* ── 1b. MOBILE MENU (hamburger drawer) ───────────────────── */
/* Full-screen drawer that opens when the hamburger is tapped on mobile.
   On init we clone .nav__actions (Login + Start Free Trial) into .nav__links
   so the CTAs appear INSIDE the drawer, not in the header. The original
   .nav__actions stays in the header (hidden on mobile via CSS). */
function initMobileMenu() {
  const nav       = document.querySelector('.nav');
  const hamburger = document.querySelector('.nav__hamburger');
  const links     = document.querySelector('.nav__links');
  const actions   = document.querySelector('.nav__actions');
  if (!nav || !hamburger || !links) return;

  // Clone CTA block into the drawer once on init
  if (actions && !links.querySelector('.nav__actions--mobile')) {
    const clone = actions.cloneNode(true);
    clone.classList.add('nav__actions--mobile');
    links.appendChild(clone);
  }

  function open() {
    nav.classList.add('nav--mobile-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function close() {
    nav.classList.remove('nav--mobile-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }
  function toggle() {
    nav.classList.contains('nav--mobile-open') ? close() : open();
  }

  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-controls', 'nav-mobile-drawer');
  hamburger.addEventListener('click', function(e) {
    e.stopPropagation();
    toggle();
  });

  // Close when a nav link or CTA is tapped (navigating somewhere)
  links.addEventListener('click', function(e) {
    const link = e.target.closest('a, .nav__dropdown-item');
    if (link) close();
  });

  // Close on Escape
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && nav.classList.contains('nav--mobile-open')) close();
  });

  // Close if the viewport grows back to desktop
  let resizeTimer;
  window.addEventListener('resize', function() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function() {
      if (window.innerWidth > 1024 && nav.classList.contains('nav--mobile-open')) {
        close();
      }
    }, 150);
  });
}

/* ── 2. NAV DROPDOWNS ──────────────────────────────────────── */
function initDropdowns() {
  const items = document.querySelectorAll('.nav__item--dropdown');
  if (!items.length) return;

  // Each item gets its own close timer so moving between
  // the trigger button and the panel doesn't close it
  const timers = new Map();

  function openItem(item) {
    // Cancel any pending close for this item
    clearTimeout(timers.get(item));
    // Close all OTHER items immediately
    items.forEach(other => {
      if (other !== item) closeItem(other, true);
    });
    item.classList.add('open');
    const btn = item.querySelector('.nav__link--btn');
    if (btn) btn.setAttribute('aria-expanded', 'true');
  }

  function closeItem(item, immediate = false) {
    clearTimeout(timers.get(item));
    if (immediate) {
      _doClose(item);
    } else {
      // 120ms grace period — enough to move cursor into the panel
      timers.set(item, setTimeout(() => _doClose(item), 120));
    }
  }

  function _doClose(item) {
    item.classList.remove('open');
    const btn = item.querySelector('.nav__link--btn');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  function closeAll(immediate = false) {
    items.forEach(item => closeItem(item, immediate));
  }

  items.forEach(item => {
    const btn = item.querySelector('.nav__link--btn');
    if (!btn) return;

    // Click toggle (for touch / keyboard users)
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (item.classList.contains('open')) {
        closeItem(item, true);
      } else {
        openItem(item);
      }
    });

    // Hover: open on enter, delayed close on leave
    item.addEventListener('mouseenter', () => openItem(item));
    item.addEventListener('mouseleave', () => closeItem(item));
  });

  // Click outside — close immediately
  document.addEventListener('click', () => closeAll(true));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeAll(true); });
}

/* ── 2. TYPEWRITER ──────────────────────────────────────────── */
function initTypewriter() {
  // Только часть после "Built for" анимируется — сама фраза статична
  const el = document.getElementById('typewriterTarget');
  if (!el) return;

  const suffixes = [
    'solo PR pros.',
    'boutique agencies.',
    'in-house comms teams.',
  ];

  let phraseIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let pauseTimer = null;

  const TYPING_SPEED  = 55;
  const DELETE_SPEED  = 30;
  const PAUSE_AFTER   = 2200;
  const PAUSE_BEFORE  = 400;

  function tick() {
    const current = suffixes[phraseIndex];

    if (isDeleting) {
      charIndex--;
      el.textContent = current.slice(0, charIndex);

      if (charIndex === 0) {
        isDeleting = false;
        phraseIndex = (phraseIndex + 1) % suffixes.length;
        pauseTimer = setTimeout(tick, PAUSE_BEFORE);
        return;
      }
      pauseTimer = setTimeout(tick, DELETE_SPEED);
    } else {
      charIndex++;
      el.textContent = current.slice(0, charIndex);

      if (charIndex === current.length) {
        isDeleting = true;
        pauseTimer = setTimeout(tick, PAUSE_AFTER);
        return;
      }
      pauseTimer = setTimeout(tick, TYPING_SPEED);
    }
  }

  setTimeout(tick, 800);
}

/* ── 3. FEATURE TABS ──────────────────────────────────────── */
// Полностью управляется features-sticky.js через скролл.
// Оставляем пустые функции чтобы DOMContentLoaded не выдавал ошибку.
function initTabs() {}

function animateReportBars() {
  const bars = document.querySelectorAll('.report-bar-fill');
  bars.forEach(bar => {
    const target = bar.dataset.width || '70%';
    bar.style.width = '0%';
    requestAnimationFrame(() => {
      setTimeout(() => { bar.style.width = target; }, 60);
    });
  });
}

/* ── 4. FAQ ACCORDION ─────────────────────────────────────── */
function initFAQ() {
  const items = document.querySelectorAll('.faq__item');

  items.forEach(item => {
    const question = item.querySelector('.faq__question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      // Close all
      items.forEach(i => i.classList.remove('open'));

      // Toggle clicked
      if (!isOpen) item.classList.add('open');
    });
  });
}

/* ── 5. SCROLL REVEAL ─────────────────────────────────────── */
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  elements.forEach(el => observer.observe(el));
}

/* ── TESTIMONIAL BUBBLE TRIGGER ───────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const threads = document.querySelectorAll('.testi-thread');
  if (!threads.length) return;

  const obs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.25 });

  threads.forEach(t => obs.observe(t));
});

/* ── 6. ANIMATED COUNTERS ─────────────────────────────────── */
function initCounters() {
  const counters = document.querySelectorAll('[data-count]');
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
}

function animateCounter(el) {
  const target  = parseFloat(el.dataset.count);
  const suffix  = el.dataset.suffix || '';
  const prefix  = el.dataset.prefix || '';
  const decimal = el.dataset.decimal ? parseInt(el.dataset.decimal) : 0;
  const duration = 1800;
  const start   = performance.now();

  function update(now) {
    const elapsed  = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease out cubic
    const ease = 1 - Math.pow(1 - progress, 3);
    const value = target * ease;

    el.textContent = prefix + value.toFixed(decimal) + suffix;

    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = prefix + target.toFixed(decimal) + suffix;
  }

  requestAnimationFrame(update);
}

/* ── 7. SCROLLYTELLING ────────────────────────────────────── */
function initScrollytelling() {
  const steps = document.querySelectorAll('.scrolly__step');
  const panels = document.querySelectorAll('.scrolly__panel');
  if (!steps.length) return;

  // Activate first step immediately
  steps[0]?.classList.add('active');
  panels[0]?.classList.add('active');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const index = entry.target.dataset.step;

          steps.forEach(s => s.classList.remove('active'));
          panels.forEach(p => p.classList.remove('active'));

          entry.target.classList.add('active');
          const panel = document.querySelector(`.scrolly__panel[data-panel="${index}"]`);
          if (panel) panel.classList.add('active');
        }
      });
    },
    { threshold: 0.55, rootMargin: '-10% 0px -10% 0px' }
  );

  steps.forEach(step => observer.observe(step));
}

/* ── 8. HERO METRIC COUNTERS (auto-start) ─────────────────── */
// These run on page load for the hero section
window.addEventListener('load', () => {
  const heroCounters = document.querySelectorAll('.hero__metric-value[data-count]');
  heroCounters.forEach((el, i) => {
    setTimeout(() => animateCounter(el), 300 + i * 200);
  });
});

/* ── 9. SCROLL HINT FADE-OUT ──────────────────────────────── */
(function () {
  const hint = document.getElementById('scrollHint');
  if (!hint) return;

  let hidden = false;

  function hideHint() {
    if (hidden) return;
    hidden = true;
    hint.classList.add('hidden');
    // Remove listener after hiding — no longer needed
    window.removeEventListener('scroll', hideHint);
    window.removeEventListener('touchmove', hideHint);
  }

  window.addEventListener('scroll', hideHint, { passive: true });
  window.addEventListener('touchmove', hideHint, { passive: true });
})();

/* ── 10. AI VISIBILITY MOCKUP ───────────────────────────── */
function initAIVMockup() {
  const mockup = document.querySelector('.aiv-mockup');
  if (!mockup) return;

  let animated = false;

  /* ─ Sub-tab switching ─ */
  const tabs   = mockup.querySelectorAll('.aiv-tab');
  const panels = mockup.querySelectorAll('.aiv-panel');

  function switchTab(key) {
    tabs.forEach(t   => t.classList.toggle('active', t.dataset.aiv === key));
    panels.forEach(p => p.classList.toggle('active', p.dataset.aiv === key));
    const activePanel = mockup.querySelector(`.aiv-panel[data-aiv="${key}"]`);
    if (activePanel) animatePanel(activePanel);
  }

  tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab.dataset.aiv)));

  /* ─ Auto-rotate every 3.5s ─ */
  const order = ['sources', 'share', 'rankings'];
  let   current = 0;
  let   autoTimer = null;

  function startAuto() {
    autoTimer = setInterval(() => {
      current = (current + 1) % order.length;
      switchTab(order[current]);
    }, 3500);
  }

  tabs.forEach(tab => tab.addEventListener('click', () => {
    clearInterval(autoTimer);
    current = order.indexOf(tab.dataset.aiv);
  }));

  /* ─ Animate fills / counters / rows in a panel ─ */
  function animatePanel(panel) {
    panel.querySelectorAll('.aiv-fill, .aiv-som-fill').forEach((fill, i) => {
      const target = fill.style.getPropertyValue('--w') ||
                     getComputedStyle(fill).getPropertyValue('--w') || '70%';
      fill.style.transition = 'none';
      fill.style.width = '0%';
      setTimeout(() => {
        fill.style.transition = 'width 1.1s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        requestAnimationFrame(() => requestAnimationFrame(() => { fill.style.width = target; }));
      }, 40 + i * 60);
    });

    panel.querySelectorAll('[data-aiv-count]').forEach((el, i) => {
      const target = parseInt(el.dataset.aivCount, 10);
      el.textContent = '0';
      setTimeout(() => {
        const t0 = performance.now();
        (function tick(now) {
          const p = Math.min((now - t0) / 1400, 1);
          el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target;
        })(performance.now());
      }, i * 100);
    });

    panel.querySelectorAll('.aiv-rank-row').forEach((row, i) => {
      row.classList.remove('visible');
      setTimeout(() => row.classList.add('visible'), 60 + i * 80);
    });
  }

  /* ─ IntersectionObserver — trigger on scroll into view ─ */
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        const active = mockup.querySelector('.aiv-panel.active');
        if (active) animatePanel(active);
        setTimeout(startAuto, 1200);
        observer.disconnect();
      }
    });
  }, { threshold: 0.3 });

  observer.observe(mockup);
}

/* ── 11. REPORTS MOCKUP ANIMATION ───────────────────────────── */
function initReportsMockup() {
  const mockup = document.getElementById('rptMockup');
  if (!mockup) return;

  const screenEdit      = document.getElementById('rptList');      // Screen 1: Edit Reports (light)
  const screenTemplates = document.getElementById('rptTemplates'); // Screen 2: Template Library
  const screenGen       = document.getElementById('rptGen');       // Screen 3: Progress bar
  const screenTitle     = document.getElementById('rptTitle');     // Screen 4: Title.png
  const screenSummary   = document.getElementById('rptSummary');   // Screen 5: Summary.png
  const screenArticle   = document.getElementById('rptArticle');   // Screen 6: Bloomberg.png

  const genBtn    = document.getElementById('rptGenBtn');
  const genFill   = document.getElementById('rptGenFill');
  const genStatus = document.getElementById('rptGenStatus');
  const genPct    = document.getElementById('rptGenPct');
  const cursor    = document.getElementById('rptCursor');

  const allScreens = [screenEdit, screenTemplates, screenGen, screenTitle, screenSummary, screenArticle];
  let running = false;

  function showOnly(el) {
    allScreens.forEach(s => s && s.classList.remove('active'));
    if (el) el.classList.add('active');
  }

  function moveCursor(targetEl, cb) {
    if (!cursor || !targetEl) { cb && setTimeout(cb, 100); return; }
    const rect = targetEl.getBoundingClientRect();
    const mockRect = mockup.getBoundingClientRect();
    // Position relative to mockup
    const top  = rect.top  - mockRect.top  + rect.height / 2 - 10;
    const left = rect.left - mockRect.left + rect.width  / 2;
    cursor.style.opacity = '1';
    cursor.style.top  = top  + 'px';
    cursor.style.left = left + 'px';
    setTimeout(cb, 700);
  }

  function hideCursor() {
    if (cursor) cursor.style.opacity = '0';
  }

  function runSequence() {
    if (running) return;
    running = true;

    // ── SCREEN 1: Show Edit Reports, cursor swoops to Generate button ──
    showOnly(screenEdit);
    hideCursor();

    // Wait a beat, then show cursor at bottom-left, then swoop to Generate
    setTimeout(() => {
      if (!cursor || !genBtn) return;
      // Start cursor at bottom of mockup
      cursor.style.transition = 'none';
      cursor.style.top  = '300px';
      cursor.style.left = '60px';
      cursor.style.opacity = '1';

      // Restore transition, then move to button
      setTimeout(() => {
        cursor.style.transition = 'opacity 0.2s ease, top 0.65s cubic-bezier(0.34,1.2,0.64,1), left 0.65s cubic-bezier(0.34,1.2,0.64,1)';
        moveCursor(genBtn, () => {
          // Click animation
          genBtn.classList.add('rpt-btn--clicking');
          setTimeout(() => {
            genBtn.classList.remove('rpt-btn--clicking');
            hideCursor();

            // ── SCREEN 2: Template Library (shown briefly before generation) ──
            showOnly(screenTemplates);

            setTimeout(() => {
              // ── SCREEN 3: Progress bar (duration halved per client feedback) ──
              showOnly(screenGen);
              genFill.style.transition = 'none';
              genFill.style.width = '0%';
              genStatus.textContent = 'Starting';
              genPct.textContent = '0%';

              const statuses = [
                { at: 0,  text: 'Starting' },
                { at: 20, text: 'Fetching coverage data' },
                { at: 50, text: 'Generating slides' },
                { at: 80, text: 'Finalizing report' },
                { at: 95, text: 'Almost done' },
              ];

              const t0 = performance.now();
              const dur = 1200; // was 2400 — reduced by 50% per client feedback
              void genFill.offsetWidth;
              genFill.style.transition = 'width 0.1s linear';

              function updateBar(now) {
                const pct = Math.min(((now - t0) / dur) * 100, 100);
                genFill.style.width = pct.toFixed(1) + '%';
                genPct.textContent = Math.round(pct) + '%';
                const st = statuses.filter(s => pct >= s.at).pop();
                if (st) genStatus.textContent = st.text;

                if (pct < 100) {
                  requestAnimationFrame(updateBar);
                } else {
                  genStatus.textContent = 'Complete';
                  genPct.textContent = '100%';

                  // ── SCREENS 4-6: Slide images ──
                  setTimeout(() => slideShow(), 400);
                }
              }

              requestAnimationFrame(updateBar);
            }, 2400); // Template Library display duration
          }, 150);
        });
      }, 80);
    }, 900);
  }

  function slideShow() {
    const slides = [screenTitle, screenSummary, screenArticle];
    let idx = 0;
    showOnly(slides[0]);

    function nextSlide() {
      idx++;
      if (idx < slides.length) {
        setTimeout(() => {
          showOnly(slides[idx]);
          nextSlide();
        }, 2200);
      } else {
        // End: return to Edit Reports
        setTimeout(() => {
          running = false;
          showOnly(screenEdit);
          setTimeout(runSequence, 1600);
        }, 2200);
      }
    }

    nextSlide();
  }

  // Start when Reports tab panel is visible
  const panel = mockup.closest('.tab__panel');
  if (!panel) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !running) runSequence();
    });
  }, { threshold: 0.4 });

  observer.observe(panel);
}

/* ── 13. AI AGENTS MOCKUP ─────────────────────────────────── */
function initAgentMockup() {
  const mockup = document.getElementById('agentMockup');
  if (!mockup) return;

  const tasks    = Array.from(mockup.querySelectorAll('.agent-task'));
  const fill1    = document.getElementById('agFill1');
  const clockEl  = document.getElementById('agentClock');
  const countEl  = document.getElementById('agentCountdown');

  let started = false;
  let countdownSec = 253; // 4:13
  let countdownTimer = null;
  let clockMin = 47;
  let clockHour = 2;

  // Animate scanning progress bar 0 -> 100%
  function animateScanBar() {
    let pct = 0;
    fill1.style.transition = 'none';
    fill1.style.width = '0%';
    void fill1.offsetWidth;
    fill1.style.transition = 'width 0.08s linear';
    const iv = setInterval(() => {
      pct = Math.min(pct + 2, 100);
      fill1.style.width = pct + '%';
      if (pct >= 100) clearInterval(iv);
    }, 80);
  }

  // Show tasks one by one with stagger
  function showTasks() {
    tasks.forEach((task, i) => {
      task.classList.remove('visible', 'highlighted');
    });

    // Task 1: scan + progress bar
    setTimeout(() => {
      tasks[0].classList.add('visible', 'highlighted');
      animateScanBar();
    }, 200);

    // Task 2: found mentions
    setTimeout(() => {
      tasks[0].classList.remove('highlighted');
      tasks[1].classList.add('visible', 'highlighted');
    }, 2000);

    // Task 3: competitor alert — флеш
    setTimeout(() => {
      tasks[1].classList.remove('highlighted');
      tasks[2].classList.add('visible', 'highlighted');
    }, 3200);

    // Task 4: digest compiled
    setTimeout(() => {
      tasks[2].classList.remove('highlighted');
      tasks[3].classList.add('visible', 'highlighted');
    }, 4400);

    // Task 5: Slack sent
    setTimeout(() => {
      tasks[3].classList.remove('highlighted');
      tasks[4].classList.add('visible', 'highlighted');
    }, 5600);

    // All done — wait then restart
    setTimeout(() => {
      tasks[4].classList.remove('highlighted');
      setTimeout(showTasks, 2500);
    }, 7200);
  }

  // Clock ticking — minutes every 8s
  function tickClock() {
    setInterval(() => {
      clockMin++;
      if (clockMin >= 60) { clockMin = 0; clockHour = (clockHour + 1) % 12 || 12; }
      const h = clockHour;
      const m = String(clockMin).padStart(2, '0');
      const ampm = clockHour < 6 ? 'AM' : 'AM'; // always night
      clockEl.textContent = h + ':' + m + ' AM';
    }, 8000);
  }

  // Countdown timer
  function tickCountdown() {
    countdownTimer = setInterval(() => {
      countdownSec--;
      if (countdownSec < 0) countdownSec = 299; // reset 4:59
      const m = Math.floor(countdownSec / 60);
      const s = String(countdownSec % 60).padStart(2, '0');
      countEl.textContent = m + ':' + s;
    }, 1000);
  }

  // Trigger on scroll into view
  const panel = mockup.closest('.tab__panel');
  if (!panel) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !started) {
        started = true;
        showTasks();
        tickClock();
        tickCountdown();
        observer.disconnect();
      }
    });
  }, { threshold: 0.35 });

  observer.observe(panel);
}

/* ── 12. SHARE OF MEDIA MOCKUP ───────────────────────────── */
function initSoMMockup() {
  const mockup = document.getElementById('somMockup');
  if (!mockup) return;

  const panelShare    = document.getElementById('somShare');
  const panelRankings = document.getElementById('somRankings');
  const tabShare      = document.getElementById('somTabShare');
  const tabRank       = document.getElementById('somTabRank');

  let autoTimer = null;
  let current = 'share';

  function animateFills(panel) {
    panel.querySelectorAll('.aiv-som-fill, .aiv-fill').forEach((fill, i) => {
      const target = fill.style.getPropertyValue('--w') ||
                     getComputedStyle(fill).getPropertyValue('--w') || '70%';
      fill.style.transition = 'none';
      fill.style.width = '0%';
      setTimeout(() => {
        fill.style.transition = 'width 1.1s cubic-bezier(0.25,0.46,0.45,0.94)';
        requestAnimationFrame(() => requestAnimationFrame(() => {
          fill.style.width = target;
        }));
      }, 40 + i * 70);
    });
  }

  function animateRows(panel) {
    panel.querySelectorAll('.aiv-rank-row').forEach((row, i) => {
      row.classList.remove('visible');
      setTimeout(() => row.classList.add('visible'), 60 + i * 90);
    });
  }

  function switchTo(key) {
    current = key;
    const isShare = key === 'share';

    // Update subtabs
    tabShare.classList.toggle('active', isShare);
    tabRank.classList.toggle('active', !isShare);

    // Swap panels
    panelShare.classList.toggle('active', isShare);
    panelRankings.classList.toggle('active', !isShare);

    // Animate content
    if (isShare) animateFills(panelShare);
    else         animateRows(panelRankings);
  }

  function startAuto() {
    clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      switchTo(current === 'share' ? 'rankings' : 'share');
    }, 3500);
  }

  // Manual click
  tabShare.addEventListener('click', () => { switchTo('share'); startAuto(); });
  tabRank.addEventListener('click',  () => { switchTo('rankings'); startAuto(); });

  // Trigger on scroll into view
  const panel = mockup.closest('.tab__panel');
  if (!panel) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        switchTo('share');
        setTimeout(startAuto, 1200);
        observer.disconnect();
      }
    });
  }, { threshold: 0.4 });

  observer.observe(panel);
}
/* ── CITATIONS DROPDOWN — clickable "7" in Share of Media ── */
(function initCitationsDropdowns() {
  // Handle all clickable numbers
  document.addEventListener('click', function(e) {
    const num = e.target.closest('.aiv-som-num--clickable');
    const closeBtn = e.target.closest('.aiv-cit-close');

    // Close button clicked
    if (closeBtn) {
      const id = closeBtn.dataset.close;
      const dropdown = document.getElementById(id);
      if (dropdown) {
        dropdown.classList.remove('open');
        // Also deactivate the number
        const panel = dropdown.closest('.aiv-som-bars, .som-panel');
        if (panel) {
          const clickable = panel.querySelector('.aiv-som-num--clickable');
          if (clickable) clickable.classList.remove('active');
        }
      }
      e.stopPropagation();
      return;
    }

    // Number clicked — toggle dropdown
    if (num) {
      const dropId = num.dataset.dropdown;
      const dropdown = document.getElementById(dropId);
      if (!dropdown) return;

      const isOpen = dropdown.classList.contains('open');

      // Close ALL dropdowns first
      document.querySelectorAll('.aiv-cit-dropdown.open').forEach(d => d.classList.remove('open'));
      document.querySelectorAll('.aiv-som-num--clickable.active').forEach(n => n.classList.remove('active'));

      if (!isOpen) {
        dropdown.classList.add('open');
        num.classList.add('active');
      }
      e.stopPropagation();
      return;
    }

    // Clicked outside — close all
    document.querySelectorAll('.aiv-cit-dropdown.open').forEach(d => d.classList.remove('open'));
    document.querySelectorAll('.aiv-som-num--clickable.active').forEach(n => n.classList.remove('active'));
  });
})();

/* ═══════════════════════════════════════════════════════
   TESTIMONIAL MARQUEE — pixel-perfect seamless scroll
   Works by cloning cards so track is always 2× width,
   then scrolling exactly one set-width before resetting.
═══════════════════════════════════════════════════════ */
(function initTestiMarquee() {
  document.querySelectorAll('.testi-marquee').forEach(marquee => {
    const track = marquee.querySelector('.testi-track');
    if (!track) return;

    const isReverse = marquee.classList.contains('testi-marquee--rev');
    const speed = isReverse ? 0.2 : 0.18; // px per frame — slow & smooth

    // Clone cards 2× to ensure screen is always filled (no empty gap on right)
    const origCards = Array.from(track.children);
    [1, 2].forEach(() => {
      origCards.forEach(card => {
        const clone = card.cloneNode(true);
        clone.setAttribute('aria-hidden', 'true');
        track.appendChild(clone);
      });
    });

    // Measure one set width AFTER clones are added and layout is done
    function getSetWidth() {
      const gap = parseFloat(getComputedStyle(track).gap) || 20;
      return origCards.reduce((sum, card) => sum + card.getBoundingClientRect().width + gap, 0);
    }

    // Wait for fonts/layout to settle before measuring
    let setWidth = 0;
    let offset = 0;
    let paused = false;
    let raf;
    let initialized = false;

    function init() {
      setWidth = getSetWidth();
      offset = isReverse ? -setWidth : 0;
      initialized = true;
    }

    marquee.addEventListener('mouseenter', () => { paused = true; });
    marquee.addEventListener('mouseleave', () => { paused = false; });

    function tick() {
      if (!initialized) init();

      if (!paused) {
        offset += isReverse ? speed : -speed;
        // Refresh setWidth every 60 frames in case of resize
        if (Math.round(offset) % 60 === 0) setWidth = getSetWidth();
        if (!isReverse && offset <= -setWidth) offset += setWidth;
        if (isReverse && offset >= 0) offset -= setWidth;
        track.style.transform = `translateX(${offset}px)`;
      }
      raf = requestAnimationFrame(tick);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) cancelAnimationFrame(raf);
      else raf = requestAnimationFrame(tick);
    });

    // Start after a brief delay to let layout settle
    setTimeout(() => {
      init();
      raf = requestAnimationFrame(tick);
    }, 100);
  });
})();
