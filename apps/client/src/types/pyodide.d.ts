declare module "https://cdn.jsdelivr.net/pyodide/v0.25.0/full/pyodide.mjs" {
    export function loadPyodide(): Promise<{
        setStdout: (options: { batched: (msg: string) => void }) => void;
        setStderr: (options: { batched: (msg: string) => void }) => void;
        runPythonAsync: (code: string) => Promise<void>;
    }>;
}
