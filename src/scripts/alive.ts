// Makes the diagrams feel alive, and keeps them usable on small screens:
//  - full-screen viewer for figures ("Enlarge" / tap on phones)
//  - edge fades on sideways-scrolling tables and code
//  - data dots flowing along connectors (SVG SMIL, paused off screen)
//  - sequence diagrams play their messages one after another
//  - Gantt bars grow in, a "today" line marks the current date
//  - reveal on scroll, count-up numbers
// All motion is skipped for prefers-reduced-motion; print shows the
// static diagrams (print.css).

const SVG = 'http://www.w3.org/2000/svg';
const root = document.documentElement;
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
root.classList.add('js-alive');
if (!reduce) root.classList.add('motion');

const svgs = Array.from(document.querySelectorAll<SVGSVGElement>('.figure-canvas > svg'));

/* ---------- Flow dots on connectors ---------- */
let uid = 0;
const CONNECTORS = 'path[marker-end], path[marker-start], line[marker-end], .ar path, .st-edge, .screenflow > path';

function asPath(el: SVGGeometryElement): SVGPathElement {
  if (el instanceof SVGPathElement) return el;
  // <line>: draw an invisible twin path for the dot to follow
  const l = el as unknown as SVGLineElement;
  const p = document.createElementNS(SVG, 'path');
  p.setAttribute('d', `M${l.x1.baseVal.value} ${l.y1.baseVal.value} L${l.x2.baseVal.value} ${l.y2.baseVal.value}`);
  p.setAttribute('fill', 'none');
  p.setAttribute('stroke', 'none');
  el.before(p);
  return p;
}

function dot(path: SVGPathElement, color: string, dur: number, begin: number, reverse: boolean, small: boolean) {
  const g = document.createElementNS(SVG, 'g');
  g.setAttribute('class', 'pulse');
  g.setAttribute('aria-hidden', 'true');
  g.style.setProperty('--c', color);
  g.innerHTML =
    `<circle r="${small ? 6 : 8}" class="pulse-halo"/><circle r="${small ? 2.6 : 3.4}" class="pulse-core"/>` +
    `<animateMotion dur="${dur}s" begin="${begin}s" repeatCount="indefinite" calcMode="linear"` +
    (reverse ? ' keyPoints="1;0" keyTimes="0;1"' : '') + `><mpath href="#${path.id}"/></animateMotion>` +
    `<animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.12;.85;1" dur="${dur}s" begin="${begin}s" repeatCount="indefinite"/>`;
  path.after(g);
}

function addFlow(svg: SVGSVGElement) {
  if (svg.matches('.seq, .gantt')) return;
  const seen = new Set<Element>();
  svg.querySelectorAll<SVGGeometryElement>(CONNECTORS).forEach((el, i) => {
    if (seen.has(el) || el.closest('.icon, defs, marker, .pulse')) return;
    seen.add(el);
    const cs = getComputedStyle(el);
    if (cs.stroke === 'none' || cs.display === 'none') return;
    const path = asPath(el);
    let len = 0;
    try { len = path.getTotalLength(); } catch { return; }
    if (len < 24) return;
    const dashed = cs.strokeDasharray !== 'none' && cs.strokeDasharray !== '';
    if (dashed) { el.classList.add('flow-dashed'); return; }   // marching dashes, no dot
    if (!path.id) path.id = `fp${++uid}`;
    const muted = el.closest('.ar-muted, .muted, .reply') !== null;
    const color = cs.stroke;
    const speed = muted ? 55 : 95;                               // px per second
    const dur = Math.min(6, Math.max(1.4, len / speed));
    const offset = ((i * 0.37) % 1) * dur;                       // stagger neighbours
    const twoWay = el.hasAttribute('marker-start') && el.hasAttribute('marker-end');
    dot(path, color, dur, -offset, false, muted);
    if (twoWay) dot(path, color, dur, -offset - dur / 2, true, muted);
    else if (len > 520) dot(path, color, dur, -offset - dur / 2, false, muted);
  });
}

