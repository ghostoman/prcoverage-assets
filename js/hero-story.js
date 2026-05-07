/* ═══════════════════════════════════════════════════════════════
   HERO STORY ANIMATION — GSAP-only, 3-phase loop
   White bg always on — only content fades in/out, not the phase bg
   Webflow-compatible
═══════════════════════════════════════════════════════════════ */

function initHeroStory3Phase() {
  const root = document.getElementById('heroStory');
  if (!root) return;

  const DUR = {
    intro:     1.2,
    collage:   2.0,
    question:  1.4,
    fadeOut:   0.4,
    word:      0.36,
    wordStag:  0.07,
    slot:      0.38,
    slotStag:  0.09,
    model:     0.36,
    modelStag: 0.13,
  };

  const phases = {
    intro:    root.querySelector('[data-phase="intro"]'),
    collage:  root.querySelector('[data-phase="collage"]'),
    question: root.querySelector('[data-phase="question"]'),
  };

  if (!phases.intro || !phases.collage || !phases.question) return;

  // All phase containers always visible (white bg never fades)
  gsap.set(Object.values(phases), { autoAlpha: 1 });

  // Gather content elements per phase
  const content = {
    intro: phases.intro.querySelectorAll('.hs-word'),
    collage: [
      phases.collage.querySelector('.hs-collage__eyebrow'),
      ...phases.collage.querySelectorAll('.hs-collage__word'),
      ...phases.collage.querySelectorAll('.hs-collage__slot'),
    ].filter(Boolean),
    question: [
      ...phases.question.querySelectorAll('.hs-question__text .hs-word'),
      ...phases.question.querySelectorAll('.hs-model'),
      phases.question.querySelector('.hs-qmark'),
    ].filter(Boolean),
  };

  // All content starts invisible
  gsap.set(content.intro,    { opacity: 0, y: 18 });
  gsap.set(content.collage,  { opacity: 0, y: 14 });
  gsap.set(content.question, { opacity: 0, y: 12 });
  gsap.set(phases.question.querySelector('.hs-qmark'), { scale: 0.6 });

  // Stacking: phase divs sit on top of each other via position:absolute.
  // To avoid collage/question showing through intro (they're all visible),
  // we control which phase is "on top" via z-index, and only animate
  // the TOP phase's content. Phases below are covered.
  gsap.set(phases.intro,    { zIndex: 3 });
  gsap.set(phases.collage,  { zIndex: 2 });
  gsap.set(phases.question, { zIndex: 1 });

  // ─── Build looping timeline ──────────────────────────────────

  function buildLoop() {
    const master = gsap.timeline({ repeat: -1 });

    // ── INTRO ────────────────────────────────────────────────
    // Bring intro to top
    master.set(phases.intro, { zIndex: 3 })
          .set(phases.collage,  { zIndex: 2 })
          .set(phases.question, { zIndex: 1 });

    // Animate words in
    master.fromTo(content.intro,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: DUR.word, ease: 'power3.out', stagger: DUR.wordStag }
    );

    // Hold
    master.to({}, { duration: DUR.intro });

    // Fade out content only
    master.to(content.intro, {
      opacity: 0, y: -10,
      duration: DUR.fadeOut, ease: 'power2.in',
      stagger: 0.03,
    });

    // ── COLLAGE ──────────────────────────────────────────────
    // Bring collage to top
    master.set(phases.collage, { zIndex: 3 })
          .set(phases.intro,    { zIndex: 2 })
          .set(phases.question, { zIndex: 1 });

    // Reset collage content positions
    master.set(content.collage, { opacity: 0, y: 14 });

    const eyebrow = phases.collage.querySelector('.hs-collage__eyebrow');
    const cWords  = phases.collage.querySelectorAll('.hs-collage__word');
    const slots   = phases.collage.querySelectorAll('.hs-collage__slot');

    master.to(eyebrow, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' })
          .to(cWords,  { opacity: 1, y: 0, duration: 0.4, ease: 'power3.out', stagger: 0.08 }, '<+0.15')
          .to(slots,   { opacity: 1, y: 0, duration: DUR.slot, ease: 'power3.out', stagger: DUR.slotStag }, '<+0.3');

    // Hold
    master.to({}, { duration: DUR.collage });

    // Fade out content only
    master.to(content.collage, {
      opacity: 0, y: -10,
      duration: DUR.fadeOut, ease: 'power2.in',
      stagger: 0.02,
    });

    // ── QUESTION ─────────────────────────────────────────────
    // Bring question to top
    master.set(phases.question, { zIndex: 3 })
          .set(phases.intro,    { zIndex: 2 })
          .set(phases.collage,  { zIndex: 1 });

    // Reset question content positions
    master.set(content.question, { opacity: 0, y: 12 });
    master.set(phases.question.querySelector('.hs-qmark'), { scale: 0.6, y: 8 });

    const qWords = phases.question.querySelectorAll('.hs-question__text .hs-word');
    const models = phases.question.querySelectorAll('.hs-model');
    const qmark  = phases.question.querySelector('.hs-qmark');

    master.to(qWords,  { opacity: 1, y: 0, duration: DUR.word, ease: 'power3.out', stagger: DUR.wordStag })
          .to(models,  { opacity: 1, y: 0, duration: DUR.model, ease: 'power3.out', stagger: DUR.modelStag }, '<+0.7')
          .to(qmark,   { opacity: 1, scale: 1, y: 0, duration: 0.55, ease: 'back.out(1.8)' }, '<+0.5')
          .to(qmark,   { scale: 1.08, duration: 0.7, ease: 'sine.inOut', yoyo: true, repeat: 1 }, '<+0.3');

    // Hold
    master.to({}, { duration: DUR.question });

    // Fade out content only
    master.to(content.question, {
      opacity: 0,
      duration: DUR.fadeOut, ease: 'power2.in',
    });

    return master;
  }

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    gsap.set(content.intro, { opacity: 1, y: 0 });
    return;
  }

  const masterTl = buildLoop();

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) masterTl.pause();
    else masterTl.resume();
  });
}
