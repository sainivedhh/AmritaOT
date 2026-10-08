import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        machine: resolve(__dirname, 'machine.html'),
        alerts: resolve(__dirname, 'alerts.html'),
        rules: resolve(__dirname, 'rules.html'),
        thresholds: resolve(__dirname, 'thresholds.html'),
        maintenance: resolve(__dirname, 'maintenance.html'),
        audit: resolve(__dirname, 'audit.html'),
        users: resolve(__dirname, 'users.html'),
        reports: resolve(__dirname, 'reports.html'),
        integrations: resolve(__dirname, 'integrations.html'),
        settings: resolve(__dirname, 'settings.html')
      }
    }
  },
  test: {
    environment: 'jsdom'
  }
});
