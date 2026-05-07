/* ════════════════════════════════════════════════════════════════
   PRcoverage.ai — ALL ANIMATIONS REWRITTEN IN GSAP
   ────────────────────────────────────────────────────────────────
   Drop-in replacement for hero-story.js, scrollytelling.js,
   hero-bg.js, mockup.js, aiv-showcase.js + animation portions of
   main.js. UI logic (FAQ, dropdowns, mobile menu, smooth scroll,
   tabs click handlers, citations dropdowns) stays in main.js.
   ────────────────────────────────────────────────────────────────
   REQUIREMENTS (loaded BEFORE this file):
     <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/gsap.min.js"></script>
     <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/ScrollTrigger.min.js"></script>
     <script src="https://cdn.jsdelivr.net/npm/gsap@3.12.5/dist/SplitText.min.js"></script>
   ──────────────────────────────────────────────────────────────── */

(function () {
  'use strict';

  if (typeof gsap === 'undefined') {
    console.warn('[gsap-animations] GSAP not loaded — skipping animations');
    return;
  }

  gsap.registerPlugin(ScrollTrigger);
  if (typeof SplitText !== 'undefined') gsap.registerPlugin(SplitText);

  // Brand easings (matches the cubic-bezier(0.22,1,0.36,1) used across the prototype)
  const EASE_EXPO = 'expo.out';
  const EASE_POWER = 'power2.out';
  const EASE_BACK = 'back.out(1.4)';

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Scripts load at end of <body> so DOMContentLoaded may have already fired.
  // Check readyState and call init() immediately if DOM is ready.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    const fns = [
      initGlobalReveal,
      initHeroStory3Phase,
      initBuiltForReveal,
      initStatSection,
      initLogoTicker,
      initFeaturesHeader,
      initFeaturesSticky,
      initAIAgents,
      initTestimonials,
      initCTASection,
      initAIVMockup,
      initSoMMockup,
      initReportsMockup,
      initAgentMockupGSAP,
      initHeroMetricCounters
    ];
    fns.forEach(fn => {
      try { fn(); } catch (e) { console.error('[gsap-animations] ' + fn.name + ' failed:', e); }
    });
  }

  /* ──────────────────────────────────────────────────────────────
     1. HERO STORY — 8-phase loop
     Replaces hero-story.js
  ────────────────────────────────────────────────────────────── */
  function initHeroStory() {
    const root = document.getElementById('heroStory');
    if (!root) return;

    // Make the parent container visible
    const screen = root.closest('.hero__screen--elevated');
    if (screen) {
      screen.style.opacity = '1';
      const glow = document.querySelector('.hero__screen-glow');
      if (glow) glow.classList.add('visible');
    }

    const PHASES = [
      { id: 'intro',    dur: 2400 },
      { id: 'hit1',     dur: 1100 },
      { id: 'hit2',     dur: 1100 },
      { id: 'hit3',     dur: 1100 },
      { id: 'hit4',     dur: 1100 },
      { id: 'hit5',     dur: 1200 },
      { id: 'collage',  dur: 2800 },
      { id: 'question', dur: 4200 }
    ];

    if (reduce) {
      const intro = root.querySelector('[data-phase="intro"]');
      if (intro) intro.classList.add('active');
      root.querySelectorAll('.hs-phase--intro .hs-word').forEach(w => w.classList.add('in'));
      return;
    }

    function $(sel, ctx)  { return (ctx || root).querySelector(sel); }
    function $$(sel, ctx) { return Array.from((ctx || root).querySelectorAll(sel)); }

    function activatePhase(id) {
      $$('.hs-phase').forEach(p => {
        if (p.dataset.phase === id) {
          p.classList.remove('exit');
          p.classList.add('active');
        } else if (p.classList.contains('active')) {
          p.classList.remove('active');
          p.classList.add('exit');
          setTimeout(() => p.classList.remove('exit'), 900);
        }
      });
    }

    function staggerIn(els, perItem, startDelay) {
      els.forEach((el, i) => setTimeout(() => el.classList.add('in'), (startDelay || 0) + i * perItem));
    }
    function resetIn(els) { els.forEach(el => el.classList.remove('in')); }

    const handlers = {
      intro: {
        enter() { const w = $$('.hs-phase--intro .hs-word'); resetIn(w); staggerIn(w, 110, 200); },
        exit()  { resetIn($$('.hs-phase--intro .hs-word')); }
      },
      collage: {
        enter() {
          const ey = $('.hs-collage__eyebrow'), w = $$('.hs-collage__word'), sl = $$('.hs-collage__slot');
          if (ey) ey.classList.remove('in'); resetIn(w); resetIn(sl);
          setTimeout(() => ey && ey.classList.add('in'), 150);
          staggerIn(w, 90, 300); staggerIn(sl, 130, 700);
        },
        exit() {
          const ey = $('.hs-collage__eyebrow'); if (ey) ey.classList.remove('in');
          resetIn($$('.hs-collage__word')); resetIn($$('.hs-collage__slot'));
        }
      },
      question: {
        enter() {
          const w = $$('.hs-phase--question .hs-question__text .hs-word');
          const m = $$('.hs-model'), q = $('.hs-qmark');
          resetIn(w); resetIn(m); if (q) q.classList.remove('in', 'pulsing');
          staggerIn(w, 85, 200); staggerIn(m, 160, 900);
          setTimeout(() => q && q.classList.add('in'), 1400);
          setTimeout(() => q && q.classList.add('pulsing'), 2200);
        },
        exit() {
          resetIn($$('.hs-phase--question .hs-question__text .hs-word'));
          resetIn($$('.hs-model'));
          const q = $('.hs-qmark'); if (q) q.classList.remove('in', 'pulsing');
        }
      }
    };
    ['hit1','hit2','hit3','hit4','hit5'].forEach(id => { handlers[id] = { enter(){}, exit(){} }; });

    let timerId = null;
    let currentIdx = -1;

    function goToPhase(idx) {
      currentIdx = idx;
      const phase = PHASES[idx];
      const prevId = idx > 0 ? PHASES[idx - 1].id : PHASES[PHASES.length - 1].id;
      if (handlers[prevId] && handlers[prevId].exit) handlers[prevId].exit();
      activatePhase(phase.id);
      if (handlers[phase.id] && handlers[phase.id].enter) handlers[phase.id].enter();
      timerId = setTimeout(() => goToPhase((idx + 1) % PHASES.length), phase.dur);
    }

    document.addEventListener('visibilitychange', () => {
      if (document.hidden) { clearTimeout(timerId); timerId = null; }
      else if (timerId === null && currentIdx >= 0) goToPhase(currentIdx);
    });

    setTimeout(() => goToPhase(0), 400);
  }

  function buildPhaseEnter(id, root) {
    const tl = gsap.timeline();

    if (id === 'intro') {
      const words = root.querySelectorAll('.hs-word');
      tl.set(words, { opacity: 0, y: 12 })
        .to(words, { opacity: 1, y: 0, duration: 0.5, stagger: 0.11, ease: EASE_EXPO, delay: 0.2 });
    }

    if (id === 'collage') {
      const eyebrow = root.querySelector('.hs-collage__eyebrow');
      const words = root.querySelectorAll('.hs-collage__word');
      const slots = root.querySelectorAll('.hs-collage__slot');

      if (eyebrow) tl.fromTo(eyebrow, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.5, ease: EASE_EXPO, delay: 0.15 }, 0);
      tl.fromTo(words, { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.09, ease: EASE_EXPO }, 0.3);
      tl.fromTo(slots, { opacity: 0, scale: 0.85, y: 20 }, { opacity: 1, scale: 1, y: 0, duration: 0.65, stagger: 0.13, ease: EASE_BACK }, 0.7);
    }

    if (id === 'question') {
      const words = root.querySelectorAll('.hs-question__text .hs-word');
      const models = root.querySelectorAll('.hs-model');
      const qmark = root.querySelector('.hs-qmark');

      tl.fromTo(words, { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.45, stagger: 0.085, ease: EASE_EXPO }, 0.2);
      tl.fromTo(models, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.5, stagger: 0.16, ease: EASE_BACK }, 0.9);
      if (qmark) {
        tl.fromTo(qmark, { opacity: 0, scale: 0.5 }, { opacity: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' }, 1.4);
        tl.to(qmark, { scale: 1.08, duration: 1, repeat: -1, yoyo: true, ease: 'sine.inOut' }, 2.2);
      }
    }

    return tl;
  }

  /* ──────────────────────────────────────────────────────────────
     2. HERO SIDE WIDGETS (typewriter + bars + rotating alert)
  ────────────────────────────────────────────────────────────── */
  function initHeroSideWidgets() {
    const wLeft = document.getElementById('heroWidgetLeft');
    const wRight = document.getElementById('heroWidgetRight');
    if (!wLeft || !wRight) return;

    gsap.to([wLeft, wRight], { autoAlpha: 1, duration: 0.6, delay: 0.6, ease: EASE_POWER, onStart: () => {
      wLeft.classList.add('visible'); wRight.classList.add('visible');
    }});

    // LEFT: typewriter
    const hwText = document.getElementById('hwText');
    const hwSources = document.getElementById('hwSources');
    const hwBadge = wLeft.querySelector('.hw-badge');
    const hwChips = wLeft.querySelectorAll('.hw-chip');
    const answer = "PRcoverage.ai stands out for tracking earned media's impact in ChatGPT, Gemini and Claude — cited by top journalists and analysts.";

    function leftLoop() {
      const tl = gsap.timeline({
        onComplete: () => gsap.delayedCall(6, leftLoop)
      });

      // Reset
      tl.call(() => {
        if (hwText) hwText.textContent = '';
        if (hwSources) hwSources.classList.remove('visible');
        if (hwBadge) hwBadge.classList.remove('visible');
        hwChips.forEach(c => c.classList.remove('visible'));
      });

      // Typewriter — using GSAP's TextPlugin would be ideal, but to avoid
      // an extra plugin we use a custom tween on a counter.
      tl.to({ i: 0 }, {
        i: answer.length, duration: answer.length * 0.03, ease: 'none',
        onUpdate: function () {
          if (hwText) hwText.textContent = answer.slice(0, Math.floor(this.targets()[0].i));
        }
      }, 0.6);

      // Sources panel + chips + badge
      tl.call(() => hwSources && hwSources.classList.add('visible'), null, '+=0.4');
      hwChips.forEach((chip, i) => {
        tl.call(() => chip.classList.add('visible'), null, '+=' + (i === 0 ? 0 : 0.15));
      });
      tl.call(() => hwBadge && hwBadge.classList.add('visible'), null, '+=0.5');
    }
    gsap.delayedCall(1, leftLoop);

    // RIGHT: bars animate width 0 -> target with synced counter
    const targets = [78, 62, 54];
    const fills = wRight.querySelectorAll('.hw-model-fill');
    const pcts = ['hwGPTPct', 'hwGemPct', 'hwClaPct'].map(id => document.getElementById(id));

    fills.forEach((fill, i) => {
      const counter = { v: 0 };
      gsap.to(fill, {
        width: targets[i] + '%', duration: 3, ease: EASE_POWER,
        delay: 1.2 + i * 0.25
      });
      gsap.to(counter, {
        v: targets[i], duration: 3, ease: EASE_POWER,
        delay: 1.2 + i * 0.25,
        onUpdate: () => { if (pcts[i]) pcts[i].textContent = Math.round(counter.v) + '%'; }
      });
    });

    // RIGHT: rotating alert
    const hwAlert = document.getElementById('hwAlert');
    if (hwAlert) {
      const outlets = ['Forbes', 'TechCrunch', 'Wired', 'Bloomberg', 'Reuters'];
      let idx = 0;
      gsap.to(hwAlert, { autoAlpha: 1, duration: 0.4, delay: 2.5, onStart: () => hwAlert.classList.add('visible') });

      gsap.timeline({ repeat: -1, delay: 2.5 + 3.5 })
        .call(() => {
          hwAlert.classList.remove('visible');
        })
        .to({}, { duration: 0.4 })
        .call(() => {
          idx = (idx + 1) % outlets.length;
          const strong = hwAlert.querySelector('strong');
          if (strong) strong.textContent = outlets[idx];
          hwAlert.classList.add('visible');
        })
        .to({}, { duration: 3.1 });
    }
  }

  /* ──────────────────────────────────────────────────────────────
     3. HERO ANIM (right-side mockup phases)
  ────────────────────────────────────────────────────────────── */
  function initHeroAnim() {
    const anim = document.getElementById('heroAnim');
    if (!anim) return;

    const phase1 = document.getElementById('haPhase1');
    const phase2 = document.getElementById('haPhase2');
    const phase3 = document.getElementById('haPhase3');
    const links = Array.from(anim.querySelectorAll('.ha-link'));
    const rows = [0, 1, 2].map(i => document.getElementById('haRow' + i));
    const cursor = document.getElementById('haCursor');
    const panel = document.getElementById('haPromptPanel');
    const pText = document.getElementById('haPromptText');

    const prompts = [
      '“What are the best tools for PR measurement in 2025?”',
      '“How do PR teams track earned media ROI?”',
      '“What metrics should PR professionals report to clients?”'
    ];

    const screen = anim.closest('.hero__screen--elevated');
    if (screen) {
      gsap.set(screen, { opacity: 1 });
      const glow = document.querySelector('.hero__screen-glow');
      if (glow) glow.classList.add('visible');
    }

    function moveCursorTo(rowEl) {
      if (!cursor || !rowEl) return gsap.delayedCall(0.1, () => {});
      const rr = rowEl.getBoundingClientRect();
      gsap.set(cursor, { opacity: 1 });
      return gsap.to(cursor, {
        top: rr.top + rr.height / 2 - 10, left: rr.left + 48,
        duration: 0.7, ease: EASE_POWER
      });
    }

    function buildLoop() {
      const tl = gsap.timeline({ repeat: -1 });

      // Reset
      tl.call(() => {
        [phase1, phase2, phase3].forEach(p => p && p.classList.remove('ha-active', 'ha-exit'));
        links.forEach(l => l.classList.remove('ha-link--in'));
        rows.forEach(r => r && r.classList.remove('ha-row--active'));
        if (panel) panel.classList.remove('ha-panel--visible');
        if (cursor) gsap.set(cursor, { opacity: 0 });
      });

      // Phase 1: links pop in
      tl.call(() => phase1.classList.add('ha-active'));
      links.forEach((l, i) => {
        tl.call(() => l.classList.add('ha-link--in'), null, '+=' + (i === 0 ? 0.4 : 0.3));
      });
      tl.to({}, { duration: 1.6 });

      // Phase 2: question
      tl.call(() => {
        phase1.classList.remove('ha-active');
        phase1.classList.add('ha-exit');
        phase2.classList.add('ha-active');
      });
      tl.to({}, { duration: 2.8 });

      // Phase 3: table + cursor clicking 3 rows
      tl.call(() => {
        phase2.classList.remove('ha-active');
        phase2.classList.add('ha-exit');
        phase3.classList.add('ha-active');
      });
      tl.to({}, { duration: 0.6 });

      [0, 1, 2].forEach(idx => {
        if (!rows[idx]) return;
        tl.add(() => moveCursorTo(rows[idx]));
        tl.call(() => {
          rows[idx].classList.add('ha-row--active');
          if (pText) pText.textContent = prompts[idx];
          if (panel) panel.classList.add('ha-panel--visible');
        });
        tl.to({}, { duration: 1.8 });
        tl.call(() => {
          rows[idx].classList.remove('ha-row--active');
          if (panel) panel.classList.remove('ha-panel--visible');
        });
        tl.to({}, { duration: 0.2 });
      });

      // Reset back to phase 1
      tl.call(() => {
        if (cursor) gsap.set(cursor, { opacity: 0 });
        phase3.classList.remove('ha-active');
        phase3.classList.add('ha-exit');
        phase1.classList.remove('ha-exit');
        phase1.classList.add('ha-active');
      });
      tl.to({}, { duration: 0.8 });

      return tl;
    }

    gsap.delayedCall(0.8, buildLoop);
  }

  /* ──────────────────────────────────────────────────────────────
     4. "Built for PR Pros" reveal
  ────────────────────────────────────────────────────────────── */
  function initBuiltForReveal() {
    const el = document.getElementById('typewriterTarget');
    if (!el) return;

    const suffixes = ['solo PR pros.', 'boutique agencies.', 'in-house comms teams.'];
    const TYPING = 0.055, DELETING = 0.030, PAUSE_AFTER = 2.2, PAUSE_BEFORE = 0.4;

    function buildTimeline() {
      const tl = gsap.timeline({ repeat: -1, delay: 0.8 });
      suffixes.forEach(word => {
        // Type
        tl.to({ i: 0 }, {
          i: word.length, duration: word.length * TYPING, ease: 'none',
          onUpdate: function () { el.textContent = word.slice(0, Math.floor(this.targets()[0].i)); }
        });
        tl.to({}, { duration: PAUSE_AFTER });
        // Delete
        tl.to({ i: word.length }, {
          i: 0, duration: word.length * DELETING, ease: 'none',
          onUpdate: function () { el.textContent = word.slice(0, Math.floor(this.targets()[0].i)); }
        });
        tl.to({}, { duration: PAUSE_BEFORE });
      });
    }
    buildTimeline();
  }

  /* ──────────────────────────────────────────────────────────────
     5. 89% STAT SECTION + rotating logo
  ────────────────────────────────────────────────────────────── */
  function initStatSection() {
    const section = document.querySelector('.stat-section');
    if (!section) return;

    // Rotating logo background — always running
    const logoBg = section.querySelector('.stat-section__logo-bg, .stat-bg-logo, [data-stat-bg]');
    if (logoBg) {
      gsap.to(logoBg, { rotation: 360, duration: 40, ease: 'none', repeat: -1, transformOrigin: 'center center' });
    }

    // Counter animates when scrolled into view
    const counter = section.querySelector('.stat-section__number, [data-count]');
    if (counter) {
      const target = parseFloat(counter.dataset.count || counter.textContent) || 89;
      const suffix = counter.dataset.suffix || '%';
      const obj = { v: 0 };

      ScrollTrigger.create({
        trigger: section,
        start: 'top 70%',
        once: true,
        onEnter: () => {
          gsap.to(obj, {
            v: target, duration: 2, ease: EASE_POWER,
            onUpdate: () => counter.textContent = Math.round(obj.v) + suffix
          });
        }
      });
    }
  }

  /* ──────────────────────────────────────────────────────────────
     6. ANIMATED LOGOS TICKER — "Your Media Wins Shaping AI Answers"
  ────────────────────────────────────────────────────────────── */
  function initLogoTicker() {
    const row = document.querySelector('.ticker__row, .logo-marquee, .logos-strip');
    if (!row) return;
    gsap.to(row, { xPercent: -50, duration: 35, ease: 'none', repeat: -1 });
  }

  /* ──────────────────────────────────────────────────────────────
     7. FEATURES HEADER — "Impactful reports and AI intelligence"
        Uses SplitText if available, falls back to word reveal
  ────────────────────────────────────────────────────────────── */
  function initFeaturesHeader() {
    const header = document.querySelector('.features .section-header, body > .section-header[style*="max-width"]');
    if (!header) return;
    const h2 = header.querySelector('h2');
    const sub = header.querySelector('p');

    if (h2 && typeof SplitText !== 'undefined') {
      const split = new SplitText(h2, { type: 'words' });
      gsap.from(split.words, {
        scrollTrigger: { trigger: header, start: 'top 80%' },
        opacity: 0, y: 20, stagger: 0.06, duration: 0.8, ease: 'power3.out'
      });
    } else if (h2) {
      gsap.from(h2, {
        scrollTrigger: { trigger: header, start: 'top 80%' },
        opacity: 0, y: 20, duration: 0.8, ease: 'power3.out'
      });
    }

    if (sub) {
      gsap.from(sub, {
        scrollTrigger: { trigger: header, start: 'top 80%' },
        opacity: 0, y: 15, duration: 0.7, delay: 0.3, ease: EASE_POWER
      });
    }
  }

  /* ──────────────────────────────────────────────────────────────
     8. FEATURES STICKY SCROLL (Customizable Reports)
        ScrollTrigger pin + scrub. Mobile = horizontal carousel
        (CSS-driven; we just toggle classes).
  ────────────────────────────────────────────────────────────── */
  function initFeaturesSticky() {
    const section = document.querySelector('.features');
    if (!section) return;
    const tabBtns = Array.from(section.querySelectorAll('.tab__btn'));
    const tabPanels = Array.from(section.querySelectorAll('.tab__panel'));
    const panelsWrap = section.querySelector('.tabs__panels');
    if (!tabBtns.length || !panelsWrap) return;

    const STEPS = tabBtns.length;
    const MOBILE_BP = 1024;

    if (window.innerWidth <= MOBILE_BP) {
      enableMobile();
      return;
    }

    enableDesktop();

    function activateTab(idx) {
      tabBtns.forEach((b, i) => b.classList.toggle('active', i === idx));
      tabPanels.forEach((p, i) => {
        gsap.to(p, {
          autoAlpha: i === idx ? 1 : 0,
          y: i === idx ? 0 : 16,
          duration: 0.45, ease: EASE_POWER, overwrite: 'auto'
        });
        p.style.pointerEvents = i === idx ? 'auto' : 'none';
        p.style.zIndex = i === idx ? '2' : '1';
      });
    }

    function enableDesktop() {
      // Lock heights
      let maxH = 0;
      tabPanels.forEach(p => {
        p.style.position = 'relative';
        p.style.opacity = '1';
        if (p.offsetHeight > maxH) maxH = p.offsetHeight;
      });
      if (maxH < 100) maxH = 420;

      panelsWrap.style.position = 'relative';
      panelsWrap.style.height = maxH + 'px';
      tabPanels.forEach((p, i) => {
        gsap.set(p, {
          position: 'absolute', top: 0, left: 0, right: 0,
          autoAlpha: i === 0 ? 1 : 0, y: i === 0 ? 0 : 16
        });
        p.style.pointerEvents = i === 0 ? 'auto' : 'none';
      });

      // Wrap section for sticky scroll
      const sectionHeader = section.querySelector('.section-header');
      const wrapper = document.createElement('div');
      wrapper.className = 'features-wrapper';
      wrapper.style.position = 'relative';
      wrapper.style.height = (window.innerHeight * (STEPS + 1)) + 'px';
      section.parentNode.insertBefore(wrapper, section);

      if (sectionHeader) {
        sectionHeader.parentNode.removeChild(sectionHeader);
        sectionHeader.style.cssText = 'padding: var(--sec-pad-y) 32px 0; max-width: var(--max-w); margin: 0 auto; background: var(--clr-bg);';
        wrapper.parentNode.insertBefore(sectionHeader, wrapper);
      }
      wrapper.appendChild(section);
      section.style.cssText = 'position:sticky;top:0;height:100vh;display:flex;flex-direction:column;justify-content:center;';

      // Force ScrollTrigger to recalculate positions after DOM restructure
      ScrollTrigger.refresh();

      // Progress bar
      const barWrap = document.createElement('div');
      barWrap.className = 'features-progress-bar';
      barWrap.style.cssText = 'position:fixed;bottom:0;left:0;right:0;width:100%;height:3px;background:rgba(255,255,255,0.07);overflow:hidden;z-index:9999;opacity:0;transition:opacity 0.3s ease;pointer-events:none;';
      const barFill = document.createElement('div');
      barFill.style.cssText = 'height:100%;width:0%;background:linear-gradient(90deg,#b71baf 0%,#ff5463 50%,#ff87ba 100%);box-shadow:0 0 8px rgba(255,135,186,0.7);will-change:width;';
      barWrap.appendChild(barFill);
      document.body.appendChild(barWrap);

      // ScrollTrigger drives tab swap + bar fill
      // Use rAF so browser recalculates layout after DOM restructure before ST reads positions
      requestAnimationFrame(() => {
      ScrollTrigger.refresh();
      ScrollTrigger.create({
        trigger: wrapper,
        start: 'top top',
        end: 'bottom bottom',
        onUpdate: self => {
          const raw = self.progress;
          barWrap.style.opacity = '1';
          const slotSize = 1 / STEPS;
          const tabIdx = Math.min(Math.floor(raw / slotSize), STEPS - 1);
          const perTab = Math.min((raw - tabIdx * slotSize) / slotSize, 1);
          barFill.style.width = (perTab * 100).toFixed(1) + '%';
          if (parseInt(panelsWrap.dataset.activeIdx) !== tabIdx) {
            panelsWrap.dataset.activeIdx = tabIdx;
            activateTab(tabIdx);
          }
        },
        onLeave: () => barWrap.style.opacity = '0',
        onLeaveBack: () => barWrap.style.opacity = '0',
        onEnter: () => barWrap.style.opacity = '1',
        onEnterBack: () => barWrap.style.opacity = '1'
      });
      }); // end requestAnimationFrame

      // Tab clicks scroll to corresponding section
      tabBtns.forEach((btn, tabIdx) => {
        btn.addEventListener('click', () => {
          const trigger = ScrollTrigger.getAll().find(t => t.trigger === wrapper);
          if (trigger) {
            const targetY = trigger.start + (trigger.end - trigger.start) * ((tabIdx + 0.5) / STEPS);
            window.scrollTo({ top: targetY, behavior: 'smooth' });
          }
        });
      });

      activateTab(0);
    }

    function enableMobile() {
      section.classList.add('features--mobile');
      panelsWrap.style.cssText = '';
      tabPanels.forEach(p => p.style.cssText = '');

      // Tab buttons scroll to corresponding panel vertically
      tabBtns.forEach((btn, idx) => {
        btn.addEventListener('click', () => {
          const panel = tabPanels[idx];
          if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
          tabBtns.forEach((b, i) => b.classList.toggle('active', i === idx));
        });
      });

      // Highlight active tab as panels scroll into view (vertical)
      if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver(entries => {
          entries.forEach(e => {
            if (e.isIntersecting && e.intersectionRatio > 0.3) {
              const idx = tabPanels.indexOf(e.target);
              if (idx > -1) tabBtns.forEach((b, i) => b.classList.toggle('active', i === idx));
            }
          });
        }, { threshold: [0.3, 0.6] });
        tabPanels.forEach(p => obs.observe(p));
      }

      // Activate first tab on init
      tabBtns.forEach((b, i) => b.classList.toggle('active', i === 0));
    }
  }

  /* ──────────────────────────────────────────────────────────────
     9. AI AGENTS — "Work While You Sleep"
  ────────────────────────────────────────────────────────────── */
  function initAIAgents() {
    const section = document.querySelector('.ai-agents, .agents-section, [data-section="ai-agents"]');
    if (!section) return;
    const cards = section.querySelectorAll('.ai-agent-card, .agent-card');

    if (cards.length) {
      gsap.from(cards, {
        scrollTrigger: { trigger: section, start: 'top 70%' },
        opacity: 0, y: 24, scale: 0.92, stagger: 0.12, duration: 0.8, ease: EASE_BACK
      });

      // Subtle idle float for icons
      cards.forEach((card, i) => {
        const icon = card.querySelector('.agent-icon, .ai-agent-card__icon, svg');
        if (icon) {
          gsap.to(icon, {
            y: -3, duration: 3 + i * 0.2, repeat: -1, yoyo: true, ease: 'sine.inOut'
          });
        }
      });
    }
  }

  /* ──────────────────────────────────────────────────────────────
     10. TESTIMONIALS — entrance + marquee
  ────────────────────────────────────────────────────────────── */
  function initTestimonials() {
    const section = document.querySelector('.testimonials, .testi-section');
    if (!section) return;
    const cards = section.querySelectorAll('.testimonial-card, .testi-card, .testi-thread');
    const row = section.querySelector('.testimonials__row, .testi-marquee');

    if (cards.length) {
      gsap.from(cards, {
        scrollTrigger: { trigger: section, start: 'top 80%' },
        opacity: 0, y: 30, stagger: 0.1, duration: 0.7, ease: EASE_POWER,
        // Marquee scroll is handled by main.js (RAF-based, pixel-perfect)
      });
    }
  }

  /* ──────────────────────────────────────────────────────────────
     11. CTA SECTION — "Reporting you'll be proud to share"
         Logo ring rotation + content reveal
  ────────────────────────────────────────────────────────────── */
  function initCTASection() {
    const section = document.querySelector('.cta-section');
    if (!section) return;

    // Always-rotating ring
    const ring = section.querySelector('.cta-ring svg, .cta-ring');
    if (ring) {
      gsap.to(ring, { rotation: 360, duration: 30, ease: 'none', repeat: -1, transformOrigin: 'center center' });
    }

    // CTA content is made visible via CSS (light-theme.css override).
    // ScrollTrigger-based reveal is skipped here to avoid GSAP inline opacity:0
    // conflicting with the CSS !important override when section is already in viewport.
  }

  /* ──────────────────────────────────────────────────────────────
     12. GLOBAL .reveal SCROLL PATTERN
  ────────────────────────────────────────────────────────────── */
  function initGlobalReveal() {
    document.querySelectorAll('.reveal').forEach(el => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 85%',
        once: true,
        onEnter: () => el.classList.add('visible')
      });
    });

    document.querySelectorAll('.testi-thread').forEach(el => {
      ScrollTrigger.create({
        trigger: el,
        start: 'top 80%',
        once: true,
        onEnter: () => el.classList.add('visible')
      });
    });
  }

  /* ──────────────────────────────────────────────────────────────
     13. AIV MOCKUP (sub-tabs + bar fills + counters + rows)
  ────────────────────────────────────────────────────────────── */
  function initAIVMockup() {
    const mockup = document.querySelector('.aiv-mockup');
    if (!mockup) return;

    const tabs = mockup.querySelectorAll('.aiv-tab');
    const panels = mockup.querySelectorAll('.aiv-panel');
    const order = ['sources', 'share', 'rankings'];
    let current = 0;
    let autoTl = null;

    function animatePanel(panel) {
      panel.querySelectorAll('.aiv-fill, .aiv-som-fill').forEach((fill, i) => {
        const target = fill.style.getPropertyValue('--w') || getComputedStyle(fill).getPropertyValue('--w') || '70%';
        gsap.fromTo(fill,
          { width: '0%' },
          { width: target, duration: 1.1, ease: 'power2.inOut', delay: 0.04 + i * 0.06 }
        );
      });

      panel.querySelectorAll('[data-aiv-count]').forEach((el, i) => {
        const target = parseInt(el.dataset.aivCount, 10);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target, duration: 1.4, ease: EASE_POWER, delay: i * 0.1,
          onUpdate: () => el.textContent = Math.round(obj.v)
        });
      });

      panel.querySelectorAll('.aiv-rank-row').forEach((row, i) => {
        gsap.fromTo(row,
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.4, delay: 0.06 + i * 0.08, ease: EASE_POWER, onStart: () => row.classList.add('visible') }
        );
      });
    }

    function switchTab(key) {
      tabs.forEach(t => t.classList.toggle('active', t.dataset.aiv === key));
      panels.forEach(p => p.classList.toggle('active', p.dataset.aiv === key));
      const active = mockup.querySelector(`.aiv-panel[data-aiv="${key}"]`);
      if (active) animatePanel(active);
    }

    function startAuto() {
      if (autoTl) autoTl.kill();
      autoTl = gsap.timeline({ repeat: -1 })
        .to({}, { duration: 3.5 })
        .call(() => { current = (current + 1) % order.length; switchTab(order[current]); });
    }

    tabs.forEach(tab => tab.addEventListener('click', () => {
      if (autoTl) autoTl.kill();
      current = order.indexOf(tab.dataset.aiv);
      switchTab(tab.dataset.aiv);
    }));

    ScrollTrigger.create({
      trigger: mockup, start: 'top 70%', once: true,
      onEnter: () => {
        const active = mockup.querySelector('.aiv-panel.active');
        if (active) animatePanel(active);
        gsap.delayedCall(1.2, startAuto);
      }
    });
  }

  /* ──────────────────────────────────────────────────────────────
     14. SHARE OF MEDIA MOCKUP
  ────────────────────────────────────────────────────────────── */
  function initSoMMockup() {
    const mockup = document.getElementById('somMockup');
    if (!mockup) return;

    const panelShare = document.getElementById('somShare');
    const panelRank = document.getElementById('somRankings');
    const tabShare = document.getElementById('somTabShare');
    const tabRank = document.getElementById('somTabRank');
    if (!panelShare || !panelRank || !tabShare || !tabRank) return;

    let current = 'share';
    let autoTl = null;

    function animateFills(panel) {
      panel.querySelectorAll('.aiv-som-fill, .aiv-fill').forEach((fill, i) => {
        const target = fill.style.getPropertyValue('--w') || getComputedStyle(fill).getPropertyValue('--w') || '70%';
        gsap.fromTo(fill,
          { width: '0%' },
          { width: target, duration: 1.1, ease: 'power2.inOut', delay: 0.04 + i * 0.07 }
        );
      });
    }

    function animateRows(panel) {
      panel.querySelectorAll('.aiv-rank-row').forEach((row, i) => {
        gsap.fromTo(row,
          { autoAlpha: 0, y: 8 },
          { autoAlpha: 1, y: 0, duration: 0.4, delay: 0.06 + i * 0.09, ease: EASE_POWER, onStart: () => row.classList.add('visible') }
        );
      });
    }

    function switchTo(key) {
      current = key;
      const isShare = key === 'share';
      tabShare.classList.toggle('active', isShare);
      tabRank.classList.toggle('active', !isShare);
      panelShare.classList.toggle('active', isShare);
      panelRank.classList.toggle('active', !isShare);
      if (isShare) animateFills(panelShare); else animateRows(panelRank);
    }

    function startAuto() {
      if (autoTl) autoTl.kill();
      autoTl = gsap.timeline({ repeat: -1 })
        .to({}, { duration: 3.5 })
        .call(() => switchTo(current === 'share' ? 'rankings' : 'share'));
    }

    tabShare.addEventListener('click', () => { if (autoTl) autoTl.kill(); switchTo('share'); startAuto(); });
    tabRank.addEventListener('click', () => { if (autoTl) autoTl.kill(); switchTo('rankings'); startAuto(); });

    ScrollTrigger.create({
      trigger: mockup, start: 'top 70%', once: true,
      onEnter: () => { switchTo('share'); gsap.delayedCall(1.2, startAuto); }
    });
  }

  /* ──────────────────────────────────────────────────────────────
     15. REPORTS MOCKUP — Edit → Templates → Generate → Slides loop
  ────────────────────────────────────────────────────────────── */
  function initReportsMockup() {
    const mockup = document.getElementById('rptMockup');
    if (!mockup) return;

    const screenEdit    = document.getElementById('rptList');
    const screenGen     = document.getElementById('rptGen');
    const screenTitle   = document.getElementById('rptTitle');
    const screenSummary = document.getElementById('rptSummary');
    const screenArticle = document.getElementById('rptArticle');
    const genBtn    = document.getElementById('rptGenBtn');
    const genFill   = document.getElementById('rptGenFill');
    const genStatus = document.getElementById('rptGenStatus');
    const genPct    = document.getElementById('rptGenPct');
    const cursor    = document.getElementById('rptCursor');

    const screenTemplates = document.getElementById('rptTemplates');
    const all = [screenEdit, screenGen, screenTitle, screenSummary, screenArticle, screenTemplates];

    function showOnly(el) {
      all.forEach(s => s && s.classList.remove('active'));
      if (el) el.classList.add('active');
    }

    function hideCursor() {
      if (cursor) { cursor.style.transition = 'none'; cursor.style.opacity = '0'; }
    }

    function moveCursorTo(el, cb) {
      if (!cursor || !el) { setTimeout(cb, 100); return; }
      const rect    = el.getBoundingClientRect();
      const mRect   = mockup.getBoundingClientRect();
      const top     = rect.top  - mRect.top  + rect.height / 2 - 10;
      const left    = rect.left - mRect.left + rect.width  / 2;
      cursor.style.transition = 'opacity 0.2s ease, top 0.6s cubic-bezier(0.34,1.2,0.64,1), left 0.6s cubic-bezier(0.34,1.2,0.64,1)';
      cursor.style.opacity = '1';
      cursor.style.top  = top  + 'px';
      cursor.style.left = left + 'px';
      setTimeout(cb, 700);
    }

    function runProgress(cb) {
      if (genFill)   { genFill.style.transition = 'none'; genFill.style.width = '0%'; }
      if (genStatus) genStatus.textContent = 'Starting';
      if (genPct)    genPct.textContent = '0%';

      const dur = 1400;
      const t0  = performance.now();

      function tick(now) {
        const pct = Math.min(((now - t0) / dur) * 100, 100);
        if (genFill)   { genFill.style.transition = 'none'; genFill.style.width = pct.toFixed(1) + '%'; }
        if (genPct)    genPct.textContent = Math.round(pct) + '%';
        if (genStatus) {
          if      (pct >= 95) genStatus.textContent = 'Almost done';
          else if (pct >= 80) genStatus.textContent = 'Finalizing report';
          else if (pct >= 50) genStatus.textContent = 'Generating slides';
          else if (pct >= 20) genStatus.textContent = 'Fetching coverage data';
        }
        if (pct < 100) {
          requestAnimationFrame(tick);
        } else {
          if (genStatus) genStatus.textContent = 'Complete';
          if (genPct)    genPct.textContent = '100%';
          setTimeout(cb, 500);
        }
      }
      requestAnimationFrame(tick);
    }

    function runLoop() {
      // ── STEP 1: Show Edit screen ──────────────────────────────
      showOnly(screenEdit);
      hideCursor();

      // ── STEP 2: Cursor appears bottom-left, moves to Generate ─
      setTimeout(() => {
        if (cursor) {
          cursor.style.transition = 'none';
          cursor.style.top  = '290px';
          cursor.style.left = '50px';
          cursor.style.opacity = '0';
        }
        setTimeout(() => {
          moveCursorTo(genBtn, () => {
            // ── STEP 3: Click animation ──────────────────────────
            if (genBtn) genBtn.classList.add('rpt-btn--clicking');
            setTimeout(() => {
              if (genBtn) genBtn.classList.remove('rpt-btn--clicking');
              hideCursor();

              // ── STEP 4: Generation progress bar ─────────────────
              setTimeout(() => {
                showOnly(screenGen);
                runProgress(() => {

                  // STEP 5: Title slide
                  showOnly(screenTitle);
                  setTimeout(() => {

                    // STEP 6: Summary slide
                    showOnly(screenSummary);
                    setTimeout(() => {

                      // STEP 7: Article (Bloomberg) slide
                      showOnly(screenArticle);
                      setTimeout(() => {

                        // STEP 8: Templates preview
                        showOnly(screenTemplates);
                        setTimeout(() => {

                          // STEP 9: Back to Edit, loop
                          runLoop();

                        }, 2500);
                      }, 2200);
                    }, 2200);
                  }, 2200);
                });
              }, 200);
            }, 180);
          });
        }, 150);
      }, 1000);
    }

    // Trigger when tab panel enters viewport
    const panel = mockup.closest('.tab__panel') || mockup;
    let started = false;
    ScrollTrigger.create({
      trigger: panel,
      start: 'top 70%',
      once: true,
      onEnter: () => { if (!started) { started = true; runLoop(); } }
    });
  }

  /* ──────────────────────────────────────────────────────────────
     16. AGENT MOCKUP — task choreography
  ────────────────────────────────────────────────────────────── */
  function initAgentMockupGSAP() {
    const mockup = document.getElementById('agentMockup');
    if (!mockup) return;

    const tasks = Array.from(mockup.querySelectorAll('.agent-task'));
    const fill1 = document.getElementById('agFill1');
    const clockEl = document.getElementById('agentClock');
    const countEl = document.getElementById('agentCountdown');

    let clockMin = 47, clockHour = 2;
    let countdownSec = 253;

    function buildTaskLoop() {
      function reset() {
        tasks.forEach(t => t.classList.remove('visible', 'highlighted'));
        if (fill1) { fill1.style.transition = 'none'; fill1.style.width = '0%'; }
      }

      function step(i) {
        if (i > 0 && tasks[i - 1]) tasks[i - 1].classList.remove('highlighted');

        if (i >= tasks.length) {
          setTimeout(runLoop, 2000);
          return;
        }

        if (tasks[i]) tasks[i].classList.add('visible', 'highlighted');

        if (i === 0 && fill1) {
          setTimeout(() => {
            fill1.style.transition = 'width 1.8s linear';
            fill1.style.width = '100%';
          }, 50);
        }

        setTimeout(() => step(i + 1), i === 0 ? 2200 : 1800);
      }

      function runLoop() {
        reset();
        setTimeout(() => step(0), 300);
      }

      runLoop();
    }

    function startClock() {
      gsap.timeline({ repeat: -1 })
        .to({}, { duration: 8 })
        .call(() => {
          clockMin++;
          if (clockMin >= 60) { clockMin = 0; clockHour = (clockHour + 1) % 12 || 12; }
          if (clockEl) clockEl.textContent = clockHour + ':' + String(clockMin).padStart(2, '0') + ' AM';
        });
    }

    function startCountdown() {
      gsap.timeline({ repeat: -1 })
        .to({}, { duration: 1 })
        .call(() => {
          countdownSec--;
          if (countdownSec < 0) countdownSec = 299;
          const m = Math.floor(countdownSec / 60);
          const s = String(countdownSec % 60).padStart(2, '0');
          if (countEl) countEl.textContent = m + ':' + s;
        });
    }

    ScrollTrigger.create({
      trigger: mockup.closest('.tab__panel') || mockup,
      start: 'top 70%', once: true,
      onEnter: () => { buildTaskLoop(); startClock(); startCountdown(); }
    });
  }

  /* ──────────────────────────────────────────────────────────────
     17. HERO METRIC COUNTERS
  ────────────────────────────────────────────────────────────── */
  function initHeroMetricCounters() {
    document.querySelectorAll('.hero__metric-value[data-count]').forEach((el, i) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const decimal = el.dataset.decimal ? parseInt(el.dataset.decimal) : 0;
      const obj = { v: 0 };
      gsap.to(obj, {
        v: target, duration: 1.8, ease: EASE_POWER, delay: 0.3 + i * 0.2,
        onUpdate: () => el.textContent = prefix + obj.v.toFixed(decimal) + suffix
      });
    });

    // Generic counters
    document.querySelectorAll('[data-count]:not(.hero__metric-value)').forEach(el => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const prefix = el.dataset.prefix || '';
      const decimal = el.dataset.decimal ? parseInt(el.dataset.decimal) : 0;
      const obj = { v: 0 };

      ScrollTrigger.create({
        trigger: el, start: 'top 80%', once: true,
        onEnter: () => {
          gsap.to(obj, {
            v: target, duration: 1.8, ease: EASE_POWER,
            onUpdate: () => el.textContent = prefix + obj.v.toFixed(decimal) + suffix
          });
        }
      });
    });
  }

  /* ──────────────────────────────────────────────────────────────
     18. SCROLL HINT FADE-OUT
  ────────────────────────────────────────────────────────────── */
  function initScrollHint() {
    const hint = document.getElementById('scrollHint');
    if (!hint) return;
    let hidden = false;
    function hide() {
      if (hidden) return;
      hidden = true;
      gsap.to(hint, { autoAlpha: 0, duration: 0.6, ease: 'power2.out', onComplete: () => hint.classList.add('hidden') });
      window.removeEventListener('scroll', hide);
    }
    window.addEventListener('scroll', hide, { passive: true, once: true });
  }

  /* ──────────────────────────────────────────────────────────────
     19. HERO VISUAL — fade + slight parallax on scroll
  ────────────────────────────────────────────────────────────── */
  function initHeroVisualScroll() {
    const visual = document.querySelector('.hero__visual');
    if (!visual) return;

    // If already in viewport on page load — show immediately
    const rect = visual.getBoundingClientRect();
    const alreadyVisible = rect.top < window.innerHeight;

    if (alreadyVisible) {
      // Already visible: fade in from 0 after short delay for polish
      gsap.set(visual, { opacity: 0 });
      gsap.to(visual, { opacity: 1, duration: 0.9, ease: EASE_POWER, delay: 0.3 });
    } else {
      // Below viewport: start invisible, fade in when scrolled to
      gsap.set(visual, { opacity: 0 });
      ScrollTrigger.create({
        trigger: visual,
        start: 'top 95%',
        once: true,
        onEnter: () => gsap.to(visual, { opacity: 1, duration: 0.9, ease: EASE_POWER })
      });
    }
  }
})();
