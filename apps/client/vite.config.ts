import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [react()],
    resolve: {
        alias: {
            // ensuring a single instance of yjs
            yjs: "yjs",
        },
    },
    server: {
        port: 3000,
    },
    optimizeDeps: {
        include: ["yjs", "y-websocket", "y-monaco"],
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    // Split vendor libraries
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    // Split UI library
                    ui: ['@mui/material', '@mui/icons-material', '@emotion/react', '@emotion/styled'],
                    // Split editor libraries
                    editor: ['monaco-editor', '@monaco-editor/react'],
                    // Split collaboration libraries
                    collab: ['yjs', 'y-websocket', 'y-monaco'],
                    // Split state management
                    state: ['zustand'],
                    // Split utilities
                    utils: ['uuid'],
                },
            },
        },
        // Increase the chunk size warning limit to 2500KB to avoid warnings for Monaco Editor
        chunkSizeWarningLimit: 2500,
    },
});
