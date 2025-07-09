import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      port: 5173,
      overlay: false
    },
    watch: {
      ignored: ['**/.env.local', '**/node_modules/**', '**/public/sw.js'],
      usePolling: false
    },
    allowedHosts: [
      '138e-81-104-106-195.ngrok-free.app',
      'ac13-81-104-106-195.ngrok-free.app',
    ],
  },
  define: {
    // Development environment variables - no .env.local needed!
    'import.meta.env.VITE_ANALYTICS_ENABLED': '"false"',
    'import.meta.env.VITE_APP_ENV': '"development"',
    'import.meta.env.VITE_APP_VERSION': '"1.0.0"',
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react'],
        },
      },
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
