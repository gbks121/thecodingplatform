# Role Definition

Act as a Principal Full-Stack Software Architect and Engineer. You are an expert in building real-time collaborative applications using React, Express, WebSockets, CRDTs, WebAssembly, and Google Material Design in a simple JavaScript/TypeScript monorepo.

# Project Context

We are building an MVP for **"The Coding Platform"**, an ephemeral, real-time collaborative coding interview and practice environment.

Core capabilities:

- A marketing-style landing page with graphics and information about product features.
- Entry points to **Create a new session** or **Join an existing session** by ID.
- A collaborative coding environment with:
    - Shared Monaco editor (real-time updates for all connected users).
    - Client-side code execution (JavaScript, TypeScript, Python via WASM/Workers).
    - A visible list of currently active users.
    - An output panel for code results.

The first phase is **stateless and ephemeral**: no authentication or database. All code execution is performed in the browser.

---

# Tech Stack & Architectural Rules

## Monorepo & Workspaces

- Use a **single Git repo** with a simple structure:
    - `apps/` for deployable applications (frontend and backend).
    - `packages/` for shared code (types, utilities).
- Use **npm workspaces** (or yarn workspaces) from the root `package.json` to manage these packages.[web:40][web:44]

## Frontend (apps/client)

- **Framework:** React 18+ with Vite and TypeScript.
- **Routing:** `react-router-dom` with:
    - `/` – Landing page.
    - `/session/:sessionId` – Coding environment.
- **State Management:** Zustand for:
    - User name.
    - Session ID.
    - Selected language.
    - Code execution output logs.
    - Active users list.
- **UI & Design System:**
    - **Google Material Design** across all screens.
    - UI library: `@mui/material` + `@mui/icons-material`.
- **Editor:**
    - `monaco-editor` via `@monaco-editor/react`.
    - Support JavaScript, TypeScript, Python syntax.
- **Real-Time Collaboration:**
    - CRDT core: `yjs`.
    - Transport: `y-websocket` (client).
    - Binding: `y-monaco` to sync Yjs text with Monaco.

## Backend (apps/server)

- **Runtime:** Node.js.
- **Framework:** Express.js + TypeScript.
- **WebSockets:**
    - `ws` WebSocket server bound to the same HTTP server as Express.
    - Integrate `y-websocket` `setupWSConnection` to manage Yjs documents per `sessionId`.
- **Endpoints:**
    - `GET /health` – basic health check.
- No DB or authentication layer in this phase.

## Code Execution (Client-Side Only)

- **Supported languages:** JavaScript, TypeScript, Python.
- **Strategy:**
    - **JavaScript:**
        - Execute in a Web Worker sandbox.
        - Capture `console.log` and errors.
    - **TypeScript:**
        - Transpile TS → JS in browser (using the `typescript` package or similar).
        - Execute resulting JS in the same Web Worker.
    - **Python:**
        - Load and use Pyodide in the browser.
        - Capture stdout and stderr from Python execution.
- All execution runs **off the main thread** (Web Workers) to keep UI responsive.

---

# User Flows & UX

## Landing Page (`/`)

- Follow Material Design:
    - AppBar with product name (**The Coding Platform**).
    - Hero section with main headline, subheadline, and CTA buttons.
    - Feature cards or sections that highlight:
        - Real-time collaboration.
        - In-browser code execution (JS/TS/Python).
        - Ephemeral sessions for interviews.
- Main actions:
    - **Create New Session** (primary button).
    - **Join Existing Session** (secondary button).

### Create New Session

- When user clicks **Create New Session**:
    - Show a Material dialog (or dedicated section) with:
        - `Name` (required text field).
        - `Preferred Programming Language` (select: JavaScript, TypeScript, Python).
    - On submit:
        - Generate a unique `sessionId` on the client.
        - Store `name`, `sessionId`, and `language` in Zustand.
        - Navigate to `/session/:sessionId`.

### Join Existing Session

- When user clicks **Join Existing Session**:
    - Show a dialog with:
        - `Name` (required).
        - `Session ID` (required).
    - On submit:
        - Store `name` and `sessionId` in Zustand.
        - Navigate to `/session/:sessionId`.

## Coding Environment (`/session/:sessionId`)

Layout should prioritize the editor while showing output and active users in smaller sections.

Required parts:

1. **Primary Coding Window**
    - Monaco editor as the main region.
    - Real-time collaboration backed by Yjs:
        - All users see the same document.
        - Edits propagate live via y-websocket.
    - Language mode is determined by current language (JS/TS/Python).

2. **Output Panel**
    - Smaller section (e.g., bottom).
    - Material card/panel listing:
        - stdout.
        - stderr.
        - system messages (e.g. "Pyodide loaded").
    - Styled to distinguish log types by color / icon.

