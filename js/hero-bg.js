/**
 * hero-bg.js
 * PRC logos constantly rotate via rAF.
 * On scroll — rotation speed multiplies by 3x, then smoothly decays back.
 */

(function () {

  const hero = document.querySelector('.hero');
  if (!hero) return;

  /* ── CSS ─────────────────────────────────────────────── */
  const style = document.createElement('style');
  style.textContent = `
    .hero-bg-wrap {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
      z-index: 0;
    }
    .hero-bg-logo {
      position: absolute;
      will-change: transform;
    }
    .hero-bg-logo svg {
      width: 100%;
      height: 100%;
      display: block;
    }
  `;
  document.head.appendChild(style);

  /* ── SVG gradient def (once, in body) ───────────────── */
  const svgDefs = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svgDefs.setAttribute('width', '0');
  svgDefs.setAttribute('height', '0');
  svgDefs.style.cssText = 'position:absolute;overflow:hidden;width:0;height:0;';
  svgDefs.innerHTML = `
    <defs>
      <linearGradient id="prc-grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%"   stop-color="#b71baf"/>
        <stop offset="50%"  stop-color="#ff5463"/>
        <stop offset="100%" stop-color="#ff87ba"/>
      </linearGradient>
    </defs>
  `;
  document.body.appendChild(svgDefs);

  /* ── SVG paths ───────────────────────────────────────── */
  const PATHS = `
    <path fill="url(#prc-grad)" d="M195.47,101.61c-4.82,0-8.93-3.66-9.41-8.55-.23-2.2-5.75-51.34-52.21-72.79-4.74-2.19-6.81-7.81-4.62-12.55s7.81-6.82,12.55-4.62c56.58,26.11,62.88,85.63,63.12,88.15.49,5.2-3.32,9.82-8.52,10.31-.3.04-.61.05-.91.05Z"/>
    <path fill="url(#prc-grad)" d="M201.97,159.04c-2.12,0-4.25-.71-6.02-2.16-4.02-3.33-4.6-9.28-1.28-13.3,1.38-1.7,32.24-40.36,14.55-88.39-1.81-4.9.71-10.34,5.61-12.15,4.9-1.79,10.34.71,12.15,5.61,21.54,58.48-16.09,105.01-17.7,106.96-1.87,2.26-4.57,3.44-7.3,3.44Z"/>
    <path fill="url(#prc-grad)" d="M163.77,205.76c-4.82,0-8.94-3.67-9.41-8.56-.49-5.19,3.31-9.81,8.51-10.31,2.24-.23,51.34-5.77,72.77-52.21,2.19-4.76,7.82-6.82,12.56-4.63,4.74,2.19,6.81,7.82,4.63,12.56-26.11,56.59-85.63,62.87-88.15,63.11-.3.04-.61.05-.91.05Z"/>
    <path fill="url(#prc-grad)" d="M171.94,231.68c-40.16,0-68.69-23.09-70.21-24.34-4.03-3.34-4.6-9.29-1.27-13.32,3.33-4.02,9.29-4.59,13.31-1.27,1.82,1.49,40.43,32.21,88.37,14.53,4.89-1.8,10.34.7,12.15,5.61s-.71,10.34-5.61,12.15c-12.95,4.77-25.32,6.64-36.74,6.64Z"/>
    <path fill="url(#prc-grad)" d="M119.95,253.77c-1.33,0-2.67-.28-3.96-.87-56.58-26.12-62.87-85.63-63.11-88.15-.49-5.2,3.32-9.82,8.52-10.31,5.22-.59,9.81,3.31,10.31,8.5.23,2.2,5.75,51.33,52.21,72.78,4.74,2.19,6.82,7.82,4.62,12.56-1.59,3.46-5.02,5.5-8.59,5.5Z"/>
    <path fill="url(#prc-grad)" d="M41.15,212.81c-3.85,0-7.47-2.37-8.88-6.19-21.54-58.48,16.09-105.01,17.7-106.96,3.33-4.02,9.29-4.58,13.32-1.27,4.03,3.33,4.6,9.29,1.27,13.31-1.48,1.83-32.2,40.43-14.54,88.38,1.81,4.91-.71,10.34-5.61,12.15-1.08.4-2.19.58-3.27.58Z"/>
    <path fill="url(#prc-grad)" d="M11.76,128.68c-1.33,0-2.67-.28-3.96-.87-4.74-2.19-6.81-7.82-4.62-12.56,26.11-56.58,85.62-62.87,88.14-63.11,5.15-.5,9.82,3.32,10.32,8.52.49,5.19-3.31,9.8-8.5,10.31h0c-2.09.21-51.31,5.69-72.79,52.21-1.59,3.46-5.02,5.5-8.59,5.5Z"/>
    <path fill="url(#prc-grad)" d="M148.37,65.27c-2.12,0-4.24-.7-6-2.15h0c-1.62-1.33-40.31-32.27-88.38-14.55-4.89,1.81-10.34-.7-12.15-5.61-1.81-4.9.71-10.34,5.61-12.15,58.5-21.52,105,16.09,106.95,17.7,4.03,3.33,4.6,9.29,1.27,13.32-1.87,2.27-4.57,3.44-7.3,3.44Z"/>
  `;

  /* ── Logo configs ────────────────────────────────────── */
  // [left%, top%, size_px, opacity, baseRot_deg, baseSpeed_deg/frame, direction]
  const CONFIGS = [
    { l: -4,  t: -8,  s: 340, o: 0.04, r: 0,    spd: 0.04,  dir:  1 },
    { l: 72,  t: 60,  s: 300, o: 0.04, r: 45,   spd: 0.03,  dir: -1 },
    { l: 80,  t: -5,  s: 180, o: 0.07, r: 20,   spd: 0.07,  dir:  1 },
    { l: -3,  t: 55,  s: 160, o: 0.06, r: -30,  spd: 0.08,  dir: -1 },
    { l: 50,  t: 75,  s: 200, o: 0.05, r: 60,   spd: 0.05,  dir:  1 },
    { l: 20,  t: 10,  s: 90,  o: 0.10, r: 15,   spd: 0.12,  dir: -1 },
    { l: 60,  t: 20,  s: 80,  o: 0.09, r: -45,  spd: 0.10,  dir:  1 },
    { l: 88,  t: 45,  s: 100, o: 0.08, r: 80,   spd: 0.13,  dir: -1 },
    { l: 35,  t: 80,  s: 70,  o: 0.11, r: -10,  spd: 0.15,  dir:  1 },
    { l: 5,   t: 30,  s: 85,  o: 0.08, r: 120,  spd: 0.11,  dir: -1 },
    { l: 92,  t: 80,  s: 75,  o: 0.09, r: 200,  spd: 0.09,  dir:  1 },
    { l: 45,  t: 5,   s: 65,  o: 0.10, r: 55,   spd: 0.16,  dir: -1 },
  ];

  /* ── Build DOM ───────────────────────────────────────── */
  const wrap = document.createElement('div');
  wrap.className = 'hero-bg-wrap';
  hero.insertBefore(wrap, hero.firstChild);

  const items = CONFIGS.map(cfg => {
    const div = document.createElement('div');
    div.className = 'hero-bg-logo';
    div.style.cssText = `
      left:    ${cfg.l}%;
      top:     ${cfg.t}%;
      width:   ${cfg.s}px;
      height:  ${cfg.s}px;
      opacity: ${cfg.o};
    `;
    div.innerHTML = `<svg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg">${PATHS}</svg>`;
    wrap.appendChild(div);
    return {
      el:      div,
      angle:   cfg.r,       // current rotation angle
      spd:     cfg.spd,     // base speed deg/frame
      dir:     cfg.dir,     // 1 or -1
    };
  });

  /* ── Scroll velocity tracking ────────────────────────── */
  let scrollBoost   = 1;       // current multiplier (1 = normal, up to 3)
  let lastScrollY   = window.scrollY;
  let scrollVel     = 0;       // px/frame estimated
  let scrollTimeout = null;

  window.addEventListener('scroll', () => {
    const now = window.scrollY;
    scrollVel = Math.abs(now - lastScrollY);
    lastScrollY = now;

    // Boost = 1 + 2 * normalized_velocity (capped at 3x)
    scrollBoost = Math.min(3, 1 + scrollVel * 0.18);

    // Decay back to 1x after scroll stops
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => { scrollVel = 0; }, 80);
  }, { passive: true });

  /* ── Animation loop ──────────────────────────────────── */
  function loop() {
    // Smoothly decay boost back to 1 when not scrolling
    scrollBoost += (1 - scrollBoost) * 0.06;

    items.forEach(item => {
      item.angle += item.spd * item.dir * scrollBoost;
      item.el.style.transform = `rotate(${item.angle}deg)`;
    });

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);

})();
