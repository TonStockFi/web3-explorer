import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
    base: './',
    build: {
        // minify: false,
        // terserOptions: {
        //     compress: false,
        //     mangle: false
        // },
        outDir: '/Users/ton/Desktop/projects/android/web3-desk/app/src/main/assets', // Specify Android assets folder
        emptyOutDir: true // Clears the output directory before building
    },
    plugins: [react()],
    server: {
        host: '0.0.0.0'
    }
});
