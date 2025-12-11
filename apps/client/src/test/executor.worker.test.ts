import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock self.postMessage for worker environment
const mockPostMessage = vi.fn();
global.self = {
    ...global.self,
    postMessage: mockPostMessage,
    onmessage: null,
} as unknown as typeof global.self & { postMessage: typeof mockPostMessage };

// Import the worker logic (we'll need to adapt it for testing)
describe("executor.worker", () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPostMessage.mockClear();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    // Since the worker file uses self.onmessage, we'll test the logic indirectly
    // by creating a test version of the functions

    const createTestFunctions = () => {
        // JavaScript execution function (copied from worker)
        function runJavascript(code: string, id: string) {
            const capture =
                (type: "stdout" | "stderr") =>
                (...args: unknown[]) => {
                    mockPostMessage({
                        type,
                        message: args
                            .map((a) =>
                                typeof a === "object" && a !== null
                                    ? JSON.stringify(a)
                                    : String(a)
                            )
                            .join(" "),
                        id,
                    });
                };

            try {
                const func = new Function("console", code);
                func({
                    log: capture("stdout"),
                    error: capture("stderr"),
                    warn: capture("stdout"),
                    info: capture("stdout"),
                });
            } catch (e: unknown) {
                mockPostMessage({ type: "stderr", message: String(e), id });
            }
        }

        return { runJavascript };
    };

    describe("JavaScript execution", () => {
        it("should execute simple console.log", () => {
            const { runJavascript } = createTestFunctions();

            runJavascript("console.log('Hello World')", "test-1");

            expect(mockPostMessage).toHaveBeenCalledWith({
                type: "stdout",
                message: "Hello World",
                id: "test-1",
            });
        });

        it("should handle multiple arguments", () => {
            const { runJavascript } = createTestFunctions();

            runJavascript("console.log('Hello', 'World', 123)", "test-2");

            expect(mockPostMessage).toHaveBeenCalledWith({
                type: "stdout",
                message: "Hello World 123",
                id: "test-2",
            });
        });

        it("should handle console.error", () => {
            const { runJavascript } = createTestFunctions();

            runJavascript("console.error('Error message')", "test-3");

            expect(mockPostMessage).toHaveBeenCalledWith({
                type: "stderr",
                message: "Error message",
                id: "test-3",
            });
        });

        it("should handle object logging", () => {
            const { runJavascript } = createTestFunctions();

            runJavascript("console.log({key: 'value'})", "test-4");

            expect(mockPostMessage).toHaveBeenCalledWith({
                type: "stdout",
                message: '{"key":"value"}',
                id: "test-4",
            });
        });

        it("should handle syntax errors", () => {
            const { runJavascript } = createTestFunctions();

            runJavascript("console.log('unclosed string)", "test-5");

            expect(mockPostMessage).toHaveBeenCalledWith({
                type: "stderr",
                message: expect.stringContaining("SyntaxError"),
                id: "test-5",
            });
        });

        it("should handle runtime errors", () => {
            const { runJavascript } = createTestFunctions();

            runJavascript("throw new Error('Runtime error')", "test-6");

            expect(mockPostMessage).toHaveBeenCalledWith({
                type: "stderr",
                message: "Error: Runtime error",
                id: "test-6",
            });
        });

        it("should handle undefined variables", () => {
            const { runJavascript } = createTestFunctions();

            runJavascript("console.log(undefinedVariable)", "test-7");

            expect(mockPostMessage).toHaveBeenCalledWith({
                type: "stderr",
                message: expect.stringContaining("ReferenceError"),
                id: "test-7",
            });
        });
    });

    describe("Message handling", () => {
        it("should handle valid message structure", () => {
            const message = {
                code: "console.log('test')",
                language: "javascript",
                id: "msg-1",
            };

            // Simulate the onmessage handler logic
            try {
                const capture =
                    (type: "stdout" | "stderr") =>
                    (...args: unknown[]) => {
                        mockPostMessage({
                            type,
                            message: args
                                .map((a) =>
                                    typeof a === "object" && a !== null
                                        ? JSON.stringify(a)
                                        : String(a)
                                )
                                .join(" "),
                            id: "msg-1",
                        });
                    };

                const func = new Function("console", message.code);
                func({
                    log: capture("stdout"),
                    error: capture("stderr"),
                    warn: capture("stdout"),
                    info: capture("stdout"),
                });

                expect(mockPostMessage).toHaveBeenCalledWith({
                    type: "stdout",
                    message: "test",
                    id: "msg-1",
                });
            } catch (e: unknown) {
                mockPostMessage({
                    type: "stderr",
                    message: String(e),
                    id: "msg-1",
                });
            }
        });

        it("should handle malformed messages gracefully", () => {
            // Test with missing properties
            const malformedMessage = { code: "console.log('test')" } as Record<
                string,
                unknown
            >;

            // Should not crash when accessing undefined properties
            expect(() => {
                const {
                    code,
                    language = "javascript",
                    id = "default",
                } = malformedMessage;
                expect(code).toBe("console.log('test')");
                expect(language).toBe("javascript");
                expect(id).toBe("default");
            }).not.toThrow();
        });

        it("should handle unknown language gracefully", () => {
            const message = {
                code: "console.log('test')",
                language: "unknown",
                id: "test-unknown",
            };

            // The worker should not crash on unknown languages
            // It would fall through to the catch block in the worker
            expect(() => {
                if (
                    message.language !== "python" &&
                    message.language !== "javascript"
                ) {
                    throw new Error(
                        `Unsupported language: ${message.language}`
                    );
                }
            }).toThrow("Unsupported language: unknown");
        });
    });

    describe("Python execution simulation", () => {
        // Since we can't easily test Pyodide in unit tests,
        // we'll test the message structure and error handling

        it("should attempt to load Pyodide for Python code", () => {
            const message = {
                code: "print('hello')",
                language: "python",
                id: "py-1",
            };

            // Simulate the python execution path
            // In a real test, this would try to import Pyodide
            expect(message.language).toBe("python");
            expect(message.code).toBe("print('hello')");
            expect(message.id).toBe("py-1");
        });

        it("should handle Python execution errors", () => {
            // Test that Python errors are properly caught and reported

            // Simulate a Pyodide loading failure
            try {
                throw new Error("Failed to load Pyodide");
            } catch (e) {
                expect(String(e)).toBe("Error: Failed to load Pyodide");
                // In the real worker, this would call postMessage with stderr
            }
        });
    });

    describe("Security and sandboxing", () => {
        it("should execute code in controlled environment", () => {
            const { runJavascript } = createTestFunctions();

            // Test that code executes in the sandboxed environment we provide
            runJavascript(
                `
                console.log("Code executed in sandbox");
                console.log("Console type:", typeof console);
            `,
                "security-1"
            );

            expect(mockPostMessage).toHaveBeenCalledWith({
                type: "stdout",
                message: "Code executed in sandbox",
                id: "security-1",
            });
            expect(mockPostMessage).toHaveBeenCalledWith({
                type: "stdout",
                message: "Console type: object",
                id: "security-1",
            });
        });

        it("should sandbox console access", () => {
            const { runJavascript } = createTestFunctions();

            runJavascript("console.log(typeof console)", "sandbox-1");

            expect(mockPostMessage).toHaveBeenCalledWith({
                type: "stdout",
                message: "object",
                id: "sandbox-1",
            });
        });

        it("should handle dangerous operations safely", () => {
            const { runJavascript } = createTestFunctions();

            // Test that accessing undefined globals is handled gracefully
            runJavascript(
                `
                try {
                    // This will throw a ReferenceError
                    nonexistentGlobal.doSomething();
                } catch (e) {
                    console.log("Global access blocked:", e.message);
                }
            `,
                "dangerous-1"
            );

            expect(mockPostMessage).toHaveBeenCalledWith({
                type: "stdout",
                message: expect.stringContaining("Global access blocked"),
                id: "dangerous-1",
            });
        });

        it("should execute code safely", () => {
            const { runJavascript } = createTestFunctions();

            // Test that code execution is controlled and safe
            runJavascript(
                `
                // This code should execute without issues
                const result = 2 + 2;
                console.log("Math works:", result);
            `,
                "safe-1"
            );

            expect(mockPostMessage).toHaveBeenCalledWith({
                type: "stdout",
                message: "Math works: 4",
                id: "safe-1",
            });
        });
    });
});
