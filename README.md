# The Coding Platform

A real-time collaborative coding environment designed for technical interviews and practice. This ephemeral, stateless platform allows users to create sessions, invite others via a shared link, and code together in JavaScript, TypeScript, and Python with live output execution.

## Features

- **Real-Time Collaboration**: Code synchronization powered by Yjs and WebSockets.
- **Multi-Language Support**:
    - **JavaScript**: Secure execution in a Web Worker sandboxed environment.
    - **TypeScript**: In-browser transpilation to JavaScript using Monaco services.
    - **Python**: Client-side execution using Pyodide (WASM).
- **Live Awareness**: See who is active in the session and when they are **typing**.
- **Terminal Output**: Real-time `stdout` and `stderr` capturing.
- **Stateless**: No database required; sessions are ephemeral and exist only while active.
- **Modern UI**: Built with React, Vite, and Google Material Design (MUI).

## Tech Stack

### Frontend (`apps/client`)

- **Framework**: React 18, Vite
- **Language**: TypeScript
- **Styling**: Material UI (MUI)
- **Editor**: Monaco Editor (`@monaco-editor/react`)
- **Collaboration**: Yjs, `y-websocket`, `y-monaco`
- **State Management**: Zustand
- **Testing**: Vitest, React Testing Library
- **Runtime**: Web Workers, Pyodide

### Backend (`apps/server`)

- **Runtime**: Node.js
- **Framework**: Express.js
- **WebSockets**: `ws` library (handling Yjs sync)
- **Language**: TypeScript
- **Testing**: Vitest, Supertest

### Shared (`packages/shared`)

- Shared TypeScript types and contracts.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm (v9+ recommended)

### Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/thecodingplatform.git
    cd thecodingplatform
    ```

2.  Install dependencies (from the root):
    ```bash
    npm install
    ```
    This will install dependencies for all workspaces (`apps/client`, `apps/server`, `packages/shared`).

### Running Locally

Start both the client and server concurrently:

```bash
npm run dev
```

- **Frontend**: Open [http://localhost:3000](http://localhost:3000)
- **Backend**: Running on [http://localhost:3001](http://localhost:3001)

### Testing

Run the full test suite (Unit + Integration):

```bash
npm run test
```

Generate Code Coverage reports:

```bash
npm run test:coverage
```

To verify the real-time WebSocket synchronization logic specifically:

```bash
npm run test:integration --workspace=apps/server
```

## Project Structure

```
thecodingplatform/
├── apps/
│   ├── client/       # React + Vite frontend
│   └── server/       # Express + WebSocket backend
├── packages/
│   └── shared/       # Shared TypeScript types
├── package.json      # Root configuration & workspaces
└── tsconfig.json     # Base TypeScript configuration
```

## License

MIT
