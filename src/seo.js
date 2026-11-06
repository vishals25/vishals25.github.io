// Structured data (JSON-LD) built from the same JSON the page renders, so the
// two never drift. Injected into dist/index.html by scripts/prerender.mjs.
import profile from './data/profile.json';
import experience from './data/experience.json';
import education from './data/education.json';
import projects from './data/projects.json';
import skills from './data/skills.json';

// Set VITE_SITE_URL (origin + base path, trailing slash) in .env or the deploy workflow.
export const SITE_URL = (import.meta.env.VITE_SITE_URL || 'https://vishals25.github.io/').replace(/\/?$/, '/');

export function structuredData() {
  const current = experience[0];
  const school = education[0];
  const [givenName, ...rest] = profile.name.split(' ');
  const familyName = rest.join(' ');

  const knowsAbout = [
    ...new Set(skills.groups.flatMap((g) => g.core?.length ? g.core : g.items)),
  ];

  const person = {
    '@type': 'Person',
    '@id': `${SITE_URL}#person`,
    name: profile.name,
    givenName,
    familyName,
    jobTitle: current?.title ?? profile.role,
    description: profile.headline,
    url: SITE_URL,
    image: `${SITE_URL}og-image.jpg`,
    email: `mailto:${profile.email}`,
    address: { '@type': 'PostalAddress', addressLocality: 'Coimbatore', addressRegion: 'Tamil Nadu', addressCountry: 'IN' },
    worksFor: current && {
      '@type': 'Organization',
      name: current.company,
      ...(profile.companyUrl ? { url: profile.companyUrl } : {}),
    },
    hasOccupation: {
      '@type': 'Occupation',
      name: profile.role,
      occupationLocation: { '@type': 'City', name: 'Coimbatore' },
      skills: knowsAbout.join(', '),
    },
    alumniOf: school && {
      '@type': 'CollegeOrUniversity',
      name: school.institution,
    },
    sameAs: [profile.github, profile.linkedin, profile.leetcode].filter(Boolean),
    knowsAbout,
  };

  const works = [projects.featured, ...projects.projects].filter(Boolean).map((p) => ({
    '@type': 'SoftwareSourceCode',
    name: p.name,
    description: p.summary,
    url: `${SITE_URL}#${p.id}`,
    ...(p.github ? { codeRepository: p.github } : {}),
    programmingLanguage: p.tech?.[0],
    author: { '@id': `${SITE_URL}#person` },
  }));

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}#website`,
        url: SITE_URL,
        name: `${profile.name} — ${profile.role}`,
        inLanguage: 'en',
        publisher: { '@id': `${SITE_URL}#person` },
      },
      {
        '@type': 'ProfilePage',
        '@id': `${SITE_URL}#profile`,
        url: SITE_URL,
        isPartOf: { '@id': `${SITE_URL}#website` },
        mainEntity: { '@id': `${SITE_URL}#person` },
        dateModified: new Date().toISOString().slice(0, 10),
      },
      person,
      ...works,
    ],
  };
}
