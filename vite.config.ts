import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@contexts': path.resolve(__dirname, './src/contexts'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
    },
  },
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
    include: [
      'react',
      'react-dom',
      'react-router-dom'
    ]
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
});
