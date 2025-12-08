import { create } from 'zustand';
import { Language, ExecutionLog, User } from '@thecodingplatform/shared';

interface AppState {
    user: User | null;
    sessionId: string | null;
    language: Language;
    logs: ExecutionLog[];
    activeUsers: User[];
    themeMode: 'light' | 'dark' | 'system';

    setUser: (user: User) => void;
    setSessionId: (id: string) => void;
    setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
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
    themeMode: 'system',

    setUser: (user) => set({ user }),
    setSessionId: (sessionId) => set({ sessionId }),
    setThemeMode: (themeMode) => set({ themeMode }),
    setLanguage: (language) => set({ language }),
    addLog: (log) => set((state) => ({ logs: [...state.logs, log] })),
    clearLogs: () => set({ logs: [] }),
    setActiveUsers: (activeUsers) => set({ activeUsers }),
}));
