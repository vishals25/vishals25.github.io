import './About.css';

const BASE = import.meta.env.BASE_URL;

const FOCUS = [
  {
    title: 'Backend & APIs',
    body: 'Rails, Django and FastAPI services over PostgreSQL: data models, migrations, auth flows and scheduled jobs.',
  },
  {
    title: 'Production reliability',
    body: 'Finding the edge case before users do. Debugging legacy code, hardening form flows and shipping safe, zero-downtime fixes.',
  },
  {
    title: 'Cloud & delivery',
    body: 'AWS (EC2, S3, RDS, ELB, CloudFront, Auto Scaling), Docker and Kubernetes with GitHub Actions and Argo CD for repeatable deploys.',
  },
  {
    title: 'Applied AI',
    body: 'LLM features with LangChain and the Claude API, and ML pipelines, like the autoencoder model behind my hornbill research.',
  },
];

export default function About({ profile, education = [] }) {
  const school = education[0];

  const facts = [
    { term: 'Based in', value: profile.basedIn },
    school && { term: 'Education', value: `B.E. Computer Science, ${school.institution} (${school.period})` },
    school?.cgpa && { term: 'CGPA', value: school.cgpa },
    { term: 'Currently', value: profile.availability },
  ].filter(Boolean);

  return (
    <section id="about" className="section about" aria-labelledby="about-title">
      <div className="container about__grid">
        <div className="about__main">
          <header className="section-head reveal">
            <p className="label" data-index="01">About</p>
            <h2 id="about-title">I like systems that keep working after they ship.</h2>
          </header>

          <div className="about__copy reveal">
            <p>
              I&rsquo;m a software engineer from {profile.basedIn} with a Computer Science degree
              from {school?.institution ?? 'Coimbatore Institute of Technology'}. Today I&rsquo;m a
              Software Development Engineer at Rootquotient Technologies, where I started as an
              intern and now own production work on TRAF, a large enterprise Ruby on Rails pension
              platform: authentication (MFA, Ping Identity), scheduled jobs, data-integrity fixes and
              the application flows thousands of members rely on.
            </p>
            <p>
              Before that I built ML models for conservation research at SACON and a Django + LLM
              support platform at CloudTel. Outside work I run things on AWS (EC2, S3, RDS, ELB,
              CloudFront, Auto Scaling) and keep a GitOps pipeline on Kubernetes, because I like
              owning a service end to end, from schema to deploy.
            </p>
          </div>

          <ul className="about__focus" role="list">
            {FOCUS.map(({ title, body }) => (
              <li key={title} className="reveal">
                <h3>{title}</h3>
                <p>{body}</p>
              </li>
            ))}
          </ul>
        </div>

        <aside className="about__aside reveal" aria-label="Quick facts">
          <picture>
            <source
              type="image/webp"
              srcSet={`${BASE}me-sm.webp 480w, ${BASE}me.webp 800w`}
              sizes="(min-width: 960px) 320px, (min-width: 600px) 240px, 45vw"
            />
            <img
              className="about__photo"
              src={`${BASE}me-sm.jpg`}
              srcSet={`${BASE}me-sm.jpg 480w, ${BASE}me.jpg 800w`}
              sizes="(min-width: 960px) 320px, (min-width: 600px) 240px, 45vw"
              width="480"
              height="600"
              alt={`Portrait of ${profile.name}`}
              loading="lazy"
              decoding="async"
            />
          </picture>
          <dl className="about__facts">
            {facts.map(({ term, value }) => (
              <div key={term}>
                <dt className="label">{term}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </section>
  );
}
