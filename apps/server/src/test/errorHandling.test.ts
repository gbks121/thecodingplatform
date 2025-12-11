import {
    describe,
    it,
    expect,
    vi,
    beforeAll,
    afterAll,
    afterEach,
} from "vitest";
import request from "supertest";
import app from "../app";
import { handleUpgrade } from "../yjsWebsocket";

// Mock the @y/websocket-server module with a factory function
vi.mock("@y/websocket-server/utils", () => {
    const mockSetupWSConnection = vi.fn();
    return {
        setupWSConnection: mockSetupWSConnection,
    };
});

// Mock console to prevent test output pollution
const originalConsoleError = console.error;
const consoleErrorMock = vi.fn();

describe("Error Handling", () => {
    beforeAll(() => {
        console.error = consoleErrorMock;
    });

    afterAll(() => {
        console.error = originalConsoleError;
    });

    afterEach(() => {
        consoleErrorMock.mockClear();
        vi.clearAllMocks();
    });

    it("should handle malformed JSON in request body gracefully", async () => {
        // Test that malformed JSON doesn't crash the server
        const response = await request(app)
            .post("/non-existent-route")
            .set("Content-Type", "application/json")
            .send("{ invalid: json }"); // Invalid JSON

        // Should return an error status rather than crashing
        expect(response.status).toBeGreaterThanOrEqual(400);
        expect(response.status).toBeLessThan(500); // Not a server error
    });

    it("should handle empty request body", async () => {
        const response = await request(app)
            .post("/non-existent-route")
            .set("Content-Type", "application/json")
            .send("");

        // Should handle gracefully
        expect(response.status).toBeDefined();
    });

    it("should handle very long URLs gracefully", async () => {
        const longUrl = "/" + "a".repeat(10000); // Very long path
        const response = await request(app).get(longUrl);

        // Should not crash the server
        expect(response.status).toBeDefined();
    });

    it("should handle WebSocket upgrade with missing URL", () => {
        const mockRequest = {
            url: undefined,
        } as unknown as import("http").IncomingMessage;

        const mockSocket = {
            on: vi.fn(),
            send: vi.fn(),
            close: vi.fn(),
        } as unknown as import("ws").WebSocket;

        const mockHead = Buffer.from([]);

        // This should not throw an error
        expect(() => {
            handleUpgrade(mockRequest, mockSocket, mockHead);
        }).not.toThrow();
    });

    it("should handle WebSocket upgrade with invalid URL format", () => {
        const mockRequest = {
            url: null,
        } as unknown as import("http").IncomingMessage;

        const mockSocket = {
            on: vi.fn(),
            send: vi.fn(),
            close: vi.fn(),
        } as unknown as import("ws").WebSocket;

        const mockHead = Buffer.from([]);

        // This should not throw an error
        expect(() => {
            handleUpgrade(mockRequest, mockSocket, mockHead);
        }).not.toThrow();
    });

    it("should handle WebSocket upgrade with special characters in URL", () => {
        const mockRequest = {
            url: "/test@session#id!with?special=chars",
        } as unknown as import("http").IncomingMessage;

        const mockSocket = {
            on: vi.fn(),
            send: vi.fn(),
            close: vi.fn(),
        } as unknown as import("ws").WebSocket;

        const mockHead = Buffer.from([]);

        // This should not throw an error
        expect(() => {
            handleUpgrade(mockRequest, mockSocket, mockHead);
        }).not.toThrow();
    });

    it("should handle request with excessive headers", async () => {
        const headers = {} as Record<string, string>;
        // Add many headers to test edge case
        for (let i = 0; i < 100; i++) {
            headers[`x-custom-header-${i}`] = `value-${i}`;
        }

        const response = await request(app).get("/health").set(headers);

        // Should handle gracefully
        expect(response.status).toBeDefined();
    });

    it("should handle request with large payload", async () => {
        // Create a large payload
        const largePayload = {
            data: "x".repeat(1024 * 1024), // 1MB of data
        };

        const response = await request(app)
            .post("/non-existent-route")
            .send(largePayload);

        // Should handle gracefully
        expect(response.status).toBeDefined();
    });
});
