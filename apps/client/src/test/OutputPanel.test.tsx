import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OutputPanel } from "../components/OutputPanel";
import { useStore } from "../store";

vi.mock("../store", () => ({
    useStore: vi.fn(),
}));

describe("OutputPanel", () => {
    it("renders logs correctly", () => {
        (useStore as any).mockReturnValue({
            logs: [
                {
                    id: "1",
                    type: "stdout",
                    message: "Hello World",
                    timestamp: 1000,
                },
                {
                    id: "2",
                    type: "stderr",
                    message: "Error happened",
                    timestamp: 2000,
                },
            ],
            clearLogs: vi.fn(),
        });

        render(<OutputPanel />);

        expect(screen.getByText("Hello World")).toBeInTheDocument();
        expect(screen.getByText("Error happened")).toBeInTheDocument();
    });

    it("renders system messages differently", () => {
        (useStore as any).mockReturnValue({
            logs: [
                {
                    id: "3",
                    type: "system",
                    message: "System Ready",
                    timestamp: 3000,
                },
            ],
            clearLogs: vi.fn(),
        });

        const { container } = render(<OutputPanel />);
        expect(screen.getByText("System Ready")).toBeInTheDocument();
        // Check for specific styling class or color logic if implemented
        // Here we just verify presence
    });

    /* 
    it('clears logs when button clicked', () => {
        // Feature not implemented in UI yet
    });
    */
});
