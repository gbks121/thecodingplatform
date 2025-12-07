# Role Definition
Act as a Principal Full-Stack Software Architect and Engineer. You are an expert in building real-time collaborative applications using React, WebSockets, CRDTs, WebAssembly, and modern design systems (Google Material Design).

# Project Context
We are building an MVP for **"The Coding Platform"**, an ephemeral, real-time collaborative coding interview and practice environment. The application provides:
- A marketing-style landing page with graphics and feature descriptions.
- A clear entry point for users to either create a new session or join an existing one using a session ID.
- A collaborative coding environment where multiple users can edit code together, see real-time changes, execute code in the browser, and view active participants in the session.

The system is initially stateless and ephemeral: no long-term persistence or authentication is required in this phase. Code execution happens entirely on the client side using WebAssembly (WASM) for safety and reduced infrastructure cost.

# Tech Stack & Rules

## Frontend
- **Framework:** React 18+ with Vite (TypeScript).
- **Routing:** `react-router-dom` with at least:
  - `/` for the landing page.
  - `/session/:sessionId` for the coding environment.
- **State Management:** Zustand for global UI and session state (e.g., selected language, user name, output logs, active users list).
- **Styling & Design System:**
  - Use **Google Material Design** principles consistently.
  - Use a React UI library aligned with Material Design (e.g., `@mui/material` + `@mui/icons-material`).
  - Tailwind CSS may be used for utility-level layout tweaks if desired, but Material Design components and patterns should dominate the UX.
- **Icons:** Prefer Material Icons; Lucide can be used where appropriate but Material should be primary.
- **Editor:** `monaco-editor` via `@monaco-editor/react`.
- **Real-time Collaboration:**
  - Core CRDT: `yjs`.
  - WebSocket Provider: `y-websocket` (client).
  - Editor Binding: `y-monaco` to bind a Yjs text type to the Monaco editor.

## Backend
- **Runtime:** Node.js.
- **Framework:** Express.js.
- **Real-time Transport:**
  - Use `ws` integrated with the Express HTTP server.
  - Use `y-websocket`’s `setupWSConnection` utility to manage collaboration documents (rooms keyed by `sessionId`).
- **API Endpoints:**
  - `GET /health` to verify server status.
  - Optional: `POST /session` can be implemented later if server-side session creation is desired; initially, session IDs can be generated on the client.

## Code Execution (Client-side WASM)
- **Supported Languages:** JavaScript, TypeScript, Python.
- **Execution Strategy:**
  - JavaScript / TypeScript:
    - Use Web Workers for sandboxed execution.
    - TypeScript should be compiled/transpiled in-browser (e.g., using `typescript` package or a lightweight transpiler) before executing as JavaScript in a worker.
  - Python:
    - Use Pyodide (from CDN or npm) to execute Python code in the browser.
- All code execution must run outside the main UI thread (Web Workers) to keep the UI responsive.

# Core User Flows & UX Requirements

## Landing Page ("/")
- Design a modern, visually appealing landing page following **Google Material Design**:
  - Use a hero section with a prominent title, subtitle, and call-to-action buttons.
  - Include at least one illustrative graphic or icon-based section describing key features:
    - Real-time collaboration.
    - In-browser code execution.
    - Multi-language support (JavaScript, TypeScript, Python).
    - Ephemeral, interview-focused sessions.
- Main CTAs:
  - **"Create New Session"** button.
  - **"Join Existing Session"** button.
- When the user chooses **Create New Session**:
  - Show a modal or dedicated form section:
    - Inputs:
      - `Name` (required).
      - `Preferred Programming Language` (select: JavaScript, TypeScript, Python).
    - On submit:
      - Generate a unique `sessionId` (e.g., UUID or nanoid) on the client.
      - Navigate to `/session/:sessionId`, passing the user name and selected language into state (e.g., via URL search params or a shared store).
- When the user chooses **Join Existing Session**:
  - Show a modal or dedicated form section:
    - Inputs:
      - `Name` (required).
      - `Session ID` (required).
    - On submit:
      - Navigate to `/session/:sessionId` with the provided sessionId and user name.

## Coding Environment ("/session/:sessionId")
- Layout should mirror a coding IDE using Material Design components for scaffolding and controls.
- Required sections:
  1. **Primary Code Editor Area**:
     - Central and largest region of the screen.
     - Monaco editor with language mode determined by current selected language.
     - Real-time collaborative editing via Yjs + y-websocket:
       - All connected users in a session share the same document.
       - Edits appear live for everyone.
  2. **Output Panel** (smaller section):
     - Displays stdout, stderr, and runtime errors from the WebAssembly/worker-based execution.
     - Use a Material Design card or panel at the bottom or right side.
  3. **Active Users Panel** (smaller section):
     - Shows a list of currently active users in the session, using their provided names.
     - Each user may be represented with an avatar (initials) and an online indicator.
     - This list should update in real time as users join/leave.
