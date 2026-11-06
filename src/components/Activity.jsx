import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRightIcon, GitHubIcon } from './Icons';
import './Activity.css';

const CACHE_TTL = 30 * 60 * 1000;
const LIMIT = 6;

const LANG_COLORS = {
  Python: '#3572A5',
  JavaScript: '#E3C31C',
  TypeScript: '#3178C6',
  Ruby: '#CC342D',
  HTML: '#E34C26',
  CSS: '#663399',
  'Jupyter Notebook': '#DA5B0B',
};

const cacheKey = (user) => `gh-repos:${user}`;

function readCache(user) {
  try {
    const raw = sessionStorage.getItem(cacheKey(user));
    if (!raw) return null;
    const { at, repos } = JSON.parse(raw);
    return Date.now() - at < CACHE_TTL ? repos : null;
  } catch {
    return null;
  }
}

function writeCache(user, repos) {
  try {
    sessionStorage.setItem(cacheKey(user), JSON.stringify({ at: Date.now(), repos }));
  } catch {
    /* storage unavailable: fine, we just refetch next time */
  }
}

const rtf = typeof Intl !== 'undefined' && Intl.RelativeTimeFormat
  ? new Intl.RelativeTimeFormat('en', { numeric: 'auto' })
  : null;

function timeAgo(iso) {
  const diff = (new Date(iso).getTime() - Date.now()) / 1000;
  const units = [
    ['year', 31536000],
    ['month', 2592000],
    ['week', 604800],
    ['day', 86400],
    ['hour', 3600],
  ];
  for (const [unit, secs] of units) {
    if (Math.abs(diff) >= secs) {
      const n = Math.round(diff / secs);
      return rtf ? rtf.format(n, unit) : `${Math.abs(n)} ${unit}s ago`;
    }
  }
  return 'recently';
}

function prettyName(name) {
  return name.replace(/[-_]+/g, ' ');
}

export default function Activity({ profile }) {
  const user = profile.githubUser;
  // Always start empty so prerendered HTML and the first client render match
  const [repos, setRepos] = useState(null);
  const [status, setStatus] = useState('idle');
  const sectionRef = useRef(null);
  const abortRef = useRef(null);

  const load = useCallback(async ({ useCache = true } = {}) => {
    const cached = useCache ? readCache(user) : null;
    if (cached) {
      setRepos(cached);
      setStatus('ready');
      return;
    }
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setStatus('loading');
    try {
      const res = await fetch(
        `https://api.github.com/users/${encodeURIComponent(user)}/repos?sort=pushed&per_page=30`,
        { signal: controller.signal, headers: { Accept: 'application/vnd.github+json' } },
      );
      if (!res.ok) throw new Error(`GitHub responded ${res.status}`);
      const data = await res.json();
      const list = data
        .filter((r) => !r.fork && !r.archived)
        .sort((a, b) => new Date(b.pushed_at) - new Date(a.pushed_at))
        .slice(0, LIMIT)
        .map(({ id, name, html_url, description, language, pushed_at, stargazers_count }) => ({
          id, name, html_url, description, language, pushed_at, stargazers_count,
        }));
      writeCache(user, list);
      setRepos(list);
      setStatus('ready');
    } catch (err) {
      if (err.name !== 'AbortError') setStatus('error');
    }
  }, [user]);

  // Fetch only when the section approaches the viewport
  useEffect(() => {
    if (!user || status !== 'idle') return undefined;
    const el = sectionRef.current;
    if (!('IntersectionObserver' in window)) {
      Promise.resolve().then(load);
      return undefined;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect();
          load();
        }
      },
      { rootMargin: '600px 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [user, status, load]);

  useEffect(() => () => abortRef.current?.abort(), []);

  if (!user) return null;

  return (
    <section
      id="activity"
      ref={sectionRef}
      className="section activity"
      aria-labelledby="activity-title"
    >
      <div className="container">
        <header className="section-head activity__head">
          <div>
            <p className="label" data-index="06">Activity</p>
            <h2 id="activity-title">Recently on GitHub</h2>
            <p>Live from the GitHub API: my most recently updated public repositories.</p>
          </div>
          <p className="activity__profiles">
            <a className="text-link" href={profile.github} target="_blank" rel="noopener noreferrer">
              <GitHubIcon /> github.com/{user}
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
            {profile.leetcode && (
              <a className="text-link" href={profile.leetcode} target="_blank" rel="noopener noreferrer">
                LeetCode <ArrowUpRightIcon />
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
          </p>
        </header>

        <div aria-live="polite" aria-busy={status === 'loading'}>
          {status === 'error' && (
            <div className="activity__error" role="alert">
              <p>Couldn&rsquo;t reach GitHub just now. It may be rate-limiting this network.</p>
              <div className="activity__error-actions">
                <button type="button" className="btn btn-secondary" onClick={() => load({ useCache: false })}>
                  Try again
                </button>
                <a className="text-link" href={profile.github} target="_blank" rel="noopener noreferrer">
                  Open GitHub profile <ArrowUpRightIcon />
                  <span className="sr-only"> (opens in a new tab)</span>
                </a>
              </div>
            </div>
          )}

          {(status === 'idle' || status === 'loading') && (
            <ul className="repos" role="list" aria-hidden="true">
              {Array.from({ length: LIMIT }, (_, i) => (
                <li key={i} className="repo repo--skeleton">
                  <span />
                  <span />
                  <span />
                </li>
              ))}
            </ul>
          )}
          {status === 'loading' && <p className="sr-only">Loading repositories…</p>}

          {status === 'ready' && repos && (
            repos.length === 0 ? (
              <p className="activity__empty">No public repositories yet.</p>
            ) : (
              <ul className="repos" role="list">
                {repos.map((r) => (
                  <li key={r.id} className="repo">
                    <a className="repo__link" href={r.html_url} target="_blank" rel="noopener noreferrer">
                      <span className="repo__name">{prettyName(r.name)}</span>
                      <ArrowUpRightIcon className="icon-arrow-ne repo__arrow" />
                      <span className="sr-only"> on GitHub (opens in a new tab)</span>
                    </a>
                    {r.description && <p className="repo__desc">{r.description}</p>}
                    <p className="repo__meta">
                      {r.language && (
                        <span className="repo__lang">
                          <span
                            className="repo__lang-dot"
                            style={{ background: LANG_COLORS[r.language] ?? 'var(--text-3)' }}
                            aria-hidden="true"
                          />
                          {r.language}
                        </span>
                      )}
                      <span>
                        Updated <time dateTime={r.pushed_at}>{timeAgo(r.pushed_at)}</time>
                      </span>
                    </p>
                  </li>
                ))}
              </ul>
            )
          )}
        </div>
      </div>
    </section>
  );
}