/* ---------- Sequence diagrams: play messages in order ---------- */
type Player = { stop(): void };
function playSequence(svg: SVGSVGElement): Player {
  const rows = Array.from(svg.querySelectorAll<SVGGElement>('g')).filter((g) => g.querySelector(':scope > path.msg'));
  if (!rows.length) return { stop() {} };
  const mover = document.createElementNS(SVG, 'g');
  mover.setAttribute('class', 'pulse seq-dot');
  mover.setAttribute('aria-hidden', 'true');
  mover.innerHTML = '<circle r="11" class="pulse-halo"/><circle r="4.5" class="pulse-core"/>';
  svg.append(mover);

  let i = 0, t0 = 0, raf = 0, wait = 0, visible = false, stopped = false;
  const paths = rows.map((r) => r.querySelector<SVGPathElement>(':scope > path.msg')!);
  const lens = paths.map((p) => p.getTotalLength());

  function frame(now: number) {
    if (stopped || !visible) return;
    if (!t0) {
      t0 = now;
      rows.forEach((r, k) => { r.classList.toggle('seq-on', k === i); r.classList.toggle('seq-done', k < i); });
      mover.style.setProperty('--c', getComputedStyle(paths[i]).stroke);
    }
    const dur = Math.min(1300, Math.max(520, lens[i] * 1.1));
    const k = Math.min(1, (now - t0) / dur);
    const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
    const pt = paths[i].getPointAtLength(e * lens[i]);
    mover.setAttribute('transform', `translate(${pt.x} ${pt.y})`);
    mover.style.opacity = k > 0.94 ? String((1 - k) / 0.06) : '1';
    if (k < 1) { raf = requestAnimationFrame(frame); return; }
    i++; t0 = 0;
    const pause = i >= rows.length ? 1800 : 260;
    if (i >= rows.length) i = 0;
    wait = window.setTimeout(() => {
      if (i === 0) rows.forEach((r) => r.classList.remove('seq-on', 'seq-done'));
      raf = requestAnimationFrame(frame);
    }, pause);
  }
  const io = new IntersectionObserver(([en]) => {
    visible = en.isIntersecting;
    cancelAnimationFrame(raf); clearTimeout(wait);
    if (visible) { t0 = 0; raf = requestAnimationFrame(frame); }
  }, { threshold: 0.25 });
  io.observe(svg);
  return { stop() { stopped = true; io.disconnect(); cancelAnimationFrame(raf); clearTimeout(wait); mover.remove(); } };
}

/* ---------- Gantt: today line ---------- */
function addToday(svg: SVGSVGElement) {
  const d = svg.dataset;
  if (!d.start || !d.end) return;
  const start = +d.start, end = +d.end, now = Date.now();
  if (now < start || now > end) return;
  const x = +d.x0! + ((now - start) / (end - start)) * (+d.x1! - +d.x0!);
  const g = document.createElementNS(SVG, 'g');
  g.setAttribute('class', 'g-today');
  g.setAttribute('aria-hidden', 'true');
  g.innerHTML =
    `<line x1="${x}" x2="${x}" y1="${+d.top! - 30}" y2="${d.bottom}"/>` +
    `<circle cx="${x}" cy="${+d.top! - 30}" r="4.5" class="g-today-dot"/>` +
    `<circle cx="${x}" cy="${+d.top! - 30}" r="4.5" class="g-today-ring"/>` +
    `<text x="${x + 8}" y="${d.bottom}" dy="-6" class="g-today-t">Today</text>`;
  svg.append(g);
}

/* ---------- Pause SMIL off screen ---------- */
const pauser = new IntersectionObserver((entries) => {
  entries.forEach((en) => {
    const s = en.target as SVGSVGElement;
    s.classList.toggle('live', en.isIntersecting);
    if (en.isIntersecting) s.unpauseAnimations(); else s.pauseAnimations();
  });
}, { rootMargin: '120px 0px' });

if (!reduce) {
  svgs.forEach((svg) => {
    addFlow(svg);
    if (svg.matches('.seq')) playSequence(svg);
    if (svg.matches('.gantt')) {
      svg.querySelectorAll<SVGElement>('.g-bar, .g-ms').forEach((b, k) => b.style.setProperty('--i', String(k)));
      addToday(svg);
    }
    svg.pauseAnimations();
    pauser.observe(svg);
  });
}

