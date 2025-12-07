import { IncomingMessage } from 'http';

// @ts-ignore - y-websocket types for server are strict or missing often
const { setupWSConnection } = require('y-websocket/bin/utils');

export function handleUpgrade(req: IncomingMessage, socket: any, _head: any) {
    // You might parse session ID from req.url here if needed, 
    // but setupWSConnection usually handles the docName from path.
    // default y-websocket behavior: path is the doc name.

    console.log('Use upgrade for:', req.url);
    // Extract session ID (room name) from the URL path
    // req.url would be like "/sessionId"
    const docName = req.url?.slice(1) || 'default';

    console.log('Setup WS for doc:', docName);

    setupWSConnection(socket, req, {
        docName: docName
    });
}
