# Vishal S — Portfolio

Personal portfolio of Vishal S, a software engineer based in Coimbatore, India.
Live at **https://vishals25.github.io/** (see [Deployment](#deployment) for the base-path rules).

A single-page site built with **React 19 + Vite** and plain CSS: no UI libraries, no icon packages, no router dependency, content bundled at build time (the only runtime request is the optional GitHub activity feed).

## Routes

Every section has a real path, so links are shareable and crawlable:

| Route           | Section                      |
|-----------------|------------------------------|
| `/`             | Home (hero)                  |
| `/about`        | About                        |
| `/experience`   | Experience & education       |
| `/projects`     | Projects                     |
| `/skills`       | Skills                       |
| `/achievements` | Achievements & certifications|
| `/activity`     | GitHub activity              |
| `/contact`      | Contact                      |

They are defined once in `src/navigation.js`. The build writes a static HTML file per route
(`dist/about/index.html`, …) plus `dist/404.html`, so they resolve on GitHub Pages without any
server-side routing. In the browser, nav links and CTAs scroll to the section and update the
address bar with `pushState`; scrolling updates it with `replaceState`; back/forward move between
sections; a full reload on `/about` lands on About. Old `#about`-style links still work as plain
browser anchors. All routes are the same document, so each route page sets its own `<title>` but
keeps the root URL as `rel="canonical"`.

## Structure

```
index.html              SEO head (meta, Open Graph, JSON-LD placeholder), fonts, reveal/loader gates, static loading screen
.env                    Public build settings: VITE_SITE_URL (overridden by the deploy workflow)
public/                 Static files served as-is (photo + WebP, og-card.jpg, resume.pdf, icons; robots.txt,
                        sitemap.xml and site.webmanifest are templates filled in at build time)
scripts/prerender.mjs   Post-build: prerender, JSON-LD, inline CSS, route pages, 404.html, URL templates
src/
  main.jsx              Entry point (global CSS imported before components)
  App.jsx               Page composition, scroll-reveal observer, section routing (load + back/forward)
  navigation.js         Section routes, hrefs, scroll + history helpers
  entry-server.jsx      Build-time render entry used by scripts/prerender.mjs
  index.css             Design tokens (light/dark), type scale, reset, shared components
  seo.js                JSON-LD graph (WebSite, ProfilePage, Person, projects) generated from data/
  data/                 All site content as JSON
  components/           One component + one CSS file per section
    Navbar, Hero (+ HeroDiagram SVG), About, Experience, Projects (case study + list),
    Skills, Achievements, Activity (live GitHub repos), Contact (+ ContactForm, footer), Icons,
    SectionLink (anchor to a section route)
```

## Editing content

All text lives in `src/data/`. Edit the JSON and the page updates; no component changes needed.

| File                  | What it holds                                   |
|-----------------------|-------------------------------------------------|
| `profile.json`        | Name, role, headline, summary, stack line, availability, links, résumé file, GitHub username, optional `leetcode` URL and `contactFormEndpoint` |
| `experience.json`     | Roles: company, title, `employment` (Full-time / Internship), period, summary, highlights, tech, optional `roles` (promotion timeline within one company) and `caseStudy` anchor |
| `education.json`      | Degree, institution, period, CGPA               |
| `projects.json`       | `featured` case study (problem, implementation, snippet, metrics, findings) and `projects` list (summary, key decisions, tech, links; empty string hides a link) |
| `skills.json`         | Skill groups; items listed in `core` are highlighted |
| `achievements.json`   | Publications / academic highlights              |
| `certifications.json` | Certificates with issuer, date and verification link (empty link = plain text) |

The case-study architecture stages live in `PIPELINE` inside `src/components/Projects.jsx`.

### Contact form (optional)

