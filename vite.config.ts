import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: 'auto',
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg}']
        },
        manifest: {
          name: 'Nursing MCQ & Study Assistant',
          short_name: 'NursingAI',
          description: 'Master nursing studies with AI MCQs and summaries',
          theme_color: '#3b82f6',
          background_color: '#ffffff',
          display: 'standalone',
          icons: [
            {
              src: 'https://img.icons8.com/clouds/256/nurse.png',
              sizes: '192x192',
              type: 'image/png',
              purpose: 'any'
            },
            {
              src: 'https://img.icons8.com/clouds/512/nurse.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
