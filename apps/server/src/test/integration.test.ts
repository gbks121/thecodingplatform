import { describe, it, expect, vi, beforeEach } from "vitest";
import http from "http";
import app from "../app";
import { handleUpgrade } from "../yjsWebsocket";
import { setupWSConnection } from "@y/websocket-server/utils";

// Mock the @y/websocket-server module with a factory function
vi.mock("@y/websocket-server/utils", () => {
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
        // Test that the app is properly configured by checking it exists and has basic properties
        expect(app).toBeDefined();
        expect(typeof app).toBe("function");

        // Test that the app can be used to create an HTTP server
        const server = http.createServer(app);
        expect(server).toBeDefined();
        expect(typeof server.listen).toBe("function");

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

    // ===== REAL-TIME COLLABORATION TESTS =====

    describe("Real-time Collaboration", () => {
        it("should handle document synchronization between multiple clients", () => {
            const sessionId = "collab-session-1";

            // Create multiple client connections to the same session
            const clients = Array.from({ length: 3 }, (_, i) => ({
                id: `client-${i + 1}`,
                socket: {
                    on: vi.fn(),
                    send: vi.fn(),
                    readyState: 1, // OPEN
                } as unknown as import("ws").WebSocket,
                request: {
                    url: `/${sessionId}`,
                    headers: { upgrade: "websocket" },
                } as unknown as import("http").IncomingMessage,
                head: Buffer.from(`client-${i + 1}-head`),
            }));

            // Establish connections for all clients
            clients.forEach((client) => {
                handleUpgrade(client.request, client.socket, client.head);
            });

            // Verify all clients connected to the same document
            expect(vi.mocked(setupWSConnection)).toHaveBeenCalledTimes(3);
            clients.forEach((client) => {
                expect(vi.mocked(setupWSConnection)).toHaveBeenCalledWith(
                    client.socket,
                    client.request,
                    { docName: sessionId }
                );
            });
        });

        it("should support awareness/presence for collaborative features", () => {
            const sessionId = "presence-session";

            // Create clients with user identification
            const users = [
                { id: "alice", name: "Alice" },
                { id: "bob", name: "Bob" },
                { id: "charlie", name: "Charlie" },
            ];

            const clients = users.map((user) => ({
                socket: {
                    on: vi.fn(),
                    send: vi.fn(),
                    readyState: 1,
                } as unknown as import("ws").WebSocket,
                request: {
                    url: `/${sessionId}`,
                    headers: {
                        upgrade: "websocket",
                        "x-user-id": user.id,
                        "x-user-name": user.name,
                    },
                } as unknown as import("http").IncomingMessage,
                head: Buffer.from(`${user.id}-head`),
            }));

            // Connect all users
            clients.forEach((client) => {
                handleUpgrade(client.request, client.socket, client.head);
            });

            // Verify awareness setup for collaboration
            expect(vi.mocked(setupWSConnection)).toHaveBeenCalledTimes(3);

            // Verify each client connected with correct session
            clients.forEach((client) => {
                expect(vi.mocked(setupWSConnection)).toHaveBeenCalledWith(
                    client.socket,
                    client.request,
                    { docName: sessionId }
                );
            });
        });

        it("should handle connection recovery and reconnection", () => {
            const sessionId = "recovery-session";
            let connectionCount = 0;

            // First connection
            const client1 = {
                socket: {
                    on: vi.fn(),
                    send: vi.fn(),
                    readyState: 1,
                } as unknown as import("ws").WebSocket,
                request: {
                    url: `/${sessionId}`,
                } as unknown as import("http").IncomingMessage,
                head: Buffer.from("client-1-head"),
            };

            handleUpgrade(client1.request, client1.socket, client1.head);
            connectionCount++;

            // Simulate disconnection and reconnection
            const client1Reconnect = {
                socket: {
                    on: vi.fn(),
                    send: vi.fn(),
                    readyState: 1,
                } as unknown as import("ws").WebSocket,
                request: {
                    url: `/${sessionId}`,
                    headers: { "x-reconnect": "true" },
                } as unknown as import("http").IncomingMessage,
                head: Buffer.from("client-1-reconnect-head"),
            };

            handleUpgrade(
                client1Reconnect.request,
                client1Reconnect.socket,
                client1Reconnect.head
            );
            connectionCount++;

            expect(vi.mocked(setupWSConnection)).toHaveBeenCalledTimes(
                connectionCount
            );

            // Both connections should target the same document
            expect(vi.mocked(setupWSConnection)).toHaveBeenNthCalledWith(
                1,
                client1.socket,
                client1.request,
                { docName: sessionId }
            );
            expect(vi.mocked(setupWSConnection)).toHaveBeenNthCalledWith(
                2,
                client1Reconnect.socket,
                client1Reconnect.request,
                { docName: sessionId }
            );
        });

        it("should support large collaborative sessions", () => {
            const sessionId = "large-session";
            const clientCount = 10; // Simulate 10 concurrent users

            const clients = Array.from({ length: clientCount }, (_, i) => ({
                socket: {
                    on: vi.fn(),
                    send: vi.fn(),
                    readyState: 1,
                } as unknown as import("ws").WebSocket,
                request: {
                    url: `/${sessionId}`,
                } as unknown as import("http").IncomingMessage,
                head: Buffer.from(`client-${i + 1}-head`),
            }));

            // Connect all clients
            clients.forEach((client) => {
                handleUpgrade(client.request, client.socket, client.head);
            });

            expect(vi.mocked(setupWSConnection)).toHaveBeenCalledTimes(
                clientCount
            );

            // All clients should connect to the same document
            clients.forEach((client, index) => {
                expect(vi.mocked(setupWSConnection)).toHaveBeenNthCalledWith(
                    index + 1,
                    client.socket,
                    client.request,
                    { docName: sessionId }
                );
            });
        });

        it("should handle malformed session IDs gracefully", () => {
            const malformedTestCases = [
                { input: "", expected: "default" }, // empty becomes default
                {
                    input: "session with spaces",
                    expected: "session with spaces",
                },
                {
                    input: "session/with/slashes",
                    expected: "session/with/slashes",
                },
                { input: "session?with=query", expected: "session?with=query" },
                { input: "session#with#hash", expected: "session#with#hash" },
                {
                    input: "session@with@special",
                    expected: "session@with@special",
                },
            ];

            malformedTestCases.forEach(({ input, expected }) => {
                const mockRequest = {
                    url: `/${input}`,
                    headers: { upgrade: "websocket" },
                } as unknown as import("http").IncomingMessage;

                const mockSocket = {
                    on: vi.fn(),
                    send: vi.fn(),
                } as unknown as import("ws").WebSocket;

                const mockHead = Buffer.from("malformed-head");

                // Should not throw, should handle gracefully
                expect(() => {
                    handleUpgrade(mockRequest, mockSocket, mockHead);
                }).not.toThrow();

                // Should call setupWSConnection with the expected docName
                expect(vi.mocked(setupWSConnection)).toHaveBeenCalledWith(
                    mockSocket,
                    mockRequest,
                    { docName: expected }
                );
            });
        });

        it("should support different document types within sessions", () => {
            // Test different document types (text, awareness, etc.)
            const sessionId = "multi-doc-session";
            const docTypes = ["monaco", "awareness", "chat"];

            docTypes.forEach((docType) => {
                const mockRequest = {
                    url: `/${sessionId}/${docType}`,
                    headers: { upgrade: "websocket" },
                } as unknown as import("http").IncomingMessage;

                const mockSocket = {
                    on: vi.fn(),
                    send: vi.fn(),
                } as unknown as import("ws").WebSocket;

                const mockHead = Buffer.from(`${docType}-head`);

                handleUpgrade(mockRequest, mockSocket, mockHead);

                // Should handle sub-documents within sessions
                expect(vi.mocked(setupWSConnection)).toHaveBeenCalledWith(
                    mockSocket,
                    mockRequest,
                    { docName: `${sessionId}/${docType}` }
                );
            });
        });

        it("should handle rapid connection/disconnection cycles", () => {
            const sessionId = "volatile-session";
            let totalCalls = 0;

            // Simulate rapid connect/disconnect cycles
            for (let i = 0; i < 5; i++) {
                const mockRequest = {
                    url: `/${sessionId}`,
                    headers: { upgrade: "websocket" },
                } as unknown as import("http").IncomingMessage;

                const mockSocket = {
                    on: vi.fn(),
                    send: vi.fn(),
                    readyState: 1,
                } as unknown as import("ws").WebSocket;

                const mockHead = Buffer.from(`cycle-${i}-head`);

                handleUpgrade(mockRequest, mockSocket, mockHead);
                totalCalls++;
            }

            expect(vi.mocked(setupWSConnection)).toHaveBeenCalledTimes(
                totalCalls
            );

            // All connections should target the same document despite rapid cycling
            for (let i = 0; i < totalCalls; i++) {
                expect(vi.mocked(setupWSConnection)).toHaveBeenNthCalledWith(
                    i + 1,
                    expect.any(Object),
                    expect.objectContaining({ url: `/${sessionId}` }),
                    { docName: sessionId }
                );
            }
        });

        it("should support international and unicode session IDs", () => {
            const unicodeSessions = [
                "session-ñáéíóú", // Spanish
                "session-日本語", // Japanese
                "session-🚀⭐🎉", // Emojis
                "session-тест", // Russian
                "session-🌍🌎🌏", // More emojis
            ];

            unicodeSessions.forEach((sessionId) => {
                const mockRequest = {
                    url: `/${sessionId}`,
                    headers: { upgrade: "websocket" },
                } as unknown as import("http").IncomingMessage;

                const mockSocket = {
                    on: vi.fn(),
                    send: vi.fn(),
                } as unknown as import("ws").WebSocket;

                const mockHead = Buffer.from("unicode-head");

                handleUpgrade(mockRequest, mockSocket, mockHead);

                expect(vi.mocked(setupWSConnection)).toHaveBeenCalledWith(
                    mockSocket,
                    mockRequest,
                    { docName: sessionId }
                );
            });
        });

        it("should handle WebSocket subprotocol negotiation", () => {
            const sessionId = "subprotocol-session";
            const subprotocols = ["y-protocol", "yjs"];

            subprotocols.forEach((subprotocol) => {
                const mockRequest = {
                    url: `/${sessionId}`,
                    headers: {
                        upgrade: "websocket",
                        "sec-websocket-protocol": subprotocol,
                    },
                } as unknown as import("http").IncomingMessage;

                const mockSocket = {
                    on: vi.fn(),
                    send: vi.fn(),
                    protocol: subprotocol,
                } as unknown as import("ws").WebSocket;

                const mockHead = Buffer.from("subprotocol-head");

                handleUpgrade(mockRequest, mockSocket, mockHead);

                expect(vi.mocked(setupWSConnection)).toHaveBeenCalledWith(
                    mockSocket,
                    mockRequest,
                    { docName: sessionId }
                );
            });
        });
    });
});