The site is static, so the form only renders when an endpoint is configured. Create a form at
[Formspree](https://formspree.io) (or any service accepting JSON `POST` with `Accept: application/json`)
and either set `contactFormEndpoint` in `profile.json` or build with `VITE_CONTACT_ENDPOINT=<url>`.
The form includes validation, loading/success/error states, a honeypot and duplicate-submit protection.

### GitHub activity

`Activity` fetches the most recently pushed public, non-fork repositories for `githubUser` from the
public GitHub API when the section nears the viewport, caches them for 30 minutes in `sessionStorage`,
and shows a retry + profile link if the API is unavailable or rate-limited.

To update the résumé, replace `public/resume.pdf`. To update the photo, replace `public/me.jpg` (800×1000) and `public/me-sm.jpg` (480×600).

## Commands

```bash
npm install       # install dependencies
npm run dev       # start the dev server
npm run lint      # run ESLint
npm run build     # production build into dist/
npm run preview   # preview the production build
npm run deploy    # manual fallback: publish dist/ to the gh-pages branch
```

### Base path and site URL

The build takes two settings, both with sensible local defaults:

| Setting         | Where                         | Default                        | Meaning                                              |
|-----------------|-------------------------------|--------------------------------|------------------------------------------------------|
| `BASE_PATH`     | environment (`vite.config.js`)| `/`                            | Path prefix for assets and routes (`/` or `/<repo>/`) |
| `VITE_SITE_URL` | `.env` or environment         | `https://vishals25.github.io/` | Canonical URL (origin + base path, trailing slash)    |

Asset URLs in components use `import.meta.env.BASE_URL`; absolute URLs (canonical, Open Graph,
JSON-LD, sitemap, manifest) use `VITE_SITE_URL`. To build for a project page instead of the root:

```bash
BASE_PATH=/portfolio/ VITE_SITE_URL=https://vishals25.github.io/portfolio/ npm run build
```

## Prerendering & SEO

`npm run build` also renders the page to static HTML (`src/entry-server.jsx` → `scripts/prerender.mjs`)
and injects it into `dist/index.html`, so crawlers and link previews see the full content without
running JavaScript; `src/main.jsx` then hydrates it. Anything rendered on first paint must not read
browser-only APIs (`window`, `sessionStorage`) during render. Read them in effects instead.

The same step replaces the JSON-LD placeholder in `index.html` with a graph built from `src/data`
(`src/seo.js`), inlines the built stylesheet so first paint needs no extra request, and stamps
today's date into `sitemap.xml`. Share previews use `public/og-card.jpg` (1200×630).

## Loading screen

The VS mark overlay is static markup in `index.html` with inline CSS, so it paints with the first
frame and fades on its own timer (~1.1 s) without waiting for the JS bundle. `App.jsx` removes the
node once the fade ends. It is hidden entirely without JavaScript or when the visitor prefers
reduced motion.

## Deployment

Pushing to `main` deploys automatically: `.github/workflows/deploy.yml` installs, lints, builds and
publishes `dist/` to GitHub Pages. The repo's **Settings → Pages → Source** must be set to
**GitHub Actions**. (Serving `main` directly would publish the unbuilt source `index.html`, which
renders a blank page.)

The workflow derives `BASE_PATH` and `VITE_SITE_URL` from the repository, so the same code works
in all three setups:

| Setup                                   | URL                                   | What to do                                              |
|-----------------------------------------|---------------------------------------|---------------------------------------------------------|
| Repo named `vishals25.github.io`        | `https://vishals25.github.io/`        | Rename this repo (Settings → General → Repository name) |
| Any other repo name, e.g. `portfolio`   | `https://vishals25.github.io/portfolio/` | Nothing; base path becomes `/portfolio/`             |
| Custom domain                           | `https://<domain>/`                   | Add `public/CNAME` containing the domain and point DNS at GitHub Pages |

Serving at the root needs the repo to be the user site (`<owner>.github.io`); GitHub Pages has no
other way to put a project repo at the root. After renaming, the old `/portfolio/` URL stops
resolving. To keep it alive, create a tiny repo named `portfolio` whose `index.html` contains
`<meta http-equiv="refresh" content="0; url=https://vishals25.github.io/">`.

Route pages (`/about`, …) are real files in `dist/`, and `404.html` is a copy of the home page, so
any unknown path still renders the site (with a 404 status, which is fine for a static host).
