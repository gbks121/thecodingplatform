import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ChatPanel } from "../components/ChatPanel";
import * as Y from "yjs";
import { useStore } from "../store";

// Mock scrollIntoView
window.HTMLElement.prototype.scrollIntoView = vi.fn();

describe("ChatPanel", () => {
    let yDoc: Y.Doc;

    beforeEach(() => {
        yDoc = new Y.Doc();
        useStore.setState({
            user: { id: "test-user", name: "Test User" },
        });
    });

    afterEach(() => {
        vi.clearAllMocks();
    });

    it("renders chat interface", () => {
        render(<ChatPanel yDoc={yDoc} />);
        expect(screen.getByText("Chat")).toBeInTheDocument();
        expect(
            screen.getByPlaceholderText("Type a message...")
        ).toBeInTheDocument();
    });

    it("sends a message", async () => {
        render(<ChatPanel yDoc={yDoc} />);

        const input = screen.getByPlaceholderText("Type a message...");
        fireEvent.change(input, { target: { value: "Hello World" } });

        const sendButton = screen.getByRole("button");
        fireEvent.click(sendButton);

        const chatArray = yDoc.getArray("chat");
        expect(chatArray.length).toBe(1);

        const msg = chatArray.get(0) as { text: string; userName: string };
        expect(msg.text).toBe("Hello World");
        expect(msg.userName).toBe("Test User");
    });

    it("displays incoming messages", async () => {
        render(<ChatPanel yDoc={yDoc} />);

        // Simulate incoming message
        const chatArray = yDoc.getArray("chat");
        chatArray.push([
            {
                id: "msg-1",
                userId: "other-user",
                userName: "Other Guy",
                text: "Hi there",
                timestamp: Date.now(),
            },
        ]);

        // Wait for update
        await waitFor(() => {
            expect(screen.getByText("Hi there")).toBeInTheDocument();
            expect(screen.getByText("Other Guy")).toBeInTheDocument();
        });
    });
});
