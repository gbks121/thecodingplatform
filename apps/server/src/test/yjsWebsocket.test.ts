import { describe, it, expect, vi, beforeEach } from "vitest";
import { handleUpgrade } from "../yjsWebsocket";
import { IncomingMessage } from "http";
import { WebSocket } from "ws";
import { setupWSConnection } from "@y/websocket-server/utils";

// Mock the @y/websocket-server module with a factory function
vi.mock("@y/websocket-server/utils", () => {
    const mockSetupWSConnection = vi.fn();
    return {
        setupWSConnection: mockSetupWSConnection,
    };
});

describe("WebSocket Functionality", () => {
    let mockRequest: Partial<IncomingMessage>;
    let mockSocket: Partial<WebSocket>;
    let mockHead: Buffer;

    beforeEach(() => {
        // Reset mocks
        vi.clearAllMocks();

        mockRequest = {
            url: "/test-session-id",
        };

        mockSocket = {
            on: vi.fn(),
            send: vi.fn(),
        };

        mockHead = Buffer.from("test-head-data");
    });

    it("should call setupWSConnection with correct parameters", () => {
        handleUpgrade(
            mockRequest as IncomingMessage,
            mockSocket as WebSocket,
            mockHead
        );

        expect(vi.mocked(setupWSConnection)).toHaveBeenCalledWith(
            mockSocket,
            mockRequest,
            {
                docName: "test-session-id",
            }
        );
    });

    it("should extract session ID from URL path correctly", () => {
        mockRequest.url = "/abc123";

        handleUpgrade(
            mockRequest as IncomingMessage,
            mockSocket as WebSocket,
            mockHead
        );

        expect(vi.mocked(setupWSConnection)).toHaveBeenCalledWith(
            mockSocket,
            mockRequest,
            {
                docName: "abc123",
            }
        );
    });

    it("should handle root path correctly", () => {
        mockRequest.url = "/";

        handleUpgrade(
            mockRequest as IncomingMessage,
            mockSocket as WebSocket,
            mockHead
        );

        expect(vi.mocked(setupWSConnection)).toHaveBeenCalledWith(
            mockSocket,
            mockRequest,
            {
                docName: "default", // The actual behavior uses "default" when URL path is "/"
            }
        );
    });

    it("should use default docName when URL is null", () => {
        mockRequest.url = null as unknown as string;

        handleUpgrade(
            mockRequest as IncomingMessage,
            mockSocket as WebSocket,
            mockHead
        );

        expect(vi.mocked(setupWSConnection)).toHaveBeenCalledWith(
            mockSocket,
            mockRequest,
            {
                docName: "default",
            }
        );
    });

    it("should use default docName when URL is undefined", () => {
        mockRequest.url = undefined;

        handleUpgrade(
            mockRequest as IncomingMessage,
            mockSocket as WebSocket,
            mockHead
        );

        expect(vi.mocked(setupWSConnection)).toHaveBeenCalledWith(
            mockSocket,
            mockRequest,
            {
                docName: "default",
            }
        );
    });

    it("should log correct messages during upgrade", () => {
        const consoleSpy = vi
            .spyOn(console, "log")
            .mockImplementation(() => {});

        mockRequest.url = "/test-session";

        handleUpgrade(
            mockRequest as IncomingMessage,
            mockSocket as WebSocket,
            mockHead
        );

        expect(consoleSpy).toHaveBeenCalledWith(
            "Use upgrade for:",
            "/test-session"
        );
        expect(consoleSpy).toHaveBeenCalledWith(
            "Setup WS for doc:",
            "test-session"
        );

        consoleSpy.mockRestore();
    });
});
