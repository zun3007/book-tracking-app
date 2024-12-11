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
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': [
            'framer-motion',
            '@react-spring/web',
            'react-hot-toast',
          ],
          'vendor-state': [
            '@reduxjs/toolkit',
            'react-redux',
            '@tanstack/react-query',
          ],
          'vendor-forms': ['react-hook-form', 'zod', '@hookform/resolvers'],
          'vendor-charts': ['recharts'],
          'vendor-map': ['leaflet', 'react-leaflet'],
        },
      },
    },
  },
});
