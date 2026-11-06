import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Base path: '/' for a user site (vishals25.github.io) or a custom domain,
// '/<repo>/' for a project site. The deploy workflow sets BASE_PATH from the
// repository name; locally it defaults to '/'.
const base = (process.env.BASE_PATH || '/').replace(/\/?$/, '/')

// https://vite.dev/config/
export default defineConfig({
  base,
  plugins: [react()],
})
