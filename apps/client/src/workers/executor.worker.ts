/* eslint-disable no-restricted-globals */
// Worker context

self.onmessage = async (e: MessageEvent) => {
    const { code, language, id } = e.data;

    try {
        if (language === 'python') {
            await runPython(code, id);
        } else if (language === 'javascript') {
            runJavascript(code, id);
        }
    } catch (err: any) {
        self.postMessage({ type: 'stderr', message: err.toString(), id });
    }
};

// --- JavaScript Execution ---
function runJavascript(code: string, id: string) {
    // Simple console.log capture
    const originalLog = console.log;
    const originalError = console.error;

    const logs: string[] = [];
    const capture = (type: 'stdout' | 'stderr') => (...args: any[]) => {
        self.postMessage({
            type,
            message: args.map(a => (typeof a === 'object' ? JSON.stringify(a) : String(a))).join(' '),
            id
        });
    };

    try {
        // Sandbox-ish: Function constructor
        // We bind console to our capture
        const func = new Function('console', code);
        func({
            log: capture('stdout'),
            error: capture('stderr'),
            warn: capture('stdout'),
            info: capture('stdout'),
        });
    } catch (e: any) {
        self.postMessage({ type: 'stderr', message: e.toString(), id });
    }
}

// --- Python Execution ---
let pyodide: any = null;

async function runPython(code: string, id: string) {
    if (!pyodide) {
        self.postMessage({ type: 'system', message: 'Loading Pyodide...', id });
        try {
            // @ts-ignore
            const { loadPyodide } = await import('https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.mjs');
            pyodide = await loadPyodide();
            self.postMessage({ type: 'system', message: 'Pyodide loaded.', id });
        } catch (e) {
            throw new Error('Failed to load Pyodide: ' + e);
        }
    }

    // Redirect stdout/stderr
    pyodide.setStdout({ batched: (msg: string) => self.postMessage({ type: 'stdout', message: msg, id }) });
    pyodide.setStderr({ batched: (msg: string) => self.postMessage({ type: 'stderr', message: msg, id }) });

    await pyodide.runPythonAsync(code);
}
