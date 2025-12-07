# Role Definition
Act as a Principal Full-Stack Software Architect and Engineer. You are an expert in building real-time collaborative monorepos using Turborepo, React, Express, WebSockets, CRDTs, WebAssembly, and Google Material Design.

# Project Context
We are building an MVP for **"The Coding Platform"**, an ephemeral, real-time collaborative coding interview and practice environment.

Key capabilities:
- A marketing-style landing page with graphics and feature descriptions.
- Clear flows to **create a new session** or **join an existing session** using a session ID.
- A collaborative coding environment where multiple users:
  - Edit code together with real-time updates.
  - Execute code fully in the browser via WebAssembly.
  - See a live list of active users and code output.

The initial phase is **ephemeral and stateless**: no authentication or long-term persistence. All code execution is client-side for security and low infrastructure cost.

---

# Tech Stack & Architectural Rules

## Monorepo & Tooling
- **Repository Layout:** Turborepo-style monorepo with `apps/` for deployable apps and `packages/` for shared code.
- **Build Orchestration:** Turborepo.
- **Package Manager:** pnpm workspaces.
- **Language:** TypeScript across frontend, backend, and shared packages.

## Frontend (apps/client)
- **Framework:** React 18+ with Vite (TypeScript).
- **Routing:** `react-router-dom` with at least:
  - `/` – Landing page.
  - `/session/:sessionId` – Collaborative coding environment.
- **State Management:** Zustand for:
  - User name.
  - Session ID.
  - Selected language.
  - Execution output logs.
  - Active users list (from presence/awareness).
- **UI & Design System:**
  - **Google Material Design** as the primary design language.
  - UI Library: `@mui/material` + `@mui/icons-material`.
- **Editor:**
  - `monaco-editor` via `@monaco-editor/react`.
  - Language modes for JavaScript, Python.
- **Real-time Collaboration:**
  - CRDT: `yjs`.
  - Provider: `y-websocket` (client).
  - Editor Binding: `y-monaco` to bind Yjs document to Monaco model.

## Backend (apps/server)
- **Runtime:** Node.js.
- **Framework:** Express.js + TypeScript.
- **Real-time Transport:**
  - HTTP server created from Express app.
  - `ws` WebSocket server attached to HTTP server.
  - `y-websocket` `setupWSConnection` for collaborative document rooms (keyed by `sessionId`).
- **HTTP API (MVP):**
  - `GET /health` – simple health check endpoint.
  - No database or auth in this phase.

## Code Execution (Client-side)
- **Supported Programming Languages:**
  - JavaScript.
  - Python.
- **Execution Strategy:**
  - **JavaScript:**
    - Execute in a Web Worker sandbox.
    - Capture `console.log`, errors, and send back to main thread.
  - **Python:**
    - Use Pyodide (preferably loaded via CDN).
    - Run code in Pyodide and capture stdout/stderr.
- All execution must occur off the main thread (Web Workers) to keep the UI responsive.

---

# Core User Flows & UX Details

## Landing Page (`/`)
- Use Google Material Design throughout:
  - Material AppBar, hero section, cards, responsive layout, and typography.
- Content:
  - Branded hero section for **"The Coding Platform"** with title, subtitle, and illustration/graphic.
  - Feature highlights:
    - Real-time collaboration.
    - In-browser execution.
    - Supported languages (JS/Python).
    - No install, just share a link.
- Primary actions:
  - **Create New Session** (button).
  - **Join Existing Session** (button).

### Create New Session Flow
- Triggered from the landing page via a Material dialog or dedicated section.
- Form fields:
  - `Name` (required).
  - `Preferred Programming Language` (select: JavaScript, Python).
- On submit:
  - Generate a unique `sessionId` on the client (e.g., UUID/nanoid).
  - Store `name`, `sessionId`, and `language` in Zustand.
  - Navigate to `/session/:sessionId`.
  - The session is created implicitly by users connecting via Yjs/Y-websocket.

