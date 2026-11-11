import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// base: './' makes the build work on Vercel and on GitHub Pages sub-paths with zero config.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
});
