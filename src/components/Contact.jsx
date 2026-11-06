import { useEffect, useRef, useState } from 'react';
import ContactForm from './ContactForm';
import SectionLink from './SectionLink';
import { CheckIcon, CopyIcon, FileIcon, GitHubIcon, LinkedInIcon, MailIcon } from './Icons';
import './Contact.css';

async function copyText(text) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand('copy');
  document.body.removeChild(ta);
  if (!ok) throw new Error('copy failed');
}

export default function Contact({ profile }) {
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);
  const resumeHref = `${import.meta.env.BASE_URL}${profile.resumeLink}`;
  const formEndpoint = import.meta.env.VITE_CONTACT_ENDPOINT || profile.contactFormEndpoint;

  useEffect(() => () => clearTimeout(timer.current), []);

  const handleCopy = async () => {
    try {
      await copyText(profile.email);
      setCopied(true);
      clearTimeout(timer.current);
      // Feedback only; the button is usable again immediately.
      timer.current = setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

  const channels = [
    { href: profile.linkedin, label: 'LinkedIn', detail: 'Connect or message', icon: <LinkedInIcon /> },
    { href: profile.github, label: 'GitHub', detail: `@${profile.githubUser}`, icon: <GitHubIcon /> },
    { href: resumeHref, label: 'Resume', detail: 'PDF, two pages', icon: <FileIcon /> },
  ];

  return (
    <section id="contact" className="section contact" aria-labelledby="contact-title">
      <div className="container contact__grid">
        <div className="contact__intro reveal">
          <p className="label" data-index="07">Contact</p>
          <h2 id="contact-title">
            Have a role, project or interesting problem? <span>Let&rsquo;s talk.</span>
          </h2>
          <p className="lead">
            {profile.availability}. Email is the fastest way to reach me.
          </p>

          <div className="contact__email">
            <a className="contact__email-link" href={`mailto:${profile.email}`}>
              <MailIcon />
              {profile.email}
            </a>
            <button
              type="button"
              className={`btn btn-secondary contact__copy${copied ? ' is-copied' : ''}`}
              onClick={handleCopy}
            >
              {copied ? <CheckIcon /> : <CopyIcon />}
              {copied ? 'Copied' : 'Copy'}
              <span className="sr-only"> email address</span>
            </button>
            <span className="sr-only" role="status">
              {copied ? 'Email address copied to clipboard' : ''}
            </span>
          </div>
        </div>

        <div className="contact__side reveal">
          <ul className="contact__channels" role="list">
            {channels.map(({ href, label, detail, icon }) => (
              <li key={label}>
                <a className="contact__channel" href={href} target="_blank" rel="noopener noreferrer">
                  <span className="contact__channel-icon">{icon}</span>
                  <span className="contact__channel-text">
                    <strong>{label}</strong>
                    <span>{detail}</span>
                  </span>
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {formEndpoint && (
          <div className="contact__form reveal">
            <h3 className="label">Or send a message</h3>
            <ContactForm endpoint={formEndpoint} email={profile.email} />
          </div>
        )}
      </div>
    </section>
  );
}

export function SiteFooter({ profile }) {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container site-footer__inner">
        <p>
          &copy; {year} {profile.name} · {profile.basedIn}
        </p>
        <ul className="site-footer__links" role="list">
          <li>
            <a href={profile.github} target="_blank" rel="noopener noreferrer">
              GitHub<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
          <li>
            <a href={profile.linkedin} target="_blank" rel="noopener noreferrer">
              LinkedIn<span className="sr-only"> (opens in a new tab)</span>
            </a>
          </li>
          <li>
            <SectionLink to="top">
              Back to top <span aria-hidden="true">↑</span>
            </SectionLink>
          </li>
        </ul>
      </div>
    </footer>
  );
}
