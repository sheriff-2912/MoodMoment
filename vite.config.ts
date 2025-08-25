import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:54321/functions/v1',
        changeOrigin: true,
        rewrite: (path) => {
          if (path.startsWith('/api/auth/')) {
            return path.replace('/api', '/auth-api')
          }
          if (path.startsWith('/api/users/')) {
            return path.replace('/api', '/user-api')
          }
          if (path.startsWith('/api/moods')) {
            return path.replace('/api', '/moods-api')
          }
          if (path.startsWith('/api/admin/')) {
            return path.replace('/api', '/admin-api')
          }
          return path.replace('/api', '')
        },
      },
    },
  },
});