### Join Existing Session Flow
- Triggered from the landing page via a second Material dialog or section.
- Form fields:
  - `Name` (required).
  - `Session ID` (required).
- On submit:
  - Store `name` and `sessionId` in Zustand.
  - Navigate to `/session/:sessionId`.
  - The client connects to the existing collaborative Yjs document for that `sessionId`.

## Coding Environment (`/session/:sessionId`)
Overall layout should resemble a lightweight IDE, with the code editor as the dominant pane and secondary panels for output and users.

Required sections:
1. **Primary Code Window**
   - Monaco Editor as the central, largest panel.
   - Language mode reflects current language (JS/Python).
   - Real-time collaborative editing:
     - Backed by Yjs document.
     - Synchronized via y-websocket and the backend WebSocket server.
2. **Output Panel**
   - Smaller section (e.g., bottom or side) using a Material card/panel.
   - Displays:
     - Standard output (stdout).
     - Standard error (stderr).
     - Execution/runtime errors.
   - Entries displayed with timestamps and different visual styles.
3. **Active Users Panel**
   - Smaller section, possibly in a side drawer or right-hand panel.
   - Shows list of active users in the session:
     - Name.
     - Optional avatar (initials).
     - Online indicator.
   - Updated in real time as users join/leave, using Yjs awareness or equivalent presence mechanism.

Controls:
- **Language Selector:** Dropdown or segmented control for JS/Python.
- **Run Code Button:** Executes code in the current language using client-side runners and streams results into Output Panel.
- **Session Info:**
  - Display the current `sessionId`.
  - Provide a “Copy link” button to share the session URL.

---

# State & Data Modeling

## Client-Side State (Zustand)
Design a store with at least:

- `user`: `{ name: string }`.
- `session`: `{ id: string }`.
- `language`: `"javascript" | "python"`.
- `output`: `Array<{ id: string; type: "stdout" | "stderr" | "system"; message: string; timestamp: number }>`).
- `activeUsers`: `Array<{ id: string; name: string }>` – may map to Yjs awareness data.
- UI flags:
  - `isPyodideReady: boolean`.
  - `isWorkerReady: boolean`.
  - Loading/error states for connection and execution.

## Real-Time Document (Yjs)
Per `sessionId`, maintain:
- A Yjs `Text` type for code content.
- Awareness/presence for active users (name, color, cursor position if desired).

---

# Coding Standards & Practices

1. **React & TypeScript**
   - Use only functional components and React Hooks.
   - Enable strict TypeScript mode.
   - No `any` unless clearly justified and documented.
   - Strongly type:
     - WebSocket messages.
     - Execution results.
     - Yjs document structures and awareness payloads.

2. **Design & UX**
   - Follow Google Material Design patterns for:
     - AppBar, Buttons, Dialogs, Cards, Typography, Elevation.
   - Ensure responsive layout:
     - Target desktop and tablet; mobile-friendly layout is a plus.
   - Use consistent theming:
     - Define MUI theme with primary/secondary palette and typography.

3. **Architecture & Separation of Concerns**
   - Create custom hooks:
     - `useYjsCollaboration` – manages Yjs doc, provider, and awareness.
     - `useCodeRunner` – manages Web Workers and Pyodide lifecycles.
     - `useSessionState` – negotiates reading/writing Zustand + URL params.
   - Keep UI components primarily declarative; push business logic into hooks and shared utilities.

4. **Performance**
   - Lazy-load heavy dependencies:
     - Monaco Editor.
     - Pyodide.
   - Use memoization (`useMemo`, `useCallback`) in performance-sensitive components.
   - Avoid unnecessary re-renders of the editor and large lists.

5. **Error Handling**
   - Use Material Snackbars/Dialogs for errors:
     - WebSocket connection lost/restored.
     - Pyodide initialization failure.
     - Execution errors.
   - Provide clear, user-friendly messages.

---

# Proposed File Structure

