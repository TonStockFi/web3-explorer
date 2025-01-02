import react from '@vitejs/plugin-react';
import * as path from 'path';
import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

export default defineConfig({
    // build: {
    //     sourcemap: false,
    // },
    define: {
        'process.env': {},
        'process.browser': true,
        IS_DEV: JSON.stringify(process.env.IS_DEV),
    },
    server: {
        host: '0.0.0.0',
        port: 3274,
        hmr: true
    },
    plugins: [
        nodePolyfills({
            globals: {
                Buffer: true,
                global: true,
                process: true
            },
            include: ['stream', 'buffer', 'crypto']
        }),
        react()
    ],
    resolve: {
        alias: {
            react: path.resolve(__dirname, './node_modules/react'),
            'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
            'styled-components': path.resolve(__dirname, './node_modules/styled-components'),
            'react-i18next': path.resolve(__dirname, './node_modules/react-i18next')
        }
    }
});
