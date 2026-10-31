import { defineConfig } from 'astro/config';

// Static output only. Password protection is done by Vercel Routing
// Middleware (middleware.ts at the project root), not by Astro.
export default defineConfig({
  output: 'static',
  build: { inlineStylesheets: 'auto' },
  devToolbar: { enabled: false },
});
