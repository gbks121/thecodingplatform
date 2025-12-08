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
});
