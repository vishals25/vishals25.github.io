// Build-time only: renders the page to static HTML (see scripts/prerender.mjs)
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

export { structuredData, SITE_URL } from './seo';
export { SECTIONS } from './navigation';

export function render() {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}