/* ---------- Reveal on scroll + count-up ---------- */
// Section headings slide in, each block rises into place; the items of a
// grid or list inside a block (cards, tiles, rows) follow one by one.
const revealSet = new Set<HTMLElement>();
const mark = (el: HTMLElement, cls = 'reveal', delay = 0) => {
  if (revealSet.has(el)) return;
  revealSet.add(el);
  el.classList.add(cls);
  if (delay) el.style.setProperty('--d', `${delay}ms`);
};
const LAYOUT = /^(grid|inline-grid|flex|inline-flex)$/;
const STAGGER_SKIP = '.figure, .table-wrap, .dt-wrap, .code, figure, table, svg, details';
document.querySelectorAll<HTMLElement>('.section').forEach((sec) => {
  Array.from(sec.children).forEach((child) => {
    const el = child as HTMLElement;
    if (el.matches('.section-head')) { mark(el, 'reveal-head'); return; }
    if (el.matches('.takeaway')) { mark(el, 'reveal-side'); return; }
    const parts = el.matches('.block') ? Array.from(el.children) as HTMLElement[] : [el];
    parts.forEach((part) => {
      const kids = Array.from(part.children) as HTMLElement[];
      const cs = getComputedStyle(part);
      if (LAYOUT.test(cs.display) && kids.length >= 2 && kids.length <= 16 && !part.matches(STAGGER_SKIP)) {
        kids.forEach((k, i) => mark(k, 'reveal', Math.min(i * 70, 560)));
      } else {
        mark(part);
      }
    });
  });
});
document.querySelectorAll<HTMLElement>('.figure').forEach((f) => { if (!f.closest('.reveal')) mark(f); });
const revealables = Array.from(revealSet);

const countUp = (el: HTMLElement) => {
  const node = Array.from(el.childNodes).find((n) => n.nodeType === 3 && n.textContent!.trim());
  const target = node ? parseInt(node.textContent!.trim(), 10) : NaN;
  if (!node || !/^\d+$/.test(node.textContent!.trim()) || target < 2) return;
  const t0 = performance.now();
  const tick = (now: number) => {
    const k = Math.min(1, (now - t0) / 900);
    node.textContent = String(Math.round(target * (1 - Math.pow(1 - k, 3))));
    if (k < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
};
const show = (el: HTMLElement) => {
  el.classList.add('in');
  // Hover transitions take over only once the reveal has played
  window.setTimeout(() => el.classList.add('done'), 760 + (parseInt(el.style.getPropertyValue('--d'), 10) || 0));
  (el.matches('.v') ? [el] : Array.from(el.querySelectorAll<HTMLElement>('.v'))).forEach(countUp);
};
if (reduce || !('IntersectionObserver' in window)) {
  revealables.forEach((el) => el.classList.add('in'));
} else {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      show(en.target as HTMLElement);
      io.unobserve(en.target);
    });
  }, { threshold: 0, rootMargin: '0px 0px -8% 0px' });
  revealables.forEach((el) => io.observe(el));
}
window.addEventListener('beforeprint', () => revealables.forEach((el) => el.classList.add('in')));

