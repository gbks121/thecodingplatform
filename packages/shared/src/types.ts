
export type ExecutionMessageType = 'stdout' | 'stderr' | 'system';

export interface ExecutionLog {
    id: string;
    type: ExecutionMessageType;
    message: string;
    timestamp: number;
}

// Yjs Awareness State
export interface AwarenessState {
    user: User;
}
