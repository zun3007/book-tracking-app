import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { imageOptimizer } from './vite-image-optimizer';

export default defineConfig({
  // base: '/book-tracking-app',
  plugins: [react(), imageOptimizer()],
  build: {
    rollupOptions: {
      output: {
        assetFileNames: 'assets/[name].[hash][extname]',
      },
    },
  },
});
