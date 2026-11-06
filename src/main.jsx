import { StrictMode } from 'react';
import { createRoot, hydrateRoot } from 'react-dom/client';
// Global tokens/base first so component stylesheets can override them
import './index.css';
import App from './App';

const container = document.getElementById('root');
const app = (
  <StrictMode>
    <App />
  </StrictMode>
);

// Production HTML is prerendered (scripts/prerender.mjs), so attach to it;
// the dev server serves an empty root, so render from scratch there.
if (container.hasChildNodes()) {
  hydrateRoot(container, app);
} else {
  createRoot(container).render(app);
}
