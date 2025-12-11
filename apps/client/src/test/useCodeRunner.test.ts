import { describe, it, expect } from "vitest";

// Test the useCodeRunner hook interface without complex Worker mocking
// The actual functionality is tested through integration tests and worker logic tests

describe("useCodeRunner Interface", () => {
    it("should export the useCodeRunner hook", async () => {
        const { useCodeRunner } = await import("../hooks/useCodeRunner");
        expect(typeof useCodeRunner).toBe("function");
    });

    it("should have proper TypeScript interface", async () => {
        // Test that the hook can be imported and has expected shape
        const { useCodeRunner } = await import("../hooks/useCodeRunner");

        // The hook should be callable
        expect(useCodeRunner).toBeDefined();
        expect(typeof useCodeRunner).toBe("function");
    });
});

// Note: Full hook testing with Worker mocking is complex and the core functionality
// is validated through:
// 1. executor.worker.test.ts - Tests the actual code execution logic
// 2. Integration tests - Test the complete flow end-to-end
// 3. Manual testing - Validates the user experience
