// Section routes. Every section of the one-page site has a real path
// (/about, /projects, …) so links are shareable and crawlable; the build
// prerenders an HTML file per route, so they resolve on a static host with
// no server-side routing. Navigating between them never reloads the page.
export const BASE = import.meta.env.BASE_URL; // '/' or '/<repo>/', always ends with '/'

export const SECTIONS = [
  { path: '', id: 'top', label: 'Home' },
  { path: 'about', id: 'about', label: 'About' },
  { path: 'experience', id: 'experience', label: 'Experience' },
  { path: 'projects', id: 'projects', label: 'Projects' },
  { path: 'skills', id: 'skills', label: 'Skills' },
  { path: 'achievements', id: 'achievements', label: 'Achievements' },
  { path: 'activity', id: 'activity', label: 'Activity' },
  { path: 'contact', id: 'contact', label: 'Contact' },
];

const NAV_IDS = ['about', 'experience', 'projects', 'skills', 'contact'];
export const NAV_LINKS = SECTIONS.filter((s) => NAV_IDS.includes(s.id));

const byId = new Map(SECTIONS.map((s) => [s.id, s]));

/** Absolute href (with base path) for a section id. */
export function hrefFor(id) {
  const section = byId.get(id) ?? byId.get('top');
  return `${BASE}${section.path}`;
}

/** Section id for a pathname, or null when the path isn't a known route. */
export function idForPath(pathname) {
  let rel = pathname.startsWith(BASE) ? pathname.slice(BASE.length) : pathname.replace(/^\/+/, '');
  rel = rel.replace(/\/+$/, '').replace(/\.html$/, '');
  if (rel === 'index') rel = '';
  return SECTIONS.find((s) => s.path === rel)?.id ?? null;
}

function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Scroll the section into view (respects reduced motion). */
export function scrollToSection(id, { smooth = true } = {}) {
  // 'instant', not 'auto': the root has scroll-behavior: smooth, and 'auto'
  // would inherit it, so a "jump" would still animate (and land short if the
  // layout changes mid-animation).
  const behavior = smooth && !prefersReducedMotion() ? 'smooth' : 'instant';
  if (id === 'top') {
    window.scrollTo({ top: 0, behavior });
    return true;
  }
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({ behavior, block: 'start' });
  return true;
}

/** Scroll to a section and put its route in the address bar. */
export function navigateToSection(id, { replace = false, smooth = true } = {}) {
  if (!scrollToSection(id, { smooth })) return;
  const href = hrefFor(id);
  if (window.location.pathname + window.location.hash === href) return;
  window.history[replace ? 'replaceState' : 'pushState'](null, '', href);
}

/** True for plain left-clicks that should be handled in-page (not ⌘-click etc.). */
export function isPlainClick(e) {
  return e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
}
