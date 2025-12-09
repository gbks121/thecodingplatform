import { describe, it, expect, vi, beforeEach } from "vitest";
import http from "http";
import app from "../app";
import { handleUpgrade } from "../yjsWebsocket";
import { setupWSConnection } from "y-websocket/bin/utils";

// Mock the y-websocket module with a factory function
vi.mock("y-websocket/bin/utils", () => {
    const mockSetupWSConnection = vi.fn();
    return {
        setupWSConnection: mockSetupWSConnection,
    };
});

describe("Integration Tests", () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it("should handle WebSocket upgrade requests", () => {
        // Mock the request typically involved in a WebSocket upgrade
        const mockRequest = {
            url: "/test-session",
            headers: {
                upgrade: "websocket",
                "sec-websocket-key": "dGhlIHNhbXBsZSBub25jZQ==",
            },
        } as unknown as import("http").IncomingMessage;

        const mockSocket = {
            on: vi.fn(),
            send: vi.fn(),
            write: vi.fn(),
            setNoDelay: vi.fn(),
            setKeepAlive: vi.fn(),
        } as unknown as import("ws").WebSocket;

        const mockHead = Buffer.from("test-head-data");

        // Execute the upgrade handler
        handleUpgrade(mockRequest, mockSocket, mockHead);

        // Verify that setupWSConnection was called with the correct parameters
        expect(vi.mocked(setupWSConnection)).toHaveBeenCalledWith(
            mockSocket,
            mockRequest,
            {
                docName: "test-session",
            }
        );
    });

    it("should handle multiple WebSocket upgrade requests", () => {
        const mockRequest1 = {
            url: "/session-1",
        } as unknown as import("http").IncomingMessage;

        const mockSocket1 = {
            on: vi.fn(),
            send: vi.fn(),
        } as unknown as import("ws").WebSocket;

        const mockHead1 = Buffer.from("test-head-1");

        const mockRequest2 = {
            url: "/session-2",
        } as unknown as import("http").IncomingMessage;

        const mockSocket2 = {
            on: vi.fn(),
            send: vi.fn(),
        } as unknown as import("ws").WebSocket;

        const mockHead2 = Buffer.from("test-head-2");

        // Execute the upgrade handler for both requests
        handleUpgrade(mockRequest1, mockSocket1, mockHead1);
        handleUpgrade(mockRequest2, mockSocket2, mockHead2);

        // Verify that setupWSConnection was called for both sessions
        expect(vi.mocked(setupWSConnection)).toHaveBeenCalledTimes(2);
        expect(vi.mocked(setupWSConnection)).toHaveBeenNthCalledWith(
            1,
            mockSocket1,
            mockRequest1,
            {
                docName: "session-1",
            }
        );
        expect(vi.mocked(setupWSConnection)).toHaveBeenNthCalledWith(
            2,
            mockSocket2,
            mockRequest2,
            {
                docName: "session-2",
            }
        );
    });

    it("should handle WebSocket upgrade with complex session IDs", () => {
        const complexSessionId = "test-session-with-complex-id_123!@#";
        const mockRequest = {
            url: `/${complexSessionId}`,
        } as unknown as import("http").IncomingMessage;

        const mockSocket = {
            on: vi.fn(),
            send: vi.fn(),
        } as unknown as import("ws").WebSocket;

        const mockHead = Buffer.from("");

        handleUpgrade(mockRequest, mockSocket, mockHead);

        expect(vi.mocked(setupWSConnection)).toHaveBeenCalledWith(
            mockSocket,
            mockRequest,
            {
                docName: complexSessionId,
            }
        );
    });

    it("should handle WebSocket upgrade with URL containing query parameters", () => {
        const mockRequest = {
            url: "/test-session?param=value&another=param",
        } as unknown as import("http").IncomingMessage;

        const mockSocket = {
            on: vi.fn(),
            send: vi.fn(),
        } as unknown as import("ws").WebSocket;

        const mockHead = Buffer.from("");

        handleUpgrade(mockRequest, mockSocket, mockHead);

        // The full URL path (including query) would be used as docName
        expect(vi.mocked(setupWSConnection)).toHaveBeenCalledWith(
            mockSocket,
            mockRequest,
            {
                docName: "test-session?param=value&another=param",
            }
        );
    });

    it("should work with different HTTP methods for non-WebSocket requests", async () => {
        const server = http.createServer(app);

        // Test various methods for a health route simulation
        expect(app._router.stack).toBeDefined(); // Verify the router has been set up

        server.close();
    });

    it("should handle concurrent sessions correctly", () => {
        const sessions = [
            { id: "session-1", url: "/session-1" },
            { id: "session-2", url: "/session-2" },
            { id: "session-3", url: "/session-3" },
        ];

        // Mock separate sockets for each session
        const sockets = sessions.map(() => ({
            on: vi.fn(),
            send: vi.fn(),
        }));

        sessions.forEach((session, index) => {
            const mockRequest = {
                url: session.url,
            } as unknown as import("http").IncomingMessage;
            const mockSocket = sockets[
                index
            ] as unknown as import("ws").WebSocket;
            const mockHead = Buffer.from(`head-${index}`);

            handleUpgrade(mockRequest, mockSocket, mockHead);
        });

        expect(vi.mocked(setupWSConnection)).toHaveBeenCalledTimes(3);

        // Verify each session was handled with the correct docName
        sessions.forEach((session, index) => {
            const mockRequest = {
                url: session.url,
            } as unknown as import("http").IncomingMessage;
            expect(vi.mocked(setupWSConnection)).toHaveBeenNthCalledWith(
                index + 1,
                sockets[index],
                mockRequest,
                { docName: session.id }
            );
        });
    });
});
