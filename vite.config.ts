import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const requestedBase = env.VITE_BASE_PATH?.trim() || '/';
  if (!requestedBase.startsWith('/') || requestedBase.startsWith('//') || /[?#\\]/.test(requestedBase)) {
    throw new Error('VITE_BASE_PATH must be an absolute site path, such as /one-decision-away/.');
  }
  const base = requestedBase === '/' ? '/' : `${requestedBase.replace(/\/+$/, '')}/`;
  return {
    base,
    plugins: [react(), tailwindcss()],
    build: {
      chunkSizeWarningLimit: 700,
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/recharts') || id.includes('node_modules/d3') || id.includes('node_modules/victory') || id.includes('node_modules/internmap') || id.includes('node_modules/delaunator') || id.includes('node_modules/robust-predicates')) return 'charts';
            if (id.includes('node_modules/@google/genai')) return 'genai';
            if (id.includes('node_modules/@supabase')) return 'supabase';
            if (id.includes('node_modules/motion') || id.includes('node_modules/framer-motion')) return 'motion';
            if (id.includes('node_modules/html-to-image') || id.includes('node_modules/canvas-confetti')) return 'media';
            if (id.includes('node_modules/react') || id.includes('node_modules/scheduler')) return 'react';
            return undefined;
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3000,
      host: '0.0.0.0',
      allowedHosts: true as const,
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