- Additional controls:
  - Language selector (JavaScript, TypeScript, Python).
  - "Run Code" button:
    - Executes the current code in the selected language using the appropriate client-side runner.
    - Streams or prints results to the Output Panel.
  - Session information display:
    - Show `sessionId` prominently with a "Copy" button to share the link.

# State & Data Model

## Client-side State (Zustand)
- `user`: `{ name: string }`.
- `session`: `{ id: string }`.
- `language`: union type `"javascript" | "typescript" | "python"`.
- `output`: list of log entries `{ id: string; type: "stdout" | "stderr" | "system"; message: string; timestamp: number }`.
- `activeUsers`: array of `{ id: string; name: string }`.
- UI flags such as loading states for Pyodide and Web Worker initialization.

## Real-time Documents (Yjs)
- For each `sessionId`, maintain:
  - A shared text document for the code buffer.
  - An optional shared array or map for chat or system messages.
  - A shared structure for presence (optional; some presence data may be handled via ephemeral messages or provider-level awareness).

# Coding Standards

1. **React & TypeScript**
   - Only functional components with hooks.
   - Strict TypeScript:
     - No `any` unless absolutely necessary and documented.
     - Define types/interfaces for:
       - WebSocket messages.
       - Yjs document structures.
       - Execution results.
2. **Design & UX**
   - Apply Google Material Design as the primary design language:
     - Use Material typography, spacing, and elevation.
     - Use a consistent color theme (primary/secondary) for buttons and accents.
   - Ensure responsive layout that works on modern desktops and large tablets (mobile support optional but a plus).
3. **Separation of Concerns**
   - Create dedicated hooks:
     - `useYjsCollaboration` for connecting to rooms, managing docs, and handling awareness.
     - `useCodeRunner` for initializing and managing Web Workers / Pyodide.
   - Keep view components thin; move logic into hooks and utility modules.
4. **Performance**
   - Lazy load Monaco, Pyodide, and any heavy libraries.
   - Use memoization (`useMemo`, `useCallback`) around expensive computations and frequently passed callbacks.
5. **Error Handling & Resilience**
   - Show user-friendly error messages when:
     - WebSocket connection drops.
     - Pyodide fails to initialize.
     - Code execution throws runtime errors.
   - Use Material snackbars/dialogs for transient error notifications.

# Project File Structure
Use a two-package structure (client + server) that can be managed via a simple workspace or as separate directories.

```
/
├── packages/
│ ├── client/ # React + Vite (The Coding Platform UI)
│ │ ├── src/
│ │ │ ├── components/
│ │ │ │ ├── landing/
│ │ │ │ │ ├── LandingPage.tsx # Marketing + entry actions
│ │ │ │ │ └── FeatureSections.tsx # Graphics & feature info
│ │ │ │ ├── session/
│ │ │ │ │ ├── CodeEditor.tsx # Monaco editor
│ │ │ │ │ ├── OutputPanel.tsx # Execution output
│ │ │ │ │ ├── ActiveUsersPanel.tsx # List of active users
│ │ │ │ │ └── SessionLayout.tsx # Overall layout shell
│ │ │ │ └── common/
│ │ │ │ ├── AppBar.tsx # Material top bar
│ │ │ │ └── Dialogs.tsx # Create/Join modals
│ │ │ ├── hooks/
│ │ │ │ ├── useYjsCollaboration.ts # Yjs + y-websocket logic
│ │ │ │ ├── useCodeRunner.ts # JS/TS/Python execution
│ │ │ │ └── useActiveUsers.ts # Presence handling
│ │ │ ├── stores/
│ │ │ │ └── useAppStore.ts # Zustand store
│ │ │ ├── lib/
│ │ │ │ ├── session.ts # sessionId helpers
│ │ │ │ ├── languages.ts # language configs
│ │ │ │ └── websocket.ts # WS URL helpers
│ │ │ ├── routes/
│ │ │ │ ├── Router.tsx # react-router-dom setup
│ │ │ │ ├── LandingRoute.tsx
│ │ │ │ └── SessionRoute.tsx
│ │ │ ├── App.tsx
│ │ │ └── main.tsx
│ │ ├── index.html
│ │ └── vite.config.ts
│ └── server/ # Express + y-websocket
│ ├── src/
│ │ ├── index.ts # Express app + HTTP server
│ │ └── wsServer.ts # WS upgrade + setupWSConnection
│ ├── tests/
│ │ └── integration/
│ │ ├── collaboration.test.ts # Integration tests
│ │ └── health.test.ts
│ ├── package.json
│ └── tsconfig.json
├── package.json
└── README.md
```


# Step-by-Step Implementation Plan

