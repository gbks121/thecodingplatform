import js from "@eslint/js";
import tseslint from "@typescript-eslint/eslint-plugin";
import tseslintParser from "@typescript-eslint/parser";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import prettier from "eslint-plugin-prettier";
import prettierConfig from "eslint-config-prettier";

export default [
    {
        ignores: [
            "**/dist/**",
            "**/node_modules/**",
            "**/coverage/**",
            "**/*.config.ts",
            "**/*.config.js",
            "**/build/**",
        ],
    },
    js.configs.recommended,
    {
        files: ["apps/**/src/**/*.{ts,tsx,js,jsx}", "packages/**/src/**/*.{ts,tsx,js,jsx}"],
        languageOptions: {
            parser: tseslintParser,
            parserOptions: {
                ecmaVersion: "latest",
                sourceType: "module",
                ecmaFeatures: {
                    jsx: true,
                },
            },
            globals: {
                console: "readonly",
                process: "readonly",
                setInterval: "readonly",
                clearInterval: "readonly",
                setTimeout: "readonly",
                global: "readonly",
                window: "readonly",
                document: "readonly",
                navigator: "readonly",
                Worker: "readonly",
                self: "readonly",
                HTMLDivElement: "readonly",
                HTMLElement: "readonly",
                Element: "readonly",
                MessageEvent: "readonly",
                __dirname: "readonly",
                require: "readonly",
                URLSearchParams: "readonly",
                URL: "readonly",
                ErrorEvent: "readonly",
                React: "readonly",
                describe: "readonly",
                it: "readonly",
                expect: "readonly",
                vi: "readonly",
                beforeEach: "readonly",
                afterEach: "readonly",
                beforeAll: "readonly",
                afterAll: "readonly",
                Buffer: "readonly",
                WebSocket: "readonly",
                Y: "readonly",
            },
        },
        plugins: {
            "@typescript-eslint": tseslint,
            react,
            "react-hooks": reactHooks,
            "react-refresh": reactRefresh,
            prettier,
        },
        rules: {
            ...tseslint.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...reactHooks.configs.recommended.rules,
            ...prettierConfig.rules,
            "prettier/prettier": "warn",
            "react-refresh/only-export-components": [
                "warn",
                { allowConstantExport: true },
            ],
            "@typescript-eslint/no-unused-vars": [
                "warn",
                {
                    argsIgnorePattern: "^_",
                    varsIgnorePattern: "^_",
                },
            ],
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/ban-ts-comment": [
                "error",
                {
                    "ts-ignore": "allow-with-description",
                    "ts-expect-error": "allow-with-description",
                    "ts-nocheck": "allow-with-description",
                    "ts-check": "allow-with-description",
                    "minimumDescriptionLength": 10
                }
            ],
            "react/prop-types": "off",
            "react/jsx-uses-react": "off",
            "react/react-in-jsx-scope": "off",
        },
        settings: {
            react: {
                version: "detect",
            },
        },
    },
    // Configuration for Node.js scripts
    {
        files: ["apps/server/scripts/**/*.js"],
        languageOptions: {
            globals: {
                console: "readonly",
                process: "readonly",
                setTimeout: "readonly",
                global: "readonly",
                Buffer: "readonly",
                WebSocket: "readonly",
            },
        },
        rules: {
            "no-undef": "off",
        },
    },
];
