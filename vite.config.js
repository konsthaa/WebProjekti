import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  root: 'client',
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/lunch-menu': 'http://localhost:3001',
      '/api': 'http://localhost:3000',
    },
  },
});
