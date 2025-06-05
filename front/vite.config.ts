/// <reference types="vitest"/>
import path from 'path'
import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react({
        jsxImportSource: '@emotion/react', // 설정해주지 않으면 Emotion의 css 함수를 파싱하지 못한다.
    })],
    resolve: {
        alias: {
            "@": path.resolve(__dirname, "./src")
        }
    },
    test: {
        //
    },
    server: {
        port: 3000
    }
});