1. **Scaffold Project**
   - Initialize the `client` (React + Vite + TypeScript) and `server` (Express + TypeScript).
   - Install dependencies:
     - Client: React, React DOM, `react-router-dom`, `@mui/material`, `@mui/icons-material`, `@monaco-editor/react`, `yjs`, `y-websocket`, Zustand, and any worker/pyodide helpers.
     - Server: Express, `ws`, `y-websocket`, `ts-node` or equivalent tooling.

2. **Implement Landing Page (The Coding Platform)**
   - Build `LandingPage.tsx`:
     - Hero section with app name "The Coding Platform", tagline, and feature overview.
     - Feature sections with Material cards/icons describing:
       - Real-time collaboration.
       - Code execution in the browser.
       - Supported languages (JavaScript, TypeScript, Python).
   - Implement create/join flows using Material dialogs:
     - **Create Session Dialog**:
       - Name input.
       - Language dropdown.
       - On submit:
         - Generate `sessionId`.
         - Persist name, language, and sessionId in Zustand.
         - Navigate to `/session/:sessionId`.
     - **Join Session Dialog**:
       - Name input.
       - SessionId input.
       - On submit:
         - Persist name and sessionId in Zustand.
         - Navigate to `/session/:sessionId`.

3. **Express + WebSocket Server**
   - Implement `index.ts` to:
     - Create an Express app.
     - Define `GET /health` for status checks.
     - Create an HTTP server and attach Express.
   - Implement `wsServer.ts`:
     - Initialize a `ws` WebSocket server attached to the HTTP server.
     - On new connections, call `setupWSConnection` from `y-websocket` with the appropriate doc name (e.g., `sessionId` from URL path or query).
   - Ensure CORS and proper configuration so the client can connect during development.

4. **Collaborative Editor & Presence**
   - Implement `useYjsCollaboration`:
     - Create a Yjs `Doc` per session.
     - Connect to the WebSocket provider (y-websocket) using the `sessionId` as the room key.
     - Expose:
       - A shared text type for the code buffer.
       - Awareness/presence APIs for tracking active users.
   - Implement `CodeEditor.tsx`:
     - Integrate `@monaco-editor/react`.
     - Bind the editor model to the Yjs text via `y-monaco`.
     - Switch language modes based on the selected language in the store.
   - Implement `ActiveUsersPanel.tsx`:
     - Read awareness/presence data and display active users using Material list components.
     - Ensure that joining/leaving updates the list in real time.

5. **Code Execution Engine (JS/TS/Python)**
   - Implement `useCodeRunner`:
     - Manage initialization of:
       - A Web Worker for JS/TS execution.
       - Pyodide instance for Python.
     - For JavaScript:
       - Send code to the worker and capture stdout/stderr.
     - For TypeScript:
       - Transpile TS to JS in-browser, then send to the JS worker.
     - For Python:
       - Use Pyodide to run code and capture output.
   - Implement `OutputPanel.tsx`:
     - Display execution logs using a Material list or console-style panel.
     - Support different styles for stdout, stderr, and system messages.

6. **Session Layout & UX**
   - Implement `SessionLayout.tsx` to arrange:
     - Top: AppBar with session title, language selector, and "Run Code" button.
     - Main content:
       - Primary region: `CodeEditor`.
       - Side/bottom regions: `OutputPanel` and `ActiveUsersPanel` as smaller sections.
   - Ensure responsive resizing while keeping the editor as the dominant area.

7. **Integration Tests (Client-Server Real-time)**
   - Add integration tests focusing on client-server interactions and real-time collaboration:
     - Use a test framework like Jest + supertest for server, and a browser automation tool (e.g., Playwright/Cypress) or Node WebSocket clients to simulate multiple participants.
     - Example tests:
       - Start the server and confirm `GET /health` returns 200.
       - Simulate two clients connecting to the same `sessionId`:
         - Client A modifies the document; assert Client B sees the update.
         - Client A joins and leaves; assert presence updates in both clients.
       - Trigger code execution from the frontend:
         - Ensure that the UI correctly receives and displays output from JS/TS/Python executions.
   - Ensure tests cover:
     - Proper synchronization of text between clients.
     - Correct handling of new clients joining an existing session (they see current code state).
     - Robust handling of disconnects (session remains functional for other users).

# Verification Instructions

- From the landing page:
  - Verify that "Create New Session" opens a dialog, collects name and language, generates a sessionId, and routes to `/session/:sessionId` with the correct initial language.
  - Verify that "Join Existing Session" accepts name and sessionId and routes to the correct existing session.
- In the coding environment:
  - Open the same `sessionId` in two browsers; ensure all edits in one are reflected in the other in real time.
  - Confirm that the Active Users list updates as users join/leave.
  - For each supported language (JavaScript, TypeScript, Python), run a simple program and confirm outputs appear in the Output Panel.
- Run the integration test suite:
  - Confirm that client-server interactions and real-time collaboration tests pass, ensuring synchronization between frontend and backend when multiple users interact in a shared coding session.

