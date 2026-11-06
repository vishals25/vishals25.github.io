import { useEffect, useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { FileIcon } from './Icons';
import SectionLink from './SectionLink';
import { NAV_LINKS as LINKS, hrefFor, isPlainClick, navigateToSection } from '../navigation';
import './Navbar.css';

const DESKTOP_MQ = '(min-width: 880px)';

export default function Navbar({ profile }) {
  const [scrolled, setScrolled] = useState(false); // false on server + first client render
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const toggleRef = useRef(null);
  const sheetRef = useRef(null);

  const resumeHref = `${import.meta.env.BASE_URL}${profile.resumeLink}`;

  // Hairline + background once the page has scrolled
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    const raf = requestAnimationFrame(onScroll); // sync with a restored scroll position
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // Active-section highlight + keep the address bar on the section in view
  useEffect(() => {
    if (!('IntersectionObserver' in window)) return undefined;
    // Observe every section so hero / achievements / activity clear the highlight
    const ids = new Set(LINKS.map(({ id }) => id));
    const sections = [...document.querySelectorAll('main section[id]')];
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const { id } = entry.target;
          setActive(ids.has(id) ? id : '');
          const href = hrefFor(id);
          if (window.location.pathname !== href) window.history.replaceState(null, '', href);
        });
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Mobile menu: scroll lock, inert background, focus, Escape, auto-close on desktop
  useEffect(() => {
    if (!open) return undefined;
    const background = [
      document.querySelector('.skip-link'),
      document.getElementById('main'),
      document.querySelector('.site-footer'),
    ].filter(Boolean);

    document.body.classList.add('no-scroll');
    background.forEach((el) => { el.inert = true; });
    sheetRef.current?.querySelector('a')?.focus();

    const onKey = (e) => {
      if (e.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    const mq = window.matchMedia(DESKTOP_MQ);
    const onMq = (e) => {
      if (e.matches) setOpen(false);
    };

    document.addEventListener('keydown', onKey);
    mq.addEventListener('change', onMq);
    return () => {
      document.body.classList.remove('no-scroll');
      background.forEach((el) => { el.inert = false; });
      document.removeEventListener('keydown', onKey);
      mq.removeEventListener('change', onMq);
    };
  }, [open]);

  const close = () => setOpen(false);

  // Close the sheet first (releasing scroll lock + inert), then jump to the section.
  // Letting the browser follow the link while the body is locked leaves the page in place.
  const navigateFromSheet = (e, id) => {
    if (!isPlainClick(e)) return;
    e.preventDefault();
    flushSync(() => setOpen(false));
    navigateToSection(id);
  };

  return (
    <header className={`nav${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="container nav__inner">
        <SectionLink to="top" className="nav__brand" onNavigate={close}>
          <span className="nav__mark" aria-hidden="true">VS</span>
          {profile.name}
        </SectionLink>

        <nav className="nav__desktop" aria-label="Primary">
          <ul className="nav__links" role="list">
            {LINKS.map(({ id, label }) => (
              <li key={id}>
                <SectionLink
                  to={id}
                  className={`nav__link${active === id ? ' is-active' : ''}`}
                  aria-current={active === id ? 'page' : undefined}
                >
                  {label}
                </SectionLink>
              </li>
            ))}
          </ul>
          <a className="btn btn-secondary nav__resume" href={resumeHref} target="_blank" rel="noopener">
            <FileIcon />
            Resume
          </a>
        </nav>

        <button
          ref={toggleRef}
          type="button"
          className="nav__toggle"
          aria-expanded={open}
          aria-controls="mobile-menu"
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">{open ? 'Close menu' : 'Open menu'}</span>
          <span className="nav__toggle-bar" aria-hidden="true" />
          <span className="nav__toggle-bar" aria-hidden="true" />
        </button>
      </div>

      <div id="mobile-menu" ref={sheetRef} className="nav__sheet" hidden={!open}>
        <nav className="container" aria-label="Mobile">
          <ul className="nav__sheet-links" role="list">
            {LINKS.map(({ id, label }, i) => (
              <li key={id}>
                <a
                  href={hrefFor(id)}
                  className={`nav__sheet-link${active === id ? ' is-active' : ''}`}
                  aria-current={active === id ? 'page' : undefined}
                  onClick={(e) => navigateFromSheet(e, id)}
                >
                  <span className="nav__sheet-index" aria-hidden="true">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  {label}
                </a>
              </li>
            ))}
          </ul>
          <a className="btn btn-primary nav__sheet-resume" href={resumeHref} target="_blank" rel="noopener" onClick={close}>
            <FileIcon />
            View resume (PDF)
          </a>
        </nav>
      </div>
    </header>
  );
}
