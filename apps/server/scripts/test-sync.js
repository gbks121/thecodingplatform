const WebSocket = require("ws");
const Y = require("yjs");
const { WebsocketProvider } = require("y-websocket");

// Polyfill for y-websocket on Node
global.WebSocket = WebSocket;

const SERVER_URL = "ws://127.0.0.1:3001";
const ROOM = "test-room-" + Date.now();

async function runTest() {
    console.log("Starting integration test...");

    const doc1 = new Y.Doc();
    const doc2 = new Y.Doc();

    const provider1 = new WebsocketProvider(SERVER_URL, ROOM, doc1);
    const provider2 = new WebsocketProvider(SERVER_URL, ROOM, doc2);

    // Wait for connection
    await new Promise((resolve, reject) => {
        let connected = 0;
        const check = () => {
            connected++;
            if (connected === 2) resolve();
        };
        provider1.on("status", (e) => e.status === "connected" && check());
        provider2.on("status", (e) => e.status === "connected" && check());

        provider1.on("connection-error", (e) =>
            reject("Provider 1 error: " + e)
        );
        provider2.on("connection-error", (e) =>
            reject("Provider 2 error: " + e)
        );
    });

    console.log("Both clients connected.");

    // Make a change on doc1
    doc1.getText("monaco").insert(0, "Hello World");

    // Verify on doc2
    await new Promise((resolve) => setTimeout(resolve, 1000)); // wait for sync

    const text2 = doc2.getText("monaco").toString();

    if (text2 === "Hello World") {
        console.log("SUCCESS: content synced to client 2.");
    } else {
        console.error("FAILURE: Content did not sync. Got:", text2);
        process.exit(1);
    }

    // Awareness test
    provider1.awareness.setLocalStateField("user", { name: "Alice" });

    await new Promise((resolve) => setTimeout(resolve, 500));

    const states = provider2.awareness.getStates();
    const alice = Array.from(states.values()).find(
        (s) => s.user && s.user.name === "Alice"
    );

    if (alice) {
        console.log("SUCCESS: Awareness synced.");
    } else {
        console.error("FAILURE: Awareness did not sync.");
        process.exit(1);
    }

    provider1.destroy();
    provider2.destroy();
    process.exit(0);
}

runTest().catch(console.error);
