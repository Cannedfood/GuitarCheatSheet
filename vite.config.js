import vue from '@vitejs/plugin-vue'
import { defineConfig } from "vite";
import path from 'path'

export default defineConfig({
    build: {
        assetsDir: '',
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, 'src'),
        },
    },
    plugins: [
        vue()
    ]
})