import { useEffect } from 'react';
import profile from './data/profile.json';
import experience from './data/experience.json';
import education from './data/education.json';
import projects from './data/projects.json';
import skills from './data/skills.json';
import certifications from './data/certifications.json';
import achievements from './data/achievements.json';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import Skills from './components/Skills';
import Achievements from './components/Achievements';
import Activity from './components/Activity';
import Contact, { SiteFooter } from './components/Contact';
import { idForPath, scrollToSection } from './navigation';

// index.html adds .js-reveal to <html> only when IntersectionObserver exists and
// the visitor hasn't asked for reduced motion; without it everything is visible.
function useReveal() {
  useEffect(() => {
    if (!document.documentElement.classList.contains('js-reveal')) return undefined;

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -40px 0px' },
    );

    document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

// Section routes: /about, /projects, … land on their section, and the browser's
// back/forward buttons move between sections without a reload.
function useSectionRoutes() {
  useEffect(() => {
    if ('scrollRestoration' in window.history) window.history.scrollRestoration = 'manual';

    const onPop = () => scrollToSection(idForPath(window.location.pathname) ?? 'top');
    window.addEventListener('popstate', onPop);
    const cleanups = [() => window.removeEventListener('popstate', onPop)];

    const id = idForPath(window.location.pathname);
    if (id && id !== 'top' && !window.location.hash && window.scrollY === 0) {
      scrollToSection(id, { smooth: false });

      // Web fonts and images arriving after that first scroll shift the layout
      // and leave the section sitting low. For a few seconds, re-align whenever
      // the page height changes, until the visitor interacts or scrolls on (the
      // nav observer rewrites the path as they do).
      const resync = () => {
        if (idForPath(window.location.pathname) === id) scrollToSection(id, { smooth: false });
      };
      const ro = 'ResizeObserver' in window ? new ResizeObserver(resync) : null;
      ro?.observe(document.body);
      const interactions = ['wheel', 'touchstart', 'keydown', 'pointerdown'];
      const stop = () => {
        ro?.disconnect();
        clearTimeout(timer);
        interactions.forEach((ev) => window.removeEventListener(ev, stop));
      };
      const timer = setTimeout(stop, 4000);
      interactions.forEach((ev) => window.addEventListener(ev, stop, { passive: true }));
      cleanups.push(stop);
    }

    return () => cleanups.forEach((fn) => fn());
  }, []);
}

// The loading screen is static HTML in index.html (so it paints before any JS
// and lifts on a CSS timer). Once it has faded, drop it from the DOM.
function useLoaderCleanup() {
  useEffect(() => {
    const el = document.getElementById('loader');
    if (!el) return undefined;
    const remove = () => el.remove();
    el.addEventListener('animationend', remove);
    const t = setTimeout(remove, 2500); // belt and braces
    return () => {
      el.removeEventListener('animationend', remove);
      clearTimeout(t);
    };
  }, []);
}

export default function App() {
  useReveal();
  useLoaderCleanup();
  useSectionRoutes();

  return (
    <>
      <a className="skip-link" href="#main">Skip to content</a>
      <Navbar profile={profile} />
      <main id="main" tabIndex={-1}>
        <Hero profile={profile} />
        <About profile={profile} education={education} />
        <Experience experience={experience} education={education} />
        <Projects projects={projects} />
        <Skills skills={skills} />
        <Achievements achievements={achievements} certifications={certifications} />
        <Activity profile={profile} />
        <Contact profile={profile} />
      </main>
      <SiteFooter profile={profile} />
    </>
  );
}
