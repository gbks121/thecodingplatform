// Worker context

self.onmessage = async (e: MessageEvent) => {
    const { code, language, id } = e.data;

    try {
        if (language === "python") {
            await runPython(code, id);
        } else if (language === "javascript") {
            runJavascript(code, id);
        }
    } catch (err: unknown) {
        self.postMessage({ type: "stderr", message: String(err), id });
    }
};

// --- JavaScript Execution ---
function runJavascript(code: string, id: string) {
    // Simple console.log capture
    const _originalLog = console.log;
    const _originalError = console.error;

    const _logs: string[] = [];
    const capture =
        (type: "stdout" | "stderr") =>
        (...args: unknown[]) => {
            self.postMessage({
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
        // Sandbox-ish: Function constructor
        // We bind console to our capture
        const func = new Function("console", code);
        func({
            log: capture("stdout"),
            error: capture("stderr"),
            warn: capture("stdout"),
            info: capture("stdout"),
        });
    } catch (e: unknown) {
        self.postMessage({ type: "stderr", message: String(e), id });
    }
}

// --- Python Execution ---
let pyodide: {
    setStdout: (options: { batched: (msg: string) => void }) => void;
    setStderr: (options: { batched: (msg: string) => void }) => void;
    runPythonAsync: (code: string) => Promise<void>;
} | null = null;

async function runPython(code: string, id: string) {
    if (!pyodide) {
        self.postMessage({ type: "system", message: "Loading Pyodide...", id });
        try {
            // Dynamic import of Pyodide from CDN

            const pyodideModule: { loadPyodide: () => Promise<unknown> } =
                await import("https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.mjs");

            pyodide = (await pyodideModule.loadPyodide()) as typeof pyodide;
            self.postMessage({
                type: "system",
                message: "Pyodide loaded.",
                id,
            });
        } catch (e) {
            throw new Error("Failed to load Pyodide: " + e);
        }
    }

    // Redirect stdout/stderr
    if (!pyodide) return;

    pyodide.setStdout({
        batched: (msg: string) =>
            self.postMessage({ type: "stdout", message: msg, id }),
    });
    pyodide.setStderr({
        batched: (msg: string) =>
            self.postMessage({ type: "stderr", message: msg, id }),
    });

    await pyodide.runPythonAsync(code);
}
