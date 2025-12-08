export type Language = "javascript" | "typescript" | "python";

export interface User {
    id: string;
    name: string;
    color?: string;
    lastActivity?: number;
}

export interface ExecutionLog {
    id: string;
    type: "stdout" | "stderr" | "system";
    message: string;
    timestamp: number;
}

export interface ChatMessage {
    id: string;
    userId: string;
    userName: string;
    text: string;
    timestamp: number;
}
