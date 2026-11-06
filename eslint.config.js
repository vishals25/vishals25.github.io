import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist', 'dist-ssr']),
  {
    files: ['**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      globals: globals.browser,
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
  },
  {
    files: ['scripts/**/*.mjs', 'vite.config.js'],
    languageOptions: { globals: globals.node },
  },
  {
    // Build-time render entry, not a component module: re-exports data for scripts/prerender.mjs
    files: ['src/entry-server.jsx'],
    rules: { 'react-refresh/only-export-components': 'off' },
  },
])
