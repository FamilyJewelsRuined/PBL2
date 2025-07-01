import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api-mahasiswa': {
        target: 'https://ti054c03.agussbn.my.id',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api-mahasiswa/, '/api/mahasiswa'),
        secure: false,
      },
      '/api-tambah-mahasiswa': {
        target: 'https://ti054c03.agussbn.my.id',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api-tambah-mahasiswa/, '/api/tambah-mahasiswa'),
      },
    },
  },
});