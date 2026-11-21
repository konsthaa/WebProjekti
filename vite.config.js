import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  root: 'client',
  plugins: [react()],
  server: {
    proxy: {
      '/api/lunch-menu': 'http://localhost:3001',
      '/api': 'http://localhost:3000',
    },
  },
});
