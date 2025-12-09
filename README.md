# The Coding Platform

A real-time collaborative coding environment designed for technical interviews and practice. This ephemeral, stateless platform allows users to create sessions, invite others via a shared link, and code together in JavaScript, TypeScript, and Python with live output execution.

## Features

- **Real-Time Collaboration**: Code synchronization powered by Yjs and WebSockets
- **Multi-Language Support**:
    - **JavaScript**: Secure execution in a Web Worker sandboxed environment
    - **TypeScript**: In-browser transpilation to JavaScript using Monaco services
    - **Python**: Client-side execution using Pyodide (WASM)
- **Live Awareness**: See who is active in the session and when they are typing
- **Terminal Output**: Real-time stdout and stderr capturing
- **Stateless**: No database required; sessions are ephemeral and exist only while active
- **Modern UI**: Built with React, Vite, and Google Material Design (MUI)

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

- Shared TypeScript types and contracts

## Quick Start

### Prerequisites

- Node.js (v18+ recommended)
- npm (v9+ recommended)

### Installation

1. Clone the repository:

```bash
git clone https://github.com/your-username/thecodingplatform.git
cd thecodingplatform
```

2. Install dependencies (from the root):

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

### Running with Docker

To run the application using Docker:

```bash
# Build and start the services
docker-compose up --build

# The application will be available at:
# - Frontend: http://localhost:8080
# - Backend API: http://localhost:3001
# - Health check: http://localhost:3001/health
```

### Code Quality & Testing

```bash
# Code quality checks
npm run lint        # Check for linting issues
npm run lint:fix    # Auto-fix formatting issues
npm run format      # Format with Prettier

# Testing
npm test            # Run all tests
npm run test:coverage # Generate coverage reports

# Building
npm run build       # Build all workspaces
```

To verify the real-time WebSocket synchronization logic specifically:

```bash
npm run test:integration --workspace=apps/server
```

## Runtime & Networking (Nginx)

- Frontend is served by nginx from `/app/frontend` on port `80` in production.
- nginx proxies backend traffic internally to the Node server on port `3001`:
    - `/api` → `http://localhost:3001`
    - `/health` → `http://localhost:3001`
    - `/ws` → proxied as a WebSocket upgrade to `http://localhost:3001` (used by Yjs).
- The client uses a same-origin WebSocket path (`/ws`) that is translated to `ws://` or `wss://` depending on the page protocol so it works both locally and when deployed over HTTPS.
- Health checks should target the public `/health` endpoint (nginx will forward to the backend). Example: `curl http://<host>/health`.
- Platform note: ensure your host/load-balancer (Render, etc.) supports WebSocket proxying and points to the container's port `80` (nginx handles backend proxying).

## Deploying to Render

- **Service Type:** Use a Web Service using a Docker image (select the repository and Dockerfile build).
- **Dockerfile path:** `./Dockerfile` (root of repo). The image exposes port `80` where nginx serves the frontend and proxies the backend.
- **Health Check:** Point Render's health check to the public `/health` endpoint (HTTP GET). Example: `/health` with a 10s timeout and a few retries.
- **Environment / Ports:** No additional external ports are required — Render should route traffic to port `80` inside the container. Backend runs internally on `3001` and is proxied by nginx.
- **Image Tagging / Rollouts:** We recommend using immutable tags for production deployments:
    - Use the GitHub Actions produced commit `SHA` tag to pin a specific image (recommended for reproducibility and rollbacks).
    - Alternatively, use `latest` on the default branch for continuous deploys (convenient but less reproducible).
- **WebSockets:** Ensure Render's load balancer and service settings allow WebSocket proxying so `/ws` upgrades are forwarded to the backend.

Example: when creating/updating the Render service, set the image to `ghcr.io/<owner>/<repo>:<sha>` to deploy a specific build, or `ghcr.io/<owner>/<repo>:latest` for continuous deploys from `main`.

Deployed App: https://thecodingplatform.onrender.com/

## Project Structure

```
thecodingplatform/
├── apps/
│   ├── client/       # React + Vite frontend
│   └── server/       # Express + WebSocket backend
├── packages/
│   └── shared/       # Shared TypeScript types
├── package.json      # Root configuration & workspaces
└── README.md         # This file
```

## Available Scripts

- `npm run dev` - Start development servers (client:3000, server:3001)
- `npm run dev:client` - Start only the client development server
- `npm run dev:server` - Start only the server development server
- `npm run build` - Build all workspaces for production
- `npm run test` - Run the complete test suite
- `npm run test:coverage` - Generate code coverage reports
- `npm run lint` - Run ESLint across all workspaces
- `npm run lint:fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier

## Architecture Highlights

### Real-Time Collaboration

The platform uses **Yjs** (a conflict-free replicated data type) for document synchronization and **WebSockets** for real-time communication. When users join a session, they connect to a shared Yjs document that automatically handles:

- Operational Transformation (OT) for simultaneous edits
- Connection recovery and offline support
- Awareness states for active users and typing indicators

### Security & Sandboxing

- **JavaScript/TypeScript**: Executed in isolated Web Workers
- **Python**: Runs in Pyodide (WebAssembly) sandbox
- No server-side code execution, everything happens client-side

### State Management

- **Zustand** for global application state
- **Local State** for component-specific data
- **Yjs Documents** for collaborative document state

## License

MIT
