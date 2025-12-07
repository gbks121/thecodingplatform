import { create } from 'zustand';
import { Language, ExecutionLog, User } from '@thecodingplatform/shared';

interface AppState {
    user: User | null;
    sessionId: string | null;
    language: Language;
    logs: ExecutionLog[];
    activeUsers: User[];

    setUser: (user: User) => void;
    setSessionId: (id: string) => void;
    setLanguage: (lang: Language) => void;
    addLog: (log: ExecutionLog) => void;
    clearLogs: () => void;
    setActiveUsers: (users: User[]) => void;
}

export const useStore = create<AppState>((set) => ({
    user: null,
    sessionId: null,
    language: 'javascript', // default
    logs: [],
    activeUsers: [],

    setUser: (user) => set({ user }),
    setSessionId: (sessionId) => set({ sessionId }),
    setLanguage: (language) => set({ language }),
    addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
    clearLogs: () => set({ logs: [] }),
    setActiveUsers: (activeUsers) => set({ activeUsers }),
}));
