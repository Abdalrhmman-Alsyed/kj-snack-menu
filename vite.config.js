import { defineConfig } from 'vite';

export default defineConfig({
  // relative asset paths → the built site works on any host or sub-folder
  base: './',
  server: { port: 5173, host: true, open: false },
  preview: { port: 4173, host: true },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 900,
  },
});
