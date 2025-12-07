export type Language = 'javascript' | 'typescript' | 'python';

export interface User {
    id: string;
    name: string;
    color?: string;
    lastActivity?: number;
}

export interface ExecutionLog {
    type: 'stdout' | 'stderr' | 'system';
    content: string;
    timestamp: number;
}

export interface ChatMessage {
    id: string;
    userId: string;
    userName: string;
    text: string;
    timestamp: number;
}