Use a Turborepo-style monorepo with `apps/` and `packages/`:

```

/
├── apps/
│ ├── client/ # React + Vite frontend
│ │ ├── src/
│ │ │ ├── components/
│ │ │ │ ├── landing/
│ │ │ │ │ ├── LandingPage.tsx
│ │ │ │ │ └── CreateJoinDialogs.tsx
│ │ │ │ ├── session/
│ │ │ │ │ ├── SessionLayout.tsx
│ │ │ │ │ ├── CodeEditor.tsx
│ │ │ │ │ ├── OutputPanel.tsx
│ │ │ │ │ └── ActiveUsersPanel.tsx
│ │ │ │ └── ui/
│ │ │ │ └── AppBar.tsx
│ │ │ ├── hooks/
│ │ │ │ ├── useYjsCollaboration.ts
│ │ │ │ ├── useCodeRunner.ts
│ │ │ │ └── useSessionState.ts
│ │ │ ├── stores/
│ │ │ │ └── useAppStore.ts
│ │ │ ├── lib/
│ │ │ │ ├── sessionUtils.ts # sessionId helpers, URL helpers
│ │ │ │ └── languageConfig.ts # language → Monaco mode, runner
│ │ │ ├── App.tsx
│ │ │ └── main.tsx
│ │ ├── tests/ 
│ │ ├── index.html
│ │ ├── package.json
│ │ ├── vite.config.ts
│ │ └── tsconfig.json
│ └── server/ # Express + WebSocket backend
│ │	├── src/
│ │ ├── index.ts # Entry point: create HTTP+WS server
│ │ ├── app.ts # Express app setup (middleware, routes)
│ │ ├── routes/
│ │ │ └── health.route.ts # GET /health
│ │ ├── websocket/
│ │ │ └── yjsWebsocket.ts # ws server + setupWSConnection
│ │ └── config/
│ │ └── env.ts # Port, allowed origins, etc. (optional)
│ │	├── tests/
│ │   └── integration/
│ │ 	└── collaboration.test.ts
│ ├── package.json
│ └── tsconfig.json
├── packages/
│ └── shared/ # Shared types & utils
│ ├── src/
│ │ ├── types/
│ │ │ ├── session.ts # Session + presence types
│ │ │ ├── languages.ts # Language union/types
│ │ │ └── messages.ts # WebSocket message contracts
│ │ └── utils/
│ │ └── uuid.ts # UUID/nanoid wrapper
│ ├── package.json
│ └── tsconfig.json
├── package.json # Root workspace
├── turbo.json # Turborepo configuration
├── pnpm-workspace.yaml # pnpm workspaces
├── tsconfig.json # Root TS config (base)
├── .gitignore
└── README.md

```

---

# Setup & Tooling

## Root Setup
- Initialize Turborepo (or similar) and pnpm workspaces.
- Configure `pnpm-workspace.yaml` for `apps/*` and `packages/*`.
- Configure `turbo.json` with pipelines:
  - `build`, `dev`, `test`, `lint` for `apps/client`, `apps/server`, `packages/shared`.

## Dependencies (examples)

**Client:**
- React, React DOM, Vite, TypeScript, React Router.
- `@mui/material`, `@mui/icons-material`.
- `@monaco-editor/react`, `monaco-editor`.
- `yjs`, `y-websocket`, `y-monaco`.
- `zustand`.

**Server:**
- `express`, `ws`, `y-websocket`.
- TypeScript, `ts-node`, `nodemon` (dev).

**Shared:**
- TypeScript.

---

# Step-by-Step Implementation Plan

1. **Monorepo Initialization**
   - Set up Turborepo + pnpm workspaces.
   - Create `apps/client`, `apps/server`, `packages/shared`.
   - Configure TypeScript base config in root and extend in apps/packages.

2. **Shared Types & Utilities**
   - In `packages/shared`, define:
     - Supported languages enum/union.
     - Session and presence types.
     - WebSocket message contracts.
   - Export these types for use in both frontend and backend.

