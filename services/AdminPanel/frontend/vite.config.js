import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
    plugins: [sveltekit()],
    server: {
        proxy: {
            '/api': {
                target: 'http://admin_backend:3000',
                changeOrigin: true
            },

            '/uploads': {
                target: 'http://admin_backend:3000',
                changeOrigin: true
            }
        }
    }
});