import { useCallback, useEffect, useRef, useState } from "react";
import { useStore } from "../store";

export const useCodeRunner = () => {
    const workerRef = useRef<Worker | null>(null);
    const { addLog } = useStore();
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        // Initialize Worker
        const worker = new Worker(
            new URL("../workers/executor.worker.ts", import.meta.url),
            { type: "module" }
        );
        workerRef.current = worker;

        worker.onmessage = (e: MessageEvent) => {
            const { type, message } = e.data;
            if (type && message) {
                addLog({
                    id: Date.now().toString(),
                    type,
                    message,
                    timestamp: Date.now(),
                });
            }
        };

        worker.onerror = (err: ErrorEvent) => {
            addLog({
                id: Date.now().toString(),
                type: "stderr",
                message: "Worker Error: " + err.message,
                timestamp: Date.now(),
            });
            setIsRunning(false);
        };

        return () => {
            worker.terminate();
        };
    }, [addLog]);

    const runCode = useCallback(
        (code: string, language: "javascript" | "python") => {
            if (!workerRef.current) return;

            setIsRunning(true);
            addLog({
                id: Date.now().toString(),
                type: "system",
                message: `Running ${language}...`,
                timestamp: Date.now(),
            });

            workerRef.current.postMessage({
                code,
                language,
                id: Date.now().toString(),
            });

            // Reset running state shortly after dispatch or wait for a "done" signal?
            // For now, simple timeout or specific "done" message from worker would be better.
            // I'll just clear the running flag after 500ms for UI feedback.
            setTimeout(() => setIsRunning(false), 500);
        },
        [addLog]
    );

    return { runCode, isRunning };
};