/* ---------- Reading progress + back to top ---------- */
const progress = document.createElement('div');
progress.className = 'scroll-progress';
progress.setAttribute('aria-hidden', 'true');
progress.innerHTML = '<span></span>';
const toTop = document.createElement('button');
toTop.type = 'button';
toTop.className = 'to-top';
toTop.setAttribute('aria-label', 'Back to top');
toTop.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m5 12 7-7 7 7"/><path d="M12 19V5"/></svg>';
toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
document.body.append(progress, toTop);
const bar = progress.firstElementChild as HTMLElement;
let progTick = false;
function onScroll() {
  const max = root.scrollHeight - window.innerHeight;
  const k = max > 0 ? Math.min(1, window.scrollY / max) : 0;
  bar.style.transform = `scaleX(${k})`;
  toTop.classList.toggle('show', window.scrollY > window.innerHeight * 1.2);
  progTick = false;
}
window.addEventListener('scroll', () => { if (!progTick) { progTick = true; requestAnimationFrame(onScroll); } }, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

/* ---------- Sideways scrollers: edge fades ---------- */
const scrollers = document.querySelectorAll<HTMLElement>('.table-wrap, .dt-wrap, .code, .flow, .grid-wf');
function markScroll(el: HTMLElement) {
  const max = el.scrollWidth - el.clientWidth;
  if (max <= 2) { el.removeAttribute('data-scroll'); return; }
  el.dataset.scroll = el.scrollLeft <= 2 ? 'start' : el.scrollLeft >= max - 2 ? 'end' : 'middle';
}
scrollers.forEach((el) => {
  markScroll(el);
  el.addEventListener('scroll', () => markScroll(el), { passive: true });
});
new ResizeObserver((entries) => entries.forEach((en) => markScroll(en.target as HTMLElement)))
  .observe(document.body);
window.addEventListener('resize', () => scrollers.forEach(markScroll));

/* ---------- Full-screen viewer ---------- */
const viewer = document.createElement('dialog');
viewer.className = 'viewer';
viewer.innerHTML = `
  <div class="viewer-bar">
    <p class="viewer-title"></p>
    <button type="button" class="viewer-btn" data-z="-1" aria-label="Zoom out"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M5 12h14"/></svg></button>
    <button type="button" class="viewer-btn" data-z="1" aria-label="Zoom in"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M5 12h14M12 5v14"/></svg></button>
    <button type="button" class="viewer-btn" data-close aria-label="Close"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
  </div>
  <div class="viewer-body"></div>`;
document.body.append(viewer);
const vTitle = viewer.querySelector<HTMLElement>('.viewer-title')!;
const vBody = viewer.querySelector<HTMLElement>('.viewer-body')!;
let vSvg: SVGSVGElement | null = null, vBase = 0, vZoom = 1, vPlayer: Player | null = null;

function setZoom(z: number) {
  vZoom = Math.min(2.5, Math.max(0.5, z));
  if (vSvg) vSvg.style.width = `${Math.round(vBase * vZoom)}px`;
}
function openViewer(fig: HTMLElement) {
  const canvas = fig.querySelector<HTMLElement>('.figure-canvas')!;
  const src = canvas.querySelector<SVGSVGElement>(':scope > svg');
  if (!src) return;
  vTitle.textContent = canvas.getAttribute('aria-label') ?? '';
  const clone = src.cloneNode(true) as SVGSVGElement;
  clone.querySelectorAll('.seq-dot').forEach((n) => n.remove());
  clone.querySelectorAll('.seq-on, .seq-done').forEach((n) => n.classList.remove('seq-on', 'seq-done'));
  clone.setAttribute('role', 'img');
  clone.setAttribute('aria-label', vTitle.textContent);
  vBody.replaceChildren(clone);
  vSvg = clone;
  vBase = Math.max(+(canvas.dataset.minW ?? 860), window.innerWidth - 32);
  setZoom(1);
  const hint = document.createElement('div');
  hint.className = 'viewer-hint';
  hint.textContent = 'Drag to move · pinch or +/− to zoom';
  vBody.append(hint);
  viewer.showModal();
  root.style.overflow = 'hidden';
  if (!reduce && clone.matches('.seq')) vPlayer = playSequence(clone);
}
function cleanupViewer() {
  root.style.overflow = '';
  vPlayer?.stop(); vPlayer = null;
  vBody.replaceChildren(); vSvg = null;
}
function closeViewer() { if (viewer.open) viewer.close(); cleanupViewer(); }
viewer.addEventListener('close', cleanupViewer);   // Esc key
viewer.querySelector('[data-close]')!.addEventListener('click', closeViewer);
viewer.querySelectorAll<HTMLButtonElement>('[data-z]').forEach((b) =>
  b.addEventListener('click', () => setZoom(vZoom * (b.dataset.z === '1' ? 1.25 : 0.8))));

document.querySelectorAll<HTMLElement>('[data-figure]').forEach((fig) => {
  fig.querySelector('[data-fig-zoom]')?.addEventListener('click', () => openViewer(fig));
  // On phones and tablets a tap on the diagram itself opens it too
  fig.querySelector('.figure-canvas')?.addEventListener('click', () => {
    if (window.matchMedia('(max-width: 1023px)').matches) openViewer(fig);
  });
});

// Drag to pan with a mouse (touch already scrolls natively)
let drag: { x: number; y: number; l: number; t: number } | null = null;
vBody.addEventListener('pointerdown', (e) => {
  if (e.pointerType !== 'mouse') return;
  drag = { x: e.clientX, y: e.clientY, l: vBody.scrollLeft, t: vBody.scrollTop };
  vBody.setPointerCapture(e.pointerId);
});
vBody.addEventListener('pointermove', (e) => {
  if (!drag) return;
  vBody.scrollLeft = drag.l - (e.clientX - drag.x);
  vBody.scrollTop = drag.t - (e.clientY - drag.y);
});
vBody.addEventListener('pointerup', () => { drag = null; });
