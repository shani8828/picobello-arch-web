// Document behaviour: active nav link, mobile nav drawer, presentation mode.
// Plain DOM, no framework.

const root = document.documentElement;
const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]'));
const links = new Map(
  Array.from(document.querySelectorAll<HTMLAnchorElement>('[data-nav-link]')).map((a) => [a.dataset.navLink!, a]),
);
const hud = document.querySelector<HTMLElement>('.hud')!;
const hudCount = document.querySelector<HTMLElement>('[data-hud-count]')!;
const hudTitle = document.querySelector<HTMLElement>('[data-hud-title]')!;
const hudBar = document.querySelector<HTMLElement>('[data-hud-bar]')!;
const prevBtn = hud.querySelector<HTMLButtonElement>('[data-step="-1"]')!;
const nextBtn = hud.querySelector<HTMLButtonElement>('[data-step="1"]')!;

const store = {
  get(k: string) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k: string, v: string | null) { try { v === null ? localStorage.removeItem(k) : localStorage.setItem(k, v); } catch { /* storage blocked */ } },
};

/* ---------- Current section (the one crossing 35 % of the viewport) ---------- */
function currentIndex(): number {
  const line = window.innerHeight * 0.35;
  let idx = 0;
  sections.forEach((s, i) => { if (s.getBoundingClientRect().top <= line) idx = i; });
  return idx;
}

let lastIdx = -1;
function update() {
  const idx = currentIndex();
  if (idx === lastIdx) return;
  lastIdx = idx;
  const s = sections[idx];
  links.forEach((a, id) => a.setAttribute('aria-current', String(id === s.id)));
  const title = s.querySelector('h2')?.textContent ?? '';
  hudCount.textContent = `${String(idx + 1).padStart(2, '0')} / ${sections.length}`;
  hudTitle.textContent = title;
  hudBar.style.width = `${((idx + 1) / sections.length) * 100}%`;
  prevBtn.disabled = idx === 0;
  nextBtn.disabled = idx === sections.length - 1;
}
let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => { update(); ticking = false; });
}, { passive: true });
window.addEventListener('resize', () => { lastIdx = -1; update(); });
update();

/* ---------- Stepping ---------- */
// In presentation mode sections change instantly, like slides; fast key
// presses build on the last target instead of the half-scrolled position.
let target = -1;
let targetAt = 0;
function goTo(idx: number) {
  target = Math.max(0, Math.min(sections.length - 1, idx));
  targetAt = Date.now();
  const el = sections[target];
  el.scrollIntoView({ behavior: root.classList.contains('present') ? 'instant' : 'smooth', block: 'start' });
  history.replaceState(null, '', `#${el.id}`);
  lastIdx = -1;
  update();
}
function step(dir: 1 | -1) {
  const idx = Date.now() - targetAt < 600 && target >= 0 ? target : currentIndex();
  // If the current section's top is below the top edge, "previous" first
  // returns to the start of the current section.
  if (dir === -1 && sections[idx].getBoundingClientRect().top < -8) return goTo(idx);
  goTo(idx + dir);
}
prevBtn.addEventListener('click', () => step(-1));
nextBtn.addEventListener('click', () => step(1));

/* ---------- Presentation mode ---------- */
function setPresent(on: boolean) {
  const idx = currentIndex();
  root.classList.toggle('present', on);
  hud.hidden = !on;
  store.set('arch-present', on ? '1' : null);
  lastIdx = -1;
  // Keep the same section in view after the layout changes.
  requestAnimationFrame(() => { sections[idx].scrollIntoView({ behavior: 'instant', block: 'start' }); update(); });
}
document.querySelectorAll('[data-present-toggle]').forEach((b) =>
  b.addEventListener('click', () => setPresent(!root.classList.contains('present'))),
);
if (store.get('arch-present') === '1' && window.matchMedia('(min-width: 1024px)').matches) setPresent(true);

document.addEventListener('keydown', (e) => {
  const t = e.target;
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (t instanceof Element && t.closest('input, textarea, select, [contenteditable]')) return;
  const presenting = root.classList.contains('present');
  if (e.key === 'p' || e.key === 'P') { e.preventDefault(); setPresent(!presenting); return; }
  if (!presenting) return;
  if (e.key === 'Escape') { setPresent(false); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
  else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
  else if (e.key === 'End') { e.preventDefault(); goTo(sections.length - 1); }
});

/* ---------- Mobile nav drawer ---------- */
const openBtn = document.querySelector<HTMLButtonElement>('[data-nav-open]')!;
function setNav(open: boolean) {
  root.toggleAttribute('data-nav-open', open);
  openBtn.setAttribute('aria-expanded', String(open));
  if (open) document.querySelector<HTMLElement>('.nav-list a')?.focus();
}
openBtn.addEventListener('click', () => setNav(true));
document.querySelectorAll('[data-nav-close]').forEach((el) => el.addEventListener('click', () => setNav(false)));
links.forEach((a) => a.addEventListener('click', () => setNav(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && root.hasAttribute('data-nav-open')) setNav(false); });
