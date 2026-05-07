/**
 * scrollytelling.js
 * Simple & reliable sticky scrollytelling.
 * Section = sticky 100vh. Inner grid = centered via CSS grid place-items.
 * Header fades out smoothly as user scrolls in.
 */

(function () {
  'use strict';

  const section = document.querySelector('.scrolly');
  if (!section) return;

  const header = section.querySelector('.section-header');
  const inner  = section.querySelector('.scrolly__inner');
  const steps  = Array.from(section.querySelectorAll('.scrolly__step'));
  const panels = Array.from(section.querySelectorAll('.scrolly__panel'));
  if (!steps.length || !panels.length) return;

  const N = steps.length;

  /* ─── Wrapper provides scroll budget ─── */
  const wrapper = document.createElement('div');
  wrapper.className = 'scrolly-wrapper';
  section.parentNode.insertBefore(wrapper, section);
  wrapper.appendChild(section);

  const setH = () => { wrapper.style.height = (N + 1) * window.innerHeight + 'px'; };
  setH();
  window.addEventListener('resize', setH);

  /* ─── Section: sticky full-screen ─── */
  section.style.cssText = `
    position: sticky;
    top: 0;
    height: 100vh;
    overflow: hidden;
  `;

  /* ─── Header: overlaid at top center, fades on scroll ─── */
  if (header) {
    header.style.cssText = `
      position: absolute;
      top: 0; left: 0; right: 0;
      padding: 52px 40px 0;
      text-align: center;
      z-index: 2;
      pointer-events: none;
      will-change: opacity, transform;
    `;
  }

  /* ─── Inner: full section size, grid centered ─── */
  inner.style.cssText = `
    position: absolute;
    inset: 0;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    place-content: center;
    align-items: center;
    max-width: 1200px;
    width: 100%;
    margin: 0 auto;
    padding: 0 40px;
    box-sizing: border-box;
  `;

  /* ─── Panels ─── */
  const sticky = section.querySelector('.scrolly__sticky');
  if (sticky) sticky.style.cssText = 'position:relative;';

  panels.forEach((p, i) => {
    p.style.cssText = `
      opacity: ${i === 0 ? 1 : 0};
      pointer-events: ${i === 0 ? 'auto' : 'none'};
      transition: opacity 0.5s ease;
      position: ${i === 0 ? 'relative' : 'absolute'};
      top: 0; left: 0; right: 0;
    `;
  });

  /* ─── Progress bar ─── */
  const bar  = document.createElement('div');
  const fill = document.createElement('div');
  bar.style.cssText  = 'position:fixed;bottom:0;left:0;right:0;height:3px;background:rgba(255,255,255,0.08);z-index:9999;opacity:0;transition:opacity .3s ease;pointer-events:none;';
  fill.style.cssText = 'height:100%;width:0%;background:linear-gradient(90deg,#b71baf,#ff5463,#ff87ba);border-radius:0 2px 2px 0;box-shadow:0 0 8px rgba(255,135,186,.7);transition:width .05s linear;';
  bar.appendChild(fill);
  document.body.appendChild(bar);

  /* ─── Message animation ─── */
  const animated = new Set();
  function animateMsgs(idx) {
    if (animated.has(idx)) return;
    animated.add(idx);
    panels[idx].querySelectorAll('.chat-msg').forEach((m, i) => {
      m.style.cssText = 'opacity:0;transform:translateY(14px);transition:none;';
      setTimeout(() => {
        m.style.cssText = 'opacity:1;transform:translateY(0);transition:opacity .42s ease,transform .42s ease;';
      }, 80 + i * 160);
    });
  }

  /* ─── Activate step ─── */
  let activeIdx = -1;
  function activate(idx) {
    if (idx === activeIdx) return;
    activeIdx = idx;
    steps.forEach((s, i) => {
      s.classList.toggle('current', i === idx);
      s.classList.toggle('active',  i <= idx);
    });
    panels.forEach((p, i) => {
      const on = i === idx;
      p.style.opacity       = on ? '1' : '0';
      p.style.pointerEvents = on ? 'auto' : 'none';
      p.style.position      = on ? 'relative' : 'absolute';
      if (on) animateMsgs(i);
    });
  }

  /* ─── Scroll handler ─── */
  function onScroll() {
    const rect   = wrapper.getBoundingClientRect();
    const VH     = window.innerHeight;
    const total  = wrapper.offsetHeight - VH;
    const inView = rect.top <= 0 && rect.bottom >= VH;

    /* Header fades as section enters view */
    if (header) {
      const t = Math.max(0, Math.min(1, rect.top / (VH * 0.4)));
      header.style.opacity   = t;
      header.style.transform = `translateY(${(1 - t) * -24}px)`;
    }

    bar.style.opacity = inView ? '1' : '0';

    if (inView) {
      const p = Math.max(0, Math.min(1, total > 0 ? -rect.top / total : 0));
      fill.style.width = (p * 100) + '%';
      activate(Math.min(Math.floor(p * N), N - 1));
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  activate(0);
  animateMsgs(0);
  onScroll();

})();
