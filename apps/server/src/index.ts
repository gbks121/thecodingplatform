import http from "http";
import { WebSocketServer } from "ws";
import app from "./app.js";
import { handleUpgrade } from "./yjsWebsocket.js";

const PORT = process.env.PORT || 3001;

const server = http.createServer(app);

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
    // Only handle upgrades for document paths, verify if needed
    // For now, accept all upgrades as potential yjs connections
    wss.handleUpgrade(request, socket, head, (ws) => {
        handleUpgrade(request, ws, head);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`WebSocket server ready`);
});
