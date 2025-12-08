import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { OutputPanel } from "../components/OutputPanel";
import { useStore } from "../store";

vi.mock("../store", () => ({
    useStore: vi.fn(),
}));

// Type assertion for mocked useStore
const mockedUseStore = useStore as unknown as ReturnType<typeof vi.fn>;

describe("OutputPanel", () => {
    it("renders logs correctly", () => {
        mockedUseStore.mockReturnValue({
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
        mockedUseStore.mockReturnValue({
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

        render(<OutputPanel />);
        expect(screen.getByText("System Ready")).toBeInTheDocument();
        // Check for specific styling class or color logic if implemented
        // Here we just verify presence
    });

    it("renders clear button when there are logs", () => {
        const mockClearLogs = vi.fn();
        mockedUseStore.mockReturnValue({
            logs: [
                {
                    id: "1",
                    type: "stdout",
                    message: "Hello World",
                    timestamp: 1000,
                },
            ],
            clearLogs: mockClearLogs,
        });

        render(<OutputPanel />);
        const clearButton = screen.getByRole("button", { name: /clear/i });
        expect(clearButton).toBeInTheDocument();
        expect(clearButton).not.toBeDisabled();
    });

    it("disables clear button when there are no logs", () => {
        const mockClearLogs = vi.fn();
        mockedUseStore.mockReturnValue({
            logs: [],
            clearLogs: mockClearLogs,
        });

        render(<OutputPanel />);
        const clearButton = screen.getByRole("button", { name: /clear/i });
        expect(clearButton).toBeInTheDocument();
        expect(clearButton).toBeDisabled();
    });

    it("calls clearLogs when clear button is clicked", () => {
        const mockClearLogs = vi.fn();
        mockedUseStore.mockReturnValue({
            logs: [
                {
                    id: "1",
                    type: "stdout",
                    message: "Hello World",
                    timestamp: 1000,
                },
            ],
            clearLogs: mockClearLogs,
        });

        render(<OutputPanel />);
        const clearButton = screen.getByRole("button", { name: /clear/i });
        fireEvent.click(clearButton);
        expect(mockClearLogs).toHaveBeenCalledTimes(1);
    });
});
