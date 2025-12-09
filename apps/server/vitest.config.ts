/// <reference types="vitest" />
import { defineConfig } from "vite";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        includeSource: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
        exclude: ['dist/**/*', 'node_modules/**/*'],
        tsconfig: './tsconfig.test.json',
        coverage: {
            provider: "v8",
            reporter: ["text", "json", "html"],
        },
    },
});
