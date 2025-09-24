import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import fs from 'fs';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
    https: process.env.NODE_ENV === 'development'
      ? {
          key: fs.readFileSync('./certs/localhost-key.pem'),
          cert: fs.readFileSync('./certs/localhost-cert.pem'),
        }
      : false,
    watch: {
      ignored: ['**/certs/**', '**/.env'],
    },
  },
});