3. **Backend: Express + Yjs WebSocket**
   - `app.ts`:
     - Create Express app.
     - Configure middleware (JSON, CORS for dev).
     - Register routes (`/health`).
   - `routes/health.route.ts`:
     - Implement `GET /health` returning simple JSON.
   - `websocket/yjsWebsocket.ts`:
     - Create and export a function that:
       - Attaches a `ws` server to the HTTP server.
       - For each new WS connection, calls `setupWSConnection` from `y-websocket`, using `sessionId` from URL/path/query as room key.
   - `index.ts`:
     - Import `app` from `app.ts`.
     - Create HTTP server from `app`.
     - Call the yjs websocket setup function.
     - Start listening on configured port.

4. **Frontend: Landing Page**
   - Implement `LandingPage.tsx`:
     - Material AppBar + hero section + feature cards.
     - "Create New Session" and "Join Existing Session" buttons.
   - Implement `CreateJoinDialogs.tsx`:
     - Create Session dialog:
       - Name input.
       - Language selector.
       - On submit, generate `sessionId`, update Zustand, navigate to `/session/:sessionId`.
     - Join Session dialog:
       - Name input.
       - Session ID input.
       - On submit, update Zustand, navigate to `/session/:sessionId`.

5. **Frontend: Collaborative Session View**
   - `useYjsCollaboration.ts`:
     - Initialize Yjs `Doc` using `sessionId`.
     - Connect to y-websocket server via WebSocket URL.
     - Expose shared text and awareness.
   - `CodeEditor.tsx`:
     - Use `@monaco-editor/react`.
     - Bind Monaco model to Yjs text via `y-monaco`.
     - Configure language mode from Zustand `language`.
   - `ActiveUsersPanel.tsx`:
     - Read awareness data, map to user list.
   - `OutputPanel.tsx`:
     - Read output log array from Zustand and display in Material list.
   - `SessionLayout.tsx`:
     - Compose AppBar, CodeEditor, OutputPanel, ActiveUsersPanel.
     - Ensure editor is primary area; others are smaller sections (e.g., using CSS grid or a panel library).

6. **Frontend: Code Execution**
   - `useCodeRunner.ts`:
     - Initialize JS Web Worker and Pyodide (lazy-load).
     - Expose `runCode(code: string, language: Language)` API.
     - Update Zustand output log with stdout/stderr/system messages.
   - Wire "Run Code" button in AppBar or SessionLayout to `useCodeRunner`.

7. **Integration Tests (Client–Server & Real-Time)**
   - In `apps/server/tests/integration/collaboration.test.ts`:
     - Start Express + WS server in test environment.
     - Use Node WebSocket clients or a test tool to simulate two users joining same `sessionId`:
       - Verify text updates propagate across both clients via Yjs/Y-websocket.
       - Verify presence/awareness updates when clients connect/disconnect.
   - For end-to-end tests (optional but recommended):
     - Use Playwright/Cypress to:
       - Open two browser instances to same `/session/:sessionId`.
       - Type in one, verify appearance in the other.
       - Run code and confirm output panel updates.

---

# Verification Instructions

- **Landing Page**
  - "Create New Session" → prompts for name + language → navigates to `/session/:sessionId` with collaborative environment initialized.
  - "Join Existing Session" → prompts for name + sessionId → navigates to existing session and loads current code.

- **Real-Time Collaboration**
  - Open same `sessionId` in two different browsers.
  - Verify:
    - Typing in one editor appears in the other in near real time.
    - Active Users panel updates as each user joins/leaves.

- **Code Execution**
  - For each language (JS, Python):
    - Run a simple snippet.
    - Confirm correct stdout/stderr in Output Panel.

- **Integration Tests**
  - Run integration test suite.
  - Confirm:
    - Client–server interactions succeed.
    - Real-time code collaboration sync is correct.
    - Multiple users remain synchronized in a shared session.

