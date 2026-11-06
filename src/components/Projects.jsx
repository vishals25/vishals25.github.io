import { ArrowUpRightIcon, GitHubIcon } from './Icons';
import SectionLink from './SectionLink';
import './Projects.css';

const PIPELINE = [
  { stage: 'Ingest', title: 'Data sources', items: ['GPS telemetry', 'Satellite imagery', 'Climate records'] },
  { stage: 'Clean', title: 'Preprocess', items: ['Outlier removal', 'Normalisation'] },
  { stage: 'Encode', title: 'Autoencoder', items: ['Habitat signature per location'], primary: true },
  { stage: 'Score', title: 'Similarity', items: ['Match to known habitat'] },
  { stage: 'Explain', title: 'Analyse', items: ['Clustering', 'SHAP importance'] },
  { stage: 'Ship', title: 'Maps', items: ['Suitability zones', 'Movement patterns'] },
];

function ProjectLinks({ project, label }) {
  return (
    <p className="project-links">
      {project.github && (
        <a className="text-link" href={project.github} target="_blank" rel="noopener noreferrer">
          <GitHubIcon /> Source<span className="sr-only"> code for {label} on GitHub (opens in a new tab)</span>
        </a>
      )}
      {project.link && (
        <a className="text-link" href={project.link} target="_blank" rel="noopener noreferrer">
          Live demo <ArrowUpRightIcon />
          <span className="sr-only"> of {label} (opens in a new tab)</span>
        </a>
      )}
    </p>
  );
}

function CaseStudy({ project }) {
  return (
    <article id={project.id} className="case reveal" aria-labelledby={`${project.id}-title`}>
      <header className="case__head">
        <p className="label case__eyebrow">Featured case study</p>
        <h3 id={`${project.id}-title`} className="case__title">{project.name}</h3>
        <p className="case__meta">
          {project.type} · {project.context} · {project.date}
        </p>
        <p className="case__summary">{project.summary}</p>
        <ul className="tags" aria-label="Technologies used">
          {project.tech.map((t) => (
            <li key={t} className="tag">{t}</li>
          ))}
        </ul>
        <ProjectLinks project={project} label={project.name} />
      </header>

      <div className="case__steps">
        <section className="case__step" aria-labelledby="case-problem">
          <h4 id="case-problem" className="case__step-label"><span>01</span> Problem</h4>
          <div className="case__step-body">
            <p className="case__lead">{project.problem}</p>
          </div>
        </section>

        <section className="case__step" aria-labelledby="case-architecture">
          <h4 id="case-architecture" className="case__step-label"><span>02</span> Architecture</h4>
          <div className="case__step-body">
            <ol className="pipeline" role="list" aria-label="Data pipeline, in order">
              {PIPELINE.map(({ stage, title, items, primary }) => (
                <li key={stage} className={`pipeline__stage${primary ? ' pipeline__stage--primary' : ''}`}>
                  <span className="pipeline__kicker">{stage}</span>
                  <strong className="pipeline__title">{title}</strong>
                  <ul className="pipeline__items">
                    {items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="case__step" aria-labelledby="case-implementation">
          <h4 id="case-implementation" className="case__step-label"><span>03</span> Implementation</h4>
          <div className="case__step-body case__impl">
            <ul className="case__list">
              {project.implementation.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
            {project.snippet && (
              <figure className="case__code">
                <figcaption>model architecture</figcaption>
                <pre><code>{project.snippet}</code></pre>
              </figure>
            )}
          </div>
        </section>

        <section className="case__step" aria-labelledby="case-result">
          <h4 id="case-result" className="case__step-label"><span>04</span> Result</h4>
          <div className="case__step-body">
            <dl className="case__metrics">
              {project.metrics.map(({ value, label }) => (
                <div key={label}>
                  <dt>{label}</dt>
                  <dd>{value}</dd>
                </div>
              ))}
            </dl>
            <ul className="case__list">
              {project.findings.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </article>
  );
}

export default function Projects({ projects }) {
  const { featured, projects: rest = [] } = projects;

  return (
    <section id="projects" className="section" aria-labelledby="projects-title">
      <div className="container">
        <header className="section-head reveal">
          <p className="label" data-index="03">Projects</p>
          <h2 id="projects-title">Selected work</h2>
          <p>
            One deep dive, then a few builds that show how I approach APIs, real-time apps and
            payments.
          </p>
        </header>

        {featured && <CaseStudy project={featured} />}

        <ul className="projects" role="list">
          {rest.map((project, i) => (
            <li key={project.id} id={project.id} className="project reveal">
              <p className="project__index" aria-hidden="true">
                {String(i + 2).padStart(2, '0')}
              </p>
              <div className="project__main">
                <p className="project__meta">
                  {project.type} · {project.date}
                </p>
                <h3 className="project__title">{project.name}</h3>
                <p className="project__summary">{project.summary}</p>
                <ul className="tags" aria-label={`Technologies used in ${project.name}`}>
                  {project.tech.map((t) => (
                    <li key={t} className="tag">{t}</li>
                  ))}
                </ul>
              </div>
              <div className="project__side">
                <p className="label">Key decisions</p>
                <ul className="project__decisions">
                  {project.decisions.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
                <ProjectLinks project={project} label={project.name} />
              </div>
            </li>
          ))}
        </ul>

        <p className="projects__more">
          More on{' '}
          <SectionLink to="activity" className="text-link">
            my GitHub activity
          </SectionLink>
          .
        </p>
      </div>
    </section>
  );
}
