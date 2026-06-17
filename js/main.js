/* ============================================================
   ONE-PAGE ORBIT Design — main.js
   Zero dependencies. Vanilla ES6+.
   ============================================================ */

'use strict';

/* ============================================================
   1. orbit engine
   Positions nodes on a circle and handles rotation
   ============================================================ */
(function initOrbit() {
  const ring     = document.getElementById('orbit-ring');
  const nodes    = Array.from(document.querySelectorAll('.orbit-node'));
  const panel    = document.getElementById('content-panel');
  if (!ring || !nodes.length || !panel) return;

  const RADIUS    = 155;          // px — must match --orbit-radius
  const CENTER    = 210;          // half of --orbit-size
  const BASE_ANGLE = -90;         // deg, 12 o'clock start
  const COUNT     = nodes.length;
  const STEP      = 360 / COUNT;  // degrees between nodes

  // Track current rotation offset
  let rotationOffset = 0;
  let activeIndex    = 0;
  let isAnimating    = false;

  // --- Draw connector line from center to active node ---
  const connector = document.createElement('div');
  connector.className = 'orbit-connector';
  ring.appendChild(connector);

  function placeNodes(offset = 0) {
    nodes.forEach((node, i) => {
      const angle = ((BASE_ANGLE + i * STEP + offset) * Math.PI) / 180;
      const x = CENTER + RADIUS * Math.cos(angle);
      const y = CENTER + RADIUS * Math.sin(angle);
      node.style.left = `${x}px`;
      node.style.top  = `${y}px`;
      node.style.transform = 'translate(-50%, -50%)';
    });

    // Update connector to point at active node
    const activeAngle = ((BASE_ANGLE + activeIndex * STEP + offset) * Math.PI) / 180;
    const nx = CENTER + RADIUS * Math.cos(activeAngle);
    const ny = CENTER + RADIUS * Math.sin(activeAngle);
    const dx = nx - CENTER;
    const dy = ny - CENTER;
    const len = Math.sqrt(dx * dx + dy * dy) - 36; // subtract avatar radius
    const angleDeg = (Math.atan2(dy, dx) * 180) / Math.PI;
    connector.style.width  = `${len}px`;
    connector.style.transform = `rotate(${angleDeg}deg)`;
  }

  // Initial placement
  placeNodes(0);

  // --- Section switching ---
  function getSection(id) {
    return document.getElementById(`section-${id}`);
  }

  function switchTo(targetIndex, targetId) {
    if (isAnimating || targetIndex === activeIndex) return;
    isAnimating = true;

    const prevSection = getSection(nodes[activeIndex].dataset.section);
    const nextSection = getSection(targetId);

    // Determine rotation direction (shortest path)
    let delta = targetIndex - activeIndex;
    if (delta > COUNT / 2)  delta -= COUNT;
    if (delta < -COUNT / 2) delta += COUNT;

    // Animate orbit rotation with requestAnimationFrame
    const targetOffset = rotationOffset - delta * STEP;
    const startOffset  = rotationOffset;
    const startTime    = performance.now();
    const DURATION     = 420; // ms

    function animate(now) {
      const t = Math.min((now - startTime) / DURATION, 1);
      const ease = t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; // ease in-out quad
      const current = startOffset + (targetOffset - startOffset) * ease;
      placeNodes(current);

      if (t < 1) {
        requestAnimationFrame(animate);
      } else {
        rotationOffset = targetOffset;
        isAnimating = false;
      }
    }

    requestAnimationFrame(animate);

    // Swap active node styles
    nodes[activeIndex].classList.remove('active');
    nodes[activeIndex].setAttribute('aria-pressed', 'false');
    nodes[targetIndex].classList.add('active');
    nodes[targetIndex].setAttribute('aria-pressed', 'true');

    // Transition sections
    if (prevSection) prevSection.classList.add('exit');
    setTimeout(() => {
      if (prevSection) {
        prevSection.classList.remove('active', 'exit');
      }
      if (nextSection) {
        nextSection.classList.add('active');
        nextSection.focus({ preventScroll: true });
      }
    }, 120);

    // Update mobile nav if it exists
    document.querySelectorAll('.mobile-nav-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.section === targetId);
    });

    activeIndex = targetIndex;
  }

  // --- Bind node clicks ---
  nodes.forEach((node, i) => {
    node.addEventListener('click', () => {
      switchTo(i, node.dataset.section);
    });
  });

  // --- CTA buttons inside content ---
  document.querySelectorAll('[data-nav]').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetSection = btn.dataset.nav;
      const targetIndex = nodes.findIndex(n => n.dataset.section === targetSection);
      if (targetIndex !== -1) switchTo(targetIndex, targetSection);
    });
  });

  // Expose for mobile nav
  window._orbitSwitch = switchTo;
  window._orbitNodes  = nodes;
})();


/* ============================================================
   2. MOBILE NAV — injected if viewport is narrow
   ============================================================ */
(function initMobileNav() {
  function inject() {
    if (document.querySelector('.mobile-nav')) return;

    const sections = [
      { id: 'intro',   label: 'intro' },
      { id: 'work',    label: 'work' },
      { id: 'projects',   label: 'projects' },
      { id: 'contact', label: 'contact' },
    ];

    const nav = document.createElement('nav');
    nav.className = 'mobile-nav';
    nav.setAttribute('aria-label', 'Mobile navigation');

    sections.forEach(({ id, label }, i) => {
      const btn = document.createElement('button');
      btn.className = `mobile-nav-btn${i === 0 ? ' active' : ''}`;
      btn.dataset.section = id;
      btn.textContent = label;
      btn.setAttribute('aria-label', `${label} section`);
      btn.addEventListener('click', () => {
        if (window._orbitSwitch && window._orbitNodes) {
          const idx = window._orbitNodes.findIndex(n => n.dataset.section === id);
          window._orbitSwitch(idx, id);
        }
        // Fallback for mobile without orbit
        document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
        document.getElementById(`section-${id}`)?.classList.add('active');
        document.querySelectorAll('.mobile-nav-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
      nav.appendChild(btn);
    });

    document.body.appendChild(nav);
  }

  const mq = window.matchMedia('(max-width: 768px)');
  if (mq.matches) inject();
  mq.addEventListener('change', e => { if (e.matches) inject(); });
})();


/* ============================================================
   3. KEYBOARD NAV — arrow keys cycle through orbit nodes
   ============================================================ */
(function initKeyboard() {
  document.addEventListener('keydown', e => {
    if (!window._orbitSwitch || !window._orbitNodes) return;
    const nodes = window._orbitNodes;
    const current = nodes.findIndex(n => n.classList.contains('active'));
    if (current === -1) return;

    let next = -1;
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      next = (current + 1) % nodes.length;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      next = (current - 1 + nodes.length) % nodes.length;
    }

    if (next !== -1) {
      e.preventDefault();
      window._orbitSwitch(next, nodes[next].dataset.section);
    }
  });
})();