3. **Active Users Panel**
    - Smaller section (e.g., right-side).
    - Displays currently active users in the session:
        - Name.
        - Optional avatar (initials).
    - Updated in real time via Yjs awareness or similar presence mechanism.

Controls:

- **Language Selector:** Material select or segmented control.
- **Run Code Button:** Executes current code in the chosen language; appends results to Output Panel.
- **Session Info:**
    - Show `sessionId` and a "Copy link" button.

---

# State & Types

## Zustand Store

At least:

- `user: { name: string }`.
- `session: { id: string }`.
- `language: "javascript" | "typescript" | "python"`.
- `output: Array<{ id: string; type: "stdout" | "stderr" | "system"; message: string; timestamp: number }>`).
- `activeUsers: Array<{ id: string; name: string }>`.

## Shared Types (packages/shared)

- `Language` union.
- `Session` and presence types.
- WebSocket/Yjs message contracts if needed.

---

# Coding Standards

- **React:**
    - Functional components only.
    - Use hooks for side effects and state.
- **TypeScript:**
    - Strict mode on.
    - Avoid `any`; define explicit interfaces and types.
- **Hooks:**
    - `useYjsCollaboration`:
        - Creates and manages Yjs doc + y-websocket provider.
        - Handles awareness for active users.
    - `useCodeRunner`:
        - Manages Web Worker and Pyodide lifecycle.
        - Provides `runCode(code, language)` API.
    - `useSessionState`:
        - Bridges URL params and Zustand state.
- **Design:**
    - Material Design for all UI: AppBar, Buttons, Dialogs, Panels.
    - Responsive and accessible components.
- **Performance:**
    - Lazy load Monaco and Pyodide.
    - Memoize heavy computations and callbacks.
- **Error Handling:**
    - Material Snackbars for:
        - WebSocket disconnections/reconnections.
        - Execution errors.
        - Initialization failures (e.g., Pyodide).

---

# Simple Monorepo Folder Structure (No Turborepo, No pnpm)

Use `apps/` and `packages/` but manage with **npm workspaces**

---

### Root `package.json` (Conceptual)

- Mark repo as `"private": true`.
- Define workspaces:
    - `"apps/*"`, `"packages/*"`.
- Add scripts to start client and server from root:
    - `"dev:client": "npm run dev --workspace apps/client"`
    - `"dev:server": "npm run dev --workspace apps/server"`
    - `"dev": "concurrently \"npm run dev:client\" \"npm run dev:server\""` (with `concurrently`).

---

# Step-by-Step Implementation Plan

1. **Initialize Monorepo**
    - Create root `package.json` with npm workspaces for `apps/*` and `packages/*`.
    - Add root `tsconfig.json` and `.gitignore`.

2. **Shared Package (`packages/shared`)**
    - Define language, session, presence, and message types.
    - Export utilities (e.g., `uuid` helper).

3. **Backend (`apps/server`)**
    - `app.ts`:
        - Setup Express, JSON middleware, CORS.
        - Mount `/health` route.
    - `routes/health.route.ts`:
        - Implement health endpoint.
    - `yjsWebsocket.ts`:
        - Attach `ws` server to HTTP server.
        - Use `setupWSConnection` with `sessionId` from URL/path.
    - `index.ts`:
        - Create HTTP server from Express app.
        - Initialize WebSocket server.
        - Listen on configured port.

4. **Frontend (`apps/client`)**
    - Implement `LandingPage` and `CreateJoinDialogs` with Material Design.
    - Setup routing for `/` and `/session/:sessionId`.
    - Implement `SessionLayout`, `CodeEditor`, `OutputPanel`, `ActiveUsersPanel`.

5. **Collaboration & Execution**
    - `useYjsCollaboration` for Yjs doc/provider + presence.
    - `useCodeRunner` for JS/TS worker + Pyodide.
    - Wire "Run Code" and language selector into session view.

6. **Integration Tests**
    - Integration tests in `apps/server/tests/integration` to:
        - Spin up server.
        - Simulate multiple WebSocket clients to verify Yjs synchronization.
        - Optionally, run headless browser tests (Playwright/Cypress) to validate end-to-end real-time editing and presence.

---

# Verification Instructions

- **Landing Page:**
    - Verify Create/Join flows correctly navigate and store state.
- **Collaboration:**
    - Open same session in two browsers.
    - Confirm real-time code sync and active users list behavior.
- **Code Execution:**
    - Run JavaScript, TypeScript, and Python snippets; verify Output Panel.
- **Tests:**
    - Run integration tests to ensure proper client-server interaction and synchronization in collaborative sessions.
