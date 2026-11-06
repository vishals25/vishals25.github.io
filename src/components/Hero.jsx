import HeroDiagram from './HeroDiagram';
import SectionLink from './SectionLink';
import { ArrowRightIcon, FileIcon, GitHubIcon, LinkedInIcon, PinIcon } from './Icons';
import './Hero.css';

export default function Hero({ profile }) {
  const resumeHref = `${import.meta.env.BASE_URL}${profile.resumeLink}`;

  return (
    <section id="top" className="hero" aria-labelledby="hero-title">
      <div className="container hero__grid">
        <div className="hero__content">
          <p className="hero__status hero__anim" style={{ '--i': 0 }}>
            <span className="hero__dot" aria-hidden="true" />
            {profile.availability}
          </p>

          <h1 id="hero-title" className="hero__title hero__anim" style={{ '--i': 1 }}>
            {profile.name}{' '}
            <span className="hero__role">{profile.role}</span>
          </h1>

          <p className="hero__headline hero__anim" style={{ '--i': 2 }}>
            {profile.headline}
          </p>

          <p className="hero__summary hero__anim" style={{ '--i': 3 }}>
            {profile.summary}
          </p>

          <ul className="hero__stack hero__anim" style={{ '--i': 4 }} aria-label="Core technologies">
            {profile.stack.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          <div className="hero__ctas hero__anim" style={{ '--i': 5 }}>
            <SectionLink to="projects" className="btn btn-primary">
              View projects
              <ArrowRightIcon />
            </SectionLink>
            <SectionLink to="contact" className="btn btn-secondary">
              Contact me
            </SectionLink>
          </div>

          <ul className="hero__links hero__anim" style={{ '--i': 6 }} aria-label="Profiles and resume">
            <li>
              <a className="hero__link" href={profile.github} target="_blank" rel="noopener noreferrer">
                <GitHubIcon /> GitHub<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a className="hero__link" href={profile.linkedin} target="_blank" rel="noopener noreferrer">
                <LinkedInIcon /> LinkedIn<span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li>
              <a className="hero__link" href={resumeHref} target="_blank" rel="noopener">
                <FileIcon /> Resume <span className="hero__link-meta">PDF</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </li>
            <li className="hero__location">
              <PinIcon /> {profile.basedIn}
            </li>
          </ul>
        </div>

        <figure className="hero__visual hero__anim" style={{ '--i': 2 }}>
          <div className="hero__visual-bar" aria-hidden="true">
            <span /><span /><span />
            <code>~/systems/request-lifecycle.svg</code>
          </div>
          <HeroDiagram />
          <figcaption className="hero__visual-caption">
            The kind of systems I work on: authenticated APIs, relational data, scheduled jobs and
            LLM services.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
